# 鉴权与集成

## 概览

本文档覆盖：鉴权与权限边界设计 → Mock 输出规范 → 联调契约 → 集成约束。

---

## 鉴权方案设计

### 认证方式选择

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| **JWT Bearer** | Web/移动端应用、内部服务间调用 | 无状态、自包含、易于分布式验证 |
| **OAuth 2.0** | 第三方集成、开放平台 | 标准授权流程、支持多种 grant type |
| **API Key** | 简单服务间调用、开发环境 | 简单但安全性较低 |
| **Session Cookie** | 传统 Web 应用 | 有状态，不适合移动端 |

### JWT Token 结构设计

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "usr_001",          // 用户 ID
    "role": "teacher",         // 用户角色
    "org_id": "org_001",       // 所属组织
    "permissions": ["course:read", "course:write"],  // 权限列表
    "iat": 1700000000,         // 签发时间
    "exp": 1700003600          // 过期时间
  }
}
```

### Token 生命周期设计

| Token 类型 | 有效期 | 存储位置 | 刷新方式 |
|-----------|--------|---------|---------|
| Access Token | 15-60 分钟 | 内存/请求头 | 用 Refresh Token 刷新 |
| Refresh Token | 7-30 天 | HTTP-only Cookie / 安全存储 | 重新登录 |

---

## 权限模型设计

### RBAC（基于角色的权限控制）

**适用场景**：角色固定、权限粒度按角色划分的系统。

```
用户 → 角色 → 权限集
```

**权限命名规范**：`{resource}:{action}`

| 权限 | 说明 |
|------|------|
| `course:read` | 查看课程 |
| `course:write` | 创建/编辑课程 |
| `course:delete` | 删除课程 |
| `course:publish` | 发布课程 |
| `student:read` | 查看学生信息 |
| `grade:write` | 录入成绩 |

### ABAC（基于属性的权限控制）

**适用场景**：权限取决于资源属性（如"只能操作自己创建的"）。

```
允许操作 IF:
  user.role == "teacher"
  AND resource.creator_id == user.id
  AND resource.status != "archived"
```

### 数据行级权限

**场景**：同一端点，不同用户看到不同范围的数据。

| 角色 | GET /students | 看到的数据范围 |
|------|-------------|-------------|
| admin | ✅ | 全部学生 |
| teacher | ✅ | 自己班级的学生 |
| parent | ✅ | 自己子女 |
| student | ✅ | 自己 |

**契约标注方式**（在 OpenAPI 中）：

```yaml
/students:
  get:
    description: |
      获取学生列表。
      
      **数据范围**：
      - admin: 全部
      - teacher: 本班级学生 (自动按 class_id 过滤)
      - parent: 自己子女 (自动按 parent_id 过滤)
      - student: 仅自己
    security:
      - BearerAuth: ["student:read"]
```

### 端点权限矩阵模板

```markdown
| 端点 | admin | teacher | student | parent | 备注 |
|------|-------|---------|---------|--------|------|
| GET /courses | ✅ 全部 | ✅ 全部 | ✅ 已发布 | ✅ 已发布 | student/parent 只见 published |
| POST /courses | ✅ | ✅ | ❌ | ❌ | |
| PUT /courses/{id} | ✅ | ✅ 自己的 | ❌ | ❌ | teacher 行级权限 |
| DELETE /courses/{id} | ✅ | ❌ | ❌ | ❌ | 仅 admin |
| POST /courses/{id}/actions/publish | ✅ | ✅ 自己的 | ❌ | ❌ | |
```

---

## Mock 输出规范

### Mock Schema 设计原则

1. **覆盖所有端点**：每个端点有成功和主要错误的 mock 数据
2. **数据真实可信**：使用接近真实的示例值，不用 "test123"
3. **关系一致**：mock 数据间的 ID 引用关系一致
4. **边界覆盖**：包含空列表、null 字段、最大长度等边界情况

### Mock 数据生成规范

```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/courses",
      "scenarios": [
        {
          "name": "正常列表",
          "status": 200,
          "response": {
            "data": [
              {
                "id": "course_001",
                "title": "高等数学（上）",
                "status": "published",
                "teacher": {
                  "id": "usr_teacher_001",
                  "name": "张教授"
                },
                "student_count": 45,
                "created_at": "2025-09-01T08:00:00Z"
              }
            ],
            "pagination": {
              "page": 1,
              "page_size": 20,
              "total": 1,
              "total_pages": 1
            }
          }
        },
        {
          "name": "空列表",
          "status": 200,
          "response": {
            "data": [],
            "pagination": {
              "page": 1,
              "page_size": 20,
              "total": 0,
              "total_pages": 0
            }
          }
        },
        {
          "name": "未认证",
          "status": 401,
          "response": {
            "error": {
              "code": "UNAUTHORIZED",
              "message": "请先登录",
              "request_id": "req_mock_001"
            }
          }
        }
      ]
    }
  ]
}
```

### Mock 数据 ID 一致性

**铁律**：mock 数据中的 ID 引用必须可追踪。

```json
// ✅ 正确：teacher_id 在 users mock 中有对应记录
{
  "courses": [
    { "id": "course_001", "teacher_id": "usr_teacher_001" }
  ],
  "users": [
    { "id": "usr_teacher_001", "name": "张教授", "role": "teacher" }
  ]
}

// ❌ 错误：teacher_id 是个孤立的 ID，在 users 中找不到
{
  "courses": [
    { "id": "course_001", "teacher_id": "xxx" }
  ]
}
```

---

## 联调契约

### 联调前检查清单

| # | 检查项 | 负责方 | 状态 |
|---|--------|--------|------|
| 1 | 认证流程可走通 | 后端 | ⬜ |
| 2 | 基础 CRUD 请求/响应结构正确 | 前端+后端 | ⬜ |
| 3 | 错误码返回符合契约 | 后端 | ⬜ |
| 4 | 分页参数生效 | 前端+后端 | ⬜ |
| 5 | 过滤/排序/搜索参数生效 | 前端+后端 | ⬜ |
| 6 | 幂等键生效 | 后端 | ⬜ |
| 7 | 权限拦截正确 | 后端 | ⬜ |
| 8 | Mock 数据与契约一致 | API 设计专家 | ⬜ |

### 联调问题记录模板

```markdown
| # | 端点 | 问题描述 | 契约规定 | 实际行为 | 负责方 | 状态 |
|---|------|---------|---------|---------|--------|------|
| 1 | GET /courses | 字段名不一致 | snake_case | camelCase | 后端 | 待修 |
```

### 联调环境约定

```markdown
| 环境 | 地址 | 用途 | 数据 |
|------|------|------|------|
| Mock | {mock_url} | 前端独立开发 | mock-schema.json |
| Dev | {dev_url} | 联调 | 测试数据 |
| Staging | {staging_url} | 预发布验证 | 仿真数据 |
```

---

## 集成约束

### 请求/响应头规范

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | ✅ | Bearer {token} |
| `Content-Type` | ✅（有 body 时） | application/json |
| `Accept` | ❌ | application/json |
| `X-Idempotency-Key` | ❌（写入类推荐） | UUID v4 |
| `X-Request-Id` | ❌ | 客户端请求追踪 ID |

| 响应头 | 说明 |
|--------|------|
| `X-Request-Id` | 请求追踪 ID（echo 请求头或服务端生成） |
| `X-RateLimit-Limit` | 速率限制总量 |
| `X-RateLimit-Remaining` | 剩余请求数 |
| `X-RateLimit-Reset` | 限额重置时间（Unix 时间戳） |
| `Retry-After` | 429 时的等待秒数 |
| `Deprecation` | 废弃端点的下线日期 |

### 速率限制设计

| 维度 | 默认限额 | 说明 |
|------|---------|------|
| 全局（per user） | 100 req/min | 单用户总请求数 |
| 写入（per user） | 30 req/min | 创建/更新/删除 |
| 搜索（per user） | 20 req/min | 搜索类请求 |

### 超时约定

| 操作类型 | 建议超时 | 说明 |
|---------|---------|------|
| 简单查询 | 5s | 单资源查询 |
| 列表查询 | 10s | 含分页/过滤 |
| 写入操作 | 15s | 创建/更新 |
| 复杂操作 | 30s | 批量操作/报表 |
| 文件上传 | 60s+ | 视文件大小 |
