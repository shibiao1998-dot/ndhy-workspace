# V3 代码审查报告

## 总评

**有条件放行。** 整体实现质量高，7 区块叙事结构完整，Design Token 与视觉规范高度对齐，JS 精简克制。需修复 14 处 `[待回填]` 占位符和 1 处 data-order 冲突后可上线。

---

## 阻断问题（必须修复）

### B1. 14 处 `[待回填]` 占位符未替换

区块三时间线的 `.step-meta` 和 `.detail-meta` 中有 14 处 `[待回填]` 文本，直接面向用户展示。这是 content-v3.md 标注的占位数据，需要用真实制作数据替换。

**位置**：8 个 `.step-meta` + 6 个 `.detail-meta`

**改法**：用本次 V3 制作过程的真实数据回填（产出时间、文件大小、改进建议数等）。

### B2. SVG 拓扑图 data-order 冲突

`API 设计专家` 和 `技术调研专家` 均为 `data-order="16"`，导致亮起动画顺序不确定。技术调研专家应为 `data-order="28"`（或其他唯一值），老板节点也是 `data-order="28"` 存在冲突。

**改法**：重新分配 data-order，确保 30 个节点 0-29 唯一。老板作为最后亮起的节点应为最大值（如 29）。

---

## 建议改进（可选修复）

### S1. 缺少 `og:image` meta 标签

OG 标签齐全（type/title/description/url/site_name/locale），但缺少 `og:image`。社交分享时无预览图。design-v3.md 规划了 `assets/og-image.png`。

**改法**：添加 `<meta property="og:image" content="https://ndhy-ai-team.com/assets/og-image.png">`。

### S2. 缺少 `rel="canonical"` 标签

对 SEO 有帮助，尤其防止 `www` / 非 `www` 重复索引。

### S3. 区块四左栏 `opacity: var(--contrast-dim)` (0.55) 可能影响文字可读性

视觉规范规定 `--contrast-dim: 0.55`，应用于整个 `.dim` 面板。面板内文字本身已是 `--color-text-muted`（#888），叠加 0.55 opacity 后实际对比度可能不达 WCAG AA。

**改法**：在暗环境（#0a0a0a 背景）下实测对比度，或将 opacity 提升至 0.65。

### S4. 区块二 SVG 无 `<title>` 子元素

SVG 有 `role="img"` 和 `aria-label`（好），但各 `<g class="topo-node">` 缺少 `<title>` 元素，屏幕阅读器只能读到整图的 label，无法逐节点导航。移动端降级列表有 `role="list/listitem"`（好），但桌面端 SVG 的无障碍可进一步提升。

### S5. IntersectionObserver threshold 与规格偏差

experience-design-v3.md 规定 `threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0]`，实际代码用 `[0, 0.2, 0.4]`。功能上影响不大（unobserve 后多余 threshold 无意义），但规格一致性不够严格。移动端规格要求 `[0, 0.3, 1.0]`，代码未区分。

### S6. `.topo-label` CSS 选择器永远不会命中

CSS 用 `.topo-node.lit + .topo-label` 和 `.topo-node.lit ~ .topo-label` 选择标签，但 HTML 中没有 `.topo-label` 元素（节点名称都在 `data-name` 属性中通过 tooltip 展示）。这段 CSS 是死代码。

### S7. resize 事件监听未做 debounce

`window.addEventListener('resize', ...)` 每帧触发，虽然只更新一个布尔值开销极低，但专业实践建议 debounce。

### S8. 首屏锁定时 ESC / Space 可跳过，但未实现 `touchstart` 跳过

experience-design-v3.md 要求"ESC / 任意点击也释放（容错）"。代码实现了 `keydown`（ESC/↓/Space）和 `click`，但移动端用户首次触摸时可能困惑于无法滚动。建议补充 `touchstart` 监听。

### S9. Tooltip 定位用固定偏移量

`showTooltip` 中 `tx - 100` 是硬编码宽度假设。如果 tooltip 内容较短或较长，定位可能偏移。建议改用 tooltip 实际宽度 `tooltipEl.offsetWidth / 2` 居中。

### S10. 区块五剖面三主题变更有据可查

design-v3.md 规划为"数字人格"，content-v3.md 改为"持续进化"并附选择说明。代码与 content-v3 一致 ✅。不算偏差，但需确认老板知悉此变更。

---

## 亮点

1. **Design Token 全量对齐**：`:root` 变量与 visual-spec-v3.md 一一对应，无遗漏无魔法数字，CSS 可维护性极好。

2. **单 IntersectionObserver 架构**：全页共用一个 IO 实例，按元素类型分发处理，动画完成后 `unobserve`。性能优秀，符合 experience-design-v3.md 的 IO 策略要求。

3. **移动端拓扑图优雅降级**：≤600px 时 SVG 隐藏，切换为语义化列表，保留全部信息。实现干净，体验不打折。

4. **无障碍基础扎实**：`skip-link`、`aria-label`、`role` 属性、`aria-live="polite"`（打字机区域）、`aria-hidden`（tooltip）——覆盖面超出一般官网水平。

5. **零依赖零构建**：70KB 纯 HTML/CSS/JS 单文件，即开即用。完美支撑"0 Lines of Human Code"的 meta-statement。

6. **打字机跳过机制完善**：ESC / ↓ / Space / 点击均可跳过首屏锁定，用户不被强制等待。

7. **CSS 动画全部使用 `transform` / `opacity`**：GPU 合成层友好，无布局抖动（`clip-path` 变化也是合成层操作）。

---

_审查人：🔍 代码审查专家 · 2026-03-16_
