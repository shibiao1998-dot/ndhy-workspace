# 组件库规划方法论

> 用 Atomic Design 思维拆分组件——从原子到页面，逐层搭积木。

## 四层组件模型

### Layer 1：原子组件（Atoms）

最小不可再拆的 UI 元素，直接消费 Design Tokens。

| 组件 | 变体 | 状态 | 说明 |
|------|------|------|------|
| **Button** | primary / secondary / ghost / destructive / outline / link × sm / md / lg | default / hover / active / disabled / loading / focus | 最高频组件，状态必须全覆盖 |
| **Input** | text / password / number / search × sm / md / lg | default / hover / focus / disabled / error / readonly | 含 placeholder 样式 |
| **Textarea** | default × sm / md / lg | 同 Input | 自动增高可选 |
| **Select** | single / multi × sm / md / lg | default / hover / focus / disabled / error / open | 含下拉面板 |
| **Checkbox** | default / indeterminate × sm / md | default / hover / checked / disabled / error | 含 label 关联 |
| **Radio** | default × sm / md | default / hover / checked / disabled | 含 label 关联 |
| **Switch** | default × sm / md | default / hover / checked / disabled | 开关切换 |
| **Badge** | default / success / warning / error / info × sm / md | default | 状态标记 |
| **Tag** | default / closable × sm / md | default / hover | 标签/标记 |
| **Avatar** | image / text / icon × xs / sm / md / lg / xl | default / fallback | 含 fallback 机制 |
| **Icon** | - × sm / md / lg | default | 使用 Lucide Icons 推荐 |
| **Spinner** | - × sm / md / lg | default | 加载指示器 |
| **Divider** | horizontal / vertical | default | 分割线 |
| **Skeleton** | text / circle / rectangle | default | 骨架屏占位 |

### Layer 2：分子组件（Molecules）

由多个原子组合而成，具有独立功能。

| 组件 | 组成 | 说明 |
|------|------|------|
| **FormField** | Label + Input/Select + HelperText + ErrorMessage | 表单单项，含验证反馈 |
| **SearchBox** | Input(search) + Icon + Button(clear) | 搜索输入框 |
| **NavItem** | Icon + Text + Badge | 导航菜单项 |
| **CardHeader** | Title + Description + Action | 卡片头部 |
| **ListItem** | Avatar + Text + Badge + Action | 列表单行 |
| **Breadcrumb** | Link + Separator + CurrentPage | 面包屑导航 |
| **Pagination** | Button(prev/next) + PageNumbers | 分页器 |
| **Tabs** | TabTrigger[] + TabContent | 标签切换 |
| **Tooltip** | Trigger + Content(popover) | 工具提示 |
| **DropdownMenu** | Trigger + MenuItems | 下拉菜单 |
| **AlertBanner** | Icon + Message + Action + Close | 提示横幅 |

### Layer 3：组织组件（Organisms）

由分子和原子组合成的复杂功能区块。

| 组件 | 组成 | 说明 |
|------|------|------|
| **Navbar** | Logo + NavItem[] + SearchBox + Avatar | 顶部导航栏 |
| **Sidebar** | Logo + NavItem[] + Divider + Footer | 侧边导航栏 |
| **Form** | FormField[] + Button(submit/cancel) | 完整表单 |
| **DataTable** | TableHeader + TableRow[] + Pagination + EmptyState | 数据表格 |
| **Card** | CardHeader + CardBody + CardFooter | 完整卡片 |
| **Dialog** | Overlay + DialogHeader + DialogBody + DialogFooter | 模态弹窗 |
| **Sheet** | Overlay + SheetHeader + SheetBody | 侧边抽屉 |
| **Toast** | Icon + Message + Action + CloseButton | 全局通知 |
| **CommandPalette** | SearchInput + CommandList + CommandItem[] | 命令面板 |

### Layer 4：页面模板（Templates）

由组织组件构成的完整页面骨架。

| 模板 | 典型结构 | 适用场景 |
|------|---------|---------|
| **Dashboard** | Sidebar + Navbar + StatCards + Charts + DataTable | 数据概览页 |
| **ListPage** | Navbar + FilterBar + DataTable + Pagination | 列表管理页 |
| **DetailPage** | Navbar + Breadcrumb + ContentArea + ActionBar | 详情查看页 |
| **FormPage** | Navbar + Breadcrumb + Form + ActionBar | 创建/编辑页 |
| **AuthPage** | CenteredCard(Logo + Form + Links) | 登录/注册页 |
| **SettingsPage** | Sidebar + Tabs + Form | 设置页 |
| **ErrorPage** | CenteredContent(Icon + Message + Action) | 404/500 错误页 |

---

## 组件定义模板

每个组件规划时使用以下模板：

```markdown
### 组件名：Button

**用途**：触发操作的可交互元素

**变体**：
| 维度 | 选项 |
|------|------|
| 样式 | primary / secondary / ghost / destructive / outline / link |
| 尺寸 | sm (32px) / md (36px) / lg (44px) |
| 图标 | 无图标 / 左图标 / 右图标 / 纯图标 |

**状态**：default / hover / active / disabled / loading / focus

**消费的 Tokens**：
- 背景色：--color-primary, --color-primary-hover, --color-primary-active
- 文字色：--color-fg-inverse
- 圆角：--radius-md
- 间距：--spacing-2 (padding-y), --spacing-4 (padding-x)
- 字号：--font-size-sm
- 阴影：--shadow-sm (hover)
- 过渡：--transition-fast

**可访问性**：
- 必须有 `aria-label`（纯图标按钮）
- focus-visible 显示焦点环
- disabled 状态用 `aria-disabled` + `pointer-events: none`
- loading 状态用 `aria-busy="true"` + spinner 替换文字
```

---

## 组件优先级排序

按使用频率和项目需求排序，分三批实现：

| 批次 | 组件 | 说明 |
|------|------|------|
| **P0 核心** | Button, Input, Select, Form, Card, Dialog, DataTable, Navbar, Toast | MVP 必须 |
| **P1 重要** | Sidebar, Tabs, Pagination, Badge, Tag, Avatar, SearchBox, Sheet | 标准产品需要 |
| **P2 增强** | CommandPalette, Skeleton, Breadcrumb, AlertBanner, Switch, Radio | 体验提升 |
