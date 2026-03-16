# Phase 2 审查报告：Design Token 还原度

> 🎨 视觉设计专家 · 2026-03-16
> 审查基准：visual-spec-v4.md · 审查对象：global.css + dist/index.html + 组件源码

---

## 🔴 阻断（1 项）

### 1. TopologyGraph.tsx 存在 6 个裸色值

SVG 组织拓扑图组件使用硬编码 hex 值而非 CSS Token：

| 常量 | 裸色值 | 应使用 Token |
|------|--------|-------------|
| `COLOR_BOSS` | `#fbbf24` | `--color-boss` |
| `COLOR_ACCENT` | `#818cf8` | `--color-accent` |
| `COLOR_INFO` | `#7ab4f0` | `--color-info` |
| `COLOR_LINE` | `#333` | `--color-border` 或 `--color-gray-800` |
| `COLOR_TEXT` | `#d1d5db` | `--color-text-bright` / `--color-gray-200` |
| `COLOR_TEXT_DIM` | `#9ca3af` | `--color-text-muted` / `--color-gray-500` |

**影响**：tooltip 样式同样使用裸值（`rgba(25,25,35,0.95)`、`#333`、`8px`、`14px`、`zIndex: 50`）。共 81 处裸色引用，占全页面裸值 100%。Token 体系的"一改全改"承诺在此组件上完全失效。

**修复方向**：SVG `fill`/`stroke` 可通过 `getComputedStyle` 读取 CSS 变量，或使用 `currentColor` + CSS 类继承。tooltip 改用 CSS 类 + Token 变量。

---

## 🟡 建议（3 项）

### 2. 38/125 个 Token 已定义未消费

以下 Token 在 `@theme` 中定义但未被 `var()` 引用（按类别）：

- **阴影**：`--shadow-sm/md/lg`、`--shadow-glow-sm/lg` — 5/6 未用（仅 `glow-md` 在 keyframe 中出现）
- **z-index**：`--z-base/raised/sticky/overlay/tooltip` — 5/6 未用（仅 `--z-modal` 被引用）
- **动效**：`--dur-micro`、`--dur-dramatic`、`--offset-large` 未消费
- **灰阶**：`--color-gray-50/200/400/1000` — 4/12 未用
- **间距**：`--space-14`、`--space-20` 未用
- **其他**：`--color-bg-overlay`、`--color-accent-active`、`--color-boss-glow/bg`、功能色 `*-border` 4 个、`--fw-light`、`--lh-relaxed`、`--radius-none/xl`、`--max-w-wide`、断点 5 个

**评估**：Token 定义完备是好事，部分未消费属于"储备型 Token"可接受。但阴影和 z-index 几乎全未用值得关注——当前页面可能在用 Tailwind 工具类或完全没用阴影层级。

### 3. 断点 Token 未通过 `var()` 消费

5 个断点 Token（`--breakpoint-sm` 至 `--breakpoint-2xl`）均未被引用。CSS 媒体查询中使用裸数值 `768px`、`1023px`、`767px`。**原因**：CSS `@media` 规范不支持 `var()` 引用自定义属性，这是浏览器限制而非实现错误。断点 Token 作为文档记录存在合理。

### 4. `margin-inline-end: 4px` 存在一处裸间距值

编译后 CSS 中有一处 `4px` 裸值（等价于 `--space-1`），来源可能是 Tailwind 基础样式。影响极小。

---

## 🟢 通过（6 项）

| 检查项 | 结论 |
|--------|------|
| **@theme Token 定义覆盖度** | ✅ visual-spec-v4.md 所有 125 个 Token 在 global.css `@theme` 中 1:1 定义，值完全匹配 |
| **12 级灰阶** | ✅ gray-50 至 gray-1000 共 12 级，oklch 值与规范一致 |
| **排印 Token 对齐** | ✅ 6 级字号、5 级字重、5 级行高、3 级字间距全部定义且被组件消费 |
| **间距 Token 使用** | ✅ 14 档中 12 档被消费（space-0/1/2/3/4/5/6/8/10/12/16/24），覆盖率 86% |
| **圆角 Token** | ✅ radius-sm/md/lg/full 均被消费，组件级使用规范 |
| **global.css 零裸色值** | ✅ CSS 文件本身无任何裸色值，全部通过 Token 引用 |

---

## 总结

| 维度 | 评分 |
|------|------|
| Token 定义完备性 | ⭐⭐⭐⭐⭐ 125/125 对齐 |
| CSS 层 Token 消费 | ⭐⭐⭐⭐ 87/125 消费，CSS 层零裸值 |
| 组件层 Token 消费 | ⭐⭐ TopologyGraph 81 处裸值，阻断级 |

**结论**：CSS 层（global.css + Astro 组件 `<style>`）Token 还原度优秀。**唯一阻断项是 TopologyGraph.tsx 的 JSX 内联样式全量使用裸色值**，必须修复后方可视为 Token 体系闭环。
