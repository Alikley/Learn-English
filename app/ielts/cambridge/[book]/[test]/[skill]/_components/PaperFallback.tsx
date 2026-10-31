"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// حالت شکست ساخت برگه (v1.0.6.1 / English 1.0.2.4)
//
// 🎯 خواستهٔ کاربر: وقتی خطا می‌آید و برگه ساخته نمی‌شود —
//    «نمیخوام پی دی اف مربوط رو نشون بده فقط یه کادر بالای
//     باشه تلاش دوباره بیاد» — برای همهٔ تست‌ها و آزمون‌ها
//
// این کامپوننت اکنون «فقط یک کادر بالای صفحه» است:
//    ۱) پیام کوتاه شکست (دلیل اگر بود)
//    ۲) دکمهٔ «تلاش دوباره» — ساخت دوبارهٔ برگه با AI
//    — خود PDF و ورودی سریع پاسخ‌ها حذف شدند
// (از [skill]/page.tsx جدا شد — v1.0.4.2؛ بازطراحی 1.0.2.4)
// ========================================

export default function PaperFallback({
  failReason,
  aiError,
  onRetry,
}: {
  /** دلیل ساخت‌نشدن برگه (پارسر یا AI) */
  failReason: string | null;
  /** خطای اختصاصی ساخت هوشمند */
  aiError?: string;
  /** تلاش دوباره — ساخت دوبارهٔ برگه با هوش مصنوعی */
  onRetry: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/10 p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertCircle size={17} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-black text-amber-700 dark:text-amber-300">
            {tr("برگهٔ امتحان ساخته نشد", "The exam paper could not be built")}
          </p>
          {(failReason ?? aiError) && (
            <p className="text-[10px] leading-5 text-amber-600/90 dark:text-amber-400/80" dir="auto">
              {aiError ?? failReason ?? tr("ساختار فایل شناخته نشد", "File structure not recognized")}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition active:scale-[0.99]"
      >
        <RefreshCw size={15} />
        {tr("تلاش دوباره", "Try again")}
      </button>
    </div>
  );
}
