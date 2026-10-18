// ========================================
// پایگاه دانش پشتیبان چت (v1.0.8.0 / English 1.0.2.0)
//
// مدل Laya پیام فارسی کاربر را طبقه‌بندی می‌کند (checkpoint
// چندزبانه فارسی را می‌فهمد) و «کلید موضوع» را با confidence
// برمی‌گرداند؛ این ماژول موضوع را به پاسخ فارسی curated
// نگاشت می‌کند.
//
// چرا این معماری؟ Laya متن تولید نمی‌کند (مدل تصمیم است) —
// پس «پشتیبان AI» = انتخاب هوشمندِ بهترین پاسخ آماده توسط
// مدل + متن پاسخ‌ها curated از طرف خود سایت. یعنی: هیچ
// پاسخ غلط/توهم‌زده ممکن نیست، و قالب‌بندی همیشه تمیز است.
//
// فقط سمت سرور — تست‌شده در tests/laya.test.ts
// ========================================

import { layaChoose } from "@/lib/laya";

export type SupportTopicKey =
  | "account"
  | "courses"
  | "books"
  | "ielts"
  | "vocabulary"
  | "practice"
  | "payment"
  | "other";

/** آستانهٔ اطمینان برای پاسخ مطمئن — کمتر از این = «متوجه نشدم» */
export const SUPPORT_CONFIDENCE_THRESHOLD = 0.45;

/** موضوعات برای مدل Laya — شرح‌ها انگلیسی (بهترین حالت مدل) */
export const SUPPORT_TOPIC_CRITERIA: Record<SupportTopicKey, string> = {
  account:
    "login, sign in, register, sign up, password reset, forgot password, profile, account access problems",
  courses:
    "courses, course levels, which course to take, placement test, lessons, enrollment, beginner intermediate advanced, how to start learning",
  books:
    "Cambridge books, IELTS books, library, story books, PDF, audio files, reading materials, which book to read",
  ielts:
    "IELTS exam, real IELTS tests, listening, reading, writing, speaking modules, band scores, exam preparation, test dates",
  vocabulary:
    "dictionary, word translation, word boxes, saving words, vocabulary practice, Persian meaning of English words",
  practice:
    "exercises, training, practice games, hangman, memory game, streak, daily practice, XP points",
  payment:
    "price, pricing, subscription, paying, payment methods, plans, refund, free vs paid",
  other:
    "greetings, saying hello, thanks, goodbye, general questions, anything not covered above",
};

export const SUPPORT_INSTRUCTIONS =
  "Which support topic does this user's message belong to? Choose the single best match.";

export type SupportIntent = {
  key: SupportTopicKey;
  /** پاسخ فارسی پشتیبان */
  answer: string;
  answerEn: string;
  /** لینک‌های سریع */
  actions: { label: string; labelEn: string; href: string }[];
};

/** پاسخ‌های curated — لهجهٔ خود سایت (صمیمی و کوتاه) */
export const SUPPORT_INTENTS: Record<SupportTopicKey, SupportIntent> = {
  account: {
    key: "account",
    answer:
      "برای ورود و ثبت‌نام از دکمهٔ «ورود» بالای سایت استفاده کن. رمز را فراموش کردی؟ در صفحهٔ ورود روی «فراموشی رمز عبور» بزن تا ایمیل بازیابی برایت بیاید. اگر ایمیل نیامد، پوشهٔ Spam را هم چک کن.",
    answerEn:
      "Use the Login button at the top to sign in or register. Forgot your password? On the login page tap Forgot Password to receive a reset email. If it doesn't arrive, check your Spam folder too.",
    actions: [
      { label: "ورود / ثبت‌نام", labelEn: "Login / Register", href: "/login" },
      { label: "بازیابی رمز", labelEn: "Reset password", href: "/forgot-password" },
    ],
  },
  courses: {
    key: "courses",
    answer:
      "اگر نمی‌دانی از کجا شروع کنی، از «تعیین سطح» در سایدبار شروع کن — چند دقیقه طول می‌کشد و بعدش مسیر دقیق (دوره‌ها و کتاب‌ها) به تو نشان داده می‌شود. دوره‌ها ۴ شاخه دارند: گرامر، مکالمه، لغات و لیسنینگ — در هر سطح ۱۰ درس.",
    answerEn:
      "Not sure where to start? Begin with Level Assessment in the sidebar — it takes a few minutes and then your exact path (courses and books) is shown. Courses come in 4 tracks: Grammar, Conversation, Vocabulary and Listening — 10 lessons each level.",
    actions: [
      { label: "تعیین سطح", labelEn: "Level assessment", href: "/placement" },
      { label: "دوره‌های من", labelEn: "My Courses", href: "/courses" },
    ],
  },
  books: {
    key: "books",
    answer:
      "کتاب‌های کمبریج (۲۱ جلد آیلتس واقعی) بخش آیلتس‌اند و کتاب‌های داستانی ساده در کتابخانه. بعد از تعیین سطح، دقیقاً می‌گوییم کدام شمارهٔ کتاب‌ها برای تو مناسب است. فایل PDF و صداهای هر کتاب داخل خود سایت باز می‌شوند — دانلود جدا لازم نیست.",
    answerEn:
      "Cambridge books (21 real IELTS volumes) live in the IELTS section; easy story books are in the Library. After your level assessment we tell you exactly which book numbers fit you. PDF and audio of each book open inside the site — no separate download needed.",
    actions: [
      { label: "کتابخانه", labelEn: "Library", href: "/library" },
      { label: "کتاب‌های آیلتس", labelEn: "IELTS books", href: "/ielts" },
      { label: "تعیین سطح من", labelEn: "My level", href: "/placement" },
    ],
  },
  ielts: {
    key: "ielts",
    answer:
      "بخش آیلتس ۲۱ کتاب کمبریج با تست‌های واقعی دارد — لیسنینگ، ریدینگ و… . برگه‌های آزمون هم با AI ساخته می‌شوند. نکته: هرچه نمره‌ات بالاتر، کتاب‌های قدیمی‌تر (۱-۹) چالش بهتری‌اند؛ برای شروع، کتاب‌های جدیدتر راحت‌ترند.",
    answerEn:
      "The IELTS section has 21 Cambridge books with real tests — listening, reading and more. Exam papers are also generated with AI. Tip: higher level learners get more challenge from the older books (1-9); start with newer ones.",
    actions: [
      { label: "آیلتس", labelEn: "IELTS", href: "/ielts" },
      { label: "تعیین سطح آیلتس", labelEn: "Level assessment", href: "/placement" },
    ],
  },
  vocabulary: {
    key: "vocabulary",
    answer:
      "لغت‌نامهٔ سایت با ترجمهٔ هوشمند کار می‌کند: کلمهٔ انگلیسی را در جعبهٔ لغت وارد کن؛ اول لغت‌نامهٔ محلی چک می‌شود، بعد ترجمهٔ AI. کلمه‌های جدید را می‌توانی در جعبه‌های لغت (Word Boxes) ذخیره کنی و با بازی‌ها تمرین‌شان کنی.",
    answerEn:
      "The site dictionary works with smart translation: type an English word in the word box; the local dictionary is checked first, then AI translation. You can save new words to Word Boxes and practice them with games.",
    actions: [
      { label: "لغت‌نامه", labelEn: "Vocabulary", href: "/vocab" },
      { label: "بازی‌های لغت", labelEn: "Word games", href: "/game" },
    ],
  },
  practice: {
    key: "practice",
    answer:
      "تمرین‌ها در بخش «تمرین‌ها» و بازی‌ها (ماری‌بازی، حافظه، کوییز سرعتی) در بخش «بازی‌ها» هستند. هر روز تمرین کن تا استریک (روزهای متوالی) و XPات بالا برود — استریک قوی‌ترین انگیزهٔ ادامه است!",
    answerEn:
      "Exercises live in the Practice section and games (hangman, memory, speed quiz) in the Games section. Practice daily to grow your streak and XP — a strong streak is the best motivation to keep going!",
    actions: [
      { label: "تمرین‌ها", labelEn: "Practice", href: "/training" },
      { label: "بازی‌ها", labelEn: "Games", href: "/game" },
    ],
  },
  payment: {
    key: "payment",
    answer:
      "دسترسی اصلی سایت رایگان است (دوره‌ها، لغت‌نامه، بازی‌ها). برخی امکانات AI (مثل برگهٔ آیلتس اختصاصی) محدودیت روزانه دارند. اگر سؤال خاصی دربارهٔ پرداخت یا طرح‌ها داری، پیامت را کامل بنویس تا تیم انسانی پیگیری کند.",
    answerEn:
      "Core site access is free (courses, dictionary, games). Some AI features (like custom IELTS papers) have daily limits. If you have a specific question about payments or plans, write your full message and the human team will follow up.",
    actions: [
      { label: "دوره‌های رایگان", labelEn: "Free courses", href: "/courses" },
    ],
  },
  other: {
    key: "other",
    answer:
      "سلام! 👋 من پشتیبان هوشمند سایت هستم. می‌توانم دربارهٔ دوره‌ها، تعیین سطح، کتاب‌های کمبریج، آیلتس، لغت‌نامه، تمرین‌ها و بازی‌ها کمکت کنم. سؤالت را بنویس یا یکی از دکمه‌های زیر را بزن.",
    answerEn:
      "Hi! 👋 I'm the site's smart assistant. I can help with courses, level assessment, Cambridge books, IELTS, the dictionary, practice and games. Write your question or tap one of the buttons below.",
    actions: [
      { label: "تعیین سطح", labelEn: "Level assessment", href: "/placement" },
      { label: "دوره‌ها", labelEn: "Courses", href: "/courses" },
      { label: "آیلتس", labelEn: "IELTS", href: "/ielts" },
    ],
  },
};

export type SupportReply = {
  topic: SupportTopicKey;
  answer: string;
  answerEn: string;
  actions: { label: string; labelEn: string; href: string }[];
  confidence: number;
  /** موتور زنده بود یا fallback؟ */
  engine: "laya" | "fallback";
};

/**
 * پاسخ پشتیبان به پیام کاربر:
 *  ۱) Laya موضوع پیام را با confidence طبقه‌بندی می‌کند
 *  ۲) موضوع مطمئن → پاسخ curated همان موضوع
 *  ۳) نبود/قطعی/کم‌اطمینانی → پاسخ «other» + دکمه‌های سریع
 *     (سایت هیچ‌وقت بدون جواب نمی‌ماند)
 */
export async function supportReply(message: string): Promise<SupportReply> {
  const text = message.trim().slice(0, 2000);

  const res = await layaChoose(
    text,
    SUPPORT_INSTRUCTIONS,
    SUPPORT_TOPIC_CRITERIA,
  );

  if (res.ok && res.confidence >= SUPPORT_CONFIDENCE_THRESHOLD) {
    const key = (res.choice in SUPPORT_INTENTS)
      ? (res.choice as SupportTopicKey)
      : "other";
    const intent = SUPPORT_INTENTS[key];
    return {
      topic: key,
      answer: intent.answer,
      answerEn: intent.answerEn,
      actions: intent.actions,
      confidence: res.confidence,
      engine: "laya",
    };
  }

  // fallback — بدون خطا، با دکمه‌های راهنما
  const fallback = SUPPORT_INTENTS.other;
  return {
    topic: "other",
    answer: fallback.answer,
    answerEn: fallback.answerEn,
    actions: fallback.actions,
    confidence: res.ok ? res.confidence : 0,
    engine: "fallback",
  };
}
