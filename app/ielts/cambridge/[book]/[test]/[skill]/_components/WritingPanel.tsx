"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  Keyboard,
  PenLine,
  RefreshCw,
  Clock3,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پنل رایتینگ — v1.0.4.4 (English 1.0.0.8)
//
// 🎯 خواستهٔ کاربر (1.0.0.5 → 1.0.0.8):
//    «صورت سوال باید از PDF جدا بشه و در بالای صفحه
//     نمایش داده بشه — فقط خودِ سوال»
//    (کاربر صریحاً نمایش کل PDF را رد کرد)
//
// ✅ چیدمان جدید:
//    ۱) «صورت سوال» به‌صورت متنِ استخراج‌شده در «بالای صفحه» —
//       برای همهٔ کتاب‌ها و هر دو تسک (نقشهٔ استخراج v1.0.4.4:
//       لایهٔ متنی PDF + OCR صفحات اسکن‌شده)
//    ۲) کتاب PDF فقط یک «بخش جمع‌شوندهٔ اختیاری» شد —
//       برای دیدن نمودار/تصویر تسک ۱ — نه نمایشگر اصلی
//    ۳) ناحیهٔ متن‌نویسی با شمارش کلمه (همان قبلی)
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
  questionPaper,
  pdfUrl,
  paperLoading,
  paperFailed,
}: {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  activeTask: 1 | 2;
  setActiveTask: (t: 1 | 2) => void;
  isExam: boolean;
  prompts: IeltsWritingPrompt[];
  /** صفحات صورت سوال در PDF کتاب (۱-based) — null = پیدا نشد */
  questionPaper: {
    task1Page: number;
    task2Page: number;
    fromPage: number;
    toPage: number;
  } | null;
  /** آدرس PDF کتاب (پل رسانه‌ای B2 یا روت محلی) */
  pdfUrl: string | null;
  /** برگهٔ رایتینگ هنوز در حال بررسی است */
  paperLoading: boolean;
  paperFailed: boolean;
}) {
  const { tr } = useLanguage();
  const [iframeKey, setIframeKey] = useState(0);
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);
  const minutes = activeTask === 1 ? 20 : 40;
  /** باز/بسته بودن بخش کتاب — تا وقتی کاربر toggle نکرده:
  * وقتی متن سوال در دسترس نیست (مثل کتاب ۳) نمایشگر کتاب
  * خودکار باز است تا صورت سوال از صفحهٔ چاپی دیده شود */
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const bookOpen = userToggled ?? (!paperLoading && !prompt);

  // صفحهٔ کتابِ تسک جاری — برای بخش اختیاری «مشاهده در کتاب»
  const taskPage = useMemo(() => {
    if (!questionPaper) return null;
    return activeTask === 1 ? questionPaper.task1Page : questionPaper.task2Page;
  }, [questionPaper, activeTask]);

  const iframeSrc = useMemo(() => {
    if (!pdfUrl) return null;
    if (taskPage != null) return `${pdfUrl}#page=${taskPage}&view=FitH`;
    return `${pdfUrl}#view=FitH`;
  }, [pdfUrl, taskPage]);

  return (
    <div className="space-y-3">
      {/* ================= تب تسک ================= */}
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
            {questionPaper && (
              <span className="text-[9px] font-medium tabular-nums opacity-60" dir="ltr">
                p.{t === 1 ? questionPaper.task1Page : questionPaper.task2Page}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============ صورت سوال — متن استخراج‌شده در بالای صفحه ============ */}
      {paperLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen size={14} className="animate-pulse" />
            {tr("در حال جداکردن صورت سوال از کتاب…", "Extracting the question from the book…")}
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse w-3/4" />
            <div className="h-3 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse w-full" />
            <div className="h-3 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse w-5/6" />
          </div>
        </div>
      ) : prompt ? (
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900/60 overflow-hidden">
          {/* سربرگ صورت سوال */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20 flex-wrap">
            <PenLine size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex-1 min-w-0">
              {tr("صورت سوال — Writing Task", "Question — Writing Task")} {activeTask}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full"
              dir="ltr"
            >
              <Clock3 size={10} />
              {minutes} min
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full"
              dir="ltr"
            >
              {minWords}+ words
            </span>
          </div>

          {/* متن سوال — استخراج‌شده از خود کتاب */}
          <div className="px-4 py-4">
            <p
              className="text-[13.5px] leading-7 text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-serif"
              dir="ltr"
            >
              {prompt.prompt}
            </p>

            {/* تسک ۱ نمودار دارد — راهنمای دیدن نمودار */}
            {activeTask === 1 && pdfUrl && taskPage != null && (
              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-amber-600 dark:text-amber-400">
                <ImageIcon size={12} className="shrink-0 mt-0.5" />
                {tr(
                  "نمودار/جدول این تسک در صفحهٔ چاپی کتاب است — با دکمهٔ «مشاهدهٔ صفحهٔ کتاب» پایین ببینش.",
                  "The chart/table for this task is in the printed book page — open it via “View book page” below.",
                )}
              </p>
            )}
          </div>
        </div>
      ) : paperFailed || !pdfUrl ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-6 text-amber-700 dark:text-amber-300">
            <p className="font-bold">
              {tr("صورت سوال از کتاب جدا نشد", "The question could not be extracted from the book")}
            </p>
            <p>
              {pdfUrl
                ? tr(
                    "صفحهٔ سوال از خود کتاب PDF باز می‌شود — با شمارهٔ صفحه در نوار PDF به بخش رایتینگ برو.",
                    "The question opens straight from the book PDF — navigate to the writing section via the PDF page bar.",
                  )
                : tr(
                    "فایل کتاب در باکت Backblaze (پوشهٔ cambridge) پیدا نشد. B2_KEY_ID و B2_APP_KEY را در .env.local چک کن.",
                    "Book files were not found in your Backblaze bucket (cambridge folder). Check B2_KEY_ID and B2_APP_KEY in .env.local.",
                  )}
            </p>
          </div>
        </div>
      ) : null}

      {/* ============ کتاب PDF — بخش جمع‌شوندهٔ اختیاری ============ */}
      {pdfUrl && !paperLoading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          {/* دکمهٔ باز/بسته */}
          <button
            onClick={() => setUserToggled(!bookOpen)}
            className="w-full flex items-center gap-2 px-4 py-3 text-start hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <BookOpen size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex-1 min-w-0">
              {tr("مشاهدهٔ صفحهٔ کتاب", "View book page")}
              {taskPage != null && (
                <span
                  className="ms-1.5 text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md"
                  dir="ltr"
                >
                  p.{taskPage}
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              {tr("نمودار و صفحهٔ اصلی تسک", "diagram & original page")}
            </span>
            <ChevronDown
              size={15}
              className={`text-slate-400 shrink-0 transition-transform ${bookOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* نمایشگر PDF — فقط وقتی کاربر باز کرد */}
          {bookOpen && (
            <div className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-end gap-1 px-1">
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  title={tr("بارگذاری مجدد", "Reload")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <RefreshCw size={13} />
                </button>
                <a
                  href={taskPage != null ? `${pdfUrl}#page=${taskPage}` : pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tr("باز کردن در تب جدید (تمام‌صفحه)", "Open in new tab (full screen)")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
              <div
                dir="ltr"
                className="h-[440px] md:h-[540px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                {iframeSrc && (
                  <iframe
                    key={`${iframeKey}-${activeTask}`}
                    src={iframeSrc}
                    title={tr("صفحهٔ سوال در کتاب", "Question page in the book")}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= ناحیهٔ نوشتن ================= */}
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
