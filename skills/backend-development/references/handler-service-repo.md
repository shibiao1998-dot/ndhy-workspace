# 三层实现方法详解

Handler/Controller → Service/Use Case → Repository/DAO 的分层实现方法论。

> 核心原则：每层职责一句话说清。上层不知道下层的实现细节。下层不感知上层的调用场景。

---

## Handler/Controller 层

### 职责定义

Handler 层是**协议适配层**——将 HTTP/RPC/消息 等外部协议转换为 Service 层可消费的调用，再将 Service 结果转换为协议格式的响应。

**一句话**：进来的是 HTTP 请求，出去的是 HTTP 响应，中间只有一次 Service 调用。

### 实现步骤

1. **路由注册**
   - URL 路径 + HTTP Method → Handler 方法的映射
   - 路径参数提取规则
   - API 版本前缀处理

2. **请求解析与参数绑定**
   - Path 参数 → 从 URL 提取
   - Query 参数 → 从查询字符串提取
   - Body 参数 → 反序列化为 Request DTO
   - Header 参数 → 提取认证信息、链路 ID 等

3. **输入校验（基础层）**
   - 格式校验（类型、长度、正则）
   - 必填校验
   - 范围校验
   - 注意：业务规则校验放在 Service 层

4. **调用 Service**
   - 将 DTO 转换为 Service 层参数
   - 一个 Handler 方法通常只调用一个 Service 方法
   - 不在 Handler 中编排多个 Service 调用

5. **响应组装**
   - Service 返回值 → Response DTO → 序列化
   - 统一响应格式包装
   - HTTP 状态码映射

6. **异常转换**
   - Service 层抛出的业务异常 → HTTP 错误响应
   - 通常由全局异常处理器统一处理

### Handler 层的代码结构

```
handler/
├── dto/
│   ├── user_request.go      # 请求 DTO（含校验标签）
│   └── user_response.go     # 响应 DTO
├── middleware/
│   ├── auth.go              # 认证中间件
│   ├── logging.go           # 请求日志中间件
│   └── recovery.go          # panic 恢复
├── user_handler.go          # 用户相关 Handler
└── router.go                # 路由注册
```

### Handler 层的伪代码示例

```
func CreateUser(request):
    // 1. 解析请求
    dto = parseRequestBody(request, CreateUserRequest)

    // 2. 基础校验（框架自动 / 手动调用）
    validate(dto)  // 格式、必填、范围

    // 3. 调用 Service（唯一的业务调用）
    result = userService.RegisterUser(dto.toCommand())

    // 4. 组装响应
    return Response(201, UserResponse.from(result))
```

### Handler 层的陷阱

| 陷阱 | 症状 | 修复 |
|------|------|------|
| 胖 Controller | Handler 方法超过 30 行 | 业务逻辑下沉到 Service |
| 多 Service 编排 | Handler 中调用 2+ 个 Service | 在 Service 层创建编排方法 |
| 直接访问数据库 | Handler 中出现 SQL/ORM 调用 | 通过 Service → Repository 访问 |
| 业务校验前置 | Handler 中做"余额够不够"之类的判断 | 业务校验归 Service 层 |
| 响应格式不统一 | 有的返回 `{data}` 有的返回 `{result}` | 统一响应包装器 |

---

## Service/Use Case 层

### 职责定义

Service 层是**业务核心层**——包含所有业务规则、流程编排和状态管理。读 Service 代码应该能理解业务在做什么，不需要知道数据怎么存、请求从哪来。

**一句话**：所有业务决策在这里做出，所有业务规则在这里执行。

### 实现步骤

1. **定义 Service 接口**
   - 方法签名反映业务意图（`RegisterUser` 而非 `InsertUser`）
   - 入参使用 Command/Query 对象（而非 DTO）
   - 返回业务结果对象（而非 Entity）

2. **业务规则执行**
   - 前置条件检查（业务级校验）
   - 核心业务逻辑执行
   - 后置条件验证

3. **业务流程编排**
   - 多步骤操作的顺序控制
   - 跨 Repository 的数据协调
   - 条件分支处理

4. **状态流转**
   - 状态机驱动的状态变更
   - 状态转换合法性校验
   - 状态变更的副作用触发

5. **事务控制**
   - 在 Service 方法级别声明事务边界
   - 事务范围最小化
   - 避免事务中包含外部调用

6. **事件发布（如需要）**
   - 业务事件定义和发布
   - 事件与事务的一致性

### Service 层的代码结构

```
service/
├── user_service.go          # 接口定义
├── user_service_impl.go     # 实现
├── command/
│   └── register_user.go     # Command 对象
├── query/
│   └── get_user.go          # Query 对象
└── result/
    └── user_result.go       # 业务结果对象
```

### Service 层的伪代码示例

```
func RegisterUser(command RegisterUserCommand):
    // 1. 业务校验
    existingUser = userRepo.findByEmail(command.email)
    if existingUser != null:
        throw BusinessError(USER_ALREADY_EXISTS)

    // 2. 业务逻辑
    user = User.create(
        name: command.name,
        email: command.email,
        passwordHash: hashPassword(command.password),
        role: determineInitialRole(command),
    )

    // 3. 持久化
    savedUser = userRepo.save(user)

    // 4. 副作用（事件/通知）
    eventBus.publish(UserRegisteredEvent(savedUser.id))

    // 5. 返回业务结果
    return UserResult.from(savedUser)
```

### Service 层设计原则

| 原则 | 说明 |
|------|------|
| **业务意图命名** | 方法名反映业务动作，不是 CRUD 操作 |
| **无框架依赖** | Service 代码不依赖 HTTP/Web 框架 |
| **无数据库细节** | 不出现 SQL、ORM 注解、表名 |
| **单一职责** | 一个 Service 方法做一件业务事情 |
| **接口隔离** | 通过接口依赖 Repository，不直接依赖实现 |
| **事务边界明确** | 事务在 Service 方法级别控制 |

### Service 层的陷阱

| 陷阱 | 症状 | 修复 |
|------|------|------|
| 贫血 Service | Service 只是 Repository 的透传 | 将业务规则从 Handler/存储过程移入 |
| 上帝 Service | 一个 Service 方法 200+ 行 | 拆分为多个私有方法或独立 Service |
| 循环依赖 | ServiceA ↔ ServiceB 互相调用 | 提取公共逻辑到新 Service |
| 事务泄漏 | 事务中包含 HTTP 调用/消息发送 | 外部调用移到事务之外 |
| DTO 穿透 | Service 接收/返回 Handler 层 DTO | 使用 Command/Query/Result |

---

## Repository/DAO 层

### 职责定义

Repository 层是**数据访问抽象层**——封装所有数据存取细节，向 Service 层提供面向领域的数据操作接口。切换数据源（MySQL → PostgreSQL、加缓存层）不应影响 Service 层。

**一句话**：数据怎么存、从哪取，都是 Repository 的事。

### 实现步骤

1. **定义 Repository 接口**
   - 面向领域的方法签名（`FindActiveUsers` 而非 `SelectByStatus`）
   - 入参和返回值使用领域对象
   - 分页/排序参数标准化

2. **CRUD 实现**
   - Create：新增记录，返回包含 ID 的实体
   - Read：按主键/条件查询，处理 not found
   - Update：更新指定字段，处理乐观锁
   - Delete：软删除/硬删除按策略执行

3. **查询构建**
   - 条件查询（动态条件组装）
   - 排序规则
   - 分页处理（offset/cursor）
   - 关联查询策略（JOIN vs 多次查询）

4. **数据映射**
   - 数据库行 ↔ 领域实体的转换
   - 处理 NULL 值
   - 类型转换（数据库类型 → 语言类型）
   - JSON 字段处理

5. **缓存策略（如需要）**
   - 读缓存逻辑
   - 缓存失效策略
   - 缓存与数据库一致性

### Repository 层的代码结构

```
repository/
├── user_repository.go          # 接口定义
├── user_repository_impl.go     # 实现（含 SQL/ORM）
├── model/
│   └── user_model.go           # 数据库模型（与领域实体可能不同）
└── converter/
    └── user_converter.go       # 模型 ↔ 实体转换
```

### Repository 层的伪代码示例

```
func FindByEmail(email string) -> User?:
    // 1. 构建查询
    row = db.queryOne("SELECT * FROM users WHERE email = ? AND is_deleted = false", email)

    // 2. 处理未找到
    if row == null:
        return null

    // 3. 数据映射
    return UserConverter.toDomain(row)


func FindActiveUsers(page PageRequest) -> Page<User>:
    // 1. 查询总数
    total = db.count("SELECT COUNT(*) FROM users WHERE status = 'active' AND is_deleted = false")

    // 2. 分页查询
    rows = db.query(
        "SELECT * FROM users WHERE status = 'active' AND is_deleted = false ORDER BY created_at DESC LIMIT ? OFFSET ?",
        page.size, page.offset
    )

    // 3. 映射并返回
    users = rows.map(UserConverter.toDomain)
    return Page(users, total, page)
```

### Repository 层的陷阱

| 陷阱 | 症状 | 修复 |
|------|------|------|
| 业务逻辑下沉 | Repository 中出现 if/else 业务判断 | 业务逻辑上移到 Service |
| SQL 拼接 | 字符串拼接 SQL，有注入风险 | 参数化查询 / ORM |
| N+1 查询 | 循环中逐条查询关联数据 | 批量查询 + 内存组装 |
| 过度 JOIN | 一条 SQL JOIN 5+ 张表 | 拆分查询，在 Service 层组装 |
| 无分页 | 查询可能返回海量数据 | 所有列表查询必须分页 |
| 硬编码 SQL | SQL 散落在代码各处 | 集中管理或使用 ORM |

---

## 三层协作规则

### 调用方向（严格单向）

```
Handler → Service → Repository
   ↓          ↓          ↓
  DTO    Command/     Entity/
         Query/       Model
         Result
```

**禁止**：
- Handler 直接调用 Repository
- Repository 调用 Service
- Service 返回 Handler 层 DTO

### 数据对象转换

| 层 | 入参类型 | 出参类型 | 转换位置 |
|----|---------|---------|---------|
| Handler | Request DTO | Response DTO | Handler 中转换 |
| Service | Command/Query | Result | Service 中转换 |
| Repository | 领域实体/查询参数 | 领域实体/Page | Repository 中转换 |

### 错误传播

```
Repository: 数据库异常 → 包装为 RepositoryException
    ↓
Service: 捕获 RepositoryException → 转换为 BusinessException（含错误码）
    ↓
Handler: BusinessException → 全局异常处理器 → HTTP 错误响应
```

### 事务边界

- 事务声明在 **Service 层方法**上
- Handler 不感知事务
- Repository 不自行开启事务（除非是独立的轻量操作）
- 一个事务对应一个业务操作，不跨 Service 方法

---

## 接口设计原则

### Service 接口设计

```
// ✅ 好的 Service 接口
interface UserService:
    RegisterUser(command RegisterUserCommand) -> UserResult
    DeactivateUser(userId string) -> void
    ChangeUserRole(userId string, newRole Role) -> void
    GetUserProfile(userId string) -> UserProfileResult

// ❌ 差的 Service 接口
interface UserService:
    Insert(user User) -> User
    Update(user User) -> User
    Delete(id string) -> void
    GetById(id string) -> User
```

### Repository 接口设计

```
// ✅ 好的 Repository 接口
interface UserRepository:
    Save(user User) -> User
    FindById(id string) -> User?
    FindByEmail(email string) -> User?
    FindActiveUsers(page PageRequest) -> Page<User>
    ExistsByEmail(email string) -> bool

// ❌ 差的 Repository 接口
interface UserRepository:
    ExecuteSQL(sql string) -> Result
    FindAll() -> List<User>    // 没有分页
    GetUser(id int) -> Map     // 返回弱类型
```
