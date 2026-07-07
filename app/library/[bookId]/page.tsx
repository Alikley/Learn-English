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

export default function BookReaderPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!params.bookId) return;

    const id = Number(params.bookId);
    if (isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch("/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((books: Book[]) => {
        const found = books.find((b) => b.id === id);
        if (found) {
          setBook(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.bookId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-gray-400">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-xl mb-2">کتاب مورد نظر یافت نشد</p>
        <p className="text-sm mb-6 text-gray-500">ممکن است حذف شده باشد</p>
        <Link
          href="/library"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
        >
          بازگشت به کتابخانه
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" dir="rtl">
      {/* هدر */}
      <div className="bg-gray-800/90 backdrop-blur border-b border-gray-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <svg
              className="w-5 h-5"
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
            کتابخانه
          </Link>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-white font-bold text-sm">{book.titleFa}</h2>
              <p className="text-gray-400 text-xs">
                {book.title} - {book.author}
              </p>
            </div>
          </div>
        </div>

        {/* زوم */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition text-lg"
          >
            −
          </button>
          <span className="text-white text-sm min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-950 relative">
        <iframe
          src={`/api/books/${book.id}/pdf`}
          className="w-full border-0"
          style={{
            height: "calc(100vh - 60px)",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
          title={book.title}
        />
      </div>
    </div>
  );
}
