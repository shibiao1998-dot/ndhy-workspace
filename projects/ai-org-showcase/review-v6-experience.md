# 🎨 V6 官网体验设计走查报告 — S3-S7

> 🎨 体验设计专家 · 2026-03-18
>
> 走查范围：S3 TimelineSection → S7 CtaSection（含 BreathingPoint 过渡层）
>
> 设计参照：`design-v6-animation.md` + `design-v6-visual.md`
>
> 老板反馈："感觉有点奇怪，并且很生硬，不够丝滑和流畅"

---

## 一、综合评估

| 维度 | 评分 | 状态 |
|------|------|------|
| 滚动叙事节奏 | 2/5 | 🔴 |
| Section 过渡 | 1/5 | 🔴 |
| 入场时间线 | 3/5 | 🟡 |
| 动效连贯性 | 2/5 | 🔴 |
| 性能隐患 | 3/5 | 🟡 |

**总体判断**：老板说"生硬"完全正确。根本原因不是单个动画不好——单个 Section 的入场动画基本按设计文档实现了——而是**Section 之间的过渡动画完全缺失**，加上 **Lenis 和 GSAP ScrollTrigger 的 snap 冲突**导致滚动体验不自然。整体像是"7 个独立页面拼在一起"而非"一段流畅的视觉叙事"。

---

## 二、逐 Section 走查

### S3 TimelineSection — 数据流瀑布

**体验评分：3/5** 🟡

| 维度 | 设计文档要求 | 实际代码实现 | 状态 |
|------|-------------|-------------|------|
| 代码雨 Canvas | 40 列桌面 / 15 列移动端，bright head + dim trail | ✅ 完整实现，参数匹配 | 🟢 |
| 标题入场 | scrub 0.03, blur(6px)→clear | ✅ `section-triggers.ts` L136-137 匹配 | 🟢 |
| 轨道延伸 | scrub 0.08, height 0%→100% | ✅ L138-139 匹配 | 🟢 |
| 卡片交替飞入 | 奇数左 / 偶数右，fromX ±60 | ✅ L142-146 匹配 | 🟢 |
| 卡片入场闪光 | boxShadow S3_GLOW → S3_GLOW_DIM | ✅ L147 匹配 | 🟢 |
| pin + scrub | end: '+=200%', scrub: 0.8 | ✅ L129 匹配 | 🟢 |

**具体问题**：

1. **🟡 S3 没有 `section--snap` 类**：S3 的 `<section>` 只有 `class="section timeline-v6"`，而 S4-S7 都有 `section--snap`。虽然 GSAP 加载后会禁用 CSS snap（`disableCSSSnap()`），但在 JS 加载前的 FOUC 阶段，S3 不会被 snap 捕获，而 S4-S7 会。这会导致**首屏加载时的滚动行为不一致**。

2. **🟡 min-height 不对**：设计文档要求所有 Section 为 `100vh`，但 S3 没有显式设置 `height: 100vh`（而是依赖 GSAP pin），在 pin 之前会出现高度不确定的瞬间。

3. **🟡 轨道头部动画缺失视觉锚点**：trackHead 初始 `opacity: 0`，但 GSAP 设置的 `fromTo` 里 from 是 `opacity: 1`，存在闪烁风险——初始 CSS 隐藏了它，GSAP 又瞬间设为 1。

---

### BreathingPoint — 情绪留白

**体验评分：2/5** 🔴

**问题**：

1. **🔴 破坏分页节奏**：BreathingPoint 是一个 60vh 的非全屏 Section，插在 S3 和 S4 之间。设计文档定义的是 **7 个 100vh Section** 的全屏分页模式，BreathingPoint 的存在直接破坏了这个结构——它不是 100vh、没有 `section--snap`、没有 GSAP pin，导致在滚动过程中出现一个"自由浮动"的区域。用户从 S3 滚出后不会干净地 snap 到 S4，而是经过一个不受控的过渡区域，**这就是"奇怪"感的重要来源**。

2. **🟡 动画过于简单**：仅使用 `anim-blur-reveal` CSS transition，与 S3 和 S4 的 GSAP scrub 精度动画形成体感断裂。

---

### S4 ContrastSection — 双色场碰撞

**体验评分：3/5** 🟡

| 维度 | 设计文档要求 | 实际代码实现 | 状态 |
|------|-------------|-------------|------|
| 双色场背景 | 红蓝 radial-gradient | ✅ CSS 匹配 | 🟢 |
| 标题入场 | scrub 0.03 | ✅ `section-triggers.ts` L169 匹配 | 🟢 |
| 左栏滑入 | x:-80, blur(6px), scrub 0.10 | ✅ L172-173 匹配 | 🟢 |
| 左栏入场红闪 | boxShadow 40px→10px | ✅ L174 匹配 | 🟢 |
| VS 弹性爆发 | elastic.out(1, 0.4), scrub 0.22 | ✅ L177 匹配 | 🟢 |
| 右栏滑入 | x:80, scrub 0.30 | ✅ L180-181 匹配 | 🟢 |
| 标签弹出 | back.out(2), stagger 0.02 | ✅ L185 匹配 | 🟢 |
| 碰撞中线 | clashFlicker 动画 | ⚠️ CSS 有但初始 `display: none`（仅桌面），且 GSAP 动画 opacity 0→1 | 🟡 |
| 碰撞火花粒子 | 40 颗，从中线向两侧爆裂 | ❌ **完全未实现** | 🔴 |
| 扫描线逐行揭示 | `comparison__scanline` + clip-path | ❌ **完全未实现** — DOM 中无 `.comparison__scanline` 元素 | 🔴 |

**具体问题**：

1. **🔴 碰撞火花粒子系统缺失**：设计文档定义了 `.comparison__clash-particles`（40 颗，中线爆裂），代码中完全没有。这是 S4 区块的"碰撞感"核心视效。

2. **🔴 扫描线揭示效果缺失**：设计文档定义了对比内容从顶部向下逐行揭示的 `clip-path` + 扫描线追踪，代码中没有实现。当前是直接从 `opacity:0` 淡入。

3. **🟡 步骤元素使用了 IntersectionObserver stagger**（`observeWithStagger`），而不是 GSAP scrub。这与同一 Section 内其他元素的 scrub 驱动不一致——column 的 scrub 到位后，steps 可能还没触发 IO，导致**双重动画节奏**（scrub 精准控制 + IO 粗略触发混用）。

4. **🟡 移动端布局改为纵向时，VS 分隔器的双圈脉冲动画视觉尺寸过大**（`inset: -20px` 和 `-35px` 在窄屏占比过高）。

---

### S5 ArchSection — 蓝图透视

**体验评分：3/5** 🟡

| 维度 | 设计文档要求 | 实际代码实现 | 状态 |
|------|-------------|-------------|------|
| 蓝图网格底纹 | 80px/20px 双层网格 | ✅ CSS 匹配 | 🟢 |
| X光扫描线 | top 0%→100%, scrub 0.10-0.60 | ✅ `section-triggers.ts` L202 匹配 | 🟢 |
| Panel A 展开 | scrub 0.15 | ✅ L205-207 匹配 | 🟢 |
| Panel A 蓝图→填充过渡 | borderColor + background 变化 | ⚠️ 仅 borderColor + boxShadow，无 background 过渡 | 🟡 |
| Panel B/C 展开 | scrub 0.30/0.45 | ✅ L209-210 匹配 | 🟢 |
| 层级间光纤连接 | SVG stroke-dashoffset 画线 | ❌ **完全未实现** — DOM 中无 `.architecture__fiber` | 🔴 |
| 光纤流光 | `.architecture__fiber-glow` | ❌ **完全未实现** | 🔴 |
| Panel 内容淡入（单独于 Panel） | 每个 Panel 内部 .architecture__content 淡入 | ❌ Panel 整体淡入，未拆分内部子时间线 | 🟡 |

**具体问题**：

1. **🔴 光纤连接动画缺失**：设计文档定义了 Panel 之间的 SVG 光纤连接线（`stroke-dashoffset` 画线 + 流光动画），这是 S5 "蓝图透视"概念的核心视觉之一。代码中完全没有。

2. **🟡 Panel 展开从"蓝图轮廓"到"填充面板"的过渡不完整**：设计文档要求 Panel 初始为 `background: transparent` + `border: blueprint color`，扫描后变为 `background: surface` + `border: accent`。代码中的 Panel 初始就有 `glass-bg` 背景，仅 `is-visible` 时改 border 和 shadow，丢失了"从线框到实体"的戏剧性转变。

3. **🟡 三个 Panel 每个占 80vh，总计 240vh 内容**。设计文档定义 S5 的 `pinDuration: '+=150%'`，但 3 个 80vh Panel + intro 的实际内容高度远超一屏。**在 pin 模式下，用户滚动 150% 的距离要看完全部 3 个 Panel + intro，scrub 节奏可能过紧。**

4. **🟡 Intro 文字使用 `anim-fade-up` class + IO**（`<script>` 中 `createObserver`），但同一 Section 的 GSAP timeline 也给 introLines 做了 `fromTo` 动画。**双重动画源**可能导致闪烁或冲突。

---

### S6 VisionSection — 墨水光晕

**体验评分：4/5** 🟡

| 维度 | 设计文档要求 | 实际代码实现 | 状态 |
|------|-------------|-------------|------|
| 背景光晕呼吸 | `auraBreathe` 6s infinite | ✅ CSS 匹配 | 🟢 |
| 文字墨水凝聚 | blur(15px) + scale(1.05) → clear, scrub | ✅ `section-triggers.ts` L241-246 匹配 | 🟢 |
| 高潮句能量爆发 | flash + blur(20px)→clear + expo.out | ✅ L232-235 匹配 | 🟢 |
| 背景光晕高潮增强 | scale 1→1.3, opacity 0.5→1 | ✅ L236 匹配 | 🟢 |
| 冲击波圆环扩散 | `.vision__shockwave` 600px | ⚠️ CSS `::after` 有 shockwave keyframe，但 GSAP 未触发 `--burst` class | 🟡 |
| 余韵消散 | bgAura scale→1, opacity→0.4, scrub 0.85 | ✅ L249 匹配 | 🟢 |
| pin + scrub 250% | scrub 1.0 | ✅ L222 匹配 | 🟢 |
| 光晕粒子 | 50 颗柔和模糊圆，缓慢扩散 | ❌ **未实现** | 🟡 |
| Flash overlay 闪烁 | opacity 0→0.15→0 | ✅ L230-231 匹配 | 🟢 |

**具体问题**：

1. **🟡 冲击波未被触发**：CSS 定义了 `.vision-v6__climax.--burst::after` 的 shockwave 动画，但 GSAP timeline 中没有 `classList.add('--burst')` 的操作。设计文档中这一步是 `tl.add(() => { document.querySelector('.vision__climax')?.classList.add('--burst'); }, 0.6);`，代码漏掉了。高潮时刻缺少冲击波视效。

2. **🟡 桌面端 GSAP 接管后，移除了 `anim-fade-up` 和 `anim-blur-reveal` class**（L227），但如果 `matchMedia` 在 resize 时切换，class 已被移除不会恢复。这是一个 edge case 但值得注意。

3. **🟢 整体实现是所有 Section 中最接近设计文档的**。墨水凝聚效果的 scrub 映射自然，文字逐行淡入的节奏合理。

---

### S7 CtaSection — 能量收束

**体验评分：2/5** 🔴

| 维度 | 设计文档要求 | 实际代码实现 | 状态 |
|------|-------------|-------------|------|
| 收束粒子系统 | 80 颗，边缘→中心螺旋，Canvas | ❌ **完全未实现** | 🔴 |
| 能量场背景 | `fieldConverge` 呼吸动画 | ✅ CSS 匹配 | 🟢 |
| 品牌名聚合显现 | scale 1.3→1, blur 15→0, letterSpacing 0.3em→normal, dur 1.2s | ❌ 仅使用 `anim-fade-up` (简单 translateY + blur 4px)，**完全缺失聚合效果** | 🔴 |
| 关键数据 CountUp | gsap innerText snap 驱动 | ❌ **未实现** — 数据是纯文本 | 🔴 |
| CTA 按钮弹性弹出 | elastic.out(1, 0.5), scale 0.8→1 | ❌ 仅使用 `anim-fade-up` | 🔴 |
| 磁性吸附效果 | MagneticButton class | ❌ **未实现** | 🟡 |
| 按钮悬浮光晕 | `buttonFloat` 3s infinite | ✅ CSS 匹配 | 🟢 |
| pin 模式 | toggleActions 自动播放 | ❌ 无 GSAP ScrollTrigger，仅 IO | 🔴 |

**具体问题**：

1. **🔴 没有 GSAP ScrollTrigger**：S7 在 `section-triggers.ts` 中**完全没有初始化函数**（只有 S2-S6 的 init）。所有入场动画退化为 `createObserver` + CSS class transition。这与 S2-S6 的精确 scrub 控制形成了**巨大的体验断层**。

2. **🔴 品牌名聚合效果缺失**：设计文档定义了从 `letterSpacing: 0.3em` + `blur(15px)` + `brightness(2)` 聚合为清晰文字的 1.2s 动画。代码中只是一个简单的 fadeUp。

3. **🔴 收束粒子系统缺失**：这是 S7 的核心视觉锚点——从四周向中心聚拢的粒子。没有它，S7 看起来就是一个普通的 CTA 页面。

4. **🔴 CountUp 数据动画缺失**：设计文档定义了 `gsap.to(el, { innerText: target, snap: { innerText: 1 } })` 的数字滚动效果。代码中数据直接以静态文本呈现。

5. **🟡 S7 的 `section--snap` class 在 CSS 中生效**（GSAP 加载前），但**S7 没有 GSAP pin**，所以在 GSAP 接管后 S7 是唯一一个既没有 CSS snap 也没有 GSAP pin 的 Section，滚动到 S7 时没有"定格"感。

---

## 三、Section 间过渡走查

**这是本次走查发现的最核心问题，也是老板反馈"生硬"的根本原因。**

### 3.1 过渡实现情况总表

| 过渡 | 设计文档效果 | 代码实现 | 状态 |
|------|-------------|---------|------|
| T1: S1→S2 | 渐隐+缩放沉入 | ❌ 无 | 🔴 |
| T2: S2→S3 | 水平平移推入 | ❌ 无 | 🔴 |
| T3: S3→S4 | 垂直分裂 | ❌ 无 | 🔴 |
| T4: S4→S5 | 色场消融 | ❌ 无 | 🔴 |
| T5: S5→S6 | 光线穿透 | ❌ 无 | 🔴 |
| T6: S6→S7 | 能量聚合 | ❌ 无 | 🔴 |
| TransitionOrchestrator | 统一过渡管理 | ❌ 无 | 🔴 |

**6 个过渡动画全部缺失。** 设计文档中定义了完整的 `TransitionOrchestrator` 和 6 条独立的 GSAP timeline（T1-T6），每个都有详细的离场/入场参数。代码中没有任何一个过渡被实现。

### 3.2 实际滚动体验

当前的滚动体验是：
1. S2 pin 结束 → 瞬间跳到 S3 区域（S3 有自己的 pin）
2. S3 pin 结束 → 经过 BreathingPoint 自由区域 → 到达 S4
3. S4 pin 结束 → 瞬间跳到 S5
4. S5 pin 结束 → 瞬间跳到 S6
5. S6 pin 结束 → 自由滚动到 S7

每次 pin 结束到下一个 pin 开始之间，用户体验到的是**内容的突然切换**——上一个 Section 的 unpin 和下一个 Section 的 pin 之间没有视觉过渡，就像 PPT 的"无过渡"模式。

### 3.3 BreathingPoint 的位置问题

BreathingPoint 原本设计为 S3 和 S4 之间的"情绪留白"，但在全屏分页系统中，它破坏了分页节奏：
- 它是 60vh，不是 100vh
- 没有 pin，没有 snap
- 在 GSAP pin 区域之间制造了一个"自由滚动地带"
- 用户从 S3 的精确 scrub 控制中出来，突然进入自由滚动，再进入 S4 的 scrub 控制——**这个节奏断裂正是"生硬"感的直接体验**

---

## 四、动效连贯性分析

### 4.1 叙事弧线评估

设计文档的色彩叙事弧线：冷蓝开场 → 靛蓝金 → 青绿 → 红蓝碰撞 → 蓝紫 → 多彩 → 品牌收束。

代码实现了色彩 Token，但由于**过渡缺失**，色调切换是突变的而非渐变的。用户感受不到叙事弧线，只感受到"每个页面颜色不同"。

### 4.2 动画语言一致性

| 问题 | 详情 |
|------|------|
| **双重动画系统** | S3-S6 使用 GSAP scrub，但 S7 和 BreathingPoint 使用 IO + CSS class。两种系统的时序精度和体感完全不同 |
| **IO 与 GSAP 混用** | S4 的 steps 用 `observeWithStagger`（IO），而 column 用 GSAP scrub。S5 的 introLines 同时被 IO observer 和 GSAP timeline 控制 |
| **缺乏统一的退场动画** | 所有 Section 只有入场动画，没有退场动画。当 pin 结束后，内容直接保持在最终状态，没有任何离场处理 |

### 4.3 滚动进度指示器

设计文档定义了右侧的滚动进度指示器（dot + track + labels），**代码中完全没有实现**。缺少它，用户不知道自己在页面的哪个位置、还有多少内容，加剧了"迷路感"。

### 4.4 鼠标跟随光效

设计文档定义了 `CursorGlow` 鼠标跟随光斑 + 区块切换时光斑颜色变化，**代码中未实现**。这是营造"页面活着"的重要元素。

### 4.5 键盘导航

设计文档定义了 PageUp/PageDown/方向键翻页，**代码中未实现**。无障碍体验缺失。

---

## 五、性能隐患分析

### 5.1 Lenis + GSAP ScrollTrigger + CSS Scroll Snap 三者冲突

**🔴 这是一个严重的架构冲突。**

当前代码同时使用了三套滚动控制系统：

| 系统 | 作用 | 加载时机 |
|------|------|---------|
| CSS `scroll-snap-type: y mandatory` | 原生滚动吸附 | 立即（CSS） |
| Lenis | 平滑滚动（自定义 lerp 插值） | DOMContentLoaded |
| GSAP ScrollTrigger (pin + scrub) | 钉住 + 动画 | DOMContentLoaded |

**冲突链**：

1. **CSS snap vs Lenis**：Lenis 通过劫持 scroll 事件来实现平滑滚动。CSS `scroll-snap-type: y mandatory` 会在 Lenis 的插值滚动过程中强制 snap，导致滚动卡顿——Lenis 想平滑滚到某个位置，snap 会强制跳到最近的 snap 点。

2. **CSS snap vs GSAP pin**：GSAP ScrollTrigger 的 `pin: true` 会在 Section 前后插入 spacer 元素来维持页面高度。CSS snap 的 snap 点是基于原始 DOM 位置计算的，pin spacer 会破坏 snap 点计算。

3. **代码修补**：`disableCSSSnap()` 在 GSAP 加载后移除 CSS snap（`scrollSnapType = 'none'`），但这只是**局部修补**——在 JS 加载前，CSS snap 是激活状态。而且代码中 `.section--snap` 类还设置了 `height: 100vh; overflow: hidden`，这些样式在 snap 被禁用后仍然生效，可能导致**S5 的 3 个 80vh Panel 被截断**（因为 `.section--snap` 限制了 `overflow: hidden`）。

4. **Lenis 与 ScrollTrigger pin 的同步**：`scroll-setup.ts` 中用 `lenis.on('scroll', ScrollTrigger.update)` 同步，这是标准做法。但设计文档明确说 **"❌ 不推荐 Lenis"** —— "自定义滚动库会与 `scroll-snap` 冲突"。虽然 CSS snap 被禁用了，但 Lenis 的 lerp 插值会让 ScrollTrigger 的 scrub 进度不是线性的，可能导致动画"过冲"或"拖尾"。

### 5.2 Canvas 性能

S3 的 Code Rain 是目前唯一的 Canvas 动画。实现基本合理：
- ✅ `requestAnimationFrame` 驱动
- ✅ 移动端减半列数
- ✅ `reduced-motion` 检测
- ⚠️ 没有实现 `IntersectionObserver` 暂停——S3 不可见时 Canvas 仍在渲染

### 5.3 `will-change` 缺失

设计文档要求对 `.section` 等需要 GPU 合成的元素声明 `will-change: transform, opacity`，并在动画结束后移除。代码中没有使用 `will-change`。对于多层 `backdrop-filter: blur()` 的毛玻璃面板，缺少 GPU 提示可能导致帧率下降。

### 5.4 设备能力降级

设计文档定义了 4 级降级策略（Level 0-3），代码中仅实现了 `prefers-reduced-motion` 检测（Level 0）。Level 1（移动端精简）和 Level 2（运行时降级）未实现。

---

## 六、问题汇总与修复优先级

### 🔴 阻断问题（必须修复才能交付）

| # | 问题 | 影响 | 位置 | 修复建议 |
|---|------|------|------|---------|
| **P0-1** | **6 个 Section 过渡动画全部缺失** | 老板"生硬"反馈的根因。Section 之间是硬切，无视觉衔接 | 缺少 `transition-orchestrator.ts` | 按设计文档实现 T1-T6 + TransitionOrchestrator。最低限度可先实现统一的淡入淡出过渡，再逐步升级为设计文档的独立效果 |
| **P0-2** | **Lenis 与 GSAP pin/scrub 的滚动体验冲突** | 滚动不自然、scrub 动画过冲或拖尾 | `scroll-setup.ts` | 移除 Lenis，改用 GSAP ScrollTrigger 原生滚动。设计文档明确建议不用 Lenis |
| **P0-3** | **BreathingPoint 破坏分页节奏** | S3→S4 之间出现节奏断裂，自由滚动区域导致不可控体验 | `index.astro` + `BreathingPoint.astro` | 方案 A：将 BreathingPoint 内容整合到 S3 或 S4 中。方案 B：将 BreathingPoint 改为 100vh + GSAP pin 的标准 Section。方案 C：移除 BreathingPoint，用 T3 过渡动画替代留白效果 |
| **P0-4** | **S7 完全没有 GSAP 动画** | 终章体验严重不足，与前面 Section 的精度差距巨大 | `section-triggers.ts` | 新增 `initS7ScrollTrigger()`，实现品牌名聚合、数据 CountUp、按钮弹性弹出 |

### 🟡 建议改进（提升体验但不阻断交付）

| # | 问题 | 影响 | 位置 | 修复建议 |
|---|------|------|------|---------|
| **P1-1** | S4 碰撞火花粒子缺失 | S4 "碰撞感"减弱 | S4ContrastSection | 实现 Canvas 粒子系统，40 颗从中线爆裂 |
| **P1-2** | S5 光纤连接动画缺失 | S5 "蓝图透视"概念不完整 | S5ArchSection | 实现 SVG 光纤线 + 流光动画 |
| **P1-3** | S7 收束粒子系统缺失 | S7 终章缺少视觉锚点 | S7CtaSection | 实现 Canvas 收束粒子（80 颗，边缘→中心） |
| **P1-4** | 滚动进度指示器缺失 | 用户不知道位置和进度 | 新组件 | 实现右侧 dot + track 进度指示器 |
| **P1-5** | S6 冲击波未触发 | 高潮时刻缺少冲击波视觉 | `section-triggers.ts` | 在 climax 的 GSAP 时间线中添加 `classList.add('--burst')` |
| **P1-6** | S5 Panel "蓝图→填充"过渡不完整 | 丢失 X 光扫描揭示的戏剧性 | S5ArchSection + triggers | Panel 初始 background 设为 transparent，扫描后才填充 |
| **P1-7** | S4 步骤元素使用 IO 而非 GSAP | 同一 Section 内双重动画系统 | S4 `<script>` | 迁移到 GSAP timeline 内的 stagger 动画 |
| **P1-8** | S5 introLines 双重动画源 | IO 和 GSAP 同时控制可能冲突 | S5 `<script>` + triggers | 移除 S5 script 中的 IO observer，仅用 GSAP |

### 🟢 通过

| 项目 | 说明 |
|------|------|
| S3 代码雨 Canvas | 参数匹配设计文档，视觉效果好 |
| S3 卡片交替飞入 | scrub 节奏自然 |
| S4 VS 弹性爆发 | `elastic.out` 效果准确 |
| S5 蓝图网格底纹 | CSS 完整匹配 |
| S6 墨水凝聚效果 | 逐行 scrub 最接近设计文档 |
| S6 背景光晕呼吸 | CSS 动画流畅 |
| S7 按钮悬浮光晕 | CSS `buttonFloat` 效果好 |
| 全局 V6 色彩 Token | 全部定义正确 |
| CSS keyframe 定义 | 所有 V6 keyframes 都已定义 |
| `reduced-motion` 检测 | 完整的无障碍降级 |

---

## 七、修复优先级排序

```
Phase 1 — "消除生硬感"（核心体验修复）
  ├─ P0-2: 移除 Lenis，回归原生滚动 + GSAP 原生 snap
  ├─ P0-3: 解决 BreathingPoint 的分页破坏
  ├─ P0-1: 实现 Section 间过渡动画（至少统一淡入淡出）
  └─ P0-4: S7 GSAP 入场动画

Phase 2 — "补齐视觉"（核心特效补全）
  ├─ P1-5: S6 冲击波触发
  ├─ P1-6: S5 蓝图→填充过渡
  ├─ P1-7: S4 IO→GSAP 迁移
  └─ P1-8: S5 双重动画源修复

Phase 3 — "视觉升级"（粒子系统 + 交互增强）
  ├─ P1-1: S4 碰撞火花粒子
  ├─ P1-2: S5 光纤连接
  ├─ P1-3: S7 收束粒子
  └─ P1-4: 滚动进度指示器

Phase 4 — "打磨细节"（交互增强）
  ├─ 鼠标跟随光效
  ├─ 键盘导航
  ├─ 磁性吸附按钮
  └─ 设备能力降级
```

---

## 八、老板反馈定位

> "感觉有点奇怪，并且很生硬，不够丝滑和流畅"

**"奇怪"** → Lenis + CSS Snap + GSAP pin 三者冲突导致滚动行为不可预测；BreathingPoint 在分页系统中制造了节奏异常。

**"生硬"** → 6 个 Section 间过渡动画全部缺失，内容是硬切换；S7 退化为简单 IO 动画与前面 Section 的 GSAP scrub 精度形成落差。

**"不够丝滑和流畅"** → Lenis 的 lerp 插值与 GSAP scrub 的交互导致动画响应不线性；没有统一的退场动画导致每个 Section 的入场是"从无到有"而非"从上一个场景自然演变"。

---

_🎨 体验设计专家 · V6 走查完成。核心结论：单个 Section 的入场动画实现度约 70%，但 Section 间的过渡是 0% 实现——这是"生硬"体验的根本原因。修复 Phase 1（移除 Lenis + 解决 BreathingPoint + 实现过渡 + S7 动画）预计可消除 80% 的"生硬感"。_
