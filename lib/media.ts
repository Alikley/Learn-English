// ========================================
// مسیر مرکزی فایل‌های رسانه‌ای — نسخه ۱.۰.۲.۸
// همه آدرس‌های صوت/PDF از این تابع واحد رد می‌شوند.
// پیش‌فرض: پل امن /api/media (ریدایرکت به لینک امضادار B2).
// برای سرویس رسانه‌ای دیگر فقط NEXT_PUBLIC_MEDIA_BASE
// را عوض کنید — هیچ جای دیگری کد نباید دست بخورد.
// ========================================

/** آدرس نهایی یک فایل رسانه‌ای را می‌سازد */
export function mediaUrl(path: string): string {
  // آدرس مطلق (http/https/data) دست‌نخورده برمی‌گردد
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }
  const base = (
    process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/api/media"
  ).replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}
