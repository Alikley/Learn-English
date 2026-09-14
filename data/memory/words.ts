// ========================================
// لیست کلمات بازی حافظه کلمات — سطح‌بندی سه‌گانه
// EASY: ۳-۵ حرف (۶۰) | MEDIUM: ۶-۸ حرف (۶۶) | HARD: ۹+ حرف (۶۱)
// هر کلمه همراه معنی فارسی — منبع seed دیتابیس + fallback برای API
// ========================================

import type { GameLevel } from "@/types/game";

export type MemoryWordData = {
  word: string;
  translation: string;
  category: string;
  level: GameLevel;
};

export const MEMORY_WORDS: MemoryWordData[] = [
  // ================= آسان (۳-۵ حرف) — ۶۰ کلمه =================
  // ---- حیوانات ----
  { word: "cat", translation: "گربه", category: "animals", level: "EASY" },
  { word: "dog", translation: "سگ", category: "animals", level: "EASY" },
  { word: "bird", translation: "پرنده", category: "animals", level: "EASY" },
  { word: "fish", translation: "ماهی", category: "animals", level: "EASY" },
  { word: "horse", translation: "اسب", category: "animals", level: "EASY" },
  { word: "bear", translation: "خرس", category: "animals", level: "EASY" },
  { word: "frog", translation: "قورباغه", category: "animals", level: "EASY" },
  { word: "sheep", translation: "گوسفند", category: "animals", level: "EASY" },
  { word: "duck", translation: "اردک", category: "animals", level: "EASY" },
  { word: "wolf", translation: "گرگ", category: "animals", level: "EASY" },

  // ---- خوراکی‌ها ----
  { word: "tea", translation: "چای", category: "food", level: "EASY" },
  { word: "egg", translation: "تخم‌مرغ", category: "food", level: "EASY" },
  { word: "rice", translation: "برنج", category: "food", level: "EASY" },
  { word: "milk", translation: "شیر", category: "food", level: "EASY" },
  { word: "bread", translation: "نان", category: "food", level: "EASY" },
  { word: "salt", translation: "نمک", category: "food", level: "EASY" },
  { word: "cake", translation: "کیک", category: "food", level: "EASY" },
  { word: "meat", translation: "گوشت", category: "food", level: "EASY" },
  { word: "soup", translation: "سوپ", category: "food", level: "EASY" },
  { word: "fruit", translation: "میوه", category: "food", level: "EASY" },

  // ---- رنگ‌ها ----
  { word: "red", translation: "قرمز", category: "colors", level: "EASY" },
  { word: "blue", translation: "آبی", category: "colors", level: "EASY" },
  { word: "pink", translation: "صورتی", category: "colors", level: "EASY" },
  { word: "green", translation: "سبز", category: "colors", level: "EASY" },
  { word: "black", translation: "سیاه", category: "colors", level: "EASY" },
  { word: "white", translation: "سفید", category: "colors", level: "EASY" },

  // ---- خانواده ----
  { word: "mom", translation: "مادر", category: "family", level: "EASY" },
  { word: "dad", translation: "پدر", category: "family", level: "EASY" },
  { word: "son", translation: "فرزند پسر", category: "family", level: "EASY" },
  { word: "aunt", translation: "خاله یا عمه", category: "family", level: "EASY" },
  { word: "baby", translation: "نوزاد", category: "family", level: "EASY" },
  { word: "girl", translation: "دختر", category: "family", level: "EASY" },

  // ---- مدرسه ----
  { word: "book", translation: "کتاب", category: "school", level: "EASY" },
  { word: "pen", translation: "خودکار", category: "school", level: "EASY" },
  { word: "desk", translation: "میز تحریر", category: "school", level: "EASY" },
  { word: "exam", translation: "امتحان", category: "school", level: "EASY" },
  { word: "page", translation: "صفحه", category: "school", level: "EASY" },

  // ---- طبیعت ----
  { word: "sun", translation: "خورشید", category: "nature", level: "EASY" },
  { word: "rain", translation: "باران", category: "nature", level: "EASY" },
  { word: "snow", translation: "برف", category: "nature", level: "EASY" },
  { word: "tree", translation: "درخت", category: "nature", level: "EASY" },
  { word: "star", translation: "ستاره", category: "nature", level: "EASY" },
  { word: "moon", translation: "ماه", category: "nature", level: "EASY" },
  { word: "fire", translation: "آتش", category: "nature", level: "EASY" },

  // ---- بدن ----
  { word: "eye", translation: "چشم", category: "body", level: "EASY" },
  { word: "ear", translation: "گوش", category: "body", level: "EASY" },
  { word: "arm", translation: "بازو", category: "body", level: "EASY" },
  { word: "hand", translation: "دست", category: "body", level: "EASY" },
  { word: "hair", translation: "مو", category: "body", level: "EASY" },
  { word: "nose", translation: "بینی", category: "body", level: "EASY" },
  { word: "head", translation: "سر", category: "body", level: "EASY" },

  // ---- زمان ----
  { word: "day", translation: "روز", category: "time", level: "EASY" },
  { word: "night", translation: "شب", category: "time", level: "EASY" },
  { word: "week", translation: "هفته", category: "time", level: "EASY" },
  { word: "year", translation: "سال", category: "time", level: "EASY" },
  { word: "hour", translation: "ساعت", category: "time", level: "EASY" },

  // ---- خانه ----
  { word: "door", translation: "در", category: "house", level: "EASY" },
  { word: "key", translation: "کلید", category: "house", level: "EASY" },
  { word: "bed", translation: "تخت", category: "house", level: "EASY" },
  { word: "room", translation: "اتاق", category: "house", level: "EASY" },

  // ================= متوسط (۶-۸ حرف) — ۶۰ کلمه =================
  // ---- حیوانات ----
  { word: "monkey", translation: "میمون", category: "animals", level: "MEDIUM" },
  { word: "rabbit", translation: "خرگوش", category: "animals", level: "MEDIUM" },
  { word: "turtle", translation: "لاک‌پشت", category: "animals", level: "MEDIUM" },
  { word: "parrot", translation: "طوطی", category: "animals", level: "MEDIUM" },
  { word: "giraffe", translation: "زرافه", category: "animals", level: "MEDIUM" },
  { word: "dolphin", translation: "دلفین", category: "animals", level: "MEDIUM" },
  { word: "penguin", translation: "پنگوئن", category: "animals", level: "MEDIUM" },
  { word: "elephant", translation: "فیل", category: "animals", level: "MEDIUM" },

  // ---- خوراکی‌ها ----
  { word: "cheese", translation: "پنیر", category: "food", level: "MEDIUM" },
  { word: "butter", translation: "کره", category: "food", level: "MEDIUM" },
  { word: "coffee", translation: "قهوه", category: "food", level: "MEDIUM" },
  { word: "pepper", translation: "فلفل", category: "food", level: "MEDIUM" },
  { word: "orange", translation: "پرتقال", category: "food", level: "MEDIUM" },
  { word: "banana", translation: "موز", category: "food", level: "MEDIUM" },
  { word: "yogurt", translation: "ماست", category: "food", level: "MEDIUM" },
  { word: "popcorn", translation: "پاپ‌کورن", category: "food", level: "MEDIUM" },
  { word: "sandwich", translation: "ساندویچ", category: "food", level: "MEDIUM" },
  { word: "tomorrow", translation: "فردا", category: "time", level: "MEDIUM" },

  // ---- رنگ‌ها ----
  { word: "purple", translation: "بنفش", category: "colors", level: "MEDIUM" },
  { word: "yellow", translation: "زرد", category: "colors", level: "MEDIUM" },
  { word: "silver", translation: "نقره‌ای", category: "colors", level: "MEDIUM" },
  { word: "golden", translation: "طلایی", category: "colors", level: "MEDIUM" },

  // ---- خانواده ----
  { word: "parent", translation: "والدین", category: "family", level: "MEDIUM" },
  { word: "sister", translation: "خواهر", category: "family", level: "MEDIUM" },
  { word: "brother", translation: "برادر", category: "family", level: "MEDIUM" },
  { word: "cousin", translation: "پسرعمو", category: "family", level: "MEDIUM" },
  { word: "family", translation: "خانواده", category: "family", level: "MEDIUM" },

  // ---- مدرسه ----
  { word: "pencil", translation: "مداد", category: "school", level: "MEDIUM" },
  { word: "eraser", translation: "پاک‌کن", category: "school", level: "MEDIUM" },
  { word: "student", translation: "دانش‌آموز", category: "school", level: "MEDIUM" },
  { word: "teacher", translation: "معلم", category: "school", level: "MEDIUM" },
  { word: "history", translation: "تاریخ", category: "school", level: "MEDIUM" },
  { word: "science", translation: "علوم", category: "school", level: "MEDIUM" },

  // ---- طبیعت ----
  { word: "flower", translation: "گل", category: "nature", level: "MEDIUM" },
  { word: "forest", translation: "جنگل", category: "nature", level: "MEDIUM" },
  { word: "desert", translation: "بیابان", category: "nature", level: "MEDIUM" },
  { word: "island", translation: "جزیره", category: "nature", level: "MEDIUM" },
  { word: "mountain", translation: "کوه", category: "nature", level: "MEDIUM" },
  { word: "rainbow", translation: "رنگین‌کمان", category: "nature", level: "MEDIUM" },
  { word: "volcano", translation: "آتشفشان", category: "nature", level: "MEDIUM" },

  // ---- بدن ----
  { word: "finger", translation: "انگشت", category: "body", level: "MEDIUM" },
  { word: "shoulder", translation: "شانه", category: "body", level: "MEDIUM" },
  { word: "stomach", translation: "شکم", category: "body", level: "MEDIUM" },
  { word: "eyebrow", translation: "ابرو", category: "body", level: "MEDIUM" },
  { word: "forehead", translation: "پیشانی", category: "body", level: "MEDIUM" },

  // ---- شغل‌ها ----
  { word: "doctor", translation: "پزشک", category: "jobs", level: "MEDIUM" },
  { word: "driver", translation: "راننده", category: "jobs", level: "MEDIUM" },
  { word: "farmer", translation: "کشاورز", category: "jobs", level: "MEDIUM" },
  { word: "singer", translation: "خواننده", category: "jobs", level: "MEDIUM" },
  { word: "tailor", translation: "خیاط", category: "jobs", level: "MEDIUM" },
  { word: "dentist", translation: "دندانپزشک", category: "jobs", level: "MEDIUM" },
  { word: "plumber", translation: "لوله‌کش", category: "jobs", level: "MEDIUM" },

  // ---- سفر ----
  { word: "airport", translation: "فرودگاه", category: "travel", level: "MEDIUM" },
  { word: "ticket", translation: "بلیط", category: "travel", level: "MEDIUM" },
  { word: "highway", translation: "بزرگراه", category: "travel", level: "MEDIUM" },
  { word: "museum", translation: "موزه", category: "travel", level: "MEDIUM" },

  // ---- زمان ----
  { word: "morning", translation: "صبح", category: "time", level: "MEDIUM" },
  { word: "evening", translation: "عصر", category: "time", level: "MEDIUM" },
  { word: "weekend", translation: "آخر هفته", category: "time", level: "MEDIUM" },
  { word: "minute", translation: "دقیقه", category: "time", level: "MEDIUM" },
  { word: "calendar", translation: "تقویم", category: "time", level: "MEDIUM" },

  // ---- خانه ----
  { word: "kitchen", translation: "آشپزخانه", category: "house", level: "MEDIUM" },
  { word: "bedroom", translation: "اتاق خواب", category: "house", level: "MEDIUM" },
  { word: "window", translation: "پنجره", category: "house", level: "MEDIUM" },
  { word: "mirror", translation: "آینه", category: "house", level: "MEDIUM" },
  { word: "balcony", translation: "بالکن", category: "house", level: "MEDIUM" },

  // ================= سخت (۹+ حرف) — ۶۰ کلمه =================
  // ---- صفت‌ها و عمومی ----
  { word: "beautiful", translation: "زیبا", category: "general", level: "HARD" },
  { word: "dangerous", translation: "خطرناک", category: "general", level: "HARD" },
  { word: "different", translation: "متفاوت", category: "general", level: "HARD" },
  { word: "important", translation: "مهم", category: "general", level: "HARD" },
  { word: "interesting", translation: "جالب", category: "general", level: "HARD" },
  { word: "wonderful", translation: "شگفت‌انگیز", category: "general", level: "HARD" },
  { word: "difficult", translation: "سخت", category: "general", level: "HARD" },
  { word: "friendship", translation: "دوستی", category: "general", level: "HARD" },
  { word: "basketball", translation: "بسکتبال", category: "general", level: "HARD" },
  { word: "volleyball", translation: "والیبال", category: "general", level: "HARD" },
  { word: "championship", translation: "قهرمانی", category: "general", level: "HARD" },
  { word: "competition", translation: "رقابت", category: "general", level: "HARD" },
  { word: "understanding", translation: "درک", category: "general", level: "HARD" },
  { word: "newspaper", translation: "روزنامه", category: "general", level: "HARD" },

  // ---- زمان ----
  { word: "yesterday", translation: "دیروز", category: "time", level: "HARD" },
  { word: "afternoon", translation: "بعدازظهر", category: "time", level: "HARD" },

  // ---- مدرسه / آموزش ----
  { word: "graduation", translation: "فارغ‌التحصیلی", category: "school", level: "HARD" },
  { word: "knowledge", translation: "دانش", category: "school", level: "HARD" },
  { word: "education", translation: "آموزش", category: "school", level: "HARD" },
  { word: "university", translation: "دانشگاه", category: "school", level: "HARD" },
  { word: "classroom", translation: "کلاس درس", category: "school", level: "HARD" },
  { word: "blackboard", translation: "تخته سیاه", category: "school", level: "HARD" },
  { word: "professor", translation: "پروفسور", category: "school", level: "HARD" },
  { word: "dictionary", translation: "فرهنگ لغت", category: "school", level: "HARD" },

  // ---- خانه / وسایل ----
  { word: "sunglasses", translation: "عینک آفتابی", category: "house", level: "HARD" },
  { word: "toothbrush", translation: "مسواک", category: "house", level: "HARD" },
  { word: "toothpaste", translation: "خمیردندان", category: "house", level: "HARD" },
  { word: "refrigerator", translation: "یخچال", category: "house", level: "HARD" },
  { word: "microwave", translation: "مایکروویو", category: "house", level: "HARD" },
  { word: "dishwasher", translation: "ماشین ظرف‌شویی", category: "house", level: "HARD" },
  { word: "neighborhood", translation: "محله", category: "house", level: "HARD" },

  // ---- تکنولوژی ----
  { word: "television", translation: "تلویزیون", category: "tech", level: "HARD" },
  { word: "telephone", translation: "تلفن", category: "tech", level: "HARD" },
  { word: "technology", translation: "فناوری", category: "tech", level: "HARD" },
  { word: "calculator", translation: "ماشین‌حساب", category: "tech", level: "HARD" },
  { word: "headphones", translation: "هدفون", category: "tech", level: "HARD" },
  { word: "smartphone", translation: "گوشی هوشمند", category: "tech", level: "HARD" },
  { word: "electricity", translation: "برق", category: "tech", level: "HARD" },

  // ---- خوراکی‌ها ----
  { word: "breakfast", translation: "صبحانه", category: "food", level: "HARD" },
  { word: "chocolate", translation: "شکلات", category: "food", level: "HARD" },

  // ---- حیوانات / خانواده ----
  { word: "butterfly", translation: "پروانه", category: "animals", level: "HARD" },
  { word: "crocodile", translation: "کروکودیل", category: "animals", level: "HARD" },
  { word: "grasshopper", translation: "ملخ", category: "animals", level: "HARD" },
  { word: "grandmother", translation: "مادربزرگ", category: "family", level: "HARD" },

  // ---- طبیعت / آب و هوا ----
  { word: "earthquake", translation: "زلزله", category: "nature", level: "HARD" },
  { word: "temperature", translation: "دما", category: "weather", level: "HARD" },
  { word: "lightning", translation: "رعدوبرق", category: "weather", level: "HARD" },
  { word: "waterfall", translation: "آبشار", category: "nature", level: "HARD" },
  { word: "landscape", translation: "منظره", category: "nature", level: "HARD" },

  // ---- شغل‌ها ----
  { word: "architect", translation: "معمار", category: "jobs", level: "HARD" },
  { word: "scientist", translation: "دانشمند", category: "jobs", level: "HARD" },
  { word: "president", translation: "رئیس‌جمهور", category: "jobs", level: "HARD" },
  { word: "journalist", translation: "خبرنگار", category: "jobs", level: "HARD" },
  { word: "astronaut", translation: "فضانورد", category: "jobs", level: "HARD" },

  // ---- سفر ----
  { word: "passenger", translation: "مسافر", category: "travel", level: "HARD" },
  { word: "restaurant", translation: "رستوران", category: "travel", level: "HARD" },
  { word: "adventure", translation: "ماجراجویی", category: "travel", level: "HARD" },

  // ---- جشن‌ها ----
  { word: "fireworks", translation: "آتش‌بازی", category: "celebration", level: "HARD" },
  { word: "anniversary", translation: "سالگرد", category: "celebration", level: "HARD" },
  { word: "invitation", translation: "دعوت‌نامه", category: "celebration", level: "HARD" },
  { word: "celebration", translation: "جشن", category: "celebration", level: "HARD" },
];
