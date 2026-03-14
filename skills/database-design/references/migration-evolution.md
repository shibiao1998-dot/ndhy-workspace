# Schema 演进与迁移策略

## 目录

- [Schema 演进风险评估](#schema-演进风险评估)
- [迁移策略规划](#迁移策略规划)
- [兼容性检查](#兼容性检查)
- [回滚方案设计](#回滚方案设计)

---

## Schema 演进风险评估

### 变更类型风险矩阵

| 变更类型 | 风险等级 | 向前兼容 | 向后兼容 | 说明 |
|---------|---------|---------|---------|------|
| 新增表 | 🟢 低 | ✅ | ✅ | 不影响已有功能 |
| 新增可空列 | 🟢 低 | ✅ | ✅ | 旧代码忽略新列 |
| 新增非空列（有默认值） | 🟡 中 | ✅ | ⚠️ | 旧代码写入可能遗漏 |
| 新增非空列（无默认值） | 🔴 高 | ❌ | ❌ | 必须同步改代码 |
| 修改列类型（兼容拓宽） | 🟡 中 | ✅ | ✅ | INT→BIGINT，VARCHAR(50)→VARCHAR(100) |
| 修改列类型（不兼容） | 🔴 高 | ❌ | ❌ | VARCHAR→INT，需数据迁移 |
| 重命名列 | 🔴 高 | ❌ | ❌ | 所有引用都要改 |
| 删除列 | 🔴 高 | ❌ | ❌ | 不可回滚 |
| 新增约束 | 🟡 中 | ⚠️ | ✅ | 现有数据可能不满足 |
| 删除约束 | 🟢 低 | ✅ | ✅ | 放宽限制 |
| 新增索引 | 🟢 低 | ✅ | ✅ | 可能影响写入性能 |
| 删除索引 | 🟡 中 | ✅ | ✅ | 查询可能变慢 |
| 修改主键 | 🔴 极高 | ❌ | ❌ | 影响所有关联 |
| 分表/合表 | 🔴 极高 | ❌ | ❌ | 需要完整数据迁移 |

### 风险评估流程

1. **列出所有变更** — 逐条分类（上表）
2. **评估影响范围** — 哪些服务/API/查询受影响
3. **检查数据量** — 涉及表的行数，影响迁移耗时
4. **检查锁表风险** — ALTER TABLE 是否需要锁表（取决于数据库和变更类型）
5. **评估回滚难度** — 能否回滚、回滚代价多大
6. **综合风险等级** — 取最高风险等级

### 锁表风险评估（PostgreSQL）

| 操作 | 锁级别 | 阻塞读 | 阻塞写 | 说明 |
|------|--------|--------|--------|------|
| ADD COLUMN (无默认值) | AccessExclusive → ShareUpdateExclusive (PG11+) | PG11+ 不阻塞 | PG11+ 不阻塞 | PG11+ 可在线 |
| ADD COLUMN (有默认值) | AccessExclusive → ShareUpdateExclusive (PG11+) | PG11+ 不阻塞 | PG11+ 不阻塞 | PG11+ 可在线 |
| ADD CONSTRAINT (CHECK) | AccessExclusive | ❌ | ❌ | 用 NOT VALID + VALIDATE 两步 |
| ADD CONSTRAINT (FK) | ShareRowExclusive | ❌ | ❌ | 用 NOT VALID + VALIDATE 两步 |
| CREATE INDEX | ShareLock | ❌ | ❌ | 用 CONCURRENTLY 避免 |
| DROP COLUMN | AccessExclusive | 短暂 | 短暂 | 只改目录，不改数据 |
| ALTER TYPE | AccessExclusive | ❌ | ❌ | 可能重写全表 |

---

## 迁移策略规划

### 迁移三阶段模型

```
Phase 1：扩展（Expand）— 可回滚
  │  新增列/表，放宽约束
  │  旧代码继续工作
  │  新代码开始适配
  │
Phase 2：迁移（Migrate）— 需确认
  │  数据回填/转换
  │  新旧代码双写/双读
  │  收紧约束
  │
Phase 3：收缩（Contract）— 不可回滚
     删除旧列/旧表
     确认所有依赖已迁移
     执行后无法回退
```

### 迁移步骤模板

以"列重命名"为例（最复杂的常见变更）：

```sql
-- Phase 1: 新增列
ALTER TABLE users ADD COLUMN full_name VARCHAR(128) NULL;

-- Phase 2: 数据回填
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- 应用层：双写 name 和 full_name
-- 应用层：读取改为 COALESCE(full_name, name)

-- Phase 2.5: 收紧新列约束
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- 应用层：确认所有代码已迁移到 full_name

-- Phase 3: 删除旧列（确认后延迟执行）
ALTER TABLE users DROP COLUMN name;
```

### 迁移脚本规范

| 规范 | 说明 |
|------|------|
| **幂等性** | 脚本可重复执行，不报错不重复处理 |
| **有序编号** | `001_add_users_table.sql`、`002_add_email_column.sql` |
| **有对应回滚** | 每个 up 脚本有对应 down 脚本 |
| **先验证后执行** | 在测试环境完整跑通后再上生产 |
| **大表分批处理** | 回填数据分批 UPDATE，避免长事务 |

### 大表数据回填策略

```sql
-- 分批回填，每批 10000 条
DO $$
DECLARE
    batch_size INT := 10000;
    affected INT;
BEGIN
    LOOP
        UPDATE users
        SET full_name = name
        WHERE full_name IS NULL
        AND id IN (
            SELECT id FROM users
            WHERE full_name IS NULL
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );
        GET DIAGNOSTICS affected = ROW_COUNT;
        EXIT WHEN affected = 0;
        PERFORM pg_sleep(0.1);  -- 避免压力过大
        COMMIT;
    END LOOP;
END $$;
```

---

## 兼容性检查

### 向前兼容（新代码读旧数据）

| 检查项 | 方法 |
|--------|------|
| 新代码能处理新列为 NULL 的情况？ | 代码中加 NULL 兜底 |
| 新代码能处理旧枚举值？ | 枚举处理加 default 分支 |
| 新代码的查询对旧索引有效？ | EXPLAIN 验证 |

### 向后兼容（旧代码读新数据）

| 检查项 | 方法 |
|--------|------|
| 旧代码是否 SELECT * ？ | 新增列不影响 SELECT * |
| 旧代码写入时新列有默认值？ | ALTER 时设 DEFAULT |
| 旧代码的 INSERT 是否显式列举列？ | 新增列需有默认值或允许 NULL |

### 跨服务兼容

| 场景 | 风险 | 缓解 |
|------|------|------|
| 服务 A 已部署新代码，服务 B 还是旧代码 | B 读不懂新字段 | Phase 1 先只加列不加约束 |
| 共享数据库被多个服务读写 | 一方改了另一方不知道 | Schema 变更通知机制 |
| 数据同步/ETL 管道 | 字段变更打断管道 | 管道配置中登记所有表结构 |

---

## 回滚方案设计

### 回滚能力矩阵

| 操作 | 可回滚？ | 回滚方式 | 数据影响 |
|------|---------|---------|---------|
| ADD TABLE | ✅ | DROP TABLE | 丢失新数据 |
| ADD COLUMN | ✅ | DROP COLUMN | 丢失新列数据 |
| ADD CONSTRAINT | ✅ | DROP CONSTRAINT | 放宽约束 |
| ADD INDEX | ✅ | DROP INDEX | 查询可能变慢 |
| RENAME COLUMN | ⚠️ | RENAME 回去 | 依赖代码也要回滚 |
| DROP COLUMN | ❌ | 从备份恢复 | 需要停机 |
| ALTER TYPE (破坏性) | ❌ | 从备份恢复 | 需要停机 |
| DELETE/UPDATE 数据 | ❌ | 从备份恢复 | 需要停机 |

### 回滚方案模板

```markdown
## 回滚方案

### 前置条件
- [ ] 迁移前已做备份，备份验证通过
- [ ] 回滚脚本已在测试环境验证
- [ ] 各 Phase 的回滚点已标记

### Phase 1 回滚
触发条件：{什么情况下回滚}
回滚脚本：
​```sql
-- Phase 1 回滚：删除新增列
ALTER TABLE {table} DROP COLUMN {new_col};
​```
预估耗时：{X} 分钟
数据影响：{说明}

### Phase 2 回滚
（同上格式）

### Phase 3 回滚
⚠️ Phase 3 不可回滚。执行前需确认：
- [ ] 所有依赖已迁移完成
- [ ] 在测试环境验证至少 72 小时
- [ ] 已获得项目管理专家批准
```

### 回滚决策流程

```
迁移执行中发现异常
  ├─ 在 Phase 1？
  │   → 立即回滚（低风险）
  │
  ├─ 在 Phase 2？
  │   ├─ 数据未污染？ → 回滚到 Phase 1 状态
  │   └─ 数据已污染？ → 评估影响 → 可能需要手动修复
  │
  └─ 在 Phase 3？
      → ⚠️ 无法自动回滚
      → 评估：恢复备份 vs 前进修复
      → 上报项目管理专家决策
```
