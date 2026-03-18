import type { BranchKind, TreeState } from "./types";
import { COLORS, paletteIndex } from "./palette";

type Props = {
  nodes: TreeState;
  styleMode?: "color" | "neutral";
  activeEdges?: Set<string>;
  dimInactive?: boolean;
};

function pathBetween(sx: number, sy: number, tx: number, ty: number) {
  const midY = (sy + ty) / 2;
  return `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`;
}

export default function Arrows({ nodes, styleMode = "color", activeEdges, dimInactive = false }: Props) {
  const entries = Object.values(nodes);
  const lines: React.ReactNode[] = [];

  const pushEdge = (fromId: string, toId: string, branch: BranchKind) => {
    const from = nodes[fromId];
    const to = nodes[toId];
    if (!from || !to) return;

    const isStartEdge = from.variant === "start";
    const idx = paletteIndex(to.colorIdx);
    const baseColor = styleMode === "neutral" ? "rgba(15,23,42,0.28)" : COLORS[idx];
    const color = isStartEdge ? "rgba(34,197,94,0.55)" : baseColor;
    const labelColor =
      styleMode === "neutral" ? "rgba(15,23,42,0.58)" : isStartEdge ? "rgba(34,197,94,0.9)" : baseColor;
    const sx = from.x;
    const sy = from.y;
    const tx = to.x;
    const ty = to.y;
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const edgeKey = `${fromId}->${toId}`;
    const isActive = activeEdges ? activeEdges.has(edgeKey) : false;
    const inactiveOpacity = dimInactive ? 0.18 : styleMode === "neutral" ? 1 : 0.85;

    lines.push(
      <g key={`${fromId}-${toId}-${branch}`}>
        <path
          d={pathBetween(sx, sy, tx, ty)}
          fill="none"
          stroke={color}
          strokeWidth={isActive ? 3 : styleMode === "neutral" ? 1.5 : 2.25}
          strokeDasharray={isStartEdge ? undefined : branch === "yes" ? undefined : "6 3"}
          opacity={isActive ? 1 : inactiveOpacity}
          markerEnd={isStartEdge ? "url(#start-ah)" : `url(#ah-${idx})`}
        />
        {isStartEdge ? null : (
          <text
            x={midX}
            y={midY - 8}
            textAnchor="middle"
            fontSize={10}
            fill={labelColor}
            fontWeight={700}
            opacity={isActive ? 1 : dimInactive ? 0.25 : 1}
          >
            {branch === "yes" ? "Yes" : "No"}
          </text>
        )}
      </g>,
    );
  };

  for (const n of entries) {
    if (n.kind !== "decision") continue;
    if (n.yes) pushEdge(n.id, n.yes, "yes");
    if (n.no) pushEdge(n.id, n.no, "no");
  }

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <marker
          id="start-ah"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="rgba(34,197,94,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
        {COLORS.map((c, i) => (
          <marker
            key={i}
            id={`ah-${i}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke={styleMode === "neutral" ? "rgba(15,23,42,0.22)" : c}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        ))}
      </defs>
      {lines}
    </svg>
  );
}
