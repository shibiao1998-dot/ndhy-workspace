# 官网 V4 — 前端技术架构方案

> 🏛️ 技术架构专家产出 · 2026-03-16
> 输入：requirement-document-v4.md / review-worldclass-frontend.md / experience-design-v3.md / index.html

---

## 一、V3 架构问题诊断

V3 是 89KB 单文件 HTML（内联 CSS 700 行 + JS 200 行 + SVG 25KB），审查得分 6.1/10。核心问题：

| 问题 | 影响 | 根因 |
|------|------|------|
| 单文件不可维护 | 修改任何元素需全文搜索 3-4 处 | 无模块化拆分 |
| CSS 规则分散 | 5 轮迭代叠加导致同一元素样式散落多处 | 无构建工具合并 |
| 响应式 5/10 | 只覆盖 600-1023px，320px/2560px 未适配 | 断点不足，无 `clamp()` |
| 无障碍 5/10 | 缺 `<main>`/`<h1>`/`prefers-reduced-motion` | 架构层未内建无障碍 |
| 动画不可中断 | 打字机递归 setTimeout 无 abort 机制 | JS 未结构化 |

**结论**：V3 的问题不是"修修补补"能解决的——需要架构级重建。

---

## 二、框架选型

### 2.1 候选方案对比矩阵

基于 2025-2026 年最新评测数据（来源：nunuqs.com 2026 框架对比、gigson.co 2026 评测、nucamp.co 2026 Top 10）：

| 维度 | Astro | Next.js | SvelteKit | React + Vite |
|------|-------|---------|-----------|-------------|
| **默认 JS 产出** | **0 KB**（零 JS by default） | 全量 hydrate | 编译消除，极小 | 全量 React runtime |
| **SSG 性能** | ⭐⭐⭐⭐⭐ LCP 比 Next.js 低 40-70% | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐（需手动配置） |
| **动画支持** | Islands 按需 hydrate，GSAP/Motion 可直接用 | React 生态完整 | 内建 transition | React 生态完整 |
| **构建速度** | Vite 驱动，极快 | Turbopack 在追赶 | Vite 驱动 | Vite 原生 |
| **生态成熟度** | 快速增长，社区活跃 | 最大生态 | 中等 | 最大生态 |
| **适合场景** | **内容驱动展示站** | 全栈应用 | 交互式应用 | SPA 应用 |
| **退出成本** | 低（组件可迁移） | 中（锁定 React） | 高（Svelte 语法独特） | 低 |

### 2.2 推荐方案：Astro + React Islands

**选择 Astro 作为主框架，交互组件通过 React Islands 按需 hydrate。**

**核心理由**：

1. **场景精准匹配**：官网是内容驱动的展示站（7 个叙事区块），不是 SPA。Astro 的"内容优先"哲学与需求完美对齐
2. **零 JS 默认**：静态内容（文案、SVG 拓扑图、布局）不发送任何 JS，只有需要交互的组件（时间线手风琴、tooltip）才 hydrate——天然 Lighthouse 90+
3. **Islands 架构**：每个交互区块是独立 Island，互不影响。坏处是增加少量配置，好处是性能天花板极高
4. **React 生态可用**：通过 `@astrojs/react` 集成，GSAP、Framer Motion 等 React 生态的动画库可直接使用
5. **Tailwind v4 原生支持**：通过 `@tailwindcss/vite` 插件直接集成，CSS-first 的 `@theme` 配置与 Astro 的 Vite 构建链无缝衔接
6. **退出成本低**：Astro 组件 = `.astro` 文件（HTML 超集）+ React 组件。如果未来需要迁移到 Next.js，React 组件可直接复用

**退出成本评估**：`.astro` 文件需要改写（约 20% 工作量），React 组件零成本迁移。整体退出成本低于 SvelteKit，与 Next.js 相当。

### ADR-001：框架选型

| 项目 | 内容 |
|------|------|
| 决策 | 采用 Astro + React Islands |
| 背景 | V3 单文件 HTML 不可维护；V4 需要现代框架支撑组件化和 SSG |
| 理由 | 零 JS 默认 + Islands 按需 hydrate = 性能天花板最高；内容站场景精准匹配 |
| 替代方案 | Next.js（过重，全量 hydrate 对展示站浪费）、SvelteKit（退出成本高）|
| 退出条件 | 如果未来需要全栈能力（API routes、认证），评估迁移到 Next.js |

---

## 三、动画方案选型

### 3.1 候选方案对比

基于 2025-2026 年评测（来源：LogRocket 2026 React 动画库对比、motion.dev 官方对比、gabrielveres.com 深度评测）：

| 维度 | GSAP + ScrollTrigger | Motion (原 Framer Motion) | CSS 原生 |
|------|---------------------|---------------------------|----------|
| **滚动驱动叙事** | ⭐⭐⭐⭐⭐ ScrollTrigger 是行业标准 | ⭐⭐⭐⭐ scroll() API 不错 | ⭐⭐ `scroll-timeline` 浏览器支持不足 |
| **时间线编排** | ⭐⭐⭐⭐⭐ gsap.timeline() 精确控制 | ⭐⭐⭐ 基础序列支持 | ⭐⭐ `@keyframes` 有限 |
| **性能** | ⭐⭐⭐⭐ requestAnimationFrame 驱动 | ⭐⭐⭐⭐⭐ 硬件加速，WAAPI 底层 | ⭐⭐⭐⭐⭐ GPU 合成 |
| **包体积** | 78KB（核心+ScrollTrigger） | 85KB | 0KB |
| **生态/案例** | Awwwards 站点标配 | React 应用标配 | 简单动画首选 |

### 3.2 推荐方案：分层动画策略

**CSS 原生 + GSAP ScrollTrigger + Lenis 三层组合。**

| 层级 | 工具 | 负责范围 | 理由 |
|------|------|---------|------|
| **L1 基础动画** | CSS `@keyframes` + `transition` | 淡入、hover 态、呼吸动画 | 零 JS 开销，GPU 合成 |
| **L2 滚动编排** | GSAP ScrollTrigger | 7 个区块的滚动触发、序列控制、时间线 | 滚动驱动叙事的行业标准，精确控制能力无可替代 |
| **L3 平滑滚动** | Lenis | 全局平滑滚动体验 | 轻量（~5KB），与 GSAP ScrollTrigger 官方推荐配合，Awwwards 站点标配 |

**不选 Framer Motion 的理由**：官网不是 React SPA，大部分内容是 Astro 静态渲染。GSAP 不依赖 React 生态，可在 Astro 的 `<script>` 标签中直接使用，减少 hydration 开销。

### 3.3 60fps 保障策略

| 策略 | 实现 |
|------|------|
| **只动 transform + opacity** | 所有动画限制在合成属性，禁止动画 layout 属性（width、height、margin） |
| **will-change 提示** | 动画元素在动画前设置 `will-change: transform, opacity`，动画后移除 |
| **节点亮起用 CSS class 切换** | GSAP ScrollTrigger 触发 → 添加 `.lit` class → CSS transition 处理视觉 |
| **SVG filter 降级** | 低端设备（`navigator.hardwareConcurrency <= 2`）关闭 glow filter |
| **Lenis + GSAP ticker 同步** | `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.lagSmoothing(0)` |

### ADR-002：动画方案

| 项目 | 内容 |
|------|------|
| 决策 | CSS 原生 + GSAP ScrollTrigger + Lenis 三层组合 |
| 理由 | CSS 覆盖简单动画零开销；GSAP 是滚动叙事行业标准；Lenis 提供平滑滚动体验 |
| 退出成本 | GSAP 可替换为 Motion 的 scroll() API；Lenis 可移除（回退到原生滚动） |

---

## 四、项目结构设计

### 4.1 目录结构

```
ai-org-showcase-v4/
├── astro.config.mjs          # Astro 配置 + Tailwind v4 Vite 插件
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── og-image.png          # Open Graph 预览图
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro  # 全局 <html>/<head>/<body>，SEO meta，字体
│   ├── pages/
│   │   └── index.astro       # 首页：组装 7 个区块
│   ├── sections/             # ★ 7 个叙事区块（核心）
│   │   ├── S1HookSection.astro       # 区块一：悬念开场
│   │   ├── S2RevealSection.astro     # 区块二：组织拓扑
│   │   ├── S3TimelineSection.astro   # 区块三：运转揭秘
│   │   ├── S4ContrastSection.astro   # 区块四：认知落差
│   │   ├── S5ArchSection.astro       # 区块五：深层架构
│   │   ├── S6VisionSection.astro     # 区块六：更大图景
│   │   └── S7CtaSection.astro        # 区块七：行动号召
│   ├── components/           # 可复用 UI 组件
│   │   ├── TopologyGraph.tsx         # React Island：SVG 拓扑图 + tooltip
│   │   ├── TimelineAccordion.tsx     # React Island：时间线手风琴
│   │   ├── Typewriter.astro          # 打字机（纯 CSS steps() 实现）
│   │   ├── ScrollArrow.astro         # 呼吸箭头
│   │   ├── SkipLink.astro            # 无障碍跳转链接
│   │   └── ContactButton.astro       # CTA 按钮
│   ├── animations/           # 动画逻辑
│   │   ├── scroll-setup.ts           # Lenis + GSAP ScrollTrigger 初始化
│   │   ├── section-triggers.ts       # 7 个区块的 ScrollTrigger 配置
│   │   └── reduced-motion.ts         # prefers-reduced-motion 检测与降级
│   ├── styles/               # 样式
│   │   ├── global.css                # @import "tailwindcss" + @theme 定义
│   │   ├── tokens.css                # Design Tokens（CSS Variables 源）
│   │   └── animations.css            # @keyframes 定义
│   ├── data/                 # 内容数据（与展示分离）
│   │   ├── team-members.ts           # 28 个角色数据（emoji、名称、定位）
│   │   ├── timeline-steps.ts         # 时间线步骤数据
│   │   └── comparison-data.ts        # 对比面板数据
│   └── utils/
│       └── a11y.ts                   # 无障碍工具函数
```

### 4.2 组件拆分策略

**原则**：Astro 静态组件为主，React Islands 仅用于需要客户端交互的组件。

| 组件 | 技术 | 理由 |
|------|------|------|
| **7 个 Section** | `.astro` 静态 | 内容为主，动画由 GSAP 外部驱动，不需要 React 状态 |
| **TopologyGraph** | `.tsx` React Island | 需要 hover/tap 状态管理、tooltip 定位计算、键盘导航 |
| **TimelineAccordion** | `.tsx` React Island | 手风琴展开/折叠需要状态管理、`aria-expanded` 切换 |
| **Typewriter** | `.astro` + CSS | 用 CSS `steps()` + `@keyframes` 实现，零 JS |
| **其余组件** | `.astro` 静态 | 纯展示，不需要客户端 JS |

**hydration 指令**：

```astro
<!-- 只在可见时 hydrate，节省首屏 JS -->
<TopologyGraph client:visible data={teamMembers} />
<TimelineAccordion client:visible steps={timelineSteps} />
```

### 4.3 Design Token 集成方案

**方案：Tailwind CSS v4 `@theme` + CSS Variables 双层。**

Tailwind v4 采用 CSS-first 配置，所有 token 通过 `@theme` 定义，自动生成 CSS Variables + Tailwind 工具类。

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* 颜色 */
  --color-bg-primary: #0a0a0f;
  --color-bg-surface: #111118;
  --color-text-primary: #e8e8ed;
  --color-text-muted: #6b6b7b;
  --color-text-bright: #f5f5f7;
  --color-accent: #818cf8;
  --color-accent-dim: rgba(129, 140, 248, 0.15);

  /* 字体 */
  --font-size-display: clamp(2rem, 5vw, 3.5rem);
  --font-size-heading: clamp(1.5rem, 3vw, 2.25rem);
  --font-size-body: clamp(0.938rem, 1.5vw, 1.125rem);
  --font-size-small: clamp(0.813rem, 1.2vw, 0.875rem);

  /* 间距 */
  --spacing-section: clamp(4rem, 10vh, 8rem);
  --spacing-block: clamp(2rem, 5vh, 4rem);

  /* 动画 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 800ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

  /* 断点（Tailwind v4 自动注册） */
  --breakpoint-sm: 375px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;
  --breakpoint-2xl: 1920px;
}
```

**优势**：
- Token 定义一次，Tailwind 类名和 CSS Variables 同时可用
- GSAP 动画可直接读取 `getComputedStyle` 获取 token 值，消除 V3 的 magic number 问题
- 零硬编码颜色、零裸色值（解决 V3 审查报告 C3 问题）

---

## 五、性能策略

### 5.1 性能目标

| 指标 | 目标值 | 策略 |
|------|--------|------|
| **Lighthouse Performance** | ≥ 95 | Astro 零 JS 默认 + Islands 按需 hydrate |
| **FCP** | ≤ 0.5s | 静态 HTML 直出，无 JS 阻塞 |
| **LCP** | ≤ 1.5s | 首屏区块一纯 CSS 动画，无 JS 依赖 |
| **CLS** | ≤ 0.05 | 无动态插入内容，固定布局 |
| **TBT** | ≤ 100ms | GSAP/Lenis 延迟加载，不阻塞首屏 |
| **首屏加载** | ≤ 3s（中等网络） | 静态 HTML < 30KB gzip |

### 5.2 代码分割与懒加载策略

```
加载时序：
─────────────────────────────────────────────
T=0     HTML + Critical CSS（Astro SSG 直出）
T=0.1s  首屏区块一渲染完成（纯 HTML + CSS 动画）
T=0.3s  Lenis + GSAP 核心异步加载（动态 import）
T=0.5s  ScrollTrigger 初始化，注册 7 个区块触发器
T=?     用户滚动到区块二 → TopologyGraph.tsx hydrate
T=?     用户滚动到区块三 → TimelineAccordion.tsx hydrate
─────────────────────────────────────────────
```

| 策略 | 实现 |
|------|------|
| **Critical CSS 内联** | Astro 自动将首屏所需 CSS 内联到 `<head>` |
| **JS 异步加载** | GSAP/Lenis 通过 `<script type="module">` 异步加载，不阻塞渲染 |
| **组件级懒加载** | React Islands 使用 `client:visible`，只在滚入视口时 hydrate |
| **图片优化** | Astro `<Image>` 组件自动 WebP/AVIF 转换 + srcset 响应式图片 |
| **SVG 内联保留** | 拓扑图 SVG 继续内联（保持 V3 的零请求优势），但拆分到 React 组件中管理 |
| **字体策略** | 继续使用系统字体栈（零字体请求），这是 V3 的正确决策 |

### 5.3 构建产物预估

| 资源 | 预估大小（gzip） | 说明 |
|------|-----------------|------|
| HTML | ~8KB | Astro SSG 输出 |
| CSS（Tailwind purged） | ~6KB | 只包含使用的工具类 |
| JS（GSAP + Lenis） | ~30KB | 异步加载，不阻塞首屏 |
| JS（React Islands） | ~15KB | 按需 hydrate |
| **总计** | **~59KB** | 远低于 V3 的 89KB 未压缩 |

---

## 六、部署方案

### 6.1 推荐：Vercel + SSG

| 维度 | Vercel | GitHub Pages | Cloudflare Pages |
|------|--------|-------------|------------------|
| **Astro SSG 支持** | ⭐⭐⭐⭐⭐ 官方 adapter | ⭐⭐⭐⭐ 需手动配置 | ⭐⭐⭐⭐⭐ 原生支持 |
| **CDN** | 全球边缘网络 | GitHub CDN | 全球 300+ PoP |
| **预览部署** | ✅ 每个 PR 自动预览 URL | ❌ | ✅ |
| **分析** | ✅ Web Analytics 内建 | ❌ | ✅ 基础分析 |
| **免费额度** | 个人项目足够 | 完全免费 | 个人项目足够 |
| **自定义域名** | ✅ | ✅ | ✅ |

**推荐 Vercel** 的理由：
- Astro 官方推荐的部署平台，零配置
- 每个 PR 自动生成预览 URL → 老板可以直接预览每个阶段的成果（契合分阶段验收需求）
- 全球 CDN + Edge 缓存，首屏加载极快

**退出成本**：Astro SSG 产物是纯静态 HTML/CSS/JS，可以部署到任何静态托管平台。从 Vercel 迁移到 GitHub Pages 或 Cloudflare Pages 只需改构建配置。

### 6.2 构建与部署流程

```
Git Push → Vercel 自动构建 → Astro SSG 生成静态文件 → 部署到 CDN
                                     ↓
                          (PR 时) 自动生成预览 URL → 老板验收
```

### ADR-003：部署方案

| 项目 | 内容 |
|------|------|
| 决策 | Vercel + Astro SSG 静态部署 |
| 理由 | 零配置、PR 预览 URL 支持分阶段验收、全球 CDN |
| 退出成本 | 极低，纯静态产物可迁移到任何静态托管 |

---

## 七、无障碍策略

### 7.1 WCAG 2.1 AA 全覆盖

V3 审查暴露了 3 个阻断性无障碍问题。V4 在架构层内建无障碍，而不是事后修补。

| 维度 | V3 问题 | V4 方案 |
|------|---------|---------|
| **语义结构** | 缺 `<main>`/`<h1>` | BaseLayout 强制包含 `<header>`/`<main>`/`<footer>`；区块一包含 `<h1>` |
| **标题层级** | H2→H3 跳跃 | 每个 Section 组件强制从 `<h2>` 开始，内部按序递增 |
| **键盘导航** | SVG 节点不可键盘访问 | TopologyGraph 的每个节点 `tabindex="0"` + `role="button"` + `onKeyDown` |
| **动画降级** | 无 `prefers-reduced-motion` | 全局检测 + 降级机制（见下文） |
| **对比度** | `#999` on `#1a1a35` = 3.6:1 | Token 系统强制 `--color-text-muted` ≥ 4.5:1 对比度 |
| **ARIA 状态** | 时间线无 `aria-expanded` | TimelineAccordion 组件内建 ARIA 状态管理 |
| **Skip Link** | 存在但跳转目标不精确 | SkipLink 组件直接跳转到 `<main>` |

### 7.2 prefers-reduced-motion 降级方案

```typescript
// src/animations/reduced-motion.ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // L1：CSS 动画全部跳到终态
  document.documentElement.classList.add('reduce-motion');
  // L2：GSAP ScrollTrigger 禁用动画，只保留内容显示
  // L3：Lenis 平滑滚动禁用，回退原生滚动
}
```

```css
/* 全局降级 */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

### 7.3 无障碍验收标准

| 检查项 | 工具 | 目标 |
|--------|------|------|
| Lighthouse Accessibility | Lighthouse | ≥ 95 |
| axe-core 自动化扫描 | axe DevTools | 0 violations |
| 键盘导航测试 | 手动 | 所有交互元素可达 |
| 屏幕阅读器测试 | NVDA/VoiceOver | 所有内容可朗读 |

---

## 八、响应式策略

### 8.1 五档断点（解决 V3 的"只有两个断点"问题）

| 档位 | 断点 | 典型设备 | 内容宽度 |
|------|------|---------|---------|
| **xs** | < 375px | 老旧手机 | 100vw - 32px |
| **sm** | 375-767px | 手机 | max-width: 92vw |
| **md** | 768-1023px | 平板 | max-width: 90vw |
| **lg** | 1024-1439px | 笔记本 | max-width: 960px 居中 |
| **xl** | 1440-1919px | 桌面 | max-width: 1100px 居中 |
| **2xl** | ≥ 1920px | 大屏 | max-width: 1280px 居中 |

### 8.2 关键适配策略

| 场景 | 策略 |
|------|------|
| **字体** | 全部使用 `clamp()` 渐进缩放，消除 V3 的断层式缩放 |
| **拓扑图 ≤767px** | SVG 替换为结构化列表（保留信息完整性，V3 已删除降级方案需恢复） |
| **拓扑图 ≥768px** | SVG 响应式缩放 + 触摸优化 |
| **对比面板 ≤767px** | 上下排列（先灰后亮，保持情绪顺序） |
| **2560px 大屏** | 内容区扩展到 1280px，两侧适度留白，不再"小窗口居中" |

---

## 九、风险识别与缓解

| # | 风险 | 概率 | 影响 | 缓解 |
|---|------|------|------|------|
| R1 | GSAP 商业许可 | 低 | 中 | GSAP 对免费开源项目免费；官网如果不商业化则无许可风险。如果许可成为问题，可替换为 Motion (MIT) |
| R2 | Astro Islands hydration 闪烁 | 中 | 低 | 使用 `client:visible` + CSS 预设初始状态，hydration 前后视觉一致 |
| R3 | Lenis 与 iOS Safari 兼容 | 低 | 中 | Lenis 团队持续维护 Safari 兼容；降级到原生滚动的成本极低 |
| R4 | GSAP ScrollTrigger 在 resize 后偏移 | 中 | 中 | ScrollTrigger.refresh() + debounced resize handler |
| R5 | 开发者不熟悉 Astro | 中 | 中 | Astro 学习曲线极低（HTML 超集）；React 组件部分无学习成本 |

---

## 十、技术栈总表

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Astro | 5.x / 6.x | SSG + Islands 架构 |
| **UI 组件** | React | 19.x | 交互 Islands（拓扑图、时间线） |
| **样式** | Tailwind CSS | v4 | `@theme` Design Tokens + 工具类 |
| **滚动动画** | GSAP + ScrollTrigger | 3.x | 滚动驱动叙事编排 |
| **平滑滚动** | Lenis | latest | 全局平滑滚动体验 |
| **类型检查** | TypeScript | 5.x | 数据类型安全 |
| **部署** | Vercel | — | SSG 静态部署 + CDN |
| **包管理** | pnpm | latest | 快速、磁盘友好 |

---

## 十一、对 V3 问题的逐项回应

| V3 问题 | V4 解决方案 | 状态 |
|---------|------------|------|
| 89KB 单文件不可维护 | 组件化拆分：7 个 Section + 独立组件 + 数据分离 | ✅ |
| CSS 规则分散在 3-4 处 | Tailwind v4 + 组件级 scoped styles | ✅ |
| 只有两个断点 | 五档断点 + `clamp()` 渐进缩放 | ✅ |
| 缺 `<main>`/`<h1>` | BaseLayout 强制语义结构 | ✅ |
| 无 `prefers-reduced-motion` | 全局检测 + CSS/JS 双重降级 | ✅ |
| SVG 小屏不可读 | 列表降级方案 | ✅ |
| `querySelectorAll('*')` 遍历 | 删除，`[待回填]` 数据在 data 层预处理 | ✅ |
| 打字机不可中断 | CSS `steps()` 实现或 AbortController 控制 | ✅ |
| Magic number 时序硬编码 | Token 系统统一管理，GSAP 读取 CSS Variables | ✅ |
| 拓扑节点坐标硬编码 | React 组件动态计算布局 | ✅ |

---

## 质量自检

- [x] 分层清晰：Astro 展现层 → React Islands 交互层 → GSAP 动画层 → 数据层
- [x] 模块边界明确：7 个 Section 独立，组件可复用，数据与展示分离
- [x] 技术选型可解释：每项选型记录理由、对比和退出成本
- [x] 风险已识别：Top 5 风险 + 缓解措施
- [x] 非功能性需求有方案：性能 ≥ 95、无障碍 ≥ 95、响应式五档
- [x] 无 AI 集成（本项目无 AI 功能，跳过）
- [x] 方案对开发者友好：目录结构清晰、组件职责明确、Token 系统统一

---

*🏛️ 技术架构专家 · NDHY AI Agent Team*
