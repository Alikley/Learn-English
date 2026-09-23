"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import type { ListeningLesson } from "@/data/lessons/types";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// متن داستان (کاراته) + واژگان کلیدی
// (از ListeningView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function ListeningStory({
  lesson,
  currentPara,
  paraRefs,
  onSeek,
}: {
  lesson: ListeningLesson;
  currentPara: number;
  paraRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onSeek: (paraIndex: number) => void;
}) {
  const { tr } = useLanguage();

  return (
    <>
      {/* توضیح */}
      <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm flex items-start gap-2">
        <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <BookOpen size={18} />
        </span>
        <p className="text-slate-600 text-sm leading-7 pt-1">
          {lesson.description}
        </p>
      </div>

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
              onClick={() => onSeek(i)}
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
    </>
  );
}
