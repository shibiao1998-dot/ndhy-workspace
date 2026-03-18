# V5 Phase 2.2 设计+视觉+内容走查报告

> 🎨 体验设计专家 + 🎨 视觉设计专家 + 📖 叙事策略专家 联合走查
>
> 日期：2026-03-17
>
> 走查对象：TopologyGraph.tsx · section-triggers.ts · createObserver.ts · global.css · 各 Section .astro 文件

---

## 设计走查

### 1. 徽章 pillHeight 14px 视觉合理性

**结论：🟢 通过**

**审查内容**：

TopologyGraph.tsx 中徽章渲染代码（约 L270-L295）：

```tsx
const pillWidth = badgeText.length > 2 ? 24 : 20;
const pillHeight = 14;
// ...
<rect
  x={badgeX}
  y={badgeY - pillHeight / 2}    // 垂直居中：rect 上边 = badgeY - 7
  width={pillWidth}
  height={pillHeight}             // 14px
  rx={pillHeight / 2}             // 7px → 完美胶囊
/>
<text
  x={badgeX + pillWidth / 2}
  y={badgeY + 1}                  // dy 偏移 +1px
  textAnchor="middle"
  dominantBaseline="central"       // 垂直居中基线
  fontSize={10}
/>
```

**逐项验证**：

| 检查项 | 结果 | 说明 |
|--------|------|------|
| `<text>` 垂直居中 | ✅ | `dominantBaseline="central"` + `y={badgeY + 1}` 组合。rect 中心在 `badgeY`，text 在 `badgeY + 1`，+1px 微调补偿 SVG 字体视觉偏移，合理 |
| dy 值合理性 | ✅ | `+1px` 是常见的 SVG 小写文本视觉居中微调，fontSize=10 时误差在 ±1px 内可接受 |
| pill 宽高比 | ✅ | 20×14 = 1.43:1（双字符如 P0）；24×14 = 1.71:1（三字符如 P12）。胶囊形态美观，不过扁也不过长 |
| rx 与 pillHeight 关系 | ✅ | `rx = pillHeight / 2 = 7` → 完美半圆端头 |
| 12→14px 变更影响 | ✅ | 高度增 2px，改善了 fontSize=10 文本在 pill 内的呼吸感（原 12px 仅留 1px 上下边距，14px 留 2px），更符合 design-patch-visual-ui-v5.md §1.2 的 `2px var(--space-2)` padding 规格 |

**与规格对照**：design-patch-visual-ui-v5.md §1.2 拓扑图节点旁规格为 `20×12px`。当前实现改为 14px 高度，实际上比规格**略大 2px**。但这是视觉优化——12px 内放 10px 字体仅 1px 呼吸空间，14px 更合理。规格中 padding 为 `2px var(--space-2)` 即上下各 2px，对应高度应为 `10(font) + 2×2(padding) = 14px`。**14px 实际上才是正确的推导值，规格表的 12px 可能是笔误**。

---

### 2. S4 headline 时间点 0.80

**结论：🟢 通过**

**审查内容**：section-triggers.ts 高潮序列 5 步时序（L140-L190）。

**实现对照 design-patch-animation-v5.md R2 规格表**：

| 步骤 | 规格时间点 | 实现时间点 | 一致？ |
|------|-----------|-----------|--------|
| S1: Glow 扩散 | 0.70 | 0.70 | ✅ |
| S2: Scale-up | 0.72 | 0.72 | ✅ |
| S2b: Scale 回落 | 0.77 | 0.77 | ✅ |
| S3: Boss 淡入 | 0.74 | 0.74 | ✅ |
| S4: 底文弹出（headline） | **0.80** | **0.80** | ✅ |
| S5: 第二句淡入 | 0.88 | 0.88 | ✅ |
| Glow 消退 | 0.92 | 0.92 | ✅ |

**详细参数对照**：

| 参数 | 规格 | 实现 | 一致？ |
|------|------|------|--------|
| headline duration | 0.06 | 0.06 | ✅ |
| headline ease | `back.out(1.7)` | `back.out(1.7)` | ✅ |
| headline y | `16→0` | `16→0`（gsap.set y:16 → to y:0） | ✅ |
| headline scale | `0.96→1` | `0.96→1`（gsap.set scale:0.96 → to scale:1） | ✅ |
| bottomText 容器控制 | 需独立 opacity | `gsap.set(bottomText, { opacity: 0, y: 20 })` + tl.to at 0.8 | ✅ |

5 步序列时序完全对齐规格，无偏差。

---

### 3. createObserver 重构后入场动画

**结论：🟢 通过**

**审查内容**：各 Section 从内联 IO 改为引用 `createObserver.ts` 后的参数一致性。

**createObserver.ts 默认值**：
- `threshold: 0.3`
- `rootMargin: '0px'`
- `visibleClass: 'is-visible'`
- `once: true`

**各 Section 使用情况**：

| Section | 调用方式 | threshold | rootMargin | 行为等价？ |
|---------|---------|-----------|------------|-----------|
| S2 Reveal | `observeAll('.reveal .anim-fade-up, .reveal .anim-scale-spring', { threshold: 0.3 })` | 0.3 | 0px（默认） | ✅ |
| S2 Mobile nodes | `observeWithStyleReveal(mobileGrid, '[data-topo-node]', 60, { opacity: '1', transform: 'translateY(0)' }, { threshold: 0.3 })` | 0.3 | — | ✅ |
| S3 Timeline | `observeAll('.timeline .anim-fade-up, .timeline .anim-scale-spring', { threshold: 0.3 })` | 0.3 | 0px（默认） | ✅ |
| S4 Contrast | `observeAll(selector, { threshold: 0.1 })` | 0.1 | 0px（默认） | ✅ 符合 slide 动画更早触发的设计意图 |
| S4 Steps stagger | `observeWithStagger(col, '.contrast__step', 80, { threshold: 0.15 })` | 0.15 | — | ✅ |
| Breathing | `observeAll('.breathing .anim-blur-reveal', { threshold: 0.3 })` | 0.3 | 0px（默认） | ✅ |

**关键差异说明**：

section-triggers.ts 中保留了独立的 IO（`initIOReveals`），使用 `threshold: [0, 0.15, 0.3]` + `rootMargin: '0px 0px -8% 0px'` + `intersectionRatio >= 0.3` 判断 + `data-delay` 注入。代码注释明确解释了为何不迁移：多阈值数组、data-delay 驱动、prefers-reduced-motion 短路——这三项功能超出 createObserver 的简单封装。**这不是遗漏，是合理的架构决策**。

**入场触发行为等价性**：所有迁移到 createObserver 的 Section 都使用简单的 `is-visible` class 切换，与原内联 IO 行为一致。stagger 场景使用 `observeWithStagger`（className 驱动）和 `observeWithStyleReveal`（inline style 驱动），分别对应不同的动画需求。

---

## 视觉走查

### 4. 裸色值清零

**结论：🟢 通过**

**审查内容**：global.css 中的裸色值使用情况。

| 位置 | 代码 | Token 使用？ | 说明 |
|------|------|-------------|------|
| `.topo-node:hover` | `border-color: var(--color-accent-subtle)` | ✅ Token | 已改用 CSS 变量 |
| `.topo-node:active` | `border-color: var(--color-accent)` | ✅ Token | |
| `.topo-node:focus-visible` | `box-shadow: 0 0 0 4px var(--color-accent-glow)` | ✅ Token | |
| `@keyframes nodeBreathing` | `oklch(0.70 0.15 265 / 0.3)` / `oklch(0.70 0.15 265 / 0.5)` | 🔖 裸值+注释 | 注释 `/* Token: --color-accent (oklch(0.70 0.15 265)) — CSS keyframes filter 不支持 var() */`  ✅ |
| `@keyframes leaderHalo` | `oklch(0.70 0.15 265 / 0.4)` / `oklch(0.70 0.15 265 / 0.6)` | 🔖 裸值+注释 | 同上 ✅ |
| `@keyframes bossHalo` | `oklch(0.80 0.15 85 / 0.4)` / `oklch(0.80 0.15 85 / 0.6)` | 🔖 裸值+注释 | 注释 `/* Token: --color-boss */` ✅ |
| `body` background | `oklch(0.15 0.02 255)` 等 | 🔖 裸值 | 渐变多 stop，@theme 无直接对应 Token，属于合理的一次性装饰值 |
| `body::before` grid | `oklch(0.78 0.15 195 / 0.03)` | 🔖 裸值 | 微量装饰，与 `--color-cyan` 同源，合理 |
| Scrollbar thumb | `oklch(0.78 0.15 195 / 0.2)` | 🔖 裸值 | 非核心 UI，浏览器兼容需裸值 |

keyframes 内裸值已全部标注注释说明对应 Token 来源。`.topo-node:hover` 确认已改用 `var(--color-accent-subtle)`。

---

### 5. N1 徽章视觉复检

**结论：🟢 通过**

**审查内容**：pillHeight 14px 改动后，拓扑图节点旁徽章与悬停卡片内徽章是否匹配 design-patch-visual-ui-v5.md §1.2 规格。

**拓扑图节点旁徽章（SVG）**：

| 属性 | 规格 | 实现 | 一致？ |
|------|------|------|--------|
| 形状 | Pill 胶囊 | `rx={pillHeight / 2}` → 胶囊 | ✅ |
| 字体 | `var(--font-mono)` | `fontFamily="var(--font-mono)"` | ✅ |
| 字号 | `10px` | `fontSize={10}` | ✅ |
| 字重 | `var(--fw-semibold)` | `fontWeight={600}` | ✅ |
| 圆角 | `var(--radius-full)` | `rx={pillHeight / 2}` → 全圆角 | ✅ |
| 前景色 | `--color-rank-{段}` | `fill={colors.fg}` → `var(--color-rank-xxx)` | ✅ |
| 背景色 | `--color-rank-{段}-bg` | `fill={colors.bg}` → `var(--color-rank-xxx-bg)` | ✅ |
| 边框 | `1px solid` 同色 15% opacity | `strokeWidth={0.5} strokeOpacity={0.15}` | ⚠️ 见下 |

**边框微差**：规格要求 `1px solid`，实现为 `strokeWidth={0.5}`。SVG stroke 在路径两侧各占一半，0.5px stroke 实际视觉约 0.25px 线宽，偏细。但在 10px 字体/14px pill 的小尺寸下，1px stroke 反而会过重。**0.5px 是合理的视觉适配，不构成阻断**。

**悬停卡片内徽章（HTML tooltip）**：

| 属性 | 规格 | 实现 | 一致？ |
|------|------|------|--------|
| 形状 | Pill 胶囊 | `borderRadius: 'var(--radius-full)'` | ✅ |
| 字体 | `var(--font-mono)` | `fontFamily: 'var(--font-mono)'` | ✅ |
| 字号 | `var(--fs-xs)` (12px) | `fontSize: 'var(--fs-xs)'` | ✅ |
| 字重 | `var(--fw-semibold)` | `fontWeight: 600` | ✅ |
| padding | `var(--space-1) var(--space-2)` | `padding: 'var(--space-1) var(--space-2)'` | ✅ |
| 前景色 | `--color-rank-{段}` | `color: tierToColors(...).fg` | ✅ |
| 背景色 | `--color-rank-{段}-bg` | `background: tierToColors(...).bg` | ✅ |
| 边框 | 无 | 无 | ✅ |

**等级段映射**（`rankToTier` 函数）：

| 输入 | 期望输出 | 实现输出 | 一致？ |
|------|---------|---------|--------|
| 0-3 | junior | junior | ✅ |
| 4-6 | mid | mid | ✅ |
| 7-9 | senior | senior | ✅ |
| 10-12 | master | master | ✅ |

**注意**：TopologyGraph.tsx 内部有 `rankToTier` 函数副本，与 team-members.ts 导出的同名函数逻辑一致。存在代码重复但不影响正确性。

---

### 6. GSAP 常量与 Token 对应

**结论：🟢 通过**

**审查内容**：section-triggers.ts 顶部常量 vs global.css @theme Token。

| 常量 | 值 | 对应 Token | Token 值 | 一致？ |
|------|------|-----------|---------|--------|
| `ACCENT_GLOW` | `drop-shadow(0 0 8px oklch(0.70 0.15 265 / 0.6))` | `--color-accent: oklch(0.70 0.15 265)` | oklch(0.70 0.15 265) | ✅ 色相一致，alpha 0.6 是发光层级变体 |
| `ACCENT_GLOW_LARGE` | `drop-shadow(0 0 40px oklch(0.70 0.15 265 / 0.4))` | 同上 | 同上 | ✅ |
| `ACCENT_GLOW_NONE` | `drop-shadow(0 0 0px oklch(0.70 0.15 265 / 0))` | 同上 | 同上 | ✅ |

三个常量的 oklch 基色 `(0.70 0.15 265)` 与 `--color-accent` Token 值完全一致。仅 alpha 通道和模糊半径不同，分别对应节点发光、高潮扩散、无发光三种状态。

代码顶部注释已标注：`// 对应 global.css @theme: --color-accent (oklch(0.70 0.15 265))`，可追溯性良好。

---

## 内容走查

### 7. aria-label 一致性

**结论：🟡 建议**

**审查内容**：TopologyGraph.tsx 中的 aria-label 与页面可见文案对照。

| 位置 | aria-label | 页面可见文案 | 一致？ |
|------|-----------|-------------|--------|
| SVG 根 | `"AI 团队组织拓扑图：1 个人类老板、1 个 Leader、1 个项目管理、30 个领域专家"` | reveal__headline: `"一个人类 · 31 个 AI 专家 · 一个完整的产品组织"` | ⚠️ 数字表述不同 |
| 各节点 `<g>` | `"${member.name}：${member.description}"` | 节点 emoji + name label | ✅ 语义一致，aria-label 补充了 description |

**详细分析**：

SVG `aria-label` 说 "1 个人类老板、1 个 Leader、1 个项目管理、**30 个领域专家**"，总计 33 个实体（分层计数）。页面可见文案说 "一个人类 · **31 个 AI 专家**"，其中 31 = Leader + 项目管理 + 30 个 L3 专家。

两种计数方式各有道理——aria-label 按层级分类（更精确），页面文案按人类/AI 二分法（更简洁）。数据源验证：`team-members.ts` 有 33 条记录（L0:1 + L1:1 + L2:1 + L3:30），其中 L0 是人类，L1-L3 共 32 个 AI。

**问题**：
1. aria-label 中"30 个领域专家"仅计 L3，遗漏了 L1 Leader 和 L2 项目管理专家——它们也是 AI。更精确的表述应为"1 个人类老板、31 个 AI 专家"或当前的分层表述
2. 页面可见文案说"31 个 AI 专家"，但实际 AI 角色为 32 个（L1 + L2 + 30×L3）。不过 content-patch-v5.md C2 已确认全站统一为 31——这应是将 Leader 视为"组织者"而非"专家"的刻意处理

**建议**：aria-label 可考虑对齐页面可见文案的表述风格，如 `"AI 团队组织拓扑图：1 个人类、31 个 AI 专家的完整组织结构"`。但当前表述不构成功能障碍，**不阻断**。

---

### 8. 全站零句号复检

**结论：🟢 通过**

**审查内容**：使用 `rg` 搜索所有 `.tsx`、`.ts`、`.astro` 文件中的中文句号"。"。

```
rg "。" website/src/ -t astro -t ts -t tsx → 0 matches
```

所有修改文件中无新增中文句号。全站零句号规则维持完好。

---

## 走查结论

| # | 走查项 | 分类 | 结论 |
|---|--------|------|------|
| 1 | 徽章 pillHeight 14px 视觉合理性 | 设计 | 🟢 通过 |
| 2 | S4 headline 时间点 0.80 | 设计 | 🟢 通过 |
| 3 | createObserver 重构后入场动画 | 设计 | 🟢 通过 |
| 4 | 裸色值清零 | 视觉 | 🟢 通过 |
| 5 | N1 徽章视觉复检 | 视觉 | 🟢 通过 |
| 6 | GSAP 常量与 Token 对应 | 视觉 | 🟢 通过 |
| 7 | aria-label 一致性 | 内容 | 🟡 建议（数字表述可优化，不阻断） |
| 8 | 全站零句号复检 | 内容 | 🟢 通过 |

**总结**：**7 项通过，1 项建议，0 项阻断。V5 Phase 2.2 变更可放行。**

建议项（aria-label 数字表述优化）可作为后续优化纳入，不影响当前发布。

---

*🎨🎨📖 体验设计专家 + 视觉设计专家 + 叙事策略专家 联合走查完成*
