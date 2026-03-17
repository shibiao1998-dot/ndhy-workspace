/**
 * Shared IntersectionObserver factory.
 * Creates a single observer per threshold value and reuses it.
 * Adds 'is-visible' class on intersection, then unobserves.
 */

type ObserverOptions = {
  /** Intersection threshold (0-1). Default: 0.3 */
  threshold?: number;
  /** Root margin. Default: '0px' */
  rootMargin?: string;
  /** Class to add on intersection. Default: 'is-visible' */
  visibleClass?: string;
  /** Whether to unobserve after first intersection. Default: true */
  once?: boolean;
};

const observerCache = new Map<string, IntersectionObserver>();

function getCacheKey(opts: Required<ObserverOptions>): string {
  return `${opts.threshold}|${opts.rootMargin}|${opts.visibleClass}|${opts.once}`;
}

export function createObserver(options: ObserverOptions = {}): IntersectionObserver {
  const opts: Required<ObserverOptions> = {
    threshold: options.threshold ?? 0.3,
    rootMargin: options.rootMargin ?? '0px',
    visibleClass: options.visibleClass ?? 'is-visible',
    once: options.once ?? true,
  };

  const key = getCacheKey(opts);
  const cached = observerCache.get(key);
  if (cached) return cached;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(opts.visibleClass);
          if (opts.once) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: opts.threshold, rootMargin: opts.rootMargin }
  );

  observerCache.set(key, observer);
  return observer;
}

/**
 * Convenience: observe all elements matching a selector.
 */
export function observeAll(
  selector: string,
  options: ObserverOptions = {},
  root: ParentNode = document
): void {
  const observer = createObserver(options);
  root.querySelectorAll(selector).forEach((el) => observer.observe(el));
}

/**
 * Observe a parent element; when it intersects, stagger-reveal its children.
 *
 * Common pattern: a container (e.g. column, grid) scrolls into view,
 * then each child gets `is-visible` + an incremental transition-delay.
 *
 * @param parent    - Element to observe
 * @param childSelector - Selector for children to reveal
 * @param staggerMs - Delay between each child reveal (ms). Default: 80
 * @param options   - IntersectionObserver options (threshold, etc.)
 */
export function observeWithStagger(
  parent: Element,
  childSelector: string,
  staggerMs = 80,
  options: { threshold?: number; once?: boolean } = {},
): void {
  const threshold = options.threshold ?? 0.15;
  const once = options.once ?? true;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll(childSelector);
          children.forEach((child, i) => {
            const el = child as HTMLElement;
            setTimeout(() => {
              el.classList.add('is-visible');
            }, i * staggerMs);
          });
          if (once) observer.unobserve(entry.target);
        }
      });
    },
    { threshold },
  );

  observer.observe(parent);
}

/**
 * Observe a parent element; when it intersects, apply inline styles to children.
 *
 * Used for topo-node style reveals where we set opacity/transform via JS.
 *
 * @param parent        - Element to observe
 * @param childSelector - Selector for children to reveal
 * @param staggerMs     - Delay between each child (ms). Default: 60
 * @param styles        - Record of CSS properties to set on each child
 * @param options       - IntersectionObserver options
 */
export function observeWithStyleReveal(
  parent: Element,
  childSelector: string,
  staggerMs = 60,
  styles: Record<string, string> = { opacity: '1', transform: 'translateY(0)' },
  options: { threshold?: number; once?: boolean } = {},
): void {
  const threshold = options.threshold ?? 0.3;
  const once = options.once ?? true;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll(childSelector);
          children.forEach((child, i) => {
            const el = child as HTMLElement;
            el.style.transitionDelay = `${i * staggerMs}ms`;
            Object.entries(styles).forEach(([prop, val]) => {
              el.style.setProperty(prop, val);
            });
          });
          if (once) observer.unobserve(entry.target);
        }
      });
    },
    { threshold },
  );

  observer.observe(parent);
}
