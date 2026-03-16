# V5 动效补丁规范 — GSAP ScrollTrigger / 高潮爆发 / pathDraw

> 🎨 体验设计专家 · 2026-03-16
>
> 状态：**精确实现规格**，前端可直接消费
>
> 基准：experience-design-v4.md §3.3–3.4 · review-phase2-ux.md R1/R2/R3

---

## 前置发现

`section-triggers.ts` 已包含 R1/R2/R3 的 GSAP 实现骨架。本文档对照 V4 设计规格逐项校准，补齐**参数偏差和缺失细节**，确保实现与设计 1:1 对齐。

---

## R1: ScrollTrigger scrub/pin 参数

### R1-A: 区块② 拓扑图 — pin + scrub 节点亮起

```typescript
// ── ScrollTrigger 实例 ──
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.reveal',           // 区块②根元素
    start: 'top top',             // 区块顶部贴合视口顶部时开始
    end: '+=120vh',               // 滚动距离 = 120vh（约 1.2 个屏幕高度）
    scrub: 1,                     // 1秒平滑追赶（用户松手后动画 1s 内追到滚动位置）
    pin: true,                    // pin 锁定：区块②在滚动期间固定在视口内
    anticipatePin: 1,             // 预判 pin，消除进入瞬间的跳动
    // pinSpacing: true,          // 默认值，自动创建等高 spacer 推挤下方内容
  },
});
```

**时间线分配（归一化 0→1）**：

| 阶段 | 时间线范围 | 内容 | 占总滚动距离 |
|------|-----------|------|-------------|
| Phase 1: 路径描边 | 0 → 0.20 | 连线 stroke-dashoffset 描绘 | 24vh |
| Phase 2: 节点亮起 | 0.10 → 0.70 | 非 boss 节点逐个 opacity 0.3→1 | 72vh |
| Phase 3: 高潮爆发 | 0.70 → 1.00 | glow → scale → boss → 底文 → 第二句 | 36vh |

**Phase 2 节点亮起详细参数**：

```typescript
// 非 boss 节点（data-node-index >= 1）按 index 升序逐个亮起
const nonBossNodes = Array.from(
  svg.querySelectorAll<SVGGElement>('g[data-node-index]')
).filter(g => g.dataset.nodeIndex !== '0')  // 排除 boss(L0)
 .sort((a, b) => Number(a.dataset.nodeIndex) - Number(b.dataset.nodeIndex));

tl.to(nonBossNodes, {
  opacity: 1,                     // 0.3 → 1（初始值在 prepare 阶段设为 0.3）
  filter: 'drop-shadow(0 0 8px oklch(0.70 0.15 265 / 0.6))',  // ⚠️ 补齐：发光效果
  duration: 0.60,                 // 占时间线 60%
  stagger: 0.60 / nonBossNodes.length,  // 均分，每节点等间隔亮起
  ease: 'power2.out',
}, 0.10);                         // 从 10% 开始（与 pathDraw 有 10% 重叠）
```

> **⚠️ 当前代码缺失**：节点亮起时无 `filter: drop-shadow` 发光效果（V4 §3.2 明确要求 `drop-shadow(0 0 8px var(--accent))`）。必须补上。

**节点初始状态**：

```typescript
// prepare 阶段
nodeGroups.forEach(g => {
  g.style.opacity = '0.3';       // V4 要求 0.05，但 0.3 更利于用户感知存在
  g.style.filter = 'drop-shadow(0 0 0px oklch(0.70 0.15 265 / 0))';
});
// Boss 节点特殊：完全隐藏，高潮阶段才出现
gsap.set(bossNode, { opacity: 0, y: -30 });  // ⚠️ y:-30 对齐 V4 §3.3 的 translateY(-30px)
```

### R1-B: 区块⑥ 愿景 — scrub 文字逐段淡入

```typescript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.vision',           // 区块⑥根元素
    start: 'top 80%',            // 区块顶部进入视口 80% 位置时开始
    end: 'bottom 20%',           // 区块底部到达视口 20% 位置时结束
    scrub: 0.5,                  // 0.5秒平滑追赶（比②更灵敏，文字需要紧跟滚动）
    // 无 pin — 区块⑥随页面自然滚动，文字在经过视口时逐段淡入
  },
});
```

**每段文字分配**：

```typescript
const lines = section.querySelectorAll('.vision__line, .vision__divider, .vision__climax');
const segmentDuration = 0.15;    // 每段占时间线 15%
const totalLines = lines.length;

lines.forEach((line, i) => {
  const startAt = (i / totalLines) * (1 - segmentDuration);

  if (line.classList.contains('vision__climax')) {
    // 高潮句"答案是——组织。" → blur reveal + 更大位移
    tl.to(line, {
      opacity: 1,                // 0 → 1
      y: 0,                      // 32px → 0（比普通行更大的位移）
      filter: 'blur(0px)',        // 8px → 0（模糊清晰效果）
      duration: segmentDuration * 1.5,  // 加长 50%，增强戏剧感
      ease: 'power3.out',
    }, startAt);
  } else if (line.classList.contains('vision__divider')) {
    // 分割线 → 轻量淡入
    tl.to(line, {
      opacity: 1,
      y: 0,
      duration: segmentDuration * 0.7,
      ease: 'power2.out',
    }, startAt);
  } else {
    // 普通行 → 标准 fade-up
    tl.to(line, {
      opacity: 1,                // 0 → 1
      y: 0,                      // 24px → 0
      duration: segmentDuration, // 15% 时间线
      ease: 'power2.out',
    }, startAt);
  }
});
```

**初始状态**：

```typescript
// 移除 IO 驱动的 CSS 类，由 GSAP 全权接管
lines.forEach(el => {
  el.classList.remove('anim-fade-up', 'anim-blur-reveal');
  el.removeAttribute('data-delay');
});
gsap.set(lines, { opacity: 0, y: 24 });
gsap.set('.vision__climax', { opacity: 0, y: 32, filter: 'blur(8px)' });
```

> **桌面/移动端分流**：`≥1024px` 使用上述 scrub 方案；`≤767px` 降级为标准 IO 触发（`anim-fade-up` + `is-visible`），因移动端滚动惯性大、scrub 追赶体验差。用 `matchMedia` 分流：
> ```typescript
> ScrollTrigger.matchMedia({
>   '(min-width: 1024px)': () => { /* 上述 scrub 逻辑 */ },
>   '(max-width: 767px)':  () => { /* IO 降级：lines 加回 anim-fade-up */ },
> });
> ```

---

## R2: 高潮爆发 5 步序列

**触发方式**：scrub 驱动（时间线 0.70→1.00 区间），不是独立的 onEnter 事件。用户滚动到 70% 进度后自然进入高潮段，松手停在中间可以看到部分完成的高潮状态——这是 scrub 的核心价值。

### 5 步精确参数

| 步骤 | 时间线位置 | 目标元素 | 属性变化 | duration | ease |
|------|-----------|---------|---------|----------|------|
| **S1: Glow 扩散** | 0.70 | SVG 容器 | `filter: drop-shadow(0 0 0px oklch(0.70 0.15 265/0)) → drop-shadow(0 0 40px oklch(0.70 0.15 265/0.4))` | 0.08 | `power3.out` |
| **S2: Scale-up** | 0.72 | SVG 容器 | `scale: 1 → 1.03` | 0.05 | `back.out(1.7)` |
| **S2b: Scale 回落** | 0.77 | SVG 容器 | `scale: 1.03 → 1` | 0.05 | `power2.inOut` |
| **S3: Boss 淡入** | 0.74 | `g[data-node-index="0"]` | `opacity: 0→1`, `y: -30→0` | 0.06 | `power3.out` |
| **S4: 底文弹出** | 0.80 | `.reveal__headline` | `opacity: 0→1`, `y: 16→0`, `scale: 0.96→1` | 0.06 | `back.out(1.7)` |
| **S5: 第二句淡入** | 0.88 | `.reveal__subtext` | `opacity: 0→1` | 0.08 | `power2.out` |
| **Glow 消退** | 0.92 | SVG 容器 | `filter: drop-shadow(0 0 40px ...) → drop-shadow(0 0 0px ...)` | 0.10 | `power2.out` |

### GSAP 代码

```typescript
// ── Phase 3: Climax burst (timeline 0.70 → 1.00) ──

// S1: Glow 扩散
tl.to(svg, {
  filter: 'drop-shadow(0 0 40px oklch(0.70 0.15 265 / 0.4))',
  duration: 0.08,
  ease: 'power3.out',
}, 0.70);

// S2: Scale-up（弹性超调）
tl.to(svg, {
  scale: 1.03,
  duration: 0.05,
  ease: 'back.out(1.7)',
}, 0.72);

// S2b: Scale 回落
tl.to(svg, {
  scale: 1,
  duration: 0.05,
  ease: 'power2.inOut',
}, 0.77);

// S3: Boss 节点最后淡入（人类是特殊的）
tl.to(bossNode, {
  opacity: 1,
  y: 0,                           // 从 y:-30 回到 0
  duration: 0.06,
  ease: 'power3.out',
}, 0.74);

// S4: 底文弹出
tl.to(headline, {
  opacity: 1,
  y: 0,                           // 从 y:16 回到 0
  scale: 1,                       // 从 0.96 回到 1
  duration: 0.06,
  ease: 'back.out(1.7)',
}, 0.80);                          // ⚠️ 注意：.reveal__bottom 容器也需 opacity:1

// S5: 第二句淡入
tl.to(subtext, {
  opacity: 1,
  duration: 0.08,
  ease: 'power2.out',
}, 0.88);

// Glow 消退（高潮后回归平静）
tl.to(svg, {
  filter: 'drop-shadow(0 0 0px oklch(0.70 0.15 265 / 0))',
  duration: 0.10,
  ease: 'power2.out',
}, 0.92);
```

### ⚠️ 与 V4 设计的偏差校准

| V4 设计原文 | 当前代码 | 校准动作 |
|-------------|---------|---------|
| Boss 节点 `translateY(-30px)→0` | `gsap.set(bossNode, { opacity: 0 })`，无 y | **补 `y: -30`** 到 set 和 to |
| 底文容器 `.reveal__bottom` 整体 | 仅控制 `headline` 和 `subtext` | **补** `gsap.set(bottomText, { opacity: 0, y: 20 })` + `tl.to(bottomText, { opacity:1, y:0 }, 0.80)` |
| 节点发光 `drop-shadow(0 0 8px)` | 节点亮起时无 filter 变化 | **补** 节点亮起的 filter 属性（见 R1-A） |

---

## R3: pathDraw 路径描边

### SVG 准备（初始状态）

```typescript
// <line> 元素需要计算实际长度设置 dasharray
connectionLines.forEach(line => {
  const x1 = parseFloat(line.getAttribute('x1') || '0');
  const y1 = parseFloat(line.getAttribute('y1') || '0');
  const x2 = parseFloat(line.getAttribute('x2') || '0');
  const y2 = parseFloat(line.getAttribute('y2') || '0');
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  line.setAttribute('stroke-dasharray', String(length));
  line.setAttribute('stroke-dashoffset', String(length));  // 完全隐藏
  line.style.opacity = '0';                                 // 描边前不可见
});
```

> **关键**：`stroke-dasharray` = `stroke-dashoffset` = 线段实际像素长度。`dashoffset` 从 `length` 到 `0` 即完成描绘。值因每条线的坐标不同而不同，必须逐条动态计算。

### 动画参数

```typescript
// Phase 1: pathDraw（时间线 0 → 0.20）
tl.to(connectionLines, {
  strokeDashoffset: 0,            // length → 0，线条从起点画到终点
  opacity: 0.3,                   // 0 → 0.3（连线比节点暗，视觉层级低一档）
  duration: 0.20,                 // 占时间线 20%
  stagger: 0.02,                  // 每条线间隔 2%，逐条描绘而非同时
  ease: 'power2.out',             // 快起慢收，描绘感自然
}, 0);                             // 从时间线 0% 开始
```

### 与节点亮起的时序关系

```
滚动进度:  0%────────20%──────────70%──────100%
           ├─ pathDraw ─┤                       ← 连线先画
              ├──── 节点亮起 ────────┤           ← 节点从 10% 开始（重叠 10%）
                                    ├─ 高潮 ──┤  ← 最后 30% 爆发
```

- **先描边，再亮节点**，但有 10% 重叠期
- 重叠设计意图：当第一批连线描绘到末端时，最早的节点已经开始微亮（0.3→渐变），制造"能量沿线路传导"的视觉隐喻
- 连线最终 opacity 为 0.3（低于节点的 1.0），确保节点是视觉焦点
- Boss 节点在高潮阶段才出现（0.74），不参与 Phase 2 的常规亮起

### ⚠️ `<line>` vs `<path>` 注意

当前 SVG 使用 `<line>` 元素。`stroke-dasharray/dashoffset` 对 `<line>` 有效，但如果后续改为曲线连接，需换成 `<path>` 并用 `getTotalLength()` 获取精确长度：

```typescript
// 如果是 <path> 元素：
const length = path.getTotalLength();
path.style.strokeDasharray = `${length}`;
path.style.strokeDashoffset = `${length}`;
```

---

## 实现检查清单

| # | 检查项 | 对应审查项 |
|---|--------|-----------|
| ☐ | ScrollTrigger `pin:true, scrub:1, end:'+=120vh'` 实例创建 | R1 |
| ☐ | 节点亮起带 `filter: drop-shadow(0 0 8px)` 发光 | R1 + 建议项4 |
| ☐ | Boss 节点 `gsap.set` 包含 `y: -30` | R2 |
| ☐ | `.reveal__bottom` 容器有独立的 opacity 控制 | R2 |
| ☐ | 连线 `stroke-dasharray/dashoffset` 逐条动态计算 | R3 |
| ☐ | 连线 `stagger: 0.02`，非同时描绘 | R3 |
| ☐ | 区块⑥桌面端 scrub，移动端 IO 降级（matchMedia 分流） | R1-B |
| ☐ | `prefers-reduced-motion` 时跳过所有 GSAP 动画，直接显示完成态 | 全局 |

---

*文档结束。所有参数均精确到可直接复制到 TypeScript 代码。*
