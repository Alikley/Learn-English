// ========================================
// ترجمهٔ پیام‌های هوک/سرور (v1.0.2.3 — گام ۳)
// پیام‌هایی که از AuthContext یا هوک‌ها (خارج از
// کامپوننت‌ها) می‌آیند، در محل نمایش با این تابع
// بر اساس زبان فعلی سایت ترجمه می‌شوند
// ========================================

const MESSAGES: Record<string, string> = {
  // ---- AuthContext ----
  "ایمیل یا رمز عبور اشتباه است": "Wrong email or password",
  "خطا در ثبت نام": "Sign-up error",
  "ثبت نام موفق بود، لطفاً وارد شوید": "Sign-up successful, please log in",

  // ---- useVocabularyBoxes ----
  "پاسخ سرور بیش از حد طول کشید — دوباره تلاش کنید":
    "Server response took too long — please try again",
  "ارتباط با سرور برقرار نشد": "Could not connect to the server",
  "دریافت جعبه‌ها ناموفق بود": "Failed to load the boxes",
  "نام جعبه را بنویسید": "Enter a box name",
  "ساخت جعبه ناموفق بود": "Failed to create the box",
  "حذف جعبه ناموفق بود": "Failed to delete the box",
  "کلمه را بنویسید": "Type a word",
  "این جعبه پر است — حداکثر ۱۰ کلمه": "This box is full — 10 words max",
  "این کلمه قبلاً در این جعبه هست": "This word is already in this box",
  "افزودن کلمه ناموفق بود": "Failed to add the word",
  "حذف کلمه ناموفق بود": "Failed to delete the word",
};

/**
 * پیام را بر اساس زبان فعلی سند ترجمه می‌کند.
 * پیام‌های ناشناخته بدون تغییر برمی‌گردند.
 */
export function localizeMessage(message: string): string {
  if (typeof document === "undefined") return message;
  try {
    if (document.documentElement.lang !== "en") return message;
  } catch {
    return message;
  }
  return MESSAGES[message] ?? message;
}
