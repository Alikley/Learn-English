import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const courseData = [
  {
    title: "گرامر مبتدی",
    titleEn: "Grammar Beginner",
    level: "BEGINNER" as const,
    color: "bg-blue-500",
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
    order: 5,
    lessons: ["در محل کار", "مذاکره", "بیان نظر", "تعارف", "صحبت درباره آینده"],
  },
  {
    title: "مکالمه پیشرفته",
    titleEn: "Conversation Advanced",
    level: "ADVANCED" as const,
    color: "bg-teal-700",
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
    order: 7,
    lessons: ["لغات خانه", "اعداد", "رنگ‌ها", "روزهای هفته", "ماه‌های سال"],
  },
  {
    title: "لغات متوسط",
    titleEn: "Vocabulary Intermediate",
    level: "INTERMEDIATE" as const,
    color: "bg-purple-600",
    order: 8,
    lessons: ["لغات تجاری", "محیط زیست", "تکنولوژی", "بهداشت", "اقتصاد"],
  },
  {
    title: "لغات پیشرفته",
    titleEn: "Vocabulary Advanced",
    level: "ADVANCED" as const,
    color: "bg-purple-700",
    order: 9,
    lessons: ["اصطلاحات آکادمیک", "لغات حقوقی", "پزشکی", "ادبیات", "idioms"],
  },
  {
    title: "لیسنینگ مبتدی",
    titleEn: "Listening Beginner",
    level: "BEGINNER" as const,
    color: "bg-orange-500",
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

async function main() {
  console.log("Seeding...");

  for (const course of courseData) {
    const id = `seed-${course.titleEn.toLowerCase().replace(/\s+/g, "-")}`;

    // ساخت یا آپدیت دوره
    const existing = await prisma.course.findUnique({
      where: { id },
      include: { lessons: { select: { id: true, title: true } } },
    });

    if (existing) {
      // آپدیت اطلاعات دوره
      await prisma.course.update({
        where: { id },
        data: {
          title: course.title,
          titleEn: course.titleEn,
          level: course.level,
          color: course.color,
          isPublished: true,
          order: course.order,
          description: `دوره ${course.title}`,
        },
      });

      // حذف درس‌های قدیمی و ساخت دوباره
      if (existing.lessons.length === 0) {
        console.log(`  → Creating ${course.lessons.length} lessons for "${course.title}"`);

        for (let i = 0; i < course.lessons.length; i++) {
          const title = course.lessons[i];
          await prisma.lesson.create({
            data: {
              courseId: id,
              title,
              order: i + 1,
              xp: 10 + i * 5,
              duration: 8 + i * 3,
              type: i === 0 ? "TEACH" : i === 4 ? "QUIZ" : "PRACTICE",
              content: JSON.stringify({
                title,
                rule: course.titleEn.includes("Grammar")
                  ? "Present Continuous / Simple Grammar"
                  : "Learning Content",
                examples: ["Example 1", "Example 2"],
              }),
            },
          });
        }
      } else {
        console.log(`  → "${course.title}" already has ${existing.lessons.length} lessons, skipping.`);
      }
    } else {
      // ساخت دوره جدید با درس‌ها
      await prisma.course.create({
        data: {
          id,
          title: course.title,
          titleEn: course.titleEn,
          level: course.level,
          color: course.color,
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
                rule: course.titleEn.includes("Grammar")
                  ? "Present Continuous / Simple Grammar"
                  : "Learning Content",
                examples: ["Example 1", "Example 2"],
              }),
            })),
          },
        },
      });
      console.log(`  → Created "${course.title}" with ${course.lessons.length} lessons.`);
    }
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
