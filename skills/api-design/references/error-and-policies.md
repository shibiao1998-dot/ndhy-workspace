# 错误码体系与通用策略

## 概览

本文档覆盖：错误码体系设计 → 异常模型 → 分页/过滤/排序/搜索规范 → 幂等/重试语义 → 版本策略。

---

## 错误码体系设计

### 统一错误响应结构

```json
{
  "error": {
    "code": "COURSE_CREATE_DUPLICATE_NAME",
    "message": "课程名称已存在",
    "details": [
      {
        "field": "title",
        "reason": "名称 '数学基础' 已被使用",
        "value": "数学基础"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `code` | ✅ | 机器可读的错误码，客户端用于判断逻辑分支 |
| `message` | ✅ | 人类可读的错误描述，可直接展示给用户 |
| `details` | ❌ | 字段级错误详情，仅 400/422 时填充 |
| `request_id` | ✅ | 请求追踪 ID，所有响应必带 |

### 错误码命名规范

**格式**：`{DOMAIN}_{ACTION}_{REASON}`

| 层级 | 说明 | 示例 |
|------|------|------|
| 通用错误 | 跨域通用 | `VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN` |
| 域级错误 | 业务域相关 | `COURSE_NOT_FOUND`, `STUDENT_ACCESS_DENIED` |
| 操作级错误 | 具体操作相关 | `COURSE_CREATE_DUPLICATE_NAME`, `ASSIGNMENT_SUBMIT_EXPIRED` |

### HTTP 状态码与业务错误码映射

| HTTP 状态码 | 使用场景 | 通用错误码 | 说明 |
|------------|---------|----------|------|
| 400 | 请求参数错误 | VALIDATION_FAILED | details 中列出每个字段的问题 |
| 401 | ��认证 | UNAUTHORIZED | Token 缺失或过期 |
| 403 | 无权限 | FORBIDDEN, ACCESS_DENIED | 认证通过但权限不足 |
| 404 | 资源不存在 | {RESOURCE}_NOT_FOUND | 资源 ID 无效或已删除 |
| 409 | 资源冲突 | DUPLICATE_{RESOURCE}, IDEMPOTENCY_CONFLICT | 唯一约束冲突或幂等键冲突 |
| 422 | 业务规则不满足 | {DOMAIN}_{ACTION}_{REASON} | 参数格式合法但业务不允许 |
| 429 | 限流 | RATE_LIMITED | 附 `Retry-After` 响应头 |
| 500 | 服务端错误 | INTERNAL_ERROR | 不暴露内部细�� |

### 错误码注册表模板

```markdown
| 错误码 | HTTP | 含义 | 触发条件 | 客户端处理建议 |
|--------|------|------|---------|-------------|
| VALIDATION_FAILED | 400 | 参数校验失败 | 字段类型/格式/约束不满足 | 展示 details 中的字段错误 |
| UNAUTHORIZED | 401 | 未认证 | 无 Token 或 Token 过期 | 跳转登录页 |
| FORBIDDEN | 403 | 无权限 | 无此端点的操作权限 | 展示无权限提示 |
| RESOURCE_NOT_FOUND | 404 | 资源不存在 | ID 无效或资源已���除 | 展示"资源不存在"提示 |
| RATE_LIMITED | 429 | 限流 | 超过速率限制 | 按 Retry-After 头等待后重试 |
| INTERNAL_ERROR | 500 | 服务端错误 | 内部异常 | 展示"服务暂时不可用" |
```

---

## 异常模型

### 异常分类

| 类型 | 含义 | HTTP 范围 | 是否可重试 | 详细信息 |
|------|------|----------|----------|---------|
| **客户端错误** | 请求有问题 | 4xx | ❌（需修正后重试） | 提供具体错误原因 |
| **业务规则错误** | 请求合法但业务不允许 | 422 | ❌（需满足前提条件） | 提供业务规则说明 |
| **服务端错误** | 内部异常 | 5xx | ✅（带退避重试） | 不暴露细节 |
| **限流** | 超过速率限制 | 429 | ✅（按 Retry-After） | 提供限流信息 |

### 错误信息安全规范

```
✅ 安全：
  code: "COURSE_NOT_FOUND"
  message: "指定的课程不存在"

❌ 不安全（信息泄露）：
  code: "COURSE_NOT_FOUND"
  message: "在 courses 表中未找到 id=123 的记录，SQL: SELECT * FROM courses WHERE..."
```

**铁律**：
- 4xx 错误：`message` 可安全展示给用户，`details` 提供字段级指引
- 5xx 错误：`message` 为通用文案（如"服务暂时不可用"），内部细节只记日志
- 永远不在错误响应中暴露：SQL、堆栈、内部路径、服务器信息

---

## 分页规范

### Offset 分页（推荐默认方案）

**参数**：

| 参数 | 类型 | 默认值 | 最大值 | 说明 |
|------|------|--------|--------|------|
| `page` | integer | 1 | — | 页码（从 1 开始） |
| `page_size` | integer | 20 | 100 | 每页条数 |

**响应**：

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 142,
    "total_pages": 8
  }
}
```

### Cursor 分页（大数据量/实时流场景）

**参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cursor` | string | null | 游标值（首次请求不传） |
| `limit` | integer | 20 | 每次返回条数 |

**响应**：

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true
  }
}
```

### 分页方案选择

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 管理后台列表 | Offset | 需要跳页、总数 |
| 移动端无限滚动 | Cursor | 性能好、无跳页需求 |
| 数据量 < 10万 | Offset | 简单够用 |
| 数据量 > 10万 + 实时变动 | Cursor | Offset 深页性能差 |

---

## 过滤规范

### 基本过滤

```
GET /courses?status=published&category_id=cat_001
```

### 多值过滤

```
GET /courses?status=published,draft      # 逗号分隔 = OR
```

### 范围过滤

```
GET /courses?created_after=2025-01-01&created_before=2025-12-31
GET /grades?score_min=60&score_max=100
```

### 过滤参数命名规范

| 过滤类型 | 命名模式 | 示例 |
|---------|---------|------|
| 精确匹配 | `{field}` | `?status=active` |
| 多值匹配 | `{field}`（逗号分隔） | `?status=active,draft` |
| 范围-起始 | `{field}_after` 或 `{field}_min` | `?created_after=2025-01-01` |
| 范围-结束 | `{field}_before` 或 `{field}_max` | `?created_before=2025-12-31` |
| 关联资源 | `{resource}_id` | `?teacher_id=usr_001` |
| 模糊匹配 | `{field}_like` | `?title_like=数学` |

---

## 排序规范

### 排序参数格式

```
GET /courses?sort=created_at:desc,title:asc
```

**格式**：`?sort=field1:direction,field2:direction`
- `direction`：`asc`（升序）或 `desc`（降序）
- 默认方向：`desc`（如果不指定）
- 默认排序：`created_at:desc`（如果不传 sort 参数）

### 可排序字段白名单

每个���表端点定义可排序字段白名单，拒绝未声明字段的排序请求：

```yaml
parameters:
  - name: sort
    in: query
    schema:
      type: string
    description: |
      可排序字段：created_at, updated_at, title, sort_order
      格式：field:asc 或 field:desc
      多字段用逗号分隔
```

---

## 搜索规范

### 全文搜索

```
GET /courses?q=数学基础
```

- 参数名统一使用 `q`
- 搜索范围在端点文档中明确说明
- 返回结果按相关度排序（除非指定了 sort）

### 搜索 vs 过滤区分

| 场景 | 使用方式 | 示例 |
|------|---------|------|
| 按关键词全文搜索 | `?q=关键词` | 搜索课程名称和描述 |
| 按确定字段精确过滤 | `?{field}={value}` | 按状态过滤 |
| 组合使用 | `?q=数学&status=published` | 在已发布中搜索"数学" |

---

## 幂等与重试语义

### 幂等键方案

**请求头**：`X-Idempotency-Key: {uuid}`

**适用端点**：所有 POST 和非幂等的 PATCH 请求

**服务端行为**：

```
收到请求
  |- X-Idempotency-Key 存在？
  |   |- 已见过此 key？
  |   |   |- 原始请求已完成？ -> 返回原始响应（200/201）
  |   |   +- 原始请求处理中？ -> 返回 409 Conflict
  |   +- 新 key -> 正常处理 + 保存 key-response 映射
  +- 无 key -> 正常处理（不保证幂等）
```

**幂等键约束**：
- 格式：UUID v4
- 有效期：24 小时（过期后同 key 可重新使用）
- 存储：Redis/DB 均可

### 天然幂等的操作

| Method | 天然幂等？ | 说明 |
|--------|----------|------|
| GET | ✅ | 读取不改变状态 |
| PUT | ✅ | 全量替换，多次执行结果相同 |
| DELETE | ✅ | 删除已删资源 = 404 或 204 |
| POST | ❌ | 需要幂等键 |
| PATCH | ❌ | 增量操作可能不幂等，需要幂等键 |

### 重试策略规范

```
可重试错误：
  - 5xx（服务端错误）
  - 429（限流，按 Retry-After）
  - 网络超时 / 连接中断

不可重试错误：
  - 4xx（除 429）— 请求本身有问题，重试无意义

退避策略：
  - 指数退避 + 随机抖动
  - 基础间隔：1 秒
  - 退避公式：min(base * 2^attempt + random(0, 1000ms), max_interval)
  - 最大间隔：30 秒
  - 最大重试次数：3 次
```

---

## 版本策略

### 三种方案对比

| 方案 | 格式 | 优势 | 劣势 |
|------|------|------|------|
| **URL 前缀** | `/v1/courses` | 直观、易理解、缓存友好 | URL 变更影响大 |
| **Accept Header** | `Accept: application/vnd.api+json;version=1` | URL 不变 | 调试不便、CDN 不友好 |
| **无版本** | `/courses` + 向后兼容演进 | 最简单 | 需要严格的兼容性纪律 |

### 推荐策略

**中小项目**：无版本 + 严格向后兼容。只在确实无法兼容时才引入版本号。

**大型/开放 API**：URL 前缀版本。

### 向后兼容的变更（安全）

- ✅ 新增可选字段
- ✅ 新增端点
- ✅ 新增错误码
- ✅ 放宽字段约束（如 maxLength 增大）

### 破坏性变更（需要版本号或迁移方案）

- ❌ 删除字段
- ❌ 重命名字段
- ❌ 改变字段类型
- ❌ 收紧约束（如 maxLength 缩小、选填变必填）
- ❌ 改变端点路径
- ❌ 改变业务语义
- ❌ 删除错误码

### 废弃流程

```
1. 标记废弃（添加 Deprecation 头 + 文档标注）
   -> Sunset: {date}
   -> Link: <{new-endpoint}>; rel="successor-version"

2. 共存期（新旧同时可用，推荐 3-6 个月）
   -> 监控旧端点流量
   -> 通知所有消费方

3. 下线（返回 410 Gone）
   -> 确认流量为 0 后下线
```
