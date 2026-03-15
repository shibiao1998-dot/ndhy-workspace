# 页面骨架与组件设计

> 覆盖能力方向：#1 页面骨架、#2 组件拆分、#11 组件/状态重构

## 页面骨架设计

### 四层结构模型

```
App Shell（全局）
  └── Layout（布局层）
        ├── Header / Sidebar / Footer（导航区）
        └── Page（页面层）
              ├── Section（区域层）
              │     └── Component（组件层）
              └── Section
                    └── Component
```

### Layout 设计原则

| 原则 | 说明 |
|------|------|
| **布局与内容分离** | Layout 只管结构和导航，不管业务数据 |
| **布局嵌套不超过 2 层** | App Layout → Module Layout，不再嵌套 |
| **响应式在 Layout 层处理** | 断点切换、折叠侧边栏在 Layout 统一管理 |
| **路由与 Layout 对应** | 每个路由组对应一个 Layout 变体 |

### 页面骨架实施步骤

1. **识别 Layout 变体**：从设计稿提取所有 Layout 模式（有侧边栏、无侧边栏、全屏等）
2. **定义路由结构**：路由层级 = 页面组织层级，不做平铺
3. **划分 Section**：页面内按功能区域划分（搜索区/列表区/详情区/操作区）
4. **预留插槽**：用 `children` / `slot` 模式，Layout 不硬编码子内容

### 路由组织规范

```
app/
├── layout.tsx                    # 全局 Layout
├── (auth)/                       # 认证相关路由组
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/                  # 主应用路由组
│   ├── layout.tsx                # 带侧边栏的 Layout
│   ├── overview/page.tsx
│   └── settings/page.tsx
└── (public)/                     # 公开页面路由组
    └── layout.tsx                # 无侧边栏 Layout
```

---

## 组件拆分

### 三类组件

| 类型 | 职责 | 特征 | 示例 |
|------|------|------|------|
| **容器组件** | 数据获取、状态管理、编排子组件 | 有副作用、调 API、管状态 | `UserListPage`, `OrderFormContainer` |
| **展示组件** | 纯渲染、接收 Props、触发回调 | 无副作用、可独立测试 | `UserCard`, `StatusBadge`, `DataTable` |
| **逻辑组件（Hook）** | 封装可复用的业务逻辑 | 无 UI、返回数据和方法 | `useUserList`, `useFormSubmit` |

### 5 问拆分决策（详版）

#### Q1: 职责能一句话说清吗？

```
❌ "这个组件负责显示用户列表、处理搜索筛选、管理分页、执行删除操作"
   → 4 个职责，必须拆

✅ 拆分后：
   - UserListPage: 编排用户列表页面
   - UserSearchBar: 处理搜索输入
   - UserTable: 显示用户表格
   - UserPagination: 管理分页
   - useUserList: 获取和管理用户数据
```

#### Q2: 会在别处复用吗？

```
复用信号：
  - 另一个页面需要同样的卡片样式 → 抽取 Card 组件
  - 多个表单有相同的提交逻辑 → 抽取 useFormSubmit Hook
  - 列表页的筛选栏模式重复 → 抽取 FilterBar 组件

不复用也要拆的情况：
  - 组件太大（> 150 行）
  - 职责不单一
  - 无法独立测试
```

#### Q3: 有独立数据源吗？

```
独立数据源 = 独立组件
  - 页面顶部的用户信息区（来自 /api/user/me）→ 独立组件
  - 页面主体的列表区（来自 /api/items）→ 独立组件
  - 页面侧边的统计区（来自 /api/stats）→ 独立组件

每个独立数据源 = 独立的 loading/error 状态 = 独立的 Suspense 边界
```

#### Q4: 能独立测试吗？

```
难以测试的信号：
  - 测试一个按钮需要 mock 整个页面的数据 → 拆出按钮组件
  - 测试一个表单校验需要渲染整个弹窗 → 拆出表单组件
  - 测试一个列表渲染需要准备路由上下文 → 拆出纯展示列表
```

#### Q5: 超过 150 行了吗？

```
行数只是信号，不是硬规则：
  - 150+ 行大概率需要拆
  - 100 行但职责混乱也需要拆
  - 200 行但职责单一、逻辑连贯可以保留（如复杂表单）
```

### Props 接口设计原则

| 原则 | 说明 |
|------|------|
| **最小 Props** | 只传组件真正需要的，不透传整个对象 |
| **接口稳定** | Props 改变 = 破坏性变更，谨慎增删 |
| **默认值合理** | 可选 Props 有合理默认值 |
| **回调命名一致** | `on{Event}` 命名，如 `onChange`, `onSubmit`, `onDelete` |
| **类型严格** | 用 TypeScript interface 定义，不用 any |

```typescript
// ❌ 透传整个对象
interface UserCardProps {
  user: User;  // 传了整个 User，但只用了 name 和 avatar
}

// ✅ 只传需要的
interface UserCardProps {
  name: string;
  avatarUrl: string;
  role: 'admin' | 'member';
  onEdit?: () => void;
}
```

---

## 组件/状态重构（能力方向 #11）

### 重构识别信号

| 信号 | 重构方向 |
|------|---------|
| 多个组件有 50%+ 相同逻辑 | 抽取自定义 Hook |
| 组件 > 200 行且有 3+ 个状态 | 拆分子组件 + Hook |
| 一个 useState 管了 5+ 个字段 | 改用 useReducer |
| 组件直接调 fetch 且到处 try-catch | 统一数据获取层（React Query/SWR） |
| 多个 useEffect 互相依赖 | 重新审视数据流，可能需要重构状态模型 |
| Props 层层透传 > 3 层 | 引入 Context 或组件组合模式 |

### 重构安全守则

1. **先有测试再重构**：没有测试覆盖的代码不重构
2. **小步前进**：每次只改一个方面（拆组件 OR 提取 Hook OR 改状态，不同时做）
3. **保持接口不变**：重构内部实现，不改外部 Props 接口
4. **重构后跑测试**：确认无回归
5. **记录重构理由**：在 PR 描述或代码注释中说明为什么重构

### 常见重构模式

```
模式 1: 抽取 Hook
  Before: 组件内有 useState + useEffect + 数据处理逻辑
  After:  useXxx() 封装状态 + 副作用，组件只管渲染

模式 2: 拆分容器/展示
  Before: 一个组件既 fetch 数据又渲染 UI
  After:  Container(fetch + 状态) → Presenter(纯渲染)

模式 3: 状态提升/下沉
  Before: 父组件管了子组件的局部状态
  After:  状态下沉到真正使用它的子组件

模式 4: 组合替代继承
  Before: 多层 HOC 嵌套
  After:  组合模式 + Render Props / Hook
```
