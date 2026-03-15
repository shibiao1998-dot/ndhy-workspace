// components/PromptOutput.tsx — C区：提示词输出（终端风格 + Markdown渲染）

import React from 'react';
import ReactMarkdown from 'react-markdown';
import CopyButton from './CopyButton';

interface PromptOutputProps {
  prompt: string;
}

const PromptOutput: React.FC<PromptOutputProps> = ({ prompt }) => {
  return (
    <div className="prompt-output-wrapper">
      {/* 终端风格头部 */}
      <div className="prompt-output-header">
        <div className="prompt-output-header-dots">
          <span className="prompt-output-header-dot prompt-output-header-dot--red" />
          <span className="prompt-output-header-dot prompt-output-header-dot--yellow" />
          <span className="prompt-output-header-dot prompt-output-header-dot--green" />
        </div>
        <span className="prompt-output-header-title">Generated Prompt</span>
        <div className="prompt-output-copy-btn">
          <CopyButton text={prompt} />
        </div>
      </div>
      <div className="prompt-output-content">
        <ReactMarkdown>{prompt}</ReactMarkdown>
      </div>
    </div>
  );
};

export default PromptOutput;
