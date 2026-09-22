"use client";

import { motion } from "motion/react";
import { Crown, Medal, Trophy, RefreshCcw, LogIn } from "lucide-react";
import Link from "next/link";
import { useLeaderboard } from "@/app/hook/useLeaderboard";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

// ========================================
// باکس برترین امتیازها (نسخه ۱.۰.۲.۲ — گام ۲)
// کنار باکس انتخاب سطح در هر سه بازی نمایش داده می‌شود
// چه کسی بیشترین امتیاز را دارد؟ — آماده برای سایت آنلاین
// v1.0.2.3: لودینگ به سبک کتابخانه + دوزبانه (گام ۳/۴)
// ========================================

const GAME_LABELS: Record<string, { title: string; hintFa: string; hintEn: string }> = {
  hangman: { title: "Hangman", hintFa: "حدس کلمه‌ها", hintEn: "Guess the words" },
  memory: { title: "Match Card", hintFa: "جفت کلمه‌ها", hintEn: "Match the pairs" },
  speedquiz: { title: "Quiz Hot", hintFa: "پاسخ سریع", hintEn: "Quick answers" },
};

const MEDAL_STYLES: Record<number, string> = {
  1: "bg-linear-to-b from-amber-300 to-amber-500 text-white shadow-md shadow-amber-500/30",
  2: "bg-linear-to-b from-slate-300 to-slate-400 text-white shadow-md shadow-slate-400/30",
  3: "bg-linear-to-b from-orange-300 to-orange-400 text-white shadow-md shadow-orange-400/30",
};

const MEDAL_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Crown,
  2: Medal,
  3: Medal,
};

export default function LeaderboardBox({ game }: { game: string }) {
  const { data, loading, unauthorized, failed, reload } = useLeaderboard(game);
  const { tr } = useLanguage();
  const meta = GAME_LABELS[game] ?? { title: game, hintFa: "", hintEn: "" };

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
      {!loading && unauthorized && (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <LogIn className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-6 mb-4">
            {tr(
              "برای دیدن رکوردداران اول وارد حسابت شو",
              "Log in first to see the record holders"
            )}
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            {tr("ورود", "Log In")}
          </Link>
        </div>
      )}

      {/* ---------- خطا ---------- */}
      {!loading && failed && (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {tr("دریافت رکوردها ناموفق بود", "Couldn't load the records")}
          </p>
          <button
            onClick={() => void reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {tr("تلاش دوباره", "Try Again")}
          </button>
        </div>
      )}

      {/* ---------- لیست ---------- */}
      {!loading && !unauthorized && !failed && (
        <>
          {data && data.leaders.length > 0 ? (
            <div className="space-y-2">
              {data.leaders.map((row, i) => {
                const MedalIcon = MEDAL_ICONS[row.rank];
                return (
                  <motion.div
                    key={row.userId}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                    className={`flex items-center gap-3 rounded-xl px-2.5 py-2 border transition-colors ${
                      row.isYou
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* رتبه */}
                    {row.rank <= 3 && MedalIcon ? (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${MEDAL_STYLES[row.rank]}`}
                      >
                        <MedalIcon className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                          {row.rank}
                        </span>
                      </div>
                    )}

                    {/* نام */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span
                        className={`text-sm truncate ${row.isYou ? "font-extrabold text-blue-700 dark:text-blue-300" : "font-medium text-slate-700 dark:text-slate-200"}`}
                      >
                        {row.name}
                      </span>
                      {row.isYou && (
                        <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
                          {tr("شما", "You")}
                        </span>
                      )}
                    </div>

                    {/* امتیاز */}
                    <span
                      className={`text-sm font-extrabold shrink-0 tabular-nums ${row.rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {row.bestScore}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-6">
                {tr(
                  "هنوز کسی رکوردی ثبت نکرده — اولین رکورددار این بازی باش!",
                  "No records yet — be the first record holder of this game!"
                )}
              </p>
            </div>
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
