# 设计系统质量检查清单

> 逐项检查，全部 ✅ 才能交付。

## Token 完整性检查

| # | 检查项 | 标准 |
|---|--------|------|
| T1 | 颜色语义命名 | 所有语义色使用 `--color-{用途}` 命名，无 `--color-blue-500` 直接引用 |
| T2 | 颜色层级完整 | 每个色系有 50-950 的完整色阶 |
| T3 | 语义色覆盖 | 包含 primary/success/warning/error/info + bg/fg/border 三类 |
| T4 | 暗黑模式预留 | 语义色有 light/dark 两套值定义（即使暂不实现） |
| T5 | 字号层级 | 定义 7-9 级，从 xs 到 4xl |
| T6 | 间距档位 | 基于 4px 倍数，8-12 级，无非标值（如 5px、13px） |
| T7 | 圆角档位 | 定义 none/sm/md/lg/xl/full |
| T8 | 阴影档位 | 定义 none/sm/md/lg/xl |
| T9 | 断点标准 | 定义 sm/md/lg/xl/2xl 五个断点 |
| T10 | 过渡时长 | 定义 fast/normal/slow |
| T11 | z-index 层级 | 定义 6 层以上，避免 z-index 混乱 |

## Token 质量检查

| # | 检查项 | 标准 |
|---|--------|------|
| Q1 | 单一数据源 | JSON Token 是唯一真实源，CSS/Tailwind 从 JSON 派生 |
| Q2 | 无硬编码 | 组件中不出现 `#hex`、`16px` 等硬编码值 |
| Q3 | 命名一致性 | 所有 Token 遵循 `--{类别}-{语义}-{变体}` 三层结构 |
| Q4 | 值合理性 | 颜色对比度 ≥ 4.5:1（WCAG AA），字号 ≥ 12px |
| Q5 | 文件可用 | CSS 文件可直接 `<link>` 引入，JSON 可直接 `import` |
| Q6 | 版本标记 | 每个文件头部有版本号和日期 |

## 组件规划检查

| # | 检查项 | 标准 |
|---|--------|------|
| C1 | 四层覆盖 | 原子/分子/组织/页面模板四层都有定义 |
| C2 | P0 组件齐全 | Button/Input/Select/Form/Card/Dialog/DataTable/Navbar/Toast 全部规划 |
| C3 | 变体定义 | 每个组件列出 size 和 style 变体 |
| C4 | 状态覆盖 | 每个组件覆盖 default/hover/active/disabled/focus/error 状态 |
| C5 | Token 映射 | 每个组件列出消费的 Token 清单 |
| C6 | 可访问性 | 每个组件有 ARIA 属性要求 |
| C7 | 优先级排序 | 组件按 P0/P1/P2 分批，有实现顺序 |

## 格式输出检查

| # | 检查项 | 标准 |
|---|--------|------|
| F1 | CSS 文件完整 | 所有 Token 都有对应的 CSS Custom Property |
| F2 | JSON 文件完整 | 所有 Token 都有 JSON 定义，含 `$value` 和 `$type` |
| F3 | Tailwind 配置 | 颜色/圆角/阴影在 `tailwind.config.ts` 中正确映射 |
| F4 | 暗黑模式 | 有独立的 dark theme CSS 文件或 override 区块 |
| F5 | 文件组织 | `tokens/` 目录结构清晰，有 README |

## 开源组件库定制检查

| # | 检查项 | 标准 |
|---|--------|------|
| O1 | 变量覆盖 | Shadcn CSS 变量已用项目 Token 值覆盖 |
| O2 | Light/Dark | 所有组件在两个主题下视觉正确 |
| O3 | 键盘导航 | Tab/Enter/Escape 行为正确 |
| O4 | 焦点指示 | focus-visible 焦点环可见 |
| O5 | 禁用状态 | opacity 降低 + pointer-events: none |
| O6 | 无 !important | 不使用 `!important` 覆盖样式 |

---

## 反模式速查

| ❌ 反模式 | 后果 | ✅ 正确做法 |
|----------|------|-----------|
| Token 只是"文档"不能直接用 | 前端要二次翻译，不一致 | 输出可直接 import 的文件 |
| 用具体颜色命名（`--blue-500`） | 换主题时名称语义混乱 | 语义命名（`--color-primary`） |
| 间距用随意数值 | 界面不对齐、不一致 | 固定 4px 倍数档位 |
| 组件只定义 default 状态 | hover/error/loading 缺失 | 全状态覆盖 |
| 先做组件再定 Token | Token 被组件反向绑架 | 先 Token 后组件 |
| 一次性输出全部组件 | 无优先级，不可增量交付 | P0/P1/P2 分批输出 |
| 修改 Radix 源码 | 升级时冲突，可访问性丢失 | 只通过 CSS 变量和类名定制 |
