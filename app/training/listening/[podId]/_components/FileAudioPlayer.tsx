"use client";

import { Play, Pause, RotateCcw, Headphones } from "lucide-react";

// ========================================
// پلیر فایل صوتی قسمت دیتابیس
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function FileAudioPlayer({
  src,
  audioRef,
  playing,
  time,
  duration,
  onToggle,
  onSeek,
  onRestart,
}: {
  src: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  time: number;
  duration: number;
  onToggle: () => void;
  onSeek: (t: number) => void;
  onRestart: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <audio ref={audioRef} src={src ?? undefined} preload="metadata" />
      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 right-0 h-full bg-linear-to-l from-orange-500 to-amber-400 rounded-full transition-all duration-200"
          style={{
            width: `${duration > 0 ? (time / duration) * 100 : 0}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={time}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{fmt(time)}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={onToggle}
            className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md"
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 -mr-0.5" />
            )}
          </button>
          <div className="w-8 flex justify-center">
            <Headphones className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        <span className="text-xs text-slate-500">{fmt(duration)}</span>
      </div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
