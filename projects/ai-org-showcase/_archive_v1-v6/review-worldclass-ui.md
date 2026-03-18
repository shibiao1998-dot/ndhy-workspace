# 世界级审查：UI 设计维度

## 总分：6.3 / 10

> 当前水平：**专业级偏上**，有不少亮点（Token 体系完整、动画叙事精良、暗色调氛围突出），但距离 Stripe/Linear/Vercel 级别的"每个像素都经过审计"还有明显差距。核心短板集中在：间距系统执行不严格、排版缺乏出版级精度、组件状态覆盖不足、移动端缺少针对性优化。

---

## 对标差距分析

### vs Stripe.com
| 方面 | Stripe 做到了 | 当前页面的差距 |
|------|-------------|--------------|
| **间距精度** | 所有间距来自 4px/8px 基数系统，没有一个例外 | 多处裸数字（`margin-top: 48px`、`margin-top: 32px`、`padding: 8px 14px`、`bottom: -4px` 等），大约 20+ 处脱离 Token |
| **字号层级** | 严格的 Type Scale（12/14/16/20/24/32/40/48/64），每一级有明确语义 | 定义了 6 级 Token（xs~display），但实际使用中出现 `13px`、`12px`、`11px` 等裸值（SVG text 和 tooltip） |
| **色彩语义** | 每个颜色都有语义名称（surface/primary/muted/destructive），从不出现裸色值 | 存在 40+ 处裸色值：`#e0e0e0`、`#d0d0d0`、`#c8c8d0`、`#f0f0f0`、`#999`、`rgba(...)` 等 |
| **按钮系统** | 6 种变体 × 4 种尺寸 × 5 种状态，全部有规范 | 仅 2 种变体（primary/ghost），无尺寸变体，缺 disabled/loading/focus 状态定义 |

### vs Linear.app
| 方面 | Linear 做到了 | 当前页面的差距 |
|------|-------------|--------------|
| **排版呼吸感** | 段落间距 = 行高 × 1.5，标题与正文间距有黄金比例关系 | 间距跳跃不规律：有的地方 `sp-6`（24px），有的地方裸写 `12px`、`48px` |
| **动效克制** | 只在必要交互点使用动效，绝不为了"酷"加动画 | 动效整体克制得不错，但 Block 2 拓扑图 30 个节点逐个亮起耗时过长，信息密度低 |
| **移动端** | 移动端是独立设计，不是桌面缩放 | 移动端是桌面端的压缩版，SVG 拓扑图在 375px 下节点文字极小、无法阅读 |

### vs Vercel.com
| 方面 | Vercel 做到了 | 当前页面的差距 |
|------|-------------|--------------|
| **留白节奏** | 区块间留白 = 120~160px，区块内留白 = 48~64px，组件间 = 16~24px，三级分明 | 区块间留白 = 64px（`sp-16`），与区块内留白比例不够分明 |
| **组件一致性** | 卡片圆角统一 8px/12px，阴影统一 3 级 | 圆角值混用：`8px`、`6px`、`4px`、`0 6px 6px 0`，且全为裸数字 |
| **背景分层** | 表面/抬升层有清晰的 elevation 层级（3~4 层），每层有对应阴影 | 只有 2 层（bg-surface/bg-elevated），阴影只在 tooltip 使用 |

---

## 逐维度评分

| 维度 | 评分 | 差距描述 | 达到世界级需要做什么 |
|------|------|---------|-------------------|
| **1. 视觉层级** | 7 | 字号从 display→xs 有 6 级梯度，整体层级清晰。但 Hook 区的"6 天后"和"一个人启动了一个项目"用了相同 fs-h2 字号，视觉优先级不分明；Block 5 三张剖面图的标题和正文字号差仅 0.25rem，层级不够拉开 | ① 将叙事节奏中的过渡句降为 fs-body + muted，让高潮句独占大字号层级；② Block 5 标题字号提升至 fs-h1 或增加一级 fs-h3 Token 填补 h2→body 断层 |
| **2. 间距系统** | 5 | Token 定义了 8 档间距（4~64px），但实际 CSS 中 **至少 25 处使用裸数字**：tooltip `8px 14px`、reveal-text `48px`/`12px`、vision-para `24px`、step-dot `4px`/`-8px`、hook-emphasis `-4px`、`.evo-block sp-4` 但 border-radius `8px` 等 | ① 补充缺失的 Token 档位：`--sp-5: 20px`、`--sp-10: 40px`、`--sp-14: 56px`；② **全局搜索所有裸 px 值，逐一替换为 var(--sp-N)**；③ 圆角需单独建 Token（`--radius-sm/md/lg`） |
| **3. 色彩一致性** | 5 | Token 系统覆盖了 bg/text/accent/border/status 五大类，语义化做得不错。但 CSS 中存在 **40+ 处裸色值**：`#e0e0e0`、`#d0d0d0`、`#c8c8d0`、`#f0f0f0`、`#d5d5d5`、`#999`、`#777`、`#666`、`#c0c0c0`、`#1a1a35`、`rgba(10,10,15,0.8)` 等。部分是 V3.2/V3.3 补丁用高优先级选择器硬编码的 | ① 将所有裸色值归入 Token 系统：增加 `--color-text-secondary`、`--color-bg-overlay`、`--color-border-accent` 等语义 Token；② 删除所有 `section#xxx .class { color: #xxx }` 硬覆盖，改用统一 Token；③ 内联 style 中的 `color: #a5b4fc` 迁移到 CSS 类 |
| **4. 组件规范** | 5 | 按钮有 primary/ghost 两种变体，卡片样式（step-content/contrast-panel/cross-section）大致统一。但：① 按钮缺 disabled/loading/focus 独立样式（只靠 :focus-visible 全局兜底）；② 卡片圆角不统一（8px/6px/4px/`0 6px 6px 0`）；③ Tag 组件无 hover 状态；④ Tooltip 硬编码 `13px`/`12px`；⑤ 无 Size 变体（sm/md/lg） | ① 建立组件 Token：`--radius-sm: 4px`、`--radius-md: 8px`、`--radius-lg: 12px`，统一所有组件圆角；② 按钮补全状态：disabled（opacity 0.5 + cursor not-allowed）、loading（spinner + 文字变淡）、focus（accent ring 2px offset）；③ 定义组件尺寸变体 |
| **5. Design Token 使用** | 6.5 | Token 定义层面相当完整：色彩 14 个、字号 6 个、间距 8 个、动效 9 个、字重 3 个。**问题在于使用层面**——大量裸值绕过 Token 系统。V3.2~V3.3 的对比度修复引入了大量硬编码覆盖。缺失 Token：border-radius、box-shadow、z-index、max-width（组件级） | ① 补充缺失类型：`--radius-*`（3 档）、`--shadow-*`（3 档）、`--z-*`（5 档）；② 进行一次"Token 审计"：遍历全文件，将所有裸 px/裸色值替换为 Token 引用；③ 删除 V3.2/V3.3 的 hardcode 覆盖层，从源头修复 Token 值 |
| **6. 排版质量** | 6 | 字体栈优秀（system-ui + Noto Sans SC 兜底）、行高有 3 档（1.25/1.6/1.8）、正文 18px 基数合理。但：① 缺少 letter-spacing 的系统性应用（仅 tight/normal/wide 三档，实际只在 date 行用了 wide）；② SVG 内 font-size 全部用裸 px（28/22/20/13/12/11）完全脱离 Token；③ 行高在一些地方不一致（`.flow-step` 用了 `lh-normal` 但 `.reveal-text .statement` 用了 `1.4`、`.vision-content p` 用了 `1.8`） | ① 为 SVG text 建立独立的缩放尺寸系统（或在 JS 中动态应用）；② 统一行高：删除所有裸行高值，全部引用 Token（`--lh-tight/normal/relaxed`）；③ 增加 `--ls-body: 0.01em` 提升正文可读性；④ 考虑添加 `font-feature-settings: 'kern' 1, 'liga' 1` 提升排印质量 |
| **7. 移动端视觉** | 5.5 | 有基础响应式：600px 断点下字号缩小、对比面板变单列、按钮全宽。但：① SVG 拓扑图在 375px 下宽度 ≈ 345px，30 个节点 + 标签极度拥挤，**节点标签 11px 在 SVG 缩放后实际仅约 4-5px，完全无法阅读**；② 断点只有 600px 和 1023px 两个，缺少 768px（平板）和 1280px（大屏）；③ 移动端 section padding 20px 不够（对比 Stripe 移动端 24px）；④ Timeline 在移动端左侧 padding 收窄后 dot 和 content 间距过紧 | ① **拓扑图移动端方案重做**：375px 下不应硬缩 SVG，应改为简化布局（环形→线性列表/分组卡片）或仅显示核心层级；② 增加 768px 断点处理平板；③ 移动端 padding 统一为 `--sp-6`（24px）；④ Timeline 移动端 dot 尺寸缩至 12px、间距微调 |

---

## 达到世界级必须解决的问题清单

### 🔴 P0 — 阻断级（不解决则无法称为专业级）

#### P0-1：全站裸色值清理 → Token 语义化
**现状**：40+ 处裸色值散布在 CSS 中，部分是 V3.2/V3.3 对比度修复的硬编码覆盖。
**影响**：Token 系统形同虚设，任何主题/模式切换都会崩溃；维护成本极高。
**修复方案**：
```css
/* 新增语义 Token */
:root {
  --color-text-secondary: #d0d0d0;   /* 替代所有 #d0d0d0/#d5d5d5/#c8c8d0 */
  --color-text-tertiary:  #999;       /* 替代所有 #999/#777 */
  --color-text-quaternary: #666;      /* footer 等极低优先级文字 */
  --color-bg-overlay:     rgba(10,10,15,0.8);  /* 替代散装面板背景 */
  --color-accent-light:   #a5b4fc;    /* 替代所有 #a5b4fc 裸值 */
  --color-accent-surface: rgba(129,140,248,0.15); /* 替代 hover 背景 */
}
```
然后：
1. 全局搜索 `#e0e0e0` → `var(--color-text)`
2. 全局搜索 `#f0f0f0`/`#f5f5f5` → `var(--color-text-bright)`
3. 全局搜索 `#d0d0d0`/`#d5d5d5`/`#c8c8d0` → `var(--color-text-secondary)`
4. 全局搜索 `#999`/`#777` → `var(--color-text-tertiary)`
5. 全局搜索 `#a5b4fc` → `var(--color-accent-light)`
6. 删除所有 `section#xxx .class { color: ... }` 高优先级覆盖块

#### P0-2：全站裸间距清理 → Token 引用
**现状**：25+ 处裸 px 值脱离 Token 系统。
**影响**：间距不成系统，视觉节奏不规律。
**修复方案**：
```css
/* 补充缺失间距档位 */
:root {
  --sp-5:  20px;
  --sp-10: 40px;
  --sp-14: 56px;
  --sp-20: 80px;
  --sp-24: 96px;
}
```
逐一替换：
- `.tooltip { padding: 8px 14px }` → `padding: var(--sp-2) var(--sp-3)` 或 `var(--sp-2) var(--sp-4)`
- `.reveal-text { margin-top: 48px }` → `margin-top: var(--sp-12)`
- `.vision-para { margin-bottom: 24px }` → `margin-bottom: var(--sp-6)`
- `.step-dot { top: 4px; left: -8px }` → `top: var(--sp-1); left: calc(-1 * var(--sp-2))`
- `.hook-emphasis::after { bottom: -4px }` → `bottom: calc(-1 * var(--sp-1))`
- `.reveal-text .statement { margin-bottom: 12px }` → `margin-bottom: var(--sp-3)`

#### P0-3：Border Radius Token 化
**现状**：圆角值混乱 — `8px`、`6px`、`4px`、`0 6px 6px 0`，无 Token。
**修复方案**：
```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:  12px;
  --radius-full: 9999px;
}
```
统一：卡片/面板 → `--radius-md`，按钮 → `--radius-md`（当前 6px 改为 8px），Tag → `--radius-sm`，Dot → `--radius-full`。

---

### 🟠 P1 — 重要（影响专业感知）

#### P1-1：移动端拓扑图体验重做
**现状**：375px 下 SVG 压缩至 ~345px，30 个节点 + 标签挤在一起，文字缩放后约 4-5px，**完全不可读**。
**修复方案**：
- **方案 A（推荐）**：375px 下替换为简化版布局 — 3 层环简化为纵向分层列表：`老板 → Leader → 核心专家（分域折叠）`，点击域名展开该域的专家列表
- **方案 B**：SVG 保留但隐藏所有 R3 标签文字，仅保留 emoji，tap 显示 tooltip
- **关键**：移动端不是桌面端的缩放版，是**独立的信息呈现方案**

#### P1-2：按钮状态覆盖
**现状**：仅 hover/active 两种状态，缺 disabled/loading/focus 独立定义。
**修复方案**：
```css
.btn-primary:disabled,
.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-text-bright);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}
.btn-ghost:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
/* Loading state — 通过 JS 添加 .loading class */
.btn-primary.loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}
.btn-primary.loading::after {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  border: 2px solid rgba(10,10,20,0.3);
  border-top-color: #0a0a14;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

#### P1-3：Box Shadow Token 化
**现状**：阴影仅在 tooltip（`0 4px 20px rgba(0,0,0,0.4)`）和 accent glow 中使用，无系统。
**修复方案**：
```css
:root {
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px var(--color-accent-glow);
}
```
应用：tooltip → `--shadow-md`，卡片 hover → `--shadow-sm`，modal（如有）→ `--shadow-lg`。

#### P1-4：区块间留白节奏
**现状**：`--section-py: 64px`（sp-16），区块间和区块内间距比例不够分明（Vercel 是 120~160px vs 48~64px）。
**修复方案**：
```css
:root {
  --section-py: var(--sp-24);  /* 96px — 区块间 */
  /* 区块内标题到内容: sp-8 (32px) */
  /* 区块内组件间: sp-4~sp-6 (16~24px) */
}
```
或至少在非首屏区块（Block 3~7）增加 padding-top 到 `var(--sp-20)`（80px）。

---

### 🟡 P2 — 建议（提升精致度）

#### P2-1：行高统一
**现状**：`.reveal-text .statement` 使用裸行高 `1.4`、`.vision-content p` 使用 `1.8`，与 Token 的 `--lh-tight: 1.25 / --lh-normal: 1.6 / --lh-relaxed: 1.8` 不完全对应。
**修复**：`.statement { line-height: var(--lh-tight) }` 或增加 `--lh-snug: 1.4` Token。

#### P2-2：SVG 字号系统化
**现状**：SVG 内 `font-size="28/22/20/13/12/11"` 全为裸值，脱离 Token。
**修复**：虽然 SVG 内无法直接使用 CSS 变量（部分浏览器支持），但可以通过 CSS 选择器统一：
```css
.topo-svg .boss text:first-of-type  { font-size: 28px; }  /* 对应 --fs-h1 换算 */
.topo-svg .node text:last-of-type   { font-size: 12px; }  /* 对应 --fs-xs 换算 */
```
并注释说明与 Token 的对应关系。

#### P2-3：内联 style 迁移到 CSS
**现状**：`<span style="color: #a5b4fc; font-weight: 700;">答案是——组织。</span>` 和 `<p style="font-weight: bold;">` 使用内联样式。
**修复**：创建语义化类：
```css
.text-accent-bold { color: var(--color-accent-light); font-weight: var(--fw-bold); }
```

#### P2-4：增加断点覆盖
**现状**：仅 600px 和 1023px 两个断点，对比 Token 中定义了 6 个断点（xs/sm/md/lg/xl/2xl）。
**修复**：至少增加：
- `768px`：平板竖屏 — 对比面板保持双列但减小 gap
- `1280px`：大屏 — max-width 可适当放宽

#### P2-5：Tag 组件 hover 状态
**现状**：`.tag` 无 hover/focus 状态。
**修复**：
```css
.tag:hover {
  filter: brightness(1.15);
  cursor: default;
}
```

#### P2-6：暗色系对比度微调
**现状**：footer 的 `#666`/`#777` 对比 `#0d0d14` 背景，对比度约 3.5:1~4.2:1，勉强达标。
**修复**：footer 文字最低提升至 `--color-text-tertiary: #888`（对比度 ~4.8:1）。

---

## 总结

| 优先级 | 数量 | 核心主题 |
|--------|------|---------|
| 🔴 P0 | 3 | Token 系统执行：裸色值、裸间距、圆角 Token 化 |
| 🟠 P1 | 4 | 移动端拓扑重做、按钮状态、阴影 Token、区块留白 |
| 🟡 P2 | 6 | 行高统一、SVG 字号、内联样式、断点、Tag 状态、对比度 |

**一句话诊断**：Token 系统的**设计**是 7.5 分水平，Token 系统的**执行**是 5 分水平。差距不在于"不知道该怎么做"，而在于"知道了但没有严格执行"——这在多轮迭代修复（V3.2→V3.3→V3.4→V3.5）中尤为明显，每次修复都引入了绕过 Token 的硬编码。世界级产品的特征恰恰是：**无论迭代多少轮，Token 系统的纪律始终不被打破**。
