import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { fadeInUp, staggerContainer } from '../data/animations';

/* Cross-section data */
const crossSections = [
  {
    id: 'power',
    title: '权力结构',
    subtitle: '不是所有 AI 都平等',
    layers: [
      { level: 'L0', role: '老板', desc: '做不做' },
      { level: 'L1', role: 'Leader', desc: '做成什么样' },
      { level: 'L2', role: '项目管理专家', desc: '怎么拆、谁先做' },
      { level: 'L3', role: '各领域专家', desc: '自己领域内怎么做最好' },
    ],
    footer: '不是 AI 替代人类决策。\n是人类授权 AI 在专业范围内自主决策。',
  },
  {
    id: 'memory',
    title: '记忆体系',
    subtitle: 'AI 组织为什么越用越强',
    layers: [
      { level: '🔥 HOT', role: '价值观、经验法则', desc: '永远记住', color: '#f87171' },
      { level: '🟡 WARM', role: '今天发生了什么', desc: '每日归档', color: '#fbbf24' },
      { level: '📁 PROJ', role: '这个项目的上下文', desc: '项目生命周期', color: '#818cf8' },
      { level: '🆘 应急', role: '上下文溢出备份', desc: '按需调用', color: '#fb923c' },
    ],
    footer: '每一次纠正 → 最高优先级信号 → 立即记录 → 永不重犯',
  },
  {
    id: 'evolution',
    title: '持续进化',
    subtitle: '为什么这个组织越用越强',
    items: [
      { name: '纠正即学习', desc: '人类纠正一次 → 立即写入记忆 → 同一错误不再出现' },
      { name: '模式识别', desc: '同一模式出现 3 次 → 自动提炼为规则 → 全组织生效' },
      { name: '经验沉淀', desc: '每个项目的决策、教训、最佳实践 → 归档为组织知识\n下一个项目自动继承，不从零开始' },
    ],
    footer: '不靠"下次注意"。\n靠写入记忆文件的硬规则驱动行为改变。',
  },
];

/**
 * Section 5: Deep Architecture — 3 expandable cross-section diagrams
 */
export default function ArchitectureSection() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="architecture"
      className="relative py-24 max-md:py-12 px-6"
      style={{ background: '#0a0a14' }}
      aria-label="深层架构"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Intro */}
        <motion.div
          className="mb-12 max-md:mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <p className="text-[1.25rem] leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            三张剖面图。
          </p>
          <p className="text-[1.25rem] leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            切开这个 AI 组织，看看它为什么能运转。
          </p>
        </motion.div>

        {/* Cross sections */}
        <motion.div
          className="space-y-16 max-md:space-y-12"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {crossSections.map((section) => (
            <CrossSectionCard key={section.id} section={section} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CrossSectionCard({ section }: { section: typeof crossSections[number] }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="rounded-lg p-6"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: '3px solid var(--color-accent)',
      }}
      variants={fadeInUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Header */}
      <h3
        className="text-[1.25rem] font-semibold mb-1"
        style={{ color: 'var(--color-text-bright)' }}
      >
        {section.title}
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {section.subtitle}
      </p>

      {/* Content */}
      {'layers' in section && section.layers && (
        <div className="space-y-0 font-mono text-sm">
          {section.layers.map((layer, i) => (
            <motion.div
              key={i}
              className="flex items-baseline gap-4 py-2"
              style={{ borderBottom: i < section.layers.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            >
              <span
                className="shrink-0 w-20 text-right"
                style={{ color: 'color' in layer && layer.color ? layer.color : 'var(--color-accent)' }}
              >
                {layer.level}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>━━</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{layer.role}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>━━</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{layer.desc}</span>
            </motion.div>
          ))}
        </div>
      )}

      {'items' in section && section.items && (
        <div className="space-y-4">
          {section.items.map((item, i) => (
            <motion.div
              key={i}
              className="pl-4"
              style={{ borderLeft: '2px solid var(--color-accent)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            >
              <p className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-bright)' }}>
                {item.name}
              </p>
              {item.desc.split('\n').map((line, j) => (
                <p key={j} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer */}
      <motion.div
        className="mt-6 pt-4"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {section.footer.split('\n').map((line, i) => (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {line}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
}
