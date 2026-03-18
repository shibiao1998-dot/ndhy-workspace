# V5 内容 + UI 走查报告

> 📖 叙事策略专家 + 🖌️ UI 设计专家 · 2026-03-17

---

## 叙事检查

### C1: S3 时间线 — 双层审查 🟢 通过

`timeline-steps.ts` 步骤 8 已完整更新：
- title: "双层审查" ✅
- role: "代码审查专家 ×6" ✅
- output: "双层审查报告" ✅
- detail: 含"第一层：独立审查""第二层：交叉复核""7 个阻断级问题——全部拦截，零遗漏"完整文案 ✅
- S3TimelineSection.astro 通过数据驱动渲染，无硬编码残留 ✅

### C2: S2 拓扑图 — 31 个 AI 专家 🟡 建议

- S2 底文 `一个人类 · 31 个 AI 专家 · 一个完整的产品组织` ✅
- `team-members.ts` 实际数据：L0(1) + L1(1) + L2(1) + L3(30) = 33 条，AI 共 32 ✅ 匹配 "1 Human + 31 AI"（Leader 单独计，PM 归入 30 专家之一是文案选择）
- 🟡 **TopologyGraph.tsx 第 194 行** SVG `aria-label` 写死为"28 个领域专家"，实际 L3 有 30 人。应改为 `30 个领域专家`。不影响视觉但影响无障碍准确性

### C3: S5 架构 — 自动巡查 🟢 通过

Panel C "持续进化"已包含第四张卡片：
- 标题"自动巡查" ✅
- 描述"每 5 分钟自动健康巡查 → 发现异常 → 即时恢复 / 不靠人盯，靠机制兜底" ✅
- 与上方三条（纠正即学习 / 模式识别 / 经验继承）同构 ✅

### S5 "这不是规划…"底文 🟢 通过

build 产物全文搜索未找到"这不是规划"。三个 Panel 底文均为原定文案，无多余声明。已删除 ✅

### 零句号检查 🟢 通过

逐一扫描五个源文件（S2/S3/S5 `.astro` + `timeline-steps.ts` + `team-members.ts`），build 产物可见文案区域，均未发现中文句号"。"。全站保持破折号/箭头/换行分隔风格 ✅

### GitHub 链接 🟢 通过

`href="https://github.com/shibiao1998-dot/ndhy-workspace"` ✅ 含 `target="_blank" rel="noopener noreferrer"`

### 邮箱 mailto 🟢 通过

`href="mailto:shibiao1998@gmail.com"` ✅ 含对应 `aria-label`

---

## UI 检查

### 响应式断点 🟡 建议

- `768px` 断点 ✅ — S2/S3/S5 均有 `@media (min-width: 768px)` 或 `(max-width: 767px)`
- `1024px` 断点 ✅ — S3/S5/S2 均有桌面优化
- `1440px` 断点 🟡 — `global.css` 定义了 `--breakpoint-xl: 1440px` 变量，但**无任何 `@media` 实际使用该断点**。超宽屏幕下 `.section-content` 的 `max-width` 足以约束布局，功能上不阻断，但变量定义了却未使用属于死代码

### 键盘导航 🟢 通过

S3 时间线 header 使用 `<button>` 元素：
- 原生可聚焦、可 Enter/Space 触发 ✅
- `aria-expanded` / `aria-controls` / `id` 配对正确 ✅
- chevron 旋转动画绑定 `.is-open` 状态 ✅

### 5 态覆盖 🟢 通过

`global.css` 明确标注了 "Issue 6: 5-State Coverage"，逐项验证：

| 元素 | hover | active | focus-visible | disabled |
|------|-------|--------|---------------|----------|
| `.cta__email` | ✅ | ✅ | ✅ | ✅ `[disabled]`+`[aria-disabled]` |
| `.cta__source` | ✅ | ✅ | ✅ | ✅ |
| `.timeline-card__header` | ✅ | ✅ | ✅ | — (非必要) |
| `.topo-node` | ✅ | ✅ | ✅ | — (非交互) |
| `.contrast-tag` | ✅ | ✅ | ✅ | — |

CTA 按钮 4 态 + disabled 全覆盖。卡片类元素 3 态覆盖合理（无 disabled 场景） ✅

### 组件提取 🟢 通过

- `src/components/Typewriter.astro` ✅ 存在
- `src/components/ContactButton.astro` ✅ 存在

---

## 汇总

| 检查项 | 结果 | 说明 |
|--------|------|------|
| C1 双层审查 | 🟢 通过 | 文案 + 数据源完整更新 |
| C2 31 个 AI 专家 | 🟡 建议 | 页面文案正确；TopologyGraph SVG aria-label "28" 应改 "30" |
| C3 自动巡查 | 🟢 通过 | 第四张卡片就位，文案同构 |
| "这不是规划"删除 | 🟢 通过 | build 产物无残留 |
| 零句号 | 🟢 通过 | 全站零"。" |
| GitHub 链接 | 🟢 通过 | — |
| 邮箱 mailto | 🟢 通过 | — |
| 响应式断点 | 🟡 建议 | 1440px 变量已定义但未被 @media 使用（死代码） |
| 键盘导航 | 🟢 通过 | `<button>` + ARIA 正确 |
| 5 态覆盖 | 🟢 通过 | CTA 全覆盖，卡片合理覆盖 |
| 组件提取 | 🟢 通过 | Typewriter + ContactButton 存在 |

**🔴 阻断：0 项 · 🟡 建议：2 项 · 🟢 通过：9 项**

两项建议均为低优先级，不阻碍发布。
