# V4 完整修复清单

> 老板反馈 10 项 + 6 人审查 7 阻断 + 21 建议 = 汇总去重后的完整修复清单

---

## 🔴 老板反馈（最高优先级）

| # | 问题 | 要求 |
|---|------|------|
| B1 | 背景纯黑太死板 | 高科技感：深色渐变 + 粒子/网格特效 + 光效 |
| B2 | 首页字体普通 | Hero 标题用炫酷科技字体（Orbitron / Rajdhani / Exo 2 等） |
| B3 | 句尾带"。" | 全部去掉句号 |
| B4 | 组织拓扑太暗 | 节点和连线要明亮清晰 |
| B5 | 动画太少没震撼感 | 每个区块入场动画 + 关键区块连续特效 |
| B6 | 专家无交互 | 鼠标悬停弹出专家身份卡片（名字/职位/简介/等级） |
| B7 | 拓扑动画差 | 连线流光 + 节点呼吸脉冲 + Leader 光环 |
| B8 | "切开AI组织"下方空白 | 补充内容 |
| B9 | 动画衔接差 | 内容屏幕中间就要出现，不是快消失才显示 |
| B10 | GitHub 链接错误 | → https://github.com/shibiao1998-dot/ndhy-workspace |

---

## 🔴 审查阻断项

| # | 来源 | 问题 |
|---|------|------|
| R1 | 🎨体验 | GSAP ScrollTrigger scrub/pin 未实现（区块②⑥） |
| R2 | 🎨体验 | 高潮爆发 5 步序列缺失 |
| R3 | 🎨体验 | pathDraw 路径描边动画缺失 |
| R4 | 🎨视觉 | TopologyGraph.tsx 6 裸色常量 + 81 裸色引用 → Token |
| R5 | 🖌️UI | TimelineAccordion.tsx 20+ 处裸 px → Token |
| R6 | 🖌️UI | 按钮/卡片/标签 5 态覆盖缺失 |
| R7 | 🖌️UI | TopologyGraph 桌面端 opacity 0.05 不可见 |

---

## 🟡 审查建议项

| # | 来源 | 问题 |
|---|------|------|
| S1 | 📖叙事 | GitHub 链接为占位符（→ B10 已覆盖） |
| S2 | 📖叙事 | 区块⑤底文"这不是规划…"非原文，确认是否保留 |
| S3 | 🎨体验 | glowPulse 动画类未接入 |
| S4 | 🎨体验 | slideStagger 动画类未接入 |
| S5 | 🎨体验 | 桌面端区块⑥也降级为 IO（应 scrub）→ R1 已覆盖 |
| S6 | 🎨体验 | Hero 打字机用 CSS steps 非 rAF |
| S7 | 🎨体验 | 手风琴用 hidden 非 grid-rows 动画 |
| S8 | 🎨视觉 | 38/125 Token 已定义未消费 |
| S9 | 🎨视觉 | 断点 Token 未通过 var() 消费（CSS 限制） |
| S10 | 🎨视觉 | 1 处 4px 裸间距值 |
| S11 | 🖌️UI | 响应式缺 768px 和 1440px 断点 |
| S12 | 🖌️UI | 全局 focus-visible 样式未定义 |
| S13 | 🖌️UI | 键盘导航缺陷（timeline header 非 button） |
| S14 | 🖌️UI | 对比栏断点偏差（应 768px 不是 1024px） |
| S15 | 🏛️架构 | GSAP 引入但实际未驱动动画 → R1 已覆盖 |
| S16 | 🏛️架构 | Typewriter/ContactButton 组件缺失 |
| S17 | 🏛️架构 | TimelineAccordion 未以 React Island 挂载 |
| S18 | 🔍代码 | IntersectionObserver 重复创建（4 处 DRY 违规） |
| S19 | 🔍代码 | S5 无降级 fallback（JS 失败内容不可见） |
| S20 | 🔍代码 | TopologyGraph 无滚动触发 → R7 已覆盖 |
| S21 | 🔍代码 | 事件监听清理不完整 |

---

## 去重后实际待修复项

去掉重复覆盖（S1=B10, S5=R1, S15=R1, S20=R7），实际 **33 项**：
- 老板反馈：10 项
- 审查阻断：7 项（部分与老板反馈重合）
- 审查建议：16 项独立项
