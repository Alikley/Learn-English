// ========================================
// Sentry — اینیشیالایز سمت Edge Runtime (v1.0.6.0 / English 1.0.1.3)
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

    tracesSampleRate: 0,
  });
}
