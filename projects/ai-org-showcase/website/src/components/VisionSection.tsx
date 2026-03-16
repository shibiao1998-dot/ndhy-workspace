import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { fadeIn } from '../data/animations';

/* Manifesto paragraphs with mood metadata */
const paragraphs: { text: string; type: 'normal' | 'pause' | 'climax' | 'final' }[] = [
  { text: 'AI 不缺能力。', type: 'normal' },
  { text: 'GPT-4 能写代码。Claude 能做分析。\nGemini 能搜索。Midjourney 能设计。', type: 'normal' },
  { text: '但它们是散兵。\n散兵赢不了战争。', type: 'pause' },
  { text: 'divider', type: 'normal' },
  { text: '2026 年，AI 行业的真正问题不是\n"模型够不够强"，\n而是\n"怎么把强大的模型组织成可靠的生产力"。', type: 'normal' },
  { text: '答案不是更好的 Prompt。\n答案不是更大的上下文窗口。\n答案是——组织。', type: 'climax' },
  { text: '给 AI 角色。给 AI 标准。给 AI 记忆。\n给 AI 纪律。给 AI 协作方式。给 AI 进化机制。', type: 'normal' },
  { text: '像管理人类团队一样管理 AI 团队。\n然后你会发现：\n一个人 + AI 组织 ≈ 一个完整的产品公司。', type: 'normal' },
  { text: 'divider', type: 'normal' },
  { text: '这不是未来。\n从 2026 年 3 月 10 日开始，这就是我们每天的日常。', type: 'final' },
];

/**
 * Section 6: Bigger Picture — Manifesto / Vision text
 */
export default function VisionSection() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative py-24 max-md:py-12 px-6"
      style={{ background: '#080810' }}
      aria-label="更大的图景"
    >
      <div className="max-w-[640px] mx-auto">
        {paragraphs.map((para, i) => {
          if (para.text === 'divider') {
            return <Divider key={i} index={i} sectionInView={isInView} />;
          }
          return (
            <ParagraphBlock
              key={i}
              text={para.text}
              type={para.type}
              index={i}
              sectionInView={isInView}
            />
          );
        })}
      </div>
    </section>
  );
}

function ParagraphBlock({
  text,
  type,
  index,
  sectionInView,
}: {
  text: string;
  type: string;
  index: number;
  sectionInView: boolean;
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const show = sectionInView && isInView;

  // Spacing based on mood
  const marginTop = type === 'pause' ? '32px' : type === 'climax' ? '48px' : '24px';
  const marginBottom = type === 'climax' ? '48px' : '24px';

  // Style for climax and final
  const isClimax = type === 'climax';
  const isFinal = type === 'final';

  return (
    <motion.div
      ref={ref}
      style={{ marginTop: index === 0 ? 0 : marginTop, marginBottom }}
      variants={fadeIn}
      initial="hidden"
      animate={show ? 'visible' : 'hidden'}
      transition={{ delay: 0.1 }}
    >
      {text.split('\n').map((line, j) => {
        // Check if this line is the "答案是——组织" highlight
        const isAnswer = line.includes('答案是——组织');
        return (
          <p
            key={j}
            className="leading-relaxed"
            style={{
              fontSize: isClimax
                ? 'calc(1.25rem * 1.15)'
                : isFinal ? '1.25rem' : '1.25rem',
              lineHeight: 1.8,
              color: isAnswer
                ? 'var(--color-accent)'
                : isFinal
                  ? 'var(--color-text-bright)'
                  : 'var(--color-text-primary)',
              fontWeight: isAnswer || isFinal ? 600 : 400,
              textShadow: isAnswer ? '0 0 30px rgba(129,140,248,0.2)' : 'none',
            }}
          >
            {line}
          </p>
        );
      })}
    </motion.div>
  );
}

function Divider({ sectionInView }: { index: number; sectionInView: boolean }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const show = sectionInView && isInView;

  return (
    <div ref={ref} className="flex justify-start" style={{ margin: '48px 0' }}>
      <motion.div
        style={{
          height: '1px',
          background: 'var(--color-accent)',
          opacity: 0.5,
        }}
        initial={{ width: 0 }}
        animate={show ? { width: 'min(120px, 30vw)' } : { width: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
