// components/CoverageReport.tsx — 覆盖报告（数据仪表板风格 + 引擎名称）

import React from 'react';
import type { CoverageStats, Dimension } from '../types';

interface CoverageReportProps {
  stats: CoverageStats;
  dimensions: Dimension[];
  engineName?: string;
}

const CoverageReport: React.FC<CoverageReportProps> = ({ stats, dimensions, engineName }) => {
  const hasMissing = stats.missing_required.length > 0;
  const hasTruncated = stats.truncated_dimensions.length > 0;

  const getDimensionName = (id: string): string => {
    const dim = dimensions.find((d) => d.id === id);
    return dim ? `${id} ${dim.name}` : id;
  };

  const totalDimensions = stats.dimensions_total || 1;
  const requiredPercent = (stats.by_level.required_count / totalDimensions) * 100;
  const recommendedPercent = (stats.by_level.recommended_count / totalDimensions) * 100;
  const optionalPercent = (stats.by_level.optional_count / totalDimensions) * 100;

  return (
    <div className="coverage-report">
      <h3 className="coverage-report-title">📊 维度覆盖报告</h3>

      {/* 统计卡片: 4列 */}
      <div className="coverage-stats-grid">
        <div className="coverage-stat-card">
          <div className="coverage-stat-value">{stats.dimensions_used}/{stats.dimensions_total}</div>
          <div className="coverage-stat-label">已用维度</div>
        </div>
        <div className="coverage-stat-card">
          <div className="coverage-stat-value">{stats.coverage_percent}%</div>
          <div className="coverage-stat-label">覆盖率</div>
        </div>
        <div className="coverage-stat-card">
          <div className="coverage-stat-value">{stats.total_chars.toLocaleString()}</div>
          <div className="coverage-stat-label">总字符</div>
        </div>
        <div className="coverage-stat-card">
          <div className="coverage-stat-value" style={{ fontSize: 18 }}>
            {engineName || '—'}
          </div>
          <div className="coverage-stat-label">目标引擎</div>
        </div>
      </div>

      {/* 维度分布条 */}
      <div className="coverage-distribution">
        <div className="coverage-distribution-title">维度分布</div>
        <div className="coverage-bar-row">
          <span className="coverage-bar-label">一级</span>
          <div className="coverage-bar-track">
            <div
              className="coverage-bar-fill coverage-bar-fill--required"
              style={{ width: `${requiredPercent}%` }}
            />
          </div>
          <span className="coverage-bar-count">{stats.by_level.required_count}个</span>
        </div>
        <div className="coverage-bar-row">
          <span className="coverage-bar-label">二级</span>
          <div className="coverage-bar-track">
            <div
              className="coverage-bar-fill coverage-bar-fill--recommended"
              style={{ width: `${recommendedPercent}%` }}
            />
          </div>
          <span className="coverage-bar-count">{stats.by_level.recommended_count}个</span>
        </div>
        <div className="coverage-bar-row">
          <span className="coverage-bar-label">三级</span>
          <div className="coverage-bar-track">
            <div
              className="coverage-bar-fill coverage-bar-fill--optional"
              style={{ width: `${optionalPercent}%` }}
            />
          </div>
          <span className="coverage-bar-count">{stats.by_level.optional_count}个</span>
        </div>
      </div>

      {/* 缺失/截断提示 */}
      {hasMissing ? (
        <div className="coverage-alert coverage-alert--error">
          ⚠️ 缺失必须维度：{stats.missing_required.map(getDimensionName).join('、')}
        </div>
      ) : (
        <div className="coverage-alert coverage-alert--success">
          ✅ 所有必须维度均已覆盖
        </div>
      )}

      {hasTruncated && (
        <div className="coverage-alert coverage-alert--warning">
          ⚠️ 因字符数限制被跳过的维度：{stats.truncated_dimensions.map(getDimensionName).join('、')}
        </div>
      )}
    </div>
  );
};

export default CoverageReport;
