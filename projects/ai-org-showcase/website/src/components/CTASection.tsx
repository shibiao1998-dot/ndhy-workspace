import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { fadeInUp, scaleIn } from '../data/animations';

/**
 * Section 7: CTA + Footer
 */
export default function CTASection() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative flex flex-col items-center justify-center px-6"
      style={{
        minHeight: '60vh',
        padding: '96px 24px',
        background: 'radial-gradient(ellipse 400px 300px at 50% 40%, rgba(129,140,248,0.04), transparent), #0a0a14',
      }}
      aria-label="行动号召"
    >
      <div className="max-w-[600px] mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <motion.h2
          className="text-[1.75rem] max-md:text-[1.375rem] font-semibold mb-3 leading-tight"
          style={{ color: 'var(--color-text-bright)' }}
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          想看看这个组织是怎么运转的？
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-base mb-8 max-w-[400px]"
          style={{ color: 'var(--color-text-muted)' }}
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.1 }}
        >
          所有源码、角色设定、技能代码，全部公开。
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex gap-4 max-md:flex-col max-md:w-full"
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.2 }}
        >
          {/* Primary CTA */}
          <a
            href="mailto:shibiao1998@gmail.com"
            className="inline-flex items-center justify-center px-8 py-3 rounded-md font-semibold text-base transition-colors duration-150 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: 'var(--color-accent)',
              color: '#0a0a14',
            }}
          >
            跟我们聊聊
          </a>

          {/* Secondary CTA */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 rounded-md font-medium text-base transition-colors duration-150"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
          >
            在 GitHub 上关注
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="mt-16 text-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={{ delay: 0.4 }}
      >
        <p
          className="text-sm tracking-widest uppercase mb-2"
          style={{ color: 'var(--color-text-dim)' }}
        >
          Built by NDHY AI Agent Team
        </p>
        <p className="text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>
          1 Human · 28 AI Experts · 43 Skills · 0 Lines of Human Code
        </p>
        <p
          className="text-xs italic mt-2"
          style={{ color: 'var(--color-accent)' }}
        >
          包括你正在看的这个网站。
        </p>
      </motion.footer>
    </section>
  );
}
