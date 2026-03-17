export interface TeamMember {
  emoji: string;
  name: string;
  description: string;
  level: 'L0' | 'L1' | 'L2' | 'L3';
  domain: string;
  rank: number;  // P0-P12 proficiency level
}

/** Map rank number (0-12) to badge tier token name */
export function rankToTier(rank: number): 'junior' | 'mid' | 'senior' | 'master' {
  if (rank <= 3) return 'junior';
  if (rank <= 6) return 'mid';
  if (rank <= 9) return 'senior';
  return 'master';
}

export const teamMembers: TeamMember[] = [
  // L0 — 人类层
  { emoji: '👤', name: '老板（人类）', description: '战略决策与方向把控', level: 'L0', domain: '人类层', rank: 12 },
  // L1 — 组织核心
  { emoji: '🧧', name: 'Leader', description: '组织运营，目标定义与调度决策', level: 'L1', domain: '组织核心', rank: 10 },
  // L2 — 项目调度
  { emoji: '🏗️', name: '项目管理专家', description: '项目执行调度，指令包组装与上下文管理', level: 'L2', domain: '项目调度', rank: 8 },
  // L3 — 需求洞察
  { emoji: '🎯', name: '需求分析专家', description: '将模糊想法变为结构化需求', level: 'L3', domain: '需求洞察', rank: 7 },
  { emoji: '🔍', name: '用户研究专家', description: '用户画像、旅程地图、需求洞察', level: 'L3', domain: '需求洞察', rank: 5 },
  { emoji: '📊', name: '市场评估专家', description: '市场规模、竞争格局、商业可行性', level: 'L3', domain: '需求洞察', rank: 5 },
  { emoji: '🔭', name: '竞品调研专家', description: '单个竞品深度拆解与策略分析', level: 'L3', domain: '需求洞察', rank: 4 },
  // L3 — 战略与定义
  { emoji: '🧭', name: '战略定位专家', description: '战略方向选择与竞争定位', level: 'L3', domain: '战略与定义', rank: 7 },
  { emoji: '📐', name: '产品定义专家', description: '产品形态、功能范围、MVP 界定', level: 'L3', domain: '战略与定义', rank: 7 },
  // L3 — 流程与角色
  { emoji: '🔩', name: '流程设计专家', description: '执行流程编排与角色协作设计', level: 'L3', domain: '流程与角色', rank: 6 },
  { emoji: '🧬', name: '角色创造专家', description: 'AI 专家角色创造与团队组建', level: 'L3', domain: '流程与角色', rank: 6 },
  { emoji: '🔧', name: 'Skill 开发专家', description: 'OpenClaw Skill 开发与发布', level: 'L3', domain: '流程与角色', rank: 5 },
  { emoji: '🏛️', name: '组织设计专家', description: '组织架构设计与治理模型', level: 'L3', domain: '流程与角色', rank: 6 },
  // L3 — 文档与调研
  { emoji: '📝', name: '技术文档专家', description: '把混乱信息变成清晰知识体系', level: 'L3', domain: '文档与调研', rank: 5 },
  { emoji: '🔬', name: '技术调研专家', description: '技术选型、可行性评估、方案调研', level: 'L3', domain: '文档与调研', rank: 6 },
  // L3 — 叙事与品牌
  { emoji: '📖', name: '叙事策略专家', description: '叙事结构设计与品牌故事策略', level: 'L3', domain: '叙事与品牌', rank: 5 },
  // L3 — 设计
  { emoji: '🎨', name: '体验设计专家', description: '信息架构、任务流程、交互模式', level: 'L3', domain: '设计', rank: 7 },
  { emoji: '🎨', name: '视觉设计专家', description: '品牌视觉、配色、排印、设计 Token', level: 'L3', domain: '设计', rank: 7 },
  { emoji: '🖌️', name: 'UI 设计专家', description: '界面组件设计与设计系统执行', level: 'L3', domain: '设计', rank: 6 },
  // L3 — 架构与数据
  { emoji: '🏛️', name: '技术架构专家', description: '系统分层、模块边界、技术选型', level: 'L3', domain: '架构与数据', rank: 8 },
  { emoji: '🗄️', name: '数据库设计专家', description: '数据建模、表结构、字段字典', level: 'L3', domain: '架构与数据', rank: 6 },
  { emoji: '📜', name: 'API 设计专家', description: '接口契约、错误模型、Mock 输出', level: 'L3', domain: '架构与数据', rank: 6 },
  // L3 — 开发
  { emoji: '⚙️', name: '后端开发专家', description: 'Controller/Service/Repository 全栈实现', level: 'L3', domain: '开发', rank: 7 },
  { emoji: '🖥️', name: '前端开发专家', description: '组件、状态管理、全态处理', level: 'L3', domain: '开发', rank: 7 },
  // L3 — 质量
  { emoji: '🔍', name: '代码审查专家', description: '代码质量、架构评审、安全审计', level: 'L3', domain: '质量', rank: 7 },
  { emoji: '🔗', name: '联调集成专家', description: '跨模块契约对齐与端到端验证', level: 'L3', domain: '质量', rank: 5 },
  { emoji: '🧪', name: '测试专家', description: '测试策略、用例设计、发布就绪评估', level: 'L3', domain: '质量', rank: 6 },
  // L3 — 交付
  { emoji: '🚀', name: '部署运维专家', description: '发布保障、监控告警、回滚方案', level: 'L3', domain: '交付', rank: 5 },
  { emoji: '📦', name: '发布策略专家', description: '灰度发布、用户培训、变更管理', level: 'L3', domain: '交付', rank: 4 },
  // L3 — 运营与迭代
  { emoji: '📈', name: '增长运营专家', description: '用户获取、激活、留存策略', level: 'L3', domain: '运营与迭代', rank: 5 },
  { emoji: '📈', name: '数据分析专家', description: '指标体系、A/B 测试、数据叙事', level: 'L3', domain: '运营与迭代', rank: 5 },
  { emoji: '🔄', name: '迭代优化专家', description: '优先级裁决、MVP 拆解、止损判断', level: 'L3', domain: '运营与迭代', rank: 5 },
  // L3 — 领域
  { emoji: '📚', name: '教育领域专家', description: 'K12 课标、教学设计、学习科学', level: 'L3', domain: '领域', rank: 3 },
];

export const domains = [
  '需求洞察', '战略与定义', '流程与角色', '文档与调研',
  '叙事与品牌', '设计', '架构与数据', '开发', '质量', '交付', '运营与迭代', '领域',
];

export function getMembersByLevel(level: TeamMember['level']): TeamMember[] {
  return teamMembers.filter(m => m.level === level);
}

export function getMembersByDomain(domain: string): TeamMember[] {
  return teamMembers.filter(m => m.domain === domain);
}
