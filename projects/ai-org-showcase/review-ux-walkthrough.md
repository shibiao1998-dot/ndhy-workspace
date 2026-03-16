# review-ux-walkthrough.md — 视觉规范 × 交互意图 走查报告

> 🎨 体验设计专家走查 · 2026-03-16
>
> 基准：experience-design-v4.md（交互方案）
> 检查对象：visual-spec-v4.md（视觉 Token）· ui-design-v4.md（UI 组件）

---

## 🟢 通过项

1. **动效 Token 完整对齐** — visual-spec §7 的 5 档时长（micro/fast/normal/slow/dramatic）、4 种缓动（out/in-out/spring/dramatic）、3 档位移（subtle/medium/large）与 experience-design §3.1 全局变量**逐值一致**，零遗漏。
2. **按钮 5 态匹配微交互** — UI §2.1 的 hover `translateY(-1px)` + glow、active `scale(0.97)` 与交互方案 CTA hover glow 扩散一致；focus 统一 `2px solid accent + offset 2px`。
3. **Tooltip 进出参数一致** — UI §2.5 与交互方案 §3.5 均为：进入 `dur-micro` + `translateY(6px→0)`，退出 150ms 延迟防闪烁。
4. **手风琴展开方案一致** — UI §2.6 使用 `grid-template-rows: 0fr→1fr` + `dur-normal` + `ease-out`，与交互方案 §6 区块③ 完全匹配，替代了 V3 的 max-height 反模式。
5. **移动端触控目标一致** — UI §3.2 节点最小 48×48px、§3.5 小屏格子 56px；交互方案 §4.3 触控规范 48×48px 基线一致。
6. **prefers-reduced-motion 降级覆盖** — 交互方案 §3.6 定义降级策略，UI §3.4 移动端亮起动画明确"跳过亮起，直接显示完成态"，一致。
7. **断点 5 档一致** — visual-spec §8、UI §4.1、experience §5.1 均为 375/768/1024/1440/1920。
8. **卡片入场弹性缓动匹配** — UI 卡片未硬编码入场动效，交互方案 §3.2 定义卡片 `scale(0.92→1)` + `ease-spring`，visual-spec 已提供 `--ease-spring` Token，可直接引用。
9. **区块⑤裁切展开对齐** — UI §2.2 剖面卡片指定 `clip-path 裁切展开`，交互方案 §6 区块⑤ 定义 `clip-path: inset(50% 0)→inset(0% 0)` + `dur-slow` + `ease-dramatic`，Token 均已就位。

---

## 🟡 建议项

1. **节点 Hover 相邻微缩未在 UI 组件定义** — 交互方案 §3.5 定义"相邻节点 `scale(0.95) opacity(0.6)`"，UI §2.7 导航点组件和 §3 拓扑方案均未提及相邻节点联动效果。建议 UI 补充拓扑节点的 hover 联动态（scope = 桌面端 SVG）。
2. **区块⑥ scrub 驱动淡入的中间状态缺 UI 定义** — 交互方案 §6 区块⑥ 定义了 10 段文案各自的滚动区间和视觉权重（1.2×/1.5×/2×），visual-spec §10 提供了 `--fs-emphasis-*` Token，但 UI 未定义 scrub 中"部分可见"文案的中间视觉状态（如半透明时的 color 处理）。建议 UI 补充 scrub 中间态规范或标注"由 GSAP 插值控制，无需额外 CSS 态"。
3. **连线描边动效缺专属 Token** — 交互方案 §3.2 定义连线 `stroke-dashoffset` 动画用 `dur-dramatic` + `ease-out`，视觉 Token 已有这两个值，但缺少 `--stroke-width` / `--stroke-color` 的语义 Token。当前连线样式散落在交互方案的裸值中（`#818cf8`）。建议 visual-spec 补充连线语义 Token（可复用 `--color-accent`）。
4. **移动端亮起间隔 80ms 无 Token** — 交互方案 §4.1 定义"逐行亮起间隔 80ms"，UI §3.4 也引用此值，但 visual-spec 动效 Token 最小档为 `--dur-micro: 120ms`。80ms 是序列间隔而非 transition 时长，属合理裸值，但建议 visual-spec 补一个 `--delay-stagger: 80ms` 以保持零魔法数字原则。

---

## 🔴 阻断项

**无。** 视觉规范和 UI 设计在核心动效参数、组件状态、触控规范、断点策略上与交互方案高度对齐，不存在矛盾或阻断性缺失。

---

## 总结

| 类别 | 数量 |
|------|------|
| 🟢 通过 | 9 |
| 🟡 建议 | 4 |
| 🔴 阻断 | 0 |

视觉规范 V4 对交互方案的支持度**优秀**。4 条建议均为边缘补全（联动态、中间态、语义 Token、stagger 间隔），不影响开发启动，可在实现阶段增量补充。
