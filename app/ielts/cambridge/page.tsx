"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  Headphones,
  PenLine,
  ClipboardList,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Music4,
  CloudOff,
  ArrowUpDown,
  Flame,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeBooks } from "@/app/hook/ielts/useIelts";
import type { IeltsBookSummary } from "@/types/ielts";

// ========================================
// صفحهٔ کتاب‌های کمبریج (v1.0.3.3 — گام ۲ و ۳)
// مثل تستینو: جستجو + مرتب‌سازی + «N کتاب پیدا شد» + کارت
// هر کتاب (شماره، ۴ تست، وضعیت فایل‌های B2، بهترین بند)
// فایل‌های واقعی (PDF + صوت) از باکت cambridge کشف می‌شوند
// ========================================

type SortKey = "book" | "band" | "activity";

export default function CambridgeListPage() {
  const { tr, dir } = useLanguage();
  const { books, scan, attempts, loading, error, refetch } = useCambridgeBooks();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("book");
  const [rescanning, setRescanning] = useState(false);

  /** آمار هر کتاب از تلاش‌ها */
  const statsByBook = useMemo(() => {
    const map = new Map<
      number,
      { bestBand: number | null; attempts: number; inProgress: number }
    >();
    for (const a of attempts) {
      const s =
        map.get(a.bookNumber) ?? { bestBand: null, attempts: 0, inProgress: 0 };
      if (a.status === "IN_PROGRESS") s.inProgress++;
      s.attempts++;
      if (a.status === "SUBMITTED" && a.bandScore != null) {
        if (s.bestBand == null || a.bandScore > s.bestBand) s.bestBand = a.bandScore;
      }
      map.set(a.bookNumber, s);
    }
    return map;
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books;
    if (q) {
      list = list.filter(
        (b) =>
          b.titleEn.toLowerCase().includes(q) ||
          b.titleFa.includes(q) ||
          String(b.id).includes(q) ||
          String(b.id).padStart(2, "0").includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "band") {
      sorted.sort(
        (a, b) => (statsByBook.get(b.id)?.bestBand ?? -1) - (statsByBook.get(a.id)?.bestBand ?? -1),
      );
    } else if (sort === "activity") {
      sorted.sort(
        (a, b) => (statsByBook.get(b.id)?.attempts ?? 0) - (statsByBook.get(a.id)?.attempts ?? 0),
      );
    }
    return sorted;
  }, [books, query, sort, statsByBook]);

  const anyProgress = useMemo(
    () => Array.from(statsByBook.values()).some((s) => s.attempts > 0),
    [statsByBook],
  );

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
                "۸ کتاب × ۴ تست کامل آکادمیک — با PDF و صدای واقعی",
                "8 books × 4 full Academic tests — real PDF and audio",
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

        {/* ================= هشدار B2 ================= */}
        {scan && !scan.configured && !loading && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 p-4">
            <CloudOff size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                {tr(
                  "فایل‌های کتاب‌ها هنوز وصل نشده‌اند (Backblaze B2)",
                  "Book files are not connected yet (Backblaze B2)",
                )}
              </p>
              <p className="text-[11px] leading-6 text-amber-700/90 dark:text-amber-300/80">
                {tr(
                  "کلیدهای B2 (B2_KEY_ID و B2_APP_KEY از نسخهٔ 1.0.2.8) را در فایل .env.local بگذار و سرور را ری‌استارت کن؛ برنامه خودش PDF و فایل‌های صوتی باکت cambridge را پیدا می‌کند. تا آن موقع آزمون‌ها با پاسخ‌برگ کار می‌کنند.",
                  "Put your B2 keys (B2_KEY_ID and B2_APP_KEY from version 1.0.2.8) into .env.local and restart the server; the app will auto-discover the PDF and audio files in your cambridge bucket. Until then, exams work with the answer sheet only.",
                )}
              </p>
              <button
                onClick={() => void rescan()}
                disabled={rescanning}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold disabled:opacity-60 transition"
              >
                {rescanning ? tr("در حال اسکن…", "Scanning…") : tr("اسکن مجدد", "Rescan")}
              </button>
            </div>
          </div>
        )}
        {scan && scan.configured && scan.error && !loading && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 p-4">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 dark:text-red-300">
                {tr("خطا در خواندن باکت B2", "B2 bucket read error")}
              </p>
              <p className="text-[11px] text-red-600/90 dark:text-red-400/80 mt-1" dir="ltr">
                {scan.error}
              </p>
            </div>
          </div>
        )}

        {/* ================= جستجو + مرتب‌سازی ================= */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr("جستجوی کتاب… (مثلاً ۰۴)", "Search books… (e.g. 04)")}
              className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>
          <div className="relative">
            <ArrowUpDown
              size={15}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full sm:w-52 appearance-none ps-9 pe-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
            >
              <option value="book">{tr("مرتب‌سازی: شمارهٔ کتاب", "Sort: Book number")}</option>
              <option value="band">{tr("مرتب‌سازی: بهترین بند", "Sort: Best band")}</option>
              <option value="activity">
                {tr("مرتب‌سازی: بیشترین تلاش", "Sort: Most attempts")}
              </option>
            </select>
          </div>
        </div>

        {/* شمارش */}
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {tr(`${filtered.length} کتاب پیدا شد`, `${filtered.length} books found`)}
          {anyProgress && (
            <span className="ms-2 text-emerald-500">· {tr("رکوردهای شما ثبت شده", "your records are saved")}</span>
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
              <BookCard
                key={b.slug}
                book={b}
                index={i}
                stats={statsByBook.get(b.id)}
              />
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

/** کارت یک کتاب کمبریج */
function BookCard({
  book,
  index,
  stats,
}: {
  book: IeltsBookSummary;
  index: number;
  stats?: { bestBand: number | null; attempts: number; inProgress: number };
}) {
  const { tr } = useLanguage();
  const num = String(book.id).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        href={`/ielts/cambridge/${book.id}`}
        className="group block rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(79,70,229,0.14)]"
      >
        {/* سربرگ کارت */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 p-4 text-white">
          <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute bottom-0 start-1/3 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-lg font-black">
              {num}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold" dir="ltr">
                Cambridge {num}
              </h3>
              <p className="text-[10px] text-white/80">
                {tr("۴ تست کامل — آکادمیک", "4 complete tests — Academic")}
              </p>
            </div>
            {stats && stats.inProgress > 0 && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-sky-400/25 border border-sky-300/30 flex items-center gap-1">
                <Flame size={9} />
                {tr("در جریان", "In progress")}
              </span>
            )}
          </div>
        </div>

        {/* مهارت‌ها */}
        <div className="p-4 grid grid-cols-3 gap-2">
          <SkillChip
            icon={<ClipboardList size={13} />}
            label={tr("ریدینگ", "Reading")}
            meta={`40 Q · 60′`}
          />
          <SkillChip
            icon={<Headphones size={13} />}
            label={tr("لیسنینگ", "Listening")}
            meta={`40 Q · 30′`}
          />
          <SkillChip
            icon={<PenLine size={13} />}
            label={tr("رایتینگ", "Writing")}
            meta={`2 ${tr("تسک", "tasks")} · 60′`}
          />
        </div>

        {/* وضعیت فایل‌های B2 + بهترین بند */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${
                book.files.pdf
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              dir="ltr"
            >
              <FileText size={10} />
              {book.files.pdf ? "PDF" : "PDF ?"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${
                book.files.audioCount > 0
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              dir="ltr"
            >
              <Music4 size={10} />
              {book.files.audioCount > 0 ? `${book.files.audioCount} audio` : "audio ?"}
            </span>
            {stats && stats.bestBand != null && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/25" dir="ltr">
                <Award size={10} />
                best {stats.bestBand}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 group-hover:underline">
            {tr("۴ تست", "4 tests")} ←
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function SkillChip({
  icon,
  label,
  meta,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-2.5 text-center space-y-1">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
        {icon}
      </span>
      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-[9px] text-slate-400" dir="ltr">{meta}</p>
    </div>
  );
}
