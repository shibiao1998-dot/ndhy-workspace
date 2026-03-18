# NDHY AI Org Dashboard V7 — 架构设计文档

> 项目名称：NDHY AI Agent Team 产品官网 V7  
> 版本：v1.0  
> 日期：2026-03-18  
> 架构负责人：🏛️ 技术架构专家  
> 上游输入：产品定义文档 v1.1（Gate 2 已确认）

---

## 一、架构模式判断

### 1.1 选定模式：静态站点生成（SSG）+ 离线数据管道

**不是传统 Web 应用架构（没有服务端运行时），而是"数据管道 + 静态构建"的两阶段模式。**

| 阶段 | 运行时机 | 产出 |
|------|---------|------|
| **数据管道**（Python 脚本） | cron 每日 1 次 | `data.json`（单一数据源） |
| **静态构建**（Astro Build） | git push 触发 CI | HTML/CSS/JS 静态文件 |

### 1.2 为什么选这个模式

| 维度 | 评估 | 得分 |
|------|------|------|
| **团队匹配度**（30%） | Claude Code + Astro 已验证可用，V4-V6 有 Astro 实战经验 | 5/5 |
| **业务匹配度**（25%） | 纯展示型、数据日更新、无用户交互 → SSG 是最匹配的模式 | 5/5 |
| **性能匹配度**（20%） | 静态文件 CDN 分发，加载性能天花板 | 5/5 |
| **演进适配性**（15%） | V2 新增页面/模块只需加组件+扩展 schema，不改架构 | 4/5 |
| **成本合理性**（10%） | GitHub Pages 免费，无服务器运维成本 | 5/5 |
| **加权总分** | | **4.85/5** |

### 1.3 替代方案及否决理由

| 替代方案 | 否决理由 |
|---------|---------|
| Next.js SSR | 需要 Node.js 运行时，增加运维成本和复杂度。数据日更不需要实时渲染 |
| SPA（纯 React） | 首屏加载慢，SEO 差，不如 Astro 的多页静态输出 |
| Serverless API + 前端 | 数据更新频率仅日 1 次，API 层纯属浪费。data.json 直接嵌入构建更简单 |
| WordPress / CMS | 过重，与"AI 组织自动生成"的理念矛盾 |

### 1.4 演进路径

```
当前（V7 MVP）         6 个月（V8）              1 年
SSG + data.json  →  SSG + 多数据文件分割  →  按需评估是否需要 API 层
                    （成本/项目等独立 json）     （仅当实时数据成为刚需时）
```

---

## 二、系统分层设计

```
┌─────────────────────────────────────────────────────────┐
│                    部署层（GitHub Pages）                 │
│              CI/CD: GitHub Actions                       │
├─────────────────────────────────────────────────────────┤
│                 展示层（Astro + React Islands）           │
│    4 个页面 · 共享组件库 · Tailwind CSS · GSAP 动画      │
├─────────────────────────────────────────────────────────┤
│              数据存储层（data.json — 单一数据源）          │
│           JSON Schema 定义 · 版本化 · 构建时注入          │
├─────────────────────────────────────────────────────────┤
│            数据采集层（Python 脚本 — 离线运行）            │
│      扫描 workspace 文件 · 提取结构化数据 · 容错处理       │
├─────────────────────────────────────────────────────────┤
│               数据源层（workspace 文件系统）               │
│  roles/ · skills/ · EXPERTS.md · memory/ · .git · 网关   │
└─────────────────────────────────────────────────────────┘
```

### 2.1 数据采集层（Python 脚本）

**职责**：扫描 workspace 各数据源，提取结构化信息，生成 `data.json`。

**设计原则**：
- **单入口单出口**：一个 `generate_data.py` 入口，一个 `data.json` 出口
- **模块化采集器**：每个数据源对应独立函数（`build_experts()`、`build_skills()`、`build_activity()` 等），新增数据源只需加一个函数
- **容错优先**：任何单一数据源失败不影响其他数据源，失败的模块返回空数据 + 日志警告
- **幂等执行**：任何时候运行结果一致（相同输入 → 相同输出）
- **失败保护**：生成失败时不覆盖上一次有效 `data.json`（先写临时文件，校验通过后原子替换）

**已有基础**：`v7/generate_data.py` 已实现 6 个采集器（org_info / recent_activity / cost_summary / git_stats / experts / skills_list），V7 架构在此基础上扩展。

### 2.2 数据存储层（data.json）

**职责**：作为数据管道和展示层之间的唯一契约。

**设计原则**：
- **单文件**：MVP 阶段用一个 `data.json` 承载所有页面数据（预估 50-100KB）
- **Schema 明确**：每个字段有明确类型定义，前端按 Schema 消费
- **版本化**：顶层 `_meta` 字段包含 schema 版本号，支持向后兼容演进
- **构建时注入**：Astro 构建时 import data.json，数据编译进 HTML，无需客户端 fetch

### 2.3 展示层（Astro + React Islands）

**职责**：将 data.json 渲染为 4 个静态页面。

**架构策略**：
- **Astro 负责页面骨架**：`.astro` 文件定义页面结构、SEO meta、静态内容
- **React Islands 负责交互组件**：仅在需要客户端交互的地方使用 React（热力图、时间线、组织架构图等）
- **数据在构建时注入**：`import data from '../data/data.json'`，Astro 在 build 阶段将数据编译为静态 HTML
- **Tailwind CSS v4**：利用 `@theme` Design Token 系统，零裸色值/零裸间距
- **GSAP 动画**：数字跳动、滚动触发动画，按需加载

### 2.4 部署层（GitHub Actions + GitHub Pages）

**职责**：自动构建部署静态站点。

**两条流水线**：
1. **数据更新流水线**（每日 cron）：Python 扫描 → data.json → git commit + push
2. **站点构建流水线**（push 触发）：检测到 data.json 变更 → Astro build → 部署到 GitHub Pages

---

## 三、data.json Schema 设计

> data.json 是整个系统的数据中枢。以下为完整 Schema 定义。

```jsonc
{
  "_meta": {
    "version": "1.0.0",                    // Schema 版本，语义化版本号
    "generated_at": "2026-03-18T15:00:00+08:00",  // 生成时间 ISO 8601
    "generator": "generate_data.py v1.0",   // 生成器标识
    "workspace_path": "D:\\code\\..."       // 源 workspace 路径（可选，调试用）
  },

  // ─── Landing 页（F1）─────────────────────────
  "org_info": {
    "name": "NDHY AI Agent Team",
    "tagline": "一个人 + 30 个 AI 专家 = 一支完整产品团队",
    "start_date": "2026-03-12",            // 组织创建日期
    "running_days": 6,                      // 运行天数（start_date 至今）
    "human_count": 1,
    "ai_leader": 1,
    "ai_experts": 30,                       // AI 专家数（自动扫描 roles/ 目录）
    "total_skills": 51,                     // 技能总数（自动扫描 skills/ 目录）
    "total_models": 142,                    // 接入模型数
    "total_tasks": 12580                    // 累计任务数（扫描 memory/ 活动条目）
  },

  // ─── 组织全景页（F2）────────────────────────
  "experts": [
    {
      "emoji": "🎯",
      "name": "需求分析专家",
      "english_id": "requirement-analyst",
      "capability": "穿透表达找真实需求，10 维扫描，5 轮迭代对话",
      "layer": "需求洞察层",                // 所属组织层级
      "layer_order": 1                      // 层级排序（用于架构图渲染）
    }
    // ... 共 30 条
  ],

  "org_layers": [
    {
      "name": "需求洞察层",
      "order": 1,
      "expert_count": 4,
      "expert_ids": ["requirement-analyst", "user-researcher", "market-assessor", "competitive-analyst"]
    }
    // ... 共 6 层（需求洞察 / 战略定义 / 流程角色 / 设计 / 架构开发 / 质量交付）
  ],

  // ─── 能力矩阵页（F3）────────────────────────
  "skills": [
    {
      "name": "technical-architecture",
      "display_name": "技术架构设计",        // 从 SKILL.md description 提取
      "category": "architecture"             // 自动分类：architecture/dev/design/ops/research/general
    }
    // ... 共 51 条
  ],

  "skill_categories": [
    { "id": "architecture", "name": "架构与数据", "count": 5, "icon": "🏛️" },
    { "id": "dev", "name": "开发", "count": 12, "icon": "💻" },
    { "id": "design", "name": "设计", "count": 8, "icon": "🎨" },
    { "id": "quality", "name": "质量", "count": 6, "icon": "🧪" },
    { "id": "ops", "name": "运维与发布", "count": 5, "icon": "🚀" },
    { "id": "research", "name": "调研", "count": 5, "icon": "🔬" },
    { "id": "product", "name": "产品与需求", "count": 6, "icon": "📐" },
    { "id": "general", "name": "通用", "count": 4, "icon": "⚙️" }
  ],

  "models": {
    "total": 142,
    "by_type": [
      { "type": "text", "name": "文本对话", "count": 45, "icon": "💬" },
      { "type": "reasoning", "name": "深度推理", "count": 8, "icon": "🧠" },
      { "type": "image_gen", "name": "图像生成", "count": 15, "icon": "🎨" },
      { "type": "video_gen", "name": "视频生成", "count": 10, "icon": "🎬" },
      { "type": "voice", "name": "语音", "count": 12, "icon": "🔊" },
      { "type": "embedding", "name": "嵌入", "count": 8, "icon": "📊" },
      { "type": "vision", "name": "视觉理解", "count": 20, "icon": "👁️" },
      { "type": "3d", "name": "3D/数字人", "count": 5, "icon": "🧊" },
      { "type": "other", "name": "其他", "count": 19, "icon": "🔧" }
    ],
    "highlights": [
      { "name": "Claude Opus 4.6", "tag": "编程 #1", "type": "text" },
      { "name": "GPT-5.4", "tag": "通用 #1", "type": "text" },
      { "name": "Doubao Seed 2.0 Pro", "tag": "中文 #1", "type": "text" },
      { "name": "O3", "tag": "推理 #1", "type": "reasoning" },
      { "name": "Nano Banana 2", "tag": "图像 #1", "type": "image_gen" },
      { "name": "Sora 2", "tag": "视频 #1", "type": "video_gen" }
    ]
  },

  "capability_chain": [
    { "stage": "需求", "skills": 6, "experts": 4 },
    { "stage": "设计", "skills": 8, "experts": 4 },
    { "stage": "开发", "skills": 12, "experts": 2 },
    { "stage": "测试", "skills": 6, "experts": 3 },
    { "stage": "部署", "skills": 5, "experts": 2 },
    { "stage": "运营", "skills": 5, "experts": 2 }
  ],

  // ─── 活动流页（F4）──────────────────────────
  "recent_activity": [
    {
      "date": "2026-03-18",
      "title": "AIAE 网关多模型路由 Skill 创建",
      "type": "dev",                        // dev/design/research/ops/general
      "time": "04:03"                       // 可选：具体时间（从日志提取）
    }
    // ... 最近 24h 的活动，最多 30 条
  ],

  "git_heatmap": [
    { "date": "2026-03-18", "commits": 5 },
    { "date": "2026-03-17", "commits": 12 }
    // ... 最近 90 天，每天一条
  ],

  "git_stats": {
    "total_commits": 234,
    "recent_commits": [
      {
        "hash": "abc1234",
        "date": "2026-03-18T14:32:00+08:00",
        "message": "feat: add model-router skill"
      }
      // ... 最近 10 条
    ]
  }
}
```

### Schema 设计要点

| 要点 | 设计决策 |
|------|---------|
| **`_meta` 版本化** | Schema 变更时升版本号，前端可按版本做兼容处理 |
| **`org_layers` 独立字段** | 组织架构图需要层级结构，不从 experts 实时聚合（构建时计算好） |
| **`skill_categories` 预计算** | 分类计数在 Python 脚本中完成，前端直接渲染，无需二次计算 |
| **`models.by_type` 聚合** | 142 个模型不逐一列出（过大），按类型聚合 + 精选 highlights |
| **`capability_chain`** | 全链路覆盖图数据，硬编码 6 阶段 + 动态统计每阶段技能/专家数 |
| **`git_heatmap` 独立于 `git_stats`** | 热力图需要 90 天每日粒度数据，与最近提交是不同的数据需求 |
| **V2 扩展预留** | `cost_summary` 字段位置预留但 MVP 不填充，前端检测为空则不渲染 |

---

## 四、数据采集脚本设计

### 4.1 扫描目录与数据提取

| 数据源 | 扫描路径 | 提取方法 | 输出字段 |
|--------|---------|---------|---------|
| **专家列表** | `EXPERTS.md` | 正则解析 Markdown 表格行 | `experts[]` + `org_layers[]` |
| **专家数量** | `roles/` 目录 | 统计子目录数（排除 `_archive`） | `org_info.ai_experts` |
| **技能列表** | `skills/` 目录 | 遍历子目录，读取每个 `SKILL.md` 的 YAML frontmatter `description` | `skills[]` + `skill_categories[]` |
| **技能数量** | `skills/` 目录 | 统计子目录数（排除 `_archive`） | `org_info.total_skills` |
| **活动记录** | `memory/YYYY-MM-DD.md` | 解析 `##` 标题 + 时间戳提取 | `recent_activity[]` |
| **任务计数** | `memory/*.md` 全量 | 累加所有 `##` 标题条目数 | `org_info.total_tasks` |
| **Git 提交热力图** | `.git`（`git log`） | `git log --format="%ai" --after=90天前` → 按日聚合 | `git_heatmap[]` |
| **Git 最近提交** | `.git`（`git log`） | `git log --format="%H|%ai|%s" -10` | `git_stats.recent_commits[]` |
| **Git 总提交数** | `.git`（`git rev-list`） | `git rev-list --count HEAD` | `git_stats.total_commits` |
| **模型列表** | `skills/model-router/SKILL.md` + `references/` | 解析模型路由表 or 硬编码聚合数据 | `models` |

### 4.2 V7 新增采集器（相对已有 v7/generate_data.py）

已有脚本覆盖：`org_info`、`recent_activity`、`cost_summary`、`git_stats`、`experts`、`skills_list`。

V7 架构需要新增/扩展的采集器：

| 采集器 | 变更类型 | 说明 |
|--------|---------|------|
| `build_org_layers()` | **新增** | 从 EXPERTS.md 解析 `###` 层级标题，构建 6 层结构化数据 |
| `build_skills()` | **扩展** | 从仅返回名称列表 → 读取每个 SKILL.md 的 description + 自动分类 |
| `build_skill_categories()` | **新增** | 基于技能关键词自动分类并计数 |
| `build_models()` | **新增** | 从 model-router 配置提取模型类型聚合数据 |
| `build_capability_chain()` | **新增** | 按 6 阶段统计每阶段的技能和专家数 |
| `build_git_heatmap()` | **新增** | `git log` 提取 90 天每日提交数（独立于现有 7 天 git_stats） |
| `build_total_tasks()` | **新增** | 遍历所有 memory/*.md，累计 `##` 条目数作为任务计数 |

### 4.3 容错设计

```python
def safe_build(name: str, builder: callable, default):
    """每个采集器的安全包装"""
    try:
        result = builder()
        if result is None:
            log.warning(f"[{name}] returned None, using default")
            return default
        return result
    except Exception as e:
        log.error(f"[{name}] failed: {e}")
        return default
```

**容错规则**：
1. **单源失败不传染**：每个 `build_*()` 独立 try-except，返回空数据而非崩溃
2. **文件读取容错**：`encoding="utf-8", errors="replace"` 处理编码异常
3. **正则容错**：EXPERTS.md 格式变化时，不匹配的行跳过而非报错
4. **Git 命令容错**：`subprocess.run(timeout=30)`，超时返回空数据
5. **原子写入**：先写 `data.json.tmp`，校验 JSON 合法后再 rename 覆盖
6. **合理性校验**：专家数量 < 0 或 > 100 时告警不覆盖；任务数为 0 时保留旧值

---

## 五、展示层模块划分

### 5.1 页面与组件结构

```
src/
├── data/
│   └── data.json                  # 数据文件（Python 生成，git 版本化）
│
├── layouts/
│   └── BaseLayout.astro           # 全局布局（HTML head、导航栏、页脚、SEO）
│
├── pages/
│   ├── index.astro                # Landing 页（F1）
│   ├── team.astro                 # 组织全景页（F2）
│   ├── capabilities.astro         # 能力矩阵页（F3）
│   ├── activity.astro             # 活动流页（F4）
│   └── 404.astro                  # 自定义 404
│
├── components/
│   ├── shared/                    # 共享组件
│   │   ├── Navbar.astro           # 全局导航栏
│   │   ├── Footer.astro           # 页脚（含数据更新时间戳）
│   │   ├── DataCard.astro         # 通用数据卡片（数字 + 标签 + 图标）
│   │   ├── SectionHeader.astro    # 区块标题组件
│   │   ├── Badge.astro            # 标签徽章
│   │   └── AnimatedNumber.tsx     # 数字跳动动画（React Island）
│   │
│   ├── landing/                   # Landing 页专属
│   │   ├── HeroHook.astro         # Hero 区域（一句话 + 运行天数 + 任务数）
│   │   ├── StatsCards.astro       # 3 张核心数据卡片
│   │   └── QuickNav.astro         # 快速导航卡片（→ team / capabilities / activity）
│   │
│   ├── team/                      # 组织全景页专属
│   │   ├── ExpertCard.astro       # 单个专家卡片
│   │   ├── ExpertGrid.astro       # 专家卡片网格布局
│   │   ├── OrgChart.tsx           # 组织架构图（React Island，需交互）
│   │   └── LayerSection.astro     # 按层级分组展示
│   │
│   ├── capabilities/              # 能力矩阵页专属
│   │   ├── SkillCategory.astro    # 技能分类卡片
│   │   ├── SkillGrid.astro        # 技能网格
│   │   ├── ModelOverview.astro    # 模型类型概览
│   │   └── CapabilityChain.tsx    # 全链路覆盖图（React Island，需动画）
│   │
│   └── activity/                  # 活动流页专属
│       ├── ActivityTimeline.tsx    # 24h 活动时间线（React Island）
│       ├── GitHeatmap.tsx         # Git 提交热力图（React Island）
│       └── CommitList.astro       # 最近提交列表
│
├── styles/
│   └── global.css                 # Tailwind @theme Design Token + 全局样式
│
└── utils/
    └── data-helpers.ts            # 数据处理工具函数（类型定义、格式化）
```

### 5.2 Astro vs React 组件决策

| 组件 | 技术选型 | 理由 |
|------|---------|------|
| 导航栏、页脚、卡片、网格 | **Astro 组件** | 纯静态渲染，零 JS |
| 数字跳动动画 | **React Island** | 需要 `client:visible` 触发动画 |
| 组织架构图 | **React Island** | 需要交互展开/折叠、hover 效果 |
| 全链路覆盖图 | **React Island** | 需要 GSAP 动画 + 交互 |
| 活动时间线 | **React Island** | 需要滚动加载、时间轴交互 |
| Git 热力图 | **React Island** | 需要 hover tooltip、交互高亮 |

**原则：能用 Astro 就不用 React。React 仅用于必须有客户端交互的组件。**

### 5.3 共享组件与 Design Token

**Design Token 沿用 V4-V6 体系**（`src/styles/global.css` 的 `@theme` 块），包含：
- 颜色：`--color-bg-*`、`--color-text-*`、`--color-accent-*`
- 间距：`--space-*`（4px 基数）
- 字号：`--text-*`
- 圆角：`--radius-*`
- 阴影：`--shadow-*`

**共享组件保持与 Token 绑定，零裸值。**

### 5.4 V2 扩展预留

| V2 功能 | 预留方式 |
|---------|---------|
| F6 成本透明 | data.json 保留 `cost_summary` 字段位置；Landing 页 StatsCards 支持动态卡片数量 |
| F7 专家详情展开 | ExpertCard 预留 `onClick` 扩展点；data.json experts 预留 `detail` 可选字段 |
| F8 响应式移动适配 | Tailwind 响应式断点已内置；组件布局使用 Grid/Flex，不用固定宽度 |

---

## 六、关键数据流

### 6.1 完整数据流转

```
                     每日 cron（1 次）
                          │
                          ▼
    ┌─────────────────────────────────────────┐
    │        workspace 数据源                   │
    │  roles/ · skills/ · EXPERTS.md           │
    │  memory/ · .git · model-router           │
    └─────────────┬───────────────────────────┘
                  │ Python 脚本扫描
                  ▼
    ┌─────────────────────────────────────────┐
    │        generate_data.py                  │
    │  7+ 个采集器 → 聚合 → 校验 → 原子写入     │
    └─────────────┬───────────────────────────┘
                  │ 输出
                  ▼
    ┌─────────────────────────────────────────┐
    │        data.json（50-100KB）              │
    │  website/src/data/data.json              │
    └─────────────┬───────────────────────────┘
                  │ git add + commit + push
                  ▼
    ┌─────────────────────────────────────────┐
    │      GitHub Actions（自动触发）            │
    │  检测 data.json 变更 → npm run build      │
    └─────────────┬───────────────────────────┘
                  │ Astro 构建：数据编译进 HTML
                  ▼
    ┌─────────────────────────────────────────┐
    │        dist/ 静态文件                     │
    │  index.html · team.html · ...            │
    └─────────────┬───────────────────────────┘
                  │ 部署到 GitHub Pages
                  ▼
    ┌─────────────────────────────────────────┐
    │    访客浏览器 — 直接加载静态 HTML           │
    │    React Islands 水合 → 交互动画生效       │
    └─────────────────────────────────────────┘
```

### 6.2 数据更新时序

```
T+0min   cron 触发 → Python 脚本开始执行
T+1min   扫描完成 → data.json.tmp 写入 → 校验通过 → rename 为 data.json
T+2min   git add data.json → git commit → git push
T+3min   GitHub Actions 触发 → npm install → npm run build
T+5min   构建完成 → 部署到 GitHub Pages
T+6min   CDN 缓存刷新 → 访客看到新数据

总延迟：约 6 分钟（从扫描到上线）
```

### 6.3 数据消费方式

**构建时注入（非客户端 fetch）**：
```typescript
// src/pages/index.astro
---
import data from '../data/data.json';
const { org_info, experts, recent_activity } = data;
---
<h1>已运行 {org_info.running_days} 天</h1>
```

Astro 在构建时将 JSON 数据编译为静态 HTML。访客浏览器直接接收预渲染的 HTML，无需发起额外网络请求获取数据。React Islands 通过 Astro 的 `client:visible` 指令水合时，数据已作为 props 传入。

---

## 七、CI/CD 流程设计

### 7.1 流水线架构

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
    paths:
      - 'projects/ai-org-showcase/website/**'
  workflow_dispatch:          # 手动触发

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: projects/ai-org-showcase/website/package-lock.json

      - name: Install dependencies
        working-directory: projects/ai-org-showcase/website
        run: npm ci

      - name: Build
        working-directory: projects/ai-org-showcase/website
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: projects/ai-org-showcase/website/dist
```

### 7.2 数据更新流水线（本地 cron）

```
# Windows Task Scheduler 或 cron
# 每日 UTC+8 06:00 执行

cd D:\code\openclaw-home\workspace\projects\ai-org-showcase
python generate_data.py
copy /Y data.json website\src\data\data.json
cd website
git add src/data/data.json
git commit -m "chore: daily data update [skip ci]" || echo "No changes"
git push origin main
```

**注意**：`data.json` 的 canonical 位置是 `website/src/data/data.json`，Python 脚本生成后复制到该位置。

### 7.3 部署失败回滚

| 场景 | 处理方式 |
|------|---------|
| Build 失败 | GitHub Actions 自动标记失败，GitHub Pages 保持当前版本不变 |
| Deploy 失败 | GitHub Pages 保持上一个成功部署版本 |
| 数据异常 | Python 脚本合理性校验不通过 → 不写入 data.json → 不触发 build |
| 手动回滚 | `git revert` 最近的 data.json 提交 → 触发重新构建 |

---

## 八、非功能性设计

### 8.1 性能目标

| 指标 | 目标值 | 实现手段 |
|------|-------|---------|
| **首页 LCP** | ≤ 1.5s | 静态 HTML 预渲染，无 JS 阻塞关键渲染路径 |
| **首页 FCP** | ≤ 0.8s | HTML 内联关键 CSS，字体 preload |
| **JS Bundle 总量** | ≤ 150KB gzip | React Islands 按页拆分；GSAP 仅在需要的页面加载 |
| **data.json 体积** | ≤ 100KB | 聚合数据而非原始数据；模型不逐一列出 |
| **Lighthouse 性能分** | ≥ 90 | SSG + 代码分割 + 图片优化 |
| **每页 React Islands** | ≤ 3 个 | 非交互组件一律 Astro 静态渲染 |

### 8.2 可靠性设计

| 场景 | 降级策略 |
|------|---------|
| **Python 脚本执行失败** | 不覆盖 data.json，保留上次有效数据 → 网站显示旧数据（页脚时间戳可识别） |
| **Git push 失败** | 脚本退出码非零，下次 cron 重试 |
| **GitHub Actions 构建失败** | Pages 保持当前版本，Actions 日志记录失败原因 |
| **GitHub Pages 服务不可用** | 极端情况；备选方案：Docker 自部署（Nginx + dist/） |
| **workspace 数据格式变更** | 采集器单源容错，格式变化的字段返回空值，其他字段不受影响 |
| **当天无活动** | `recent_activity` 返回空数组，前端显示"今日暂无活动"+ 最近一条历史 |

### 8.3 可维护性设计

| 变更场景 | 操作步骤 | 影响范围 |
|---------|---------|---------|
| **新增专家** | 在 roles/ 和 EXPERTS.md 添加 → 下次 cron 自动更新 | data.json 的 experts[] 和 org_info |
| **新增技能** | 在 skills/ 添加目录 + SKILL.md → 下次 cron 自动更新 | data.json 的 skills[] 和 org_info |
| **新增模型** | 更新 model-router 配置 → 更新脚本中模型计数逻辑 | data.json 的 models |
| **新增页面** | 新建 `pages/xxx.astro` + 更新 Navbar → 必要时扩展 data.json schema | 展示层 + 可能的数据层 |
| **Schema 变更** | 升 `_meta.version` + 更新脚本 + 更新前端类型定义 | 全链路 |

---

## 九、模块化开发拆分建议

> 以下模块按依赖关系排列，**严格串行执行**，每个模块独立验收后才能开始下一个。

### 模块序列

| 序号 | 模块名称 | 产出物 | 验收标准 | 预估规模 | 执行方式 |
|------|---------|-------|---------|---------|---------|
| **M1** | 数据管道 | `generate_data.py` v2 + `data.json` | 脚本执行成功生成完整 schema 的 data.json；所有采集器有容错；原子写入 | 中 | ACP |
| **M2** | 项目骨架 + 共享组件 | BaseLayout + Navbar + Footer + 全局样式 + 404 | 4 个空页面可路由；导航工作；页脚显示更新时间；404 正确 | 中 | ACP |
| **M3** | Landing 页（F1） | HeroHook + StatsCards + QuickNav + AnimatedNumber | 数字动态跳动；3 张数据卡片正确展示；导航卡片可点击跳转 | 中 | ACP |
| **M4** | 组织全景页（F2） | ExpertCard + ExpertGrid + OrgChart + LayerSection | 30 张专家卡片渲染；6 层架构图可交互；数据来自 data.json | 大 | ACP |
| **M5** | 能力矩阵页（F3） | SkillCategory + SkillGrid + ModelOverview + CapabilityChain | 51 技能分类展示；142 模型聚合展示；全链路图动画 | 大 | ACP |
| **M6** | 活动流页（F4） | ActivityTimeline + GitHeatmap + CommitList | 24h 活动时间线；90 天热力图可交互；最近提交列表 | 大 | ACP |
| **M7** | CI/CD + 部署 | GitHub Actions workflow + cron 脚本 | 端到端自动更新链路跑通：cron → data.json → push → build → deploy | 小 | ACP |
| **M8** | 整体验收 + 优化 | Lighthouse 报告 + 全站走查 + Bug 修复 | Lighthouse ≥ 90；所有页面数据正确；导航无死链；动画流畅 | 中 | ACP |

### 模块依赖图

```
M1（数据管道）
  │
  ▼
M2（项目骨架）
  │
  ├──→ M3（Landing）
  │        │
  │        ▼
  │     M4（组织全景）
  │        │
  │        ▼
  │     M5（能力矩阵）
  │        │
  │        ▼
  │     M6（活动流）
  │
  └──→ M7（CI/CD）──→ M8（整体验收）
```

**M1 是地基**（没有 data.json，前端无法开发）。**M2 是骨架**（没有布局和导航，页面无法独立运行）。M3-M6 严格串行。M7 可在 M2 之后任何时间开始（与 M3-M6 无直接依赖），但建议在 M6 完成后集中处理。

### 每模块 CLAUDE.md 部署

每个 ACP 开发任务的 CLAUDE.md 须包含：
- 当前模块的数据字段范围（只用 data.json 中的哪些字段）
- 组件边界（只创建/修改哪些文件）
- 禁区（不修改其他模块的文件）
- 质量标准（零裸色值、零裸间距、TypeScript strict、构建通过）

---

## 十、风险识别

### Top 5 技术风险

| # | 风险 | 概率 | 影响 | 缓解措施 |
|---|------|------|------|---------|
| 1 | **data.json Schema 设计不完整**：开发过程中发现页面需要的数据字段未定义 | 中 | 高（返工数据管道+前端） | 本文档 Schema 已覆盖全部 4 页需求；M1 验收时由产品定义对照 check；Schema 变更通过 `_meta.version` 管理 |
| 2 | **workspace 数据格式变化**：专家/技能目录结构或 EXPERTS.md 格式变化导致脚本解析失败 | 中 | 中（数据停更） | 每个采集器独立容错 + 合理性校验 + 失败保留旧数据；脚本输出详细日志便于排查 |
| 3 | **React Islands 水合导致 bundle 膨胀**：过多组件使用 React 导致 JS 过大 | 低 | 中（性能下降） | 严格执行"能用 Astro 就不用 React"原则；每页 React Islands ≤ 3 个；M8 整体验收时 Lighthouse 检查 |
| 4 | **Git 热力图 90 天数据量**：大型仓库的 git log 扫描可能超时 | 低 | 低（热力图暂无数据） | `subprocess.run(timeout=30)`；预聚合为日粒度减少数据量；超时返回空数据不影响其他模块 |
| 5 | **GitHub Pages 部署延迟或配额限制**：免费 GitHub Pages 有构建频率限制 | 低 | 低（部署延迟） | 数据日更 1 次，远低于 Pages 限制；备选 Docker 自部署方案 |

### 风险监控

- M1 验收时重点检查 Schema 完整性（风险 1）
- M1 脚本需包含容错测试用例（风险 2）
- M8 整体验收时 Lighthouse 性能测试（风险 3）
- M7 CI/CD 配置后端到端测试（风险 5）

---

## 附录

### A. 技术选型记录

| 决策 | 选择 | 替代方案 | 选择理由 |
|------|------|---------|---------|
| 前端框架 | Astro 6 + React Islands | Next.js SSG / Pure React SPA | Astro 静态优先 + Islands 最小化 JS；已有实战经验 |
| 样式方案 | Tailwind CSS v4 + @theme | CSS Modules / Styled Components | Tailwind 已安装；@theme 支持 Design Token；零运行时 |
| 动画库 | GSAP + ScrollTrigger | Framer Motion / CSS Animation | GSAP 已安装且 V4-V6 有经验；ScrollTrigger 适合滚动触发 |
| 数据格式 | 单文件 JSON | SQLite / 多文件 JSON / YAML | 单文件最简单，50-100KB 完全够用；构建时 import 零额外成本 |
| 数据脚本 | Python | Node.js / Shell | Python 文件处理和正则解析更方便；已有 v7/generate_data.py 基础 |
| 部署 | GitHub Pages | Vercel / Netlify / Docker | 免费 + 仓库内闭环 + 零运维；Docker 作备选 |
| CI/CD | GitHub Actions | GitLab CI / 手动部署 | 与 GitHub Pages 原生集成；免费配额充足 |

### B. 与产品定义的映射关系

| 产品功能 | data.json 字段 | 展示层组件 | 开发模块 |
|---------|---------------|-----------|---------|
| F1 首页 Hero Hook | `org_info` | HeroHook + StatsCards + QuickNav | M3 |
| F2 组织全景页 | `experts` + `org_layers` | ExpertCard + ExpertGrid + OrgChart | M4 |
| F3 能力矩阵页 | `skills` + `skill_categories` + `models` + `capability_chain` | SkillGrid + ModelOverview + CapabilityChain | M5 |
| F4 活动流页 | `recent_activity` + `git_heatmap` + `git_stats` | ActivityTimeline + GitHeatmap + CommitList | M6 |
| F5 多页导航 | 静态配置 | Navbar + QuickNav + 404 | M2 |

### C. 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-03-18 | v1.0 | 初版架构设计文档（Gate 3 输出） |
