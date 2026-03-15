// hooks/usePromptEngine.ts — 核心状态管理 Hook

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  Dimension,
  Engine,
  TaskType,
  RouteResponse,
  GenerateResponse,
  DimensionConfig,
} from '../types';
import {
  getDimensions,
  getEngines,
  getTaskTypes,
  postRoute,
  postGenerate,
  ApiError,
} from '../api/client';

// ===================== 状态类型 =====================
export type InitStatus = 'loading' | 'success' | 'error';
export type RouteStatus = 'idle' | 'loading' | 'success' | 'error';
export type GenerateStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PromptEngineState {
  // 初始化
  initStatus: InitStatus;
  initError: string | null;

  // 基础数据
  dimensions: Dimension[];
  engines: Engine[];
  taskTypes: TaskType[];

  // 用户输入
  task: string;
  selectedEngine: string;

  // 路由
  routeStatus: RouteStatus;
  routeResult: RouteResponse | null;
  routeError: string | null;

  // 维度配置
  dimensionConfigs: Map<string, DimensionConfig>;

  // 生成
  generateStatus: GenerateStatus;
  generateResult: GenerateResponse | null;
  generateError: string | null;

  // 引擎切换提示
  engineChanged: boolean;
}

export interface PromptEngineActions {
  setTask: (task: string) => void;
  setSelectedEngine: (engine: string) => void;
  triggerRoute: (taskTypeOverride?: string | null) => void;
  toggleDimension: (id: string) => void;
  cyclePriority: (id: string) => void;
  triggerGenerate: () => void;
  retry: () => void;
}

export function usePromptEngine(): PromptEngineState & PromptEngineActions {
  // ===================== 基础数据 =====================
  const [initStatus, setInitStatus] = useState<InitStatus>('loading');
  const [initError, setInitError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);

  // ===================== 用户输入 =====================
  const [task, setTask] = useState('');
  const [selectedEngine, setSelectedEngineState] = useState('claude');

  // ===================== 路由 =====================
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const lastRoutedTask = useRef('');

  // ===================== 维度配置 =====================
  const [dimensionConfigs, setDimensionConfigs] = useState<Map<string, DimensionConfig>>(new Map());

  // ===================== 生成 =====================
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>('idle');
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // ===================== 引擎切换标记 =====================
  const [engineChanged, setEngineChanged] = useState(false);

  // ===================== 初始化 =====================
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [dimRes, engRes, ttRes] = await Promise.all([
          getDimensions(),
          getEngines(),
          getTaskTypes(),
        ]);
        if (cancelled) return;
        setDimensions(dimRes.dimensions);
        setEngines(engRes.engines);
        setTaskTypes(ttRes.task_types);
        setInitStatus('success');
      } catch (err) {
        if (cancelled) return;
        setInitError(err instanceof Error ? err.message : '系统初始化失败');
        setInitStatus('error');
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // ===================== 从路由结果构建维度配置 =====================
  const buildDimensionConfigs = useCallback((route: RouteResponse) => {
    const configs = new Map<string, DimensionConfig>();
    for (const id of route.required) {
      configs.set(id, { id, checked: true, priority: 1 });
    }
    for (const id of route.recommended) {
      configs.set(id, { id, checked: true, priority: 2 });
    }
    for (const id of route.optional) {
      configs.set(id, { id, checked: false, priority: 3 });
    }
    setDimensionConfigs(configs);
  }, []);

  // ===================== 路由触发 =====================
  const triggerRoute = useCallback(
    async (taskTypeOverride?: string | null) => {
      const currentTask = task.trim();
      if (!currentTask) return;
      // 如果没有手动指定类型，且任务文本没变，跳过
      if (!taskTypeOverride && currentTask === lastRoutedTask.current && routeResult) return;

      setRouteStatus('loading');
      setRouteError(null);
      try {
        const result = await postRoute({
          task: currentTask,
          task_type: taskTypeOverride ?? null,
        });
        lastRoutedTask.current = currentTask;
        setRouteResult(result);
        setRouteStatus('success');
        buildDimensionConfigs(result);
        // 清除之前的生成结果
        setGenerateResult(null);
        setGenerateStatus('idle');
        setGenerateError(null);
        setEngineChanged(false);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : '匹配失败，请重试';
        setRouteError(msg);
        setRouteStatus('error');
      }
    },
    [task, routeResult, buildDimensionConfigs]
  );

  // ===================== 引擎切换 =====================
  const setSelectedEngine = useCallback(
    (engine: string) => {
      setSelectedEngineState(engine);
      if (generateResult) {
        setEngineChanged(true);
      }
    },
    [generateResult]
  );

  // ===================== 维度操作 =====================
  const toggleDimension = useCallback((id: string) => {
    setDimensionConfigs((prev) => {
      const next = new Map(prev);
      const config = next.get(id);
      if (config) {
        next.set(id, { ...config, checked: !config.checked });
      }
      return next;
    });
  }, []);

  const cyclePriority = useCallback((id: string) => {
    setDimensionConfigs((prev) => {
      const next = new Map(prev);
      const config = next.get(id);
      if (config) {
        const nextPriority = config.priority === 1 ? 2 : config.priority === 2 ? 3 : 1;
        next.set(id, { ...config, priority: nextPriority as 1 | 2 | 3 });
      }
      return next;
    });
  }, []);

  // ===================== 生成 =====================
  const triggerGenerate = useCallback(async () => {
    const checkedDims = Array.from(dimensionConfigs.values()).filter((c) => c.checked);
    if (!task.trim() || checkedDims.length === 0) return;

    const priorities: Record<string, 1 | 2 | 3> = {};
    const dimIds: string[] = [];
    for (const c of checkedDims) {
      dimIds.push(c.id);
      priorities[c.id] = c.priority;
    }

    setGenerateStatus('loading');
    setGenerateError(null);
    setEngineChanged(false);
    try {
      const result = await postGenerate({
        task: task.trim(),
        engine: selectedEngine,
        dimensions: dimIds,
        priorities,
      });
      setGenerateResult(result);
      setGenerateStatus('success');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '生成失败，请稍后重试';
      setGenerateError(msg);
      setGenerateStatus('error');
    }
  }, [task, selectedEngine, dimensionConfigs]);

  // ===================== 重试（初始化） =====================
  const retry = useCallback(() => {
    setInitStatus('loading');
    setInitError(null);
    // Re-trigger init
    (async () => {
      try {
        const [dimRes, engRes, ttRes] = await Promise.all([
          getDimensions(),
          getEngines(),
          getTaskTypes(),
        ]);
        setDimensions(dimRes.dimensions);
        setEngines(engRes.engines);
        setTaskTypes(ttRes.task_types);
        setInitStatus('success');
      } catch (err) {
        setInitError(err instanceof Error ? err.message : '系统初始化失败');
        setInitStatus('error');
      }
    })();
  }, []);

  return {
    // State
    initStatus,
    initError,
    dimensions,
    engines,
    taskTypes,
    task,
    selectedEngine,
    routeStatus,
    routeResult,
    routeError,
    dimensionConfigs,
    generateStatus,
    generateResult,
    generateError,
    engineChanged,
    // Actions
    setTask,
    setSelectedEngine,
    triggerRoute,
    toggleDimension,
    cyclePriority,
    triggerGenerate,
    retry,
  };
}
