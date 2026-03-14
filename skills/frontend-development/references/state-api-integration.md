# 状态管理与 API 集成

> 覆盖能力方向：#3 API 接入与状态

## API 接入层设计

### 分层架构

```
组件层（消费数据）
  ↑
Hook 层（数据获取逻辑）
  ↑
API 客户端层（请求封装）
  ↑
HTTP 层（axios/fetch 配置）
```

### API 客户端封装

```typescript
// api/client.ts — 统一请求配置
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入 Token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) redirectToLogin();
    return Promise.reject(normalizeError(error));
  }
);
```

### API 模块组织

```
api/
├── client.ts               # HTTP 客户端配置
├── types/                   # API 类型定义（与契约对齐）
│   ├── user.ts
│   └── order.ts
├── user.ts                  # 用户相关接口
├── order.ts                 # 订单相关接口
└── index.ts                 # 统一导出
```

```typescript
// api/user.ts — 按模块封装
import { apiClient } from './client';
import type { User, UserListParams, UserListResponse } from './types/user';

export const userApi = {
  list: (params: UserListParams) =>
    apiClient.get<UserListResponse>('/users', { params }),
  
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),
  
  create: (data: CreateUserRequest) =>
    apiClient.post<User>('/users', data),
  
  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<User>(`/users/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
```

### 类型定义与契约对齐

```typescript
// api/types/user.ts — 必须与 API 契约文档完全匹配

/** GET /users 请求参数 */
interface UserListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  role?: 'admin' | 'member';
  status?: 'active' | 'inactive';
}

/** GET /users 响应 */
interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

/** User 实体 */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  createdAt: string;  // ISO 8601
  updatedAt: string;
}
```

**铁律**：类型定义中的字段名、类型、可选性必须与 API 契约文档一致。不确定时向 API 专家确认，不猜测。

---

## 状态管理方案详解

### 状态分类决策表

| 状态类型 | 特征 | 推荐方案 | 不推荐 |
|---------|------|---------|--------|
| **服务端数据** | 来自 API，需缓存/刷新/同步 | React Query / SWR | 手动 useState+useEffect |
| **UI 临时状态** | 弹窗开关、Hover、焦点 | useState | 全局 store |
| **复杂本地状态** | 多字段联动、状态机 | useReducer | 多个 useState |
| **跨���件共享** | 主题、用户信息、权限 | Context（读多写少）/ Zustand | Props 层层透传 |
| **表单状态** | 字段值、校验、脏检查 | React Hook Form | 手动 useState per field |
| **URL 状态** | 筛选、分页、排序 | URL SearchParams | useState（URL 不可分享） |
| **RSC 数据** | 服务端获取，页面初始数据 | Server Component fetch | 客户端 useEffect |

### 服务端状态管理（React Query 模式）

```typescript
// hooks/useUserList.ts
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';

export function useUserList(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params],  // 参数变化自动重新请求
    queryFn: () => userApi.list(params),
    staleTime: 5 * 60 * 1000,    // 5分钟内认为数据新鲜
  });
}

// 在组件中使用
function UserListPage() {
  const [params, setParams] = useState<UserListParams>({
    page: 1, pageSize: 20
  });
  const { data, isLoading, error } = useUserList(params);
  
  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!data?.items.length) return <EmptyState />;
  
  return <UserTable users={data.items} />;
}
```

### 数据变更与缓存更新

```typescript
// hooks/useDeleteUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      // 变更后刷新列表缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 乐观更新模式

```typescript
// 适用于高频操作（如切换状态、收藏）
useMutation({
  mutationFn: (id: string) => userApi.toggleActive(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['users'] });
    const previous = queryClient.getQueryData(['users']);
    queryClient.setQueryData(['users'], (old) =>
      old.map(u => u.id === id ? { ...u, active: !u.active } : u)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['users'], context.previous);
  },
});
```

### 适配层模式（隔离接口变化）

```typescript
// adapters/userAdapter.ts
// 当 API 返回结构与前端模型不完全匹配时，用适配层转换

import type { ApiUser } from '@/api/types/user';
import type { UserViewModel } from '@/models/user';

export function toUserViewModel(apiUser: ApiUser): UserViewModel {
  return {
    id: apiUser.id,
    displayName: apiUser.name,
    email: apiUser.email,
    roleName: apiUser.role === 'admin' ? '管理员' : '成员',
    isActive: apiUser.status === 'active',
    createdAt: new Date(apiUser.createdAt),
  };
}

// 接口变化时只改适配层，组件不动
```

---

## URL 状态管理

```typescript
// hooks/useUrlParams.ts — 列表页筛选/分页与 URL 同步
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useUrlParams<T extends Record<string, string>>(
  defaults: T
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value !== null) result[key] = value;
    }
    return result;
  }, [searchParams, defaults]);

  const setParams = useCallback((updates: Partial<T>) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === defaults[key]) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, router, pathname, defaults]);

  return [params, setParams] as const;
}
```

---

## 错误处理统一方案

### 错误类型层级

```typescript
// errors/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
  }
}

export class NetworkError extends AppError {
  constructor() {
    super('网络连接失败，请检查网络设置', 'NETWORK_ERROR');
  }
}

export class AuthError extends AppError {
  constructor() {
    super('登录已过期，请重新登录', 'AUTH_ERROR', 401);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('数据验证失败', 'VALIDATION_ERROR', 422, details);
  }
}
```

### 错误码到 UI 消息映射

```typescript
// errors/errorMessages.ts
const ERROR_MESSAGE_MAP: Record<string, string> = {
  'USER_NOT_FOUND': '用户不存在',
  'EMAIL_DUPLICATED': '邮箱已被注册',
  'PERMISSION_DENIED': '权限不足，请联系管理员',
  'QUOTA_EXCEEDED': '操作次数已达上限',
};

export function getErrorMessage(code: string, fallback = '操作失败，请稍后重试'): string {
  return ERROR_MESSAGE_MAP[code] || fallback;
}
```
