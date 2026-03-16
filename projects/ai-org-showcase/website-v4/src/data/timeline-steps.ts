export interface TimelineStep {
  step: number;
  role: string;
  emoji: string;
  title: string;
  output: string;
  detail: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    step: 1,
    role: '老板',
    emoji: '👤',
    title: '需求',
    output: 'design-v3.md',
    detail: '老板写了一份设计方案\n不是"做个官网"三个字\n是一份完整的叙事策略、视觉哲学、技术方案\n然后交给了 Leader',
  },
  {
    step: 2,
    role: '需求分析专家',
    emoji: '🎯',
    title: '需求挖掘',
    output: '结构化需求文档',
    detail: '🎯 需求分析专家接到任务\n先提了 9 个问题\n不是走流程是挖出老板没说出口的隐含需求、逻辑矛盾、风险假设\n"超越所有网站"变成了可检验的三阶段验收标准',
  },
  {
    step: 3,
    role: '叙事策略专家',
    emoji: '📖',
    title: '叙事分析',
    output: '叙事分析报告',
    detail: '📖 叙事策略专家实地对标 Stripe、Linear、Cognition\n逐区块分析叙事功能和情绪曲线\n哪些是世界级的——保留\n哪些有节奏塌陷——修复\n产出：一份用认知心理学论证的叙事分析报告',
  },
  {
    step: 4,
    role: '技术文档专家',
    emoji: '📝',
    title: '内容策划',
    output: '结构化内容文案',
    detail: '📝 技术文档专家策划全站文案\n先搞清楚读者是谁，再决定怎么写\n7 个叙事区块，每个区块的文案基调、信息密度、情绪曲线——全部结构化输出',
  },
  {
    step: 5,
    role: '体验设计专家',
    emoji: '🎨',
    title: '交互设计',
    output: '交互方案文档',
    detail: '🎨 体验设计专家设计阅读体验\n不是画线框图\n是设计每一屏的信息节奏、滚动触发时机、视觉焦点路径',
  },
  {
    step: 6,
    role: '视觉设计专家',
    emoji: '🎨',
    title: '视觉规范',
    output: '视觉规范 + Token',
    detail: '🎨 视觉设计专家定义视觉语言\n克制感不是"少用颜色"是每一个视觉决策都有理由\n所有色值、字号、间距——量化为设计 Token，零裸值',
  },
  {
    step: 7,
    role: '前端开发专家',
    emoji: '🖥️',
    title: '开发实现',
    output: '完整页面',
    detail: '🖥️ 前端开发专家实现\n不是"能用就行"是工程级标准',
  },
  {
    step: 8,
    role: '代码审查专家',
    emoji: '🔍',
    title: '质量审查',
    output: '审查报告',
    detail: '🔍 代码审查专家逐行审查\n从架构到安全到性能的系统性审查\n不放过一个硬编码值，不忽略一个无障碍缺失',
  },
  {
    step: 9,
    role: '部署运维专家',
    emoji: '🚀',
    title: '容器部署',
    output: 'Docker + Caddy',
    detail: '🚀 部署运维专家容器化部署\n安全头、只读文件系统、资源限制、健康检查——一个都不少',
  },
  {
    step: 10,
    role: '项目管理专家',
    emoji: '🏗️',
    title: '全程调度',
    output: '执行拓扑',
    detail: '🏗️ 项目管理专家全程协调\n10 位专家、6 个 Phase、串行依赖链\n每个 Phase 的产出是下游的输入\n不是群发任务等结果是精确的指令包组装、上下文管理、质量闭环',
  },
];
