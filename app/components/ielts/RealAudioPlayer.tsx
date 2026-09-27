"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Lock,
  Music4,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// پخش‌کنندهٔ فایل صوتی واقعی لیسنینگ (v1.0.3.3)
// صدای واقعی آزمون از باکت B2 کاربر — مثل تستینو:
//  - کنترل سرعت ۰.۴x تا ۲.۰x (فقط حالت تمرین)
//  - جابه‌جایی روی فایل (فقط حالت تمرین)
//  - حالت آزمون: فقط پخش/توقف — سرعت قفل ۱.۰ و seek خاموش
//  - فهرست قطعه‌ها (Track) با پخش خودکار بعدی
// ========================================

const SPEEDS = [0.4, 0.6, 0.8, 1, 1.25, 1.5, 1.75, 2];

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RealAudioPlayer({
  tracks,
  shared,
  examMode,
  onMissing,
}: {
  /** آدرس‌های پل رسانه‌ای (/api/ielts/media/...) */
  tracks: string[];
  /** true = فایل‌ها بین ۴ تست مشترک‌اند (تقسیم‌بندی خودکار ممکن نبود) */
  shared: boolean;
  examMode: boolean;
  onMissing?: () => void;
}) {
  const { tr } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [endedCount, setEndedCount] = useState(0);

  const current = useMemo(
    () => (tracks.length > 0 ? tracks[Math.min(index, tracks.length - 1)] : null),
    [tracks, index],
  );

  // اعمال سرعت روی المان صوت
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, current, index]);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    void el.play().catch(() => {
      /* مرورگر اجازه نداد */
    });
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      play();
    }
  }, [playing, play]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, tracks.length - 1));
    setEndedCount((c) => c + 1);
  }, [tracks.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  // ---------- حالت بدون فایل صوتی ----------
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center px-6 py-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
        <AlertTriangle size={30} className="text-amber-500" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {tr("فایل صوتی پیدا نشد", "No audio files found")}
        </p>
        <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400 max-w-md">
          {tr(
            "فایل‌های MP3 هر کتاب در باکت cambridge جست‌وجو می‌شوند. اگر تازه آپلود کرده‌ای، از دکمهٔ اسکن مجدد استفاده کن.",
            "MP3 files of each book are discovered from your cambridge bucket. If you just uploaded them, use the rescan button.",
          )}
        </p>
        {onMissing && (
          <button
            onClick={onMissing}
            className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
          >
            {tr("اسکن مجدد باکت", "Rescan bucket")}
          </button>
        )}
      </div>
    );
  }

  // ---------- پلیر ----------
  return (
    <div
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-3"
      dir="ltr"
    >
      {/* فهرست قطعه‌ها */}
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Music4 size={13} className="text-indigo-500" />
          {tr(`فایل صوتی ${index + 1} از ${tracks.length}`, `Track ${index + 1} of ${tracks.length}`)}
        </p>
        {shared && (
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-0.5">
            {tr("مشترک بین ۴ تست", "shared across 4 tests")}
          </span>
        )}
      </div>

      {tracks.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {tracks.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`
                px-2.5 py-1 rounded-lg text-[10px] font-bold transition
                ${
                  i === index
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }
              `}
            >
              {tr(`قطعه ${i + 1}`, `Track ${i + 1}`)}
            </button>
          ))}
        </div>
      )}

      {/* المان صوت */}
      <audio
        ref={audioRef}
        key={current ?? "none"}
        src={current ?? undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={next}
      />

      {/* کنترل‌ها */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-11 h-11 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition active:scale-95"
          title={playing ? tr("توقف", "Pause") : tr("پخش", "Play")}
        >
          {playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            disabled={index === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
            title={tr("قطعهٔ قبلی", "Previous track")}
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={next}
            disabled={index >= tracks.length - 1}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
            title={tr("قطعهٔ بعدی", "Next track")}
          >
            <SkipForward size={15} />
          </button>
        </div>

        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
          {fmt(time)} / {fmt(dur)}
        </span>

        {/* نوار زمان — در حالت آزمون قفل است */}
        {examMode ? (
          <div className="flex-1 flex items-center gap-1.5 text-slate-400">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full transition-all"
                style={{ width: `${dur > 0 ? (time / dur) * 100 : 0}%` }}
              />
            </div>
            <Lock size={11} className="shrink-0" />
          </div>
        ) : (
          <input
            type="range"
            min={0}
            max={dur || 0}
            step={0.5}
            value={time}
            onChange={(e) => {
              const el = audioRef.current;
              const v = Number(e.target.value);
              if (el) el.currentTime = v;
              setTime(v);
            }}
            className="flex-1 accent-indigo-600 min-w-[80px]"
          />
        )}
      </div>

      {/* سرعت — فقط تمرین */}
      <div className="flex items-center gap-2">
        <Gauge size={13} className="text-slate-400 shrink-0" />
        {examMode ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Lock size={10} />
            {tr("سرعت در آزمون واقعی قابل تغییر نیست (۱.۰)", "Speed locked to 1.0 in exam mode")}
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`
                  px-2 py-0.5 rounded-lg text-[10px] font-bold transition
                  ${
                    speed === s
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {examMode && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-5">
          {tr(
            "مثل آزمون واقعی: هر بخش را یک‌بار گوش کن — جابه‌جایی روی فایل و تغییر سرعت در حالت آزمون غیرفعال است. (پخش خودکار قطعهٔ بعد در پایان هر قطعه)",
            "Like the real exam: listen once — seeking and speed control are disabled in exam mode. (The next track plays automatically)",
          )}
          {endedCount > 0 && (
            <span className="text-slate-400"> · {tr(`پایان‌یافته: ${endedCount}`, `ended: ${endedCount}`)}</span>
          )}
        </p>
      )}
    </div>
  );
}
