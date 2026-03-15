#!/usr/bin/env bash
# 提示词工程系统 — 一键启动脚本 (Linux/Mac)
set -e

echo "🚀 构建并启动提示词工程系统..."
docker compose build
docker compose up -d

echo ""
echo "✅ 启动成功！"
echo "   访问地址: http://localhost:8080"
echo "   查看日志: docker compose logs -f"
echo "   停止服务: docker compose down"
