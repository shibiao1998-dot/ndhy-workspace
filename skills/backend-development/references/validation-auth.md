# 输入校验与权限控制

输入校验和权限控制的实现方法、模式与规范。

> 校验和权限是正式实现的一部分，不是"后面再补"的东西。

---

## 输入校验

### 校验分层

校验分为两层，在不同位置执行：

| 层级 | 位置 | 校验内容 | 示例 |
|------|------|---------|------|
| **格式校验** | Handler 层 | 类型、格式、长度、必填、范围 | 邮箱格式、手机号长度、年龄 > 0 |
| **业务校验** | Service 层 | 业务规则、唯一性、状态合法性 | 邮箱未被注册、订单状态允许取消 |

**铁律**：格式校验不依赖数据库。业务校验可以查数据库。

### 格式校验实现

#### 方式一：声明式校验（推荐）

利用框架提供的校验注解/标签，在 DTO 上声明校验规则：

```
// Request DTO 示例
class CreateUserRequest:
    @NotBlank @MaxLength(50)
    name: string

    @NotBlank @Email
    email: string

    @NotBlank @MinLength(8) @Pattern(含大小写数字)
    password: string

    @NotNull @Enum(STUDENT, TEACHER, ADMIN)
    role: string
```

#### 方式二：手动校验（复杂场景）

当校验逻辑复杂或跨字段时，手动编写校验函数：

```
func validateDateRange(startDate, endDate):
    if startDate == null: error("开始日期不能为空")
    if endDate == null: error("结束日期不能为空")
    if endDate < startDate: error("结束日期不能早于开始日期")
    if endDate - startDate > 365: error("日期范围不能超过一年")
```

### 业务校验实现

在 Service 层方法开头执行业务前置条件检查：

```
func RegisterUser(command):
    // 业务校验
    if userRepo.existsByEmail(command.email):
        throw BusinessError(USER_EMAIL_ALREADY_EXISTS)

    if command.role == ADMIN && !currentUser.isSuperAdmin():
        throw BusinessError(INSUFFICIENT_PERMISSION_FOR_ADMIN_ROLE)

    // ... 继续业务逻辑
```

### 校验规范

| 规范 | 说明 |
|------|------|
| **校验顺序** | 格式校验 → 权限校验 → 业务校验 |
| **快速失败** | 第一个校验失败即返回，不继续后续校验 |
| **批量校验** | 格式校验可一次返回所有错误（提升用户体验） |
| **错误消息** | 明确、具体，告诉调用方哪个字段有什么问题 |
| **校验可测试** | 校验逻辑可独立测试，不依赖 HTTP 上下文 |

### 常见校验类型速查

| 类型 | 校验内容 | 实现位置 |
|------|---------|---------|
| 必填 | 字段不为 null/空 | Handler（声明式） |
| 长度 | 字符串最小/最大长度 | Handler（声明式） |
| 范围 | 数值最小/最大值 | Handler（声明式） |
| 格式 | 邮箱/手机/URL/日期 | Handler（声明式） |
| 枚举 | 值在允许列表内 | Handler（声明式） |
| 正则 | 自定义模式匹配 | Handler（声明式） |
| 跨字段 | 字段间��逻辑关系 | Handler（手动） |
| 唯一性 | 数据库中不重复 | Service（需查库） |
| 存在性 | 引用的数据存在 | Service（需查库） |
| 状态合法 | 当前状态允许操作 | Service（需查库） |
| 权限满足 | 用户有权执行操作 | Service / 中间件 |

---

## 权限控制

### 权限模型三层

| 层级 | 含义 | 实现位置 | 示例 |
|------|------|---------|------|
| **认证** | 你是谁 | 全局中间件 | JWT 验证、Session 验证 |
| **授权** | 你能做什么 | 方法级注解/中间件 | RBAC 角色检查、权限点检查 |
| **数据权限** | 你能看到/操作哪些数据 | Service 层 | 只能查看自己班级的学生 |

### 认证实现

认证通常在**全局中间件**中实现，所有需要认证的接口共享：

```
// 认证中间件伪代码
func AuthMiddleware(request, next):
    token = request.header("Authorization")
    if token == null:
        throw UnauthorizedError("missing token")

    claims = verifyToken(token)
    if claims == null:
        throw UnauthorizedError("invalid token")

    if claims.isExpired():
        throw UnauthorizedError("token expired")

    // 将用户信息注入上下文
    request.context.set("currentUser", claims.toUser())
    return next(request)
```

### 授权实现

#### 方式一：基于角色的访问控制（RBAC）

```
// 声明式：注解/装饰器
@RequireRole(ADMIN, TEACHER)
func DeleteStudent(request):
    // 只有 ADMIN 和 TEACHER 角色可访问
    ...

// 编程式：手动检查
func DeleteStudent(request):
    if !currentUser.hasRole(ADMIN, TEACHER):
        throw ForbiddenError(INSUFFICIENT_ROLE)
    ...
```

#### 方式二：基于权限点的访问控制

```
@RequirePermission("student:delete")
func DeleteStudent(request):
    ...
```

#### 方式三：组合检查

```
// 先检查角色，再检查具体权限
func UpdateCourseScore(request):
    requireRole(TEACHER)
    requirePermission("score:update")
    ...
```

### 数据权限实现

数据权限在 **Service 层**实现，因为它涉及业务逻辑：

```
func GetStudentList(query, currentUser):
    // 数据权限：教师只能看自己班级的学生
    if currentUser.role == TEACHER:
        query.classIds = currentUser.managedClassIds
    elif currentUser.role == PARENT:
        query.studentIds = currentUser.childStudentIds
    // ADMIN 不做限制

    return studentRepo.findByQuery(query)
```

### 权限控制规范

| 规范 | 说明 |
|------|------|
| **��认拒绝** | 未明确授权的操作默认拒绝 |
| **最小权限** | 只授予完成工作所需的最小权限 |
| **认证前置** | 认证失败不进入授权检查 |
| **数据权限不可绕过** | 即使有功能权限，也要过数据权限 |
| **权限可审计** | 权限检查结果写入日志 |
| **权限可测试** | 权限逻辑有独立的单元测试 |

### 权限实现清单

- [ ] 所有接口标注了认证要求（需要认证/公开）
- [ ] 需要授权的接口标注了角色/权限要求
- [ ] 数据权限在 Service 层实现
- [ ] 认证失败返回 401，授权失败返回 403
- [ ] 权限错误消息不泄漏敏感信息
- [ ] 有权限相关的单元测试

---

## 参数处理规范

### 参数来源与优先级

| 参数来源 | 用途 | 处理方式 |
|---------|------|---------|
| Path 参数 | 资源标识 | ���填，类型转换 + 格式校验 |
| Query 参数 | 过滤/分页/排序 | 可选，给默认值 |
| Body 参数 | 创建/修改数据 | 反序列化为 DTO + 声明式校验 |
| Header 参数 | 认证/元数据 | 中间件提取 |

### 参数默认值

```
// 分页参数默认值
page = request.query.get("page", default=1)
pageSize = request.query.get("pageSize", default=20)
pageSize = min(pageSize, 100)  // 防止过大页码

// 排序参数默认值
sortBy = request.query.get("sortBy", default="created_at")
sortOrder = request.query.get("sortOrder", default="desc")
```

### 参数安全处理

| 风险 | 处理方式 |
|------|---------|
| SQL 注入 | 参数化查询，不拼接 SQL |
| XSS | 输出编码（不在后端存储时转义，在输出时处理） |
| 超长输入 | 长度限制 + 请求体大小限制 |
| 类型混淆 | 严格类型转换，失败���报错 |
| 批量操作过载 | 限制批量操作的最大数量 |
| 深度嵌套 | 限制 JSON 嵌套深度 |
