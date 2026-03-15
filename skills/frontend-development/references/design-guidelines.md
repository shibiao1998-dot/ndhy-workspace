# 前端设计指南（合并自 frontend skill）

> 本文件合并了原 `frontend` Skill 的设计层规范，包含视觉风格、排版、配色、动效、移动端适配等。

---

## 核心设计规则

### Mobile-First Always
- 从移动端布局开始，逐步增强
- 每个 grid 必须能折叠为单列
- 触摸目标最小 44x44px
- 在真实设备上测试

### Typography Matters
- 避免泛用字体（Inter, Roboto, Arial）
- 使用大幅跳跃的字号（2x+），而非胆怯的递增
- 正文最小 16-18px
- 详见下方排版章节

### Color with Purpose
- 70-20-10 法则：主色、次色、强调色
- 坚定选择 light 或 dark —— 不要灰蒙蒙的中间地带
- 永远不用纯白背景 —— 加深度
- 详见下方配色章节

### Feedback on Every Interaction
- 100ms 内确认点击
- 乐观更新带来即时感
- 超过 1s 的操作显示 loading 状态
- 错误时保留用户输入

### Accessibility Non-Negotiable
- 文本对比度 4.5:1，UI 对比度 3:1
- 所有交互元素有 focus 状态
- 语义化 HTML（nav, main, section, article）
- 键盘导航全覆盖

### Performance from Start
- 折叠线以下内容懒加载
- 图片占位符防止布局偏移
- 代码分割重型组件
- 目标 LCP <2.5s, CLS <0.1

### One Memorable Element
- 每个页面需要一个令人难忘的设计选择
- 排版处理、hero 动画、不寻常的布局
- 胆怯的设计注定平庸 —— 坚定你的美学

---

## 常见陷阱

| 陷阱 | 后果 | 修复 |
|------|------|------|
| 泛用字体 | 看起来和其他站一样 | 使用有特色的字体 |
| 纯白背景 | 扁平、无生气 | 加渐变、噪点、深度 |
| 移动端后补 | 60% 用户体验崩坏 | 始终移动端优先 |
| 表单错误清空输入 | 用户暴怒 | 保留输入，高亮错误 |
| 无 loading 状态 | 用户以为坏了 | 立即显示进度 |
| 胆怯的字号层级 | 无视觉层次 | 标题用 2x+ 跳跃 |

---

## 技术栈推荐

| 层级 | 选择 | 原因 |
|------|------|------|
| 框架 | Next.js 14+ | RSC, 文件路由, Vercel 部署 |
| 语言 | TypeScript | 提前捕获错误, 更好的 DX |
| 样式 | Tailwind CSS | 工具优先, 内置设计 token |
| 组件 | shadcn/ui | 可访问, 可定制, 非依赖 |
| 动画 | Framer Motion | 声明式, 高性能 |
| 表单 | React Hook Form + Zod | 类型安全的校验 |
| 状态 | Zustand 或 Jotai | 简单, 无样板 |

### 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── [feature]/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── [feature]/
├── lib/
│   ├── utils.ts         # cn(), formatters
│   └── api.ts
├── hooks/
├── styles/
│   └── globals.css
└── config/
    └── site.ts
```

### 工具函数

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### shadcn/ui 初始化

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog
```

常用组件: Button, Card, Dialog, Accordion, Tabs, Sheet, NavigationMenu.

---

## 排版（Typography）

### 字体选择

**避免**: Inter, Roboto, Arial, Open Sans —— 过度使用，毫无特色

**推荐**:

| 用途 | 推荐字体 |
|------|---------|
| 展示/标题 | Clash Display, Cabinet Grotesk, Satoshi, Playfair Display |
| 正文 | Plus Jakarta Sans, Instrument Sans, General Sans |
| 等宽 | JetBrains Mono, IBM Plex Mono, Fira Code |

### 字号层级

使用大幅跳跃，而非胆怯的递增：

```css
fontSize: {
  'base': '1rem',       /* 16px */
  '2xl': '1.5rem',      /* 24px */
  '4xl': '2.5rem',      /* 40px */
  '5xl': '3.5rem',      /* 56px — hero */
  '6xl': '4.5rem',      /* 72px — statement */
}
```

### 层级规则

1. 每页只有一个 hero 大小 —— 不要争夺注意力
2. 正文最小 16-18px —— 可读性
3. 正文行高 1.5-1.7 —— 标题紧凑 (1.1-1.2)
4. 最大宽度 65-75 字符 —— 最佳阅读长度

### 配对策略

- 对比字重：细展示 + 粗正文
- 对比风格：衬线标题 + 几何无衬线正文
- 不超过 2 个字体家族

---

## 配色（Color & Theme）

### CSS 变量

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84% 60%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 配色规则

1. **70-20-10**: 主色 70%, 次色 20%, 强调色 10%
2. **坚定选择 light 或 dark** —— 不要灰蒙蒙的中间地带
3. **高对比 CTA** —— 按钮必须醒目
4. **语义色**: 红=危险, 绿=成功, 黄=警告

### 背景

**避免**: 纯白 (#fff) 或纯灰

**使用**:
- 微妙渐变: `bg-gradient-to-br from-slate-50 to-slate-100`
- 噪点/颗粒纹理叠加
- 毛玻璃 + backdrop-blur

```css
/* Grain overlay */
.grain::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
}
```

### 暗色主题

始终定义两套主题。使用 CSS 变量让切换自动化。

---

## 动画（Animation）

### 优先级

一个编排好的页面加载 > 分散的微交互。

### 高影响力时刻

1. **交错 hero 揭示** —— 内容依次淡入
2. **滚动触发区域** —— 元素在滚动时进入
3. **悬停惊喜** —— 缩放、阴影、色彩变化
4. **页面过渡** —— 平滑的路由切换

### Framer Motion 示例

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i} variants={item} />)}
</motion.div>
```

### 时间指南

| 类型 | 时长 |
|------|------|
| 交互（悬停、点击） | 150-300ms |
| 过渡（页面、弹窗） | 300-500ms |
| 复杂序列 | 总计 500-800ms |

### 无障碍

始终尊重 `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 移动端适配（Mobile-First Patterns）

### 断点

```css
/* Mobile first — 向上增强 */
@media (min-width: 640px) { /* sm: 平板 */ }
@media (min-width: 768px) { /* md: 横向平板 */ }
@media (min-width: 1024px) { /* lg: 笔记本 */ }
@media (min-width: 1280px) { /* xl: 桌面 */ }
```

### 布局变换

| 模式 | 桌面 | 移动端 |
|------|------|--------|
| Hero + 图片 | 两列 grid | 堆叠，图片在下 |
| 功能 grid | 3-4 列 | 单列 |
| 侧边栏 + 内容 | 并排 | Sheet/drawer |
| 数据表格 | 完整表格 | 卡片视图 |
| 多列表单 | 并排 | 垂直堆叠 |

### 触摸目标

- 所有交互元素最小 **44x44px**
- 目标间最小 **8px** 间距
- 滑动操作需要视觉提示

### 字体缩放

```css
@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .section-title { font-size: 24px; }
}
```

### 常见修复

| 问题 | 修复 |
|------|------|
| Hero grid 断裂 | 移动端用 flex 替代 grid |
| 水平滚动 | body 设置 `overflow-x: hidden` |
| 触摸目标太小 | 增加 padding 而非视觉尺寸 |
| 文字溢出 | 使用 `break-words` 和流式排版 |

---

## 设计示例

### 着陆页

- **调性**: 编辑/杂志风
- **字体**: Cabinet Grotesk（展示）+ Plus Jakarta Sans（正文）
- **配色**: 近黑背景(#0c0c0c)，暖白文字，铜色强调
- **亮点**: 全出血 hero + 滚动揭示文字

### 仪表盘

- **调性**: 实用/干净
- **布局**: 240px 固定侧边栏，流式主区域
- **组件**: shadcn/ui 卡片，recharts 图表
- **数据表**: tanstack-table + 排序/筛选

### 结账表单

- **步骤进度条**在顶部
- React Hook Form + Zod 校验
- 导航时保留所有输入
- 提交时乐观反馈

### 实现前检查清单

- [ ] 排版有特色（不是 Inter/Roboto）
- [ ] 配色遵循 70-20-10
- [ ] 背景有深度
- [ ] 一个令人难忘的元素
- [ ] 移动端优先响应式
- [ ] Focus 状态可见
- [ ] 异步操作有 loading 状态
- [ ] 错误恢复路径
