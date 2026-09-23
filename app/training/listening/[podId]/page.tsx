"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type { PodcastEpisode } from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import SpeechPlayer from "./_components/SpeechPlayer";
import FileAudioPlayer from "./_components/FileAudioPlayer";
import LineTranscript from "./_components/LineTranscript";
import ListeningHeader from "./_components/ListeningHeader";
import ListeningResult from "./_components/ListeningResult";
import useSpeechPlayer from "./_components/useSpeechPlayer";
import useFileAudio from "./_components/useFileAudio";
import { evaluateStaticAnswers } from "./_components/evaluateAnswers";
import { SubmitAnswersButton, RetryButton } from "@/app/training/_components/PracticeResultBits";

// ========================================
// پلیر تمرین شنیداری (نسخه ۱.۰.۱.۴)
// پادکست ایستا: پخش با تلفظ مرورگر (Tom pitch 0.8 / Lena 1.15)
// قسمت دیتابیس: پلیر فایل صوتی + ثبت نتیجه در دیتابیس
// جاهای خالی هنگام پخش با جواب تلفظ می‌شوند
//
// v1.0.2.7 — ریفکتوری گام ۲: پلیرها، ترنسکریپت، هدر، نتیجه و
// منطق ارزیابی به _components تفکیک شدند (بدون تغییر رفتار)
// ========================================

type Detail = PodcastEpisode & {
  progress?: { stars: number; score: number; xpEarned: number } | null;
};

type SubmitResult = import("./_components/ListeningResult").ListeningSubmitResult;

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

  /* ---------- خطوط ترنسکریپت ---------- */
  const lines = useMemo(
    () =>
      item ? item.transcript.split("\n").filter((l) => l.trim().length > 0) : [],
    [item],
  );

  /* ---------- پلیر تلفظ مرورگر (پادکست ایستا) ---------- */
  const {
    playing,
    currentLine,
    speed,
    speakFrom,
    handleToggleSpeech,
    handleStopSpeech,
    handleSpeed,
  } = useSpeechPlayer(item, lines);

  /* ---------- پلیر فایل صوتی (قسمت دیتابیس) ---------- */
  const {
    audioRef,
    audioPlaying,
    audioTime,
    audioDuration,
    toggleAudio,
    seekTo,
    restart: restartAudio,
  } = useFileAudio(item);

  /* ---------- جواب‌ها ---------- */
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
        const data = evaluateStaticAnswers(item, answers, getProgress("listening", item.id));
        setResult(data);
        saveProgress("listening", item.id, data.stars, data.percent);
        setBestStars((prev) => Math.max(prev, data.stars));
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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <ListeningHeader
        onBack={() => router.push("/training/listening")}
        titleFa={item.titleFa}
        title={item.title}
        level={item.level}
        xp={item.xp}
        bestStars={bestStars}
      />

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
          src={item.audioUrl}
          audioRef={audioRef}
          playing={audioPlaying}
          time={audioTime}
          duration={audioDuration}
          onToggle={toggleAudio}
          onSeek={seekTo}
          onRestart={restartAudio}
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
        onLineClick={(i) => speakFrom(i)}
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
          <ListeningResult
            key="listening-result"
            result={result}
            onBack={() => router.push("/training/listening")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
