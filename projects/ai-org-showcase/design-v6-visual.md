# design-v6-visual.md — V6 科技感视觉特效方案

> 🎨 视觉设计专家产出 · 2026-03-17
>
> 基于：visual-spec-v4.md（Token 基线）· design-patch-visual-ui-v5.md（V5 补丁）· design-patch-animation-v5.md（V5 动效）· experience-design-v4.md（交互方案）
>
> 目标：**科技感拉满、视觉冲击最大化**。在 V4/V5 的克制美学基础上叠加发光、光晕、粒子、全息、渐变等视觉层，将官网从"高级克制"升级为"科技震撼"。

---

## 一、视觉层次结构图

V6 核心升级：从 V4 的**单层内容渲染**升级为**四层深度合成**。

```
┌─────────────────────────────────────────────────┐
│  Layer 4 — 前景动效层 (z: 30+)                   │
│  ├─ 交互粒子（鼠标跟随散开/聚拢）                  │
│  ├─ 光线束扫描（S1 Hero 专属）                    │
│  └─ hover 光晕增强                               │
├─────────────────────────────────────────────────┤
│  Layer 3 — 内容层 (z: 10-20)                     │
│  ├─ 文字（发光描边 / 辉光文字）                    │
│  ├─ 组件（卡片毛玻璃 / 按钮光晕）                  │
│  └─ SVG 拓扑图 / 时间线 / 架构图                  │
├─────────────────────────────────────────────────┤
│  Layer 2 — 背景特效层 (z: 1-9)                   │
│  ├─ 区块专属粒子系统（星空 / 数据节点 / 光晕）      │
│  ├─ 渐变光源（区块色调过渡）                       │
│  └─ 能量场 / 代码雨 / 色场碰撞                    │
├─────────────────────────────────────────────────┤
│  Layer 1 — 深层纹理层 (z: 0)                     │
│  ├─ 全局微粒子底层（缓慢漂浮光点）                  │
│  ├─ 网格底纹（透视线框）                           │
│  └─ 扫描线纹理（CRT 微妙版）                      │
└─────────────────────────────────────────────────┘
```

**Z-index 扩展 Token**：

```css
@theme {
  /* V4 基线保持不变 */
  --z-base:     0;
  --z-raised:   10;
  --z-sticky:   20;
  --z-overlay:  30;
  --z-tooltip:  40;
  --z-modal:    50;

  /* V6 新增 — 特效层级 */
  --z-texture:      -1;     /* 深层纹理（网格/扫描线） */
  --z-particles-bg:  1;     /* 全局背景粒子 */
  --z-fx-bg:         5;     /* 区块背景特效（渐变光源/能量场） */
  --z-fx-fg:        35;     /* 前景动效（交互粒子/光线束） */
}
```

---

## 二、全局视觉系统

### 2.1 色彩增强 — 区块色调旅程

在 V4 的 oklch 色彩体系基础上，为每个区块设计独立的 accent 色调，形成**色彩叙事弧线**：冷白开场 → 暖金高潮 → 多彩愿景 → 品牌收束。

```css
@theme {
  /* ── S1 Hero：冷蓝白（星空/无垠深空） ── */
  --color-s1-accent:      oklch(0.85 0.08 230);   /* 冰蓝白 */
  --color-s1-accent-glow: oklch(0.85 0.08 230 / 0.40);
  --color-s1-accent-dim:  oklch(0.85 0.08 230 / 0.08);
  --color-s1-particle:    oklch(0.90 0.05 230);   /* 星点颜色 — 偏白微蓝 */

  /* ── S2 拓扑图：靛蓝金（组织核心 — 与品牌色呼应） ── */
  --color-s2-accent:      oklch(0.70 0.15 265);   /* 复用 --color-accent */
  --color-s2-accent-glow: oklch(0.70 0.15 265 / 0.45);
  --color-s2-gold:        oklch(0.80 0.15 85);    /* 复用 --color-boss */
  --color-s2-gold-glow:   oklch(0.80 0.15 85 / 0.50);
  --color-s2-pulse:       oklch(0.75 0.12 265 / 0.60); /* 电流脉冲色 */
  --color-s2-hologram:    oklch(0.72 0.10 200 / 0.15); /* 全息投影底色 */

  /* ── S3 时间线：青绿（数据流/代码/成长） ── */
  --color-s3-accent:      oklch(0.75 0.14 170);   /* 青绿 */
  --color-s3-accent-glow: oklch(0.75 0.14 170 / 0.40);
  --color-s3-code-rain:   oklch(0.60 0.12 170 / 0.30); /* 代码雨字符色 */
  --color-s3-code-bright: oklch(0.80 0.14 170);   /* 代码雨高亮字符 */

  /* ── S4 对比：红蓝对冲（传统 vs AI 碰撞） ── */
  --color-s4-red:         oklch(0.55 0.18 15);    /* 暗红 — "传统方式" */
  --color-s4-red-glow:    oklch(0.55 0.18 15 / 0.35);
  --color-s4-blue:        oklch(0.72 0.16 250);   /* 亮蓝 — "AI 方式" */
  --color-s4-blue-glow:   oklch(0.72 0.16 250 / 0.45);
  --color-s4-clash:       oklch(0.80 0.20 280);   /* 碰撞交界闪烁色 */
  --color-s4-clash-glow:  oklch(0.80 0.20 280 / 0.60);

  /* ── S5 架构：蓝紫（蓝图/工程/系统） ── */
  --color-s5-accent:      oklch(0.65 0.15 285);   /* 蓝紫 */
  --color-s5-accent-glow: oklch(0.65 0.15 285 / 0.35);
  --color-s5-blueprint:   oklch(0.50 0.10 285 / 0.20); /* 蓝图线条色 */
  --color-s5-xray:        oklch(0.75 0.12 200 / 0.40); /* X光扫描光色 */

  /* ── S6 愿景：渐变多彩（宏大/可能性/未来） ── */
  --color-s6-gradient-start: oklch(0.70 0.15 265);   /* 靛蓝起点 */
  --color-s6-gradient-mid:   oklch(0.72 0.16 320);   /* 洋红中点 */
  --color-s6-gradient-end:   oklch(0.75 0.14 170);   /* 青绿终点 */
  --color-s6-burst:          oklch(0.90 0.10 85);     /* "答案是——组织" 爆发白金色 */
  --color-s6-burst-glow:     oklch(0.90 0.10 85 / 0.60);

  /* ── S7 CTA：品牌靛蓝收束 ── */
  --color-s7-accent:      oklch(0.70 0.15 265);   /* 回归品牌色 */
  --color-s7-accent-glow: oklch(0.70 0.15 265 / 0.50);
  --color-s7-field:       oklch(0.70 0.15 265 / 0.08); /* 能量场底色 */
}
```

**色彩叙事弧线**：

```
色温/饱和度
  暖/高 │                    ④红蓝    ⑥多彩
        │                   ╱    ╲  ╱    ╲
  中    │         ②靛蓝金 ╱  ⑤蓝紫╲╱      ⑦靛蓝
        │        ╱   ╲  ╱                   收束
  冷/低 │  ①冰蓝白  ③青绿
        └────────────────────────────────────────→ 滚动进度
```

### 2.2 光效系统

#### 2.2.1 全局光源

统一光源方向 **135°（左上角照射）**，所有光效元素遵循此方向。

```css
@theme {
  /* 全局光源方向 */
  --light-angle:        135deg;
  --light-origin:       top left;

  /* 全局环境光（subtle，始终存在） */
  --ambient-light: radial-gradient(
    ellipse 80% 60% at 20% 15%,
    oklch(0.25 0.03 265 / 0.15) 0%,
    transparent 70%
  );

  /* 区块切换过渡光效 */
  --section-light-transition: 1.2s var(--ease-dramatic);
}
```

#### 2.2.2 发光文字辉光参数

```css
@theme {
  /* 文字辉光 — 4 级 */
  --glow-text-subtle:   0 0 10px currentColor / 0.15,
                        0 0 20px currentColor / 0.08;
  --glow-text-medium:   0 0 10px currentColor / 0.25,
                        0 0 30px currentColor / 0.12,
                        0 0 60px currentColor / 0.05;
  --glow-text-strong:   0 0 10px currentColor / 0.40,
                        0 0 30px currentColor / 0.20,
                        0 0 60px currentColor / 0.10,
                        0 0 100px currentColor / 0.05;
  --glow-text-burst:    0 0 15px currentColor / 0.60,
                        0 0 40px currentColor / 0.30,
                        0 0 80px currentColor / 0.15,
                        0 0 150px currentColor / 0.08;
}
```

**实现**（CSS `text-shadow`）：

```css
/* 标题发光 */
.hero__title {
  color: var(--color-s1-accent);
  text-shadow: var(--glow-text-strong);
  animation: glow-pulse 4s var(--ease-in-out) infinite;
}

@keyframes glow-pulse {
  0%, 100% { text-shadow: var(--glow-text-medium); }
  50%      { text-shadow: var(--glow-text-strong); }
}
```

#### 2.2.3 Hover 光晕增强

```css
@theme {
  /* hover 状态追加光晕 */
  --hover-glow-card:    0 0 20px var(--color-accent-glow),
                        0 0 40px oklch(0.70 0.15 265 / 0.10);
  --hover-glow-button:  0 0 15px var(--color-accent-glow),
                        0 0 30px oklch(0.70 0.15 265 / 0.15);
  --hover-glow-node:    0 0 12px var(--color-accent-glow),
                        0 0 24px oklch(0.70 0.15 265 / 0.20);
}

/* 卡片 hover 升级 */
.card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--hover-glow-card);
  transition: box-shadow var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out);
}
```

#### 2.2.4 区块光效过渡

区块切换时，背景渐变光源平滑过渡到下一区块的色调。

```css
/* 每个 section 根元素 */
.section {
  position: relative;
}

/* 区块顶部光晕（从上一区块色调渐入当前色调） */
.section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 200px;
  background: radial-gradient(
    ellipse 100% 200px at 50% 0%,
    var(--section-accent-glow, transparent) 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: var(--z-fx-bg);
  opacity: 0.6;
}
```

### 2.3 粒子系统

#### 2.3.1 全局背景粒子（Layer 1）

始终存在的微小光点，营造深空氛围。用 **Canvas 2D** 实现（性能最优）。

```typescript
// ── 全局粒子配置 ──
const GLOBAL_PARTICLES = {
  count: 120,               // 粒子数量（桌面端）
  countMobile: 40,          // 移动端减半再减半
  minSize: 0.5,             // 最小半径 px
  maxSize: 1.5,             // 最大半径 px
  color: 'oklch(0.90 0.03 230)',  // 微蓝白
  opacity: { min: 0.1, max: 0.4 },
  speed: { min: 0.05, max: 0.2 }, // px/frame（60fps）
  twinkle: {
    enabled: true,
    frequency: 0.003,       // 每帧闪烁概率
    duration: 2000,          // 闪烁周期 ms
  },
  depth: {                  // 伪3D 深度（近大远小）
    layers: 3,
    parallaxFactor: [0.02, 0.05, 0.1], // 鼠标视差强度
  },
  canvas: {
    zIndex: 'var(--z-particles-bg)',
    position: 'fixed',
    pointerEvents: 'none',
  },
};
```

**渲染循环**：

```typescript
function renderGlobalParticles(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    // 深度视差
    const px = p.x + mouseOffsetX * p.parallax;
    const py = p.y + mouseOffsetY * p.parallax;

    // 闪烁（sinusoidal opacity modulation）
    const twinkle = p.twinklePhase
      ? Math.sin(Date.now() / p.twinkleDuration * Math.PI * 2) * 0.3 + 0.7
      : 1;

    ctx.globalAlpha = p.opacity * twinkle;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();

    // 缓慢漂浮
    p.y -= p.speed;
    if (p.y < -p.size) p.y = canvas.height + p.size;
  });
  requestAnimationFrame(() => renderGlobalParticles(ctx));
}
```

#### 2.3.2 交互粒子（Layer 4）

鼠标移动时，附近粒子**散开**；鼠标静止时，粒子**聚拢**回来。

```typescript
const INTERACTIVE_PARTICLES = {
  mouseInfluenceRadius: 150, // px — 鼠标影响半径
  repelForce: 2.5,           // 排斥力强度
  returnForce: 0.03,         // 回归力（弹簧系数）
  damping: 0.92,             // 阻尼（防止永久振荡）
  maxDisplacement: 80,       // 最大位移 px
};

// 每帧更新
function updateInteractiveParticle(p: Particle, mouse: Vec2) {
  const dx = p.x - mouse.x;
  const dy = p.y - mouse.y;
  const dist = Math.hypot(dx, dy);

  if (dist < INTERACTIVE_PARTICLES.mouseInfluenceRadius) {
    // 排斥
    const force = (1 - dist / INTERACTIVE_PARTICLES.mouseInfluenceRadius)
                  * INTERACTIVE_PARTICLES.repelForce;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  // 回归原位
  p.vx += (p.originX - p.x) * INTERACTIVE_PARTICLES.returnForce;
  p.vy += (p.originY - p.y) * INTERACTIVE_PARTICLES.returnForce;

  // 阻尼
  p.vx *= INTERACTIVE_PARTICLES.damping;
  p.vy *= INTERACTIVE_PARTICLES.damping;

  // 限制位移
  const disp = Math.hypot(p.x - p.originX, p.y - p.originY);
  if (disp > INTERACTIVE_PARTICLES.maxDisplacement) {
    const scale = INTERACTIVE_PARTICLES.maxDisplacement / disp;
    p.x = p.originX + (p.x - p.originX) * scale;
    p.y = p.originY + (p.y - p.originY) * scale;
  }

  p.x += p.vx;
  p.y += p.vy;
}
```

#### 2.3.3 区块专属粒子

| 区块 | 粒子类型 | 数量 | 形状 | 颜色 | 行为 |
|------|---------|------|------|------|------|
| S1 Hero | 星空粒子 | 200 | 圆点+十字星 | `--color-s1-particle` | 缓慢漂浮 + 闪烁 + 深度视差（3层） |
| S2 拓扑 | 数据节点粒子 | 60 | 小方块/菱形 | `--color-s2-pulse` | 沿连线路径流动 |
| S3 时间线 | 代码字符 | 80 | 半透明文字（0/1/{}） | `--color-s3-code-rain` | 竖向下落（矩阵雨） |
| S4 对比 | 碰撞火花 | 40 | 小圆 + 拖尾 | `--color-s4-clash` | 从中线向两侧爆裂 |
| S6 愿景 | 光晕粒子 | 50 | 柔和模糊圆 | 多彩渐变 | 缓慢扩散 + 脉冲（呼吸感） |
| S7 CTA | 收束粒子 | 80 | 圆点 | `--color-s7-accent` | 从四周向中心聚拢 |

---

## 三、区块视觉特效方案

### 3.1 S1 Hero — 星空深渊

**核心视觉**：无垠星空 + 发光标题 + 光线束扫描，营造"站在深空边缘俯瞰"的震撼感。

#### 3.1.1 星空粒子系统

```typescript
const S1_STAR_FIELD = {
  // 三层深度星空
  layers: [
    { count: 120, size: [0.3, 0.8],  speed: 0.02, opacity: [0.15, 0.30], parallax: 0.01 }, // 远景
    { count: 60,  size: [0.8, 1.5],  speed: 0.05, opacity: [0.30, 0.50], parallax: 0.03 }, // 中景
    { count: 20,  size: [1.5, 2.5],  speed: 0.08, opacity: [0.50, 0.80], parallax: 0.06 }, // 近景
  ],
  // 十字星闪烁（仅近景层部分粒子）
  crossStar: {
    probability: 0.15,           // 近景粒子中 15% 为十字星
    armLength: 6,                // 光芒臂长 px
    armWidth: 0.5,               // 光芒臂宽 px
    rotationSpeed: 0.005,        // 缓慢旋转 rad/frame
    pulseRange: [0.6, 1.0],      // 亮度脉动范围
    pulseDuration: 3000,         // 脉动周期 ms
  },
  color: 'oklch(0.90 0.05 230)',
  canvas: {
    blend: 'screen',             // 混合模式
  },
};
```

#### 3.1.2 标题发光描边动画

```css
/* 主标题 — 发光描边 + 逐字显现 */
.hero__title {
  font-size: var(--fs-display);
  font-weight: var(--fw-bold);
  color: transparent;
  background: linear-gradient(
    135deg,
    var(--color-s1-accent) 0%,
    oklch(0.95 0.03 230) 50%,
    var(--color-s1-accent) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  /* 发光 — 用 filter 叠加（因为 text 是 transparent） */
  filter: drop-shadow(0 0 10px var(--color-s1-accent-glow))
          drop-shadow(0 0 30px var(--color-s1-accent-glow));
  /* 入场动画 */
  animation:
    hero-text-glow 4s var(--ease-in-out) infinite,
    hero-text-reveal 1.5s var(--ease-dramatic) forwards;
}

@keyframes hero-text-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px var(--color-s1-accent-glow))
            drop-shadow(0 0 25px oklch(0.85 0.08 230 / 0.20));
  }
  50% {
    filter: drop-shadow(0 0 15px var(--color-s1-accent-glow))
            drop-shadow(0 0 50px oklch(0.85 0.08 230 / 0.35));
  }
}

@keyframes hero-text-reveal {
  from {
    opacity: 0;
    transform: translateY(var(--offset-medium));
    filter: blur(12px) drop-shadow(0 0 0px transparent);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px) drop-shadow(0 0 10px var(--color-s1-accent-glow))
            drop-shadow(0 0 30px var(--color-s1-accent-glow));
  }
}
```

#### 3.1.3 光线束扫描

一束从左上角射入的光线，缓慢扫过页面，营造"聚光灯搜寻"的感觉。

```css
.hero__light-beam {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: var(--z-fx-bg);
  overflow: hidden;
}

.hero__light-beam::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 300%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(0.85 0.08 230 / 0.04) 30%,
    oklch(0.85 0.08 230 / 0.08) 50%,
    oklch(0.85 0.08 230 / 0.04) 70%,
    transparent 100%
  );
  transform: rotate(-35deg);
  animation: light-beam-sweep 8s var(--ease-in-out) infinite;
}

@keyframes light-beam-sweep {
  0%   { transform: translateX(-400px) rotate(-35deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(calc(100vw + 400px)) rotate(-35deg); opacity: 0; }
}
```

---

### 3.2 S2 拓扑图 — 全息网络

**核心视觉**：全息投影质感 + 节点发光脉冲 + 连线电流流动，拓扑图看起来像悬浮在空中的全息投影。

#### 3.2.1 全息投影质感

```css
/* 拓扑图容器 — 全息投影底座 */
.topology__hologram {
  position: relative;
  /* 全息底色 */
  background:
    /* 扫描线 — 水平 */
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      oklch(0.70 0.10 265 / 0.03) 2px,
      oklch(0.70 0.10 265 / 0.03) 3px
    ),
    /* 微噪点（全息抖动感） */
    var(--color-s2-hologram);
  /* 色散效果 — 轻微 RGB 偏移 */
  filter: url(#hologram-chromatic);
  /* 边缘柔化 */
  mask-image: radial-gradient(
    ellipse 90% 85% at 50% 50%,
    black 60%,
    transparent 100%
  );
}

/* SVG 滤镜 — 色散 */
<svg style="position:absolute;width:0;height:0">
  <defs>
    <filter id="hologram-chromatic">
      <feOffset in="SourceGraphic" dx="0.5" dy="0" result="red-shift">
        <feColorMatrix type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </feOffset>
      <feOffset in="SourceGraphic" dx="-0.5" dy="0" result="blue-shift">
        <feColorMatrix type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </feOffset>
      <feBlend in="red-shift" in2="blue-shift" mode="screen" />
    </filter>
  </defs>
</svg>

/* 全息扫描线动画（竖向缓慢下移） */
.topology__hologram::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    oklch(0.70 0.15 265 / 0.06) 50%,
    transparent 100%
  );
  height: 30%;
  animation: hologram-scan 4s linear infinite;
  pointer-events: none;
}

@keyframes hologram-scan {
  0%   { transform: translateY(-30%); }
  100% { transform: translateY(130%); }
}
```

#### 3.2.2 节点发光脉冲

```css
/* 节点 — 核心发光（在 V5 drop-shadow 基础上增强） */
.topology__node {
  filter: drop-shadow(0 0 8px var(--color-s2-accent-glow));
  animation: node-pulse 3s var(--ease-in-out) infinite;
}

/* 脉冲 — 呼吸式亮暗循环 */
@keyframes node-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 6px oklch(0.70 0.15 265 / 0.30));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 12px oklch(0.70 0.15 265 / 0.50))
            drop-shadow(0 0 24px oklch(0.70 0.15 265 / 0.15));
    transform: scale(1.03);
  }
}

/* Boss 节点 — 更强烈的金色脉冲 */
.topology__node--boss {
  filter: drop-shadow(0 0 12px var(--color-s2-gold-glow));
  animation: boss-pulse 2.5s var(--ease-in-out) infinite;
}

@keyframes boss-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 10px oklch(0.80 0.15 85 / 0.30))
            drop-shadow(0 0 20px oklch(0.80 0.15 85 / 0.10));
  }
  50% {
    filter: drop-shadow(0 0 18px oklch(0.80 0.15 85 / 0.55))
            drop-shadow(0 0 40px oklch(0.80 0.15 85 / 0.20));
  }
}
```

#### 3.2.3 连线电流流动

```css
/* SVG 连线 — stroke-dasharray 驱动的电流动画 */
.topology__edge {
  stroke: var(--color-s2-accent);
  stroke-width: 1.5;
  stroke-dasharray: 8 12;
  stroke-dashoffset: 0;
  opacity: 0.6;
  animation: edge-current 2s linear infinite;
}

@keyframes edge-current {
  to { stroke-dashoffset: -20; }
}

/* 电流流光 — 叠加层，高亮短段沿路径流动 */
.topology__edge-glow {
  stroke: var(--color-s2-pulse);
  stroke-width: 3;
  stroke-dasharray: 15 100;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  filter: blur(2px);
  animation: edge-glow-flow 3s linear infinite;
}

@keyframes edge-glow-flow {
  to { stroke-dashoffset: -115; }
}
```

**数据节点粒子**（沿连线路径流动）：

```typescript
const S2_DATA_PARTICLES = {
  count: 60,
  size: [1, 3],
  shape: 'square',             // 小方块（数据感）
  color: 'var(--color-s2-pulse)',
  speed: 1.5,                  // px/frame
  pathFollow: true,            // 沿 SVG path 运动
  trail: {
    length: 5,                 // 拖尾长度
    fadeRate: 0.2,             // 拖尾衰减
  },
  glow: {
    blur: 4,
    color: 'var(--color-s2-accent-glow)',
  },
};
```

---

### 3.3 S3 时间线 — 数据流瀑布

**核心视觉**：竖向代码雨背景 + 时间线光速推进 + 卡片能量展开。

#### 3.3.1 代码雨背景（矩阵字符流）

```typescript
const S3_CODE_RAIN = {
  columns: 40,                 // 桌面端字符列数
  columnsMobile: 15,           // 移动端
  chars: '01{}[]<>/\\|=+-*&^%$#@!~`?:;'.split(''),
  fontSize: 14,                // px
  fontFamily: 'var(--font-mono)',
  color: {
    normal: 'var(--color-s3-code-rain)',    // oklch(0.60 0.12 170 / 0.30)
    bright: 'var(--color-s3-code-bright)',   // oklch(0.80 0.14 170) — 头部字符
  },
  speed: { min: 1, max: 3 },  // 下落速度 px/frame
  fadeLength: 15,              // 拖尾字符数
  brightHead: true,            // 列头部最亮
  randomReset: true,           // 随机重置列位置
  canvas: {
    opacity: 0.4,              // 整体透明度（不喧宾夺主）
    zIndex: 'var(--z-fx-bg)',
    mixBlendMode: 'screen',
  },
};
```

**渲染逻辑**：

```typescript
function renderCodeRain(ctx: CanvasRenderingContext2D) {
  // 半透明黑覆盖（产生拖尾效果）
  ctx.fillStyle = 'oklch(0.13 0.01 270 / 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  columns.forEach((col, i) => {
    const char = S3_CODE_RAIN.chars[Math.floor(Math.random() * S3_CODE_RAIN.chars.length)];
    const x = i * S3_CODE_RAIN.fontSize;
    const y = col.y;

    // 头部字符高亮
    ctx.fillStyle = S3_CODE_RAIN.color.bright;
    ctx.font = `${S3_CODE_RAIN.fontSize}px ${S3_CODE_RAIN.fontFamily}`;
    ctx.fillText(char, x, y);

    // 下落
    col.y += col.speed;
    if (col.y > canvas.height && Math.random() > 0.98) {
      col.y = -S3_CODE_RAIN.fontSize;
    }
  });
}
```

#### 3.3.2 时间线光速推进

时间线的竖线在滚动触发时，从顶部"光速"向下延伸。

```css
/* 时间线主轴 — 从短到长的光速延伸 */
.timeline__track {
  width: 2px;
  background: linear-gradient(
    180deg,
    var(--color-s3-accent) 0%,
    var(--color-s3-accent-glow) 100%
  );
  height: 0%;
  transition: none;
  /* GSAP 控制 height 0% → 100% */
}

/* 轨道发光 */
.timeline__track::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 6px;
  margin-left: -2px;
  background: var(--color-s3-accent-glow);
  filter: blur(4px);
  animation: track-glow-pulse 2s var(--ease-in-out) infinite;
}

@keyframes track-glow-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
```

**GSAP 控制**：

```typescript
// 时间线轨道延伸 — ScrollTrigger scrub 驱动
gsap.to('.timeline__track', {
  height: '100%',
  scrollTrigger: {
    trigger: '.timeline',
    start: 'top 60%',
    end: 'bottom 40%',
    scrub: 0.5,
  },
  ease: 'none',
});
```

#### 3.3.3 卡片能量展开

时间线步骤卡片点击展开时，伴随"能量场展开"视效。

```css
/* 展开动画 — 能量场 */
.timeline__card[data-expanded="true"] {
  animation: card-energy-expand 0.6s var(--ease-dramatic) forwards;
}

@keyframes card-energy-expand {
  0% {
    box-shadow: 0 0 0px var(--color-s3-accent-glow);
    border-color: var(--color-border-subtle);
  }
  30% {
    box-shadow: 0 0 20px var(--color-s3-accent-glow),
                0 0 40px oklch(0.75 0.14 170 / 0.10);
    border-color: var(--color-s3-accent);
  }
  100% {
    box-shadow: 0 0 8px oklch(0.75 0.14 170 / 0.15);
    border-color: oklch(0.75 0.14 170 / 0.30);
  }
}
```

---

### 3.4 S4 对比 — 双色场碰撞

**核心视觉**：红暗（传统）vs 蓝亮（AI）双色场，中间交界处能量碰撞闪烁。

#### 3.4.1 双色场背景

```css
/* 对比区块 — 双色场 */
.comparison {
  position: relative;
  overflow: hidden;
}

.comparison__field {
  position: absolute;
  inset: 0;
  z-index: var(--z-fx-bg);
  pointer-events: none;
  background:
    /* 左半场 — 暗红 */
    radial-gradient(
      ellipse 60% 80% at 25% 50%,
      var(--color-s4-red-glow) 0%,
      transparent 70%
    ),
    /* 右半场 — 亮蓝 */
    radial-gradient(
      ellipse 60% 80% at 75% 50%,
      var(--color-s4-blue-glow) 0%,
      transparent 70%
    );
}

/* 中线碰撞闪烁 */
.comparison__clash-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  margin-left: -2px;
  background: var(--color-s4-clash);
  filter: blur(2px);
  z-index: var(--z-fx-bg);
  animation: clash-flicker 0.15s steps(2) infinite;
}

@keyframes clash-flicker {
  0%, 100% { opacity: 0.6; filter: blur(2px); }
  50%      { opacity: 1.0; filter: blur(4px); }
}
```

#### 3.4.2 VS 能量对撞效果

中间"VS"文字的特效。

```css
.comparison__vs {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: calc(var(--z-fx-bg) + 1);

  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: var(--fw-bold);
  color: var(--color-s4-clash);
  text-shadow: var(--glow-text-burst);

  /* 能量圈 */
  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    border: 2px solid var(--color-s4-clash);
    animation: vs-ring-pulse 1.5s var(--ease-in-out) infinite;
  }
  &::after {
    content: '';
    position: absolute;
    inset: -35px;
    border-radius: 50%;
    border: 1px solid oklch(0.80 0.20 280 / 0.30);
    animation: vs-ring-pulse 1.5s var(--ease-in-out) infinite 0.3s;
  }
}

@keyframes vs-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 1; }
}
```

#### 3.4.3 扫描线逐行揭示

对比内容从顶部向下逐行揭示，伴随扫描线。

```css
.comparison__content {
  position: relative;
  /* GSAP clip-path 驱动逐行揭示 */
  clip-path: inset(100% 0 0 0);
}

/* 扫描线 — 跟随揭示前沿 */
.comparison__scanline {
  position: absolute;
  left: 0; right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-s4-clash) 20%,
    oklch(1 0 0 / 0.8) 50%,
    var(--color-s4-clash) 80%,
    transparent 100%
  );
  filter: blur(1px);
  box-shadow: 0 0 12px var(--color-s4-clash-glow);
  /* top 值由 GSAP 同步 clip-path 进度 */
}
```

**GSAP 实现**：

```typescript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.comparison',
    start: 'top 40%',
    end: 'bottom 60%',
    scrub: 0.8,
  },
});

// 左侧（传统）从上向下揭示
tl.to('.comparison__left', {
  clipPath: 'inset(0 0 0 0)',
  duration: 0.5,
}, 0);

// 右侧（AI）延迟 0.2 秒，从上向下揭示
tl.to('.comparison__right', {
  clipPath: 'inset(0 0 0 0)',
  duration: 0.5,
}, 0.2);

// 扫描线跟随
tl.to('.comparison__scanline', {
  top: '100%',
  duration: 0.7,
}, 0);
```

---

### 3.5 S5 架构 — 蓝图透视

**核心视觉**：建筑蓝图风格线条 + X光扫描揭示 + 层级光纤连接。

#### 3.5.1 蓝图线条背景

```css
/* 架构区块 — 蓝图底纹 */
.architecture {
  background:
    /* 主网格 — 粗线 */
    linear-gradient(
      0deg,
      var(--color-s5-blueprint) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--color-s5-blueprint) 1px,
      transparent 1px
    ),
    /* 副网格 — 细线 */
    linear-gradient(
      0deg,
      oklch(0.50 0.10 285 / 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      oklch(0.50 0.10 285 / 0.08) 1px,
      transparent 1px
    ),
    var(--color-bg);
  background-size:
    80px 80px,
    80px 80px,
    20px 20px,
    20px 20px;
}
```

#### 3.5.2 X光扫描揭示

架构层级在滚动时，被一道水平扫描线"扫描"后才显现，模拟 X光/CT 扫描效果。

```css
/* 架构卡片初始态 — 只有轮廓（蓝图线条） */
.architecture__layer {
  border: 1px solid var(--color-s5-blueprint);
  background: transparent;
  color: var(--color-s5-blueprint);
  transition: all 0.8s var(--ease-dramatic);
}

/* 扫描后 — 填充内容 */
.architecture__layer.--scanned {
  background: var(--color-bg-surface);
  border-color: var(--color-s5-accent);
  color: var(--color-text);
  box-shadow: 0 0 15px var(--color-s5-accent-glow),
              inset 0 0 30px oklch(0.65 0.15 285 / 0.05);
}

/* X光扫描线 */
.architecture__xray-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-s5-xray) 10%,
    oklch(0.90 0.05 200) 50%,
    var(--color-s5-xray) 90%,
    transparent 100%
  );
  filter: blur(1px);
  box-shadow: 0 0 20px var(--color-s5-xray),
              0 0 40px oklch(0.75 0.12 200 / 0.20);
  animation: xray-scan-pass 2s var(--ease-out) forwards;
}

@keyframes xray-scan-pass {
  from { top: 0%; opacity: 1; }
  to   { top: 100%; opacity: 0; }
}
```

#### 3.5.3 层级光纤连接

架构层级之间的连接线，模拟光纤数据传输。

```css
/* 层级连接线 — SVG 路径 */
.architecture__fiber {
  stroke: var(--color-s5-accent);
  stroke-width: 1;
  stroke-dasharray: 5 10;
  opacity: 0.4;
}

/* 光纤流光 */
.architecture__fiber-glow {
  stroke: oklch(0.80 0.12 285);
  stroke-width: 3;
  stroke-dasharray: 20 80;
  stroke-linecap: round;
  filter: blur(2px);
  animation: fiber-flow 2.5s linear infinite;
}

@keyframes fiber-flow {
  to { stroke-dashoffset: -100; }
}
```

---

### 3.6 S6 愿景 — 墨水光晕

**核心视觉**：文字墨水扩散/凝聚 + 背景光晕脉冲（呼吸感）+ "答案是——组织" 爆发特效。

#### 3.6.1 文字墨水扩散

每段文字出现时，从模糊扩散状态凝聚为清晰。

```css
/* 愿景文字 — 墨水凝聚入场 */
.vision__line {
  opacity: 0;
  filter: blur(15px);
  transform: scale(1.05);
  /* 由 GSAP scrub 驱动 */
}

.vision__line.--visible {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
  transition: all 1s var(--ease-dramatic);
}
```

**GSAP scrub 精确控制**：

```typescript
lines.forEach((line, i) => {
  const startAt = (i / totalLines) * 0.85;
  tl.fromTo(line,
    { opacity: 0, filter: 'blur(15px)', scale: 1.05 },
    {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: 0.15,
      ease: 'power2.out',
    },
    startAt
  );
});
```

#### 3.6.2 背景光晕脉冲（呼吸感）

```css
.vision__bg-aura {
  position: absolute;
  inset: 0;
  z-index: var(--z-fx-bg);
  pointer-events: none;
  background: radial-gradient(
    ellipse 70% 60% at 50% 50%,
    oklch(0.25 0.08 265 / 0.15) 0%,
    oklch(0.20 0.06 320 / 0.08) 30%,
    oklch(0.18 0.04 170 / 0.04) 60%,
    transparent 100%
  );
  animation: aura-breathe 6s var(--ease-in-out) infinite;
}

@keyframes aura-breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.8;
  }
}
```

#### 3.6.3 "答案是——组织" 爆发特效

这是整个页面的情感高潮。文字出现时伴随**能量爆发**。

```css
/* 高潮句 — 基础样式 */
.vision__climax {
  font-size: var(--fs-emphasis-lg);
  font-weight: var(--fw-bold);
  color: var(--color-s6-burst);
  text-align: center;
  position: relative;
}

/* 爆发动画序列（GSAP 时间线触发） */
@keyframes climax-burst {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(20px);
    text-shadow: none;
  }
  40% {
    opacity: 1;
    transform: scale(1.05);
    filter: blur(0px);
    text-shadow: var(--glow-text-burst);
  }
  60% {
    transform: scale(1.02);
    text-shadow: 0 0 20px var(--color-s6-burst-glow),
                 0 0 60px var(--color-s6-burst-glow),
                 0 0 120px oklch(0.90 0.10 85 / 0.30);
  }
  100% {
    transform: scale(1);
    text-shadow: var(--glow-text-strong);
  }
}
```

**爆发冲击波**（圆环扩散）：

```css
.vision__climax::after {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  width: 0; height: 0;
  border-radius: 50%;
  border: 2px solid var(--color-s6-burst);
  opacity: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* GSAP 触发时添加 */
.vision__climax.--burst::after {
  animation: shockwave 1.2s var(--ease-out) forwards;
}

@keyframes shockwave {
  0% {
    width: 0; height: 0;
    opacity: 0.8;
    border-width: 3px;
  }
  100% {
    width: 600px; height: 600px;
    opacity: 0;
    border-width: 1px;
  }
}
```

**GSAP 高潮序列**：

```typescript
const climaxTl = gsap.timeline({ paused: true });

// Step 1: 屏幕微闪白
climaxTl.to('.vision', {
  '--flash-opacity': 0.15,
  duration: 0.1,
  yoyo: true,
  repeat: 1,
});

// Step 2: 文字爆发入场
climaxTl.fromTo('.vision__climax', {
  opacity: 0, scale: 0.8, filter: 'blur(20px)',
}, {
  opacity: 1, scale: 1, filter: 'blur(0px)',
  duration: 1.2,
  ease: 'expo.out',
}, 0.2);

// Step 3: 辉光递增
climaxTl.to('.vision__climax', {
  textShadow: '0 0 20px var(--color-s6-burst-glow), 0 0 80px var(--color-s6-burst-glow)',
  duration: 0.8,
  ease: 'power2.in',
}, 0.5);

// Step 4: 冲击波
climaxTl.add(() => {
  document.querySelector('.vision__climax')?.classList.add('--burst');
}, 0.6);

// Step 5: 背景光晕瞬间增强
climaxTl.to('.vision__bg-aura', {
  scale: 1.3,
  opacity: 1,
  duration: 0.6,
  ease: 'power2.out',
}, 0.4);

// Step 6: 一切回归平静
climaxTl.to('.vision__bg-aura', {
  scale: 1,
  opacity: 0.6,
  duration: 2,
  ease: 'power3.out',
}, 1.2);
```

---

### 3.7 S7 CTA — 能量收束

**核心视觉**：能量场从四周收束到中心 + 品牌名发光增强 + 按钮悬浮光晕。

#### 3.7.1 能量场收束

```css
/* CTA 区块 — 收束能量场 */
.cta__energy-field {
  position: absolute;
  inset: 0;
  z-index: var(--z-fx-bg);
  pointer-events: none;
  /* 四角向中心收束的径向渐变 */
  background: radial-gradient(
    circle at 50% 50%,
    var(--color-s7-field) 0%,
    transparent 60%
  );
  animation: field-converge 4s var(--ease-in-out) infinite;
}

@keyframes field-converge {
  0%, 100% {
    background-size: 200% 200%;
    opacity: 0.5;
  }
  50% {
    background-size: 100% 100%;
    opacity: 0.8;
  }
}
```

**收束粒子（Canvas）**：

```typescript
const S7_CONVERGE_PARTICLES = {
  count: 80,
  size: [0.5, 2],
  color: 'var(--color-s7-accent)',
  behavior: {
    // 粒子从容器边缘生成，向中心汇聚
    spawnArea: 'edge',           // 边缘生成
    target: { x: '50%', y: '50%' },
    speed: { min: 0.3, max: 1.2 },
    arrivalAction: 'respawn',    // 到达中心后重新从边缘生成
    spiral: true,                // 螺旋路径（不是直线）
    spiralTightness: 0.02,
  },
  trail: {
    length: 8,
    fadeRate: 0.15,
    color: 'var(--color-s7-accent-glow)',
  },
  glow: {
    blur: 3,
    color: 'var(--color-s7-accent-glow)',
  },
};
```

#### 3.7.2 品牌名发光增强

```css
.cta__brand-name {
  font-size: var(--fs-h1);
  font-weight: var(--fw-bold);
  font-family: var(--font-mono);
  color: var(--color-accent);
  text-shadow: var(--glow-text-strong);
  animation: brand-glow-enhance 3s var(--ease-in-out) infinite;
}

@keyframes brand-glow-enhance {
  0%, 100% {
    text-shadow: var(--glow-text-medium);
    filter: brightness(1);
  }
  50% {
    text-shadow: var(--glow-text-strong);
    filter: brightness(1.15);
  }
}
```

#### 3.7.3 按钮悬浮光晕

```css
/* CTA 按钮 — 悬浮效果增强 */
.cta__button {
  position: relative;
  z-index: var(--z-raised);
  animation: button-float 3s var(--ease-in-out) infinite;
}

@keyframes button-float {
  0%, 100% {
    transform: translateY(0);
    box-shadow: var(--shadow-glow-sm);
  }
  50% {
    transform: translateY(-4px);
    box-shadow: var(--shadow-glow-md),
                0 8px 25px oklch(0 0 0 / 0.3);
  }
}

/* hover 时光晕爆发 */
.cta__button:hover {
  box-shadow: var(--shadow-glow-lg),
              0 0 60px var(--color-s7-accent-glow),
              0 10px 30px oklch(0 0 0 / 0.4);
  transform: translateY(-6px);
  transition: all var(--dur-fast) var(--ease-spring);
}

/* 按钮底部光圈 */
.cta__button::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 10%; right: 10%;
  height: 20px;
  background: var(--color-s7-accent-glow);
  filter: blur(12px);
  border-radius: 50%;
  opacity: 0.4;
  animation: button-shadow-pulse 3s var(--ease-in-out) infinite;
}

@keyframes button-shadow-pulse {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50%      { opacity: 0.5; transform: scaleX(1); }
}
```

---

## 四、纹理和材质系统

### 4.1 毛玻璃/磨砂面板

在 V4 的 `--color-bg-surface` 基础上增加 `backdrop-filter` 磨砂效果。

```css
@theme {
  /* 磨砂面板 Token */
  --glass-blur:    12px;
  --glass-saturate: 1.2;
  --glass-bg:      oklch(0.15 0.01 270 / 0.70);
  --glass-border:  oklch(0.40 0.02 265 / 0.15);
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

/* 升级版 — 带光泽的磨砂 */
.glass-panel--sheen {
  background:
    linear-gradient(
      var(--light-angle),
      oklch(0.25 0.02 265 / 0.08) 0%,
      transparent 50%
    ),
    var(--glass-bg);
}
```

### 4.2 扫描线纹理（CRT 微妙版）

```css
@theme {
  --scanline-opacity: 0.03;
  --scanline-gap:     3px;
}

/* 全局扫描线覆盖层（body::after 或独立 div） */
.scanline-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-texture);
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent var(--scanline-gap),
    oklch(0 0 0 / var(--scanline-opacity)) var(--scanline-gap),
    oklch(0 0 0 / var(--scanline-opacity)) calc(var(--scanline-gap) + 1px)
  );
  /* 可选：微妙的CRT弧形 */
  /* border-radius: 20% / 10%; */
}
```

### 4.3 网格底纹（透视线框）

```css
@theme {
  --grid-color:      oklch(0.30 0.02 265 / 0.08);
  --grid-color-bold: oklch(0.35 0.03 265 / 0.12);
  --grid-size:       40px;
  --grid-size-bold:  200px;
}

/* 全局网格底纹 */
.grid-texture {
  position: fixed;
  inset: 0;
  z-index: var(--z-texture);
  pointer-events: none;
  background:
    /* 粗网格 */
    linear-gradient(90deg, var(--grid-color-bold) 1px, transparent 1px),
    linear-gradient(0deg, var(--grid-color-bold) 1px, transparent 1px),
    /* 细网格 */
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px),
    linear-gradient(0deg, var(--grid-color) 1px, transparent 1px);
  background-size:
    var(--grid-size-bold) var(--grid-size-bold),
    var(--grid-size-bold) var(--grid-size-bold),
    var(--grid-size) var(--grid-size),
    var(--grid-size) var(--grid-size);
  /* 透视消失效果 — 从底部向上逐渐消失 */
  mask-image: linear-gradient(
    to top,
    black 0%,
    oklch(0 0 0 / 0.5) 30%,
    oklch(0 0 0 / 0.2) 60%,
    transparent 100%
  );
  opacity: 0.5;
}
```

### 4.4 噪点纹理（微质感）

```css
/* SVG 噪点滤镜 */
<svg style="position:absolute;width:0;height:0">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>

.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-texture) + 1);
  pointer-events: none;
  filter: url(#noise);
  opacity: 0.015;          /* 极微妙 — 只在仔细看时感知到 */
  mix-blend-mode: overlay;
}
```

---

## 五、新增 Design Token 完整汇总

### 5.1 色彩 Token（V6 新增）

```css
@theme {
  /* ── 区块色调 Token ── */
  /* S1 Hero */
  --color-s1-accent:        oklch(0.85 0.08 230);
  --color-s1-accent-glow:   oklch(0.85 0.08 230 / 0.40);
  --color-s1-accent-dim:    oklch(0.85 0.08 230 / 0.08);
  --color-s1-particle:      oklch(0.90 0.05 230);
  /* S2 拓扑图 */
  --color-s2-accent:        oklch(0.70 0.15 265);
  --color-s2-accent-glow:   oklch(0.70 0.15 265 / 0.45);
  --color-s2-gold:          oklch(0.80 0.15 85);
  --color-s2-gold-glow:     oklch(0.80 0.15 85 / 0.50);
  --color-s2-pulse:         oklch(0.75 0.12 265 / 0.60);
  --color-s2-hologram:      oklch(0.72 0.10 200 / 0.15);
  /* S3 时间线 */
  --color-s3-accent:        oklch(0.75 0.14 170);
  --color-s3-accent-glow:   oklch(0.75 0.14 170 / 0.40);
  --color-s3-code-rain:     oklch(0.60 0.12 170 / 0.30);
  --color-s3-code-bright:   oklch(0.80 0.14 170);
  /* S4 对比 */
  --color-s4-red:           oklch(0.55 0.18 15);
  --color-s4-red-glow:      oklch(0.55 0.18 15 / 0.35);
  --color-s4-blue:          oklch(0.72 0.16 250);
  --color-s4-blue-glow:     oklch(0.72 0.16 250 / 0.45);
  --color-s4-clash:         oklch(0.80 0.20 280);
  --color-s4-clash-glow:    oklch(0.80 0.20 280 / 0.60);
  /* S5 架构 */
  --color-s5-accent:        oklch(0.65 0.15 285);
  --color-s5-accent-glow:   oklch(0.65 0.15 285 / 0.35);
  --color-s5-blueprint:     oklch(0.50 0.10 285 / 0.20);
  --color-s5-xray:          oklch(0.75 0.12 200 / 0.40);
  /* S6 愿景 */
  --color-s6-gradient-start: oklch(0.70 0.15 265);
  --color-s6-gradient-mid:   oklch(0.72 0.16 320);
  --color-s6-gradient-end:   oklch(0.75 0.14 170);
  --color-s6-burst:          oklch(0.90 0.10 85);
  --color-s6-burst-glow:     oklch(0.90 0.10 85 / 0.60);
  /* S7 CTA */
  --color-s7-accent:        oklch(0.70 0.15 265);
  --color-s7-accent-glow:   oklch(0.70 0.15 265 / 0.50);
  --color-s7-field:         oklch(0.70 0.15 265 / 0.08);

  /* ── 光效 Token ── */
  --light-angle:              135deg;
  --light-origin:             top left;
  --glow-text-subtle:         0 0 10px currentColor / 0.15,
                              0 0 20px currentColor / 0.08;
  --glow-text-medium:         0 0 10px currentColor / 0.25,
                              0 0 30px currentColor / 0.12,
                              0 0 60px currentColor / 0.05;
  --glow-text-strong:         0 0 10px currentColor / 0.40,
                              0 0 30px currentColor / 0.20,
                              0 0 60px currentColor / 0.10,
                              0 0 100px currentColor / 0.05;
  --glow-text-burst:          0 0 15px currentColor / 0.60,
                              0 0 40px currentColor / 0.30,
                              0 0 80px currentColor / 0.15,
                              0 0 150px currentColor / 0.08;
  --hover-glow-card:          0 0 20px var(--color-accent-glow),
                              0 0 40px oklch(0.70 0.15 265 / 0.10);
  --hover-glow-button:        0 0 15px var(--color-accent-glow),
                              0 0 30px oklch(0.70 0.15 265 / 0.15);
  --hover-glow-node:          0 0 12px var(--color-accent-glow),
                              0 0 24px oklch(0.70 0.15 265 / 0.20);

  /* ── 纹理 Token ── */
  --glass-blur:               12px;
  --glass-saturate:           1.2;
  --glass-bg:                 oklch(0.15 0.01 270 / 0.70);
  --glass-border:             oklch(0.40 0.02 265 / 0.15);
  --scanline-opacity:         0.03;
  --scanline-gap:             3px;
  --grid-color:               oklch(0.30 0.02 265 / 0.08);
  --grid-color-bold:          oklch(0.35 0.03 265 / 0.12);
  --grid-size:                40px;
  --grid-size-bold:           200px;

  /* ── Z-index 扩展 ── */
  --z-texture:                -1;
  --z-particles-bg:           1;
  --z-fx-bg:                  5;
  --z-fx-fg:                  35;

  /* ── 阴影扩展 ── */
  --shadow-glow-xl:           0 0 60px oklch(0.70 0.15 265 / 0.45),
                              0 0 120px oklch(0.70 0.15 265 / 0.15);
}
```

### 5.2 动效 Token 扩展（V6 新增）

```css
@theme {
  /* 粒子系统帧率 */
  --particle-fps:        60;
  --particle-fps-mobile: 30;

  /* 特效时长 */
  --dur-glow-pulse:      4s;    /* 光晕脉冲周期 */
  --dur-particle-twinkle: 2s;   /* 粒子闪烁周期 */
  --dur-light-sweep:     8s;    /* 光束扫描周期 */
  --dur-current-flow:    2s;    /* 电流流动周期 */
  --dur-hologram-scan:   4s;    /* 全息扫描线周期 */
  --dur-code-rain:       0.05s; /* 代码雨帧率间隔 */
  --dur-shockwave:       1.2s;  /* 冲击波扩散 */
  --dur-field-breathe:   6s;    /* 能量场呼吸 */
  --dur-button-float:    3s;    /* 按钮悬浮 */

  /* 特效缓动 */
  --ease-glow:           var(--ease-in-out);
  --ease-burst:          cubic-bezier(0.08, 0.82, 0.17, 1); /* 极速起步+长尾 */
}
```

---

## 六、性能守则

### 6.1 分层渲染策略

| 层 | 渲染方式 | 性能预算 |
|----|---------|---------|
| 深层纹理 | CSS（position:fixed，GPU 合成） | ≈0 JS 开销 |
| 背景粒子 | Canvas 2D（单 canvas，fixed） | ≤2ms/frame |
| 区块特效 | CSS 动画 + SVG 动画 | ≤1ms/frame |
| 前景粒子 | Canvas 2D（叠加在背景 canvas 上） | ≤2ms/frame |

**总帧预算**：≤5ms JS/frame（60fps），留 11ms 给布局+绘制+合成。

### 6.2 移动端降级

```typescript
const MOBILE_DEGRADATION = {
  globalParticles: { count: 40 },       // 120 → 40
  sectionParticles: { count: '50%' },   // 减半
  interactiveParticles: false,          // 关闭（无鼠标）
  codeRain: { columns: 15 },           // 40 → 15
  hologramChromatic: false,             // 关闭色散
  glowText: 'subtle',                  // 降级为最低档辉光
  scanlineOverlay: false,              // 关闭扫描线
  gridTexture: false,                  // 关闭网格底纹
  noiseOverlay: false,                 // 关闭噪点
  lightBeam: false,                    // 关闭光束扫描
  particleFPS: 30,                     // 30fps
};

// 检测
const isMobile = window.matchMedia('(max-width: 767px)').matches;
const isLowPower = navigator.hardwareConcurrency <= 4;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // 关闭所有动效 — 无障碍优先
  disableAllAnimations();
} else if (isMobile || isLowPower) {
  applyDegradation(MOBILE_DEGRADATION);
}
```

### 6.3 IntersectionObserver 优化

只有当区块在视口中时才运行对应的粒子/特效系统。

```typescript
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const section = entry.target.dataset.section;
    if (entry.isIntersecting) {
      activateSectionFX(section);    // 启动该区块特效
    } else {
      deactivateSectionFX(section);  // 暂停该区块特效（不销毁）
    }
  });
}, { threshold: 0.05 });
```

---

## 七、V4 → V6 视觉变更清单

| # | V4/V5 现状 | V6 升级 |
|---|-----------|---------|
| 1 | 单层渲染（内容层） | 四层深度合成（纹理→粒子→内容→前景） |
| 2 | 统一靛蓝强调色 | 7 区块独立色调旅程（冷蓝→靛蓝金→青绿→红蓝→蓝紫→多彩→收束） |
| 3 | 无粒子系统 | 全局背景粒子 + 6 种区块专属粒子 + 交互粒子 |
| 4 | 无光效系统 | 统一光源 135° + 4 级文字辉光 + hover 光晕 + 区块光效过渡 |
| 5 | 纯色背景面板 | 毛玻璃/磨砂面板（`backdrop-filter`） |
| 6 | 无纹理层 | 扫描线 + 网格底纹 + 噪点（三层） |
| 7 | 基础 glow Token（3 档） | 扩展为 4 档 + 文字辉光 4 级 + hover 专用 3 档 |
| 8 | S1 简单淡入 | 星空粒子系统 + 发光标题 + 光线束扫描 |
| 9 | S2 基础脉冲 | 全息投影质感 + 电流流动 + 数据粒子沿路径流动 |
| 10 | S3 标准时间线 | 代码雨背景 + 光速轨道延伸 + 能量展开卡片 |
| 11 | S4 简单对比 | 双色场碰撞 + VS 能量对撞 + 扫描线揭示 |
| 12 | S5 标准卡片 | 蓝图线条底纹 + X光扫描揭示 + 光纤连接动画 |
| 13 | S6 文字淡入 | 墨水扩散凝聚 + 光晕呼吸脉冲 + 爆发冲击波 |
| 14 | S7 静态 CTA | 能量场收束粒子 + 品牌名发光 + 按钮悬浮光晕 |
| 15 | 无移动端降级 | 完整降级策略（粒子减量/特效关闭/30fps） |

---

_🎨 视觉设计专家 · V6 科技感视觉特效方案完成。四层深度合成 + 7 区块独立色调旅程 + 3 套粒子系统 + 统一光效体系 + 毛玻璃纹理。新增 45+ 个 Design Token（色彩 30 / 光效 10 / 纹理 8 / z-index 4 / 阴影 1），全部精确到 CSS/SVG/Canvas 实现参数。性能预算 ≤5ms/frame，移动端完整降级方案。_
