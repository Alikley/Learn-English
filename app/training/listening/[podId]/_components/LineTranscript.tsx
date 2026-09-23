"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { ListeningGap } from "@/types/listening";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// ترنسکریپت خط‌به‌خط پادکست: نشان مجری + فرم‌های جای خالی + راهنما
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function LineTranscript({
  lines,
  currentLine,
  gapsMap,
  answers,
  hints,
  hasResult,
  onLineClick,
  onSetAnswer,
  onToggleHint,
}: {
  lines: string[];
  currentLine: number;
  gapsMap: Map<number, ListeningGap>;
  answers: Record<number, string>;
  hints: Record<number, boolean>;
  hasResult: boolean;
  onLineClick: (i: number) => void;
  onSetAnswer: (gapId: number, value: string) => void;
  onToggleHint: (gapId: number) => void;
}) {
  const { tr, dir } = useLanguage();

  return (
    <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
      <h2 className="font-bold text-slate-800 mb-4 text-sm">{tr("متن تمرین", "Practice Text")}</h2>

      <div className="space-y-1" dir="ltr">
        {lines.map((line, lineIdx) => {
          const isCurrent = currentLine === lineIdx;
          const speaker = line.startsWith("Tom") ? "Tom" : "Lena";

          return (
            <div
              key={lineIdx}
              onClick={() => onLineClick(lineIdx)}
              className={`group flex items-start gap-2 rounded-xl px-2 py-1.5 cursor-pointer transition-colors ${
                isCurrent
                  ? "bg-amber-50 ring-2 ring-amber-200"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* نشان مجری */}
              <span
                className={`shrink-0 mt-0.5 text-[10px] font-black rounded-full w-11 text-center py-1 ${
                  speaker === "Tom"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {speaker}
              </span>

              {/* متن خط با فرم‌ها */}
              <p className="text-sm md:text-[15px] leading-[2.3] text-slate-700 flex-1">
                {line
                  .replace(/^[A-Za-z]+:\s*/, "")
                  .split(/\{(\d+)\}/)
                  .map((part, i) => {
                    if (i % 2 === 0)
                      return (
                        <span key={i}>
                          <HoverableText text={part} />
                        </span>
                      );

                    const gapId = parseInt(part, 10);
                    const gap = gapsMap.get(gapId);
                    if (!gap) return <span key={i}>{part}</span>;

                    const userAns = answers[gapId] || "";
                    const hint = hints[gapId];

                    let status: "correct" | "wrong" | "idle" = "idle";
                    if (hasResult) {
                      status =
                        normalizeText(userAns) === normalizeText(gap.answer)
                          ? "correct"
                          : "wrong";
                    }

                    return (
                      <span key={i} className="inline">
                        <span className="relative inline-flex items-center gap-1 mx-0.5">
                          <input
                            type="text"
                            value={userAns}
                            onChange={(e) => onSetAnswer(gapId, e.target.value)}
                            placeholder={`(${gapId})`}
                            dir="ltr"
                            disabled={hasResult}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-24 md:w-32 px-2 py-0.5 text-sm border rounded-lg text-center outline-none transition-all font-medium ${
                              status === "correct"
                                ? "border-green-300 bg-green-50 text-green-700"
                                : status === "wrong"
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-slate-200 bg-slate-50 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            }`}
                          />
                          {hasResult && status === "correct" && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {hasResult && status === "wrong" && (
                            <span className="flex items-center gap-0.5">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-xs text-green-600 font-medium">
                                {gap.answer}
                              </span>
                            </span>
                          )}
                          {!hasResult && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleHint(gapId);
                              }}
                              className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                              title={tr("راهنما", "Guide")}
                            >
                              <Lightbulb
                                className={`h-3.5 w-3.5 ${
                                  hint
                                    ? "text-amber-500"
                                    : "text-slate-300"
                                }`}
                              />
                            </button>
                          )}
                        </span>
                        <AnimatePresence>
                          {hint && (
                            <motion.span
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="block text-[11px] text-amber-600 mt-0.5"
                              dir={dir}
                            >
                              💡 {gap.hint}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    );
                  })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** همان نرمال‌سازی صفحهٔ اصلی — برای مقایسهٔ منصفانه */
function normalizeText(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}
