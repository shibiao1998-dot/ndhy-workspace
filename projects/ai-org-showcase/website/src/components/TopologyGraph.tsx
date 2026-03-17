import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import type { TeamMember } from '../data/team-members';

interface Props {
  members: TeamMember[];
}

/* ─── Layout Constants ─── */
const NODE_CONFIG = {
  L0: { cx: 400, cy: 60, r: 28, fontSize: 22 },
  L1: { cx: 400, cy: 160, r: 24, fontSize: 18 },
  L2: { cx: 400, cy: 260, r: 20, fontSize: 16 },
} as const;

const EXPERT_AREA = {
  xMin: 60,
  xMax: 740,
  yMin: 340,
  yMax: 560,
  cols: 10,
  rows: 3,
} as const;

/** Compute L3 node positions as a grid layout. */
function computeExpertPositions(count: number) {
  const { xMin, xMax, yMin, yMax, cols, rows } = EXPERT_AREA;
  const positions: { cx: number; cy: number }[] = [];

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const itemsInRow = Math.min(cols, count - row * cols);
    const rowWidth = xMax - xMin;
    const xStep = itemsInRow > 1 ? rowWidth / (itemsInRow - 1) : 0;
    const xOffset = itemsInRow > 1 ? 0 : rowWidth / 2;
    const yStep = rows > 1 ? (yMax - yMin) / (rows - 1) : 0;

    positions.push({
      cx: xMin + xOffset + col * xStep,
      cy: yMin + row * yStep,
    });
  }

  return positions;
}

/** Compute cluster center positions for connection lines from L2 to L3 groups. */
function computeClusterCenters(
  experts: TeamMember[],
  positions: { cx: number; cy: number }[],
) {
  const domainMap = new Map<string, { sumX: number; sumY: number; count: number }>();

  experts.forEach((member, i) => {
    const pos = positions[i];
    if (!pos) return;
    const entry = domainMap.get(member.domain);
    if (entry) {
      entry.sumX += pos.cx;
      entry.sumY += pos.cy;
      entry.count++;
    } else {
      domainMap.set(member.domain, { sumX: pos.cx, sumY: pos.cy, count: 1 });
    }
  });

  const centers: { cx: number; cy: number }[] = [];
  domainMap.forEach(({ sumX, sumY, count }) => {
    centers.push({ cx: sumX / count, cy: sumY / count });
  });
  return centers;
}

/** Map rank number (0-12) to badge tier token name */
function rankToTier(rank: number): 'junior' | 'mid' | 'senior' | 'master' {
  if (rank <= 3) return 'junior';
  if (rank <= 6) return 'mid';
  if (rank <= 9) return 'senior';
  return 'master';
}

/** Map tier to CSS variable colors */
function tierToColors(tier: string): { fg: string; bg: string; glow?: string } {
  switch (tier) {
    case 'junior': return { fg: 'var(--color-rank-junior)', bg: 'var(--color-rank-junior-bg)' };
    case 'mid': return { fg: 'var(--color-rank-mid)', bg: 'var(--color-rank-mid-bg)' };
    case 'senior': return { fg: 'var(--color-rank-senior)', bg: 'var(--color-rank-senior-bg)' };
    case 'master': return { fg: 'var(--color-rank-master)', bg: 'var(--color-rank-master-bg)', glow: 'var(--color-rank-master-glow)' };
    default: return { fg: 'var(--color-text-muted)', bg: 'var(--color-bg-elevated)' };
  }
}

/** Map member level to CSS variable fill color */
function levelToFill(level: string): string {
  switch (level) {
    case 'L0': return 'var(--color-boss)';
    case 'L1': return 'var(--color-accent)';
    case 'L2': return 'var(--color-info)';
    default:   return 'var(--color-accent)';
  }
}

/** Map member level to label color CSS variable */
function levelToLabelColor(level: string): string {
  switch (level) {
    case 'L3': return 'var(--color-text-dim)';
    default:   return 'var(--color-text)';
  }
}

export default function TopologyGraph({ members }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /* ─── Separate members by level ─── */
  const boss = members.filter((m) => m.level === 'L0');
  const leader = members.filter((m) => m.level === 'L1');
  const pm = members.filter((m) => m.level === 'L2');
  const experts = members.filter((m) => m.level === 'L3');
  const expertPositions = computeExpertPositions(experts.length);
  const clusterCenters = computeClusterCenters(experts, expertPositions);

  /* ─── Build a flat node list for consistent indexing ─── */
  type NodeEntry = {
    member: TeamMember;
    cx: number;
    cy: number;
    r: number;
    fillOpacity: number;
    fontSize: number;
  };

  const nodes: NodeEntry[] = [];

  boss.forEach((m) =>
    nodes.push({ member: m, ...NODE_CONFIG.L0, fillOpacity: 1 }),
  );
  leader.forEach((m) =>
    nodes.push({ member: m, ...NODE_CONFIG.L1, fillOpacity: 1 }),
  );
  pm.forEach((m) =>
    nodes.push({ member: m, ...NODE_CONFIG.L2, fillOpacity: 1 }),
  );
  experts.forEach((m, i) => {
    const pos = expertPositions[i];
    nodes.push({
      member: m,
      cx: pos.cx,
      cy: pos.cy,
      r: 14,
      fillOpacity: 0.7,
      fontSize: 12,
    });
  });

  /* ─── Event handlers ─── */
  const handleHover = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGGElement>, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setHoveredIndex((prev) => (prev === index ? null : index));
      }
    },
    [],
  );

  const handleBlur = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  /* ─── Escape key to dismiss tooltip ─── */
  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setHoveredIndex(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  /* ─── Tooltip position calculation ─── */
  const tooltipNode = hoveredIndex !== null ? nodes[hoveredIndex] : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI 团队组织拓扑图：1 个人类老板、1 个 Leader、1 个项目管理、30 个领域专家"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* ─── SVG Defs for Glow Filters ─── */}
        <defs>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="halo-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-boss)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-boss)" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="halo-cyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ─── Connection Lines ─── */}
        <g aria-hidden="true">
          {/* Decorative layer separator lines */}
          <line x1={60} y1={310} x2={740} y2={310} stroke="var(--color-cyan, oklch(0.78 0.15 195))" strokeWidth={0.5} opacity={0.06} strokeDasharray="4 8" />

          {/* L0 → L1 (gold flowing line) */}
          <line
            x1={NODE_CONFIG.L0.cx}
            y1={NODE_CONFIG.L0.cy + NODE_CONFIG.L0.r}
            x2={NODE_CONFIG.L1.cx}
            y2={NODE_CONFIG.L1.cy - NODE_CONFIG.L1.r}
            stroke="var(--color-boss)"
            strokeWidth={1.5}
            opacity={0.35}
            strokeDasharray="6 4"
          >
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="3s" repeatCount="indefinite" />
          </line>
          {/* L1 → L2 (cyan flowing line) */}
          <line
            x1={NODE_CONFIG.L1.cx}
            y1={NODE_CONFIG.L1.cy + NODE_CONFIG.L1.r}
            x2={NODE_CONFIG.L2.cx}
            y2={NODE_CONFIG.L2.cy - NODE_CONFIG.L2.r}
            stroke="var(--color-accent)"
            strokeWidth={1}
            opacity={0.25}
            strokeDasharray="6 4"
          >
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="3s" repeatCount="indefinite" />
          </line>
          {/* L2 → cluster centers (flowing lines) */}
          {clusterCenters.map((center, i) => (
            <line
              key={`cluster-line-${i}`}
              x1={NODE_CONFIG.L2.cx}
              y1={NODE_CONFIG.L2.cy + NODE_CONFIG.L2.r}
              x2={center.cx}
              y2={center.cy}
              stroke="var(--color-indigo, var(--color-info))"
              strokeWidth={1}
              opacity={0.18}
              strokeDasharray="6 4"
            >
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="3s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>

        {/* ─── Halos for Boss & Leader ─── */}
        <g aria-hidden="true">
          <circle cx={NODE_CONFIG.L0.cx} cy={NODE_CONFIG.L0.cy} r={56} fill="url(#halo-gold)" />
          <circle cx={NODE_CONFIG.L1.cx} cy={NODE_CONFIG.L1.cy} r={42} fill="url(#halo-cyan)" />
        </g>

        {/* ─── Nodes ─── */}
        {nodes.map((node, index) => {
          const isHovered = hoveredIndex === index;
          const isDimmed = hoveredIndex !== null && !isHovered;
          const nodeOpacity = isDimmed ? 0.4 : 1;
          const scale = isHovered ? 1.15 : 1;

          return (
            <g
              key={index}
              data-node-index={index}
              tabIndex={0}
              role="button"
              aria-label={`${node.member.name}：${node.member.description}`}
              style={{
                cursor: 'pointer',
                outline: 'none',
                // Initial opacity 0.3 — visible but dim; scroll animation reveals to 1
                opacity: 0.3,
              }}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => handleHover(null)}
              onFocus={() => handleHover(index)}
              onBlur={handleBlur}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <g
                style={{
                  transform: `translate(${node.cx}px, ${node.cy}px) scale(${scale})`,
                  transformOrigin: '0 0',
                  transition: `transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast) ease`,
                  opacity: nodeOpacity,
                }}
              >
                {/* Pulse ring (animated) */}
                <circle
                  cx={0}
                  cy={0}
                  r={node.r}
                  fill={levelToFill(node.member.level)}
                  opacity={0}
                >
                  <animate attributeName="r" values={`${node.r};${node.r + 14}`} dur={`${2.5 + (index % 7) * 0.3}s`} begin={`${index * 0.13}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0" dur={`${2.5 + (index % 7) * 0.3}s`} begin={`${index * 0.13}s`} repeatCount="indefinite" />
                </circle>
                {/* Main circle with glow + breathing animation */}
                <circle
                  cx={0}
                  cy={0}
                  r={node.r}
                  fill={levelToFill(node.member.level)}
                  fillOpacity={node.fillOpacity}
                  filter={node.member.level === 'L0' ? 'url(#glow-gold)' : node.member.level === 'L1' ? 'url(#glow-cyan)' : 'url(#glow-sm)'}
                  opacity={0.88}
                  style={{
                    animation: node.member.level === 'L0'
                      ? 'bossHalo 3s ease-in-out infinite'
                      : node.member.level === 'L1'
                        ? 'leaderHalo 2.5s ease-in-out infinite'
                        : `nodeBreathing ${2.5 + (index % 5) * 0.4}s ease-in-out infinite`,
                    animationDelay: `${index * 0.15}s`,
                  }}
                />
                {/* Emoji */}
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={node.fontSize}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.member.emoji}
                </text>
                {/* Name label */}
                <text
                  x={0}
                  y={node.r + 14}
                  textAnchor="middle"
                  fill={levelToLabelColor(node.member.level)}
                  fontSize={node.member.level === 'L3' ? 10 : 12}
                  fontWeight={node.member.level === 'L3' ? 400 : 500}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.member.name}
                </text>
                {/* Rank Badge Pill */}
                {(() => {
                  const tier = rankToTier(node.member.rank);
                  const colors = tierToColors(tier);
                  const badgeText = `P${node.member.rank}`;
                  const badgeX = node.r + 4;
                  const badgeY = -(node.r - 4);
                  const pillWidth = badgeText.length > 2 ? 24 : 20;
                  const pillHeight = 14;

                  return (
                    <g style={{ pointerEvents: 'none' }}>
                      <rect
                        x={badgeX}
                        y={badgeY - pillHeight / 2}
                        width={pillWidth}
                        height={pillHeight}
                        rx={pillHeight / 2}
                        fill={colors.bg}
                        stroke={colors.fg}
                        strokeWidth={0.5}
                        strokeOpacity={0.15}
                      />
                      <text
                        x={badgeX + pillWidth / 2}
                        y={badgeY + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={colors.fg}
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                        fontWeight={600}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {badgeText}
                      </text>
                    </g>
                  );
                })()}
              </g>
            </g>
          );
        })}
      </svg>

      {/* ─── Tooltip (HTML overlay) ─── */}
      {tooltipNode && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            background: 'var(--color-glass-bg, rgba(10, 10, 28, 0.88))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--color-glass-border-hover, rgba(0, 200, 255, 0.35))',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            fontSize: 'var(--fs-small)',
            color: 'var(--color-text-bright)',
            whiteSpace: 'nowrap' as const,
            zIndex: 'var(--z-tooltip)',
            transform: 'translateX(-50%)',
            lineHeight: 'var(--lh-small)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 200, 255, 0.3)',
            minWidth: '200px',
            left: `${(tooltipNode.cx / 800) * 100}%`,
            top: `${((tooltipNode.cy - tooltipNode.r - 16) / 600) * 100}%`,
          }}
          role="tooltip"
        >
          <span style={{ marginRight: 'var(--space-1)' }}>{tooltipNode.member.emoji}</span>
          <strong>{tooltipNode.member.name}</strong>
          <br />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-xs)' }}>
            {tooltipNode.member.description}
          </span>
          <br />
          <span style={{
            display: 'inline-block',
            marginTop: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 600,
            color: tierToColors(rankToTier(tooltipNode.member.rank)).fg,
            background: tierToColors(rankToTier(tooltipNode.member.rank)).bg,
          }}>
            P{tooltipNode.member.rank}
          </span>
        </div>
      )}
    </div>
  );
}
