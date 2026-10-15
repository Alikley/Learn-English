// ========================================
// v1.0.6.6 (English 1.0.1.9) — ارسال ایمیل با SendGrid
//
// ساده‌ترین مسیر رسمی: REST API خود SendGrid — بدون وابستگی
// جدید (پکیج @sendgrid/mail لازم نیست).
//   POST https://api.sendgrid.com/v3/mail/send
//   Authorization: Bearer <SENDGRID_API_KEY>
//
// طراحی:
//  - هیچ‌وقت throw نمی‌کند؛ همیشه { ok, status?, error? }.
//    یعنی فراموشی رمز هرگز اپ را نمی‌شکند.
//  - بدون کلید/فرستنده → isSendgridConfigured() = false و
//    روتِ فراموشی رمز به «حالت توسعه» می‌رود (لینک فقط در
//    کنسول سرور چاپ می‌شود).
//  - تایم‌اوت ۱۰ ثانیه (آداپتر) تا کاربر معطل نماند.
//  - v1.0.6.6: درخواست‌ها از outboundRequest() می‌روند → اگر
//    OUTBOUND_PROXY_URL تنظیم شده باشد (SOCKS/HTTP)، فراخوانی
//    از تونل VPN می‌گذرد و خطای تحریمی 451 حل می‌شود.
//    (اثبات‌شده: کلید و فرستندهٔ سالم + IP غیرتحریمی → 202)
//  - v1.0.6.7: اگر پروکسی تنظیم شده ولی خاموش/قطع باشد، لایهٔ
//    خروجی خودکار «مستقیم» می‌فرستد (اپ نمی‌شکند)؛ پیام خطای این
//    حالت اینجا فارسی و روشن است (ECONNREFUSED / تایم‌اوت).
//  - v1.0.6.8: «رلهٔ ایمیل Cloudflare» اولویت اول شد — برای
//    سرور داخل ایران / دامنهٔ .ir بدون VPN (ایمیل از IP سالم
//    Cloudflare می‌رود و 451 از بین می‌شود؛ راهنما: workers/
//    email-relay/worker.js + EMAIL_RELAY_URL/EMAIL_RELAY_KEY).
//    رله تنظیم نشده باشد = دقیقاً رفتار نسخهٔ قبل (مستقیم/پروکسی).
//    اگر رله شکست بخورد و کلید مستقیم هم باشد، خودکار به مسیر
//    قبلی برمی‌گردد (شکست‌ناپذیر).
// ========================================

import { outboundRequest } from "@/lib/outbound-proxy";
import {
  sendViaRelay,
  isEmailRelayConfigured,
} from "@/lib/email-relay";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";
const TIMEOUT_MS = 10_000;
const DEFAULT_FROM_NAME = "Flex English";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendEmailResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error: string };

/**
 * آیا ارسال ایمیل فعال است؟
 *  - رلهٔ Cloudflare تنظیم شده → فعال (کلید SendGrid لازم نیست،
 *    داخل Worker است)
 *  - وگرنه: کلید + فرستنده (مسیر مستقیم/پروکسی نسخه‌های قبلی)
 */
export function isSendgridConfigured(): boolean {
  if (isEmailRelayConfigured()) return true;
  return Boolean(
    process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL,
  );
}

/** نام نمایشی فرستنده — قابل تنظیم از env، پیش‌فرض Flex English */
export function sendgridFromName(): string {
  return process.env.SENDGRID_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
}

/** پیام فارسیِ روشن برای خطاهای شناخته‌شدهٔ SendGrid */
function friendlyError(status: number, detail: string): string {
  if (status === 451) {
    const relayHint = isEmailRelayConfigured()
      ? `⚠️ رلهٔ Cloudflare تنظیم شده ولی این درخواست از مسیر مستقیم رفته است. `
      : `۳) سرور داخل ایران / دامنهٔ .ir: Worker رایگانِ Cloudflare را مستقر کنید ` +
        `(فایل workers/email-relay/worker.js — راهنمای ۵ دقیقه‌ای در DEPLOY.md و کامنت‌های .env) و ` +
        `EMAIL_RELAY_URL + EMAIL_RELAY_KEY را تنظیم کنید — ایمیل از IP سالم Cloudflare می‌رود و VPN لازم نیست. `;
    return (
      `SendGrid 451: درخواست از IP مبدا رد شد (تحریم منطقه‌ای — Unavailable For Legal Reasons). ` +
      `کلید و فرستنده سالم‌اند (اثبات‌شده). راه‌حل: ` +
      `۱) لوکال: v2rayN/VPN را روشن کنید و در .env مقدار OUTBOUND_PROXY_URL را روی پروکسی آن بگذارید ` +
      `(مثلاً socks5://127.0.0.1:10808 — پیش‌فرض v2rayN) و سرور را ری‌استارت کنید؛ اگر VPN روشن بود و باز 451 گرفتید، ` +
      `سرور قبل از روشن‌شدن VPN استارت شده — ری‌استارت کنید. ` +
      `۲) روی Vercel: OUTBOUND_PROXY_URL را خالی بگذارید (IP خود Vercel سالم است و ایمیل بدون هیچ تنظیمی می‌رود). ` +
      relayHint +
      `تست سریع: curl http://localhost:3000/api/notify/diagnose — ` +
      `جزئیات: ${detail || "(بدون جزئیات)"}`
    );
  }
  if (status === 401 || status === 403) {
    return (
      `SendGrid ${status}: کلید API یا فرستنده پذیرفته نشد — کلید و Verify Single Sender را در داشبورد SendGrid بررسی کنید. ` +
      `جزئیات: ${detail || "(بدون جزئیات)"}`
    );
  }
  return `SendGrid ${status}: ${detail || "(بدون جزئیات)"}`;
}

/**
 * v1.0.6.7 — ترجمهٔ خطاهای شبکه به پیام قابل‌اقدام:
 *  رایج‌ترین حالتِ دنیای واقعی: OUTBOUND_PROXY_URL تنظیم شده
 *  ولی VPN در لحظهٔ ارسال خاموش بوده (ECONNREFUSED روی پورت
 *  پروکسی) — اینجا دقیقاً می‌گوییم چه کار کنند.
 */
function friendlyNetworkError(error: string): string {
  if (/ECONNREFUSED/i.test(error)) {
    return (
      `شبکه: پورت پروکسی بسته است (${error}). یعنی OUTBOUND_PROXY_URL تنظیم شده ولی VPN ` +
      `(مثلاً v2rayN) روشن نیست. یا VPN را روشن کنید و دوباره امتحان کنید، یا مقدار ` +
      `OUTBOUND_PROXY_URL را در .env خالی کنید. روی Vercel این متغیر باید خالی باشد.`
    );
  }
  if (/تایم\u200cاوت|تایم‌اوت|Timeout/i.test(error)) {
    return (
      `شبکه: پاسخی از SendGrid نگرفتیم (${error}). اگر IP شما تحریمی است، VPN را روشن کنید ` +
      `و OUTBOUND_PROXY_URL را روی پروکسی VPN بگذارید (مثلاً socks5://127.0.0.1:10808). ` +
      `روی Vercel نیازی به پروکسی نیست — مقدار را خالی بگذارید.`
    );
  }
  return `شبکه: ${error} — اگر IP شما تحریمی است، VPN را روشن کنید (OUTBOUND_PROXY_URL در .env)؛ روی Vercel پروکسی لازم نیست.`;
}

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  // ── v1.0.6.8: مسیر ۱ — رلهٔ Cloudflare (اولویت اول) ──
  // برای «سرور داخل ایران / دامنهٔ .ir بدون VPN»: درخواست از
  // IP سالم Cloudflare به SendGrid می‌رود و 451 از بین می‌شود.
  if (isEmailRelayConfigured()) {
    const relayResult = await sendViaRelay({
      ...args,
      fromName: sendgridFromName(),
    });
    if (relayResult.ok) return relayResult;

    // رله شکست خورد — اگر کلید مستقیم هم تنظیم شده، خودکار به
    // مسیر قبلی برگرد (شکست‌ناپذیر؛ مثلاً وقتی اپ روی Vercel
    // است و فقط لوکال رله دارد). وگرنه خطای روشنِ رله.
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      console.warn(
        `[sendgrid] رلهٔ Cloudflare ناموفق بود (${relayResult.error.slice(0, 200)}) — تلاش مستقیم/پروکسی`,
      );
    } else {
      return relayResult;
    }
  }

  // ── مسیر ۲ (نسخه‌های قبلی): مستقیم / از تونل VPN ──
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return {
      ok: false,
      error: "SENDGRID_API_KEY یا SENDGRID_FROM_EMAIL تنظیم نشده است",
    };
  }

  const result = await outboundRequest(SENDGRID_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: args.to }] }],
      from: { email: fromEmail, name: sendgridFromName() },
      subject: args.subject,
      content: [
        { type: "text/plain", value: args.text },
        { type: "text/html", value: args.html },
      ],
    }),
    timeoutMs: TIMEOUT_MS,
  });

  if (result.kind === "network-error") {
    return { ok: false, error: friendlyNetworkError(result.error) };
  }

  // 202 Accepted = موفق (SendGrid همیشه 202 برمی‌گرداند)
  if (result.ok) return { ok: true, status: result.status };

  return {
    ok: false,
    status: result.status,
    error: friendlyError(result.status, result.bodyText.slice(0, 300)),
  };
}
