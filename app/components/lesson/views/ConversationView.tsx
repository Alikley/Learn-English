"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  User as UserIcon,
  Play,
  Square,
  RotateCcw,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Volume2,
  Mic,
  ArrowLeft,
} from "lucide-react";
import type { ConversationLesson } from "@/data/lessons/types";
import { convLineAudio, playLine, canSpeak } from "@/lib/lesson-audio";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../ContinueButton";
import ProgressStepper from "../ProgressStepper";

// ========================================
// تمرین مکالمه — v1.0.1.3 (بازطراحی کامل)
//
// طبق بازخورد کاربر:
//  - فقط «قرمز» صحبت می‌کند: خطوط سایت با صدا
//    پخش می‌شوند و خطوط آبی هیچ‌وقت از طرف سایت
//    خوانده نمی‌شوند.
//  - جریان پله‌پله: خط قرمز پخش می‌شود → خط آبی
//    ظاهر می‌شود → کاربر آن را «برای خودش» می‌خواند →
//    دکمه «خواندم، جمله بعدی» را می‌زند → جمله بعدی.
//  - تعداد جمله‌ها بیشتر شده (۲۰+ خط در هر درس).
//  - نوار پیشرفت «جمله X از Y» همیشه دیده می‌شود.
// ========================================

type Props = {
  lesson: ConversationLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [["گفت‌وگو", "Dialogue"], ["آزمونک", "Quiz"]];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ConversationView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const { tr } = useLanguage();
  const lines = lesson.lines;
  const quiz = lesson.quiz;

  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [waitingUser, setWaitingUser] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef(false);
  const waitingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentQ = quiz[qIndex];

  // پاک‌سازی هنگام خروج
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      waitingRef.current = false;
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

  // ---------- جریان پله‌پله ----------
  // خط قرمز (سایت): تایپ → پخش صدا → رفتن به خط بعدی
  // خط آبی (کاربر): نمایش → کاربر خودش می‌خواند → دکمه ادامه
  const runFrom = async (start: number) => {
    cancelRef.current = false;
    setRunning(true);
    setPausedAt(null);
    for (let i = start; i < lines.length; i++) {
      if (cancelRef.current) break;
      const line = lines[i];
      setCurrent(i);
      setRevealed((r) => Math.max(r, i + 1));
      scrollToBottom();

      if (line.speaker === "site") {
        // انیمیشن تایپ قبل از حرف‌های سایت
        setTyping(true);
        await sleep(750);
        setTyping(false);
        if (cancelRef.current) break;

        // فقط سایت صحبت می‌کند — هیچ خط آبی صدا ندارد
        const { promise, stop } = playLine(
          convLineAudio(lesson.slug, i),
          line.en,
          { voiceHint: "site", rate: 0.95 },
        );
        stopRef.current = stop;
        await promise;
        stopRef.current = null;
        if (cancelRef.current) break;
        await sleep(300);
      } else {
        // نوبت کاربر: خودش برای خودش می‌خواند، بعد دکمه می‌زند
        setWaitingUser(true);
        waitingRef.current = true;
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (cancelRef.current || !waitingRef.current) {
              clearInterval(check);
              resolve();
            }
          }, 120);
        });
        setWaitingUser(false);
        if (cancelRef.current) break;
      }
    }
    if (!cancelRef.current) {
      setFinished(true);
      setCurrent(null);
      setRunning(false);
    }
  };

  const userReadIt = () => {
    waitingRef.current = false;
    setWaitingUser(false);
  };

  const stopAll = () => {
    cancelRef.current = true;
    waitingRef.current = false;
    stopRef.current?.();
    if (canSpeak()) window.speechSynthesis.cancel();
    setRunning(false);
    setTyping(false);
    setWaitingUser(false);
    // از همان خط نیمه‌کاره ادامه می‌دهیم
    setPausedAt((p) => p ?? current ?? 0);
    setCurrent(null);
  };

  const restart = () => {
    setRevealed(0);
    setFinished(false);
    setPausedAt(null);
    setCurrent(null);
    runFrom(0);
  };

  // پخش مجدد فقط برای خطوط قرمز (سایت)
  const replayLine = async (i: number) => {
    if (running) return;
    const line = lines[i];
    if (line.speaker !== "site") return;
    setCurrent(i);
    const { promise, stop } = playLine(
      convLineAudio(lesson.slug, i),
      line.en,
      { voiceHint: "site", rate: 0.95 },
    );
    stopRef.current = stop;
    await promise;
    stopRef.current = null;
    setCurrent((c) => (c === i ? null : c));
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

  const progressPct = Math.round((revealed / lines.length) * 100);

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS.map(([fa, en]) => tr(fa, en))} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: گفت‌وگوی پله‌پله ---------- */}
        {step === 0 && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* موقعیت + راهنمای رنگ‌ها */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <MessageCircle size={18} />
                </span>
                <h3 className="font-bold text-slate-900">{tr("سناریوی مکالمه", "Conversation Scenario")}</h3>
              </div>
              <p className="text-slate-600 text-sm leading-7">
                {lesson.situation}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  {tr("قرمز = سایت صحبت می‌کند (با صدا)", "Red = the site speaks (with audio)")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  {tr("آبی = نقش شما؛ خودتان بخوانید و دکمه را بزنید", "Blue = your role; read it yourself and press the button")}
                </span>
              </div>
            </motion.div>

            {/* نوار پیشرفت جمله‌ها */}
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-teal-700">
                  {tr("جمله", "Sentence")} {Math.min(revealed, lines.length)} {tr("از", "of")} {lines.length}
                </span>
                <span className="text-slate-400">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-teal-600 to-teal-400"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* ناحیه چت */}
            <div
              ref={scrollRef}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[380px] overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {revealed === 0 && !running && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg"
                  >
                    <Bot size={28} />
                  </motion.div>
                  <p className="text-sm text-slate-500 leading-7 max-w-xs">
                    {tr(`سایت شروع می‌کند و صحبت می‌کند؛ وقتی نوبت شما شد، جمله آبی
                    را برای خودتان بخوانید و دکمه ادامه را بزنید.`, "The site starts and speaks; when it is your turn, read the blue sentence to yourself and press Continue.")}
                  </p>
                </div>
              )}

              {lines.slice(0, revealed).map((line, i) => {
                const isSite = line.speaker === "site";
                const isActive = i === current;
                const isWaitingHere = isActive && waitingUser;
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
                      } ${
                        isActive
                          ? "ring-4 ring-offset-1 " +
                            (isSite ? "ring-red-200" : "ring-blue-200")
                          : ""
                      }`}
                    >
                      {isSite ? <Bot size={16} /> : <UserIcon size={16} />}
                    </div>
                    {/* حباب */}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 transition-shadow ${
                        isSite
                          ? "bg-gradient-to-br from-rose-50 to-red-50 border border-red-200 rounded-tr-sm cursor-pointer"
                          : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-tl-sm"
                      } ${
                        isActive
                          ? isSite
                            ? "shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
                            : "shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                          : "shadow-sm"
                      }`}
                      onClick={() => void replayLine(i)}
                    >
                      <p
                        dir="ltr"
                        className={`text-left text-sm font-semibold leading-7 ${
                          isSite ? "text-red-900" : "text-blue-900"
                        }`}
                      >
                        <HoverableText text={line.en} />
                      </p>
                      <p className="text-[11px] text-slate-400 leading-5 mt-0.5">
                        {line.fa}
                      </p>
                      {/* پخش مجدد فقط برای خطوط قرمز سایت */}
                      {isSite && (
                        <div className="flex justify-start mt-1">
                          <span
                            className={`flex items-center gap-1 text-[10px] ${
                              isActive ? "text-red-400" : "text-red-300"
                            } hover:text-red-400`}
                          >
                            <Volume2 size={12} />
                            {tr("پخش مجدد", "Replay")}
                          </span>
                        </div>
                      )}
                      {!isSite && isWaitingHere && (
                        <div className="flex justify-start mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-blue-400">
                            <BookOpen size={12} />
                            {tr("این جمله را شما بخوانید", "You read this sentence")}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* نشانگر تایپ سایت */}
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
                {!running ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      finished
                        ? restart()
                        : runFrom(pausedAt ?? revealed)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {finished ? (
                      <>
                        <RotateCcw size={18} />
                        {tr("تمرین مجدد مکالمه", "Practice Conversation Again")}
                      </>
                    ) : revealed === 0 ? (
                      <>
                        <Play size={18} />
                        {tr("شروع مکالمه", "Start Conversation")}
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        {tr("ادامه مکالمه", "Continue Conversation")}
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={stopAll}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    <Square size={18} />
                    {tr("توقف", "Stop")}
                  </motion.button>
                )}
                {!running && revealed > 0 && !finished && (
                  <button
                    onClick={restart}
                    className="flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold border-2 bg-white border-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                    title={tr("شروع دوباره از جمله اول", "Restart from the first sentence")}
                  >
                    <RotateCcw size={16} />
                    {tr("از اول", "Start Over")}
                  </button>
                )}
              </div>

              {/* منتظر خواندن کاربر — پله‌پله */}
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
                        {tr("نوبت شماست — این جمله را برای خودتان بخوانید", "Your turn — read this sentence to yourself")}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={userReadIt}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0 flex items-center gap-1.5"
                      >
                        {tr("خواندم، جمله بعدی", "I've read it — next sentence")}
                        <ArrowLeft size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* پایان مکالمه */}
              <AnimatePresence>
                {finished && !running && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <ContinueButton
                      onClick={() => setStep(1)}
                      label={tr("شروع آزمونک", "Start Quiz")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!finished && (
                <button
                  onClick={() => {
                    stopAll();
                    setStep(1);
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium py-1"
                >
                  {tr("رفتن به آزمونک ←", "Go to Quiz →")}
                </button>
              )}
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
                  {tr("سؤال", "Question")} {qIndex + 1} {tr("از", "of")} {quiz.length}
                </span>
                <span className="text-xs text-green-600 font-bold">
                  {correctCount} {tr("درست", "correct")}
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
                      className={`w-full text-start border-2 rounded-xl px-4 py-3 transition-all ${cls}`}
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
                label={qIndex < quiz.length - 1 ? tr("سؤال بعدی", "Next Question") : tr("تکمیل درس", "Finish Lesson")}
                loading={completing && qIndex === quiz.length - 1}
              />
            )}
            {qIndex === 0 && selected === null && (
              <button
                onClick={() => setStep(0)}
                className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium"
              >
                <RotateCcw size={12} className="inline mr-1" />
                {tr("بازگشت به مکالمه", "Back to Conversation")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {finished && step === 0 && !running && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1 text-xs text-green-600 font-bold"
        >
          <CheckCircle2 size={14} />
          {tr("مکالمه کامل شد — حالا آزمونک را انجام دهید", "Conversation complete — now take the quiz")}
        </motion.div>
      )}
    </div>
  );
}
