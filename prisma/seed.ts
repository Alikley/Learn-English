import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const courseData = [
  {
    title: "گرامر مبتدی",
    titleEn: "Grammar Beginner",
    level: "BEGINNER" as const,
    color: "bg-blue-500",
    imageUrl: "/assets/grammar.svg",
    order: 1,
    lessons: [
      "آشنایی با افعال to be",
      "زمان حال ساده",
      "ضمایر شخصی",
      "جملات منفی",
      "سوالی کردن",
    ],
  },
  {
    title: "گرامر متوسط",
    titleEn: "Grammar Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-blue-600",
    imageUrl: "/assets/grammar.svg",
    order: 2,
    lessons: [
      "زمان حال کامل",
      "زمان گذشته",
      "جملات شرطی",
      "modal verbs",
      "passive voice",
    ],
  },
  {
    title: "گرامر پیشرفته",
    titleEn: "Grammar Advanced",
    level: "ADVANCED" as const,
    color: "bg-blue-700",
    imageUrl: "/assets/grammar.svg",
    order: 3,
    lessons: [
      "conditional type 2&3",
      "subjunctive",
      "inversion",
      "cleft sentences",
      "ellipsis",
    ],
  },
  {
    title: "مکالمه مبتدی",
    titleEn: "Conversation Beginner",
    level: "BEGINNER" as const,
    color: "bg-teal-500",
    imageUrl: "/assets/conversation.svg",
    order: 4,
    lessons: [
      "معرفی خود",
      "خرید کردن",
      "در رستوران",
      "پرسیدن مسیر",
      "احوال‌پرسی",
    ],
  },
  {
    title: "مکالمه متوسط",
    titleEn: "Conversation Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-teal-600",
    imageUrl: "/assets/conversation.svg",
    order: 5,
    lessons: ["در محل کار", "مذاکره", "بیان نظر", "تعارف", "صحبت درباره آینده"],
  },
  {
    title: "مکالمه پیشرفته",
    titleEn: "Conversation Advanced",
    level: "ADVANCED" as const,
    color: "bg-teal-700",
    imageUrl: "/assets/conversation.svg",
    order: 6,
    lessons: [
      "بحث و مناظره",
      "سخنرانی",
      "متقاعد کردن",
      "طنز",
      "اصطلاحات روزمره",
    ],
  },
  {
    title: "لغات مبتدی",
    titleEn: "Vocabulary Beginner",
    level: "BEGINNER" as const,
    color: "bg-purple-500",
    imageUrl: "/assets/vocabulary.svg",
    order: 7,
    lessons: ["لغات خانه", "اعداد", "رنگ‌ها", "روزهای هفته", "ماه‌های سال"],
  },
  {
    title: "لغات متوسط",
    titleEn: "Vocabulary Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-purple-600",
    imageUrl: "/assets/vocabulary.svg",
    order: 8,
    lessons: ["لغات تجاری", "محیط زیست", "تکنولوژی", "بهداشت", "اقتصاد"],
  },
  {
    title: "لغات پیشرفته",
    titleEn: "Vocabulary Advanced",
    level: "ADVANCED" as const,
    color: "bg-purple-700",
    imageUrl: "/assets/vocabulary.svg",
    order: 9,
    lessons: ["اصطلاحات آکادمیک", "لغات حقوقی", "پزشکی", "ادبیات", "idioms"],
  },
  {
    title: "لیسنینگ مبتدی",
    titleEn: "Listening Beginner",
    level: "BEGINNER" as const,
    color: "bg-orange-500",
    imageUrl: "/assets/listening.svg",
    order: 10,
    lessons: [
      "تلفظ الفبا",
      "اعداد در مکالمه",
      "دستورالعمل",
      "مکالمه آهسته",
      "آهنگ ساده",
    ],
  },
  {
    title: "لیسنینگ متوسط",
    titleEn: "Listening Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-orange-600",
    imageUrl: "/assets/listening.svg",
    order: 11,
    lessons: [
      "اخبار رادیو",
      "پادکست",
      "مکالمه روزمره",
      "فیلم با زیرنویس",
      "مصاحبه",
    ],
  },
  {
    title: "لیسنینگ پیشرفته",
    titleEn: "Listening Advanced",
    level: "ADVANCED" as const,
    color: "bg-orange-700",
    imageUrl: "/assets/listening.svg",
    order: 12,
    lessons: [
      "TED talks",
      "فیلم بدون زیرنویس",
      "لهجه‌های مختلف",
      "BBC news",
      "lyrics",
    ],
  },
];

async function seedCourses() {
  console.log("📚 Seeding courses...");

  for (const course of courseData) {
    const id = `seed-${course.titleEn.toLowerCase().replace(/\s+/g, "-")}`;

    const existing = await prisma.course.findUnique({
      where: { id },
      include: { lessons: { select: { id: true } } },
    });

    if (!existing) {
      await prisma.course.create({
        data: {
          id,
          title: course.title,
          titleEn: course.titleEn,
          level: course.level,
          color: course.color,
          imageUrl: course.imageUrl,
          isPublished: true,
          order: course.order,
          description: `دوره ${course.title}`,
          lessons: {
            create: course.lessons.map((title, i) => ({
              title,
              order: i + 1,
              xp: 10 + i * 5,
              duration: 8 + i * 3,
              type: i === 0 ? "TEACH" : i === 4 ? "QUIZ" : "PRACTICE",
              content: JSON.stringify({
                title,
                rule: "Learning Content",
                examples: ["Example 1", "Example 2"],
              }),
            })),
          },
        },
      });
      console.log(
        `  ✅ "${course.title}" created with ${course.lessons.length} lessons`,
      );
    } else {
      console.log(`  ⏭️ "${course.title}" already exists, skipping`);
    }
  }
}

async function seedBooks() {
  console.log("📖 Seeding books...");

  await prisma.book.deleteMany();

  await prisma.book.createMany({
    data: [
      {
        title: "Prince William",
        titleFa: "شاهزاده ویلیام",
        author: "Penguin Readers",
        description: "داستان کوتاه سطح 1 (مبتدی) درباره شاهزاده ویلیام.",
        level: "BEGINNER",
        coverUrl: "/books/covers/prince-william.jpg",
        pdfPath: "/books/prince-william.pdf",
        pages: 20,
      },
      {
        title: "Pride and Prejudice",
        titleFa: "غرور و تعصب",
        author: "Jane Austen",
        description: "داستان کلاسیک جین آستن درباره عشق و غرور.",
        level: "INTERMEDIATE",
        coverUrl: "/books/covers/pride-and-prejudice.jpg",
        pdfPath: "/books/pride-and-prejudice.pdf",
        pages: 30,
      },
    ],
  });

  console.log("  ✅ 2 books seeded!");
}

async function main() {
  await seedCourses();
  await seedBooks();
  console.log("🎉 All done!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
