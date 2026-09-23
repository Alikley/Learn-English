"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, MessageCircle, CheckCircle2 } from "lucide-react";
import type { ConversationLesson } from "@/data/lessons/types";
import ProgressStepper from "../../ProgressStepper";
import ConversationBubble from "./ConversationBubble";
import TypingIndicator from "./TypingIndicator";
import ConversationControls from "./ConversationControls";
import ConversationQuiz from "./ConversationQuiz";
import useConversationPlayback from "./useConversationPlayback";

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
//
// v1.0.2.7 — ریفکتوری: حباب‌ها، نشانگر تایپ، نوار کنترل و
// آزمونک به کامپوننت‌های خودشان و موتور پخش به
// useConversationPlayback در همین فولدر تفکیک شدند.
// ========================================

type Props = {
  lesson: ConversationLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [["گفت‌وگو", "Dialogue"], ["آزمونک", "Quiz"]];

export default function ConversationView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const { tr } = useLanguage();
  const lines = lesson.lines;
  const quiz = lesson.quiz;

  const [step, setStep] = useState(0);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // موتور پخش گفت‌وگو
  const {
    running,
    current,
    typing,
    waitingUser,
    revealed,
    finished,
    pausedAt,
    scrollRef,
    runFrom,
    userReadIt,
    stopAll,
    restart,
    replayLine,
  } = useConversationPlayback(lesson);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === quiz[qIndex].correctIndex) setCorrectCount((c) => c + 1);
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

              {lines.slice(0, revealed).map((line, i) => (
                <ConversationBubble
                  key={i}
                  line={line}
                  index={i}
                  isActive={i === current}
                  waitingUser={waitingUser}
                  onReplay={(idx) => void replayLine(idx)}
                />
              ))}

              {/* نشانگر تایپ سایت */}
              {typing && <TypingIndicator />}
              <div className="h-1" />
            </div>

            {/* نوار کنترل */}
            <ConversationControls
              running={running}
              finished={finished}
              revealed={revealed}
              waitingUser={waitingUser}
              onPlay={() =>
                finished ? restart() : runFrom(pausedAt ?? revealed)
              }
              onStop={stopAll}
              onRestart={restart}
              onUserReadIt={userReadIt}
              onGoToQuiz={() => {
                stopAll();
                setStep(1);
              }}
            />
          </motion.div>
        )}

        {/* ---------- گام ۲: آزمونک ---------- */}
        {step === 1 && (
          <ConversationQuiz
            quiz={quiz}
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
