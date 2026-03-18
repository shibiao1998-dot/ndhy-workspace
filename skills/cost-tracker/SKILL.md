---
name: cost-tracker
description: |
  AI 组织成本追踪。记录每次任务的 token 消耗和费用，生成成本报表。
  **使用场景**：
  (1) 任务完成后记录成本（自动或手动）
  (2) 查看成本报表（日/周/月，按专家/项目/模型）
  (3) 老板问"花了多少钱"
  (4) 用户提到"成本"、"费用"、"token"、"花了多少"
---

# Cost Tracker — AI 组织成本追踪

## 数据来源

1. **AIAE 网关 API**：每次调用返回 `usage.cost_details`（CNY）
2. **OpenClaw session_status**：显示每个 session 的 token 消耗
3. **手动记录**：ACP 任务完成后从日志提取

## 账本文件

路径：`D:\code\openclaw-home\workspace\cost-ledger.jsonl`

每行一条记录，JSONL 格式：
```json
{"ts":"2026-03-18T12:00:00+08:00","task":"model-router skill","expert":"Leader","project":"org-evolution","model":"claude-opus-4-6","tokens_in":50000,"tokens_out":15000,"cost_cny":3.25,"duration_s":180,"note":"skill creation"}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `ts` | ✅ | ISO 时间戳 |
| `task` | ✅ | 任务描述（简短） |
| `expert` | ✅ | 执行专家（Leader/角色名） |
| `project` | — | 所属项目 |
| `model` | ✅ | 使用的模型 |
| `tokens_in` | ✅ | 输入 token 数 |
| `tokens_out` | ✅ | 输出 token 数 |
| `cost_cny` | ✅ | 费用（人民币） |
| `duration_s` | — | 耗时（秒） |
| `note` | — | 备注 |

## 记录成本

### 方式一：从 API 响应提取（推荐）

AIAE API 每次响应包含：
```json
"usage": {
  "cost_details": [...],
  "total_price": 0.52,
  "currency": "CNY"
}
```

任务完成后，从响应中提取 `total_price` 写入账本。

### 方式二：从 session_status 提取

```
session_status → 读取 token 消耗 → 按模型定价计算
```

Claude Opus 4.6 定价（via ndhy-gateway）：
- 输入 ≤200K：¥40.32/百万 token
- 输入 >200K：¥80.64/百万 token
- 输出 ≤200K：¥201.60/百万 token
- 输出 >200K：¥302.40/百万 token

### 方式三：手动记录

对于无法自动提取的任务，手动追加一行到 `cost-ledger.jsonl`。

## 生成报表

### 使用脚本

```bash
python scripts/cost_report.py [--period day|week|month] [--group expert|project|model]
```

### 报表维度

| 维度 | 命令 | 说明 |
|------|------|------|
| 按日 | `--period day` | 今日成本明细 |
| 按周 | `--period week` | 本周汇总 |
| 按月 | `--period month` | 本月汇总 |
| 按专家 | `--group expert` | 各专家消耗 |
| 按项目 | `--group project` | 各项目消耗 |
| 按模型 | `--group model` | 各模型消耗 |

### 报表格式（Markdown 表格）

```markdown
## 成本日报 2026-03-18

| 任务 | 专家 | 模型 | Token | 费用(¥) |
|------|------|------|-------|---------|
| ... | ... | ... | ... | ... |

**合计**：¥XX.XX（输入 XXK + 输出 XXK = XXK tokens）
```

## Leader 职责

1. **每次 spawn 任务完成后**：记录成本到账本
2. **每日收盘时**：生成日报，写入 `memory/YYYY-MM-DD.md`
3. **老板问成本时**：立即生成报表回复

## 注意事项

- 账本文件用 JSONL（每行独立 JSON），方便追加、方便解析
- 不存储 API Key 等敏感信息
- 成本数据以 AIAE API 返回的 CNY 为准
- 心跳和调研 cron 的成本也需要记录
