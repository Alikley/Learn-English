"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { FileText, BookOpen } from "lucide-react";
import type { Book } from "@prisma/client";

// ========================================
// حالت «متن آماده نیست» → پیشنهاد PDF (رفتار قدیمی حفظ می‌شود)
// (از صفحهٔ ریدر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function PdfFallbackView({ book }: { book: Book }) {
  const { tr, dir } = useLanguage();

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
