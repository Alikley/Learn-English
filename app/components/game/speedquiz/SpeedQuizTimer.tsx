"use client";

import { motion } from "motion/react";
import { TimerReset } from "lucide-react";

// ========================================
// نوار تایمر کوییز سرعتی — با هر ثانیه کم می‌شود
// رنگ از سبز → نارنجی → قرمز تغییر می‌کند؛
// زیر ۳ ثانیه پالس می‌زند تا حس فوریت منتقل شود.
// (سختی سطح از کلمات می‌آید — زمان برای همه یکسان است)
// ========================================

export default function SpeedQuizTimer({
  timeLeftMs,
  totalMs,
  frozen = false,
}: {
  timeLeftMs: number;
  totalMs: number;
  // وقتی نتیجه سوال نمایش داده می‌شود، تایمر ثابت می‌ماند
  frozen?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (timeLeftMs / totalMs) * 100));
  const seconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const low = seconds <= 3 && !frozen;

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
    <div className={`flex items-center gap-3 px-4 md:px-6 pt-3 ${frozen ? "opacity-40" : ""}`}>
      {/* آیکون ساعت — در ثانیه‌های آخر می‌لرزد */}
      <motion.div
        animate={low ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
        transition={low ? { repeat: Infinity, duration: 0.7 } : {}}
        className={`shrink-0 ${low ? "text-red-500" : "text-slate-400"}`}
      >
        <TimerReset className="w-5 h-5" />
      </motion.div>

      {/* نوار زمان */}
      <div className="flex-1 h-2.5 md:h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.12, ease: "linear" }}
        />
      </div>

      {/* عدد ثانیه */}
      <motion.span
        key={seconds}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className={`shrink-0 w-9 text-center text-sm font-extrabold tabular-nums ${numColor}`}
        dir="ltr"
      >
        {seconds}
      </motion.span>
    </div>
  );
}
