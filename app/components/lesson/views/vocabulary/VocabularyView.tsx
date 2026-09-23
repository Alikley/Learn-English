"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { VocabularyLesson } from "@/data/lessons/types";
import { playLine, canSpeak } from "@/lib/lesson-audio";
import ProgressStepper from "../../ProgressStepper";
import FlashCard from "./FlashCard";
import VocabularyQuizStep from "./VocabularyQuizStep";

// ========================================
// نمای درس واژگان — فلش‌کارت‌های دو رو + آزمونک
// v1.0.2.7 — ریفکتوری: فلش‌کارت و آزمونک به کامپوننت‌های
// خودشان در همین فولدر تفکیک شدند.
// ========================================

type Props = {
  lesson: VocabularyLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [["کارت‌ها", "Cards"], ["آزمونک", "Quiz"]];

export default function VocabularyView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const { tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playingWord, setPlayingWord] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const words = lesson.words;
  const quiz = lesson.quiz;
  const currentQ = quiz[qIndex];
  const word = words[cardIndex];

  useEffect(() => {
    return () => {
      stopRef.current?.();
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  // پخش خودکار کلمه وقتی کارت عوض می‌شود (بعد از اولین تعامل کاربر)
  // setState فقط داخل callback غیرهمگام → بدون هشدار cascade render
  useEffect(() => {
    if (step !== 0) return;
    let stopped = false;
    const { promise, stop } = playLine(
      `/audio/vocabulary/${lesson.slug}/word-${cardIndex}.mp3`,
      word.word,
      { voiceHint: "user", rate: 0.85 },
    );
    stopRef.current = stop;
    promise.then(() => {
      stopRef.current = null;
      if (!stopped) setPlayingWord(false);
    });
    return () => {
      stopped = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, step]);

  const playWord = () => {
    // اگر پخش خودکار در جریان است، اول متوقف شود
    stopRef.current?.();
    stopRef.current = null;
    if (canSpeak()) window.speechSynthesis.cancel();
    setPlayingWord(true);
    const { promise, stop } = playLine(
      `/audio/vocabulary/${lesson.slug}/word-${cardIndex}.mp3`,
      word.word,
      { voiceHint: "user", rate: 0.85 },
    );
    stopRef.current = stop;
    promise.then(() => {
      stopRef.current = null;
      setPlayingWord(false);
    });
  };

  const goToCard = (i: number) => {
    setFlipped(false);
    setCardIndex(i);
  };

  const next = () => goToCard(Math.min(cardIndex + 1, words.length - 1));
  const prev = () => goToCard(Math.max(cardIndex - 1, 0));

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === currentQ.correctIndex) setCorrectCount((c) => c + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    if (qIndex < quiz.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      onComplete(Math.round((correctCount / quiz.length) * 100));
    }
  };

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS.map(([fa, en]) => tr(fa, en))} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: فلش‌کارت‌ها ---------- */}
        {step === 0 && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* مقدمه */}
            <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-sm flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </span>
              <p className="text-slate-600 text-sm leading-7">{lesson.intro}</p>
            </div>

            {/* فلش‌کارت */}
            <FlashCard
              cardIndex={cardIndex}
              flipped={flipped}
              playingWord={playingWord}
              word={word}
              onFlip={() => setFlipped((f) => !f)}
              onPlayWord={playWord}
            />

            {/* ناوبری */}
            <div className="flex items-center justify-between max-w-md mx-auto">
              <button
                onClick={prev}
                disabled={cardIndex === 0}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-600 font-medium disabled:opacity-30"
              >
                <ArrowRight size={18} />
                {tr("قبلی", "Previous")}
              </button>

              <div className="flex items-center gap-1.5">
                {words.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToCard(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === cardIndex
                        ? "w-6 bg-purple-500"
                        : "w-2 bg-purple-200 hover:bg-purple-300"
                    }`}
                  />
                ))}
              </div>

              {cardIndex < words.length - 1 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-bold"
                >
                  {tr("بعدی", "Next")}
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-bold"
                >
                  <CheckCircle2 size={16} />
                  {tr("تمام شد", "Done")}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-slate-400">
              {tr("کلمه", "Word")} {cardIndex + 1} {tr("از", "of")} {words.length}
            </p>

            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-400 hover:text-purple-600 font-medium py-2"
            >
              {tr("رفتن به آزمونک ←", "Go to Quiz →")}
            </button>
          </motion.div>
        )}

        {/* ---------- گام ۲: آزمونک ---------- */}
        {step === 1 && (
          <VocabularyQuizStep
            lesson={lesson}
            qIndex={qIndex}
            selected={selected}
            correctCount={correctCount}
            completing={completing}
            onSelect={handleSelect}
            onNext={nextQuestion}
            onBack={() => setStep(0)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
