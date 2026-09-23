import { Crown, Medal, type LucideIcon } from "lucide-react";

// ========================================
// متادیتای باکس برترین امتیازها
// (از LeaderboardBox تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

/** عنوان و توضیح هر بازی */
export const GAME_LABELS: Record<string, { title: string; hintFa: string; hintEn: string }> = {
  hangman: { title: "Hangman", hintFa: "حدس کلمه‌ها", hintEn: "Guess the words" },
  memory: { title: "Match Card", hintFa: "جفت کلمه‌ها", hintEn: "Match the pairs" },
  speedquiz: { title: "Quiz Hot", hintFa: "پاسخ سریع", hintEn: "Quick answers" },
};

/** برچسب پیش‌فرض وقتی کلید بازی شناخته نشد */
export function gameMeta(game: string) {
  return GAME_LABELS[game] ?? { title: game, hintFa: "", hintEn: "" };
}

/** پس‌زمینهٔ مدال رتبه‌های ۱ تا ۳ */
export const MEDAL_STYLES: Record<number, string> = {
  1: "bg-linear-to-b from-amber-300 to-amber-500 text-white shadow-md shadow-amber-500/30",
  2: "bg-linear-to-b from-slate-300 to-slate-400 text-white shadow-md shadow-slate-400/30",
  3: "bg-linear-to-b from-orange-300 to-orange-400 text-white shadow-md shadow-orange-400/30",
};

/** آیکون مدال رتبه‌های ۱ تا ۳ */
export const MEDAL_ICONS: Record<number, LucideIcon> = {
  1: Crown,
  2: Medal,
  3: Medal,
};
