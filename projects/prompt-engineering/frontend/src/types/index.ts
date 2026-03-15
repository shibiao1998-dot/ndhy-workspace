// types/index.ts — 与 API 响应对齐的类型定义

/** 维度元信息 */
export interface Dimension {
  id: string;
  name: string;
  category: string;
  category_name: string;
  definition: string;
  char_count: number;
  status: 'ready' | 'partial';
  summary: string;
}

/** 类别汇总 */
export interface Category {
  key: string;
  name: string;
  count: number;
}

/** 维度索引响应 */
export interface DimensionsResponse {
  dimensions: Dimension[];
  total: number;
  categories: Category[];
}

/** 任务类型 */
export interface TaskType {
  key: string;
  name: string;
  description: string;
}

/** 任务类型列表响应 */
export interface TaskTypesResponse {
  task_types: TaskType[];
}

/** AI 引擎 */
export interface Engine {
  key: string;
  name: string;
  ai_platform: string;
  max_chars: number;
  format_type: 'markdown' | 'keywords' | 'description';
}

/** 引擎列表响应 */
export interface EnginesResponse {
  engines: Engine[];
}

/** 路由请求 */
export interface RouteRequest {
  task: string;
  task_type?: string | null;
}

/** 路由响应 */
export interface RouteResponse {
  task_type: string;
  task_type_name: string;
  confidence: number;
  is_manual_override: boolean;
  required: string[];
  recommended: string[];
  optional: string[];
  total_chars: number;
}

/** 生成请求 */
export interface GenerateRequest {
  task: string;
  engine: string;
  dimensions: string[];
  priorities: Record<string, 1 | 2 | 3>;
}

/** 覆盖统计 */
export interface CoverageStats {
  total_chars: number;
  dimensions_used: number;
  dimensions_total: number;
  coverage_percent: number;
  by_level: {
    required_count: number;
    recommended_count: number;
    optional_count: number;
  };
  missing_required: string[];
  truncated_dimensions: string[];
}

/** 生成响应 */
export interface GenerateResponse {
  prompt: string;
  stats: CoverageStats;
}

/** 重新加载响应 */
export interface ReloadResponse {
  dimensions_count: number;
  categories_count: number;
  loaded_at: string;
}

/** 统一错误响应 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    suggestion: string;
  };
}

/** 维度配置项（前端状态） */
export interface DimensionConfig {
  id: string;
  checked: boolean;
  priority: 1 | 2 | 3;
}
