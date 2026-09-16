"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  User as UserIcon,
  Play,
  Square,
  RotateCcw,
  Mic,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Volume2,
} from "lucide-react";
import type { ConversationLesson } from "@/data/lessons/types";
import { convLineAudio, playLine, canSpeak } from "@/lib/lesson-audio";
import ContinueButton from "../ContinueButton";
import ProgressStepper from "../ProgressStepper";

type Props = {
  lesson: ConversationLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS = ["گفت‌وگو", "آزمونک"];

export default function ConversationView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const lines = lesson.lines;
  const quiz = lesson.quiz;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [rolePlay, setRolePlay] = useState(false);
  const [waitingUser, setWaitingUser] = useState(false);
  const [listened, setListened] = useState(false);
  const [revealed, setRevealed] = useState(lines.length);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef(false);
  const waitingUserRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentQ = quiz[qIndex];

  // پاک‌سازی هنگام خروج
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      stopRef.current?.();
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const playFrom = async (start: number) => {
    cancelRef.current = false;
    setPlaying(true);
    for (let i = start; i < lines.length; i++) {
      if (cancelRef.current) break;
      const line = lines[i];
      setActiveLine(i);
      setRevealed((r) => Math.max(r, i + 1));
      scrollToBottom();

      // حالت تمرین: نوبت کاربر — خودش می‌خواند
      if (rolePlay && line.speaker === "user") {
        setWaitingUser(true);
        waitingUserRef.current = true;
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (cancelRef.current || !waitingUserRef.current) {
              clearInterval(check);
              resolve();
            }
          }, 150);
        });
        setWaitingUser(false);
        if (cancelRef.current) break;
        continue;
      }

      // انیمیشن تایپ قبل از حرف‌های سایت
      if (line.speaker === "site") {
        setTyping(true);
        await new Promise((r) => setTimeout(r, 750));
        setTyping(false);
        if (cancelRef.current) break;
      }

      const { promise, stop } = playLine(
        convLineAudio(lesson.slug, i),
        line.en,
        { voiceHint: line.speaker, rate: 0.95 },
      );
      stopRef.current = stop;
      await promise;
      stopRef.current = null;
      if (cancelRef.current) break;

      // مکث کوتاه بین خطوط
      await new Promise((r) => setTimeout(r, 350));
    }
    if (!cancelRef.current) {
      setListened(true);
      setActiveLine(null);
      setPlaying(false);
    }
  };

  const continueAfterUser = () => {
    waitingUserRef.current = false;
    setWaitingUser(false);
  };

  const stopAll = () => {
    cancelRef.current = true;
    waitingUserRef.current = false;
    stopRef.current?.();
    if (canSpeak()) window.speechSynthesis.cancel();
    setPlaying(false);
    setTyping(false);
    setWaitingUser(false);
    setActiveLine(null);
  };

  const replayLine = async (i: number) => {
    if (playing) return;
    const line = lines[i];
    setActiveLine(i);
    const { promise, stop } = playLine(
      convLineAudio(lesson.slug, i),
      line.en,
      { voiceHint: line.speaker, rate: 0.95 },
    );
    stopRef.current = stop;
    await promise;
    stopRef.current = null;
    if (activeLine === i) setActiveLine(null);
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

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: گفت‌وگو ---------- */}
        {step === 0 && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* موقعیت */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <MessageCircle size={18} />
                </span>
                <h3 className="font-bold text-slate-900">سناریوی مکالمه</h3>
              </div>
              <p className="text-slate-600 text-sm leading-7">
                {lesson.situation}
              </p>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  قرمز = سایت (طرف مقابل)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  آبی = نقش شما
                </span>
              </div>
            </motion.div>

            {/* ناحیه چت */}
            <div
              ref={scrollRef}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[380px] overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {lines.slice(0, revealed).map((line, i) => {
                const isSite = line.speaker === "site";
                const isActive = i === activeLine;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={`flex gap-2 ${isSite ? "flex-row" : "flex-row-reverse"}`}
                  >
                    {/* آواتار */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                        isSite
                          ? "bg-gradient-to-br from-rose-500 to-red-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      } ${isActive ? "ring-4 ring-offset-1 " + (isSite ? "ring-red-200" : "ring-blue-200") : ""}`}
                    >
                      {isSite ? <Bot size={16} /> : <UserIcon size={16} />}
                    </div>
                    {/* حباب */}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 cursor-pointer transition-shadow ${
                        isSite
                          ? "bg-gradient-to-br from-rose-50 to-red-50 border border-red-200 rounded-tr-sm"
                          : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-tl-sm"
                      } ${
                        isActive
                          ? isSite
                            ? "shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
                            : "shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                          : "shadow-sm"
                      }`}
                      onClick={() => replayLine(i)}
                    >
                      <p
                        dir="ltr"
                        className={`text-left text-sm font-semibold leading-7 ${
                          isSite ? "text-red-900" : "text-blue-900"
                        }`}
                      >
                        {line.en}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-5 mt-0.5">
                        {line.fa}
                      </p>
                      <div className="flex justify-start mt-1">
                        <span
                          className={`flex items-center gap-1 text-[10px] ${
                            isSite ? "text-red-300" : "text-blue-300"
                          } hover:text-red-400`}
                        >
                          <Volume2 size={12} />
                          پخش مجدد
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* نشانگر تایپ */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 text-white">
                    <Bot size={16} />
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: d * 0.15,
                        }}
                        className="w-2 h-2 rounded-full bg-red-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div className="h-1" />
            </div>

            {/* نوار کنترل */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                {!playing ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => playFrom(0)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    <Play size={18} />
                    {listened ? "پخش مجدد مکالمه" : "پخش مکالمه"}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={stopAll}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    <Square size={18} />
                    توقف
                  </motion.button>
                )}
                <button
                  onClick={() => {
                    stopAll();
                    setRolePlay((r) => !r);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    rolePlay
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                  title="در این حالت نوبت‌های آبی را خودتان بلند می‌خوانید"
                >
                  <Mic size={16} />
                  حالت تمرین
                </button>
              </div>

              {/* منتظر خواندن کاربر */}
              <AnimatePresence>
                {waitingUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-blue-800 text-sm font-bold">
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Mic size={18} />
                        </motion.span>
                        نوبت شماست — این خط را بلند بخوانید
                      </div>
                      <button
                        onClick={continueAfterUser}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0"
                      >
                        خواندم، ادامه
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  stopAll();
                  setStep(1);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium py-1"
              >
                رفتن به آزمونک ←
              </button>
            </div>
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
            <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 rounded-full px-3 py-1">
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
                    "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50";
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
                      <span
                        dir={/[a-zA-Z]/.test(opt) ? "ltr" : "rtl"}
                        className={
                          /[a-zA-Z]/.test(opt)
                            ? "block text-left flex-1 text-slate-800 text-sm"
                            : "flex-1 text-slate-800 text-sm"
                        }
                      >
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
                    <p className="mt-3 text-xs text-slate-600 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 leading-6">
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
                className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium"
              >
                <RotateCcw size={12} className="inline mr-1" />
                بازگشت به مکالمه
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {listened && step === 0 && !playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1 text-xs text-green-600 font-bold"
        >
          <CheckCircle2 size={14} />
          مکالمه کامل پخش شد — حالا آزمونک را انجام دهید
        </motion.div>
      )}
    </div>
  );
}
