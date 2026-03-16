import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { timelineSteps } from '../data/content';
import { fadeInUp, staggerContainer } from '../data/animations';

/**
 * Section 3: How It Works — Vertical timeline
 * 8 steps with expandable detail panels.
 */
export default function ProcessSection() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (step: number) => {
    setExpandedStep(prev => (prev === step ? null : step));
  };

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-24 max-md:py-12 px-6"
      style={{
        background: '#0c0c1c',
        borderTop: '1px solid rgba(129,140,248,0.1)',
      }}
      aria-label="运转揭秘"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Title */}
        <motion.div
          className="mb-12 max-md:mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h2
            className="text-[1.75rem] max-md:text-[1.375rem] font-semibold mb-3 leading-tight"
            style={{ color: 'var(--color-text-bright)' }}
          >
            你正在看的这个网站，是这样被做出来的。
          </h2>
          <p className="text-sm tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            真实过程，0 行人类代码
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <motion.div
          className="relative"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          role="list"
          aria-label="制作流程时间线"
        >
          {/* Vertical line */}
          <div
            className="absolute left-[19px] max-md:left-[15px] top-0 bottom-0 w-[2px]"
            style={{ background: 'var(--color-border)' }}
          />

          {timelineSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              className="relative pl-14 max-md:pl-10 pb-8 last:pb-0"
              variants={fadeInUp}
              role="listitem"
              custom={idx}
            >
              {/* Dot */}
              <div
                className="absolute left-[13px] max-md:left-[9px] top-1 w-3 h-3 rounded-full border-2 transition-all duration-300"
                style={{
                  background: isInView ? 'var(--color-accent)' : 'var(--color-border)',
                  borderColor: isInView ? 'var(--color-accent)' : 'var(--color-border)',
                  boxShadow: isInView ? '0 0 8px rgba(129,140,248,0.25)' : 'none',
                  transitionDelay: `${idx * 100}ms`,
                }}
              />

              {/* Step header — clickable */}
              <button
                className="w-full text-left cursor-pointer group"
                onClick={() => toggleStep(step.step)}
                aria-expanded={expandedStep === step.step}
                aria-controls={`step-detail-${step.step}`}
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-lg">{step.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                    {step.role}
                  </span>
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{
                      color: 'var(--color-text-dim)',
                      transform: expandedStep === step.step ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▶
                  </span>
                </div>
                <p
                  className="text-base leading-relaxed group-hover:brightness-125 transition-all"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.action}
                </p>
              </button>

              {/* Expandable detail panel */}
              <AnimatePresence>
                {expandedStep === step.step && (
                  <motion.div
                    id={`step-detail-${step.step}`}
                    className="mt-3 rounded-r-lg overflow-hidden"
                    style={{
                      background: 'var(--color-bg-surface)',
                      borderLeft: '2px solid var(--color-accent)',
                    }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="p-4">
                      {step.detail.split('\n').map((line, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed mb-1 last:mb-0"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
