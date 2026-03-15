# =============================================================================
# 提示词工程系统 — 多阶段 Docker 构建
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: 构建前端（React + Vite + TypeScript）
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build

COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build

# ---------------------------------------------------------------------------
# Stage 2: 运行后端（Python FastAPI + uvicorn）
# ---------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# 安装 Python 依赖（先复制 requirements.txt 利用缓存）
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# 复制后端代码
COPY backend/ /app/backend/

# 复制维度数据
COPY dimensions/ /app/dimensions/

# 将前端构建产物复制到 backend/static/（FastAPI 自动挂载为 SPA）
COPY --from=frontend-build /app/frontend/dist /app/backend/static

EXPOSE 8080

# 环境变量：维度文件目录
ENV DIMENSIONS_DIR=/app/dimensions

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--app-dir", "/app/backend"]
