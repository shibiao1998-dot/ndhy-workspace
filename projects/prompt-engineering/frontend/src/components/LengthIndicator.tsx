// components/LengthIndicator.tsx — 长度指示器（简洁风格）

import React, { useMemo } from 'react';
import { Progress, Typography } from 'antd';
import type { Dimension, DimensionConfig, Engine } from '../types';

const { Text } = Typography;

interface LengthIndicatorProps {
  dimensions: Dimension[];
  dimensionConfigs: Map<string, DimensionConfig>;
  engines: Engine[];
  selectedEngine: string;
}

const LengthIndicator: React.FC<LengthIndicatorProps> = ({
  dimensions,
  dimensionConfigs,
  engines,
  selectedEngine,
}) => {
  const engine = engines.find((e) => e.key === selectedEngine);
  const maxChars = engine?.max_chars ?? 180000;

  const usedChars = useMemo(() => {
    let total = 0;
    for (const [id, config] of dimensionConfigs) {
      if (config.checked) {
        const dim = dimensions.find((d) => d.id === id);
        if (dim) total += dim.char_count;
      }
    }
    return total;
  }, [dimensions, dimensionConfigs]);

  const percent = Math.min(100, Math.round((usedChars / maxChars) * 100));

  const formatChars = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return String(n);
  };

  const strokeColor = percent <= 60 ? '#1B65A9' : percent <= 85 ? '#E8900C' : '#D93025';

  return (
    <div className="length-indicator">
      <div className="length-indicator-text">
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatChars(usedChars)} / {formatChars(maxChars)}
        </Text>
      </div>
      <Progress
        percent={percent}
        strokeColor={strokeColor}
        trailColor="#E8E8E8"
        showInfo={false}
        size="small"
        className="length-indicator-bar"
      />
    </div>
  );
};

export default LengthIndicator;
