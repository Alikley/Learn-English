"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// بار چارت بند مهارت‌ها — تب آمار کتاب (v1.0.3.4)
// نمودار ستونی «بهترین / میانگین» برای هر سه مهارت با
// محور ۰ تا ۹ (بند آیلتس)، خطوط راهنما و برچسب مقادیر.
// خالص CSS/Flex + انیمیشن motion — بدون کتابخانهٔ چارت.
// ========================================

export type SkillStat = {
  skill: "reading" | "listening" | "writing";
  label: string;
  attempts: number;
  best: number | null;
  avg: number | null;
};

const COLORS: Record<SkillStat["skill"], { bar: string; barSoft: string; text: string }> = {
  listening: { bar: "bg-sky-500", barSoft: "bg-sky-500/40", text: "text-sky-600 dark:text-sky-400" },
  reading: { bar: "bg-indigo-500", barSoft: "bg-indigo-500/40", text: "text-indigo-600 dark:text-indigo-400" },
  writing: { bar: "bg-emerald-500", barSoft: "bg-emerald-500/40", text: "text-emerald-600 dark:text-emerald-400" },
};

const MAX_BAND = 9;
const GRID_LINES = [0, 3, 6, 9];
const CHART_H = "h-48"; // ارتفاع ناحیهٔ نمودار

function fmtBand(v: number | null): string {
  if (v == null) return "—";
  // نمایش تمیز: ۷.۵ → 7.5 و ۷ → 7
  return Number.isInteger(v) ? String(v) : String(v).replace(/\.0$/, "");
}

export default function StatsBarChart({ stats }: { stats: SkillStat[] }) {
  const { tr } = useLanguage();

  const hasAny = stats.some((s) => s.best != null || s.avg != null);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-4">
      {/* سربرگ + راهنما */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
          <BarChart3 size={15} className="text-indigo-500" />
          {tr("نمودار بند مهارت‌ها", "Band score by skill")}
        </p>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 dark:bg-slate-300" />
            {tr("بهترین", "Best")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400/50 dark:bg-slate-400/40" />
            {tr("میانگین", "Average")}
          </span>
        </div>
      </div>

      {!hasAny ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <TrendingUp size={26} className="text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-400">
            {tr(
              "هنوز نمره‌ای ثبت نشده — بعد از اولین آزمون، نمودار همین‌جا ظاهر می‌شود.",
              "No scores yet — after your first test, the chart appears right here.",
            )}
          </p>
        </div>
      ) : (
        <div className="flex gap-2" dir="ltr">
          {/* محور عمودی */}
          <div className={`relative w-6 ${CHART_H} shrink-0`}>
            {GRID_LINES.map((v) => (
              <span
                key={v}
                className="absolute right-1 -translate-y-1/2 text-[9px] font-bold text-slate-300 dark:text-slate-600 tabular-nums"
                style={{ bottom: `${(v / MAX_BAND) * 100}%` }}
              >
                {v}
              </span>
            ))}
          </div>

          {/* ناحیهٔ نمودار */}
          <div className={`relative flex-1 ${CHART_H}`}>
            {/* خطوط راهنما */}
            {GRID_LINES.map((v) => (
              <div
                key={v}
                className={`absolute left-0 right-0 ${
                  v === 0 ? "border-t border-slate-200 dark:border-slate-700" : "border-t border-dashed border-slate-100 dark:border-slate-800"
                }`}
                style={{ bottom: `${(v / MAX_BAND) * 100}%` }}
              />
            ))}

            {/* ستون‌ها */}
            <div className="absolute inset-0 flex items-end justify-around gap-2 pb-0">
              {stats.map((s, gi) => {
                const c = COLORS[s.skill];
                return (
                  <div key={s.skill} className="flex-1 h-full flex items-end justify-center gap-1.5">
                    {/* بهترین — ناحیهٔ لیبل ۱۵٪ + ناحیهٔ ستون ۸۵٪ */}
                    <div className="flex flex-col items-center h-full w-full max-w-[44px]">
                      <div className="h-[15%] flex items-end pb-0.5">
                        {s.best != null ? (
                          <span className={`text-[11px] font-black tabular-nums leading-none ${c.text}`}>
                            {fmtBand(s.best)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 leading-none">—</span>
                        )}
                      </div>
                      <div className="h-[85%] w-full flex items-end">
                        {s.best != null && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min(s.best / MAX_BAND, 1) * 100}%` }}
                            transition={{ duration: 0.5, delay: gi * 0.12, ease: "easeOut" }}
                            className={`w-full rounded-t-lg ${c.bar}`}
                          />
                        )}
                      </div>
                    </div>
                    {/* میانگین */}
                    <div className="flex flex-col items-center h-full w-full max-w-[44px]">
                      <div className="h-[15%] flex items-end pb-0.5">
                        {s.avg != null ? (
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums leading-none">
                            {fmtBand(s.avg)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 leading-none">—</span>
                        )}
                      </div>
                      <div className="h-[85%] w-full flex items-end">
                        {s.avg != null && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min(s.avg / MAX_BAND, 1) * 100}%` }}
                            transition={{ duration: 0.5, delay: gi * 0.12 + 0.08, ease: "easeOut" }}
                            className={`w-full rounded-t-lg ${c.barSoft}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* برچسب مهارت‌ها زیر نمودار */}
      {hasAny && (
        <div className="flex gap-2" dir="ltr">
          <span className="w-6 shrink-0" />
          <div className="flex-1 flex justify-around gap-2">
            {stats.map((s) => (
              <div key={s.skill} className="flex-1 text-center">
                <p className={`text-[11px] font-bold ${COLORS[s.skill].text}`}>{s.label}</p>
                <p className="text-[9px] text-slate-400">
                  {tr(`${s.attempts} تلاش`, `${s.attempts} attempts`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
