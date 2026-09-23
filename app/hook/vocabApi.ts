// ========================================
// ابزارهای شبکهٔ لغت‌نامه (v1.0.2.7 — ریفکتوری گام ۳)
// فِچ با سقف زمانی + پیام خطای فارسی
// (از useVocabularyBoxes تفکیک شد)
// ========================================

/** سقف انتظار هر درخواست لغت‌نامه (میلی‌ثانیه) */
export const VOCAB_REQ_TIMEOUT_MS = 20_000;

/** فِچ با سقف زمانی — بعد از مهلت، درخواست لغو و خطا نمایش داده می‌شود */
export async function fetchWithTimeout(url: string, init?: RequestInit) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), VOCAB_REQ_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** پیام فارسی خطای شبکه/تایم‌اوت */
export function netErrorMessage(e: unknown): string {
  if (e instanceof DOMException && e.name === "AbortError")
    return "پاسخ سرور بیش از حد طول کشید — دوباره تلاش کنید";
  return "ارتباط با سرور برقرار نشد";
}
