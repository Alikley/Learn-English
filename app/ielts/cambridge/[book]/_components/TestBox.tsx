"use client";

import { useState } from "react";
import {
  Loader2,
  Award,
  PlayCircle,
  CheckCircle2,
  Circle,
  Hourglass,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { SKILLS, skillStatus, type SkillStatus } from "./skill-meta";
import type { IeltsAttemptSummary, IeltsMode, IeltsSkill } from "@/types/ielts";

// ========================================
// یک کارت تست — «باکس به باکس» با ۳ ردیف مهارت (v1.0.4.2)
// انتخاب حالت (تمرین/آزمون) + شروع + «آزمون کامل»
// (از [book]/page.tsx جدا شد)
// ========================================

export default function TestBox({
  testId,
  slug,
  index,
  attempts,
  starting,
  onBegin,
}: {
  testId: number;
  slug: string;
  index: number;
  attempts: IeltsAttemptSummary[];
  /** کلید دکمهٔ والد در حال اجرا */
  starting: string | null;
  onBegin: (testId: number, skill: IeltsSkill, mode: IeltsMode, full?: boolean) => Promise<void>;
}) {
  const { tr } = useLanguage();
  const [mode, setMode] = useState<IeltsMode>("exam");
  const [busy, setBusy] = useState<string | null>(null);

  const statusFor = (skill: string): SkillStatus => skillStatus(attempts, testId, skill);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      {/* سربرگ تست */}
      <div className="relative bg-gradient-to-l from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 px-4 py-3.5 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <PlayCircle size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black" dir="ltr">
            Test {testId}
          </h3>
          <p className="text-[9px] text-white/75 font-mono" dir="ltr">
            {slug}
          </p>
        </div>
        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/15 border border-white/25">
          {tr("آکادمیک", "Academic")}
        </span>
      </div>

      {/* ردیف‌های مهارت */}
      <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
        {SKILLS.map((s) => {
          const st = statusFor(s.key);
          const Icon = s.icon;
          const key = `${testId}-${s.key}-${mode}`;
          const isBusy = busy === key || starting?.startsWith(`${testId}-${s.key}-`);
          return (
            <div key={s.key} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                  s.color === "indigo"
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                    : s.color === "sky"
                      ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300"
                      : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                }`}
              >
                <Icon size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {tr(s.fa, s.en)}
                  <span className="text-[9px] text-slate-400 font-medium ms-1.5" dir="ltr">
                    {s.key === "writing"
                      ? "2 tasks · 60′"
                      : "40 Q · " + (s.key === "reading" ? "60′" : "30′")}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {st.state === "none" ? (
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Circle size={9} />
                      {tr("شروع‌نشده", "not started")}
                    </span>
                  ) : st.state === "progress" ? (
                    <span className="text-[9px] text-sky-500 font-bold flex items-center gap-1">
                      <Hourglass size={9} />
                      {tr("در جریان", "in progress")}
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={9} />
                      {tr("تکمیل", "completed")}
                      {st.best != null && (
                        <span className="text-amber-500 flex items-center gap-0.5" dir="ltr">
                          <Award size={9} /> {st.best}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setBusy(key);
                  void onBegin(testId, s.key, mode).finally(() => setBusy(null));
                }}
                disabled={isBusy}
                className={`
                  shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-bold transition
                  ${
                    mode === "exam"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                  disabled:opacity-60
                `}
              >
                {isBusy ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : mode === "exam" ? (
                  tr("شروع آزمون", "Start exam")
                ) : (
                  tr("شروع تمرین", "Start practice")
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* پاورقی: انتخاب حالت + آزمون کامل */}
      <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {(["practice", "exam"] as IeltsMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                mode === m
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {m === "practice" ? tr("تمرین", "Practice") : tr("آزمون", "Exam")}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setBusy(`${testId}-full`);
            void onBegin(testId, "listening", mode, true).finally(() => setBusy(null));
          }}
          disabled={busy === `${testId}-full`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-60"
        >
          {busy === `${testId}-full` ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Zap size={12} />
          )}
          {tr("آزمون کامل (۳ مهارت پشت‌سرهم)", "Full test (3 skills in a row)")}
        </button>
      </div>
    </motion.div>
  );
}
