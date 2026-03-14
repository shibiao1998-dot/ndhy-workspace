# 逻辑与物理数据模型设计

## 目录

- [逻辑模型设计](#逻辑模型设计)
- [物理模型设计](#物理模型设计)
- [规范化与反规范化](#规范化与反规范化)
- [字段类型选择](#字段类型选择)

---

## 逻辑模型设计

### 从概念到逻辑：转化步骤

1. **为每个实体定义属性** — 字段名、语义描述、是否必填
2. **确定主键策略** — 自增 / UUID / 业务键（见下方对比）
3. **映射关系** — 1:1 → FK 或合表 / 1:N → FK / M:N → 中间表
4. **判断规范化级别** — 3NF 为基线，有理由可降级
5. **标注值对象** — 地址、联系方式等嵌入宿主实体

### 主键策略对比

| 策略 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| **自增 ID** | 简单、性能好、有序 | 分布式不友好、可猜测 | 单库/内部系统 |
| **UUID v4** | 分布式友好、不可猜测 | 无序（索引性能差）、占用大 | 分布式/外部暴露 |
| **UUID v7** | 有序 + 分布式 + 含时间 | 相对新、占用大 | 推荐：需分布式+有序 |
| **雪花 ID** | 有序、分布式、可提取时间 | 需要发号器、时钟依赖 | 高并发分布式 |
| **业务键** | 语义明确 | 可能变更、复合键复杂 | 有天然唯一标识的场景 |

**决策规则**：
- 默认选自增 ID（最简单）
- 需要分布式 → UUID v7 或雪花 ID
- 主键对外暴露 → UUID（不可猜测）
- 有天然业务唯一标识 → 业务键（但仍建自增/UUID 主键，业务键做 UK）

### 属性定义规范

每个属性必须回答：

| 维度 | 内容 | 示例 |
|------|------|------|
| **名称** | snake_case，自解释 | `enrollment_date` |
| **语义** | 一句话说清含义 | "学生选课的日期" |
| **必填** | NULL 还是 NOT NULL | NOT NULL |
| **默认值** | 有无默认值 | `CURRENT_TIMESTAMP` |
| **唯一性** | 是否业务唯一 | 同一学生同一课程唯一 |
| **值域** | 合法取值范围 | ISO 8601 日期格式 |

### 命名规范

| 类别 | 规范 | ✅ 示例 | ❌ 反例 |
|------|------|--------|--------|
| 表名 | snake_case，复数 | `students` | `Student`、`tbl_student` |
| 字段名 | snake_case | `first_name` | `firstName`、`FIRST_NAME` |
| 外键 | `{引用表单数}_id` | `course_id` | `courseID`、`fk_course` |
| 布尔 | `is_` / `has_` 前缀 | `is_active` | `active`、`flag` |
| 时间 | `_at` 后缀 | `created_at` | `create_time`、`crt_dt` |
| 状态 | 明确含义 | `enrollment_status` | `status`（全局不唯一） |

---

## 物理模型设计

### 从逻辑到物理：转化步骤

1. **选择数据库引擎** — PostgreSQL / MySQL / SQLite 等
2. **映射字段类型** — 逻辑类型 → 具体物理类型（见字段类型选择）
3. **添加审计字段** — created_at / updated_at / created_by / updated_by
4. **添加软删除字段** — is_deleted / deleted_at（如策略需要）
5. **定义约束** — PK / FK / UK / NOT NULL / CHECK
6. **设计索引** — 基于查询模式
7. **添加注释** — 表和字段都要有中文注释

### 物理模型设计原则

| 原则 | 说明 |
|------|------|
| **审计四字段必备** | created_at, updated_at, created_by, updated_by |
| **字段注释必填** | 每个表和字段用 COMMENT 说明业务含义 |
| **约束随表建** | 不存在"先建表后加约束"的流程 |
| **类型最紧凑** | 用满足需求的最小类型 |
| **预留但不过度** | VARCHAR 长度适当预留，但不默认 255 |

### DDL 书写规范

```sql
CREATE TABLE {table_name} (
    -- 主键放第一行
    id              BIGINT GENERATED ALWAYS AS IDENTITY  NOT NULL,

    -- 业务字段按逻辑分组，空行分隔
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,

    -- 外键字段放在业务字段后
    course_id       BIGINT          NOT NULL,

    -- 状态和生命周期
    status          VARCHAR(32)     NOT NULL    DEFAULT 'draft',

    -- 审计字段
    created_at      TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    created_by      VARCHAR(64)     NOT NULL,
    updated_by      VARCHAR(64)     NOT NULL,

    -- 软删除字段（如需要）
    is_deleted      BOOLEAN         NOT NULL    DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ     NULL,

    -- 约束
    CONSTRAINT pk_{table}           PRIMARY KEY (id),
    CONSTRAINT fk_{table}_{ref}     FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT uk_{table}_{biz}     UNIQUE (name, course_id),
    CONSTRAINT ck_{table}_status    CHECK (status IN ('draft','active','archived'))
);

-- 索引紧跟 CREATE TABLE
CREATE INDEX idx_{table}_{col} ON {table_name} ({col}) WHERE is_deleted = FALSE;

-- 注释紧跟索引
COMMENT ON TABLE {table_name} IS '表中文名';
COMMENT ON COLUMN {table_name}.name IS '名称';
```

---

## 规范化与反规范化

### 规范化级别速查

| 级别 | 要求 | 违反后果 |
|------|------|---------|
| **1NF** | 每个字段原子值，无重复列 | 查询困难、更新异常 |
| **2NF** | 1NF + 非主属性完全依赖主键 | 部分更新异常 |
| **3NF** | 2NF + 非主属性不传递依赖 | 传递更新异常 |
| **BCNF** | 所有决定因素都是候选键 | 极少数异常场景 |

**默认基线**：3NF。向下降级（2NF/BCNF）需要明确理由和风险说明。

### 反规范化的合法理由

| 理由 | 示例 | 要求 |
|------|------|------|
| **高频查询性能** | 订单表冗余用户名，避免 JOIN | 记录同步策略（触发器/应用层） |
| **跨聚合统计** | 汇总字段避免实时聚合 | 说明更新频率和一致性容忍度 |
| **历史快照** | 订单快照当时的商品价格 | 明确是快照而非引用 |

### 反规范化检查清单

每次反规范化都必须回答：

- [ ] 为什么 JOIN 不够用？（性能数据或明确瓶颈）
- [ ] 冗余数据怎么同步？（触发器/事件/定时任务）
- [ ] 不一致时谁为准？（主表/冗余/冲突策略）
- [ ] 写入开销增加多少？（量化评估）
- [ ] 决策已记录到 risk-report？

---

## 字段类型选择

### 常用类型映射表（PostgreSQL）

| 逻辑类型 | 推荐物理类型 | 说明 |
|---------|------------|------|
| 自增 ID | `BIGINT GENERATED ALWAYS AS IDENTITY` | 不用 SERIAL（已过时） |
| UUID | `UUID` | 原生支持 |
| 短文本（≤256） | `VARCHAR(n)` | n 按业务预估，不默认 255 |
| 长文本 | `TEXT` | 不限长度 |
| 整数 | `INTEGER` / `BIGINT` | 预估范围选择 |
| 小数/金额 | `NUMERIC(p,s)` | ❌ 不用 FLOAT/DOUBLE |
| 布尔 | `BOOLEAN` | 不用 TINYINT(1) |
| 日期 | `DATE` | 不含时间 |
| 时间戳 | `TIMESTAMPTZ` | 带时区（推荐） |
| JSON | `JSONB` | ❌ 不用 JSON（不可索引） |
| 枚举 | `VARCHAR(32)` + CHECK | 不用数据库 ENUM 类型（难迁移） |
| 数组 | `ARRAY` 或关联表 | 简单场景用 ARRAY，复杂用关联表 |

### 常用类型映射表（MySQL）

| 逻辑类型 | 推荐物理类型 | 说明 |
|---------|------------|------|
| 自增 ID | `BIGINT AUTO_INCREMENT` | |
| UUID | `CHAR(36)` 或 `BINARY(16)` | BINARY 性能更好 |
| 短文本 | `VARCHAR(n)` | 注意字符集影响长度 |
| 长文本 | `TEXT` / `MEDIUMTEXT` | 按需选择 |
| 整数 | `INT` / `BIGINT` | |
| 小数/金额 | `DECIMAL(p,s)` | ❌ 不用 FLOAT/DOUBLE |
| 布尔 | `TINYINT(1)` | MySQL 无原生布尔 |
| 时间戳 | `DATETIME` | MySQL TIMESTAMP 有 2038 问题 |
| JSON | `JSON` | MySQL 5.7+ 支持 |
| 枚举 | `VARCHAR(32)` | ❌ 不用 ENUM 类型 |

### 类型选择陷阱

| 陷阱 | ❌ 错误 | ✅ 正确 | 后果 |
|------|--------|--------|------|
| 金额用浮点 | `FLOAT` / `DOUBLE` | `NUMERIC` / `DECIMAL` | 精度丢失 |
| 默认 VARCHAR(255) | 所有文本都 VARCHAR(255) | 按业务预估合理长度 | 浪费/误导 |
| 用 ENUM 类型 | `ENUM('a','b','c')` | `VARCHAR + CHECK` | 变更需 ALTER TABLE |
| 时间不带时区 | `TIMESTAMP` (不带 TZ) | `TIMESTAMPTZ` | 跨时区错乱 |
| 状态用数字 | `status INT` (0,1,2) | `status VARCHAR(32)` | 不可读/易出错 |
