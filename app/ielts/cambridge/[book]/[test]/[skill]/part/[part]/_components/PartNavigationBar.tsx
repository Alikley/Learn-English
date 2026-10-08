"use client";

import { partQuestionNumbers, type StructuredExam } from "@/lib/ielts/structured-tests";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsMediaInfo } from "@/types/ielts";

// ========================================
// نوار پایین ثابت پلیر ساخت‌یافته (v1.0.4.2)
// پخش‌کنندهٔ صوت + چک‌باکس «مرور» + ناوبری Part + چیپ‌های سوال
// (از part/[part]/page.tsx جدا شد)
// ========================================

export default function PartNavigationBar({
  exam,
  partNum,
  media,
  examMode,
  answered,
  reviewFlags,
  activeQuestion,
  dir,
  onGoPart,
  onScrollToQuestion,
  onToggleFlag,
}: {
  exam: StructuredExam;
  partNum: number;
  media: IeltsMediaInfo;
  examMode: boolean;
  answered: (q: number) => boolean;
  reviewFlags: Record<number, boolean>;
  activeQuestion: number | null;
  dir: "rtl" | "ltr";
  onGoPart: (n: number) => void;
  onScrollToQuestion: (q: number) => void;
  onToggleFlag: (q: number | null) => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="max-w-4xl mx-auto px-3 md:px-5 py-2.5 space-y-2">
        <RealAudioPlayer
          tracks={media.audioTracks}
          shared={media.audioShared}
          examMode={examMode}
        />
        <div className="flex items-center gap-2 flex-wrap" dir={dir}>
          {/* چک‌باکس Review — سوال فعال را برای مرور پرچم می‌زند */}
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              className="accent-amber-500 w-3.5 h-3.5"
              checked={activeQuestion !== null && reviewFlags[activeQuestion] === true}
              disabled={activeQuestion === null}
              onChange={() => onToggleFlag(activeQuestion)}
            />
            {tr("مرور", "Review")}
          </label>

          {exam.parts.map((p) => {
            const nums = partQuestionNumbers(exam, p.part);
            const done = nums.filter((q) => answered(q)).length;
            const isCurrent = p.part === partNum;
            return (
              <div key={p.part} className="min-w-0">
                {isCurrent ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 shrink-0">
                      Part {p.part}
                    </span>
                    {nums.map((q) => (
                      <button
                        key={q}
                        onClick={() => onScrollToQuestion(q)}
                        title={
                          reviewFlags[q]
                            ? tr(`سوال ${q} — برای مرور`, `Question ${q} — flagged for review`)
                            : tr(`رفتن به سوال ${q}`, `Go to question ${q}`)
                        }
                        className={`
                          w-7 h-7 rounded-md text-[11px] font-black transition tabular-nums
                          ${
                            reviewFlags[q]
                              ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-2 border-amber-400"
                              : answered(q)
                                ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-2 border-sky-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-sky-400"
                          }
                          ${activeQuestion === q ? "ring-2 ring-sky-400 ring-offset-1 dark:ring-offset-slate-900" : ""}
                        `}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onGoPart(p.part)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition
                      ${
                        p.part < partNum
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/15"
                      }
                    `}
                  >
                    <span>Part {p.part}</span>
                    <span className="text-slate-400 tabular-nums" dir="ltr">
                      {done} / {nums.length}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
