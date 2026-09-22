"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import Image from "next/image";
import Link from "next/link";
import { useBooks } from "../hook/useBooks";
import { getLevelInfo } from "@/types/book";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

export default function LibraryPage() {
  const { tr, dir } = useLanguage();
  const { books, loading } = useBooks();

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir={dir}>
      <div className="mb-8">
        {/* ✅ v1.0.2.۶ — گام ۵: رنگ صفحه کتابخانه با حالت روشن/تیره عوض می‌شود */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{tr("📚 کتابخانه", "📚 Library")}</h1>
        <p className="text-slate-500 dark:text-gray-400">
          {tr("کتاب‌های داستان انگلیسی برای تقویت مهارت خواندن", "English storybooks to strengthen your reading skills")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => {
          const lvl = getLevelInfo(book.level);
          return (
            <Link
              key={book.id}
              href={`/library/${book.id}`}
              className="group bg-white dark:bg-gray-800/60 backdrop-blur rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="relative aspect-2/3 overflow-hidden bg-slate-100 dark:bg-gray-900">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span
                  className={`absolute top-3 right-3 ${lvl.color} text-white text-xs px-3 py-1 rounded-full`}
                >
                  {tr(lvl.fa, lvl.en)}
                </span>
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm flex items-center gap-2">
                    {tr("📖 مطالعه کتاب", "📖 Read Book")}
                    <svg
                      className="w-4 h-4 rtl:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1 truncate">
                  {book.titleFa}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                  <HoverableText text={book.title} />
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                  <span>✍️ {book.author}</span>
                  <span>📄 {book.pages} {tr("صفحه", "pages")}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {books.length === 0 && (
        <div className="text-center py-20 text-slate-400 dark:text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">{tr("هنوز کتابی اضافه نشده", "No books added yet")}</p>
        </div>
      )}
    </div>
  );
}
