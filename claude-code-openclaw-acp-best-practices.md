# Claude Code 最佳实践 + OpenClaw 通过 ACP 驱动 Claude Code 的高质量产出指南

## 一句话结论

Claude Code 的高质量产出，不取决于你写了多少“提示词技巧”，而取决于四件事：

1. 成功标准是否明确
2. 验证方式是否可执行
3. 上下文是否干净
4. 会话是否按角色拆分

对 OpenClaw 来说，ACP 的价值也不是“能调用 Claude Code”这么简单，而是：

- 用结构化会话代替 PTY 抓取
- 用线程绑定和命名会话管理长期任务
- 用 mode / permission / timeout / cwd 做控制平面
- 让 Claude Code 专注在读代码、改代码、跑测试、给结果

---

## 一、Claude Code 最佳实践（给人分享）

### 1. 先给验证，再给任务

不要只说“实现一个功能”。
要给 Claude Code 明确的成功标准：

- 测试用例
- 预期输出
- UI 对比图 / 截图
- lint / build / e2e 命令

更好的任务描述：

- 不要说：实现一个校验邮箱的函数
- 要说：实现 `validateEmail`，并验证这些样例：
  - `user@example.com` => true
  - `invalid` => false
  - `user@.com` => false
  - 实现后运行测试并修复失败

### 2. 先探索，再规划，最后编码

推荐固定四阶段：

1. Explore：先读代码，理解现状，不改文件
2. Plan：输出实现计划、涉及文件、风险点
3. Implement：按计划实现并自测
4. Commit/PR：整理成提交或 PR 说明

对于复杂任务，先要求 Claude 提问澄清，再开始实现。

### 3. Context 是预算，不是越多越好

Claude Code 的核心瓶颈是 context window。

高质量使用方式：

- 不相关任务之间及时清空会话
- 同一个方向连续纠正两次还没好，直接重开
- 大范围调研交给 subagents，别污染主会话
- 长任务拆成多个会话，不要厨房水槽式混聊

### 4. 把长期规则写进 CLAUDE.md，而不是重复口述

把这些写进 `CLAUDE.md`：

- 代码风格
- 构建 / 测试命令
- 常见目录约定
- 安全边界
- PR 规范
- 工作流限制

原则：

- 短
- 真正高频
- 能改变行为
- 定期修剪

### 5. 确定性动作交给 hooks

凡是“每次都必须发生”的动作，不要靠提示词记忆，要靠 hooks：

- 编辑后自动跑 eslint
- 阻止写入某些目录
- 保存前检查文件格式
- 触发固定审查脚本

### 6. 用 CLI 和 MCP，而不是把外部信息硬塞进提示词

高质量不是把工单、设计稿、数据库 schema 全部复制进聊天框。

更好的方式：

- GitHub 用 `gh`
- 云资源用 `aws` / `gcloud`
- 监控用 `sentry-cli`
- 设计和知识库通过 MCP 接入

这样更省上下文，也更可靠。

### 7. Writer / Reviewer 分离，质量明显提升

不要让同一个会话又写又审。

更优模式：

- Session A：Writer，负责实现
- Session B：Reviewer，负责边界条件、竞态、风格一致性审查
- 再把审查反馈回灌给 Writer 修复

### 8. 典型失败模式

最常见的五类失败：

1. 厨房水槽会话：多个不相关任务混在一个上下文里
2. 一错再纠：错误方向反复修补，污染上下文
3. 过长 CLAUDE.md：规则太多，真正重要的被淹没
4. 只信不验：看起来对，实际上没跑通
5. 无限探索：调查范围太大，token 被无效消耗

---

## 二、OpenClaw 应该如何通过 ACP 更好地操作 Claude Code

## 核心角色分工

建议把系统分成两层：

### OpenClaw：控制平面

负责：

- 路由任务到 ACP runtime
- 管理会话生命周期
- 设置 cwd / model / timeout / approval policy
- 绑定线程
- 做多会话编排
- 分配 writer / reviewer / planner 等角色
- 处理中断、恢复、关闭

### Claude Code：执行平面

负责：

- 阅读代码
- 输出计划
- 修改文件
- 跑命令 / 测试
- 总结变更、风险与验证结果

这样做的原因很简单：

OpenClaw 擅长“调度”，Claude Code 擅长“编码执行”。

---

## 三、OpenClaw + ACP 的最佳操作原则

### 原则 1：优先用 ACP，不要模拟 PTY

OpenClaw 操作 Claude Code 时，优先走 ACP runtime，或者在 runtime 不可用时走 `acpx`。

原因：

- 结构化消息
- 会话可恢复
- 可中断
- 可配置 mode / timeout / permissions
- 不依赖抓屏式终端解析

### 原则 2：一个 repo / 一个工作流 / 一个持久会话

推荐按工作流创建持久会话，例如：

- `auth-refactor`
- `checkout-review`
- `docs-rewrite`

不要把不同目标塞进同一个 Claude Code 会话。

### 原则 3：创建会话时必须显式给 cwd

会话创建时应该把仓库根目录明确告诉 ACP / Claude Code。

否则会出现：

- 读错目录
- 找不到测试命令
- 修改落在错误工作区

### 原则 4：先 plan，再 code

第一次进入任务时，不要直接让 Claude Code 开写。

推荐流程：

1. 先进入 plan / architect 风格
2. 输出：
   - 问题理解
   - 变更文件列表
   - 风险点
   - 验证命令
3. 审核后再进入 code

### 原则 5：每次 prompt 都带验证合同

OpenClaw 发给 Claude Code 的任务里，应该始终包含：

- 要修改的文件或范围
- 不可违反的约束
- 验证命令
- 输出格式

例如：

- 修改 `src/auth/*`
- 不要改数据库 schema
- 运行 `pnpm test auth`
- 返回：变更摘要 / 风险 / 测试结果 / 未解决项

### 原则 6：小修正用 steer，不要动不动重建会话

当方向没错，只是输出不够好时：

- 用 `steer` 追加引导
- 用 `cancel` 中断失控轮次
- 用 `status` 查看状态
- 任务结束后再 `close`

### 原则 7：把 reviewer 也做成独立会话

高质量产出不该只有一个 Claude Code 会话。

推荐至少两个：

- planner/writer
- reviewer

评审清单建议固定：

- 边界条件
- 并发 / race condition
- 安全问题
- 与现有模式一致性
- 是否真正通过验证

### 原则 8：生产环境优先 ACP Runtime，调试可用 Direct acpx

推荐：

- 生产 / 持久任务 / 长任务：ACP Runtime
- 快速测试 / 调试 / CI / runtime 不可用：Direct acpx

### 原则 9：注意 ACP 与沙盒边界

如果你需要强制沙盒，就不要假设 `runtime: "acp"` 一定能满足。

这类场景要明确区分：

- 要外部协调器：ACP
- 要 OpenClaw 原生沙盒约束：subagent

---

## 四、推荐的 OpenClaw 操作剧本

### 剧本 A：复杂功能开发

1. 启动一个持久的 Claude Code ACP 会话，绑定线程，设置仓库 cwd
2. 先让它只做探索和计划，不改文件
3. 要求输出：
   - 方案
   - 影响文件
   - 风险
   - 验证步骤
4. 审核后切换到实现
5. 强制它运行测试 / lint / build
6. 再开 reviewer 会话做独立审查
7. 把 reviewer 结果反馈给 writer 修复
8. 最后关闭会话

### 剧本 B：故障排查

1. 启动一次性或短期会话
2. 限定范围：错误日志、涉及目录、复现命令
3. 先要求定位根因，不要先修
4. 再要求给最小修复方案
5. 必须回跑复现命令和回归测试

### 剧本 C：大规模迁移

1. 先用一个 planner 会话生成任务清单
2. 拆成多个命名会话并行执行
3. 每个会话只处理一组文件
4. 最后聚合结果并统一审查

---

## 五、可直接喂给 OpenClaw 的学习提示词

```text
你是 OpenClaw。处理编码任务时，把 Claude Code 作为通过 ACP 调度的外部编码执行器，而不是一个被你“模拟终端操作”的工具。

遵循以下规则：

1. 只要目标是调用 Claude Code / Codex / Gemini 这类外部编码协调器，优先选择 runtime="acp"，而不是原生 subagent。
2. 每个独立 repo 或工作流使用独立的持久会话；如果渠道支持线程绑定，则绑定线程并把后续消息路由回同一会话。
3. 创建会话时显式设置 cwd；如果需要外部工具或知识源，优先通过 MCP servers 或 CLI 接入，不要把大量上下文硬塞进 prompt。
4. 第一次处理复杂任务时，先让 Claude Code 进入 plan / architect 风格：只读代码、理解现状、列出修改文件、风险点和验证命令，不要直接改文件。
5. 只有在计划明确、约束明确、验证标准明确后，才进入 code 模式执行。
6. 每次下发任务必须包含：
   - 目标
   - 约束
   - 作用范围 / 文件范围
   - 验证方式
   - 输出格式
7. 验证是强制项。优先要求 Claude Code 自行运行测试、lint、build、截图对比或命令验证；没有验证结果的任务不算完成。
8. 当 Claude Code 方向基本正确但输出不够好时，优先使用 steer 追加引导，而不是立即销毁会话重来。
9. 当会话已经被错误方法污染，或连续两轮纠正仍无改善时，关闭当前会话，重建一个更干净的新会话，并把学到的约束写进新的初始任务。
10. 对高风险任务采用分角色会话：planner / writer / reviewer 分离。不要让同一个会话既写代码又给自己背书。
11. 对长期规则使用配置、hooks、skills、权限和模式控制，不要仅依赖自然语言提醒。
12. 如需强制沙盒执行，优先考虑原生 subagent；不要错误地假设 runtime="acp" 在沙盒内运行。

默认输出格式：
- Task understanding
- Proposed plan
- Files to inspect/change
- Validation commands
- Risks / edge cases
- Final result
- Remaining issues
```

---

## 六、最短落地版本

如果团队今天就要开始用，先只做这 6 件事：

1. 所有复杂任务先 plan 再 code
2. 所有任务必须带验证标准
3. 不相关任务及时清空上下文
4. 团队维护一个精简版 `CLAUDE.md`
5. OpenClaw 通过 ACP 建持久会话，不要靠 PTY 抓取
6. Writer / Reviewer 分会话

做到这 6 条，产出质量通常就会明显提升。
