"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  BookMarked,
  Headphones,
  PenLine,
  ClipboardList,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeBooks } from "@/app/hook/ielts/useIelts";
import type { IeltsTestSummary } from "@/types/ielts";

// ========================================
// صفحهٔ کتاب‌های کمبریج (v1.0.3.2 — گام ۴ و ۵)
// مثل تستینو: جستجو + «N آزمون» + کارت هر کتاب (شماره، وضعیت،
// بهترین رکورد کاربر) — با دارک‌مود و دوزبانگی
// ========================================

export default function CambridgeListPage() {
  const { tr, dir } = useLanguage();
  const { tests, attempts, loading, error, refetch } = useCambridgeBooks();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter(
      (t) =>
        t.titleEn.toLowerCase().includes(q) ||
        t.titleFa.includes(q) ||
        String(t.bookNumber).includes(q) ||
        String(t.bookNumber).padStart(2, "0").includes(q),
    );
  }, [tests, query]);

  /** بهترین بند هر مهارت برای هر کتاب */
  const bestBySlug = useMemo(() => {
    const map = new Map<string, { skill: string; band: number }[]>();
    for (const a of attempts) {
      if (a.status !== "SUBMITTED" || a.bandScore == null) continue;
      const key = a.slug ?? "";
      if (!key) continue;
      const list = map.get(key) ?? [];
      const found = list.find((x) => x.skill === a.skill);
      if (!found || a.bandScore > found.band) {
        if (found) found.band = a.bandScore;
        else list.push({ skill: a.skill, band: a.bandScore });
      }
      map.set(key, list);
    }
    return map;
  }, [attempts]);

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
              {tr("آزمون‌های کامل آکادمیک — کتاب ۱ تا ۸", "Full Academic tests — Books 1 to 8")}
            </p>
          </div>
          <button
            onClick={() => void refetch()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition"
            title={tr("تازه‌سازی", "Refresh")}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ================= جستجو ================= */}
        <div className="relative">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("جستجوی کتاب… (مثلاً ۰۴ یا cambridge)", "Search books… (e.g. 04 or cambridge)")}
            className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
        </div>

        {/* شمارش */}
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {tr(`${filtered.length} آزمون پیدا شد`, `${filtered.length} exams found`)}
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
            {filtered.map((t, i) => (
              <BookCard key={t.slug} test={t} index={i} best={bestBySlug.get(t.slug) ?? []} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-400 py-14">
                {tr("آزمونی با این عبارت پیدا نشد.", "No exams match your search.")}
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
  test,
  index,
  best,
}: {
  test: IeltsTestSummary;
  index: number;
  best: { skill: string; band: number }[];
}) {
  const { tr } = useLanguage();
  const num = String(test.bookNumber).padStart(2, "0");

  const bestBand = (skill: string) => best.find((b) => b.skill === skill)?.band;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        href={`/ielts/cambridge/${test.slug}`}
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
                {tr("تست ۱ — آکادمیک", "Test 1 — Academic")}
              </p>
            </div>
            {test.available ? (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-400/25 border border-emerald-300/30">
                {tr("آماده", "Ready")}
              </span>
            ) : (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-400/25 border border-amber-300/30">
                {tr("به‌زودی", "Soon")}
              </span>
            )}
          </div>
        </div>

        {/* مهارت‌ها */}
        <div className="p-4 grid grid-cols-3 gap-2">
          <SkillChip
            icon={<ClipboardList size={13} />}
            label={tr("ریدینگ", "Reading")}
            meta={`${test.readingCount} Q · ${test.readingMinutes}′`}
            band={bestBand("reading")}
          />
          <SkillChip
            icon={<Headphones size={13} />}
            label={tr("لیسنینگ", "Listening")}
            meta={`${test.listeningCount} Q · ${test.listeningMinutes}′`}
            band={bestBand("listening")}
          />
          <SkillChip
            icon={<PenLine size={13} />}
            label={tr("رایتینگ", "Writing")}
            meta={`${test.writingTasks} ${tr("تسک", "tasks")} · ${test.writingMinutes}′`}
            band={bestBand("writing")}
          />
        </div>

        {/* پاورقی */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <BookMarked size={11} />
            {tr("کامل و همیشه در دسترس", "Complete and always available")}
          </span>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 group-hover:underline">
            {tr("شروع آزمون", "Start exam")} ←
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
  band,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  band?: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-2.5 text-center space-y-1">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
        {icon}
      </span>
      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-[9px] text-slate-400" dir="ltr">{meta}</p>
      {typeof band === "number" && (
        <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5" dir="ltr">
          <Award size={9} />
          best {band}
        </p>
      )}
    </div>
  );
}
