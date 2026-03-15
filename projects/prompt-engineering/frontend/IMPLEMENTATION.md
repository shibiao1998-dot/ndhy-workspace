# 前端实现说明文档

> 产出者：🖥️ 前端开发专家 | 产出日期：2026-03-15

## 项目结构

```
frontend/
├── src/
│   ├── App.tsx                    # 主应用，三区垂直堆叠布局
│   ├── App.css                    # 全局样式 + 响应式断点
│   ├── main.tsx                   # 入口，Ant Design ConfigProvider + 中文 locale
│   ├── components/
│   │   ├── TaskInput.tsx          # A区：任务输入（textarea + 300ms防抖失焦路由）
│   │   ├── RouteResult.tsx        # A区：匹配结果（类型+置信度色标+手动切换下拉）
│   │   ├── EngineSelector.tsx     # A区：引擎选择下拉（含平台信息和最大字符数提示）
│   │   ├── LengthIndicator.tsx    # A区：预估长度进度条（前端本地计算）
│   │   ├── DimensionPanel.tsx     # B区：维度配置面板（三列分组+checkbox+优先级循环切换+手风琴预览）
│   │   ├── PromptOutput.tsx       # C区：提示词输出（Markdown渲染+固定定位复制按钮）
│   │   ├── CopyButton.tsx         # C区：一键复制（Clipboard API + fallback）
│   │   └── CoverageReport.tsx     # C区：覆盖报告（维度统计+级别分布+缺失警告）
│   ├── api/
│   │   └── client.ts              # API 封装 + 完整 Mock 数据 + USE_MOCK 开关
│   ├── types/
│   │   └── index.ts               # TypeScript 类型（严格对齐 api-design.md §5.2）
│   └── hooks/
│       └── usePromptEngine.ts     # 核心状态管理 Hook（初始化/路由/维度配置/生成全流程）
├── index.html
├── package.json
├── vite.config.ts                 # Vite 配置 + /api 代理到 localhost:8080
└── tsconfig.json                  # TypeScript strict 模式
```

## 已实现功能

### A区：输入区
- [x] 任务描述 textarea，自动聚焦，自适应高度
- [x] 失焦触发路由，300ms 防抖，相同内容不重复请求
- [x] Enter 触发路由（Shift+Enter 换行）
- [x] 清除按钮
- [x] 匹配结果行：类型名+置信度色标（≥70%绿/40-69%黄/<40%红）
- [x] 手动切换任务类型下拉，选择后立即重新路由
- [x] 引擎选择下拉（6个引擎+平台信息）
- [x] 预估长度进度条：前端本地计算（已选维度 char_count 之和 vs 引擎 max_chars）
- [x] 进度条颜色阈值：≤60%绿/61-85%黄/>85%红

### B区：维度配置区
- [x] 三列分组：🔴必须(priority=1) / 🟡建议(priority=2) / 🟢可选(priority=3)
- [x] 每列标题含数量 Badge
- [x] 每行：checkbox + 优先级标签 + 维度ID+名称 + 字符数
- [x] 优先级循环切换：🔴→🟡→🟢→🔴，切换后维度归入对应列
- [x] 维度名称可点击展开摘要（手风琴模式）
- [x] 待填充维度标记"内容未完成"+勾选后⚠️图标
- [x] 取消必须维度显示行内黄色警告
- [x] 默认勾选：required + recommended 勾选，optional 不勾选
- [x] 生成按钮：禁用条件（空输入/无勾选/生成中）+ loading 态

### C区：输出区
- [x] 生成前隐藏，生成中显示骨架屏
- [x] Markdown 渲染（react-markdown）
- [x] 复制按钮固定右上角，复制原始文本（非HTML）
- [x] 复制成功反馈"✅ 已复制"2s恢复 + 失败 fallback
- [x] 覆盖报告：维度总数/覆盖率/级别分布/缺失必须维度
- [x] 引擎切换后黄色 banner 提示重新生成
- [x] 生成成功自动滚动到输出区

### 全态覆盖
- [x] 初始化 loading（全屏旋转图标）
- [x] 初始化失败（Result + 刷新按钮）
- [x] 路由 loading（内联 spinner）
- [x] 路由失败（红色错误文字）
- [x] 生成 loading（骨架屏 + 按钮 loading）
- [x] 生成失败（错误 Result）
- [x] 空态（未输入时配置区和输出区隐藏）

### 响应式
- [x] 桌面（≥1024px）：960px 居中，维度三列
- [x] 平板（768-1023px）：维度两列
- [x] 手机（<768px）：维度单列 Tab 切换，引擎/长度竖排

### Mock 数据
- [x] `api/client.ts` 中 `USE_MOCK = true` 开关
- [x] 32 个维度的完整 Mock 数据
- [x] 路由 Mock：简单关键词匹配
- [x] 生成 Mock：组装提示词文本+覆盖统计
- [x] 模拟网络延迟（300-800ms）

## 技术决策

1. **Ant Design 5**：使用 Checkbox、Tag、Select、Progress、Card、Button、Spin、Result、Alert、Badge、Tabs 等组件，零定制即达到60分体验
2. **react-markdown**：C区提示词 Markdown 渲染，轻量无重依赖
3. **CSS Grid 三列布局**：维度面板使用 CSS Grid 响应式切换
4. **单 Hook 管理全状态**：`usePromptEngine` 封装初始化/路由/维度配置/生成全流程，App.tsx 只做布局
5. **Mock 与 Real API 统一接口**：通过 `USE_MOCK` 开关切换，函数签名一致
6. **Vite Proxy**：开发环境 `/api` 代理到 `localhost:8080`，避免 CORS 问题

## 已知限制 & TODO

- [ ] 未实现 ESLint 配置（60分版本暂不引入，避免额外依赖）
- [ ] 未实现单元测试/组件测试（60分版本优先可运行）
- [ ] 维度列表桌面端列间拖拽动画（体验设计提到200ms滑动，当前为即时切换）
- [ ] Toast 提示使用 Ant Design message，位置为顶部居中（与体验设计一致）
- [ ] Mock 数据只含32个维度（实际89个），不影响功能验证
- [ ] `POST /api/reload` 管理接口未在 UI 上暴露（体验设计中无此功能入口）

## 联调注意事项

1. 将 `api/client.ts` 中 `USE_MOCK` 改为 `false` 即可切换到真实 API
2. `vite.config.ts` 已配置 `/api` 代理到 `http://localhost:8080`
3. 所有请求/响应类型严格对齐 `api-design.md`，字段名 snake_case
4. 生产构建：`npx vite build` 输出到 `dist/`，可由 FastAPI StaticFiles 直接 serve

## 验收清单

- [x] `npm install && npm run dev` 可启动（Vite 开发服务器）✅
- [x] 核心交互流程完整：输入任务 → 触发路由 → 显示维度列表 → 调整配置 → 点击生成 → 显示结果 → 一键复制 ✅
- [x] 维度三列分组正确显示，checkbox 和优先级切换可用 ✅
- [x] 引擎切换后预估长度实时更新 ✅
- [x] 全态覆盖：loading spinner、错误提示、空态、成功态 ✅
- [x] 一键复制功能可用 ✅
- [x] 覆盖报告正确展示 ✅
- [x] TypeScript 编译无错误（`npx tsc --noEmit` → 0 errors）✅
- [x] 使用 Mock 数据可独立运行（不依赖后端）✅
