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
        aria-label="AI 团队组织拓扑图：1 个人类老板、1 个 Leader、1 个项目管理、28 个领域专家"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* ─── Connection Lines ─── */}
        <g aria-hidden="true">
          {/* L0 → L1 */}
          <line
            x1={NODE_CONFIG.L0.cx}
            y1={NODE_CONFIG.L0.cy + NODE_CONFIG.L0.r}
            x2={NODE_CONFIG.L1.cx}
            y2={NODE_CONFIG.L1.cy - NODE_CONFIG.L1.r}
            stroke="var(--color-border-strong)"
            strokeWidth={1}
            opacity={0.3}
          />
          {/* L1 → L2 */}
          <line
            x1={NODE_CONFIG.L1.cx}
            y1={NODE_CONFIG.L1.cy + NODE_CONFIG.L1.r}
            x2={NODE_CONFIG.L2.cx}
            y2={NODE_CONFIG.L2.cy - NODE_CONFIG.L2.r}
            stroke="var(--color-border-strong)"
            strokeWidth={1}
            opacity={0.3}
          />
          {/* L2 → cluster centers */}
          {clusterCenters.map((center, i) => (
            <line
              key={`cluster-line-${i}`}
              x1={NODE_CONFIG.L2.cx}
              y1={NODE_CONFIG.L2.cy + NODE_CONFIG.L2.r}
              x2={center.cx}
              y2={center.cy}
              stroke="var(--color-border-strong)"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}
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
                {/* Circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={node.r}
                  fill={levelToFill(node.member.level)}
                  fillOpacity={node.fillOpacity}
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
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--fs-small)',
            color: 'var(--color-text-bright)',
            whiteSpace: 'nowrap' as const,
            zIndex: 'var(--z-tooltip)',
            transform: 'translateX(-50%)',
            lineHeight: 'var(--lh-small)',
            boxShadow: 'var(--shadow-md)',
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
        </div>
      )}
    </div>
  );
}
