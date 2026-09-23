"use client";

import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { useLeaderboard } from "@/app/hook/game/useLeaderboard";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";
import { gameMeta, MEDAL_STYLES, MEDAL_ICONS } from "./leaderboardMeta";
import LeaderboardRow from "./LeaderboardRow";
import {
  LeaderboardUnauthorized,
  LeaderboardFailed,
  LeaderboardEmpty,
} from "./LeaderboardStates";

// ========================================
// باکس برترین امتیازها (نسخه ۱.۰.۲.۲ — گام ۲)
// کنار باکس انتخاب سطح در هر سه بازی نمایش داده می‌شود
// چه کسی بیشترین امتیاز را دارد؟ — آماده برای سایت آنلاین
// v1.0.2.3: لودینگ به سبک کتابخانه + دوزبانه (گام ۳/۴)
// v1.0.2.7 — ریفکتوری: متادیتا + ردیف + حالت‌ها به فایل‌های
// خودشان در همین فولدر تفکیک شدند.
// ========================================

export default function LeaderboardBox({ game }: { game: string }) {
  const { data, loading, unauthorized, failed, reload } = useLeaderboard(game);
  const { tr } = useLanguage();
  const meta = gameMeta(game);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6"
    >
      {/* هدر */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {tr("برترین امتیازها", "Top Scores")}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {meta.title} · {tr(meta.hintFa, meta.hintEn)}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4 pb-3 border-b border-dashed border-slate-100 dark:border-slate-800">
        {tr(
          "کی بیشترین امتیاز رو داره؟ رکورد جدید بزن و اسمت رو ببر بالا!",
          "Who holds the high score? Set a new record and climb to the top!"
        )}
      </p>

      {/* ---------- بارگذاری (به سبک کتابخانه — v1.0.2.3 گام ۴) ---------- */}
      {loading && <PageLoading minHeightClass="py-8" />}

      {/* ---------- ورود لازم است ---------- */}
      {!loading && unauthorized && <LeaderboardUnauthorized />}

      {/* ---------- خطا ---------- */}
      {!loading && failed && <LeaderboardFailed onReload={reload} />}

      {/* ---------- لیست ---------- */}
      {!loading && !unauthorized && !failed && (
        <>
          {data && data.leaders.length > 0 ? (
            <div className="space-y-2">
              {data.leaders.map((row, i) => (
                <LeaderboardRow
                  key={row.userId}
                  row={row}
                  index={i}
                  medalIcon={MEDAL_ICONS[row.rank]}
                  medalStyle={MEDAL_STYLES[row.rank]}
                />
              ))}
            </div>
          ) : (
            <LeaderboardEmpty />
          )}

          {/* رتبه خود کاربر */}
          {data?.you && (
            <div className="mt-4 pt-3 border-t border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {tr("رتبه تو", "Your Rank")}
              </span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                {tr(
                  `${data.you.rank} از بین همه · بهترین: ${data.you.bestScore}`,
                  `#${data.you.rank} overall · Best: ${data.you.bestScore}`
                )}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
