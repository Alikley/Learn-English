import type { WritingTopic } from "@/types/training";

// ========================================
// ۱۰ موضوع تمرین نوشتاری (نسخه ۱.۰.۱.۴)
// موضوع + دستور کار + واژه‌های کاربردی
// ========================================

export const WRITING_TOPICS: WritingTopic[] = [
  {
    id: "w-1",
    titleEn: "My Best Friend",
    titleFa: "بهترین دوستم",
    prompt:
      "Write about your best friend. Who is he or she? What do you do together? Why is this person special to you?",
    promptFa:
      "درباره بهترین دوستت بنویس: کیست؟ با هم چه کارهایی می‌کنید؟ چرا این شخص برایت خاص است؟",
    usefulWords: [
      { en: "honest", fa: "صادق" },
      { en: "supportive", fa: "حامی" },
      { en: "sense of humor", fa: "شفاعت و طنز" },
      { en: "trust", fa: "اعتماد" },
      { en: "childhood", fa: "کودکی" },
    ],
    icon: "Heart",
    order: 1,
  },
  {
    id: "w-2",
    titleEn: "My Favorite Food",
    titleFa: "غذای مورد علاقه‌ام",
    prompt:
      "Describe your favorite food. What is it made of? When did you first try it? Do you know how to cook it?",
    promptFa:
      "غذای مورد علاقه‌ات را توصیف کن. از چه چیزهایی درست می‌شود؟ اولین بار کِی و کجا امتحانش کردی؟ آیا می‌توانی آن را بپزی؟",
    usefulWords: [
      { en: "delicious", fa: "خوشمزه" },
      { en: "ingredients", fa: "مواد تشکیل‌دهنده" },
      { en: "recipe", fa: "دستور پخت" },
      { en: "spicy", fa: "تند" },
      { en: "traditional", fa: "سنتی" },
    ],
    icon: "UtensilsCrossed",
    order: 2,
  },
  {
    id: "w-3",
    titleEn: "A Memorable Trip",
    titleFa: "سفری فراموش‌نشدنی",
    prompt:
      "Write about a trip you will never forget. Where did you go? What happened? What made it special?",
    promptFa:
      "درباره سفری بنویس که هرگز فراموشش نمی‌کنی. کجا رفتی؟ چه اتفاقی افتاد؟ چه چیزی آن را خاص کرد؟",
    usefulWords: [
      { en: "journey", fa: "سفر" },
      { en: "amazing", fa: "شگفت‌انگیز" },
      { en: "scenery", fa: "منظره" },
      { en: "get lost", fa: "گم شدن" },
      { en: "experience", fa: "تجربه" },
    ],
    icon: "Plane",
    order: 3,
  },
  {
    id: "w-4",
    titleEn: "Technology in My Life",
    titleFa: "فناوری در زندگی من",
    prompt:
      "How has technology changed your daily life? Write about the devices and apps you use and how they help or distract you.",
    promptFa:
      "فناوری چطور زندگی روزمره‌ات را تغییر داده؟ درباره دستگاه‌ها و اپلیکیشن‌هایی که استفاده می‌کنی بنویس و اینکه چطور کمک یا حواس‌پرتی ایجاد می‌کنند.",
    usefulWords: [
      { en: "device", fa: "دستگاه" },
      { en: "convenient", fa: "راحت و در دسترس" },
      { en: "distract", fa: "حواس‌پرتی ایجاد کردن" },
      { en: "screen time", fa: "زمان استفاده از صفحه" },
      { en: "essential", fa: "ضروری" },
    ],
    icon: "Smartphone",
    order: 4,
  },
  {
    id: "w-5",
    titleEn: "My Dream Job",
    titleFa: "شغل رویایی من",
    prompt:
      "What is your dream job? Why do you want it? What skills do you need to get it?",
    promptFa:
      "شغل رویایی‌ات چیست؟ چرا آن را می‌خواهی؟ برای رسیدن به آن به چه مهارت‌هایی نیاز داری؟",
    usefulWords: [
      { en: "career", fa: "مسیر شغلی" },
      { en: "passionate", fa: "شیفته و علاقه‌مند" },
      { en: "skill", fa: "مهارت" },
      { en: "achieve", fa: "به دست آوردن" },
      { en: "salary", fa: "حقوق" },
    ],
    icon: "Briefcase",
    order: 5,
  },
  {
    id: "w-6",
    titleEn: "An Important Decision",
    titleFa: "تصمیم مهمی در زندگی‌ام",
    prompt:
      "Write about an important decision you made. What were your choices? What did you decide? Are you happy with it now?",
    promptFa:
      "درباره تصمیم مهمی که گرفتی بنویس. چه گزینه‌هایی داشتی؟ چه چیزی را انتخاب کردی؟ الان از آن راضی هستی؟",
    usefulWords: [
      { en: "decide", fa: "تصمیم گرفتن" },
      { en: "opportunity", fa: "فرصت" },
      { en: "regret", fa: "پشیمانی" },
      { en: "confident", fa: "مطمئن و با اعتماد" },
      { en: "turning point", fa: "نقطه عطف" },
    ],
    icon: "Scale",
    order: 6,
  },
  {
    id: "w-7",
    titleEn: "My Hometown",
    titleFa: "زادگاه من",
    prompt:
      "Describe your hometown or city. What is it famous for? What do you like and dislike about it?",
    promptFa:
      "زادگاه یا شهرت را توصیف کن. به چه چیزی معروف است؟ چه چیزهایی درباره‌اش دوست داری و چه چیزهایی نه؟",
    usefulWords: [
      { en: "located", fa: "قرار گرفته" },
      { en: "population", fa: "جمعیت" },
      { en: "landmark", fa: "بنای شاخص" },
      { en: "crowded", fa: "شلوغ" },
      { en: "hometown", fa: "زادگاه" },
    ],
    icon: "MapPin",
    order: 7,
  },
  {
    id: "w-8",
    titleEn: "A Book That Changed Me",
    titleFa: "کتابی که مرا تغییر داد",
    prompt:
      "Write about a book that influenced you. What was it about? What did you learn from it? Why do you recommend it?",
    promptFa:
      "درباره کتابی بنویس که روی تو اثر گذاشت. درباره چه بود؟ چه چیزی از آن یاد گرفتی؟ چرا آن را پیشنهاد می‌کنی؟",
    usefulWords: [
      { en: "plot", fa: "خط داستان" },
      { en: "character", fa: "شخصیت داستان" },
      { en: "inspiring", fa: "الهام‌بخش" },
      { en: "lesson", fa: "درس/آموزه" },
      { en: "recommend", fa: "پیشنهاد کردن" },
    ],
    icon: "BookOpen",
    order: 8,
  },
  {
    id: "w-9",
    titleEn: "Protecting Our Environment",
    titleFa: "محافظت از محیط زیست",
    prompt:
      "What can ordinary people do to protect the environment? Write about at least three actions and explain why they matter.",
    promptFa:
      "مردم عادی برای حفاظت از محیط زیست چه کارهایی می‌توانند بکنند؟ حداقل سه کار را بنویس و توضیح بده چرا مهم هستند.",
    usefulWords: [
      { en: "pollution", fa: "آلودگی" },
      { en: "recycle", fa: "بازیافت" },
      { en: "waste", fa: "پسماند و دورریز" },
      { en: "energy", fa: "انرژی" },
      { en: "future generations", fa: "نسل‌های آینده" },
    ],
    icon: "Leaf",
    order: 9,
  },
  {
    id: "w-10",
    titleEn: "A Letter to My Future Self",
    titleFa: "نامه‌ای به خودِ آینده‌ام",
    prompt:
      "Write a letter to yourself ten years from now. What do you hope you have achieved? What message do you want to send?",
    promptFa:
      "نامه‌ای به خودِ ده سال بعدت بنویس. امیدواری چه چیزهایی به دست آورده باشی؟ چه پیامی می‌خواهی برای او بفرستی؟",
    usefulWords: [
      { en: "achieve", fa: "به دست آوردن" },
      { en: "proud", fa: "مفتخر" },
      { en: "goal", fa: "هدف" },
      { en: "hope", fa: "امید" },
      { en: "by then", fa: "تا آن زمان" },
    ],
    icon: "Mail",
    order: 10,
  },
];
