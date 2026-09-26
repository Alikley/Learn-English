"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Zap, Star, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getListeningLevel } from "@/types/listening";
import type { PodcastEpisode } from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import { mediaUrl } from "@/lib/media";
import SpeechPlayer from "./_components/SpeechPlayer";
import FileAudioPlayer from "./_components/FileAudioPlayer";
import LineTranscript from "./_components/LineTranscript";
import { StarsResult, SubmitAnswersButton, RetryButton } from "@/app/training/_components/PracticeResultBits";

// ========================================
// پلیر تمرین شنیداری (نسخه ۱.۰.۱.۴)
// پادکست ایستا: پخش با تلفظ مرورگر (Tom pitch 0.8 / Lena 1.15)
// قسمت دیتابیس: پلیر فایل صوتی + ثبت نتیجه در دیتابیس
// جاهای خالی هنگام پخش با جواب تلفظ می‌شوند
//
// v1.0.2.7 — ریفکتوری: پلیر گفتار، پلیر فایل و ترنسکریپت
// خط‌به‌خط به _components تفکیک شدند.
//
// v1.0.2.۹ — گام ۳: صوت قسمت دیتابیسی از پل امن /api/media (B2).
// v1.0.2.۹ — گام ۴: کلیک روی هر خط = شروع از همان خط:
//  - قسمت فایل صوتی: پرش فایل به زمان تخمینی خط + پخش
//  - پادکست گفتاری: شروع دوباره تلفظ از همان خط
//  رفع گیرکردن: «نسل پخش» (session) زنجیره‌های قدینی speechSynthesis
//  را باطل می‌کند + وقفه کوتاه بعد از cancel (باگ معروف Chrome)
// ========================================

/** نرمال‌سازی جواب برای مقایسه منصفانه */
function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}

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

export default function ListeningPlayerPage() {
  const { tr, dir } = useLanguage();
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
  // v1.0.2.۹ — گام ۴: «نسل پخش» — هر شروع/توقف جدید شماره را زیاد
  // می‌کند؛ onend/onerror زنجیره‌های قبلی با دیدن شماره قدیمی می‌میرند
  // و دیگر زنجیره‌های مرده صدا را قفل نمی‌کنند
  const speechSessionRef = useRef(0);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // v1.0.2.۹ — گام ۴: پاک‌سازی تایمر + قطع صدای در حال پخش
      // (تایمرِ پاک‌شده زنجیره جدیدی روشن نمی‌کند؛ cancel هم پخش را
      // می‌بُرد — نیازی به دست‌زدن به session در cleanup نیست)
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      playingRef.current = false;
      window.speechSynthesis.cancel();
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
      // v1.0.2.۹ — گام ۴: نسل جدید — زنجیره‌های قبلی باطل می‌شوند
      const session = ++speechSessionRef.current;
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
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
        if (session !== speechSessionRef.current) return; // زنجیره قدیمی
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
          if (session === speechSessionRef.current && playingRef.current) {
            speakNext(i + 1);
          }
        };
        u.onerror = () => {
          // خطای زنجیره‌های قدیمی (قطع‌شده با cancel) نادیده گرفته می‌شود
          if (session !== speechSessionRef.current) return;
          playingRef.current = false;
          setPlaying(false);
        };
        window.speechSynthesis.speak(u);
      };

      // ⏱ وقفه کوتاه بعد از cancel — باگ معروف Chrome:
      // speak بلافاصله بعد از cancel بی‌صدا نادیده گرفته می‌شود و
      // پخش «گیر می‌کند»؛ این وقفه پخش قابل‌اعتماد را تضمین می‌کند
      speechTimerRef.current = setTimeout(() => {
        if (session === speechSessionRef.current) speakNext(startIndex);
      }, 140);
    },
    [lines, speakTextOf],
  );

  const handleToggleSpeech = () => {
    if (playing) {
      speechSessionRef.current++; // باطل کردن زنجیره‌های فعال
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      playingRef.current = false;
      setPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      speakFrom(currentLine >= 0 ? currentLine : 0);
    }
  };

  const handleStopSpeech = () => {
    speechSessionRef.current++;
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
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
  // v1.0.2.۹ — گام ۴: تخمین زمان شروع هر خط — ترنسکریپت قسمت‌های
  // دیتابیسی تایم‌استمپ ندارد؛ سهم هر خط از کل زمان به نسبت
  // طول (کاراکتر) خطوط تخمین زده می‌شود (۰..۱)
  const lineFractions = useMemo(() => {
    if (!lines.length) return [] as number[];
    const weights = lines.map((l) => Math.max(l.trim().length, 12));
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    return weights.map((w) => {
      const start = acc / total;
      acc += w;
      return start;
    });
  }, [lines]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const isFileEpisode = item?.source === "db" && !!item?.audioUrl;
    const onTime = () => {
      setAudioTime(audio.currentTime);
      // هایلایت خطِ در حال پخش (تخمینی) — فقط برای قسمت فایل صوتی
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (isFileEpisode && dur > 0 && !audio.paused) {
        const f = audio.currentTime / dur;
        let idx = 0;
        for (let i = lineFractions.length - 1; i >= 0; i--) {
          if (f >= lineFractions[i]) {
            idx = i;
            break;
          }
        }
        setCurrentLine(idx);
      }
    };
    const onLoaded = () => setAudioDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnd = () => setAudioPlaying(false);
    // v1.0.2.۹ — گام ۴: خطای بارگذاری فایل دیگر پلیر را در حالِ پخشِ
    // قفل‌شده نمی‌گذارد (قبلاً دکمه پخش روی حالت playing گیر می‌کرد)
    const onError = () => setAudioPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
  }, [item, lineFractions]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // v1.0.2.۹ — نتیجه promise بررسی می‌شود؛ اگر پخش شکست خورد
      // (مثلاً فایل در دسترس نیست) حالت دکمه برمی‌گردد و «گیر» نمی‌کند
      audio
        .play()
        .then(() => setAudioPlaying(true))
        .catch(() => setAudioPlaying(false));
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  };

  /* ---------- v1.0.2.۹ — گام ۴: کلیک روی خط = شروع از همان خط ---------- */
  const handleLineClick = useCallback(
    (i: number) => {
      // قسمت فایل صوتی: پرش فایل به زمان تخمینی شروع همان خط + پخش
      if (item?.source === "db" && item.audioUrl) {
        const audio = audioRef.current;
        const dur =
          audio && Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : item.duration || 0;
        if (audio && dur > 0 && lineFractions.length) {
          try {
            audio.currentTime = Math.min(
              Math.max(0, dur * lineFractions[i]),
              dur - 0.05,
            );
            setAudioTime(audio.currentTime);
            setCurrentLine(i);
            audio
              .play()
              .then(() => setAudioPlaying(true))
              .catch(() => setAudioPlaying(false));
            return;
          } catch {
            /* متادیتا هنوز آماده نیست → جایگزین گفتاری پایین */
          }
        }
      }
      // پادکست گفتاری: تلفظ مرورگر از همان خط (با نسل جدید)
      speakFrom(i);
    },
    [item, lineFractions, speakFrom],
  );

  /* ---------- ارسال جواب‌ها ---------- */
  const setAnswer = (gapId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [gapId]: value }));
    setResult(null);
  };

  const toggleHint = (gapId: number) => {
    setHints((prev) => ({ ...prev, [gapId]: !prev[gapId] }));
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
  if (loading) return <PageLoading />;

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">{tr("قسمت یافت نشد", "Episode not found")}</p>
        <button
          onClick={() => router.push("/training/listening")}
          className="text-orange-600 text-sm font-bold"
        >
          {tr("بازگشت به لیست", "Back to List")}
        </button>
      </div>
    );
  }

  const gapsMap = new Map(item.gaps.map((g) => [g.id, g]));
  const levelInfo = getListeningLevel(item.level);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
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
        <SpeechPlayer
          playing={playing}
          currentLine={currentLine}
          totalLines={lines.length}
          speed={speed}
          onToggle={handleToggleSpeech}
          onStop={handleStopSpeech}
          onRestart={() => speakFrom(0)}
          onSpeed={handleSpeed}
        />
      ) : (
        <FileAudioPlayer
          /* v1.0.2.۹ — گام ۳: صوت از پل امن /api/media (باکت B2) —
             قبلاً مسیر خام محلی پاس می‌شد و فایل (حذف‌شده از
             public/) هرگز بارگذاری نمی‌شد */
          src={item.audioUrl ? mediaUrl(item.audioUrl) : null}
          audioRef={audioRef}
          playing={audioPlaying}
          time={audioTime}
          duration={audioDuration}
          onToggle={toggleAudio}
          onSeek={(t) => {
            const audio = audioRef.current;
            // v1.0.2.۹ — گام ۴: پرش فقط وقتی متادیتا آماده است؛
            // قبلاً currentTime روی فایلِ بارگذاری‌نشده exception
            // می‌داد و نوار زمان «دیگه بخش نمی‌شد»
            if (
              !audio ||
              !Number.isFinite(audio.duration) ||
              audio.duration <= 0
            )
              return;
            audio.currentTime = Math.min(
              Math.max(0, t),
              audio.duration - 0.05,
            );
            setAudioTime(audio.currentTime);
          }}
          onRestart={() => {
            const audio = audioRef.current;
            if (!audio) return;
            try {
              audio.currentTime = 0;
              setAudioTime(0);
              setCurrentLine(0);
            } catch {
              /* متادیتا آماده نیست */
            }
          }}
        />
      )}

      {/* ================= راهنما ================= */}
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            {tr(`گوش بده و کلمه‌ای که جای خالی تلفظ می‌شود را در فرم بنویس. برای
            راهنمایی روی آیکون لامپ کلیک کن.`, "Listen and type the word spoken in the blank. Click the lamp icon for a hint.")}
          </span>
        </p>
      </div>

      {/* ================= ترنسکریپت خط‌به‌خط ================= */}
      <LineTranscript
        lines={lines}
        currentLine={currentLine}
        gapsMap={gapsMap}
        answers={answers}
        hints={hints}
        hasResult={result !== null}
        /* v1.0.2.۹ — گام ۴: برای قسمت فایل صوتی، فایل به همان خط
           پرش می‌کند؛ برای پادکست، تلفظ از همان خط شروع می‌شود */
        onLineClick={handleLineClick}
        onSetAnswer={setAnswer}
        onToggleHint={toggleHint}
      />

      {/* ================= دکمه‌ها ================= */}
      <div className="mt-6 flex justify-center gap-3">
        {!result ? (
          <SubmitAnswersButton
            submitting={submitting}
            onSubmit={() => void handleSubmit()}
          />
        ) : (
          <RetryButton onRetry={handleRetry} />
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
              {tr("نتیجه تمرین", "Practice Result")}
            </h3>

            <StarsResult count={result.stars} />

            <div className="mt-4 flex items-center justify-center gap-6 text-sm flex-wrap">
              <div>
                <span className="text-slate-500">{tr("پاسخ صحیح:", "Correct answer:")} </span>
                <span className="font-bold text-slate-800">
                  {result.correct}/{result.total}
                </span>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="text-slate-500">{tr("درصد:", "Score:")} </span>
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
                {tr("رکورد قبلی‌ات بهتر بود — بهترین نتیجه حفظ شد", "Your previous record was better — your best result is kept")}
              </p>
            )}

            <div className="mt-5">
              <button
                onClick={() => router.push("/training/listening")}
                className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {tr("بازگشت به لیست شنیداری", "Back to Listening List")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
