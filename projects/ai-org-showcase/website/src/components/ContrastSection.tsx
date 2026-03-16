import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { fadeInUp, slideFromLeft, slideFromRight, staggerList } from '../data/animations';

/* Data for the two sides */
const scatteredSteps = [
  '"做个产品官网"',
  '打开 ChatGPT："帮我写个网站"',
  '复制一段看起来还行的代码',
  '不对……重新问一遍，加更多描述',
  '凑合能用了，没人审查，没人测试',
  '手动部署，忘记安全配置',
  '上线了。下次改什么都要从头来。',
];

const scatteredTags = [
  { icon: '❌', text: '没有记忆 — 每次对话都从零开始' },
  { icon: '❌', text: '没有标准 — 质量取决于你的 Prompt 水平' },
  { icon: '❌', text: '没有协作 — 一个模型扮演所有角色' },
  { icon: '❌', text: '没有进化 — 同样的错误可以犯无数次' },
];

const organizedSteps = [
  '"做个产品官网"',
  'Leader 接收需求，验证价值，定义目标',
  '项目管理专家设计执行拓扑，分解 6 个 Phase',
  '技术文档专家策划内容（结构化文案）',
  '体验设计专家设计交互（信息架构 + 响应式）',
  '视觉设计专家定义视觉语言（Token 化规范）',
  '前端开发专家实现（零依赖，工程级标准）',
  '代码审查专家审查（系统性质量关卡）',
  '部署运维专家容器化部署（安全 + 监控）',
  '上线。所有决策和过程都被记忆。下次更好。',
];

const organizedTags = [
  { icon: '✅', text: '分层记忆 — 价值观永久记忆，项目上下文按需加载，每次纠正立即写入' },
  { icon: '✅', text: '专业标准 — 每个专家有独立的 SOUL.md（信条）+ STANDARDS.md（规范）' },
  { icon: '✅', text: '多专家协作 — 28 个角色各司其职，串行依赖 + 并行执行' },
  { icon: '✅', text: '持续进化 — 同一模式出现 3 次自动提炼规则，同一错误不犯两次' },
];

/**
 * Section 4: Cognitive Gap — Side-by-side comparison
 */
export default function ContrastSection() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="contrast"
      className="relative py-24 max-md:py-12 px-6"
      style={{ background: '#080810' }}
      aria-label="认知落差对比"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Title */}
        <motion.h2
          className="text-[1.75rem] max-md:text-[1.375rem] font-semibold mb-12 max-md:mb-8 leading-tight"
          style={{ color: 'var(--color-text-bright)' }}
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          同一个需求，两种做法。
        </motion.h2>

        {/* Two columns */}
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-8">
          {/* Left: Scattered AI */}
          <motion.div
            className="rounded-lg p-6"
            style={{
              background: 'rgba(10,10,15,0.8)',
              border: '1px dashed rgba(58,58,85,0.3)',
              opacity: isInView ? 1 : 0,
            }}
            variants={slideFromLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <h3
              className="text-[1.25rem] font-medium mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              散装 AI 的世界
            </h3>

            <motion.div
              className="space-y-0"
              variants={staggerList}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {scatteredSteps.map((step, i) => (
                <motion.div
                  key={i}
                  className="py-2.5 pl-4 text-sm leading-relaxed"
                  style={{
                    color: '#999',
                    borderLeft: '1px dashed rgba(58,58,85,0.3)',
                  }}
                  variants={fadeInUp}
                >
                  {i > 0 && <span className="mr-2" style={{ color: 'var(--color-text-dim)' }}>↓</span>}
                  {step}
                </motion.div>
              ))}
            </motion.div>

            {/* Tags */}
            <div className="mt-6 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(58,58,85,0.2)' }}>
              {scatteredTags.map((tag, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 text-sm px-2 py-1 rounded"
                  style={{
                    color: 'var(--color-negative)',
                    background: 'var(--color-negative-bg)',
                  }}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: AI Organization */}
          <motion.div
            className="rounded-lg p-6"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid rgba(129,140,248,0.2)',
              boxShadow: '0 0 40px rgba(129,140,248,0.03)',
            }}
            variants={slideFromRight}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.4 }}
          >
            <h3
              className="text-[1.25rem] font-medium mb-6"
              style={{ color: 'var(--color-text-bright)' }}
            >
              AI 组织的世界
            </h3>

            <motion.div
              className="space-y-0"
              variants={staggerList}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              transition={{ delayChildren: 0.4 }}
            >
              {organizedSteps.map((step, i) => (
                <motion.div
                  key={i}
                  className="py-2.5 pl-4 text-sm leading-relaxed"
                  style={{
                    color: 'var(--color-text-primary)',
                    borderLeft: '2px solid var(--color-accent)',
                  }}
                  variants={fadeInUp}
                >
                  {i > 0 && <span className="mr-2" style={{ color: 'var(--color-accent)' }}>↓</span>}
                  {step}
                </motion.div>
              ))}
            </motion.div>

            {/* Tags */}
            <div className="mt-6 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(129,140,248,0.15)' }}>
              {organizedTags.map((tag, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 text-sm px-2 py-1 rounded"
                  style={{
                    color: 'var(--color-positive)',
                    background: 'var(--color-positive-bg)',
                  }}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
