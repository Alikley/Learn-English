// ========================================
// لیست سوال‌های بازی کوییز سرعتی — سطح‌بندی CEFR
// سختی سطح از سختی خودِ کلمه/جمله می‌آید، نه تعداد سوال:
//   EASY   = A1        (پایه)
//   MEDIUM = A2 - B1   (متوسط)
//   HARD   = B2 - C1   (پیشرفته)
// دو نوع سوال:
//   WORD     → کلمه انگلیسی را نشان می‌دهیم، معنی فارسی درست را انتخاب کن
//   SENTENCE → جمله با جای خالی ___ ، کلمه درست را انتخاب کن
// منبع seed دیتابیس + fallback برای API
// ========================================

import type { CefrLevel, GameLevel } from "@/types/game";

export type SpeedQuizWordData = {
  word: string;
  translation: string;
  // ۳ معنی فارسی اشتباه (گزینه‌های انحرافی)
  distractors: string[];
  category: string;
  level: GameLevel;
  cefr: CefrLevel;
};

export type SpeedQuizSentenceData = {
  // جمله شامل جای خالی ___
  sentence: string;
  answer: string;
  // ۳ گزینه انگلیسی اشتباه
  distractors: string[];
  // معنی فارسی کل جمله (راهنمای بعد از پاسخ)
  translation: string;
  category: string;
  level: GameLevel;
  cefr: CefrLevel;
};

export const SPEEDQUIZ_WORDS: SpeedQuizWordData[] = [
  // ================= آسان (A1) =================
  // ---- حیوانات ----
  { word: "cat", translation: "گربه", distractors: ["سگ", "اسب", "موش"], category: "animals", level: "EASY", cefr: "A1" },
  { word: "dog", translation: "سگ", distractors: ["گربه", "خرگوش", "خرس"], category: "animals", level: "EASY", cefr: "A1" },
  { word: "bird", translation: "پرنده", distractors: ["ماهی", "حیوان", "پروانه"], category: "animals", level: "EASY", cefr: "A1" },
  { word: "fish", translation: "ماهی", distractors: ["پرنده", "اردک", "گربه"], category: "animals", level: "EASY", cefr: "A1" },
  { word: "horse", translation: "اسب", distractors: ["گاو", "خر", "شتر"], category: "animals", level: "EASY", cefr: "A1" },

  // ---- خوراکی‌ها ----
  { word: "apple", translation: "سیب", distractors: ["پرتقال", "موز", "انگور"], category: "food", level: "EASY", cefr: "A1" },
  { word: "bread", translation: "نان", distractors: ["برنج", "شیر", "پنیر"], category: "food", level: "EASY", cefr: "A1" },
  { word: "milk", translation: "شیر", distractors: ["آب", "ماست", "چای"], category: "food", level: "EASY", cefr: "A1" },
  { word: "water", translation: "آب", distractors: ["شیر", "چای", "آبمیوه"], category: "food", level: "EASY", cefr: "A1" },
  { word: "rice", translation: "برنج", distractors: ["نان", "گندم", "ذرت"], category: "food", level: "EASY", cefr: "A1" },
  { word: "egg", translation: "تخم‌مرغ", distractors: ["پنیر", "کره", "ماست"], category: "food", level: "EASY", cefr: "A1" },
  { word: "tea", translation: "چای", distractors: ["قهوه", "شیر", "آب"], category: "food", level: "EASY", cefr: "A1" },

  // ---- مدرسه ----
  { word: "book", translation: "کتاب", distractors: ["دفتر", "قلم", "مداد"], category: "school", level: "EASY", cefr: "A1" },
  { word: "pen", translation: "قلم", distractors: ["مداد", "کتاب", "خط‌کش"], category: "school", level: "EASY", cefr: "A1" },
  { word: "school", translation: "مدرسه", distractors: ["کتابخانه", "کلاس", "دانشگاه"], category: "school", level: "EASY", cefr: "A1" },
  { word: "teacher", translation: "معلم", distractors: ["دانش‌آموز", "مدیر", "نگهبان"], category: "school", level: "EASY", cefr: "A1" },
  { word: "student", translation: "دانش‌آموز", distractors: ["معلم", "مدیر", "پرستار"], category: "school", level: "EASY", cefr: "A1" },

  // ---- رنگ‌ها ----
  { word: "red", translation: "قرمز", distractors: ["آبی", "سبز", "زرد"], category: "colors", level: "EASY", cefr: "A1" },
  { word: "blue", translation: "آبی", distractors: ["قرمز", "سبز", "سیاه"], category: "colors", level: "EASY", cefr: "A1" },
  { word: "green", translation: "سبز", distractors: ["زرد", "آبی", "سفید"], category: "colors", level: "EASY", cefr: "A1" },
  { word: "black", translation: "سیاه", distractors: ["سفید", "خاکستری", "قهوه‌ای"], category: "colors", level: "EASY", cefr: "A1" },
  { word: "white", translation: "سفید", distractors: ["سیاه", "نارنجی", "صورتی"], category: "colors", level: "EASY", cefr: "A1" },

  // ---- خانواده ----
  { word: "mother", translation: "مادر", distractors: ["پدر", "خواهر", "عمه"], category: "family", level: "EASY", cefr: "A1" },
  { word: "father", translation: "پدر", distractors: ["مادر", "برادر", "عمو"], category: "family", level: "EASY", cefr: "A1" },
  { word: "sister", translation: "خواهر", distractors: ["برادر", "مادر", "دختر"], category: "family", level: "EASY", cefr: "A1" },
  { word: "brother", translation: "برادر", distractors: ["خواهر", "پدر", "پسر"], category: "family", level: "EASY", cefr: "A1" },

  // ---- خانه ----
  { word: "house", translation: "خانه", distractors: ["اتاق", "ساختمان", "مغازه"], category: "house", level: "EASY", cefr: "A1" },
  { word: "door", translation: "در", distractors: ["پنجره", "دیوار", "کلید"], category: "house", level: "EASY", cefr: "A1" },
  { word: "window", translation: "پنجره", distractors: ["در", "دیوار", "پرده"], category: "house", level: "EASY", cefr: "A1" },
  { word: "room", translation: "اتاق", distractors: ["خانه", "آشپزخانه", "راهرو"], category: "house", level: "EASY", cefr: "A1" },
  { word: "bed", translation: "تخت", distractors: ["صندلی", "میز", "بالش"], category: "house", level: "EASY", cefr: "A1" },
  { word: "chair", translation: "صندلی", distractors: ["میز", "تخت", "نیمکت"], category: "house", level: "EASY", cefr: "A1" },

  // ---- طبیعت و آب و هوا ----
  { word: "sun", translation: "خورشید", distractors: ["ماه", "ستاره", "ابر"], category: "nature", level: "EASY", cefr: "A1" },
  { word: "moon", translation: "ماه", distractors: ["خورشید", "ستاره", "آسمان"], category: "nature", level: "EASY", cefr: "A1" },
  { word: "rain", translation: "باران", distractors: ["برف", "باد", "آفتاب"], category: "weather", level: "EASY", cefr: "A1" },
  { word: "snow", translation: "برف", distractors: ["باران", "توفان", "شبنم"], category: "weather", level: "EASY", cefr: "A1" },
  { word: "hot", translation: "داغ", distractors: ["سرد", "خنک", "یخ‌زده"], category: "weather", level: "EASY", cefr: "A1" },
  { word: "cold", translation: "سرد", distractors: ["داغ", "گرم", "آفتابی"], category: "weather", level: "EASY", cefr: "A1" },

  // ---- عمومی و احساسات ----
  { word: "big", translation: "بزرگ", distractors: ["کوچک", "متوسط", "بلند"], category: "general", level: "EASY", cefr: "A1" },
  { word: "small", translation: "کوچک", distractors: ["بزرگ", "ریز", "کوتاه"], category: "general", level: "EASY", cefr: "A1" },
  { word: "happy", translation: "خوشحال", distractors: ["غمگین", "عصبانی", "خسته"], category: "feelings", level: "EASY", cefr: "A1" },
  { word: "sad", translation: "غمگین", distractors: ["خوشحال", "مضطرب", "خسته"], category: "feelings", level: "EASY", cefr: "A1" },

  // ---- افعال پایه ----
  { word: "run", translation: "دویدن", distractors: ["راه رفتن", "پریدن", "نشستن"], category: "verbs", level: "EASY", cefr: "A1" },
  { word: "eat", translation: "خوردن", distractors: ["نوشیدن", "پختن", "جویدن"], category: "verbs", level: "EASY", cefr: "A1" },
  { word: "sleep", translation: "خوابیدن", distractors: ["بیدار شدن", "استراحت کردن", "خمیازه کشیدن"], category: "verbs", level: "EASY", cefr: "A1" },
  { word: "read", translation: "خواندن", distractors: ["نوشتن", "گفتن", "شنیدن"], category: "verbs", level: "EASY", cefr: "A1" },
  { word: "write", translation: "نوشتن", distractors: ["خواندن", "کشیدن", "ترجمه کردن"], category: "verbs", level: "EASY", cefr: "A1" },

  // ================= متوسط (A2 - B1) =================
  // ---- خانه و زندگی روزمره ----
  { word: "kitchen", translation: "آشپزخانه", distractors: ["اتاق خواب", "حمام", "راهرو"], category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "weather", translation: "آب و هوا", distractors: ["دما", "فصل", "اقلیم"], category: "weather", level: "MEDIUM", cefr: "A2" },
  { word: "crowded", translation: "شلوغ", distractors: ["خالی", "ساکت", "خلوت"], category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "quiet", translation: "ساکت", distractors: ["پرسروصدا", "شلوغ", "پرحرف"], category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "traffic", translation: "ترافیک", distractors: ["جاده", "تصادف", "سرعت"], category: "general", level: "MEDIUM", cefr: "A2" },

  // ---- سلامت ----
  { word: "healthy", translation: "سالم", distractors: ["بیمار", "خسته", "ضعیف"], category: "health", level: "MEDIUM", cefr: "A2" },
  { word: "medicine", translation: "دارو", distractors: ["درمان", "بیمار", "عمل جراحی"], category: "health", level: "MEDIUM", cefr: "A2" },
  { word: "exercise", translation: "ورزش کردن", distractors: ["استراحت کردن", "غذا خوردن", "خوابیدن"], category: "health", level: "MEDIUM", cefr: "A2" },

  // ---- خرید ----
  { word: "expensive", translation: "گران", distractors: ["ارزان", "رایگان", "اقتصادی"], category: "shopping", level: "MEDIUM", cefr: "A2" },
  { word: "cheap", translation: "ارزان", distractors: ["گران", "لوکس", "گران‌قیمت"], category: "shopping", level: "MEDIUM", cefr: "A2" },
  { word: "market", translation: "بازار", distractors: ["فروشگاه", "مغازه", "مرکز خرید"], category: "shopping", level: "MEDIUM", cefr: "A2" },
  { word: "price", translation: "قیمت", distractors: ["تخفیف", "ارزش", "قبض"], category: "shopping", level: "MEDIUM", cefr: "A2" },

  // ---- سفر ----
  { word: "airport", translation: "فرودگاه", distractors: ["ایستگاه", "بندر", "پارکینگ"], category: "travel", level: "MEDIUM", cefr: "A2" },
  { word: "luggage", translation: "بار و چمدان", distractors: ["بلیط", "گذرنامه", "کارت پرواز"], category: "travel", level: "MEDIUM", cefr: "A2" },
  { word: "journey", translation: "سفر طولانی", distractors: ["گشت کوتاه", "مقصد", "مسافر"], category: "travel", level: "MEDIUM", cefr: "B1" },
  { word: "ticket", translation: "بلیط", distractors: ["گذرنامه", "ویزا", "کارت"], category: "travel", level: "MEDIUM", cefr: "A2" },

  // ---- کار ----
  { word: "meeting", translation: "جلسه", distractors: ["قرار", "مهمانی", "مصاحبه"], category: "work", level: "MEDIUM", cefr: "A2" },
  { word: "salary", translation: "حقوق", distractors: ["پاداش", "بدهی", "حساب بانکی"], category: "work", level: "MEDIUM", cefr: "A2" },
  { word: "manager", translation: "مدیر", distractors: ["کارمند", "کارگر", "کارآفرین"], category: "work", level: "MEDIUM", cefr: "A2" },
  { word: "experience", translation: "تجربه", distractors: ["آموزش", "استعداد", "آزمایش"], category: "work", level: "MEDIUM", cefr: "A2" },

  // ---- احساسات ----
  { word: "lonely", translation: "تنها و دل‌تنگ", distractors: ["شاد", "سرزنده", "هیجان‌زده"], category: "feelings", level: "MEDIUM", cefr: "A2" },
  { word: "nervous", translation: "مضطرب", distractors: ["آرام", "خوشحال", "بی‌خیال"], category: "feelings", level: "MEDIUM", cefr: "A2" },

  // ---- محیط زیست ----
  { word: "pollution", translation: "آلودگی", distractors: ["بازیافت", "محیط زیست", "سم"], category: "environment", level: "MEDIUM", cefr: "B1" },
  { word: "recycle", translation: "بازیافت کردن", distractors: ["آلودن", "دور انداختن", "تولید کردن"], category: "environment", level: "MEDIUM", cefr: "B1" },

  // ---- غذا ----
  { word: "recipe", translation: "دستور پخت", distractors: ["فهرست خرید", "مزه", "وعده غذایی"], category: "food", level: "MEDIUM", cefr: "B1" },
  { word: "delicious", translation: "خوشمزه", distractors: ["بی‌مزه", "تلخ", "ترش"], category: "food", level: "MEDIUM", cefr: "A2" },

  // ---- افعال متوسط ----
  { word: "improve", translation: "بهبود بخشیدن", distractors: ["بدتر کردن", "تکرار کردن", "فراموش کردن"], category: "verbs", level: "MEDIUM", cefr: "A2" },
  { word: "decide", translation: "تصمیم گرفتن", distractors: ["تعویق کردن", "شکستن", "قبول کردن"], category: "verbs", level: "MEDIUM", cefr: "A2" },
  { word: "borrow", translation: "قرض گرفتن", distractors: ["فروختن", "خریدن", "پس دادن"], category: "verbs", level: "MEDIUM", cefr: "A2" },
  { word: "lend", translation: "قرض دادن", distractors: ["گرفتن", "خریدن", "دزدیدن"], category: "verbs", level: "MEDIUM", cefr: "A2" },
  { word: "repair", translation: "تعمیر کردن", distractors: ["خراب کردن", "دور انداختن", "ساختن"], category: "verbs", level: "MEDIUM", cefr: "A2" },

  // ---- عمومی B1 ----
  { word: "achieve", translation: "به دست آوردن", distractors: ["از دست دادن", "تلاش کردن", "رها کردن"], category: "verbs", level: "MEDIUM", cefr: "B1" },
  { word: "opportunity", translation: "فرصت", distractors: ["تهدید", "مشکل", "ریسک"], category: "general", level: "MEDIUM", cefr: "B1" },
  { word: "culture", translation: "فرهنگ", distractors: ["زبان", "سنت", "نژاد"], category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "dangerous", translation: "خطرناک", distractors: ["امن", "بی‌خطر", "آرام"], category: "general", level: "MEDIUM", cefr: "A2" },

  // ================= سخت (B2 - C1) =================
  // ---- افعال پیشرفته ----
  { word: "accomplish", translation: "به سرانجام رساندن", distractors: ["شروع کردن", "رها کردن", "به تأخیر انداختن"], category: "verbs", level: "HARD", cefr: "B2" },
  { word: "assess", translation: "ارزیابی کردن", distractors: ["نادیده گرفتن", "بی‌اهمیت شمردن", "تأیید کردن"], category: "verbs", level: "HARD", cefr: "C1" },
  { word: "emphasize", translation: "تأکید کردن", distractors: ["بی‌توجهی کردن", "خلاصه کردن", "نقل کردن"], category: "verbs", level: "HARD", cefr: "B2" },
  { word: "demonstrate", translation: "نشان دادن", distractors: ["پنهان کردن", "انکار کردن", "فراموش کردن"], category: "verbs", level: "HARD", cefr: "B2" },
  { word: "undermine", translation: "تضعیف کردن", distractors: ["تقویت کردن", "حمایت کردن", "تثبیت کردن"], category: "verbs", level: "HARD", cefr: "C1" },
  { word: "comprehend", translation: "درک کردن", distractors: ["نادیده گرفتن", "بیان کردن", "حفظ کردن"], category: "verbs", level: "HARD", cefr: "C1" },
  { word: "scrutinize", translation: "با دقت بررسی کردن", distractors: ["سریع نگاه کردن", "نادیده گرفتن", "تأیید کردن"], category: "verbs", level: "HARD", cefr: "C1" },

  // ---- ویژگی‌های شخصیتی ----
  { word: "ambitious", translation: "جاه‌طلب", distractors: ["تنبل", "بی‌انگیزه", "محتاط"], category: "character", level: "HARD", cefr: "B2" },
  { word: "reluctant", translation: "بی‌میله", distractors: ["مشتاق", "علاقه‌مند", "هیجان‌زده"], category: "character", level: "HARD", cefr: "B2" },
  { word: "meticulous", translation: "بسیار دقیق و موشکاف", distractors: ["بی‌دقت", "شلخته", "عجول"], category: "character", level: "HARD", cefr: "C1" },
  { word: "resilient", translation: "تاب‌آور", distractors: ["شکننده", "ضعیف", "ناامید"], category: "character", level: "HARD", cefr: "C1" },
  { word: "skeptical", translation: "شکاک", distractors: ["احساساتی", "مطمئن", "بی‌تفاوت"], category: "character", level: "HARD", cefr: "B2" },

  // ---- آکادمیک ----
  { word: "phenomenon", translation: "پدیده", distractors: ["نظریه", "شاخص", "قاعده"], category: "academic", level: "HARD", cefr: "B2" },
  { word: "consequence", translation: "پیامد", distractors: ["دلیل", "هدف", "راه‌حل"], category: "academic", level: "HARD", cefr: "B2" },
  { word: "evidence", translation: "مدرک", distractors: ["شایعه", "حدس", "نظرسنجی"], category: "academic", level: "HARD", cefr: "B2" },
  { word: "hypothesis", translation: "فرضیه", distractors: ["نتیجه‌گیری", "مشاهده", "قانون علمی"], category: "academic", level: "HARD", cefr: "C1" },
  { word: "negligible", translation: "ناچیز", distractors: ["قابل‌توجه", "عظیم", "حیاتی"], category: "academic", level: "HARD", cefr: "C1" },
  { word: "abundant", translation: "فراوان", distractors: ["کم‌یاب", "کمیاب", "ناکافی"], category: "academic", level: "HARD", cefr: "B2" },
  { word: "scarce", translation: "کمیاب", distractors: ["فراوان", "ارزان", "سنگین"], category: "academic", level: "HARD", cefr: "B2" },
  { word: "profound", translation: "عمیق", distractors: ["سطحی", "موقتی", "ساده"], category: "academic", level: "HARD", cefr: "C1" },
  { word: "ambiguous", translation: "مبهم", distractors: ["روشن", "قطعی", "دقیق"], category: "academic", level: "HARD", cefr: "C1" },
  { word: "coherent", translation: "منسجم", distractors: ["پراکنده", "متناقض", "ناقص"], category: "academic", level: "HARD", cefr: "C1" },
  { word: "rigorous", translation: "دقیق و اصولی", distractors: ["سهل‌گیرانه", "شتاب‌زده", "ساده‌انگارانه"], category: "academic", level: "HARD", cefr: "C1" },

  // ---- عمومی پیشرفته ----
  { word: "inevitable", translation: "اجتناب‌ناپذیر", distractors: ["امکان‌پذیر", "نادر", "قابل‌حل"], category: "general", level: "HARD", cefr: "B2" },
  { word: "crucial", translation: "حیاتی و تعیین‌کننده", distractors: ["جزئی", "ثانویه", "بی‌اهمیت"], category: "general", level: "HARD", cefr: "B2" },
  { word: "significant", translation: "قابل‌توجه", distractors: ["ناچیز", "پنهان", "موقتی"], category: "general", level: "HARD", cefr: "B2" },
  { word: "breakthrough", translation: "پیشرفت چشمگیر", distractors: ["شکست", "رکود", "بن‌بست"], category: "general", level: "HARD", cefr: "B2" },
  { word: "dilemma", translation: "دوراهی", distractors: ["راه‌حل", "اتفاق", "مزیت"], category: "general", level: "HARD", cefr: "B2" },
  { word: "sustainable", translation: "پایدار", distractors: ["موقتی", "آلاینده", "پرمصرف"], category: "environment", level: "HARD", cefr: "B2" },
];

export const SPEEDQUIZ_SENTENCES: SpeedQuizSentenceData[] = [
  // ================= آسان (A1) =================
  { sentence: "I ___ a student.", answer: "am", distractors: ["is", "are", "be"], translation: "من یک دانش‌آموز هستم.", category: "verbbe", level: "EASY", cefr: "A1" },
  { sentence: "She ___ tea every morning.", answer: "drinks", distractors: ["drink", "drinking", "drank"], translation: "او هر صبح چای می‌نوشد.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "The cat is ___ the table.", answer: "under", distractors: ["above", "between", "during"], translation: "گربه زیر میز است.", category: "prepositions", level: "EASY", cefr: "A1" },
  { sentence: "We ___ to school by bus.", answer: "go", distractors: ["goes", "going", "went"], translation: "ما با اتوبوس به مدرسه می‌رویم.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "This is ___ apple.", answer: "an", distractors: ["a", "the", "some"], translation: "این یک سیب است.", category: "articles", level: "EASY", cefr: "A1" },
  { sentence: "My brother ___ football on Fridays.", answer: "plays", distractors: ["play", "playing", "played"], translation: "برادرم جمعه‌ها فوتبال بازی می‌کند.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "I have two ___ in my bag.", answer: "books", distractors: ["book", "box", "bookshop"], translation: "من دو کتاب در کیفم دارم.", category: "plurals", level: "EASY", cefr: "A1" },
  { sentence: "The sky is ___ today.", answer: "blue", distractors: ["green", "black", "purple"], translation: "امروز آسمان آبی است.", category: "vocab", level: "EASY", cefr: "A1" },
  { sentence: "She ___ not like coffee.", answer: "does", distractors: ["do", "is", "has"], translation: "او قهوه را دوست ندارد.", category: "negation", level: "EASY", cefr: "A1" },
  { sentence: "___ name is Ali.", answer: "My", distractors: ["Me", "I", "Mine"], translation: "اسم من علی است.", category: "pronouns", level: "EASY", cefr: "A1" },
  { sentence: "Look! The baby ___.", answer: "is sleeping", distractors: ["sleeps", "sleep", "slept"], translation: "نگاه کن! نوزاد خواب است.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "There ___ a book on the desk.", answer: "is", distractors: ["are", "am", "be"], translation: "روی میز یک کتاب هست.", category: "verbbe", level: "EASY", cefr: "A1" },
  { sentence: "I get up ___ seven o'clock.", answer: "at", distractors: ["on", "in", "to"], translation: "من ساعت هفت بیدار می‌شوم.", category: "prepositions", level: "EASY", cefr: "A1" },
  { sentence: "We can ___ very fast.", answer: "run", distractors: ["running", "ran", "runs"], translation: "ما می‌توانیم خیلی سریع بدویم.", category: "modals", level: "EASY", cefr: "A1" },
  { sentence: "Her birthday is ___ May.", answer: "in", distractors: ["at", "on", "by"], translation: "تولد او در ماه مه است.", category: "prepositions", level: "EASY", cefr: "A1" },
  { sentence: "How ___ are you? — I'm ten.", answer: "old", distractors: ["many", "much", "tall"], translation: "چند سالتانه است؟ — ده ساله‌ام.", category: "questions", level: "EASY", cefr: "A1" },
  { sentence: "The dog ___ in the garden now.", answer: "is playing", distractors: ["plays", "play", "played"], translation: "سگ الان در باغ بازی می‌کند.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "I ___ my homework every day.", answer: "do", distractors: ["does", "doing", "did"], translation: "من هر روز تکالیفم را انجام می‌دهم.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "They ___ my friends.", answer: "are", distractors: ["is", "am", "be"], translation: "آن‌ها دوستان من هستند.", category: "verbbe", level: "EASY", cefr: "A1" },
  { sentence: "Please open the ___. It's hot.", answer: "window", distractors: ["door", "book", "bag"], translation: "لطفاً پنجره را باز کن. هوای گرم است.", category: "vocab", level: "EASY", cefr: "A1" },
  { sentence: "My father ___ a car.", answer: "has", distractors: ["have", "is", "does"], translation: "پدرم یک ماشین دارد.", category: "verbbe", level: "EASY", cefr: "A1" },
  { sentence: "I ___ to music every night.", answer: "listen", distractors: ["listens", "listening", "listened"], translation: "من هر شب به موسیقی گوش می‌دهم.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "The sun ___ in the east.", answer: "rises", distractors: ["rise", "rose", "rising"], translation: "خورشید از شرق طلوع می‌کند.", category: "tenses", level: "EASY", cefr: "A1" },
  { sentence: "Can I have ___ water, please?", answer: "some", distractors: ["a", "an", "many"], translation: "می‌توانم کمی آب بگیرم لطفاً؟", category: "quantifiers", level: "EASY", cefr: "A1" },
  { sentence: "We are ___ a film now.", answer: "watching", distractors: ["watch", "watches", "watched"], translation: "ما الان فیلم تماشا می‌کنیم.", category: "tenses", level: "EASY", cefr: "A1" },

  // ================= متوسط (A2 - B1) =================
  { sentence: "If it ___ tomorrow, we will stay home.", answer: "rains", distractors: ["rain", "will rain", "rained"], translation: "اگر فردا باران بیاید، خانه می‌مانیم.", category: "conditionals", level: "MEDIUM", cefr: "A2" },
  { sentence: "I have ___ this movie twice.", answer: "seen", distractors: ["saw", "see", "seeing"], translation: "من این فیلم را دو بار دیده‌ام.", category: "presentperfect", level: "MEDIUM", cefr: "A2" },
  { sentence: "She was reading when I ___.", answer: "arrived", distractors: ["arrive", "arriving", "was arriving"], translation: "او داشت می‌خواند وقتی من رسیدم.", category: "past", level: "MEDIUM", cefr: "A2" },
  { sentence: "You ___ smoke here. It's forbidden.", answer: "must not", distractors: ["don't have to", "couldn't", "might not"], translation: "نباید اینجا سیگار بکشی. ممنوع است.", category: "modals", level: "MEDIUM", cefr: "B1" },
  { sentence: "The letter ___ by my father yesterday.", answer: "was written", distractors: ["wrote", "was writing", "is written"], translation: "نامه دیروز توسط پدرم نوشته شد.", category: "passive", level: "MEDIUM", cefr: "A2" },
  { sentence: "I'm looking forward to ___ you.", answer: "meeting", distractors: ["meet", "met", "have met"], translation: "منتظر دیدارت هستم.", category: "gerund", level: "MEDIUM", cefr: "A2" },
  { sentence: "This is the best film ___ I have ever seen.", answer: "that", distractors: ["what", "who", "whose"], translation: "این بهترین فیلمی است که تا حالا دیده‌ام.", category: "relative", level: "MEDIUM", cefr: "A2" },
  { sentence: "He asked me where I ___ from.", answer: "came", distractors: ["come", "coming", "was coming"], translation: "او پرسید من اهل کجا هستم.", category: "questions", level: "MEDIUM", cefr: "B1" },
  { sentence: "We ___ living here since 2015.", answer: "have been", distractors: ["are", "was", "had been"], translation: "ما از سال ۲۰۱۵ اینجا زندگی می‌کنیم.", category: "presentperfect", level: "MEDIUM", cefr: "B1" },
  { sentence: "If I ___ you, I would apologize.", answer: "were", distractors: ["am", "was", "be"], translation: "اگر جای تو بودم، عذرخواهی می‌کردم.", category: "conditionals", level: "MEDIUM", cefr: "B1" },
  { sentence: "The room ___ cleaned every day.", answer: "is", distractors: ["has", "does", "was being"], translation: "اتاق هر روز تمیز می‌شود.", category: "passive", level: "MEDIUM", cefr: "A2" },
  { sentence: "I used to ___ tea, but now I prefer coffee.", answer: "drink", distractors: ["drinking", "drank", "drunk"], translation: "قبلاً چای می‌نوشیدم، اما الان قهوه را ترجیح می‌دهم.", category: "verbpatterns", level: "MEDIUM", cefr: "A2" },
  { sentence: "She speaks English ___ than her brother.", answer: "better", distractors: ["good", "best", "more good"], translation: "او بهتر از برادرش انگلیسی صحبت می‌کند.", category: "comparison", level: "MEDIUM", cefr: "A2" },
  { sentence: "By the time we arrived, the train ___ left.", answer: "had", distractors: ["has", "have", "was"], translation: "تا وقتی ما رسیدیم، قطار رفته بود.", category: "past", level: "MEDIUM", cefr: "B1" },
  { sentence: "I would rather ___ at home tonight.", answer: "stay", distractors: ["staying", "to stay", "stayed"], translation: "امشب ترجیح می‌دهم خانه بمانم.", category: "verbpatterns", level: "MEDIUM", cefr: "B1" },
  { sentence: "Do you know the woman ___ lives next door?", answer: "who", distractors: ["which", "whose", "whom"], translation: "زنی که در خانه کناری زندگی می‌کند را می‌شناسی؟", category: "relative", level: "MEDIUM", cefr: "A2" },
  { sentence: "He has been working here ___ ten years.", answer: "for", distractors: ["since", "during", "from"], translation: "او ده سال است که اینجا کار می‌کند.", category: "prepositions", level: "MEDIUM", cefr: "A2" },
  { sentence: "My sister is good ___ math.", answer: "at", distractors: ["in", "on", "with"], translation: "خواهرم در ریاضی خوب است.", category: "prepositions", level: "MEDIUM", cefr: "A2" },
  { sentence: "While I ___, the phone rang.", answer: "was cooking", distractors: ["cooked", "cook", "am cooking"], translation: "وقتی داشتم آشپزی می‌کردم، تلفن زنگ خورد.", category: "past", level: "MEDIUM", cefr: "A2" },
  { sentence: "The cake ___ delicious. Who made it?", answer: "tastes", distractors: ["taste", "is taste", "tasting"], translation: "کیک خوشمزه است. چه کسی آن را درست کرد؟", category: "tenses", level: "MEDIUM", cefr: "A2" },
  { sentence: "I wish I ___ more free time.", answer: "had", distractors: ["have", "will have", "would have"], translation: "کاش وقت آزاد بیشتری داشتم.", category: "wish", level: "MEDIUM", cefr: "B1" },
  { sentence: "She apologized ___ being late.", answer: "for", distractors: ["of", "to", "about"], translation: "او به‌خاطر دیر آمدن عذرخواهی کرد.", category: "prepositions", level: "MEDIUM", cefr: "B1" },
  { sentence: "The movie was so ___ that I fell asleep.", answer: "boring", distractors: ["bored", "bore", "boredom"], translation: "فیلم آن‌قدر کسل‌کننده بود که خوابم برد.", category: "vocab", level: "MEDIUM", cefr: "A2" },
  { sentence: "He denied ___ the money.", answer: "stealing", distractors: ["to steal", "steal", "stole"], translation: "او دزدیدن پول را انکار کرد.", category: "gerund", level: "MEDIUM", cefr: "B1" },
  { sentence: "We had our house ___ last month.", answer: "repainted", distractors: ["repaint", "repainting", "to repaint"], translation: "ماه گذشته خانه‌مان را دوباره رنگ‌آمیزی کردیم.", category: "verbpatterns", level: "MEDIUM", cefr: "B1" },

  // ================= سخت (B2 - C1) =================
  { sentence: "Had I known about the meeting, I ___ attended.", answer: "would have", distractors: ["will have", "had", "would"], translation: "اگر از جلسه باخبر بودم، شرکت می‌کردم.", category: "conditionals", level: "HARD", cefr: "C1" },
  { sentence: "Rarely ___ such dedication in young researchers.", answer: "do we see", distractors: ["we see", "we do see", "seen"], translation: "به‌ندرت چنین تعهدی در پژوهشگران جوان دیده می‌شود.", category: "inversion", level: "HARD", cefr: "C1" },
  { sentence: "The findings are consistent ___ previous studies.", answer: "with", distractors: ["to", "of", "for"], translation: "یافته‌ها با مطالعات قبلی سازگارند.", category: "collocations", level: "HARD", cefr: "B2" },
  { sentence: "Not only ___ the deadline, but he also exceeded expectations.", answer: "did he meet", distractors: ["he met", "he did meet", "met"], translation: "نه‌تنها ضرب‌الاجل را رعایت کرد، بلکه از انتظارات هم فراتر رفت.", category: "inversion", level: "HARD", cefr: "C1" },
  { sentence: "She insisted that the report ___ revised before publication.", answer: "be", distractors: ["is", "was", "would be"], translation: "او اصرار داشت گزارش قبل از انتشار بازبینی شود.", category: "subjunctive", level: "HARD", cefr: "C1" },
  { sentence: "___ the heavy traffic, she arrived on time.", answer: "Despite", distractors: ["Although", "However", "Because"], translation: "با وجود ترافیک سنگین، او به‌موقع رسید.", category: "vocab", level: "HARD", cefr: "B2" },
  { sentence: "The evidence suggests that the theory ___ revision.", answer: "requires", distractors: ["require", "is require", "requiring"], translation: "مدرک‌ها نشان می‌دهند نظریه نیازمند بازنگری است.", category: "tenses", level: "HARD", cefr: "B2" },
  { sentence: "Were it not for your help, we ___ failed.", answer: "would have", distractors: ["will have", "had", "would"], translation: "اگر کمک تو نبود، شکست می‌خوردیم.", category: "conditionals", level: "HARD", cefr: "C1" },
  { sentence: "The committee comprises experts ___ various fields.", answer: "from", distractors: ["of", "with", "between"], translation: "کمیته از متخصصانی از حوزه‌های مختلف تشکیل شده است.", category: "prepositions", level: "HARD", cefr: "B2" },
  { sentence: "His argument was so persuasive that everyone was ___.", answer: "convinced", distractors: ["convincing", "convince", "to convince"], translation: "استدلال او چنان متقاعدکننده بود که همه قانع شدند.", category: "vocab", level: "HARD", cefr: "B2" },
  { sentence: "The new regulation will come into ___ next month.", answer: "effect", distractors: ["affect", "effective", "effectively"], translation: "قانون‌نامه جدید ماه آینده اجرایی می‌شود.", category: "vocab", level: "HARD", cefr: "B2" },
  { sentence: "Scientists have long sought to ___ the origins of the universe.", answer: "understand", distractors: ["understanding", "to understand", "understood"], translation: "دانشمندان مدت‌هاست می‌خواهند خاستگاه جهان را درک کنند.", category: "verbpatterns", level: "HARD", cefr: "B2" },
  { sentence: "It is imperative that every applicant ___ the form in full.", answer: "complete", distractors: ["completes", "completing", "completed"], translation: "ضروری است هر متقاضی فرم را کامل تکمیل کند.", category: "subjunctive", level: "HARD", cefr: "C1" },
  { sentence: "The professor's lecture shed ___ on the complex topic.", answer: "light", distractors: ["shadow", "dark", "view"], translation: "سخنرانی استاد پرده از موضوع پیچیده برداشت.", category: "idioms", level: "HARD", cefr: "B2" },
  { sentence: "Hardly had she sat down ___ the phone rang.", answer: "when", distractors: ["than", "that", "then"], translation: "به‌محض اینکه نشست، تلفن زنگ خورد.", category: "inversion", level: "HARD", cefr: "C1" },
  { sentence: "The company is committed to ___ its carbon footprint.", answer: "reducing", distractors: ["reduce", "reduced", "be reduced"], translation: "شرکت متعهد به کاهش ردپای کربنی خود است.", category: "gerund", level: "HARD", cefr: "B2" },
  { sentence: "___ of the budget cuts, the project continued.", answer: "Regardless", distractors: ["Because", "Instead", "In spite"], translation: "به‌رغم کاهش بودجه، پروژه ادامه یافت.", category: "vocab", level: "HARD", cefr: "B2" },
  { sentence: "The results were far ___ satisfactory; in fact, they were disappointing.", answer: "from", distractors: ["of", "away", "beyond"], translation: "نتایج به‌هیچ‌وجه رضایت‌بخش نبودند؛ در واقع ناامیدکننده بودند.", category: "idioms", level: "HARD", cefr: "C1" },
  { sentence: "The government has implemented policies to ___ unemployment.", answer: "reduce", distractors: ["raise", "enlarge", "ignore"], translation: "دولت سیاست‌هایی برای کاهش بیکاری اجرا کرده است.", category: "vocab", level: "HARD", cefr: "B2" },
  { sentence: "The report highlights the ___ of climate change on agriculture.", answer: "impact", distractors: ["benefit", "delay", "cost"], translation: "گزارش اثر تغییرات اقلیم بر کشاورزی را برجسته می‌کند.", category: "vocab", level: "HARD", cefr: "B2" },
];

// ---- برچسب فارسی دسته‌بندی‌ها (کلمه‌ای + جمله‌ای) ----
export const SPEEDQUIZ_CATEGORY_LABELS: Record<string, string> = {
  // دسته‌های کلمه‌ای
  animals: "حیوانات",
  food: "خوراکی‌ها",
  school: "مدرسه",
  colors: "رنگ‌ها",
  family: "خانواده",
  house: "خانه",
  nature: "طبیعت",
  weather: "آب و هوا",
  general: "عمومی",
  feelings: "احساسات",
  verbs: "افعال",
  shopping: "خرید",
  travel: "سفر",
  health: "سلامت",
  work: "کار",
  environment: "محیط زیست",
  character: "شخصیت",
  academic: "آکادمیک",
  // دسته‌های جمله‌ای (گرامر و واژگان در بافت)
  verbbe: "فعل to be",
  tenses: "زمان‌های فعل",
  prepositions: "حروف اضافه",
  articles: "a / an / the",
  plurals: "جمع اسم‌ها",
  negation: "جمله‌های منفی",
  pronouns: "ضمایر",
  questions: "جمله‌های سوالی",
  quantifiers: "some / any / many",
  modals: "افعال وجهی",
  conditionals: "جمله‌های شرطی",
  passive: "مجهول",
  relative: "جمله‌های وصفی",
  gerund: "گراند و مصدر",
  comparison: "درجات مقایسه",
  presentperfect: "حال کامل",
  past: "زمان‌های گذشته",
  wish: "جمله‌های آرزو",
  inversion: "وارونگی",
  subjunctive: "سابجانکتیو",
  idioms: "اصطلاحات",
  collocations: "هم‌نشینی واژه‌ها",
  verbpatterns: "الگوهای فعل",
  vocab: "واژگان در جمله",
};

// ---- دسترسی سطح‌بندی‌شده (برای fallback در API) ----
export function getSpeedQuizWordsByLevel(level: GameLevel): SpeedQuizWordData[] {
  return SPEEDQUIZ_WORDS.filter((w) => w.level === level);
}

export function getSpeedQuizSentencesByLevel(
  level: GameLevel,
): SpeedQuizSentenceData[] {
  return SPEEDQUIZ_SENTENCES.filter((s) => s.level === level);
}
