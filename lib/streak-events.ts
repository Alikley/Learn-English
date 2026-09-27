// ========================================
// رویداد فعالیت کاربر → آلرت فوری استریک (v1.0.3.0 — گام ۳)
// هر جا که کاربر فعالیتی را «به اتمام می‌رساند» (پایان دور بازی،
// تکمیل درس، پایان تمرین شنیداری، اصلاح نوشتار، صفحه‌گردانی کتاب،
// افزودن کلمه به جعبه، پایان مجموعه گرامر) این تابع را صدا بزنید
// تا آلرت روزهای متوالی بی‌درنگ (بدون رفرش صفحه) ظاهر شود.
// ========================================

export const STREAK_ACTIVITY_EVENT = "flex:activity-completed";

/** اعلام اتمام یک فعالیت — StreakLoginAlert گوش می‌دهد و آلرت فوری می‌آورد */
export function notifyStreakActivity() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STREAK_ACTIVITY_EVENT));
}
