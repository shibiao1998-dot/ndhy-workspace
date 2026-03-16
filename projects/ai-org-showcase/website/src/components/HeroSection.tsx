import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useInView';

/**
 * Section 1: Hero / Hook
 * Cinematic typewriter opening with scroll lock until animation completes.
 */
export default function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState(0); // 0=waiting, 1=date, 2=line1, 3=line2, 4=emphasis, 5=arrow, 6=done
  const [typedText, setTypedText] = useState('');
  const [isLocked, setIsLocked] = useState(true);

  const line1 = '一个人启动了一个项目。';
  const typeSpeed = prefersReduced ? 0 : 40;

  // Skip animation handler
  const skipAnimation = useCallback(() => {
    setPhase(6);
    setTypedText(line1);
    setIsLocked(false);
    document.body.style.overflow = '';
  }, []);

  // Scroll lock
  useEffect(() => {
    if (isLocked && !prefersReduced) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLocked, prefersReduced]);

  // Skip on reduced motion
  useEffect(() => {
    if (prefersReduced) {
      skipAnimation();
    }
  }, [prefersReduced, skipAnimation]);

  // Animation sequence
  useEffect(() => {
    if (prefersReduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: Date fades in at 0.5s
    timers.push(setTimeout(() => setPhase(1), 500));

    // Phase 2: Typewriter starts at 1.5s
    timers.push(setTimeout(() => setPhase(2), 1500));

    // Phase 3: "6 天后..." at 3.0s
    timers.push(setTimeout(() => setPhase(3), 3000));

    // Phase 4: Emphasis at 4.5s
    timers.push(setTimeout(() => setPhase(4), 4500));

    // Phase 5: Arrow at 5.5s
    timers.push(setTimeout(() => {
      setPhase(5);
      setIsLocked(false);
      document.body.style.overflow = '';
    }, 5500));

    // Phase 6: fully done at 6.5s
    timers.push(setTimeout(() => setPhase(6), 6500));

    return () => timers.forEach(clearTimeout);
  }, [prefersReduced]);

  // Typewriter effect for line1
  useEffect(() => {
    if (phase < 2) return;
    if (phase >= 6) { setTypedText(line1); return; }

    let i = 0;
    const chars = Array.from(line1);
    const interval = setInterval(() => {
      if (i < chars.length) {
        setTypedText(chars.slice(0, i + 1).join(''));
        i++;
      } else {
        clearInterval(interval);
      }
    }, typeSpeed);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase >= 2]);

  // Keyboard / click skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowDown') skipAnimation();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [skipAnimation]);

  return (
    <section
      id="hook"
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: 'radial-gradient(ellipse 800px 600px at 50% 60%, rgba(129,140,248,0.02), transparent), #080810',
      }}
      aria-label="悬念开场"
      onClick={() => phase < 5 && skipAnimation()}
    >
      <div className="max-w-[800px] w-full flex flex-col items-center" style={{ paddingTop: '5vh' }}>
        {/* Date line */}
        <motion.p
          className="font-mono text-sm tracking-widest mb-5"
          style={{ color: 'var(--color-accent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          2026 年 3 月 10 日
        </motion.p>

        {/* Line 1: typewriter */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              className="text-[2.5rem] max-md:text-[1.75rem] leading-tight font-semibold mb-5 min-h-[3rem]"
              style={{ color: 'var(--color-text-bright)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {typedText}
              {phase < 6 && typedText.length < line1.length && (
                <span className="inline-block w-[2px] h-[1.2em] ml-1 align-middle animate-pulse" style={{ background: 'var(--color-accent)' }} />
              )}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Line 2: "6 天后..." */}
        <motion.div
          className="mb-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[2.5rem] max-md:text-[1.75rem] leading-tight font-semibold" style={{ color: 'var(--color-text-bright)' }}>
            6 天后，
          </p>
          <motion.p
            className="text-[2.5rem] max-md:text-[1.75rem] leading-tight font-semibold mt-2"
            style={{ color: 'var(--color-text-bright)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            他拥有了一个 28 人的产品团队。
          </motion.p>
        </motion.div>

        {/* Emphasis line */}
        <motion.p
          className="text-[calc(2.5rem*1.05)] max-md:text-[calc(1.75rem*1.05)] leading-tight font-bold mb-8"
          style={{
            color: '#fff',
            textShadow: '0 0 40px rgba(129,140,248,0.15)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 4 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          他没有招过一个人。
        </motion.p>

        {/* Scroll arrow */}
        <motion.div
          className="text-3xl cursor-pointer select-none"
          style={{ color: 'var(--color-accent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 5 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          aria-label="向下滚动"
          role="button"
          tabIndex={0}
          onClick={skipAnimation}
          onKeyDown={(e) => e.key === 'Enter' && skipAnimation()}
        >
          <motion.span
            className="inline-block"
            animate={phase >= 5 ? { y: [0, -6, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
