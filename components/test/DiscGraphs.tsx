type GraphValues = { D: number; I: number; S: number; C: number };

const ORDER: (keyof GraphValues)[] = ["D", "I", "S", "C"];
const COLORS: Record<keyof GraphValues, string> = {
  D: "#D7263D",
  I: "#E8A317",
  S: "#2E9E5B",
  C: "#2D6CDF",
};

function SingleDiscGraph({ title, subtitle, values }: { title: string; subtitle: string; values: GraphValues }) {
  const width = 240;
  const height = 300;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const min = -16;
  const max = 18;
  const yFor = (value: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    return padT + (plotH * (max - clamped)) / (max - min);
  };
  const xs = ORDER.map((_, index) => padL + (plotW * (index + 0.5)) / 4);
  const points = ORDER.map((key, index) => `${xs[index].toFixed(1)},${yFor(values[key] || 0).toFixed(1)}`).join(" ");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 print-avoid">
      <div className="text-center mb-2">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        {Array.from({ length: 9 }, (_, index) => max - index * 4).map((grid) => {
          const y = yFor(grid);
          return (
            <g key={grid}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke={grid === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={grid === 0 ? 1.5 : 1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{grid}</text>
            </g>
          );
        })}
        <polyline points={points} fill="none" stroke="#334155" strokeWidth="2" />
        {ORDER.map((key, index) => {
          const value = values[key] || 0;
          const cx = xs[index];
          const cy = yFor(value);
          return (
            <g key={key}>
              <circle cx={cx} cy={cy} r="6" fill={COLORS[key]} stroke="#fff" strokeWidth="2" />
              <text x={cx} y={value >= 0 ? cy - 10 : cy + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS[key]}>{value}</text>
              <text x={cx} y={height - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS[key]}>{key}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function DiscGraphs({ g1, g2, g3 }: { g1: GraphValues; g2: GraphValues; g3: GraphValues }) {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <SingleDiscGraph title="Grafik 1 · Paling" subtitle="Diri yang tampil" values={g1} />
      <SingleDiscGraph title="Grafik 2 · Kurang" subtitle="Diri yang ditekan" values={g2} />
      <SingleDiscGraph title="Grafik 3 · Change" subtitle="Profil yang dilaporkan" values={g3} />
    </div>
  );
}
