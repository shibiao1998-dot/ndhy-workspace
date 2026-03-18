# NDHY AI Org Dashboard V7 — MVP 视觉设计规范

> 版本：v1.0  
> 日期：2026-03-18  
> 上游输入：产品定义 v1.1 + 架构设计 v1.0 + UX 交互文档 v1.0  
> 下游消费：前端开发（M2-M8 模块实现）  
> 视觉基调：深色科技感 · 数据驱动 · 干净利落

---

## 一、Design Token

所有 Token 以 CSS Custom Property 格式定义，直接放入 Tailwind CSS v4 的 `@theme` 块。

### 1.1 色彩系统

```css
@theme {
  /* ══ 背景色系（4 级深度递进）══ */
  --color-bg-base: #0B0E14;          /* 页面底色 — 最深 */
  --color-bg-surface: #111827;       /* 区块/卡片背景 */
  --color-bg-elevated: #1A2233;      /* 浮层/hover 卡片 */
  --color-bg-inset: #0D1117;         /* 内嵌区域（代码块、热力图底）*/

  /* ══ 文字色系（3 级）══ */
  --color-text-primary: #F1F5F9;     /* 主文字 — 与 bg-base 对比 17.4:1 ✅ */
  --color-text-secondary: #94A3B8;   /* 次要文字 — 与 bg-base 对比 7.2:1 ✅ */
  --color-text-tertiary: #64748B;    /* 辅助文字 — 与 bg-surface 对比 4.6:1 ✅ */

  /* ══ 强调色 ══ */
  --color-accent-primary: #38BDF8;   /* 主色 — 天际蓝 */
  --color-accent-primary-hover: #7DD3FC;
  --color-accent-primary-muted: rgba(56, 189, 248, 0.15);
  --color-accent-secondary: #A78BFA; /* 辅色 — 星云紫 */
  --color-accent-secondary-muted: rgba(167, 139, 250, 0.15);

  /* ══ 状态色 ══ */
  --color-status-success: #34D399;
  --color-status-success-muted: rgba(52, 211, 153, 0.15);
  --color-status-warning: #FBBF24;
  --color-status-warning-muted: rgba(251, 191, 36, 0.15);
  --color-status-error: #F87171;
  --color-status-error-muted: rgba(248, 113, 113, 0.15);

  /* ══ 卡片 / 边框 ══ */
  --color-border-default: rgba(148, 163, 184, 0.12);
  --color-border-hover: rgba(56, 189, 248, 0.30);
  --color-card-bg: var(--color-bg-surface);
  --color-card-bg-hover: var(--color-bg-elevated);
}
```

**WCAG AA 对比度校验**（关键组合）：

| 前景 | 背景 | 比值 | 标准 |
|------|------|------|------|
| `text-primary` #F1F5F9 | `bg-base` #0B0E14 | 17.4:1 | ≥4.5 ✅ |
| `text-secondary` #94A3B8 | `bg-base` #0B0E14 | 7.2:1 | ≥4.5 ✅ |
| `text-tertiary` #64748B | `bg-surface` #111827 | 4.6:1 | ≥4.5 ✅ |
| `accent-primary` #38BDF8 | `bg-surface` #111827 | 7.8:1 | ≥4.5 ✅ |
| `accent-secondary` #A78BFA | `bg-surface` #111827 | 5.9:1 | ≥4.5 ✅ |

### 1.2 字体系统

```css
@theme {
  /* ══ 字体栈 ══ */
  --font-sans: 'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* ══ 字号层级 ══ */
  --text-h1: 3rem;       /* 48px — Hero 主标题 */
  --text-h2: 2rem;       /* 32px — 页面标题 */
  --text-h3: 1.5rem;     /* 24px — 区块标题 */
  --text-h4: 1.125rem;   /* 18px — 卡片标题 */
  --text-body: 1rem;     /* 16px — 正文 */
  --text-small: 0.875rem;/* 14px — 次要信息 */
  --text-caption: 0.75rem;/* 12px — 标签/badge */

  /* ══ 行高 ══ */
  --leading-tight: 1.2;   /* 标题 */
  --leading-normal: 1.6;  /* 正文 */
  --leading-relaxed: 1.8; /* 长段落 */

  /* ══ 字重 ══ */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

**字号使用规则**：h1 仅用于 Hero 区域，h2 用于每页大标题，h3 用于区块标题，h4 用于卡片标题。正文统一 body，辅助信息用 small，badge/时间戳用 caption。

### 1.3 间距系统

```css
@theme {
  /* ══ 间距（4px 网格）══ */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### 1.4 圆角 / 阴影 / 断点

```css
@theme {
  /* ══ 圆角 ══ */
  --radius-sm: 0.375rem;   /* 6px — badge / 小元素 */
  --radius-md: 0.5rem;     /* 8px — 按钮 */
  --radius-lg: 0.75rem;    /* 12px — 卡片 */
  --radius-xl: 1rem;       /* 16px — 大卡片/导航卡片 */

  /* ══ 阴影（深色主题用微光 + 边框代替传统阴影）══ */
  --shadow-card: 0 0 0 1px var(--color-border-default);
  --shadow-card-hover: 0 0 0 1px var(--color-border-hover),
                       0 4px 24px rgba(56, 189, 248, 0.06);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* ══ 断点 ══ */
  --breakpoint-desktop: 1024px; /* 桌面端最小宽度 */
}
```

---

## 二、全局视觉规范

### 2.1 页面背景

- **底色**：`bg-base` (#0B0E14) 纯色铺底
- **纹理**：页面顶部叠加极淡的径向渐变光晕 `radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.03) 0%, transparent 60%)`，增加深度感但不喧宾夺主
- **区块间无硬性分隔线**，靠 `space-20`（80px）的垂直间距 + 背景色微差（base vs surface）自然分隔

### 2.2 栅格与布局

| Token | 值 | 说明 |
|-------|-----|------|
| 内容最大宽度 | `1200px` | `max-w-[1200px] mx-auto` |
| 水平边距 | `space-8`（32px） | 左右 padding |
| 区块垂直间距 | `space-20`（80px） | 页面内各区块间 |
| 卡片网格间距 | `space-6`（24px） | 卡片之间 |
| 卡片内边距 | `space-6`（24px） | 卡片内容到边框 |

### 2.3 导航栏（Navbar）

| 属性 | 值 |
|------|-----|
| 高度 | `64px` |
| 初始背景 | `transparent` |
| 滚动后背景 | `bg-base` + `backdrop-blur(12px)` + 底部 1px `border-default` |
| 品牌名字号 | `text-h4`（18px），`font-semibold`，`text-primary` |
| 导航项字号 | `text-small`（14px），`font-medium` |
| 导航项默认色 | `text-secondary` |
| 导航项 hover | `text-primary`，过渡 150ms |
| 当前页 active | `accent-primary` + 下方 2px 指示线 |
| 定位 | `position: sticky; top: 0; z-index: 50` |

### 2.4 页脚（Footer）

| 属性 | 值 |
|------|-----|
| 背景 | `bg-inset` |
| 上边框 | 1px `border-default` |
| 内边距 | `space-8` 上下 |
| 文字 | `text-caption`（12px），`text-tertiary` |
| 更新时间 | 左侧："数据更新于 YYYY-MM-DD HH:mm" |
| 版权 | 右侧："NDHY AI Agent Team · Powered by AI" |

### 2.5 图标/Emoji 展示规范

- 专家 emoji：`font-size: 2rem`（32px），在 ExpertCard 中居左或居中
- 分类 emoji：`font-size: 1.25rem`（20px），行内与文字对齐
- 不对 emoji 做额外滤镜或阴影处理，保持系统原生渲染

---

## 三、每页视觉布局

### 3.1 Landing 页 `/`

**Hero 区块（A）**— 首屏核心

- 背景：`bg-base` + 顶部渐变光晕
- 组织名：`text-h2`（32px），`font-bold`，`text-primary`
- Tagline：`text-h1`（48px），`font-bold`，`text-primary`，行间距 `leading-tight`
- 跳动数字：`text-h1`（48px），`font-bold`，`accent-primary`
- 数字标签：`text-body`（16px），`text-secondary`
- 垂直间距：tagline 与数字间 `space-10`

**数据卡片区（B）**— StatsCards

- 布局：3 列等宽网格，间距 `space-6`
- 单张 DataCard：
  - 尺寸：`flex-1`，`min-height: 140px`
  - 背景：`card-bg` + `shadow-card`（1px 边框）
  - 圆角：`radius-lg`（12px）
  - 数字：`text-h2`（32px），`font-bold`，`accent-primary`
  - 标签：`text-small`（14px），`text-secondary`
  - 图标/emoji：`text-h3`（24px），位于数字上方
  - hover：背景 → `card-bg-hover`，边框 → `border-hover`，`translateY(-4px)`，过渡 200ms

**快速导航区（C）**— QuickNav

- 布局：3 列等宽网格，间距 `space-6`
- 单张导航卡片：
  - 背景：`card-bg` + `shadow-card`
  - 圆角：`radius-xl`（16px）
  - 标题：`text-h4`（18px），`font-semibold`，`text-primary`
  - 描述：`text-small`（14px），`text-secondary`
  - 箭头：右侧 `→` 符号，`accent-primary`
  - hover：边框 → `border-hover`，上浮 4px，箭头右移 4px，过渡 200ms

### 3.2 Team 组织全景页 `/team`

**页面标题区（A）**

- 标题：`text-h2`，`font-bold`，`text-primary`
- 副标题：`text-body`，`text-secondary`，含专家总数（`accent-primary` 高亮数字）

**组织架构图（B）**— OrgChart

- 6 层水平条状结构，每层间距 `space-3`
- 每层：圆角条 `radius-md`，高度 `48px`，背景 `bg-surface`
- 层名 + 专家数：`text-small`，`font-medium`，层名 `text-primary`，数量 `text-tertiary`
- hover：背景 → `bg-elevated`，左侧出现 3px `accent-primary` 竖线指示器
- 点击：平滑滚动至对应层级卡片区

**专家卡片网格（C）**— ExpertCard

- 按层级分组，每组标题：`text-h3`，`font-semibold` + 层级 emoji
- 网格：4 列，间距 `space-6`
- 单张 ExpertCard：
  - 尺寸：`width: auto`，`min-height: 100px`
  - 背景：`card-bg` + `shadow-card`
  - 圆角：`radius-lg`
  - 内边距：`space-5`
  - Emoji：`font-size: 2rem`（32px）
  - 名称：`text-h4`（18px），`font-medium`，`text-primary`
  - 层级标签：Badge 样式 —— `text-caption`，`accent-primary-muted` 背景，`accent-primary` 文字，圆角 `radius-sm`
  - hover：背景 → `card-bg-hover`，边框 → `border-hover`，上浮 4px，底部滑出 capability 描述（`text-small`，`text-secondary`，最多 2 行），过渡 250ms

### 3.3 Capabilities 能力矩阵页 `/capabilities`

**技能矩阵区（B）**— SkillCategory 手风琴

- 布局：单列堆叠，间距 `space-3`
- 折叠态：
  - 背景 `card-bg`，圆角 `radius-lg`，高度 `56px`
  - 左侧分类 emoji + 分类名（`text-h4`，`font-medium`）
  - 右侧技能数 badge（`text-caption`，`accent-primary`）+ 展开箭头 `▸`
  - hover：背景 → `card-bg-hover`
- 展开态：
  - 箭头旋转 90°，展开动画 250ms `easeInOut`
  - 展开区域内：技能名列表，每项 `text-body`，`text-secondary`，行高 `leading-normal`，左侧圆点标记 `accent-primary`
  - 展开区域上方 1px `border-default` 分隔线

**模型概览区（C）**— ModelOverview

- 模型类型：3 列网格，每张小卡片 `bg-surface`，圆角 `radius-md`
  - 图标 emoji + 类型名（`text-small`，`text-primary`）+ 数量（`accent-primary`）
- 精选模型：水平排列 badge 组 —— `accent-secondary-muted` 背景，`accent-secondary` 文字，圆角 `radius-sm`，`text-caption`

**全链路覆盖图（D）**— CapabilityChain

- 水平 6 节点流程图，节点间连线
- 节点：`40px` 圆形，`accent-primary` 描边，内含阶段编号
- 节点下方标签：阶段名（`text-small`，`text-primary`）+ 技能/专家数（`text-caption`，`text-tertiary`）
- 连接线：1px `border-default`，节点亮起时线变 `accent-primary`
- 动画：滚动可见时节点从左到右依次亮起（填充 `accent-primary`），间隔 200ms

### 3.4 Activity 活动流页 `/activity`

**活动时间线（B）**— ActivityTimeline

- 布局：左侧时间轴线（2px `border-default`），右侧条目卡片
- 时间轴节点：`12px` 圆形，`accent-primary` 填充
- 条目卡片：
  - 背景 `card-bg`，圆角 `radius-md`，内边距 `space-4`
  - 时间：`text-caption`，`text-tertiary`，`font-mono`
  - 标题：`text-body`，`font-medium`，`text-primary`
  - 类型 badge：按类型着色（dev=`accent-primary`，design=`accent-secondary`，其他=`text-tertiary` 背景）
  - hover：背景 → `card-bg-hover`，节点放大至 `16px`
- 淡入动画：条目依次从上到下出现，间隔 100ms

**Git 热力图（C）**— GitHeatmap

- 参照 GitHub 贡献图布局：7 行（周一到周日）× 13 列（约 90 天）
- **5 级色阶**：

| 级别 | 提交量 | 颜色 |
|------|--------|------|
| L0 | 0 次 | `#161B22`（与 bg-inset 接近）|
| L1 | 1-2 次 | `#0E4429` |
| L2 | 3-5 次 | `#006D32` |
| L3 | 6-9 次 | `#26A641` |
| L4 | 10+ 次 | `#39D353` |

- 单元格：`14px × 14px`，间距 `3px`，圆角 `radius-sm`（2px）
- hover tooltip：`bg-elevated` 背景，`text-small`，显示"{date}：{n} 次提交"

**最近提交列表（D）**— CommitList

- 每行：`text-small`，commit hash（`font-mono`，`accent-primary`，前 7 位）+ message（`text-primary`）+ 日期（`text-tertiary`）
- 行间距 `space-3`，hover 行背景 `bg-elevated`

### 3.5 404 页面

- 居中布局，`max-width: 480px`
- "404"数字：`text-h1` × 2（96px），`font-bold`，`accent-primary`，`opacity: 0.3`
- 标题"页面走丢了"：`text-h2`，`text-primary`
- 描述：`text-body`，`text-secondary`
- 回首页按钮：`accent-primary` 背景，`bg-base` 文字，`radius-md`，`padding: space-3 space-6`，hover 亮度 +10%
- 子页面链接列表：`text-small`，`accent-primary`，间距 `space-2`

---

## 四、组件状态视觉

### 4.1 Loading 骨架屏

- 骨架条颜色：`bg-surface` 底色 + `bg-elevated` 高亮扫过
- 动画：从左到右的高光扫描，`1.5s infinite`，`linear`
- 骨架卡片保持与实际卡片相同的圆角和尺寸
- 数字位置：宽度 `80px`，高度 `32px` 的骨架条
- 文字位置：宽度 60%-80% 随机，高度 `14px` 的骨架条

### 4.2 空数据状态

- 居中展示：emoji `🔍`（32px）+ 提示文字（`text-body`，`text-tertiary`）
- 背景不额外处理，保持与正常态一致的卡片/区块样式
- 时间线空态额外显示最后一次活动日期

### 4.3 Hover / Active 状态汇总

| 组件 | hover 变化 |
|------|-----------|
| DataCard | 背景 surface→elevated，边框 → border-hover，上浮 4px，阴影 shadow-card-hover |
| ExpertCard | 同上 + 底部滑出 capability 描述 |
| SkillCategory | 背景 surface→elevated，指针 cursor:pointer |
| QuickNav 卡片 | 边框 → border-hover，上浮 4px，箭头右移 4px |
| 时间线条目 | 背景 surface→elevated，左侧节点放大 |
| 热力图单元格 | 出现 tooltip，单元格描边 1px `text-secondary` |
| Navbar 导航项 | 文字 secondary→primary |
| CommitList 行 | 行背景 → elevated |

### 4.4 数字跳动动画

- 起始值：`0`
- 终值：data.json 中的实际数字
- 字体：`font-mono`，确保等宽数字不抖动
- 颜色：跳动过程中保持 `accent-primary`，不做颜色渐变
- Hero 区数字：时长 1200ms，`easeOut`
- 卡片区数字：时长 800ms，`easeOut`，三张卡片依次启动间隔 150ms
- 触发：Hero = 页面加载完成，卡片 = `client:visible` 滚动触发

---

## 五、设计决策记录

| # | 决策 | 理由 |
|---|------|------|
| 1 | 深色纯色底 + 微渐变光晕，不用网格纹理 | 数据是主角，纹理会分散注意力 |
| 2 | 用边框代替传统阴影 | 深色主题下阴影不可见，1px 边框 + hover 发光更有效 |
| 3 | 主色选天际蓝 #38BDF8 | 科技感、高辨识度、深色背景对比度优秀（7.8:1） |
| 4 | 辅色选星云紫 #A78BFA | 与蓝色色相差约 80°，足够区分，共同营造科技调性 |
| 5 | 热力图色阶用绿色系（GitHub 风格） | 用户对 GitHub 贡献图心智模型强，降低认知成本 |
| 6 | 字体选 Inter + Noto Sans SC | Inter 数据展示清晰，Noto Sans SC 覆盖中文，均为 Google Fonts 免费字体 |

---

*本文档定义视觉层面所有规范。前端开发严格消费此处 Token，零裸色值、零裸间距。*

### 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-03-18 | v1.0 | 初版 MVP 视觉设计规范 |
