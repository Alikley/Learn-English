"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Play, Pause, Gauge, Headphones, CheckCircle2 } from "lucide-react";

// ========================================
// پخش‌کنندهٔ داستان شنیداری: دکمهٔ پخش + نوار پیشرفت + سرعت
// (از ListeningView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export const LISTENING_SPEEDS = [0.75, 1, 1.25];

export function fmtTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ListeningPlayerCard({
  playing,
  listened,
  fallbackMode,
  hasTiming,
  time,
  total,
  progressPct,
  speed,
  onTogglePlay,
  onChangeSpeed,
}: {
  playing: boolean;
  listened: boolean;
  fallbackMode: boolean;
  hasTiming: boolean;
  time: number;
  total: number;
  progressPct: number;
  speed: number;
  onTogglePlay: () => void;
  onChangeSpeed: (s: number) => void;
}) {
  const { tr } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-l from-orange-50 to-white border border-orange-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onTogglePlay}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 transition-colors ${
            playing
              ? "bg-gradient-to-br from-orange-500 to-amber-500"
              : "bg-gradient-to-br from-orange-500 to-red-500"
          }`}
        >
          {playing ? (
            <Pause size={26} />
          ) : (
            <motion.span
              animate={
                !playing && !listened
                  ? { scale: [1, 1.08, 1] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              <Play size={26} className="mr-1" />
            </motion.span>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-orange-700">
              <Headphones size={14} />
              {fallbackMode && !hasTiming
                ? tr("روایت داستان", "Story Narration")
                : tr("داستان صوتی ۵ دقیقه‌ای", "5-minute audio story")}
            </span>
            <span dir="ltr" className="font-mono">
              {fmtTime(time)} / {fmtTime(total)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-orange-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-orange-500 to-amber-400"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* سرعت */}
        <div className="flex items-center gap-1 shrink-0">
          <Gauge size={14} className="text-orange-400" />
          {LISTENING_SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                speed === s
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-400 hover:bg-orange-100"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {listened && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 text-xs text-green-600 font-bold mt-3"
        >
          <CheckCircle2 size={14} />
          {tr("داستان کامل شنیده شد — عالی! حالا آزمونک درک مطلب", "Full story heard — great! Now the comprehension quiz")}
        </motion.p>
      )}
    </motion.div>
  );
}
