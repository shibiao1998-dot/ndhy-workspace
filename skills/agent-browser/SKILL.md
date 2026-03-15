---
name: Agent Browser
description: A fast Rust-based headless browser automation CLI with Node.js fallback that enables AI agents to navigate, click, type, and snapshot pages via structured commands.
read_when:
  - Automating web interactions
  - Extracting structured data from pages
  - Filling forms programmatically
  - Testing web UIs
metadata: {"clawdbot":{"emoji":"🌐","requires":{"bins":["node","npm"]}}}
allowed-tools: Bash(agent-browser:*)
---

# agent-browser

> Rust 驱动的无头浏览器自动化 CLI，通过 snapshot → ref → interact 循环控制网页。

## 核心工作流

```bash
agent-browser open <url>        # 1. 导航
agent-browser snapshot -i       # 2. 获取交互元素（@e1, @e2...）
agent-browser click @e1         # 3. 用 ref 交互
agent-browser snapshot -i       # 4. 导航后重新 snapshot
```

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 全部命令详解（导航/交互/获取/截图/等待/鼠标） | 📖 | references/commands.md |
| 配置/网络/标签/存储/调试/高级 | 📖 | references/settings-and-advanced.md |
| 使用示例 + 故障排除 | 📖 | references/examples-and-troubleshooting.md |

## 安装

```bash
npm install -g agent-browser
agent-browser install            # 下载浏览器
agent-browser install --with-deps  # 含系统依赖
```

## 铁律
1. **导航后必须重新 snapshot** — ref 在页面变化后失效
2. **用 fill 不用 type** — fill 会先清空输入框
3. **用 snapshot -i** — 只看交互元素，减少噪音
4. **加 --json 做解析** — 机器可读输出
