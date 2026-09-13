// ========================================
// لیست کلمات بازی هنگ‌من
// منبع seed دیتابیس + fallback برای API
// ========================================

export type HangmanWordData = {
  word: string;
  hint: string;
  category: string;
  level: "BEGINNER" | "ELEMENTARY" | "INTERMEDIATE";
};

export const HANGMAN_WORDS: HangmanWordData[] = [
  // ---- حیوانات ----
  { word: "cat", hint: "گربه", category: "animals", level: "BEGINNER" },
  { word: "dog", hint: "سگ", category: "animals", level: "BEGINNER" },
  { word: "bird", hint: "پرنده", category: "animals", level: "BEGINNER" },
  { word: "fish", hint: "ماهی", category: "animals", level: "BEGINNER" },
  { word: "horse", hint: "اسب", category: "animals", level: "BEGINNER" },
  { word: "lion", hint: "پادشاه جنگل", category: "animals", level: "BEGINNER" },
  { word: "bear", hint: "خرس", category: "animals", level: "BEGINNER" },
  { word: "tiger", hint: "ببر", category: "animals", level: "ELEMENTARY" },
  { word: "sheep", hint: "گوسفند", category: "animals", level: "ELEMENTARY" },
  { word: "monkey", hint: "میمون", category: "animals", level: "ELEMENTARY" },
  { word: "rabbit", hint: "خرگوش", category: "animals", level: "ELEMENTARY" },
  { word: "elephant", hint: "فیل", category: "animals", level: "INTERMEDIATE" },

  // ---- خوراکی‌ها ----
  { word: "tea", hint: "چای", category: "food", level: "BEGINNER" },
  { word: "egg", hint: "تخم‌مرغ", category: "food", level: "BEGINNER" },
  { word: "rice", hint: "برنج", category: "food", level: "BEGINNER" },
  { word: "milk", hint: "نوشیدنی سفید رنگ", category: "food", level: "BEGINNER" },
  { word: "bread", hint: "نان", category: "food", level: "BEGINNER" },
  { word: "salt", hint: "نمک", category: "food", level: "BEGINNER" },
  { word: "water", hint: "آب", category: "food", level: "BEGINNER" },
  { word: "apple", hint: "سیب", category: "food", level: "BEGINNER" },
  { word: "sugar", hint: "شکر", category: "food", level: "ELEMENTARY" },
  { word: "cheese", hint: "پنیر", category: "food", level: "ELEMENTARY" },
  { word: "banana", hint: "موز", category: "food", level: "ELEMENTARY" },
  { word: "coffee", hint: "قهوه", category: "food", level: "ELEMENTARY" },

  // ---- رنگ‌ها ----
  { word: "red", hint: "قرمز", category: "colors", level: "BEGINNER" },
  { word: "blue", hint: "آبی", category: "colors", level: "BEGINNER" },
  { word: "pink", hint: "صورتی", category: "colors", level: "BEGINNER" },
  { word: "green", hint: "سبز", category: "colors", level: "BEGINNER" },
  { word: "black", hint: "سیاه", category: "colors", level: "BEGINNER" },
  { word: "white", hint: "سفید", category: "colors", level: "BEGINNER" },
  { word: "yellow", hint: "زرد", category: "colors", level: "BEGINNER" },
  { word: "orange", hint: "نارنجی", category: "colors", level: "ELEMENTARY" },
  { word: "purple", hint: "بنفش", category: "colors", level: "ELEMENTARY" },
  { word: "brown", hint: "قهوه‌ای", category: "colors", level: "ELEMENTARY" },

  // ---- خانواده ----
  { word: "son", hint: "فرزند پسر", category: "family", level: "BEGINNER" },
  { word: "mother", hint: "مادر", category: "family", level: "BEGINNER" },
  { word: "father", hint: "پدر", category: "family", level: "BEGINNER" },
  { word: "sister", hint: "خواهر", category: "family", level: "BEGINNER" },
  { word: "brother", hint: "برادر", category: "family", level: "BEGINNER" },
  { word: "family", hint: "خانواده", category: "family", level: "BEGINNER" },
  { word: "uncle", hint: "عمو یا دایی", category: "family", level: "ELEMENTARY" },
  { word: "daughter", hint: "فرزند دختر", category: "family", level: "ELEMENTARY" },

  // ---- مدرسه ----
  { word: "book", hint: "کتاب", category: "school", level: "BEGINNER" },
  { word: "pen", hint: "خودکار", category: "school", level: "BEGINNER" },
  { word: "ruler", hint: "خط‌کش", category: "school", level: "BEGINNER" },
  { word: "pencil", hint: "مداد", category: "school", level: "BEGINNER" },
  { word: "school", hint: "مدرسه", category: "school", level: "BEGINNER" },
  { word: "eraser", hint: "پاک‌کن", category: "school", level: "ELEMENTARY" },
  { word: "teacher", hint: "معلم", category: "school", level: "ELEMENTARY" },
  { word: "student", hint: "دانش‌آموز", category: "school", level: "ELEMENTARY" },

  // ---- طبیعت ----
  { word: "sun", hint: "خورشید", category: "nature", level: "BEGINNER" },
  { word: "sea", hint: "دریا", category: "nature", level: "BEGINNER" },
  { word: "moon", hint: "ماه در آسمان", category: "nature", level: "BEGINNER" },
  { word: "star", hint: "ستاره", category: "nature", level: "BEGINNER" },
  { word: "rain", hint: "باران", category: "nature", level: "BEGINNER" },
  { word: "snow", hint: "برف", category: "nature", level: "BEGINNER" },
  { word: "tree", hint: "درخت", category: "nature", level: "BEGINNER" },
  { word: "river", hint: "رودخانه", category: "nature", level: "ELEMENTARY" },
  { word: "flower", hint: "گل", category: "nature", level: "ELEMENTARY" },
  { word: "mountain", hint: "کوه", category: "nature", level: "INTERMEDIATE" },

  // ---- بدن ----
  { word: "eye", hint: "چشم", category: "body", level: "BEGINNER" },
  { word: "ear", hint: "گوش", category: "body", level: "BEGINNER" },
  { word: "hand", hint: "دست", category: "body", level: "BEGINNER" },
  { word: "foot", hint: "پا", category: "body", level: "BEGINNER" },
  { word: "nose", hint: "بینی", category: "body", level: "BEGINNER" },
  { word: "head", hint: "سر", category: "body", level: "BEGINNER" },
  { word: "heart", hint: "قلب", category: "body", level: "ELEMENTARY" },
  { word: "mouth", hint: "دهان", category: "body", level: "ELEMENTARY" },

  // ---- سفر ----
  { word: "map", hint: "نقشه", category: "travel", level: "BEGINNER" },
  { word: "car", hint: "خودرو", category: "travel", level: "BEGINNER" },
  { word: "ship", hint: "کشتی", category: "travel", level: "BEGINNER" },
  { word: "hotel", hint: "هتل", category: "travel", level: "ELEMENTARY" },
  { word: "train", hint: "قطار", category: "travel", level: "ELEMENTARY" },
  { word: "ticket", hint: "بلیط", category: "travel", level: "ELEMENTARY" },
  { word: "camera", hint: "دوربین عکاسی", category: "travel", level: "ELEMENTARY" },
  { word: "airplane", hint: "هواپیما", category: "travel", level: "INTERMEDIATE" },

  // ---- زمان ----
  { word: "day", hint: "روز", category: "time", level: "BEGINNER" },
  { word: "year", hint: "سال", category: "time", level: "BEGINNER" },
  { word: "night", hint: "شب", category: "time", level: "BEGINNER" },
  { word: "week", hint: "هفته", category: "time", level: "BEGINNER" },
  { word: "month", hint: "ماه در تقویم", category: "time", level: "ELEMENTARY" },
  { word: "morning", hint: "صبح", category: "time", level: "ELEMENTARY" },
  { word: "evening", hint: "عصر", category: "time", level: "ELEMENTARY" },

  // ---- شغل‌ها ----
  { word: "nurse", hint: "پرستار", category: "jobs", level: "ELEMENTARY" },
  { word: "doctor", hint: "پزشک", category: "jobs", level: "ELEMENTARY" },
  { word: "driver", hint: "راننده", category: "jobs", level: "ELEMENTARY" },
  { word: "farmer", hint: "کشاورز", category: "jobs", level: "ELEMENTARY" },
  { word: "engineer", hint: "مهندس", category: "jobs", level: "INTERMEDIATE" },

  // ---- تکنولوژی ----
  { word: "phone", hint: "تلفن", category: "tech", level: "BEGINNER" },
  { word: "mouse", hint: "ماوس کامپیوتر", category: "tech", level: "ELEMENTARY" },
  { word: "laptop", hint: "لپ‌تاپ", category: "tech", level: "ELEMENTARY" },
  { word: "screen", hint: "صفحه نمایش", category: "tech", level: "ELEMENTARY" },
  { word: "computer", hint: "رایانه", category: "tech", level: "INTERMEDIATE" },
  { word: "keyboard", hint: "صفحه‌کلید", category: "tech", level: "INTERMEDIATE" },
];
