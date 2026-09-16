import { PrismaClient } from "@prisma/client";
import { HANGMAN_WORDS } from "../data/hangman/words";
import { MEMORY_WORDS } from "../data/memory/words";
import {
  SPEEDQUIZ_WORDS,
  SPEEDQUIZ_SENTENCES,
} from "../data/speedquiz/questions";
import { lessonsOfCourse } from "../data/lessons/manifest";
const prisma = new PrismaClient();

// ۱۲ دوره × ۱۰ درس — بر پایه CEFR (منبع: data/lessons/manifest.ts)
const courseData = [
  {
    id: "seed-grammar-beginner",
    title: "گرامر مبتدی",
    titleEn: "Grammar Beginner",
    level: "BEGINNER" as const,
    color: "bg-blue-500",
    imageUrl: "/assets/grammar.svg",
    order: 1,
    description: "گرامر پایه از صفر — سطح‌بندی CEFR: A1 و A2",
  },
  {
    id: "seed-grammar-intermediate",
    title: "گرامر متوسط",
    titleEn: "Grammar Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-blue-600",
    imageUrl: "/assets/grammar.svg",
    order: 2,
    description: "گرامر کاربردی متوسط — سطح‌بندی CEFR: B1 و B2",
  },
  {
    id: "seed-grammar-advanced",
    title: "گرامر پیشرفته",
    titleEn: "Grammar Advanced",
    level: "ADVANCED" as const,
    color: "bg-blue-700",
    imageUrl: "/assets/grammar.svg",
    order: 3,
    description: "ساختارهای پیشرفته و ادبی — سطح‌بندی CEFR: C1 و C2",
  },
  {
    id: "seed-conversation-beginner",
    title: "مکالمه مبتدی",
    titleEn: "Conversation Beginner",
    level: "BEGINNER" as const,
    color: "bg-teal-500",
    imageUrl: "/assets/conversation.svg",
    order: 4,
    description: "مکالمه دوطرفه با سایت — سطح‌بندی CEFR: A1 و A2",
  },
  {
    id: "seed-conversation-intermediate",
    title: "مکالمه متوسط",
    titleEn: "Conversation Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-teal-600",
    imageUrl: "/assets/conversation.svg",
    order: 5,
    description: "مکالمه دوطرفه با سایت — سطح‌بندی CEFR: B1 و B2",
  },
  {
    id: "seed-conversation-advanced",
    title: "مکالمه پیشرفته",
    titleEn: "Conversation Advanced",
    level: "ADVANCED" as const,
    color: "bg-teal-700",
    imageUrl: "/assets/conversation.svg",
    order: 6,
    description: "مکالمه دوطرفه با سایت — سطح‌بندی CEFR: C1 و C2",
  },
  {
    id: "seed-vocabulary-beginner",
    title: "لغات مبتدی",
    titleEn: "Vocabulary Beginner",
    level: "BEGINNER" as const,
    color: "bg-purple-500",
    imageUrl: "/assets/vocabulary.svg",
    order: 7,
    description: "لغات کاربردی با فلش‌کارت — سطح‌بندی CEFR: A1 و A2",
  },
  {
    id: "seed-vocabulary-intermediate",
    title: "لغات متوسط",
    titleEn: "Vocabulary Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-purple-600",
    imageUrl: "/assets/vocabulary.svg",
    order: 8,
    description: "لغات کاربردی با فلش‌کارت — سطح‌بندی CEFR: B1 و B2",
  },
  {
    id: "seed-vocabulary-advanced",
    title: "لغات پیشرفته",
    titleEn: "Vocabulary Advanced",
    level: "ADVANCED" as const,
    color: "bg-purple-700",
    imageUrl: "/assets/vocabulary.svg",
    order: 9,
    description: "لغات تخصصی و اصطلاحات — سطح‌بندی CEFR: C1 و C2",
  },
  {
    id: "seed-listening-beginner",
    title: "لیسنینگ مبتدی",
    titleEn: "Listening Beginner",
    level: "BEGINNER" as const,
    color: "bg-orange-500",
    imageUrl: "/assets/listening.svg",
    order: 10,
    description: "داستان‌های صوتی ۵ دقیقه‌ای — سطح‌بندی CEFR: A1 و A2",
  },
  {
    id: "seed-listening-intermediate",
    title: "لیسنینگ متوسط",
    titleEn: "Listening Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-orange-600",
    imageUrl: "/assets/listening.svg",
    order: 11,
    description: "داستان‌های صوتی ۵ دقیقه‌ای — سطح‌بندی CEFR: B1 و B2",
  },
  {
    id: "seed-listening-advanced",
    title: "لیسنینگ پیشرفته",
    titleEn: "Listening Advanced",
    level: "ADVANCED" as const,
    color: "bg-orange-700",
    imageUrl: "/assets/listening.svg",
    order: 12,
    description: "داستان‌های صوتی ۵ دقیقه‌ای — سطح‌بندی CEFR: C1 و C2",
  },
];

async function seedCourses() {
  console.log("📚 Seeding courses (v1.0.1.2 — 120 real lessons)...");

  for (const course of courseData) {
    const defs = lessonsOfCourse(course.id.replace("seed-", ""));
    if (defs.length !== 10) {
      throw new Error(`course ${course.id}: expected 10 lessons, got ${defs.length}`);
    }

    const existing = await prisma.course.findUnique({
      where: { id: course.id },
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    if (!existing) {
      await prisma.course.create({
        data: {
          id: course.id,
          title: course.title,
          titleEn: course.titleEn,
          level: course.level,
          color: course.color,
          imageUrl: course.imageUrl,
          isPublished: true,
          order: course.order,
          description: course.description,
          lessons: {
            create: defs.map((d) => ({
              id: `${course.id}-l${String(d.order).padStart(2, "0")}`,
              title: d.titleFa,
              order: d.order,
              xp: d.xp,
              duration: d.durationMin,
              type: "TEACH",
              content: JSON.stringify({
                kind: d.kind,
                slug: d.slug,
                cefr: d.cefr,
              }),
            })),
          },
        },
      });
      console.log(
        `  ✅ "${course.title}" created with ${defs.length} lessons`,
      );
    } else {
      // ارتقای امن: درس‌های موجود به‌روزرسانی می‌شوند (پیشرفت کاربران حفظ می‌شود)
      // و درس‌های ۶ تا ۱۰ با شناسه قطعی ساخته می‌شوند
      await prisma.course.update({
        where: { id: course.id },
        data: {
          title: course.title,
          titleEn: course.titleEn,
          level: course.level,
          color: course.color,
          imageUrl: course.imageUrl,
          isPublished: true,
          order: course.order,
          description: course.description,
        },
      });

      const existingLessons = existing.lessons;
      for (let i = 0; i < defs.length; i++) {
        const d = defs[i];
        const content = JSON.stringify({
          kind: d.kind,
          slug: d.slug,
          cefr: d.cefr,
        });
        if (i < existingLessons.length) {
          await prisma.lesson.update({
            where: { id: existingLessons[i].id },
            data: {
              title: d.titleFa,
              order: d.order,
              xp: d.xp,
              duration: d.durationMin,
              type: "TEACH",
              content,
            },
          });
        } else {
          await prisma.lesson.create({
            data: {
              id: `${course.id}-l${String(d.order).padStart(2, "0")}`,
              courseId: course.id,
              title: d.titleFa,
              order: d.order,
              xp: d.xp,
              duration: d.durationMin,
              type: "TEACH",
              content,
            },
          });
        }
      }
      // حذف درس‌های اضافی (اگر بیش از ۱۰ بود)
      for (let i = defs.length; i < existingLessons.length; i++) {
        await prisma.lesson.delete({ where: { id: existingLessons[i].id } });
      }
      console.log(
        `  ✅ "${course.title}" upgraded → ${defs.length} real lessons`,
      );
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

async function seedGameWords() {
  console.log("🎮 Seeding hangman game words...");

  // همیشه تازه‌سازی می‌کنیم تا سطح‌بندی و لیست کلمات به‌روز شود
  // (کلمات بازی داده سیستمی‌اند، نه تولید کاربر)
  await prisma.gameWord.deleteMany();
  await prisma.gameWord.createMany({
    data: HANGMAN_WORDS.map((w) => ({
      word: w.word,
      hint: w.hint,
      category: w.category,
      level: w.level,
    })),
  });

  const levels = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const w of HANGMAN_WORDS) levels[w.level]++;
  console.log(
    `  ✅ ${HANGMAN_WORDS.length} hangman words seeded (EASY: ${levels.EASY} / MEDIUM: ${levels.MEDIUM} / HARD: ${levels.HARD})`,
  );
}

async function seedMemoryWords() {
  console.log("🧩 Seeding memory game words...");

  // همیشه تازه‌سازی می‌کنیم تا سطح‌بندی و لیست کلمات به‌روز شود
  // (کلمات بازی داده سیستمی‌اند، نه تولید کاربر)
  await prisma.memoryWord.deleteMany();
  await prisma.memoryWord.createMany({
    data: MEMORY_WORDS.map((w) => ({
      word: w.word,
      translation: w.translation,
      category: w.category,
      level: w.level,
    })),
  });

  const levels = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const w of MEMORY_WORDS) levels[w.level]++;
  console.log(
    `  ✅ ${MEMORY_WORDS.length} memory words seeded (EASY: ${levels.EASY} / MEDIUM: ${levels.MEDIUM} / HARD: ${levels.HARD})`,
  );
}

async function seedSpeedQuizQuestions() {
  console.log("⚡ Seeding speed quiz questions...");

  // همیشه تازه‌سازی می‌کنیم تا سطح‌بندی و لیست سوال‌ها به‌روز شود
  // (سوال‌های بازی داده سیستمی‌اند، نه تولید کاربر)
  await prisma.speedQuizQuestion.deleteMany();

  const wordRows = SPEEDQUIZ_WORDS.map((w) => ({
    type: "WORD",
    prompt: w.word,
    answer: w.translation,
    distractors: JSON.stringify(w.distractors),
    translation: w.translation,
    category: w.category,
    level: w.level,
    cefr: w.cefr,
  }));

  const sentenceRows = SPEEDQUIZ_SENTENCES.map((s) => ({
    type: "SENTENCE",
    prompt: s.sentence,
    answer: s.answer,
    distractors: JSON.stringify(s.distractors),
    translation: s.translation,
    category: s.category,
    level: s.level,
    cefr: s.cefr,
  }));

  await prisma.speedQuizQuestion.createMany({
    data: [...wordRows, ...sentenceRows],
  });

  const levels = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const row of [...wordRows, ...sentenceRows]) levels[row.level]++;
  console.log(
    `  ✅ ${wordRows.length + sentenceRows.length} speed quiz questions seeded (EASY: ${levels.EASY} / MEDIUM: ${levels.MEDIUM} / HARD: ${levels.HARD})`,
  );
}

async function main() {
  await seedCourses();
  await seedBooks();
  await seedListening();
  await seedGameWords();
  await seedMemoryWords();
  await seedSpeedQuizQuestions();
  console.log("🎉 All done!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
