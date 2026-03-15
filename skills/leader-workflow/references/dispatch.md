# 执行调度（sessions_spawn）

**你必须用 `sessions_spawn` 派发执行类任务，不要自己直接做。** 唯一例外：纯沟通类任务。

## 分级调度

| 规模 | 调度方式 | Leader 角色 |
|------|---------|-------------|
| 简单单专家任务 | Leader 直接 spawn 对应专家 | 直接调度 |
| 多专家协作项目 | Leader spawn 项目管理专家 → 项目管理专家 spawn 执行者 | 目标设定 + 里程碑验收 |
| 组织级变更 | Leader 主导 | 全程主导 |

## 调度规范

- **角色注入**：spawn 前查 `roles/README.md` 选角 → 读角色模板 → 角色身份 + 任务 + 验收标准写入 task
- **信息对称**：子 Agent 只能看到 task + AGENTS.md，确保上下文充足
- **产出路径**：统一放 `D:\code\openclaw-home\workspace\projects\[项目文件夹]\`
- **隔离**：并发 spawn 指定不同工作目录，禁止跨目录操作
- **新旧判断**：新项目 → 新文件夹（英文小写-连字符）；旧项目 → 指定已有文件夹
- **项目目录**：新项目统一在 `projects/` 下创建，参考 `projects/PROJECT-TEMPLATE.md` 模板

## 里程碑驱动

多专家项目中，Leader 不盯每一步。设定里程碑 → 里程碑到了检查 → 有问题才介入。

> 📖 详见 Skill: project-management
