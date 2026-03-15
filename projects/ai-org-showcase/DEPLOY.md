# 部署指南 — ai-org-showcase v2

## 前置条件
- Docker Desktop 已启动
- cftunnel 已安装（路径：`$env:LOCALAPPDATA\cftunnel\cftunnel.exe`）

## 部署步骤

### 1. 构建并启动容器
```powershell
cd D:\code\openclaw-home\workspace\projects\ai-org-showcase
docker compose up -d --build
```

### 2. 验证容器运行
```powershell
docker compose ps
# 应该看到 ai-org-showcase 状态为 running (healthy)

# 本地访问测试
curl http://localhost:8080
```

### 3. 通过 cftunnel 暴露到公网
```powershell
& "$env:LOCALAPPDATA\cftunnel\cftunnel.exe" tunnel --url http://localhost:8080
```
cftunnel 会输出一个公网 URL（如 `https://xxx.trycloudflare.com`），即可通过该 URL 访问。

## 停止服务
```powershell
cd D:\code\openclaw-home\workspace\projects\ai-org-showcase
docker compose down
```

## 安全措施
- ✅ Docker 容器化，资源隔离（CPU 0.5核，内存 128MB）
- ✅ 只读文件系统（read_only: true）
- ✅ 禁止权限提升（no-new-privileges）
- ✅ Caddy 安全头（CSP、X-Frame-Options、HSTS 等）
- ✅ Gzip 压缩
- ✅ 健康检查
- ✅ 自动重启（unless-stopped）

## 更新网站
修改 `index.html` 后：
```powershell
docker compose up -d --build
```
