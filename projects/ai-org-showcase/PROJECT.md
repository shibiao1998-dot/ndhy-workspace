# PROJECT.md — NDHY AI Org 产品官网 V7

## 定位
**Live Org Dashboard** — 不是营销页，是 AI 组织的实时运行仪表盘。

## 核心理念
> 用 AI 组织做出来的网站，本身就是 AI 组织的活体证明。
> 传统官网 = 做一次就死了。我们的官网 = 每天自动更新，因为组织每天在运转。

## V7 vs V1-V6 的根本区别
- V1-V6：讲故事（需要人类相信）
- V7：**展示事实**（数字自己说话）

## MVP 功能
1. **The Hook** — 一句话 + 实时运行天数/任务数
2. **活动流** — 最近 24h 组织活动
3. **组织全景** — 31 专家 × 6 层级
4. **能力矩阵** — 51 技能 + 142 模型 + 语音 + 图像
5. **成本透明** — 今日/累计花费
6. **Git 脉搏** — 提交热力图

## 技术方案
- 数据层：Python 脚本扫描 workspace → 生成 data.json
- 展示层：静态 HTML + JS 读取 data.json
- 部署层：GitHub Pages / Docker
- 更新：cron 定时 → data.json 更新 → git push

## 状态
- ⏳ V7 MVP 开发中

## 历史
- V1-V6 文件已归档至 `_archive_v1-v6/`
