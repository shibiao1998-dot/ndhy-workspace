# 开源组件库定制指南

> 不从零造轮子——基于成熟的开源组件库，用 Design Tokens 覆写样式。

## 推荐技术栈

| 层级 | 工具 | 角色 | 选择理由 |
|------|------|------|---------|
| CSS 框架 | **Tailwind CSS** | 原子化样式 | 与 Token 系统天然契合，JIT 编译，零运行时 |
| 无头组件 | **Radix UI** | 行为+可访问性 | 零样式侵入、ARIA 完备、键盘导航内置 |
| 预制组件 | **Shadcn UI** | 可定制模板 | 基于 Radix + Tailwind，源码复制到项目，完全可控 |
| 图标库 | **Lucide Icons** | 图标系统 | Shadcn 默认图标库，一致性好 |
| 类名工具 | **clsx + tailwind-merge** | 类名合并 | 处理条件类名和冲突覆盖 |

## Shadcn UI 定制流程

### 第 1 步：初始化

```bash
npx shadcn@latest init
```

配置选项：
- Style: **Default**（非 New York）
- Base color: 按项目品牌选择
- CSS variables: **Yes**
- Tailwind config: 指向自定义 `tailwind.config.ts`
- Components alias: `@/components/ui`

### 第 2 步：覆写 CSS 变量

Shadcn UI 使用 HSL 格式的 CSS 变量。将 Token 映射到 Shadcn 的变量命名体系：

```css
/* globals.css — 覆盖 Shadcn 默认变量 */
@layer base {
  :root {
    /* 映射：Shadcn 变量 ← 项目 Token */
    --background: 0 0% 100%;           /* --color-bg-primary */
    --foreground: 222.2 84% 4.9%;      /* --color-fg-primary */
    --primary: 221.2 83.2% 53.3%;      /* --color-primary */
    --primary-foreground: 210 40% 98%; /* --color-fg-inverse */
    --secondary: 210 40% 96.1%;        /* --color-bg-secondary */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;      /* --color-error */
    --border: 214.3 31.8% 91.4%;       /* --color-border-primary */
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;         /* --color-border-focus */
    --radius: 0.375rem;                /* --radius-md */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... 暗黑模式值 */
  }
}
```

### 第 3 步：按需添加组件

```bash
# 按需安装，不要一次性全部安装
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
```

### 第 4 步：逐一定制组件

以 Button 为例，修改 `components/ui/button.tsx`：

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",    /* 对应 --spacing-2 高度 */
        default: "h-9 px-4 text-sm", /* 对应 --spacing-3 高度 */
        lg: "h-11 px-6 text-base",   /* 对应 --spacing-4 高度 */
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 第 5 步：验证

- [ ] 所有组件在 light 模式下视觉正确
- [ ] 所有组件在 dark 模式下视觉正确
- [ ] 键盘导航正常（Tab / Enter / Escape）
- [ ] 焦点环可见且使用 `--ring` 颜色
- [ ] 禁用状态正确（降低透明度 + 不可点击）

---

## 常见定制场景

| 场景 | 操作 |
|------|------|
| 修改全局圆角 | 改 `:root { --radius: ... }` |
| 修改品牌色 | 改 `--primary` 的 HSL 值 |
| 添加新变体 | 在 `buttonVariants.variants` 中新增 |
| 修改默认尺寸 | 改 `defaultVariants.size` |
| 添加动画 | 在组件类名中加 `transition-*` |
| 修改字体 | 在 `tailwind.config.ts` 的 `fontFamily` 中配置 |

---

## 不推荐做的事

| ❌ 不要 | ✅ 应该 |
|---------|--------|
| 修改 Radix UI 源码 | 用 CSS 覆写样式 |
| 一次安装所有组件 | 按需添加，用到才装 |
| 在组件中硬编码颜色值 | 使用 Tailwind class / CSS 变量 |
| 覆盖 Radix 的 ARIA 属性 | 保留无障碍属性不动 |
| 用 `!important` 强制覆盖 | 通过 CSS 变量或 `tailwind-merge` 解决优先级 |
