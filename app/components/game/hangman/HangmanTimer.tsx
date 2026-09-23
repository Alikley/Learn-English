"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";
import { Hourglass } from "lucide-react";

// ========================================
// نوار تایمر هنگ‌من — v1.0.0.6 (گام ۲)
// زمان هر حدس بر اساس سطح: آسان ۵ / متوسط ۷ / سخت ۱۰ ثانیه.
// اگر زمان تمام شود و کاربر حرفی حدس نزند،
// یک تکه از هنگ‌من تکمیل می‌شود و تایمر دوباره پر می‌شود.
// رنگ از سبز → نارنجی → قرمز؛ زیر ۲ ثانیه پالس و لرزش.
// ========================================

export default function HangmanTimer({
  timeLeftMs,
  totalMs,
  levelSeconds,
  frozen = false,
}: {
  timeLeftMs: number;
  totalMs: number;
  // ثانیه‌های هر سطح — برای متن راهنما
  levelSeconds: number;
  // وقتی نتیجه کلمه نمایش داده می‌شود، تایمر ثابت می‌ماند
  frozen?: boolean;
}) {
  const { tr } = useLanguage();

  const pct = Math.max(0, Math.min(100, (timeLeftMs / totalMs) * 100));
  const seconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const low = seconds <= 2 && !frozen;

  const barColor =
    pct > 50
      ? "bg-linear-to-l from-emerald-400 to-teal-500"
      : pct > 25
        ? "bg-linear-to-l from-amber-400 to-orange-500"
        : "bg-linear-to-l from-red-400 to-rose-600";

  const numColor =
    pct > 50
      ? "text-emerald-600"
      : pct > 25
        ? "text-amber-600"
        : "text-red-500";

  return (
    <div className={`px-4 md:px-6 ${frozen ? "opacity-40" : ""}`}>
      {/* برچسب راهنما + عدد ثانیه */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-slate-400 font-medium">
          {levelSeconds} {tr("ثانیه برای هر حدس — تمام شود، یک تکه اضافه می‌شود!", "seconds per guess — when it runs out, a piece is added!")}
        </span>
        <motion.span
          key={seconds}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className={`text-sm font-extrabold tabular-nums ${numColor} ${low ? "animate-pulse" : ""}`}
          dir="ltr"
        >
          {seconds}
        </motion.span>
      </div>

      {/* نوار زمان */}
      <div className="flex items-center gap-2.5">
        {/* آیکون ساعت شنی — در ثانیه‌های آخر می‌لرزد */}
        <motion.div
          animate={low ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
          transition={low ? { repeat: Infinity, duration: 0.7 } : {}}
          className={`shrink-0 ${low ? "text-red-500" : "text-slate-400"}`}
        >
          <Hourglass className="w-4.5 h-4.5" />
        </motion.div>

        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.12, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
