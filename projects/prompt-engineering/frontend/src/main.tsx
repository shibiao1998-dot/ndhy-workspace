// main.tsx — 入口

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { promptEngineeringTheme } from './theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={promptEngineeringTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
