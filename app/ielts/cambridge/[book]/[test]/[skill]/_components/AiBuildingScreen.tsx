"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Brain, Database } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحهٔ «در حال آماده‌سازی امتحان» (v1.0.8.5 / English 1.0.2.4)
//
// 🎯 خواستهٔ کاربر (۱.۰.2.4): در حالت ساخت با هوش مصنوعی، در
//    همهٔ کتاب‌ها و تست‌ها فقط همین صفحه باشد:
//    ۱) عنوان بالا: «در حال آماده‌سازی امتحان»
//    ۲) درصدِ آماده‌شدن برگه (نوار + عدد)
//    ۳) فقط توضیحِ باکس سبز — هیچ توضیح دیگری نه
//    (قبلاً: ۵ ردیف توضیح مراحل + متن زیر عنوان + نوار بی‌درصد)
//
// درصد بر اساس زمان سپری‌شده تخمین زده می‌شود و روی ۹۵٪
// می‌ایستد تا پاسخ نهایی poll (آماده/خطا) برسد — سرور
// مرحله‌به‌مرحله درصد واقعی نمی‌فرستد.
// ========================================

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

function toFaDigits(value: string): string {
  return value.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export default function AiBuildingScreen({
  title,
  skillLabel,
  exitHref,
}: {
  title: string;
  skillLabel: string;
  exitHref: string;
}) {
  const { tr, dir, lang } = useLanguage();

  // درصدِ تخمینی — از لحظهٔ ورود به این صفحه شروع می‌شود
  const startRef = useRef(Date.now());
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsedSec = (Date.now() - startRef.current) / 1000;
      // منحنی نرم: تند شروع، آرام ادامه — سقف ۹۵٪ تا پایان واقعی
      const p = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsedSec / 75))));
      setPercent(p);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const percentText = lang === "en" ? `${percent}%` : `${toFaDigits(String(percent))}٪`;

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
          {/* عنوان بالا — در حال آماده‌سازی امتحان */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"
            >
              <Brain size={28} />
            </motion.div>
            <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100">
              {tr("در حال آماده‌سازی امتحان", "Preparing your exam")}
            </p>
          </div>

          {/* درصدِ آماده‌شدن برگه */}
          <div className="space-y-2.5">
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-center text-sm font-black text-amber-600 dark:text-amber-400">
              {tr(`${percentText} از برگه آماده شده`, `${percentText} of the paper is ready`)}
            </p>
          </div>

          {/* تنها توضیح — باکس سبز */}
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
