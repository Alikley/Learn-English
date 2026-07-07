"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) return;
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const levelLabel = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return { fa: "مبتدی", color: "bg-green-500" };
      case "INTERMEDIATE":
        return { fa: "متوسط", color: "bg-yellow-500" };
      case "ADVANCED":
        return { fa: "پیشرفته", color: "bg-red-500" };
      default:
        return { fa: level, color: "bg-gray-500" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      {/* هدر */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📚 کتابخانه</h1>
        <p className="text-gray-400">
          کتاب‌های داستان انگلیسی برای تقویت مهارت خواندن
        </p>
      </div>

      {/* کارت‌های کتاب */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => {
          const lvl = levelLabel(book.level);
          return (
            <Link
              key={book.id}
              href={`/library/${book.id}`}
              className="group bg-gray-800/60 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* کاور کتاب */}
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* سطح کتاب */}
                <span
                  className={`absolute top-3 right-3 ${lvl.color} text-white text-xs px-3 py-1 rounded-full`}
                >
                  {lvl.fa}
                </span>
                {/* اورلی روی hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm flex items-center gap-2">
                    📖 مطالعه کتاب
                    <svg
                      className="w-4 h-4 rotate-180"
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

              {/* اطلاعات کتاب */}
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-1 truncate">
                  {book.titleFa}
                </h3>
                <p className="text-blue-400 text-sm mb-2">{book.title}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>✍️ {book.author}</span>
                  <span>📄 {book.pages} صفحه</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {books.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">هنوز کتابی اضافه نشده</p>
        </div>
      )}
    </div>
  );
}
