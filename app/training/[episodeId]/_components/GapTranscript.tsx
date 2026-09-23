"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { ListeningGap } from "@/types/listening";

// ========================================
// متن ترنسکریپت تمرین شنیداری با جای خالی + راهنما
// (از صفحهٔ [episodeId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export type TranscriptSegment = {
  type: "text" | "gap";
  value: string;
  gapId?: number;
};

export default function GapTranscript({
  segments,
  gapsMap,
  answers,
  hints,
  hasResult,
  onSetAnswer,
  onToggleHint,
}: {
  segments: TranscriptSegment[];
  gapsMap: Map<number, ListeningGap>;
  answers: Record<number, string>;
  hints: Record<number, boolean>;
  hasResult: boolean;
  onSetAnswer: (gapId: number, value: string) => void;
  onToggleHint: (gapId: number) => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
      <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs">
          📝
        </span>
        {tr("متن تمرین", "Practice Text")}
      </h2>

      <div className="text-sm md:text-base leading-[2.2] text-slate-700">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return <span key={i}>{seg.value}</span>;
          }

          const gapId = seg.gapId!;
          const gap = gapsMap.get(gapId);
          const userAns = answers[gapId] || "";
          const hint = hints[gapId];

          // بررسی صحت بعد از ارسال
          let status: "correct" | "wrong" | "idle" = "idle";
          if (hasResult && gap) {
            status =
              userAns.trim().toLowerCase() === gap.answer.trim().toLowerCase()
                ? "correct"
                : "wrong";
          }

          return (
            <span key={i} className="inline mx-0.5">
              <span className="relative inline-flex items-center gap-1">
                <input
                  type="text"
                  value={userAns}
                  onChange={(e) => onSetAnswer(gapId, e.target.value)}
                  placeholder={`(${gapId})`}
                  dir="ltr"
                  disabled={hasResult}
                  className={`w-28 md:w-36 px-2 py-1 text-sm border rounded-lg text-center outline-none transition-all font-medium ${
                    status === "correct"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : status === "wrong"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {/* آیکون صحت/غلط */}
                {hasResult && status === "correct" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {hasResult && status === "wrong" && (
                  <span className="flex items-center gap-0.5">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-green-600 font-medium">
                      {gap?.answer}
                    </span>
                  </span>
                )}
                {/* دکمه راهنما */}
                {!hasResult && (
                  <button
                    onClick={() => onToggleHint(gapId)}
                    className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                    title={tr("راهنما", "Guide")}
                  >
                    <Lightbulb
                      className={`h-3.5 w-3.5 ${hint ? "text-amber-500" : "text-slate-300"}`}
                    />
                  </button>
                )}
              </span>
              {/* متن راهنما */}
              <AnimatePresence>
                {hint && gap && (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block text-[11px] text-amber-600 mt-0.5"
                  >
                    💡 {gap.hint}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </div>
    </div>
  );
}
