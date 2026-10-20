// ========================================
// پالت رنگ سطح‌های CEFR (v1.0.2.2 / English 1.0.2.2)
//
// یک منبع واحد برای «رنگ بج سطح» در کل سایت — قبلاً فقط
// صفحهٔ تعیین سطح این رنگ‌ها را داشت؛ حالا نوبار و چت هم
// از همین پالت استفاده می‌کنند تا سطح هر کاربر همه‌جا
// با همان رنگ دیده شود (A1 سبز → C1 قرمز).
//
// فقط کلاس‌های Tailwind — سمت سرور و کلاینت هر دو امن است.
// ========================================

export const CEFR_COLOR: Record<string, string> = {
  A1: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  B1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  B2: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  C1: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

/** رنگ بج برای یک سطح — سطح نامعلوم → خاکستری ملایم */
export function cefrColor(cefr: string | null | undefined): string {
  return (
    CEFR_COLOR[cefr ?? ""] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300"
  );
}
