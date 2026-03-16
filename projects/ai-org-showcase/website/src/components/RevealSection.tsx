import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView, useReducedMotion } from '../hooks/useInView';
import { topoNodes, domainOrder, type TopoNode } from '../data/content';
import { fadeInUp } from '../data/animations';

/* Center of the ring system in SVG coords */
const CX = 450;
const CY = 480;

/**
 * Section 2: The Reveal — Organization Topology Graph
 * 28 AI nodes in concentric rings, lighting up sequentially.
 */
export default function RevealSection() {
  const prefersReduced = useReducedMotion();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.15 });
  const [litNodes, setLitNodes] = useState<Set<string>>(new Set());
  const [linesVisible, setLinesVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const hasAnimated = useRef(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ node: TopoNode; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build connection lines data
  const r2Nodes = topoNodes.filter(n => n.ring === 2);
  const r3Nodes = topoNodes.filter(n => n.ring === 3);

  // Compute spoke lines: each R3 connects to nearest R2
  const spokeLines = r3Nodes.map(r3 => {
    let bestR2 = r2Nodes[0];
    let bestDist = Infinity;
    for (const r2 of r2Nodes) {
      const d = Math.hypot(r3.x - r2.x, r3.y - r2.y);
      if (d < bestDist) { bestDist = d; bestR2 = r2; }
    }
    return { x1: bestR2.x, y1: bestR2.y, x2: r3.x, y2: r3.y };
  });

  // Leader → R2 lines
  const leaderToR2 = r2Nodes.map(r2 => ({
    x1: CX, y1: CY, x2: r2.x, y2: r2.y,
  }));

  // Sequential light-up animation
  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReduced) {
      setLitNodes(new Set(topoNodes.map(n => n.id)));
      setLinesVisible(true);
      setTextVisible(true);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;

    // Sort by order
    const sorted = [...topoNodes].sort((a, b) => a.order - b.order);
    const leader = sorted.find(n => n.ring === 1)!;
    const boss = sorted.find(n => n.ring === 0)!;
    const ring2 = sorted.filter(n => n.ring === 2);
    const ring3 = sorted.filter(n => n.ring === 3);

    // Group R3 by domain
    const r3Groups: TopoNode[][] = [];
    for (const domain of domainOrder) {
      const group = ring3.filter(n => n.domain === domain);
      if (group.length) r3Groups.push(group);
    }

    // Phase 1: Leader (0ms)
    timers.push(setTimeout(() => setLitNodes(prev => new Set(prev).add(leader.id)), t));
    t += 500;

    // Phase 2: R2 nodes
    ring2.forEach((n, i) => {
      timers.push(setTimeout(() => setLitNodes(prev => new Set(prev).add(n.id)), t + i * 70));
    });
    t += ring2.length * 70 + 300;

    // Phase 3: R3 by domain
    r3Groups.forEach(group => {
      group.forEach((n, i) => {
        timers.push(setTimeout(() => setLitNodes(prev => new Set(prev).add(n.id)), t + i * 70));
      });
      t += group.length * 70 + 150;
    });

    // Phase 4: Lines
    const lineDelay = t + 200;
    timers.push(setTimeout(() => setLinesVisible(true), lineDelay));

    // Phase 5: Boss
    timers.push(setTimeout(() => setLitNodes(prev => new Set(prev).add(boss.id)), lineDelay + 600));

    // Phase 6: Text
    timers.push(setTimeout(() => setTextVisible(true), lineDelay + 1400));

    return () => timers.forEach(clearTimeout);
  }, [isInView, prefersReduced]);

  // Tooltip handlers
  const handleNodeHover = useCallback((node: TopoNode, _e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = svgRect.width / 900;
    const scaleY = svgRect.height / 920;
    setTooltip({
      node,
      x: svgRect.left + node.x * scaleX,
      y: svgRect.top + node.y * scaleY - node.r * scaleY - 12,
    });
  }, []);

  const handleNodeTap = useCallback((node: TopoNode) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = svgRect.width / 900;
    const scaleY = svgRect.height / 920;
    setTooltip(prev =>
      prev?.node.id === node.id
        ? null
        : {
            node,
            x: svgRect.left + node.x * scaleX,
            y: svgRect.top + node.y * scaleY - node.r * scaleY - 12,
          }
    );
  }, []);

  const closeTooltip = useCallback(() => setTooltip(null), []);

  return (
    <section
      ref={sectionRef}
      id="reveal"
      className="relative py-24 max-md:py-12 px-5"
      style={{
        background: 'radial-gradient(ellipse 500px 500px at 50% 55%, rgba(129,140,248,0.06), transparent), #0a0a14',
      }}
      aria-label="组织揭幕"
      onClick={closeTooltip}
    >
      <div className="max-w-[900px] mx-auto flex flex-col items-center">
        <svg
          ref={svgRef}
          className="w-full h-auto"
          viewBox="0 0 900 920"
          role="img"
          aria-label="NDHY AI 组织拓扑图：1 个人类 + 28 个 AI 专家的同心环组织网络"
        >
          <defs>
            <filter id="glow-md" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-lg" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-gold" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="ambient" cx="50%" cy="52%" r="35%">
              <stop offset="0%" stopColor="rgba(129,140,248,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Ambient glow */}
          <rect x="0" y="0" width="900" height="920" fill="url(#ambient)" />

          {/* Decorative ring guides */}
          <circle cx={CX} cy={CY} r={130} fill="none" stroke="rgba(129,140,248,0.04)" strokeWidth={1} strokeDasharray="4 8" />
          <circle cx={CX} cy={CY} r={295} fill="none" stroke="rgba(129,140,248,0.03)" strokeWidth={1} strokeDasharray="4 8" />

          {/* Connection lines */}
          <g
            style={{
              opacity: linesVisible ? 1 : 0,
              transition: 'opacity 1.2s ease-out',
            }}
          >
            {/* Boss → Leader */}
            <line x1={450} y1={120} x2={450} y2={440} stroke="rgba(251,191,36,0.25)" strokeWidth={2} strokeDasharray="6 4" />
            {/* Leader → R2 */}
            {leaderToR2.map((l, i) => (
              <line key={`lr2-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(129,140,248,0.2)" strokeWidth={1.5} />
            ))}
            {/* R2 → R3 spokes */}
            {spokeLines.map((l, i) => (
              <line key={`spoke-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(129,140,248,0.12)" strokeWidth={1} />
            ))}
          </g>

          {/* Nodes */}
          {topoNodes.map(node => {
            const isLit = litNodes.has(node.id);
            const isBoss = node.ring === 0;
            const isLeader = node.ring === 1;

            const circleFill = isLit
              ? isBoss ? '#fbbf24' : '#818cf8'
              : 'rgba(20,20,40,0.8)';
            const circleStroke = isLit
              ? isBoss ? '#fbbf24' : '#818cf8'
              : isBoss ? 'rgba(251,191,36,0.2)' : 'rgba(129,140,248,0.1)';
            const labelFill = isLit
              ? isBoss ? 'rgba(251,191,36,0.9)' : 'rgba(232,232,232,0.85)'
              : isBoss ? 'rgba(251,191,36,0.15)' : 'rgba(232,232,232,0.12)';

            const filterAttr = isLit
              ? isBoss ? 'url(#glow-gold)' : isLeader ? 'url(#glow-lg)' : 'url(#glow-md)'
              : 'none';

            // Short label for desktop
            const shortName = node.name.replace('专家', '').replace('（人类）', '');

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{
                  cursor: 'pointer',
                  filter: filterAttr,
                  transition: 'filter 0.4s ease-out',
                  ...(isLeader && isLit ? { animation: 'pulse-glow 3s ease-in-out infinite' } : {}),
                }}
                onMouseEnter={(e) => handleNodeHover(node, e)}
                onMouseLeave={closeTooltip}
                onClick={(e) => { e.stopPropagation(); handleNodeTap(node); }}
                role="button"
                tabIndex={0}
                aria-label={`${node.emoji} ${node.name} — ${node.desc}`}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNodeTap(node); }}
              >
                <circle
                  r={node.r}
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={isBoss || isLeader ? 2 : 1}
                  style={{ transition: 'fill 0.4s ease-out, stroke 0.4s ease-out' }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isBoss ? 26 : isLeader ? 24 : node.ring === 2 ? 20 : 18}
                  fill="#fff"
                >
                  {node.emoji}
                </text>
                {/* Desktop label */}
                <text
                  textAnchor="middle"
                  y={node.r + 16}
                  fontSize={isLit ? 12 : 11}
                  fill={labelFill}
                  fontFamily="var(--font-sans)"
                  className="max-[600px]:hidden"
                  style={{ transition: 'fill 0.4s ease-out' }}
                >
                  {shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom text */}
        <motion.div
          className="text-center max-w-[600px] mt-12"
          variants={fadeInUp}
          initial="hidden"
          animate={textVisible ? 'visible' : 'hidden'}
        >
          <p className="text-2xl max-md:text-xl font-semibold mb-3 leading-snug" style={{ color: 'var(--color-text-bright)' }}>
            一个人类。28 个 AI 专家。一个完整的产品组织。
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            不是工具。不是框架。不是 Prompt 模板。
            <br />
            是一支有灵魂、有纪律、有记忆、会进化的 AI 组织。
          </p>
        </motion.div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3.5 py-2 rounded-lg text-sm pointer-events-none max-w-[300px] whitespace-nowrap"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            left: `${Math.max(8, Math.min(tooltip.x - 80, window.innerWidth - 260))}px`,
            top: `${Math.max(8, tooltip.y - 40)}px`,
            color: 'var(--color-text-primary)',
          }}
        >
          <span className="mr-1">{tooltip.node.emoji}</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-bright)' }}>{tooltip.node.name}</span>
          <span className="ml-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>— {tooltip.node.desc}</span>
        </div>
      )}
    </section>
  );
}
