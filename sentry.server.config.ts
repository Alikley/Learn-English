// ========================================
// Sentry — اینیشیالایز سمت سرور Node.js (v1.0.6.0 / English 1.0.1.3)
// توسط instrumentation.ts → register() لود می‌شود.
//
// ⚙️ فعال‌سازی: SENTRY_DSN (یا NEXT_PUBLIC_SENTRY_DSN) در .env.
// خالی = غیرفعال.
// ========================================

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,

    // v1.0.6.1 (English 1.0.1.4): تزریق diagnostics-channel غیرفعال شد.
    // آن مکانیزم فقط برای ثبت span (پرفورمنس) کتابخانه‌های instrument
    // شده است و ما tracesSampleRate=0 داریم → هیچ چیز از دست نمی‌رود.
    // در ویندوز با Node قدیمی‌تر ثبتش با هشدار «Failed to register
    // diagnostics-channel injection hooks (Cannot find package
    // '@sentry/server-runtime-injection')» شکست می‌خورد؛ این گزینه
    // هشدار را کامل حذف می‌کند و گزارش خطا مثل قبل کار می‌کند.
    enableRuntimeChannelInjection: false,

    // صفر = فقط خطاها گزارش شوند (کوتای رایگان محفوظ می‌ماند)
    tracesSampleRate: 0,
  });
}
