# 可访问性布局

> 可访问性不是附加功能——它是基本设计质量的一部分。

## 三大可访问性支柱

| 支柱 | 核心要求 | 影响用户 |
|------|---------|---------|
| **可感知** | 内容对所有感官可用 | 视力障碍、色盲 |
| **可操作** | 所有功能可通过键盘完成 | 运动障碍、辅助设备用户 |
| **可理解** | 界面行为可预测、文案清晰 | 认知障碍、非母语用户 |

---

## 1. 对比度检查

### WCAG 2.1 标准

| 级别 | 普通文本（<18px） | 大文本（≥18px/≥14px bold） |
|------|------------------|--------------------------|
| **AA（必须达到）** | ≥ 4.5:1 | ≥ 3:1 |
| AAA（推荐） | ≥ 7:1 | ≥ 4.5:1 |

### 常见问题与修复

| 问题 | 对比度 | 修复方案 |
|------|--------|---------|
| 灰色文字在白色背景 | `#9ca3af` on `#fff` = 2.8:1 ❌ | 改用 `#6b7280`（4.6:1 ✅） |
| 浅色按钮文字 | `#fff` on `#60a5fa` = 2.4:1 ❌ | 改用深色底 `#2563eb`（4.6:1 ✅） |
| Placeholder 文字 | `#d1d5db` on `#fff` = 1.6:1 ❌ | 改用 `#9ca3af`（2.8:1）—— AA 豁免 |
| 禁用状态 | 可降低至 3:1 | WCAG 对禁用元素无强制要求 |

### 检查工具

```
在线：https://webaim.org/resources/contrastchecker/
Chrome：Lighthouse Accessibility 审计
VS Code：Color Highlight 插件
```

---

## 2. 焦点顺序

### 焦点顺序原则

| 规则 | 说明 |
|------|------|
| **视觉顺序 = Tab 顺序** | 焦点移动方向与视觉阅读方向一致（上→下，左→右） |
| **不跳过内容** | 焦点不会跳过可见的交互元素 |
| **不困住焦点** | 用户可以用 Tab/Escape 离开任何区域（弹窗除外） |
| **弹窗焦点陷阱** | 打开弹窗时焦点锁定在弹窗内，关闭后返回触发元素 |

### 常见焦点顺序

```
Header 导航
  ↓
面包屑
  ↓
页面标题区操作按钮
  ↓
筛选/搜索区
  ↓
主内容区（表格/列表/表单）
  ↓
分页器
  ↓
Footer
```

### CSS 焦点样式

```css
/* 焦点环样式 — 所有交互元素 */
*:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* 不要移除 outline！ */
/* ❌ *:focus { outline: none; } */
```

---

## 3. 语义化 HTML

### 标签选择指南

| 内容 | 正确标签 | 错误做法 |
|------|---------|---------|
| 页面标题 | `<h1>` | `<div class="title">` |
| 导航 | `<nav>` | `<div class="nav">` |
| 主内容 | `<main>` | `<div class="content">` |
| 侧边栏 | `<aside>` | `<div class="sidebar">` |
| 页脚 | `<footer>` | `<div class="footer">` |
| 列表 | `<ul>/<ol>` | `<div>` 嵌套 `<div>` |
| 按钮 | `<button>` | `<div onclick="">` |
| 链接 | `<a href="">` | `<span onclick="">` |
| 表格 | `<table>/<th>/<td>` | `<div>` 模拟表格 |

### 页面 Landmark 结构

```html
<body>
  <header>          <!-- 全局头部 -->
    <nav>           <!-- 主导航 -->
  </header>
  <aside>           <!-- 侧边栏（可选） -->
  </aside>
  <main>            <!-- 主内容区（每页仅一个） -->
    <section>       <!-- 内容板块 -->
      <h2>          <!-- 板块标题 -->
    </section>
  </main>
  <footer>          <!-- 全局页脚 -->
  </footer>
</body>
```

### 标题层级规则

```
✅ 正确：层级不跳跃
h1 → h2 → h3 → h3 → h2 → h3

❌ 错误：跳过层级
h1 → h3（跳过 h2）
h1 → h1（每页只能一个 h1）
```

---

## 4. ARIA 属性速查

| 场景 | ARIA 属性 | 示例 |
|------|----------|------|
| 图标按钮（无文字） | `aria-label` | `<button aria-label="关闭">×</button>` |
| 加载状态 | `aria-busy` | `<div aria-busy="true">Loading...</div>` |
| 展开/折叠 | `aria-expanded` | `<button aria-expanded="false">` |
| 当前页面 | `aria-current` | `<a aria-current="page">首页</a>` |
| 必填字段 | `aria-required` | `<input aria-required="true">` |
| 错误关联 | `aria-describedby` | `<input aria-describedby="error-msg">` |
| 实时区域 | `aria-live` | `<div aria-live="polite">通知内容</div>` |

---

## 可访问性布局自检

| # | 检查项 | 标准 |
|---|--------|------|
| A1 | 文本对比度 | 普通文本 ≥ 4.5:1，大文本 ≥ 3:1（WCAG AA） |
| A2 | 非文本对比度 | 交互元素边界 / 图标 ≥ 3:1 |
| A3 | 焦点可见 | 所有交互元素有 `:focus-visible` 样式 |
| A4 | 焦点顺序 | Tab 顺序与视觉顺序一致 |
| A5 | 键盘可操作 | 所有功能可通过键盘完成 |
| A6 | 语义标签 | 使用正确的 HTML5 语义标签 |
| A7 | 标题层级 | h1-h6 不跳级，每页一个 h1 |
| A8 | 图片替代文本 | 所有图片有 `alt`（装饰图用 `alt=""`） |
| A9 | 触摸目标 | 可点击区域 ≥ 44×44px（移动端） |
| A10 | 不依赖颜色 | 信息传达不仅靠颜色（加图标/文字） |
