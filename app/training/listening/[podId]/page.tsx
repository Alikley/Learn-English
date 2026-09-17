"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  Mic,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getListeningLevel } from "@/types/listening";
import { saveProgress } from "@/lib/practice-progress";
import type { PodcastEpisode, ListeningGap } from "@/types/training";

/* ========== پارس خطوط گفتگو ========== */
type PodLine = { speaker: "Tom" | "Lena"; text: string };

function parseLines(transcript: string): PodLine[] {
  return transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(Tom|Lena):\s*(.*)$/);
      if (m) return { speaker: m[1] as "Tom" | "Lena", text: m[2] };
      return { speaker: "Tom" as const, text: l };
    });
}

/* ========== کامپوننت ستاره‌های نتیجه (الگوی صفحه قسمت‌های دیتابیسی) ========== */
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

const SPEEDS = [
  { label: "۰.۷۵×", value: 0.75 },
  { label: "۱×", value: 1 },
  { label: "۱.۲۵×", value: 1.25 },
];

/* ========== صفحه اصلی ========== */
export default function PodcastPlayerPage() {
  const { podId } = useParams<{ podId: string }>();
  const router = useRouter();

  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    stars: number;
    xpEarned: number;
    percent: number;
  } | null>(null);

  /* ---------- وضعیت پلیر صوتی (Web Speech API) ---------- */
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [currentLine, setCurrentLine] = useState(0);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const sessionRef = useRef(0); // با هر cancel/play افزایش می‌یابد تا onend قدیمی نادیده گرفته شود
  const aliveRef = useRef(true); // برای بی‌اثر کردن زنجیره پخش هنگام خروج از صفحه
  const [voiceTom, setVoiceTom] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceLena, setVoiceLena] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );

  // دریافت قسمت
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!podId) return;
      try {
        const res = await fetch(`/api/practice/listening/${podId}`);
        if (res.ok && !cancelled) {
          setEpisode(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const id = setTimeout(() => void load(), 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [podId]);

  // بارگذاری صداهای انگلیسی — ترجیح دو صدای متمایز (en-US برای Tom و en-GB برای Lena)
  useEffect(() => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    const assign = () => {
      const en = synth
        .getVoices()
        .filter((v) => v.lang?.toLowerCase().startsWith("en"));
      if (en.length === 0) return;
      const us = en.find((v) => v.lang.toLowerCase().includes("us"));
      const gb = en.find((v) => v.lang.toLowerCase().includes("gb"));
      let tom: SpeechSynthesisVoice | null;
      let lena: SpeechSynthesisVoice | null;
      if (us && gb && us.name !== gb.name) {
        tom = us;
        lena = gb;
      } else if (en.length >= 2) {
        tom = en[0];
        lena = en[1];
      } else {
        // فقط یک صدا — تفکیک با pitch انجام می‌شود
        tom = en[0];
        lena = null;
      }
      setVoiceTom(tom);
      setVoiceLena(lena);
    };
    assign(); // برخی مرورگرها همگانی بار می‌کنند
    synth.addEventListener("voiceschanged", assign);
    return () => synth.removeEventListener("voiceschanged", assign);
  }, [ttsSupported]);

  const lines = useMemo(
    () => (episode ? parseLines(episode.transcript) : []),
    [episode],
  );

  const gapsMap = useMemo(
    () =>
      new Map<number, ListeningGap>(
        (episode?.gaps ?? []).map((g) => [g.id, g]),
      ),
    [episode],
  );

  // متن گفتنی یک خط — جاخالی‌ها با جواب درست پر می‌شوند تا کاربر متن کامل را بشنود
  const speakableText = useCallback(
    (text: string) =>
      text.replace(/\{(\d+)\}/g, (_, n: string) => {
        const g = gapsMap.get(Number(n));
        return g ? g.answer : "";
      }),
    [gapsMap],
  );

  // پخش از خط i به بعد — زنجیره‌ای با onend
  const speakFrom = useCallback(
    (index: number) => {
      if (!ttsSupported || lines.length === 0) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const session = ++sessionRef.current;
      setStatus("playing");

      const speak = (i: number) => {
        // جلسه لغو شده یا صفحه بسته شده — پیش نرو
        if (session !== sessionRef.current || !aliveRef.current) return;
        if (i >= lines.length) {
          // پایان پادکست
          setStatus("idle");
          setCurrentLine(0);
          return;
        }
        setCurrentLine(i);
        const line = lines[i];
        const u = new SpeechSynthesisUtterance(speakableText(line.text));
        const voice = line.speaker === "Tom" ? voiceTom : (voiceLena ?? voiceTom);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else {
          u.lang = "en-US";
        }
        u.pitch = line.speaker === "Tom" ? 0.8 : 1.15;
        u.rate = speedRef.current;
        u.onend = () => {
          if (session === sessionRef.current && aliveRef.current) speak(i + 1);
        };
        u.onerror = () => {
          if (session === sessionRef.current && aliveRef.current)
            setStatus("idle");
        };
        synth.speak(u);
      };
      speak(index);
    },
    [ttsSupported, lines, voiceTom, voiceLena, speakableText],
  );

  // اسکرول نرم به خط جاری
  useEffect(() => {
    const el = document.getElementById(`pod-line-${currentLine}`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentLine]);

  // پاکسازی هنگام خروج از صفحه
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    if (status === "playing") {
      synth.pause();
      setStatus("paused");
    } else if (status === "paused") {
      synth.resume();
      setStatus("playing");
    } else {
      speakFrom(currentLine);
    }
  };

  const restart = () => {
    if (!ttsSupported) return;
    speakFrom(0);
  };

  const changeSpeed = (v: number) => {
    setSpeed(v);
    speedRef.current = v;
    // اگر در حال پخش است، همان خط با سرعت جدید ادامه می‌یابد
    if (status === "playing") speakFrom(currentLine);
  };

  /* ---------- تمرین جاخالی (الگوی صفحه قسمت دیتابیسی) ---------- */
  const segments = useMemo(() => {
    if (!episode) return [];
    const regex = /\{(\d+)\}/g;
    const parts: {
      type: "text" | "gap";
      value: string;
      gapId?: number;
    }[] = [];
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
    setResult(null);
  };

  const toggleHint = (gapId: number) => {
    setHints((prev) => ({ ...prev, [gapId]: !prev[gapId] }));
  };

  // بررسی سمت کلاینت — مثل الگوی شنیداری
  const handleSubmit = () => {
    if (!episode) return;
    const gaps = episode.gaps;
    const total = gaps.length;
    let correct = 0;
    gaps.forEach((gap) => {
      const userAnswer = (answers[gap.id] || "").trim().toLowerCase();
      if (userAnswer === gap.answer.trim().toLowerCase()) correct++;
    });
    const percent = Math.round((correct / total) * 100);
    const stars = percent >= 80 ? 3 : percent >= 60 ? 2 : percent >= 40 ? 1 : 0;
    const xpEarned = Math.round((percent / 100) * episode.xp);
    setResult({ correct, total, stars, xpEarned, percent });
    // ذخیره بهترین نتیجه در localStorage
    saveProgress("listening", episode.id, stars, xpEarned);
  };

  const handleRetry = () => {
    setAnswers({});
    setHints({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" dir="rtl">
        <p className="text-slate-500">قسمت یافت نشد</p>
        <button
          onClick={() => router.push("/training/listening")}
          className="text-orange-600 text-sm"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const levelInfo = getListeningLevel(episode.level);
  const currentSpeaker =
    status !== "idle" && currentLine < lines.length
      ? lines[currentLine].speaker
      : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training/listening")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="بازگشت به لیست شنیداری"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold text-slate-800">
              {episode.titleFa}
            </h1>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelInfo.color}`}
            >
              {levelInfo.fa}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">{episode.title}</p>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 rounded-full px-3 py-1.5 shrink-0">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">
            {episode.xp} XP
          </span>
        </div>
      </div>

      {/* پلیر پادکست با صدای مرورگر */}
      {!ttsSupported ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            مرورگر شما از پخش صوتی پشتیبانی نمی‌کند — می‌توانید متن را بخوانید و
            جاهای خالی را پر کنید.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* نوار بالای پلیر */}
          <div className="bg-linear-to-l from-orange-500 to-amber-500 px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Volume2 className="h-5 w-5 text-white shrink-0" />
              <h2 className="text-white font-bold text-sm truncate">
                پخش پادکست با صدای مرورگر
              </h2>
            </div>
            {/* نشان گوینده فعلی */}
            <AnimatePresence mode="wait">
              {currentSpeaker && (
                <motion.div
                  key={currentSpeaker + currentLine}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 shrink-0"
                >
                  <Mic className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white">
                    در حال پخش: {currentSpeaker}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* کنترل‌ها */}
          <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={restart}
                className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="پخش از ابتدا"
                title="پخش از ابتدا"
              >
                <RotateCcw className="h-5 w-5 text-slate-600" />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="p-4 rounded-full bg-linear-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transition-all"
                aria-label={status === "playing" ? "توقف" : "پخش"}
              >
                {status === "playing" ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 -mr-0.5" />
                )}
              </motion.button>
              {/* سرعت */}
              <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
                {SPEEDS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => changeSpeed(s.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      speed === s.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400">
              {status === "playing"
                ? "در حال پخش..."
                : status === "paused"
                  ? "متوقف شده"
                  : "آماده پخش"}
            </span>
          </div>

          {/* متن گفتگو با خط فعال */}
          <div className="p-5">
            <div
              className="max-h-96 overflow-y-auto pl-1 space-y-1.5
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200
              [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              dir="ltr"
            >
              {lines.map((line, i) => {
                const isCurrent =
                  i === currentLine && status !== "idle";
                const isPast = i < currentLine;
                return (
                  <div
                    key={i}
                    id={`pod-line-${i}`}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition-all duration-300 ${
                      isCurrent
                        ? "bg-orange-50 border-orange-200 shadow-sm"
                        : isPast
                          ? "bg-white border-transparent opacity-50"
                          : "bg-white border-transparent"
                    }`}
                  >
                    <span
                      className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 mt-0.5 ${
                        line.speaker === "Tom"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {line.text.split(/\{(\d+)\}/).map((part, j) =>
                        /^\d+$/.test(part) ? (
                          <span
                            key={j}
                            className="inline-block align-baseline mx-1 border-b-2 border-dashed border-orange-300 text-orange-400 text-xs pb-0.5 min-w-10 text-center"
                            title="جاخالی تمرین"
                          >
                            ﹏﹏
                          </span>
                        ) : (
                          <span key={j}>{part}</span>
                        ),
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center" dir="rtl">
              کلمات جاخالی هنگام پخش با صدای بلند گفته می‌شوند — خوب گوش بده!
            </p>
          </div>
        </div>
      )}

      {/* توضیحات */}
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            ابتدا پادکست را گوش بده. سپس کلمات جاخالی را توی فرم‌های زیر
            بنویس. برای راهنمایی روی آیکون لامپ کلیک کن.
          </span>
        </p>
      </div>

      {/* متن تمرین + جاخالی‌ها */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 text-xs">
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
            className="px-8 py-3 bg-linear-to-l from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            ثبت جواب‌ها
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

            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => router.push("/training/listening")}
                className="px-6 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
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
