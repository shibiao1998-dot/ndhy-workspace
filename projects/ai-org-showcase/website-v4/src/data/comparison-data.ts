export interface ComparisonItem {
  text: string;
}

export interface ComparisonTag {
  icon: string;
  label: string;
}

export const scatteredAISteps: ComparisonItem[] = [
  { text: '"做个产品官网"' },
  { text: '打开 ChatGPT："帮我写个网站"' },
  { text: '复制一段看起来还行的代码' },
  { text: '不对……重新问一遍，加更多描述' },
  { text: '凑合能用了，没人审查，没人测试' },
  { text: '手动部署，忘记安全配置' },
  { text: '上线了下次改什么都要从头来' },
];

export const aiOrgSteps: ComparisonItem[] = [
  { text: '"做个产品官网"' },
  { text: 'Leader 接收需求，验证价值，定义目标' },
  { text: '需求分析专家深度挖掘，结构化需求' },
  { text: '叙事策略专家论证叙事结构' },
  { text: '技术文档专家策划内容（结构化文案）' },
  { text: '体验设计专家设计交互（信息架构 + 响应式）' },
  { text: '视觉设计专家定义视觉语言（Token 化规范）' },
  { text: '前端开发专家实现（工程级标准）' },
  { text: '代码审查专家审查（系统性质量关卡）' },
  { text: '部署运维专家容器化部署（安全 + 监控）' },
  { text: '上线所有决策和过程都被记忆下次更好' },
];

export const scatteredAITags: ComparisonTag[] = [
  { icon: '❌', label: '没有记忆 — 每次对话都从零开始' },
  { icon: '❌', label: '没有标准 — 质量取决于你的 Prompt 水平' },
  { icon: '❌', label: '没有协作 — 一个模型扮演所有角色' },
  { icon: '❌', label: '没有进化 — 同样的错误可以犯无数次' },
];

export const aiOrgTags: ComparisonTag[] = [
  { icon: '✅', label: '分层记忆 — 价值观永久记忆，项目上下文按需加载，每次纠正立即写入' },
  { icon: '✅', label: '专业标准 — 每个专家有独立的 SOUL.md（信条）+ STANDARDS.md（规范）' },
  { icon: '✅', label: '多专家协作 — 31 个角色各司其职，串行依赖 + 并行执行' },
  { icon: '✅', label: '持续进化 — 同一模式出现 3 次自动提炼规则，同一错误不犯两次' },
];
