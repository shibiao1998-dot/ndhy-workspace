// components/EngineSelector.tsx — 引擎选择：Segmented 分段控制器

import React from 'react';
import { Segmented, Typography } from 'antd';
import type { Engine } from '../types';

const { Text } = Typography;

interface EngineSelectorProps {
  engines: Engine[];
  selectedEngine: string;
  onChange: (engine: string) => void;
}

const EngineSelector: React.FC<EngineSelectorProps> = ({ engines, selectedEngine, onChange }) => {
  return (
    <div className="engine-selector">
      <Text strong className="engine-selector-label">目标引擎</Text>
      <Segmented
        value={selectedEngine}
        onChange={(val) => onChange(val as string)}
        options={engines.map((e) => ({
          value: e.key,
          label: e.name,
        }))}
      />
    </div>
  );
};

export default EngineSelector;
