import type { TreePreset } from "./presets";

export type HomeProps = {
  presets: TreePreset[];
  onSelectPreset: (id: string) => void;
  onStartPresetQuiz: (id: string) => void;
  onStartBeginnerGuide: () => void;
};

const GUIDE_PATHS = {
  beginner: {
    title: "เริ่มต้นสำหรับครั้งแรก",
    description: "ตอบคำถามสั้นๆ ทีละข้อ เพื่อได้ชนิดกราฟที่เหมาะกับข้อมูลของคุณ",
    presets: ["over_time", "single_total", "several_totals", "total_over_time"],
  },
  chartSelection: {
    title: "เลือกชนิดกราฟ",
    description: "เลือกเส้นทางให้ตรงกับเป้าหมายของข้อมูล (ตามเวลา / สัดส่วนยอดรวม / หลายยอดรวม)",
    presets: ["over_time", "single_total", "several_totals", "total_over_time"],
  },
  refinement: {
    title: "ปรับสเกลและแผนที่",
    description: "คำถามเสริม: แกนต้องเริ่มที่ 0 ไหม? ตั้งค่าขอบล่างสเกล? เลือกชนิดแผนที่?",
    presets: ["include_zero", "lower_scale_limit", "map_type"],
  },
};

// Descriptions for each decision tree
const PRESET_DESCRIPTIONS: Record<string, string> = {
  over_time: "ข้อมูลตามเวลา: ควรใช้กราฟแบบไหนถึงจะอ่านง่าย?",
  single_total: "ยอดรวมก้อนเดียว: ควรแสดง “ส่วนประกอบ” ยังไง?",
  several_totals: "หลายยอดรวม: จะเทียบ “ส่วนประกอบ” ระหว่างยอดรวมยังไง?",
  total_over_time: "ยอดรวม + ส่วนประกอบตามเวลา: เน้น “ยอดรวม” หรือ “สัดส่วน”?",
  include_zero: "แกนตัวเลขจำเป็นต้องรวม 0 ไหม?",
  lower_scale_limit: "เลือกขอบล่างของสเกลตัวเลขยังไงให้เหมาะ?",
  map_type: "ข้อมูลผูกกับสถานที่: เลือกแผนที่แบบไหน?",
};

export default function Home({ presets, onSelectPreset, onStartPresetQuiz, onStartBeginnerGuide }: HomeProps) {
  const presetMap = Object.fromEntries(presets.map((p) => [p.id, p]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📈 Chart Chooser</h1>
          <p className="text-lg text-slate-600">
            ใช้ decision tree เพื่อเลือก chart ที่สมบูรณ์แบบสำหรับข้อมูลของคุณ โดยอ้างอิงจาก{" "}
            <a
              href="https://www.practicalreporting.com/practical-charts-book"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Practical Charts by Nick Desbarats
            </a>
          </p>
        </div>

        {/* Guided Paths */}
        <div className="grid gap-6 mb-12">
          <PathCard
            stepNumber={1}
            icon="🎯"
            title={GUIDE_PATHS.beginner.title}
            description={GUIDE_PATHS.beginner.description}
            presetIds={GUIDE_PATHS.beginner.presets}
            presetMap={presetMap}
            onSelectPreset={onSelectPreset}
            onStartPresetQuiz={onStartPresetQuiz}
            onSelectSpecial={onStartBeginnerGuide}
            isBeginner
            highlight
          />
          <PathCard
            stepNumber={2}
            icon="📊"
            title={GUIDE_PATHS.chartSelection.title}
            description={GUIDE_PATHS.chartSelection.description}
            presetIds={GUIDE_PATHS.chartSelection.presets}
            presetMap={presetMap}
            onSelectPreset={onSelectPreset}
            onStartPresetQuiz={onStartPresetQuiz}
          />
          <PathCard
            stepNumber={3}
            icon="🎨"
            title={GUIDE_PATHS.refinement.title}
            description={GUIDE_PATHS.refinement.description}
            presetIds={GUIDE_PATHS.refinement.presets}
            presetMap={presetMap}
            onSelectPreset={onSelectPreset}
            onStartPresetQuiz={onStartPresetQuiz}
          />
        </div>

        {/* All Presets */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🗺️ ทั้งหมด</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <PresetButton key={preset.id} preset={preset} onSelect={onSelectPreset} onStartQuiz={onStartPresetQuiz} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type PathCardProps = {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
  presetIds: string[];
  presetMap: Record<string, TreePreset>;
  onSelectPreset: (id: string) => void;
  onStartPresetQuiz?: (id: string) => void;
  onSelectSpecial?: () => void;
  isBeginner?: boolean;
  highlight?: boolean;
};

function PathCard({
  stepNumber,
  icon,
  title,
  description,
  presetIds,
  presetMap,
  onSelectPreset,
  onStartPresetQuiz,
  onSelectSpecial,
  isBeginner,
  highlight,
}: PathCardProps) {
  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        highlight
          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 shadow-lg"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-sm">
              {stepNumber}
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {icon} {title}
            </h3>
          </div>
          <p className="text-slate-600 mb-4 ml-11">{description}</p>
          <div className="flex flex-wrap gap-2 ml-11">
            {isBeginner && onSelectSpecial ? (
              <button
                onClick={onSelectSpecial}
                className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white transition-all hover:shadow-md"
                title="เริ่มต้นด้วยการเลือก data type"
              >
                <span>🚀 เริ่มเลย!</span>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              presetIds.map((id, index) => {
                const preset = presetMap[id];
                if (!preset) return null;
                const presetDesc = PRESET_DESCRIPTIONS[id];
                return (
                  <button
                    key={id}
                    onClick={() => (onStartPresetQuiz ? onStartPresetQuiz(id) : onSelectPreset(id))}
                    className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-blue-100 hover:border-blue-300 border border-slate-200 text-slate-700 transition-all hover:shadow-md"
                    title={presetDesc}
                  >
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">
                      {stepNumber}.{index + 1}
                    </span>
                    {preset.name.split(" (")[0]}
                    <span className="text-slate-400 group-hover:text-blue-600">→</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type PresetButtonProps = {
  preset: TreePreset;
  onSelect: (id: string) => void;
  onStartQuiz: (id: string) => void;
};

function PresetButton({ preset, onSelect, onStartQuiz }: PresetButtonProps) {
  const description = PRESET_DESCRIPTIONS[preset.id] || "สำรวจ decision tree นี้";
  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all hover:bg-blue-50">
      <h3 className="font-semibold text-slate-900 mb-1">{preset.name.replace(" (locked)", "")}</h3>
      <p className="text-sm text-slate-500 mb-3">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onStartQuiz(preset.id)}
          className="flex-1 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
          title="เริ่มตอบคำถาม Quiz"
        >
          🎯 Quiz
        </button>
        <button
          onClick={() => onSelect(preset.id)}
          className="flex-1 px-3 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
          title="เปิดดูแผนผังคำถามก่อน (ยังไม่เริ่ม Quiz)"
        >
          🗺️ ดูแผนผัง
        </button>
      </div>
    </div>
  );
}
