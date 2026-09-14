// ========================================
// لیست کلمات بازی هنگ‌من — سطح‌بندی CEFR
// سختی سطح از سختی خودِ کلمه می‌آید، نه طول/تعداد آن:
//   EASY   = A1        (کلمات پایه)
//   MEDIUM = A2 - B1   (کلمات متوسط)
//   HARD   = B2 - C1   (کلمات پیشرفته)
// منبع seed دیتابیس + fallback برای API
// ========================================

import type { CefrLevel, GameLevel } from "@/types/game";

export type HangmanWordData = {
  word: string;
  hint: string;
  category: string;
  level: GameLevel;
  // سطح CEFR کلمه — مبنای سطح‌بندی
  cefr: CefrLevel;
};

export const HANGMAN_WORDS: HangmanWordData[] = [
  // ================= آسان (A1) =================
  // ---- حیوانات ----
  { word: "cat", hint: "گربه", category: "animals", level: "EASY", cefr: "A1" },
  { word: "dog", hint: "سگ", category: "animals", level: "EASY", cefr: "A1" },
  { word: "bird", hint: "پرنده", category: "animals", level: "EASY", cefr: "A1" },
  { word: "fish", hint: "ماهی", category: "animals", level: "EASY", cefr: "A1" },
  { word: "horse", hint: "اسب", category: "animals", level: "EASY", cefr: "A1" },
  { word: "lion", hint: "پادشاه جنگل", category: "animals", level: "EASY", cefr: "A1" },
  { word: "bear", hint: "خرس", category: "animals", level: "EASY", cefr: "A1" },
  { word: "frog", hint: "قورباغه", category: "animals", level: "EASY", cefr: "A1" },
  { word: "sheep", hint: "گوسفند", category: "animals", level: "EASY", cefr: "A1" },
  { word: "snake", hint: "مار", category: "animals", level: "EASY", cefr: "A1" },
  { word: "rabbit", hint: "خرگوش", category: "animals", level: "EASY", cefr: "A1" },
  { word: "chicken", hint: "مرغ", category: "animals", level: "EASY", cefr: "A1" },

  // ---- خوراکی‌ها ----
  { word: "tea", hint: "چای", category: "food", level: "EASY", cefr: "A1" },
  { word: "egg", hint: "تخم‌مرغ", category: "food", level: "EASY", cefr: "A1" },
  { word: "rice", hint: "برنج", category: "food", level: "EASY", cefr: "A1" },
  { word: "milk", hint: "نوشیدنی سفید رنگ", category: "food", level: "EASY", cefr: "A1" },
  { word: "bread", hint: "نان", category: "food", level: "EASY", cefr: "A1" },
  { word: "salt", hint: "نمک", category: "food", level: "EASY", cefr: "A1" },
  { word: "cake", hint: "کیک تولد", category: "food", level: "EASY", cefr: "A1" },
  { word: "meat", hint: "گوشت", category: "food", level: "EASY", cefr: "A1" },
  { word: "soup", hint: "سوپ", category: "food", level: "EASY", cefr: "A1" },
  { word: "apple", hint: "میوه قرمز یا سبز", category: "food", level: "EASY", cefr: "A1" },
  { word: "cheese", hint: "پنیر", category: "food", level: "EASY", cefr: "A1" },
  { word: "banana", hint: "موز", category: "food", level: "EASY", cefr: "A1" },
  { word: "coffee", hint: "قهوه", category: "food", level: "EASY", cefr: "A1" },
  { word: "orange", hint: "پرتقال یا یک رنگ", category: "food", level: "EASY", cefr: "A1" },
  { word: "butter", hint: "کره حیوانی", category: "food", level: "EASY", cefr: "A1" },
  { word: "dinner", hint: "شام", category: "food", level: "EASY", cefr: "A1" },
  { word: "chocolate", hint: "شکلات", category: "food", level: "EASY", cefr: "A1" },
  { word: "vegetable", hint: "سبزیجات", category: "food", level: "EASY", cefr: "A1" },
  { word: "restaurant", hint: "رستوران", category: "food", level: "EASY", cefr: "A1" },

  // ---- رنگ‌ها ----
  { word: "red", hint: "قرمز", category: "colors", level: "EASY", cefr: "A1" },
  { word: "blue", hint: "آبی", category: "colors", level: "EASY", cefr: "A1" },
  { word: "pink", hint: "صورتی", category: "colors", level: "EASY", cefr: "A1" },
  { word: "green", hint: "سبز", category: "colors", level: "EASY", cefr: "A1" },
  { word: "black", hint: "سیاه", category: "colors", level: "EASY", cefr: "A1" },
  { word: "white", hint: "سفید", category: "colors", level: "EASY", cefr: "A1" },
  { word: "yellow", hint: "زرد", category: "colors", level: "EASY", cefr: "A1" },
  { word: "purple", hint: "بنفش", category: "colors", level: "EASY", cefr: "A1" },
  { word: "brown", hint: "قهوه‌ای", category: "colors", level: "EASY", cefr: "A1" },

  // ---- خانواده ----
  { word: "son", hint: "فرزند پسر", category: "family", level: "EASY", cefr: "A1" },
  { word: "mom", hint: "مادر (محاوره)", category: "family", level: "EASY", cefr: "A1" },
  { word: "dad", hint: "پدر (محاوره)", category: "family", level: "EASY", cefr: "A1" },
  { word: "aunt", hint: "عمه یا خاله", category: "family", level: "EASY", cefr: "A1" },
  { word: "baby", hint: "نوزاد", category: "family", level: "EASY", cefr: "A1" },
  { word: "mother", hint: "مادر", category: "family", level: "EASY", cefr: "A1" },
  { word: "father", hint: "پدر", category: "family", level: "EASY", cefr: "A1" },
  { word: "sister", hint: "خواهر", category: "family", level: "EASY", cefr: "A1" },
  { word: "brother", hint: "برادر", category: "family", level: "EASY", cefr: "A1" },
  { word: "family", hint: "خانواده", category: "family", level: "EASY", cefr: "A1" },
  { word: "daughter", hint: "فرزند دختر", category: "family", level: "EASY", cefr: "A1" },
  { word: "birthday", hint: "روز تولد", category: "family", level: "EASY", cefr: "A1" },

  // ---- مدرسه ----
  { word: "book", hint: "کتاب", category: "school", level: "EASY", cefr: "A1" },
  { word: "pen", hint: "خودکار", category: "school", level: "EASY", cefr: "A1" },
  { word: "desk", hint: "میز تحریر", category: "school", level: "EASY", cefr: "A1" },
  { word: "bag", hint: "کوله‌پشتی", category: "school", level: "EASY", cefr: "A1" },
  { word: "pencil", hint: "مداد", category: "school", level: "EASY", cefr: "A1" },
  { word: "teacher", hint: "معلم", category: "school", level: "EASY", cefr: "A1" },
  { word: "student", hint: "دانش‌آموز", category: "school", level: "EASY", cefr: "A1" },
  { word: "science", hint: "علوم", category: "school", level: "EASY", cefr: "A1" },
  { word: "important", hint: "مهم", category: "school", level: "EASY", cefr: "A1" },

  // ---- طبیعت ----
  { word: "sun", hint: "خورشید", category: "nature", level: "EASY", cefr: "A1" },
  { word: "sea", hint: "دریا", category: "nature", level: "EASY", cefr: "A1" },
  { word: "moon", hint: "ماه در آسمان", category: "nature", level: "EASY", cefr: "A1" },
  { word: "star", hint: "ستاره", category: "nature", level: "EASY", cefr: "A1" },
  { word: "rain", hint: "باران", category: "nature", level: "EASY", cefr: "A1" },
  { word: "snow", hint: "برف", category: "nature", level: "EASY", cefr: "A1" },
  { word: "tree", hint: "درخت", category: "nature", level: "EASY", cefr: "A1" },
  { word: "wind", hint: "باد", category: "nature", level: "EASY", cefr: "A1" },
  { word: "flower", hint: "گل", category: "nature", level: "EASY", cefr: "A1" },
  { word: "river", hint: "رودخانه", category: "nature", level: "EASY", cefr: "A1" },
  { word: "forest", hint: "جنگل", category: "nature", level: "EASY", cefr: "A1" },
  { word: "rainbow", hint: "رنگین‌کمان", category: "nature", level: "EASY", cefr: "A1" },
  { word: "weather", hint: "آب و هوا", category: "nature", level: "EASY", cefr: "A1" },

  // ---- بدن ----
  { word: "eye", hint: "چشم", category: "body", level: "EASY", cefr: "A1" },
  { word: "ear", hint: "گوش", category: "body", level: "EASY", cefr: "A1" },
  { word: "hand", hint: "دست", category: "body", level: "EASY", cefr: "A1" },
  { word: "nose", hint: "بینی", category: "body", level: "EASY", cefr: "A1" },
  { word: "head", hint: "سر", category: "body", level: "EASY", cefr: "A1" },
  { word: "hair", hint: "مو", category: "body", level: "EASY", cefr: "A1" },
  { word: "heart", hint: "قلب", category: "body", level: "EASY", cefr: "A1" },
  { word: "mouth", hint: "دهان", category: "body", level: "EASY", cefr: "A1" },
  { word: "finger", hint: "انگشت", category: "body", level: "EASY", cefr: "A1" },

  // ---- سفر ----
  { word: "map", hint: "نقشه", category: "travel", level: "EASY", cefr: "A1" },
  { word: "car", hint: "خودرو", category: "travel", level: "EASY", cefr: "A1" },
  { word: "bus", hint: "اتوبوس", category: "travel", level: "EASY", cefr: "A1" },
  { word: "ship", hint: "کشتی", category: "travel", level: "EASY", cefr: "A1" },
  { word: "hotel", hint: "هتل", category: "travel", level: "EASY", cefr: "A1" },
  { word: "train", hint: "قطار", category: "travel", level: "EASY", cefr: "A1" },
  { word: "ticket", hint: "بلیط", category: "travel", level: "EASY", cefr: "A1" },
  { word: "camera", hint: "دوربین عکاسی", category: "travel", level: "EASY", cefr: "A1" },
  { word: "airport", hint: "فرودگاه", category: "travel", level: "EASY", cefr: "A1" },
  { word: "holiday", hint: "تعطیلات", category: "travel", level: "EASY", cefr: "A1" },

  // ---- زمان ----
  { word: "day", hint: "روز", category: "time", level: "EASY", cefr: "A1" },
  { word: "year", hint: "سال", category: "time", level: "EASY", cefr: "A1" },
  { word: "night", hint: "شب", category: "time", level: "EASY", cefr: "A1" },
  { word: "week", hint: "هفته", category: "time", level: "EASY", cefr: "A1" },
  { word: "hour", hint: "شصت دقیقه", category: "time", level: "EASY", cefr: "A1" },
  { word: "month", hint: "ماه در تقویم", category: "time", level: "EASY", cefr: "A1" },
  { word: "morning", hint: "صبح", category: "time", level: "EASY", cefr: "A1" },
  { word: "evening", hint: "عصر", category: "time", level: "EASY", cefr: "A1" },
  { word: "weekend", hint: "آخر هفته", category: "time", level: "EASY", cefr: "A1" },

  // ---- لباس ----
  { word: "hat", hint: "کلاه", category: "clothes", level: "EASY", cefr: "A1" },
  { word: "shoe", hint: "کفش", category: "clothes", level: "EASY", cefr: "A1" },
  { word: "coat", hint: "پالتو", category: "clothes", level: "EASY", cefr: "A1" },

  // ---- شغل‌ها ----
  { word: "doctor", hint: "پزشک", category: "jobs", level: "EASY", cefr: "A1" },

  // ---- خانه ----
  { word: "window", hint: "پنجره", category: "house", level: "EASY", cefr: "A1" },
  { word: "kitchen", hint: "آشپزخانه", category: "house", level: "EASY", cefr: "A1" },
  { word: "garden", hint: "باغچه", category: "house", level: "EASY", cefr: "A1" },
  { word: "bedroom", hint: "اتاق خواب", category: "house", level: "EASY", cefr: "A1" },

  // ---- آب و هوا ----
  { word: "sunny", hint: "آفتابی", category: "weather", level: "EASY", cefr: "A1" },
  { word: "cloudy", hint: "ابری", category: "weather", level: "EASY", cefr: "A1" },

  // ================= متوسط (A2 - B1) =================
  // ---- حیوانات ----
  { word: "monkey", hint: "میمون", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "donkey", hint: "الاغ", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "turtle", hint: "لاک‌پشت", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "dolphin", hint: "دلفین", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "giraffe", hint: "زرافه", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "octopus", hint: "هشت‌پا", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "butterfly", hint: "پروانه", category: "animals", level: "MEDIUM", cefr: "A2" },
  { word: "dinosaur", hint: "دایناسور", category: "animals", level: "MEDIUM", cefr: "A2" },

  // ---- خوراکی‌ها ----
  { word: "cookie", hint: "بیسکویت", category: "food", level: "MEDIUM", cefr: "A2" },
  { word: "hamburger", hint: "همبرگر", category: "food", level: "MEDIUM", cefr: "A2" },
  { word: "pineapple", hint: "آناناس", category: "food", level: "MEDIUM", cefr: "A2" },
  { word: "strawberry", hint: "توت‌فرنگی", category: "food", level: "MEDIUM", cefr: "A2" },

  // ---- خانواده ----
  { word: "cousin", hint: "پسر عمو یا دایی", category: "family", level: "MEDIUM", cefr: "A2" },
  { word: "friendship", hint: "دوستی", category: "family", level: "MEDIUM", cefr: "B1" },
  { word: "celebration", hint: "جشن و پایون", category: "family", level: "MEDIUM", cefr: "B1" },

  // ---- مدرسه ----
  { word: "exam", hint: "امتحان", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "eraser", hint: "پاک‌کن", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "lesson", hint: "درس", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "history", hint: "تاریخ", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "geography", hint: "جغرافیا", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "dictionary", hint: "فرهنگ لغت", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "language", hint: "زبان", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "education", hint: "آموزش و پرورش", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "experiment", hint: "آزمایش علمی", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "knowledge", hint: "دانش", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "instrument", hint: "ساز موسیقی", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "librarian", hint: "کتابدار", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "microscope", hint: "میکروسکوپ", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "telescope", hint: "تلسکوپ", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "newspaper", hint: "روزنامه", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "graduation", hint: "فارغ‌التحصیلی", category: "school", level: "MEDIUM", cefr: "B1" },
  { word: "basketball", hint: "ورزش با توپ سبدی", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "playground", hint: "زمین بازی", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "university", hint: "دانشگاه", category: "school", level: "MEDIUM", cefr: "A2" },

  // ---- طبیعت ----
  { word: "island", hint: "جزیره", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "desert", hint: "بیابان", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "volcano", hint: "آتشفشان", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "waterfall", hint: "آبشار", category: "nature", level: "MEDIUM", cefr: "A2" },
  { word: "environment", hint: "محیط زیست", category: "nature", level: "MEDIUM", cefr: "B1" },
  { word: "adventure", hint: "ماجراجویی", category: "nature", level: "MEDIUM", cefr: "A2" },

  // ---- بدن ----
  { word: "brain", hint: "مغز", category: "body", level: "MEDIUM", cefr: "A2" },
  { word: "stomach", hint: "معده", category: "body", level: "MEDIUM", cefr: "B1" },

  // ---- سفر ----
  { word: "luggage", hint: "چمدان", category: "travel", level: "MEDIUM", cefr: "B1" },
  { word: "motorcycle", hint: "موتورسیکلت", category: "travel", level: "MEDIUM", cefr: "A2" },
  { word: "passenger", hint: "مسافر", category: "travel", level: "MEDIUM", cefr: "B1" },

  // ---- شغل‌ها ----
  { word: "nurse", hint: "پرستار", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "driver", hint: "راننده", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "farmer", hint: "کشاورز", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "dentist", hint: "دندانپزشک", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "painter", hint: "نقاش", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "singer", hint: "خواننده", category: "jobs", level: "MEDIUM", cefr: "A2" },
  { word: "scientist", hint: "دانشمند", category: "jobs", level: "MEDIUM", cefr: "B1" },
  { word: "satellite", hint: "ماهواره", category: "jobs", level: "MEDIUM", cefr: "B1" },

  // ---- تکنولوژی ----
  { word: "phone", hint: "تلفن", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "mouse", hint: "ماوس کامپیوتر", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "laptop", hint: "لپ‌تاپ", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "screen", hint: "صفحه نمایش", category: "tech", level: "MEDIUM", cefr: "B1" },
  { word: "printer", hint: "چاپگر", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "website", hint: "وب‌سایت", category: "tech", level: "MEDIUM", cefr: "A2" },
  { word: "internet", hint: "اینترنت", category: "tech", level: "MEDIUM", cefr: "A2" },

  // ---- آب و هوا ----
  { word: "stormy", hint: "طوفانی", category: "weather", level: "MEDIUM", cefr: "A2" },
  { word: "temperature", hint: "دمای هوا", category: "weather", level: "MEDIUM", cefr: "A2" },

  // ---- عمومی ----
  { word: "excellent", hint: "عالی و ممتاز", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "wonderful", hint: "فوق‌العاده", category: "school", level: "MEDIUM", cefr: "A2" },
  { word: "fireworks", hint: "آتش‌بازی", category: "celebration", level: "MEDIUM", cefr: "A2" },

  // ================= سخت (B2 - C1) =================
  // ---- کلمات پیشرفته — سطح B2 ----
  { word: "atmosphere", hint: "جوّ زمین", category: "nature", level: "HARD", cefr: "B2" },
  { word: "generation", hint: "نسل", category: "family", level: "HARD", cefr: "B2" },
  { word: "laughter", hint: "خنده", category: "family", level: "HARD", cefr: "B2" },
  { word: "occupation", hint: "شغل و حرفه", category: "jobs", level: "HARD", cefr: "B2" },
  { word: "orchestra", hint: "ارکستر", category: "school", level: "HARD", cefr: "B2" },
  { word: "parachute", hint: "چتر نجات", category: "travel", level: "HARD", cefr: "B2" },
  { word: "accomplish", hint: "به سرانجام رساندن", category: "general", level: "HARD", cefr: "B2" },
  { word: "achievement", hint: "دستاورد و موفقیت بزرگ", category: "general", level: "HARD", cefr: "B2" },
  { word: "ambitious", hint: "جاه‌طلب و بلندپرواز", category: "general", level: "HARD", cefr: "B2" },
  { word: "appropriate", hint: "مناسب و درست برای موقعیت", category: "general", level: "HARD", cefr: "B2" },
  { word: "circumstance", hint: "شرایط و اوضاع", category: "general", level: "HARD", cefr: "B2" },
  { word: "convince", hint: "کسی را متقاعد کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "cooperate", hint: "همکاری کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "demonstrate", hint: "نشان دادن و اثبات کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "distribute", hint: "توزیع کردن بین مردم", category: "general", level: "HARD", cefr: "B2" },
  { word: "diverse", hint: "متنوع و گوناگون", category: "general", level: "HARD", cefr: "B2" },
  { word: "efficient", hint: "کارآمد و بدون اتلاف", category: "general", level: "HARD", cefr: "B2" },
  { word: "emphasize", hint: "تأکید کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "evaluate", hint: "ارزیابی و سنجش کردن", category: "school", level: "HARD", cefr: "B2" },
  { word: "exaggerate", hint: "بزرگ‌نمایی و غلو کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "genuine", hint: "اصیل و واقعی (نه تقلبی)", category: "general", level: "HARD", cefr: "B2" },
  { word: "ingredient", hint: "ماده اولیه غذا", category: "food", level: "HARD", cefr: "B2" },
  { word: "innovation", hint: "نوآوری", category: "tech", level: "HARD", cefr: "B2" },
  { word: "maintain", hint: "حفظ کردن و نگه داشتن", category: "general", level: "HARD", cefr: "B2" },
  { word: "motivate", hint: "به کسی انگیزه دادن", category: "general", level: "HARD", cefr: "B2" },
  { word: "negotiate", hint: "مذاکره کردن", category: "general", level: "HARD", cefr: "B2" },
  { word: "obstacle", hint: "مانع و سد راه", category: "general", level: "HARD", cefr: "B2" },
  { word: "precise", hint: "دقیق و بی‌خطا", category: "general", level: "HARD", cefr: "B2" },
  { word: "prejudice", hint: "تعصب و پیش‌داوری", category: "general", level: "HARD", cefr: "B2" },
  { word: "priority", hint: "اولویت و اهمیت", category: "general", level: "HARD", cefr: "B2" },
  { word: "remarkable", hint: "چشمگیر و استثنایی", category: "general", level: "HARD", cefr: "B2" },
  { word: "significant", hint: "قابل‌توجه و مهم", category: "general", level: "HARD", cefr: "B2" },
  { word: "sufficient", hint: "کافی و بسنده", category: "general", level: "HARD", cefr: "B2" },
  { word: "summarize", hint: "خلاصه کردن", category: "school", level: "HARD", cefr: "B2" },
  { word: "transform", hint: "دگرگون کردن", category: "general", level: "HARD", cefr: "B2" },

  // ---- کلمات خیلی پیشرفته — سطح C1 ----
  { word: "inevitable", hint: "اجتناب‌ناپذیر", category: "general", level: "HARD", cefr: "C1" },
  { word: "influential", hint: "تأثیرگذار و بانفوذ", category: "general", level: "HARD", cefr: "C1" },
  { word: "insight", hint: "بینش و درک عمیق", category: "general", level: "HARD", cefr: "C1" },
  { word: "phenomenon", hint: "پدیده", category: "nature", level: "HARD", cefr: "C1" },
  { word: "sophisticated", hint: "پیچیده و پیشرفته", category: "tech", level: "HARD", cefr: "C1" },
  { word: "sustainable", hint: "پایدار (محیط زیست)", category: "nature", level: "HARD", cefr: "C1" },
  { word: "versatile", hint: "همه‌فن‌حریف", category: "general", level: "HARD", cefr: "C1" },
  { word: "thorough", hint: "کامل و بی‌نقص", category: "general", level: "HARD", cefr: "C1" },
];
