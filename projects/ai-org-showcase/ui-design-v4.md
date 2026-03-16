# ui-design-v4.md — 产品官网 V4 UI 设计规范

> 🖌️ UI 设计专家产出 · 2026-03-16
>
> 基于：visual-spec-v4.md（Token 源）· experience-design-v4.md（交互方案）· review-worldclass-ui.md（审查报告）· tech-architecture-v4.md（Astro + Tailwind v4）· content-v4.md（文案）
>
> 面向：前端开发专家。所有间距、圆角、阴影、颜色引用 visual-spec-v4.md Token，零裸值。

---

## 1. 间距系统执行规范

### 1.1 间距映射表

所有间距必须使用 `--space-*` Token（visual-spec-v4.md §3），禁止裸 px 值。

| 场景 | Token | 值 | 说明 |
|------|-------|----|------|
| **区块间距（section py）** | `--space-16` | 64px | 桌面端区块纵向间距 |
| 区块间距（平板） | `--space-12` | 48px | ≤1023px |
| 区块间距（手机） | `--space-8` | 32px | ≤767px |
| **区块内标题→正文** | `--space-8` | 32px | H2 标题到首段内容 |
| **卡片间距** | `--space-6` | 24px | 卡片与卡片之间 |
| **卡片内间距** | `--space-6` | 24px | 卡片 padding |
| 卡片内元素间 | `--space-4` | 16px | 卡片内标题→正文→CTA |
| **列表项间** | `--space-3` | 12px | 数据行、对比行、层级行 |
| **标签/徽章内间距** | `--space-1` / `--space-2` | 4px / 8px | padding: `--space-1` `--space-2` |
| **Tooltip 内间距** | `--space-2` / `--space-3` | 8px / 12px | padding: `--space-2` `--space-3` |
| **按钮内间距** | `--space-3` / `--space-8` | 12px / 32px | padding: `--space-3` `--space-8` |
| **代码块内间距** | `--space-3` | 12px | padding 四边 |
| **手风琴面板内间距** | `--space-4` | 16px | padding |
| **焦点环偏移** | `2px` | 固定值 | outline-offset: 2px（无障碍标准值） |

### 1.2 间距层级铁律

```
区块间 --space-16 (64px)  >  区块内 --space-8 (32px)  >  
组件间 --space-6 (24px)   >  元素间 --space-4 (16px)   >  
内联间 --space-2 (8px)
```

### 1.3 零裸间距执行规则

1. **全局搜索禁止**：CSS 中不得出现 `margin: Npx`、`padding: Npx`、`gap: Npx` 等裸 px 值
2. **唯一例外**：`outline-offset: 2px`（无障碍标准值）、`border-width: 1px/2px`（边框宽度）
3. **负间距**：使用 `calc(-1 * var(--space-N))` 而非 `-8px`
4. **审计方法**：构建时 lint 规则检测裸 px 值（排除 border-width/outline-offset）

---

## 2. 组件库

所有组件引用 visual-spec-v4.md Token。每个组件覆盖 5 种状态：default / hover / active / focus / disabled。

### 2.1 按钮

三种变体：Primary / Secondary / Ghost。

**基础属性**（三种共享）：

| 属性 | Token |
|------|-------|
| font-size | `var(--fs-body)` |
| border-radius | `var(--radius-md)` |
| padding | `var(--space-3) var(--space-8)` |
| transition | `all var(--dur-micro) var(--ease-out)` |
| min-height | 48px（移动端触控保障） |

**5 态定义**：

| 状态 | Primary | Secondary | Ghost |
|------|---------|-----------|-------|
| **default** | bg: `--color-accent`, color: `--color-bg`, font-weight: `--fw-semibold` | bg: `transparent`, border: `1px solid --color-accent`, color: `--color-accent`, font-weight: `--fw-medium` | bg: `transparent`, border: `1px solid --color-border`, color: `--color-text`, font-weight: `--fw-medium` |
| **hover** | bg: `--color-accent-hover`, `translateY(-1px)`, shadow: `--shadow-glow-sm` | bg: `--color-accent-subtle`, `translateY(-1px)` | border-color+color → `--color-accent`, `translateY(-1px)` |
| **active** | bg: `--color-accent-active`, `scale(0.97)` | bg: `--color-accent-subtle`, border → `--color-accent-active` | border → `--color-accent-active` |
| **focus** | outline: `2px solid var(--color-accent)`, outline-offset: `2px`, shadow: `0 0 0 4px var(--color-accent-glow)` | 同 Primary | 同 Primary |
| **disabled** | `opacity: 0.4`, `pointer-events: none`, `cursor: not-allowed` | 同 Primary | 同 Primary |

### 2.2 卡片

三种变体：步骤卡片（区块③）/ 对比卡片（区块④）/ 架构剖面卡片（区块⑤）。

**共享基础**：

```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border-subtle);
border-radius: var(--radius-md);
padding: var(--space-6);
transition: border-color var(--dur-micro) var(--ease-out),
            box-shadow var(--dur-micro) var(--ease-out);
```

**变体差异**：

| 变体 | 差异属性 |
|------|---------|
| 步骤卡片 | 左侧 `border-left: 2px solid var(--color-accent)`；展开态增加 bg → `--color-bg-elevated` |
| 对比卡片 | 散装 AI 用 `--color-border`；AI 组织用 `border-color: var(--color-accent-subtle)` |
| 剖面卡片 | `border-radius: var(--radius-lg)`；入场用 `clip-path` 裁切展开 |

**5 态**：

| 状态 | 表现 |
|------|------|
| **default** | 如上基础 |
| **hover** | border → `--color-border`, shadow: `--shadow-sm` |
| **active** | border → `--color-border-strong`, shadow: `--shadow-md` |
| **focus** | outline: `2px solid var(--color-accent)`, outline-offset: `2px` |
| **disabled** | `opacity: 0.5`, border → `--color-border-subtle`, 无交互反馈 |

### 2.3 标签 / 徽章

两种变体：等级标签（L0/L1/L2/L3）/ 状态标签（✅/❌/成功/错误/警告/信息）。

**基础**：

```css
font-size: var(--fs-small);
font-weight: var(--fw-medium);
padding: var(--space-1) var(--space-2);
border-radius: var(--radius-sm);
display: inline-flex;
align-items: center;
gap: var(--space-1);
```

**等级标签色映射**：

| 等级 | color | background |
|------|-------|-----------|
| L0 老板 | `--color-boss` | `--color-level-l0-bg` |
| L1 Leader | `--color-accent` | `--color-level-l1-bg` |
| L2 项目管理 | `--color-info` | `--color-level-l2-bg` |
| L3 专家 | `--color-text-muted` | `--color-level-l3-bg` |

**状态标签**：使用 `--color-success/error/warning/info` + 对应 `-bg` Token（visual-spec-v4.md §1.5）。

**5 态**：

| 状态 | 表现 |
|------|------|
| **default** | 如上 |
| **hover** | `filter: brightness(1.15)` |
| **active** | `filter: brightness(0.9)` |
| **focus** | outline: `2px solid currentColor`, outline-offset: `2px` |
| **disabled** | `opacity: 0.4` |

### 2.4 代码块

```css
font-family: var(--font-mono);
font-size: var(--fs-small);
line-height: var(--lh-small);
background: var(--color-bg-elevated);
border: 1px solid var(--color-border-subtle);
border-radius: var(--radius-sm);
padding: var(--space-3);
overflow-x: auto;
```

**5 态**：default（如上）/ hover（border → `--color-border`）/ active（N/A，非交互组件）/ focus（`outline: 2px solid var(--color-accent)`, 当可选取时）/ disabled（`opacity: 0.5`）。

### 2.5 Tooltip

```css
background: var(--color-bg-overlay);
border: 1px solid var(--color-border);
border-radius: var(--radius-md);
padding: var(--space-2) var(--space-3);
font-size: var(--fs-small);
color: var(--color-text);
z-index: var(--z-tooltip);
box-shadow: var(--shadow-md);
max-width: 240px;
```

**进入**：`opacity 0→1`, `translateY(6px→0)`, `--dur-micro`, `--ease-out`。
**退出**：延迟 150ms 防闪烁，`opacity 1→0`, 100ms。
**定位**：节点正上方 `--space-3` (12px)，超出视口时翻转到下方。

**5 态**：default（可见态如上）/ hover（N/A, tooltip 自身不响应 hover）/ active（N/A）/ focus（当 focus 触发时显示，同 default）/ disabled（不显示）。

### 2.6 展开/收起面板（手风琴）

```css
/* 触发器 */
.accordion-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: none;
  color: var(--color-text-bright);
  font-size: var(--fs-body);
  font-weight: var(--fw-medium);
  cursor: pointer;
  width: 100%;
}

/* 面板 */
.accordion-panel {
  background: var(--color-bg-surface);
  border-left: 2px solid var(--color-accent);
  padding: var(--space-4);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

/* 展开动画：grid-template-rows: 0fr → 1fr */
/* 时长: var(--dur-normal), 缓动: var(--ease-out) */
/* 箭头: rotate(0 → 90deg), --dur-fast */
```

**5 态**（触发器）：

| 状态 | 表现 |
|------|------|
| **default** | 如上，箭头 → 指向右 |
| **hover** | bg → `--color-bg-elevated`, color → `--color-text-bright` |
| **active/expanded** | 箭头旋转 90°，面板展开 |
| **focus** | outline: `2px solid var(--color-accent)`, outline-offset: `2px` |
| **disabled** | `opacity: 0.4`, `pointer-events: none` |

### 2.7 导航 / 锚点指示器

用于区块⑤三剖面的滚动位置指示。

```css
.nav-indicator {
  position: fixed;
  right: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: var(--z-sticky);
}

.nav-dot {
  width: var(--space-3);    /* 12px */
  height: var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-gray-700);
  transition: all var(--dur-micro) var(--ease-out);
}

.nav-dot.active {
  background: var(--color-accent);
  box-shadow: var(--shadow-glow-sm);
  transform: scale(1.3);
}
```

**5 态**：default（灰点）/ hover（bg → `--color-gray-500`）/ active（`--color-accent` + glow）/ focus（outline: `2px solid var(--color-accent)`, offset `2px`）/ disabled（`opacity: 0.4`）。

**响应式**：≤767px 隐藏（移动端无侧边导航空间）。

---

## 3. 移动端拓扑图方案

> V3 致命问题：SVG 在 375px 下节点文字缩放至 ~4px，完全不可读。V4 移动端使用独立布局。

### 3.1 方案：垂直分层网格（≤767px）

不缩放桌面 SVG，改用结构化 HTML 网格：

```
┌───────────────────────────┐
│  👤 老板（人类）           │  L0 金色标识
├───────────────────────────┤
│  🧧 Leader                │  L1 靛蓝强调
├───────────────────────────┤
│  🏗️ 项目管理专家           │  L2 信息蓝
├───────────────────────────┤
│  ┌──────────┐ ┌──────────┐│  L3 专家网格
│  │🎯 需求分析│ │🔍 用户研究││  2列，按职能域分组
│  └──────────┘ └──────────┘│  域名作小标题
│  ┌──────────┐ ┌──────────┐│  （需求洞察 / 战略定义 /
│  │📊 市场评估│ │🔭 竞品调研││   流程角色 / 设计 / ...）
│  └──────────┘ └──────────┘│
│  ...                      │
└───────────────────────────┘
```

### 3.2 触控目标规格

| 元素 | 最小尺寸 | 实现方式 |
|------|---------|---------|
| 网格节点 | **48×48px** | `min-height: var(--space-12)` (48px), padding 扩展 |
| 域标题 | 不可点击 | 纯标签，`font-size: var(--fs-xs)`, `color: var(--color-text-dim)` |
| 展开卡片关闭区域 | 全屏 tap-outside | overlay 监听 |

### 3.3 节点交互

- **Tap 展开**：点击节点 → 展开卡片显示 emoji + 角色全名 + 一句话定位
- **同时只展开一个**：新 tap 关闭前一个
- **Tap-outside 关闭**：点击非节点区域关闭展开卡片
- **展开卡片样式**：bg: `--color-bg-overlay`, border: `--color-border`, radius: `--radius-md`, padding: `--space-3`, shadow: `--shadow-md`

### 3.4 亮起动画（移动端）

- 从上到下逐行亮起，间隔 80ms/行
- 连线省略（移动端无法有效传达网络关系，用分组替代）
- `prefers-reduced-motion`：跳过亮起，直接显示完成态

### 3.5 ≤375px 小屏额外适配

- 网格仍为 2 列，但格子 `min-height: 56px` 保证触达
- 域小标题字号不缩减，保持 `var(--fs-xs)`
- 水平 padding: `var(--space-4)` (16px)

### 3.6 ≥768px 平板

- 恢复 SVG 拓扑图，缩放 75%
- Hover tooltip 保留，连线简化
- 触控目标：SVG 节点 hitarea 扩展至 48×48px（透明 rect 覆盖）

---

## 4. 响应式布局规范

### 4.1 栅格系统

| 断点 | 宽度 | 栅格列数 | 列间距 | 容器 | 水平安全距 |
|------|------|---------|-------|------|-----------|
| 📱 xs | <375px | 4 列 | `--space-4` | 100vw | `--space-4` (16px) |
| 📱 sm | 375–767px | 4 列 | `--space-4` | 100vw | `--space-5` (20px) |
| 📋 md | 768–1023px | 8 列 | `--space-6` | max-width: 90vw | `--space-6` (24px) |
| 🖥️ lg | 1024–1439px | 12 列 | `--space-6` | max-width: 800px 居中 | `--space-6` (24px) |
| 🖥️ xl | ≥1440px | 12 列 | `--space-8` | max-width: 900px 居中 | auto（居中留白） |

### 4.2 逐区块断点布局

#### ① 悬念开场

| 断点 | 布局变化 |
|------|---------|
| xs/sm | 单列居中，字号 `clamp(1.5rem, 5vw, 1.75rem)`，品类提示 `opacity: 0.12` |
| md | 单列居中，字号 `2rem` |
| lg/xl | 单列居中，字号 `var(--fs-display)` (2.5rem)，品类提示 `opacity: 0.15` |

#### ② 拓扑图

| 断点 | 布局变化 |
|------|---------|
| xs/sm | **垂直分层网格**（§3），无 SVG |
| md | SVG 缩放 75%，tooltip 保留 |
| lg/xl | SVG 全尺寸 `viewBox="0 0 800 600"`，完整交互 + 高潮爆发 |

#### ③ 运转揭秘

| 断点 | 布局变化 |
|------|---------|
| xs/sm | 纵向时间线，全宽步骤卡片，手风琴模式 |
| md | 纵向时间线，卡片宽度 80% 居中 |
| lg/xl | 水平时间线 + 右侧展开面板 |

#### ④ 认知落差

| 断点 | 布局变化 |
|------|---------|
| xs/sm | 上下堆叠（先灰后亮），中间 "vs" 分隔符，全宽 |
| md | 左右双栏，gap: `--space-4` |
| lg/xl | 左右双栏，gap: `--space-8`，hover 行联动高亮 |

#### ⑤ 深层架构

| 断点 | 布局变化 |
|------|---------|
| xs/sm | 每剖面高度自适应（min-height: 70vh），层级数据纵向卡片排列。锚点指示器隐藏 |
| md | 每剖面 min-height: 75vh，层级数据保持水平 |
| lg/xl | 每剖面 80vh，裁切展开动画完整，锚点指示器显示 |

#### ⑥ 更大图景

| 断点 | 布局变化 |
|------|---------|
| xs/sm | "答案是——组织。" 字号 `var(--fs-emphasis-md)`，标准 IO 触发淡入（不用 scrub） |
| md | 字号 `var(--fs-emphasis-md)`，标准 IO 触发 |
| lg/xl | 字号 `var(--fs-emphasis-lg)`，**scrub 驱动**淡入，全屏独立展示 |

#### ⑦ 收束

| 断点 | 布局变化 |
|------|---------|
| xs/sm | 品牌陈述居中，邮箱全宽可点击块（`min-height: var(--space-12)`），GitHub 链接独立行 |
| md+ | 品牌陈述居中，邮箱文本链接，GitHub 文字链接 + 箭头 |

---

## 5. 无障碍 UI 规范

### 5.1 Focus 可见样式

**所有可交互元素**统一 focus 样式：

```css
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**增强版**（按钮 Primary，拓扑节点）：

```css
.btn-primary:focus-visible,
.topo-node:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}
```

**禁止事项**：

- ❌ 不得使用 `outline: none` 无替代
- ❌ 不得仅用颜色变化表示 focus（须有明确轮廓）

### 5.2 键盘导航路径

| 区块 | Tab 顺序 |
|------|---------|
| Skip Link → | `<main>` 跳转 |
| ① 悬念 | 下滚箭头（若为按钮） |
| ② 拓扑 | 节点按 L0→L1→L2→L3 顺序，每节点 `tabindex="0"` + `role="button"`，Enter/Space 打开 tooltip |
| ③ 时间线 | 各步骤触发器按顺序，`aria-expanded` 切换，Enter/Space 展开/收起 |
| ④ 对比 | 纯展示，无可交互元素（标签非交互） |
| ⑤ 剖面 | 锚点指示器各 dot 可 Tab，Enter 跳转 |
| ⑥ 宣言 | 纯文字，无交互 |
| ⑦ 收束 | 邮箱链接 → GitHub 链接 |

**焦点陷阱**：Tooltip 弹出时不陷阱（非模态），Esc 关闭。

### 5.3 触控目标最小尺寸

| 元素 | 最小尺寸 | 实现 |
|------|---------|------|
| 按钮 | 48×48px | `min-height: var(--space-12)` |
| 拓扑节点（移动端） | 48×48px | 网格格子 `min-height: var(--space-12)` |
| 拓扑节点（SVG） | 48×48px | 透明 rect hitarea 扩展 |
| 时间线步骤 | 48px 高度 | `min-height: var(--space-12)` |
| 下滚箭头 | 48×48px | padding 扩展 |
| 链接（邮箱/GitHub） | 48px 行高 | `min-height: var(--space-12)`, `display: inline-flex` |

### 5.4 对比度保障

所有文字色已在 visual-spec-v4.md §12 验证通过 WCAG AA。UI 层执行规则：

- 正文 → `--color-text` (11.2:1 AAA) ✅
- 标题 → `--color-text-bright` (18.2:1 AAA) ✅
- 辅助 → `--color-text-muted` (5.5:1 AA) ✅
- 装饰 → `--color-text-dim` (4.0:1 大字 AA) ✅ — 仅用于 `≥ var(--fs-h2)` 以上字号
- 禁用态 → `--color-text-disabled` (3.0:1) — 符合 WCAG 禁用态豁免
- **绝对禁止**：使用 `--color-text-dim` 于 `< var(--fs-h2)` 的正文

### 5.5 非颜色信息传达

- 状态标签：除颜色外，必须配合 emoji/图标（✅/❌/⚠️）
- 错误状态：红色边框 + 错误图标 + 文字说明
- 拓扑节点层级：除颜色差异外，L0/L1/L2 用不同节点尺寸区分

---

## 质量自检

- [x] 所有间距引用 `--space-*` Token，零裸 px（排除 border-width/outline-offset）
- [x] 所有颜色引用语义 Token，零裸色值
- [x] 所有圆角引用 `--radius-*` Token
- [x] 所有阴影引用 `--shadow-*` Token
- [x] 7 个组件均覆盖 5 种状态（default/hover/active/focus/disabled）
- [x] 移动端拓扑图独立方案，触控目标 ≥ 48×48px
- [x] 四档响应式（375/768/1024/1440），逐区块布局变化文档化
- [x] 无障碍：focus 可见、键盘导航、触控目标、对比度、非颜色信息
- [x] ≤ 5000 字

---

_🖌️ UI 设计专家 · V4 UI 设计规范完成。5 章覆盖：间距系统（零裸值执行规范 + 映射表）/ 组件库（7 组件 × 5 态全覆盖）/ 移动端拓扑图（垂直分层网格，48px 触控目标）/ 响应式布局（4 档 × 7 区块逐一定义）/ 无障碍（focus + 键盘 + 触控 + 对比度）。所有值引用 visual-spec-v4.md Token。_
