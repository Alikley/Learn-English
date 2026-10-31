import { ok } from "@/lib/api-helpers";
import { cacheStats } from "@/lib/cache";
import { layaStatus } from "@/lib/laya";
import { aiExamStatus, probeAiExam } from "@/lib/ielts/ai-paper";

// ========================================
// GET /api/ai-status — وضعیت سرویس‌های AI و کش
// (v1.0.8.0 / English 1.0.2.0؛ به‌روز 1.0.2.5)
//
// بعد از راه‌اندازی سرور اختصاصی (راهنما: SERVER-SETUP.md)
// برای اطمینان از اتصال سرویس‌ها:
//   curl https://دامنه-شما/api/ai-status
//
// خروجی (فقط وضعیت — هیچ کلید/URL/مقدار محرمانه‌ای برنمی‌گردد):
//   {
//     laya:  { configured, connected, model, latencyMs, error },
//     paper: { configured, provider, model, maxTokens },   ← جدید 1.0.2.5
//     redis: { driver, redisConfigured, redisConnected, ... },
//   }
//
// 🆕 v1.0.8.6 (English 1.0.2.5) — سرویس AI برگه‌های آیلتس:
//   ?probe=1  → یک تماس آزمایشی کوچک با سرویسِ تنظیم‌شده
//   (AI_API_KEY/AI_BASE_URL/AI_MODEL):
//   curl "https://دامنه-شما/api/ai-status?probe=1"
// پاسخ واقعی سرور (200/401/402/404/429/…) داخل paper.probe برمی‌گردد
// تا «مشکل از اتصال است یا کلید/اعتبار یا مدل؟» یک‌جا معلوم شود.
//
// 🆕 v1.0.8.7 (English 1.0.2.6) — مدل‌های استدلالی (deepseek-flash):
// بودجهٔ probe از ۵ به ۳۰۰ توکن رسید (با ۵ توکن، مدل استدلالی فقط
// «تفکر» می‌نوشت و probe سالم را خراب نشان می‌داد!) + فیلد
// paper.probe.reasoning و paper.maxTokensAdvice اضافه شد.
// ========================================

export async function GET(req?: Request) {
  // req در Next.js همیشه پاس می‌شود؛ اختیاری بودن فقط برای تست‌های
  // داخلی است که بدون آرگومان صدا می‌زنند (بدون probe).
  const url = req ? new URL(req.url) : null;
  const wantProbe = url?.searchParams.get("probe") === "1";

  const [laya, redis] = await Promise.all([layaStatus(), cacheStats()]);
  const paper = aiExamStatus();
  const probe = wantProbe ? await probeAiExam() : null;

  const hint = laya.connected
    ? "مدل Laya وصل است — تعیین سطح از متن نوشتاری و پشتیبان چت هوشمند فعال‌اند"
    : laya.configured
      ? laya.error === "unauthorized"
        ? "LAYA_BASE_URL تنظیم شده ولی کلید LAYA_API_KEY رد شد — کلید سرور را چک کن"
        : "LAYA_BASE_URL تنظیم شده ولی laya-serve پاسخ نمی‌دهد — تعیین سطح فقط از نمرهٔ تست می‌آید و پشتیبانی حالت عمومی دارد"
      : "LAYA_BASE_URL تنظیم نشده — تعیین سطح از نمرهٔ تست کار می‌کند؛ پشتیبان چت هم فعال است (حالت عمومی)";

  const paperHint = (() => {
    if (!paper.configured) {
      return "سرویس AI برگه‌ها تنظیم نشده — AI_API_KEY (یا CODECRAFT_API_KEY) را در .env بگذار";
    }
    if (probe) {
      if (probe.ok) {
        // v1.0.8.7 — مدل استدلالی بودن صریح اعلام می‌شود تا کاربر
        // سقف توکن کوچک نگذارد (با ۳۸۴ روی deepseek-flash پاسخ خالی می‌شود)
        return `تماس آزمایشی با ${paper.provider} موفق بود ✓${probe.reasoning ? " — مدل استدلالی است؛ سقف توکن (AI_MAX_TOKENS) را کوچک نگذارید (برای برگه: ۳۲هزار+)" : ""} — ساخت برگهٔ آیلتس آماده است`;
      }
      return `تماس آزمایشی با ${paper.provider} ناموفق بود: ${probe.error}`;
    }
    return "برای تست زندهٔ سرویس AI برگه‌ها، همین مسیر را با ?probe=1 صدا بزن";
  })();
  // v1.0.8.7 — هشدار سقف توکنِ کوچک برای «برگهٔ کامل» (مثل ۳۸۴)
  if (paper.maxTokensAdvice) {
    return ok({
      laya,
      paper: {
        ...paper,
        ...(probe ? { probe } : {}),
      },
      redis,
      hint,
      paperHint: `${paperHint} ⚠ ${paper.maxTokensAdvice}`,
    });
  }

  return ok({
    laya,
    paper: {
      ...paper,
      ...(probe ? { probe } : {}),
    },
    redis,
    hint,
    paperHint,
  });
}
