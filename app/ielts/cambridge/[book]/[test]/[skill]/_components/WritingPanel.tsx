"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Keyboard,
  PenLine,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پنل رایتینگ (v1.0.4.4 — English 1.0.0.7)
//
// 🎯 v1.0.0.5/1.0.0.6: «فقط سوال رو نشون بده» —
//    صورت سوال = متنِ استخراج‌شدهٔ تسک، بزرگ و بالای صفحه
//    (نه کل PDF کتاب!). متن هر دو تسکِ همهٔ کتاب‌ها
//    یک‌بار با OCR/AI جدا و در نقشهٔ writing-map ثبت شده.
//
// 📄 صفحهٔ کتاب فقط «مکمل» است — برای نمودار/جدول تسک ۱
//    با بخش جمع‌شوندهٔ «نمایش در کتاب» (#page=N).
//
// + تب تسک + متن‌نویسی با شمارش کلمه
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
  const [bookOpen, setBookOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);
  const minutes = activeTask === 1 ? 20 : 40;

  // صفحهٔ کتابِ تسک جاری — برای «نمایش در کتاب»
  const taskPage = useMemo(() => {
    if (!questionPaper) return null;
    return activeTask === 1 ? questionPaper.task1Page : questionPaper.task2Page;
  }, [questionPaper, activeTask]);

  const iframeSrc = useMemo(() => {
    if (!pdfUrl) return null;
    if (taskPage != null) return `${pdfUrl}#page=${taskPage}&view=FitH`;
    return `${pdfUrl}#view=FitH`;
  }, [pdfUrl, taskPage]);

  // ================= رندر =================

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

      {/* ============ صورت سوال — متن استخراج‌شده بالای صفحه (v1.0.0.7) ============ */}
      {paperLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen size={14} className="animate-pulse" />
            {tr("در حال جداکردن صورت سوال از کتاب…", "Separating the question from the book…")}
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
          </div>
        </div>
      ) : prompt ? (
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900/60 overflow-hidden shadow-[0_4px_18px_rgba(16,185,129,0.06)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
          {/* سربرگ صورت سوال — شبیه برگهٔ امتحانی */}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50/70 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300" dir="ltr">
              <PenLine size={13} />
              WRITING TASK {activeTask}
            </span>
            <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 tabular-nums" dir="ltr">
              {minutes} min · {minWords}+ words
            </span>
            {questionPaper && (
              <span
                className="ms-auto text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md"
                dir="ltr"
              >
                {questionPaper.fromPage === questionPaper.toPage
                  ? `p.${questionPaper.fromPage}`
                  : `pp.${questionPaper.fromPage}–${questionPaper.toPage}`}
              </span>
            )}
          </div>

          {/* متن صورت تسک — مستقیم از کتاب جدا شده */}
          <div className="px-4 py-4" dir="ltr">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles size={11} />
              {tr("صورت سوال — جدا شده از کتاب کمبریج", "Question — extracted from the Cambridge book")}
            </p>
            <p className="font-serif text-[14px] leading-8 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
              {prompt.prompt}
            </p>
          </div>
        </div>
      ) : !pdfUrl ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-6 text-amber-700 dark:text-amber-300">
            <p className="font-bold">
              {tr("PDF کتاب در دسترس نیست", "Book PDF is not available")}
            </p>
            <p>
              {tr(
                "فایل کتاب در باکت Backblaze (پوشهٔ cambridge) جست‌وجو می‌شود. B2_KEY_ID و B2_APP_KEY را در .env.local چک کن.",
                "Book files are discovered from your Backblaze bucket (cambridge folder). Check B2_KEY_ID and B2_APP_KEY in .env.local.",
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-6 text-amber-700 dark:text-amber-300">
            <p className="font-bold">
              {tr("متن این تسک جدا نشد — صفحهٔ کتاب را باز کن", "This task's text was not extracted — open the book page")}
            </p>
            <p>
              {paperFailed
                ? tr(
                    "صفحات رایتینگ این تست به‌صورت خودکار پیدا نشد — کتاب کامل در بخش «نمایش در کتاب» باز می‌شود.",
                    "Writing pages for this test could not be located automatically — the full book opens in the “show in book” section.",
                  )
                : tr(
                    "صورت سوال را از صفحهٔ چاپی کتاب کنار همین تسک بخوان.",
                    "Read the question from the printed book page next to this task.",
                  )}
            </p>
          </div>
        </div>
      )}

      {/* ============ نمایش در کتاب — مکملِ نمودار/جدول تسک ۱ ============ */}
      {pdfUrl && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          <button
            onClick={() => setBookOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <BookOpen size={14} className="text-slate-400" />
            <span className="flex-1 text-start">
              {tr("نمایش در کتاب (نمودار/جدول تسک ۱)", "Show in book (Task 1 diagram/table)")}
            </span>
            {taskPage != null && (
              <span className="text-[10px] font-bold tabular-nums text-slate-400" dir="ltr">
                #page={taskPage}
              </span>
            )}
            <a
              href={taskPage != null ? `${pdfUrl}#page=${taskPage}` : pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={tr("باز کردن در تب جدید", "Open in new tab")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            >
              <ExternalLink size={14} />
            </a>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform shrink-0 ${bookOpen ? "rotate-180" : ""}`}
            />
          </button>

          {bookOpen && (
            <div className="p-3 pt-0 space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={11} />
                  {tr(
                    "صفحهٔ چاپی کتاب — دقیقاً مثل آزمون واقعی",
                    "Printed book page — exactly like the real exam",
                  )}
                </p>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  title={tr("بارگذاری مجدد", "Reload")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <div
                dir="ltr"
                className="h-[420px] md:h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
