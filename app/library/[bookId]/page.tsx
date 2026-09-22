"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useBook } from "@/app/hook/useBook";
import { getLevelInfo } from "@/types/book";

export default function BookDetailPage() {
  const { tr, dir } = useLanguage();
  const params = useParams();
  const bookId = params.bookId as string;
  const { book, loading, notFound } = useBook(bookId);

  if (loading) return <PageLoading minHeightClass="min-h-screen" />;

  if (notFound || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="text-6xl mb-6">😕</span>
        <p className="text-slate-500 dark:text-gray-400 text-lg mb-6">{tr("کتاب مورد نظر یافت نشد", "Book not found")}</p>
        <Link
          href="/library"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition text-sm"
        >
          {tr("بازگشت به کتابخانه", "Back to Library")}
        </Link>
      </div>
    );
  }

  const lvl = getLevelInfo(book.level);

  return (
    // ✅ v1.0.2.۶ — گام ۵: رنگ صفحه جزئیات کتاب با حالت روشن/تیره عوض می‌شود
    <div className="min-h-screen" dir={dir}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-125 h-125 bg-blue-300/20 dark:bg-blue-900/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-100 h-100 bg-indigo-300/20 dark:bg-indigo-900/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 py-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-500 mb-10">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-gray-300 transition">
            {tr("خانه", "Home")}
          </Link>
          <svg
            className="w-3.5 h-3.5 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link href="/library" className="hover:text-slate-700 dark:hover:text-gray-300 transition">
            {tr("کتابخانه", "Library")}
          </Link>
          <svg
            className="w-3.5 h-3.5 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-700 dark:text-gray-300">{book.titleFa}</span>
        </nav>

        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/6 shadow-2xl shadow-black/10 dark:shadow-black/30">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-8 md:p-10 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs border bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10">
                  📄 {book.pages} {tr("صفحه", "pages")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs border bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10">
                  ✍️ {book.author}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${lvl.color}`}
                >
                  {tr(lvl.fa, lvl.en)}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 leading-tight">
                {book.titleFa}
              </h1>
              <p className="text-blue-600/80 dark:text-blue-400/80 text-base md:text-lg mb-8 font-medium">
                {book.title}
              </p>

              <p className="text-slate-500 dark:text-gray-400 leading-8 text-[15px] mb-10 flex-1">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/library/${book.id}/read`}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-base font-bold transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/20 hover:scale-[1.02]"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {tr("شروع خواندن کتاب!", "Start Reading!")}
                </Link>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-5 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/4 dark:hover:bg-white/8 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 rounded-2xl text-sm transition border border-slate-200 dark:border-white/6"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {tr("بازگشت به کتابخانه", "Back to Library")}
                </Link>
              </div>

              {/* v1.0.2.۲ — گام ۱: مطالعه برگه‌ای به‌جای PDF */}
              <p className="text-xs text-blue-600/70 dark:text-blue-300/70 flex items-center gap-1.5">
                <span>📖</span>
                {tr("صفحه‌به‌صفحه و بدون PDF — با هاور روی هر کلمه، ترجمه و جعبه لغت", "Page by page, no PDF — hover any word for its translation and Word Box")}
              </p>
            </div>

            <div className="md:w-72 lg:w-80 flex items-center justify-center p-8 md:p-10">
              <div className="relative group">
                <div className="absolute -bottom-4 left-4 right-4 h-16 bg-black/20 dark:bg-black/40 rounded-2xl blur-xl group-hover:h-20 transition-all duration-500" />
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30 dark:shadow-black/50 ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-slate-300 dark:group-hover:ring-white/20 transition-all duration-500 group-hover:-translate-y-1">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/grammar.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
