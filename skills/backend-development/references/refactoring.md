# 重构与契约一致性审查

服务边界重构方法 + 契约一致性审查 + 代码结构优化。

> 重构不是"推倒重来"，是在保持外部行为不变的前提下改善内部结构。

---

## 服务边界重构

### 什么时候需要重构

| 信号 | ���重程度 | 说明 |
|------|---------|------|
| 一个 Service 方法超过 100 行 | 🟡 中 | 方法职责不单一 |
| 一个 Service 类超过 500 行 | 🔴 高 | 类职责不单一，需要拆分 |
| 同一逻辑在 3+ 个地方出现 | 🟡 中 | 需要提取公共方法/Service |
| 修改一个功能需要改 5+ 个文件 | 🔴 高 | 模块边界可能有问题 |
| 循环依赖（A 调 B，B 调 A） | 🔴 高 | 需要提取公共层或重新划分 |
| 上帝类（什么都管的 Service） | 🔴 高 | 按业务域拆分 |
| 新需求越来越难加 | 🟡 中 | 结构不支持扩展，需要重构 |

### 重构方法

#### 方法一：提取方法（Extract Method）

```
// Before: 一个方法做三件事
func CreateOrder(command):
    // 30 行：校验库存
    // 40 行：计算价格
    // 20 行：创建订单

// After: 拆分为可读的步骤
func CreateOrder(command):
    validateInventory(command.items)
    pricing = calculatePricing(command.items, command.coupon)
    order = assembleOrder(command, pricing)
    return orderRepo.save(order)
```

#### 方法二：提取 Service（Extract Service）

```
// Before: UserService 既管注册也管积分
class UserService:
    registerUser(...)
    deactivateUser(...)
    calculatePoints(...)
    redeemPoints(...)
    getPointsHistory(...)

// After: 拆分为两个 Service
class UserService:
    registerUser(...)
    deactivateUser(...)

class PointsService:          // 新提取
    calculatePoints(...)
    redeemPoints(...)
    getPointsHistory(...)
```

#### 方法三：引入中间层（Introduce Facade）

```
// Before: Handler 直接编排多个 Service
func CreateOrderHandler(request):
    user = userService.getUser(request.userId)
    inventory = inventoryService.check(request.items)
    price = pricingService.calculate(request.items)
    order = orderService.create(user, inventory, price)

// After: 引入 Facade 层编排
func CreateOrderHandler(request):
    result = orderFacade.createOrder(request.toCommand())

class OrderFacade:
    func createOrder(command):
        user = userService.getUser(command.userId)
        inventory = inventoryService.check(command.items)
        price = pricingService.calculate(command.items)
        return orderService.create(user, inventory, price)
```

#### 方法四：消除循环依赖

```
// Before: 循环依赖
UserService -> OrderService -> UserService

// After 方案 1：提取公共依赖
UserService -> UserQueryService <- OrderService

// After 方案 2：事件解耦
UserService --publish--> UserDeactivatedEvent
OrderService --subscribe--> UserDeactivatedEvent
```

### 重构步骤

1. **识别问题** — 明确要解决什么结构问题
2. **确保测试覆盖** — 重构前确认已有测试覆盖要改动的逻辑
3. **小步修改** — 每次只做一个小改动
4. **每步验证** — 每次改动后运行测试确认不破坏功能
5. **更新文档** — 重构后更新 impl-notes 和模块说明

### 重构检查清单

- [ ] 明确了重构目标和成功标准
- [ ] 重构前有足够的测试覆盖
- [ ] 每步改动可独立验证
- [ ] 外部行为未变（API 契约不变）
- [ ] 新结构比旧结构更清晰
- [ ] 输出了 refactor-summary.md

---

## 契约一致性审查

### 什么是契约一致性

实现代码与上游设计（API 契约 + 数据模型）完全对齐，不多不少不偏。

### 审查清单

#### API 契约对齐

| 检查项 | 对比方法 |
|--------|---------|
| URL 路径 | 实现的路由 vs 契约定义的路径 |
| HTTP Method | 实现用的方法 vs 契约定义的方法 |
| 请求参数 | 实现接收的参数 vs 契约定义的参数（名称/类型/必填） |
| 响应结构 | 实现返回的结构 vs 契约定义的结构（字段/类型/嵌套） |
| 错误码 | 实现抛出的错误码 vs 契约定义的错误码 |
| 状态码 | 实现返回的 HTTP 状态码 vs 契约定义 |
| 分页格式 | 实现的分页参数和响应 vs 通用分页规范 |

#### 数据模型对齐

| 检查项 | 对比方法 |
|--------|---------|
| 表名映射 | Repository 操作的表 vs 数据模型定义的表 |
| 字段映射 | Entity 字段 vs 数据模型字段字典 |
| 约束遵守 | 实现中的校验 vs 数据模型定义的约束 |
| 关联关系 | 实现中的 JOIN/查询 vs 数据模型的关系定义 |
| 状态枚举 | 代码中的状态值 vs 数据模型的状态定义 |

#### 横切一致性

| 检查项 | 说明 |
|--------|------|
| 命名一致 | 同一概念在 handler/service/repo 中命名一致 |
| 错误码一致 | Service 抛出的错误码在契约和错误码规范中有定义 |
| 校验一致 | 实现的校验规则与契约定义的约束一致 |
| 权限一致 | 实现的权限检查与权限模型定义一致 |

### 审查流程

```
1. 列出本次实现涉及的所有接口
2. 逐接口对比契约（URL/Method/参数/响应/错误码）
3. 逐实体对比数据模型（表/字段/约束/关系）
4. 检查横切关注点一致性
5. 记录不一致项
6. 不一致项分类处理：
   - 实现偏差 → 修正实现
   - 契约/模型不合理 → 回流上游讨论
   - 遗漏 → 补充实现
```

---

## 代码结构优化

### 代码坏味道速查

| 坏味道 | 识别方法 | 修复方法 |
|--------|---------|---------|
| 魔法数字/字符串 | 代码中直接出现 `7`、`"pending"` | 提取为常量或枚举 |
| 超长方法 | 方法超过 30 行（handler）或 50 行（service） | Extract Method |
| 超长参数列表 | 方法参数超过 4 个 | 封装为参数对象 |
| 重复代码 | 3+ 处相似逻辑 | 提取公共方法/工具类 |
| 深层嵌套 | if 嵌套超过 3 层 | 提前返回（Guard Clause） |
| 布尔参数 | 方法参数有 boolean 控制行为 | 拆分为两个方法 |
| 注释补代码 | 大段注释解释复杂逻辑 | 重构代码使其自解释 |

### 命名优化

```
// ❌ 差的命名
func process(data)           // 动词太泛
func getUserInfo2(id)        // 数字后缀
func doStuff(params)         // 无意义名称
func handle(request)         // 在非 handler 中使用

// ✅ 好的命名
func calculateTotalScore(studentId)
func findActiveTeachersBySchool(schoolId)
func deactivateExpiredAccounts()
func validateCourseScheduleConflict(schedule)
```

### Guard Clause 模式

```
// ❌ 深层嵌套
func processOrder(order):
    if order != null:
        if order.status == PENDING:
            if order.items.length > 0:
                // 实际逻辑...

// ✅ 提前返回
func processOrder(order):
    if order == null: throw NotFoundError()
    if order.status != PENDING: throw IllegalStateError()
    if order.items.isEmpty(): throw ValidationError("订单项不能为空")

    // 实际逻辑（无嵌套）
    ...
```
