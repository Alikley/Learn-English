// ========================================
// حالت بارگذاری سراسری سایت (v1.0.2.3 — گام ۴)
// دقیقاً مطابق لودینگ صفحهٔ کتابخانه:
// اسپینر آبی در مرکز صفحه — همهٔ صفحات سایت
// از همین کامپوننت استفاده می‌کنند تا حالت
// لودینگ کل سایت یکدست باشد
// ========================================

export default function PageLoading({
  minHeightClass = "min-h-[60vh]",
}: {
  /** کلاس حداقل ارتفاع ظرف — پیش‌فرض مثل کتابخانه */
  minHeightClass?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${minHeightClass}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
}
