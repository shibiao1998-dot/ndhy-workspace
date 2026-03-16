// ---------------------------------------------------------------------------
// section-triggers.ts — Scroll-triggered animations
//   1. IntersectionObserver for basic CSS class-driven reveals
//   2. GSAP ScrollTrigger scrub for Section 2 (Reveal) and Section 6 (Vision)
// ---------------------------------------------------------------------------

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

// Ensure plugin is registered (idempotent)
gsap.registerPlugin(ScrollTrigger);

/**
 * All CSS class names that opt an element into scroll-triggered animation.
 * The corresponding CSS transitions live in `global.css` and are activated
 * by the `.is-visible` class added here.
 */
const ANIM_SELECTORS = [
  '.anim-fade-up',
  '.anim-blur-reveal',
  '.anim-scale-spring',
  '.anim-clip-expand',
  '.anim-slide-left',
  '.anim-slide-right',
] as const;

const VISIBLE_CLASS = 'is-visible';

/**
 * Minimum ratio at which we consider the element "visible enough" to trigger
 * the entrance animation.
 */
const TRIGGER_RATIO = 0.15;

// ─── IntersectionObserver-based reveals ─────────────────────────────────────

function initIOReveals(): () => void {
  const selector = ANIM_SELECTORS.join(', ');
  const elements = document.querySelectorAll<HTMLElement>(selector);

  if (elements.length === 0) return () => {};

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio < TRIGGER_RATIO) continue;

        const el = entry.target as HTMLElement;
        const delay = el.dataset.delay;

        if (delay) {
          const ms = parseInt(delay, 10);
          if (!Number.isNaN(ms) && ms > 0) {
            el.style.transitionDelay = `${ms}ms`;
          }
        }

        el.classList.add(VISIBLE_CLASS);
        observer.unobserve(el);
      }
    },
    {
      threshold: [0, 0.15, 0.3],
      rootMargin: '0px 0px -8% 0px',
    },
  );

  elements.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
  };
}

// ─── Section 2: Topology Reveal ScrollTrigger ───────────────────────────────
//
// Spec (experience-design-v4.md §3.4):
//   - GSAP ScrollTrigger pin + scrub: scroll 0–100% maps to node light-up
//   - scrub: 1, pin: true, scroll distance = 120vh
//
// Climax burst (§3.3):
//   T+0ms   glow expansion on SVG container
//   T+200ms scale-up 1 → 1.03 → 1
//   T+400ms boss node last appearance
//   T+800ms bottom text pop
//   T+1300ms second line fade in
//
// pathDraw: SVG connection lines animate stroke-dashoffset

function initS2ScrollTrigger(): () => void {
  const section = document.querySelector('.reveal') as HTMLElement | null;
  if (!section) return () => {};

  const desktopTopology = section.querySelector('.topology-desktop') as HTMLElement | null;
  if (!desktopTopology) return () => {};

  const svg = desktopTopology.querySelector('svg') as SVGSVGElement | null;
  if (!svg) return () => {};

  // Gather nodes and connection lines
  const nodeGroups = svg.querySelectorAll<SVGGElement>('g[data-node-index]');
  const connectionLines = svg.querySelectorAll<SVGLineElement>('g[aria-hidden="true"] line');
  const bottomText = section.querySelector('.reveal__bottom') as HTMLElement | null;
  const headline = section.querySelector('.reveal__headline') as HTMLElement | null;
  const subtext = section.querySelector('.reveal__subtext') as HTMLElement | null;

  if (nodeGroups.length === 0) return () => {};

  // ── Prepare pathDraw for connection lines ──
  connectionLines.forEach((line) => {
    const x1 = parseFloat(line.getAttribute('x1') || '0');
    const y1 = parseFloat(line.getAttribute('y1') || '0');
    const x2 = parseFloat(line.getAttribute('x2') || '0');
    const y2 = parseFloat(line.getAttribute('y2') || '0');
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    line.setAttribute('stroke-dasharray', String(length));
    line.setAttribute('stroke-dashoffset', String(length));
    line.style.opacity = '0';
  });

  // ── Prepare nodes: set initial opacity ──
  // Nodes start at opacity 0.3 (visible but dim) — scroll animation brings them to 1
  nodeGroups.forEach((g) => {
    g.style.opacity = '0.3';
  });

  // ── Prepare bottom text ──
  if (bottomText) {
    gsap.set(bottomText, { opacity: 0, y: 20 });
  }
  if (headline) {
    gsap.set(headline, { opacity: 0, y: 16, scale: 0.96 });
    // Remove the CSS anim class so GSAP controls it
    headline.classList.remove('anim-scale-spring');
  }
  if (subtext) {
    gsap.set(subtext, { opacity: 0 });
    subtext.classList.remove('anim-scale-spring');
  }

  // ── Find the boss node (index 0 = L0) ──
  const bossNode = nodeGroups[0];
  if (bossNode) {
    gsap.set(bossNode, { opacity: 0 });
  }

  // ── Build the main ScrollTrigger timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=120vh',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  // Phase 1: Connection lines pathDraw (0% → 20%)
  tl.to(
    connectionLines,
    {
      strokeDashoffset: 0,
      opacity: 0.3,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.out',
    },
    0,
  );

  // Phase 2: Node light-up sequence (10% → 70%)
  // Non-boss nodes light up first (indices 1+), boss last
  const nonBossNodes = Array.from(nodeGroups).slice(1);
  tl.to(
    nonBossNodes,
    {
      opacity: 1,
      duration: 0.5,
      stagger: 0.015,
      ease: 'power2.out',
    },
    0.1,
  );

  // Phase 3: Climax burst sequence (70% → 100%)

  // T+0: Glow expansion on SVG container
  tl.to(
    svg,
    {
      filter: 'drop-shadow(0 0 40px oklch(0.70 0.15 265 / 0.4))',
      duration: 0.08,
      ease: 'power3.out',
    },
    0.7,
  );

  // T+200ms equiv: Scale-up
  tl.to(
    svg,
    {
      scale: 1.03,
      duration: 0.05,
      ease: 'back.out(1.7)',
    },
    0.72,
  );
  tl.to(
    svg,
    {
      scale: 1,
      duration: 0.05,
      ease: 'power2.inOut',
    },
    0.77,
  );

  // T+400ms equiv: Boss node last appearance
  if (bossNode) {
    tl.to(
      bossNode,
      {
        opacity: 1,
        y: 0,
        duration: 0.06,
        ease: 'power3.out',
      },
      0.74,
    );
  }

  // T+800ms equiv: Bottom text pop
  if (bottomText) {
    tl.to(
      bottomText,
      {
        opacity: 1,
        y: 0,
        duration: 0.05,
        ease: 'power2.out',
      },
      0.8,
    );
  }
  if (headline) {
    tl.to(
      headline,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.06,
        ease: 'back.out(1.7)',
      },
      0.82,
    );
  }

  // T+1300ms equiv: Second line fade in
  if (subtext) {
    tl.to(
      subtext,
      {
        opacity: 1,
        duration: 0.08,
        ease: 'power2.out',
      },
      0.88,
    );
  }

  // Glow fade after climax
  tl.to(
    svg,
    {
      filter: 'drop-shadow(0 0 0px oklch(0.70 0.15 265 / 0))',
      duration: 0.1,
      ease: 'power2.out',
    },
    0.92,
  );

  return () => {
    tl.kill();
  };
}

// ─── Section 6: Vision scrub text fade-in ───────────────────────────────────
//
// Spec (experience-design-v4.md §3.4):
//   - scrub text fade-in: each paragraph opacity/translateY bound to scroll
//   - scrub: 0.5, each paragraph occupies ~15% of scroll range

function initS6ScrollTrigger(): () => void {
  const section = document.querySelector('.vision') as HTMLElement | null;
  if (!section) return () => {};

  const lines = section.querySelectorAll<HTMLElement>(
    '.vision__line, .vision__divider, .vision__climax',
  );
  if (lines.length === 0) return () => {};

  // Remove IO-driven anim classes — GSAP scrub will control these
  lines.forEach((el) => {
    el.classList.remove('anim-fade-up', 'anim-blur-reveal');
    el.removeAttribute('data-delay');
  });

  // Set all lines to hidden initially
  gsap.set(lines, { opacity: 0, y: 24 });

  // Special treatment for climax line
  const climax = section.querySelector('.vision__climax') as HTMLElement | null;
  if (climax) {
    gsap.set(climax, { opacity: 0, y: 32, filter: 'blur(8px)' });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 0.5,
    },
  });

  // Each line occupies ~15% of the timeline with slight overlap
  const segmentDuration = 0.15;
  const totalLines = lines.length;

  lines.forEach((line, i) => {
    const startAt = (i / totalLines) * (1 - segmentDuration);
    const isClimax = line.classList.contains('vision__climax');
    const isDivider = line.classList.contains('vision__divider');

    if (isClimax) {
      // Climax: blur reveal + larger movement
      tl.to(
        line,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: segmentDuration * 1.5,
          ease: 'power3.out',
        },
        startAt,
      );
    } else if (isDivider) {
      // Divider: just fade in
      tl.to(
        line,
        {
          opacity: 1,
          y: 0,
          duration: segmentDuration * 0.7,
          ease: 'power2.out',
        },
        startAt,
      );
    } else {
      // Normal line: fade-up
      tl.to(
        line,
        {
          opacity: 1,
          y: 0,
          duration: segmentDuration,
          ease: 'power2.out',
        },
        startAt,
      );
    }
  });

  return () => {
    tl.kill();
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialise all scroll-triggered animations:
 *  1. IO-based CSS class reveals (generic)
 *  2. GSAP ScrollTrigger scrub for Section 2 (Topology Reveal)
 *  3. GSAP ScrollTrigger scrub for Section 6 (Vision manifesto)
 *
 * Returns a cleanup function that tears down all observers and kills
 * ScrollTrigger instances.
 */
export function initScrollAnimations(): () => void {
  if (typeof window === 'undefined') return () => {};

  const reduced = prefersReducedMotion();

  // IO-based reveals always run (they handle reduced motion internally)
  const cleanupIO = initIOReveals();

  // GSAP ScrollTrigger only when motion is allowed
  let cleanupS2 = () => {};
  let cleanupS6 = () => {};

  if (!reduced) {
    cleanupS2 = initS2ScrollTrigger();
    cleanupS6 = initS6ScrollTrigger();
  } else {
    // Reduced motion: show everything immediately
    const s2Nodes = document.querySelectorAll<SVGGElement>('g[data-node-index]');
    s2Nodes.forEach((g) => {
      g.style.opacity = '1';
    });

    const s6Lines = document.querySelectorAll<HTMLElement>(
      '.vision__line, .vision__divider, .vision__climax',
    );
    s6Lines.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
  }

  return () => {
    cleanupIO();
    cleanupS2();
    cleanupS6();
  };
}
