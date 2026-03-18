# Phase 2 审查：交互还原度

> 🎨 体验设计专家 · 2026-03-16
> 基准：experience-design-v4.md

---

## 🔴 阻断项（必须修复）

### 1. ScrollTrigger scrub 未实现（区块②⑥）

设计要求区块②拓扑图使用 GSAP ScrollTrigger `pin + scrub`（滚动距离线性映射节点亮起序列），区块⑥宣言使用 `scrub` 驱动文字逐段淡入。

**实际**：`scroll-setup.ts` 仅初始化 Lenis + 注册 ScrollTrigger 插件，但**无任何 `gsap.to()` / `gsap.timeline()` 调用 scrub 或 pin**。区块②的桌面端 `TopologyGraph.tsx` 节点初始 `opacity: 0.05`，无滚动驱动亮起逻辑。区块⑥全部用 `anim-fade-up` + IO 触发，非 scrub 连续映射。

**影响**：V4 的核心叙事升级（滚动驱动双峰情绪曲线）完全缺失，退化为 V3 的二值触发模式。

### 2. 高潮爆发序列未实现（区块②）

设计要求节点全亮后触发 5 步高潮序列：glow 扩散 → scale-up → 老板节点最后淡入 → 底文弹出 → 第二句淡入，时序精确到 T+0/200/400/800/1300ms。

**实际**：`TopologyGraph.tsx` 所有节点同时渲染、同一 opacity，无亮起序列、无 glow 扩散、无 scale-up、老板节点无"最后出现"逻辑。底文用通用 `anim-scale-spring` 一次性出现。

### 3. pathDraw（路径描边）动画未实现

设计规定 7 种动画中的"路径描边"用于区块②连线：`stroke-dashoffset: length→0`。

**实际**：`TopologyGraph.tsx` 连线为静态 `<line>` 元素，无 `stroke-dasharray` / `stroke-dashoffset` 属性，无描边动画。

---

## 🟡 建议项（应修复）

### 4. glowPulse 动画类未接入

`@keyframes glowPulse` 已定义，但无对应 `.anim-glow-pulse` CSS 类，也未在任何组件中使用。设计要求拓扑节点亮起时有 `drop-shadow` 发光效果。

### 5. slideStagger 动画类未接入

`@keyframes slideStagger` 已定义，`section-triggers.ts` 的 `ANIM_SELECTORS` 中**未包含** `.anim-slide-stagger`。设计要求区块⑤层级数据逐行滑入使用此动画。

### 6. 移动端区块⑥应降级为 IO 触发 ✅ 但桌面端也降级了

设计明确：移动端 ≤767px 用标准 IO 触发（✅ 正确），桌面端 ≥1024px 用 scrub 驱动（❌ 缺失）。当前桌面端也是 IO 触发，失去了文字与滚动位置的连续映射体验。

### 7. Hero 打字机使用 CSS steps 而非 rAF

设计要求 40ms/字（移动端 30ms）的精确打字机效果。实际用 CSS `animation: typewriter 1.6s steps(12)` 模拟——整体时长近似但字间隔不均匀（CSS steps 均分总时长，非逐字控制），且无法实现"光标在最后一个字后停留再消失"的设计细节。功能上可接受，体验上有差距。

### 8. 区块③手风琴用 `hidden` 而非 `grid-template-rows: 0fr→1fr`

设计明确要求用 `grid-rows` 动画替代 V3 的 `max-height` 反模式。实际用 `hidden` 属性切换（无动画过渡），展开/收起瞬间出现/消失，缺少 `--dur-normal` 的平滑过渡。

---

## 🟢 通过项

| 检查点 | 状态 |
|--------|------|
| fadeUp 动画 | ✅ `.anim-fade-up` + IO 触发，参数匹配 |
| blurReveal 动画 | ✅ `.anim-blur-reveal`，blur(8px→0) + translateY |
| scaleSpring 动画 | ✅ `.anim-scale-spring`，scale(0.92→1) + spring 缓动 |
| clipExpand 动画 | ✅ `.anim-clip-expand`，inset(50% 0→0% 0) |
| slideLeft/Right | ✅ 区块④对比双栏错位进入 |
| Lenis 平滑滚动 | ✅ `lerp:0.1, duration:1.2, smoothWheel:true` |
| prefers-reduced-motion CSS 降级 | ✅ `global.css` 全局规则 + Lenis 跳过 + IO 立即 reveal |
| 移动端独立方案 | ✅ 拓扑图垂直分层网格、对比上下堆叠、CTA 全宽按钮 |
| 移动端呼吸点 50vh | ✅ `@media (max-width:767px) { min-height:50vh }` |
| Hero 无 scroll-lock | ✅ V3 scroll-lock 已移除 |
| 下滚箭头呼吸循环 | ✅ `@keyframes breathe` 2s infinite |
| 动效 CSS 变量体系 | ✅ 全部 7 个 dur / 4 个 ease / 3 个 offset 匹配设计 |
| 节点 Hover 交互 | ✅ scale(1.15) + 相邻 dimmed + tooltip |
| 区块⑤一屏一概念 | ✅ 三个 panel 各 min-height:80vh，独立 IO |

---

## 总结

| 级别 | 数量 | 核心问题 |
|------|------|---------|
| 🔴 阻断 | 3 | ScrollTrigger scrub/pin 未实现、高潮爆发序列缺失、pathDraw 缺失 |
| 🟡 建议 | 5 | glowPulse/slideStagger 未接入、手风琴无动画、打字机精度 |
| 🟢 通过 | 14 | 基础动画体系、移动端方案、reduced-motion、设计变量 |

**结论**：CSS 动画层还原度高（6/7 种类型已有 CSS 定义），但 **GSAP 驱动层完全空白**——ScrollTrigger 插件已注册却未创建任何实例。这导致 V4 相对 V3 的三项核心升级（scrub 叙事、高潮爆发、路径描边）均未落地。建议优先补齐区块②和⑥的 GSAP 时间线。
