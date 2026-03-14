# 教育行业前端适配

> 教育产品的前端实现有特殊约束和需求，本文档补充行业特定的适配策略。

## 多角色界面适配

教育产品通常有 4 种角色端，每种有不同的布局和交互模式：

### 角色端差异

| 角色端 | 布���特征 | 交互特征 | 优先设备 |
|--------|---------|---------|---------|
| **教师端** | 密集操作面板、多 Tab | 频繁切换、批量操作 | PC/平板 |
| **学生端** | 内容为主、沉浸式 | 线性流程、简单交互 | 手机/平板 |
| **家长端** | 信息卡片、通知流 | 查看为主、少操作 | 手机 |
| **管理端** | 数据表格、Dashboard | 配置管理、数据导出 | PC |

### 多角色实现策略

```
方案 A: 独立应用（推荐大型产品）
  teacher-app/   # 教师端独立应用
  student-app/   # 学生端独立应用
  admin-app/     # 管理端独立应用
  shared/        # 共享组件和 API 层

方案 B: 角色路由（推荐 MVP）
  app/
  ├── (teacher)/   # 教师端路由组
  ├── (student)/   # 学生端路由组
  ├── (parent)/    # 家长端路由组
  └── (admin)/     # 管理端路由组
  components/
  ├── shared/      # 跨角色共享组件
  └── role-specific/  # 角色专属组件
```

### 角色切换

```typescript
// 基于用户角色的 Layout 切换
function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  
  const LayoutComponent = {
    teacher: TeacherLayout,
    student: StudentLayout,
    parent: ParentLayout,
    admin: AdminLayout,
  }[role];

  return <LayoutComponent>{children}</LayoutComponent>;
}
```

---

## 低带宽与设备适配

教育场景常见低带宽环境（农村学校、移动网络）和老旧设备。

### 性能优化策略

| 策略 | 实现方式 | 优先级 |
|------|---------|--------|
| **图片懒加载** | `loading="lazy"` + IntersectionObserver | 🔴 必须 |
| **图片压缩** | WebP 格式 + 响应式 srcset | 🔴 必须 |
| **代码分割** | 路由级 dynamic import | 🔴 必须 |
| **离线缓存** | Service Worker + Cache API | 🟡 按需 |
| **轻量组件** | 避免重型 UI 库，按需引入 | 🟡 按需 |
| **静态预渲染** | 课程内容等静态页面用 SSG | 🟡 按需 |
| **数据预取** | 列表页预取详情页数据 | 🟢 优化 |

### 离线能力（按需）

```typescript
// 作业提交场景：本地暂存 + 网络恢复后同步
function useOfflineSubmit<T>(key: string, submitFn: (data: T) => Promise<void>) {
  const submit = async (data: T) => {
    try {
      await submitFn(data);
      localStorage.removeItem(`offline_${key}`);
    } catch (error) {
      if (isNetworkError(error)) {
        // 保存到本地，等网络恢复
        localStorage.setItem(`offline_${key}`, JSON.stringify(data));
        toast.info('已保存到本地，网络恢复后将自动提交');
      } else {
        throw error;
      }
    }
  };

  // 网络恢复时自动重试
  useEffect(() => {
    const handler = async () => {
      const saved = localStorage.getItem(`offline_${key}`);
      if (saved) {
        try {
          await submitFn(JSON.parse(saved));
          localStorage.removeItem(`offline_${key}`);
          toast.success('离线数据已同步');
        } catch { /* 下次再试 */ }
      }
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [key, submitFn]);

  return submit;
}
```

---

## 无障碍要求

教育产品需要满足更高的无障碍标准（WCAG 2.1 AA）。

### 必须实现

| 要求 | 实现 |
|------|------|
| **大字号模式** | 支持字号缩放（rem 单位 + 根字号可调） |
| **高对比度** | 文本对比度 ≥ 4.5:1，支持高对比度主题 |
| **键盘导航** | 所有交互元素可 Tab 到达、Enter/Space 激活 |
| **屏幕阅读器** | 语义化 HTML + aria-label + aria-live |
| **焦点可见** | 焦点环清晰可见，不被 outline:none 消除 |
| **动画可关闭** | 尊重 prefers-reduced-motion |

```css
/* 尊重系统字号偏好 */
html {
  font-size: 100%; /* 不用 px 固定，跟随系统设置 */
}

/* 尊重动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度支持 */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --bg-primary: #ffffff;
    --border-color: #000000;
  }
}
```

---

## 实时交互场景

教育场景特有的实时交互需求。

### 场景与方案

| 场景 | 技术方案 | 注意点 |
|------|---------|--------|
| **课堂互动** | WebSocket + 消息队列 | 断线重连、消息顺序 |
| **在线考试** | 倒计时 + 防切屏 + 自动保存 | 页面可见性 API |
| **作业提交** | 大文件上传 + 进度条 | 断点续传、文件校验 |
| **实时批改** | Server-Sent Events | 轻量单向推送 |

### 在线考试状态管理

```typescript
// 考试场景的状态模型
interface ExamState {
  status: 'not-started' | 'in-progress' | 'paused' | 'submitted' | 'expired';
  answers: Record<string, string>;    // 题目ID → 答案
  currentQuestion: number;
  remainingTime: number;              // 秒
  savedAt: string | null;             // 最后自动保存时间
}

// 要点：
// 1. 定时自动保存答案到服务端（每 30s）
// 2. 页面关闭前保存（beforeunload）
// 3. 断网时保存到 localStorage
// 4. 倒计时到 0 自动提交
// 5. 防止浏览器后退/刷新丢失数据
```

---

## 教育产品前端检查清单（补充）

| # | 检查项 | 通过条件 |
|---|--------|---------|
| E1 | 多角色适配 | 不同角色看到的布局/功能符合角色定位 |
| E2 | 移动端优先 | 学生端和家长端移动端体验优先 |
| E3 | 弱网可用 | 3G 网络下核心功能可用，首屏 < 5s |
| E4 | 大字号支持 | 字号放大 150% 后布局不破裂 |
| E5 | 键盘可用 | 核心操作路径只用键盘可完成 |
| E6 | 数据不丢失 | 考试/作业场景断网后数据可恢复 |
