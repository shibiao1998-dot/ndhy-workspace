# PROJECT.md — NDHY AI Org 产品官网 V7

## 定位
**Live Org Dashboard** — 不是营销页，是 AI 组织的实时运行仪表盘。

## 核心理念
> 用 AI 组织做出来的网站，本身就是 AI 组织的活体证明。

## 三文档门控状态

| Gate | 文档 | 状态 | 老板确认 |
|------|------|------|---------|
| Gate 1 | 需求方案 | ✅ done | 2026-03-18 |
| Gate 2 | 产品定义 (`product-definition-v7.md`) | ✅ done | 2026-03-18 15:07 |
| Gate 3 | 架构设计 (`architecture-v7.md`) | ✅ done | 2026-03-18 15:22 |

## 当前阶段：M3-M6 前端页面完成

```
Track A（设计线）：A1 UX 交互文档 ✅ → A2 视觉规范 ✅
Track B（后端线）：M1 数据管道 ✅
         ↓ 汇合 ↓
→ M2 项目骨架 ✅ → M3-M6 前端页面 ✅ → M7 CI/CD 🔄 → M8 整体验收
```

| Track | 任务 | 执行者 | 状态 |
|-------|------|--------|------|
| A1 | UX 交互文档 | 🎨 体验设计专家 | ✅ done（`ux-interaction-v7.md`） |
| A2 | 视觉设计规范 | 🖼️ UI 设计专家 | ✅ done（`visual-design-v7.md`） |
| B | M1 数据管道 | ACP（Claude Code） | ✅ done（`v7/generate_data.py` + `data.json`） |
| C | V7 走查 | 🔍 代码审查专家 | ✅ done（`walkthrough-report-v7.md`） |
| D | M2 Astro 骨架 | ACP（Claude Code） | ✅ done（2026-03-18 19:19 完成） |
| E | **M3-M6 前端页面** | **ACP（Claude Code）** | **✅ done（2026-03-18 19:35 完成）** |

## 模块化开发计划（M1-M8）

| # | 模块 | 规模 | 状态 | 备注 |
|---|------|------|------|------|
| M1 | 数据管道（Python + data.json） | 中 | ✅ done | — |
| M2 | Astro 骨架 + 布局 + 导航 + 404 | 中 | ✅ done | ACP 完成 |
| M3 | Landing 页（/） | 中 | ✅ done | Hero Hook + StatsCards + QuickNav |
| M4 | 组织全景页（/team） | 大 | ✅ done | OrgChart + ExpertCard 网格 |
| M5 | 能力矩阵页（/capabilities） | 大 | ✅ done | SkillCategory 手风琴 + ModelOverview + 全链路图 |
| M6 | 活动流页（/activity） | 大 | ✅ done | ActivityTimeline + GitHeatmap + CommitList |
| M7 | CI/CD + GitHub Pages | 小 | ⏳ pending | — |
| M8 | 整体验收 + 性能优化 | 中 | ⏳ pending | 多专家审查 |

## MVP 功能

| # | 功能 | 对应页面 |
|---|------|---------|
| F1 | Hero Hook（运行天数 + 任务数） | `/` Landing |
| F2 | 组织全景（30 专家 + 6 层架构图） | `/team` |
| F3 | 能力矩阵（51 技能 + 142 模型） | `/capabilities` |
| F4 | 活动流（24h 时间线 + Git 热力图） | `/activity` |
| F5 | 多页导航系统 | 全局 |

## 技术方案
- 数据层：Python 脚本扫描 workspace → 生成 data.json
- 展示层：Astro + React Islands + Tailwind CSS + GSAP
- 部署层：GitHub Pages（GitHub Actions CI/CD）
- 更新：每日 cron → data.json 更新 → git push → 自动构建部署

## V2 预留（MVP 不含）
- F6 成本透明模块
- F8 响应式移动适配
- F7 专家详情展开

## 历史
- V1-V6 文件已归档至 `_archive_v1-v6/`
