# 审查报告

## 审查摘要
- **变更**：ai-org-showcase v2 产品官网
- **审查范围**：`index.html`（46KB 单文件站）、`Dockerfile`、`docker-compose.yml`、`Caddyfile`
- **结论**：⚠️ **有条件放行**
- **问题统计**：🔴 0 个 | 🟡 7 个 | 🟢 6 个

---

## 🟡 建议改进

### 1. 【index.html】Canvas 粒子动画缺少移动端性能保护
- **位置**：`<script>` 第 1 段，`PARTICLE_COUNT` 计算和 `loop()` 函数
- **问题**：粒子连线算法复杂度为 O(n²)（双层嵌套 `for` 循环），80 个粒子产生 ~3160 次距离计算/帧。在低端移动设备上，`requestAnimationFrame` 以 60fps 运行此计算可能导致掉帧和电量消耗。
- **原因**：纯展示站的首屏动画不应成为移动端性能瓶颈。
- **改进方案**：
  1. 在移动端（`window.innerWidth < 768`）减少粒子数或直接跳过 Canvas 动画：
     ```js
     const isMobile = window.innerWidth < 768;
     const PARTICLE_COUNT = isMobile ? 30 : Math.min(80, Math.floor(window.innerWidth / 15));
     const CONNECTION_DIST = isMobile ? 100 : 150;
     ```
  2. 考虑添加 `prefers-reduced-motion` 媒体查询支持，尊重用户系统设置：
     ```js
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
     ```
  3. 当前 `canvas.addEventListener('mousemove')` 在移动端无意义但无害，可忽略。

### 2. 【index.html】Pipeline 动画 `setInterval` 未清理
- **位置**：`<script>` "Pipeline Animation" 段，`startPipelineAnimation()` 函数
- **问题**：`intervalId` 被赋值但从未被 `clearInterval` 清理。虽然 `observer.disconnect()` 阻止了重复触发，但 `setInterval` 本身永远运行——即使用户滚动离开该区域后，每 400ms 仍在执行 DOM 操作（`classList.remove/add`）。
- **原因**：不可见区域的持续 DOM 操作浪费 CPU，尤其在长时间停留页面时累积。
- **改进方案**：
  ```js
  // 用 IntersectionObserver 控制动画启停
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!intervalId) startPipelineAnimation();
    } else {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, { threshold: 0.3 });
  ```

### 3. 【index.html】数字计数器对"0 行"的处理存在视觉闪烁
- **位置**：Number Counter Animation 段
- **问题**：`data-target="0"` 配合 `data-suffix=" 行"` 的计数器，动画结果是从 `0` 动画到 `0`——计数器没有动画效果，但初始值显示 `0 行`，动画后也是 `0 行`。这不是 Bug，但相对其他数字（1→滚到 1、0→滚到 26）缺少"零代码"的戏剧性展示效果。
- **改进方案**：可以考虑从一个较大数字（如 `99999`）倒计数到 `0`，制造"归零"的视觉冲击。或者保持现状——简洁也是一种选择。

### 4. 【Caddyfile】CSP 策略中 `'unsafe-inline'` 的安全权衡
- **位置**：`Caddyfile` → `Content-Security-Policy` 头
- **问题**：`script-src 'self' 'unsafe-inline'` 和 `style-src 'self' 'unsafe-inline'`。`'unsafe-inline'` 允许页面内联脚本和样式执行，本质上削弱了 CSP 对 XSS 的防护能力。
- **原因**：当前架构是单文件 HTML（CSS 和 JS 全部内联），因此 `'unsafe-inline'` 是**技术上必须的**。但应意识到这是一个权衡——如果未来引入用户输入或动态内容，需要迁移到 nonce 或 hash 方案。
- **改进方案（可选，非阻断）**：
  1. **当前可接受**：纯静态展示站、零用户输入、零动态内容注入，`'unsafe-inline'` 的实际 XSS 风险极低。
  2. **更优方案**：将内联 `<style>` 和 `<script>` 的 SHA256 hash 加入 CSP（如 `script-src 'self' 'sha256-xxxx'`），消除 `'unsafe-inline'`。但对单文件站而言投入产出比低。
  3. **底线**：确保不要在 JS 中使用 `eval()`、`innerHTML` 拼接用户输入等模式——当前代码已满足此条件。

### 5. 【Caddyfile】HTML 文件缓存策略过长
- **位置**：`Caddyfile` → `@static` matcher 和 `Cache-Control` 头
- **问题**：`@static` 匹配器包含 `*.html`，缓存时间 `max-age=3600`（1 小时）。对于静态资源（CSS/JS/图片/字体）1 小时缓存没问题，但 HTML 文件通常应保持较短缓存或 `no-cache`，以确保内容更新后用户能及时看到最新版本。
- **原因**：当前是单文件站（只有 `index.html`），一旦更新部署，用户可能在 1 小时内仍看到旧版本。
- **改进方案**：
  ```
  # HTML 文件短缓存
  @html {
    path *.html
  }
  header @html Cache-Control "public, max-age=60, must-revalidate"

  # 静态资源长缓存
  @assets {
    path *.css *.js *.ico *.svg *.png *.jpg *.webp *.woff2
  }
  header @assets Cache-Control "public, max-age=86400, stale-while-revalidate=604800"
  ```

### 6. 【index.html】组织基建分组与 content-v2.md 定义不完全一致
- **位置**：`#team` section → "🔧 组织基建" domain-group
- **问题**：content-v2.md 将最后 5 个角色分为三个分组：
  - 🔧 组织基建（3 人）：流程设计、角色创造、Skill 开发
  - 📝 知识管理（1 人）：技术文档
  - 🏗️ 项目管理（1 人）：项目管理

  但 HTML 将这三组合并为一个"🔧 组织基建"（5 人）。
- **原因**：合并后视觉更紧凑、减少分组碎片化，是合理的展示优化。但与 content-v2 文案定义有偏差。
- **改进方案**：如果 content-v2.md 是正式文案契约，应保持分组一致。如果 v2 文案只是参考，当前合并方案可接受——三个 1-3 人的小分组确实不如一个 5 人组直观。**建议确认文案契约的约束力再决定**。

### 7. 【index.html】`X-XSS-Protection` 头已被现代浏览器废弃
- **位置**：`Caddyfile` → `X-XSS-Protection "1; mode=block"`
- **问题**：`X-XSS-Protection` 头已被 Chrome（自 v78）和其他现代浏览器移除支持。保留它不会造成安全问题，但属于无效配置。某些安全审计工具甚至建议设置为 `0`（关闭），因为旧版浏览器的 XSS Auditor 本身存在漏洞。
- **改进方案**：
  - 移除该头，或设置为 `X-XSS-Protection "0"` — 依赖 CSP 提供 XSS 防护（已配置）
  - 保留现状也无害，仅是过时

---

## 🟢 小建议

### 1. 【index.html】`aria-label` 可更语义化
- **位置**：`<button class="nav-toggle" aria-label="Toggle menu">`
- **建议**：改为中文 `aria-label="打开导航菜单"` / `aria-label="关闭导航菜单"`，与页面语言一致。同时在 JS 切换时动态更新 `aria-label`：
  ```js
  toggle.setAttribute('aria-label', links.classList.contains('open') ? '关闭导航菜单' : '打开导航菜单');
  ```

### 2. 【index.html】缺少 `<meta name="theme-color">`
- **建议**：添加 `<meta name="theme-color" content="#08080e">`，让移动端浏览器地址栏颜色与页面背景一致，提升沉浸感。

### 3. 【index.html】缺少 Open Graph 和 Twitter Card 元数据
- **建议**：作为产品官网，分享到社交媒体时应有良好的预览效果。建议添加：
  ```html
  <meta property="og:title" content="NDHY AI Agent Team — 一个人类，26 个 AI 专家，一个完整的产品组织">
  <meta property="og:description" content="不是工具调用，不是 Prompt 技巧。一支有架构、有纪律、有记忆、会进化的 AI 组织。">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  ```

### 4. 【index.html】`<section>` 缺少 `aria-labelledby`
- **建议**：各主要 section 可添加 `aria-labelledby` 指向 section header 的 h2，提升可访问性：
  ```html
  <section id="team" aria-labelledby="team-heading">
  ```

### 5. 【docker-compose.yml】缺少 `logging` 配置
- **建议**：生产环境建议限制日志大小，防止日志撑满磁盘：
  ```yaml
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"
  ```

### 6. 【index.html】Footer 年份硬编码缺失
- **位置**：`<footer>` 段
- **建议**：当前 footer 只有 `Built by NDHY AI Agent Team · 1 Human + 26 AI Experts · 0 Lines of Human Code`，没有年份信息。可考虑添加 `© 2025 NDHY` 或用 JS 动态生成年份。

---

## ✅ 亮点

### 1. 零外部依赖的单文件架构
整个 46KB 的页面不依赖任何 CDN、外部字体、第三方 JS 库。完全自包含，加载速度有保障，不会被外部资源拖慢。CSS 变量和 `clamp()` 的使用让响应式适配干净利落。

### 2. Canvas 粒子动画实现精良
粒子数量根据屏幕宽度动态计算（`Math.min(80, Math.floor(window.innerWidth / 15))`），鼠标斥力交互和速度衰减（`p.vx *= 0.999`）让动画自然不突兀。连线距离阈值和透明度渐变处理到位。

### 3. 滚动驱动叙事设计
IntersectionObserver 驱动的 `.reveal` 动画 + `--i` CSS 自定义属性实现的交错延迟，让 26 张卡片的出现节奏感很好。`rootMargin: '0px 0px -40px 0px'` 的偏移确保元素在视口中偏上位置才触发，避免"刚露头就动"。

### 4. Docker 安全配置到位
- `read_only: true` — 只读文件系统，容器被攻破也无法写入
- `no-new-privileges:true` — 阻止提权
- `tmpfs` 分配精准（/tmp、/data、/config 各 10M）— Caddy 运行所需的最小可写空间
- 资源限制合理（0.5 CPU、128M 内存）— 静态站绰绰有余
- 健康检查完整（wget spider + 30s 间隔 + 3 次重试 + 10s 启动宽限）

### 5. Caddy 安全头配置完整
`X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy` 全覆盖。`-Server` 移除了服务器版本信息暴露。CSP 策略虽包含 `'unsafe-inline'`（已在 🟡 中讨论），但 `default-src 'self'` 的基线安全等级是合格的。

### 6. 流水线节点动画创意佳
Pipeline 节点逐个点亮的动画（`setInterval` 400ms 间隔 + `.active` class 切换）直观展示了"全链路 AI 流水线"的概念。节点包含并行分支（DB 设计 ∥ API 设计、后端 ∥ 前端），忠实反映了实际协作拓扑。

### 7. 内容准确性高
26 个专家角色的名称、emoji、分组和一句话描述全部正确，与 `roles/README.md` 和 `content-v2.md` 一致。Leader（发发/🧧）的展示区分于普通专家卡片（独立的 `.leader-card` 样式），信息架构正确。

### 8. 移动端适配完整
768px 和 640px 断点覆盖了主要移动场景。导航汉堡菜单、grid 单列回退、对比表格移动端重排（隐藏 header + 左边框标识 + `::before` 伪元素标签）都考虑到了。`scroll-padding-top: 80px` 确保锚点导航不被固定导航栏遮挡。

---

## 内容准确性核查

### 与 roles/README.md 的对照结果

| 维度 | 结果 |
|------|------|
| 专家数量 | ✅ 26 个专家 + 1 个 Leader，与 README 完全一致 |
| 角色名称 | ✅ 全部正确 |
| Emoji 对应 | ✅ 全部正确 |
| 分组 | ⚠️ 组织基建/知识管理/项目管理三组被合并为一组（见 🟡 #6） |
| 一句话定位 | ✅ 核心语义准确，部分为展示效果做了合理的文案精简 |
| Leader 信息 | ✅ 名称（发发）、emoji（🧧）、角色（组织运营者）全部正确 |

### 与 content-v2.md 的对照结果

| 维度 | 结果 |
|------|------|
| Hero 首屏 | ✅ 主标题、副标题、核心数据点完全匹配 |
| 五大创新 | ✅ 全链路/权力分层/分层记忆/自愈机制/知识治理全部覆盖 |
| 六维对比 | ✅ 架构/能力/记忆/质量/进化/扩展六维全部覆盖，文案一致 |
| 证据区 | ✅ 7 步时间线（文档→体验→前端→审查→部署→项目管理→Leader）完整 |
| CTA | ✅ 标题和副标题匹配 |

---

## 乱码检查

- U+FFFD 扫描结果：**未发现**（`False`）
- 文件编码：UTF-8 ✅

---

## 审查结论

### ⚠️ 有条件放行

**放行理由**：
- 无 🔴 阻断问题
- 内容准确性高，26 专家 + Leader 完整覆盖
- Docker 安全配置到位，部署方案合格
- 零外部依赖，首屏性能有保障
- 移动端适配完整
- 代码质量整体良好，JS 模块化（IIFE 隔离）、CSS 组织清晰

**条件（Follow-up 项）**：
1. 🟡 #1：移动端 Canvas 性能保护 + `prefers-reduced-motion` 支持 — **建议在部署前处理**
2. 🟡 #2：Pipeline 动画 `setInterval` 清理 — **建议在部署前处理**
3. 🟡 #5：HTML 缓存策略调整 — **建议在部署前处理**
4. 其余 🟡 项可在后续迭代中处理

---

## 质量自检清单

- [x] 所有问题都标注了 🔴/🟡/🟢 级别
- [x] 每个 🟡 问题都附带了改进方案
- [x] 审查结论（有条件放行）与问题清单一致（无 🔴，有可改进 🟡）
- [x] 不存在无分级的"一股脑建议"
- [x] 内容准确性已对照 roles/README.md 和 content-v2.md 验证
- [x] 边界条件和异常路径已检查（动画边界、计数器边界、空状态）
- [x] 未越权做产品取舍或排期决策
- [x] 乱码检查已完成（U+FFFD 扫描通过）

---

*审查人：🔍 代码审查专家*
*审查日期：2026-03-15*
