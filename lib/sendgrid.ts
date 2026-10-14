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
// ========================================

import { outboundRequest } from "@/lib/outbound-proxy";

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

/** آیا SendGrid تنظیم شده؟ (کلید + فرستنده) */
export function isSendgridConfigured(): boolean {
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
    return (
      `SendGrid 451: درخواست از IP مبدا رد شد (تحریم منطقه‌ای — Unavailable For Legal Reasons). ` +
      `کلید و فرستنده سالم‌اند؛ راه‌حل: در .env مقدار OUTBOUND_PROXY_URL را روی پروکسی VPN بگذارید ` +
      `(مثلاً socks5://127.0.0.1:10808 برای v2rayN) و سرور را ری‌استارت کنید. ` +
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

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
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
    return { ok: false, error: result.error };
  }

  // 202 Accepted = موفق (SendGrid همیشه 202 برمی‌گرداند)
  if (result.ok) return { ok: true, status: result.status };

  return {
    ok: false,
    status: result.status,
    error: friendlyError(result.status, result.bodyText.slice(0, 300)),
  };
}
