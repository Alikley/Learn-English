"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { BookMarked } from "lucide-react";
import type { GrammarLevel, GrammarSetMeta } from "@/types/training";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_LABEL_EN,
  GRAMMAR_LEVEL_DOT,
} from "@/types/training";
import GrammarSetCard from "./_components/GrammarSetCard";

// ========================================
// لیست تمرین گرامری (نسخه ۱.۰.۱.۴)
// ۱۵ مجموعه در سه سطح — تب‌بندی + ستاره بهترین نتیجه
// v1.0.2.7 — ریفکتوری: کارت مجموعه به _components تفکیک شد.
// ========================================

type Tab = "ALL" | GrammarLevel;

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "همه" },
  { key: "BEGINNER", label: GRAMMAR_LEVEL_LABEL.BEGINNER },
  { key: "INTERMEDIATE", label: GRAMMAR_LEVEL_LABEL.INTERMEDIATE },
  { key: "ADVANCED", label: GRAMMAR_LEVEL_LABEL.ADVANCED },
];

export default function GrammarListPage() {
  const { tr, dir } = useLanguage();
  const [sets, setSets] = useState<GrammarSetMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ALL");
  const [tick, setTick] = useState(0); // برای رفرش ستاره‌ها بعد از برگشت

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/practice/grammar");
          if (res.ok) setSets(await res.json());
        } catch {
          /* silent */
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // وقتی از کوئیز برمی‌گردیم ستاره‌ها تازه شوند
  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered = useMemo(
    () => (tab === "ALL" ? sets : sets.filter((s) => s.level === tab)),
    [sets, tab],
  );

  if (loading) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BookMarked className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{tr("تمرین گرامری", "Grammar Practice")}</h1>
          <p className="text-sm text-slate-500">
            {sets.length} {tr("مجموعه — هر کدام ۱۰ سؤال از مبتدی تا پیشرفته", "sets — 10 questions each, beginner to advanced")}
          </p>
        </div>
        <Link
          href="/training"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-600 text-xs font-bold transition-colors"
        >
          {tr("بازگشت", "Back")}
        </Link>
      </div>

      {/* ================= تب‌های سطح ================= */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-6 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit max-w-full mx-auto md:mx-0">
        {TABS.map((t) => {
          const count =
            t.key === "ALL"
              ? sets.length
              : sets.filter((s) => s.level === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t.key !== "ALL" && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tab === t.key ? "bg-white" : GRAMMAR_LEVEL_DOT[t.key as GrammarLevel]
                  }`}
                />
              )}
              {t.key === "ALL" ? tr("همه", "All") : tr(GRAMMAR_LEVEL_LABEL[t.key as GrammarLevel], GRAMMAR_LEVEL_LABEL_EN[t.key as GrammarLevel])}
              <span
                className={`text-[10px] ${
                  tab === t.key ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= کارت‌ها ================= */}
      <AnimatePresence mode="popLayout">
        <div
          key={tab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
        >
          {filtered.map((set, i) => (
            <GrammarSetCard key={set.id} set={set} index={i} tick={tick} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
