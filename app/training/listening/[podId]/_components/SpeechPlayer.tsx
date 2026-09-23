"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { Play, Pause, RotateCcw, Square, Volume2, Gauge } from "lucide-react";

// ========================================
// پلیر پادکست با تلفظ مرورگر (Tom pitch 0.8 / Lena 1.15)
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export const PODCAST_SPEEDS = [0.75, 1, 1.25];

export default function SpeechPlayer({
  playing,
  currentLine,
  totalLines,
  speed,
  onToggle,
  onStop,
  onRestart,
  onSpeed,
}: {
  playing: boolean;
  currentLine: number;
  totalLines: number;
  speed: number;
  onToggle: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSpeed: (s: number) => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">
              {tr("پخش با تلفظ مرورگر", "Play with browser speech")}
            </p>
            <p className="text-[10px] text-slate-400">
              {tr("دو مجری: Tom و Lena — خطِ در حال پخش هایلایت می‌شود", "Two hosts: Tom and Lena — the playing line is highlighted")}
            </p>
          </div>
        </div>
        {/* سرعت */}
        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
          <Gauge className="w-3.5 h-3.5 text-slate-400 mx-1" />
          {PODCAST_SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                speed === s
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s === 1 ? tr("۱×", "1×") : `${s}×`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={onStop}
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
          title={tr("توقف", "Stop")}
        >
          <Square className="h-4 w-4 text-slate-500" />
        </button>
        <button
          onClick={onToggle}
          className="p-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md"
          title={playing ? tr("توقف موقت", "Pause") : tr("پخش", "Play")}
        >
          {playing ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 -mr-0.5" />
          )}
        </button>
        <button
          onClick={onRestart}
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
          title={tr("از اول", "Start Over")}
        >
          <RotateCcw className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-3">
        {playing
          ? tr(`در حال پخش خط ${currentLine + 1} از ${totalLines}`, `Playing line ${currentLine + 1} of ${totalLines}`)
          : tr(`برای شنیدن دوباره یک خط، روی آن کلیک کن`, `Click a line to hear it again`)}
      </p>
    </div>
  );
}
