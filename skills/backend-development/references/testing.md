# 测试指南

单元测试编写 + 集成测试支撑 + 测试策略与覆盖。

> 没有测试就默认实现正确——这是最危险的反模式。

---

## 测试策略

### 测试金字塔

```
         /  E2E 测试  \          少量，验证核心链路
        / 集成测试支撑  \        中量，验证模块协作
       /   单元测试      \      大量，验证业务逻辑
```

后端开发专家主要负责底部两层：**单元测试**和**集成测试支撑代码**。E2E 测试由测试专家负责。

### 什么必须测、什么可以不测

| 必须测 | 可以不测 |
|--------|---------|
| Service 层核心业务逻辑 | 纯 getter/setter |
| 状态流转和边界条件 | 框架生成的样板代码 |
| 错误处理和异常路径 | 简单的数据映射 |
| 复杂的条件分支 | 第三方库的功能 |
| 公共工具方法 | Handler 层的参数绑定（框架负责） |
| 权限判断逻辑 | Repository 的简单 CRUD（集成测试覆盖） |

---

## 单元测试

### 测试结构：Given-When-Then

每个测试用例遵循三段式结构：

```
func TestRegisterUser_Success():
    // Given: 准备前置条件
    command = RegisterUserCommand(
        name: "张三",
        email: "zhangsan@example.com",
        password: "Abc12345"
    )
    userRepo.mock(findByEmail("zhangsan@example.com") -> null)
    userRepo.mock(save(any) -> User(id: "1", ...))

    // When: 执行被测行为
    result = userService.RegisterUser(command)

    // Then: 验证结果
    assert result.id == "1"
    assert result.name == "张三"
    verify userRepo.save(calledOnce)
    verify eventBus.publish(UserRegisteredEvent, calledOnce)
```

### 测试命名规范

```
Test{方法名}_{场景}_{预期结果}

示例：
TestRegisterUser_EmailAlreadyExists_ThrowsBusinessError
TestRegisterUser_ValidInput_ReturnsUserResult
TestCalculateScore_ScoreBelow60_StatusFailed
TestDeactivateUser_UserAlreadyInactive_ThrowsIllegalStateError
TestTransferBalance_InsufficientBalance_ThrowsBusinessError
TestTransferBalance_SameAccount_ThrowsValidationError
```

### Mock 策��

| 对象 | Mock 方式 | 原因 |
|------|---------|------|
| Repository | Mock 接口 | 单元测试不依赖数据库 |
| 外部服务 | Mock 客户端 | 不依赖外部可用性 |
| 事件发布 | Mock EventBus | 验证事件发布而非处理 |
| 当前时间 | 注入 Clock | 让时间相关逻辑可测 |
| 当前用户 | 注入 Context | 让权限逻辑可测 |

```
// Mock 示例
userRepo = MockUserRepository()
userRepo.when(findByEmail("existing@test.com")).thenReturn(existingUser)
userRepo.when(findByEmail("new@test.com")).thenReturn(null)
userRepo.when(save(any)).thenAnswer(user => user.withId("generated-id"))

userService = UserServiceImpl(userRepo, eventBus, clock)
```

### 必须覆盖的测试场景

#### 正常流程测试

- 标准输入 → 正确输出
- 各种合法参数组合
- 返回值结构完整性

#### 异常路径测试

```
func TestRegisterUser_EmailAlreadyExists():
    // Given
    userRepo.mock(findByEmail("existing@test.com") -> existingUser)
    command = RegisterUserCommand(email: "existing@test.com", ...)

    // When & Then
    assertThrows(BusinessException, code: "USER_001") {
        userService.RegisterUser(command)
    }
```

#### 边界条件测试

| 边界类型 | 测试用例 |
|---------|---------|
| 空值 | null/空字符串/空列表 |
| 边界值 | 最大值/最小值/刚好超出 |
| 特殊字符 | Unicode/emoji/超长字符串 |
| 并发 | 同时操作同一资源 |
| 状态边界 | 终态操作/非法状态转换 |

```
func TestCalculateScore_BoundaryValues():
    assert calculateGrade(100) == "A"   // 最大值
    assert calculateGrade(0) == "F"     // 最小值
    assert calculateGrade(60) == "D"    // 及格线
    assert calculateGrade(59) == "F"    // 不及格边界
    assertThrows(ValidationError) { calculateGrade(101) }  // 超出范围
    assertThrows(ValidationError) { calculateGrade(-1) }   // 负数
```

#### 权限测试

```
func TestDeleteStudent_AsTeacher_Allowed():
    context.setCurrentUser(teacherUser)
    // 不抛异常即通过

func TestDeleteStudent_AsStudent_Forbidden():
    context.setCurrentUser(studentUser)
    assertThrows(ForbiddenException) {
        studentService.deleteStudent("student-1")
    }
```

### 单元测试检查清单

- [ ] 每个 public Service 方法有对应测试
- [ ] 正常流程至少 1 个测试
- [ ] 每个业务异常有对应异常路径测试
- [ ] 关键边界条件有测试
- [ ] 测试命名清晰描述场景
- [ ] Mock 对象正确设置
- [ ] 测试可独立运行（不依赖顺序/外部服务）
- [ ] 测试执行速度快（秒级完成）

---

## 集成测试支撑

后端开发专家不负责编写完整的集成测试用例，但需要提供**测试支撑代码**，让测试专家能高效工作。

### 测试支撑代码清单

| 支撑类��� | 内容 | 示例 |
|---------|------|------|
| **测试基类** | 数据库初始化、事务回滚、环境配置 | `BaseIntegrationTest` |
| **TestFixture** | 预置测试数据 | `UserFixture.createTeacher()` |
| **TestBuilder** | 构建复杂测试对象 | `UserBuilder().withRole(ADMIN).build()` |
| **Mock 配置** | 外部服务 Mock 的默认配置 | `MockExternalService.defaultConfig()` |
| **测试配置** | 测试环境专用配置文件 | `application-test.yml` |
| **数据清理** | 测试后清理数据的工具 | `TestDataCleaner.cleanAll()` |

### TestFixture 示例

```
class UserFixture:
    static func createStudent(overrides = {}):
        defaults = {
            name: "测试学生",
            email: "student@test.com",
            role: STUDENT,
            status: ACTIVE,
            classId: "class-001"
        }
        return User.create({...defaults, ...overrides})

    static func createTeacher(overrides = {}):
        defaults = {
            name: "测试教师",
            email: "teacher@test.com",
            role: TEACHER,
            status: ACTIVE,
            managedClassIds: ["class-001", "class-002"]
        }
        return User.create({...defaults, ...overrides})

    static func createAdmin(overrides = {}):
        // ...
```

### TestBuilder 示例

```
class OrderBuilder:
    orderId = "order-001"
    userId = "user-001"
    status = PENDING
    items = []

    func withStatus(status): this.status = status; return this
    func withItem(productId, quantity, price):
        items.add(OrderItem(productId, quantity, price))
        return this
    func build():
        return Order(orderId, userId, status, items, calculateTotal(items))

// 使用
order = OrderBuilder()
    .withStatus(PAID)
    .withItem("prod-1", 2, 99.0)
    .withItem("prod-2", 1, 49.0)
    .build()
```

### 测试配置示例

```yaml
# application-test.yml
database:
  url: jdbc:h2:mem:testdb        # 内存数据库
  driver: org.h2.Driver

cache:
  type: local                     # 本地缓存替代 Redis

external:
  payment-service:
    enabled: false                # 禁用外部服务
    mock: true
```

### 集成测试支撑检查清单

- [ ] 提供了 TestFixture，覆盖核心实体的预置数据
- [ ] 提供了 TestBuilder（如有复杂对象）
- [ ] 提供了测试配置文件
- [ ] 记录了测试环境依赖（数据库、中间件等）
- [ ] 记录了测试数据的初始化和清理方式
- [ ] 在 test-notes.md 中说明了测试运行方式

---

## 测试最佳实践

| 实践 | 说明 |
|------|------|
| **测试独立** | 测试之间不依赖执行顺序 |
| **测试快速** | 单元测试秒级完成，不依赖外部服务 |
| **测试可读** | 测试即文档，读测试就能理解业务 |
| **测试可重复** | 每次运行结果一致 |
| **一个测试一个断言** | 一个测试验证一个行为（可多个 assert 验证同一行为） |
| **不测实现细节** | 测试行为和结果，不测内部方法调用次数 |
