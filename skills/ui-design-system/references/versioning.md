# 设计系统版本管理与演进策略

> 设计系统是活的——它需要像产品一样有版本、有迭代、有废弃策略。

## 语义化版本（SemVer）

```
MAJOR.MINOR.PATCH

MAJOR（大版本）：破坏性变更 — Token 重命名/删除、组件 API 变更
MINOR（次版本）：向后兼容的新增 — 新 Token、新组件、新变体
PATCH（补丁版）：向后兼容的修复 — 修 Bug、调整值、修文档
```

### 版本号示例

| 变更 | 版本变化 | 说明 |
|------|---------|------|
| 修复 Button hover 颜色偏差 | 1.0.0 → 1.0.1 | PATCH |
| 新增 Tooltip 组件 | 1.0.1 → 1.1.0 | MINOR |
| 新增 `--color-accent` Token | 1.1.0 → 1.2.0 | MINOR |
| 删除 `--color-info`，改名为 `--color-notice` | 1.2.0 → 2.0.0 | MAJOR |
| 修改 Button API（props 重命名） | 2.0.0 → 3.0.0 | MAJOR |

---

## 变更日志模板

```markdown
# Changelog

## [1.2.0] - 2024-03-15

### 新增
- 新增 `Tooltip` 组件（支持 top/bottom/left/right 四个方向）
- 新增 `--color-accent` 语义 Token
- 新增 `Button` 的 `icon` 尺寸变体

### 修改
- 调整 `--spacing-5` 从 1.25rem 为 1.5rem
- 优化 `Dialog` 在移动端的默认宽度

### 修复
- 修复 `Select` 在 Safari 下的焦点环不显示问题
- 修复暗黑模式下 `Card` 边框颜色不正确

### 废弃
- `--color-bg-muted` 将在 2.0.0 中移除，请使用 `--color-bg-tertiary`
```

---

## Token 废弃策略

### 三步废弃法

```
Step 1: 标记废弃（MINOR 版本）
  - 在 Token 文件中添加 @deprecated 注释
  - 在变更日志中声明
  - 新 Token 同时可用

Step 2: 迁移期（至少 1 个 MINOR 版本）
  - 旧 Token 继续工作
  - 文档标注迁移指南
  - 提供自动迁移脚本（如适用）

Step 3: 移除（MAJOR 版本）
  - 删除旧 Token
  - 确认所有消费者已迁移
```

### 废弃标记示例

```css
/* ⚠️ @deprecated since v1.2.0 — 请使用 --color-bg-tertiary */
--color-bg-muted: var(--color-bg-tertiary);
```

```json
{
  "color": {
    "bg-muted": {
      "$value": "{color.bg.tertiary}",
      "$type": "color",
      "$deprecated": "Use color.bg.tertiary instead. Will be removed in v2.0.0."
    }
  }
}
```

---

## 多主题管理

### 主题结构

```
tokens/
├── tokens-base.css      # 基础 Token（所有主题共享的结构定义）
├── theme-light.css      # Light 主题值
├── theme-dark.css       # Dark 主题值
└── theme-contrast.css   # 高对比度主题值（可选）
```

### 主题切换实现

```css
/* 方案 1：data 属性切换 */
[data-theme="light"] { /* light token values */ }
[data-theme="dark"]  { /* dark token values */ }

/* 方案 2：class 切换（Tailwind 推荐） */
.light { /* light token values */ }
.dark  { /* dark token values */ }

/* 方案 3：系统偏好自动切换 */
@media (prefers-color-scheme: dark) { /* dark token values */ }
```

### 主题 Token 约束
- 所有主题必须定义**完全相同的 Token 名称集合**
- 只有**值**不同，**名称**必须一致
- 切换主题 = 切换一套值，不改变任何组件代码

---

## 演进路线图模板

| 阶段 | 版本 | 内容 | 时间 |
|------|------|------|------|
| **v1.0 基础版** | 1.0.0 | 核心 Token + P0 组件 + Light 主题 | Sprint 1 |
| **v1.1 完善版** | 1.1.0 | P1 组件 + Dark 主题 + 文档 | Sprint 2 |
| **v1.2 增强版** | 1.2.0 | P2 组件 + 动画 Token + 组件使用指南 | Sprint 3 |
| **v2.0 平台版** | 2.0.0 | 多产品线支持 + 主题定制器 + 贡献规范 | Sprint 5 |

---

## 文件版本标记

每个 Token 文件头部标注版本：

```css
/**
 * Design System Tokens
 * @version 1.2.0
 * @date 2024-03-15
 * @changelog See CHANGELOG.md
 */
:root { /* ... */ }
```

```json
{
  "$meta": {
    "version": "1.2.0",
    "date": "2024-03-15",
    "description": "NDHY Design System Tokens"
  }
}
```
