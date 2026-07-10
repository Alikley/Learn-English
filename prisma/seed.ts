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

async function seedListening() {
  console.log("🎧 Seeding listening episodes...");

  const existing = await prisma.listeningEpisode.findFirst({
    where: { titleEn: "Air Travel" },
  });

  if (!existing) {
    await prisma.listeningEpisode.create({
      data: {
        title: "Air Travel",
        titleEn: "Air Travel",
        titleFa: "سفر هوایی",
        description:
          "در این قسمت از 6 Minute English درباره سفر هوایی، مشکلات فرودگاه‌ها، و تاثیرات زیست‌محیطی پرواز صحبت می‌کنیم.",
        audioUrl:
          "/training/audio/2008-03-12 - 6 Minute English - Air travel.mp3",
        level: "BEGINNER",
        duration: 360,
        xp: 30,
        order: 1,
        isPublished: true,
        transcript: `Hello and welcome to {1} from BBC Learning English. I'm Alice and I'm Neil.

Neil: Today we're talking about air travel. Do you enjoy flying, Alice?

Alice: Well, I love going to new places, but the actual experience of being in an airport and on a plane can be quite {2}.

Neil: Yes, airports can be very stressful places. Long queues at {3}, delayed flights, and {4} luggage are just some of the problems passengers face.

Alice: But air travel has changed dramatically over the years. In the past, flying was only for the rich and famous. Today, budget {5} have made it possible for almost anyone to fly to another country for a holiday.

Neil: That's true. But there are concerns about the {6} impact of flying. Aeroplanes produce a significant amount of carbon {7}, which contribute to climate {8}.

Alice: Some people are choosing to fly less, or even stop flying completely. This movement is sometimes called flight {9}.

Neil: Interesting. But for many people, especially in countries where trains aren't widely available, flying is still the most practical way to travel long distances.

Alice: So, what's the question for today, Neil?

Neil: Today's question is: How many passengers flew on domestic flights in the United States last year? Was it approximately 200 million, 500 million, or 800 million?

Alice: I'm going to say about 500 million.

Neil: We'll find out if you're right at the end of the programme. Many airlines are looking at electric planes and sustainable fuel as ways to reduce emissions. Some companies are even developing flying taxis for short distances within cities.

Alice: It sounds like science fiction, but it could become reality within the next decade. Will technology have {10} the way we travel?

Neil: I'm not sure I'd want to take a flying taxi. I think I'll stick with regular planes for now.

Alice: Before we go, let's reveal the answer to today's quiz question.

Neil: The answer was approximately 800 million passengers flew on domestic flights in the US last year.

Alice: Wow, that's a lot of people! That's all for today. Bye!`,
        gaps: [
          { id: 1, answer: "Six Minute English", hint: "نام برنامه BBC" },
          { id: 2, answer: "stressful", hint: "پر از استرس" },
          { id: 3, answer: "security", hint: "بخش امنیت فرودگاه" },
          { id: 4, answer: "lost", hint: "گم‌شده" },
          { id: 5, answer: "airlines", hint: "شرکت‌های هواپیمایی ارزان" },
          { id: 6, answer: "environmental", hint: "محیط زیستی" },
          { id: 7, answer: "emissions", hint: "گازهای خروجی" },
          { id: 8, answer: "change", hint: "تغییرات اقلیمی" },
          { id: 9, answer: "shaming", hint: "شرم‌آور کردن" },
          { id: 10, answer: "changed", hint: "تغییر داده" },
        ],
      },
    });
    console.log("  ✅ 'Air Travel' episode created with 10 gaps");
  } else {
    console.log("  ⏭️ 'Air Travel' already exists, skipping");
  }
}

async function main() {
  await seedCourses();
  await seedBooks();
  await seedListening();
  console.log("🎉 All done!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
