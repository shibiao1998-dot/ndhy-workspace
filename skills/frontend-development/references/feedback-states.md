# 反馈状态与错误处理

> 覆盖能力方向：#6 loading/empty/error/success 状态、#8 错误反馈

## 5 态全覆盖模型

每个涉及数据的组件必须考虑 5 种状态：

```
        ┌──────────┐
        │ Loading  │  数据加载中
        └────┬─────┘
             │
     ┌───────┴───────┐
     ↓               ↓
┌─────────┐    ┌──────────┐
│ Success │    │  Error   │  加载成功 / 加载失败
└────┬────┘    └──────────┘
     │
     ├── 有数据 → 正常渲染
     └── 无数据 → Empty 状态
     
额外：Disabled 状态（权限不足��功能未开放）
```

### 各状态实现规范

#### Loading 状态

| 场景 | 方案 | 说明 |
|------|------|------|
| 首次加载（页面/区域） | 骨架屏 Skeleton | 占位保持布局稳定，减少 CLS |
| 翻页/筛选加载 | 保留旧数据 + 顶部进度条 | 不用骨架屏，用 `keepPreviousData` |
| 按钮操作中 | 按钮 Loading + Disabled | 防重复提交 |
| 长时间操作（> 3s） | 进度条/步骤条 | 给用户预期 |

```typescript
// 骨架屏组件示例
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

#### Empty 状态

```typescript
interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'no-permission';
  onAction?: () => void;
}

function EmptyState({ type, onAction }: EmptyStateProps) {
  const config = {
    'no-data': {
      icon: <InboxIcon />,
      title: '暂无数据',
      description: '点击下方按钮添加第一条数据',
      actionText: '新建',
    },
    'no-results': {
      icon: <SearchIcon />,
      title: '未找到匹配结果',
      description: '试试调整筛选条件',
      actionText: '清除筛选',
    },
    'no-permission': {
      icon: <LockIcon />,
      title: '暂无权限',
      description: '请联系管理员开通访问权限',
      actionText: undefined,
    },
  }[type];

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">{config.icon}</div>
      <h3 className="text-lg font-medium">{config.title}</h3>
      <p className="text-gray-500 mt-1">{config.description}</p>
      {config.actionText && onAction && (
        <Button onClick={onAction} className="mt-4">{config.actionText}</Button>
      )}
    </div>
  );
}
```

#### Error 状态

| 错误类型 | 判断方式 | UI 反馈 | 用户操作 |
|---------|---------|---------|---------|
| **网络错误** | 无 response / timeout | "网络连接失败" | 重试按钮 |
| **服务器错误** | 5xx | "服务暂时不可用" | 重试按钮 |
| **业务错误** | 4xx + error code | 映射到用户可理解的消息 | 根据错误类型提示 |
| **权限错误** | 401 / 403 | "登录过期" / "权限不足" | 跳转登录 / 联系管理员 |
| **未找到** | 404 | "资源不存在" | 返回列表 |

```typescript
// 通用错误状态组件
function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: AppError; 
  onRetry?: () => void;
}) {
  const isNetworkError = error.code === 'NETWORK_ERROR';
  const isServerError = error.status && error.status >= 500;
  
  return (
    <div className="text-center py-12">
      <AlertCircleIcon className="mx-auto text-red-400 w-12 h-12" />
      <h3 className="text-lg font-medium mt-4">
        {isNetworkError ? '网络连接失败' : 
         isServerError ? '服务暂时不可用' : 
         error.message}
      </h3>
      <p className="text-gray-500 mt-1">
        {isNetworkError ? '请检查网络设置后重试' :
         isServerError ? '请稍后重试' :
         '如问题持续，请联系管理员'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          重试
        </Button>
      )}
    </div>
  );
}
```

#### Success 反馈

| 操作类型 | 反馈方式 | 时机 |
|---------|---------|------|
| 创建 | Toast + 跳转到列表/详情 | API 成功后 |
| 更新 | Toast "保存成功" | API 成功后 |
| 删除 | Toast + 列表刷新 | API 成功后 |
| 批量操作 | Toast "已处理 N 条" | API 成功后 |
| 导入 | Toast + 显示结果摘要 | API 成功后 |

```typescript
// 操作反馈统一封装
function useActionFeedback() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return {
    onCreateSuccess: (message: string, redirectTo?: string) => {
      toast.success(message);
      if (redirectTo) router.push(redirectTo);
    },
    onUpdateSuccess: (queryKey: string) => {
      toast.success('保存成功');
      queryClient.invalidateQueries([queryKey]);
    },
    onDeleteSuccess: (queryKey: string) => {
      toast.success('删除成功');
      queryClient.invalidateQueries([queryKey]);
    },
  };
}
```

---

## 错误边界

### 全局 ErrorBoundary

```typescript
// components/ErrorBoundary.tsx
'use client';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 上报错误监控
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-20">
          <h2>页面出了点问题</h2>
          <p className="text-gray-500">请刷新页面重试</p>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### ErrorBoundary 放置策略

```
App（全局兜底）
  └── Layout
        ├── Sidebar（不需要 EB — 导航不应崩溃）
        └── MainContent
              ├── ErrorBoundary（页面级）
              │     └── Page
              │           ├── ErrorBoundary（区域级 — 可选）
              │           │     └── WidgetA（独立数据源的区域）
              │           └── WidgetB
              └── ErrorBoundary（页面级）
                    └── AnotherPage
```

原则：
- 全局必须有一个
- 每个独立数据区域可以有自己的（区域崩溃不影响页面其他部分）
- 导航区域不要放（导航崩溃 = 用户无法离开）

---

## 按钮防重复提交

```typescript
// hooks/useSubmit.ts
export function useSubmit<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (...args: Parameters<T>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      return await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  }, [fn, isSubmitting]);

  return { submit, isSubmitting };
}

// 使用
function SubmitButton({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const { submit, isSubmitting } = useSubmit(onSubmit);
  return (
    <Button onClick={submit} disabled={isSubmitting}>
      {isSubmitting ? <Spinner /> : null}
      {isSubmitting ? '提交中...' : '提交'}
    </Button>
  );
}
```
