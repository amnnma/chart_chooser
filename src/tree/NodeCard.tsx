import { useRef } from "react";
import type { TreeNode } from "./types";
import { COLORS, DARK_TEXT, LIGHT_COLORS, paletteIndex } from "./palette";

type Props = {
  node: TreeNode;
  selected: boolean;
  active?: boolean;
  current?: boolean;
  dimmed?: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  locked?: boolean;
  styleMode?: "color" | "neutral";
  toCanvasPoint?: (clientX: number, clientY: number) => { x: number; y: number };
};

export default function NodeCard({
  node,
  selected,
  active = false,
  current = false,
  dimmed = false,
  onSelect,
  onDrag,
  locked = false,
  styleMode = "color",
  toCanvasPoint,
}: Props) {
  const idx = paletteIndex(node.colorIdx);
  const border = styleMode === "neutral" ? "rgba(15,23,42,0.22)" : COLORS[idx];
  const text = styleMode === "neutral" ? "rgba(15,23,42,0.88)" : DARK_TEXT[idx];
  const bg =
    node.variant === "start"
      ? "#ffffff"
      : styleMode === "neutral"
        ? "#ffffff"
        : node.kind === "outcome"
          ? LIGHT_COLORS[idx]
          : "#ffffff";

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    dragging.current = true;
    const pt = toCanvasPoint ? toCanvasPoint(e.clientX, e.clientY) : { x: e.clientX, y: e.clientY };
    offset.current = { x: pt.x - node.x, y: pt.y - node.y };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const pt = toCanvasPoint ? toCanvasPoint(e.clientX, e.clientY) : { x: e.clientX, y: e.clientY };
    onDrag(node.id, pt.x - offset.current.x, pt.y - offset.current.y);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%,-50%)",
        background: bg,
        border:
          node.variant === "start"
            ? "2px solid rgba(34,197,94,0.55)"
            : styleMode === "neutral"
              ? "1.5px solid rgba(15,23,42,0.16)"
              : `2px solid ${border}`,
        borderRadius: node.variant === "start" ? 999 : node.kind === "outcome" ? 999 : 14,
        padding: node.variant === "start" ? "12px 14px" : "12px 18px",
        minWidth: node.variant === "start" ? 92 : styleMode === "neutral" ? 210 : 190,
        maxWidth: 280,
        cursor: locked ? "default" : "grab",
        boxShadow:
          node.variant === "start"
            ? selected
              ? "0 0 0 3px rgba(34,197,94,0.18)"
              : "0 1px 0 rgba(0,0,0,.03)"
            : selected
              ? styleMode === "neutral"
                ? "0 0 0 3px rgba(15,23,42,0.08)"
                : `0 0 0 3px ${border}33`
              : active
                ? styleMode === "neutral"
                  ? "0 0 0 3px rgba(15,23,42,0.06)"
                  : `0 0 0 3px ${border}22`
                : "0 1px 0 rgba(0,0,0,.03)",
        transition: "box-shadow .12s",
        userSelect: "none",
        zIndex: selected ? 10 : 5,
        opacity: dimmed ? 0.28 : 1,
      }}
      className="select-none"
    >
      {current ? (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: node.variant === "start" ? 999 : node.kind === "outcome" ? 999 : 18,
            border: "2px solid rgba(250,204,21,0.85)",
            boxShadow: "0 0 0 6px rgba(250,204,21,0.15)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      {node.variant === "start" ? (
        <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(34,197,94,0.95)", textAlign: "center" }}>
          Start
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(34,197,94,0.95)" }}>here</div>
        </div>
      ) : (
        <>
          {styleMode === "neutral" ? null : (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: border,
                marginBottom: 2,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {node.kind === "outcome" ? "Outcome" : "Decision"}
            </div>
          )}
          <div
            style={{
              whiteSpace: "pre-line",
              fontSize: 14,
              color: text,
              fontWeight: styleMode === "neutral" ? 500 : node.kind === "outcome" ? 500 : 600,
              lineHeight: 1.4,
            }}
          >
            {node.label}
          </div>
          {node.kind === "decision" && styleMode !== "neutral" ? (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {node.yes ? (
                <span
                  style={{ fontSize: 10, background: `${border}1f`, color: border, borderRadius: 999, padding: "2px 8px" }}
                >
                  Yes
                </span>
              ) : null}
              {node.no ? (
                <span
                  style={{ fontSize: 10, background: `${border}1f`, color: border, borderRadius: 999, padding: "2px 8px" }}
                >
                  No
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
