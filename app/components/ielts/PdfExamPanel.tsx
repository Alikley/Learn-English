"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FileText,
  RefreshCw,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// نمایشگر PDF آزمون آیلتس (v1.0.3.3)
// PDF واقعی کتاب کمبریج از باکت B2 کاربر:
//  - iframe با نمایشگر بومی مرورگر (زوم/جستجو/صفحه داخلی خودش)
//  - دکمهٔ «باز کردن در تب جدید» برای تجربهٔ تمام‌صفحه
//  - حالت‌های خطا: B2 تنظیم نشده / PDF پیدا نشد
// این کامپوننت «متن سوال‌ها» را از PDF می‌خواند — مثل آزمون واقعی.
// ========================================

export default function PdfExamPanel({
  pdfUrl,
  bookTitle,
  onRescan,
  rescanning,
  compact,
}: {
  pdfUrl: string | null;
  bookTitle: string;
  onRescan?: () => void;
  rescanning?: boolean;
  compact?: boolean;
}) {
  const { tr } = useLanguage();
  const [iframeKey, setIframeKey] = useState(0);
  // وضعیت بارگذاری به کلید iframe گره خورده — با تغییر کلید (بارگذاری مجدد)
  // خودکار false می‌شود بدون نیاز به effect (الگوی سازگار با React Compiler)
  const [loadState, setLoadState] = useState<{ key: number; loaded: boolean }>({
    key: 0,
    loaded: false,
  });
  const loaded = loadState.key === iframeKey && loadState.loaded;

  const openExternal = useMemo(() => pdfUrl ?? null, [pdfUrl]);

  // ---------- B2 تنظیم نشده ----------
  if (pdfUrl === null) {
    return (
      <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 text-center px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
        <AlertTriangle size={34} className="text-amber-500" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {tr("PDF کتاب پیدا نشد", "Book PDF not found")}
        </p>
        <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400 max-w-md">
          {tr(
            "فایل‌های کتاب در باکت Backblaze (اسم cambridge) جست‌وجو می‌شوند. اگر تازه آپلود کرده‌ای دکمهٔ اسکن مجدد را بزن؛ اگر B2 هنوز تنظیم نیست، B2_KEY_ID و B2_APP_KEY را در فایل .env.local اضافه کن.",
            "Book files are discovered from your Backblaze bucket named “cambridge”. If you just uploaded them, press rescan. If B2 is not configured yet, add B2_KEY_ID and B2_APP_KEY to your .env.local file.",
          )}
        </p>
        {onRescan && (
          <button
            onClick={onRescan}
            disabled={rescanning}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition"
          >
            <RefreshCw size={13} className={rescanning ? "animate-spin" : ""} />
            {tr("اسکن مجدد باکت", "Rescan bucket")}
          </button>
        )}
      </div>
    );
  }

  // ---------- PDF موجود ----------
  return (
    <div className="h-full flex flex-col gap-2">
      {/* نوار کنترل */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <FileText size={15} className="text-indigo-500 shrink-0" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" dir="ltr">
            {bookTitle}
          </p>
          {!loaded && (
            <span className="text-[10px] text-slate-400 animate-pulse shrink-0">
              {tr("در حال بارگذاری…", "Loading…")}
            </span>
          )}
        </div>
        <button
          onClick={() => setIframeKey((k) => k + 1)}
          title={tr("بارگذاری مجدد", "Reload")}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
        >
          <RefreshCw size={14} />
        </button>
        <a
          href={openExternal ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          title={tr("باز کردن در تب جدید (تمام‌صفحه)", "Open in new tab (full screen)")}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* iframe — نمایشگر بومی مرورگر: زوم + صفحه + جست‌وجو دارد */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={
          compact
            ? "flex-1 min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
            : "flex-1 min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
        }
      >
        <iframe
          key={iframeKey}
          src={`${pdfUrl}#view=FitH`}
          title={bookTitle}
          onLoad={() => setLoadState({ key: iframeKey, loaded: true })}
          className="w-full h-full min-h-[340px]"
        />
      </motion.div>

      <p className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 px-1">
        <Settings2 size={11} />
        {tr(
          "زوم و شمارهٔ صفحه در نوار خود PDF — پاسخ‌نامهٔ آزمون در انتهای همین کتاب است",
          "Zoom & page number are in the PDF toolbar — the answer key is at the end of this book",
        )}
      </p>
    </div>
  );
}
