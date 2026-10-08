"use client";

import Link from "next/link";
import { BookOpen, FileText, Brain, Database, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحهٔ «ساخت برگه با هوش مصنوعی» (v1.0.4.0 → تفکیک در 1.0.0.3)
// اولین بازدید هر آزمون: PDF خوانده می‌شود، سوال‌ها و پاسخ‌نامهٔ
// رسمی با AI به برگهٔ امتحانی تبدیل می‌شوند و برای همیشه ذخیره
// می‌گردند — بازدیدهای بعدی فوری‌اند.
// (از [skill]/page.tsx جدا شد)
// ========================================

const STEPS = [
  {
    icon: BookOpen,
    fa: "خواندن PDF کتاب از Backblaze",
    en: "Reading the book PDF from Backblaze",
  },
  {
    icon: FileText,
    fa: "استخراج متن این تست از کتاب",
    en: "Extracting this test's text",
  },
  {
    icon: Brain,
    fa: "ساخت سوال‌ها و گزینه‌ها با هوش مصنوعی",
    en: "Building questions with AI",
  },
  {
    icon: KeyRound,
    fa: "استخراج پاسخ‌نامهٔ رسمی برای تصحیح خودکار",
    en: "Extracting the official answer key",
  },
  {
    icon: Database,
    fa: "ذخیرهٔ دائمی برگه برای بازدیدهای بعدی",
    en: "Saving the paper for future visits",
  },
];

export default function AiBuildingScreen({
  title,
  skillLabel,
  exitHref,
}: {
  title: string;
  skillLabel: string;
  exitHref: string;
}) {
  const { tr, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      {/* هدر باریک */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate" dir="ltr">
            {title} · {skillLabel}
          </p>
          <Link
            href={exitHref}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {tr("بازگشت", "Back")}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 space-y-6"
        >
          {/* آیکون + عنوان */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"
            >
              <Brain size={28} />
            </motion.div>
            <div className="space-y-1">
              <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100">
                {tr(
                  "در حال ساخت برگهٔ امتحان با هوش مصنوعی",
                  "Building your exam paper with AI",
                )}
              </p>
              <p className="text-[11px] md:text-xs leading-6 text-slate-500 dark:text-slate-400">
                {tr(
                  "سوال‌های واقعی همین تست از PDF کتاب خوانده و به برگهٔ امتحانی تعاملی تبدیل می‌شوند.",
                  "The real questions of this test are read from the book PDF and turned into an interactive exam paper.",
                )}
              </p>
            </div>
          </div>

          {/* نوار پیشرفت متحرک */}
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-l from-amber-400 to-orange-500"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            />
          </div>

          {/* مراحل */}
          <div className="space-y-2.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 px-3.5 py-2.5"
                >
                  <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={15} />
                  </span>
                  <p className="flex-1 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                    {tr(s.fa, s.en)}
                  </p>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 * i }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* نکتهٔ صرفه‌جویی توکن */}
          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3 flex items-start gap-2.5">
            <Database size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-6 text-emerald-700 dark:text-emerald-300">
              {tr(
                "این کار فقط «یک بار» برای این آزمون انجام می‌شود و نتیجه برای همیشه ذخیره می‌گردد — دفعه‌های بعدی این برگه فوری آماده خواهد بود (حدود ۱ تا ۳ دقیقه طول می‌کشد؛ این صفحه را باز نگه دار).",
                "This happens only ONCE for this exam and the result is saved forever — next visits load instantly (it takes about 1–3 minutes; keep this page open).",
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
