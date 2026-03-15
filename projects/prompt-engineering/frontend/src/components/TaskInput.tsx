// components/TaskInput.tsx — A区：任务输入（高端视觉升级）

import React, { useCallback, useRef, useEffect } from 'react';
import { Input } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';

const { TextArea } = Input;

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlurTrigger: () => void;
  disabled?: boolean;
}

const TaskInput: React.FC<TaskInputProps> = ({ value, onChange, onBlurTrigger, disabled }) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBlur = useCallback(() => {
    if (!value.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onBlurTrigger();
    }, 300);
  }, [value, onBlurTrigger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          onBlurTrigger();
          (e.target as HTMLTextAreaElement).blur();
        }
      }
    },
    [value, onBlurTrigger]
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="task-input-wrapper">
      <TextArea
        ref={inputRef as React.Ref<any>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="描述你的任务，例如：设计一个初中化学虚拟实验的交互方案"
        autoSize={{ minRows: 3, maxRows: 8 }}
        disabled={disabled}
      />
      {value && (
        <button className="task-input-clear" onClick={handleClear} title="清除内容">
          <CloseCircleFilled />
        </button>
      )}
      <div className="task-input-hint">
        <span>按</span>
        <kbd>Enter</kbd>
        <span>开始匹配任务类型，</span>
        <kbd>Shift + Enter</kbd>
        <span>换行</span>
      </div>
    </div>
  );
};

export default TaskInput;
