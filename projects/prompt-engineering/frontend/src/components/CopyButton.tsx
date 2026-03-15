// components/CopyButton.tsx — C区：一键复制按钮（深色适配）

import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.body.removeChild(textarea);
      message.warning('复制失败，请手动 Ctrl+C', 3);
    }
  }, [text]);

  const btnClass = copied ? 'copy-btn-dark copy-btn-dark--copied' : 'copy-btn-dark';

  return (
    <button className={btnClass} onClick={handleCopy}>
      {copied ? <CheckOutlined /> : <CopyOutlined />}
      {copied ? '✓ 已复制' : '复制'}
    </button>
  );
};

export default CopyButton;
