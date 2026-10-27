"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// خطای ساخت برگهٔ امتحانی (v1.0.8.5 / English 1.0.2.4)
//
// 🎯 خواستهٔ کاربر (۱.۰.2.4): وقتی برگه ساخته نمی‌شود، در همهٔ
//    تست‌ها و آزمون‌ها PDF کتاب دیگر نمایش داده نشود — فقط
//    یک کادر در بالای صفحه با دکمهٔ «تلاش دوباره». همین.
//    (قبلاً: هشدار + PDF کامل کتاب + ورودی سریع پاسخ‌ها)
// ========================================

export default function PaperFallback({
  title,
  skillLabel,
  exitHref,
  failReason,
  aiError,
  onRetry,
}: {
  title: string;
  skillLabel: string;
  exitHref: string;
  /** دلیل ساخت‌نشدن برگه (پارسر یا شبکه) */
  failReason: string | null;
  /** خطای اختصاصی ساخت هوشمند */
  aiError?: string;
  onRetry: () => void;
}) {
  const { tr, dir } = useLanguage();
  const reason = aiError ?? failReason;

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* تنها کادر — خطا + تلاش دوباره (بدون PDF کتاب) */}
          <div className="rounded-3xl border border-red-200 dark:border-red-500/25 bg-red-50/80 dark:bg-red-500/10 p-5 md:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-black text-red-700 dark:text-red-300">
                  {tr("برگهٔ امتحانی درست نشد", "The exam paper could not be created")}
                </p>
                {reason && (
                  <p
                    className="text-[11px] leading-6 text-red-600/80 dark:text-red-400/70 break-words"
                    dir="auto"
                  >
                    {reason}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition active:scale-[0.99]"
            >
              <RefreshCw size={15} />
              {tr("تلاش دوباره", "Try again")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
