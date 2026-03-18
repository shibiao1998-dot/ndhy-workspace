# UI 设计工作流、工具链与 AI Agent 可行方案调研报告

> 调研日期：2026-03-16
> 调研背景：NDHY AI Agent Team 在做产品官网时，发现视觉设计专家和前端开发专家之间缺少 UI 设计环节，导致页面质量问题。

---

## 一、人类团队的 UI 设计工作流

### 1.1 UI 设计师 vs 视觉设计师：角色区别

| 维度 | 视觉设计师（Visual Designer） | UI 设计师（UI Designer） |
|------|------------------------------|------------------------|
| **核心关注** | 品牌视觉语言、美学、情感传达 | 用户界面的可用性、交互逻辑、功能实现 |
| **工作范围** | 跨媒介（品牌、印刷、数字） | 仅数字产品界面 |
| **产出物** | 品牌规范、色彩体系、字体规范、视觉风格指南 | 页面布局、组件库、交互原型、设计标注 |
| **关注重心** | "好不好看"、"品牌调性对不对" | "好不好用"、"布局合不合理"、"状态全不全" |
| **技术理解** | 不要求理解前端实现 | 需要理解 CSS 布局、响应式原理、组件化思想 |
| **协作对象** | 上游：PM/品牌；下游：UI 设计师 | 上游：视觉设计师/UX；下游：前端开发 |

**关键洞察**：视觉设计师定义"品牌长什么样"，UI 设计师定义"产品长什么样"。两者有交集但职责不同。在大厂通常是两个岗位，在小团队可能一人兼任——但**技能要求不同**。

### 1.2 UI 设计标准工作流程

```
需求理解 → 信息架构 → 线框图 → 视觉设计 → 高保真原型 → 设计标注 → 开发交接 → 走查验收
```

详细流程：

| 阶段 | 输入 | 活动 | 输出 |
|------|------|------|------|
| **1. 需求理解** | PRD、用户画像 | 理解功能需求、用户场景 | 设计 brief |
| **2. 信息架构** | 设计 brief | 组织内容层级、导航结构 | 站点地图、信息架构图 |
| **3. 线框图** | 信息架构 | 低保真布局探索，不涉及颜色/字体 | Wireframes（线框图） |
| **4. 视觉设计** | 线框图 + 品牌规范 | 应用颜色、字体、间距、图标等视觉元素 | 高保真设计稿（Mockup） |
| **5. 原型制作** | 高保真稿 | 添加交互、转场、微动效 | 可交互原型（Prototype） |
| **6. 设计标注** | 高保真稿 | 标注间距、字号、颜色值、组件状态 | 标注文档 / Design Spec |
| **7. 开发交接** | 标注 + 切图 + 设计系统 | 与前端沟通实现细节 | Handoff 文档 |
| **8. 走查验收** | 开发产出 | 对比设计稿检查还原度 | 修改清单 |

### 1.3 UI 设计师的核心产出物

1. **线框图（Wireframes）**：低保真布局方案，用于快速验证信息结构
2. **高保真设计稿（Mockups）**：像素级的页面设计，包含所有视觉细节
3. **交互原型（Prototypes）**：可点击的交互演示
4. **组件库（Component Library）**：可复用的 UI 组件集合
5. **设计标注（Design Specs）**：间距、颜色、字号等精确数值
6. **响应式方案**：桌面端、平板、移动端的适配设计
7. **状态设计**：hover、active、disabled、loading、error、empty 等全状态

---

## 二、UI 设计工具生态

### 2.1 主流 UI 设计工具对比

| 工具 | 定位 | 优势 | 劣势 | 价格（2026） |
|------|------|------|------|-------------|
| **Figma** | 行业标准，协作优先 | 实时协作、插件生态、Dev Mode、MCP Server、AI（Figma Make） | 复杂项目性能瓶颈 | Free / Pro $16/人/月 |
| **Sketch** | macOS 原生设计 | 轻量、本地性能好 | 仅 Mac、协作弱、生态萎缩 | $12/人/月 |
| **Adobe XD** | Adobe 生态集成 | 和 PS/AI 联动 | **已停止开发**（2024年停更） | - |
| **Penpot** | 开源设计工具 | 免费、自部署、开放标准 | 功能相比 Figma 还有差距 | 免费 |

**结论**：2026 年 **Figma 是绝对主流**，市场份额遥遥领先，且 AI 功能（Figma Make、MCP Server）使其在 AI 时代更具优势。

### 2.2 设计交接（Design Handoff）方式

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| **Figma Dev Mode** | Figma 内置的开发者视图，可查看 CSS、间距、组件属性 | Figma 用户首选 |
| **Figma MCP Server** | 通过 MCP 协议将设计信息（组件、样式、变量）传递给 AI 编码工具 | AI Agent 团队 ⭐ |
| **Zeplin** | 独立的设计交接平台 | 非 Figma 团队 |
| **Design Tokens** | JSON 格式的设计变量（颜色、间距、字号），跨工具通用 | 多平台项目 |
| **CSS 直接导出** | 从设计工具直接生成 CSS | 简单项目快速交接 |

### 2.3 设计系统（Design System）

**定义**：设计系统 = 设计原则 + 组件库 + 设计 Tokens + 使用文档 + 代码实现

一个完整的设计系统包含：

| 层级 | 内容 | 示例 |
|------|------|------|
| **基础层（Foundations）** | 颜色、字体、间距、圆角、阴影 | `--color-primary: #0066FF` |
| **组件层（Components）** | 按钮、输入框、卡片、导航栏等 | `<Button variant="primary">` |
| **模式层（Patterns）** | 表单、列表、弹窗等常见 UI 模式 | 登录表单、搜索结果列表 |
| **模板层（Templates）** | 页面级布局模板 | Dashboard、Landing Page |
| **文档层（Documentation）** | 使用规范、何时用什么组件 | "主操作用 Primary Button" |

**建立方式**（对 AI 团队推荐）：
1. **基于现有开源系统定制**：不从零开始，基于 Shadcn UI / Radix / Material Design 等定制
2. **代码优先（Code-first）**：设计系统以代码组件为 source of truth，而非 Figma 文件
3. **Design Tokens 驱动**：用 JSON/CSS 变量定义所有设计变量，确保设计和代码一致

---

## 三、AI Agent 做 UI 设计的可行方案（重点）

### 3.1 方案一：Figma API 方案

| 维度 | 评估 |
|------|------|
| **能力** | Figma REST API **主要是只读的**（GET 请求）——可以读取文件结构、组件、样式，但**不能通过 REST API 创建或编辑设计** |
| **写入方式** | 写入必须通过 **Figma Plugin API**（在 Figma 客户端内运行）或新的 Figma Make 功能 |
| **限制** | REST API 无法创建节点、移动元素、改颜色；Plugin API 需要 Figma 客户端运行环境 |
| **速率限制** | GET 200次/分钟，Write 200次/分钟，批量导出 500图/分钟 |
| **AI Agent 可行性** | ❌ **不推荐** — AI Agent 无法直接通过 API "画设计稿"。需要人类操作 Figma 客户端 |

**结论**：Figma API 适合**读取设计信息**（给 AI 编码工具提供上下文），但**不适合让 AI 创建设计稿**。

### 3.2 方案二：Figma MCP Server（Design → Code）

| 维度 | 评估 |
|------|------|
| **是什么** | Figma 官方推出的 MCP Server（2025年6月发布），让 AI 编码工具（Cursor、Claude Code、Copilot 等）读取 Figma 设计信息 |
| **能力** | 将设计稿的组件、样式、变量、布局约束以结构化数据传递给 LLM，生成设计感知的代码 |
| **工作方式** | AI 编码工具连接 Figma MCP Server → 读取设计帧信息 → 结合 Code Connect 映射 → 生成前端代码 |
| **社区方案** | [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)：开源 MCP Server，为 Cursor 等提供 Figma 布局信息 |
| **AI Agent 可行性** | ✅ **强烈推荐用于 "Design → Code"** — 但前提是**先有设计稿** |

**关键限制**：MCP Server 是**读取**设计信息给代码生成用的，不是让 AI 创建设计的。它解决的是 handoff 问题，不是设计创作问题。

### 3.3 方案三：AI 直接生成 HTML/CSS 原型（Code-First）⭐ 推荐

| 维度 | 评估 |
|------|------|
| **核心思路** | 跳过传统设计工具，AI Agent 直接生成 HTML/CSS/React 代码作为"设计稿" |
| **优势** | 产出即代码、无 handoff 损耗、可直接迭代、响应式天然支持 |
| **劣势** | 缺少可视化评审界面（需要浏览器预览）、非设计师不易参与评审 |
| **代表工具** | v0.dev、Claude Code、Cursor + Tailwind |
| **AI Agent 可行性** | ✅ **高度可行** — 这是最适合纯 AI 团队的路径 |

**适合我们团队的原因**：
1. 团队没有人类设计师，不需要 Figma 作为协作媒介
2. AI Agent 直接输出代码，前端开发专家可以直接迭代
3. 用浏览器预览代替设计稿评审，PM 直接看效果
4. 响应式、交互状态可以在代码层面一步到位

### 3.4 方案四：AI 原生 UI 设计工具（2025-2026）

| 工具 | 定位 | 输出格式 | 价格 | AI Agent 可用性 |
|------|------|---------|------|----------------|
| **Figma Make** | Figma 内置 AI 生成 | Figma 文件 | 含在 Figma Pro 内 | ⚠️ 需要 Figma GUI |
| **Google Stitch** (原 Galileo AI) | Google Gemini 驱动的 UI 生成 | HTML/CSS | 免费（Beta） | ⚠️ 网页界面操作 |
| **v0.dev** (Vercel) | AI 生成 React/Tailwind 组件 | React + Tailwind CSS 代码 | Free/$20/$30 | ✅ 有 API |
| **Uizard** | 非设计师快速原型 | 可导出为图片/代码 | $12/月 | ⚠️ 网页界面 |
| **Flowstep** | 多屏幕用户流程生成 | Figma 可粘贴 + React 代码 | $15/月 | ⚠️ 网页界面 |
| **Visily** | 截图/草图转设计 | 设计稿 + 代码 | $14/月 | ⚠️ 网页界面 |
| **Motiff** | 代码导出 + 设计系统 | React/HTML 代码 | $16/月 | ⚠️ 网页界面 |
| **Magic Patterns** | 设计系统集成 | Tailwind/React 代码 | ~$19/月 | ⚠️ 网页界面 |

**关键发现**：
- **Google Stitch**（Galileo AI 被 Google 2025年5月收购后重命名）：免费、Gemini 驱动，可从文字/草图/截图生成 UI，导出 HTML/CSS。但目前仅网页界面，无 API 供 Agent 调用。
- **v0.dev** 是目前**最适合 AI Agent 集成**的工具：有 API、输出标准 React + Tailwind CSS、支持 Figma 导入、可部署到 Vercel。
- **Figma Make** 在 Figma 生态内最强，但需要 GUI 操作，不适合纯 Agent 流程。

### 3.5 方案五：Design-to-Code 工具

| 工具 | 方式 | 支持框架 | 代码质量 | 价格 |
|------|------|---------|---------|------|
| **Figma MCP Server** | MCP 协议 → AI 生成代码 | 框架无关 | ⭐⭐⭐⭐ | 含在 Figma Dev Mode |
| **Locofy.ai** | Figma 插件 → 代码 | React, Vue, Angular, Flutter, Next.js | ⭐⭐⭐ | 付费 |
| **Builder.io** | Visual Editor → 代码 | React, Vue, Svelte, Angular | ⭐⭐⭐⭐ | Free/付费 |
| **Anima** | Figma → 代码 | React, HTML/CSS, Vue | ⭐⭐⭐ | Free/付费 |
| **TeleportHQ** | 可视化 → 代码 | React, Vue, Angular | ⭐⭐⭐ | Free/付费 |
| **Codegen (Figma 原生)** | Figma → 代码 | React, iOS, Android | ⭐⭐⭐ | 含在 Figma |

**对我们的适用性**：Design-to-Code 工具的前提是**有设计稿**。如果采用 Code-First 方案，这些工具就不需要了。

### 3.6 综合方案推荐：AI Agent 团队的 UI 设计工作流 ⭐

**推荐采用"Code-First + 设计系统 + 浏览器评审"工作流**：

```
视觉规范（视觉设计专家）
    ↓ 输出：Design Tokens（颜色/字体/间距 CSS 变量）
    ↓ 输出：组件规范（按钮/卡片/表单的视觉规则）
    ↓
UI 设计专家（新增 AI 角色）
    ↓ 输入：Design Tokens + 页面需求 + 参考设计
    ↓ 活动：确定信息架构、页面布局、组件选择、响应式策略、全状态覆盖
    ↓ 输出：页面设计规范文档（Markdown + 结构化描述）
    ↓ 输出：HTML/CSS 原型代码（v0.dev 或直接生成）
    ↓
前端开发专家
    ↓ 输入：设计规范 + 原型代码 + Design Tokens
    ↓ 活动：基于原型开发生产代码
    ↓
PM 浏览器评审
    ↓ 直接在浏览器中查看效果
    ↓ 反馈修改意见
```

---

## 四、对我们团队的建议

### 4.1 结论：需要创建 UI 设计专家角色

**建议：✅ 创建一个 AI "UI 设计专家" 角色。**

**理由**：
1. **能力缺口是真实的**：视觉规范 → 前端代码之间缺少"布局决策、组件选择、响应式策略、状态设计"这一层
2. **现有视觉设计专家不适合升级覆盖**：视觉设计和 UI 设计虽有交集，但核心技能不同——视觉设计关注美学，UI 设计关注可用性和前端实现可行性。强行合并会降低两个领域的专业深度
3. **AI Agent 完全有能力做 UI 设计**：LLM 对布局原则、组件模式、响应式策略、可访问性规范有充分的知识储备
4. **Code-First 方案使 AI UI 设计完全可行**：不需要操作 Figma，直接输出结构化设计规范 + 原型代码

### 4.2 UI 设计专家角色定义

| 维度 | 定义 |
|------|------|
| **角色名称** | UI 设计专家（UI Design Expert） |
| **角色定位** | 将视觉规范和产品需求转化为具体的页面布局、组件设计、响应式方案和交互规范 |
| **与视觉设计专家的边界** | 视觉设计专家定义"品牌视觉语言"（颜色、字体、风格），UI 设计专家定义"具体页面怎么用这些语言" |
| **与前端开发专家的边界** | UI 设计专家定义"页面应该长什么样、怎么交互"，前端专家负责"用代码准确实现" |

### 4.3 UI 设计专家核心技能

| 技能类别 | 具体技能 |
|---------|---------|
| **布局设计** | 栅格系统、Flexbox/Grid 布局思维、视觉层级、留白运用 |
| **组件设计** | 组件拆分、组件状态设计（hover/active/disabled/loading/error/empty/skeleton） |
| **响应式设计** | 断点策略、移动优先、自适应布局、触控适配 |
| **可访问性** | 对比度（WCAG AA 4.5:1）、焦点管理、语义化标签、键盘导航 |
| **设计系统** | Design Tokens 定义、组件库规划、设计规范文档 |
| **前端理解** | CSS 布局模型、Tailwind CSS 工具类、组件化思想、性能影响 |
| **原型制作** | 输出 HTML/CSS 原型或结构化设计规范 |

### 4.4 UI 设计专家核心产出物

| 产出物 | 格式 | 说明 |
|--------|------|------|
| **页面设计规范** | Markdown | 每个页面的布局结构、组件选择、间距规则、响应式断点 |
| **Design Tokens** | CSS 变量 / JSON | 所有设计变量的代码化定义 |
| **组件规范** | Markdown + 代码 | 每个组件的状态、变体、使用规则 |
| **HTML/CSS 原型** | 代码 | 关键页面的可预览原型 |
| **响应式方案** | 文档 | 各断点下的布局变化说明 |
| **设计走查清单** | Checklist | 用于验收前端实现还原度 |

### 4.5 UI 设计专家需要的 Skill

基于当前团队的 Skill 体系，UI 设计专家需要以下技能：

| Skill 名称 | 用途 | 是否已有 |
|------------|------|---------|
| **ui-design-system** | Design Tokens 定义、组件库设计、设计规范输出 | ❌ 需新建 |
| **page-layout-design** | 页面布局设计、栅格系统、响应式策略 | ❌ 需新建 |
| **component-state-design** | 组件全状态设计（hover/loading/error/empty 等） | ❌ 需新建 |
| **accessibility-audit** | WCAG 合规检查、对比度验证、语义化审查 | ❌ 需新建 |
| **design-to-code-prototype** | 将设计规范转化为 HTML/CSS 原型 | ❌ 需新建 |
| **design-review-checklist** | 设计走查、前端还原度验收 | ❌ 需新建 |

### 4.6 推荐工具链

| 环节 | 工具/方式 | 理由 |
|------|----------|------|
| **Design Tokens 管理** | CSS 变量 + JSON 文件 | 代码即设计，无需额外工具 |
| **原型生成** | AI Agent 直接输出 HTML/CSS/React | Code-First，无 handoff 损耗 |
| **原型预览** | 浏览器本地预览 | PM 直接在浏览器评审 |
| **参考设计获取** | Google Stitch（免费） | 快速获取设计灵感和参考 |
| **组件库基础** | Shadcn UI / Radix UI + Tailwind CSS | 成熟、可定制、AI 友好 |
| **设计规范存储** | Markdown 文件在项目仓库中 | 和代码同仓库、版本化管理 |

### 4.7 不采用 Figma 的原因

| 原因 | 说明 |
|------|------|
| **API 限制** | Figma REST API 只读，AI Agent 无法通过 API 创建设计 |
| **需要 GUI** | Figma Make 等 AI 功能需要在 Figma 客户端操作 |
| **团队无人类设计师** | Figma 的协作价值在人类团队，纯 AI 团队用不上 |
| **增加 handoff 成本** | Figma → 前端还需要翻译，Code-First 直接跳过 |
| **费用** | Pro $16/人/月，对纯 AI 团队来说不值 |

**例外情况**：如果未来需要与外部人类设计师协作，或 PM 强烈需要可视化评审工具，可以考虑引入 Figma + MCP Server。

---

## 五、行动计划建议

### 5.1 立即可做（本周）

1. **创建 UI 设计专家角色**：定义 SOUL.md + STANDARDS.md
2. **建立 Design Tokens**：基于现有视觉规范，输出 CSS 变量文件
3. **选定组件库基础**：推荐 Shadcn UI + Tailwind CSS

### 5.2 短期（2周内）

4. **开发核心 Skill**：`ui-design-system` 和 `page-layout-design`
5. **试点一个页面**：用新工作流重做官网首页，验证流程

### 5.3 中期（1个月内）

6. **完善全部 Skill**：组件状态设计、可访问性审查、设计走查
7. **形成设计系统 v1.0**：完整的 Tokens + 组件规范 + 使用文档
8. **评估 v0.dev API 集成**：是否值得将 v0.dev 作为原型生成工具集成到工作流

---

## 六、参考资料

### 关键信息源
- Figma MCP Server 官方文档：https://developers.figma.com/docs/figma-mcp-server/
- Figma Blog - Introducing MCP Server：https://www.figma.com/blog/introducing-figma-mcp-server/
- Figma Blog - Design Systems and AI MCP：https://www.figma.com/blog/design-systems-ai-mcp/
- Figma-Context-MCP (社区)：https://github.com/GLips/Figma-Context-MCP
- Figma MCP Server Guide (社区)：https://github.com/figma/mcp-server-guide
- v0.dev by Vercel：https://v0.app
- Google Stitch (原 Galileo AI)：https://stitch.withgoogle.com
- toools.design 2026 AI 工具评测：https://www.toools.design/blog-posts/best-ai-tools-ui-ux-designers-2026
- Builder.io Figma MCP 指南：https://www.builder.io/blog/figma-mcp-server
- Geeky Gadgets - AI Agent Prototype Workflow：https://www.geeky-gadgets.com/ai-agents-prototype-workflow/
- UX Design Institute - Visual vs UI Design：https://www.uxdesigninstitute.com/blog/visual-design-vs-ui-design/
- Figma Blog - Design Handoff Handbook：https://www.figma.com/blog/the-designers-handbook-for-developer-handoff/

---

> **总结一句话**：创建 AI UI 设计专家，采用 Code-First 工作流（AI 直接输出设计规范 + HTML/CSS 原型），基于 Shadcn UI + Tailwind CSS + Design Tokens，跳过 Figma，直接在代码层面完成设计到开发的闭环。
