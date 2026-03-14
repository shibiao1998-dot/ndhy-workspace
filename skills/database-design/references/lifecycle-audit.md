# 生命周期、审计与归档策略

## 目录

- [状态机与生命周期建模](#状态机与生命周期建模)
- [审计字段设计](#审计字段设计)
- [软删除策略](#软删除策略)
- [归档策略](#归档策略)
- [历史版本模型](#历史版本模型)

---

## 状态机与生命周期建模

### 为什么需要状态机

关键实体（订单、任务、审批等）的 `status` 字段不应是自由文本。必须定义：
1. **有哪些合法状态**
2. **哪些状态转换是允许的**
3. **转换的触发条件是什么**

### 状态机设计步骤

**Step 1：列出所有状态**

```
draft → active → completed
                → cancelled
active → suspended → active（恢复）
                   → cancelled
```

**Step 2：定义转换矩阵**

| 当前状态 | 可转换到 | 触发条件 | 副作用 |
|---------|---------|---------|--------|
| draft | active | 提交 + 审核通过 | 发送通知 |
| active | completed | 所有子任务完成 | 记录完成时间 |
| active | suspended | 管理员操作 | 暂停计费 |
| active | cancelled | 用户主动取消 | 退款流程 |
| suspended | active | 管理员恢复 | 恢复计费 |
| suspended | cancelled | 超期未恢复 | 退款流程 |

**Step 3：数据库层约束**

```sql
-- CHECK 约束限制合法值
CONSTRAINT ck_orders_status CHECK (status IN ('draft','active','completed','suspended','cancelled'))

-- 如数据库支持，用触发器校验转换合法性
-- 否则在应用层校验，数据库 CHECK 作兜底
```

**Step 4：状态变更追踪**

关键实体建议单独的状态变更日志表：

```sql
CREATE TABLE order_status_log (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    order_id        BIGINT          NOT NULL,
    from_status     VARCHAR(32)     NULL,       -- 首次创建时为 NULL
    to_status       VARCHAR(32)     NOT NULL,
    changed_by      VARCHAR(64)     NOT NULL,
    changed_at      TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    reason          TEXT            NULL,
    CONSTRAINT pk_order_status_log  PRIMARY KEY (id),
    CONSTRAINT fk_osl_order         FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE INDEX idx_osl_order ON order_status_log (order_id, changed_at);
```

### 终态处理

| 终态类型 | 处理 |
|---------|------|
| 正常终态（completed） | 保留在主表，按归档策略定期迁移 |
| 异常终态（cancelled） | 保留在主表，软删除或归档 |
| 过期终态 | 定期清理任务检查并处理 |

---

## 审计字段设计

### 标准审计四字段

所有表必须包含：

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 记录创建时间，不可修改 |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 最后修改时间，每次更新自动刷新 |
| `created_by` | VARCHAR(64) | NOT NULL | 创建人（用户 ID 或系统标识） |
| `updated_by` | VARCHAR(64) | NOT NULL | 最后修改人 |

### 扩展审计字段（按需）

| 字段 | 适用场景 | 说明 |
|------|---------|------|
| `version` | 乐观锁 / 并发控制 | 每次更新 +1 |
| `ip_address` | 安全敏感操作 | 操作来源 IP |
| `user_agent` | 多端操作追踪 | 操作客户端信息 |
| `operation_id` | 分布式追踪 | 关联请求 ID |

### updated_at 自动更新

```sql
-- PostgreSQL：触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_{table}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- MySQL：字段定义
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## 软删除策略

### 软删除 vs 硬删除决策

| 维度 | 软删除 | 硬删除 |
|------|--------|--------|
| **数据恢复** | 可恢复 | 不可恢复 |
| **审计追踪** | 可追踪 | 需额外日志 |
| **查询复杂度** | 需加 `WHERE is_deleted=FALSE` | 无额外条件 |
| **存储占用** | 持续增长 | 及时释放 |
| **性能影响** | 表越大性能越差 | 无累积影响 |

**决策规则**：
- 业务数据（用户/订单/内容）→ 默认软删除
- 临时数据（日志/缓存/会话）→ 硬删除
- 合规要求保留 → 必须软删除
- 隐私合规要求清除 → 必须硬删除（或脱敏后软删除）

### 软删除实现方式

**方式 1：布尔标记（推荐，简单场景）**
```sql
is_deleted      BOOLEAN         NOT NULL    DEFAULT FALSE,
deleted_at      TIMESTAMPTZ     NULL,
deleted_by      VARCHAR(64)     NULL
```

**方式 2：时间戳标记（推荐，需要唯一约束场景）**
```sql
deleted_at      TIMESTAMPTZ     NULL    -- NULL 表示未删除
```

**方式 3：状态字段（与状态机融合）**
```sql
status          VARCHAR(32)     NOT NULL    DEFAULT 'active'
-- status = 'deleted' 表示软删除
```

### 软删除查询规范

```sql
-- 默认查询排除已删除
SELECT * FROM users WHERE is_deleted = FALSE AND ...;

-- 使用部分索引优化（PostgreSQL）
CREATE INDEX idx_users_email_active ON users (email) WHERE is_deleted = FALSE;

-- 视图封装（可选）
CREATE VIEW active_users AS
    SELECT * FROM users WHERE is_deleted = FALSE;
```

---

## 归档策略

### 归档触发条件

| 条件 | 示例 | 归档方式 |
|------|------|---------|
| **时间超期** | 超过 2 年的已完成订单 | 定期批量迁移 |
| **终态数据** | 已取消/已完成 + 超过保留期 | 定期批量迁移 |
| **表大小** | 主表超过 N 百万行 | 触发归档 |
| **合规要求** | 数据保留期限到期 | 迁移或删除 |

### 归档方式对比

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| **归档表** | 同库的 `{table}_archive` 表 | 偶尔需要查询归档数据 |
| **归档库** | 独立数据库 | 数据量大、主库需减压 |
| **冷存储** | 导出为文件（Parquet/CSV） | 极少访问、合规保留 |
| **分区表** | 按时间分区，老分区归档 | 数据自然按时间分布 |

### 归档表设计

```sql
-- 归档表结构与主表一致，额外添加归档元数据
CREATE TABLE orders_archive (
    -- 所有主表字段照搬
    ...

    -- 归档元数据
    archived_at     TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    archived_by     VARCHAR(64)     NOT NULL,
    archive_reason  VARCHAR(128)    NULL
);
```

### 归档操作规范

1. **事务安全** — INSERT INTO archive + DELETE FROM main 在同一事务
1. **事务安全** — INSERT INTO archive + DELETE FROM main 在同一事务
3. **验证完整** — 归档后校验记录数一致
4. **外键处理** — 先归档子表，再归档父表
5. **索引一致** — 归档表保持与主表相同的查询索引

---

## 历史版本模型

### 何时需要历史版本

| 场景 | 是否需要 | 理由 |
|------|---------|------|
| 商品价格变更 | ✅ | 订单需快照当时价格 |
| 合同条款修改 | ✅ | 法律要求追溯 |
| 用户修改昵称 | ❌ | 不需要历史追踪 |
| 课程大纲变更 | ✅ | 不同学期看到不同版本 |
| 审批流变更 | ✅ | 需追溯每次修改 |

### 历史版本实现方式

**方式 1：版本表（推荐）**

主表存最新版本，历史表存所有版本：

```sql
-- 主表：只存最新版本
CREATE TABLE documents (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    title           VARCHAR(256)    NOT NULL,
    content         TEXT            NOT NULL,
    version         INTEGER         NOT NULL    DEFAULT 1,
    -- 审计字段...
    CONSTRAINT pk_documents PRIMARY KEY (id)
);

-- 历史表：存所有版本
CREATE TABLE document_versions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    document_id     BIGINT          NOT NULL,
    version         INTEGER         NOT NULL,
    title           VARCHAR(256)    NOT NULL,
    content         TEXT            NOT NULL,
    changed_by      VARCHAR(64)     NOT NULL,
    changed_at      TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    change_reason   TEXT            NULL,
    CONSTRAINT pk_doc_versions      PRIMARY KEY (id),
    CONSTRAINT fk_dv_document       FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT uk_dv_doc_ver        UNIQUE (document_id, version)
);
```

**方式 2：时间旅行表（SCD Type 2）**

所有版本在同一表，通过时间范围查询：

```sql
CREATE TABLE product_prices (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    product_id      BIGINT          NOT NULL,
    price           NUMERIC(10,2)   NOT NULL,
    valid_from      TIMESTAMPTZ     NOT NULL,
    valid_to        TIMESTAMPTZ     NULL,       -- NULL = 当前有效
    CONSTRAINT pk_pp PRIMARY KEY (id)
);

-- 查询当前价格
SELECT * FROM product_prices
WHERE product_id = ? AND valid_to IS NULL;

-- 查询某时刻价格
SELECT * FROM product_prices
WHERE product_id = ? AND valid_from <= ? AND (valid_to IS NULL OR valid_to > ?);
```

**方式 3：快照字段（最简单）**

在引用方冗余快照，不单独建历史表：

```sql
-- 订单表快照当时的商品信息
CREATE TABLE order_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    -- 快照字段
    product_name    VARCHAR(256)    NOT NULL,   -- 下单时的商品名
    unit_price      NUMERIC(10,2)   NOT NULL,   -- 下单时的单价
    quantity        INTEGER         NOT NULL,
    ...
);
```

### 方式选择决策

| 条件 | 推荐方式 |
|------|---------|
| 需要完整编辑历史 | 版本表 |
| 需要时间点查询（某时刻的值） | SCD Type 2 |
| 只需引用方快照 | 快照字段 |
| 变更频率低 + 字段少 | 快照字段 |
| 变更频率高 + 字段多 | 版本表 |
