# 5步标准流程详解

## Step 1：确认输入

**目标**：收集编写原型所需的全部设计产出物。

**必须确认的输入**：

| 输入 | 来源 | 说明 |
|------|------|------|
| Design Tokens | `ui-design-system` | CSS 变量文件（`tokens.css`） |
| 页面布局方案 | `page-layout-design` | 区块划分、栅格方案、响应式策略 |
| 组件清单 | `ui-design-system` | 本页面用到的组件及其变体/状态 |
| 页面目标 | 产品定义 | 这个页面要做什么 |
| 内容数据 | 产品/设计 | 假数据结构（字段名、示例值） |

**输入缺失处理**：

| 情况 | 处理方式 |
|------|---------|
| 没有 Tokens 文件 | 使用 Tailwind 默认 Token 值，标注"待替换" |
| 没有布局方案 | 根据页面类型选择标准布局模式 |
| 没有组件规范 | 使用 Shadcn UI 默认组件样式 |
| 没有假数据 | 使用合理的示例数据 |

---

## Step 2：选择技术方案

### 方案 A：单文件 HTML（L1/L2 级）

```
优点：零依赖、浏览器直接打开、分享方便
缺点：组件无法复用、大量重复代码
适用：快速原型、验证布局、简单页面
```

**文件结构**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面名称 — 原型</title>
  <style>
    /* Design Tokens */
    :root { /* ... tokens ... */ }
    /* 页面样式 */
    /* ... */
  </style>
</head>
<body>
  <!-- 页面内容 -->
  <script>
    // 简单交互（状态切换等）
  </script>
</body>
</html>
```

### 方案 B：React + Tailwind CSS（L3 级）

```
优点：组件化、接近生产结构、可复用
缺点：需要开发环境、启动成本高
适用：高保真原型、多页面原型、接近交付
```

**文件结构**：
```
prototype/
├── src/
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── styles/
│   │   └── tokens.css  # Design Tokens
│   └── App.tsx
├── package.json
├── tailwind.config.ts
└── index.html
```

### 方案选择决策

| 条件 | 选择 |
|------|------|
| 单个页面 + 快速验证 | 单文件 HTML |
| 单个页面 + 需要全状态交互 | 单文件 HTML + JS 状态切换 |
| 多个页面 + 组件复用 | React + Tailwind |
| 接近生产级参考 | React + Tailwind + Shadcn UI |

---

## Step 3：编写原型

### 编写顺序

```
1. HTML 结构骨架（语义化标签 + 区块划分）
2. 引入 Design Tokens（CSS 变量）
3. 布局 CSS（栅格 + 间距 + 响应式）
4. 组件样式（按钮/输入/卡片等）
5. 填入假数据
6. 添加全状态变体（loading/empty/error）
7. 添加交互（hover/focus + 简单 JS）
8. 响应式适配（media queries）
```

### 假数据规范

```javascript
// 使用真实感的假数据，不用 "test", "xxx", "123"
const mockData = {
  user: { name: "张老师", role: "科学教师", avatar: "..." },
  stats: { students: 156, classes: 4, avgScore: 87.5 },
  items: [
    { id: 1, title: "力学基础实验", status: "进行中", date: "2024-03-15" },
    { id: 2, title: "光学折射实验", status: "已完成", date: "2024-03-10" },
    // 至少 3-5 条，体现列表效果
  ]
};
```

### 状态切换实现（单文件 HTML）

```html
<!-- 用 data 属性控制状态 -->
<div id="content-area" data-state="default">
  <!-- default 状态内容 -->
  <div class="state-default">...</div>
  <!-- loading 状态内容 -->
  <div class="state-loading" hidden>...</div>
  <!-- empty 状态内容 -->
  <div class="state-empty" hidden>...</div>
  <!-- error 状态内容 -->
  <div class="state-error" hidden>...</div>
</div>

<!-- 状态切换控制器（原型专用，生产代码不需要） -->
<div class="prototype-controls">
  <button onclick="switchState('default')">Default</button>
  <button onclick="switchState('loading')">Loading</button>
  <button onclick="switchState('empty')">Empty</button>
  <button onclick="switchState('error')">Error</button>
</div>

<script>
function switchState(state) {
  const area = document.getElementById('content-area');
  area.querySelectorAll('[class^="state-"]').forEach(el => el.hidden = true);
  area.querySelector('.state-' + state).hidden = false;
  area.dataset.state = state;
}
</script>
```

---

## Step 4：质量自检

> 📖 详见 [checklist.md](checklist.md)

**自检动作**：
1. 浏览器打开原型文件
2. 检查 Desktop（1440px）视觉效果
3. 切换到 Mobile（375px）检查响应式
4. 切换全部状态（loading/empty/error）
5. 键盘 Tab 遍历焦点顺序
6. 运行对比度检查工具

---

## Step 5：评审交付

> 📖 详见 [review-process.md](review-process.md)

**交付物清单**：

| 交付物 | 格式 | 说明 |
|--------|------|------|
| 原型文件 | `.html` 或 React 项目 | 可直接浏览器打开/运行 |
| 状态说明 | Markdown | 列出支持的全部状态和切换方式 |
| 已知限制 | Markdown | 标注原型简化了什么（与生产代码的差异） |
| 反馈记录 | Markdown | 评审后的修改点记录 |

---

## 深度分级详细说明

### L1 快速原型
- **技术**：单文件 HTML
- **范围**：核心布局 + default 状态 + 1-2 个关键状态
- **响应式**：Desktop + Mobile 两个断点
- **交互**：纯 CSS（hover/focus）
- **耗时**：1 个页面约 30 分钟

### L2 标准原型
- **技术**：单文件 HTML + JS 状态切换
- **范围**：完整布局 + 全状态覆盖 + 响应式 + 可访问性
- **响应式**：4 个断点（Mobile/Tablet/Desktop/大屏）
- **交互**：CSS 伪类 + JS 状态切换控制器
- **耗时**：1 个页面约 1-2 小时

### L3 高保真原型
- **技术**：React + Tailwind CSS + Shadcn UI
- **范围**：组件化 + 全状态 + 路由 + 交互逻辑 + 动画
- **响应式**：全断点 + 极限测试
- **交互**：接近真实的交互体验
- **耗时**：1 个页面约 3-5 小时
