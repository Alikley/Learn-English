"use client";

// ========================================
// global-error — آخرین سد دفاعی رندر (v1.0.6.0 / English 1.0.1.3)
//
// اگر خطایی در روت layout خودش بیرون بزند، Next.js به جای صفحهٔ
// سفیدِ خالی این کامپوننت را رندر می‌کند و خطا به Sentry گزارش
// می‌شود (اگر DSN تنظیم شده باشد). دکمهٔ «تلاش دوباره» همان رندر
// قبلی را reset می‌کند.
// ========================================

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // خطای رندر → Sentry (no-op اگر DSN تنظیم نشده باشد)
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            textAlign: "center",
            background: "#1e293b",
            borderRadius: "20px",
            padding: "40px 28px",
            border: "1px solid #334155",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 10px" }}>
            یک خطای غیرمنتظره رخ داد
          </h1>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              color: "#94a3b8",
              margin: "0 0 8px",
            }}
          >
            Something went wrong. The error has been reported.
          </p>
          {error.digest && (
            <p
              dir="ltr"
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#64748b",
                margin: "0 0 20px",
              }}
            >
              digest: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 32px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            تلاش دوباره / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
