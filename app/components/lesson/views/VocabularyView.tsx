"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import type { VocabularyLesson } from "@/data/lessons/types";
import { playLine, canSpeak } from "@/lib/lesson-audio";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../ContinueButton";
import ProgressStepper from "../ProgressStepper";

type Props = {
  lesson: VocabularyLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS = ["کارت‌ها", "آزمونک"];

export default function VocabularyView({
  lesson,
  onComplete,
  completing,
}: Props) {
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
      <ProgressStepper sections={STEPS} currentIndex={step} />

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
            <div className="relative" style={{ perspective: 1000 }}>
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, x: 40, rotateY: -25 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="mx-auto max-w-md cursor-pointer"
                onClick={() => setFlipped((f) => !f)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {!flipped ? (
                  /* روی کارت: کلمه */
                  <motion.div
                    key={`front-${cardIndex}`}
                    initial={{ rotateY: 0 }}
                    className="bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl shadow-xl p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-4"
                  >
                    <span className="text-purple-200 text-xs font-bold bg-white/10 rounded-full px-3 py-1">
                      {word.pos}
                    </span>
                    <p
                      dir="ltr"
                      className="text-white text-3xl md:text-4xl font-bold tracking-wide"
                    >
                      <HoverableText text={word.word} />
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playWord();
                      }}
                      className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <Volume2
                        size={16}
                        className={playingWord ? "animate-pulse" : ""}
                      />
                      تلفظ
                    </button>
                    <p className="text-purple-200 text-[11px] flex items-center gap-1">
                      <RotateCcw size={12} />
                      برای دیدن معنی، کارت را لمس کنید
                    </p>
                  </motion.div>
                ) : (
                  /* پشت کارت: معنی + مثال */
                  <motion.div
                    key={`back-${cardIndex}`}
                    initial={{ rotateY: 180, opacity: 0.6 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    className="bg-white border-2 border-purple-200 rounded-3xl shadow-xl p-6 min-h-[240px] flex flex-col justify-center gap-3"
                  >
                    <div className="text-center">
                      <p
                        dir="ltr"
                        className="text-purple-400 text-sm font-semibold"
                      >
                        <HoverableText text={word.word} />
                      </p>
                      <p className="text-slate-900 text-2xl font-bold mt-1">
                        {word.fa}
                      </p>
                    </div>
                    <div className="border-t border-dashed border-purple-100 pt-3">
                      <p
                        dir="ltr"
                        className="text-left text-slate-800 text-sm leading-7"
                      >
                        <HoverableText text={word.example} />
                      </p>
                      <p className="text-slate-400 text-xs leading-6 mt-1">
                        {word.exampleFa}
                      </p>
                    </div>
                    <p className="text-purple-300 text-[11px] flex items-center gap-1 justify-center">
                      <RotateCcw size={12} />
                      لمس کنید تا به کلمه برگردید
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* ناوبری */}
            <div className="flex items-center justify-between max-w-md mx-auto">
              <button
                onClick={prev}
                disabled={cardIndex === 0}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-600 font-medium disabled:opacity-30"
              >
                <ArrowRight size={18} />
                قبلی
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
                  بعدی
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-bold"
                >
                  <CheckCircle2 size={16} />
                  تمام شد
                </button>
              )}
            </div>

            <p className="text-center text-xs text-slate-400">
              کلمه {cardIndex + 1} از {words.length}
            </p>

            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-400 hover:text-purple-600 font-medium py-2"
            >
              رفتن به آزمونک ←
            </button>
          </motion.div>
        )}

        {/* ---------- گام ۲: آزمونک ---------- */}
        {step === 1 && currentQ && (
          <motion.div
            key={`quiz-${qIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 rounded-full px-3 py-1">
                  سؤال {qIndex + 1} از {quiz.length}
                </span>
                <span className="text-xs text-green-600 font-bold">
                  {correctCount} درست
                </span>
              </div>
              <p className="font-semibold text-slate-900 mb-4 leading-7">
                {currentQ.question}
              </p>
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const isCorrect = i === currentQ.correctIndex;
                  const isSelected = i === selected;
                  let cls =
                    "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50";
                  if (selected !== null) {
                    if (isCorrect) cls = "border-green-400 bg-green-50";
                    else if (isSelected) cls = "border-red-300 bg-red-50";
                    else cls = "border-slate-100 bg-white opacity-60";
                  }
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        selected !== null && isSelected && !isCorrect
                          ? { x: [0, -6, 6, -4, 4, 0] }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={`w-full text-right border-2 rounded-xl px-4 py-3 transition-all ${cls}`}
                    >
                      <span className="flex items-center gap-2 text-slate-800 text-sm">
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-xs text-slate-600 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 leading-6">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selected !== null && (
              <ContinueButton
                onClick={nextQuestion}
                label={qIndex < quiz.length - 1 ? "سؤال بعدی" : "تکمیل درس"}
                loading={completing && qIndex === quiz.length - 1}
              />
            )}
            {qIndex === 0 && selected === null && (
              <button
                onClick={() => setStep(0)}
                className="w-full text-center text-xs text-slate-400 hover:text-purple-600 font-medium"
              >
                <Repeat size={12} className="inline mr-1" />
                مرور دوباره کارت‌ها
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
