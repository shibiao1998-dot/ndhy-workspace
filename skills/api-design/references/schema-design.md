# Schema 设计

## 概览

请求/响应 schema 是契约的核心承载。本文档覆盖：请求/响应结构设计 → 字段语义规范 → 命名规范 → 嵌套结构策略。

---

## 请求结构设计

### 参数位置规范

| 参数位置 | 适用场景 | 示例 |
|---------|---------|------|
| **path** | 资源标识 | `/{resource}/{id}` |
| **query** | 过滤、分页、排序、搜索 | `?page=1&status=active` |
| **header** | 认证、幂等键、版本、追踪 | `Authorization`, `X-Idempotency-Key` |
| **body** | 创建/更新的数据载荷 | JSON 请求体 |

### 请求体设计原则

1. **最小必填原则**：只有业务逻辑必须的字段才标 `required`
2. **创建 vs 更新分离**：Create 和 Update 用不同 schema
   - Create：不含 `id`、`created_at` 等系统字段
   - Update：所有字段可选（部分更新语义），或使用 PUT 全量替换
3. **嵌套控制**：请求体嵌套不超过 3 层
4. **无歧义**：每个字段的含义、类型、约束、示例值都明确

### Create vs Update Schema 对比

```yaml
# 创建请求 — 必填字段明确
CreateCourseRequest:
  type: object
  properties:
    title:
      type: string
      minLength: 1
      maxLength: 200
    description:
      type: string
      maxLength: 2000
    category_id:
      type: string
      format: uuid
  required: [title, category_id]  # 创建时必填

# 更新请求 — 所有字段可选（部分更新）
UpdateCourseRequest:
  type: object
  properties:
    title:
      type: string
      minLength: 1
      maxLength: 200
    description:
      type: string
      maxLength: 2000
  # 无 required — 只更新传入的字段
```

---

## 响应结构设计

### 统一包装结构

**单资源响应**：
```json
{
  "data": {
    "id": "course_001",
    "title": "数学基础",
    "status": "published",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**列表响应**：
```json
{
  "data": [
    { "id": "course_001", "title": "数学基础" },
    { "id": "course_002", "title": "物理入门" }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

**错误响应**：
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "参数校验失败",
    "details": [{ "field": "title", "reason": "不能为空" }],
    "request_id": "req_abc123"
  }
}
```

### 响应字段分类

| 类型 | 说明 | 出现时机 | 示例 |
|------|------|---------|------|
| **核心字段** | 资源本身的业务属性 | 始终返回 | id, title, status |
| **系统字段** | 元数据 | 始终返回 | created_at, updated_at |
| **关联字段** | 关联资源的摘要信息 | 需要时嵌入 | creator: { id, name } |
| **计算字段** | 派生/聚合数据 | 需要时返回 | student_count, progress |

### 字段可见性控制

```yaml
Resource:
  properties:
    id:
      readOnly: true       # 响应才有，请求不接受
    password:
      writeOnly: true      # 请求才有，响应不返回
    title:
      # 无标注 — 请求和响应都有
```

---

## 字段语义规范

### 通用字段语义表

| 字段名 | 类型 | 含义 | 约束 | 使用场景 |
|--------|------|------|------|---------|
| `id` | string | 资源唯一标识 | readOnly, format:uuid | 所有资源 |
| `created_at` | string(date-time) | 创建时间 | readOnly, ISO 8601 | 所有资源 |
| `updated_at` | string(date-time) | 最后更新时间 | readOnly, ISO 8601 | 所有资源 |
| `created_by` | string | 创建者 ID | readOnly | 需要审计的资源 |
| `updated_by` | string | 最后更新者 ID | readOnly | 需要审计的资源 |
| `status` | string(enum) | 资源状态 | readOnly（通过动作端点变更） | 有状态机的资源 |
| `sort_order` | integer | 排序序号 | min:0 | 需要手动排序的资源 |

### 字段类型选择指南

| 业务类型 | OpenAPI 类型 | format | 示例 |
|---------|-------------|--------|------|
| 唯一标识 | string | uuid / snowflake | `"course_001"` |
| 短文本 | string | — (+ maxLength) | `"数学基础"` |
| 长文本 | string | — (+ maxLength) | 描述、备注 |
| 枚举 | string | enum | `"draft" / "published"` |
| 整数 | integer | int32 / int64 | 数量、分数 |
| 小数/金额 | string | decimal | `"99.99"`（避免浮点精度） |
| 布尔 | boolean | — | `true / false` |
| 日期 | string | date | `"2025-01-01"` |
| 时间戳 | string | date-time | `"2025-01-01T00:00:00Z"` |
| 持续时长 | integer | — | 秒数（避免字符串格式不统一） |
| 文件引用 | string | uri | `"https://..."` |
| 嵌套对象 | object | — | 关联资源摘要 |
| 列表 | array | — (+ items) | 标签、附件列表 |

### 金额/数量精度规范

```yaml
# ❌ 错误：使用 number 处理金额
price:
  type: number
  format: float  # 浮点精度问题！

# ✅ 正确：使用 string + decimal 格式
price:
  type: string
  format: decimal
  pattern: "^\\d+\\.\\d{2}$"
  example: "99.99"
  description: "金额，单位元，保留2位小数"

# ✅ 或使用整数（最小单位）
price_cents:
  type: integer
  description: "金额，单位分"
  example: 9999
```

---

## 命名规范

### 字段命名

**选定一种风格后全局一致**：

| 风格 | 示例 | 适用场景 |
|------|------|---------|
| **snake_case** | `created_at`, `page_size` | 推荐（与 JSON/Python/Ruby 生态一致） |
| **camelCase** | `createdAt`, `pageSize` | 与 Java/JavaScript 生态一致 |

> 一旦选定，整个项目所有端点、所有字段必须统一。

### URL 路径命名

- 使用 **kebab-case**：`/student-records`（不是 `/studentRecords`）
- 资源名使用**复数**：`/courses`（不是 `/course`）
- 动作端点使用**动词**：`/courses/{id}/actions/publish`

### 枚举值命名

- 使用 **UPPER_SNAKE_CASE**：`PUBLISHED`, `IN_PROGRESS`
- 或 **lower_snake_case**：`published`, `in_progress`
- 全局统一选一种

### 命名对照检查

| ❌ 不一致 | ✅ 一致 |
|----------|---------|
| `user_id` 和 `userId` 混用 | 全部 `user_id`（如果选了 snake_case） |
| `createTime` 和 `created_at` 混用 | 全部 `created_at` |
| `type` 和 `category` 指同一概念 | 统一用 `category_id` |
| `/courses` 和 `/lesson` 单复数混用 | 全部复数 `/courses`, `/lessons` |

---

## 嵌套结构策略

### 三种关联数据表达方式

| 方式 | 结构 | 适用场景 | 示例 |
|------|------|---------|------|
| **ID 引用** | 只返回 ID | 关联资源有独立详情页 | `"teacher_id": "usr_001"` |
| **摘要嵌入** | 嵌入关键字段 | 列表/卡片需要展示关联信息 | `"teacher": { "id": "usr_001", "name": "张老师" }` |
| **完整嵌入** | 嵌入完整资源 | 详情页需要展示关联全量信息 | `"teacher": { "id": "...", "name": "...", "email": "..." }` |

### 选择决策树

```
消费方是否需要展示关联资源的信息？
  |- 否 -> ID 引用（最轻量）
  +- 是
      |- 只需要 1-3 个字段？ -> 摘要嵌入
      +- 需要完整信息？
          |- 请求量大（列表场景）？ -> 摘要嵌入 + 详情接口
          +- 请求量小（详情场景）？ -> 完整嵌入
```

### 嵌套深度控制

**铁律：嵌套不超过 3 层**

```json
// ✅ 2 层嵌套（OK）
{
  "data": {
    "course": {
      "teacher": { "id": "usr_001", "name": "张老师" }
    }
  }
}

// ❌ 4 层嵌套（过深）
{
  "data": {
    "course": {
      "teacher": {
        "department": {
          "school": { "name": "..." }
        }
      }
    }
  }
}
```

超过 3 层时的处理方案：
1. 拆分为独立端点
2. 使用 ID 引用 + 按需请求
3. 提供 `?expand=teacher.department` 可选展开参数

---

## Nullable 字段处理

### 明确标注策略

```yaml
# 字段确实可能为 null
description:
  type: string
  nullable: true
  description: "课程描述，未填写时为 null"

# 字段不可能为 null（有默认值）
status:
  type: string
  enum: [draft, published, archived]
  description: "课程状态，默认 draft"
  default: "draft"
```

### 区分"未提供"vs"显式置空"

```json
// 部分更新时：
{ "title": "新标题" }                  // 只更新 title
{ "title": "新标题", "description": null }  // 更新 title + 清空 description
// 未出现的字段 = 不更新
```
