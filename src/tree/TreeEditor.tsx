import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Arrows from "./Arrows";
import NodeCard from "./NodeCard";
import Home from "./Home";
import DataTypeGuide from "./DataTypeGuide";
import ResultPage from "./ResultPage";
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

function defaultZoomForPreset(id: (typeof PRESETS)[number]["id"]) {
  return id === "bar_chart" ? 1.25 : 1.2;
}

function chartTypeFromOutcome(node: TreeNode): string {
  const hay = `${node.id} ${node.label}`.toLowerCase();
  // Prefer precise matches over broad keywords (e.g., "stacked area" contains "area")
  if (hay.includes("100%") && hay.includes("stacked") && hay.includes("area")) return "stacked_area_100";
  if (hay.includes("100%") && hay.includes("stacked") && (hay.includes("bar") || hay.includes("bars"))) return "stacked_bar_100";
  if (hay.includes("stacked") && hay.includes("area")) return "stacked_area";
  if (hay.includes("stacked") && (hay.includes("bar") || hay.includes("bars"))) return "stacked_bar";

  if (hay.includes("step")) return "step";
  if (hay.includes("thin bar") || hay.includes("thin-bar") || hay.includes("thin_bar")) return "thin_bar";
  if (hay.includes("clustered")) return "clustered_bar";
  if (hay.includes("merged")) return "merged_bar";
  if (hay.includes("waterfall")) return "waterfall";
  if (hay.includes("treemap")) return "treemap";

  if (hay.includes("choropleth")) return "choropleth";
  if (hay.includes("tile map") || hay.includes("tile-map") || hay.includes("tile_map")) return "tile_map";
  if (hay.includes("lines on a map") || (hay.includes("map") && hay.includes("lines"))) return "map_lines";
  if (hay.includes("colored dots") || (hay.includes("dots") && hay.includes("map"))) return "map_dots";
  if (hay.includes("bubbles") && hay.includes("map")) return "map_bubbles";
  if (hay.includes("bars on a map") || (hay.includes("bars") && hay.includes("map"))) return "map_bars";

  if (hay.includes("pie charts") || hay.includes("small multiples")) return "pie_sm";
  if (hay.includes("pie")) return "pie";
  if (hay.includes("dot")) return "dot";
  if (hay.includes("scatter")) return "scatter";
  if (hay.includes("bump") || hay.includes("bumps")) return "bumps";
  if (hay.includes("line")) return "line";
  if (hay.includes("area")) return "area";
  if (hay.includes("bar")) return "bar";

  return "bar";
}

export default function TreeEditor() {
  const [viewMode, setViewMode] = useState<"home" | "data-type-guide" | "tree">("home");
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>(() => PRESETS[0].id);
  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId]);
  const styleMode = preset.style;
  const locked = preset.locked;
  const [nodes, setNodes] = useState<TreeState>(() => translateToPositive(preset.nodes));
  const [selectedId, setSelectedId] = useState<string | null>(ROOT_ID);

  const [quizMode, setQuizMode] = useState(false);
  const [quizId, setQuizId] = useState<string>(ROOT_ID);
  const [quizTrail, setQuizTrail] = useState<string[]>([ROOT_ID]);
  const [quizAnswers, setQuizAnswers] = useState<BranchKind[]>([]);

  const [showResult, setShowResult] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<string | null>(null);

  const [zoom, setZoom] = useState(() => defaultZoomForPreset(PRESETS[0].id));
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const size = useMemo(() => canvasSize(nodes), [nodes]);
  const editLocked = locked || quizMode;

  const resetZoom = useCallback(() => setZoom(defaultZoomForPreset(presetId)), [presetId]);

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

  const loadPreset = useCallback(
    (nextId: (typeof PRESETS)[number]["id"]) => {
      const nextPreset = PRESETS.find((p) => p.id === nextId) ?? PRESETS[0];
      const nextZoom = defaultZoomForPreset(nextPreset.id);
      const root = nextPreset.nodes[ROOT_ID];
      setViewMode("tree");
      setPresetId(nextPreset.id);
      setNodes(translateToPositive(nextPreset.nodes));
      setSelectedId(ROOT_ID);
      setQuizMode(false);
      setQuizId(ROOT_ID);
      setQuizTrail([ROOT_ID]);
      setQuizAnswers([]);
      setZoom(nextZoom);

      requestAnimationFrame(() => {
        const scroller = scrollRef.current;
        if (!scroller || !root) return;
        const rect = scroller.getBoundingClientRect();
        scroller.scrollTo({
          left: Math.max(0, root.x * nextZoom - rect.width / 2),
          top: Math.max(0, root.y * nextZoom - rect.height / 2),
          behavior: "smooth",
        });
      });
    },
    [],
  );

  const startBeginnerGuide = useCallback(() => {
    setViewMode("data-type-guide");
  }, []);

  const handleResultClose = useCallback(() => {
    setShowResult(false);
    setSelectedChartType(null);
    setQuizMode(false);
    setQuizId(ROOT_ID);
    setQuizTrail([ROOT_ID]);
    setQuizAnswers([]);
    setViewMode("home");
  }, []);

  const handleEditConditions = useCallback(
    (editId: string) => {
      // ค่อนข้างเปลี่ยนกลับ quiz mode แล้วให้ไปยัง node ที่ต้องแก้
      setShowResult(false);
      setSelectedChartType(null);
      setQuizMode(true);
      // ก้าวกลับไปยัง node ก่อนหน้า
      const currentIndex = quizTrail.indexOf(editId);
      if (currentIndex > 0) {
        const prevId = quizTrail[currentIndex - 1];
        setQuizId(prevId);
        setQuizTrail((trail) => trail.slice(0, currentIndex));
        setQuizAnswers((ans) => ans.slice(0, currentIndex - 1));
        setSelectedId(prevId);
        queueMicrotask(() => focusNode(prevId));
      }
    },
    [quizTrail, focusNode],
  );

  const handleTryAnother = useCallback(() => {
    setShowResult(false);
    setSelectedChartType(null);
    setViewMode("data-type-guide");
  }, []);

  const startPresetQuiz = useCallback(
    (id: string) => {
      loadPreset(id as (typeof PRESETS)[number]["id"]);
      requestAnimationFrame(() => {
        setQuizMode(true);
        setQuizId(ROOT_ID);
        setQuizTrail([ROOT_ID]);
        setQuizAnswers([]);
        setSelectedId(ROOT_ID);
      });
    },
    [loadPreset],
  );

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
      const nextNode = nodes[nextId];
      if (!nextNode) return;

      setQuizId(nextId);
      setQuizTrail((prev) => [...prev, nextId]);
      setQuizAnswers((prev) => [...prev, branch]);
      setSelectedId(nextId);

      // ถ้า outcome ให้ open ResultPage
      if (nextNode.kind === "outcome") {
        setSelectedChartType(chartTypeFromOutcome(nextNode));
        setShowResult(true);
        return;
      }

      queueMicrotask(() => focusNode(nextId));
    },
    [focusNode, nodes, quizId, presetId],
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
  const outcomeChartType =
    quizNode && quizNode.kind === "outcome" ? (selectedChartType ?? chartTypeFromOutcome(quizNode)) : null;

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

  const selectedNode = selectedId ? nodes[selectedId] : null;
  const isRootNode = selectedId === ROOT_ID;

  return (
    <>
      {viewMode === "home" ? (
        <Home
          presets={PRESETS}
          onSelectPreset={loadPreset as (id: string) => void}
          onStartPresetQuiz={startPresetQuiz}
          onStartBeginnerGuide={startBeginnerGuide}
        />
      ) : viewMode === "data-type-guide" ? (
        <div className="min-h-screen">
          <div className="p-4 bg-white border-b border-slate-200">
            <button
              onClick={() => setViewMode("home")}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              ← กลับ
            </button>
          </div>
          <DataTypeGuide onSelectDataType={startPresetQuiz} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col">
          <header className="border-b border-black/10 bg-white px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("home")}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    title="กลับไปหน้า Home"
                  >
                    ← Home
                  </button>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {quizMode ? "🎯 Quiz Mode: ตอบคำถาม" : "✏️ Edit Mode: จัดการ Tree"}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {quizMode
                        ? "ตอบคำถาม: Y = ใช่, N = ไม่, Backspace = ย้อน, Esc = ปิด"
                        : "คลิกเลือก node • Drag ย้าย • ดูรายละเอียดจากด้านขวา"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="text-xs text-slate-500">{nodeCount} nodes</div>

                <select
                  value={presetId}
                  onChange={(e) => loadPreset(e.target.value as any)}
                  className="rounded-lg border border-black/10 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50"
                  title="Preset"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={quizMode ? stopQuiz : startQuiz}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  title={quizMode ? "ปิด Quiz Mode" : "เริ่ม Quiz Mode"}
                >
                  {quizMode ? "ปิด Quiz" : "เริ่ม Quiz"}
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
                quizNode.kind === "outcome" ? (
                  <ResultPage
                    chartType={outcomeChartType || "bar"}
                    quizTrail={quizTrail}
                    nodes={nodes}
                    onEditConditions={handleEditConditions}
                    onTryAnother={handleTryAnother}
                    onClose={handleResultClose}
                  />
                ) : (
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
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* Node Info Panel */}
        {!quizMode && selectedNode && (
          <div className="hidden md:flex md:w-72 border-l border-black/10 bg-white flex-col">
            <div className="p-4 border-b border-black/10">
              <h3 className="font-semibold text-slate-900 mb-2">📋 รายละเอียด Node</h3>
              <div className="text-xs text-slate-500 mb-4">
                {isRootNode ? "🏁 Starting Node" : selectedNode.kind === "decision" ? "❓ Decision Node" : "✓ Outcome Node"}
              </div>
              {selectedNode.kind === "decision" ? (
                <div className="inline-block px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 mb-4">
                  {selectedNode.yes && selectedNode.no
                    ? "มี Yes และ No branch"
                    : selectedNode.yes
                      ? "มี Yes branch เท่านั้น"
                      : selectedNode.no
                        ? "มี No branch เท่านั้น"
                        : "ยังไม่มี branch"}
                </div>
              ) : null}
            </div>

            <div className="flex-1 p-4 overflow-y-auto text-sm text-slate-600">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Label</p>
                  <p className="text-slate-800 font-medium break-words">{selectedNode.label}</p>
                </div>

                {!isRootNode && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-2">💡 เคล็ด</p>
                    <p className="text-xs text-blue-800">
                      ดึง node นี้ไปที่ใดก็ได้บนผืนแสดงเพื่อปรับแต่งตำแหน่ง
                    </p>
                  </div>
                )}

                {selectedNode.kind === "decision" && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs font-semibold text-amber-900 mb-2">🔗 เชื่อมต่อ</p>
                    <div className="text-xs text-amber-800 space-y-1">
                      {selectedNode.yes ? (
                        <p>✓ <strong>Yes</strong> → เชื่อมต่อไปยัง node อื่น</p>
                      ) : (
                        <p>○ <strong>Yes</strong> branch ยังไม่ได้ตั้ง</p>
                      )}
                      {selectedNode.no ? (
                        <p>✓ <strong>No</strong> → เชื่อมต่อไปยัง node อื่น</p>
                      ) : (
                        <p>○ <strong>No</strong> branch ยังไม่ได้ตั้ง</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-black/10 p-4">
              <p className="text-xs text-slate-500 mb-3">
                📌 <strong>เคล็ดลับ:</strong> ลาก node นี้ไปรอบๆ ได้เลย หรือคลิกปุ่ม Quiz เพื่อทดสอบ tree
              </p>
            </div>
          </div>
        )}

        {/* Empty state hint  */}
        {!quizMode && !selectedNode && (
          <div className="hidden md:flex md:w-72 border-l border-black/10 bg-gradient-to-b from-blue-50 to-white flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl mb-3">👆</div>
            <h3 className="font-semibold text-slate-900 mb-2">คลิก Node</h3>
            <p className="text-sm text-slate-600 mb-4">
              เลือก node ใดก็ได้จาก tree เพื่อดูรายละเอียดและเรียนรู้วิธีแก้ไข
            </p>
            <p className="text-xs text-slate-500">
              💡 <strong>เคล็ด:</strong> เริ่มต้นด้วย node สีเขียว "Start"
            </p>
          </div>
        )}

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
      )}
    </>
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
  const [headline, ...rest] = props.node.label.split("\n");
  const details = rest.join("\n").trim();

  return (
    <div className="fixed left-3 right-3 top-3 z-30 max-w-[640px] rounded-2xl border border-amber-200 bg-amber-50/95 p-4 shadow-lg backdrop-blur md:left-4 md:right-auto md:top-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            {isOutcome ? "Result" : "Question"}
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900" style={{ whiteSpace: "pre-line" }}>
            {isOutcome ? headline : props.node.label}
          </div>
          {isOutcome && details ? (
            <div className="mt-2 whitespace-pre-line text-sm text-slate-700">{details}</div>
          ) : null}
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
          <div className="font-semibold text-slate-900">Path</div>
          <div className="mt-2 space-y-1">
            {props.answers.map((a, i) => {
              const node = props.trailNodes[i];
              const q = (node?.label ?? props.trail[i]).split("\n")[0];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-right font-mono text-[11px] text-slate-500">{i + 1}.</span>
                  <span className="truncate">{q}</span>
                  <span
                    className={[
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      a === "yes" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
                    ].join(" ")}
                  >
                    {a.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        {isOutcome ? (
          <div className="text-sm font-semibold text-slate-700">Reached a result.</div>
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
