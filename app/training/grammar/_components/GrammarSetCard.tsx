"use client";

import { motion } from "motion/react";
import Link from "next/link";
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
import type { GrammarSetMeta } from "@/types/training";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_LABEL_EN,
  GRAMMAR_LEVEL_COLOR,
} from "@/types/training";
import { Stars } from "@/app/components/practice/PracticeBits";
import { getProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// کارت یک مجموعهٔ تمرین گرامری + نقشهٔ آیکون‌ها
// (از صفحهٔ لیست گرامر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
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

export default function GrammarSetCard({
  set,
  index,
  tick,
}: {
  set: GrammarSetMeta;
  index: number;
  tick: number;
}) {
  const { tr } = useLanguage();
  const Icon = SET_ICONS[set.icon] ?? BookMarked;
  const stored = getProgress("grammar", set.id);
  const stars = stored?.stars ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
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
}
