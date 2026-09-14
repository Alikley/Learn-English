// ========================================
// لیست کلمات بازی حافظه کلمات — سطح‌بندی CEFR
// سختی سطح از سختی خودِ کلمه می‌آید، نه تعداد/طول آن:
//   EASY   = A1        (کلمات پایه)
//   MEDIUM = A2 - B1   (کلمات متوسط)
//   HARD   = B2 - C1   (کلمات پیشرفته)
// هر کلمه همراه معنی فارسی — منبع seed دیتابیس + fallback برای API
// ========================================

import type { CefrLevel, GameLevel } from "@/types/game";

export type MemoryWordData = {
  word: string;
  translation: string;
  category: string;
  level: GameLevel;
  // سطح CEFR کلمه — مبنای سطح‌بندی
  cefr: CefrLevel;
};

export const MEMORY_WORDS: MemoryWordData[] = [
  // ================= آسان (A1) =================
  // ---- حیوانات ----
  { word: "cat", translation: "گربه", category: "animals", level: "EASY", cefr: "A1" },
  { word: "dog", translation: "سگ", category: "animals", level: "EASY", cefr: "A1" },
  { word: "bird", translation: "پرنده", category: "animals", level: "EASY", cefr: "A1" },
  { word: "fish", translation: "ماهی", category: "animals", level: "EASY", cefr: "A1" },
  { word: "horse", translation: "اسب", category: "animals", level: "EASY", cefr: "A1" },
  { word: "bear", translation: "خرس", category: "animals", level: "EASY", cefr: "A1" },
  { word: "frog", translation: "قورباغه", category: "animals", level: "EASY", cefr: "A1" },
  { word: "sheep", translation: "گوسفند", category: "animals", level: "EASY", cefr: "A1" },
  { word: "duck", translation: "اردک", category: "animals", level: "EASY", cefr: "A1" },
  { word: "rabbit", translation: "خرگوش", category: "animals", level: "EASY", cefr: "A1" },
  { word: "elephant", translation: "فیل", category: "animals", level: "EASY", cefr: "A1" },
  { word: "crocodile", translation: "کروکودیل", category: "animals", level: "EASY", cefr: "A1" },

  // ---- خوراکی‌ها ----
  { word: "tea", translation: "چای", category: "food", level: "EASY", cefr: "A1" },
  { word: "egg", translation: "تخم‌مرغ", category: "food", level: "EASY", cefr: "A1" },
  { word: "rice", translation: "برنج", category: "food", level: "EASY", cefr: "A1" },
  { word: "milk", translation: "شیر", category: "food", level: "EASY", cefr: "A1" },
  { word: "bread", translation: "نان", category: "food", level: "EASY", cefr: "A1" },
  { word: "salt", translation: "نمک", category: "food", level: "EASY", cefr: "A1" },
  { word: "cake", translation: "کیک", category: "food", level: "EASY", cefr: "A1" },
  { word: "meat", translation: "گوشت", category: "food", level: "EASY", cefr: "A1" },
  { word: "soup", translation: "سوپ", category: "food", level: "EASY", cefr: "A1" },
  { word: "fruit", translation: "میوه", category: "food", level: "EASY", cefr: "A1" },
  { word: "cheese", translation: "پنیر", category: "food", level: "EASY", cefr: "A1" },
  { word: "butter", translation: "کره", category: "food", level: "EASY", cefr: "A1" },
  { word: "coffee", translation: "قهوه", category: "food", level: "EASY", cefr: "A1" },
  { word: "pepper", translation: "فلفل", category: "food", level: "EASY", cefr: "A1" },
  { word: "orange", translation: "پرتقال", category: "food", level: "EASY", cefr: "A1" },
  { word: "banana", translation: "موز", category: "food", level: "EASY", cefr: "A1" },
  { word: "sandwich", translation: "ساندویچ", category: "food", level: "EASY", cefr: "A1" },
  { word: "breakfast", translation: "صبحانه", category: "food", level: "EASY", cefr: "A1" },
  { word: "chocolate", translation: "شکلات", category: "food", level: "EASY", cefr: "A1" },
  { word: "restaurant", translation: "رستوران", category: "food", level: "EASY", cefr: "A1" },

  // ---- رنگ‌ها ----
  { word: "red", translation: "قرمز", category: "colors", level: "EASY", cefr: "A1" },
  { word: "blue", translation: "آبی", category: "colors", level: "EASY", cefr: "A1" },
  { word: "pink", translation: "صورتی", category: "colors", level: "EASY", cefr: "A1" },
  { word: "green", translation: "سبز", category: "colors", level: "EASY", cefr: "A1" },
  { word: "black", translation: "سیاه", category: "colors", level: "EASY", cefr: "A1" },
  { word: "white", translation: "سفید", category: "colors", level: "EASY", cefr: "A1" },
  { word: "yellow", translation: "زرد", category: "colors", level: "EASY", cefr: "A1" },
  { word: "purple", translation: "بنفش", category: "colors", level: "EASY", cefr: "A1" },

  // ---- خانواده ----
  { word: "mom", translation: "مادر", category: "family", level: "EASY", cefr: "A1" },
  { word: "dad", translation: "پدر", category: "family", level: "EASY", cefr: "A1" },
  { word: "son", translation: "فرزند پسر", category: "family", level: "EASY", cefr: "A1" },
  { word: "aunt", translation: "خاله یا عمه", category: "family", level: "EASY", cefr: "A1" },
  { word: "baby", translation: "نوزاد", category: "family", level: "EASY", cefr: "A1" },
  { word: "girl", translation: "دختر", category: "family", level: "EASY", cefr: "A1" },
  { word: "sister", translation: "خواهر", category: "family", level: "EASY", cefr: "A1" },
  { word: "brother", translation: "برادر", category: "family", level: "EASY", cefr: "A1" },
  { word: "family", translation: "خانواده", category: "family", level: "EASY", cefr: "A1" },
  { word: "grandmother", translation: "مادربزرگ", category: "family", level: "EASY", cefr: "A1" },

  // ---- مدرسه ----
  { word: "book", translation: "کتاب", category: "school", level: "EASY", cefr: "A1" },
  { word: "pen", translation: "خودکار", category: "school", level: "EASY", cefr: "A1" },
  { word: "desk", translation: "میز تحریر", category: "school", level: "EASY", cefr: "A1" },
  { word: "page", translation: "صفحه", category: "school", level: "EASY", cefr: "A1" },
  { word: "pencil", translation: "مداد", category: "school", level: "EASY", cefr: "A1" },
  { word: "student", translation: "دانش‌آموز", category: "school", level: "EASY", cefr: "A1" },
  { word: "teacher", translation: "معلم", category: "school", level: "EASY", cefr: "A1" },
  { word: "science", translation: "علوم", category: "school", level: "EASY", cefr: "A1" },
  { word: "classroom", translation: "کلاس درس", category: "school", level: "EASY", cefr: "A1" },

  // ---- طبیعت ----
  { word: "sun", translation: "خورشید", category: "nature", level: "EASY", cefr: "A1" },
  { word: "rain", translation: "باران", category: "nature", level: "EASY", cefr: "A1" },
  { word: "snow", translation: "برف", category: "nature", level: "EASY", cefr: "A1" },
  { word: "tree", translation: "درخت", category: "nature", level: "EASY", cefr: "A1" },
  { word: "star", translation: "ستاره", category: "nature", level: "EASY", cefr: "A1" },
  { word: "moon", translation: "ماه", category: "nature", level: "EASY", cefr: "A1" },
  { word: "fire", translation: "آتش", category: "nature", level: "EASY", cefr: "A1" },
  { word: "flower", translation: "گل", category: "nature", level: "EASY", cefr: "A1" },
  { word: "forest", translation: "جنگل", category: "nature", level: "EASY", cefr: "A1" },
  { word: "mountain", translation: "کوه", category: "nature", level: "EASY", cefr: "A1" },
  { word: "rainbow", translation: "رنگین‌کمان", category: "nature", level: "EASY", cefr: "A1" },

  // ---- بدن ----
  { word: "eye", translation: "چشم", category: "body", level: "EASY", cefr: "A1" },
  { word: "ear", translation: "گوش", category: "body", level: "EASY", cefr: "A1" },
  { word: "arm", translation: "بازو", category: "body", level: "EASY", cefr: "A1" },
  { word: "hand", translation: "دست", category: "body", level: "EASY", cefr: "A1" },
  { word: "hair", translation: "مو", category: "body", level: "EASY", cefr: "A1" },
  { word: "nose", translation: "بینی", category: "body", level: "EASY", cefr: "A1" },
  { word: "head", translation: "سر", category: "body", level: "EASY", cefr: "A1" },
  { word: "finger", translation: "انگشت", category: "body", level: "EASY", cefr: "A1" },

  // ---- زمان ----
  { word: "day", translation: "روز", category: "time", level: "EASY", cefr: "A1" },
  { word: "night", translation: "شب", category: "time", level: "EASY", cefr: "A1" },
  { word: "week", translation: "هفته", category: "time", level: "EASY", cefr: "A1" },
  { word: "year", translation: "سال", category: "time", level: "EASY", cefr: "A1" },
  { word: "hour", translation: "ساعت", category: "time", level: "EASY", cefr: "A1" },
  { word: "morning", translation: "صبح", category: "time", level: "EASY", cefr: "A1" },
  { word: "evening", translation: "عصر", category: "time", level: "EASY", cefr: "A1" },
  { word: "weekend", translation: "آخر هفته", category: "time", level: "EASY", cefr: "A1" },
  { word: "minute", translation: "دقیقه", category: "time", level: "EASY", cefr: "A1" },
  { word: "tomorrow", translation: "فردا", category: "time", level: "EASY", cefr: "A1" },
  { word: "yesterday", translation: "دیروز", category: "time", level: "EASY", cefr: "A1" },
  { word: "afternoon", translation: "بعدازظهر", category: "time", level: "EASY", cefr: "A1" },

  // ---- خانه ----
  { word: "door", translation: "در", category: "house", level: "EASY", cefr: "A1" },
  { word: "key", translation: "کلید", category: "house", level: "EASY", cefr: "A1" },
  { word: "bed", translation: "تخت", category: "house", level: "EASY", cefr: "A1" },
  { word: "room", translation: "اتاق", category: "house", level: "EASY", cefr: "A1" },
  { word: "kitchen", translation: "آشپزخانه", category: "house", level: "EASY", cefr: "A1" },
  { word: "bedroom", translation: "اتاق خواب", category: "house", level: "EASY", cefr: "A1" },
  { word: "window", translation: "پنجره", category: "house", level: "EASY", cefr: "A1" },
  { word: "television", translation: "تلویزیون", category: "house", level: "EASY", cefr: "A1" },

  // ---- شغل‌ها ----
  { word: "doctor", translation: "پزشک", category: "jobs", level: "EASY", cefr: "A1" },

  // ---- سفر ----
  { word: "airport", translation: "فرودگاه", category: "travel", level: "EASY", cefr: "A1" },
  { word: "ticket", translation: "بلیط", category: "travel", level: "EASY", cefr: "A1" },

  // ---- عمومی ----
  { word: "beautiful", translation: "زیبا", category: "general", level: "EASY", cefr: "A1" },
  { word: "different", translation: "متفاوت", category: "general", level: "EASY", cefr: "A1" },
  { word: "important", translation: "مهم", category: "general", level: "EASY", cefr: "A1" },
  { word: "difficult", translation: "سخت", category: "general", level: "EASY", cefr: "A1" },

  // ================= متوسط (A2 - B1) =================
  // ---- حیوانات ----
  { word: "monkey", translation: "میمون", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "turtle", translation: "لاک‌پشت", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "parrot", translation: "طوطی", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "giraffe", translation: "زرافه", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "dolphin", translation: "دلفین", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "penguin", translation: "پنگوئن", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "wolf", translation: "گرگ", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "butterfly", translation: "پروانه", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "grasshopper", translation: "ملخ", category: "animals", level: "MEDIUM", cefr: "B1" },

  // ---- خوراکی‌ها ----
  { word: "yogurt", translation: "ماست", category: "food", level: "MEDIUM", cefr: "A2" },
  { word: "popcorn", translation: "پاپ‌کورن", category: "food", level: "MEDIUM", cefr: "A2" },

  // ---- رنگ‌ها ----
  { word: "silver", translation: "نقره‌ای", category: "colors", level: "MEDIUM", cefr: "A2" },
  { word: "golden", translation: "طلایی", category: "colors", level: "MEDIUM", cefr: "A2" },

  // ---- خانواده ----
  { word: "parent", translation: "والدین", category: "family", level: "MEDIUM", cefr: "A2" },
  { word: "cousin", translation: "پسرعمو", category: "family", level: "MEDIUM", cefr: "A2" },
  { word: "friendship", translation: "دوستی", category: "family", level: "MEDIUM", cefr: "B1" },

  // ---- مدرسه ----
  { word: "exam", translation: "امتحان", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "eraser", translation: "پاک‌کن", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "history", translation: "تاریخ", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "university", translation: "دانشگاه", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "blackboard", translation: "تخته سیاه", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "dictionary", translation: "فرهنگ لغت", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "professor", translation: "پروفسور", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "graduation", translation: "فارغ‌التحصیلی", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "knowledge", translation: "دانش", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "education", translation: "آموزش", category: "school", level: "MEDIUM", cefr: "B1" },

  // ---- طبیعت ----
  { word: "desert", translation: "بیابان", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "island", translation: "جزیره", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "volcano", translation: "آتشفشان", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "waterfall", translation: "آبشار", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "earthquake", translation: "زلزله", category: "nature", level: "MEDIUM", cefr: "B1" },
  { word: "landscape", translation: "منظره", category: "nature", level: "MEDIUM", cefr: "B1" },
  { word: "adventure", translation: "ماجراجویی", category: "nature", level: "MEDIUM", cefr: "A2" },

  // ---- بدن ----
  { word: "shoulder", translation: "شانه", category: "body", level: "MEDIUM", cefr: "A2" },
  { word: "stomach", translation: "شکم", category: "body", level: "MEDIUM", cefr: "A2" },
  { word: "eyebrow", translation: "ابرو", category: "body", level: "MEDIUM", cefr: "B1" },
  { word: "forehead", translation: "پیشانی", category: "body", level: "MEDIUM", cefr: "B1" },

  // ---- شغل‌ها ----
  { word: "driver", translation: "راننده", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "farmer", translation: "کشاورز", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "singer", translation: "خواننده", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "tailor", translation: "خیاط", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "dentist", translation: "دندانپزشک", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "plumber", translation: "لوله‌کش", category: "jobs", level: "MEDIUM", cefr: "B1" },
  { word: "scientist", translation: "دانشمند", category: "jobs", level: "MEDIUM", cefr: "B1" },
  { word: "architect", translation: "معمار", category: "jobs", level: "MEDIUM", cefr: "B1" },
  { word: "journalist", translation: "خبرنگار", category: "jobs", level: "MEDIUM", cefr: "B1" },
  { word: "astronaut", translation: "فضانورد", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "president", translation: "رئیس‌جمهور", category: "jobs", level: "MEDIUM", cefr: "A2" },

  // ---- سفر ----
  { word: "highway", translation: "بزرگراه", category: "travel", level: "MEDIUM", cefr: "A2" },
  { word: "museum", translation: "موزه", category: "travel", level: "MEDIUM", cefr: "A2" },
  { word: "passenger", translation: "مسافر", category: "travel", level: "MEDIUM", cefr: "B1" },

  // ---- زمان ----
  { word: "calendar", translation: "تقویم", category: "time", level: "MEDIUM", cefr: "A2" },

  // ---- خانه / وسایل ----
  { word: "mirror", translation: "آینه", category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "balcony", translation: "بالکن", category: "house", level: "MEDIUM", cefr: "B1" },
  { word: "sunglasses", translation: "عینک آفتابی", category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "toothbrush", translation: "مسواک", category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "toothpaste", translation: "خمیردندان", category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "refrigerator", translation: "یخچال", category: "house", level: "MEDIUM", cefr: "B1" },
  { word: "microwave", translation: "مایکروویو", category: "house", level: "MEDIUM", cefr: "A2" },
  { word: "dishwasher", translation: "ماشین ظرف‌شویی", category: "house", level: "MEDIUM", cefr: "B1" },
  { word: "neighborhood", translation: "محله", category: "house", level: "MEDIUM", cefr: "B1" },

  // ---- تکنولوژی ----
  { word: "telephone", translation: "تلفن", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "calculator", translation: "ماشین‌حساب", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "headphones", translation: "هدفون", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "smartphone", translation: "گوشی هوشمند", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "technology", translation: "فناوری", category: "tech", level: "MEDIUM", cefr: "B1" },
  { word: "electricity", translation: "برق", category: "tech", level: "MEDIUM", cefr: "B1" },

  // ---- آب و هوا ----
  { word: "temperature", translation: "دما", category: "weather", level: "MEDIUM", cefr: "A2" },

  // ---- جشن‌ها ----
  { word: "fireworks", translation: "آتش‌بازی", category: "celebration", level: "MEDIUM", cefr: "A2" },
  { word: "anniversary", translation: "سالگرد", category: "celebration", level: "MEDIUM", cefr: "B1" },
  { word: "invitation", translation: "دعوت‌نامه", category: "celebration", level: "MEDIUM", cefr: "A2" },
  { word: "celebration", translation: "جشن", category: "celebration", level: "MEDIUM", cefr: "B1" },

  // ---- عمومی ----
  { word: "dangerous", translation: "خطرناک", category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "interesting", translation: "جالب", category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "wonderful", translation: "شگفت‌انگیز", category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "basketball", translation: "بسکتبال", category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "volleyball", translation: "والیبال", category: "general", level: "MEDIUM", cefr: "A2" },
  { word: "competition", translation: "رقابت", category: "general", level: "MEDIUM", cefr: "B1" },
  { word: "understanding", translation: "درک", category: "general", level: "MEDIUM", cefr: "B1" },
  { word: "newspaper", translation: "روزنامه", category: "general", level: "MEDIUM", cefr: "B1" },

  // ================= سخت (B2 - C1) =================
  // ---- کلمات پیشرفته — سطح B2 ----
  { word: "championship", translation: "قهرمانی", category: "general", level: "HARD", cefr: "B2" },
  { word: "lightning", translation: "رعدوبرق", category: "weather", level: "HARD", cefr: "B2" },
  { word: "accomplish", translation: "به سرانجام رساندن", category: "general", level: "HARD", cefr: "B2" },
  { word: "achievement", translation: "دستاورد", category: "general", level: "HARD", cefr: "B2" },
  { word: "ambitious", translation: "جاه‌طلب", category: "general", level: "HARD", cefr: "B2" },
  { word: "appropriate", translation: "مناسب", category: "general", level: "HARD", cefr: "B2" },
  { word: "circumstance", translation: "شرایط", category: "general", level: "HARD", cefr: "B2" },
  { word: "convince", translation: "متقاعد کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "demonstrate", translation: "نشان دادن", category: "general", level: "HARD", cefr: "B2" },
  { word: "distribute", translation: "توزیع کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "diverse", translation: "متنوع", category: "general", level: "HARD", cefr: "B2" },
  { word: "efficient", translation: "کارآمد", category: "general", level: "HARD", cefr: "B2" },
  { word: "emphasize", translation: "تأکید کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "evaluate", translation: "ارزیابی کردن", category: "school", level: "HARD", cefr: "B2" },
  { word: "exaggerate", translation: "بزرگ‌نمایی کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "genuine", translation: "اصیل", category: "general", level: "HARD", cefr: "B2" },
  { word: "ingredient", translation: "ماده اولیه", category: "food", level: "HARD", cefr: "B2" },
  { word: "innovation", translation: "نوآوری", category: "tech", level: "HARD", cefr: "B2" },
  { word: "maintain", translation: "حفظ کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "motivate", translation: "انگیزه دادن", category: "general", level: "HARD", cefr: "B2" },
  { word: "negotiate", translation: "مذاکره کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "obstacle", translation: "مانع", category: "general", level: "HARD", cefr: "B2" },
  { word: "precise", translation: "دقیق", category: "general", level: "HARD", cefr: "B2" },
  { word: "prejudice", translation: "تعصب", category: "general", level: "HARD", cefr: "B2" },
  { word: "priority", translation: "اولویت", category: "general", level: "HARD", cefr: "B2" },
  { word: "remarkable", translation: "چشمگیر", category: "general", level: "HARD", cefr: "B2" },
  { word: "significant", translation: "قابل‌توجه", category: "general", level: "HARD", cefr: "B2" },
  { word: "sufficient", translation: "کافی", category: "general", level: "HARD", cefr: "B2" },
  { word: "summarize", translation: "خلاصه کردن", category: "school", level: "HARD", cefr: "B2" },
  { word: "transform", translation: "دگرگون کردن", category: "general", level: "HARD", cefr: "B2" },

  // ---- کلمات خیلی پیشرفته — سطح C1 ----
  { word: "inevitable", translation: "اجتناب‌ناپذیر", category: "general", level: "HARD", cefr: "C1" },
  { word: "influential", translation: "تأثیرگذار", category: "general", level: "HARD", cefr: "C1" },
  { word: "insight", translation: "بینش", category: "general", level: "HARD", cefr: "C1" },
  { word: "phenomenon", translation: "پدیده", category: "nature", level: "HARD", cefr: "C1" },
  { word: "sustainable", translation: "پایدار", category: "nature", level: "HARD", cefr: "C1" },
  { word: "versatile", translation: "همه‌فن‌حریف", category: "general", level: "HARD", cefr: "C1" },
  { word: "thorough", translation: "کامل و جامع", category: "general", level: "HARD", cefr: "C1" },
];
