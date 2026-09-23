"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { RotateCcw, Sparkles, Library } from "lucide-react";
import Link from "next/link";

// ========================================
// کارت پایان کتاب — جشن + خواندن دوباره + بازگشت به کتابخانه
// (از صفحهٔ ریدر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function FinishedView({
  bookTitleFa,
  totalPages,
  onReplay,
}: {
  bookTitleFa: string;
  totalPages: number;
  onReplay: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <>
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", delay: 0.15 }}
        className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5"
      >
        <Sparkles className="h-10 w-10 text-emerald-500" />
      </motion.div>
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
        {tr("آفرین! کتاب را تمام کردی 🎉", "Well done! You finished the book 🎉")}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-2">
        {tr(
          `«${bookTitleFa}» را در ${totalPages} برگه خواندی.`,
          `You read "${bookTitleFa}" in ${totalPages} pages.`
        )}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 leading-6 mb-8 max-w-sm">
        {tr(`کلمه‌های ناآشنا را با هاور به جعبه لغات اضافه کردی؟ در
        لغت‌نامه می‌توانی آن‌ها را مرور کنی.`, "Added unfamiliar words to your Word Box? Review them in the Vocabulary page.")}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReplay}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          {tr("خواندن دوباره", "Read Again")}
        </button>
        <Link
          href="/library"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 rounded-xl text-sm font-bold border border-amber-200/60 dark:border-slate-700 transition-colors"
        >
          <Library className="h-4 w-4" />
          {tr("کتابخانه", "Library")}
        </Link>
      </div>
    </>
  );
}
