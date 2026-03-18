import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Arrows from "./Arrows";
import NodeCard from "./NodeCard";
import { PRESETS } from "./presets";
import type { BranchKind, TreeNode, TreeState } from "./types";

const ROOT_ID = "root";

function canvasSize(nodes: TreeState) {
  const values = Object.values(nodes);
  if (!values.length) return { w: 1200, h: 900 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of values) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  }

  const pad = 280;
  return {
    w: Math.max(1100, maxX - minX + pad * 2),
    h: Math.max(780, maxY - minY + pad * 2),
  };
}

function translateToPositive(nodes: TreeState) {
  const values = Object.values(nodes);
  if (!values.length) return nodes;
  let minX = Infinity;
  let minY = Infinity;
  for (const n of values) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
  }
  const pad = 220;
  const shiftX = minX < pad ? pad - minX : 0;
  const shiftY = minY < pad ? pad - minY : 0;
  if (shiftX === 0 && shiftY === 0) return nodes;

  const next: TreeState = {};
  for (const [id, n] of Object.entries(nodes)) {
    next[id] = { ...n, x: n.x + shiftX, y: n.y + shiftY };
  }
  return next;
}


function clampZoom(z: number) {
  return Math.min(1.75, Math.max(0.75, z));
}

export default function TreeEditor() {
  const preset = PRESETS[0];
  const styleMode = preset.style;
  const locked = preset.locked;
  const [nodes, setNodes] = useState<TreeState>(() => translateToPositive(preset.nodes));
  const [selectedId, setSelectedId] = useState<string | null>(ROOT_ID);

  const [quizMode, setQuizMode] = useState(false);
  const [quizId, setQuizId] = useState<string>(ROOT_ID);
  const [quizTrail, setQuizTrail] = useState<string[]>([ROOT_ID]);
  const [quizAnswers, setQuizAnswers] = useState<BranchKind[]>([]);

  const [zoom, setZoom] = useState(1.25);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const size = useMemo(() => canvasSize(nodes), [nodes]);
  const editLocked = locked || quizMode;

  const resetZoom = useCallback(() => setZoom(1.25), []);

  const toCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const scroller = scrollRef.current;
      if (!scroller) return { x: clientX, y: clientY };
      const rect = scroller.getBoundingClientRect();
      const x = (clientX - rect.left + scroller.scrollLeft) / zoom;
      const y = (clientY - rect.top + scroller.scrollTop) / zoom;
      return { x, y };
    },
    [zoom],
  );

  const focusNode = useCallback(
    (id: string) => {
      const scroller = scrollRef.current;
      const n = nodes[id];
      if (!scroller || !n) return;
      const rect = scroller.getBoundingClientRect();
      scroller.scrollTo({
        left: Math.max(0, n.x * zoom - rect.width / 2),
        top: Math.max(0, n.y * zoom - rect.height / 2),
        behavior: "smooth",
      });
    },
    [nodes, zoom],
  );

  const fitToView = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const pad = 44;
    const zx = (rect.width - pad * 2) / size.w;
    const zy = (rect.height - pad * 2) / size.h;
    const nextZoom = clampZoom(Math.min(zx, zy, 1.35));
    setZoom(nextZoom);
    scroller.scrollTo({
      left: Math.max(0, (size.w * nextZoom - rect.width) / 2),
      top: Math.max(0, (size.h * nextZoom - rect.height) / 2),
      behavior: "smooth",
    });
  }, [size.h, size.w]);

  const activeEdges = useMemo(() => {
    if (!quizMode) return undefined;
    const set = new Set<string>();
    for (let i = 0; i < quizTrail.length - 1; i++) set.add(`${quizTrail[i]}->${quizTrail[i + 1]}`);
    return set;
  }, [quizMode, quizTrail]);

  const activeNodes = useMemo(() => {
    if (!quizMode) return undefined;
    return new Set<string>(quizTrail);
  }, [quizMode, quizTrail]);

  const updateNode = useCallback((id: string, patch: Partial<TreeNode>) => {
    setNodes((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  }, []);

  const startQuiz = useCallback(() => {
    setQuizMode(true);
    setQuizId(ROOT_ID);
    setQuizTrail([ROOT_ID]);
    setQuizAnswers([]);
    setSelectedId(ROOT_ID);
    queueMicrotask(() => focusNode(ROOT_ID));
  }, [focusNode]);

  const stopQuiz = useCallback(() => setQuizMode(false), []);

  const answerQuiz = useCallback(
    (branch: BranchKind) => {
      const cur = nodes[quizId];
      if (!cur || cur.kind !== "decision") return;
      const nextId = branch === "yes" ? cur.yes : cur.no;
      if (!nextId) return;
      setQuizId(nextId);
      setQuizTrail((prev) => [...prev, nextId]);
      setQuizAnswers((prev) => [...prev, branch]);
      setSelectedId(nextId);
      queueMicrotask(() => focusNode(nextId));
    },
    [focusNode, nodes, quizId],
  );

  const backQuiz = useCallback(() => {
    setQuizTrail((trail) => {
      if (trail.length <= 1) return trail;
      const next = trail.slice(0, -1);
      const prevId = next[next.length - 1];
      setQuizId(prevId);
      setSelectedId(prevId);
      queueMicrotask(() => focusNode(prevId));
      return next;
    });
    setQuizAnswers((a) => (a.length ? a.slice(0, -1) : a));
  }, [focusNode]);

  const nodeCount = Object.keys(nodes).length;
  const quizNode = nodes[quizId] ?? null;
  const canYes = quizNode?.kind === "decision" && Boolean(quizNode.yes);
  const canNo = quizNode?.kind === "decision" && Boolean(quizNode.no);
  const isOutcome = quizNode?.kind === "outcome";

  useEffect(() => {
    if (!quizMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "y" || e.key === "Y") answerQuiz("yes");
      if (e.key === "n" || e.key === "N") answerQuiz("no");
      if (e.key === "Backspace") backQuiz();
      if (e.key === "Escape") stopQuiz();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answerQuiz, backQuiz, quizMode, stopQuiz]);

  return (
    <div className="flex h-full w-full flex-col">
      <header className="border-b border-black/10 bg-white px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Decision Tree</div>
            <div className="truncate text-xs text-slate-500">
              Click a node · Drag to move · Solid=Yes · Dashed=No
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="text-xs text-slate-500">{nodeCount} nodes</div>

            <button
              onClick={quizMode ? stopQuiz : startQuiz}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            {quizMode ? "Exit quiz" : "Quiz"}
          </button>

          <div className="hidden items-center gap-1 rounded-lg border border-black/10 bg-white px-1 py-1 shadow-sm sm:flex">
            <button
              onClick={() => setZoom((z) => clampZoom(Math.round((z - 0.1) * 100) / 100))}
              className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              className="min-w-[64px] rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => clampZoom(Math.round((z + 0.1) * 100) / 100))}
              className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => focusNode(selectedId ?? ROOT_ID)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title="Focus selected"
            >
              Focus
            </button>
            <button
              onClick={fitToView}
              className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title="Fit to view"
            >
              Fit
            </button>
          </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 bg-slate-50">
          <div ref={scrollRef} onClick={() => setSelectedId(null)} className="h-full w-full overflow-auto">
            <div className="relative" style={{ width: size.w * zoom, height: size.h * zoom }}>
              <div
                className="absolute left-0 top-0"
                style={{ width: size.w, height: size.h, transform: `scale(${zoom})`, transformOrigin: "0 0" }}
              >
                <div className="absolute inset-0 bg-white" />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(rgba(15,23,42,0.09) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                    opacity: styleMode === "neutral" ? 0.22 : 1,
                  }}
                />
                <Arrows nodes={nodes} styleMode={styleMode} activeEdges={activeEdges} dimInactive={quizMode} />
                {Object.values(nodes).map((n) => (
                  <NodeCard
                    key={n.id}
                    node={n}
                    selected={selectedId === n.id}
                    active={Boolean(activeNodes?.has(n.id))}
                    current={quizMode && quizId === n.id}
                    dimmed={quizMode && !activeNodes?.has(n.id)}
                    onSelect={(id) => setSelectedId(id)}
                    onDrag={(id, x, y) => updateNode(id, { x, y })}
                    locked={false}
                    styleMode={styleMode}
                    toCanvasPoint={toCanvasPoint}
                  />
                ))}
              </div>

              {quizMode && quizNode ? (
                <QuizOverlay
                  node={quizNode}
                  trailNodes={quizTrail.map((id) => nodes[id]).filter(Boolean)}
                  trail={quizTrail}
                  answers={quizAnswers}
                  onYes={() => answerQuiz("yes")}
                  onNo={() => answerQuiz("no")}
                  onBack={backQuiz}
                  onRestart={startQuiz}
                  canYes={Boolean(canYes)}
                  canNo={Boolean(canNo)}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="fixed bottom-3 left-3 z-20 sm:hidden">
          <div className="flex items-center gap-1 rounded-2xl border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur">
            <button
              onClick={() => setZoom((z) => clampZoom(Math.round((z - 0.15) * 100) / 100))}
              className="rounded-xl px-3 py-2 text-base font-bold text-slate-800 hover:bg-slate-50"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => clampZoom(Math.round((z + 0.15) * 100) / 100))}
              className="rounded-xl px-3 py-2 text-base font-bold text-slate-800 hover:bg-slate-50"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={fitToView}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Fit to view"
            >
              Fit
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function QuizOverlay(props: {
  node: TreeNode;
  trailNodes: TreeNode[];
  trail: string[];
  answers: BranchKind[];
  canYes: boolean;
  canNo: boolean;
  onYes: () => void;
  onNo: () => void;
  onBack: () => void;
  onRestart: () => void;
}) {
  const isOutcome = props.node.kind === "outcome";

  return (
    <div className="fixed left-3 right-3 top-3 z-30 max-w-[620px] rounded-2xl border border-amber-200 bg-amber-100/95 p-4 shadow-lg backdrop-blur md:left-4 md:right-auto md:top-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Quiz</div>
          <div className="mt-1 text-lg font-bold text-slate-900" style={{ whiteSpace: "pre-line" }}>
            {isOutcome ? `Outcome: ${props.node.label}` : props.node.label}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={props.onBack}
            disabled={props.answers.length === 0}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={props.onRestart}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-100"
          >
            Restart
          </button>
        </div>
      </div>

      {props.answers.length ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-white/70 p-3 text-xs text-slate-700">
          <div className="space-y-1">
            {props.answers.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="rounded-md bg-slate-900/5 px-2 py-0.5 font-mono text-[11px] text-slate-800">IF</span>
                <span className="truncate text-slate-700">{props.trailNodes[i]?.label ?? props.trail[i]}</span>
                <span className="text-slate-500">==</span>
                <span
                  className={[
                    "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    a === "yes" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
                  ].join(" ")}
                >
                  {a.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        {isOutcome ? (
          <div className="text-sm font-semibold text-slate-700">Reached an outcome.</div>
        ) : (
          <>
            <button
              disabled={!props.canYes}
              onClick={props.onYes}
              className="flex-1 rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-3 text-base font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Yes
            </button>
            <button
              disabled={!props.canNo}
              onClick={props.onNo}
              className="flex-1 rounded-xl border border-rose-200 bg-rose-600 px-3 py-3 text-base font-bold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              No
            </button>
          </>
        )}
      </div>
    </div>
  );
}
