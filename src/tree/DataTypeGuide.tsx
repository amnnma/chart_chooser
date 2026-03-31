export type DataTypeGuideProps = {
  onSelectDataType: (presetId: string) => void;
};

type DataType = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  example: string;
  presetId: string;
};

const DATA_TYPES: DataType[] = [
  {
    id: "time-series",
    icon: "📈",
    title: "ข้อมูลตามเวลา",
    subtitle: "Data Over Time",
    description:
      "ค่าเดียวกันที่บันทึกซ้ำตามเวลา (เช่น รายวัน/รายสัปดาห์) เพื่อดูแนวโน้มและจุดเปลี่ยน",
    example: "ตัวอย่าง: ยอดขายรายวัน • อุณหภูมิรายชั่วโมง • ราคาหุ้นรายวัน",
    presetId: "over_time",
  },
  {
    id: "single-breakdown",
    icon: "🥧",
    title: "ส่วนประกอบของยอดรวม (ก้อนเดียว)",
    subtitle: "Breakdown of Single Total",
    description:
      "ยอดรวม 1 ก้อน แยกเป็นส่วนย่อยเพื่อดูสัดส่วนหรือการมีส่วนร่วมของแต่ละส่วน",
    example: "ตัวอย่าง: ค่าใช้จ่ายแยกหมวด • ส่วนแบ่งตลาด • งบประมาณแยกทีม",
    presetId: "single_total",
  },
  {
    id: "multiple-breakdowns",
    icon: "📊",
    title: "ส่วนประกอบของหลายยอดรวม",
    subtitle: "Breakdown of Multiple Totals",
    description:
      "มีหลายยอดรวม (หลายกลุ่ม/หลายภูมิภาค) และแต่ละยอดรวมมีส่วนย่อยให้เทียบกัน",
    example: "ตัวอย่าง: ยอดขายแต่ละประเทศแยกสินค้า • งบแต่ละปีแยกหมวด",
    presetId: "several_totals",
  },
  {
    id: "breakdown-over-time",
    icon: "📈🥧",
    title: "ยอดรวม + ส่วนประกอบ ตามเวลา",
    subtitle: "Breakdown of Total Over Time",
    description:
      "อยากเห็นทั้ง “ยอดรวม” เปลี่ยนตามเวลา และ “ส่วนย่อย” เปลี่ยนไปพร้อมกัน",
    example: "ตัวอย่าง: ยอดขายรายเดือนแยกสินค้า • ผู้ใช้รายไตรมาสแยกแพ็กเกจ",
    presetId: "total_over_time",
  },
];

export default function DataTypeGuide({ onSelectDataType }: DataTypeGuideProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            🔍 ข้อมูลของคุณเป็นแบบไหน?
          </h1>
          <p className="text-lg text-slate-600">
            เลือกประเภทข้อมูล แล้วระบบจะพาไปยัง decision tree ที่เหมาะที่สุด
          </p>
        </div>

        {/* Data Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {DATA_TYPES.map((type) => (
            <DataTypeCard key={type.id} type={type} onSelect={onSelectDataType} />
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📌 ไม่แน่ใจ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ ตัวอย่าง data over time:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>ยอดขายประจำเดือน (Jan-Dec)</li>
                <li>จำนวนผู้เข้าชม/วัน</li>
                <li>อุณหภูมิรายชั่วโมง</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ ตัวอย่าง breakdown:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>ค่าใช้จ่ายแบ่งตามหมวด</li>
                <li>รายได้แบ่งตามสาขา</li>
                <li>ส่วนแบ่งตลาดแบ่งตามแบรนด์</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type DataTypeCardProps = {
  type: DataType;
  onSelect: (presetId: string) => void;
};

function DataTypeCard({ type, onSelect }: DataTypeCardProps) {
  return (
    <button
      onClick={() => onSelect(type.presetId)}
      className="group text-left rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{type.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 mb-1">
            {type.title}
          </h3>
          <p className="text-sm text-slate-500 mb-3">{type.subtitle}</p>
          <p className="text-sm text-slate-600 mb-3">{type.description}</p>
          <p className="text-xs text-slate-500 bg-slate-50 group-hover:bg-blue-100 rounded px-2 py-1 inline-block">
            {type.example}
          </p>
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            เลือกเส้นทางนี้ <span>→</span>
          </div>
        </div>
      </div>
    </button>
  );
}
