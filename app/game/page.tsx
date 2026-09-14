"use client";

import { Gamepad2 } from "lucide-react";
import GameCard from "@/app/components/game/GameCard";
import GameCardStats from "@/app/components/game/GameCardStats";
import { useGameStats } from "@/app/hook/useGameStats";
import { useMemoryStats } from "@/app/hook/useMemoryStats";

// ========================================
// هاب بازی‌ها — کارت هر بازی
// هنگ‌من و حافظه کلمات فعال‌اند؛ بازی‌های بعدی «به‌زودی»
// ========================================

export default function GamePage() {
  const { stats: hangmanStats, streak: hangmanStreak } = useGameStats();
  const { stats: memoryStats, streak: memoryStreak } = useMemoryStats();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">بازی‌ها</h1>
          <p className="text-sm text-slate-500">
            با بازی یاد بگیر — امتیاز بگیر و استریکت رو زنده نگه دار!
          </p>
        </div>
      </div>

      {/* ================= لیست بازی‌ها ================= */}
      <div className="mt-6 space-y-3">
        <GameCard
          title="بازی هنگ کلمه"
          desc="حروف را حدس بزن و کلمه را نجات بده! کلمات از A1 تا C1"
          icon="/assets/icon_2_hangman.svg"
          href="/game/hangman"
          stats={
            <GameCardStats stats={hangmanStats} streak={hangmanStreak} />
          }
        />

        <GameCard
          title="بازی حافظه کلمات"
          desc="کارت‌ها را باز کن و جفت کلمات انگلیسی-فارسی را پیدا کن — از A1 تا C1"
          icon="/assets/icon_1_abc_blocks.svg"
          href="/game/memory"
          stats={
            <GameCardStats stats={memoryStats} streak={memoryStreak} />
          }
        />

        {/* ---- بازی‌های آینده ---- */}
        <GameCard
          title="کوییز سرعتی"
          desc="با زمان محدود به سوال‌های چهارگزینه‌ای جواب بده"
          icon="/assets/icon_3_document_sign.svg"
          href="#"
          disabled
        />
      </div>

      {/* ================= نکته ================= */}
      <p className="mt-6 text-center text-[11px] text-slate-400 leading-5">
        بازی‌های جدید به‌مرور اضافه می‌شوند
        <br />
        هر بازی که شروع کنی، روز یادگیری‌ات هم ثبت می‌شود
      </p>
    </div>
  );
}
