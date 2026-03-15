@echo off
REM 提示词工程系统 — 一键启动脚本 (Windows)

echo 🚀 构建并启动提示词工程系统...
docker compose build
if errorlevel 1 (
    echo ❌ 构建失败，请检查 Docker 是否已启动
    pause
    exit /b 1
)

docker compose up -d
if errorlevel 1 (
    echo ❌ 启动失败
    pause
    exit /b 1
)

echo.
echo ✅ 启动成功！
echo    访问地址: http://localhost:8080
echo    查看日志: docker compose logs -f
echo    停止服务: docker compose down
pause
