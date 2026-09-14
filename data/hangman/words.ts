// ========================================
// لیست کلمات بازی هنگ‌من — سطح‌بندی سه‌گانه
// EASY: ۳-۵ حرف | MEDIUM: ۶-۸ حرف | HARD: ۹+ حرف
// منبع seed دیتابیس + fallback برای API
// ========================================

import type { GameLevel } from "@/types/game";

export type HangmanWordData = {
  word: string;
  hint: string;
  category: string;
  level: GameLevel;
};

export const HANGMAN_WORDS: HangmanWordData[] = [
  // ================= آسان (۳-۵ حرف) =================
  // ---- حیوانات ----
  { word: "cat", hint: "گربه", category: "animals", level: "EASY" },
  { word: "dog", hint: "سگ", category: "animals", level: "EASY" },
  { word: "bird", hint: "پرنده", category: "animals", level: "EASY" },
  { word: "fish", hint: "ماهی", category: "animals", level: "EASY" },
  { word: "horse", hint: "اسب", category: "animals", level: "EASY" },
  { word: "lion", hint: "پادشاه جنگل", category: "animals", level: "EASY" },
  { word: "bear", hint: "خرس", category: "animals", level: "EASY" },
  { word: "frog", hint: "قورباغه", category: "animals", level: "EASY" },
  { word: "sheep", hint: "گوسفند", category: "animals", level: "EASY" },
  { word: "snake", hint: "مار", category: "animals", level: "EASY" },

  // ---- خوراکی‌ها ----
  { word: "tea", hint: "چای", category: "food", level: "EASY" },
  { word: "egg", hint: "تخم‌مرغ", category: "food", level: "EASY" },
  { word: "rice", hint: "برنج", category: "food", level: "EASY" },
  { word: "milk", hint: "نوشیدنی سفید رنگ", category: "food", level: "EASY" },
  { word: "bread", hint: "نان", category: "food", level: "EASY" },
  { word: "salt", hint: "نمک", category: "food", level: "EASY" },
  { word: "cake", hint: "کیک تولد", category: "food", level: "EASY" },
  { word: "meat", hint: "گوشت", category: "food", level: "EASY" },
  { word: "soup", hint: "سوپ", category: "food", level: "EASY" },
  { word: "apple", hint: "میوه قرمز یا سبز", category: "food", level: "EASY" },

  // ---- رنگ‌ها ----
  { word: "red", hint: "قرمز", category: "colors", level: "EASY" },
  { word: "blue", hint: "آبی", category: "colors", level: "EASY" },
  { word: "pink", hint: "صورتی", category: "colors", level: "EASY" },
  { word: "green", hint: "سبز", category: "colors", level: "EASY" },
  { word: "black", hint: "سیاه", category: "colors", level: "EASY" },
  { word: "white", hint: "سفید", category: "colors", level: "EASY" },

  // ---- خانواده ----
  { word: "son", hint: "فرزند پسر", category: "family", level: "EASY" },
  { word: "mom", hint: "مادر (محاوره)", category: "family", level: "EASY" },
  { word: "dad", hint: "پدر (محاوره)", category: "family", level: "EASY" },
  { word: "aunt", hint: "عمه یا خاله", category: "family", level: "EASY" },
  { word: "baby", hint: "نوزاد", category: "family", level: "EASY" },

  // ---- مدرسه ----
  { word: "book", hint: "کتاب", category: "school", level: "EASY" },
  { word: "pen", hint: "خودکار", category: "school", level: "EASY" },
  { word: "desk", hint: "میز تحریر", category: "school", level: "EASY" },
  { word: "bag", hint: "کوله‌پشتی", category: "school", level: "EASY" },
  { word: "exam", hint: "امتحان", category: "school", level: "EASY" },

  // ---- طبیعت ----
  { word: "sun", hint: "خورشید", category: "nature", level: "EASY" },
  { word: "sea", hint: "دریا", category: "nature", level: "EASY" },
  { word: "moon", hint: "ماه در آسمان", category: "nature", level: "EASY" },
  { word: "star", hint: "ستاره", category: "nature", level: "EASY" },
  { word: "rain", hint: "باران", category: "nature", level: "EASY" },
  { word: "snow", hint: "برف", category: "nature", level: "EASY" },
  { word: "tree", hint: "درخت", category: "nature", level: "EASY" },
  { word: "wind", hint: "باد", category: "nature", level: "EASY" },

  // ---- بدن ----
  { word: "eye", hint: "چشم", category: "body", level: "EASY" },
  { word: "ear", hint: "گوش", category: "body", level: "EASY" },
  { word: "hand", hint: "دست", category: "body", level: "EASY" },
  { word: "nose", hint: "بینی", category: "body", level: "EASY" },
  { word: "head", hint: "سر", category: "body", level: "EASY" },
  { word: "hair", hint: "مو", category: "body", level: "EASY" },

  // ---- سفر ----
  { word: "map", hint: "نقشه", category: "travel", level: "EASY" },
  { word: "car", hint: "خودرو", category: "travel", level: "EASY" },
  { word: "bus", hint: "اتوبوس", category: "travel", level: "EASY" },
  { word: "ship", hint: "کشتی", category: "travel", level: "EASY" },

  // ---- زمان ----
  { word: "day", hint: "روز", category: "time", level: "EASY" },
  { word: "year", hint: "سال", category: "time", level: "EASY" },
  { word: "night", hint: "شب", category: "time", level: "EASY" },
  { word: "week", hint: "هفته", category: "time", level: "EASY" },
  { word: "hour", hint: "شصت دقیقه", category: "time", level: "EASY" },

  // ---- لباس ----
  { word: "hat", hint: "کلاه", category: "clothes", level: "EASY" },
  { word: "shoe", hint: "کفش", category: "clothes", level: "EASY" },
  { word: "coat", hint: "پالتو", category: "clothes", level: "EASY" },

  // ---- شغل / تکنولوژی ----
  { word: "nurse", hint: "پرستار", category: "jobs", level: "EASY" },
  { word: "phone", hint: "تلفن", category: "tech", level: "EASY" },
  { word: "mouse", hint: "ماوس کامپیوتر", category: "tech", level: "EASY" },

  // ================= متوسط (۶-۸ حرف) =================
  // ---- حیوانات ----
  { word: "monkey", hint: "میمون", category: "animals", level: "MEDIUM" },
  { word: "rabbit", hint: "خرگوش", category: "animals", level: "MEDIUM" },
  { word: "donkey", hint: "الاغ", category: "animals", level: "MEDIUM" },
  { word: "turtle", hint: "لاک‌پشت", category: "animals", level: "MEDIUM" },
  { word: "chicken", hint: "مرغ", category: "animals", level: "MEDIUM" },
  { word: "dolphin", hint: "دلفین", category: "animals", level: "MEDIUM" },
  { word: "giraffe", hint: "زرافه", category: "animals", level: "MEDIUM" },
  { word: "octopus", hint: "هشت‌پا", category: "animals", level: "MEDIUM" },

  // ---- خوراکی‌ها ----
  { word: "cheese", hint: "پنیر", category: "food", level: "MEDIUM" },
  { word: "banana", hint: "موز", category: "food", level: "MEDIUM" },
  { word: "coffee", hint: "قهوه", category: "food", level: "MEDIUM" },
  { word: "orange", hint: "پرتقال یا یک رنگ", category: "food", level: "MEDIUM" },
  { word: "butter", hint: "کره حیوانی", category: "food", level: "MEDIUM" },
  { word: "cookie", hint: "بیسکویت", category: "food", level: "MEDIUM" },
  { word: "dinner", hint: "شام", category: "food", level: "MEDIUM" },

  // ---- رنگ‌ها ----
  { word: "yellow", hint: "زرد", category: "colors", level: "MEDIUM" },
  { word: "purple", hint: "بنفش", category: "colors", level: "MEDIUM" },
  { word: "brown", hint: "قهوه‌ای", category: "colors", level: "MEDIUM" },

  // ---- خانواده ----
  { word: "mother", hint: "مادر", category: "family", level: "MEDIUM" },
  { word: "father", hint: "پدر", category: "family", level: "MEDIUM" },
  { word: "sister", hint: "خواهر", category: "family", level: "MEDIUM" },
  { word: "brother", hint: "برادر", category: "family", level: "MEDIUM" },
  { word: "family", hint: "خانواده", category: "family", level: "MEDIUM" },
  { word: "cousin", hint: "پسر عمو یا دایی", category: "family", level: "MEDIUM" },
  { word: "daughter", hint: "فرزند دختر", category: "family", level: "MEDIUM" },

  // ---- مدرسه ----
  { word: "eraser", hint: "پاک‌کن", category: "school", level: "MEDIUM" },
  { word: "pencil", hint: "مداد", category: "school", level: "MEDIUM" },
  { word: "teacher", hint: "معلم", category: "school", level: "MEDIUM" },
  { word: "student", hint: "دانش‌آموز", category: "school", level: "MEDIUM" },
  { word: "lesson", hint: "درس", category: "school", level: "MEDIUM" },
  { word: "science", hint: "علوم", category: "school", level: "MEDIUM" },
  { word: "history", hint: "تاریخ", category: "school", level: "MEDIUM" },

  // ---- طبیعت ----
  { word: "flower", hint: "گل", category: "nature", level: "MEDIUM" },
  { word: "river", hint: "رودخانه", category: "nature", level: "MEDIUM" },
  { word: "forest", hint: "جنگل", category: "nature", level: "MEDIUM" },
  { word: "island", hint: "جزیره", category: "nature", level: "MEDIUM" },
  { word: "desert", hint: "بیابان", category: "nature", level: "MEDIUM" },
  { word: "rainbow", hint: "رنگین‌کمان", category: "nature", level: "MEDIUM" },
  { word: "volcano", hint: "آتشفشان", category: "nature", level: "MEDIUM" },
  { word: "weather", hint: "آب و هوا", category: "weather", level: "MEDIUM" },

  // ---- بدن ----
  { word: "heart", hint: "قلب", category: "body", level: "MEDIUM" },
  { word: "mouth", hint: "دهان", category: "body", level: "MEDIUM" },
  { word: "brain", hint: "مغز", category: "body", level: "MEDIUM" },
  { word: "finger", hint: "انگشت", category: "body", level: "MEDIUM" },
  { word: "stomach", hint: "معده", category: "body", level: "MEDIUM" },

  // ---- سفر ----
  { word: "hotel", hint: "هتل", category: "travel", level: "MEDIUM" },
  { word: "train", hint: "قطار", category: "travel", level: "MEDIUM" },
  { word: "ticket", hint: "بلیط", category: "travel", level: "MEDIUM" },
  { word: "camera", hint: "دوربین عکاسی", category: "travel", level: "MEDIUM" },
  { word: "airport", hint: "فرودگاه", category: "travel", level: "MEDIUM" },
  { word: "luggage", hint: "چمدان", category: "travel", level: "MEDIUM" },
  { word: "holiday", hint: "تعطیلات", category: "travel", level: "MEDIUM" },

  // ---- زمان ----
  { word: "month", hint: "ماه در تقویم", category: "time", level: "MEDIUM" },
  { word: "morning", hint: "صبح", category: "time", level: "MEDIUM" },
  { word: "evening", hint: "عصر", category: "time", level: "MEDIUM" },
  { word: "weekend", hint: "آخر هفته", category: "time", level: "MEDIUM" },

  // ---- شغل‌ها ----
  { word: "doctor", hint: "پزشک", category: "jobs", level: "MEDIUM" },
  { word: "driver", hint: "راننده", category: "jobs", level: "MEDIUM" },
  { word: "farmer", hint: "کشاورز", category: "jobs", level: "MEDIUM" },
  { word: "dentist", hint: "دندانپزشک", category: "jobs", level: "MEDIUM" },
  { word: "painter", hint: "نقاش", category: "jobs", level: "MEDIUM" },
  { word: "singer", hint: "خواننده", category: "jobs", level: "MEDIUM" },

  // ---- تکنولوژی ----
  { word: "laptop", hint: "لپ‌تاپ", category: "tech", level: "MEDIUM" },
  { word: "screen", hint: "صفحه نمایش", category: "tech", level: "MEDIUM" },
  { word: "printer", hint: "چاپگر", category: "tech", level: "MEDIUM" },
  { word: "website", hint: "وب‌سایت", category: "tech", level: "MEDIUM" },
  { word: "internet", hint: "اینترنت", category: "tech", level: "MEDIUM" },

  // ---- خانه ----
  { word: "window", hint: "پنجره", category: "house", level: "MEDIUM" },
  { word: "kitchen", hint: "آشپزخانه", category: "house", level: "MEDIUM" },
  { word: "garden", hint: "باغچه", category: "house", level: "MEDIUM" },
  { word: "bedroom", hint: "اتاق خواب", category: "house", level: "MEDIUM" },

  // ---- آب و هوا ----
  { word: "sunny", hint: "آفتابی", category: "weather", level: "MEDIUM" },
  { word: "cloudy", hint: "ابری", category: "weather", level: "MEDIUM" },
  { word: "stormy", hint: "طوفانی", category: "weather", level: "MEDIUM" },

  // ================= سخت (۹+ حرف) =================
  { word: "adventure", hint: "ماجراجویی", category: "travel", level: "HARD" },
  { word: "atmosphere", hint: "جوّ زمین", category: "nature", level: "HARD" },
  { word: "basketball", hint: "ورزش با توپ سبدی", category: "school", level: "HARD" },
  { word: "birthday", hint: "روز تولد", category: "time", level: "HARD" },
  { word: "butterfly", hint: "پروانه", category: "animals", level: "HARD" },
  { word: "celebration", hint: "جشن و پایون", category: "family", level: "HARD" },
  { word: "chocolate", hint: "شکلات", category: "food", level: "HARD" },
  { word: "dictionary", hint: "فرهنگ لغت", category: "school", level: "HARD" },
  { word: "dinosaur", hint: "دایناسور", category: "animals", level: "HARD" },
  { word: "education", hint: "آموزش و پرورش", category: "school", level: "HARD" },
  { word: "environment", hint: "محیط زیست", category: "nature", level: "HARD" },
  { word: "excellent", hint: "عالی و ممتاز", category: "school", level: "HARD" },
  { word: "experiment", hint: "آزمایش علمی", category: "school", level: "HARD" },
  { word: "fireworks", hint: "آتش‌بازی", category: "celebration", level: "HARD" },
  { word: "friendship", hint: "دوستی", category: "family", level: "HARD" },
  { word: "generation", hint: "نسل", category: "family", level: "HARD" },
  { word: "geography", hint: "جغرافیا", category: "school", level: "HARD" },
  { word: "graduation", hint: "فارغ‌التحصیلی", category: "school", level: "HARD" },
  { word: "hamburger", hint: "همبرگر", category: "food", level: "HARD" },
  { word: "important", hint: "مهم", category: "school", level: "HARD" },
  { word: "instrument", hint: "ساز موسیقی", category: "school", level: "HARD" },
  { word: "knowledge", hint: "دانش", category: "school", level: "HARD" },
  { word: "language", hint: "زبان", category: "school", level: "HARD" },
  { word: "laughter", hint: "خنده", category: "family", level: "HARD" },
  { word: "librarian", hint: "کتابدار", category: "jobs", level: "HARD" },
  { word: "microscope", hint: "میکروسکوپ", category: "tech", level: "HARD" },
  { word: "motorcycle", hint: "موتورسیکلت", category: "travel", level: "HARD" },
  { word: "newspaper", hint: "روزنامه", category: "school", level: "HARD" },
  { word: "occupation", hint: "شغل و حرفه", category: "jobs", level: "HARD" },
  { word: "orchestra", hint: "ارکستر", category: "school", level: "HARD" },
  { word: "parachute", hint: "چتر نجات", category: "travel", level: "HARD" },
  { word: "pineapple", hint: "آناناس", category: "food", level: "HARD" },
  { word: "playground", hint: "زمین بازی", category: "school", level: "HARD" },
  { word: "restaurant", hint: "رستوران", category: "food", level: "HARD" },
  { word: "satellite", hint: "ماهواره", category: "tech", level: "HARD" },
  { word: "scientist", hint: "دانشمند", category: "jobs", level: "HARD" },
  { word: "strawberry", hint: "توت‌فرنگی", category: "food", level: "HARD" },
  { word: "telescope", hint: "تلسکوپ", category: "tech", level: "HARD" },
  { word: "temperature", hint: "دمای هوا", category: "weather", level: "HARD" },
  { word: "university", hint: "دانشگاه", category: "school", level: "HARD" },
  { word: "vegetable", hint: "سبزیجات", category: "food", level: "HARD" },
  { word: "wonderful", hint: "فوق‌العاده", category: "school", level: "HARD" },
  { word: "waterfall", hint: "آبشار", category: "nature", level: "HARD" },
];
