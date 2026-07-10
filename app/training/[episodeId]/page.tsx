"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getListeningLevel,
  ListeningEpisode,
  ListeningGap,
} from "@/types/listening";

/* ========== کامپوننت پلیر صوتی ========== */
function AudioPlayer({ src }: { src: string }) {
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

/* ========== کامپوننت ستاره‌ها ========== */
function StarsResult({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((s) => (
        <motion.div
          key={s}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + s * 0.2, type: "spring" }}
        >
          <Star
            className={`h-10 w-10 ${
              s <= count
                ? "text-amber-400 fill-amber-400 drop-shadow-md"
                : "text-slate-200"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ========== صفحه اصلی ========== */
export default function ListeningExercisePage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const router = useRouter();

  const [episode, setEpisode] = useState<ListeningEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    stars: number;
    xpEarned: number;
    percent: number;
  } | null>(null);

  // دریافت اطلاعات قسمت
  useEffect(() => {
    async function fetchEpisode() {
      if (!episodeId) return;
      try {
        const res = await fetch(`/api/listening/${episodeId}`);
        if (res.ok) {
          const data = await res.json();
          setEpisode(data);
          // اگر قبلاً انجام داده، جواب‌ها رو پر کن
          if (data.progress) {
            setResult({
              correct: 0,
              total: data.gaps.length,
              stars: data.progress.stars,
              xpEarned: data.progress.xpEarned,
              percent: data.progress.score,
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchEpisode();
  }, [episodeId]);

  // پارس transcript → قطعات متنی + blanks
  const segments = useMemo(() => {
    if (!episode) return [];
    const regex = /\{(\d+)\}/g;
    const parts: { type: "text" | "gap"; value: string; gapId?: number }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(episode.transcript)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          value: episode.transcript.slice(lastIndex, match.index),
        });
      }
      parts.push({ type: "gap", value: "", gapId: parseInt(match[1]) });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < episode.transcript.length) {
      parts.push({
        type: "text",
        value: episode.transcript.slice(lastIndex),
      });
    }

    return parts;
  }, [episode]);

  const setAnswer = (gapId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [gapId]: value }));
    setResult(null); // مخفی کردن نتیجه قبلی
  };

  const toggleHint = (gapId: number) => {
    setHints((prev) => ({ ...prev, [gapId]: !prev[gapId] }));
  };

  // ارسال جواب‌ها
  const handleSubmit = useCallback(async () => {
    if (!episodeId || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/listening/${episodeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          correct: data.correct,
          total: data.total,
          stars: data.stars,
          xpEarned: data.xpEarned,
          percent: data.percent,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [episodeId, answers, submitting]);

  const handleRetry = () => {
    setAnswers({});
    setHints({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">قسمت یافت نشد</p>
        <button
          onClick={() => router.push("/training")}
          className="text-orange-600 text-sm"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const gapsMap = new Map(
    (episode.gaps as ListeningGap[]).map((g) => [g.id, g]),
  );
  const levelInfo = getListeningLevel(episode.level);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-slate-800">
              {episode.titleFa}
            </h1>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelInfo.color}`}
            >
              {levelInfo.fa}
            </span>
          </div>
          <p className="text-sm text-slate-500">{episode.title}</p>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 rounded-full px-3 py-1.5">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">
            {episode.xp} XP
          </span>
        </div>
      </div>

      {/* پلیر صوتی */}
      <AudioPlayer src={episode.audioUrl} />

      {/* توضیحات */}
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            ابتدا به فایل صوتی گوش بده. سپس کلمات جاخالی رو توی فرم‌ها بنویس.
            برای راهنمایی روی آیکون لامپ کلیک کن.
          </span>
        </p>
      </div>

      {/* متن ترنسکرایب + blanks */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">
            📝
          </span>
          متن تمرین
        </h2>

        <div className="text-sm md:text-base leading-[2.2] text-slate-700">
          {segments.map((seg, i) => {
            if (seg.type === "text") {
              return <span key={i}>{seg.value}</span>;
            }

            const gapId = seg.gapId!;
            const gap = gapsMap.get(gapId);
            const userAns = answers[gapId] || "";
            const hint = hints[gapId];

            // بررسی صحت بعد از ارسال
            let status: "correct" | "wrong" | "idle" = "idle";
            if (result && gap) {
              status =
                userAns.trim().toLowerCase() === gap.answer.trim().toLowerCase()
                  ? "correct"
                  : "wrong";
            }

            return (
              <span key={i} className="inline mx-0.5">
                <span className="relative inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={userAns}
                    onChange={(e) => setAnswer(gapId, e.target.value)}
                    placeholder={`(${gapId})`}
                    dir="ltr"
                    disabled={!!result}
                    className={`w-28 md:w-36 px-2 py-1 text-sm border rounded-lg text-center outline-none transition-all font-medium ${
                      status === "correct"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : status === "wrong"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-200 bg-slate-50 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    }`}
                  />
                  {/* آیکون صحت/غلط */}
                  {result && status === "correct" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {result && status === "wrong" && (
                    <span className="flex items-center gap-0.5">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-green-600 font-medium">
                        {gap?.answer}
                      </span>
                    </span>
                  )}
                  {/* دکمه راهنما */}
                  {!result && (
                    <button
                      onClick={() => toggleHint(gapId)}
                      className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                      title="راهنما"
                    >
                      <Lightbulb
                        className={`h-3.5 w-3.5 ${hint ? "text-amber-500" : "text-slate-300"}`}
                      />
                    </button>
                  )}
                </span>
                {/* متن راهنما */}
                <AnimatePresence>
                  {hint && gap && (
                    <motion.span
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="block text-[11px] text-amber-600 mt-0.5"
                    >
                      💡 {gap.hint}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            );
          })}
        </div>
      </div>

      {/* دکمه ارسال / تلاش مجدد */}
      <div className="mt-6 flex justify-center gap-3">
        {!result ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-linear-to-l from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال بررسی...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                ثبت جواب‌ها
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            تلاش مجدد
          </button>
        )}
      </div>

      {/* نتیجه */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 text-center"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              نتیجه تمرین
            </h3>

            <StarsResult count={result.stars} />

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">پاسخ صحیح: </span>
                <span className="font-bold text-slate-800">
                  {result.correct}/{result.total}
                </span>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="text-slate-500">درصد: </span>
                <span className="font-bold text-slate-800">
                  {result.percent}%
                </span>
              </div>
              <div className="text-slate-300">|</div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-orange-600">
                  +{result.xpEarned} XP
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => router.push("/training")}
                className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                بازگشت به لیست تمرین‌ها
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
