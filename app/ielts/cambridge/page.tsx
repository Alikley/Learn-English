"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeBooks } from "@/app/hook/ielts/useIelts";
import { useCambridgeLibrary } from "@/app/hook/ielts/useCambridgeLibrary";
import B2Notices from "./_components/B2Notices";
import LibraryToolbar from "./_components/LibraryToolbar";
import BookCard from "./_components/BookCard";

// ========================================
// صفحهٔ کتاب‌های کمبریج (v1.0.4.2 — English 1.0.0.3)
// مثل تستینو: جستجو + مرتب‌سازی + «N کتاب پیدا شد» + کارت هر کتاب
// 🧹 کلین‌کد: منطق → useCambridgeLibrary، بنرها → B2Notices،
//    نوار ابزار → LibraryToolbar، کارت → BookCard
// (قبلاً ۳۸۲ خط در یک فایل؛ اکنون این صفحه فقط چیدمان است)
// ========================================

export default function CambridgeListPage() {
  const { tr, dir } = useLanguage();
  const { books, scan, attempts, loading, error, refetch } = useCambridgeBooks();
  const [rescanning, setRescanning] = useState(false);
  const { query, setQuery, sort, setSort, statsByBook, filtered, anyProgress } =
    useCambridgeLibrary(books, attempts);

  const rescan = async () => {
    setRescanning(true);
    await refetch(true);
    setRescanning(false);
  };

  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* ================= هدر ================= */}
        <div className="flex items-center gap-3">
          <Link
            href="/ielts"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-600 transition"
            title={tr("بازگشت به آیلتس", "Back to IELTS")}
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
              {tr("کمبریج", "Cambridge")}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {tr(
                "۲۱ کتاب × ۴ تست کامل آکادمیک — با PDF و صدای واقعی",
                "21 books × 4 full Academic tests — real PDF and audio",
              )}
            </p>
          </div>
          <button
            onClick={() => void rescan()}
            disabled={rescanning}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition disabled:opacity-60"
            title={tr("اسکن مجدد باکت B2", "Rescan B2 bucket")}
          >
            <RefreshCw size={15} className={rescanning ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ================= هشدارهای B2 ================= */}
        <B2Notices scan={scan} loading={loading} rescanning={rescanning} onRescan={() => void rescan()} />

        {/* ================= جستجو + مرتب‌سازی ================= */}
        <LibraryToolbar query={query} onQuery={setQuery} sort={sort} onSort={setSort} />

        {/* شمارش */}
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {tr(`${filtered.length} کتاب پیدا شد`, `${filtered.length} books found`)}
          {anyProgress && (
            <span className="ms-2 text-emerald-500">
              · {tr("رکوردهای شما ثبت شده", "your records are saved")}
            </span>
          )}
        </p>

        {/* ================= وضعیت‌ها ================= */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">{tr("در حال بارگذاری…", "Loading…")}</span>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-14">
            <AlertCircle size={30} className="text-amber-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              {tr("تلاش دوباره", "Try again")}
            </button>
          </div>
        )}

        {/* ================= کارت‌ها ================= */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((b, i) => (
              <BookCard key={b.slug} book={b} index={i} stats={statsByBook.get(b.id)} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-400 py-14">
                {tr("کتابی با این عبارت پیدا نشد.", "No books match your search.")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
