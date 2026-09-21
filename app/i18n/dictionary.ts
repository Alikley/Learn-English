// ========================================
// دیکشنری دوزبانهٔ سایت (فارسی / English) — v1.0.1.9
//
// ساختار: هر کلید یک زوج [فارسی, English] است.
// حالت پیش‌فرض سایت فارسی (RTL) است؛ با دکمهٔ
// تغییر زبان در نوبار، کل پوستهٔ سایت (سایدبار،
// نوبار، هدر صفحه‌ها، دکمه‌های پرکاربرد) به
// انگلیسی (LTR) برمی‌گردد.
//
// محتوای آموزشی (متن درس‌ها، ترجمهٔ کلمه‌ها،
// سؤال‌های بازی‌ها) عمداً ترجمه نمی‌شوند —
// آن‌ها خودِ «محصول یادگیری» هستند.
// ========================================

export type Lang = "fa" | "en";

export const LANG_STORAGE_KEY = "flex-english-lang";

// [fa, en]
export const DICT: Record<string, [string, string]> = {
  // ---------- سایدبار ----------
  "sidebar.dashboard": ["داشبورد", "Dashboard"],
  "sidebar.training": ["تمرین‌ها", "Practice"],
  "sidebar.games": ["بازی‌ها", "Games"],
  "sidebar.library": ["کتابخانه", "Library"],
  "sidebar.vocab": ["لغت‌نامه", "Vocabulary"],
  "sidebar.courses": ["دوره‌های من", "My Courses"],
  "sidebar.chat": ["پیام‌ها", "Messages"],
  "sidebar.streakTitle": ["روزهای متوالی یادگیری", "Daily Learning Streak"],
  "sidebar.day": ["روز", "days"],
  "sidebar.msg0": ["شروع یک مسیر جدید!", "Start a new journey!"],
  "sidebar.msg1": ["فوق‌العاده! داری شروع میکنی", "Amazing! You're getting started"],
  "sidebar.msg2": ["عالی! به همین راه ادامه بده", "Great! Keep it up"],
  "sidebar.msg3": ["آفرین! به مسیرت ادامه بده", "Well done! Stay on track"],
  "sidebar.msg4": ["حرفه‌ای! هر روز تمرین کن", "Pro! Practice every day"],
  "sidebar.msg5": ["افسانه‌ای! بیش از یک ماه متوالی!", "Legendary! Over a month straight!"],

  // ---------- نوبار ----------
  "navbar.user": ["کاربر", "User"],
  "navbar.search": ["جستجو...", "Search..."],
  "navbar.viewAll": ["مشاهده همه", "View all"],
  "navbar.noMessages": ["هیچ پیامی نیست", "No messages yet"],
  "navbar.subscription": ["زمان باقی مانده اشتراک", "Subscription time left"],
  "navbar.days": ["روز", "days"],
  "navbar.myDashboard": ["داشبورد من", "My Dashboard"],
  "navbar.logout": ["خروج", "Log out"],
  "navbar.langBtnTitle": ["Switch to English", "تغییر زبان به فارسی"],
  "navbar.darkMode": ["حالت تاریک", "Dark mode"],
  "navbar.lightMode": ["حالت روشن", "Light mode"],

  // ---------- لودر یکپارچه ----------
  "loader.loading": ["در حال بارگذاری...", "Loading..."],

  // ---------- داشبورد ----------
  "dashboard.title": ["داشبورد", "Dashboard"],
  "dashboard.sub": ["خلاصه عملکرد و تنظیمات حساب کاربری", "Your performance overview and account settings"],

  // ---------- تمرین‌ها ----------
  "training.title": ["تمرین‌ها", "Practice"],
  "training.sub": ["هر روز کمی تمرین — شنیداری، گرامر و نوشتن", "A little practice every day — listening, grammar and writing"],
  "training.back": ["بازگشت", "Back"],
  "training.listening.title": ["تمرین شنیداری", "Listening Practice"],
  "training.listening.sub": ["گوش بده و جاهای خالی را با کلمه‌ای که می‌شنوی پر کن", "Listen and fill in the blanks with the words you hear"],
  "training.grammar.title": ["تمرین گرامری", "Grammar Practice"],
  "training.grammar.sub": ["مجموعه — هر کدام ۱۰ سؤال از مبتدی تا پیشرفته", "sets — 10 questions each, from beginner to advanced"],
  "training.writing.title": ["تمرین نوشتاری", "Writing Practice"],
  "training.writing.sub": ["متنی کوتاه بنویس و هوش مصنوعی آن را اصلاح می‌کند", "Write a short text and AI will correct it"],

  // کارت‌های هاب تمرین‌ها
  "training.listening.sub2": ["پادکست‌ها گوش بده و جاهای خالی را پر کن", "Listen to podcasts and fill in the blanks"],
  "training.grammar.sub2": ["۱۵ مجموعه از مبتدی تا پیشرفته با کوئیز", "15 sets from beginner to advanced with quizzes"],
  "training.writing.sub2": ["بنویس و با هوش مصنوعی اصلاحش کن", "Write and let AI correct it"],
  "training.guide": [
    "هر تمرین شنیداری حدود ۵ تا ۷ دقیقه وقت می‌برد، هر مجموعه گرامری ۱۰ سؤال کوتاه دارد و در نوشتاری متنِ حداکثر ۲۰۰ کلمه‌ای می‌نویسی و هوش مصنوعی آن را برایت اصلاح می‌کند. ستاره‌ها بر اساس بهترین نتیجه تو ذخیره می‌شوند — ۸۰٪ به بالا سه ستاره، ۶۰٪ دو ستاره و ۴۰٪ یک ستاره.",
    "Each listening practice takes about 5-7 minutes, each grammar set has 10 short questions, and in writing you write a text of up to 200 words and AI corrects it for you. Stars are saved based on your best result — 80%+ is three stars, 60% two stars and 40% one star.",
  ],
  "training.backToDashboard": ["بازگشت به داشبورد", "Back to dashboard"],
  "common.items": ["آیتم", "items"],

  // ---------- کتابخانه ----------
  "library.title": ["📚 کتابخانه", "📚 Library"],
  "library.sub": ["کتاب‌های داستان انگلیسی برای تقویت مهارت خواندن", "English story books to boost your reading skills"],
  "library.read": ["مطالعه کتاب", "Read book"],
  "library.pages": ["صفحه", "pages"],
  "library.empty": ["هنوز کتابی اضافه نشده", "No books have been added yet"],

  // ---------- لغت‌نامه ----------
  "vocab.title": ["لغت‌نامه", "Vocabulary"],
  "vocab.sub": [
    "روی هر کلمه انگلیسی سایت هاور کن تا ترجمه و «جعبه لغت» باز شود — کلمه‌های اینجا جمع می‌شوند",
    "Hover any English word to open its translation and word box — your words collect here",
  ],
  "vocab.newBox": ["جعبه جدید", "New Box"],

  // ---------- دوره‌های من ----------
  "courses.title": ["دوره‌های من", "My Courses"],
  "courses.sub": ["مسیر یادگیری خود را انتخاب کن", "Choose your learning path"],
  "courses.count": ["دوره", "courses"],
  "courses.caption": ["چشم‌هایم به موس توست — بیا یاد بگیریم!", "My eyes follow your mouse — let's learn!"],

  // ---------- بازی‌ها ----------
  "games.title": ["بازی‌ها", "Games"],
  "games.sub": ["با بازی یاد بگیر — امتیاز بگیر و استریکت رو زنده نگه دار!", "Learn by playing — score points and keep your streak alive!"],
  "games.hangmanDesc": ["حروف را حدس بزن و کلمه را نجات بده! کلمات از A1 تا C1", "Guess the letters and save the word! Words from A1 to C1"],
  "games.memoryDesc": ["کارت‌ها را باز کن و جفت کلمات انگلیسی-فارسی را پیدا کن — از A1 تا C1", "Flip the cards and match English-Persian word pairs — from A1 to C1"],
  "games.quizDesc": ["سریع جواب بده — سوال‌های کلمه و جمله از A1 تا C1", "Answer fast — word and sentence questions from A1 to C1"],
  "games.note1": ["بازی‌های جدید به‌مرور اضافه می‌شوند", "New games are added over time"],
  "games.note2": ["هر بازی که شروع کنی، روز یادگیری‌ات هم ثبت می‌شود", "Every game you start counts as a learning day"],
  "games.caption": ["چشم‌هایم به موس توست — بازی کن!", "My eyes follow your mouse — play!"],
  "games.back": ["بازگشت", "Back"],
  "games.hangman.sub": ["حروف را حدس بزن و کلمه را نجات بده!", "Guess the letters and save the word!"],
  "games.memory.sub": ["کارت‌ها را باز کن و جفت کلمه انگلیسی + معنی فارسی را پیدا کن!", "Flip the cards and match English words with Persian meanings!"],
  "games.speedquiz.sub": ["سریع جواب بده — هر ثانیه که می‌گذره، امتیاز کمتره!", "Answer fast — every second costs you points!"],

  // ---------- پیام‌ها / اعلان‌ها ----------
  "chat.title": ["پیام‌ها", "Messages"],
  "chat.empty": ["این بخش به‌زودی فعال می‌شود — منتظر خبر‌های جدید باش!", "This section is coming soon — stay tuned!"],
  "notif.title": ["اعلان‌ها", "Notifications"],
  "notif.unread": ["عدد خوانده نشده", "unread"],
  "notif.empty": ["هیچ پیامی وجود ندارد.", "You have no notifications."],
};

// ========================================
// عنوان تب مرورگر برای هر مسیر — [فارسی, English]
// طولانی‌ترین پیشوندِ منطبق انتخاب می‌شود تا
// مسیرهای داینامیک (مثلاً /library/3) هم عنوان
// صفحهٔ والد خود را بگیرند.
// ========================================

const PAGE_TITLES: { prefix: string; title: [string, string] }[] = [
  { prefix: "/dashboard", title: ["داشبورد", "Dashboard"] },
  { prefix: "/training/listening", title: ["تمرین شنیداری", "Listening Practice"] },
  { prefix: "/training/grammar", title: ["تمرین گرامری", "Grammar Practice"] },
  { prefix: "/training/writing", title: ["تمرین نوشتاری", "Writing Practice"] },
  { prefix: "/training", title: ["تمرین‌ها", "Practice"] },
  { prefix: "/library", title: ["کتابخانه", "Library"] },
  { prefix: "/vocab", title: ["لغت‌نامه", "Vocabulary"] },
  { prefix: "/courses", title: ["دوره‌های من", "My Courses"] },
  { prefix: "/game/hangman", title: ["حدس کلمه (Hangman)", "Hangman"] },
  { prefix: "/game/memory", title: ["بازی حافظه (Match Card)", "Match Card"] },
  { prefix: "/game/speedquiz", title: ["کوییز سرعتی (Quiz Hot)", "Quiz Hot"] },
  { prefix: "/game", title: ["بازی‌ها", "Games"] },
  { prefix: "/chat", title: ["پیام‌ها", "Messages"] },
  { prefix: "/notif", title: ["اعلان‌ها", "Notifications"] },
  { prefix: "/login", title: ["ورود", "Log in"] },
  { prefix: "/register", title: ["ثبت‌نام", "Sign up"] },
];

const APP_NAME = "Flex English";

/** عنوان کامل تب برای یک مسیر + زبان — به‌صورت «صفحه | Flex English» */
export function pageTitleFor(pathname: string, lang: Lang): string {
  const clean = (pathname || "/").split("?")[0] || "/";
  // طولانی‌ترین پیشوند منطبق
  let best: [string, string] | null = null;
  let bestLen = -1;
  for (const entry of PAGE_TITLES) {
    if (
      (clean === entry.prefix || clean.startsWith(entry.prefix + "/")) &&
      entry.prefix.length > bestLen
    ) {
      best = entry.title;
      bestLen = entry.prefix.length;
    }
  }
  if (!best) return `${APP_NAME} — ${lang === "fa" ? "یادگیری زبان انگلیسی" : "Learn English"}`;
  return `${best[lang === "fa" ? 0 : 1]} | ${APP_NAME}`;
}
