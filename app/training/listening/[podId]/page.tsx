"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  Zap,
  Star,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Gauge,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getListeningLevel } from "@/types/listening";
import type { PodcastEpisode } from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import PageLoader from "@/app/components/PageLoader";

// ========================================
// پلیر تمرین شنیداری (نسخه ۱.۰.۱.۴)
// پادکست ایستا: پخش با تلفظ مرورگر (Tom pitch 0.8 / Lena 1.15)
// قسمت دیتابیس: پلیر فایل صوتی + ثبت نتیجه در دیتابیس
// جاهای خالی هنگام پخش با جواب تلفظ می‌شوند
// ========================================

type Detail = PodcastEpisode & {
  progress?: { stars: number; score: number; xpEarned: number } | null;
};

type SubmitResult = {
  correct: number;
  total: number;
  stars: number;
  xpEarned: number;
  percent: number;
  bestResult: boolean;
};

const SPEEDS = [0.75, 1, 1.25];

/** نرمال‌سازی جواب برای مقایسه منصفانه */
function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}

/* ========== ستاره‌های نتیجه ========== */
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

export default function ListeningPlayerPage() {
  const { podId } = useParams<{ podId: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [bestStars, setBestStars] = useState(0);

  // وضعیت پخش تلفظ مرورگر
  const [playing, setPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [speed, setSpeed] = useState(1);

  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const enVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // وضعیت پلیر فایل صوتی (قسمت دیتابیس)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  /* ---------- دریافت قسمت ---------- */
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      void (async () => {
        if (!podId) return;
        try {
          const res = await fetch(`/api/practice/listening/${podId}`);
          if (res.ok && !cancelled) {
            const data = (await res.json()) as Detail;
            setItem(data);
            const stored = getProgress("listening", data.id);
            setBestStars(stored?.stars ?? data.progress?.stars ?? 0);
          }
        } catch {
          /* silent */
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [podId]);

  /* ---------- انتخاب صدای انگلیسی برای تلفظ ---------- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      enVoiceRef.current =
        voices.find((v) => /en[-_]/i.test(v.lang) && /google/i.test(v.name)) ||
        voices.find((v) => /en[-_]US/i.test(v.lang)) ||
        voices.find((v) => /en[-_]/i.test(v.lang)) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
      playingRef.current = false;
    };
  }, []);

  /* ---------- خطوط ترنسکریپت ---------- */
  const lines = useMemo(
    () =>
      item ? item.transcript.split("\n").filter((l) => l.trim().length > 0) : [],
    [item],
  );

  /** متن گفتنی یک خط: حذف نام مجری + گذاشتن جواب به‌جای {n} */
  const speakTextOf = useCallback(
    (line: string) => {
      if (!item) return line;
      const withoutSpeaker = line.replace(/^[A-Za-z]+:\s*/, "");
      return withoutSpeaker.replace(/\{(\d+)\}/g, (_m, n: string) => {
        const gap = item.gaps.find((g) => g.id === parseInt(n, 10));
        return gap ? gap.answer : "";
      });
    },
    [item],
  );

  /* ---------- پخش خط‌به‌خط ---------- */
  const speakFrom = useCallback(
    (startIndex: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      if (startIndex < 0 || startIndex >= lines.length) {
        playingRef.current = false;
        setPlaying(false);
        setCurrentLine(-1);
        return;
      }
      playingRef.current = true;
      setPlaying(true);

      const speakNext = (i: number) => {
        if (!playingRef.current) return;
        if (i >= lines.length) {
          playingRef.current = false;
          setPlaying(false);
          setCurrentLine(-1);
          return;
        }
        setCurrentLine(i);
        const line = lines[i];
        const u = new SpeechSynthesisUtterance(speakTextOf(line));
        u.lang = "en-US";
        u.pitch = line.startsWith("Tom") ? 0.8 : 1.15;
        u.rate = speedRef.current;
        if (enVoiceRef.current) u.voice = enVoiceRef.current;
        u.onend = () => {
          if (playingRef.current) speakNext(i + 1);
        };
        u.onerror = () => {
          playingRef.current = false;
          setPlaying(false);
        };
        window.speechSynthesis.speak(u);
      };

      speakNext(startIndex);
    },
    [lines, speakTextOf],
  );

  const handleToggleSpeech = () => {
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      speakFrom(currentLine >= 0 ? currentLine : 0);
    }
  };

  const handleStopSpeech = () => {
    playingRef.current = false;
    setPlaying(false);
    setCurrentLine(-1);
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
  };

  const handleSpeed = (s: number) => {
    setSpeed(s);
    speedRef.current = s;
    if (playing) speakFrom(currentLine); // اعمال فوری سرعت جدید
  };

  /* ---------- پلیر فایل صوتی (دیتابیس) ---------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setAudioTime(audio.currentTime);
    const onLoaded = () => setAudioDuration(audio.duration);
    const onEnd = () => setAudioPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, [item]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setAudioPlaying(true);
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------- ارسال جواب‌ها ---------- */
  const setAnswer = (gapId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [gapId]: value }));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!item || submitting) return;
    setSubmitting(true);
    try {
      if (item.source === "db") {
        // قسمت دیتابیس: ارزیابی سرور + ثبت در دیتابیس
        const res = await fetch(`/api/listening/${item.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (res.ok) {
          const data = (await res.json()) as SubmitResult;
          setResult(data);
          saveProgress("listening", item.id, data.stars, data.percent);
          setBestStars((prev) => Math.max(prev, data.stars));
        }
      } else {
        // پادکست ایستا: ارزیابی همین‌جا + ذخیره در localStorage
        const prev = getProgress("listening", item.id);
        let correct = 0;
        for (const gap of item.gaps) {
          if (normalize(answers[gap.id] || "") === normalize(gap.answer))
            correct++;
        }
        const total = item.gaps.length;
        const percent = Math.round((correct / total) * 100);
        const stars =
          percent >= 80 ? 3 : percent >= 60 ? 2 : percent >= 40 ? 1 : 0;
        const xpEarned = Math.round((item.xp * stars) / 3);
        const data: SubmitResult = {
          correct,
          total,
          stars,
          xpEarned,
          percent,
          bestResult: !!prev && prev.stars >= stars,
        };
        setResult(data);
        saveProgress("listening", item.id, stars, percent);
        setBestStars((prev) => Math.max(prev, stars));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    handleStopSpeech();
    setAnswers({});
    setHints({});
    setResult(null);
  };

  /* ---------- رندر ---------- */
  // لودر یکپارچهٔ سایت — v1.0.1.9
  if (loading) {
    return <PageLoader />;
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">قسمت یافت نشد</p>
        <button
          onClick={() => router.push("/training/listening")}
          className="text-orange-600 text-sm font-bold"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const gapsMap = new Map(item.gaps.map((g) => [g.id, g]));
  const levelInfo = getListeningLevel(item.level);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training/listening")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold text-slate-800">
              {item.titleFa}
            </h1>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelInfo.color}`}
            >
              {levelInfo.fa}
            </span>
            {bestStars > 0 && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < bestStars
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 rounded-full px-3 py-1.5 shrink-0">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">{item.xp} XP</span>
        </div>
      </div>

      {/* ================= پلیر ================= */}
      {item.source === "podcast" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  پخش با تلفظ مرورگر
                </p>
                <p className="text-[10px] text-slate-400">
                  دو مجری: Tom و Lena — خطِ در حال پخش هایلایت می‌شود
                </p>
              </div>
            </div>
            {/* سرعت */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400 mx-1" />
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    speed === s
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {s === 1 ? "۱×" : `${s}×`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={handleStopSpeech}
              className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
              title="توقف"
            >
              <Square className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={handleToggleSpeech}
              className="p-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md"
              title={playing ? "توقف موقت" : "پخش"}
            >
              {playing ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 -mr-0.5" />
              )}
            </button>
            <button
              onClick={() => speakFrom(0)}
              className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
              title="از اول"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            {playing
              ? `در حال پخش خط ${currentLine + 1} از ${lines.length}`
              : `برای شنیدن دوباره یک خط، روی آن کلیک کن`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <audio
            ref={audioRef}
            src={item.audioUrl ?? undefined}
            preload="metadata"
          />
          <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="absolute top-0 right-0 h-full bg-linear-to-l from-orange-500 to-amber-400 rounded-full transition-all duration-200"
              style={{
                width: `${
                  audioDuration > 0 ? (audioTime / audioDuration) * 100 : 0
                }%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={audioDuration || 0}
              value={audioTime}
              onChange={(e) => {
                const audio = audioRef.current;
                if (!audio) return;
                audio.currentTime = Number(e.target.value);
                setAudioTime(audio.currentTime);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{fmt(audioTime)}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const audio = audioRef.current;
                  if (!audio) return;
                  audio.currentTime = 0;
                  setAudioTime(0);
                }}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="h-4 w-4 text-slate-600" />
              </button>
              <button
                onClick={toggleAudio}
                className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md"
              >
                {audioPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 -mr-0.5" />
                )}
              </button>
              <div className="w-8 flex justify-center">
                <Headphones className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <span className="text-xs text-slate-500">{fmt(audioDuration)}</span>
          </div>
        </div>
      )}

      {/* ================= راهنما ================= */}
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            گوش بده و کلمه‌ای که جای خالی تلفظ می‌شود را در فرم بنویس. برای
            راهنمایی روی آیکون لامپ کلیک کن.
          </span>
        </p>
      </div>

      {/* ================= ترنسکریپت خط‌به‌خط ================= */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
        <h2 className="font-bold text-slate-800 mb-4 text-sm">متن تمرین</h2>

        <div className="space-y-1" dir="ltr">
          {lines.map((line, lineIdx) => {
            const isCurrent = currentLine === lineIdx;
            const speaker = line.startsWith("Tom") ? "Tom" : "Lena";

            return (
              <div
                key={lineIdx}
                onClick={() => speakFrom(lineIdx)}
                className={`group flex items-start gap-2 rounded-xl px-2 py-1.5 cursor-pointer transition-colors ${
                  isCurrent
                    ? "bg-amber-50 ring-2 ring-amber-200"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* نشان مجری */}
                <span
                  className={`shrink-0 mt-0.5 text-[10px] font-black rounded-full w-11 text-center py-1 ${
                    speaker === "Tom"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {speaker}
                </span>

                {/* متن خط با فرم‌ها */}
                <p className="text-sm md:text-[15px] leading-[2.3] text-slate-700 flex-1">
                  {line
                    .replace(/^[A-Za-z]+:\s*/, "")
                    .split(/\{(\d+)\}/)
                    .map((part, i) => {
                      if (i % 2 === 0)
                        return (
                          <span key={i}>
                            <HoverableText text={part} />
                          </span>
                        );

                      const gapId = parseInt(part, 10);
                      const gap = gapsMap.get(gapId);
                      if (!gap) return <span key={i}>{part}</span>;

                      const userAns = answers[gapId] || "";
                      const hint = hints[gapId];

                      let status: "correct" | "wrong" | "idle" = "idle";
                      if (result) {
                        status =
                          normalize(userAns) === normalize(gap.answer)
                            ? "correct"
                            : "wrong";
                      }

                      return (
                        <span key={i} className="inline">
                          <span className="relative inline-flex items-center gap-1 mx-0.5">
                            <input
                              type="text"
                              value={userAns}
                              onChange={(e) =>
                                setAnswer(gapId, e.target.value)
                              }
                              placeholder={`(${gapId})`}
                              dir="ltr"
                              disabled={!!result}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-24 md:w-32 px-2 py-0.5 text-sm border rounded-lg text-center outline-none transition-all font-medium ${
                                status === "correct"
                                  ? "border-green-300 bg-green-50 text-green-700"
                                  : status === "wrong"
                                    ? "border-red-300 bg-red-50 text-red-700"
                                    : "border-slate-200 bg-slate-50 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              }`}
                            />
                            {result && status === "correct" && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {result && status === "wrong" && (
                              <span className="flex items-center gap-0.5">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-green-600 font-medium">
                                  {gap.answer}
                                </span>
                              </span>
                            )}
                            {!result && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHints((prev) => ({
                                    ...prev,
                                    [gapId]: !prev[gapId],
                                  }));
                                }}
                                className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                                title="راهنما"
                              >
                                <Lightbulb
                                  className={`h-3.5 w-3.5 ${
                                    hint
                                      ? "text-amber-500"
                                      : "text-slate-300"
                                  }`}
                                />
                              </button>
                            )}
                          </span>
                          <AnimatePresence>
                            {hint && (
                              <motion.span
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="block text-[11px] text-amber-600 mt-0.5"
                                dir="rtl"
                              >
                                💡 {gap.hint}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      );
                    })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= دکمه‌ها ================= */}
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

      {/* ================= نتیجه ================= */}
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

            <div className="mt-4 flex items-center justify-center gap-6 text-sm flex-wrap">
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

            {result.bestResult && (
              <p className="mt-3 text-xs text-slate-400">
                رکورد قبلی‌ات بهتر بود — بهترین نتیجه حفظ شد
              </p>
            )}

            <div className="mt-5">
              <button
                onClick={() => router.push("/training/listening")}
                className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                بازگشت به لیست شنیداری
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
