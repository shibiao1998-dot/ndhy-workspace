# 接口契约交付包模板

## 概览

接口契约交付包包含 6 个标准文档：

```
{project}/api/
├── api-contract.yaml             # OpenAPI 3.x 接口契约
├── api-design-notes.md           # 设计说明
├── error-model.md                # 错误码与异常模型
├── integration-notes.md          # 集成约束
├── compatibility-report.md       # 向后兼容风险报告
└── mock-schema.json              # Mock 数据契约
```

---

## 1. api-contract.yaml 模板

```yaml
openapi: 3.1.0
info:
  title: "{项目名} API"
  version: "{x.y.z}"
  description: |
    {一段话说清 API 提供什么能力}
  contact:
    name: "{团队名}"

servers:
  - url: "{base_url}"
    description: "{环境说明}"

tags:
  - name: "{资源名}"
    description: "{资源职责一句话}"

paths:
  /{resource}:
    get:
      tags: ["{资源名}"]
      summary: "获取{资源}列表"
      operationId: "list{Resource}"
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
        - $ref: '#/components/parameters/SortParam'
        # 过滤参数
        - name: "{filter_field}"
          in: query
          required: false
          schema:
            type: string
          description: "按{字段}过滤"
      responses:
        '200':
          description: "成功"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/{Resource}ListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
      security:
        - BearerAuth: ["{permission}"]

    post:
      tags: ["{资源名}"]
      summary: "创建{资源}"
      operationId: "create{Resource}"
      parameters:
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Create{Resource}Request'
      responses:
        '201':
          description: "创建成功"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/{Resource}Response'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '409':
          $ref: '#/components/responses/Conflict'
      security:
        - BearerAuth: ["{permission}"]

  /{resource}/{id}:
    get:
      tags: ["{资源名}"]
      summary: "获取{资源}详情"
      operationId: "get{Resource}"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      responses:
        '200':
          description: "成功"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/{Resource}Response'
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - BearerAuth: ["{permission}"]

    put:
      tags: ["{资源名}"]
      summary: "更新{资源}"
      operationId: "update{Resource}"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Update{Resource}Request'
      responses:
        '200':
          description: "更新成功"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/{Resource}Response'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '409':
          $ref: '#/components/responses/Conflict'
      security:
        - BearerAuth: ["{permission}"]

    delete:
      tags: ["{资源名}"]
      summary: "删除{资源}"
      operationId: "delete{Resource}"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      responses:
        '204':
          description: "删除成功"
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - BearerAuth: ["{permission}"]

  # === 过程性动作端点（非 CRUD）===
  /{resource}/{id}/actions/{action}:
    post:
      tags: ["{资源名}"]
      summary: "{动作描述}"
      operationId: "{action}{Resource}"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/{Action}Request'
      responses:
        '200':
          description: "操作成功"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/{Action}Response'
        '422':
          $ref: '#/components/responses/UnprocessableEntity'
      security:
        - BearerAuth: ["{permission}"]

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    ResourceId:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: "{id_format}"  # uuid / snowflake / etc.
      description: "资源唯一标识"

    PageParam:
      name: page
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        default: 1
      description: "页码（从 1 开始）"

    PageSizeParam:
      name: page_size
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: "每页条数"

    SortParam:
      name: sort
      in: query
      required: false
      schema:
        type: string
        pattern: "^[a-z_]+(:(asc|desc))?(,[a-z_]+(:(asc|desc))?)*$"
      description: "排序字段，格式: field:asc,field2:desc"

    IdempotencyKey:
      name: X-Idempotency-Key
      in: header
      required: false
      schema:
        type: string
        format: uuid
      description: "幂等键（写入类接口推荐携带）"

  schemas:
    # === 通用结构 ===
    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        page_size:
          type: integer
        total:
          type: integer
        total_pages:
          type: integer
      required: [page, page_size, total, total_pages]

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              description: "业务错误码"
            message:
              type: string
              description: "人类可读错误信息"
            details:
              type: array
              items:
                $ref: '#/components/schemas/ErrorDetail'
            request_id:
              type: string
              description: "请求追踪 ID"
          required: [code, message]

    ErrorDetail:
      type: object
      properties:
        field:
          type: string
          description: "出错字段路径"
        reason:
          type: string
          description: "具体原因"
        value:
          description: "实际传入值"

    # === 资源 Schema（按实际资源替换）===
    "{Resource}":
      type: object
      properties:
        id:
          type: string
          format: "{id_format}"
          readOnly: true
        # {字段定义}
        created_at:
          type: string
          format: date-time
          readOnly: true
        updated_at:
          type: string
          format: date-time
          readOnly: true
      required: [id]

    "Create{Resource}Request":
      type: object
      properties:
        # {创建时可填字段，不含 id/时间戳}
      required: []

    "Update{Resource}Request":
      type: object
      properties:
        # {更新时可填字段，不含 id/时间戳}

    "{Resource}Response":
      type: object
      properties:
        data:
          $ref: '#/components/schemas/{Resource}'

    "{Resource}ListResponse":
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/{Resource}'
        pagination:
          $ref: '#/components/schemas/PaginationMeta'

  responses:
    BadRequest:
      description: "请求参数错误"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Unauthorized:
      description: "未认证"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Forbidden:
      description: "无权限"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    NotFound:
      description: "资源不存在"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Conflict:
      description: "资源冲���"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    UnprocessableEntity:
      description: "业务规则不满足"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

---

## 2. api-design-notes.md 模板

```markdown
# API 设计说明

## 项目信息
- **项目名称**：
- **版本**：v{x.y}
- **日期**：{YYYY-MM-DD}
- **设计负责人**：

## 业务能力摘要
{一段话说清系统对外提供什么能力}

## 资源清单

| 资源 | 业务含义 | 端点前缀 | 主要动作 |
|------|---------|---------|---------|
| {Resource} | {一句话含义} | /{resource} | CRUD / {特殊动作} |

## 设计决策记录

### DR-001: {决策标题}
- **上下文**：{为什么需要这个决策}
- **方案选项**：
  - A: {方案 A 描述} — 优势/劣势
  - B: {方案 B 描述} — 优势/劣势
- **决定**：选择方案 {X}
- **理由**：{为什么选这个}
- **影响**：{对后续设计的影响}

## 资源关系图

{用 Mermaid 或文字描述资源间关系}

## 通用约定

### 命名规范
- URL 路径：{kebab-case / snake_case}
- 请求/响应字段：{camelCase / snake_case}
- 枚举值：{UPPER_SNAKE_CASE}

### ID 策略
- 格式：{UUID v4 / Snowflake / ULID}
- 理由：{选择原因}

### 时间格式
- 统一使用 ISO 8601：`YYYY-MM-DDTHH:mm:ss.SSSZ`
- 时区：{UTC / 带时区偏移}

## 与数据模型对齐说明

| API 字段 | 数据库字段 | 映射说明 |
|---------|----------|---------|
| {api_field} | {db_column} | {直接映射 / 计算 / 聚合} |

## 待确认项
- [ ] {需要上游确认的设计问题}

## 设计假设
- {假设 1：...}
- {假设 2：...}
```

---

## 3. error-model.md 模板

```markdown
# 错误码与异常模型

## 错误响应统一结构

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "指定的课程不存在",
    "details": [
      {
        "field": "course_id",
        "reason": "资源不存在",
        "value": "xxx-xxx"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

## HTTP 状态码使用规范

| 状态码 | 使用场景 | 说明 |
|--------|---------|------|
| 200 | 查询/更新成功 | 返回资源数据 |
| 201 | 创建成功 | 返回新资源 |
| 204 | 删除成功 | 无响应体 |
| 400 | 请求参数错误 | 字段校验失败 |
| 401 | 未认证 | Token 缺失或过期 |
| 403 | 无权限 | 认证通过但权限不足 |
| 404 | 资源不存在 | |
| 409 | 资源冲突 | 幂等键冲突 / 并发冲突 |
| 422 | 业务规则不满足 | 参数合法但业务不允许 |
| 429 | 限流 | 附 Retry-After 头 |
| 500 | 服务端错误 | 内部错误，不暴露细节 |

## 业务错误码体系

### 错误码命名规范
- 格式：`{DOMAIN}_{ACTION}_{REASON}`
- 示例：`COURSE_CREATE_DUPLICATE_NAME`

### 错误码清单

| 错误码 | HTTP 状态码 | 含义 | 触发条件 |
|--------|-----------|------|---------|
| {ERROR_CODE} | {4xx/5xx} | {人类可读含义} | {什么情况下触发} |

### 按端点错误矩阵

| 端点 | 可能错误码 |
|------|----------|
| POST /{resource} | VALIDATION_FAILED, DUPLICATE_RESOURCE, ... |
| GET /{resource}/{id} | RESOURCE_NOT_FOUND, ACCESS_DENIED, ... |

## 异常处理约定
- 4xx 错误：客户端问题，message 可直接展示给用户
- 5xx 错误：服务端问题，message 为通用文案，不暴露内部细节
- details 数组：仅 400/422 时填充字段级错误
- request_id：所有响应必带，用于问题追踪
```

---

## 4. integration-notes.md 模板

```markdown
# 集成约束

## 认证方式
- **方案**：{JWT Bearer / OAuth 2.0 / API Key}
- **Token 获取**：{登录接口 / OAuth 授权流程}
- **Token 刷新**：{刷新策略}
- **Token 有效期**：{时长}

## 权限模型

### 角色定义

| 角色 | 说明 | 权限范围 |
|------|------|---------|
| {role} | {角色说明} | {可访问的端点/资源} |

### 端点权限矩阵

| 端点 | admin | teacher | student | parent |
|------|-------|---------|---------|--------|
| GET /{resource} | ✅ | ✅ | ���（本人） | ✅（子女） |
| POST /{resource} | ✅ | ✅ | ❌ | ❌ |

## 分页规范
- **策略**：{offset 分页 / cursor 分页}
- **默认每页**：{20}
- **最大每页**：{100}
- **参数**：`page` + `page_size` 或 `cursor` + `limit`

## 过滤规范
- **格式**：查询参数直传，如 `?status=active&type=homework`
- **多值**：逗号分隔，如 `?status=active,archived`
- **日期范围**：`?created_after=2025-01-01&created_before=2025-12-31`

## 排序规范
- **格式**：`?sort=field:asc,field2:desc`
- **默认排序**：`created_at:desc`

## 搜索规范
- **全文搜索**：`?q=关键词`
- **搜索范围**：{搜索覆盖哪些字段}

## 幂等策略
- **幂等键**：`X-Idempotency-Key` 请求头
- **适用端点**：所有 POST/PUT 端点
- **有效期**：{24 小时}
- **冲突行为**：返回原始响应（不重复执行）

## 重试策略
- **可重试**：5xx + 429 + 网络超时
- **不可重试**：4xx（除 429）
- **退避策略**：指数退避 + 抖动
- **最大重试**：3 次

## 版本策略
- **方案**：{URL 前缀 /v1 / Accept Header / 无版本}
- **当前版本**：{v1}
- **废弃策略**：{废弃通知 → 6 个月共存期 → 下线}

## 联调契约
- **Mock 服务**：{mock 服务地址或使用 mock-schema.json}
- **联调环境**：{环境地址}
- **联调检查清单**：
  - [ ] 认证流程可走通
  - [ ] 列表接口分页正常
  - [ ] 错误码返回符合契约
  - [ ] 幂等键生效
  - [ ] 权限拦截正确

## 速率限制
- **默认限额**：{100 req/min}
- **响应头**：`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **超限响应**：429 + `Retry-After` 头
```

---

## 5. compatibility-report.md 模板

```markdown
# 向后兼容风险报告

## 项目信息
- **项目名称**：
- **版本变更**：v{old} → v{new}
- **日期**：{YYYY-MM-DD}
- **评估人**：

## 变更摘要

| 变更类�� | 数量 | 风险等级 |
|---------|------|---------|
| 新增端点 | {n} | 🟢 无风险 |
| 新增字段 | {n} | 🟢 无风险（选填）/ 🟡 注意（必填） |
| 字段重命名 | {n} | 🔴 破坏性 |
| 字段删除 | {n} | 🔴 破坏性 |
| 类型变更 | {n} | 🔴 破坏性 |
| 行为变更 | {n} | 🟡 / 🔴 视影响范围 |
| 端点废弃 | {n} | 🟡 需迁移计划 |
| 端点删除 | {n} | 🔴 破坏性 |

## 详细变更列表

### 破坏性变更（🔴）

| # | 端点 | 变更内容 | 影响范围 | 迁移方案 |
|---|------|---------|---------|---------|
| 1 | {endpoint} | {具体变更} | {影响哪些消费方} | {如何迁移} |

### 需注意变更（🟡）

| # | 端点 | 变更内容 | 建议动作 |
|---|------|---------|---------|
| 1 | {endpoint} | {具体变更} | {建议消费方做什么} |

### 安全变更（🟢）

| # | 端点 | 变更内容 |
|---|------|---------|
| 1 | {endpoint} | {具体变更} |

## 迁移计划

### 阶段 1：并行期��{起止日期}）
- 新旧端点同时可用
- 旧端点返回 `Deprecation` 响应头

### 阶段 2：迁移期（{起止日期}）
- 通知所有消费方迁移
- 监控旧端点流量

### 阶段 3：下线（{日期}）
- 旧端点返回 410 Gone

## 回滚方案
- {如果新版本有问题，如何回滚}

## 待确认项
- [ ] {需要与消费方确认的问题}
```

---

## 6. mock-schema.json 模板

```json
{
  "$schema": "mock-schema/v1",
  "project": "{项目名}",
  "version": "{版本}",
  "generated_at": "{ISO 8601}",
  "endpoints": [
    {
      "method": "GET",
      "path": "/{resource}",
      "description": "获取{资源}列表",
      "response": {
        "status": 200,
        "body": {
          "data": [
            {
              "id": "res_001",
              "_comment": "按 api-contract.yaml 中 schema 填充字段和示例值"
            }
          ],
          "pagination": {
            "page": 1,
            "page_size": 20,
            "total": 42,
            "total_pages": 3
          }
        }
      },
      "error_responses": [
        {
          "status": 401,
          "body": {
            "error": {
              "code": "UNAUTHORIZED",
              "message": "认证失败",
              "request_id": "req_mock_001"
            }
          }
        }
      ]
    },
    {
      "method": "POST",
      "path": "/{resource}",
      "description": "创建{资源}",
      "request": {
        "headers": {
          "X-Idempotency-Key": "uuid-example"
        },
        "body": {
          "_comment": "按 Create{Resource}Request schema 填充"
        }
      },
      "response": {
        "status": 201,
        "body": {
          "data": {
            "id": "res_new_001",
            "_comment": "按 {Resource} schema 填充"
          }
        }
      },
      "error_responses": [
        {
          "status": 400,
          "body": {
            "error": {
              "code": "VALIDATION_FAILED",
              "message": "参数校验失败",
              "details": [
                {
                  "field": "name",
                  "reason": "不能为空",
                  "value": null
                }
              ],
              "request_id": "req_mock_002"
            }
          }
        },
        {
          "status": 409,
          "body": {
            "error": {
              "code": "IDEMPOTENCY_CONFLICT",
              "message": "幂等键冲突，返回原始结果",
              "request_id": "req_mock_003"
            }
          }
        }
      ]
    },
    {
      "method": "GET",
      "path": "/{resource}/{id}",
      "description": "获取{资源}详情",
      "response": {
        "status": 200,
        "body": {
          "data": {
            "id": "res_001",
            "_comment": "完整资源字段"
          }
        }
      },
      "error_responses": [
        {
          "status": 404,
          "body": {
            "error": {
              "code": "RESOURCE_NOT_FOUND",
              "message": "资源不存在",
              "request_id": "req_mock_004"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 轻量版模板（快速契约深度）

当设计深度为"快速契约"时，只需交付以下精简内容：

### 轻量版 api-design-notes.md

```markdown
# API 设计说明（轻量版）

## 资源与端点

| 资源 | 端点 | Method | 说明 |
|------|------|--------|------|
| {Resource} | /{resource} | GET | 列表 |
| {Resource} | /{resource} | POST | 创建 |
| {Resource} | /{resource}/{id} | GET | 详情 |
| {Resource} | /{resource}/{id} | PUT | 更新 |
| {Resource} | /{resource}/{id} | DELETE | 删除 |

## 关键决策
- {决策 1}
- {决策 2}

## 待确认
- [ ] {问题}
```

### 轻量版只需交付：
1. OpenAPI 片段（只含涉及的端点）
2. 轻量版 api-design-notes.md
3. 相关错误码列表（不需要完整 error-model.md）
