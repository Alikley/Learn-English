"use client";

import { Gamepad2, Trophy, Flame } from "lucide-react";
import GameCard from "@/app/components/game/GameCard";
import { useGameStats } from "@/app/hook/useGameStats";

// ========================================
// هاب بازی‌ها — کارت هر بازی
// فعلا فقط هنگ‌من فعال است؛ بازی‌های بعدی «به‌زودی»
// ========================================

export default function GamePage() {
  const { stats, streak } = useGameStats();

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
          desc="حروف را حدس بزن و کلمه را نجات بده! سه سطح: آسان، متوسط و سخت"
          icon="/assets/icon_2_hangman.svg"
          href="/game/hangman"
          stats={
            stats && (stats.sessionsPlayed > 0 || stats.bestScore > 0) ? (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">
                  <Trophy className="w-3 h-3" />
                  بهترین: {stats.bestScore}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold">
                  <Flame className="w-3 h-3" />
                  {streak?.current ?? 0} روز متوالی
                </span>
              </div>
            ) : null
          }
        />

        {/* ---- بازی‌های آینده ---- */}
        <GameCard
          title="بازی حافظه کلمات"
          desc="کارت‌ها را باز کن و جفت کلمات انگلیسی-فارسی را پیدا کن"
          icon="/assets/icon_1_abc_blocks.svg"
          href="#"
          disabled
        />
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
