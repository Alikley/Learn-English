"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

// ========================================
// پلیر فایل صوتی تمرین شنیداری
// (از صفحهٔ [episodeId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
    setPlaying(!playing);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrent(audio.currentTime);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrent(0);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      {/* پروگرس بار */}
      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 right-0 h-full bg-linear-to-l from-orange-500 to-amber-400 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {/* کنترل‌ها */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{fmt(currentTime)}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={restart}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={toggle}
            className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md"
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 -mr-0.5" />
            )}
          </button>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Volume2 className="h-4 w-4" />
          </div>
        </div>
        <span className="text-xs text-slate-500">{fmt(duration)}</span>
      </div>
    </div>
  );
}
