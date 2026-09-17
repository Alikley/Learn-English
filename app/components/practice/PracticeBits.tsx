"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";

// اجزای مشترک بخش تمرین‌ها — نسخه ۱.۰.۱.۴

/** نمایش ستاره‌های ۱ تا ۳ */
export function Stars({
  count,
  size = "sm",
}: {
  count: number;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`${dim} ${
            s <= count
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/** حلقه امتیاز ۰ تا ۱۰۰ */
export function ScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;

  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold">از ۱۰۰</span>
      </div>
    </div>
  );
}

/** نوار پیشرفت کوچک با درصد */
export function ProgressBar({
  value,
  total,
  color = "bg-blue-500",
}: {
  value: number;
  total: number;
  color?: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-500">
          {value} از {total}
        </span>
        <span className="text-xs font-bold text-slate-400">{percent}٪</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
