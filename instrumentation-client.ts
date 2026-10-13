// ========================================
// Sentry — اینیشیالایز سمت کلاینت (v1.0.6.0 / English 1.0.1.3)
//
// این فایل توسط Next.js 15.3+ به‌صورت خودکار در باندل مرورگر
// تزریق می‌شود (instrumentation-client) — نیازی به import در
// layout نیست.
//
// ⚙️ فعال‌سازی: NEXT_PUBLIC_SENTRY_DSN را در .env بگذار.
// خالی = SDK کاملاً غیرفعال (صفر سربار، صفر تماس شبکه‌ای).
//
// فقط «گزارش خطا» — tracesSampleRate صفر است تا کوتای رایگان
// Sentry برای performance span هدر نرود. برای دیدن آمار
// پرفورمنس هم عدد 0.1 بگذار.
// ========================================

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // محیط اجرا: production / development یا مقدار دلخواه شما
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

    // صفر = فقط خطاها گزارش شوند (کوتای رایگان محفوظ می‌ماند)
    tracesSampleRate: 0,
  });
}
