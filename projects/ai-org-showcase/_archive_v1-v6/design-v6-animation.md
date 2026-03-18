# design-v6-animation.md — V6 全站动效升级方案

> 🎨 体验设计专家产出 · 2026-03-17
>
> 基于：design-v6-visual.md（V6 视觉特效方案）
>
> 职责：**动效编排、分页系统、区块过渡、入场时间线、交互增强、技术实现**。
> 视觉层（粒子/光效/纹理）已由视觉方案定义，本文档聚焦**时间维度**——什么时候动、怎么动、动多久。

---

## 一、全站分页系统

### 1.1 核心方案：CSS Scroll Snap + GSAP ScrollTrigger 双轨协同

全站采用 **7 个 100vh Section** 的全屏分页模式。用户每次滚动精确定位到一个完整区块，不会停在两个区块之间。

**为什么双轨？**
- `scroll-snap` 提供原生级的滚动吸附体验（浏览器级 60fps，触摸惯性自然）
- GSAP ScrollTrigger 提供 `pin`（钉住）和 scrub 驱动的入场动画
- 两者不冲突：snap 管"停在哪"，ScrollTrigger 管"停下后播什么"

#### 1.1.1 CSS Scroll Snap 配置

```css
/* ── 全局滚动容器 ── */
html {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  scroll-behavior: smooth;
  /* 避免 Safari 弹性滚动干扰 snap */
  overscroll-behavior-y: none;
}

/* ── 每个 Section 锁定 ── */
.section {
  scroll-snap-align: start;
  scroll-snap-stop: always;     /* 强制停顿，不允许快速滑过 */
  min-height: 100vh;
  height: 100vh;                /* 精确锁定 */
  overflow: hidden;             /* 内容溢出裁剪 */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 移动端 Safari 视口修正 ── */
@supports (height: 100dvh) {
  .section {
    height: 100dvh;
    min-height: 100dvh;
  }
}
```

#### 1.1.2 GSAP ScrollTrigger Pin 配合

每个 Section 被 ScrollTrigger pin 住，在 pin 期间播放入场动画时间线。用户滚入一个区块后，区块钉在视口中，动画播完才允许继续滚动。

```typescript
// ── 全局 ScrollTrigger 配置 ──
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// 每个 Section 的 pin + 动画注册
const SECTIONS = [
  { id: 'hero',         pinDuration: '+=100%',  scrub: false },
  { id: 'topology',     pinDuration: '+=150%',  scrub: true  },
  { id: 'timeline',     pinDuration: '+=200%',  scrub: true  },
  { id: 'comparison',   pinDuration: '+=150%',  scrub: true  },
  { id: 'architecture', pinDuration: '+=150%',  scrub: true  },
  { id: 'vision',       pinDuration: '+=250%',  scrub: true  },
  { id: 'cta',          pinDuration: '+=100%',  scrub: false },
];

SECTIONS.forEach(({ id, pinDuration, scrub }) => {
  const section = document.querySelector(`#${id}`);
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: pinDuration,
    pin: true,
    pinSpacing: true,
    scrub: scrub ? 0.8 : false,
    // snap 与 pin 协同：pin 结束后自动对齐下一个 section
    snap: {
      snapTo: 1,
      duration: { min: 0.3, max: 0.6 },
      ease: 'power2.inOut',
    },
    onEnter: () => activateSectionAnimations(id),
    onLeave: () => deactivateSectionAnimations(id),
    onEnterBack: () => activateSectionAnimations(id),
    onLeaveBack: () => deactivateSectionAnimations(id),
  });
});
```

#### 1.1.3 Scroll Snap 与 ScrollTrigger 冲突规避

CSS `scroll-snap-type: y mandatory` 和 GSAP ScrollTrigger `pin` 同时使用时存在已知冲突（pin 会插入 spacer 元素，破坏 snap 点计算）。解决方案：

```typescript
// 方案：让 GSAP 接管 snap，禁用 CSS snap
// 在 GSAP 初始化后，移除 CSS scroll-snap
function initScrollSystem() {
  // Step 1: CSS snap 作为 fallback（JS 未加载时仍可用）
  // Step 2: GSAP 加载后接管
  document.documentElement.style.scrollSnapType = 'none';

  // GSAP ScrollTrigger 全局 snap 配置
  ScrollTrigger.defaults({
    snap: {
      snapTo: 'labels',        // snap 到 timeline label
      duration: { min: 0.3, max: 0.8 },
      delay: 0.1,
      ease: 'power2.inOut',
    },
  });
}
```

#### 1.1.4 移动端触摸兼容

```typescript
// ── 触摸优化 ──
const TOUCH_CONFIG = {
  // 触摸灵敏度（多少 px 位移触发翻页）
  swipeThreshold: 50,
  // 触摸方向锁定（防止斜向滑动误触发）
  directionLock: true,
  directionLockThreshold: 10,
  // 惯性滚动控制
  inertia: {
    enabled: true,
    resistance: 0.85,          // 惯性衰减系数
    maxVelocity: 3000,         // 最大速度 px/s
  },
  // 防止过快翻页（翻页冷却时间）
  cooldown: 800,               // ms — 翻页后 800ms 内不响应下一次
};

let lastScrollTime = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastScrollTime < TOUCH_CONFIG.cooldown) return;

  const deltaY = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(deltaY) < TOUCH_CONFIG.swipeThreshold) return;

  const direction = deltaY > 0 ? 1 : -1; // 1 = 下翻, -1 = 上翻
  scrollToSection(currentSection + direction);
  lastScrollTime = now;
}, { passive: true });

// 编程式翻页
function scrollToSection(index: number) {
  const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
  const target = document.querySelector(`#${SECTIONS[clamped].id}`);
  if (target) {
    gsap.to(window, {
      scrollTo: { y: target, autoKill: false },
      duration: 0.8,
      ease: 'power2.inOut',
    });
    currentSection = clamped;
  }
}
```

### 1.2 滚动状态机

整个分页系统由一个有限状态机驱动，确保动画播放、翻页锁定、输入响应的一致性。

```
┌─────────┐  滚动/滑动/键盘  ┌──────────┐   动画播完   ┌────────┐
│  IDLE   │ ───────────────→ │ ANIMATING │ ──────────→ │ LOCKED │
│ (等待)  │                   │ (播放中)  │              │ (锁定) │
└─────────┘                   └──────────┘              └────────┘
     ↑                                                       │
     └───────────── cooldown 结束（800ms）─────────────────────┘
```

```typescript
type ScrollState = 'IDLE' | 'ANIMATING' | 'LOCKED';

class ScrollStateMachine {
  state: ScrollState = 'IDLE';
  currentSection = 0;

  canScroll(): boolean {
    return this.state === 'IDLE';
  }

  startTransition(targetSection: number) {
    if (!this.canScroll()) return;
    this.state = 'ANIMATING';
    this.currentSection = targetSection;
    // 播放过渡动画 + 入场动画
    playTransition(this.currentSection, () => {
      this.state = 'LOCKED';
      setTimeout(() => { this.state = 'IDLE'; }, TOUCH_CONFIG.cooldown);
    });
  }
}
```

---

## 二、区块间过渡动画

7 个区块构成 6 对相邻过渡。每对过渡设计独立效果，呼应前后区块的视觉语调变化。

### 2.1 过渡总览表

| 过渡 | 离场区块 | 入场区块 | 过渡效果 | 时长 | 缓动 |
|------|---------|---------|---------|------|------|
| T1 | S1 Hero | S2 拓扑图 | **渐隐+缩放沉入** — 星空缩远，拓扑浮现 | 1.0s | `power2.inOut` |
| T2 | S2 拓扑图 | S3 时间线 | **水平平移推入** — 拓扑左推出，时间线右推入 | 0.8s | `power3.out` |
| T3 | S3 时间线 | S4 对比 | **垂直分裂** — 时间线从中线上下分裂，对比从裂缝中显现 | 1.0s | `expo.out` |
| T4 | S4 对比 | S5 架构 | **色场消融** — 红蓝双色场碎裂溶解为蓝紫蓝图线条 | 1.2s | `power2.inOut` |
| T5 | S5 架构 | S6 愿景 | **光线穿透** — 蓝图线条化为光线射出，汇聚成愿景文字 | 1.0s | `expo.inOut` |
| T6 | S6 愿景 | S7 CTA | **能量聚合** — 愿景光晕收缩为一点，爆开为 CTA 能量场 | 1.2s | `power4.out` |

### 2.2 各过渡详细参数

#### T1：S1→S2 — 渐隐+缩放沉入

星空深渊缩远变暗，全息拓扑网络从深处浮现。

```typescript
const T1_TRANSITION = gsap.timeline({ paused: true });

// S1 离场：整体缩小 + 淡出
T1_TRANSITION
  .to('#hero', {
    scale: 0.85,
    opacity: 0,
    filter: 'blur(8px)',
    duration: 1.0,
    ease: 'power2.inOut',
  }, 0)
  // S2 入场：从 scale(1.15) 放大状态缩回正常 + 淡入
  .fromTo('#topology', {
    scale: 1.15,
    opacity: 0,
    filter: 'blur(6px)',
  }, {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.0,
    ease: 'power2.inOut',
  }, 0.15);  // 错开 150ms，避免同时淡化导致的空白帧
```

#### T2：S2→S3 — 水平平移推入

拓扑图向左推出，时间线从右侧推入。模拟"翻书"质感。

```typescript
const T2_TRANSITION = gsap.timeline({ paused: true });

T2_TRANSITION
  // S2 离场：左移 + 淡出
  .to('#topology', {
    x: '-30%',
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, 0)
  // S3 入场：从右侧推入
  .fromTo('#timeline', {
    x: '40%',
    opacity: 0,
  }, {
    x: '0%',
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
  }, 0.1);
```

#### T3：S3→S4 — 垂直分裂

时间线从中线上下撕裂，裂缝中露出红蓝对比场。极具戏剧性。

```typescript
const T3_TRANSITION = gsap.timeline({ paused: true });

T3_TRANSITION
  // S3 上半部分向上推出
  .to('.timeline__upper-half', {
    y: '-55%',
    opacity: 0,
    duration: 1.0,
    ease: 'expo.out',
  }, 0)
  // S3 下半部分向下推出
  .to('.timeline__lower-half', {
    y: '55%',
    opacity: 0,
    duration: 1.0,
    ease: 'expo.out',
  }, 0)
  // 裂缝中线发光
  .fromTo('.transition__crack-light', {
    scaleY: 0,
    opacity: 0,
  }, {
    scaleY: 1,
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
  }, 0.1)
  // S4 从裂缝中显现
  .fromTo('#comparison', {
    clipPath: 'inset(48% 0 48% 0)',  // 中线一条缝
    opacity: 0.5,
  }, {
    clipPath: 'inset(0% 0 0% 0)',     // 完全展开
    opacity: 1,
    duration: 0.8,
    ease: 'expo.out',
  }, 0.3);
```

#### T4：S4→S5 — 色场消融

红蓝双色场化为碎片溶解，碎片颜色过渡为蓝紫，重组为蓝图线条网格。

```typescript
const T4_TRANSITION = gsap.timeline({ paused: true });

T4_TRANSITION
  // S4 色场淡出 + 碎裂感（通过 filter 模拟）
  .to('#comparison', {
    filter: 'saturate(0) blur(4px) brightness(1.5)',
    opacity: 0,
    duration: 1.2,
    ease: 'power2.inOut',
  }, 0)
  // 过渡粒子：红蓝碎片向中心汇聚，变色为蓝紫
  // （Canvas 动画，由 TransitionParticleSystem 驱动）
  .add(() => {
    transitionParticles.play('dissolve-to-blueprint', {
      fromColors: ['var(--color-s4-red)', 'var(--color-s4-blue)'],
      toColor: 'var(--color-s5-accent)',
      duration: 1000,
      particleCount: 60,
    });
  }, 0.2)
  // S5 蓝图线条渐显
  .fromTo('#architecture', {
    opacity: 0,
    filter: 'brightness(2) blur(3px)',
  }, {
    opacity: 1,
    filter: 'brightness(1) blur(0px)',
    duration: 1.0,
    ease: 'power2.inOut',
  }, 0.5);
```

#### T5：S5→S6 — 光线穿透

蓝图线条化为光线从四面八方射出，汇聚到中心，渐变为愿景区块的柔和光晕。

```typescript
const T5_TRANSITION = gsap.timeline({ paused: true });

T5_TRANSITION
  // S5 蓝图线条变亮 + 向中心收缩
  .to('.architecture__layer', {
    borderColor: 'oklch(0.90 0.05 285)',
    boxShadow: '0 0 30px oklch(0.80 0.12 285 / 0.5)',
    scale: 0.9,
    duration: 0.5,
    ease: 'power2.in',
    stagger: 0.05,
  }, 0)
  // 光线爆发
  .to('#architecture', {
    filter: 'brightness(3) blur(10px)',
    opacity: 0,
    duration: 0.5,
    ease: 'expo.inOut',
  }, 0.5)
  // S6 从白场中淡出
  .fromTo('#vision', {
    opacity: 0,
    filter: 'brightness(2) blur(8px)',
  }, {
    opacity: 1,
    filter: 'brightness(1) blur(0px)',
    duration: 0.8,
    ease: 'power2.out',
  }, 0.6);
```

#### T6：S6→S7 — 能量聚合

愿景区块的弥散光晕收缩为一个亮点，亮点爆开为 CTA 的收束能量场。

```typescript
const T6_TRANSITION = gsap.timeline({ paused: true });

T6_TRANSITION
  // S6 光晕向中心收缩
  .to('.vision__bg-aura', {
    scale: 0.1,
    opacity: 1,
    filter: 'brightness(3)',
    duration: 0.6,
    ease: 'power3.in',
  }, 0)
  // S6 内容淡出
  .to('.vision__content', {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
  }, 0)
  // 亮点闪烁
  .to('.vision__bg-aura', {
    scale: 0.02,
    duration: 0.2,
    ease: 'power4.in',
  }, 0.6)
  // 爆开 → S7 能量场扩散
  .fromTo('#cta', {
    opacity: 0,
    scale: 0.8,
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'power4.out',
  }, 0.7)
  // S7 收束粒子启动
  .add(() => {
    convergenceParticles.start();
  }, 0.8);
```

### 2.3 过渡编排控制器

统一管理 6 个过渡的触发和调度。

```typescript
class TransitionOrchestrator {
  private transitions: Map<string, gsap.core.Timeline> = new Map();
  private currentSection = 0;

  register(fromTo: string, timeline: gsap.core.Timeline) {
    this.transitions.set(fromTo, timeline);
  }

  play(from: number, to: number): Promise<void> {
    const key = `${from}-${to}`;
    const tl = this.transitions.get(key);
    if (!tl) return Promise.resolve();

    return new Promise(resolve => {
      tl.eventCallback('onComplete', resolve);
      tl.restart();
    });
  }
}

// 注册所有过渡
const orchestrator = new TransitionOrchestrator();
orchestrator.register('0-1', T1_TRANSITION);
orchestrator.register('1-2', T2_TRANSITION);
orchestrator.register('2-3', T3_TRANSITION);
orchestrator.register('3-4', T4_TRANSITION);
orchestrator.register('4-5', T5_TRANSITION);
orchestrator.register('5-6', T6_TRANSITION);
```

---

## 三、每区块入场动效编排（GSAP 时间线）

每个区块在进入视口并被 pin 住后，播放一条精心编排的 GSAP Timeline。以下详细定义每个元素的入场顺序、起始时间（相对于时间线 0 点）、持续时间、缓动函数和 GSAP 参数。

**时间线约定**：
- 时间单位：秒（s）用于 `toggleActions` 驱动的时间线（S1、S7）
- scrub 归一化 `0→1` 用于 scrub 驱动的时间线（S2-S6）
- `t=0` 表示区块进入视口并开始动画的瞬间
- `stagger` 表示同类元素间的错开延迟
- 所有 `fromTo` 参数按 `{ from状态 } → { to状态 }` 格式

### 3.1 S1 Hero — 星空深渊入场

**叙事节奏**：深空中逐层浮现 → 日期先行（锚定时间点）→ 标题震撼入场 → 副标题补充说明 → 强调句情感递进 → 巨字压轴

```typescript
const heroTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    toggleActions: 'play none none reverse',
  },
});

// ── 0. 背景星空粒子淡入（t=0, dur=1.5s） ──
heroTimeline.fromTo('.hero__star-field', {
  opacity: 0,
}, {
  opacity: 1,
  duration: 1.5,
  ease: 'power1.inOut',
}, 0);

// ── 1. 日期标签（t=0.3, dur=0.6s） ──
// 从上方滑入 + 淡入，轻盈感
heroTimeline.fromTo('.hero__date', {
  opacity: 0,
  y: -20,
  filter: 'blur(4px)',
}, {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  duration: 0.6,
  ease: 'power2.out',
}, 0.3);

// ── 2. 主标题（t=0.6, dur=1.2s） ──
// 从下方上升 + 模糊到清晰 + 辉光逐渐亮起（最重要的元素，最长时间）
heroTimeline.fromTo('.hero__title', {
  opacity: 0,
  y: 40,
  filter: 'blur(12px)',
  textShadow: '0 0 0px transparent',
}, {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  textShadow: 'var(--glow-text-strong)',
  duration: 1.2,
  ease: 'power3.out',
}, 0.6);

// ── 3. 副标题（t=1.2, dur=0.8s） ──
heroTimeline.fromTo('.hero__subtitle', {
  opacity: 0,
  y: 25,
  filter: 'blur(6px)',
}, {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  duration: 0.8,
  ease: 'power2.out',
}, 1.2);

// ── 4. 强调句（t=1.8, dur=0.8s） ──
// 带辉光的入场，表达情感力度
heroTimeline.fromTo('.hero__emphasis', {
  opacity: 0,
  scale: 0.95,
  filter: 'blur(8px)',
}, {
  opacity: 1,
  scale: 1,
  filter: 'blur(0px)',
  duration: 0.8,
  ease: 'back.out(1.2)',     // 微弹效果，增加力度感
}, 1.8);

// ── 5. 巨字/数字（t=2.4, dur=1.0s） ──
// 从 scale(0.6) 弹性放大，伴随强辉光
heroTimeline.fromTo('.hero__giant-text', {
  opacity: 0,
  scale: 0.6,
  filter: 'blur(15px)',
  textShadow: '0 0 0px transparent',
}, {
  opacity: 1,
  scale: 1,
  filter: 'blur(0px)',
  textShadow: 'var(--glow-text-burst)',
  duration: 1.0,
  ease: 'elastic.out(1, 0.5)',   // 弹性缓动，科技感+力量感
}, 2.4);

// ── 6. 光线束扫描启动（t=3.0） ──
heroTimeline.fromTo('.hero__light-beam', {
  opacity: 0,
}, {
  opacity: 1,
  duration: 0.5,
  ease: 'power1.in',
}, 3.0);

// ── 7. 滚动提示（t=3.5, dur=0.6s） ──
heroTimeline.fromTo('.hero__scroll-hint', {
  opacity: 0,
  y: 10,
}, {
  opacity: 0.6,
  y: 0,
  duration: 0.6,
  ease: 'power2.out',
}, 3.5);
```

**S1 时间线总览**：

```
t(s)  0    0.3  0.6     1.2    1.8    2.4     3.0  3.5   4.0
      |     |    |       |      |      |       |    |     |
星空  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
日期        ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
标题             █████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
副标题                    ████████░░░░░░░░░░░░░░░░░░░░░░░░░
强调句                           ████████░░░░░░░░░░░░░░░░░
巨字                                    ██████████░░░░░░░░
光束                                              ████░░░
滚动提示                                               ████
```

### 3.2 S2 拓扑图 — 全息网络入场

**叙事节奏**：标题先行 → 拓扑图容器全息底座亮起 → 核心节点（Boss）先亮 → 一级节点逐层亮起 → 二级节点亮起 → 连线绘制 → 电流开始流动 → 底部说明文字弹出

```typescript
const topologyTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#topology',
    start: 'top top',
    end: '+=150%',
    scrub: 0.8,
  },
});

// ── 0. 区块标题入场（scrub 0, dur=0.08） ──
topologyTimeline.fromTo('.topology__title', {
  opacity: 0,
  y: 30,
}, {
  opacity: 1,
  y: 0,
  duration: 0.08,
  ease: 'power2.out',
}, 0);

// ── 1. 全息底座亮起（scrub 0.05, dur=0.10） ──
topologyTimeline.fromTo('.topology__hologram', {
  opacity: 0,
  scale: 0.95,
  filter: 'brightness(0.5)',
}, {
  opacity: 1,
  scale: 1,
  filter: 'brightness(1)',
  duration: 0.10,
  ease: 'power2.out',
}, 0.05);

// ── 2. Boss 节点先亮（scrub 0.12, dur=0.08） ──
// 金色脉冲从中心爆发
topologyTimeline.fromTo('.topology__node--boss', {
  opacity: 0,
  scale: 0,
  filter: 'brightness(3)',
}, {
  opacity: 1,
  scale: 1,
  filter: 'brightness(1)',
  duration: 0.08,
  ease: 'back.out(2)',
}, 0.12);

// ── 3. 一级节点逐层亮起（scrub 0.18, dur=0.15, stagger=0.02） ──
topologyTimeline.fromTo('.topology__node--level-1', {
  opacity: 0,
  scale: 0,
}, {
  opacity: 1,
  scale: 1,
  duration: 0.15,
  ease: 'back.out(1.5)',
  stagger: 0.02,
}, 0.18);

// ── 4. 二级节点亮起（scrub 0.30, dur=0.15, stagger=0.015） ──
topologyTimeline.fromTo('.topology__node--level-2', {
  opacity: 0,
  scale: 0,
}, {
  opacity: 1,
  scale: 1,
  duration: 0.15,
  ease: 'back.out(1.2)',
  stagger: 0.015,
}, 0.30);

// ── 5. 连线绘制（scrub 0.35, dur=0.25） ──
// SVG stroke-dashoffset 驱动的"画线"效果
topologyTimeline.fromTo('.topology__edge', {
  strokeDashoffset: function() {
    return (this as SVGPathElement).getTotalLength();
  },
  opacity: 0.3,
}, {
  strokeDashoffset: 0,
  opacity: 0.6,
  duration: 0.25,
  ease: 'power1.inOut',
  stagger: 0.01,
}, 0.35);

// ── 6. 电流流光启动（scrub 0.55, dur=0.08） ──
topologyTimeline.fromTo('.topology__edge-glow', {
  opacity: 0,
}, {
  opacity: 1,
  duration: 0.08,
  ease: 'power1.in',
}, 0.55);

// ── 7. 数据粒子启动（scrub 0.60） ──
topologyTimeline.add(() => {
  topologyParticles.start();
}, 0.60);

// ── 8. 底部说明文字弹出（scrub 0.70, dur=0.10） ──
topologyTimeline.fromTo('.topology__description', {
  opacity: 0,
  y: 20,
}, {
  opacity: 1,
  y: 0,
  duration: 0.10,
  ease: 'power2.out',
}, 0.70);
```

**S2 时间线总览（scrub 归一化 0→1）**：

```
scrub  0    0.05 0.12 0.18   0.30   0.35      0.55 0.60 0.70  1.0
       |     |    |    |      |      |          |    |    |     |
标题   ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
底座        █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Boss节点          ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
一级节点               ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░
二级节点                      ███████████░░░░░░░░░░░░░░░░░░░░
连线绘制                             ██████████████████░░░░░░
电流流光                                              ████░░
数据粒子                                                 █░░
底部文字                                                  ███
```

### 3.3 S3 时间线 — 数据流瀑布入场

**叙事节奏**：代码雨先行（氛围铺垫）→ 标题入场 → 时间线轨道从顶部向下光速延伸 → 步骤卡片沿轨道依次飞入（交替左右）

```typescript
const timelineSectionTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#timeline',
    start: 'top top',
    end: '+=200%',
    scrub: 0.8,
  },
});

// ── 0. 代码雨启动（scrub 0） ──
timelineSectionTL.add(() => {
  codeRain.start();
}, 0);

// ── 1. 标题入场（scrub 0.03, dur=0.06） ──
timelineSectionTL.fromTo('.timeline__title', {
  opacity: 0,
  y: 30,
  filter: 'blur(6px)',
}, {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  duration: 0.06,
  ease: 'power2.out',
}, 0.03);

// ── 2. 时间线轨道延伸（scrub 0.08, dur=0.30） ──
// 从 height:0 到 height:100%，伴随发光头部
timelineSectionTL.fromTo('.timeline__track', {
  height: '0%',
}, {
  height: '100%',
  duration: 0.30,
  ease: 'power1.out',    // 接近匀速但有微减速，模拟"光速推进"
}, 0.08);

// 轨道头部亮点跟随
timelineSectionTL.fromTo('.timeline__track-head', {
  top: '0%',
  opacity: 1,
  scale: 1.5,
}, {
  top: '100%',
  opacity: 0.3,
  scale: 1,
  duration: 0.30,
  ease: 'power1.out',
}, 0.08);

// ── 3. 步骤卡片依次飞入（scrub 0.15 起, 每张间隔 0.08） ──
// 奇数卡片从左侧飞入，偶数从右侧飞入
const timelineCards = gsap.utils.toArray('.timeline__card');
timelineCards.forEach((card: Element, i: number) => {
  const fromX = i % 2 === 0 ? -60 : 60;  // 交替左右
  const startAt = 0.15 + i * 0.08;

  timelineSectionTL.fromTo(card, {
    opacity: 0,
    x: fromX,
    scale: 0.9,
    filter: 'blur(4px)',
  }, {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 0.10,
    ease: 'power3.out',
  }, startAt);

  // 卡片入场时伴随发光闪烁
  timelineSectionTL.fromTo(card, {
    boxShadow: '0 0 20px var(--color-s3-accent-glow)',
  }, {
    boxShadow: '0 0 5px oklch(0.75 0.14 170 / 0.15)',
    duration: 0.15,
    ease: 'power2.out',
  }, startAt + 0.05);
});
```

### 3.4 S4 对比 — 双色场碰撞入场

**叙事节奏**：标题入场 → 左栏（传统方式）从暗红光场中滑入 → "VS" 字符能量爆发 → 右栏（AI 方式）从亮蓝光场中滑入 → 对比标签弹出

```typescript
const comparisonTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#comparison',
    start: 'top top',
    end: '+=150%',
    scrub: 0.8,
  },
});

// ── 0. 双色场背景淡入（scrub 0, dur=0.08） ──
comparisonTimeline.fromTo('.comparison__field', {
  opacity: 0,
}, {
  opacity: 1,
  duration: 0.08,
  ease: 'power1.in',
}, 0);

// ── 1. 标题入场（scrub 0.03, dur=0.06） ──
comparisonTimeline.fromTo('.comparison__title', {
  opacity: 0,
  y: 25,
}, {
  opacity: 1,
  y: 0,
  duration: 0.06,
  ease: 'power2.out',
}, 0.03);

// ── 2. 左栏滑入（scrub 0.10, dur=0.15） ──
// 从左侧深处推入，带暗红辉光
comparisonTimeline.fromTo('.comparison__left', {
  opacity: 0,
  x: -80,
  filter: 'blur(6px)',
}, {
  opacity: 1,
  x: 0,
  filter: 'blur(0px)',
  duration: 0.15,
  ease: 'power3.out',
}, 0.10);

// 左栏入场红色闪光
comparisonTimeline.fromTo('.comparison__left', {
  boxShadow: '0 0 40px var(--color-s4-red-glow)',
}, {
  boxShadow: '0 0 10px oklch(0.55 0.18 15 / 0.15)',
  duration: 0.12,
  ease: 'power2.out',
}, 0.12);

// ── 3. VS 能量爆发（scrub 0.22, dur=0.12） ──
comparisonTimeline.fromTo('.comparison__vs', {
  opacity: 0,
  scale: 0.3,
  filter: 'blur(10px)',
}, {
  opacity: 1,
  scale: 1,
  filter: 'blur(0px)',
  duration: 0.12,
  ease: 'elastic.out(1, 0.4)',   // 强弹性 = 碰撞爆发感
}, 0.22);

// ── 4. 右栏滑入（scrub 0.30, dur=0.15） ──
comparisonTimeline.fromTo('.comparison__right', {
  opacity: 0,
  x: 80,
  filter: 'blur(6px)',
}, {
  opacity: 1,
  x: 0,
  filter: 'blur(0px)',
  duration: 0.15,
  ease: 'power3.out',
}, 0.30);

// 右栏入场蓝色闪光
comparisonTimeline.fromTo('.comparison__right', {
  boxShadow: '0 0 40px var(--color-s4-blue-glow)',
}, {
  boxShadow: '0 0 10px oklch(0.72 0.16 250 / 0.15)',
  duration: 0.12,
  ease: 'power2.out',
}, 0.32);

// ── 5. 中线碰撞火花启动（scrub 0.35） ──
comparisonTimeline.add(() => {
  clashParticles.start();
}, 0.35);

// ── 6. 对比标签弹出（scrub 0.45, dur=0.08, stagger=0.02） ──
comparisonTimeline.fromTo('.comparison__tag', {
  opacity: 0,
  scale: 0.7,
  y: 10,
}, {
  opacity: 1,
  scale: 1,
  y: 0,
  duration: 0.08,
  ease: 'back.out(2)',
  stagger: 0.02,
}, 0.45);
```

### 3.5 S5 架构 — 蓝图透视入场

**叙事节奏**：蓝图网格底纹渐显 → 标题入场 → X光扫描线从顶部扫下 → Panel A 扫描后亮起填充 → Panel B → Panel C → 层级间光纤连接绘制

```typescript
const architectureTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#architecture',
    start: 'top top',
    end: '+=150%',
    scrub: 0.8,
  },
});

// ── 0. 蓝图底纹渐显（scrub 0, dur=0.08） ──
architectureTimeline.fromTo('.architecture__grid-bg', {
  opacity: 0,
}, {
  opacity: 0.5,
  duration: 0.08,
  ease: 'power1.in',
}, 0);

// ── 1. 标题入场（scrub 0.03, dur=0.06） ──
architectureTimeline.fromTo('.architecture__title', {
  opacity: 0,
  y: 25,
}, {
  opacity: 1,
  y: 0,
  duration: 0.06,
  ease: 'power2.out',
}, 0.03);

// ── 2. X光扫描线从上向下扫描（scrub 0.10, dur=0.50） ──
architectureTimeline.fromTo('.architecture__xray-line', {
  top: '0%',
  opacity: 0,
}, {
  top: '100%',
  opacity: 1,
  duration: 0.50,
  ease: 'power1.inOut',
}, 0.10);

// ── 3. Panel A 展开（scrub 0.15, dur=0.12） ──
// X光扫描到 Panel A 位置时触发——从蓝图轮廓变为填充面板
architectureTimeline.fromTo('.architecture__layer--a', {
  borderColor: 'var(--color-s5-blueprint)',
  background: 'transparent',
  opacity: 0.3,
}, {
  borderColor: 'var(--color-s5-accent)',
  background: 'var(--color-bg-surface)',
  opacity: 1,
  duration: 0.12,
  ease: 'power2.out',
}, 0.15);

// Panel A 内容淡入
architectureTimeline.fromTo('.architecture__layer--a .architecture__content', {
  opacity: 0,
  y: 10,
}, {
  opacity: 1,
  y: 0,
  duration: 0.08,
  ease: 'power2.out',
}, 0.20);

// ── 4. Panel B 展开（scrub 0.30, dur=0.12） ──
architectureTimeline.fromTo('.architecture__layer--b', {
  borderColor: 'var(--color-s5-blueprint)',
  background: 'transparent',
  opacity: 0.3,
}, {
  borderColor: 'var(--color-s5-accent)',
  background: 'var(--color-bg-surface)',
  opacity: 1,
  duration: 0.12,
  ease: 'power2.out',
}, 0.30);

architectureTimeline.fromTo('.architecture__layer--b .architecture__content', {
  opacity: 0,
  y: 10,
}, {
  opacity: 1,
  y: 0,
  duration: 0.08,
  ease: 'power2.out',
}, 0.35);

// ── 5. Panel C 展开（scrub 0.45, dur=0.12） ──
architectureTimeline.fromTo('.architecture__layer--c', {
  borderColor: 'var(--color-s5-blueprint)',
  background: 'transparent',
  opacity: 0.3,
}, {
  borderColor: 'var(--color-s5-accent)',
  background: 'var(--color-bg-surface)',
  opacity: 1,
  duration: 0.12,
  ease: 'power2.out',
}, 0.45);

architectureTimeline.fromTo('.architecture__layer--c .architecture__content', {
  opacity: 0,
  y: 10,
}, {
  opacity: 1,
  y: 0,
  duration: 0.08,
  ease: 'power2.out',
}, 0.50);

// ── 6. 层级间光纤连接绘制（scrub 0.55, dur=0.20） ──
architectureTimeline.fromTo('.architecture__fiber', {
  strokeDashoffset: function() { return (this as SVGPathElement).getTotalLength(); },
  opacity: 0.2,
}, {
  strokeDashoffset: 0,
  opacity: 0.4,
  duration: 0.20,
  ease: 'power1.inOut',
  stagger: 0.03,
}, 0.55);

// 光纤流光启动
architectureTimeline.fromTo('.architecture__fiber-glow', {
  opacity: 0,
}, {
  opacity: 1,
  duration: 0.05,
  ease: 'power1.in',
}, 0.70);
```

### 3.6 S6 愿景 — 墨水光晕入场

**叙事节奏**：背景光晕先呼吸起来 → 文字逐行从模糊墨水扩散状态凝聚为清晰 → 高潮句"答案是——组织"能量爆发 → 余韵消散（辉光缓慢回落）

```typescript
const visionTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#vision',
    start: 'top top',
    end: '+=250%',           // 最长 scrub 区间，给文字逐行淡入足够空间
    scrub: 1.0,              // 稍慢的 scrub 响应，营造从容感
  },
});

// ── 0. 背景光晕启动（scrub 0, dur=0.06） ──
visionTimeline.fromTo('.vision__bg-aura', {
  opacity: 0,
  scale: 0.8,
}, {
  opacity: 0.5,
  scale: 1,
  duration: 0.06,
  ease: 'power2.out',
}, 0);

// ── 1. 文字逐行淡入（scrub 0.05 起） ──
// 每行文字从 blur(15px) + scale(1.05) 凝聚为清晰
const visionLines = gsap.utils.toArray('.vision__line');
const totalLines = visionLines.length;
const lineSpan = 0.60;     // 所有行占用的 scrub 区间
const perLine = lineSpan / totalLines;

visionLines.forEach((line: Element, i: number) => {
  const startAt = 0.05 + i * perLine;
  const isClimax = line.classList.contains('vision__climax');

  if (!isClimax) {
    // 普通行：墨水凝聚效果
    visionTimeline.fromTo(line, {
      opacity: 0,
      filter: 'blur(15px)',
      scale: 1.05,
      y: 15,
    }, {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      y: 0,
      duration: perLine * 1.5,   // 允许重叠，更流畅
      ease: 'power2.out',
    }, startAt);
  } else {
    // ── 高潮句特殊处理 ──

    // Step A: 屏幕微闪（背景亮度瞬间提升）
    visionTimeline.to('.vision__flash-overlay', {
      opacity: 0.15,
      duration: 0.01,
      ease: 'none',
    }, startAt);
    visionTimeline.to('.vision__flash-overlay', {
      opacity: 0,
      duration: 0.02,
      ease: 'power1.out',
    }, startAt + 0.01);

    // Step B: 文字能量爆发入场
    visionTimeline.fromTo(line, {
      opacity: 0,
      scale: 0.8,
      filter: 'blur(20px)',
      textShadow: '0 0 0px transparent',
    }, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      textShadow: 'var(--glow-text-burst)',
      duration: perLine * 2.5,
      ease: 'expo.out',
    }, startAt + 0.01);

    // Step C: 冲击波圆环扩散
    visionTimeline.fromTo('.vision__shockwave', {
      width: 0,
      height: 0,
      opacity: 0.8,
    }, {
      width: 600,
      height: 600,
      opacity: 0,
      duration: 0.06,
      ease: 'power2.out',
    }, startAt + 0.02);

    // Step D: 背景光晕瞬间增强
    visionTimeline.to('.vision__bg-aura', {
      scale: 1.3,
      opacity: 1,
      duration: 0.03,
      ease: 'power2.out',
    }, startAt + 0.01);
  }
});

// ── 2. 余韵消散（最后 15% scrub 区间） ──
// 背景光晕缓慢回落，辉光减弱
visionTimeline.to('.vision__bg-aura', {
  scale: 1,
  opacity: 0.4,
  duration: 0.15,
  ease: 'power3.out',
}, 0.85);

// 高潮句辉光从 burst 降为 medium
visionTimeline.to('.vision__climax', {
  textShadow: 'var(--glow-text-medium)',
  duration: 0.15,
  ease: 'power2.out',
}, 0.85);
```

### 3.7 S7 CTA — 能量收束入场

**叙事节奏**：能量场从四周向中心收束（粒子先行）→ 品牌名从粒子聚合中显现 → 关键数据浮现（CountUp）→ CTA 按钮弹出悬浮 → Footer 信息淡入

```typescript
const ctaTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#cta',
    start: 'top top',
    toggleActions: 'play none none reverse',
  },
});

// ── 0. 收束粒子启动（t=0） ──
ctaTimeline.add(() => {
  convergenceParticles.start();
}, 0);

// ── 1. 能量场背景淡入（t=0, dur=0.8s） ──
ctaTimeline.fromTo('.cta__energy-field', {
  opacity: 0,
  backgroundSize: '300% 300%',
}, {
  opacity: 0.8,
  backgroundSize: '100% 100%',
  duration: 0.8,
  ease: 'power2.inOut',
}, 0);

// ── 2. 品牌名聚合显现（t=0.5, dur=1.2s） ──
// 从分散的发光碎片状态聚合成文字
ctaTimeline.fromTo('.cta__brand-name', {
  opacity: 0,
  scale: 1.3,
  filter: 'blur(15px) brightness(2)',
  textShadow: '0 0 60px var(--color-s7-accent-glow)',
  letterSpacing: '0.3em',
}, {
  opacity: 1,
  scale: 1,
  filter: 'blur(0px) brightness(1)',
  textShadow: 'var(--glow-text-strong)',
  letterSpacing: 'normal',
  duration: 1.2,
  ease: 'power3.out',
}, 0.5);

// ── 3. 关键数据浮现（t=1.2, dur=0.6s, stagger=0.15s） ──
ctaTimeline.fromTo('.cta__stat', {
  opacity: 0,
  y: 20,
  scale: 0.9,
}, {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: 0.6,
  ease: 'power2.out',
  stagger: 0.15,
}, 1.2);

// 数据数字 CountUp 效果
ctaTimeline.add(() => {
  document.querySelectorAll('.cta__stat-number').forEach(el => {
    const target = parseInt((el as HTMLElement).dataset.value || '0');
    gsap.to(el, {
      innerText: target,
      duration: 1.5,
      ease: 'power1.out',
      snap: { innerText: 1 },
      modifiers: {
        innerText: (v: string) => Math.round(parseFloat(v)).toLocaleString(),
      },
    });
  });
}, 1.2);

// ── 4. CTA 按钮弹出（t=2.0, dur=0.8s） ──
ctaTimeline.fromTo('.cta__button', {
  opacity: 0,
  y: 30,
  scale: 0.8,
}, {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: 0.8,
  ease: 'elastic.out(1, 0.5)',   // 弹性弹出，有存在感
}, 2.0);

// ── 5. Footer 淡入（t=2.6, dur=0.6s） ──
ctaTimeline.fromTo('.cta__footer', {
  opacity: 0,
  y: 15,
}, {
  opacity: 0.6,       // Footer 始终保持低调
  y: 0,
  duration: 0.6,
  ease: 'power2.out',
}, 2.6);
```

### 3.8 时间线参数速查表

| 区块 | 总时长 | 驱动方式 | 元素数 | 关键缓动 |
|------|-------|---------|--------|---------|
| S1 Hero | ~4.0s | toggleActions（自动播放） | 7 步 | `elastic.out`（巨字）, `back.out`（强调句） |
| S2 拓扑图 | scrub 0→1 | scrub 0.8 | 8 组 | `back.out`（节点弹出）, `power1.inOut`（画线） |
| S3 时间线 | scrub 0→1 | scrub 0.8 | 2+N 卡片 | `power3.out`（卡片飞入）, `power1.out`（轨道延伸） |
| S4 对比 | scrub 0→1 | scrub 0.8 | 6 组 | `elastic.out`（VS 爆发）, `power3.out`（栏滑入） |
| S5 架构 | scrub 0→1 | scrub 0.8 | 7 组 | `power2.out`（扫描揭示）, `power1.inOut`（光纤） |
| S6 愿景 | scrub 0→1 | scrub 1.0 | N 行+高潮 | `expo.out`（高潮爆发）, `power2.out`（墨水凝聚） |
| S7 CTA | ~3.2s | toggleActions（自动播放） | 5 组 | `elastic.out`（按钮弹出）, `power3.out`（品牌聚合） |

---

## 四、交互增强

在动效时间线之外，叠加一层**实时交互响应**，让页面在用户操作下"活"起来。

### 4.1 鼠标跟随光效

鼠标移动时，光标位置产生一个柔和的辐射光斑，跟随移动。不同区块的光斑颜色匹配区块 accent 色。

```typescript
// ── 鼠标跟随光效配置 ──
const CURSOR_GLOW_CONFIG = {
  // 光斑尺寸
  size: 400,                   // px 直径
  // 跟随延迟（创造柔和的拖尾感）
  lerp: 0.08,                 // 线性插值系数（0=不动, 1=即时跟随）
  // 光斑样式
  gradient: (color: string) => `radial-gradient(
    circle at center,
    ${color} 0%,
    transparent 70%
  )`,
  opacity: 0.12,               // 基础透明度
  hoverOpacity: 0.20,          // hover 在可交互元素上时增强
  // 区块色彩映射
  sectionColors: {
    hero:         'oklch(0.85 0.08 230 / 0.15)',
    topology:     'oklch(0.70 0.15 265 / 0.15)',
    timeline:     'oklch(0.75 0.14 170 / 0.15)',
    comparison:   'oklch(0.80 0.20 280 / 0.15)',
    architecture: 'oklch(0.65 0.15 285 / 0.15)',
    vision:       'oklch(0.72 0.16 320 / 0.15)',
    cta:          'oklch(0.70 0.15 265 / 0.15)',
  },
  // 混合模式
  blendMode: 'screen' as const,
  // z-index
  zIndex: 'var(--z-fx-fg)',
};

class CursorGlow {
  private el: HTMLDivElement;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private raf: number | null = null;
  private currentColor = CURSOR_GLOW_CONFIG.sectionColors.hero;

  constructor() {
    this.el = document.createElement('div');
    this.el.classList.add('cursor-glow');
    Object.assign(this.el.style, {
      position: 'fixed',
      width: `${CURSOR_GLOW_CONFIG.size}px`,
      height: `${CURSOR_GLOW_CONFIG.size}px`,
      pointerEvents: 'none',
      zIndex: CURSOR_GLOW_CONFIG.zIndex,
      mixBlendMode: CURSOR_GLOW_CONFIG.blendMode,
      opacity: String(CURSOR_GLOW_CONFIG.opacity),
      transform: 'translate(-50%, -50%)',
      transition: 'background 0.8s ease, opacity 0.3s ease',
    });
    document.body.appendChild(this.el);
    this.updateColor(this.currentColor);
  }

  updateColor(color: string) {
    this.currentColor = color;
    this.el.style.background = CURSOR_GLOW_CONFIG.gradient(color);
  }

  start() {
    document.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    });

    const animate = () => {
      this.currentX += (this.targetX - this.currentX) * CURSOR_GLOW_CONFIG.lerp;
      this.currentY += (this.targetY - this.currentY) * CURSOR_GLOW_CONFIG.lerp;
      this.el.style.left = `${this.currentX}px`;
      this.el.style.top = `${this.currentY}px`;
      this.raf = requestAnimationFrame(animate);
    };
    animate();
  }

  // 区块切换时调用
  setSection(sectionId: string) {
    const color = CURSOR_GLOW_CONFIG.sectionColors[sectionId as keyof typeof CURSOR_GLOW_CONFIG.sectionColors];
    if (color) this.updateColor(color);
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
```

**移动端**：禁用鼠标跟随光效（无鼠标），改为触摸点涟漪反馈。

```typescript
// 触摸涟漪（移动端替代）
function createTouchRipple(x: number, y: number, color: string) {
  const ripple = document.createElement('div');
  ripple.classList.add('touch-ripple');
  Object.assign(ripple.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: color,
    opacity: '0.3',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: CURSOR_GLOW_CONFIG.zIndex,
  });
  document.body.appendChild(ripple);

  gsap.to(ripple, {
    width: 150,
    height: 150,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
}
```

### 4.2 Hover 微动效

所有可交互元素统一的 hover 响应体系，追求**弹性感**和**物理感**。

```css
/* ── 全局 Hover 缓动 Token ── */
@theme {
  --ease-hover-enter: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 弹性入 */
  --ease-hover-leave: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 平滑出 */
  --dur-hover: 0.25s;
}

/* ── 卡片 Hover ── */
.card,
.timeline__card,
.architecture__layer,
.comparison__panel {
  transition:
    transform var(--dur-hover) var(--ease-hover-leave),
    box-shadow var(--dur-hover) var(--ease-hover-leave),
    border-color var(--dur-hover) var(--ease-hover-leave);
}

.card:hover,
.timeline__card:hover,
.architecture__layer:hover,
.comparison__panel:hover {
  transform: translateY(-4px) scale(1.01);
  transition-timing-function: var(--ease-hover-enter);
}

/* ── 按钮 Hover ── */
.button,
.cta__button {
  transition:
    transform var(--dur-hover) var(--ease-hover-leave),
    box-shadow var(--dur-hover) var(--ease-hover-leave),
    background var(--dur-hover) var(--ease-hover-leave);
}

.button:hover,
.cta__button:hover {
  transform: translateY(-2px) scale(1.03);
  transition-timing-function: var(--ease-hover-enter);
}

/* ── 拓扑节点 Hover ── */
.topology__node {
  transition:
    transform 0.3s var(--ease-hover-leave),
    filter 0.3s var(--ease-hover-leave);
  cursor: pointer;
}

.topology__node:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 0 15px var(--color-accent-glow))
          drop-shadow(0 0 30px var(--color-accent-glow));
  transition-timing-function: var(--ease-hover-enter);
}

/* ── 链接文字 Hover — 下划线动画 ── */
.link,
a[href] {
  position: relative;
  text-decoration: none;
}

.link::after,
a[href]::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s var(--ease-hover-enter);
}

.link:hover::after,
a[href]:hover::after {
  width: 100%;
}
```

**磁性吸附效果**（CTA 按钮专属）：

```typescript
// CTA 按钮 — 鼠标接近时按钮微微被"吸引"向鼠标方向
class MagneticButton {
  private el: HTMLElement;
  private strength = 0.3;         // 吸引力强度
  private radius = 120;           // 影响半径 px
  private returnEase = 'elastic.out(1, 0.3)';
  private returnDuration = 0.8;   // 回弹时长

  constructor(el: HTMLElement) {
    this.el = el;
    this.bind();
  }

  private bind() {
    this.el.addEventListener('mousemove', (e) => {
      const rect = this.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < this.radius) {
        const pull = (1 - dist / this.radius) * this.strength;
        gsap.to(this.el, {
          x: dx * pull,
          y: dy * pull,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });

    this.el.addEventListener('mouseleave', () => {
      gsap.to(this.el, {
        x: 0,
        y: 0,
        duration: this.returnDuration,
        ease: this.returnEase,
      });
    });
  }
}

// 初始化
document.querySelectorAll('.cta__button').forEach(btn => {
  new MagneticButton(btn as HTMLElement);
});
```

### 4.3 滚动进度指示器

右侧边缘的极简进度指示器，让用户知道自己在哪个区块、还有多少内容。

```typescript
// ── 滚动进度指示器配置 ──
const PROGRESS_INDICATOR_CONFIG = {
  position: 'right',           // 'right' | 'left'
  offsetX: 24,                 // 距右边缘 px
  dotSize: 8,                  // 非活跃点直径 px
  activeDotSize: 12,           // 活跃点直径 px
  dotGap: 20,                  // 点间距 px
  activeColor: 'var(--color-accent)',
  inactiveColor: 'oklch(0.50 0.03 265 / 0.40)',
  glowColor: 'var(--color-accent-glow)',
  // 连接线
  connector: {
    width: 2,
    color: 'oklch(0.40 0.02 265 / 0.20)',
    progressColor: 'var(--color-accent)',
  },
  // 区块标签（hover 显示）
  labels: ['Hero', '组织架构', '成长历程', '传统 vs AI', '技术架构', '愿景', 'CTA'],
  labelOffset: 20,             // 标签距离点的间距 px
};
```

**实现方案**（CSS + GSAP）：

```html
<!-- 进度指示器 DOM -->
<nav class="scroll-progress" aria-label="页面导航">
  <div class="scroll-progress__track">
    <div class="scroll-progress__fill"></div>
  </div>
  <button class="scroll-progress__dot" data-section="0" aria-label="Hero">
    <span class="scroll-progress__label">Hero</span>
  </button>
  <!-- ... 7 个 dot -->
</nav>
```

```css
.scroll-progress {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--z-sticky);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.scroll-progress__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(0.50 0.03 265 / 0.40);
  border: none;
  cursor: pointer;
  transition: all 0.3s var(--ease-hover-enter);
  position: relative;
}

.scroll-progress__dot.--active {
  width: 12px;
  height: 12px;
  background: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent-glow),
              0 0 20px var(--color-accent-glow);
}

/* 轨道连线 */
.scroll-progress__track {
  position: absolute;
  width: 2px;
  top: 0;
  bottom: 0;
  background: oklch(0.40 0.02 265 / 0.20);
  border-radius: 1px;
}

.scroll-progress__fill {
  width: 100%;
  background: var(--color-accent);
  border-radius: 1px;
  height: 0%;     /* GSAP 驱动 */
  box-shadow: 0 0 6px var(--color-accent-glow);
}

/* Hover 显示标签 */
.scroll-progress__label {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.scroll-progress__dot:hover .scroll-progress__label {
  opacity: 1;
}

/* 移动端隐藏（屏幕太小，干扰内容） */
@media (max-width: 767px) {
  .scroll-progress {
    display: none;
  }
}
```

```typescript
// GSAP 驱动进度填充
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    // 更新轨道填充
    gsap.set('.scroll-progress__fill', {
      height: `${self.progress * 100}%`,
    });

    // 更新活跃点
    const activeIndex = Math.round(self.progress * (SECTIONS.length - 1));
    document.querySelectorAll('.scroll-progress__dot').forEach((dot, i) => {
      dot.classList.toggle('--active', i === activeIndex);
    });
  },
});

// 点击导航
document.querySelectorAll('.scroll-progress__dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = parseInt((dot as HTMLElement).dataset.section || '0');
    scrollToSection(index);
  });
});
```

### 4.4 键盘导航

支持 PageUp/PageDown、方向键、Home/End 翻页，提升无障碍体验。

```typescript
// ── 键盘导航 ──
const KEYBOARD_NAV = {
  // 键位映射
  keys: {
    next: ['PageDown', 'ArrowDown', 'Space'],     // 下一页
    prev: ['PageUp', 'ArrowUp'],                   // 上一页
    first: ['Home'],                                // 首页
    last: ['End'],                                  // 末页
  },
  // 防抖
  cooldown: 600,   // ms
};

let lastKeyTime = 0;

document.addEventListener('keydown', (e) => {
  const now = Date.now();
  if (now - lastKeyTime < KEYBOARD_NAV.cooldown) return;

  if (KEYBOARD_NAV.keys.next.includes(e.key)) {
    e.preventDefault();
    scrollToSection(scrollStateMachine.currentSection + 1);
    lastKeyTime = now;
  } else if (KEYBOARD_NAV.keys.prev.includes(e.key)) {
    e.preventDefault();
    scrollToSection(scrollStateMachine.currentSection - 1);
    lastKeyTime = now;
  } else if (KEYBOARD_NAV.keys.first.includes(e.key)) {
    e.preventDefault();
    scrollToSection(0);
    lastKeyTime = now;
  } else if (KEYBOARD_NAV.keys.last.includes(e.key)) {
    e.preventDefault();
    scrollToSection(SECTIONS.length - 1);
    lastKeyTime = now;
  }
});

// Tab 焦点管理 — 当前区块内的可聚焦元素可 Tab，其他区块 inert
function updateFocusScope(activeIndex: number) {
  document.querySelectorAll('.section').forEach((section, i) => {
    if (i === activeIndex) {
      section.removeAttribute('inert');
    } else {
      section.setAttribute('inert', '');
    }
  });
}
```

### 4.5 交互状态速查表

| 交互类型 | 触发条件 | 响应动作 | 时长 | 缓动 |
|---------|---------|---------|------|------|
| 鼠标跟随光斑 | mousemove | 光斑跟随（lerp=0.08） | 持续 | 线性插值 |
| 卡片 hover | mouseenter | Y-4px + scale(1.01) + 光晕 | 0.25s | `ease-hover-enter` (弹性) |
| 按钮 hover | mouseenter | Y-2px + scale(1.03) + 光晕 | 0.25s | `ease-hover-enter` (弹性) |
| 节点 hover | mouseenter | scale(1.15) + 双层辉光 | 0.3s | `ease-hover-enter` (弹性) |
| CTA 磁性 | mousemove (半径内) | 按钮微偏移向鼠标 | 0.3s | `power2.out` |
| CTA 磁性回弹 | mouseleave | 回归原位 | 0.8s | `elastic.out(1, 0.3)` |
| 进度指示器 | scroll | 填充高度 + 活跃点切换 | 即时 | — |
| 键盘翻页 | PageDown/ArrowDown | 翻到下一区块 | 0.8s | `power2.inOut` |
| 触摸翻页 | swipe (>50px) | 翻到目标区块 | 0.8s | `power2.inOut` |
| 触摸涟漪 | touchstart (移动端) | 涟漪扩散+消失 | 0.6s | `power2.out` |

---

## 五、技术实现建议

### 5.1 推荐库组合

| 库 | 版本 | 用途 | 大小（gzip） |
|----|------|------|------------|
| **GSAP** | 3.12+ | 核心动画引擎 + ScrollTrigger + ScrollToPlugin | ~30KB |
| **GSAP ScrollTrigger** | (included) | 滚动驱动动画、pin、scrub | ~8KB |
| **GSAP ScrollToPlugin** | (included) | 编程式翻页 `scrollTo` | ~2KB |
| **自研 Canvas 粒子系统** | — | 全局粒子 + 区块粒子 + 交互粒子 | ~5KB |
| **自研过渡控制器** | — | 区块过渡编排 + 状态机 | ~3KB |

**为什么选 GSAP？**
- 性能：底层使用 `requestAnimationFrame`，自动 GPU 合成
- 精度：scrub 模式与滚动位置像素级同步
- 生态：ScrollTrigger 是最成熟的滚动动画方案
- 体积：总共 ~40KB gzip，比 Framer Motion（~30KB 但仅 React）更通用

**不推荐的库**：
- ❌ `Lenis` / `Locomotive Scroll`：自定义滚动库会与 `scroll-snap` 冲突
- ❌ `Three.js`：本项目无 3D 需求，杀鸡用牛刀
- ❌ `Anime.js`：API 不如 GSAP 精准，ScrollTrigger 无替代品

### 5.2 性能优化策略

#### 5.2.1 GPU 加速规则

```css
/* 需要 GPU 合成的元素提前声明 */
.section,
.cursor-glow,
.hero__light-beam,
.topology__hologram,
.comparison__field,
.vision__bg-aura,
.cta__energy-field {
  will-change: transform, opacity;
  /* 注意：动画结束后移除 will-change，避免内存浪费 */
}

/* 动画结束后清理 */
.section.--animation-complete {
  will-change: auto;
}
```

#### 5.2.2 Canvas 渲染优化

```typescript
// ── Canvas 性能优化清单 ──
const CANVAS_PERF = {
  // 1. 设备像素比限制（高 DPI 屏幕 Canvas 极其昂贵）
  maxDPR: 1.5,
  // 2. 离屏 Canvas 预渲染静态元素
  offscreenPrerender: true,
  // 3. 脏矩形渲染（仅重绘变化区域）
  dirtyRects: true,
  // 4. 对象池（避免 GC）
  particlePool: {
    initialSize: 300,
    growthFactor: 1.5,
  },
  // 5. 帧率自适应
  targetFPS: 60,
  adaptiveThreshold: {
    high: 55,    // > 55fps → 维持当前质量
    low: 40,     // < 40fps → 降级（减粒子、降分辨率）
  },
};

// 帧率自适应控制器
class AdaptiveRenderer {
  private frameCount = 0;
  private lastCheck = performance.now();
  private quality: 'high' | 'medium' | 'low' = 'high';

  tick() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastCheck;

    if (elapsed >= 1000) {
      const fps = (this.frameCount / elapsed) * 1000;
      this.frameCount = 0;
      this.lastCheck = now;

      if (fps < CANVAS_PERF.adaptiveThreshold.low && this.quality !== 'low') {
        this.downgrade();
      } else if (fps > CANVAS_PERF.adaptiveThreshold.high && this.quality !== 'high') {
        this.upgrade();
      }
    }
  }

  private downgrade() {
    if (this.quality === 'high') {
      this.quality = 'medium';
      // 减少 30% 粒子
      particleSystem.reduceCount(0.7);
    } else if (this.quality === 'medium') {
      this.quality = 'low';
      // 再减少 50% + 降低 Canvas 分辨率
      particleSystem.reduceCount(0.5);
      canvas.width = window.innerWidth * 0.5;
      canvas.height = window.innerHeight * 0.5;
    }
  }

  private upgrade() {
    if (this.quality === 'low') {
      this.quality = 'medium';
    } else if (this.quality === 'medium') {
      this.quality = 'high';
      particleSystem.restoreCount();
      canvas.width = window.innerWidth * Math.min(devicePixelRatio, CANVAS_PERF.maxDPR);
      canvas.height = window.innerHeight * Math.min(devicePixelRatio, CANVAS_PERF.maxDPR);
    }
  }
}
```

#### 5.2.3 IntersectionObserver 按需激活

```typescript
// 只有当前可见的区块才运行动画和粒子系统
const sectionFXMap: Map<string, {
  particles?: ParticleSystem;
  cssAnimations?: Animation[];
}> = new Map();

const visibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = (entry.target as HTMLElement).id;
      const fx = sectionFXMap.get(id);
      if (!fx) return;

      if (entry.isIntersecting) {
        fx.particles?.resume();
        fx.cssAnimations?.forEach(a => a.play());
      } else {
        fx.particles?.pause();
        fx.cssAnimations?.forEach(a => a.pause());
      }
    });
  },
  { threshold: 0.05 }
);

document.querySelectorAll('.section').forEach(section => {
  visibilityObserver.observe(section);
});
```

#### 5.2.4 帧预算管理

```
┌──────────────────────────────────────────────────────┐
│               16.67ms 帧预算 (60fps)                  │
├─────────┬──────────┬──────────┬───────────┬──────────┤
│ JS 逻辑 │ Canvas   │ GSAP     │ 布局+绘制 │ 合成     │
│ ≤1ms    │ ≤3ms     │ ≤1ms     │ ≤5ms      │ ≤3ms     │
│ 事件处理 │ 粒子更新 │ tween    │ reflow    │ GPU 层   │
│ 状态机   │ 光效渲染 │ 补间计算 │ repaint   │ composit │
└─────────┴──────────┴──────────┴───────────┴──────────┘
  总 JS ≤ 5ms，留 11ms 给浏览器渲染管线
```

### 5.3 降级方案

根据设备能力和用户偏好，提供三级降级策略。

#### 5.3.1 降级决策树

```
用户偏好 prefers-reduced-motion?
  ├─ YES → Level 0: 关闭所有动效（仅保留内容静态展示）
  └─ NO
      ├─ 移动端 or hardwareConcurrency ≤ 4?
      │   ├─ YES → Level 1: 精简动效
      │   └─ NO
      │       ├─ 运行时 FPS < 40 持续 3s?
      │       │   ├─ YES → Level 2: 运行时降级
      │       │   └─ NO → Level 3: 全量体验
      │       └─
      └─
```

#### 5.3.2 各级降级内容

| 特性 | Level 3 (全量) | Level 2 (运行时降级) | Level 1 (精简) | Level 0 (无障碍) |
|------|--------------|-------------------|--------------|----------------|
| 全局粒子 | 120 颗 | 60 颗 | 0 | 0 |
| 区块粒子 | 全部 | 减半 | 关闭 | 关闭 |
| 交互粒子 | 开启 | 关闭 | 关闭 | 关闭 |
| 鼠标光效 | 开启 | 简化 (无 lerp) | 关闭 | 关闭 |
| 文字辉光 | 4 级 | 2 级 (subtle/medium) | subtle 仅 | 关闭 |
| 代码雨 | 40 列 | 15 列 | 关闭 | 关闭 |
| 全息色散 | 开启 | 关闭 | 关闭 | 关闭 |
| 入场时间线 | 全部 scrub | 全部 scrub | 简化淡入 | 无动画 |
| 区块过渡 | 6 种独立效果 | 统一淡入淡出 | 即时切换 | 即时切换 |
| 扫描线/网格纹理 | 开启 | 关闭 | 关闭 | 关闭 |
| 噪点纹理 | 开启 | 关闭 | 关闭 | 关闭 |
| Canvas DPR | 1.5x | 1x | — | — |
| 目标帧率 | 60fps | 30fps | — | — |

#### 5.3.3 降级实现

```typescript
type DegradationLevel = 0 | 1 | 2 | 3;

function detectLevel(): DegradationLevel {
  // Level 0: 无障碍模式
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }

  // Level 1: 低性能设备
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const isLowPower = navigator.hardwareConcurrency <= 4;
  if (isMobile || isLowPower) {
    return 1;
  }

  // 默认 Level 3，运行时可能降到 Level 2
  return 3;
}

function applyDegradation(level: DegradationLevel) {
  document.documentElement.dataset.fxLevel = String(level);

  switch (level) {
    case 0:
      // 关闭所有动效
      gsap.globalTimeline.pause();
      document.querySelectorAll('[data-animate]').forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.filter = 'none';
      });
      break;

    case 1:
      // 精简模式
      globalParticles.destroy();
      cursorGlow.destroy();
      SECTIONS.forEach(s => {
        sectionFXMap.get(s.id)?.particles?.destroy();
      });
      // 简化入场：全部改为淡入
      document.querySelectorAll('.section').forEach(section => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(section.querySelectorAll('[data-animate]'), {
              opacity: 0, y: 20,
            }, {
              opacity: 1, y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
          once: true,
        });
      });
      break;

    case 2:
      // 运行时降级
      globalParticles.reduceCount(0.5);
      interactiveParticles.destroy();
      SECTIONS.forEach(s => {
        sectionFXMap.get(s.id)?.particles?.reduceCount(0.5);
      });
      break;

    case 3:
      // 全量 — 默认
      break;
  }
}
```

#### 5.3.4 CSS 降级 Hook

```css
/* 利用 data-fx-level 属性进行 CSS 降级 */
[data-fx-level="0"] .glow-text { text-shadow: none !important; }
[data-fx-level="0"] .cursor-glow { display: none !important; }
[data-fx-level="0"] .scanline-overlay { display: none !important; }
[data-fx-level="0"] .grid-texture { display: none !important; }
[data-fx-level="0"] .noise-overlay { display: none !important; }

[data-fx-level="1"] .scanline-overlay,
[data-fx-level="1"] .grid-texture,
[data-fx-level="1"] .noise-overlay,
[data-fx-level="1"] .cursor-glow {
  display: none !important;
}

[data-fx-level="1"] .section::before { opacity: 0.3 !important; }

[data-fx-level="2"] .scanline-overlay,
[data-fx-level="2"] .noise-overlay {
  display: none !important;
}
```

### 5.4 初始化流程

```typescript
// ── 应用启动序列 ──
async function initAnimationSystem() {
  // 1. 检测降级级别
  const level = detectLevel();

  // 2. 注册 GSAP 插件
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // 3. 禁用 CSS scroll-snap（GSAP 接管）
  document.documentElement.style.scrollSnapType = 'none';

  // 4. 初始化滚动状态机
  const scrollSM = new ScrollStateMachine();

  // 5. 初始化分页系统（pin + snap）
  initScrollSystem();

  // 6. 根据级别初始化特效
  if (level >= 3) {
    // 全量：粒子 + 光效 + 纹理
    initGlobalParticles();
    initInteractiveParticles();
    initCursorGlow();
  }
  if (level >= 2) {
    // 中等以上：入场时间线
    initSectionTimelines();
    initTransitions();
  }
  if (level >= 1) {
    // 精简以上：基础入场
    initBasicEntrance();
  }

  // 7. 初始化交互
  initKeyboardNav(scrollSM);
  initProgressIndicator();
  initMagneticButtons();

  // 8. 启动帧率监控
  if (level >= 2) {
    const renderer = new AdaptiveRenderer();
    gsap.ticker.add(() => renderer.tick());
  }

  // 9. 应用降级
  applyDegradation(level);

  // 10. 标记就绪
  document.documentElement.classList.add('fx-ready');
}

// DOM Ready 后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimationSystem);
} else {
  initAnimationSystem();
}
```

---

## 六、缓动函数速查

整理本方案使用的所有缓动函数及其适用场景。

| 缓动 | GSAP 名称 | 曲线特征 | 适用场景 |
|------|----------|---------|---------|
| 标准弹出 | `power2.out` | 快入慢出 | 通用入场动画 |
| 强力弹出 | `power3.out` | 更快入更慢出 | 卡片飞入、面板滑入 |
| 指数弹出 | `expo.out` | 极快入极慢出 | 高潮爆发、裂缝展开 |
| 弹性弹出 | `elastic.out(1, 0.5)` | 弹跳回弹 | 巨字入场、按钮弹出 |
| 回弹弹出 | `back.out(1.5)` | 过冲回弹 | 节点弹出、标签弹出 |
| 对称缓动 | `power2.inOut` | 慢入慢出 | 区块过渡、光效过渡 |
| 匀速 | `none` / `linear` | 恒速 | 轨道延伸、电流流动 |
| 快起长尾 | `power4.out` | 瞬起缓收 | 能量聚合爆开 |
| 弹性 hover | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性过冲 | hover 微动效 |
| 戏剧性 | `var(--ease-dramatic)` (V4 定义) | 高张力曲线 | 标题入场、高潮 |

---

_🎨 体验设计专家 · V6 全站动效升级方案完成。包含全站分页系统（CSS Snap + GSAP ScrollTrigger 双轨）、6 对区块过渡动画、7 个区块入场 GSAP 时间线（精确到每个元素的起始时间/持续时间/缓动函数/GSAP 参数）、4 类交互增强（鼠标光效/hover 弹性/进度指示器/键盘导航）、技术实现建议（库组合/帧预算/4 级降级策略）。_
