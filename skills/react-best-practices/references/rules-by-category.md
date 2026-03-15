# React Best Practices — 规则分类速查

按优先级排列的 8 类 57 条规则。每条规则的详细代码示例见 `rules/` 目录下对应文件。

## 1. Eliminating Waterfalls (CRITICAL)

| Rule | Description | File |
|------|-------------|------|
| `async-defer-await` | Move await into branches where actually used | rules/async-defer-await.md |
| `async-parallel` | Use `Promise.all()` for independent operations | rules/async-parallel.md |
| `async-dependencies` | Use better-all for partial dependencies | rules/async-dependencies.md |
| `async-api-routes` | Start promises early, await late in API routes | rules/async-api-routes.md |
| `async-suspense-boundaries` | Use Suspense to stream content | rules/async-suspense-boundaries.md |

## 2. Bundle Size Optimization (CRITICAL)

| Rule | Description | File |
|------|-------------|------|
| `bundle-barrel-imports` | Import directly, avoid barrel files | rules/bundle-barrel-imports.md |
| `bundle-dynamic-imports` | Use `next/dynamic` for heavy components | rules/bundle-dynamic-imports.md |
| `bundle-defer-third-party` | Load analytics/logging after hydration | rules/bundle-defer-third-party.md |
| `bundle-conditional` | Load modules only when feature is activated | rules/bundle-conditional.md |
| `bundle-preload` | Preload on hover/focus for perceived speed | rules/bundle-preload.md |

## 3. Server-Side Performance (HIGH)

| Rule | Description | File |
|------|-------------|------|
| `server-auth-actions` | Authenticate server actions like API routes | rules/server-auth-actions.md |
| `server-cache-react` | Use `React.cache()` for per-request dedup | rules/server-cache-react.md |
| `server-cache-lru` | Use LRU cache for cross-request caching | rules/server-cache-lru.md |
| `server-dedup-props` | Avoid duplicate serialization in RSC props | rules/server-dedup-props.md |
| `server-serialization` | Minimize data passed to client components | rules/server-serialization.md |
| `server-parallel-fetching` | Restructure components to parallelize fetches | rules/server-parallel-fetching.md |
| `server-after-nonblocking` | Use `after()` for non-blocking operations | rules/server-after-nonblocking.md |

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

| Rule | Description | File |
|------|-------------|------|
| `client-swr-dedup` | Use SWR for automatic request deduplication | rules/client-swr-dedup.md |
| `client-event-listeners` | Deduplicate global event listeners | rules/client-event-listeners.md |
| `client-passive-event-listeners` | Use passive listeners for scroll | rules/client-passive-event-listeners.md |
| `client-localstorage-schema` | Version and minimize localStorage data | rules/client-localstorage-schema.md |

## 5. Re-render Optimization (MEDIUM)

| Rule | Description | File |
|------|-------------|------|
| `rerender-defer-reads` | Don't subscribe to state only used in callbacks | rules/rerender-defer-reads.md |
| `rerender-memo` | Extract expensive work into memoized components | rules/rerender-memo.md |
| `rerender-memo-with-default-value` | Hoist default non-primitive props | rules/rerender-memo-with-default-value.md |
| `rerender-dependencies` | Use primitive dependencies in effects | rules/rerender-dependencies.md |
| `rerender-derived-state` | Subscribe to derived booleans, not raw values | rules/rerender-derived-state.md |
| `rerender-derived-state-no-effect` | Derive state during render, not effects | rules/rerender-derived-state-no-effect.md |
| `rerender-functional-setstate` | Use functional setState for stable callbacks | rules/rerender-functional-setstate.md |
| `rerender-lazy-state-init` | Pass function to useState for expensive values | rules/rerender-lazy-state-init.md |
| `rerender-simple-expression-in-memo` | Avoid memo for simple primitives | rules/rerender-simple-expression-in-memo.md |
| `rerender-move-effect-to-event` | Put interaction logic in event handlers | rules/rerender-move-effect-to-event.md |
| `rerender-transitions` | Use startTransition for non-urgent updates | rules/rerender-transitions.md |
| `rerender-use-ref-transient-values` | Use refs for transient frequent values | rules/rerender-use-ref-transient-values.md |

## 6. Rendering Performance (MEDIUM)

| Rule | Description | File |
|------|-------------|------|
| `rendering-animate-svg-wrapper` | Animate div wrapper, not SVG element | rules/rendering-animate-svg-wrapper.md |
| `rendering-content-visibility` | Use content-visibility for long lists | rules/rendering-content-visibility.md |
| `rendering-hoist-jsx` | Extract static JSX outside components | rules/rendering-hoist-jsx.md |
| `rendering-svg-precision` | Reduce SVG coordinate precision | rules/rendering-svg-precision.md |
| `rendering-hydration-no-flicker` | Use inline script for client-only data | rules/rendering-hydration-no-flicker.md |
| `rendering-hydration-suppress-warning` | Suppress expected mismatches | rules/rendering-hydration-suppress-warning.md |
| `rendering-activity` | Use Activity component for show/hide | rules/rendering-activity.md |
| `rendering-conditional-render` | Use ternary, not && for conditionals | rules/rendering-conditional-render.md |
| `rendering-usetransition-loading` | Prefer useTransition for loading state | rules/rendering-usetransition-loading.md |

## 7. JavaScript Performance (LOW-MEDIUM)

| Rule | Description | File |
|------|-------------|------|
| `js-batch-dom-css` | Group CSS changes via classes or cssText | rules/js-batch-dom-css.md |
| `js-index-maps` | Build Map for repeated lookups | rules/js-index-maps.md |
| `js-cache-property-access` | Cache object properties in loops | rules/js-cache-property-access.md |
| `js-cache-function-results` | Cache function results in module-level Map | rules/js-cache-function-results.md |
| `js-cache-storage` | Cache localStorage/sessionStorage reads | rules/js-cache-storage.md |
| `js-combine-iterations` | Combine multiple filter/map into one loop | rules/js-combine-iterations.md |
| `js-length-check-first` | Check array length before expensive ops | rules/js-length-check-first.md |
| `js-early-exit` | Return early from functions | rules/js-early-exit.md |
| `js-hoist-regexp` | Hoist RegExp creation outside loops | rules/js-hoist-regexp.md |
| `js-min-max-loop` | Use loop for min/max instead of sort | rules/js-min-max-loop.md |
| `js-set-map-lookups` | Use Set/Map for O(1) lookups | rules/js-set-map-lookups.md |
| `js-tosorted-immutable` | Use toSorted() for immutability | rules/js-tosorted-immutable.md |

## 8. Advanced Patterns (LOW)

| Rule | Description | File |
|------|-------------|------|
| `advanced-event-handler-refs` | Store event handlers in refs | rules/advanced-event-handler-refs.md |
| `advanced-init-once` | Initialize app once per app load | rules/advanced-init-once.md |
| `advanced-use-latest` | useLatest for stable callback refs | rules/advanced-use-latest.md |
