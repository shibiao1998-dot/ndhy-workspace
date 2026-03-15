---
name: frontend-development
description: >-
  前端开发执行工具箱：在既定的体验方案、接口契约、架构约束下，将用户交互、页面结构和前端状态
  准确、稳定、可维护地实现为可使用的界面能力。
  覆盖9步标准流程（理解输入、页面骨架、组件拆分、API接入与状态、表单列表实现、
  全状态覆盖、交互反馈、测试与自检、联调交接），
  13大能力方向（页面骨架/组件拆分/API接入与状态/表单校验/列表详情分页/
  loading-empty-error-success状态/弹窗确认流/错误反馈/组件测试/交互测试/
  组件状态重构/契约消费校验/联调交接），
  3级深度分级（快速实现/标准开发/深度开发），5层深度边界。
  标准输出物为前端实现交付包（6文档+代码）。
  包含10条反模式防范、前端实现质量检查清单。
  Use when: (1) 需要根据体验方案实现页面骨架和路由,
  (2) 需要拆分组件并定义组件边界,
  (3) 需要接入API并管理前端状态,
  (4) 需要实现表单校验、列表分页、详情页,
  (5) 需要处理loading/empty/error/success全状态,
  (6) 需要实现弹窗确认流和错误反馈,
  (7) 需要编写组件测试或交互测试,
  (8) 需要重构组件边界或状态管理,
  (9) 需要校验前端契约消费一致性,
  (10) 需要输出联调与交接说明,
  (11) 用户提到前端开发、页面实现、组件拆分、状态管理、表单、列表.
  Triggers on: 前端开发, frontend development, 页面实现, 组件拆分,
  状态管理, API接入, 表单校验, 列表分页, loading状态, 错误反馈,
  弹窗确认, 组件测试, 交互测试, 契约消费, 联调交接.
---

# frontend-development -- 前端开发执行工具箱

在既定的体验方案、接口契约、架构约束下，将用户交互、页面结构和前端状态准确、稳定、可维护地实现为可使用的界面能力。

> 组件边界清晰优先于页面堆砌。状态清晰优先于"先显示出来再说"。异常状态是正式实现的一部分。

**与已有 Skill 的关系**：
- `frontend`（设计指南）：提供视觉风格、排版、配色、动效等**设计层**规范 → 本 Skill 消费其设计指南
- `react-best-practices`（性能优化）：提供 57 条 React/Next.js **性能层**规则 → 本 Skill 消费其性能规则
- `frontend-development`（本 Skill）：聚焦**实现工程层** — 页面结构、组件架构、状态管理、API 集成、业务模式、测试、交接

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 9 步标准流程 | 每次前端实现全程 | 本文 |
| 2 | 3 级深度速查 | Step 0 判断投入量 | 本文 |
| 3 | 5 层深度边界 | 划清职责边界 | 本文 |
| 4 | 组件拆分原则 | Step 2 组件设计 | 本文 + [references/page-component-design.md] |
| 5 | 状态管理决策树 | Step 3 状态选型 | 本文 + [references/state-api-integration.md] |
| 6 | 反模式速查 | 自检常见陷阱 | 本文 |
| 7 | 质量检查清单 | 交付前逐项验收 | 本文 + [references/checklists.md] |
| 8 | 页面与组件设计 | Step 1-2 | [references/page-component-design.md] |
| 9 | 状态与API集成 | Step 3 | [references/state-api-integration.md] |
| 10 | 表单与列表模式 | Step 4 | [references/forms-lists-patterns.md] |
| 11 | 反馈与状态覆盖 | Step 5-6 | [references/feedback-states.md] |
| 12 | 测试策略 | Step 7 | [references/testing.md] |
| 13 | 检查清单详版 | 交付验收 | [references/checklists.md] |
| 14 | 交付模板 | 组织输出物 | [references/templates.md] |
| 15 | 教育行业适配 | 教育项目专用 | [references/education-frontend.md] |

---

## 9 步标准流程

```
Step 1: 理解输入与确认边界
  |  消化体验方案、接口契约、架构约束、项目目标
  |  -> 确认: 页面清单、路由结构、技术栈约束、设计稿/原型
  |  -> 确认: API 契约文档（endpoint/request/response/错误码）
  |  -> 确认: 全局约定（认证方式、请求库、UI 组件库、主题）
  |  -> 信息不足 -> 要求上游补充（不猜测接口、不脑补交互）
  |
Step 2: 页面骨架与组件拆分
  |  -> 定义页面结构（Layout → Page → Section → Component）
  |  -> 按职责拆分组件（不按视觉切，按数据/行为/复用性切）
  |  -> 区分: 容器组件 vs 展示组件 vs 逻辑组件（Hook）
  |  -> 定义组件 Props 接口与层级关系
  |  -> 组件拆分原则 -> 见下方 + references/page-component-design.md
  |
Step 3: API 接入与状态管理
  |  -> 按契约封装 API 调用层（统一错误处理、类型定义）
  |  -> 选择状态管理方案（状态管理决策树 -> 见下方）
  |  -> 区分: 服务端状态 vs 客户端状态 vs UI 临时状态
  |  -> 实现数据获取/提交/刷新/缓存/乐观更新
  |  -> 详细方法 -> references/state-api-integration.md
  |
Step 4: 表单、列表与业务模式实现
  |  -> 表单: 校验规则定义 → 提交流程 → 错误回显 → 重置
  |  -> 列表: 数据源 → 筛选/排序 → 分页（前端/后端） → 空态
  |  -> 详情: 数据加载 → 关联展示 → 操作入口
  |  -> 弹窗/确认流: 触发 → 内容 → 确认/取消 → 回调
  |  -> 详细方法 -> references/forms-lists-patterns.md
  |
Step 5: 全状态覆盖
  |  -> 逐页面/逐组件检查 5 态: loading / empty / error / success / disabled
  |  -> 骨架屏/占位符 用于首次加载
  |  -> 空态: 区分"无数据"vs"筛选无结果"vs"权限不足"
  |  -> 错误态: 区分网络错误/业务错误/权限错误，给出可操作提示
  |  -> 成功态: 操作反馈（toast/redirect/列表刷新）
  |  -> 详细方法 -> references/feedback-states.md
  |
Step 6: 交互反馈与错误处理
  |  -> 按钮防重复提交（loading + disabled）
  |  -> 表单提交后的反馈路径（成功跳转/失败留页）
  |  -> 全局错误边界（ErrorBoundary）
  |  -> 契约错误码 → UI 错误消息映射
  |  -> 详细方法 -> references/feedback-states.md 错误反馈
  |
Step 7: 测试与自检
  |  -> 组件测试: 关键组件的渲染/Props/状态/事件
  |  -> 交互测试: 核心用户路径的端到端验证
  |  -> 契约消费校验: 前端调用是否匹配 API 契约（字段/类型/必填）
  |  -> 自检清单: 走合格前端实现检查清单（见下方）
  |  -> 详细方法 -> references/testing.md
  |
Step 8: 组件/状态重构（按需）
  |  -> 识别: 重复逻辑 → 抽取自定义 Hook
  |  -> 识别: 臃肿组件 → 拆分子组件
  |  -> 识别: 状态污染 → 隔离 UI 状态与业务状态
  |  -> 识别: 硬编码 → 提取配置/常量
  |  -> 重构后必须跑测试验证无回归
  |
Step 9: 联调交接与输出
     -> 输出前端实现说明文档
     -> 输出已知限制和待确认项
     -> 输出联调清单（接口依赖/Mock 状态/测试账号）
     -> 过质量检查清单
     -> 按模板组织 -> references/templates.md
```

### 标准交付物

```
{project}/frontend/
  implementation-notes.md       # 实现说明（页面清单、组件树、状态方案）
  component-tree.md             # 组件树与 Props 接口
  api-integration.md            # API 接入说明（调用清单、类型定义）
  known-limitations.md          # 已知限制与待确认项
  handoff-checklist.md          # 联调交接清单
  test-coverage.md              # 测试覆盖说明
  src/                          # 源代码
```

---

## 设计深度速查

| 深度 | 适用场景 | 覆盖步骤 | 输出物 |
|------|----------|----------|--------|
| **快速实现** | 单页面/单组件/小改动/Bug修复 | Step 1-3 重点 + 5-6 补齐 | 代码 + 简要说明 |
| **标准开发** | 新模块或重要功能 | 完整 9 步 | 完整交付包（6 文档 + 代码） |
| **深度开发** | 全新产品/大规模重构/复杂交互 | 完整 9 步 + 组件库设计 + 状态架构评审 | 完整交付包 + 组件设计文档 + 重构方案 |

判断不清时向上确认。

---

## 5 层深度边界速查

| 层级 | 主责 | 核心产出 | 边界说明 |
|------|------|---------|---------|
| **需求与体验定义层** | PM / 体验设计专家 | PRD、交互稿、体验地图 | 前端消费输入，不反向篡改设计意图 |
| **接口契约与系统边界层** | API / 架构专家 | 接口文档、系统约束 | 前端消费契约，不自行猜测接口 |
| **前端实现层** | **前端开发专家（核心）** | 页面/组件/状态/表单/列表/异步/错误/路由 | 本 Skill 的全部工作范围 |
| **后端服务实现层** | 后端开发专家 | API 实现、数据层 | 前端只消费不反向主导后端实现 |
| **验证与交付层** | 审查/联调/测试 | 代码审查、联调验证 | 前端为其提供实现层支持与交接文档 |

**铁律**：向上只承接确认的设计和契约，不替体验做交互、不替 API 猜字段。向下只输出代码和文档，不替后端写接口。

---

## 组件拆分原则（速查）

```
组件该不该拆？5 问决策：
  1. 这块逻辑能用一句话说清职责吗？不能 → 拆
  2. 这块逻辑在别处会复用吗？会 → 拆
  3. 这块有独立的数据源/状态吗？有 → 拆
  4. 这块可以独立测试吗？拆出来更好测 → 拆
  5. 这块超过 150 行了吗？超了 → 考虑拆

拆分后检验：
  ✅ 每个组件有清晰的 Props 接口
  ✅ 父子通信通过 Props/Callback，不通过全局状态偷渡
  ✅ 展示组件无副作用，容器组件管数据
  ✅ 命名自解释（不叫 Component1, Wrapper2）
```

-> 详细方法与模式 [references/page-component-design.md](references/page-component-design.md)

---

## 状态管理决策树（速查）

```
这个状态是什么类型？
  |
  |- 服务端数据（API 返回的列表、详情、用户信息）
  |   -> React Query / SWR / RSC 数据获取
  |   -> 不要手动塞进全局 store
  |
  |- UI 临时状态（弹窗开关、Tab 选中、输入框焦点）
  |   -> useState / useReducer（组件内部）
  |   -> 不要放进全局状态
  |
  |- 跨组件共享状态（主题、用户偏好、全局通知）
  |   -> Context（读多写少）/ Zustand（读写频繁）
  |   -> 只在真正需要跨组件时才升级
  |
  |- 表单状态（字段值、校验状态、提交状态）
  |   -> React Hook Form / 受控组件 + useReducer
  |   -> 不要用全局 store 管表单
  |
  +- URL 状态（筛选条件、分页、排序）
      -> URL SearchParams / Next.js useSearchParams
      -> 保持 URL 可分享、可书签
```

-> 详细方案与取舍 [references/state-api-integration.md](references/state-api-integration.md)

---

## 反模式速查

| # | ❌ 错误做法 | ✅ 正确做法 |
|---|-----------|-----------|
| 1 | 一个页面组件塞满所有逻辑（500+ 行） | 按职责拆分：容器/展示/Hook，单组件 < 150 行 |
| 2 | 组件只按视觉外观切分 | 按数据边界 + 行为职责 + 复用性切分 |
| 3 | 用 useState 堆砌异步流程状态 | 用 React Query/SWR 管理服务端状态，用 useReducer 管复杂本地状态 |
| 4 | 接口不清就自己猜字段名和类型 | 向 API 专家确认契约，按契约定义 TypeScript 类型 |
| 5 | 只实现 happy path，无 loading/empty/error | 每个数据展示组件必须处理 5 态（loading/empty/error/success/disabled） |
| 6 | 表单校验只做前端、只做 required | 前后端校验对齐，覆盖格式/范围/业务规则/服务端错误回显 |
| 7 | 为适配临时接口结构污染长期组件模型 | 用适配层（adapter/transformer）隔离接口变化与组件模型 |
| 8 | 复制粘贴组件逻辑到多个页面 | 抽取自定义 Hook 或共享组件，保持单一事实源 |
| 9 | UI 状态和业务状态混在同一个 store | 分层管理：UI 状态在组件内，业务状态在专用层 |
| 10 | 偷偷改变交互语义或假设接口变更不通知 | 交互变更需体验专家确认，接口假设变更需 API 专家确认 |

---

## 合格前端实现检查清单

| # | 检验项 | 通过条件 |
|---|--------|---------|
| 1 | **页面结构清晰** | Layout/Page/Section/Component 层次分明 |
| 2 | **组件边界合理** | 每个组件职责一句话说清，Props 接口明确 |
| 3 | **状态管理得当** | 服务端/客户端/UI/URL 状态分层，无状态污染 |
| 4 | **API 契约一致** | 前端调用的 endpoint/字段/类型与契约文档完全匹配 |
| 5 | **5 态全覆盖** | 每个数据展示组件都处理了 loading/empty/error/success/disabled |
| 6 | **表单校验完整** | 覆盖必填/格式/范围/业务规则，服务端错误能回显 |
| 7 | **交互反馈及时** | 按钮防重复提交，操作有 toast/redirect 反馈 |
| 8 | **错误边界存在** | 有 ErrorBoundary，全局和关键区域都有兜底 |
| 9 | **关键路径有测试** | 核心交互路径有组件测试或交互测试覆盖 |
| 10 | **代码可维护** | 无 500+ 行组件，无复制粘贴逻辑，命名自解释 |
| 11 | **TypeScript 严格** | 无 any 逃逸，API 响应有类型定义 |
| 12 | **联调可交接** | 有实现说明、接口依赖清单、已知限制、联调步骤 |

-> 详细检查清单 [references/checklists.md](references/checklists.md)

---

## 13 大能力方向覆盖索引

| # | 能力方向 | 流程步骤 | 详细参考 |
|---|---------|---------|---------|
| 1 | 页面骨架 | Step 1-2 | references/page-component-design.md 页面骨架 |
| 2 | 组件拆分 | Step 2 | references/page-component-design.md 组件拆分 |
| 3 | API 接入与状态 | Step 3 | references/state-api-integration.md |
| 4 | 表单校验 | Step 4 | references/forms-lists-patterns.md 表单 |
| 5 | 列表/详情/分页 | Step 4 | references/forms-lists-patterns.md 列表 |
| 6 | loading/empty/error/success | Step 5 | references/feedback-states.md 状态覆盖 |
| 7 | 弹窗/确认流 | Step 4+6 | references/forms-lists-patterns.md 弹窗 |
| 8 | 错误反馈 | Step 6 | references/feedback-states.md 错误反馈 |
| 9 | 组件测试 | Step 7 | references/testing.md 组件测试 |
| 10 | 交互测试 | Step 7 | references/testing.md 交互测试 |
| 11 | 组件/状态重构 | Step 8 | references/page-component-design.md 重构 |
| 12 | 契约消费校验 | Step 7 | references/testing.md 契约校验 |
| 13 | 联调交接 | Step 9 | references/templates.md 联调交接 |

---

## 协作接口

### 上游输入

| 来源 | 接收内容 | 使用方式 |
|------|---------|---------|
| 体验设计专家 | 交互稿、体验方案、设计规范 | 忠实实现交互目标 |
| API 设计专家 | 接口契约文档 | 严格按契约消费 |
| 技术架构专家 | 前端分层约束、技术选型 | 在架构约束内实现 |
| 项目管理 | PRD、业务目标 | 理解业务上下文 |

### 下游输出

| 接收方 | 传递内容 | 约束关系 |
|--------|---------|---------|
| 代码审查专家 | 代码 + 实现说明 | 审查对照清单 |
| 后端开发专家 | 联调清单、Mock 说明 | 联调协作 |
| 测试专家 | 测试覆盖说明、交互路径 | 测试补充 |

### 升级规则

| 场景 | 升级给 |
|------|--------|
| 交互设计不清/冲突 | 体验设计专家 |
| 接口字段/语义不明 | API 设计专家 |
| 技术选型/分层约束 | 技术架构专家 |
| 需求模糊/优先级冲突 | 项目管理专家 |

---

## 触发时首要动作

无论如何触发，第一步永远是：

> "体验方案确认了吗？API 契约文档在哪？技术栈和架构约束是什么？有设计稿吗？"

-> 判断开发深度 -> 消化输入 -> 按 9 步流程执行

**教育行业项目**：额外读取 [references/education-frontend.md](references/education-frontend.md) 了解行业特殊适配。
