// ---------------------------------------------------------------------------
// scroll-setup.ts — Lenis smooth scroll + GSAP ScrollTrigger integration
// ---------------------------------------------------------------------------

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

// Register the plugin once at module level
gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

/**
 * Initialise Lenis smooth-scroll and wire it into GSAP's ScrollTrigger.
 *
 * When the user prefers reduced motion Lenis is **not** created — the page
 * falls back to native browser scrolling while ScrollTrigger still works
 * normally (it doesn't depend on Lenis).
 */
export function initSmoothScroll(): void {
  // Bail out if we're in SSR or the user prefers reduced motion
  if (typeof window === 'undefined') return;

  if (prefersReducedMotion()) {
    // ScrollTrigger still works with native scroll — nothing else to do.
    return;
  }

  // Avoid double-init if called more than once
  if (lenis) return;

  lenis = new Lenis({
    lerp: 0.1,
    duration: 1.2,
    smoothWheel: true,
  });

  // --- Sync Lenis → ScrollTrigger -------------------------------------------
  // Every time Lenis emits a scroll event we tell ScrollTrigger to recalculate.
  lenis.on('scroll', ScrollTrigger.update);

  // --- Sync GSAP ticker → Lenis --------------------------------------------
  // GSAP's ticker fires on every rAF; we forward the timestamp to Lenis so it
  // can advance its interpolation.  `time` from GSAP is in **seconds**, but
  // Lenis.raf() expects **milliseconds**.
  tickerCallback = (time: number) => {
    lenis!.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);

  // Disable GSAP's built-in lag-smoothing so Lenis keeps full control over the
  // scroll interpolation without sudden jumps after idle frames.
  gsap.ticker.lagSmoothing(0);
}

/**
 * Returns the current Lenis instance (or `null` if smooth-scroll was skipped
 * because of reduced-motion or SSR).
 */
export function getLenis(): Lenis | null {
  return lenis;
}

/**
 * Tear everything down — useful when navigating away or during HMR.
 */
export function cleanupSmoothScroll(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }

  if (lenis) {
    lenis.destroy();
    lenis = null;
  }

  // Kill every ScrollTrigger instance so nothing leaks across page transitions
  ScrollTrigger.getAll().forEach((st) => st.kill());
}
