import { prisma } from "@/prisma/prisma-client";
import { notifyUser, faDigits, STREAK_MILESTONES } from "@/lib/notify";

/**
 * آپدیت streak بعد از تکمیل درس
 *
 * منطق:
 *  - اگر امروز قبلاً فعالیته ثبت شده → بدون تغییر
 *  - اگر دیروز فعالیت داشته → current + 1
 *  - اگر بیشتر از ۱ روز فاصله → ریست به ۱
 *  - همیشه longest رو آپدیت میکنه
 */
export async function updateStreak(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const existing = await prisma.streak.findUnique({ where: { userId } });

  if (existing) {
    const lastActive = new Date(existing.lastActiveAt);
    const lastActiveDay = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate(),
    );

    // ---- همان روز — قبلاً حساب شده ----
    if (lastActiveDay.getTime() === todayStart.getTime()) {
      // حالت خاص: روز ثبت‌نام (streak با current=0 ساخته شده)
      // اولین فعالیت امروز (درس یا بازی) باید استریک را 1 کند
      if (existing.current === 0) {
        return await prisma.streak.update({
          where: { userId },
          data: {
            current: 1,
            longest: Math.max(existing.longest, 1),
          },
        });
      }
      return existing;
    }

    // ---- دیروز — ادامه streak ----
    if (lastActiveDay.getTime() === yesterdayStart.getTime()) {
      const newCurrent = existing.current + 1;
      const updated = await prisma.streak.update({
        where: { userId },
        data: {
          current: newCurrent,
          longest: Math.max(existing.longest, newCurrent),
          lastActiveAt: now,
        },
      });

      // v1.0.6.9 — اعلان در روزهای قشنگ (۳/۷/۱۴/۳۰/۵۰/۱۰۰/۳۶۵)
      // notifyUser هرگز throw نمی‌کند → streak بی‌خطر می‌ماند
      if (STREAK_MILESTONES.includes(newCurrent)) {
        const nextMilestone =
          STREAK_MILESTONES.find((m) => m > newCurrent) ?? newCurrent * 2;
        await notifyUser(userId, {
          type: "streak",
          link: "/dashboard",
          titleFa: `🔥 ${faDigits(newCurrent)} روز متوالی!`,
          titleEn: `🔥 ${newCurrent}-day streak!`,
          textFa: `هر روز این ${faDigits(newCurrent)} روز فعالیتی ثبت شده. ادامه بده — رکورد بعدی ${faDigits(nextMilestone)} روز است.`,
          textEn: `You've stayed active ${newCurrent} days in a row. Keep going — next milestone is ${nextMilestone} days.`,
        });
      }

      return updated;
    }

    // ---- فاصله بیش از ۱ روز — شکست streak ----
    return await prisma.streak.update({
      where: { userId },
      data: {
        current: 1,
        lastActiveAt: now,
      },
    });
  }

  // ---- اولین فعالیت ----
  return await prisma.streak.create({
    data: {
      userId,
      current: 1,
      longest: 1,
      lastActiveAt: now,
    },
  });
}

/**
 * دریافت streak کاربر
 *
 * اگه آخرین فعالیت قبل از دیروز باشه → streak قطع شده → current = 0
 */
export async function getStreak(userId: string): Promise<{
  current: number;
  longest: number;
}> {
  const streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) return { current: 0, longest: 0 };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const lastActive = new Date(streak.lastActiveAt);
  const lastActiveDay = new Date(
    lastActive.getFullYear(),
    lastActive.getMonth(),
    lastActive.getDate(),
  );

  // اگر آخرین فعالیت قبل از دیروز بود → streak شکسته
  if (lastActiveDay.getTime() < yesterdayStart.getTime()) {
    await prisma.streak.update({
      where: { userId },
      data: { current: 0 },
    });
    return { current: 0, longest: streak.longest };
  }

  return { current: streak.current, longest: streak.longest };
}
