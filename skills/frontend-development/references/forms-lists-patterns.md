# 表单、列表与业务模式

> 覆盖能力方向：#4 表单校验、#5 列表/详情/分页、#7 弹窗/确认流

## 表单模式

### 表单实现三层结构

```
表单容器（FormContainer）
  ├── 表单布局（字段排列、分组、步骤）
  ├── 字段组件（Input/Select/DatePicker + 校验反馈）
  └── 提交控制（提交/取消/重置 + 防重复）
```

### 校验规则设计

| 校验层 | 职责 | 时机 | 示例 |
|--------|------|------|------|
| **即时校验** | 格式、长度、必填 | onChange / onBlur | 邮箱格式、密码强度 |
| **提交校验** | 跨字段关联、业务规则 | onSubmit | 结束日期 > 开始日期 |
| **服务端校验** | 唯一性、权限、业务状态 | API 返回错误 | 邮箱已注册 |

### 校验规则定义模式

```typescript
// 使用 React Hook Form + Zod 模式
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string()
    .min(2, '姓名至少 2 个字符')
    .max(50, '姓名不超过 50 个字符'),
  email: z.string()
    .email('请输入有效的邮箱地址'),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: '请选择角色' }),
  }),
  password: z.string()
    .min(8, '密码至少 8 位')
    .regex(/[A-Z]/, '需包含大写字母')
    .regex(/[0-9]/, '需包含数字'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});
```

### 表单提交流程

```
用户点击提交
  → 前端校验（Zod schema）
    → 失败 → 显示字段级错误，焦点移到第一个错误字段
    → 通过 → 禁用提交按钮 + 显示 loading
      → 调用 API
        → 成功 → toast 提示 + 跳转/关闭弹窗/刷新列表
        → 失败
          → 422 校验错误 → 将服务端字段错误映射到表单字段
          → 业务错误 → toast 提示错误消息
          → 网络错误 → toast 提示 + 保留表单数据（不清空）
      → 恢复提交按钮状态
```

### 表单反模式

```
❌ 提交失败清空所有输入 → ✅ 保留用户输入，只标记错误字段
❌ 只校验 required → ✅ 覆盖格式/范围/关联/服务端校验
❌ 所有字段 onChange 实时校验 → ✅ onChange 只做格式提示，onBlur 做完整校验
❌ 校验消息写英文 → ✅ 用户能理解的中文提示
❌ 表单状态放全局 store → ✅ 表单状态限定在表单组件/Hook 内
```

---

## 列表模式

### 列表页标准结构

```
ListPage
  ├── FilterBar         # 筛选区（搜索框 + 筛选条件 + 重置）
  ├── ActionBar         # 操作区（新建 + 批量操作 + 导出）
  ├── DataTable/List    # 数据展示区
  │     └── Row/Card    # 单条数据 + 行内操作
  ├── Pagination        # 分页区
  └── EmptyState        # 空态（无数据/筛选无结果）
```

### 分页策略

| 策略 | 适用场景 | 实现要点 |
|------|---------|---------|
| **后端分页** | 大数据量（100+） | URL 参数驱动，page/pageSize 同步到 URL |
| **前端分页** | 小数据量（< 100） | 一次加载全部，前端切片显示 |
| **无限滚动** | Feed 流、消息列表 | IntersectionObserver 触发加载 |
| **游标分页** | 实时数据、不确定总数 | cursor 参数，无页码跳转 |

### 列表数据流

```typescript
// hooks/useListPage.ts — 列表页通用 Hook
export function useListPage<T, P extends PaginationParams>(
  queryKey: string,
  fetchFn: (params: P) => Promise<PaginatedResponse<T>>,
  defaultParams: P
) {
  const [params, setParams] = useUrlParams(defaultParams);
  
  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetchFn(params),
    keepPreviousData: true,  // 翻页时保留旧数据，避免闪烁
  });

  const handlePageChange = (page: number) => 
    setParams({ ...params, page });
  
  const handleFilter = (filters: Partial<P>) => 
    setParams({ ...params, ...filters, page: 1 });  // 筛选重置到第一页
  
  const handleReset = () => setParams(defaultParams);

  return { ...query, params, handlePageChange, handleFilter, handleReset };
}
```

### 列表空态区分

| 空态类型 | 判断条件 | 展示内容 |
|---------|---------|---------|
| **无数据** | 无筛选条件 + 列表为空 | 图标 + "暂无数据" + 引导操作（新建按钮） |
| **筛选无结果** | 有筛选条件 + 列表为空 | "未找到匹配结果" + 清除筛选按钮 |
| **权限不足** | API 返回 403 | "无权限查看" + 联系管理员 |
| **加载失败** | API 返回错误 | 错误提示 + 重试按钮 |

---

## 详情页模式

### 详情页标准结构

```
DetailPage
  ├── BreadcrumbNav      # 面包屑导航
  ├── DetailHeader       # 标题 + 状态 + 操作按钮
  ├── DetailContent      # 主体内容（Tab 或 Section）
  │     ├── BasicInfo    # 基本信息区
  │     ├── RelatedList  # 关联数据区
  │     └── Timeline     # 操作历史/时间线
  └── DetailActions      # 底部操作栏（编辑/删除/返回）
```

### 详情页数据加载

```typescript
// 路由参数获取 ID → 数据加载 → 渲染
function UserDetailPage({ params }: { params: { id: string } }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', params.id],
    queryFn: () => userApi.getById(params.id),
  });

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!user) return <NotFoundState />;

  return (
    <DetailLayout>
      <DetailHeader title={user.name} status={user.status} />
      <DetailContent user={user} />
    </DetailLayout>
  );
}
```

---

## 弹窗与确认流（能力方向 #7）

### 弹窗类型决策

| 类型 | 适用场景 | 实现 |
|------|---------|------|
| **确认弹窗** | 危险操作（删除、提交） | 简单 Dialog + 确认/取消 |
| **表单弹窗** | 快速创建/编辑 | Dialog + Form |
| **信息弹窗** | 详情预览 | Dialog + 只读内容 |
| **抽屉** | 复杂表单、侧边详情 | Drawer（宽内容） |
| **全屏弹窗** | 编辑器、复杂流程 | FullscreenDialog |

### 确认流实现模式

```typescript
// hooks/useConfirmAction.ts
export function useConfirmAction<T>({
  title,
  message,
  action,
  onSuccess,
}: {
  title: string;
  message: string | ((item: T) => string);
  action: (item: T) => Promise<void>;
  onSuccess?: () => void;
}) {
  const [target, setTarget] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirm = (item: T) => setTarget(item);
  const cancel = () => setTarget(null);
  
  const execute = async () => {
    if (!target) return;
    setIsSubmitting(true);
    try {
      await action(target);
      setTarget(null);
      onSuccess?.();
      toast.success('操作成功');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { target, isOpen: !!target, isSubmitting, confirm, cancel, execute };
}

// 使用
const deleteAction = useConfirmAction({
  title: '确认删除',
  message: (user) => `确定删除用户 ${user.name} 吗？此操作不可恢复。`,
  action: (user) => userApi.delete(user.id),
  onSuccess: () => queryClient.invalidateQueries(['users']),
});
```

### 弹窗状态管理原则

```
1. 弹窗开关状态 → 就近管理（触发弹窗的组件内）
2. 弹窗内的表单状态 → 弹窗组件内（弹窗关闭时自动清理）
3. 弹窗操作后的列表刷新 → 通过回调/缓存失效
4. 不要把弹窗状态放进全局 store
5. 嵌套弹窗限制 ≤ 2 层（弹窗套弹窗超过 2 层说明交互设计有问题）
```
