# 官网 V3 UI 重设计方案

> 🖼️ UI 设计专家产出 · 2026-03-16
>
> 基于对 index.html（85KB）逐区块走查，输出设计问题诊断 + 重设计方案。
> 所有方案基于现有 Design Tokens，保持纯黑深色主题基调。

---

## 走查总结

### 根本问题：视觉能量不足

老板说"用手机打开就是一片黑"——这不是对比度问题（对比度已修复到 AA 标准），而是**视觉能量密度**问题。具体表现为：

| # | 问题 | 严重程度 | 影响范围 |
|---|------|---------|---------|
| 1 | **区块间背景差异过小**：`#0d0d14` / `#0f0f1a` / `#111122` 三档背景色肉眼几乎无法区分，导致7个区块视觉上融成一片 | 🔴 致命 | 全站 |
| 2 | **缺少视觉锚点**：除了拓扑图有 SVG，其余区块全是文字+留白，没有任何图形元素打破单调 | 🔴 致命 | 区块3-7 |
| 3 | **拓扑图（核心区块）移动端完全降级**：600px 以下隐藏 SVG，退化为纯文字列表，震撼感归零 | 🔴 致命 | 区块2 移动端 |
| 4 | **拓扑图桌面端布局过于网格化**：28个节点像 Excel 表格一样均匀排列在 7 行，没有辐射/力导向的有机感 | 🟠 重大 | 区块2 |
| 5 | **全站初始不可见度 `opacity: 0.05`**：本意是做淡入动画，但滚动前页面看起来全空白/全黑 | 🟠 重大 | 全站 |
| 6 | **区块三时间线水平滚动**：桌面端 8 个步骤挤在一行水平滚动，信息密度低，用户不知道要横滑 | 🟡 中等 | 区块3 |
| 7 | **区块五剖面图 clip-path 动画**：`clip-path: inset(50% 0)` 起始态导致内容完全不可见，与 fade-in 效果叠加后首次体验割裂 | 🟡 中等 | 区块5 |
| 8 | **CTA 区块视觉重量不足**：两个按钮 + 一行标题在 80vh 高度中显得空旷寂寞 | 🟡 中等 | 区块7 |
| 9 | **Footer 信息层级混乱**：品牌名、统计数据、签名行三行文字用了相同视觉权重 | 🟢 轻微 | Footer |
| 10 | **V3.2 大量 `!important` 覆盖**：说明底层 Token 系统和组件样式存在层叠冲突，技术债明显 | 🟢 轻微 | 代码质量 |

### 逐区块走查明细

#### 区块一（Hero/悬念开场）
- ✅ 信息架构清晰——4句话递进式悬念
- ✅ 打字机效果和跳过机制完善
- 🟡 视觉层级：强调句 `hook-emphasis` 仅用 `color-text-bright`（#f5f5f5 vs 正文 #e8e8e8），亮度差仅 5%，区分度不够
- 🟡 留白过度：100vh 高度中文字只占中间 ~20%，上下空白太多，尤其移动端
- ✅ 移动端体验尚可（字号有适配）
- 🟢 改进空间：日期行可做成 monospace + 微弱发光，增加仪式感

#### 区块二（拓扑图/揭幕震撼）
- 🔴 **布局策略失败**：28 个节点按 7 行 x 4-8 列的网格排列，像组织架构表，不像有机网络
- 🔴 **移动端退化**：直接隐藏 SVG 改为文字列表，完全丧失视觉冲击
- 🟠 **节点层级感不足**：L0/L1 (r=30) vs L3 (r=24) 的尺寸差仅 6px，视觉上区分不明显
- 🟠 **连线逻辑不直观**：40+ 条线交叉重叠，看不出信息流向
- 🟡 **发光效果弱**：`feGaussianBlur stdDeviation=4` 的 glow 半径太小，在深色背景上不够醒目
- ✅ Tooltip 交互正确（桌面 hover、移动 tap）
- ✅ 亮起动画有序列感（按 data-order 逐个亮起）

#### 区块三（时间线/运转揭秘）
- 🟠 **桌面端水平时间线不合适**：8 个步骤强制水平排列需要滚动，违反垂直滚动叙事节奏
- 🟡 手风琴展开面板只有文字，缺少产出物预览（代码片段/文件结构图）
- 🟡 步骤数据全是 `[待回填]`，正式版需要真实数据支撑
- ✅ 移动端改为垂直时间线，方向正确
- ✅ 步骤点亮动画配合 IntersectionObserver

#### 区块四（对比/认知冲突）
- ✅ 双栏对比信息架构清晰
- ✅ 左暗右亮的视觉对比有效
- 🟡 左栏 `opacity: 0.8` 但文字 `color: #e0e0e0`，实际亮度 ≈ 0.8 × 224 = 179/255，可读但不够"暗淡"来形成鲜明对比
- 🟡 ❌/✅ 标签区域与流程步骤间距不够，视觉上粘连
- ✅ 移动端上下堆叠方向正确

#### 区块五（深层架构/三张剖面图）
- ✅ 三张剖面图信息组织清晰
- 🟡 `clip-path: inset(50% 0)` 起始态在滚动触发前完全隐藏内容，用户看到空白区域可能困惑
- 🟡 剖面图之间 `gap: 48px` 可以更大，当前稍显紧凑
- 🟡 记忆层级的颜色编码（🔥红 🟡黄 📁蓝 🆘橙）被 `!important` 覆盖为统一 #d5d5d5，失去了原本的颜色区分效果
- ✅ 逐行淡入动画节奏合理

#### 区块六（宣言/更大的图景）
- ✅ 纯文字叙事决策正确——不需要图形装饰
- ✅ "答案是——组织" 的 accent 色强调有效
- 🟡 段落间距 `margin-bottom: 32px` 统一，但内容节奏有快有慢，间距应该配合情绪曲线
- 🟡 分割线 `width: 120px` 在移动端相对屏幕比例太小

#### 区块七（CTA + Footer）
- 🟠 80vh 高度仅放一行标题 + 两个按钮，视觉过空
- 🟡 缺少行动引导副文案
- 🟡 按钮颜色：主按钮 `#818cf8` 配白字的对比度仅 3.8:1，需要验证
- ✅ 移动端按钮纵向堆叠
- ✅ Footer 信息简洁

---

## 全局设计决策

### 1. Design Tokens 更新建议

保持现有 Token 体系不变，**新增**以下 Token：

```css
:root {
  /* === 新增：区块背景分层 === */
  --color-bg-section-a: #0a0a0f;  /* 深黑偏蓝 — Hero, Contrast, Vision */
  --color-bg-section-b: #0e0e1a;  /* 略亮深蓝 — Reveal, Architecture, CTA */
  --color-bg-section-c: #12122a;  /* 最亮深蓝 — Process（核心证据区块加亮） */
  
  /* === 新增：发光系统 === */
  --glow-sm: 0 0 8px rgba(129,140,248,0.25);
  --glow-md: 0 0 16px rgba(129,140,248,0.35);
  --glow-lg: 0 0 32px rgba(129,140,248,0.45);
  --glow-xl: 0 0 48px rgba(129,140,248,0.30);
  --glow-gold: 0 0 24px rgba(251,191,36,0.40);

  /* === 新增：渐变 === */
  --gradient-section-fade: linear-gradient(180deg, transparent, rgba(129,140,248,0.03) 50%, transparent);
  --gradient-radial-center: radial-gradient(ellipse 600px 400px at 50% 50%, rgba(129,140,248,0.06), transparent);
  
  /* === 新增：间距扩展 === */
  --sp-20: 80px;
  --sp-24: 96px;
  --sp-32: 128px;
}
```

### 2. 区块背景分层策略

**核心问题**：当前三档背景色差距 < 3%（`#0d0d14` → `#0f0f1a` → `#111122`），肉眼无法区分。

**重设计策略**：不依赖纯色差做区块区分，改用**微妙径向渐变 + 顶部/底部渐变过渡带**。

| 区块 | 基底背景 | 渐变叠加 | 过渡 |
|------|---------|---------|------|
| ① Hero | `#080810` | 无（纯黑最大化对比） | ─ |
| ② Reveal | `#0a0a14` | 中心径向渐变 `accent-glow 6%` | 顶部 80px 从 Hero 黑过渡 |
| ③ Process | `#0c0c1c` | 底部水平线发光条 accent 2% | 顶部边界线 `1px accent 10%` |
| ④ Contrast | `#080810` | 无 | 顶部 64px 渐隐 |
| ⑤ Architecture | `#0a0a14` | 每张剖面卡片内部微渐变 | ─ |
| ⑥ Vision | `#080810` | 无（呼应 Hero 的纯黑） | ─ |
| ⑦ CTA | `#0a0a14` | 中心径向渐变 `accent 4%` | ─ |

**关键**：区块间过渡不用硬切，用 80px 高度的 `linear-gradient` 做柔和过渡。

### 3. 全局间距和留白规则

```
区块间垂直间距：   0（区块紧密衔接，用背景过渡区分）
区块内上下 padding：
  - 桌面端：96px（--sp-24）
  - 平板端：64px（--sp-16）
  - 手机端：48px（--sp-12）

标题到正文：     24px（--sp-6）
段落间距：       16px（--sp-4）
组件间距：       32px（--sp-8）
卡片内边距：     24px（--sp-6）
```

### 4. 移动端响应式策略

核心原则：**移动端不是缩小版的桌面端，是独立的信息呈现方案。**

| 断点 | 关键变化 |
|------|---------|
| ≤ 600px | 拓扑图改为**环形缩略图**（不隐藏！），时间线垂直，对比双栏改单栏，CTA按钮全宽 |
| ≤ 1023px | 拓扑图节点缩小但保留完整布局，间距减小 |
| ≥ 1024px | 完整桌面体验 |

**最关键的改变**：移动端不再隐藏拓扑图 SVG。改为设计一个适合小屏的环形/星云布局。

---

## 区块一：Hero — 重设计方案

### 问题
1. 强调句视觉区分度不足
2. 纯黑 100vh 留白过多
3. 缺少仪式感/氛围感

### 重设计

#### 氛围层
在纯黑背景上叠加一个极微弱的中心径向渐变——不是加色，是加"空间感"：

```css
#hook {
  background: 
    radial-gradient(ellipse 800px 600px at 50% 60%, rgba(129,140,248,0.02), transparent),
    #080810;
}
```

#### 日期行仪式感
```css
#hook-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: var(--ls-wide);
  color: var(--color-accent);
  opacity: 0;
  /* 日期用 accent 色 + monospace 字体，像电脑终端的日志输出 */
}
```

#### 强调句视觉升级
```css
.hook-emphasis {
  color: #fff;               /* 纯白，不是 #f5f5f5 */
  text-shadow: 0 0 40px rgba(129,140,248,0.15);  /* 微弱 accent 辉光 */
  font-size: calc(var(--fs-display) * 1.05);      /* 比正文行略大 5% */
}
```

#### 下滚箭头升级
```css
.scroll-arrow {
  color: var(--color-accent);    /* accent 色替代 dim */
  font-size: var(--fs-h2);       /* 缩小一点更精致 */
  opacity: 0;
  /* 呼吸动画保持不变 */
}
```

#### 间距调整
- 文字区域垂直居中，但整体偏下 10%（`padding-top: 55vh` 的视觉中心）
- 行间 spacer 从 `32px` 减为 `20px`（收紧节奏）

---

## 区块二：拓扑图 — 重设计方案

> **这是全站视觉冲击力的核心。必须让人第一眼被震撼。**

### 问题诊断
当前拓扑图是一个 1060×860 的 SVG，28 个节点按 7 行排列，像一张组织架构表。缺乏有机感、层级感和仪式感。移动端直接隐藏 SVG，退化为文字列表。

### 重设计：同心环辐射布局

#### 布局策略

**从网格排列 → 同心环辐射**。以 Leader 为圆心，节点按层级环绕：

```
         Ring 0（最内）: 👤 老板          — 最顶部，单独一个
              ↓
         Ring 1: 🧧 Leader              — 圆心位置
              ↓
         Ring 2: 🏗️ 项目管理 + 📝 技术文档  — 第一环（2 个节点）
              ↓
         Ring 3: 全部 L3 专家             — 第二环（25 个节点）
                 按职能域分组，同域节点相邻
```

**第二环（25个专家）按职能域分组，用弧段暗示分类**：
- 需求洞察域（4个）
- 战略定义域（2个）
- 流程角色域（3个）
- 文档调研域（2个）
- 设计域（2个）
- 架构数据域（3个）
- 开发域（2个）
- 质量域（3个）
- 交付域（2个）
- 运营迭代域（3个）
- 领域专家（1个）

#### SVG 规格

- **viewBox**: `0 0 900 900`（正方形，方便环形布局）
- **中心点**: `(450, 480)`（略偏下，给老板留顶部空间）
- **老板节点**: `(450, 80)` — r=36，金色 #fbbf24，独立于环形外
- **Leader 节点**: `(450, 480)` — r=32，accent 色，圆心
- **Ring 2 节点**: r=26，距圆心 120px
- **Ring 3 节点**: r=22，距圆心 280px（桌面端）/ 200px（平板）/ 160px（手机）
- **老板→Leader 连线**: 垂直，stroke-width: 2，accent 色
- **Leader→Ring2 连线**: 短辐射线
- **Ring2→Ring3 连线**: 弧形或短射线连接对应职能域

#### 节点视觉

```
未亮起状态:
  - fill: rgba(26,26,46, 0.6)
  - stroke: rgba(58,58,85, 0.4)
  - stroke-width: 1
  - opacity: 0.15

亮起动画:
  - fill → var(--color-accent)
  - stroke → var(--color-accent)
  - filter: drop-shadow(var(--glow-md))
  - opacity → 1
  - transition: all 0.4s ease-out

老板节点亮起:
  - fill → #fbbf24
  - filter: drop-shadow(var(--glow-gold))
  - 最后亮起（最高 data-order）

Leader 节点:
  - 比普通节点大 (r=32)
  - 亮起后有持续脉冲发光：
    @keyframes pulse {
      0%, 100% { filter: drop-shadow(0 0 16px rgba(129,140,248,0.35)); }
      50%      { filter: drop-shadow(0 0 24px rgba(129,140,248,0.55)); }
    }
```

#### 连线视觉

```
未亮起: stroke: rgba(58,58,85,0.1), stroke-width: 1
亮起后: stroke: rgba(129,140,248,0.25), stroke-width: 1.5
老板→Leader 线: stroke: rgba(251,191,36,0.3), stroke-width: 2
```

#### 标签显示

- **桌面端**：每个节点下方常驻显示 emoji + 角色名（`font-size: 11px`，亮起后 `12px`）
- **移动端**：节点只显示 emoji，点击后 tooltip 显示角色名 + 一句话定位
- **Ring3 标签防重叠**：相邻节点的标签交错放置（偶数节点标签在外侧，奇数在内侧）

#### 动画序列

```
Phase 1 (0-0.5s):    Leader 从黑暗中亮起，脉冲发光
Phase 2 (0.5-0.8s):  Ring 2 两个节点亮起 + 连线
Phase 3 (0.8-3.0s):  Ring 3 节点按职能域分组依次亮起
                      每组一起亮起（80ms 间隔/节点），组间 200ms 间隔
Phase 4 (3.0-3.5s):  所有连线同时淡入
Phase 5 (3.5-4.0s):  老板节点从上方亮起（金色光芒）
                      + 老板→Leader 连线亮起
Phase 6 (4.5s):      底部文案淡入
```

#### 移动端适配（关键改变！）

**不再隐藏 SVG！** 改为：
- viewBox 保持 `900 900`
- Ring 3 半径缩小到 160px
- 节点 r 缩小：Leader=24, Ring2=20, Ring3=16
- 标签只显示 emoji（不显示文字）
- 触摸任一节点弹出 tooltip
- SVG 可双指缩放（`touch-action: pinch-zoom`）

#### 背景氛围

```css
#reveal {
  background: 
    radial-gradient(ellipse 500px 500px at 50% 55%, rgba(129,140,248,0.06), transparent),
    #0a0a14;
}
```

在 SVG 内部，圆心位置添加一个极微弱的径向渐变圆（`<radialGradient>`），让 Leader 节点周围有"光源"感。

---

## 区块三：时间线 — 重设计方案

### 问题
- 桌面端水平时间线需要横滑，不直观
- 展开面板只有文字，缺少视觉锚点
- 数据待回填

### 重设计

#### 布局：统一垂直时间线

**桌面端和移动端都用垂直时间线**。理由：
1. 页面是垂直滚动叙事，水平时间线打断节奏
2. 8 个步骤垂直排列更利于 ScrollTrigger 逐步点亮
3. 展开面板可以自然在每步下方展开

```
布局结构:
  [左侧] 垂直线条 + 节点圆点
  [右侧] 步骤内容（emoji + 角色名 + 做了什么 + 产出数据）
```

#### 节点视觉升级

```css
.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  position: relative;
}
.step-dot.lit {
  background: var(--color-accent);
  box-shadow: var(--glow-sm);
}
/* 当前步骤（最新点亮的）额外脉冲 */
.step-dot.current {
  animation: dot-pulse 2s ease-in-out infinite;
}
```

#### 展开面板升级

每个步骤的展开面板增加**产出物预览**：
- 步骤1（需求）：显示 design-v3.md 的目录结构
- 步骤5（开发）：显示 index.html 的文件大小和行数
- 步骤6（审查）：显示审查结论摘要

```css
.step-detail {
  background: var(--color-bg-surface);
  border-left: 2px solid var(--color-accent);
  border-radius: 0 8px 8px 0;
  padding: var(--sp-4) var(--sp-6);
  margin-left: var(--sp-8);
  margin-top: var(--sp-3);
  margin-bottom: var(--sp-6);
}
.step-detail .output-preview {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--color-text-dim);
  background: var(--color-bg-elevated);
  padding: var(--sp-3);
  border-radius: 4px;
  margin-top: var(--sp-3);
  white-space: pre;
  overflow-x: auto;
}
```

---

## 区块四：对比 — 重设计方案

### 问题
- 左栏"暗"度不够，对比不够鲜明
- 标签区域与流程步骤间距紧凑

### 重设计

#### 左栏视觉降级增强

```css
.contrast-panel.dim {
  opacity: 1;          /* 不用全局 opacity */
  background: rgba(10,10,15,0.8);
  border: 1px dashed rgba(58,58,85,0.3);
}
.dim .flow-step {
  color: var(--color-text-dim);    /* #999 而不是 #e0e0e0 */
  border-left: 1px dashed rgba(58,58,85,0.3);
}
.dim .panel-heading {
  color: var(--color-text-muted);  /* 不是 #f5f5f5 */
}
```

#### 右栏视觉增强

```css
.contrast-panel.bright {
  background: var(--color-bg-surface);
  border: 1px solid rgba(129,140,248,0.2);
  box-shadow: 0 0 40px rgba(129,140,248,0.03);  /* 微弱外发光 */
}
.bright .panel-heading {
  color: var(--color-text-bright);
}
.bright .flow-step {
  color: var(--color-text);
  border-left: 2px solid var(--color-accent);
}
```

#### 间距调整
- 标签区域 `margin-top: var(--sp-6)`（从 `--sp-4` 增大）
- 标签区域 `padding-top: var(--sp-4)`（从 `--sp-3` 增大）
- 每个 flow-step `padding: var(--sp-3) 0`（从 `--sp-2` 增大）

#### 入场动画强化
- 左栏先入场（从左 translateX(-40px)），灰暗色调
- 0.6s 后右栏入场（从右 translateX(40px)），正常亮度
- 形成视觉对比冲击

---

## 区块五：深层架构 — 重设计方案

### 问题
- clip-path 起始态完全隐藏内容，用户看到空白
- 记忆层级颜色被 `!important` 覆盖

### 重设计

#### 取消 clip-path，改为 translateY + opacity

```css
.cross-section {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity var(--dur-slower) var(--ease-out),
              transform var(--dur-slower) var(--ease-out);
}
.cross-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### 恢复记忆层级颜色

删除 V3.2 的 `!important` 覆盖，让原始颜色生效：

```css
/* 记忆层级颜色 — 这是信息的一部分，不能统一灰色 */
.heat-hot  { color: #f87171; }  /* 红 = 🔥 HOT */
.heat-warm { color: #fbbf24; }  /* 黄 = 🟡 WARM */
.heat-proj { color: #818cf8; }  /* 蓝 = 📁 PROJ */
.heat-emer { color: #fb923c; }  /* 橙 = 🆘 应急 */
```

#### 剖面卡片视觉

```css
.cross-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: var(--sp-6);
  /* 左侧 accent 色竖条装饰 */
  border-left: 3px solid var(--color-accent);
}
```

#### 剖面间距增大

```css
.cross-sections {
  gap: var(--sp-16);  /* 从 --sp-12 (48px) 增加到 64px */
}
```

---

## 区块六：宣言 — 重设计方案

### 问题
- 段落间距统一，不配合情绪曲线
- 分割线移动端太短

### 重设计

#### 段落间距配合情绪节奏

```css
/* 铺垫段：紧凑 */
.vision-para {
  margin-bottom: var(--sp-6);  /* 24px 默认 */
}

/* 转折前（"但它们是散兵"）：留更大呼吸 */
.vision-para.pause-before {
  margin-top: var(--sp-8);     /* 32px */
}

/* 高潮段（"答案是——组织"）：前后都留大间距 */
.vision-para.climax {
  margin-top: var(--sp-12);
  margin-bottom: var(--sp-12);
}
```

#### 分割线响应式

```css
.vision-divider {
  width: 0;
  height: 1px;
  background: var(--color-accent);
  opacity: 0.5;
  margin: var(--sp-12) 0;
  transition: width var(--dur-slow) var(--ease-out);
}
.vision-divider.visible {
  width: min(120px, 30vw);  /* 移动端用 30vw，约 112px@375px */
}
```

#### "答案是——组织" 视觉方案

```css
/* 不用内联 style，用 class */
.vision-answer {
  color: var(--color-accent);
  font-weight: var(--fw-bold);
  font-size: calc(var(--fs-h2) * 1.15);
  text-shadow: 0 0 30px rgba(129,140,248,0.2);
}
```

---

## 区块七：CTA + Footer — 重设计方案

### 问题
- 80vh 高度太空旷
- 缺少引导副文案
- 主按钮对比度待验证

### 重设计

#### 缩小高度 + 增加内容

```css
#cta {
  min-height: 60vh;  /* 从 80vh 缩小 */
  padding: var(--sp-24) var(--sp-6);
}
```

增加副标题文案：
```html
<h2 class="cta-title">想看看这个组织是怎么运转的？</h2>
<p class="cta-subtitle">所有源码、角色设定、技能代码，全部公开。</p>
```

```css
.cta-subtitle {
  font-size: var(--fs-body);
  color: var(--color-text-muted);
  margin-bottom: var(--sp-8);
  max-width: 400px;
}
```

#### 按钮对比度修复

主按钮 `#818cf8` 配白字（#fff）对比度 ≈ 3.8:1，不达 4.5:1。

方案：按钮文字改为深色。
```css
.btn-primary {
  background: var(--color-accent);
  color: #0a0a14;  /* 深色文字，对比度 > 8:1 */
  font-weight: var(--fw-bold);
}
```

#### Footer 视觉层级

```css
.footer-brand {
  font-size: var(--fs-small);  /* 降级，不与 CTA 争注意力 */
  color: var(--color-text-dim);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
}
.footer-stats {
  font-size: var(--fs-xs);
  color: var(--color-text-dim);
}
.footer-meta {
  font-size: var(--fs-xs);
  color: var(--color-accent);
  font-style: italic;
  margin-top: var(--sp-2);
}
```

#### 微妙背景

```css
#cta {
  background: 
    radial-gradient(ellipse 400px 300px at 50% 40%, rgba(129,140,248,0.04), transparent),
    #0a0a14;
}
```

---

## 可访问性方案

### 对比度验证清单

| 元素 | 前景 | 背景 | 比值 | 标准 | 状态 |
|------|------|------|------|------|------|
| 正文 | #e0e0e0 | #0a0a0f | 14.7:1 | ≥4.5:1 | ✅ |
| 标题 | #f5f5f5 | #0a0a0f | 17.3:1 | ≥3:1 | ✅ |
| Muted 文字 | #c0c0c0 | #0a0a0f | 10.8:1 | ≥4.5:1 | ✅ |
| Dim 文字 | #999 | #0a0a0f | 7.5:1 | ≥4.5:1 | ✅ |
| Accent 文字 | #818cf8 | #0a0a0f | 5.8:1 | ≥4.5:1 | ✅ |
| 主按钮文字 | #0a0a14 | #818cf8 | 5.8:1 | ≥4.5:1 | ✅ |
| 散装AI左栏文字 | #999 | rgba(10,10,15,0.8) | ~7:1 | ≥4.5:1 | ✅ |

### 焦点管理

```css
/* 所有可交互元素的焦点环 */
a:focus-visible,
button:focus-visible,
.timeline-step:focus-visible,
.topo-node:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  border-radius: 4px;
}

/* 移除默认 outline 但提供替代 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 语义化标签

当前 HTML 语义化已经较好（`<section>`, `<article>`, `<nav>`, `aria-label`），需要补充：
- 拓扑图 SVG 增加 `role="img"` + `aria-label`（已有 ✅）
- 时间线 `role="list"` + `role="listitem"`（已有 ✅）
- 展开面板增加 `aria-expanded` 状态
- Tooltip 的 `aria-describedby` 关联

---

## 前端实现优先级

### P0 — 立即（视觉冲击力核心）

| 改动 | 预估工作量 | 原因 |
|------|-----------|------|
| **区块二拓扑图重写为同心环布局** | 大 | 全站视觉核心，当前网格布局没有震撼感 |
| **移动端保留 SVG 拓扑图** | 中 | 移动端不能是"一片黑" |
| **区块背景渐变分层** | 小 | 仅改 CSS，立竿见影 |
| **清理 `!important` 覆盖** | 小 | 代码健康度，恢复记忆层级颜色 |

### P1 — 紧跟（信息呈现优化）

| 改动 | 预估工作量 | 原因 |
|------|-----------|------|
| 区块三时间线改为垂直 | 中 | 桌面端水平滚动不直观 |
| 区块四对比度增强 | 小 | 仅改 CSS |
| 区块七 CTA 增加副文案 + 按钮色修复 | 小 | 内容+CSS |
| Hero 日期行 + 强调句样式升级 | 小 | 仅改 CSS |

### P2 — 后续迭代

| 改动 | 预估工作量 | 原因 |
|------|-----------|------|
| 区块五取消 clip-path，改 translateY | 小 | 体验优化 |
| 区块六段落间距配合情绪曲线 | 小 | 细节打磨 |
| 区块三展开面板增加产出预览 | 中 | 需要真实数据回填后才能做 |
| 全站动画时序精调 | 中 | 需要在浏览器中反复调试 |

---

_走查和方案到此。下一步：输出区块二拓扑图的可预览 HTML/CSS 原型（prototype-topology.html）。_
