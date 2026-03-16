# 6步标准流程详解

## Step 1：理解产品上下文

**目标**：收集建立设计系统所需的全部输入信息。

**必须确认的信息**：

| 维度 | 需要了解 | 示例 |
|------|---------|------|
| 品牌调性 | 品牌关键词、情绪板、视觉风格 | 专业、温暖、科技感 |
| 用户群体 | 年龄段、设备偏好、数字素养 | 教师群体、主要使用桌面端 |
| 技术栈 | 前端框架、CSS 方案、构建工具 | React + Tailwind CSS + Next.js |
| 现有资产 | 已有设计规范、品牌手册、旧系统 | 已有 Logo 和品牌色 |
| 设计约束 | 时间、范围、必须兼容的内容 | 需兼容暗黑模式 |

**输出**：产品上下文摘要（1 页 Markdown）

---

## Step 2：定义 Design Tokens

**目标**：建立完整的视觉变量体系。

> 📖 Token 详细定义规范见 [design-tokens.md](design-tokens.md)

**Token 类别清单**：

| 类别 | 数量建议 | 说明 |
|------|---------|------|
| 颜色-基础色板 | 5-8 色系，每系 9-11 级 | 从 50 到 950 的色阶 |
| 颜色-语义色 | 15-25 个 | primary/secondary/success/warning/error/info + 背景/前景/边框 |
| 字号 | 7-9 级 | xs/sm/base/lg/xl/2xl/3xl/4xl |
| 字重 | 3-4 级 | normal(400)/medium(500)/semibold(600)/bold(700) |
| 行高 | 3-4 级 | tight(1.25)/normal(1.5)/relaxed(1.75) |
| 间距 | 8-12 级 | 基于 4px/8px 倍数：4/8/12/16/20/24/32/40/48/64/80/96 |
| 圆角 | 5-6 级 | none/sm/md/lg/xl/full |
| 阴影 | 4-5 级 | none/sm/md/lg/xl |
| 断点 | 4-5 个 | sm(640)/md(768)/lg(1024)/xl(1280)/2xl(1536) |
| 过渡 | 3-4 种 | fast(150ms)/normal(200ms)/slow(300ms) |
| z-index | 5-6 层 | base(0)/dropdown(100)/sticky(200)/modal(300)/popover(400)/toast(500) |

**执行要点**：
- 每个 Token 必须有**语义名称**和**实际值**
- 语义色必须同时定义 light/dark 两套值（即使暂不实现暗黑模式，也预留结构）
- 间距使用 4px 基准的倍数，不出现 5px、13px 这类非标值

---

## Step 3：规划组件体系

**目标**：建立从原子到页面的完整组件层级。

> 📖 组件规划详细方法论见 [component-library.md](component-library.md)

**四层组件模型**：

```
Layer 1: 原子组件（Atoms）     → 按钮、输入框、标签、图标、头像
Layer 2: 分子组件（Molecules） → 搜索框、表单项、卡片、导航项
Layer 3: 组织组件（Organisms） → 导航栏、表单、列表、数据表、侧边栏
Layer 4: 页面模板（Templates） → Dashboard、列表页、详情页、表单页
```

**每个组件必须定义**：
1. 组件名称与用途
2. 变体（Variants）：尺寸（sm/md/lg）、样式（primary/secondary/ghost）
3. 状态覆盖：default / hover / active / disabled / focus / error / loading
4. Props 接口（伪代码级别）
5. 使用的 Design Tokens 清单
6. 可访问性要求

---

## Step 4：输出 Token 文件

**目标**：将 Token 定义转化为可直接使用的代码文件。

> 📖 格式规范详见 [token-format.md](token-format.md)

**必须输出的格式**：
1. **CSS Custom Properties**（`.css` 文件）— 最终消费格式
2. **JSON Token**（`.json` 文件）— 单一数据源
3. **Tailwind 配置**（`tailwind.config.ts` 片段）— 框架集成

**验证标准**：输出的文件能直接 `import` 或 `<link>` 使用，不是伪代码。

---

## Step 5：定制开源组件库

**目标**：基于开源组件库应用自定义 Tokens。

> 📖 定制指南详见 [open-source-customization.md](open-source-customization.md)

**推荐技术栈**：

| 层级 | 推荐方案 | 说明 |
|------|---------|------|
| 样式方案 | Tailwind CSS | 原子化 CSS，与 Token 系统天然契合 |
| 无头组件 | Radix UI | 零样式、高可访问性、行为完备 |
| 预制组件 | Shadcn UI | 基于 Radix + Tailwind，可复制到项目中定制 |

**定制步骤**：
1. 安装 Shadcn UI CLI，初始化项目
2. 用自定义 Tokens 覆盖 Shadcn 的 CSS 变量
3. 按需添加组件，逐一调整样式
4. 验证所有组件在 light/dark 模式下表现正常

---

## Step 6：质量检查与交付

**目标**：确认设计系统的完整性和可用性。

> 📖 完整检查清单见 [checklist.md](checklist.md)

**交付物清单**：

| 交付物 | 格式 | 说明 |
|--------|------|------|
| 设计系统概览文档 | Markdown | Token 体系 + 组件清单 + 使用指南 |
| CSS Token 文件 | `.css` | CSS Custom Properties 定义 |
| JSON Token 文件 | `.json` | 单一数据源 |
| Tailwind 配置 | `.ts` | `tailwind.config.ts` 扩展片段 |
| 组件规划清单 | Markdown | 四层组件 + 每个组件的变体/状态定义 |
| 质量检查报告 | Markdown | 逐项检查结果 |

---

## 深度分级详细说明

### L1 快速建立
- **适用**：MVP、小功能、时间紧
- **范围**：Step 2（基础 Tokens） + Step 4（输出文件）
- **组件**：直接使用 Shadcn UI 默认组件，仅覆写颜色
- **输出**：CSS Token 文件 + 简要使用说明

### L2 标准建立
- **适用**：新产品、重要改版
- **范围**：完整 Step 1-6
- **组件**：完整规划四层组件体系，定制 Shadcn 组件
- **输出**：全套交付物

### L3 深度建立
- **适用**：多产品线共享设计系统、设计系统平台化
- **范围**：Step 1-6 + 多主题 + 版本管理 + 组件文档
- **额外输出**：
  - 多主题切换方案（light/dark/高对比度）
  - 版本管理规范（语义化版本 + 变更日志模板）
  - 组件使用文档（含 Do/Don't 示例）
  - 演进路线图
