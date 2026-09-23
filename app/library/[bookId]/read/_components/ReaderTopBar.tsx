"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, FileText } from "lucide-react";
import type { Book } from "@prisma/client";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// نوار بالای ریدر کتاب: بازگشت + عنوان + PDF
// + پیشنهاد ادامهٔ مطالعه از صفحهٔ ذخیره‌شده
// (از صفحهٔ ریدر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function ReaderTopBar({
  book,
  savedPage,
  resumed,
  page,
  onResume,
  onStartOver,
}: {
  book: Book;
  savedPage: number | null;
  resumed: boolean;
  page: number;
  onResume: (page: number) => void;
  onStartOver: () => void;
}) {
  const { tr } = useLanguage();

  return (
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
              onClick={() => onResume(savedPage)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
            >
              {tr("ادامه بده", "Continue")}
            </button>
            <button
              onClick={onStartOver}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {tr("از اول", "Start Over")}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
