"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Database } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحهٔ «در حال آماده‌سازی امتحان» (v1.0.6.1 / English 1.0.2.4)
//
// 🎯 خواستهٔ کاربر: در حالت ساخت با هوش مصنوعی —
//    «فقط توضیح باکس سبز باشه و اینکه درصد هم باشه که
//     چند درصدش آماده شده و بالاش بنویسه در حال اماده سازی امتحان»
//
// چیدمان (خلاصه‌شده):
//    ۱) عنوان «در حال آماده‌سازی امتحان»
//    ۲) درصد پیشرفت (عدد بزرگ + نوار درصدی)
//    ۳) فقط باکس سبز (توضیح یک‌بار بودن ساخت)
//    — بدون هیچ توضیح/مرحلهٔ دیگر
//
// درصد = ترکیب پیشرفتِ واقعی از سرور (progress) با تخمین
// زمانیِ نرم کلاینت — همیشه صعودی، تا سقف ۹۵٪ تا وقتی
// برگه واقعاً آماده شود (آماده‌شدن = نمایش خود برگه).
// (از [skill]/page.tsx جدا شد — v1.0.0.3)
// ========================================

/** تبدیل رقم لاتین به فارسی برای نمایش درصد در حالت فارسی */
function toFaDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export default function AiBuildingScreen({
  title,
  skillLabel,
  exitHref,
  progress,
  generatingSince,
}: {
  title: string;
  skillLabel: string;
  exitHref: string;
  /** آخرین درصد واقعی از سرور — null = هنوز چیزی ثبت نشده */
  progress: { pct: number; at: number } | null;
  /** شروع چرخهٔ ساخت از دید کلاینت (ms) — برای تخمین زمانی */
  generatingSince: number | null;
}) {
  const { tr, dir, lang } = useLanguage();

  // تیک ۵۰۰ms برای روان بودن نوار درصد
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // ---- محاسبهٔ درصد نمایشی ----
  // تخمین زمانی: منحنی نرم که در ~۲ دقیقه به ~۹۳٪ می‌رسد و
  // هرگز از ۹۵٪ عبور نمی‌کند (۱۰۰٪ یعنی برگه واقعاً آماده است)
  const elapsedMs = generatingSince ? Math.max(0, now - generatingSince) : 0;
  const timePct = Math.min(95, 100 * (1 - Math.exp(-elapsedMs / 70_000)));
  const serverPct = progress?.pct ?? 0;
  const pct = Math.min(95, Math.max(2, Math.round(Math.max(timePct, serverPct))));
  const pctLabel = lang === "fa" ? `${toFaDigits(pct)}٪` : `${pct}%`;

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
          {/* عنوان — «در حال آماده‌سازی امتحان» */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"
            >
              <Brain size={28} />
            </motion.div>
            <p className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100">
              {tr("در حال آماده‌سازی امتحان", "Preparing your exam")}
            </p>
          </div>

          {/* درصد پیشرفت — عدد بزرگ + نوار درصدی */}
          <div className="space-y-2.5">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {tr("درصد آماده شدن برگه", "Paper readiness")}
              </p>
              <motion.p
                key={pct}
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                className="text-3xl md:text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400"
                dir="ltr"
              >
                {pctLabel}
              </motion.p>
            </div>
            <div
              className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={tr("درصد آماده شدن برگه", "Paper readiness")}
            >
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* باکس سبز — تنها توضیح این صفحه */}
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
