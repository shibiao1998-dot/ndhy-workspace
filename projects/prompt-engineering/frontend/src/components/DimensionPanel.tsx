// components/DimensionPanel.tsx — Step 2：维度配置面板（类别手风琴 + Tag 标签流）

import React, { useMemo, useState } from 'react';
import { Collapse, Tooltip, Popconfirm, Typography } from 'antd';
import { CaretRightOutlined, SwapOutlined } from '@ant-design/icons';
import type { Dimension, DimensionConfig, RouteResponse } from '../types';

const { Text } = Typography;

interface DimensionPanelProps {
  dimensions: Dimension[];
  dimensionConfigs: Map<string, DimensionConfig>;
  routeResult: RouteResponse;
  onToggle: (id: string) => void;
  onCyclePriority: (id: string) => void;
}

// 优先级视觉映射（微妙差异，不用红黄绿圆点）
const PRIORITY_STYLES: Record<number, { borderWidth: string; bg: string; label: string }> = {
  1: { borderWidth: '3px', bg: '#E8F1FA', label: '必须' },
  2: { borderWidth: '2px', bg: '#F0F7FF', label: '建议' },
  3: { borderWidth: '0', bg: 'transparent', label: '可选' },
};

// 类别图标映射
const CATEGORY_ICONS: Record<string, string> = {
  A: '🎯', B: '👥', C: '🔍', D: '📋', E: '🛠️', F: '⚙️',
  G: '📖', H: '📏', I: '✅', J: '🎓', K: '📝', L: '📅',
};

interface DimensionTagProps {
  dimension: Dimension;
  config: DimensionConfig;
  isRequiredByRoute: boolean;
  onToggle: (id: string) => void;
  onCyclePriority: (id: string) => void;
}

const DimensionTag: React.FC<DimensionTagProps> = ({
  dimension,
  config,
  isRequiredByRoute,
  onToggle,
  onCyclePriority,
}) => {
  const priority = PRIORITY_STYLES[config.priority];
  const isChecked = config.checked;

  const tagContent = (
    <span className="dim-tag-text">
      {dimension.name}
      {isChecked && (
        <Tooltip title={`当前：${priority.label}，点击切换优先级`}>
          <SwapOutlined
            className="dim-tag-priority-icon"
            onClick={(e) => {
              e.stopPropagation();
              onCyclePriority(dimension.id);
            }}
          />
        </Tooltip>
      )}
    </span>
  );

  if (isChecked && isRequiredByRoute) {
    // 必须维度取消时需要确认
    return (
      <Popconfirm
        title="此为该任务类型的必须维度"
        description="取消可能影响提示词质量，确定取消吗？"
        onConfirm={() => onToggle(dimension.id)}
        okText="确定取消"
        cancelText="保留"
      >
        <Tooltip title={dimension.summary ? dimension.summary.slice(0, 100) + '...' : dimension.definition}>
          <span
            className="dim-tag dim-tag--selected"
            style={{
              borderLeftWidth: priority.borderWidth,
              backgroundColor: priority.bg,
            }}
          >
            {tagContent}
          </span>
        </Tooltip>
      </Popconfirm>
    );
  }

  return (
    <Tooltip title={dimension.summary ? dimension.summary.slice(0, 100) + '...' : dimension.definition}>
      <span
        className={`dim-tag ${isChecked ? 'dim-tag--selected' : 'dim-tag--unselected'}`}
        style={isChecked ? {
          borderLeftWidth: priority.borderWidth,
          backgroundColor: priority.bg,
        } : undefined}
        onClick={() => onToggle(dimension.id)}
      >
        {tagContent}
        {dimension.status === 'partial' && (
          <span className="dim-tag-partial">未完成</span>
        )}
      </span>
    </Tooltip>
  );
};

const DimensionPanel: React.FC<DimensionPanelProps> = ({
  dimensions,
  dimensionConfigs,
  routeResult,
  onToggle,
  onCyclePriority,
}) => {
  // 按类别归组
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, {
      key: string;
      name: string;
      dims: Array<{ dim: Dimension; config: DimensionConfig }>;
      selectedCount: number;
      totalCount: number;
      hasRequired: boolean;
    }>();

    // 先从 dimensions 构建类别
    for (const dim of dimensions) {
      if (!groups.has(dim.category)) {
        groups.set(dim.category, {
          key: dim.category,
          name: dim.category_name,
          dims: [],
          selectedCount: 0,
          totalCount: 0,
          hasRequired: false,
        });
      }
    }

    // 填入有 config 的维度
    for (const dim of dimensions) {
      const config = dimensionConfigs.get(dim.id);
      if (!config) continue;
      const group = groups.get(dim.category);
      if (!group) continue;
      group.dims.push({ dim, config });
      group.totalCount++;
      if (config.checked) group.selectedCount++;
      if (config.priority === 1 && config.checked) group.hasRequired = true;
    }

    // 按类别字母序排列
    return Array.from(groups.values())
      .filter((g) => g.totalCount > 0)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [dimensions, dimensionConfigs]);

  const requiredRouteIds = useMemo(() => new Set(routeResult.required), [routeResult.required]);

  // 默认展开含必须维度的类别
  const defaultActiveKeys = useMemo(() => {
    return categoryGroups
      .filter((g) => g.hasRequired)
      .map((g) => g.key);
  }, [categoryGroups]);

  const [activeKeys, setActiveKeys] = useState<string[]>(defaultActiveKeys);

  const collapseItems = categoryGroups.map((group) => ({
    key: group.key,
    label: (
      <div className="category-header">
        <span className="category-icon">{CATEGORY_ICONS[group.key] || '📄'}</span>
        <span className="category-letter">{group.key}</span>
        <span className="category-name">{group.name}</span>
        <span className="category-count">
          <span className="category-count-selected">{group.selectedCount}</span>
          <span className="category-count-sep">/</span>
          <span className="category-count-total">{group.totalCount}</span>
          <span className="category-count-label"> 已选</span>
        </span>
      </div>
    ),
    children: (
      <div className="dim-tag-flow">
        {group.dims.map(({ dim, config }) => (
          <DimensionTag
            key={dim.id}
            dimension={dim}
            config={config}
            isRequiredByRoute={requiredRouteIds.has(dim.id)}
            onToggle={onToggle}
            onCyclePriority={onCyclePriority}
          />
        ))}
      </div>
    ),
    className: group.selectedCount === 0 ? 'category-panel--inactive' : '',
  }));

  return (
    <div className="dimension-panel">
      {/* 图例 */}
      <div className="dim-legend">
        <span className="dim-legend-item">
          <span className="dim-legend-chip dim-legend-chip--selected">已选</span>
          <span className="dim-legend-chip dim-legend-chip--unselected">未选</span>
        </span>
        <span className="dim-legend-sep">|</span>
        <span className="dim-legend-item">
          <span className="dim-legend-bar" style={{ borderLeftWidth: '3px' }}></span> 必须
          <span className="dim-legend-bar" style={{ borderLeftWidth: '2px' }}></span> 建议
          <span className="dim-legend-bar" style={{ borderLeftWidth: '0' }}></span> 可选
        </span>
      </div>

      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={collapseItems}
        className="category-collapse"
      />
    </div>
  );
};

export default DimensionPanel;
