// api/client.ts — API 调用封装 + Mock 数据开关

import type {
  DimensionsResponse,
  TaskTypesResponse,
  EnginesResponse,
  RouteRequest,
  RouteResponse,
  GenerateRequest,
  GenerateResponse,
  ReloadResponse,
  ErrorResponse,
} from '../types';

// ===================== Mock 开关 =====================
// 设为 true 则使用 Mock 数据，不依赖后端
const USE_MOCK = false;

// ===================== API Error =====================
export class ApiError extends Error {
  public status: number;
  public code: string;
  public suggestion: string;

  constructor(status: number, code: string, message: string, suggestion: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.suggestion = suggestion;
  }
}

// ===================== Real API =====================
const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json();
    throw new ApiError(
      response.status,
      errorBody.error.code,
      errorBody.error.message,
      errorBody.error.suggestion
    );
  }

  return response.json();
}

// ===================== Mock Data =====================
const MOCK_DIMENSIONS: DimensionsResponse = {
  dimensions: [
    { id: 'A01', name: '战略核心方向', category: 'A', category_name: '战略与价值观', definition: '定义公司/产品的战略核心方向和使命宣言', char_count: 4200, status: 'ready', summary: '华渔教育的战略核心方向聚焦于利用3D/VR/AR/AI技术构建全球领先的教育平台。核心使命：让每个孩子都能享受到优质的教育资源。' },
    { id: 'A02', name: '红线与禁区', category: 'A', category_name: '战略与价值观', definition: '明确不可逾越的底线和绝对不做的事情', char_count: 1500, status: 'ready', summary: '华渔教育的绝对红线包括：❌ 不做大模型研发（使用现有AI引擎）❌ 不涉及学生个人隐私数据的商业化 ❌ 不做与教育无关的业务扩展' },
    { id: 'A03', name: '品牌定位', category: 'A', category_name: '战略与价值观', definition: '品牌在目标市场中的位置和差异化定位', char_count: 3100, status: 'ready', summary: '华渔教育品牌定位为"AI驱动的教育科技领先者"。核心差异化：依托网龙集团的3D/VR/AR技术积累，结合AI能力打造沉浸式教育体验。' },
    { id: 'A04', name: '核心能力定义', category: 'A', category_name: '战略与价值观', definition: '组织的核心竞争能力和独特优势', char_count: 2800, status: 'ready', summary: '华渔教育的核心能力包括：3D/VR/AR 技术积累超过15年、全球教育资源覆盖、AI教育应用深度整合。' },
    { id: 'A05', name: '长期愿景', category: 'A', category_name: '战略与价值观', definition: '组织3-5年的发展愿景和里程碑', char_count: 2200, status: 'ready', summary: '华渔教育长期愿景：到2028年成为全球Top3的AI教育解决方案提供商。' },
    { id: 'A06', name: '价值排序', category: 'A', category_name: '战略与价值观', definition: '当多个价值冲突时的优先级排序', char_count: 1800, status: 'ready', summary: '价值排序：教育质量 > 技术先进性 > 商业收益 > 市场规模。当出现冲突时，永远以教育质量为第一优先级。' },
    { id: 'A07', name: '文化准则', category: 'A', category_name: '战略与价值观', definition: '组织文化和行为准则', char_count: 1600, status: 'ready', summary: '华渔教育文化准则：用户第一、创新驱动、开放协作、结果导向。鼓励试错和快速迭代。' },
    { id: 'A08', name: '行业认知', category: 'A', category_name: '战略与价值观', definition: '对教育行业趋势和规律的认知', char_count: 3200, status: 'ready', summary: '教育行业认知：K12教育数字化转型加速，AI+教育是确定性趋势，但落地需要尊重教育规律。' },
    { id: 'B01', name: '核心用户画像', category: 'B', category_name: '用户真实性', definition: '基于真实数据的核心目标用户画像', char_count: 5100, status: 'ready', summary: '华渔教育核心用户画像分为四类：1）一线教师（占60%）：30-50岁，本科学历 2）教研组长（占20%）：负责教学管理' },
    { id: 'B02', name: '用户痛点清单', category: 'B', category_name: '用户真实性', definition: '用户在实际工作场景中遇到的痛点', char_count: 3600, status: 'ready', summary: '教师核心痛点：备课耗时长、个性化教学难、实验资源不足、评估反馈滞后。' },
    { id: 'B03', name: '用户行为数据', category: 'B', category_name: '用户真实性', definition: '用户实际使用行为的数据分析', char_count: 2900, status: 'ready', summary: '用户行为数据：平均日活时长28分钟，高峰使用时段为工作日8:00-11:00和14:00-17:00。' },
    { id: 'B04', name: '用户能力分层', category: 'B', category_name: '用户真实性', definition: '不同用户群体的技术能力分层', char_count: 2100, status: 'ready', summary: '用户技术能力分层：初级用户（40%）仅会基础操作，中级用户（45%）能使用高级功能，高级用户（15%）能自定义配置。' },
    { id: 'B05', name: '用户反馈原声', category: 'B', category_name: '用户真实性', definition: '真实用户的反馈意见和原声记录', char_count: 4200, status: 'partial', summary: '⚠️ 待填充：用户反馈原声需从客服系统和调研访谈中收集。已有框架包括NPS调查数据和典型客诉分类。' },
    { id: 'C01', name: '直接竞品分析', category: 'C', category_name: '竞品与差异化', definition: '直接竞争对手的产品策略和市场表现分析', char_count: 3800, status: 'ready', summary: '直接竞品分析覆盖三家主要竞争者：1）好未来-学而思 2）科大讯飞 3）猿辅导' },
    { id: 'C02', name: '差异化优势', category: 'C', category_name: '竞品与差异化', definition: '相对竞品的核心差异化优势', char_count: 2400, status: 'ready', summary: '华渔教育差异化优势：3D/VR沉浸式体验、全球教育资源覆盖、AI+硬件生态整合。' },
    { id: 'D01', name: '教师备课场景', category: 'D', category_name: '场景与需求', definition: '教师日常备课的典型工作场景', char_count: 3200, status: 'ready', summary: '教师备课场景：学科教师在办公室环境中，利用平台工具准备课件、实验方案和教学设计。' },
    { id: 'D02', name: '课堂教学场景', category: 'D', category_name: '场景与需求', definition: '课堂教学中的典型使用场景', char_count: 2800, status: 'ready', summary: '课堂教学场景：教师在教室环境中，利用智慧教育平台进行互动教学、实验演示和实时评估。' },
    { id: 'D07', name: '需求场景完整性', category: 'D', category_name: '场景与需求', definition: '确保需求场景覆盖完整的检查方法', char_count: 1900, status: 'ready', summary: '需求场景完整性检查：覆盖用户旅程全链路（发现→学习→使用→反馈）确保无盲区。' },
    { id: 'E01', name: 'DJ七步设计法', category: 'E', category_name: '设计方法与技巧', definition: 'DJ独创的七步设计方法论流程', char_count: 5200, status: 'ready', summary: 'DJ七步设计法覆盖从需求到交付的完整流程：Step 1 需求拆解→Step 2 竞品扫描→Step 3 用户验证→Step 4 方案设计...' },
    { id: 'E11', name: '原型设计规范', category: 'E', category_name: '设计方法与技巧', definition: '原型设计的标准规范和最佳实践', char_count: 3400, status: 'ready', summary: '原型设计规范：低保真→中保真→高保真三阶段迭代，每阶段有明确的交付标准和验收检查点。' },
    { id: 'F01', name: '技术可行性评估', category: 'F', category_name: '可行性与资源', definition: '技术方案的可行性评估框架', char_count: 2600, status: 'ready', summary: '技术可行性评估框架：技术成熟度、团队能力匹配度、基础设施支撑、时间约束四维度评估。' },
    { id: 'G01', name: '成功案例库', category: 'G', category_name: '历史经验与案例', definition: '历史成功项目的案例分析', char_count: 3500, status: 'ready', summary: '成功案例库：VR物理实验室项目（覆盖100+学校）、AI作文批改系统（日均处理5万篇）等。' },
    { id: 'G03', name: '同业案例', category: 'G', category_name: '历史经验与案例', definition: '同行业其他公司的成功/失败案例参考', char_count: 2800, status: 'partial', summary: '⚠️ 待填充：同业案例部分信息需进一步收集。已有框架包括：好未来AI课堂案例分析。' },
    { id: 'H01', name: '平台设计规范', category: 'H', category_name: '设计标准与规范', definition: '平台级的设计规范和标准', char_count: 4100, status: 'ready', summary: '平台设计规范：统一的设计语言、组件库、交互模式和视觉风格。基于Ant Design体系定制。' },
    { id: 'H02', name: '交互设计规范', category: 'H', category_name: '设计标准与规范', definition: '交互设计的标准规范', char_count: 2900, status: 'ready', summary: '交互设计规范：操作反馈时间≤200ms、表单校验即时反馈、错误信息具体可执行。' },
    { id: 'I01', name: '产品质量标准', category: 'I', category_name: '质量判断与检查', definition: '产品交付的质量标准定义', char_count: 3000, status: 'ready', summary: '产品质量标准：功能完整性≥95%、可用性测试通过率≥90%、性能指标达标率100%。' },
    { id: 'I04', name: '原型质量检查', category: 'I', category_name: '质量判断与检查', definition: '原型交付的质量检查清单', char_count: 2200, status: 'ready', summary: '原型质量检查：信息架构完整性、交互逻辑自洽性、视觉一致性、可用性基线。' },
    { id: 'J01', name: 'K12教育政策', category: 'J', category_name: '特殊领域知识', definition: 'K12教育相关的政策法规', char_count: 3100, status: 'ready', summary: 'K12教育政策：双减政策、新课标要求、教育信息化2.0行动计划、数据安全管理办法。' },
    { id: 'K01', name: '产品术语表', category: 'K', category_name: '专有名词与定义', definition: '产品相关的专有名词标准定义', char_count: 2400, status: 'ready', summary: '产品术语表：【虚拟实验】利用3D/VR技术模拟真实实验操作的数字化教学工具。【AI课堂】集成AI辅助教学功能的在线课堂系统。' },
    { id: 'K02', name: '技术术语表', category: 'K', category_name: '专有名词与定义', definition: '技术相关的专有名词标准定义', char_count: 1800, status: 'ready', summary: '技术术语表：【LLM】大语言模型、【RAG】检索增强生成、【Agent】AI智能体。' },
    { id: 'L01', name: '项目启动流程', category: 'L', category_name: '项目全生命周期', definition: '项目启动阶段的标准流程', char_count: 2100, status: 'ready', summary: '项目启动流程：需求收集→可行性评估→立项审批→团队组建→Kick-off会议。' },
    { id: 'L02', name: '迭代管理规范', category: 'L', category_name: '项目全生命周期', definition: '项目迭代管理的标准规范', char_count: 1800, status: 'ready', summary: '迭代管理规范：2周一个Sprint，含需求评审、开发、测试、发布、回顾五个环节。' },
  ],
  total: 89,
  categories: [
    { key: 'A', name: '战略与价值观', count: 8 },
    { key: 'B', name: '用户真实性', count: 12 },
    { key: 'C', name: '竞品与差异化', count: 6 },
    { key: 'D', name: '场景与需求', count: 7 },
    { key: 'E', name: '设计方法与技巧', count: 16 },
    { key: 'F', name: '可行性与资源', count: 5 },
    { key: 'G', name: '历史经验与案例', count: 5 },
    { key: 'H', name: '设计标准与规范', count: 7 },
    { key: 'I', name: '质量判断与检查', count: 8 },
    { key: 'J', name: '特殊领域知识', count: 9 },
    { key: 'K', name: '专有名词与定义', count: 6 },
    { key: 'L', name: '项目全生命周期', count: 10 },
  ],
};

const MOCK_TASK_TYPES: TaskTypesResponse = {
  task_types: [
    { key: 'core_value', name: '核心价值编写', description: '适用于核心价值定义、价值主张提炼等战略类任务' },
    { key: 'design_methodology', name: '设计方法论编写', description: '适用于设计方法论梳理、竞品分析方法等方法论类任务' },
    { key: 'prototype', name: '原型设计', description: '适用于交互设计、界面原型、UI方案等设计类任务' },
    { key: 'product_planning', name: '产品策划', description: '适用于产品规划、需求分析、策划方案等策划类任务' },
    { key: 'ai_programming', name: 'AI 编程', description: '适用于AI辅助编程、代码开发等技术类任务' },
    { key: 'ai_art', name: 'AI 美术', description: '适用于AI辅助美术设计、视觉创作、3D建模等视觉类任务' },
    { key: 'ai_marketing', name: 'AI Marketing', description: '适用于AI辅助营销推广、市场策略等营销类任务' },
    { key: 'general', name: '通用设计任务', description: '无法明确匹配到特定类型时的通用设计任务' },
  ],
};

const MOCK_ENGINES: EnginesResponse = {
  engines: [
    { key: 'claude', name: 'Claude', ai_platform: 'Anthropic Claude 3.5 Sonnet', max_chars: 180000, format_type: 'markdown' },
    { key: 'gpt4', name: 'GPT-4', ai_platform: 'OpenAI GPT-4o', max_chars: 120000, format_type: 'markdown' },
    { key: 'deepseek', name: 'DeepSeek', ai_platform: 'DeepSeek V3', max_chars: 60000, format_type: 'markdown' },
    { key: 'midjourney', name: 'Midjourney', ai_platform: 'Midjourney v6', max_chars: 4000, format_type: 'keywords' },
    { key: 'dall_e', name: 'DALL-E', ai_platform: 'OpenAI DALL-E 3', max_chars: 4000, format_type: 'keywords' },
    { key: 'suno', name: 'Suno', ai_platform: 'Suno v4', max_chars: 2000, format_type: 'description' },
  ],
};

function mockRoute(data: RouteRequest): RouteResponse {
  const dimensionIds = MOCK_DIMENSIONS.dimensions.map((d) => d.id);
  // Simple keyword matching for mock
  const task = data.task.toLowerCase();
  let taskType = 'general';
  let taskTypeName = '通用设计任务';
  let confidence = 0.3;

  if (data.task_type) {
    const found = MOCK_TASK_TYPES.task_types.find((t) => t.key === data.task_type);
    if (found) {
      taskType = found.key;
      taskTypeName = found.name;
      confidence = 1.0;
    }
  } else {
    if (task.includes('原型') || task.includes('交互') || task.includes('界面') || task.includes('ui')) {
      taskType = 'prototype';
      taskTypeName = '原型设计';
      confidence = 0.85;
    } else if (task.includes('策划') || task.includes('规划') || task.includes('产品')) {
      taskType = 'product_planning';
      taskTypeName = '产品策划';
      confidence = 0.78;
    } else if (task.includes('编程') || task.includes('代码') || task.includes('开发')) {
      taskType = 'ai_programming';
      taskTypeName = 'AI 编程';
      confidence = 0.82;
    } else if (task.includes('美术') || task.includes('设计') || task.includes('视觉')) {
      taskType = 'ai_art';
      taskTypeName = 'AI 美术';
      confidence = 0.75;
    }
  }

  // Build dimension groups from available mock dimensions
  const required = dimensionIds.filter((id) => id.startsWith('E') || id.startsWith('H') || id.startsWith('I'));
  const recommended = dimensionIds.filter((id) => id.startsWith('G') || id.startsWith('D') || id.startsWith('C'));
  const optional = dimensionIds.filter((id) => id.startsWith('A') || id.startsWith('B') || id.startsWith('K') || id.startsWith('L') || id.startsWith('F') || id.startsWith('J'));
  const allIds = [...required, ...recommended, ...optional];
  const totalChars = allIds.reduce((sum, id) => {
    const dim = MOCK_DIMENSIONS.dimensions.find((d) => d.id === id);
    return sum + (dim?.char_count ?? 0);
  }, 0);

  return {
    task_type: taskType,
    task_type_name: taskTypeName,
    confidence,
    is_manual_override: !!data.task_type,
    required,
    recommended,
    optional,
    total_chars: totalChars,
  };
}

function mockGenerate(data: GenerateRequest): GenerateResponse {
  const dims = data.dimensions
    .map((id) => MOCK_DIMENSIONS.dimensions.find((d) => d.id === id))
    .filter(Boolean);

  const byLevel = { required_count: 0, recommended_count: 0, optional_count: 0 };
  for (const id of data.dimensions) {
    const p = data.priorities[id];
    if (p === 1) byLevel.required_count++;
    else if (p === 2) byLevel.recommended_count++;
    else if (p === 3) byLevel.optional_count++;
  }

  const totalChars = dims.reduce((sum, d) => sum + (d?.char_count ?? 0), 0);

  // Build mock prompt
  const requiredDims = data.dimensions.filter((id) => data.priorities[id] === 1);
  const recommendedDims = data.dimensions.filter((id) => data.priorities[id] === 2);
  const optionalDims = data.dimensions.filter((id) => data.priorities[id] === 3);

  const buildSection = (ids: string[], level: string) => {
    return ids.map((id) => {
      const dim = MOCK_DIMENSIONS.dimensions.find((d) => d.id === id);
      if (!dim) return '';
      return `### ${dim.id} ${dim.name}\n${dim.summary}\n`;
    }).join('\n');
  };

  const prompt = `你是一名专业的设计师。以下是你执行任务时必须参考的关键信息维度，按重要性从高到低排列。请基于这些信息完成用户的任务。

【用户任务】
${data.task}

【关键信息维度】

## 一级：必须参考

${buildSection(requiredDims, '一级')}

## 二级：建议参考

${buildSection(recommendedDims, '二级')}

## 三级：可选参考

${buildSection(optionalDims, '三级')}

【约束与禁忌】
- ❌ 不做大模型研发（使用现有AI引擎）
- ❌ 不涉及学生个人隐私数据的商业化
- 禁止直接复制竞品界面设计`;

  return {
    prompt,
    stats: {
      total_chars: totalChars,
      dimensions_used: data.dimensions.length,
      dimensions_total: 26,
      coverage_percent: Math.min(100, Math.round((data.dimensions.length / 26) * 1000) / 10),
      by_level: byLevel,
      missing_required: [],
      truncated_dimensions: [],
    },
  };
}

// ===================== Mock delay helper =====================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===================== Exported API functions =====================
export async function getDimensions(): Promise<DimensionsResponse> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_DIMENSIONS;
  }
  return request<DimensionsResponse>('/dimensions');
}

export async function getTaskTypes(): Promise<TaskTypesResponse> {
  if (USE_MOCK) {
    await delay(100);
    return MOCK_TASK_TYPES;
  }
  return request<TaskTypesResponse>('/task-types');
}

export async function getEngines(): Promise<EnginesResponse> {
  if (USE_MOCK) {
    await delay(100);
    return MOCK_ENGINES;
  }
  return request<EnginesResponse>('/engines');
}

export async function postRoute(data: RouteRequest): Promise<RouteResponse> {
  if (USE_MOCK) {
    await delay(400);
    return mockRoute(data);
  }
  return request<RouteResponse>('/route', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function postGenerate(data: GenerateRequest): Promise<GenerateResponse> {
  if (USE_MOCK) {
    await delay(800);
    return mockGenerate(data);
  }
  return request<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function postReload(): Promise<ReloadResponse> {
  if (USE_MOCK) {
    await delay(500);
    return { dimensions_count: 89, categories_count: 12, loaded_at: new Date().toISOString() };
  }
  return request<ReloadResponse>('/reload', { method: 'POST' });
}
