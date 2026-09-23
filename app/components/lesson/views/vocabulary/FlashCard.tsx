"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Volume2, RotateCcw } from "lucide-react";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// فلش‌کارت دو رو: روی کارت = کلمه، پشت کارت = معنی + مثال
// (از VocabularyView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export type FlashCardWord = {
  word: string;
  pos: string;
  fa: string;
  example: string;
  exampleFa: string;
};

export default function FlashCard({
  cardIndex,
  flipped,
  playingWord,
  word,
  onFlip,
  onPlayWord,
}: {
  cardIndex: number;
  flipped: boolean;
  playingWord: boolean;
  word: FlashCardWord;
  onFlip: () => void;
  onPlayWord: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <motion.div
        key={cardIndex}
        initial={{ opacity: 0, x: 40, rotateY: -25 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="mx-auto max-w-md cursor-pointer"
        onClick={onFlip}
        style={{ transformStyle: "preserve-3d" }}
      >
        {!flipped ? (
          /* روی کارت: کلمه */
          <motion.div
            key={`front-${cardIndex}`}
            initial={{ rotateY: 0 }}
            className="bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl shadow-xl p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-4"
          >
            <span className="text-purple-200 text-xs font-bold bg-white/10 rounded-full px-3 py-1">
              {word.pos}
            </span>
            <p
              dir="ltr"
              className="text-white text-3xl md:text-4xl font-bold tracking-wide"
            >
              <HoverableText text={word.word} />
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayWord();
              }}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Volume2
                size={16}
                className={playingWord ? "animate-pulse" : ""}
              />
              {tr("تلفظ", "Pronunciation")}
            </button>
            <p className="text-purple-200 text-[11px] flex items-center gap-1">
              <RotateCcw size={12} />
              {tr("برای دیدن معنی، کارت را لمس کنید", "Tap the card to see the meaning")}
            </p>
          </motion.div>
        ) : (
          /* پشت کارت: معنی + مثال */
          <motion.div
            key={`back-${cardIndex}`}
            initial={{ rotateY: 180, opacity: 0.6 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="bg-white border-2 border-purple-200 rounded-3xl shadow-xl p-6 min-h-[240px] flex flex-col justify-center gap-3"
          >
            <div className="text-center">
              <p
                dir="ltr"
                className="text-purple-400 text-sm font-semibold"
              >
                <HoverableText text={word.word} />
              </p>
              <p className="text-slate-900 text-2xl font-bold mt-1">
                {word.fa}
              </p>
            </div>
            <div className="border-t border-dashed border-purple-100 pt-3">
              <p
                dir="ltr"
                className="text-left text-slate-800 text-sm leading-7"
              >
                <HoverableText text={word.example} />
              </p>
              <p className="text-slate-400 text-xs leading-6 mt-1">
                {word.exampleFa}
              </p>
            </div>
            <p className="text-purple-300 text-[11px] flex items-center gap-1 justify-center">
              <RotateCcw size={12} />
              {tr("لمس کنید تا به کلمه برگردید", "Tap to flip back to the word")}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
