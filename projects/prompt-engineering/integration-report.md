# 联调集成验证报告

日期：2026-03-15
环境：本地开发（后端 8080 + 前端 dev 5173 + Vite proxy）

## 服务启动
- 后端：✅ 成功（Uvicorn on :8080，99 维度 / 12 分类加载完成）
- 前端 dev server：✅ 成功（Vite v6.4.1 on :5173，224ms 启动）

## 端到端验证

| # | 测试项 | 请求 | 状态码 | 响应摘要 | 结果 |
|---|--------|------|--------|---------|------|
| A | 页面可访问 | GET :5173/ | 200 | HTML 566 bytes，包含 `<html>` 标签 | ✅ 通过 |
| B | 维度列表代理 | GET :5173/api/dimensions | 200 | 返回 99 个维度对象 | ✅ 通过 |
| C | 任务类型代理 | GET :5173/api/task-types | 200 | 返回 8 个任务类型 | ✅ 通过 |
| D | 引擎列表代理 | GET :5173/api/engines | 200 | 返回 6 个引擎（claude/gpt4/deepseek 等） | ✅ 通过 |
| E | 路由代理 | POST :5173/api/route | 200 | task_type=general, 33 required + 32 recommended + 34 optional | ✅ 通过 |
| F | 生成代理 | POST :5173/api/generate | 200 | prompt 17110 chars, 5 dims used, 7392 dim chars | ✅ 通过 |

## Vite Proxy 验证
✅ 确认所有 `/api/*` 请求从前端端口 5173 正确转发到后端 8080。
6 个 API 端点全部通过 Vite proxy 正常工作，响应数据与直接访问后端一致。

## 发现的细节

### 路由响应结构
`/api/route` 返回的维度分级字段（`required`/`recommended`/`optional`）在响应根层级，
不是嵌套在 `dimensions` 对象下。前端消费时需注意字段路径。

### Generate 校验规则
- `priorities` 必须为 `dimensions` 中每个 ID 都提供优先级值
- 优先级值只接受 1、2、3 三个级别
- 校验失败时返回清晰的错误码和建议（INVALID_REQUEST_BODY / INVALID_FIELD_VALUE）

## 结论
🟢 **全部通过（6/6）**

前后端联调验证全部成功。后端 FastAPI 服务和前端 Vite dev server 通过 proxy 配置实现了完整的端到端通信。
所有 API 端点（dimensions / task-types / engines / route / generate）均可通过前端代理正常访问，
页面 HTML 可加载，系统已具备进入功能验证阶段的条件。
