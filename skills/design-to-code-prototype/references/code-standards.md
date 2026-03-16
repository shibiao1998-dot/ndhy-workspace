# 原型代码标准与输出规范

> 原型代码的标准不是"能看就行"——它必须使用 Token、语义化、响应式、全状态。

## HTML 语义化标准

### 页面骨架模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面名称 — 原型预览</title>
  <style>
    /* ============ Design Tokens ============ */
    :root {
      --color-primary: #2563eb;
      --color-primary-hover: #1d4ed8;
      --color-success: #16a34a;
      --color-warning: #f59e0b;
      --color-error: #dc2626;
      --color-bg-primary: #ffffff;
      --color-bg-secondary: #f9fafb;
      --color-bg-tertiary: #f3f4f6;
      --color-fg-primary: #111827;
      --color-fg-secondary: #4b5563;
      --color-fg-tertiary: #9ca3af;
      --color-border-primary: #e5e7eb;
      --font-size-sm: 0.875rem;
      --font-size-base: 1rem;
      --font-size-lg: 1.125rem;
      --font-size-xl: 1.25rem;
      --font-size-2xl: 1.5rem;
      --font-size-3xl: 1.875rem;
      --spacing-2: 0.5rem;
      --spacing-3: 0.75rem;
      --spacing-4: 1rem;
      --spacing-6: 1.5rem;
      --spacing-8: 2rem;
      --spacing-12: 3rem;
      --radius-md: 0.375rem;
      --radius-lg: 0.5rem;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
      --transition-fast: 150ms ease;
      --transition-normal: 200ms ease;
    }

    /* ============ Reset & Base ============ */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: var(--font-size-base);
      line-height: 1.5;
      color: var(--color-fg-primary);
      background: var(--color-bg-primary);
    }

    /* ============ Layout ============ */
    /* ... 布局样式 ... */

    /* ============ Components ============ */
    /* ... 组件样式 ... */

    /* ============ States ============ */
    /* ... 状态样式 ... */

    /* ============ Responsive ============ */
    @media (max-width: 1023px) { /* Tablet */ }
    @media (max-width: 767px)  { /* Mobile */ }

    /* ============ Prototype Controls ============ */
    .proto-controls {
      position: fixed; bottom: 16px; right: 16px; z-index: 9999;
      display: flex; gap: 8px; padding: 8px;
      background: #1f2937; border-radius: 8px;
    }
    .proto-controls button {
      padding: 4px 12px; border: none; border-radius: 4px;
      font-size: 12px; color: #fff; background: #374151; cursor: pointer;
    }
    .proto-controls button:hover { background: #4b5563; }
    .proto-controls button.active { background: var(--color-primary); }
  </style>
</head>
<body>
  <header>
    <nav><!-- 导航 --></nav>
  </header>
  <main>
    <!-- 主内容 -->
  </main>
  <footer>
    <!-- 页脚 -->
  </footer>

  <!-- 原型状态切换控制器 -->
  <div class="proto-controls">
    <button class="active" onclick="switchState('default')">默认</button>
    <button onclick="switchState('loading')">加载中</button>
    <button onclick="switchState('empty')">空状态</button>
    <button onclick="switchState('error')">错误</button>
  </div>

  <script>
    function switchState(state) {
      document.querySelectorAll('[data-state]').forEach(el => {
        el.querySelectorAll('[class*="state-"]').forEach(s => s.hidden = true);
        const target = el.querySelector('.state-' + state);
        if (target) target.hidden = false;
      });
      document.querySelectorAll('.proto-controls button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(
          {default:'默认',loading:'加载中',empty:'空状态',error:'错误'}[state]
        ));
      });
    }
  </script>
</body>
</html>
```

---

## CSS 编写规范

### Token 使用规则

```css
/* ✅ 正确：使用 CSS 变量 */
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

/* ❌ 错误：硬编码值 */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

### 响应式编写规则

```css
/* Mobile First：基础样式 = 移动端 */
.grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-4); }

/* Tablet：向上扩展 */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: var(--spacing-6); }
}

/* Desktop：继续扩展 */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* 大屏：最大宽度约束 */
@media (min-width: 1280px) {
  .grid { grid-template-columns: repeat(4, 1fr); max-width: 1280px; margin: 0 auto; }
}
```

### 组件状态样式

```css
/* 按钮全状态 */
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-primary:hover { background: var(--color-primary-hover); }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
.btn-primary.loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}
.btn-primary.loading::after {
  content: "";
  position: absolute; inset: 0;
  margin: auto;
  width: 16px; height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

### Skeleton 加载态

```css
.skeleton {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 文本骨架 */
.skeleton-text { height: 1em; width: 80%; margin-bottom: 0.5em; }
.skeleton-text.short { width: 40%; }
/* 图片骨架 */
.skeleton-image { height: 200px; width: 100%; }
```
