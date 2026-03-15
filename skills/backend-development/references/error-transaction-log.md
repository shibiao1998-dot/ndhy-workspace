# 错误处理、事务边界与日志可观测性

错误处理与错误码映射 + 事务边界设计 + 日志与可观测性的实现方法。

> 无错误码、无日志、无异常分层的实现不算完成。

---

## 错误处理

### 异常分层模型

定义三层异常体系，各层职责明确：

| 层级 | 异常类型 | 来源 | 处理方式 |
|------|---------|------|---------|
| **系统异常** | SystemException | 数据库宕机、网络超时、OOM | 记日志 + 报警 + 返回通用错误 |
| **业务异常** | BusinessException | 业务规则不满足 | 返回对应错误码 + 明确消息 |
| **参数异常** | ValidationException | 输入不合法 | 返回 400 + 字段级错误 |

### 异常定义

```
// 业务异常基类
class BusinessException(code, message, httpStatus=400):
    this.code = code        // 业务错误码
    this.message = message  // 人可读消息
    this.httpStatus = httpStatus

// 具体业务异常
class UserAlreadyExistsException extends BusinessException:
    super("USER_001", "该邮箱已被注册")

class InsufficientBalanceException extends BusinessException:
    super("ORDER_003", "账户余额不足")

class ResourceNotFoundException extends BusinessException:
    super("COMMON_001", "资源不存在", 404)
```

### 全局异常处理器

在 Handler 层之上设置全局异常处理器，统一转换异常为 HTTP 响应：

```
func GlobalExceptionHandler(exception):
    if exception is ValidationException:
        return Response(400, {
            code: "VALIDATION_ERROR",
            message: "输入参数校验失败",
            details: exception.fieldErrors
        })

    if exception is BusinessException:
        return Response(exception.httpStatus, {
            code: exception.code,
            message: exception.message
        })

    if exception is SystemException:
        log.error("系统异常", exception)
        alert(exception)  // 触发告警
        return Response(500, {
            code: "SYSTEM_ERROR",
            message: "系统繁忙，请稍后重试"  // 不暴露内部细节
        })

    // 未知异常
    log.error("未捕获异常", exception)
    return Response(500, {
        code: "UNKNOWN_ERROR",
        message: "系统繁忙，请稍后重试"
    })
```

### 错误码规范

#### 错误码格式

```
{模块前缀}_{序号}

示例：
USER_001  - 用户模块第 1 个错误
AUTH_002  - 认证模块第 2 个错误
ORDER_005 - 订单模块第 5 个错误
```

#### 错误码映射表

每个模块维护一份错误码映射：

| 错误码 | HTTP 状态码 | 含义 | 触发条件 |
|--------|-----------|------|---------|
| USER_001 | 409 | 邮箱已被注册 | 注册时邮箱重复 |
| USER_002 | 404 | 用户不存在 | 查询/操作不存在的用户 |
| USER_003 | 403 | 无权限操作该用户 | 跨权限访问 |
| AUTH_001 | 401 | 未登录 | 缺少/无效 token |
| AUTH_002 | 401 | 登录已过期 | token 过期 |
| AUTH_003 | 403 | 权限不足 | 角色不满足 |
| COMMON_001 | 400 | 参数校验失败 | 输入不合法 |
| COMMON_002 | 404 | 资源不存在 | 通用 not found |
| COMMON_003 | 429 | 请求过于频繁 | 限流触发 |

#### 统一响应格式

```json
// 成功响应
{
    "code": "0",
    "message": "success",
    "data": { ... }
}

// 错误响应
{
    "code": "USER_001",
    "message": "该邮箱已被注册",
    "data": null
}

// 校验错误响应
{
    "code": "VALIDATION_ERROR",
    "message": "输入参数校验失败",
    "data": null,
    "details": [
        { "field": "email", "message": "邮箱格式不正确" },
        { "field": "name", "message": "姓名不能为空" }
    ]
}
```

### 错误处理规范

| 规范 | 说明 |
|------|------|
| **不吞异常** | 每个 catch 块要么处理要么重新抛出，不能空 catch |
| **不暴露内部细节** | 系统异常不向客户端返回堆栈/SQL/内部路径 |
| **错误码必须有** | 每个业务异常必须有明确的错误码 |
| **日志必须有** | 系统异常必须记日志，业务异常按需记录 |
| **异常不做流程控制** | 不用异常代替 if/else 做正常分支判断 |

---

## 事务边界

### 事务设计原则

| 原则 | 说明 |
|------|------|
| **范围最小化** | 事务只包含必须原子的操作 |
| **Service 层声明** | 事务边界在 Service 方法级别 |
| **不跨服务** | 一个事务不调用其他 Service |
| **不含外部调用** | 事务内不做 HTTP/MQ/邮件等外部调用 |
| **失败可重试** | 设计幂等，支持安全重试 |

### 事务实现模式

#### 声明式事务（推荐）

```
@Transactional
func TransferBalance(fromId, toId, amount):
    fromAccount = accountRepo.findById(fromId)
    toAccount = accountRepo.findById(toId)

    fromAccount.debit(amount)
    toAccount.credit(amount)

    accountRepo.save(fromAccount)
    accountRepo.save(toAccount)
    // 事务自动提交或回滚
```

#### 编程式事务（复杂场景）

```
func ComplexOperation():
    // 事务内：数据操作
    txResult = transaction.execute(() => {
        // 原子操作
        order = orderRepo.save(newOrder)
        inventoryRepo.deduct(order.items)
        return order
    })

    // 事务外：外部调用（不在事务内）
    notificationService.sendOrderConfirmation(txResult.id)
    messageQueue.publish(OrderCreatedEvent(txResult))
```

### 事务陷阱

| 陷阱 | 说明 | 修复 |
|------|------|------|
| **长事务** | 事务中包含慢查询/外部调用 | 缩小事务范围，外部调用移出 |
| **嵌套事务** | 方法 A 事务中调用方法 B 事务 | 确认传播行为（REQUIRED/REQUIRES_NEW） |
| **事务不生效** | 同类内部方法调用导致事务注解失效 | 确保通过代理调用 |
| **死锁** | 多事务交叉锁定资源 | 统一加锁顺序 |
| **幻读** | 并发事务看到不一致数据 | 适当提升隔离级别或用乐观锁 |

### 分布式场景（超出单事务范围时）

| 策略 | 适用场景 | 复杂度 |
|------|---------|--------|
| **最终一致性 + 消息队列** | 跨服务操作，可接受短暂不一致 | 中 |
| **Saga 模式** | 多步骤操作需要补偿 | 高 |
| **TCC 模式** | 强一致性要求 | 很高 |

一般优先选择最终一致性方案，只有明确需要时才使用更复杂的方案。

---

## 日志与可观测性

### 日志分层

| 层级 | 内容 | 级别 | 示例 |
|------|------|------|------|
| **请求日志** | 每个 API 请求的入参/出参/耗时 | INFO | `[REQ] POST /api/users 201 45ms` |
| **业务日志** | 关键业务操作和状态变更 | INFO | `[BIZ] User registered: userId=123` |
| **错误日志** | 异常和错误详情 | ERROR | `[ERR] Database timeout: query=...` |
| **调试日志** | 开发阶段的详细信息 | DEBUG | `[DBG] Cache hit: key=user:123` |

### 请求日志实现

通常在**中间件**中实现，自动记录所有请求：

```
func RequestLogMiddleware(request, next):
    requestId = generateRequestId()
    startTime = now()

    // 注入链路 ID
    request.context.set("requestId", requestId)

    response = next(request)

    duration = now() - startTime
    log.info("[REQ] %s %s %d %dms requestId=%s userId=%s",
        request.method, request.path, response.status,
        duration, requestId, request.context.get("userId"))

    return response
```

### 业务日志规范

```
// ✅ 好的业务日志
log.info("[BIZ] User registered",
    "userId", user.id,
    "email", maskEmail(user.email),
    "role", user.role,
    "requestId", ctx.requestId)

log.info("[BIZ] Order status changed",
    "orderId", order.id,
    "from", oldStatus,
    "to", newStatus,
    "operator", currentUser.id)

// ❌ 差的业务日志
log.info("user created")                    // 缺少上下文
log.info("user: " + user.toString())        // 可能泄漏敏感数据
log.info("处理中...")                        // 无意义
```

### 结构化日志格式

采用结构化日志（JSON 格式），便于日志系统检索和分析：

```json
{
    "timestamp": "2026-03-15T10:30:00+08:00",
    "level": "INFO",
    "logger": "UserService",
    "message": "User registered",
    "requestId": "req-abc-123",
    "userId": "user-456",
    "fields": {
        "email": "u***@example.com",
        "role": "STUDENT"
    }
}
```

### 日志敏感数据处理

| 数据类型 | 处理方式 | 示例 |
|---------|---------|------|
| 密码 | 不记录 | `password=***` |
| 手机号 | 中间四位脱敏 | `138****5678` |
| 邮箱 | 用户名部分脱敏 | `u***@example.com` |
| 身份证 | 中间脱敏 | `110***********1234` |
| Token | 只记前 8 位 | `eyJhbGci...` |

### 可观测性基础

| 维度 | 实现方式 | 说明 |
|------|---------|------|
| **链路追踪** | 请求 ID 贯穿全链路 | requestId 从入口到日志、到下游调用 |
| **健康检查** | /health 端点 | 返回服务状态和依赖健康 |
| **关键指标** | 计数器 + 直方图 | 请求量、错误率、响应时间分布 |
| **告警** | 基于指标阈值 | 错误率 > 5%、P99 > 2s 触发告警 |

### 日志检查清单

- [ ] 每个请求有唯一的 requestId
- [ ] 请求日志记录：方法、路径、状态码、耗时
- [ ] 关键业务操作有业务日志
- [ ] 异常有错误日志（含堆栈）
- [ ] 敏感数据已脱敏
- [ ] 日志级别使用正确（不在循环中 INFO）
- [ ] 日志格式结构化（可被日志系统解析）
