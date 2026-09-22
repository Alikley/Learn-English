"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Gauge,
  Headphones,
  BookOpen,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import type { ListeningLesson } from "@/data/lessons/types";
import { LISTENING_TIMINGS } from "@/data/lessons/listening-timings";
import { storyAudio, speakFallback, canSpeak } from "@/lib/lesson-audio";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../ContinueButton";
import ProgressStepper from "../ProgressStepper";

type Props = {
  lesson: ListeningLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [["داستان", "Story"], ["آزمونک", "Quiz"]];
const SPEEDS = [0.75, 1, 1.25];

function fmt(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ListeningView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const { tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentPara, setCurrentPara] = useState(-1);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [listened, setListened] = useState(false);
  // اگر فایل صوتی نبود → روایت پاراگراف‌به‌پاراگراف با صدای مرورگر
  const [fallbackMode, setFallbackMode] = useState(false);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);

  const quiz = lesson.quiz;
  const currentQ = quiz[qIndex];
  const timing = LISTENING_TIMINGS[lesson.slug];
  const total = timing?.total ?? 0;

  const findPara = (t: number): number => {
    if (!timing) return -1;
    let idx = 0;
    for (let i = 0; i < timing.starts.length; i++) {
      if (t >= timing.starts[i]) idx = i;
    }
    return idx;
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      cancelRef.current = true;
      audio?.pause();
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  // اسکرول خودکار پاراگراف فعال
  useEffect(() => {
    if (currentPara >= 0 && paraRefs.current[currentPara]) {
      paraRefs.current[currentPara]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentPara]);

  const playFile = () => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    audioRef.current.play();
    setPlaying(true);
  };

  const pauseFile = () => {
    audioRef.current?.pause();
    if (canSpeak()) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  // روایت جایگزین: پاراگراف‌به‌پاراگراف با صدای مرورگر
  const playFallback = async () => {
    cancelRef.current = false;
    setPlaying(true);
    for (let i = 0; i < lesson.paragraphs.length; i++) {
      if (cancelRef.current) break;
      setCurrentPara(i);
      await speakFallback(lesson.paragraphs[i], {
        voiceHint: "narrator",
        rate: speed * 0.95,
      });
    }
    if (!cancelRef.current) {
      setListened(true);
      setPlaying(false);
      setCurrentPara(-1);
    }
  };

  const togglePlay = () => {
    if (playing) {
      pauseFile();
      cancelRef.current = true; // متوقف کردن روایت جایگزین
      setPlaying(false);
      return;
    }
    if (fallbackMode || !timing) {
      void playFallback();
    } else {
      playFile();
    }
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const seekTo = (paraIndex: number) => {
    if (!timing || !audioRef.current) return;
    const t = timing.starts[paraIndex] ?? 0;
    audioRef.current.currentTime = t;
    setCurrentPara(paraIndex);
    if (!playing) {
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setPlaying(true);
    }
  };

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

  const progressPct = useMemo(() => {
    if (!timing || !total) return 0;
    return Math.min(100, (time / total) * 100);
  }, [time, timing, total]);

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS.map(([fa, en]) => tr(fa, en))} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: داستان ---------- */}
        {step === 0 && (
          <motion.div
            key="story"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* توضیح */}
            <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm flex items-start gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <BookOpen size={18} />
              </span>
              <p className="text-slate-600 text-sm leading-7 pt-1">
                {lesson.description}
              </p>
            </div>

            {/* پخش‌کننده */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-l from-orange-50 to-white border border-orange-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={togglePlay}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 transition-colors ${
                    playing
                      ? "bg-gradient-to-br from-orange-500 to-amber-500"
                      : "bg-gradient-to-br from-orange-500 to-red-500"
                  }`}
                >
                  {playing ? (
                    <Pause size={26} />
                  ) : (
                    <motion.span
                      animate={
                        !playing && !listened
                          ? { scale: [1, 1.08, 1] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      <Play size={26} className="mr-1" />
                    </motion.span>
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1 font-semibold text-orange-700">
                      <Headphones size={14} />
                      {fallbackMode && !timing
                        ? tr("روایت داستان", "Story Narration")
                        : tr("داستان صوتی ۵ دقیقه‌ای", "5-minute audio story")}
                    </span>
                    <span dir="ltr" className="font-mono">
                      {fmt(time)} / {fmt(total)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-orange-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-l from-orange-500 to-amber-400"
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* سرعت */}
                <div className="flex items-center gap-1 shrink-0">
                  <Gauge size={14} className="text-orange-400" />
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        speed === s
                          ? "bg-orange-500 text-white"
                          : "bg-orange-50 text-orange-400 hover:bg-orange-100"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {listened && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 text-xs text-green-600 font-bold mt-3"
                >
                  <CheckCircle2 size={14} />
                  {tr("داستان کامل شنیده شد — عالی! حالا آزمونک درک مطلب", "Full story heard — great! Now the comprehension quiz")}
                </motion.p>
              )}
            </motion.div>

            {/* واژگان کلیدی */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 mb-2">
                {tr("واژگان کلیدی داستان", "Story Key Vocabulary")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {lesson.keyVocab.map((v, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="text-xs bg-orange-50 border border-orange-100 text-orange-800 rounded-full px-3 py-1.5"
                  >
                    <b dir="ltr" className="font-mono">
                      {v.word}
                    </b>
                    <span className="text-orange-300 mx-1">·</span>
                    {v.fa}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* متن داستان (کاراته) */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 max-h-[340px] overflow-y-auto">
              {lesson.paragraphs.map((para, i) => {
                const active = i === currentPara;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      paraRefs.current[i] = el;
                    }}
                    onClick={() => seekTo(i)}
                    className={`rounded-xl px-3 py-2.5 transition-all cursor-pointer border ${
                      active
                        ? "bg-orange-50 border-orange-300 shadow-sm scale-[1.01]"
                        : "bg-slate-50/60 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <p
                      dir="ltr"
                      className={`text-left text-sm leading-7 transition-colors ${
                        active
                          ? "text-orange-900 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      <HoverableText text={para} />
                    </p>
                  </div>
                );
              })}
            </div>

            <ContinueButton
              onClick={() => {
                pauseFile();
                cancelRef.current = true;
                setPlaying(false);
                setStep(1);
              }}
              label={tr("رفتن به آزمونک", "Go to Quiz")}
            />
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
            <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 rounded-full px-3 py-1">
                  {tr("سؤال", "Question")} {qIndex + 1} {tr("از", "of")} {quiz.length}
                </span>
                <span className="text-xs text-green-600 font-bold">
                  {correctCount} {tr("درست", "correct")}
                </span>
              </div>
              <p className="font-semibold text-slate-900 mb-4 leading-7">
                <HoverableText text={currentQ.question} />
              </p>
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const isCorrect = i === currentQ.correctIndex;
                  const isSelected = i === selected;
                  let cls =
                    "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50";
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
                      className={`w-full text-start border-2 rounded-xl px-4 py-3 transition-all ${cls}`}
                    >
                      <span className="flex items-center gap-2 text-slate-800 text-sm">
                        <HoverableText text={opt} />
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
                    <p className="mt-3 text-xs text-slate-600 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 leading-6">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selected !== null && (
              <ContinueButton
                onClick={nextQuestion}
                label={qIndex < quiz.length - 1 ? tr("سؤال بعدی", "Next Question") : tr("تکمیل درس", "Finish Lesson")}
                loading={completing && qIndex === quiz.length - 1}
              />
            )}
            {qIndex === 0 && selected === null && (
              <button
                onClick={() => setStep(0)}
                className="w-full text-center text-xs text-slate-400 hover:text-orange-600 font-medium"
              >
                <Repeat size={12} className="inline mr-1" />
                {tr("گوش دادن دوباره", "Listen Again")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* عنصر صوتی پنهان — فقط وقتی زمان‌بندی فایل موجود است */}
      {timing && (
        <audio
          ref={audioRef}
          src={storyAudio(lesson.slug)}
          preload="metadata"
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setTime(t);
            const p = findPara(t);
            if (p !== currentPara) setCurrentPara(p);
          }}
          onEnded={() => {
            setListened(true);
            setPlaying(false);
            setCurrentPara(-1);
          }}
          onError={() => {
            // فایل صوتی هنوز آماده نیست → روایت جایگزین
            setFallbackMode(true);
            setPlaying(false);
          }}
        />
      )}
    </div>
  );
}
