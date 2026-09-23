"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, Zap } from "lucide-react";
import {
  getListeningLevel,
  ListeningEpisode,
  ListeningGap,
} from "@/types/listening";
import AudioPlayer from "./_components/AudioPlayer";
import GapTranscript, { type TranscriptSegment } from "./_components/GapTranscript";
import ResultCard, { type EpisodeResult } from "./_components/ResultCard";
import {
  SubmitAnswersButton,
  RetryButton,
} from "@/app/training/_components/PracticeResultBits";

// ========================================
// تمرین شنیداری [episodeId] — پلیر + ترنسکریپت با جای خالی
// منطق دریافت/ارسال اینجا؛ پلیر/ترنسکریپت/نتیجه در _components
// (v1.0.2.7 — ریفکتوری گام ۲)
// ========================================

export default function ListeningExercisePage() {
  const { tr, dir } = useLanguage();
  const { episodeId } = useParams<{ episodeId: string }>();
  const router = useRouter();

  const [episode, setEpisode] = useState<ListeningEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EpisodeResult | null>(null);

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
  const segments = useMemo<TranscriptSegment[]>(() => {
    if (!episode) return [];
    const regex = /\{(\d+)\}/g;
    const parts: TranscriptSegment[] = [];
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

  if (loading) return <PageLoading />;

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">{tr("قسمت یافت نشد", "Episode not found")}</p>
        <button
          onClick={() => router.push("/training")}
          className="text-orange-600 text-sm"
        >
          {tr("بازگشت", "Back")}
        </button>
      </div>
    );
  }

  const gapsMap = new Map(
    (episode.gaps as ListeningGap[]).map((g) => [g.id, g]),
  );
  const levelInfo = getListeningLevel(episode.level);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
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
            {tr(`ابتدا به فایل صوتی گوش بده. سپس کلمات جاخالی رو توی فرم‌ها بنویس.
            برای راهنمایی روی آیکون لامپ کلیک کن.`, "First listen to the audio. Then fill the blanks in the forms. Click the lamp icon for a hint.")}
          </span>
        </p>
      </div>

      {/* متن ترنسکرایب + blanks */}
      <GapTranscript
        segments={segments}
        gapsMap={gapsMap}
        answers={answers}
        hints={hints}
        hasResult={result !== null}
        onSetAnswer={setAnswer}
        onToggleHint={toggleHint}
      />

      {/* دکمه ارسال / تلاش مجدد */}
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

      {/* نتیجه */}
      {result && (
        <ResultCard
          result={result}
          onBack={() => router.push("/training")}
        />
      )}
    </div>
  );
}
