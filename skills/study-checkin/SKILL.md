---
name: study-checkin
description: 学习打卡工具。当用户发送"打卡"、"学习打卡"、"打卡统计"、"查看打卡"等包含打卡相关关键词时激活此技能。
---

# 学习打卡 Skill

## 触发条件

用户消息包含以下关键词时激活：
- "打卡"（执行打卡）
- "学习打卡"（执行打卡）
- "打卡统计"（查看统计）
- "查看打卡"（查看统计）

## 处理流程

### 1. 执行打卡

当用户发送"打卡"或"学习打卡"（且不包含"统计"、"查看"）时：

```bash
node "D:\code\openclaw-home\workspace\skills\study-checkin\scripts\checkin.js" checkin
```

根据返回的 JSON 构造回复：
- `already_checked: true` → 回复："今天已经打过卡啦 ✅ 当前连续打卡 {streak} 天，继续保持！"
- `success: true` → 回复："打卡成功 🎉 当前连续打卡 {streak} 天，{鼓励语}！"
  - streak >= 7 时鼓励语："太厉害了，一周不间���"
  - streak >= 30 时鼓励语："一个月坚持下来了，了不起"
  - 其他："继续加油"

### 2. 查看打卡统计

当用户发送"打卡统计"或"查看打卡"时：

```bash
node "D:\code\openclaw-home\workspace\skills\study-checkin\scripts\checkin.js" stats
```

可指定月份（如"3月打卡统计"）：

```bash
node "D:\code\openclaw-home\workspace\skills\study-checkin\scripts\checkin.js" stats 2026-03
```

根据返回的 JSON 构造回复，格式：

```
📊 {month} 学习打卡统计

{calendar 日历视图，每行7天，用 ✅/⬜ 表示}

📅 本月天数：{total_days}
✅ 打卡天数：{checked_days}
📈 打卡率：{rate}
🔥 当前连续：{current_streak} 天
🏆 最长连续：{max_streak} 天
```

日历视图直接使用返回 JSON 中 `calendar` 数组渲染，每个元素���含 `day` 和 `checked` 字段。按周排列（周一到周日），月初前的空位用空格填充。
