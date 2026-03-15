# React Best Practices — 代码示例速查

## Key Patterns

### Parallel Data Fetching

```typescript
// Bad: sequential
const user = await fetchUser()
const posts = await fetchPosts()

// Good: parallel
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
])
```

### Dynamic Imports

```tsx
// Bad: bundles Monaco with main chunk
import { MonacoEditor } from './monaco-editor'

// Good: loads on demand
const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

### Functional setState

```tsx
// Bad: stale closure risk
const addItem = useCallback((item) => {
  setItems([...items, item])
}, [items]) // recreates on every items change

// Good: always uses latest state
const addItem = useCallback((item) => {
  setItems(curr => [...curr, item])
}, []) // stable reference
```

## NEVER Do

1. **NEVER await** operations sequentially when they can run in parallel
2. **NEVER import** from barrel files (`import { X } from 'lib'`) — import directly
3. **NEVER skip** authentication in Server Actions — treat them like API routes
4. **NEVER pass** entire objects to client components when only one field is needed
5. **NEVER use** `&&` for conditional rendering with numbers — use ternary
6. **NEVER subscribe** to state only used in event handlers — read on demand
7. **NEVER mutate** arrays with `.sort()` — use `.toSorted()`
8. **NEVER put** initialization in `useEffect([])` — use module-level guard

## Full Compiled Document

For the complete guide with all 57 rules and full code examples: `AGENTS.md` (2900+ lines)
