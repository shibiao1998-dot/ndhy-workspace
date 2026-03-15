# 前端开发 — 9步标准流程

## 与已有 Skill 的关系

- `react-best-practices`（性能优化）：提供 57 条 React/Next.js **性能层**规则 → 本 Skill 消费其性能规则
- `frontend-development`（本 Skill）：聚焦**实现工程层** — 页面结构、组件架构、状态管理、API 集成、业务模式、测试、交接
- 设计指南（视觉风格/排版/配色/动效）已合并至 [design-guidelines.md](design-guidelines.md)

## 流程总览

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

## 标准交付物

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

## 5层深度边界速查

| 层级 | 主责 | 核心产出 | 边界说明 |
|------|------|---------|---------|
| **需求与体验定义层** | PM / 体验设计专家 | PRD、交互稿、体验地图 | 前端消费输入，不反向篡改设计意图 |
| **接口契约与系统边界层** | API / 架构专家 | 接口文档、系统约束 | 前端消费契约，不自行猜测接口 |
| **前端实现层** | **前端开发专家（核心）** | 页面/组件/状态/表单/列表/异步/错误/路由 | 本 Skill 的全部工作范围 |
| **后端服务实现层** | 后端开发专家 | API 实现、数据层 | 前端只消费不反向主导后端实现 |
| **验证与交付层** | 审查/联调/测试 | 代码审查、联调验证 | 前端为其提供实现层支持与交接文档 |

**铁律**：向上只承接确认的设计和契约，不替体验做交互、不替 API 猜字段。向下只输出代码和文档，不替后端写接口。

## 组件拆分原则

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

-> 详细方法与模式 [page-component-design.md](page-component-design.md)

## 状态管理决策树

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

-> 详细方案与取舍 [state-api-integration.md](state-api-integration.md)

## 13大能力方向覆盖索引

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

## 触发时首要动作

无论如何触发，第一步永远是：

> "体验方案确认了吗？API 契约文档在哪？技术栈和架构约束是什么？有设计稿吗？"

-> 判断开发深度 -> 消化输入 -> 按 9 步流程执行

**教育行业项目**：额外读取 [references/education-frontend.md](references/education-frontend.md) 了解行业特殊适配。
