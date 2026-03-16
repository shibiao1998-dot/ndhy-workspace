# review-visual-walkthrough.md — UI 组件 Token 一致性走查

> 🎨 视觉设计专家走查 · 2026-03-16
>
> 基准：visual-spec-v4.md | 被查：ui-design-v4.md

---

## 🔴 阻断（必须修复）

### 1. 等级标签存在裸色值
**位置**：§2.3 等级标签色映射
- L0 背景 `oklch(0.80 0.15 85 / 0.10)` — 应引用 `--color-boss` 的透明变体，visual-spec 未定义 `--color-boss-bg` Token
- L3 背景 `oklch(0.62 0 0 / 0.10)` — 应引用 `--color-text-muted` 的透明变体，visual-spec 未定义对应 Token

**修复**：visual-spec 补充 `--color-boss-bg: oklch(0.80 0.15 85 / 0.10)` 和 `--color-level-l3-bg: oklch(0.62 0 0 / 0.10)`，ui-design 引用新 Token。

### 2. Secondary 按钮缺少视觉规范基线
**位置**：§2.1 按钮
- visual-spec §9.1 只定义 Primary + Ghost 两种按钮，ui-design 新增 Secondary 变体（accent 边框 + accent-subtle 背景）
- Secondary 的 5 态未在 visual-spec 注册

**修复**：visual-spec §9.1 补充 Secondary 按钮全态定义，确保双文档同步。

---

## 🟡 建议（推荐修复）

### 3. 多处裸 px/裸数值未 Token 化
| 位置 | 裸值 | 建议 Token |
|------|------|-----------|
| §2.1 按钮 min-height | `48px` | `var(--space-12)` — 后文 §5.3 已用此 Token 表达相同值，应统一 |
| §2.5 Tooltip max-width | `240px` | 建议新增 `--max-w-tooltip: 240px` 或注释标注为设计常量 |
| §2.5 Tooltip 入场 | `translateY(6px)` | 不属于 `--offset-*` 体系（最小为 24px），建议新增 `--offset-micro: 6px` 或标注例外 |
| §3.5 小屏节点 | `min-height: 56px` | 非 4px 网格标准档（最近为 --space-14: 56px），应引用 `var(--space-14)` |
| §2.7 nav-dot active | `scale(1.3)` | 建议定义 `--scale-emphasis: 1.3` 或注释为动效常量 |

### 4. Tooltip 退出时长未引用 Token
**位置**：§2.5 `opacity 1→0, 100ms`
- 100ms 未对应任何 `--dur-*` Token（最近为 `--dur-micro: 120ms`）
- 建议统一为 `var(--dur-micro)` 或新增 `--dur-tooltip-exit: 100ms`

### 5. Focus 态 box-shadow 未使用 shadow Token
**位置**：§2.1 按钮 focus `box-shadow: 0 0 0 4px var(--color-accent-glow)`
- 虽然色值引用了 Token，但 shadow 结构本身是裸定义
- 建议 visual-spec 新增 `--shadow-focus-ring: 0 0 0 4px var(--color-accent-glow)`

---

## 🟢 通过

| 检查项 | 结果 |
|--------|------|
| 所有 `--space-*` 间距引用 | ✅ 映射表、组件定义全部引用 Token，层级铁律清晰 |
| 所有 `--color-*` 语义色引用 | ✅ 文字/边框/背景全部使用语义 Token（除 🔴#1） |
| 所有 `--radius-*` 圆角引用 | ✅ sm/md/lg/full 全覆盖，无裸值 |
| 所有 `--shadow-*` 阴影引用 | ✅ sm/md/glow-sm 正确引用（除 🟡#5） |
| 7 组件 × 5 态全覆盖 | ✅ 每个组件均定义 default/hover/active/focus/disabled |
| 5 态使用正确 Token | ✅ hover 用 `-hover`/`-elevated`，active 用 `-active`/`-strong`，disabled 用 opacity |
| Token 命名一致性 | ✅ 两文档 Token 名称完全一致，无拼写偏差 |
| 动效 Token 引用 | ✅ `--dur-micro/fast/normal/slow` + `--ease-out/spring` 正确使用 |
| 边框宽度/outline-offset 例外 | ✅ 已在 §1.3 明确声明为合法例外 |
| 品类提示 opacity | ✅ content-v4.md 指定值，非视觉裸值 |

---

## 总结

| 级别 | 数量 | 阻断率 |
|------|------|--------|
| 🔴 阻断 | 2 | 需修复后方可交付前端 |
| 🟡 建议 | 3 | 建议本轮修复，不阻断交付 |
| 🟢 通过 | 10/10 主检查项 | Token 体系整体一致 |

**结论**：ui-design-v4.md 整体严格遵循 Token 系统，一致性优秀。2 处阻断均为 visual-spec 缺少对应 Token 导致 ui-design 被迫使用裸值，修复方向明确：**补 Token 定义 → 更新引用**。
