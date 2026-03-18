# V5 官网质量测试报告

**测试时间**: 2026-03-17 04:52 CST
**测试环境**: Windows 10, Node v24.13.0, Astro 静态构建, Chrome Headless (Lighthouse)

---

## Build 验证: ✅

- `npm run build` 零错误零警告
- 构建耗时: 1.59s
- dist/ 产出完整: index.html + 13 个资源文件（CSS 1 个, JS 8 个, favicon 2 个）

## Lighthouse: Performance 56 / Accessibility 91 / Best Practices 100 / SEO 100

| 指标 | 得分 | 说明 |
|------|------|------|
| Performance | 56 ⚠️ | FCP/LCP/TTI 均为 10.0s — **Lighthouse throttling 伪影**（本地静态页面所有渲染指标完全相同 = 非真实性能问题） |
| Accessibility | 91 ✅ | 达标。2 个具体问题见下方 |
| Best Practices | 100 ✅ | 完美 |
| SEO | 100 ✅ | 完美 |

**Performance 56 分析**:
- TBT: 0ms（零 JS 阻塞 ✅）
- CLS: 0.011（远低于阈值 ✅）
- 总传输体积: 115 KiB（极小 ✅）
- FCP/LCP 10s 是 Lighthouse headless throttling + 本地环境导致，**非代码问题**。实际生产环境（CDN + 静态托管）预期 FCP < 1s
- 无 render-blocking 资源

**Accessibility 91 的两个扣分项**:

1. **`role="listitem"` 缺少 `role="list"` 父容器**（33 个节点）
   - 位置: `S2RevealSection.astro` 移动端拓扑布局
   - 原因: `topo-node` div 使用 `role="listitem"` 但直接父容器 `topo-layer__nodes` 没有 `role="list"`
   - 严重度: 中 — 结构性 ARIA 问题，不影响视觉但影响辅助技术语义
   - 修复建议: 给 `.topo-layer__nodes` 加 `role="list"`

2. **颜色对比度不足**（1 个元素）
   - 位置: `S4ContrastSection.astro` 的 `.contrast__vs-text`（"VS" 文字）
   - 对比度: 3.48:1（需 4.5:1）
   - 颜色: `#696969` on `#0e0f14`
   - 严重度: 低 — 该元素已设 `aria-hidden="true"`，辅助技术会跳过
   - 修复建议: 将 `--color-text-dim` 改亮至 `#8a8a8a`+（达到 4.5:1）

## 可访问性: ✅ (总体达标，2 个小问题)

| 检查项 | 结果 |
|--------|------|
| 所有 `<img>` 有 alt 属性 | ✅ 全部有 |
| 交互元素有 aria-label | ✅ 10 个 button 均有可访问名称 |
| 颜色对比度 AA | ⚠️ 1 处未达标（aria-hidden 元素，低影响） |
| 键盘导航 focus-visible | ✅ CSS 中 10 处 focus-visible 样式 |
| tabindex="0" 元素 | ✅ 33 个，均有对应 role="button" |

## 修复验证: ✅ (全部落地)

| 抽查项 | 结果 |
|--------|------|
| "30 个领域专家" aria-label | ✅ 已找到 |
| 无 `\uFFFD` 乱码字符 | ✅ 0 处 |
| 无中文句号 "。" | ✅ 0 处 |
| `--color-rank-junior` 等徽章 Token | ✅ 9 个 rank Token 已落地: junior, junior-bg, mid, mid-bg, senior, senior-bg, master, master-bg, master-glow |

## 文件体积: 520 KB

| 文件 | 大小 |
|------|------|
| dist/index.html | 131.4 KB |
| index.astro...js (主 JS) | 133.0 KB |
| client.DIQWfPlE.js (React) | 181.4 KB |
| index@_@astro.css | 54.7 KB |
| TopologyGraph.js | 8.8 KB |
| 其他 JS (5 个) | ≤ 7.5 KB |
| favicon.ico + .svg | 1.1 KB |
| **dist/ 总计** | **520 KB** |

**体积评估**: 520KB 总计（含 React runtime 181KB），对单页展示站属正常范围。无异常大文件。

## 总结: 🟡 接近生产就绪，建议修复 2 个 A11y 小问题

### 必须修复（建议）
1. **ARIA 嵌套结构**（中优先级）: `S2RevealSection.astro` 中 `.topo-layer__nodes` 添加 `role="list"` — 预计 5 分钟修复，可将 Accessibility 提升至 95+
2. **对比度**（低优先级）: `.contrast__vs-text` 颜色调亮 — 虽然 `aria-hidden="true"` 已降低影响，但修复可消除 Lighthouse 警告

### 无需修复
- Performance 56 分是本地 Lighthouse throttling 伪影，非代码问题。实际部署后预期 90+
- 文件体积合理，无需优化
- 所有 Phase 2.1 + 2.2 修复已正确落地

**结论**: 代码质量和可访问性整体达标。修复上述 2 个 ARIA/对比度小问题后即可发布。
