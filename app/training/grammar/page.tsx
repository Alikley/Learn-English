"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookMarked,
  Zap,
  CheckCircle2,
  Equal,
  Repeat,
  Activity,
  User,
  CircleHelp,
  History,
  CheckCheck,
  KeyRound,
  ArrowLeftRight,
  Split,
  Shuffle,
  MessagesSquare,
  Link2,
  ArrowDownUp,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type { GrammarLevel, GrammarSetMeta } from "@/types/training";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_LABEL_EN,
  GRAMMAR_LEVEL_COLOR,
  GRAMMAR_LEVEL_DOT,
} from "@/types/training";
import { Stars } from "@/app/components/practice/PracticeBits";
import { getProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// لیست تمرین گرامری (نسخه ۱.۰.۱.۴)
// ۱۵ مجموعه در سه سطح — تب‌بندی + ستاره بهترین نتیجه
// ========================================

const SET_ICONS: Record<string, LucideIcon> = {
  Equal,
  Repeat,
  Activity,
  User,
  CircleHelp,
  History,
  CheckCheck,
  KeyRound,
  ArrowLeftRight,
  Split,
  Shuffle,
  MessagesSquare,
  Link2,
  ArrowDownUp,
  WandSparkles,
};

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
          {filtered.map((set, i) => {
            const Icon = SET_ICONS[set.icon] ?? BookMarked;
            const stored = getProgress("grammar", set.id);
            const stars = stored?.stars ?? 0;

            return (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/training/grammar/${set.id}`}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 h-full group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        GRAMMAR_LEVEL_COLOR[set.level]
                      }`}
                    >
                      {tr(GRAMMAR_LEVEL_LABEL[set.level], GRAMMAR_LEVEL_LABEL_EN[set.level])}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {set.topicFa}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mb-2">
                    <HoverableText text={set.topicEn} />
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {set.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold">
                    <span>{set.questionCount} {tr("سؤال", "questions")}</span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {set.xp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50" key={tick}>
                    <Stars count={stars} />
                    {stars > 0 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
