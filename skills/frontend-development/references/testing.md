# 前端测试策略

> 覆盖能力方向：#9 组件测试、#10 交互测试、#12 契约消费校验

## 测试分层

```
                        ┌──────────────┐
                        │  E2E 测试     │  少量核心路径
                        │ (Playwright)  │
                   ┌────┴──────────────┴────┐
                   │     交互测试             │  关键用户路径
                   │  (Testing Library)      │
              ┌────┴────────────────────────┴────┐
              │         组件测试                   │  每个组件
              │     (Vitest + Testing Library)    │
         ┌────┴──────────────────────────────────┴────┐
         │              契约校验                        │  每个 API 调用
         │          (TypeScript + Zod)                 │
         └────────────────────────────────────────────┘
```

| 层级 | 工具 | 关注点 | 数量 |
|------|------|--------|------|
| **契约校验** | TypeScript strict + Zod runtime | API 类型一致性 | 每个接口 |
| **组件测试** | Vitest + React Testing Library | 渲染/Props/状态/事件 | 每个关键组件 |
| **交互测试** | React Testing Library + MSW | 用户路径端到端 | 核心路径 |
| **E2E 测试** | Playwright | 真实浏览器全流程 | 关键业务流程 |

---

## 组件测试（能力方向 #9）

### 测试什么

| 测试维度 | 示例 |
|---------|------|
| **渲染正确** | 给定 Props，组件渲染出预期内容 |
| **Props 响应** | Props 变化，UI 相应更新 |
| **状态变化** | 点击操作后，状态正确切换 |
| **事件触发** | 用户操作触发正确的回调 |
| **条件渲染** | 不同条件下显示/隐藏正确的元素 |
| **边界状态** | 空数据、超长文本、极端值 |

### 组件测试示例

```typescript
// components/__tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '../UserCard';

describe('UserCard', () => {
  const defaultProps = {
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin' as const,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders user information', () => {
    render(<UserCard {...defaultProps} />);
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', async () => {
    render(<UserCard {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '编辑' }));
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation before calling onDelete', async () => {
    render(<UserCard {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '删除' }));
    // 确认弹窗出现
    expect(screen.getByText('确认删除')).toBeInTheDocument();
    // 点击确认
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders empty state for undefined optional props', () => {
    render(<UserCard {...defaultProps} avatar={undefined} />);
    expect(screen.getByTestId('default-avatar')).toBeInTheDocument();
  });
});
```

### 测试命名规范

```
describe('{ComponentName}')
  it('renders {what} when {condition}')
  it('calls {callback} when {user action}')
  it('shows {element} after {state change}')
  it('disables {element} when {condition}')
```

---

## 交互测试（能力方向 #10）

### 测试什么

关键用户路径（Happy Path + 主要错误路径）：

| 路径类型 | 示例 |
|---------|------|
| **创建流程** | 填表单 → 提交 → 成功提示 → 列表刷新 |
| **列表筛选** | 输入关键词 → 点搜索 → 列表更新 → 清除筛选 |
| **详情查看** | 列表点击 → 跳转详情 → 数据加载 → 显示 |
| **删除流程** | 点击删除 → 确认弹窗 → 确认 → 列表刷新 |
| **错误处理** | 提交表单 → API 返回错误 → 错误提示显示 |

### 使用 MSW Mock API

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    
    return HttpResponse.json({
      items: mockUsers.slice((page - 1) * 20, page * 20),
      total: mockUsers.length,
      page,
      pageSize: 20,
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-1', ...body }, { status: 201 });
  }),

  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### 交互测试示例

```typescript
// features/__tests__/UserManagement.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

describe('User Management Flow', () => {
  it('creates a user and refreshes the list', async () => {
    render(<UserListPage />);
    
    // 等待列表加载
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
    
    // 点击新建
    await userEvent.click(screen.getByRole('button', { name: '新建用户' }));
    
    // 填写表单
    await userEvent.type(screen.getByLabelText('姓名'), '新用户');
    await userEvent.type(screen.getByLabelText('邮箱'), 'new@example.com');
    await userEvent.selectOptions(screen.getByLabelText('角色'), 'member');
    
    // 提交
    await userEvent.click(screen.getByRole('button', { name: '提交' }));
    
    // 验证成功反馈
    await waitFor(() => {
      expect(screen.getByText('创建成功')).toBeInTheDocument();
    });
  });

  it('shows validation errors on invalid submission', async () => {
    render(<UserListPage />);
    await userEvent.click(screen.getByRole('button', { name: '新建用户' }));
    
    // 不填任何内容直接提交
    await userEvent.click(screen.getByRole('button', { name: '提交' }));
    
    // 验证错误提示
    expect(screen.getByText('姓名至少 2 个字符')).toBeInTheDocument();
    expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    // Mock API 返回错误
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(
          { code: 'EMAIL_DUPLICATED', message: '邮箱已被注册' },
          { status: 409 }
        );
      })
    );

    render(<UserListPage />);
    // ... 填写表单并提交
    
    await waitFor(() => {
      expect(screen.getByText('邮箱已被注册')).toBeInTheDocument();
    });
  });
});
```

---

## 契约消费校验（能力方向 #12）

### 静态校验（TypeScript）

```typescript
// 确保 API 调用层的类型定义与契约文档一致
// api/types/user.ts 的类型定义必须与 OpenAPI/契约文档逐字段对照

// 校验清单：
// ✅ 字段名完全匹配（不用别名）
// ✅ 字段类型匹配（string/number/boolean/enum）
// ✅ 必填/可选匹配
// ✅ 枚举值范围匹配
// ✅ 嵌套对象结构匹配
// ✅ 数组元素类型匹配
```

### 运行时校验（Zod）

```typescript
// validators/user.ts — 对 API 响应做运行时校验
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UserListResponseSchema = z.object({
  items: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// 在 API 客户端层使用
export async function fetchUsers(params: UserListParams) {
  const response = await apiClient.get('/users', { params });
  // 开发环境做运行时校验，发现契约偏差
  if (process.env.NODE_ENV === 'development') {
    UserListResponseSchema.parse(response);
  }
  return response as UserListResponse;
}
```

### 契约一致性检查清单

| # | 检查项 | 说明 |
|---|--------|------|
| 1 | **Endpoint 路径** | 前端调用的 URL 与契约文档一致 |
| 2 | **HTTP 方法** | GET/POST/PUT/DELETE 与契约一致 |
| 3 | **请求参数** | query/path/body 参数名称、类型、必填性一致 |
| 4 | **响应字段** | 响应 body 的字段名、类型、嵌套结构一致 |
| 5 | **错误码** | 前端处理的错误码覆盖契约定义的所有错误码 |
| 6 | **枚举值** | 前端使用的枚举值范围与契约一致 |
| 7 | **分页参数** | page/pageSize/cursor 命名和语义一致 |
| 8 | **认证方式** | Token 传递方式与契约一致 |
