"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  RotateCcw,
  Sparkles,
  BookMarked,
  Library,
} from "lucide-react";
import { useBook } from "@/app/hook/useBook";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import { getStory } from "@/data/books/stories";

// ========================================
// صفحه مطالعه کتاب — حالت برگه‌های کتاب (نسخه ۱.۰.۲.۲ — گام ۱)
// به‌جای PDF: متن داستان روی برگه‌های کاغذی + دکمه صفحه بعد
// کلمه‌های انگلیسی با هاور → ترجمه + جعبه لغات (مثل کل سایت)
// پیشرفت مطالعه در localStorage ذخیره می‌شود
// ========================================

type Direction = 1 | -1;

function progressKey(bookId: string) {
  return `flex-book-progress-${bookId}`;
}

export default function BookReaderPage() {
  const { tr, dir } = useLanguage();
  const params = useParams();
  const bookId = params.bookId as string;
  const { book, loading, notFound } = useBook(bookId);

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [savedPage, setSavedPage] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [resumed, setResumed] = useState(false);

  const story = useMemo(() => {
    if (!book) return null;
    return getStory(bookId, book.title);
  }, [book, bookId]);

  const totalPages = story?.length ?? 0;

  // بازیابی پیشرفت ذخیره‌شده — الگوی تاخیری سازگار با React Compiler
  useEffect(() => {
    if (!story) return;
    const id = setTimeout(() => {
      try {
        const saved = Number(localStorage.getItem(progressKey(bookId)));
        if (Number.isFinite(saved) && saved > 0 && saved < totalPages) {
          setSavedPage(saved);
        }
      } catch {
        /* بی‌خیال */
      }
    }, 0);
    return () => clearTimeout(id);
  }, [story, bookId, totalPages]);

  // ذخیره پیشرفت با هر تغییر صفحه
  useEffect(() => {
    if (!story || finished) return;
    try {
      localStorage.setItem(progressKey(bookId), String(page));
    } catch {
      /* بی‌خیال */
    }
  }, [page, story, finished, bookId]);

  const goTo = useCallback(
    (next: number) => {
      if (!story) return;
      if (next < 0 || next > totalPages - 1) return;
      setDirection(next > page ? 1 : -1);
      setPage(next);
    },
    [story, page, totalPages],
  );

  const goNext = useCallback(() => {
    if (page >= totalPages - 1) {
      // آخرین صفحه → پایان کتاب
      setDirection(1);
      setFinished(true);
      try {
        localStorage.setItem(progressKey(bookId), "0");
      } catch {
        /* بی‌خیال */
      }
      return;
    }
    goTo(page + 1);
  }, [page, totalPages, goTo, bookId]);

  const goPrev = useCallback(() => {
    if (finished) {
      setFinished(false);
      setDirection(-1);
      return;
    }
    goTo(page - 1);
  }, [finished, goTo, page]);

  // کیبورد: فلش‌ها (در چیدمان راست‌به‌چپ فلش چپ = جلو)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // ---------- حالت‌های بارگذاری / نبود کتاب ----------
  if (loading) return <PageLoading minHeightClass="min-h-[70vh]" />;

  if (notFound || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {tr("کتاب مورد نظر یافت نشد", "Book not found")}
        </p>
        <Link
          href="/library"
          className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm transition"
        >
          {tr("بازگشت", "Back")}
        </Link>
      </div>
    );
  }

  // ---------- کتاب متن آماده ندارد → پیشنهاد PDF (رفتار قدیمی حفظ می‌شود) ----------
  if (!story) {
    return (
      <div
        className="flex items-center justify-center min-h-[70vh] px-4"
        dir={dir}
      >
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            {tr("متن این کتاب هنوز آماده نشده است", "This book's text is not ready yet")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-6">
            {tr(
              `صفحه مطالعه برگه‌ای در حال حاضر برای «${book.titleFa}» موجود نیست. می‌توانید نسخه PDF را ببینید یا به کتابخانه برگردید.`,
              `The page-by-page reader is not available for "${book.titleFa}" yet. You can view the PDF version or go back to the library.`
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/api/books/${book.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition"
            >
              <FileText className="h-4 w-4" />
              {tr("مشاهده PDF", "View PDF")}
            </a>
            <Link
              href={`/library/${book.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition"
            >
              {tr("بازگشت به کتاب", "Back to Book")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = story[page];
  const isLast = page === totalPages - 1;

  // ---------- صفحه مطالعه برگه‌ای ----------
  return (
    <div className="min-h-[80vh] px-3 md:px-6 py-4 md:py-8" dir={dir}>
      {/* نوار بالای ریدر */}
      <div className="max-w-3xl mx-auto mb-4 md:mb-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/library/${book.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm text-xs font-bold transition-colors shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              {tr("بازگشت", "Back")}
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                {book.titleFa}
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 truncate">
                <HoverableText text={book.title} /> · {book.author}
              </p>
            </div>
          </div>

          <a
            href={`/api/books/${book.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            title={tr("نسخه PDF کتاب", "Book PDF Version")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm text-xs transition-colors shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </a>
        </div>

        {/* پیشنهاد ادامه مطالعه */}
        {savedPage !== null && !resumed && page === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-2.5"
          >
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              📖 {tr(`دفعه قبل تا صفحه ${savedPage + 1} خوانده بودی`, `Last time you read up to page ${savedPage + 1}`)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  goTo(savedPage);
                  setResumed(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
              >
                {tr("ادامه بده", "Continue")}
              </button>
              <button
                onClick={() => setResumed(true)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {tr("از اول", "Start Over")}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ---------- برگه کتاب ---------- */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* لبه‌های برگه‌های بعدی (حس کتاب فیزیکی) */}
          <div className="absolute inset-y-2 -right-2 left-2 bg-[#EFE6D4] dark:bg-slate-800 rounded-3xl rotate-[0.6deg] shadow-sm" />
          <div className="absolute inset-y-1 -right-1 left-1 bg-[#F5EDDD] dark:bg-slate-800/80 rounded-3xl rotate-[0.3deg] shadow-sm" />

          <div className="relative bg-[#FDF9F0] dark:bg-[#141c2b] rounded-3xl shadow-xl shadow-amber-900/10 dark:shadow-black/40 border border-amber-100/60 dark:border-slate-700/70 overflow-hidden transition-colors duration-300">
            {/* سایه عطف کتاب (سمت راست — کتاب فارسی) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/10 dark:from-black/40 to-transparent" />

            {/* نوار پیشرفت مطالعه */}
            <div className="h-1 bg-amber-100/50 dark:bg-slate-700/50">
              <div
                className="h-full bg-linear-to-l from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 transition-all duration-500"
                style={{
                  width: `${((finished ? totalPages : page + 1) / totalPages) * 100}%`,
                }}
              />
            </div>

            {/* ✅ v1.0.2.۶ — گام ۴: ارتفاع ثابت برگه — همه صفحات هم‌اندازه‌اند؛
                متن بلندتر داخل برگه اسکرول می‌شود (رفع کم‌وزیاد شدن ارتفاع هر صفحه) */}
            <div className="px-6 md:px-14 py-8 md:py-12 h-[30rem] md:h-[36rem] flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                {finished ? (
                  // ---------- کارت پایان کتاب ----------
                  <motion.div
                    key="finished"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", delay: 0.15 }}
                      className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5"
                    >
                      <Sparkles className="h-10 w-10 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                      {tr("آفرین! کتاب را تمام کردی 🎉", "Well done! You finished the book 🎉")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-2">
                      {tr(
                        `«${book.titleFa}» را در ${totalPages} برگه خواندی.`,
                        `You read "${book.titleFa}" in ${totalPages} pages.`
                      )}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-6 mb-8 max-w-sm">
                      {tr(`کلمه‌های ناآشنا را با هاور به جعبه لغات اضافه کردی؟ در
                      لغت‌نامه می‌توانی آن‌ها را مرور کنی.`, "Added unfamiliar words to your Word Box? Review them in the Vocabulary page.")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setFinished(false);
                          setDirection(-1);
                          goTo(0);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {tr("خواندن دوباره", "Read Again")}
                      </button>
                      <Link
                        href="/library"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 rounded-xl text-sm font-bold border border-amber-200/60 dark:border-slate-700 transition-colors"
                      >
                        <Library className="h-4 w-4" />
                        {tr("کتابخانه", "Library")}
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  // ---------- برگه متن ----------
                  <motion.div
                    key={page}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * -48, rotateY: 4 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: direction * 48, rotateY: -4 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    /* v1.0.2.۶ — گام ۴: اسکرول داخلی متن */
                    className="flex-1 min-h-0 overflow-y-auto"
                  >
                    {currentPage.heading && (
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-300 mb-6 flex items-center gap-3">
                        <BookMarked className="h-5 w-5 text-amber-500/70 dark:text-amber-400/70 shrink-0" />
                        <span dir="ltr">{currentPage.heading}</span>
                      </h2>
                    )}

                    <div dir="ltr" className="space-y-5">
                      {currentPage.paragraphs.map((p, i) => (
                        <p
                          key={i}
                          className="font-serif text-[17px] md:text-[19px] leading-[2.1] text-slate-800 dark:text-slate-200 text-justify"
                        >
                          <HoverableText text={p} />
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* شماره برگه */}
              {!finished && (
                <div className="pt-6 mt-2 border-t border-dashed border-amber-200/70 dark:border-slate-700 flex items-center justify-center">
                  <span className="font-serif text-xs text-amber-700/70 dark:text-slate-500 tracking-widest">
                    — {page + 1} —
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- کنترل صفحه ---------- */}
        {!finished && (
          <div className="mt-5 md:mt-7 flex items-center justify-between gap-3">
            {/* قبلی (سمت راست در چیدمان راست‌به‌چپ) */}
            <button
              onClick={goPrev}
              disabled={page === 0}
              className="inline-flex items-center gap-1.5 px-4 md:px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
              {tr("صفحه قبل", "Previous Page")}
            </button>

            {/* نقاط صفحه‌ها */}
            <div className="hidden md:flex items-center gap-1.5">
              {story.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={tr(`صفحه ${i + 1}`, `Page ${i + 1}`)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === page
                      ? "w-7 bg-amber-600 dark:bg-amber-400"
                      : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-amber-500/50"
                  }`}
                />
              ))}
            </div>

            <span className="md:hidden text-xs text-slate-400 dark:text-slate-500 font-medium">
              {page + 1} {tr("از", "of")} {totalPages}
            </span>

            {/* بعدی (سمت چپ) */}
            <button
              onClick={goNext}
              className={`inline-flex items-center gap-1.5 px-5 md:px-7 py-3 rounded-2xl text-white text-sm font-bold shadow-md transition-all hover:scale-[1.03] active:scale-95 ${
                isLast
                  ? "bg-linear-to-l from-emerald-600 to-emerald-500 shadow-emerald-600/25"
                  : "bg-linear-to-l from-amber-600 to-amber-500 shadow-amber-600/25"
              }`}
            >
              {isLast ? tr("پایان کتاب", "End of Book") : tr("صفحه بعد", "Next Page")}
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* راهنمای هاور — فقط صفحه اول */}
        {page === 0 && !finished && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500"
          >
            {tr("💡 روی هر کلمه انگلیسی هاور کن تا ترجمه و گزینه «افزودن به جعبه لغت» را ببینی", "💡 Hover any English word to see its translation and the “Add to Word Box” option")}
          </motion.p>
        )}
      </div>
    </div>
  );
}
