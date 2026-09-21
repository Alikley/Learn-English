// ========================================
// لودر یکپارچهٔ همهٔ صفحه‌های سایت — v1.0.1.9
//
// طبق درخواست کاربر: حالت لودینگ «کتابخانه»
// (اسپینر آبی چرخان) برای همهٔ صفحه‌ها یکسان شد.
// قبل از این: هر صفحه اسپینر متفاوتی داشت
// (رنگ/ضخامت/اندازهٔ مختلف) — حالا همه یکسان‌اند.
//
// استفاده: {loading ? <PageLoader /> : ...}
// ========================================

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
}
