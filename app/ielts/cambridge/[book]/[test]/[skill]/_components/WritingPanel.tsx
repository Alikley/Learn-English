"use client";

import { BookOpen, PenLine, Sparkles, Keyboard } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پنل رایتینگ — صورت تسک از PDF + متن‌نویسی (v1.0.4.2)
// تب تسک ۱/۲ + کیسهٔ صورت تسک + textarea با شمارش کلمه
// (از [skill]/page.tsx جدا شد)
// ========================================

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export default function WritingPanel({
  answers,
  onChange,
  disabled,
  activeTask,
  setActiveTask,
  isExam,
  prompts,
  paperFailed,
}: {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  activeTask: 1 | 2;
  setActiveTask: (t: 1 | 2) => void;
  isExam: boolean;
  prompts: IeltsWritingPrompt[];
  paperFailed: boolean;
}) {
  const { tr } = useLanguage();
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);

  return (
    <div className="space-y-3">
      {/* تب تسک */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70">
        {([1, 2] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTask(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTask === t
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t === 1 ? <BookOpen size={13} /> : <PenLine size={13} />}
            {tr(`تسک ${t} (${t === 1 ? "۲۰" : "۴۰"} دقیقه)`, `Task ${t} (${t === 1 ? "20" : "40"} min)`)}
          </button>
        ))}
      </div>

      {/* صورت تسک — از متن PDF */}
      {prompt ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <Sparkles size={12} />
            {tr("صورت تسک — خوانده‌شده از PDF کتاب", "Task prompt — read from the book PDF")}
          </p>
          <p
            className="text-[13px] leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-wrap"
            dir="ltr"
          >
            {prompt.prompt}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 leading-6 px-1">
          {paperFailed
            ? tr(
                "صورت تسک از PDF خوانده نشد — از دکمهٔ «کتاب PDF» صورت تسک را ببین.",
                "Task prompt could not be parsed — use the “Book PDF” button to read the prompt.",
              )
            : tr(
                `در حال خواندن صورت تسک ${activeTask} از PDF…`,
                `Reading Task ${activeTask} prompt from the PDF…`,
              )}
        </p>
      )}

      {/* ناحیهٔ نوشتن */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-2">
        <textarea
          dir="ltr"
          value={text}
          onChange={(e) => onChange(currentId, e.target.value.slice(0, 8000))}
          disabled={disabled}
          rows={12}
          placeholder={isExam ? "" : "Start writing…"}
          className="w-full px-3 py-2.5 rounded-xl text-sm leading-7 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-60 transition resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Keyboard size={11} />
            {tr("ذخیرهٔ خودکار فعال است", "Autosave is on")}
          </span>
          <span
            className={`text-[11px] font-bold tabular-nums ${
              words >= minWords
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
            dir="ltr"
          >
            {words} / {minWords}+
          </span>
        </div>
      </div>
    </div>
  );
}
