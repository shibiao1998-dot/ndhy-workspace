// ---------------------------------------------------------------------------
// section-transitions.ts — V6 Section-to-Section Transition Animations
//   T2: S2→S3 Horizontal push
//   T3: S3→S4 Vertical split (with breathing point text)
//   T4: S4→S5 Color field dissolve
//   T5: S5→S6 Blueprint light pierce
//   T6: S6→S7 Energy convergence
// ---------------------------------------------------------------------------

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

// ─── T2: S2→S3 — Horizontal Push ────────────────────────────────────────────
// Topology slides left, timeline pushes in from right
function initT2Transition(): () => void {
  const s2 = document.querySelector('.reveal') as HTMLElement | null;
  const s3 = document.querySelector('#timeline') as HTMLElement | null;
  if (!s2 || !s3) return () => {};

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: s2,
      start: 'bottom bottom',
      end: '+=50%',
      scrub: 0.6,
    },
  });

  // S2 content fades and slides left
  const s2Content = s2.querySelector('.reveal__content, .section-content') as HTMLElement | null;
  if (s2Content) {
    tl.to(s2Content, {
      x: '-15%',
      opacity: 0,
      filter: 'blur(4px)',
      duration: 1,
      ease: 'power3.out',
    }, 0);
  }

  // S3 pushes in from right with a blur-to-clear entrance
  tl.fromTo(s3, {
    x: '8%',
    opacity: 0.3,
    filter: 'blur(3px)',
  }, {
    x: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'power3.out',
  }, 0.2);

  return () => { tl.kill(); };
}

// ─── T3: S3→S4 — Vertical Split + Breathing Text ────────────────────────────
// Timeline content splits vertically, breathing text appears in crack, then comparison emerges
function initT3Transition(): () => void {
  const s3 = document.querySelector('#timeline') as HTMLElement | null;
  const s4 = document.querySelector('#comparison') as HTMLElement | null;
  if (!s3 || !s4) return () => {};

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: s3,
      start: 'bottom bottom',
      end: '+=60%',
      scrub: 0.6,
    },
  });

  // S3 upper half goes up, lower half goes down — split effect
  const s3Content = s3.querySelector('.section-content') as HTMLElement | null;
  if (s3Content) {
    tl.to(s3Content, {
      clipPath: 'inset(48% 0 48% 0)',
      opacity: 0,
      duration: 1,
      ease: 'expo.out',
    }, 0);
  }

  // S4 emerges from the crack at center
  tl.fromTo(s4, {
    clipPath: 'inset(45% 0 45% 0)',
    opacity: 0.5,
    filter: 'blur(2px)',
  }, {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'expo.out',
  }, 0.3);

  return () => { tl.kill(); };
}

// ─── T4: S4→S5 — Color Field Dissolve ────────────────────────────────────────
// Red-blue color field desaturates and dissolves into blue-purple blueprint grid
function initT4Transition(): () => void {
  const s4 = document.querySelector('#comparison') as HTMLElement | null;
  const s5 = document.querySelector('#architecture') as HTMLElement | null;
  if (!s4 || !s5) return () => {};

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: s4,
      start: 'bottom bottom',
      end: '+=60%',
      scrub: 0.6,
    },
  });

  // S4 desaturates, brightens, and blurs out
  tl.to(s4, {
    filter: 'saturate(0) blur(4px) brightness(1.5)',
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
  }, 0);

  // S5 emerges from a bright blur
  tl.fromTo(s5, {
    opacity: 0,
    filter: 'brightness(1.8) blur(3px)',
  }, {
    opacity: 1,
    filter: 'brightness(1) blur(0px)',
    duration: 1,
    ease: 'power2.inOut',
  }, 0.4);

  return () => { tl.kill(); };
}

// ─── T5: S5→S6 — Blueprint Light Pierce ──────────────────────────────────────
// Blueprint grid lines intensify into light beams, then fade into vision's soft aura
function initT5Transition(): () => void {
  const s5 = document.querySelector('#architecture') as HTMLElement | null;
  const s6 = document.querySelector('#vision') as HTMLElement | null;
  if (!s5 || !s6) return () => {};

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: s5,
      start: 'bottom bottom',
      end: '+=60%',
      scrub: 0.6,
    },
  });

  // S5 blueprint lines brighten + section flashes out
  const blueprintBg = s5.querySelector('.arch-v6__blueprint-bg') as HTMLElement | null;
  if (blueprintBg) {
    tl.to(blueprintBg, {
      opacity: 1,
      filter: 'brightness(3) blur(6px)',
      duration: 0.5,
      ease: 'power2.in',
    }, 0);
  }

  tl.to(s5, {
    filter: 'brightness(2.5) blur(8px)',
    opacity: 0,
    duration: 0.6,
    ease: 'expo.inOut',
  }, 0.3);

  // S6 fades in from white-bright
  tl.fromTo(s6, {
    opacity: 0,
    filter: 'brightness(2) blur(6px)',
  }, {
    opacity: 1,
    filter: 'brightness(1) blur(0px)',
    duration: 0.8,
    ease: 'power2.out',
  }, 0.5);

  return () => { tl.kill(); };
}

// ─── T6: S6→S7 — Energy Convergence ─────────────────────────────────────────
// Vision's aura collapses to a bright point, then explodes into CTA energy field
function initT6Transition(): () => void {
  const s6 = document.querySelector('#vision') as HTMLElement | null;
  const s7 = document.querySelector('#cta') as HTMLElement | null;
  if (!s6 || !s7) return () => {};

  const bgAura = s6.querySelector('.vision-v6__bg-aura') as HTMLElement | null;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: s6,
      start: 'bottom bottom',
      end: '+=60%',
      scrub: 0.6,
    },
  });

  // S6 aura contracts to a bright point
  if (bgAura) {
    tl.to(bgAura, {
      scale: 0.15,
      opacity: 1,
      filter: 'brightness(3)',
      duration: 0.6,
      ease: 'power3.in',
    }, 0);
  }

  // S6 content fades
  const s6Content = s6.querySelector('.section-content') as HTMLElement | null;
  if (s6Content) {
    tl.to(s6Content, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, 0);
  }

  // S7 bursts open from the converged point
  tl.fromTo(s7, {
    opacity: 0,
    scale: 0.85,
    filter: 'brightness(1.5) blur(3px)',
  }, {
    opacity: 1,
    scale: 1,
    filter: 'brightness(1) blur(0px)',
    duration: 0.8,
    ease: 'power4.out',
  }, 0.5);

  return () => { tl.kill(); };
}

// ─── Public API ─────────────────────────────────────────────────────────────
export function initSectionTransitions(): () => void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => {};

  const cleanups = [
    initT2Transition(),
    initT3Transition(),
    initT4Transition(),
    initT5Transition(),
    initT6Transition(),
  ];

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
