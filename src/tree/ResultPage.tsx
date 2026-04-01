import { useState } from "react";
import type { TreeState } from "./types";

type ResultPageProps = {
  chartType: string;
  quizTrail: string[];
  nodes: TreeState;
  onEditConditions: (editId: string) => void;
  onTryAnother: () => void;
  onClose: () => void;
};

export default function ResultPage({
  chartType,
  quizTrail,
  nodes,
  onEditConditions,
  onTryAnother,
  onClose,
}: ResultPageProps) {
  const [step, setStep] = useState(1);
  const guide = getChartGuide(chartType);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">
              📊 {step === 4 ? "ต่อไปคุณจะทำอะไร?" : getChartTypeInThai(chartType)}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="text-xs font-semibold text-cyan-700">
              ขั้นที่ {step} / {totalSteps}
            </div>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-3 text-xs font-semibold text-slate-600">
            {step === 1 && "✅ ผลลัพธ์ของคุณ"}
            {step === 2 && "📖 วิธีการอ่านกราฟนี้"}
            {step === 3 && "💡 เหตุผลที่ได้กราฟนี้"}
            {step === 4 && "🎯 ขั้นตอนต่อไป"}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] p-8">
          {step === 1 && <Step1Result chartType={chartType} />}
          {step === 2 && <Step2HowToRead chartType={chartType} guide={guide} />}
          {step === 3 && <Step3WhyThisChart chartType={chartType} guide={guide} />}
          {step === 4 && (
            <Step4WhatNext
              chartType={chartType}
              quizTrail={quizTrail}
              onEditConditions={onEditConditions}
              onTryAnother={onTryAnother}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex gap-3 justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← ก่อนหน้า
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={[
                  "w-8 h-8 rounded-full font-semibold text-xs transition-all",
                  step === i + 1
                    ? "bg-cyan-600 text-white"
                    : step > i + 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300",
                ].join(" ")}
              >
                {step > i + 1 ? "✓" : i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
            disabled={step === totalSteps}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ต่อไป →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 1: ผลลัพธ์ =====
function Step1Result({ chartType }: { chartType: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">📊</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {getChartTypeInThai(chartType)}
          </h3>
          <p className="text-sm text-slate-600 font-mono">({chartType})</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-2">✅ นี่คือกราฟชนิดเดียวที่ถูกต้อง</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          ระบบวิเคราะห์คำตอบของคุณแล้ว แล้วสรุปว่า <strong>{getChartTypeInThai(chartType)}</strong>{" "}
          เป็นตัวเลือกที่ดีที่สุดสำหรับข้อมูลของคุณ
        </p>
      </div>
    </div>
  );
}

// ===== STEP 2: วิธีอ่าน =====
function Step2HowToRead({ chartType, guide }: { chartType: string; guide: ChartGuide }) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 rounded-lg border-l-4 border-emerald-500 p-6">
        <h4 className="font-semibold text-emerald-900 mb-4">📖 วิธีการอ่านกราฟนี้:</h4>
        <ul className="space-y-3">
          {guide.readingGuide.map((guide, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="font-semibold text-emerald-600">{guide.split(/\s+/)[0]}</span>
              <span>{guide.substring(guide.split(/\s+/)[0].length).trim()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase mb-2">🎨 การออกแบบกราฟ</p>
        <p className="text-sm text-slate-700">
          {chartType === "bar" &&
            "ความสูงของแท่ง = ตัวแปรหลัก • เปรียบเทียบความยาว ควรตรง • ลำดับตั้งแต่ใหญ่ไปเล็ก"}
          {chartType === "line" &&
            "จุดบนเส้น = ค่า • เส้นขึ้น/ลง = ทิศทาง • ลาดชัน = อัตราการเปลี่ยนแปลง"}
          {chartType === "pie" &&
            "ขนาดชิ้น = สัดส่วน • มุม = ร้อยละ • ทั้งหมด = 100% เสมอ"}
          {chartType === "scatter" &&
            "จุดแต่ละ = ผู้สังเกต • แกน X/Y = ตัวแปรแต่ละตัว • ความหนาแน่น = ความสัมพันธ์"}
          {chartType === "bumps" &&
            "เส้นแต่ละเส้น = หมวดหมู่ • การเลื่อนขึ้น/ลง = การเปลี่ยนอันดับ"}
          {chartType === "area" &&
            "พื้นที่เติมสี = ปริมาณ • เส้นด้านบน = ค่าสูงสุด • ความลาด = การแปรผัน"}
          {chartType === "step" &&
            "เส้นเป็นขั้น = ค่าคงที่จนกว่าจะเปลี่ยน • จุดกระโดด = มีการอัปเดตค่าใหม่"}
          {chartType === "thin_bar" &&
            "แท่งบาง = หนึ่งช่วงเวลา • เหมาะกับช่วงติดกันเยอะๆ โดยยังเทียบแต่ละช่วงได้"}
          {chartType === "clustered_bar" &&
            "แท่งกลุ่ม = เทียบส่วนย่อยแม่น • เทียบยอดรวมได้คร่าวๆ จากผลรวมของแท่ง"}
          {chartType === "merged_bar" &&
            "แท่งซ้อนทับสองชั้น = 2 หน่วยวัดคนละสเกล • ใช้เมื่อจำเป็นต้องอยู่กราฟเดียว"}
          {chartType === "stacked_bar" &&
            "ความยาวรวม = ยอดรวมเทียบแม่น • ส่วนย่อยด้านในเทียบหยาบกว่า"}
          {chartType === "stacked_bar_100" &&
            "แต่ละแท่งรวม = 100% • เทียบสัดส่วนของส่วนย่อยข้ามกลุ่ม"}
          {chartType === "stacked_area" &&
            "ความสูงรวม = ยอดรวมตามเวลา • ความหนาแต่ละชั้น = ส่วนย่อย"}
          {chartType === "stacked_area_100" &&
            "รวมสูงเท่ากันเสมอ (100%) • เห็นสัดส่วนเปลี่ยนตามเวลา"}
          {chartType === "waterfall" &&
            "แต่ละแท่ง = เพิ่ม/ลดทีละขั้น • เห็นผลรวมสะสมไปจนถึงปลายทาง"}
          {chartType === "treemap" &&
            "พื้นที่ช่อง = สัดส่วนของยอดรวม • เหมาะเมื่อชิ้นส่วนเยอะเกินจะทำพาย"}
          {chartType === "choropleth" &&
            "เฉดสี = ค่าตามพื้นที่ • เน้นรูปแบบเชิงพื้นที่มากกว่าความแม่นยำ"}
          {chartType === "tile_map" &&
            "ช่องเท่ากันช่วยลดอคติจากขนาดพื้นที่ • สีเข้ม/อ่อนแทนค่ามาก/น้อย"}
          {chartType === "map_dots" &&
            "จุด = ตำแหน่ง • ดูการกระจุก/กระจายของเหตุการณ์"}
          {chartType === "map_bubbles" &&
            "ฟองใหญ่/เล็ก = ค่ามาก/น้อย • เหมาะกับการมองแพตเทิร์น"}
          {chartType === "map_bars" &&
            "แท่งสูง/ต่ำ = ค่ามาก/น้อย • แม่นกว่า bubbles แต่รกกว่า"}
          {chartType === "map_lines" &&
            "เส้น = เส้นทาง/การเคลื่อนที่ • โฟกัสทิศทางและรูปทรงมากกว่าค่าจุดเดียว"}
        </p>
      </div>
    </div>
  );
}

// ===== STEP 3: เหตุผล + Bait-and-Switch =====
function Step3WhyThisChart({ chartType, guide }: { chartType: string; guide: ChartGuide }) {
  return (
    <div className="space-y-6">
      {/* Why This Chart */}
      <div className="bg-cyan-50 rounded-lg border-l-4 border-cyan-500 p-6">
        <h4 className="font-semibold text-cyan-900 mb-3">💡 เหตุผล:</h4>
        <p className="text-sm text-slate-700 leading-relaxed">{guide.whyThisChart}</p>
      </div>

      {/* Bait and Switch */}
      {guide.commonMistake && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">⚠️ เปรียบเทียบ: กราฟผิด vs ถูก</h4>

          {/* Wrong Chart */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  {guide.commonMistake.wrongChartName} (ผิด)
                </p>
                <p className="text-xs text-red-800 mt-1">{guide.commonMistake.problem}</p>
              </div>
            </div>
          </div>

          {/* Correct Chart */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">{getChartTypeInThai(chartType)} (ถูก)</p>
                <p className="text-xs text-emerald-800 mt-1">
                  {chartType === "line" && "แสดงแนวโน้มชัดเจน • ง่ายเห็นจุดเปลี่ยนแปลง"}
                  {chartType === "bar" && "เปรียบเทียบง่าย • มองเห็นความแตกต่างในทันที"}
                  {chartType === "pie" && "รู้ทันที = ส่วนไปส่วนมา • ความสัมพันธ์กับทั้งหมด"}
                  {chartType === "scatter" && "เห็นความสัมพันธ์ชัดเจน • ข้อมูลทุกจุดมองเห็น"}
                  {chartType === "bumps" && "ติดตามการเปลี่ยนอันดับง่าย • ชัดเจนว่าใครขึ้นใครลง"}
                  {chartType === "area" && "เน้นปริมาณ • ดูแนวโน้มและขนาดพร้อมกัน"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== STEP 4: ต่อไป =====
function Step4WhatNext({
  chartType,
  quizTrail,
  onEditConditions,
  onTryAnother,
}: {
  chartType: string;
  quizTrail: string[];
  onEditConditions: (editId: string) => void;
  onTryAnother: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <p className="text-sm font-semibold text-amber-900 mb-2">🎓 คุณทำดีแล้ว!</p>
        <p className="text-sm text-amber-800 leading-relaxed">
          คุณคำตอบคำถามทั้งหมดแล้ว
          ระบบได้วิเคราะห์และแนะนำ "{getChartTypeInThai(chartType)}" ให้คุณ
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900">🎯 ต่อไปคุณจะทำอะไร?</h4>

        <button
          onClick={() => {
            const lastNodeId = quizTrail[quizTrail.length - 1];
            onEditConditions(lastNodeId);
          }}
          className="w-full text-left rounded-lg border-2 border-cyan-300 bg-cyan-50 p-4 hover:bg-cyan-100 transition-all"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-semibold text-cyan-900">แก้ไขคำตอบ (Edit Conditions)</p>
              <p className="text-xs text-cyan-800 mt-1">
                ย้อนกลับไปแก้เงื่อนไข แล้วดูว่าผลลัพธ์เปลี่ยนเป็นกราฟแบบไหน
              </p>
            </div>
          </div>
        </button>

        {/* Try Another Button */}
        <button
          onClick={onTryAnother}
          className="w-full text-left rounded-lg border-2 border-slate-300 bg-slate-50 p-4 hover:bg-slate-100 transition-all"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🔁</span>
            <div>
              <p className="font-semibold text-slate-900">ลองใหม่กับข้อมูลอื่น</p>
              <p className="text-xs text-slate-800 mt-1">
                กลับไปที่เมนูหลักเพื่อเลือกประเภทข้อมูลใหม่
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <p className="text-xs font-semibold text-blue-900 uppercase mb-2">📚 นี่คือ Training Wheels</p>
        <p className="text-xs text-blue-800">
          Decision Tree นี้เปรียบเสมือน 'ล้อช่วยจักรยาน' - มันจะช่วยคุณหลีกเลี่ยงกราฟผิด
          แต่เมื่อคุณเชี่ยวชาญแล้ว คุณสามารถแหกกฎบ้างก็ได้!
        </p>
      </div>
    </div>
  );
}

// Helper function
function getChartTypeInThai(chartType: string): string {
  const map: Record<string, string> = {
    bar: "Bar Chart (กราฟแท่ง)",
    line: "Line Chart (กราฟเส้น)",
    step: "Step Chart (กราฟขั้นบันได)",
    thin_bar: "Thin Bar Chart (กราฟแท่งบาง)",
    clustered_bar: "Clustered Bar Chart (กราฟแท่งกลุ่ม)",
    merged_bar: "Merged Bar Chart (กราฟแท่งรวม)",
    stacked_bar: "Stacked Bar Chart (กราฟแท่งซ้อน)",
    stacked_bar_100: "100% Stacked Bars (กราฟแท่งซ้อน 100%)",
    stacked_area: "Stacked Area (กราฟพื้นที่ซ้อน)",
    stacked_area_100: "100% Stacked Area (กราฟพื้นที่ซ้อน 100%)",
    waterfall: "Waterfall Chart (กราฟน้ำตก)",
    treemap: "Treemap (ทรีแมป)",
    pie: "Pie Chart (กราฟวงกลม)",
    pie_sm: "Pie Charts (small multiples) (พายหลายวง)",
    dot: "Dot Plot (กราฟจุด)",
    bumps: "Bumps Chart (กราฟอันดับ)",
    area: "Area Chart (กราฟพื้นที่)",
    scatter: "Scatter Chart (กราฟกระจาย)",
    choropleth: "Choropleth Map (แผนที่ระบายสี)",
    tile_map: "Tile Map (แผนที่ช่องเท่ากัน)",
    map_dots: "Colored Dots on Map (จุดบนแผนที่)",
    map_bubbles: "Bubbles on Map (ฟองบนแผนที่)",
    map_bars: "Bars on Map (แท่งบนแผนที่)",
    map_lines: "Lines on Map (เส้นบนแผนที่)",
  };
  return map[chartType] || chartType;
}

type ChartGuide = {
  readingGuide: string[];
  whyThisChart: string;
  commonMistake?: {
    wrongChartType: string;
    wrongChartName: string;
    problem: string;
  };
};

function getChartGuide(chartType: string): ChartGuide {
  const guides: Record<string, ChartGuide> = {
    dot: {
      readingGuide: ["✓ Each dot is one value", "✓ Compare values directly", "✓ Don't imply a smooth trend with too few points"],
      whyThisChart:
        "Dot plots are best when you only have a handful of observations. They show values honestly without suggesting a continuous pattern of change.",
    },
    line: {
      readingGuide: ["✓ X-axis is time order", "✓ Slope = rate of change", "✓ Look for turning points and trends"],
      whyThisChart:
        "Line charts are the default choice for showing patterns of change over time (trend, direction, speed).",
      commonMistake: {
        wrongChartType: "bar",
        wrongChartName: "Bar Chart",
        problem:
          "Bars emphasize comparing individual periods. If the job is pattern-of-change, bars make the trend harder to see.",
      },
    },
    step: {
      readingGuide: ["✓ Flat segments = value holds", "✓ Jumps = updates", "✓ Great for 'holds then changes' data"],
      whyThisChart:
        "Step charts communicate persistent values that update at specific moments (value holds, then jumps).",
    },
    thin_bar: {
      readingGuide: ["✓ Each bar is one time period", "✓ Good for many adjacent periods", "✓ Compare periods (not smooth trend)"],
      whyThisChart:
        "Thin bars keep dense, regular intervals readable when your goal is to feature each period rather than a smooth trend.",
    },
    bar: {
      readingGuide: ["✓ Length encodes value", "✓ Compare categories by length", "✓ Sort/group for easier reading"],
      whyThisChart:
        "Bar charts are best for precise comparison across categories or for featuring individual periods rather than a continuous pattern.",
      commonMistake: {
        wrongChartType: "pie",
        wrongChartName: "Pie Chart",
        problem: "Pie charts make precise comparisons hard. If the task is accurate comparison, bars win.",
      },
    },
    clustered_bar: {
      readingGuide: ["✓ Compare same-color bars across groups", "✓ Best for part-to-part comparison", "✓ Totals are secondary/rough"],
      whyThisChart:
        "Clustered bars make it easiest to compare parts across several totals when all values share the same unit.",
    },
    merged_bar: {
      readingGuide: ["✓ Two measures shown together", "✓ Treat as a fallback", "✓ Prefer separate charts when possible"],
      whyThisChart:
        "Merged bars are a fallback when you must show different measures on the same category list. Use carefully and label clearly.",
    },
    stacked_bar: {
      readingGuide: ["✓ Total length compares totals precisely", "✓ Inner segments compare parts less precisely", "✓ Good for totals-first tasks"],
      whyThisChart:
        "Stacked bars are best when comparing totals is more important than comparing parts precisely.",
    },
    stacked_bar_100: {
      readingGuide: ["✓ Each bar sums to 100%", "✓ Segment size = share", "✓ Compare composition across groups"],
      whyThisChart:
        "100% stacked bars show how shares differ across totals when absolute totals are not the focus.",
    },
    stacked_area: {
      readingGuide: ["✓ Top edge shows total", "✓ Band thickness shows parts", "✓ Best for total + parts over time"],
      whyThisChart:
        "Stacked area charts show how the total changes over time and how parts contribute to that total.",
    },
    stacked_area_100: {
      readingGuide: ["✓ Always sums to 100%", "✓ Shows share changes over time", "✓ Ignore absolute totals"],
      whyThisChart:
        "100% stacked area focuses on composition changes over time (shares), not magnitude.",
    },
    waterfall: {
      readingGuide: ["✓ Each bar is a change (+/-)", "✓ Running total accumulates", "✓ Explains how you got the end value"],
      whyThisChart:
        "Waterfall charts are best when the job is to explain cumulative subtotals (how a total was built up or reduced).",
    },
    treemap: {
      readingGuide: ["✓ Area encodes share", "✓ Best for many parts", "✓ Hard for precise comparisons"],
      whyThisChart:
        "Treemaps fit many parts of a single total into limited space when there are too many slices for a readable pie chart.",
    },
    pie: {
      readingGuide: ["✓ One pie = one total", "✓ Use for few parts", "✓ Best when shares are the point"],
      whyThisChart:
        "Pie charts work when you have a small number of parts and the job is to communicate fractions of a whole (not precise comparison).",
    },
    pie_sm: {
      readingGuide: ["✓ Each pie is its own total", "✓ Avoid comparing angles between pies", "✓ Use only if totals aren't compared"],
      whyThisChart:
        "Pie small multiples are rare. They only work when the job is to read fractions within each total, not compare totals.",
    },
    choropleth: {
      readingGuide: ["✓ Color encodes magnitude by region", "✓ Best for spatial patterns", "✓ Not for precise comparison"],
      whyThisChart:
        "Choropleth maps are best when location patterns matter and regions are reasonably similar in size.",
    },
    tile_map: {
      readingGuide: ["✓ Equal tiles reduce size bias", "✓ Color encodes value", "✓ Good for comparing across regions"],
      whyThisChart:
        "Tile maps help when regions differ greatly in size, making choropleths misleading.",
    },
    map_dots: {
      readingGuide: ["✓ Each dot is a location", "✓ Spot clusters and gaps", "✓ Great for 'where' questions"],
      whyThisChart:
        "Colored dots emphasize the locations of values—best when geography and distribution patterns matter.",
    },
    map_bubbles: {
      readingGuide: ["✓ Bubble size encodes magnitude", "✓ Good for patterns-first", "✓ Precision is limited"],
      whyThisChart:
        "Bubbles on a map balance readability and spatial pattern spotting when exact comparisons are not the priority.",
    },
    map_bars: {
      readingGuide: ["✓ Bar height encodes magnitude", "✓ More precise than bubbles", "✓ Can get cluttered"],
      whyThisChart:
        "Bars on a map improve comparison precision at the cost of visual clutter.",
    },
    map_lines: {
      readingGuide: ["✓ Lines show paths/flows", "✓ Emphasize direction & shape", "✓ Good for movement over time"],
      whyThisChart:
        "Lines on a map are best when your data is a path or movement over time, not a static location.",
    },
    scatter: {
      readingGuide: ["✓ Each dot is one observation", "✓ X and Y are two variables", "✓ Look for relationship/pattern"],
      whyThisChart: "Scatter plots are the go-to for showing how two variables are related.",
    },
    bumps: {
      readingGuide: ["✓ Y-axis is rank order", "✓ Lines crossing = rank changes", "✓ Great for 'who overtakes whom'"],
      whyThisChart: "Bump charts are best for changes in rank over time (not changes in value).",
    },
    area: {
      readingGuide: ["✓ Filled area suggests magnitude", "✓ Good for volume + trend", "✓ Watch the baseline"],
      whyThisChart:
        "Area charts work when you want the viewer to feel the magnitude while also seeing a trend over time.",
    },
  };

  return (
    guides[chartType] ?? {
      readingGuide: ["✓ Read the axis labels", "✓ Identify what encodes value", "✓ Check if comparison or pattern is the goal"],
      whyThisChart:
        "This chart type matches the decision path you took. If you want a different outcome, go back and change the last condition.",
    }
  );
}
