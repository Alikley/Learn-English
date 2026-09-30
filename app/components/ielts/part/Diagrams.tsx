"use client";

import type { ReactNode } from "react";

// ========================================
// نقشه/نمودارهای آزمون ساخت‌یافته (v1.0.3.7)
// بازطراحی دقیق شکل‌های کتاب کمبریج ۴ تست ۱:
//  - RiversideVillagePlan: پلان موزهٔ صنایع (سوال ۱۴-۲۰)
//  - ReasonsMovingChart: نمودار ستونی دلایل جابه‌جایی (سوال ۲۸-۳۰)
// ========================================

/** پلان Riverside Industrial Village — سوال ۱۴-۲۰ */
export function RiversideVillagePlan() {
  // موقعیت نشانگرهای شماره‌دار روی نقشه
  const marks: { n: number; x: number; y: number }[] = [
    { n: 14, x: 505, y: 356 }, // Woodside Road — پایین
    { n: 15, x: 441, y: 256 }, // Ticket Office — کنار ورودی
    { n: 16, x: 173, y: 256 }, // Gift Shop — چپِ دروازهٔ ورود
    { n: 17, x: 331, y: 36 }, // Main Workshop — بالا وسط
    { n: 18, x: 520, y: 62 }, // Showroom — بالا راست
    { n: 19, x: 122, y: 62 }, // Café — بالا چپ (Grinding Shop کنارش)
    { n: 20, x: 114, y: 230 }, // Cottages — ردیف چپ
  ];

  return (
    <div
      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 overflow-x-auto"
      dir="ltr"
    >
      <svg
        viewBox="0 0 640 400"
        className="w-full min-w-[540px] max-w-2xl mx-auto block"
        role="img"
        aria-label="Plan of Riverside Industrial Village"
      >
        {/* پس‌زمینهٔ حیاط */}
        <ellipse cx="330" cy="190" rx="210" ry="110" className="fill-slate-100 dark:fill-slate-800" />
        <text
          x="332"
          y="196"
          textAnchor="middle"
          className="fill-slate-400 dark:fill-slate-500"
          fontSize="13"
          fontWeight="700"
          letterSpacing="3"
        >
          YARD
        </text>

        {/* رودخانه — سمت چپ */}
        <path
          d="M 44 0 C 66 90, 24 190, 52 268 C 72 324, 50 372, 64 400 L 0 400 L 0 0 Z"
          className="fill-sky-200 dark:fill-sky-900/60"
        />
        <text
          x="22"
          y="200"
          className="fill-sky-700 dark:fill-sky-300"
          fontSize="12"
          fontWeight="800"
          transform="rotate(-90 22 200)"
          textAnchor="middle"
          letterSpacing="4"
        >
          RIVER
        </text>

        {/* Woodside Road — پایین */}
        <rect x="88" y="336" width="500" height="34" rx="4" className="fill-slate-300 dark:fill-slate-700" />
        <line x1="100" y1="353" x2="576" y2="353" stroke="white" strokeWidth="2" strokeDasharray="14 10" />

        {/* ورودی */}
        <path d="M 316 336 L 330 320 L 344 336 Z" className="fill-slate-500 dark:fill-slate-400" />

        {/* بناها */}
        <g fontSize="10" fontWeight="700">
          {/* Ticket Office — راستِ ورودی */}
          <rect
            x="398"
            y="272"
            width="86"
            height="40"
            rx="5"
            className="fill-amber-100 stroke-amber-400 dark:fill-amber-500/15 dark:stroke-amber-500/50"
            strokeWidth="1.5"
          />
          <text x="441" y="296" textAnchor="middle" className="fill-amber-800 dark:fill-amber-300">
            Ticket Office
          </text>

          {/* Gift Shop — چپِ دروازه */}
          <rect
            x="128"
            y="272"
            width="90"
            height="40"
            rx="5"
            className="fill-rose-100 stroke-rose-400 dark:fill-rose-500/15 dark:stroke-rose-500/50"
            strokeWidth="1.5"
          />
          <text x="173" y="296" textAnchor="middle" className="fill-rose-800 dark:fill-rose-300">
            Gift Shop
          </text>

          {/* Car Park — جلوی ورودی */}
          <rect
            x="272"
            y="252"
            width="110"
            height="58"
            rx="6"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text x="327" y="285" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400">
            Car Park
          </text>

          {/* Main Workshop — بالا وسط */}
          <rect
            x="258"
            y="48"
            width="146"
            height="56"
            rx="6"
            className="fill-indigo-100 stroke-indigo-400 dark:fill-indigo-500/15 dark:stroke-indigo-500/60"
            strokeWidth="2"
          />
          <text x="331" y="72" textAnchor="middle" className="fill-indigo-800 dark:fill-indigo-300">
            MAIN WORKSHOP
          </text>
          <text x="331" y="88" textAnchor="middle" className="fill-indigo-500 dark:fill-indigo-400" fontSize="9">
            (furnace)
          </text>

          {/* Showroom — بالا راست */}
          <rect
            x="470"
            y="82"
            width="100"
            height="52"
            rx="5"
            className="fill-teal-100 stroke-teal-400 dark:fill-teal-500/15 dark:stroke-teal-500/60"
            strokeWidth="1.5"
          />
          <text x="520" y="103" textAnchor="middle" className="fill-teal-800 dark:fill-teal-300">
            Showroom
          </text>
          <text x="520" y="119" textAnchor="middle" className="fill-teal-600 dark:fill-teal-400" fontSize="9">
            (big windows)
          </text>

          {/* Grinding Shop — بالا چپ */}
          <rect
            x="76"
            y="82"
            width="94"
            height="52"
            rx="5"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <text x="123" y="112" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
            Grinding Shop
          </text>

          {/* Engine Room — کنار Grinding Shop */}
          <rect
            x="182"
            y="82"
            width="66"
            height="52"
            rx="5"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <text x="215" y="112" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
            Engine Room
          </text>

          {/* Cottages — ردیف چپ */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={72 + i * 42}
              y="172"
              width="34"
              height="40"
              rx="4"
              className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-500/15 dark:stroke-emerald-500/60"
              strokeWidth="1.5"
            />
          ))}

          {/* Stables — راست */}
          <rect
            x="532"
            y="204"
            width="70"
            height="46"
            rx="5"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <text x="567" y="231" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
            Stables
          </text>

          {/* Works Office — جلوی Stables */}
          <rect
            x="516"
            y="264"
            width="84"
            height="40"
            rx="5"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <text x="558" y="288" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
            Works Office
          </text>
        </g>

        {/* نشانگرهای شماره‌دار */}
        {marks.map((m) => (
          <g key={m.n}>
            <circle
              cx={m.x}
              cy={m.y}
              r="13"
              className="fill-white stroke-sky-600 dark:fill-slate-900 dark:stroke-sky-400"
              strokeWidth="2.5"
            />
            <text
              x={m.x}
              y={m.y + 4.5}
              textAnchor="middle"
              className="fill-sky-700 dark:fill-sky-300"
              fontSize="12"
              fontWeight="900"
            >
              {m.n}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** نمودار ستونی «دلایل جابه‌جایی» — سوال ۲۸-۳۰ */
export function ReasonsMovingChart({
  bars,
  renderGap,
}: {
  bars: { given?: string; q?: number; h: number }[];
  /** رندر ورودی پاسخ زیر ستون‌های سوال‌دار */
  renderGap: (q: number) => ReactNode;
}) {
  const W = 560;
  const H = 235;
  const baseY = 165;
  const n = bars.length;
  // حاشیهٔ چپ برای محور — ستون‌ها از راستِ محور شروع می‌شوند
  const leftPad = 46;
  const slot = (W - leftPad - 14) / n;
  const barW = Math.min(52, slot - 12);

  return (
    <div
      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 overflow-x-auto"
      dir="ltr"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[480px] max-w-xl mx-auto block"
        role="img"
        aria-label="Bar chart — reasons why people change accommodation"
      >
        <text x={W / 2} y="18" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="13" fontWeight="900">
          Reasons why people change accommodation
        </text>
        {/* محورها */}
        <line x1="34" y1={baseY} x2={W - 12} y2={baseY} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" />
        <line x1="34" y1="34" x2="34" y2={baseY} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" />
        <text
          x="25"
          y="100"
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="10"
          fontWeight="700"
          transform="rotate(-90 25 100)"
        >
          % of people
        </text>
        {/* ستون‌ها */}
        {bars.map((b, i) => {
          const x = leftPad + slot * i + (slot - barW) / 2;
          const h = (b.h / 100) * (baseY - 44);
          const y = baseY - h;
          const isQ = b.q !== undefined;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="3"
                className={
                  isQ
                    ? "fill-sky-200 stroke-sky-500 dark:fill-sky-500/30 dark:stroke-sky-400"
                    : "fill-slate-300 dark:fill-slate-700"
                }
                strokeWidth="1.5"
              />
              {b.given && (
                <text
                  x={x + barW / 2}
                  y={baseY + 18}
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300"
                  fontSize="13"
                  fontWeight="900"
                >
                  {b.given}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* ورودی‌های زیر ستون‌های سوال‌دار — در همان ترتیب افقی */}
      <div className="flex max-w-xl mx-auto px-6 mt-1" dir="ltr">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex justify-center">
            {b.q !== undefined ? (
              <div className="w-14">{renderGap(b.q)}</div>
            ) : (
              <span className="text-[9px] text-slate-400 font-bold leading-4 text-center">given</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
