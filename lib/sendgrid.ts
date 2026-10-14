// ========================================
// v1.0.6.5 (English 1.0.1.8) — ارسال ایمیل با SendGrid
//
// ساده‌ترین مسیر رسمی: REST API خود SendGrid با fetch خام —
// بدون وابستگی جدید (پکیج @sendgrid/mail لازم نیست).
//   POST https://api.sendgrid.com/v3/mail/send
//   Authorization: Bearer <SENDGRID_API_KEY>
//
// طراحی:
//  - هیچ‌وقت throw نمی‌کند؛ همیشه { ok, status?, error? }.
//    یعنی فراموشی رمز هرگز اپ را نمی‌شکند.
//  - بدون کلید/فرستنده → isSendgridConfigured() = false و
//    روتِ فراموشی رمز به «حالت توسعه» می‌رود (لینک فقط در
//    کنسول سرور چاپ می‌شود).
//  - تایم‌اوت ۱۰ ثانیه (آباپتر) تا کاربر معطل نماند.
// ========================================

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

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return {
      ok: false,
      error: "SENDGRID_API_KEY یا SENDGRID_FROM_EMAIL تنظیم نشده است",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SENDGRID_ENDPOINT, {
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
      signal: controller.signal,
    });

    // 202 Accepted = موفق (SendGrid همیشه 202 برمی‌گرداند)
    if (res.ok) return { ok: true, status: res.status };

    // خطا — بدنهٔ JSON یا متنی SendGrid را برای لاگ می‌خوانیم
    let detail = "";
    try {
      const body = await res.text();
      detail = body.slice(0, 300);
    } catch {
      /* بدنه خوانده نشد — مهم نیست */
    }
    return {
      ok: false,
      status: res.status,
      error: `SendGrid ${res.status}: ${detail || "(بدون جزئیات)"}`,
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? "SendGrid پاسخ نداد (تایم‌اوت ۱۰ ثانیه) — احتمالاً شبکه/تحریم"
        : `خطای شبکه به SendGrid: ${e instanceof Error ? e.message : String(e)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
