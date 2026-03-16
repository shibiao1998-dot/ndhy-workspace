// ---------------------------------------------------------------------------
// reduced-motion.ts — Accessibility helper for prefers-reduced-motion
// ---------------------------------------------------------------------------

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the user's OS / browser is set to reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Watch for runtime changes to the reduced-motion preference and invoke
 * `callback` whenever it changes. Returns an `unsubscribe` function.
 *
 * ```ts
 * const unsub = watchReducedMotion((reduced) => {
 *   console.log('reduced-motion is now', reduced);
 * });
 * // later…
 * unsub();
 * ```
 */
export function watchReducedMotion(
  callback: (reducedMotion: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mql = window.matchMedia(QUERY);

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mql.addEventListener('change', handler);

  return () => {
    mql.removeEventListener('change', handler);
  };
}
