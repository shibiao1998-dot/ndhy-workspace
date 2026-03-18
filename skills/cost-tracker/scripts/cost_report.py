"""
成本报表生成工具
用法: python cost_report.py [--period day|week|month] [--group expert|project|model] [--ledger path]
"""
import json, sys, os
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path

DEFAULT_LEDGER = Path(__file__).parent.parent.parent.parent / "cost-ledger.jsonl"

def load_ledger(path):
    records = []
    if not Path(path).exists():
        return records
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return records

def filter_by_period(records, period):
    now = datetime.now()
    if period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        return records
    
    filtered = []
    for r in records:
        try:
            ts = datetime.fromisoformat(r["ts"].replace("Z", "+00:00"))
            # Naive comparison - strip timezone for simplicity
            ts_naive = ts.replace(tzinfo=None)
            if ts_naive >= start:
                filtered.append(r)
        except (KeyError, ValueError):
            continue
    return filtered

def group_records(records, group_by):
    groups = defaultdict(lambda: {"tokens_in": 0, "tokens_out": 0, "cost_cny": 0, "count": 0, "tasks": []})
    for r in records:
        key = r.get(group_by, "unknown")
        g = groups[key]
        g["tokens_in"] += r.get("tokens_in", 0)
        g["tokens_out"] += r.get("tokens_out", 0)
        g["cost_cny"] += r.get("cost_cny", 0)
        g["count"] += 1
        g["tasks"].append(r.get("task", ""))
    return dict(groups)

def format_report(records, period, group_by):
    now = datetime.now().strftime("%Y-%m-%d")
    period_label = {"day": "日报", "week": "周报", "month": "月报"}.get(period, "全量")
    
    lines = [f"## 成本{period_label} {now}\n"]
    
    if group_by:
        groups = group_records(records, group_by)
        group_label = {"expert": "专家", "project": "项目", "model": "模型"}.get(group_by, group_by)
        lines.append(f"| {group_label} | 任务数 | 输入Token | 输出Token | 费用(¥) |")
        lines.append("|------|--------|----------|----------|---------|")
        total_cost = 0
        total_in = 0
        total_out = 0
        for key, g in sorted(groups.items(), key=lambda x: -x[1]["cost_cny"]):
            lines.append(f"| {key} | {g['count']} | {g['tokens_in']:,} | {g['tokens_out']:,} | {g['cost_cny']:.2f} |")
            total_cost += g["cost_cny"]
            total_in += g["tokens_in"]
            total_out += g["tokens_out"]
        lines.append(f"\n**合计**：¥{total_cost:.2f}（{total_in/1000:.0f}K in + {total_out/1000:.0f}K out）")
    else:
        lines.append("| 时间 | 任务 | 专家 | 模型 | Token | 费用(¥) |")
        lines.append("|------|------|------|------|-------|---------|")
        total_cost = 0
        for r in records:
            ts = r.get("ts", "")[:16]
            task = r.get("task", "")[:20]
            expert = r.get("expert", "")
            model = r.get("model", "").split("/")[-1][:20]
            tokens = f"{r.get('tokens_in', 0)/1000:.0f}K+{r.get('tokens_out', 0)/1000:.0f}K"
            cost = r.get("cost_cny", 0)
            total_cost += cost
            lines.append(f"| {ts} | {task} | {expert} | {model} | {tokens} | {cost:.2f} |")
        lines.append(f"\n**合计**：¥{total_cost:.2f}")
    
    return "\n".join(lines)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="成本报表生成")
    parser.add_argument("--period", choices=["day", "week", "month", "all"], default="day")
    parser.add_argument("--group", choices=["expert", "project", "model"], default=None)
    parser.add_argument("--ledger", default=str(DEFAULT_LEDGER))
    args = parser.parse_args()
    
    records = load_ledger(args.ledger)
    if not records:
        print(f"账本为空或不存在: {args.ledger}")
        return
    
    if args.period != "all":
        records = filter_by_period(records, args.period)
    
    if not records:
        print(f"该时间段无记录")
        return
    
    print(format_report(records, args.period, args.group))

if __name__ == "__main__":
    main()
