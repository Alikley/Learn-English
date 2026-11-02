"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Image as ImageIcon,
  Keyboard,
  PenLine,
  RefreshCw,
  Clock3,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پنل رایتینگ
//
// چیدمان:
//    ۱) صورت سوال (متن استخراج‌شده) در بالای صفحه — هر دو تسک
//    ۲) تسک ۱: کارت «نمودار تسک» زیر صورت سوال — عکس واقعی از
//       B2 (کلید cambridge-writing/<book>-<test>-task1.jpg)
//    ۳) تسک ۲: فقط متن سوال — تسک ۲ نمودار ندارد (سوال تشریحی)
//    ۴) ناحیهٔ متن‌نویسی با شمارش کلمه
//
// 🔒 هیچ‌کدام از دو تسک به PDF کتاب لینک یا فال‌بک ندارند —
//    بخش «مشاهدهٔ صفحهٔ کتاب» به‌طور کامل حذف شده است. اگر متن
//    یک تسک استخراج نشده باشد، فقط کارت هشدار نشان داده می‌شود.
// ========================================

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/** وضعیت بارگذاری عکس نمودار — به URL گره خورده تا با
* تغییر تست/کتاب (بدون remount) خودش ریست شود */
type ChartImgState = { url: string; loaded: boolean; failed: boolean };

export default function WritingPanel({
  answers,
  onChange,
  disabled,
  activeTask,
  setActiveTask,
  isExam,
  prompts,
  questionPaper,
  task1ImageUrl,
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
  /**
   * تصویر نمودار Writing Task 1 — پل رسانه‌ای B2
   * (کلید cambridge-writing/<book>-<test>-task1.jpg).
   * null = B2 تنظیم نیست.
   */
  task1ImageUrl: string | null;
  /** برگهٔ رایتینگ هنوز در حال بررسی است */
  paperLoading: boolean;
  paperFailed: boolean;
}) {
  const { tr } = useLanguage();
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);
  const minutes = activeTask === 1 ? 20 : 40;

  // وضعیت عکس نمودار تسک ۱ (بارگذاری/خطا/ریتِری) —
  // کلید = URL جاری؛ با عوض‌شدن URL (تست/کتاب دیگر) ریست می‌شود
  const [chartImg, setChartImg] = useState<ChartImgState>({
    url: "",
    loaded: false,
    failed: false,
  });
  const chartLoaded = task1ImageUrl != null && chartImg.url === task1ImageUrl && chartImg.loaded;
  const chartFailed = task1ImageUrl != null && chartImg.url === task1ImageUrl && chartImg.failed;

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
          </div>
        </div>
      ) : (
        // متن این تسک استخراج نشده — فقط کارت هشدار؛ هیچ فال‌بک PDFای نیست
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-6 text-amber-700 dark:text-amber-300">
            <p className="font-bold">
              {paperFailed
                ? tr("صورت سوال از کتاب جدا نشد", "The question could not be extracted from the book")
                : tr("متن سوال این تسک از کتاب جدا نشد", "The question text for this task could not be extracted")}
            </p>
            {activeTask === 1 && (
              <p>
                {tr(
                  "نمودار و متن کاملِ تسک در تصویرِ پایین همین صفحه آمده است.",
                  "The chart and the full task text are in the image below on this page.",
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============ نمودار تسک ۱ — عکس از B2 ============
          زیر متن پرامپت؛ مستقل از پرامپت رندر می‌شود تا کتاب‌هایی
          که متن سوال ندارند هم نمودار را ببینند.
          خطای بارگذاری هرگز به PDF برنمی‌گردد —
          فقط حالت خطا + دکمهٔ «تلاش دوباره» در همین کارت */}
      {activeTask === 1 && !paperLoading && task1ImageUrl && !chartFailed && (
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20">
            <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex-1 min-w-0">
              {tr("نمودار تسک — از صفحهٔ کتاب", "Task chart — from the book page")}
            </p>
          </div>
          <div className="p-3 space-y-2">
            {/* اسکلت تا آماده‌شدن عکس */}
            {!chartLoaded && (
              <div
                className="w-full h-56 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center"
                dir="ltr"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <ImageIcon size={12} className="animate-pulse" />
                  {tr("در حال بارگذاری نمودار…", "Loading the chart…")}
                </span>
              </div>
            )}
            <img
              src={task1ImageUrl}
              alt={tr(
                "نمودار/جدول Writing Task 1",
                "Writing Task 1 chart / table",
              )}
              onLoad={() =>
                task1ImageUrl != null &&
                setChartImg({ url: task1ImageUrl, loaded: true, failed: false })
              }
              onError={() =>
                task1ImageUrl != null &&
                setChartImg({ url: task1ImageUrl, loaded: false, failed: true })
              }
              className={`w-full h-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white ${
                chartLoaded ? "" : "h-0 min-h-0 overflow-hidden border-0"
              }`}
            />
          </div>
        </div>
      )}

      {/* تسک ۱ — خطای بارگذاری عکس: فقط «تلاش دوباره»، بدون PDF */}
      {activeTask === 1 && !paperLoading && task1ImageUrl && chartFailed && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/5 px-4 py-3 flex items-start gap-2">
          <ImageIcon size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10.5px] leading-5 text-amber-700 dark:text-amber-300 flex-1 min-w-0">
            {tr(
              "تصویر نمودار بارگذاری نشد — اتصال اینترنت/B2 را چک کن و دوباره تلاش کن.",
              "The chart image failed to load — check your connection/B2 and retry.",
            )}
          </p>
          <button
            onClick={() => setChartImg({ url: "", loaded: false, failed: false })}
            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-500/40 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={11} />
            {tr("تلاش دوباره", "Retry")}
          </button>
        </div>
      )}

      {/* تسک ۱ — B2 فعال ولی عکس نمودار برای این تسک نیست (نادر) */}
      {activeTask === 1 && !paperLoading && !task1ImageUrl && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 px-4 py-3 flex items-start gap-2">
          <ImageIcon size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10.5px] leading-5 text-slate-500 dark:text-slate-400 flex-1 min-w-0">
            {tr(
              "تصویر نمودار این تسک فعلاً در باکت B2 پیدا نشد — بعداً به‌صورت cambridge-writing/<کتاب>-<تست>-task1.jpg اضافه می‌شود.",
              "No chart image for this task in the B2 bucket yet — it will be added later as cambridge-writing/<book>-<test>-task1.jpg.",
            )}
          </p>
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
