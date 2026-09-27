"use client";

import type { IeltsChart } from "@/types/ielts";

// ========================================
// نمودار سادهٔ SVG برای تسک ۱ رایتینگ (v1.0.3.2)
// bar / line / pie — رندر تمیز با دارک‌مود، بدون کتابخانهٔ خارجی
// ========================================

const PALETTE = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

export default function ChartView({ chart }: { chart: IeltsChart }) {
  if (chart.type === "pie") return <PieChart chart={chart} />;
  if (chart.type === "line") return <BarLineChart chart={chart} line />;
  return <BarLineChart chart={chart} />;
}

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <figure
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4"
      dir="ltr"
    >
      <figcaption className="text-center text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
        {title}
      </figcaption>
      {children}
      <style jsx global>{`
        .chart text { font-size: 10px; fill: #94a3b8; }
      `}</style>
    </figure>
  );
}

/** نمودار میله‌ای (گروهی) و خطی */
function BarLineChart({ chart, line }: { chart: IeltsChart; line?: boolean }) {
  const W = 560, H = 300, PL = 46, PB = 40, PT = 14, PR = 14;
  const maxValue = Math.max(1, ...chart.series.flatMap((s) => s.values));
  const niceMax = Math.ceil(maxValue / 5) * 5 || 5;
  const groupW = (W - PL - PR) / chart.categories.length;
  const barW = Math.min(26, (groupW - 14) / chart.series.length);
  const plotH = H - PB - PT;

  const y = (v: number) => PT + plotH - (v / niceMax) * plotH;
  const gridLines = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  return (
    <ChartFrame title={chart.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chart.title}>
        {/* شبکه + محور */}
        {gridLines.map((v, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
            <text x={PL - 6} y={y(v) + 3} textAnchor="end">{Math.round(v)}</text>
          </g>
        ))}
        <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="currentColor" className="text-slate-400" strokeWidth="1.5" />

        {chart.categories.map((cat, ci) => {
          const cx = PL + groupW * ci + groupW / 2;
          return (
            <g key={cat}>
              <text x={cx} y={H - 18} textAnchor="middle" fontWeight="bold" className="fill-slate-500 dark:fill-slate-400" style={{ fontSize: "11px" }}>
                {cat}
              </text>
              {line
                ? null
                : chart.series.map((s, si) => {
                    const v = s.values[ci] ?? 0;
                    const x = cx - (chart.series.length * barW) / 2 + si * barW + 2;
                    return (
                      <rect
                        key={s.name}
                        x={x}
                        y={y(v)}
                        width={barW - 4}
                        height={Math.max(0, y(0) - y(v))}
                        rx="3"
                        fill={PALETTE[si % PALETTE.length]}
                      />
                    );
                  })}
            </g>
          );
        })}

        {/* خطوط سری */}
        {line &&
          chart.series.map((s, si) => {
            const pts = s.values
              .map((v, ci) => `${PL + groupW * ci + groupW / 2},${y(v)}`)
              .join(" ");
            return (
              <g key={s.name}>
                <polyline points={pts} fill="none" stroke={PALETTE[si % PALETTE.length]} strokeWidth="2.5" strokeLinejoin="round" />
                {s.values.map((v, ci) => (
                  <circle
                    key={ci}
                    cx={PL + groupW * ci + groupW / 2}
                    cy={y(v)}
                    r="4"
                    fill={PALETTE[si % PALETTE.length]}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}
      </svg>
      <Legend chart={chart} />
      {chart.unit && (
        <p className="text-center text-[10px] text-slate-400 mt-1">({chart.unit})</p>
      )}
    </ChartFrame>
  );
}

/** نمودار دایره‌ای */
function PieChart({ chart }: { chart: IeltsChart }) {
  const s = chart.series[0];
  const total = s.values.reduce((a, b) => a + b, 0) || 1;
  const R = 92, CX = 150, CY = 110;
  // زاویه‌ها بدون تغییرپذیری محلی محاسبه می‌شوند (قانون react-hooks/immutability)
  const slices = s.values.map((v, i) => {
    const before = s.values.slice(0, i).reduce((a, b) => a + b, 0);
    const a0 = -Math.PI / 2 + (before / total) * Math.PI * 2;
    const a1 = a0 + (v / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = [
      `M ${CX} ${CY}`,
      `L ${CX + R * Math.cos(a0)} ${CY + R * Math.sin(a0)}`,
      `A ${R} ${R} 0 ${large} 1 ${CX + R * Math.cos(a1)} ${CY + R * Math.sin(a1)}`,
      "Z",
    ].join(" ");
    return { path: p, color: PALETTE[i % PALETTE.length], pct: Math.round((v / total) * 100) };
  });
  return (
    <ChartFrame title={chart.title}>
      <svg viewBox="0 0 300 220" className="w-full h-auto max-w-72 mx-auto" role="img" aria-label={chart.title}>
        {slices.map((sl, i) => (
          <path key={i} d={sl.path} fill={sl.color} stroke="#fff" strokeWidth="2" />
        ))}
        {chart.categories.map((c, i) => (
          <text
            key={c}
            x={CX + (R + 14) * Math.cos(-Math.PI / 2 + ((s.values[i] / total) * Math.PI * 2 * (i + 0.5)))}
            y={CY + (R + 14) * Math.sin(-Math.PI / 2 + ((s.values[i] / total) * Math.PI * 2 * (i + 0.5))) + 3}
            textAnchor="middle"
            fontWeight="bold"
          >
            {slices[i].pct}%
          </text>
        ))}
      </svg>
      <Legend chart={chart} />
      {chart.unit && (
        <p className="text-center text-[10px] text-slate-400 mt-1">({chart.unit})</p>
      )}
    </ChartFrame>
  );
}

function Legend({ chart }: { chart: IeltsChart }) {
  const items =
    chart.type === "pie"
      ? chart.categories.map((c, i) => ({ name: c, color: PALETTE[i % PALETTE.length] }))
      : chart.series.map((s, i) => ({ name: s.name, color: PALETTE[i % PALETTE.length] }));
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
      {items.map((it) => (
        <span key={it.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}
