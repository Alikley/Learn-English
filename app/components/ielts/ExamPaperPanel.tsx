"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import PdfExamPanel from "@/app/components/ielts/PdfExamPanel";
import type { IeltsSkill } from "@/types/ielts";

// ========================================
// پنل برگهٔ امتحانی (v1.0.3.4)
// در «حالت آزمون» به‌جای PDF کامل کتاب، برگهٔ امتحانی
// اختصاصی همان تست/مهارت نمایش داده می‌شود:
//   /api/ielts/books/[b]/tests/[t]/paper?skill=…
//  - ?check=1 اول در دسترس بودن را می‌پرسد
//  - موجود → iframe فقط صفحات همان تست (با صفحهٔ جلد)
//  - ناموجود → پیام دلیل + بازگشت به PDF کامل کتاب
//    (آزمون هرگز متوقف نمی‌شود)
// حالت تمرین از همان PdfExamPanel قبلی استفاده می‌کند.
// ========================================

type CheckState =
  | { phase: "loading" }
  | {
      phase: "ready";
      available: boolean;
      reason: string | null;
      fromPage: number | null;
      toPage: number | null;
      totalPages: number | null;
    };

export default function ExamPaperPanel({
  bookId,
  testId,
  skill,
  fallbackPdfUrl,
}: {
  bookId: number;
  testId: number;
  skill: IeltsSkill;
  /** PDF کامل کتاب — فقط اگر برگه ساخته نشد */
  fallbackPdfUrl: string | null;
}) {
  const { tr } = useLanguage();
  const [check, setCheck] = useState<CheckState>({ phase: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // بررسی در دسترس بودن برگه — با تاخیر الگوی سایت (React Compiler)
  useEffect(() => {
    const t = setTimeout(() => {
      setCheck({ phase: "loading" });
      void (async () => {
        try {
          const res = await fetch(
            `/api/ielts/books/${bookId}/tests/${testId}/paper?skill=${skill}&check=1`,
          );
          if (!res.ok) throw new Error();
          const data = (await res.json()) as {
            available: boolean;
            reason: string | null;
            fromPage: number | null;
            toPage: number | null;
            totalPages: number | null;
          };
          setCheck({ phase: "ready", ...data });
        } catch {
          setCheck({
            phase: "ready",
            available: false,
            reason: tr(
              "بررسی برگهٔ امتحانی ناموفق بود — اتصال را چک کن",
              "Could not check the exam paper — check your connection",
            ),
            fromPage: null,
            toPage: null,
            totalPages: null,
          });
        }
      })();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, testId, skill, reloadKey]);

  // ---------- در حال بررسی ----------
  if (check.phase === "loading") {
    return (
      <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 text-center px-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
        <Loader2 size={30} className="text-indigo-500 animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {tr("در حال آماده‌سازی برگهٔ امتحانی…", "Preparing your exam paper…")}
        </p>
        <p className="text-[11px] text-slate-400 leading-6 max-w-sm">
          {tr(
            "بار اول چند ثانیه طول می‌کشد (خواندن صفحات کتاب) — بعد از آن کش می‌شود.",
            "The first time takes a few seconds (reading the book pages) — then it is cached.",
          )}
        </p>
      </div>
    );
  }

  const skillEn = skill === "listening" ? "LISTENING" : skill === "reading" ? "READING" : "WRITING";
  const paperUrl = `/api/ielts/books/${bookId}/tests/${testId}/paper?skill=${skill}`;
  const bookTitle = `Cambridge IELTS ${String(bookId).padStart(2, "0")} — Test ${testId} · ${skillEn}`;

  // ---------- برگهٔ امتحانی موجود ----------
  if (check.available) {
    return (
      <div className="h-full flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <ScrollText size={15} className="text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" dir="ltr">
              {bookTitle}
            </p>
            <span className="shrink-0 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-0.5">
              {tr("برگهٔ امتحانی این تست", "This test's exam paper")}
            </span>
          </div>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title={tr("بررسی دوباره", "Check again")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <RefreshCw size={14} />
          </button>
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={tr("باز کردن در تب جدید (تمام‌صفحه)", "Open in new tab (full screen)")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <span className="text-[10px] text-slate-400 px-1" dir="ltr">
          {check.fromPage != null && check.toPage != null
            ? `Pages ${check.fromPage}–${check.toPage} of ${check.totalPages ?? "?"} + exam cover page`
            : ""}
        </span>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
        >
          <iframe
            key={`${paperUrl}-${reloadKey}`}
            src={`${paperUrl}#view=FitH`}
            title={bookTitle}
            className="w-full h-full min-h-[420px]"
          />
        </motion.div>
      </div>
    );
  }

  // ---------- ناموجود → بازگشت به PDF کامل کتاب ----------
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-start gap-2 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3.5 py-2.5">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
            {tr("برگهٔ امتحانی اختصاصی ساخته نشد", "Dedicated exam paper could not be built")}
          </p>
          <p className="text-[10px] leading-5 text-amber-600/90 dark:text-amber-400/90">
            {check.reason ?? ""}
            {" · "}
            {tr("فعلاً PDF کامل کتاب باز می‌شود.", "Falling back to the full book PDF.")}
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition shrink-0"
          title={tr("تلاش دوباره", "Try again")}
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-[380px]">
        <PdfExamPanel
          pdfUrl={fallbackPdfUrl}
          bookTitle={`Cambridge IELTS ${String(bookId).padStart(2, "0")} — Full Book PDF`}
        />
      </div>
      <p className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 px-1">
        <FileText size={11} />
        {tr(
          "صفحات مربوط به این تست را از فهرست کتاب پیدا کن؛ پس از تحویل، پاسخ‌نامه در انتهای همین کتاب است.",
          "Find this test's pages in the book's contents; after submitting, the answer key is at the end of this book.",
        )}
      </p>
    </div>
  );
}
