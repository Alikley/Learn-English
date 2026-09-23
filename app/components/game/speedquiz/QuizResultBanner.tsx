"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, AlarmClock } from "lucide-react";
import type { SpeedQuizFeedback } from "@/app/hook/game/useSpeedQuizGame";

// ========================================
// بنر نتیجه پاسخ (درست / وقت تمام / غلط)
// (از SpeedQuizQuestionCard تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function QuizResultBanner({ feedback }: { feedback: SpeedQuizFeedback }) {
  const { tr } = useLanguage();
  if (feedback.correct) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-extrabold"
      >
        <CheckCircle2 className="w-4.5 h-4.5" />
        {tr("عالی بود!", "Great!")} +{feedback.gained} {tr("امتیاز", "points")}
      </motion.div>
    );
  }
  if (feedback.timeout) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-sm font-extrabold"
      >
        <AlarmClock className="w-4.5 h-4.5" />
        {tr("وقت تمام شد!", "Time's up!")}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-500 text-sm font-extrabold"
    >
      <XCircle className="w-4.5 h-4.5" />
      {tr("اشتباه بود — یک جان کم شد", "Wrong — you lost a life")}
    </motion.div>
  );
}
