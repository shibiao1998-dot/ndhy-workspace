# PROJECT.md — prompt-engineering

## 概述
为华渔教育（网龙网络公司教育子公司）构建"AI设计师/策划提示词工程"系统。交付对象：董事长 DJ。

## 背景
DJ 在 2026-03-09 会议中明确定义了提示词工程的本质：
1. **信息对称**：为 AI 提供最全面、最准确的信息，确保 AI 能正确工作
2. **相信 AI 能做到**：结果不好都是信息不对称的问题，不是 AI 的问题
3. **人的价值是发现新维度**：不断发现 AI 没想到的角度

## 目标
不是文档交付，是**做成系统/产品**，可以直接使用。

## 范围
### 母项目：提示词工程
- 子项目 1：面向不同业务的全面信息收集（维度发现 + 信息填充）
- 子项目 2：信息的排序、筛选、优先级标注
- 子项目 3：针对不同 AI 引擎的适配与提交
- 子项目 4：针对不同业务线的专用提示词工程（AI设计师/策划 是第一个）

### 当前焦点
AI设计师/策划 的提示词工程（飞书文档已有初版维度清单，12类约99个维度）

## 现有资料
- 飞书文档：https://kyj7r1tslg.feishu.cn/wiki/CoI3wKy32iRikxkc7zEc1FnSnaf （维度清单 v1）
- DJ 会议原文：2026-03-09 提示词工程讨论（65分钟完整原文已获取）
- 华渔教育调研：进行中

## 验收标准
1. 完整的维度清单（不仅有维度名称，还有每个维度的具体信息内容）
2. 可直接使用的提示词生成系统（不是文档，是工具/产品）
3. 信息排序与优先级机制
4. 针对不同 AI 引擎的适配方案
5. 董事长 DJ 验收通过

## 技术环境
- 客户公司：华渔教育（网龙教育子公司）
- 行业：教育科技（3D/VR/AR/AI 教育）
- 交付对象：董事长 DJ

## 当前状态
🎉 Phase 1-6 全部完成（PM-4 实际验证通过），可交付

## 任务状态

| 任务 | 负责专家 | 状态 | 备注 |
|------|---------|------|------|
| Phase 1 产品定义 | 产品定义专家 | ✅ done | 产出: product-definition.md |
| Phase 2.1 体验设计 | 体验设计专家 | ✅ done | 产出: experience-design.md |
| Phase 2.2 技术架构 | 技术架构专家 | ✅ done | 产出: technical-architecture.md |
| Phase 3.1 数据库设计 | 数据库设计专家 | ✅ done | 产出: database-design.md |
| Phase 3.2 API 设计 | API设计专家 | ✅ done | 产出: api-design.md |
| Phase 4.1 后端开发 | 后端开发专家 | ✅ done | 产出: backend/（39/39 单测通过） |
| Phase 4.2 前端开发 | 前端开发专家 | ✅ done | 产出: frontend/（USE_MOCK=false，build 成功） |
| Phase 5 联调验证 | 后端+前端+联调专家 | ✅ done | 后端 6/6 API 200 + 前端 build 通过 + 端到端 6/6 全通过 |
| Phase 6 部署 | 部署运维专家 | ✅ done | Dockerfile + docker-compose.yml + deployment-guide.md |

## 迭代记录
- [2026-03-15] 项目启动：接收需求，启动华渔教育调研
- [2026-03-15] D类（场景与需求）+ F类（可行性与资源）维度填充完成 → `dimensions/D-scenarios.md` + `dimensions/F-feasibility.md`
- [2026-03-15] G类（历史经验与案例）维度填充完成 → `dimensions/G-history.md`（公开信息已填充，私域信息标注 ⚠️ 待填充并附模板）
- [2026-03-15] L类（项目全生命周期）维度填充完成 → `dimensions/L-lifecycle.md`（10个维度全部基于通用方法论+华渔场景填充完成）
- [2026-03-15] 标准业务工作流程深度调研完成 → `research-workflows.md`（覆盖软件开发/设计/AI内容生产/多团队协作/教育科技 5 大领域的标准流程、串并行规则、依赖关系、NDHY 角色映射）
- [2026-03-15] **Phase 1 产品定义完成** → `product-definition.md`（产品概念+5场景+13功能+10排除项+路由/优先级/组装/适配规则+成功标准+DJ验收映射）
- [2026-03-15] **Phase 2.1 体验设计完成** → `experience-design.md`（信息架构+核心任务流程+页面布局+交互模式+全态定义+响应式+文案规范+数据需求清单）
- [2026-03-15] **Phase 2.2 技术架构完成** → `technical-architecture.md`（系统分层+技术选型+4核心模块设计+前后端边界+Docker单容器部署+5项ADR+演进路径）
- [2026-03-15] **Phase 3.1 数据库设计完成** → `database-design.md`（9个内存数据模型+字段字典+维度解析规范+配置数据结构+引用展开规则+80分演进预留）
- [2026-03-15] **Phase 3.2 API 设计完成** → `api-design.md`（6接口完整契约+统一错误模型11错误码+Mock示例+TS类型定义+前端消费指南+CORS配置+体验设计字段对齐验证）
- [2026-03-15] **Phase 5.1 联调集成完成** → `integration-report.md`（6接口三层对比全部对齐，8业务流程全通过，3个🟡建议级非阻塞问题）
- [2026-03-15] **Phase 5.2 测试验证完成** → `test-report.md`（39单测全绿，DJ 4/5验收通过，0 P0/P1，2 P2 + 4 P3）
- [2026-03-15] **Phase 6 部署运维完成** → Dockerfile + docker-compose.yml + deployment-guide.md + start.sh + start.bat + .dockerignore
- [2026-03-15] **PM-3 接力审核** → 审核 Phase 1-6 全部产出；修复 USE_MOCK=true→false；执行真实 E2E 联调；重写 integration-report.md；重新构建 frontend/dist/
- [2026-03-15] **PM-4 Phase 5-6 实际验证** → 拆 4 步并行调度：后端独立验证(6/6 API 200)、前端构建(build 成功)、端到端联调(6/6 全通过)、部署文件生成(3 文件重写)。总耗时约 10 分钟。
- [2026-03-15] **视觉升级到产品级** → 视觉设计专家产出 visual-design-spec.md（品牌色#1B65A9+AntD theme token+微卡片维度面板+深色代码输出区），前端开发专家实现并构建（8文件修改/新建，build 零错误）。产出：theme.ts + App.css 重写 + 品牌 Header + 构建产物已部署到 backend/static/。
