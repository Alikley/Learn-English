"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Book = {
  id: number;
  title: string;
  titleFa: string;
  author: string;
  description: string;
  level: string;
  coverUrl: string;
  pdfPath: string;
  pages: number;
};

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.bookId) return;
    const id = Number(params.bookId);
    if (isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch("/api/books")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((books: Book[]) => {
        const found = books.find((b) => b.id === id);
        found ? setBook(found) : setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.bookId]);

  const levelInfo = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return {
          fa: "مبتدی",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        };
      case "INTERMEDIATE":
        return {
          fa: "متوسط",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
        };
      case "ADVANCED":
        return {
          fa: "پیشرفته",
          color: "bg-rose-500/15 text-rose-400 border-rose-500/25",
        };
      default:
        return {
          fa: level,
          color: "bg-gray-500/15 text-gray-400 border-gray-500/25",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <span className="text-6xl mb-6">😕</span>
        <p className="text-gray-400 text-lg mb-6">کتاب مورد نظر یافت نشد</p>
        <Link
          href="/library"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition text-sm"
        >
          بازگشت به کتابخانه
        </Link>
      </div>
    );
  }

  const lvl = levelInfo(book.level);

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* گرادیانت بکدراپ */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 py-8">
        {/* بreadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-gray-300 transition">
            خانه
          </Link>
          <svg
            className="w-3.5 h-3.5 rotate-180"
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
          <Link href="/library" className="hover:text-gray-300 transition">
            کتابخانه
          </Link>
          <svg
            className="w-3.5 h-3.5 rotate-180"
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
          <span className="text-gray-300">{book.titleFa}</span>
        </nav>

        {/* کارت اصلی */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/30">
          <div className="flex flex-col md:flex-row">
            {/* بخش اطلاعات */}
            <div className="flex-1 p-8 md:p-10 flex flex-col">
              {/* تگ‌ها */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs border bg-white/5 text-gray-300 border-white/10">
                  📄 {book.pages} صفحه
                </span>
                <span className="px-3 py-1 rounded-full text-xs border bg-white/5 text-gray-300 border-white/10">
                  ✍️ {book.author}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${lvl.color}`}
                >
                  {lvl.fa}
                </span>
              </div>

              {/* عنوان */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1 leading-tight">
                {book.titleFa}
              </h1>
              <p className="text-blue-400/80 text-base md:text-lg mb-8 font-medium">
                {book.title}
              </p>

              {/* توضیحات */}
              <p className="text-gray-400 leading-8 text-[15px] mb-10 flex-1">
                {book.description}
              </p>

              {/* دکمه‌ها */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/library/${book.id}/read`}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-base font-bold transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/20 hover:scale-[1.02]"
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
                  شروع خواندن کتاب!
                </Link>

                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-5 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-gray-300 rounded-2xl text-sm transition border border-white/[0.06]"
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
                  بازگشت به کتابخانه
                </Link>
              </div>
            </div>

            {/* کاور کتاب */}
            <div className="md:w-72 lg:w-80 flex items-center justify-center p-8 md:p-10">
              <div className="relative group">
                {/* سایه */}
                <div className="absolute -bottom-4 left-4 right-4 h-16 bg-black/40 rounded-2xl blur-xl group-hover:h-20 transition-all duration-500" />
                {/* کاور */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500 group-hover:-translate-y-1">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/grammar.svg";
                    }}
                  />
                  {/* بازتاب نور */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
