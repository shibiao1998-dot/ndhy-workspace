// components/RouteResult.tsx — 路由结果：文案化置信度 + Segmented 任务类型

import React from 'react';
import { Segmented, Spin, Typography } from 'antd';
import type { TaskType } from '../types';
import type { RouteStatus } from '../hooks/usePromptEngine';

const { Text } = Typography;

interface RouteResultProps {
  status: RouteStatus;
  taskTypeName: string | null;
  confidence: number | null;
  isManualOverride: boolean;
  error: string | null;
  taskTypes: TaskType[];
  selectedTaskType: string | null;
  onTaskTypeChange: (taskTypeKey: string) => void;
}

function getConfidenceLabel(confidence: number, isManual: boolean): { text: string; className: string } {
  if (isManual) return { text: '✅ 手动选择', className: 'confidence-badge confidence-badge--high' };
  if (confidence >= 0.7) return { text: '✅ 高度匹配', className: 'confidence-badge confidence-badge--high' };
  if (confidence >= 0.4) return { text: '💡 较好匹配', className: 'confidence-badge confidence-badge--medium' };
  return { text: '🔍 建议确认', className: 'confidence-badge confidence-badge--low' };
}

const RouteResult: React.FC<RouteResultProps> = ({
  status,
  taskTypeName,
  confidence,
  isManualOverride,
  error,
  taskTypes,
  selectedTaskType,
  onTaskTypeChange,
}) => {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="route-result-loading">
        <Spin size="small" />
        <Text type="secondary">正在匹配任务类型...</Text>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="route-result-error">
        <Text type="danger">匹配失败，请重试</Text>
        {error && <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>({error})</Text>}
      </div>
    );
  }

  const badge = confidence !== null ? getConfidenceLabel(confidence, isManualOverride) : null;

  return (
    <div className="route-result">
      <div className="route-result-header">
        <Text strong style={{ fontSize: 15 }}>匹配类型：{taskTypeName}</Text>
        {badge && <span className={badge.className}>{badge.text}</span>}
      </div>

      <div className="route-result-types">
        <Segmented
          value={selectedTaskType ?? undefined}
          onChange={(val) => onTaskTypeChange(val as string)}
          options={taskTypes.map((t) => ({
            value: t.key,
            label: t.name,
          }))}
          size="small"
        />
      </div>
    </div>
  );
};

export default RouteResult;
