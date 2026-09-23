"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, RotateCcw, Mic, ArrowLeft } from "lucide-react";
import ContinueButton from "../../ContinueButton";

// ========================================
// نوار کنترل مکالمه: شروع/ادامه/توقف + شروع دوباره
// + بنر «نوبت شماست» + دکمهٔ رفتن به آزمونک
// (از ConversationView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function ConversationControls({
  running,
  finished,
  revealed,
  waitingUser,
  onPlay,
  onStop,
  onRestart,
  onUserReadIt,
  onGoToQuiz,
}: {
  running: boolean;
  finished: boolean;
  revealed: number;
  waitingUser: boolean;
  onPlay: () => void;
  onStop: () => void;
  onRestart: () => void;
  onUserReadIt: () => void;
  onGoToQuiz: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        {!running ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onPlay}
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
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            <Square size={18} />
            {tr("توقف", "Stop")}
          </motion.button>
        )}
        {!running && revealed > 0 && !finished && (
          <button
            onClick={onRestart}
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
                onClick={onUserReadIt}
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
              onClick={onGoToQuiz}
              label={tr("شروع آزمونک", "Start Quiz")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!finished && (
        <button
          onClick={onGoToQuiz}
          className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium py-1"
        >
          {tr("رفتن به آزمونک ←", "Go to Quiz →")}
        </button>
      )}
    </div>
  );
}
