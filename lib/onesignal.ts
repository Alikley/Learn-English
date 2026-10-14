// ========================================
// v1.0.6.5 (English 1.0.1.8) — ارسال پوش با OneSignal
//
// مسیر رسمی: REST API خود OneSignal با fetch خام — بدون
// وابستگی جدید (پکیج لازم نیست):
//   POST https://api.onesignal.com/notifications
//   Authorization: Basic <ONESIGNAL_REST_API_KEY>
//   { app_id, include_subscription_ids, headings, contents }
//
// طراحی:
//  - هیچ‌وقت throw نمی‌کند؛ همیشه { ok, notified, error? }
//  - بدون کلید/آیدی → isOneSignalConfigured() = false و جابِ
//    یادآور استریک پیام روشن می‌دهد (503) — اپ سالم می‌مانَد
//  - تایم‌اوت ۱۰ ثانیه
//  - سقف include_subscription_ids در هر درخواست = ۲۰۰۰
//    (مستندات OneSignal) → خودکار تکه‌تکه می‌شود
// ========================================

const ONESIGNAL_ENDPOINT = "https://api.onesignal.com/notifications";
const TIMEOUT_MS = 10_000;
/** سقف رسمی OneSignal برای include_subscription_ids در هر فراخوانی */
const MAX_IDS_PER_CALL = 2000;

export type PushPayload = {
  /** عنوان اعلان — کلید زبان (fa/en) */
  headings: { fa: string; en: string };
  /** متن اعلان — کلید زبان (fa/en) */
  contents: { fa: string; en: string };
  /** لینکی که با کلیک باز می‌شود (نسبی = همان سایت) */
  url?: string;
};

export type SendPushResult = {
  ok: boolean;
  notified: number;
  error?: string;
};

/** آیا OneSignal تنظیم شده؟ (App ID + REST API Key) */
export function isOneSignalConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY,
  );
}

async function callOneSignal(
  subscriptionIds: string[],
  payload: PushPayload,
): Promise<SendPushResult> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restKey) {
    return {
      ok: false,
      notified: 0,
      error: "ONESIGNAL_APP_ID یا ONESIGNAL_REST_API_KEY تنظیم نشده است",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ONESIGNAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${restKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: appId,
        include_subscription_ids: subscriptionIds,
        headings: {
          en: payload.headings.en,
          fa: payload.headings.fa,
        },
        contents: {
          en: payload.contents.en,
          fa: payload.contents.fa,
        },
        ...(payload.url ? { url: payload.url } : {}),
      }),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => ({}))) as {
      recipients?: number;
      errors?: string[];
      id?: string;
    };

    // 200 + notification id = موفق (recipients شاید 0 باشد)
    if (res.ok && (body.id || typeof body.recipients === "number")) {
      return { ok: true, notified: body.recipients ?? 0 };
    }

    const errs = Array.isArray(body.errors) ? body.errors.join("; ") : "";
    return {
      ok: false,
      notified: 0,
      error: `OneSignal ${res.status}${errs ? `: ${errs}` : ""}`.slice(0, 300),
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      notified: 0,
      error: aborted
        ? "OneSignal پاسخ نداد (تایم‌اوت ۱۰ ثانیه)"
        : `خطای شبکه به OneSignal: ${e instanceof Error ? e.message : String(e)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * ارسال پوش به شناسه‌های اشتراک مشخص (هر دستگاه/مرورگری که
 * «یادآور استریک» را فعال کرده). اگر بیش از ۲۰۰۰ شناسه باشد،
 * خودکار چند نوبت می‌شود. هر خطا در نتیجه جمع می‌آید ولی
 * بقیه‌ی نوبت‌ها فرستاده می‌شوند.
 */
export async function sendPushToSubscriptions(
  subscriptionIds: string[],
  payload: PushPayload,
): Promise<SendPushResult> {
  if (!subscriptionIds.length) {
    return { ok: true, notified: 0 };
  }

  let total = 0;
  const errors: string[] = [];

  for (let i = 0; i < subscriptionIds.length; i += MAX_IDS_PER_CALL) {
    const chunk = subscriptionIds.slice(i, i + MAX_IDS_PER_CALL);
    const result = await callOneSignal(chunk, payload);
    if (result.ok) {
      total += result.notified;
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return {
    ok: errors.length === 0,
    notified: total,
    error: errors.length ? errors.join(" | ").slice(0, 300) : undefined,
  };
}
