# 约束与索引策略

## 目录

- [主键策略](#主键策略)
- [外键策略](#外键策略)
- [唯一约束](#唯一约束)
- [CHECK 约束](#check-约束)
- [NOT NULL 策略](#not-null-策略)
- [索引策略](#索引策略)
- [约束设计原则](#约束设计原则)

---

## 主键策略

### 选择决策树

```
需要主键
  ├─ 单库 + 内部系统？
  │   → 自增 BIGINT（最简单、性能最好）
  │
  ├─ 分布式 / 外部暴露？
  │   ├─ 需要有序？ → UUID v7 / 雪花 ID
  │   └─ 不需有序？ → UUID v4
  │
  └─ 有天然业务唯一标识？
      → 自增/UUID 做 PK + 业务键做 UK（两者共存）
```

### 主键规范

| 规范 | 说明 |
|------|------|
| 字段名统一 `id` | 不用 `{table}_id` 做主键名 |
| 类型统一 `BIGINT` 或 `UUID` | 全项目一致 |
| 不用复合主键做 PK | 复合唯一性用 UK 实现 |
| 不用业务字段做 PK | 业务字段可能变更 |

---

## 外键策略

### ON DELETE 行为选择

| 行为 | 含义 | 适用场景 |
|------|------|---------|
| **RESTRICT** | 有子记录时禁止删除父记录 | 默认选择，最安全 |
| **CASCADE** | 删父记录时自动删子记录 | 聚合内的从属实体 |
| **SET NULL** | 删父记录时子记录 FK 置 NULL | 弱关联（如"创建人"被注销） |
| **NO ACTION** | 事务提交时检查，与 RESTRICT 类似 | PostgreSQL 默认 |

**决策规则**：
RESTRICT（最安全）
- 聚合内从属实体 → CASCADE
- 可选引用（允许失联） → SET NULL
- 软删除体系下 → 通常不需要 CASCADE（父记录不真删）

### 外键命名规范

格式：`fk_{当前表}_{引用表}` 或 `fk_{当前表}_{列名}`

```sql
CONSTRAINT fk_enrollment_student  FOREIGN KEY (student_id) REFERENCES students(id),
CONSTRAINT fk_enrollment_course   FOREIGN KEY (course_id) REFERENCES courses(id)
```

### 是否使用数据库外键

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| **数据库外键** | 强一致性，数据库层保障 | 跨库/分库困难，性能影响 | 单库、数据一致性要求高 |
| **应用层外键** | 灵活，跨库无障碍 | 需应用层保证，可能不一致 | 微服务/分库场景 |

**建议**：单库默认用数据库外键。分库/微服务场景用应用层外键 + 定期一致性校验。

---

## 唯一约束

### 唯一约束 vs 唯一索引

| 方式 | 语义 | 推荐场景 |
|------|------|---------|
| `UNIQUE CONSTRAINT` | 业务规则层面的唯一性 | 业务唯一性（如：同一用户名不能重复） |
| `UNIQUE INDEX` | 性能优化层面的唯一性 | 技术唯一性（效果等同，但语义不同） |

**建议**：业务唯一性用 CONSTRAINT，技术唯一用 INDEX。

### 软删除下的唯一约束

软删除场景，已删除记录不应参与唯一性检查：

```sql
-- PostgreSQL：部分唯一索引（推荐）
CREATE UNIQUE INDEX uk_users_email_active
    ON users (email) WHERE is_deleted = FALSE;

-- MySQL：组合 deleted_at（技巧）
-- 唯一索引包含 deleted_at，未删除记录 deleted_at 为固定值（如 '1970-01-01'）
ALTER TABLE users ADD UNIQUE INDEX uk_users_email_active (email, deleted_at);
```

---

## CHECK 约束

### 常见 CHECK 约束模式

```sql
-- 枚举值约束
CONSTRAINT ck_orders_status CHECK (status IN ('pending','paid','shipped','completed','cancelled'))

-- 范围约束
CONSTRAINT ck_products_price CHECK (price >= 0)
CONSTRAINT ck_scores_value CHECK (score BETWEEN 0 AND 100)

-- 条件约束
CONSTRAINT ck_orders_shipped CHECK (
    status != 'shipped' OR shipped_at IS NOT NULL
)

-- 跨字段约束
CONSTRAINT ck_events_time CHECK (end_time > start_time)
```

### CHECK vs 应用层校验

| 维度 | 数据库 CHECK | 应用层校验 |
|------|-------------|-----------|
| 保障层级 | 最后一道防线 | 前置拦截 |
| 性能 | 每次写入检查 | 可选择性检查 |
| 错误信息 | 不友好 | 可定制 |

**建议**：两层都要。应用层给友好提示，数据库 CHECK 兜底。

---

## NOT NULL 策略

### 判断是否 NOT NULL

| 场景 | 选择 | 理由 |
|------|------|------|
| 业务必填字段 | NOT NULL | 数据完整性 |
| 有默认值的字段 | NOT NULL + DEFAULT | 不允许空值 |
| 外键字段（强关联） | NOT NULL | 必须有引用目标 |
| 外键字段（弱关联） | NULL | 允许"不关联" |
| 审计字段 | NOT NULL | 始终要有值 |
| 软删除 deleted_at | NULL | 未删除时为空 |

**默认倾向**：NOT NULL。允许 NULL 需要明确理由。

---

## 索引策略

### 索引类型速查

| 类型 | 适用场景 | 示例 |
|------|---------|------|
| **B-Tree** | 等值/范围查询（默认） | `CREATE INDEX idx ON t(col)` |
| **复合索引** | 多条件联合查询 | `CREATE INDEX idx ON t(a, b, c)` |
| **部分索引** | 只索引部分数据 | `CREATE INDEX idx ON t(col) WHERE is_deleted=FALSE` |
| **函数索引** | 函数/表达式查询 | `CREATE INDEX idx ON t(LOWER(email))` |
| **覆盖索引** | 索引覆盖所有查询列 | `CREATE INDEX idx ON t(a, b) INCLUDE (c)` |
| **GIN** | JSONB/数组/全文检索 | `CREATE INDEX idx ON t USING GIN(tags)` |
| **GiST** | 地理/范围数据 | `CREATE INDEX idx ON t USING GiST(location)` |

### 索引设计方法

**Step 1：收集查询模式**
- 列出核心查询（来自 API 设计或业务场景）
- 标注每个查询的 WHERE/ORDER BY/JOIN 条件

**Step 2：设计索引**
- 每个高频查询路径至少一个索引覆盖
- 复合索引：最左前缀原则，高选择性列在前
- 考虑部分索引减少索引大小

**Step 3：评估开销**
- 每个索引增加写入开销
- 读多写少 → 多建索引；写多读少 → 精简索引
- 避免冗余索引（(a,b) 已覆盖 (a) 的查询）

### 复合索引列序决策

```
复合索引 (a, b, c) 的列序选择：
  1. 等值查询的列排前面
  2. 范围查询的列排后面
  3. 高选择性（基数大）的列排前面
  4. ORDER BY 的列排最后（如需索引排序）
```

### 索引陷阱

| 陷阱 | ❌ 错误 | ✅ 正确 |
|------|--------|--------|
| 每列建单独索引 | 10 个字段建 10 个索引 | 按查询模式建复合索引 |
| 忽视写入开销 | 热表建大量索引 | 评估读写比例 |
| 前缀顺序错 | INDEX(low_cardinality, high_cardinality) | 高选择性列在前 |
| 不用部分索引 | 全表索引含软删除数据 | `WHERE is_deleted=FALSE` |

---

## 约束设计原则

### 七条原则

1. **约束随表建** — 不存在"先建表后加约束"的阶段
2. **数据库兜底** — 关键约束必须在数据库层，不能只靠应用层
3. **约束可命名** — 所有约束有明确名称（`pk_`/`fk_`/`uk_`/`ck_`），报错可追溯
4. **约束可解释** — 每个约束对应一条可描述的业务规则
5. **约束最紧凑** — 用最严格的约束，只在有理由时放宽
6. **约束可迁移** — 约束变更有迁移方案
7. **约束可测试** — 测试应覆盖约束的正面和反面用例
