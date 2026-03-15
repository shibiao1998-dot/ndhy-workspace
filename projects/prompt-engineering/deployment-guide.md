# 部署指南：提示词工程系统

## 系统概述

提示词工程系统是一个前后端一体化的 Web 应用：

- **后端**：Python FastAPI（uvicorn），端口 8080
- **前端**：React + Vite + TypeScript，构建后作为静态文件由后端托管
- **数据**：`dimensions/` 目录下 17 个 Markdown 文件，启动时加载到内存
- **无数据库**：所有数据从文件加载，无需额外数据库服务

---

## 快速启动（Docker）

### 前置条件

- Docker 20.10+
- Docker Compose v2+
- 项目根目录包含 `frontend/`、`backend/`、`dimensions/` 三个目录

### 构建和运行

```bash
# 构建并启动（前台）
docker-compose up --build

# 构建并启动（后台）
docker-compose up --build -d

# 停止
docker-compose down
```

### 验证

启动后访问以下地址：

| 验证项 | URL | 预期结果 |
|--------|-----|----------|
| 前端页面 | http://localhost:8080 | 显示提示词工程系统界面 |
| API 文档 | http://localhost:8080/docs | Swagger UI |
| 维度列表 | http://localhost:8080/api/dimensions | JSON 维度数据 |
| 任务类型 | http://localhost:8080/api/task-types | JSON 任务类型列表 |

---

## 本地开发

本地开发时，前后端独立运行，前端通过 Vite 代理转发 API 请求到后端。

### 后端启动

```bash
cd backend

# 创建虚拟环境（首次）
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端（开发模式，启用 CORS）
ENV=development uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

> Windows PowerShell 设置环境变量：`$env:ENV="development"` 然后再运行 uvicorn。

### 前端启动

```bash
cd frontend

# 安装依赖（首次）
npm ci

# 启动开发服务器（端口 5173）
npm run dev
```

### 联调方式

- 前端开发服务器运行在 `http://localhost:5173`
- 后端运行在 `http://localhost:8080`
- 后端设置 `ENV=development` 后会开启 CORS，允许 `http://localhost:5173` 的跨域请求
- 前端 Vite 配置应代理 `/api` 请求到 `http://localhost:8080`

---

## 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DIMENSIONS_DIR` | `../dimensions`（相对于 backend 目录） | 维度 Markdown 文件所在目录 |
| `ENV` | `production` | 设为 `development` 启用 CORS（允许前端 dev server 跨域） |

### 维度文件目录

- 维度数据存放在 `dimensions/` 目录，包含 17 个 `.md` 文件
- 应用启动时自动加载所有维度文件到内存
- Docker 部署时通过 volume 挂载 `./dimensions:/app/dimensions:ro`，支持外部修改维度文件
- 修改维度文件后，可通过热重载 API 刷新（见下方运维章节），无需重启容器

---

## 运维

### 健康检查

```bash
# 检查 API 是否正常响应
curl http://localhost:8080/api/dimensions

# 检查 Swagger 文档
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/docs
```

Docker Compose 健康检查（可选添加到 `docker-compose.yml`）：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/api/dimensions"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

### 日志查看

```bash
# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100

# 只看应用日志（过滤 uvicorn 启动信息）
docker-compose logs -f | grep -v "INFO:     Waiting"
```

### 更新维度文件（热重载）

维度文件通过 volume 挂载，修改宿主机 `dimensions/` 目录下的文件后：

```bash
# 触发热重载，重新加载所有维度文件到内存
curl -X POST http://localhost:8080/api/reload
```

无需重启容器，应用会重新从 `DIMENSIONS_DIR` 加载所有 `.md` 文件。

### 重新构建与更新

```bash
# 代码更新后重新构建
docker-compose up --build -d

# 仅重建不使用缓存
docker-compose build --no-cache
docker-compose up -d
```

### 资源占用

- 该系统无数据库、无外部依赖，资源占用极低
- 内存主要消耗：17 个维度文件的解析结果（通常 < 50MB）
- 推荐最低配置：1 CPU / 512MB RAM
