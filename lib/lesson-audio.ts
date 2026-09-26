// ========================================
// کمک‌ابزارهای صوتی درس‌ها — v1.0.2.8
// مسیر فایل‌های صوتی + پخش جایگزین مرورگر
// نسخه ۱.۰.۲.۸: مسیرها از پل امن /api/media
// (باکت خصوصی B2 + لینک امضادار) سرو می‌شوند
// ========================================

import { mediaUrl } from "@/lib/media";

/** مسیر صدای یک خط مکالمه (قرمز=سایت / آبی=کاربر) */
export function convLineAudio(slug: string, lineIndex: number): string {
  return mediaUrl(`/audio/conversation/${slug}/line-${lineIndex}.mp3`);
}

/** مسیر صدای داستان لیسنینگ */
export function storyAudio(slug: string): string {
  return mediaUrl(`/audio/listening/${slug}/story.mp3`);
}

/** آیا مرورگر از سنتز گفتار پشتیبانی می‌کند؟ */
export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * پخش جایگزین با صدای مرورگر (SpeechSynthesis)
 * برای زمانی که فایل صوتی آماده نیست — با دو صدای متفاوت برای دو طرف مکالمه
 */
export function speakFallback(
  text: string,
  opts: { voiceHint?: "site" | "user" | "narrator"; rate?: number } = {},
): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    // پاک‌سازی نقطه‌ویرگول و فاصله‌های اضافی برای تلفظ بهتر
    const clean = text.replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-US";
    u.rate = opts.rate ?? 0.95;
    const voices = window.speechSynthesis.getVoices();
    // انتخاب صدای انگلیسی؛ برای «سایت» صدای مردانه اگر موجود باشد
    const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
    if (en.length > 0) {
      if (opts.voiceHint === "site") {
        const male =
          en.find((v) => /david|guy|daniel|george|male/i.test(v.name)) ?? en[0];
        u.voice = male;
      } else if (opts.voiceHint === "user") {
        const female =
          en.find((v) => /zira|aria|samantha|female|jenny/i.test(v.name)) ??
          en[Math.min(1, en.length - 1)];
        u.voice = female;
      } else {
        u.voice = en[0];
      }
    }
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

/**
 * پخش یک خط: اول فایل صوتی واقعی، در نبود آن صدای مرورگر.
 * onEnded همیشه صدا زده می‌شود.
 */
export function playLine(
  src: string,
  text: string,
  opts: { voiceHint?: "site" | "user" | "narrator"; rate?: number } = {},
): { promise: Promise<void>; stop: () => void } {
  let cancelled = false;
  const audio = new Audio(src);
  const stop = () => {
    cancelled = true;
    audio.pause();
    audio.src = "";
    if (canSpeak()) window.speechSynthesis.cancel();
  };
  const promise = new Promise<void>((resolve) => {
    audio.onended = () => !cancelled && resolve();
    audio.onerror = () => {
      if (cancelled) return resolve();
      // فایل نیست → صدای مرورگر
      speakFallback(text, opts).then(() => resolve());
    };
    audio.play().catch(() => {
      if (cancelled) return resolve();
      speakFallback(text, opts).then(() => resolve());
    });
  });
  return { promise, stop };
}
