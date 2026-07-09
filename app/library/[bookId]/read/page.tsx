"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBook } from "@/app/hook/useBook";

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const { book, loading, notFound } = useBook(bookId);
  const [zoom, setZoom] = useState(100);
  const [showBar, setShowBar] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    if (!showBar) return;
    const t = setTimeout(() => setShowBar(false), 3000);
    return () => clearTimeout(t);
  }, [showBar]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(`/library/${bookId}`);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bookId, router]);

  const handleZoom = useCallback((d: number) => {
    setZoom((z) => Math.min(200, Math.max(60, z + d)));
    setShowBar(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F0E8]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-700 border-t-transparent" />
          <span className="text-amber-800/60 text-sm">
            در حال بارگذاری کتاب...
          </span>
        </div>
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F0E8]">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-amber-900/60 mb-4">کتاب مورد نظر یافت نشد</p>
        <Link
          href="/library"
          className="px-5 py-2 bg-amber-800 text-white rounded-xl text-sm hover:bg-amber-700 transition"
        >
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-[#F5F0E8] overflow-hidden"
      dir="rtl"
    >
      {/* نوار بالایی */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/60 via-black/30 to-transparent px-6 py-4 flex items-center justify-between transition-all duration-500 ${showBar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/library/${book.id}`)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            بستن
          </button>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-white/60 text-xs">
            {book.titleFa} — {book.author}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-xl px-2 py-1">
          <button
            onClick={() => handleZoom(-10)}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition text-sm font-bold"
          >
            −
          </button>
          <span className="text-white/80 text-xs w-10 text-center font-mono">
            {zoom}%
          </span>
          <button
            onClick={() => handleZoom(10)}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* نوار پایین */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-50 bg-linear-to-t from-black/50 to-transparent px-6 py-4 flex items-center justify-center transition-all duration-500 ${showBar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <span className="text-white/40 text-xs">
          برای نمایش منو روی صفحه کلیک کنید · Escape برای خروج
        </span>
      </div>

      {/* PDF */}
      <div
        className="flex-1 relative cursor-pointer"
        onClick={() => setShowBar(!showBar)}
      >
        {!pdfReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#F5F0E8]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-700/40 border-t-amber-700" />
              <span className="text-amber-800/50 text-sm">
                در حال آماده‌سازی کتاب...
              </span>
            </div>
          </div>
        )}
        <iframe
          src={`/api/books/${book.id}/pdf`}
          className="w-full h-full border-0 bg-white"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
          title={book.title}
          onLoad={() => setPdfReady(true)}
        />
      </div>
    </div>
  );
}
