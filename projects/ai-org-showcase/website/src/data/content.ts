/* Topology node data for the 28 AI roles */

export interface TopoNode {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  ring: 0 | 1 | 2 | 3;
  domain?: string;
  order: number;
  /** Position in SVG viewBox (900x920) */
  x: number;
  y: number;
  /** Radius of circle node */
  r: number;
}

export const topoNodes: TopoNode[] = [
  // L0: Human
  { id: 'boss', emoji: '👤', name: '老板（人类）', desc: '最终决策者', ring: 0, order: 29, x: 450, y: 85, r: 34 },
  // L1: Leader (center)
  { id: 'leader', emoji: '🧧', name: 'Leader', desc: '组织运营，目标定义与调度决策', ring: 1, order: 0, x: 450, y: 480, r: 30 },
  // L2: Ring 2
  { id: 'pm', emoji: '🏗️', name: '项目管理专家', desc: '项目执行调度，指令包组装与上下文管理', ring: 2, order: 1, x: 330, y: 430, r: 24 },
  { id: 'doc', emoji: '📝', name: '技术文档专家', desc: '把混乱信息变成清晰知识体系', ring: 2, order: 2, x: 570, y: 430, r: 24 },
  // L3: Ring 3 — 需求洞察
  { id: 'req', emoji: '🎯', name: '需求分析专家', desc: '将模糊想法变为结构化需求', ring: 3, domain: 'insight', order: 3, x: 215, y: 240, r: 20 },
  { id: 'user', emoji: '🔍', name: '用户研究专家', desc: '用户画像、旅程地图、需求洞察', ring: 3, domain: 'insight', order: 4, x: 250, y: 225, r: 20 },
  { id: 'market', emoji: '📊', name: '市场评估专家', desc: '市场规模、竞争格局、商业可行性', ring: 3, domain: 'insight', order: 5, x: 320, y: 195, r: 20 },
  { id: 'comp', emoji: '🔭', name: '竞品调研专家', desc: '单个竞品深度拆解与策略分析', ring: 3, domain: 'insight', order: 6, x: 400, y: 185, r: 20 },
  // 战略定义
  { id: 'strat', emoji: '🧭', name: '战略定位专家', desc: '战略方向选择与竞争定位', ring: 3, domain: 'strategy', order: 7, x: 490, y: 185, r: 20 },
  { id: 'proddef', emoji: '📐', name: '产品定义专家', desc: '产品形态、功能范围、MVP 界定', ring: 3, domain: 'strategy', order: 8, x: 575, y: 195, r: 20 },
  // 流程角色
  { id: 'process', emoji: '🔩', name: '流程设计专家', desc: '执行流程编排与角色协作设计', ring: 3, domain: 'process', order: 9, x: 650, y: 230, r: 20 },
  { id: 'rolecreate', emoji: '🧬', name: '角色创造专家', desc: 'AI 专家角色创造与团队组建', ring: 3, domain: 'process', order: 10, x: 700, y: 285, r: 20 },
  { id: 'skill', emoji: '🔧', name: 'Skill 开发专家', desc: 'OpenClaw Skill 开发与发布', ring: 3, domain: 'process', order: 11, x: 730, y: 350, r: 20 },
  // 文档调研
  { id: 'research', emoji: '🔬', name: '技术调研专家', desc: '技术选型、可行性评估、方案调研', ring: 3, domain: 'research', order: 12, x: 740, y: 420, r: 20 },
  // 设计
  { id: 'uxdesign', emoji: '🎨', name: '体验设计专家', desc: '信息架构、任务流程、交互模式', ring: 3, domain: 'design', order: 13, x: 735, y: 495, r: 20 },
  { id: 'visualdesign', emoji: '🎨', name: '视觉设计专家', desc: '品牌视觉、配色、排印、设计 Token', ring: 3, domain: 'design', order: 14, x: 720, y: 565, r: 20 },
  // 架构数据
  { id: 'arch', emoji: '🏛️', name: '技术架构专家', desc: '系统分层、模块边界、技术选型', ring: 3, domain: 'arch', order: 15, x: 685, y: 630, r: 20 },
  { id: 'db', emoji: '🗄️', name: '数据库设计专家', desc: '数据建模、表结构、字段字典', ring: 3, domain: 'arch', order: 16, x: 630, y: 690, r: 20 },
  { id: 'api', emoji: '📜', name: 'API 设计专家', desc: '接口契约、错误模型、Mock 输出', ring: 3, domain: 'arch', order: 17, x: 565, y: 730, r: 20 },
  // 开发
  { id: 'backend', emoji: '⚙️', name: '后端开发专家', desc: 'Controller/Service/Repository 全栈实现', ring: 3, domain: 'dev', order: 18, x: 490, y: 755, r: 20 },
  { id: 'frontend', emoji: '🖥️', name: '前端开发专家', desc: '组件、状态管理、全态处理', ring: 3, domain: 'dev', order: 19, x: 405, y: 760, r: 20 },
  // 质量
  { id: 'review', emoji: '🔍', name: '代码审查专家', desc: '代码质量、架构评审、安全审计', ring: 3, domain: 'quality', order: 20, x: 325, y: 745, r: 20 },
  { id: 'integration', emoji: '🔗', name: '联调集成专家', desc: '跨模块契约对齐与端到端验证', ring: 3, domain: 'quality', order: 21, x: 255, y: 710, r: 20 },
  { id: 'test', emoji: '🧪', name: '测试专家', desc: '测试策略、用例设计、发布就绪评估', ring: 3, domain: 'quality', order: 22, x: 200, y: 650, r: 20 },
  // 交付
  { id: 'deploy', emoji: '🚀', name: '部署运维专家', desc: '发布保障、监控告警、回滚方案', ring: 3, domain: 'delivery', order: 23, x: 165, y: 580, r: 20 },
  { id: 'release', emoji: '📦', name: '发布策略专家', desc: '灰度发布、用户培训、变更管理', ring: 3, domain: 'delivery', order: 24, x: 160, y: 505, r: 20 },
  // 运营迭代
  { id: 'growth', emoji: '📈', name: '增长运营专家', desc: '用户获取、激活、留存策略', ring: 3, domain: 'ops', order: 25, x: 165, y: 425, r: 20 },
  { id: 'data', emoji: '📈', name: '数据分析专家', desc: '指标体系、A/B 测试、数据叙事', ring: 3, domain: 'ops', order: 26, x: 175, y: 350, r: 20 },
  { id: 'iterate', emoji: '🔄', name: '迭代优化专家', desc: '优先级裁决、MVP 拆解、止损判断', ring: 3, domain: 'ops', order: 27, x: 200, y: 275, r: 20 },
  // 领域专家
  { id: 'edu', emoji: '📚', name: '教育领域专家', desc: 'K12 课标、教学设计、学习科学', ring: 3, domain: 'domain', order: 28, x: 155, y: 330, r: 20 },
];

/* Domain groups for sequential light-up */
export const domainOrder = [
  'insight', 'strategy', 'process', 'research', 'design',
  'arch', 'dev', 'quality', 'delivery', 'ops', 'domain',
];

/* Timeline steps for Section 3 */
export interface TimelineStep {
  step: number;
  emoji: string;
  role: string;
  action: string;
  detail: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    step: 1, emoji: '👤', role: '老板',
    action: '写了一份设计方案',
    detail: '老板写了一份设计方案。\n不是"做个官网"三个字。是一份完整的叙事策略、视觉哲学、技术方案。\n然后交给了 Leader。',
  },
  {
    step: 2, emoji: '📝', role: '技术文档专家',
    action: '策划全站内容文案',
    detail: '📝 技术文档专家接到任务。\n先搞清楚读者是谁，再决定怎么写。\n7 个叙事区块，每个区块的文案基调、信息密度、情绪曲线——全部结构化输出。',
  },
  {
    step: 3, emoji: '🎨', role: '体验设计专家',
    action: '设计信息架构和交互体验',
    detail: '🎨 体验设计专家接手。\n基于内容文案，设计信息架构、滚动节奏、交互模式、响应式策略。\n不是画线框图。是设计用户的阅读体验。',
  },
  {
    step: 4, emoji: '🎨', role: '视觉设计专家',
    action: '视觉规范与设计 Token',
    detail: '🎨 视觉设计专家定义视觉语言。\n配色系统、字体排印、视觉层次、动效规范——全部量化为设计 Token。\n克制感不是"少用颜色"。是每一个视觉决策都有理由。',
  },
  {
    step: 5, emoji: '🖥️', role: '前端开发专家',
    action: '实现完整页面',
    detail: '🖥️ 前端开发专家实现。\n纯 HTML/CSS/JS，零框架零依赖。一个文件，加载即运行。\n不是"能用就行"。是 Lighthouse 满分级别的工程标准。',
  },
  {
    step: 6, emoji: '🔍', role: '代码审查专家',
    action: '代码质量审查',
    detail: '🔍 代码审查专家逐行审查。\n不是"看看有没有 bug"。是从架构到安全到性能的系统性审查。',
  },
  {
    step: 7, emoji: '🚀', role: '部署运维专家',
    action: '容器化部署 + GitHub',
    detail: '🚀 部署运维专家容器化部署。\n安全头、只读文件系统、资源限制、健康检查——一个都不少。\n产出：Docker 镜像 + Caddy 反向代理 + GitHub 仓库。',
  },
  {
    step: 8, emoji: '🏗️', role: '项目管理专家',
    action: '全程协调 8 位专家',
    detail: '🏗️ 项目管理专家全程协调。\n8 位专家、6 个 Phase、串行依赖链——每个 Phase 的产出是下游的输入。\n不是群发任务等结果。是精确的指令包组装、上下文管理、质量闭环。',
  },
];
