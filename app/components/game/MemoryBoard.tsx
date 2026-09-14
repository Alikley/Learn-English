"use client";

import { motion } from "motion/react";
import MemoryCard from "./MemoryCard";
import type { MemoryCardItem } from "@/app/hook/useMemoryGame";

// ========================================
// تخته بازی حافظه — شبکه کارت‌ها
// اندازه شبکه بر اساس تعداد کارت تنظیم می‌شود
// ========================================

// کلاس شبکه بر اساس تعداد کارت (۶ / ۸ / ۱۲)
// تخته بزرگ‌تر → فاصله بیشتر برای تنفس بصری
function gridClasses(count: number): string {
  if (count <= 6) {
    return "grid-cols-3 gap-2 md:gap-3 max-w-[280px] sm:max-w-xs";
  }
  if (count <= 8) {
    return "grid-cols-4 gap-2 md:gap-3.5 max-w-[340px] sm:max-w-sm";
  }
  return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-4 max-w-[340px] sm:max-w-md md:max-w-2xl";
}

export default function MemoryBoard({
  cards,
  wrongPair,
  onCardClick,
}: {
  cards: MemoryCardItem[];
  wrongPair: number[] | null;
  onCardClick: (cardId: number) => void;
}) {
  return (
    <div className="p-4 md:p-6">
      <motion.div
        className={`grid mx-auto ${gridClasses(cards.length)}`}
        initial={false}
      >
        {cards.map((card, i) => (
          <MemoryCard
            key={card.cardId}
            card={card}
            index={i}
            isWrong={Boolean(wrongPair?.includes(card.cardId))}
            onClick={() => onCardClick(card.cardId)}
          />
        ))}
      </motion.div>
    </div>
  );
}
