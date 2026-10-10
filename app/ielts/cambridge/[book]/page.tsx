"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, RefreshCw, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeBook } from "@/app/hook/ielts/useIelts";
import { useBookExamLauncher } from "@/app/hook/ielts/useBookExamLauncher";
import PageLoading from "@/app/components/PageLoading";
import BookTabs, { type BookTab } from "./_components/BookTabs";
import TestBox from "./_components/TestBox";
import StatsTab from "./_components/StatsTab";
import AttemptRow from "./_components/AttemptRow";
import { SKILLS } from "./_components/skill-meta";

// ========================================
// صفحهٔ جزئیات کتاب کمبریج (v1.0.4.2 — English 1.0.0.3)
// «باکس به باکس» مثل تستینو — ۴ کارت تست + سه تب
// 🧹 کلین‌کد: شروع آزمون → useBookExamLauncher، کارت تست → TestBox،
//    آمار → StatsTab، تاریخچه → AttemptRow، تب‌ها → BookTabs
// (قبلاً ۵۵۴ خط در یک فایل؛ اکنون این صفحه فقط چیدمان است)
// ========================================

export default function BookDetailPage() {
  const { book: bookParam } = useParams<{ book: string }>();
  const { tr, dir } = useLanguage();
  const bookId = Number(bookParam);
  const valid = Number.isInteger(bookId) && bookId >= 1 && bookId <= 21;
  const { detail, loading, error, refetch } = useCambridgeBook(valid ? bookId : null);
  const [tab, setTab] = useState<BookTab>("test");
  const { starting, startError, begin } = useBookExamLauncher(bookId, valid);

  const num = String(bookId).padStart(2, "0");

  // آمار مهارت‌ها برای تب Statistics (بالای returnهای زودهنگام — ترتیب هوک‌ها ثابت)
  const stats = useMemo(() => {
    const attemptsList = detail?.attempts ?? [];
    return SKILLS.map((s) => {
      const list = attemptsList.filter((a) => a.skill === s.key && a.status === "SUBMITTED");
      const bands = list.map((a) => a.bandScore).filter((b): b is number => b != null);
      const best = bands.length > 0 ? Math.max(...bands) : null;
      const avg = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : null;
      return {
        skill: s.key,
        label: tr(s.fa, s.en),
        attempts: list.length,
        best,
        avg: avg != null ? Math.round(avg * 2) / 2 : null,
      };
    });
  }, [detail, tr]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  if (error || !detail || !valid) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle size={32} className="text-amber-500" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {error ?? tr("کتاب یافت نشد", "Book not found")}
        </p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          {tr("تلاش دوباره", "Try again")}
        </button>
      </div>
    );
  }

  const totalAttempts = detail.attempts.length;
  const submittedCount = detail.attempts.filter((a) => a.status === "SUBMITTED").length;

  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* ================= هدر ================= */}
        <div className="flex items-center gap-3">
          <Link
            href="/ielts/cambridge"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-600 transition"
            title={tr("بازگشت به فهرست", "Back to list")}
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
          <div className="flex-1">
            <h1
              className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100"
              dir="ltr"
            >
              Cambridge {num}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <GraduationCap size={12} />
              {tr("آیلتس آکادمیک — ۴ تست کامل", "IELTS Academic — 4 complete tests")}
            </p>
          </div>
          <button
            onClick={() => void refetch()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition"
            title={tr("تازه‌سازی", "Refresh")}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ================= تب‌ها ================= */}
        <BookTabs tab={tab} onTab={setTab} />

        {startError && (
          <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
            {startError}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* ================= تب آزمون — ۴ کارت تست ================= */}
          {tab === "test" && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {detail.book.tests.map((test, i) => (
                <TestBox
                  key={test.slug}
                  testId={test.id}
                  slug={test.slug}
                  index={i}
                  attempts={detail.attempts}
                  starting={starting}
                  onBegin={begin}
                />
              ))}
            </motion.div>
          )}

          {/* ================= تب آمار ================= */}
          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StatsTab stats={stats} totalAttempts={totalAttempts} submittedCount={submittedCount} />
            </motion.div>
          )}

          {/* ================= تب نتیجه ================= */}
          {tab === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {detail.attempts.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-10">
                  {tr("هنوز تلاشی ثبت نشده است.", "No attempts yet.")}
                </p>
              )}
              {detail.attempts.map((a) => (
                <AttemptRow key={a.id} a={a} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
