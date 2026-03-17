# V5 A11y 修复复测报告

> **测试时间**：2026-03-17 12:00 CST
> **测试对象**：V5 官网 A11y 修复 — ARIA 嵌套 + VS 对比度
> **基准**：Lighthouse A11y 之前 91 分

---

## 1. Build 验证 ✅

```
astro build → 1 page(s) built in 1.56s
```

- 零错误、零警告
- 静态输出到 `dist/` 正常

---

## 2. ARIA 嵌套验证 ✅

### 源码分析（S2RevealSection.astro）

ARIA 嵌套结构完全正确，每个 `role="listitem"` 都有 `role="list"` 的直接祖先：

| 层级 | 结构 |
|------|------|
| L1 | `div.topology-mobile[role="list"]` → |
| L2 | 　`div.topo-layer[role="listitem"]` (×4 层：L0/L1/L2/L3) |
| L3 | 　　`div.topo-layer__nodes[role="list"]` → |
| L4 | 　　　`div.topo-node[role="listitem"]` (各成员节点) |

**`role="list"` 位置验证**（源码行号）：
- 第 35 行：`div.topology-mobile[role="list"]` — 顶层列表容器 ✅
- 第 40 行：`div.topo-layer__nodes[role="list"]` — L0 节点容器 ✅
- 第 62 行：`div.topo-layer__nodes[role="list"]` — L1 节点容器 ✅
- 第 84 行：`div.topo-layer__nodes[role="list"]` — L2 节点容器 ✅
- 第 110 行：`div.topo-domain-group__grid[role="list"]` — L3 域分组容器 ✅

**`role="listitem"` 验证**：
- 8 处 `role="listitem"` 出现在源码（行 38/46/60/68/82/90/104/116）
- 每个 listitem 都被 `role="list"` 直接包裹
- 无孤立 `role="listitem"` ✅

**构建产出验证**：
- `dist/index.html` 中共 22 个 `role="list"`、49 个 `role="listitem"`（含动态渲染的成员节点）
- `topology-mobile` 容器确认带有 `role="list"` ✅

### Lighthouse ARIA 审计全部通过 ✅

关键审计项全部 score=1：
- `aria-required-children`：✅ 通过
- `aria-required-parent`：✅ 通过
- `list`：✅ 通过
- `listitem`：✅ 通过

---

## 3. VS 对比度验证 ✅

### S4ContrastSection.astro 检查

**VS 文字样式**（第 142-148 行）：
```css
.contrast__vs-text {
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  color: var(--color-text-muted);  /* ✅ 正确 — 使用 muted 而非 dim */
  ...
}
```

- ✅ 使用 `var(--color-text-muted)` — 确认已修复
- ❌ 未使用 `var(--color-text-dim)` — 旧值已消除

### 对比度估算

| Token | 解析值 | oklch L 值 |
|-------|--------|-----------|
| `--color-text-muted` | `var(--color-gray-500)` | `oklch(0.62 0 0)` |
| `--color-text-dim`（旧） | `var(--color-gray-600)` | `oklch(0.52 0 0)` |
| VS 背景 `--color-bg-elevated` | `oklch(0.17 0.01 270)` | L=0.17 |

- **修复前**（dim）：前景 L=0.52 vs 背景 L=0.17 → 对比度 ≈ 3.3:1 ❌ 不满足 WCAG AA 4.5:1
- **修复后**（muted）：前景 L=0.62 vs 背景 L=0.17 → 对比度 ≈ 4.8:1 ✅ 满足 WCAG AA 4.5:1

> 注：VS 元素带 `aria-hidden="true"`，对屏幕阅读器不可见，但视觉对比度改善对所有用户有益。

### Lighthouse color-contrast 审计 ✅

`color-contrast` 审计 score=1，无失败项。

---

## 4. 回归检查 ✅

### ARIA 回归
- 所有 ARIA 相关 Lighthouse 审计全部通过（aria-required-children、aria-required-parent、aria-roles 等）
- 无新增 ARIA 问题 ✅

### S2 功能完整性
- `组织拓扑` 标题存在 ✅
- `topology-desktop` / `topology-mobile` 双模式存在 ✅
- `data-topo-node` 节点标记存在 ✅
- 底部文案「一个人类 · 31 个 AI 专家 · 一个完整的产品组织」存在 ✅
- 滚动动画脚本（`observeWithStyleReveal`）存在 ✅

### S4 功能完整性
- `同一个需求，两种做法` 标题存在 ✅
- 左列「散装 AI 的世界」/ 右列「AI 组织的世界」存在 ✅
- VS 分隔符 `aria-hidden="true"` 正确 ✅
- `contrast__tag--error` / `contrast__tag--success` 标签存在 ✅
- 滚动动画脚本（`observeWithStagger`）存在 ✅

---

## 5. Lighthouse 复测 ✅

| 类别 | 修复前 | 修复后 | 变化 |
|------|--------|--------|------|
| **Accessibility** | 91 | **100** | **+9 ↑** |
| Performance | — | 91 | — |
| Best Practices | — | 100 | — |
| SEO | — | 100 | — |

### A11y 审计详情

**全部自动审计通过**，无任何失败项。关键审计结果：

| 审计项 | 结果 |
|--------|------|
| aria-required-children | ✅ Pass |
| aria-required-parent | ✅ Pass |
| color-contrast | ✅ Pass |
| list | ✅ Pass |
| listitem | ✅ Pass |
| heading-order | ✅ Pass |
| button-name | ✅ Pass |
| link-name | ✅ Pass |

---

## 最终结论

### ✅ 生产就绪

两个 A11y 问题均已彻底解决：

1. **ARIA 嵌套**：`role="listitem"` 全部正确嵌套在 `role="list"` 容器内，层级结构清晰
2. **VS 对比度**：从 `--color-text-dim`（L=0.52, ≈3.3:1）升级到 `--color-text-muted`（L=0.62, ≈4.8:1），满足 WCAG AA

Lighthouse Accessibility 从 91 → **100**，零失败审计。无回归问题，可安全部署。
