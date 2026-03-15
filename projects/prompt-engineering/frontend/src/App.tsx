// App.tsx — 主应用，步骤引导流布局

import React, { useCallback, useMemo } from 'react';
import { Card, Button, Spin, Result, Alert, Typography, Steps, Segmented } from 'antd';
import {
  RocketOutlined,
  LoadingOutlined,
  ReloadOutlined,
  EditOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { usePromptEngine } from './hooks/usePromptEngine';
import TaskInput from './components/TaskInput';
import RouteResult from './components/RouteResult';
import EngineSelector from './components/EngineSelector';
import LengthIndicator from './components/LengthIndicator';
import DimensionPanel from './components/DimensionPanel';
import PromptOutput from './components/PromptOutput';
import CoverageReport from './components/CoverageReport';
import './App.css';

const { Text } = Typography;

// 预设场景
const PRESET_SCENARIOS = [
  { key: 'courseware', label: '101课件设计', icon: '📖', task: '设计一个初中物理力学101课件的交互方案' },
  { key: 'experiment', label: '虚拟实验方案', icon: '🧪', task: '设计一个初中化学虚拟实验的交互方案' },
  { key: 'ppt', label: '教学PPT提示词', icon: '🎓', task: '为高中数学函数章节设计教学PPT' },
  { key: 'syllabus', label: '课程大纲生成', icon: '📋', task: '生成小学英语三年级上册课程大纲' },
];

const App: React.FC = () => {
  const state = usePromptEngine();

  // ===================== 当前步骤 =====================
  const currentStep = useMemo(() => {
    if (state.generateStatus === 'success') return 3;
    if (state.routeStatus === 'success') return 1;
    if (state.routeStatus === 'loading') return 1;
    return 0;
  }, [state.routeStatus, state.generateStatus]);

  // ===================== 路由触发回调 =====================
  const handleBlurTrigger = useCallback(() => {
    state.triggerRoute();
  }, [state.triggerRoute]);

  const handleTaskTypeChange = useCallback(
    (key: string) => {
      state.triggerRoute(key);
    },
    [state.triggerRoute]
  );

  // ===================== 预设场景点击 =====================
  const handlePresetClick = useCallback(
    (task: string) => {
      state.setTask(task);
      // 需要在下一个 tick 触发路由，因为 setTask 是异步的
      setTimeout(() => {
        state.triggerRoute();
      }, 50);
    },
    [state.setTask, state.triggerRoute]
  );

  // ===================== 生成按钮状态 =====================
  const checkedCount = useMemo(() => {
    let count = 0;
    for (const config of state.dimensionConfigs.values()) {
      if (config.checked) count++;
    }
    return count;
  }, [state.dimensionConfigs]);

  const canGenerate =
    state.task.trim().length > 0 &&
    checkedCount > 0 &&
    state.generateStatus !== 'loading';

  // ===================== 自动滚动到输出区 =====================
  const outputRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (state.generateStatus === 'success' && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.generateStatus]);

  // ===================== 初始化 Loading =====================
  if (state.initStatus === 'loading') {
    return (
      <div className="app-init-loading">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p className="app-init-text">系统初始化中...</p>
      </div>
    );
  }

  // ===================== 初始化失败 =====================
  if (state.initStatus === 'error') {
    return (
      <div className="app-init-loading">
        <Result
          status="error"
          title="系统初始化失败"
          subTitle={state.initError || '请检查网络连接后刷新页面'}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={state.retry}>
              刷新重试
            </Button>
          }
        />
      </div>
    );
  }

  // ===================== 主界面 =====================
  return (
    <>
      {/* 顶部品牌色渐变条 */}
      <div className="app-header-bar" />

      <div className="app-container">
        {/* 页头: 品牌区 */}
        <header className="app-header">
          <div className="app-header-content">
            <div className="app-header-icon">
              <RocketOutlined />
            </div>
            <div className="app-header-text">
              <div className="app-header-title-row">
                <h1 className="app-header-title">华渔提示词工程</h1>
                <span className="app-header-title-divider">·</span>
                <span className="app-header-title-en">Prompt Engineering System</span>
              </div>
              <p className="app-header-subtitle">为 AI 提供最全面的信息，让每次对话都高质量</p>
            </div>
          </div>
        </header>

        {/* 步骤进度条 */}
        <div className="steps-wrapper">
          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: '描述任务', icon: <EditOutlined /> },
              { title: '确认维度', icon: <AppstoreOutlined /> },
              { title: '选择引擎', icon: <ThunderboltOutlined /> },
              { title: '查看结果', icon: <FileTextOutlined /> },
            ]}
          />
        </div>

        {/* Step 1: 描述任务 */}
        <Card className="section-card">
          <div className="step-header">
            <span className="step-number">1</span>
            <span className="step-title">描述你的任务</span>
          </div>

          {/* DJ 理念引用 */}
          <div className="dj-quote">
            "为 AI 提供最全面的信息，让每次对话都高质量" —— DJ 信息对称理念
          </div>

          {/* 核心数据展示 */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-icon">📚</span>
              <span className="hero-stat-value">89</span>
              <span className="hero-stat-label">维度知识库</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">📂</span>
              <span className="hero-stat-value">12</span>
              <span className="hero-stat-label">覆盖类别</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">🤖</span>
              <span className="hero-stat-value">6</span>
              <span className="hero-stat-label">适配引擎</span>
            </div>
          </div>

          <TaskInput
            value={state.task}
            onChange={state.setTask}
            onBlurTrigger={handleBlurTrigger}
          />

          {/* 预设场景卡片 */}
          {!state.task && state.routeStatus === 'idle' && (
            <div className="preset-scenarios">
              <Text type="secondary" className="preset-label">快速开始：</Text>
              <div className="preset-grid">
                {PRESET_SCENARIOS.map((s) => (
                  <div
                    key={s.key}
                    className="preset-card"
                    onClick={() => handlePresetClick(s.task)}
                  >
                    <span className="preset-card-icon">{s.icon}</span>
                    <span className="preset-card-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 路由结果 */}
          <RouteResult
            status={state.routeStatus}
            taskTypeName={state.routeResult?.task_type_name ?? null}
            confidence={state.routeResult?.confidence ?? null}
            isManualOverride={state.routeResult?.is_manual_override ?? false}
            error={state.routeError}
            taskTypes={state.taskTypes}
            selectedTaskType={state.routeResult?.task_type ?? null}
            onTaskTypeChange={handleTaskTypeChange}
          />
        </Card>

        {/* Step 2: 确认维度 */}
        {state.routeStatus === 'success' && state.routeResult && (
          <Card className="section-card">
            <div className="step-header">
              <span className="step-number">2</span>
              <span className="step-title">确认维度选择</span>
              <span className="step-subtitle">
                已选 {checkedCount} 个维度，按类别浏览和调整
              </span>
            </div>

            <DimensionPanel
              dimensions={state.dimensions}
              dimensionConfigs={state.dimensionConfigs}
              routeResult={state.routeResult}
              onToggle={state.toggleDimension}
              onCyclePriority={state.cyclePriority}
            />

            {checkedCount === 0 && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Text type="danger">请至少选择一个维度</Text>
              </div>
            )}
          </Card>
        )}

        {/* Step 3: 选择引擎 + 生成 */}
        {state.routeStatus === 'success' && state.routeResult && (
          <Card className="section-card">
            <div className="step-header">
              <span className="step-number">3</span>
              <span className="step-title">选择引擎并生成</span>
            </div>

            <div className="engine-length-row">
              <EngineSelector
                engines={state.engines}
                selectedEngine={state.selectedEngine}
                onChange={state.setSelectedEngine}
              />
              <LengthIndicator
                dimensions={state.dimensions}
                dimensionConfigs={state.dimensionConfigs}
                engines={state.engines}
                selectedEngine={state.selectedEngine}
              />
            </div>

            <div className="generate-btn-wrapper">
              <Button
                type="primary"
                size="large"
                icon={state.generateStatus === 'loading' ? <LoadingOutlined /> : <RocketOutlined />}
                loading={state.generateStatus === 'loading'}
                disabled={!canGenerate}
                onClick={state.triggerGenerate}
                className="generate-btn"
              >
                {state.generateStatus === 'loading' ? '生成中...' : '生成提示词'}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: 查看结果 */}
        <div ref={outputRef}>
          {state.engineChanged && state.generateResult && (
            <Alert
              message={`引擎已切换为 ${state.engines.find((e) => e.key === state.selectedEngine)?.name ?? state.selectedEngine}，点击「重新生成」查看新结果`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {state.generateStatus === 'loading' && (
            <Card className="section-card">
              <div className="step-header">
                <span className="step-number">4</span>
                <span className="step-title">生成结果</span>
              </div>
              <div className="skeleton-loading">
                <div className="skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton-line" style={{ width: '75%' }} />
                <div className="skeleton-line" style={{ width: '85%' }} />
                <div className="skeleton-line" style={{ width: '60%' }} />
                <div className="skeleton-line" style={{ width: '80%' }} />
              </div>
            </Card>
          )}

          {state.generateStatus === 'error' && (
            <Card className="section-card">
              <Result
                status="error"
                title="生成失败"
                subTitle={`${state.generateError || '请检查配置后重试'}`}
              />
            </Card>
          )}

          {state.generateStatus === 'success' && state.generateResult && (
            <Card className="section-card-output">
              <div className="step-header">
                <span className="step-number">4</span>
                <span className="step-title">生成结果</span>
              </div>
              <PromptOutput prompt={state.generateResult.prompt} />
              <CoverageReport
                stats={state.generateResult.stats}
                dimensions={state.dimensions}
                engineName={state.engines.find((e) => e.key === state.selectedEngine)?.name ?? state.selectedEngine}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
