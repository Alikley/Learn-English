import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/Prisma client";
import { reportError } from "@/lib/report-error";
import { notifyUser } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "همه فیلدها الزامی هستند" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // 🔥 مهم
        name,
        email,
        password: hashed,

        streak: {
          create: {
            current: 0,
            longest: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // v1.0.6.9 — اعلان خوش‌آمد (هرگز خطا نمی‌دهد)
    await notifyUser(user.id, {
      type: "welcome",
      link: "/courses",
      titleFa: "به Flex English خوش آمدی 👋",
      titleEn: "Welcome to Flex English 👋",
      textFa:
        "سفر یادگیری‌ات شروع شد! هر روز حداقل یک فعالیت را کامل کن (درس، بازی یا آزمون) تا استریک روزهای متوالی‌ات روشن بماند. از «دوره‌های من» شروع کن.",
      textEn:
        'Your learning journey starts now! Complete at least one activity each day (lesson, game or exam) to keep your streak alive. Start from "My Courses".',
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    // v1.0.6.0 — لاگ سرور + گزارش به Sentry (اگر DSN تنظیم شده باشد)
    reportError(e, { route: "/api/auth/register" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
