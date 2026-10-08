"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Keyboard,
  PenLine,
  RefreshCw,
  Timer,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پنل رایتینگ (v1.0.0.5)
//
// 🎯 تغییر v1.0.0.5 (درخواست کاربر): صورت سوال تسک ۱ و ۲
//    «متنی» و بالای همان صفحهٔ آزمون نشان داده می‌شود —
//    نه PDF کامل کتاب. متن هر دو تسک یک‌بار از صفحات
//    چاپی کتاب استخراج شده (کتاب ۱: لایهٔ متنی — کتاب‌های
//    ۲..۷: مدل بینایی + تأیید OCR) و در writing-map ثبت است.
//
// نمایشگر صفحهٔ کتاب فقط «امکان جانبی» است — برای دیدن
// نمودار/جدول/نقشهٔ تسک ۱ که فقط در تصویر کتاب وجود دارد
// (به‌صورت جمع‌شونده، پیش‌فرض بسته).
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
  const [bookOpen, setBookOpen] = useState(false);
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);
  const taskMinutes = activeTask === 1 ? 20 : 40;

  // صفحهٔ کتابِ تسک جاری — فقط برای نمایشگر جانبی (نمودار/جدول)
  const taskPage = useMemo(() => {
    if (!questionPaper) return null;
    return activeTask === 1 ? questionPaper.task1Page : questionPaper.task2Page;
  }, [questionPaper, activeTask]);

  const iframeSrc = useMemo(() => {
    if (!pdfUrl) return null;
    if (taskPage != null) return `${pdfUrl}#page=${taskPage}&view=FitH`;
    return `${pdfUrl}#view=FitH`;
  }, [pdfUrl, taskPage]);

  // اگر متن سوال موجود نبود ولی صفحهٔ کتاب مشخص بود → نمایشگر
  // کتاب برای جبران، پیش‌فرض باز شود
  const bookViewerOpen = bookOpen || (!prompt && questionPaper != null && pdfUrl != null);

  // ================= رندر =================

  return (
    <div className="space-y-3">
      {/* تب تسک */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70">
        {([1, 2] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTask(t)}
            aria-pressed={activeTask === t}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTask === t
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t === 1 ? <BookOpen size={13} /> : <PenLine size={13} />}
            {tr(`تسک ${t} (${t === 1 ? "۲۰" : "۴۰"} دقیقه)`, `Task ${t} (${t === 1 ? "20" : "40"} min)`)}
            {questionPaper && (
              <span
                className="text-[9px] font-medium tabular-nums opacity-60"
                dir="ltr"
              >
                p.{t === 1 ? questionPaper.task1Page : questionPaper.task2Page}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============ صورت سوال — متن استخراج‌شده از کتاب (اصلی) ============ */}
      {paperLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText size={14} className="animate-pulse" />
            {tr("در حال بازیابی صورت سوال…", "Retrieving the question…")}
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
            <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
            <div className="h-3.5 w-5/6 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
          </div>
        </div>
      ) : prompt ? (
        <div
          dir="ltr"
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1b33] overflow-hidden shadow-sm"
        >
          {/* نوار عنوان رسمی تسک */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 border-b-2 border-slate-900/10 dark:border-slate-200/15 bg-slate-50/80 dark:bg-slate-800/40">
            <h3 className="font-serif text-[15px] font-black tracking-wide text-slate-900 dark:text-slate-100">
              WRITING TASK {activeTask}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <Timer size={11} />
              {tr(`${taskMinutes} دقیقه`, `${taskMinutes} minutes`)}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <PenLine size={11} />
              {tr(`حداقل ${minWords} کلمه`, `at least ${minWords} words`)}
            </span>
            {taskPage != null && (
              <span
                className="ml-auto text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md"
                title={tr("صفحهٔ کتاب", "book page")}
              >
                book p.{taskPage}
              </span>
            )}
          </div>

          {/* متن صورت سوال — عین صفحهٔ چاپی کتاب */}
          <div className="px-4 py-4 md:px-5 md:py-5">
            <p className="font-serif text-[13.5px] md:text-[14.5px] leading-7 md:leading-8 text-slate-800 dark:text-slate-100 whitespace-pre-wrap selection:bg-emerald-200 dark:selection:bg-emerald-500/40">
              {prompt.prompt}
            </p>
          </div>

          {/* پانویس منبع */}
          <div className="px-4 pb-3 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <FileText size={11} className="shrink-0" />
            <span dir={undefined}>
              {tr(
                "صورت سوال از صفحهٔ چاپی کتاب استخراج شده است",
                "Question extracted from the printed book page",
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-6 text-amber-700 dark:text-amber-300">
            <p className="font-bold">
              {tr("متن این تسک در نقشهٔ استخراج‌شده نیست", "This task's text is not in the extracted map")}
            </p>
            <p>
              {paperFailed
                ? tr(
                    "برگهٔ رایتینگ به‌صورت خودکار پیدا نشد — از دکمهٔ «کتاب PDF» صفحهٔ خود سوال را ببین.",
                    "The writing paper could not be located automatically — use the “Book PDF” button to view the question.",
                  )
                : tr(
                    "صفحهٔ کتاب این تسک در نمایشگر زیر باز شده است.",
                    "The book page for this task is open in the viewer below.",
                  )}
            </p>
          </div>
        </div>
      )}

      {/* ============ نمایشگر جانبی صفحهٔ کتاب (نمودار تسک ۱) ============ */}
      {pdfUrl && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          <button
            onClick={() => setBookOpen((o) => !o)}
            aria-expanded={bookViewerOpen}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <BookOpen size={14} className="text-emerald-500 shrink-0" />
            <span className="min-w-0 flex-1 text-right">
              {activeTask === 1
                ? tr(
                    "نمایش نمودار/جدول تسک ۱ در صفحهٔ کتاب",
                    "Show Task 1 chart/table on the book page",
                  )
                : tr("نمایش صفحهٔ کتاب این تسک", "Show this task's book page")}
            </span>
            {taskPage != null && (
              <span
                className="text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0"
                dir="ltr"
              >
                p.{taskPage}
              </span>
            )}
            <ChevronDown
              size={15}
              className={`shrink-0 text-slate-400 transition-transform ${bookViewerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {bookViewerOpen && (
            <div className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] leading-5 text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={11} className="shrink-0" />
                  {activeTask === 1
                    ? tr(
                        "نمودار/جدیل داده‌های تسک ۱ فقط در صفحهٔ کتاب است.",
                        "The Task 1 data chart/table exists only on the book page.",
                      )
                    : tr(
                        "صفحهٔ چاپی کتاب — مثل آزمون واقعی.",
                        "The printed book page — exactly as in the real exam.",
                      )}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    title={tr("بارگذاری مجدد", "Reload")}
                    aria-label={tr("بارگذاری مجدد", "Reload")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <a
                    href={taskPage != null ? `${pdfUrl}#page=${taskPage}` : pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={tr("باز کردن در تب جدید (تمام‌صفحه)", "Open in new tab (full screen)")}
                    aria-label={tr("باز کردن در تب جدید", "Open in new tab")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div
                dir="ltr"
                className="h-[380px] md:h-[480px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                {iframeSrc && (
                  <iframe
                    key={`${iframeKey}-${activeTask}`}
                    src={iframeSrc}
                    title={tr("صفحهٔ کتاب", "Book page")}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>
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
          aria-label={tr("محل نوشتن پاسخ", "Answer writing area")}
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
