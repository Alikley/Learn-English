"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { Gamepad2 } from "lucide-react";
import GameCard from "@/app/components/game/GameCard";
import GameCardStats from "@/app/components/game/GameCardStats";
import MascotCharacter from "@/app/components/game/MascotCharacter";
import { useGameStats } from "@/app/hook/game/useGameStats";
import { useMemoryStats } from "@/app/hook/game/useMemoryStats";
import { useSpeedQuizStats } from "@/app/hook/game/useSpeedQuizStats";

// ========================================
// هاب بازی‌ها — کارت هر بازی
// Hangman، Match Card و Quiz Hot فعال‌اند
//
// v1.0.0.9 — نام بازی‌ها انگلیسی شد + کاراکتر
//   بزرگ‌تر شد و نیمهٔ چپ صفحه را گرفت:
//   چیدمان ۵۰/۵۰ (بازی‌ها راست، کاراکتر چپ)
//
// v1.0.0.8 — کاراکتر انسان‌نما با چشم‌های موس‌گیر
//   (منطق در useGaze / useBlink، رندر در
//   MascotCharacter) + چیدمان دوستونه اضافه شد.
//   پس‌زمینه صفحه بدون تغییر است.
// ========================================

export default function GamePage() {
  const { tr, dir } = useLanguage();
  const { stats: hangmanStats, streak: hangmanStreak } = useGameStats();
  const { stats: memoryStats, streak: memoryStreak } = useMemoryStats();
  const { stats: speedQuizStats, streak: speedQuizStreak } = useSpeedQuizStats();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{tr("بازی‌ها", "Games")}</h1>
          <p className="text-sm text-slate-500">
            {tr("با بازی یاد بگیر — امتیاز بگیر و استریکت رو زنده نگه دار!", "Learn by playing — score points and keep your streak alive!")}
          </p>
        </div>
      </div>

      {/* ============ چیدمان دوستونه ۵۰/۵۰ (v1.0.0.9) ============ */}
      {/* در RTL ستون اول سمت راست است: بازی‌ها راست، کاراکتر چپ */}
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
        {/* ================= جدول بازی‌ها — سمت راست ================= */}
        <div className="space-y-3">
          <GameCard
            title="Hangman"
            desc={tr("حروف را حدس بزن و کلمه را نجات بده! کلمات از A1 تا C1", "Guess the letters and save the word! Words from A1 to C1")}
            icon="/assets/icon_2_hangman.svg"
            href="/game/hangman"
            stats={
              <GameCardStats stats={hangmanStats} streak={hangmanStreak} />
            }
          />

          <GameCard
            title="Match Card"
            desc={tr("کارت‌ها را باز کن و جفت کلمات انگلیسی-فارسی را پیدا کن — از A1 تا C1", "Flip the cards and match English–Persian word pairs — from A1 to C1")}
            icon="/assets/icon_1_abc_blocks.svg"
            href="/game/memory"
            stats={
              <GameCardStats stats={memoryStats} streak={memoryStreak} />
            }
          />

          <GameCard
            title="Quiz Hot"
            desc={tr("سریع جواب بده — سوال‌های کلمه و جمله از A1 تا C1", "Answer fast — word and sentence questions from A1 to C1")}
            icon="/assets/icon_3_document_sign.svg"
            href="/game/speedquiz"
            stats={
              <GameCardStats
                stats={speedQuizStats}
                streak={speedQuizStreak}
                inviteText={tr("اولین کوییزت را شروع کن!", "Start your first quiz!")}
              />
            }
          />

          {/* نکته */}
          <p className="pt-2 text-center text-[11px] text-slate-400 leading-5">
            {tr("بازی‌های جدید به‌مرور اضافه می‌شوند", "New games are added over time")}
            <br />
            {tr("هر بازی که شروع کنی، روز یادگیری‌ات هم ثبت می‌شود", "Every game you start counts as a learning day")}
          </p>
        </div>

        {/* ================= کاراکتر متحرک — نیمهٔ چپ صفحه ================= */}
        {/* در موبایل زیر بازی‌ها می‌آید؛ چشم‌ها موس را دنبال می‌کنند */}
        <div className="flex flex-col items-center justify-center">
          <MascotCharacter />
          <p className="mt-3 text-center text-xs text-slate-400">
            {tr("چشم‌هایم به موس توست — بازی کن!", "My eyes are on your mouse — play!")}
          </p>
        </div>
      </div>
    </div>
  );
}
