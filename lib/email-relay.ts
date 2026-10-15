// ========================================
// v1.0.6.8 (English 1.0.1.11) — کلاینت «رلهٔ ایمیل Cloudflare»
//
// چرا این فایل وجود دارد؟
//  SendGrid درخواست از IP ایران را با 451 رد می‌کند. برای
//  «سرور داخل ایران / دامنهٔ .ir بدون VPN» یک Worker رایگانِ
//  Cloudflare (workers/email-relay/worker.js) درخواست را از
//  IP سالم Cloudflare به SendGrid می‌رساند:
//
//    سرور اپ (هر IP، حتی ایران)
//      → POST EMAIL_RELAY_URL/send  + هدر X-Relay-Key
//      → Worker (IP سالم Cloudflare)
//      → api.sendgrid.com → ایمیل تحویل می‌شود
//
//  سرور فقط به Cloudflare وصل می‌شود — از ایران بدون VPN
//  در دسترس است. VPNِ کاربرِ نهایی هم هیچ نقشی ندارد (کاربر
//  فقط ایمیل را در inbox خودش می‌بیند).
//
// تنظیم (هر دو لازم):
//   EMAIL_RELAY_URL  = https://…workers.dev   (آدرس Worker)
//   EMAIL_RELAY_KEY  = همان RELAY_KEY که در Worker گذاشتید
//  کلید و فرستندهٔ SendGrid داخل Worker (به‌صورت Secret)
//  تنظیم می‌شوند — در .env اپ لازم نیستند.
//  راهنمای استقرار ۵ دقیقه‌ای: کامنت‌های .env + DEPLOY.md
//  (بخش ۱.۰.1.11) + سرآیند workers/email-relay/worker.js
//
// طراحی:
//  - fetch ساده و مستقیم (بدون outboundRequest) — کلودفلر از
//    هر IP در دسترس است؛ تونل VPN لازم نیست
//  - هیچ‌وقت throw نمی‌کند؛ همیشه { ok, status?, error? }
//    (سازگار با SendEmailResult در lib/sendgrid.ts)
//  - پیام‌های خطا فارسی و قابل‌اقدام‌اند (کلید غلط، Worker
//    خاموش، workers.dev فیلتر → Custom Domain)
//  - probeEmailRelay برای /api/notify/diagnose: /health و
//    /verify را موازی چک می‌کند
// ========================================

const SEND_TIMEOUT_MS = 10_000;
const PROBE_TIMEOUT_MS = 4_000;

export interface EmailRelaySendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** نام نمایشی فرستنده (اختیاری — Worker خودش پیش‌فرض دارد) */
  fromName?: string;
}

export type EmailRelaySendResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error: string };

/** آدرس Worker از env — خالی = رله غیرفعال (رفتار نسخه‌های قبلی) */
export function getEmailRelayUrl(): string | undefined {
  const raw = process.env.EMAIL_RELAY_URL?.trim();
  return raw || undefined;
}

/** کلید مشترک با Worker (env EMAIL_RELAY_KEY) */
export function getEmailRelayKey(): string | undefined {
  const raw = process.env.EMAIL_RELAY_KEY?.trim();
  return raw || undefined;
}

/**
 * رله تنظیم شده؟ (فقط URL — کلید ممکن است جا افتاده باشد؛
 * آن‌وقت sendViaRelay پیام دقیق می‌دهد و diagnose هشدار می‌دهد)
 */
export function isEmailRelayConfigured(): boolean {
  return Boolean(getEmailRelayUrl());
}

/** فقط host Worker برای لاگ/تشخیص — بدون path و credential */
export function emailRelayHost(): string {
  const url = getEmailRelayUrl();
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "(آدرس نامعتبر)";
  }
}

/**
 * endpoint ارسال: EMAIL_RELAY_URL با نرمال‌سازی بخشنده —
 *  https://x.workers.dev         → https://x.workers.dev/send
 *  https://x.workers.dev/        → …/send
 *  https://x.workers.dev/send    → همان (بدون تکرار)
 *  https://x.workers.dev/custom  → همان (Worker مسیر را چک می‌کند)
 */
export function relaySendEndpoint(): string | undefined {
  const base = getEmailRelayUrl();
  if (!base) return undefined;
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/send") ? trimmed : `${trimmed}/send`;
}

/** پیام فارسیِ قابل‌اقدام برای خطاهای شبکهٔ رله */
function friendlyRelayNetworkError(error: string): string {
  if (
    /fetch failed|ENOTFOUND|EAI_AGAIN|Unable to connect|ECONNREFUSED|connection refused|ECONNRESET/i.test(
      error,
    )
  ) {
    return (
      `رلهٔ ایمیل: آدرس Worker در دسترس نیست (${emailRelayHost()}). ` +
      `URL را در EMAIL_RELAY_URL چک کنید؛ اگر workers.dev از سرورِ شما فیلتر است، ` +
      `به Worker یک Custom Domain ببندید (Workers → Settings → Domains & Routes) و همان را بگذارید.`
    );
  }
  if (/aborted|AbortError|Timeout/i.test(error)) {
    return (
      `رلهٔ ایمیل: پاسخی از Worker نگرفتیم (تایم‌اوت). دوباره امتحان کنید؛ ` +
      `اگر تکرار شد GET ${getEmailRelayUrl()}/health را در مرورگر باز کنید.`
    );
  }
  return `رلهٔ ایمیل — خطای شبکه: ${error}`;
}

/** آیا کلید رله جا افتاده؟ (پیام دقیق برای sendViaRelay) */
function missingKeyError(): string {
  return (
    `EMAIL_RELAY_URL تنظیم شده (${emailRelayHost()}) ولی EMAIL_RELAY_KEY خالی است — ` +
    `همان مقدار RELAY_KEY که در Worker گذاشتید را در EMAIL_RELAY_KEY بگذارید.`
  );
}

/**
 * ارسال ایمیل از طریق Worker کلادفلر — هرگز throw نمی‌کند.
 * خروجی سازگار با SendEmailResult: { ok, status?, error? }
 */
export async function sendViaRelay(
  args: EmailRelaySendArgs,
): Promise<EmailRelaySendResult> {
  const endpoint = relaySendEndpoint();
  const key = getEmailRelayKey();
  if (!endpoint) {
    return { ok: false, error: "EMAIL_RELAY_URL تنظیم نشده است" };
  }
  if (!key) {
    return { ok: false, error: missingKeyError() };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Relay-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
        fromName: args.fromName,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    // بدنه همیشه JSON است (حتی خطاها) — اگر نبود، از status بسازیم
    let body: { ok?: boolean; status?: number; error?: string } = {};
    try {
      body = JSON.parse((await res.text()) || "{}");
    } catch {
      body = {};
    }

    if (res.ok && body.ok) {
      return { ok: true, status: body.status ?? res.status };
    }

    // خطا — پیام Worker (فارسی و دقیق) یا ساخت خودمان.
    // status «بالادستی» (مثل 451/401 SendGrid) از بدنه می‌آید —
    // HTTP رله ممکن است 200 باشد.
    const error =
      body.error ||
      (res.status === 401
        ? "کلید رله (X-Relay-Key) از سمت Worker پذیرفته نشد"
        : `HTTP ${res.status}`);
    return { ok: false, status: body.status ?? res.status, error };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    const raw = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: friendlyRelayNetworkError(
        aborted ? `Timeout after ${SEND_TIMEOUT_MS}ms` : raw,
      ),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── تشخیص (برای /api/notify/diagnose) ──

export type EmailRelayProbe = {
  /** EMAIL_RELAY_URL تنظیم شده؟ */
  configured: boolean;
  /** host Worker (بدون path/کلید) */
  host: string;
  /** EMAIL_RELAY_KEY تنظیم شده؟ */
  keyConfigured: boolean;
  /** GET /health (بدون کلید) — Worker زنده است؟ */
  health: {
    tested: boolean;
    ok: boolean;
    status?: number;
    latencyMs?: number;
    brief: string;
    /** Worker خودش SendGrid را تنظیم دارد؟ (از پاسخ health) */
    workerSendgridConfigured?: boolean;
  };
  /** GET /verify (با کلید) — کلید درست است؟ */
  verify: {
    tested: boolean;
    ok: boolean;
    status?: number;
    brief: string;
  };
};

async function fetchWithTimeout(
  url: string,
  headers: Record<string, string>,
): Promise<{ ok: boolean; status: number; bodyText: string; latencyMs: number } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const bodyText = await res.text().catch(() => "");
    return {
      ok: res.ok,
      status: res.status,
      bodyText,
      latencyMs: Date.now() - startedAt,
    };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    return { ok: false, error: raw };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * پروبِ رله برای diagnose — /health (زنده‌بودن) و /verify (کلید)
 * موازی اجرا می‌شوند؛ هرگز throw نمی‌کند.
 */
export async function probeEmailRelay(): Promise<EmailRelayProbe> {
  const url = getEmailRelayUrl();
  const base = url ? url.replace(/\/+$/, "") : "";
  const probe: EmailRelayProbe = {
    configured: Boolean(url),
    host: emailRelayHost(),
    keyConfigured: Boolean(getEmailRelayKey()),
    health: { tested: false, ok: false, brief: "" },
    verify: { tested: false, ok: false, brief: "" },
  };
  if (!base) return probe;

  const headers: Record<string, string> = {};
  const relayKey = getEmailRelayKey();
  if (relayKey) headers["X-Relay-Key"] = relayKey;

  const [healthRes, verifyRes] = await Promise.all([
    fetchWithTimeout(`${base}/health`, {}),
    fetchWithTimeout(`${base}/verify`, headers),
  ]);

  if ("error" in healthRes) {
    probe.health = {
      tested: true,
      ok: false,
      brief: `شبکه: ${healthRes.error.slice(0, 140)}`,
    };
  } else {
    let workerSendgrid: boolean | undefined;
    try {
      const b = JSON.parse(healthRes.bodyText || "{}") as {
        sendgridConfigured?: boolean;
      };
      workerSendgrid = b.sendgridConfigured;
    } catch {
      /* بدنه JSON نبود */
    }
    probe.health = {
      tested: true,
      ok: healthRes.ok,
      status: healthRes.status,
      latencyMs: healthRes.latencyMs,
      brief: `HTTP ${healthRes.status} (${healthRes.latencyMs}ms)`,
      workerSendgridConfigured: workerSendgrid,
    };
  }

  if ("error" in verifyRes) {
    probe.verify = {
      tested: true,
      ok: false,
      brief: `شبکه: ${verifyRes.error.slice(0, 140)}`,
    };
  } else {
    probe.verify = {
      tested: true,
      ok: verifyRes.ok,
      status: verifyRes.status,
      brief:
        verifyRes.status === 401
          ? "HTTP 401 (کلید رله نمی‌خواند)"
          : `HTTP ${verifyRes.status}`,
    };
  }

  return probe;
}
