# PROJECT.md — ai-org-showcase V3

## 概述
NDHY AI Agent Team 产品官网 V3。从 V2（平铺罗列式）升级为 V3（电影式叙事，S 级策略）。老板亲自撰写设计方案（design-v3.md），是最高权威文档。

## 目标
- **定位**：产品官网，创造认知震撼，证明 AI 组织化是正在发生的范式转移
- **核心策略**：S 级——不卖，证明。网站本身就是最强证据
- **技术栈**：纯 HTML/CSS/JS，零框架零依赖，单文件 index.html
- **视觉风格**：极致克制，对标 Cognition.ai / Anthropic / Linear

## 品牌参数
- 品牌名：NDHY-AI-TEAM
- 联系邮箱：shibiao1998@gmail.com
- CTA：联系邮件 + GitHub 关注
- 组织规模：1 人类 + Leader + 27 位 AI 专家 = 28 个 AI 角色，43 个专业技能
- 视觉：纯黑白 + 靛蓝强调色 #818cf8

## 核心交付物
1. 7 个叙事区块的单页网站（index.html）
2. GitHub 公开仓库 + README
3. 每日自动更新脚本
4. Docker 化部署方案（Dockerfile + Caddy）

## 执行拓扑（6 Phase 串行链）
```
Phase 1 — 内容文案 v3         📝 技术文档专家
Phase 2 — 交互方案 v3         🎨 体验设计专家
Phase 3 — 视觉规范 + Token    🎨 视觉设计专家
Phase 4 — 前端实现             🖥️ 前端开发专家
Phase 5 — 代码审查             🔍 代码审查专家
Phase 6 — 部署 + GitHub + 自动更新  🚀 部署运维专家
```

## 任务状态

| 任务 | 负责专家 | 状态 | 产出 |
|------|---------|------|------|
| 内容文案 v3 | 📝 技术文档专家 | ✅ done | content-v3.md (7KB) |
| 交互方案 v3 | 🎨 体验设计专家 | ✅ done | experience-design-v3.md |
| 视觉规范 + Token | 🎨 视觉设计专家 | ✅ done | visual-spec-v3.md |
| 前端实现 | 🖥️ 前端开发专家 | ✅ done | index.html (70KB) |
| 代码审查 | 🔍 代码审查专家 | ⏳ pending | — |
| 部署 + GitHub + 自动更新 | 🚀 部署运维专家 | ⏳ pending | — |

## 关键决策
- [2026-03-16] V3 执行启动，6 Phase 串行链（每个 Phase 产出是下游输入）
- [2026-03-16] 区块三"运转揭秘"先用占位数据，最后回填 V3 真实制作数据
- [2026-03-16] Leader 建议区块五第三张剖面图改为"持续进化"，交体验设计专家判断

## 迭代记录
- [2026-03-16] V3 项目启动，项目管理专家接手全流程调度
- [2026-03-16] Phase 4 前端实现完成：index.html 70KB，纯 HTML/CSS/JS 单文件，7 个叙事区块全部实现
- [2026-03-16] UI 设计走查完成：识别 10 个设计问题（3 个致命/2 个重大/4 个中等/1 个轻微），核心问题是"视觉能量密度不足"而非对比度
- [2026-03-16] UI 重设计方案输出：ui-redesign-spec.md (15KB)，覆盖全局 Token 更新 + 7 区块逐一重设计方案 + 可访问性 + 实现优先级
- [2026-03-16] 拓扑图原型输出：prototype-topology.html (31KB)，同心环辐射布局替代网格布局，30 个节点含完整动画序列和 tooltip 交互
