"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// کارت «در حال ساخت برگه از PDF» (v1.0.4.2)
// اسکلت + نوار متحرک — وقتی برگه هنوز بارگذاری/ساخت می‌شود
// (از [skill]/page.tsx جدا شد)
// ========================================

export default function PaperLoadingCard() {
  const { tr } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="animate-pulse" />
        </span>
        <div className="space-y-1.5 flex-1">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200">
            {tr(
              "در حال خواندن PDF و ساخت برگهٔ امتحان…",
              "Reading the PDF and building your exam paper…",
            )}
          </p>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full w-1/3 rounded-full bg-indigo-400"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2 pt-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-2.5 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-2.5 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
