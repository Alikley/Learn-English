"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Save, AlarmClock, CheckCircle2, Send } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsSkill } from "@/types/ielts";

// ========================================
// نوار بالای پلیر آزمون آیلتس (v1.0.3.2 / v1.0.3.3)
// نام آزمون + مهارت + تایمر (شمارش معکوس در حالت آزمون / شمارش در تمرین)
// + نشانگر ذخیرهٔ خودکار + دکمهٔ خروج + دکمهٔ تحویل (v1.0.3.3)
// ========================================

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ExamTopBar({
  title,
  skill,
  mode,
  remainingSec,
  elapsedSec,
  saving,
  onExit,
  onSubmit,
  submitDisabled,
}: {
  title: string;
  skill: IeltsSkill;
  mode: "practice" | "exam";
  /** در حالت آزمون: ثانیهٔ باقی‌مانده — null یعنی تمرین (شمارش رو به جلو) */
  remainingSec: number | null;
  elapsedSec: number;
  saving: boolean;
  onExit: () => void;
  /** دکمهٔ تحویل — اگر داده نشود دکمه‌ای نیست (v1.0.3.3) */
  onSubmit?: () => void;
  submitDisabled?: boolean;
}) {
  const { tr } = useLanguage();
  const isExam = remainingSec !== null;
  // شمارش محلی: در آزمون از باقیمانده به سمت صفر، در تمرین رو به جلو
  const [count, setCount] = useState(isExam ? remainingSec ?? 0 : elapsedSec);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setCount(isExam ? remainingSec ?? 0 : elapsedSec);
  }, [isExam, remainingSec, elapsedSec]);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (isExam ? Math.max(0, c - 1) : c + 1));
    }, 1000);
    return () => clearInterval(id);
    // وابسته به isExam فقط — تایمر یک‌بار راه می‌افتد
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const danger = isExam && count <= 300 && count > 0;

  const skillLabel =
    skill === "reading" ? tr("ریدینگ", "Reading") : skill === "listening" ? tr("لیسنینگ", "Listening") : tr("رایتینگ", "Writing");
  const modeLabel = mode === "exam" ? tr("حالت آزمون", "Exam mode") : tr("حالت تمرین", "Practice mode");

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-3 md:px-5 h-14 flex items-center gap-2 md:gap-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{tr("خروج", "Exit")}</span>
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{title}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {skillLabel} · {modeLabel}
          </p>
        </div>

        {/* ذخیرهٔ خودکار */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          {saving ? (
            <>
              <Save size={12} className="animate-pulse" />
              {tr("در حال ذخیره…", "Saving…")}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-emerald-500" />
              {tr("ذخیره شد", "Saved")}
            </>
          )}
        </div>

        {/* تایمر */}
        <div
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold tabular-nums shrink-0
            ${
              danger
                ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse"
                : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
            }
          `}
        >
          <AlarmClock size={14} />
          {fmt(count)}
        </div>

        {/* تحویل (v1.0.3.3) */}
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={submitDisabled}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shrink-0"
          >
            <Send size={13} />
            <span className="hidden sm:inline">{tr("تحویل", "Submit")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
