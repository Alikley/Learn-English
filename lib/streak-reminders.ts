// ========================================
// v1.0.6.5 (English 1.0.1.8) — یادآور استریک با پوش OneSignal
//
// جریان (روت /api/cron/streak-reminders — روزانه حدود ۲۰:۳۰ تهران):
//  ۱) کاربرهایی پیدا می‌شوند که دیروز فعالیت داشته‌اند (استریک
//     زنده است) ولی «امروز» هنوز هیچ فعالیتی ثبت نکرده‌اند
//  ۲) برای هر کدام که اشتراک پوش دارد، اعلان اختصاصی
//     «استریک N روزه‌ات امروز قطع می‌شود!» فرستاده می‌شود
//
// منطق «روز» با همان تقویمِ streak.ts است (ابتدای روزِ
// ساعتِ سرور). برای هم‌راستا شدن با روز تهران روی Vercel،
// متغیر TZ=Asia/Tehran را در DEPLOY.md توضیح داده‌ایم.
// ========================================

import { prisma } from "@/prisma/Prisma client";
import { sendPushToSubscriptions } from "@/lib/onesignal";
import { appBaseUrl } from "@/lib/password-reset";

export type StreakReminderCandidate = {
  userId: string;
  displayName: string;
  current: number;
  subscriptionIds: string[];
};

export type StreakReminderSummary = {
  checked: number;
  eligible: number;
  notified: number;
  usersNotified: number;
  errors: string[];
};

/** آیا استریکِ این کاربر «امروز» در خطر قطع‌شدن است؟ (خالص — برای تست) */
export function isStreakAtRiskToday(
  lastActiveAt: Date,
  current: number,
  now: Date = new Date(),
): boolean {
  if (current <= 0) return false;

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const lastActiveDay = new Date(
    lastActiveAt.getFullYear(),
    lastActiveAt.getMonth(),
    lastActiveAt.getDate(),
  );

  // دیروز فعال بوده (زنجیره زنده) ولی امروز نه → امروز قطع می‌شود
  return lastActiveDay.getTime() === yesterdayStart.getTime();
}

/**
 * کاربرانِ در-خطر: استریک > 0 و آخرین فعالیت دقیقاً «دیروز».
 * همراه با اشتراک‌های پوشِ همان کاربر.
 */
export async function getStreakReminderCandidates(
  now: Date = new Date(),
): Promise<StreakReminderCandidate[]> {
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const rows = await prisma.streak.findMany({
    where: {
      current: { gt: 0 },
      lastActiveAt: { gte: yesterdayStart, lt: todayStart },
    },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
          pushSubscriptions: { select: { subscriptionId: true } },
        },
      },
    },
  });

  return rows
    .filter((r) => r.user?.pushSubscriptions?.length)
    .map((r) => ({
      userId: r.userId,
      displayName: r.user.nickname || r.user.name || "",
      current: r.current,
      subscriptionIds: r.user.pushSubscriptions.map((p) => p.subscriptionId),
    }));
}

function personalize(
  candidate: StreakReminderCandidate,
): { fa: string; en: string } {
  const name = candidate.displayName ? `${candidate.displayName} ` : "";
  return {
    fa: `🔥 ${name}استریک ${candidate.current} روزه‌ات امروز قطع می‌شه! فقط یه تمرین کوتاه کافیه تا زنجیره ادامه پیدا کنه.`,
    en: `🔥 Your ${candidate.current}-day streak breaks today! One quick practice keeps the chain alive.`,
  };
}

/**
 * ارسال یادآور به همهٔ کاربرانِ در-خطر — نتیجه جمع‌بندی برمی‌گردد
 * (تعداد بررسی/وارد-دسترس/اعلان‌رفته + خطاها). هیچ‌وقت throw نمی‌کند.
 */
export async function sendStreakReminders(
  now: Date = new Date(),
): Promise<StreakReminderSummary> {
  const candidates = await getStreakReminderCandidates(now);

  const summary: StreakReminderSummary = {
    checked: candidates.length,
    eligible: candidates.length,
    notified: 0,
    usersNotified: 0,
    errors: [],
  };

  const homeUrl = `${appBaseUrl()}/home`;

  for (const candidate of candidates) {
    const texts = personalize(candidate);
    const result = await sendPushToSubscriptions(candidate.subscriptionIds, {
      headings: {
        fa: "🔥 استریک در خطر است!",
        en: "🔥 Streak in danger!",
      },
      contents: texts,
      url: homeUrl,
    });

    summary.notified += result.notified;
    if (result.ok) {
      summary.usersNotified += 1;
    } else if (result.error) {
      summary.errors.push(`user ${candidate.userId}: ${result.error}`);
    }
  }

  return summary;
}
