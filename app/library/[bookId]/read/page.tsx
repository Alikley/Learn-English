"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useBook } from "@/app/hook/library/useBook";
import { getStory } from "@/data/books/stories";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import ReaderTopBar from "./_components/ReaderTopBar";
import BookPaperLeaf from "./_components/BookPaperLeaf";
import FinishedView from "./_components/FinishedView";
import ReaderControls from "./_components/ReaderControls";
import PdfFallbackView from "./_components/PdfFallbackView";

// ========================================
// صفحه مطالعه کتاب — حالت برگه‌های کتاب (نسخه ۱.۰.۲.۲ — گام ۱)
// به‌جای PDF: متن داستان روی برگه‌های کاغذی + دکمه صفحه بعد
// کلمه‌های انگلیسی با هاور → ترجمه + جعبه لغات (مثل کل سایت)
// پیشرفت مطالعه در localStorage ذخیره می‌شود
//
// v1.0.2.7 — ریفکتوری: نوار بالا، برگهٔ کاغذی، کارت پایان،
// کنترل صفحه‌ها و حالت PDF به _components تفکیک شدند.
//
// v1.0.2.۹ — گام ۲: صفحه‌بندی خطی (۶ سطر در صفحه) —
// کلید پیشرفت نسخه‌دار شد تا جایگاه صفحه‌های ذخیره‌شدهٔ قدیمی
// (صفحه‌بندی پاراگرافی قبلی) با صفحه‌های جدید اشتباه نشود.
// ========================================

type Direction = 1 | -1;

function progressKey(bookId: string) {
  // v1.0.2.۹ — پسوند نسخه: صفحه‌بندی خطی جدید
  return `flex-book-progress-v2-${bookId}`;
}

// v1.0.3.3 — ذخیرهٔ پیشرفت روی سرور (گام ۴):
// fire-and-forget با debounce؛ برای مهمان‌ها بی‌صدا رد می‌شود
function saveProgressToServer(
  bookId: string,
  page: number,
  totalPages: number,
  finished: boolean,
): void {
  const numericId = Number(bookId);
  if (!Number.isInteger(numericId) || numericId <= 0) return;
  void fetch("/api/books/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookId: numericId,
      page,
      totalPages,
      finished,
    }),
  }).catch(() => {
    /* آفلاین — localStorage پشتیبان است */
  });
}

export default function BookReaderPage() {
  const { tr, dir } = useLanguage();
  const params = useParams();
  const bookId = params.bookId as string;
  const { book, loading, notFound } = useBook(bookId);

  // v1.0.3.0 — گام ۲: مطالعه کتاب هم یک فعالیت روزانه حساب می‌شود
  useEffect(() => {
    void recordStreakActivity();
  }, []);

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
  // v1.0.3.3 — علاوه بر localStorage، پیشرفت سرور هم خوانده می‌شود
  // (بیشترین صفحه ملاک است تا بین دستگاه‌ها همگام بماند)
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
      void (async () => {
        try {
          const res = await fetch(`/api/books/progress?bookId=${bookId}`);
          if (!res.ok) return;
          const data = (await res.json()) as {
            progress?: { page?: number }[];
          };
          const sp = data.progress?.[0]?.page;
          if (typeof sp === "number" && sp > 0 && sp < totalPages) {
            setSavedPage((prev) => (sp > (prev ?? 0) ? sp : prev));
          }
        } catch {
          /* بی‌خیال */
        }
      })();
    }, 0);
    return () => clearTimeout(id);
  }, [story, bookId, totalPages]);

  // ذخیره پیشرفت با هر تغییر صفحه (محلی + سرور با debounce)
  const serverSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!story || finished) return;
    try {
      localStorage.setItem(progressKey(bookId), String(page));
    } catch {
      /* بی‌خیال */
    }
    if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    serverSaveTimer.current = setTimeout(() => {
      saveProgressToServer(bookId, page, totalPages, false);
    }, 1200);
  }, [page, story, finished, bookId, totalPages]);

  useEffect(() => {
    return () => {
      if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    };
  }, []);

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
      // v1.0.3.3 — پایان کتاب روی سرور هم ثبت می‌شود
      saveProgressToServer(bookId, 0, totalPages, true);
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
    return <PdfFallbackView book={book} />;
  }

  const currentPage = story[page];
  const isLast = page === totalPages - 1;

  // ---------- صفحه مطالعه برگه‌ای ----------
  return (
    <div className="min-h-[80vh] px-3 md:px-6 py-4 md:py-8" dir={dir}>
      {/* نوار بالای ریدر */}
      <ReaderTopBar
        book={book}
        savedPage={savedPage}
        resumed={resumed}
        page={page}
        onResume={(p) => {
          goTo(p);
          setResumed(true);
        }}
        onStartOver={() => setResumed(true)}
      />

      {/* ---------- برگه کتاب ---------- */}
      <div className="max-w-3xl mx-auto">
        <BookPaperLeaf
          page={page}
          totalPages={totalPages}
          direction={direction}
          finished={finished}
          currentPage={currentPage}
        >
          <FinishedView
            bookTitleFa={book.titleFa}
            totalPages={totalPages}
            onReplay={() => {
              setFinished(false);
              setDirection(-1);
              goTo(0);
            }}
          />
        </BookPaperLeaf>

        {/* ---------- کنترل صفحه ---------- */}
        {!finished && (
          <ReaderControls
            page={page}
            totalPages={totalPages}
            isLast={isLast}
            onPrev={goPrev}
            onNext={goNext}
            onGoTo={goTo}
          />
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
