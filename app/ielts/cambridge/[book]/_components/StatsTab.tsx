"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { SKILLS } from "./skill-meta";

// ========================================
// تب آمار کتاب (v1.0.4.2)
// دو کارت جمعی + نوار بهترین بند هر مهارت
// (از [book]/page.tsx جدا شد)
// ========================================

export interface SkillStatRow {
  skill: string;
  label: string;
  attempts: number;
  best: number | null;
  avg: number | null;
}

export default function StatsTab({
  stats,
  totalAttempts,
  submittedCount,
}: {
  stats: SkillStatRow[];
  totalAttempts: number;
  submittedCount: number;
}) {
  const { tr } = useLanguage();

  const barColor = (skill: string) =>
    skill === "reading"
      ? "bg-indigo-500"
      : skill === "listening"
        ? "bg-sky-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-4">
      {/* کارت‌های جمعی */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100" dir="ltr">
            {totalAttempts}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{tr("کل تلاش‌ها", "Total attempts")}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100" dir="ltr">
            {submittedCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{tr("تحویل‌شده", "Submitted")}</p>
        </div>
      </div>

      {/* نوار بهترین بند هر مهارت */}
      {stats.map((s) => (
        <div
          key={s.skill}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.label}</p>
            <p className="text-[10px] text-slate-400">
              {tr(`${s.attempts} تلاش`, `${s.attempts} attempts`)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(s.skill)}`}
                style={{ width: `${((s.best ?? 0) / 9) * 100}%` }}
              />
            </div>
            <span
              className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums"
              dir="ltr"
            >
              {s.best != null ? `best ${s.best}` : "—"}
            </span>
            {s.avg != null && (
              <span className="text-[10px] text-slate-400 tabular-nums" dir="ltr">
                avg {s.avg}
              </span>
            )}
          </div>
        </div>
      ))}

      {totalAttempts === 0 && (
        <p className="text-center text-xs text-slate-400 py-8">
          {tr(
            "هنوز آزمونی از این کتاب نداده‌ای — از تب آزمون شروع کن!",
            "You haven't taken any test from this book yet — start from the Test tab!",
          )}
        </p>
      )}
    </div>
  );
}

/** برچسب فارسی/انگلیسی یک مهارت (برای مصرف‌کننده‌ها) */
export function skillLabelOf(skill: string, tr: (fa: string, en: string) => string): string {
  const s = SKILLS.find((x) => x.key === skill);
  return s ? tr(s.fa, s.en) : skill;
}
