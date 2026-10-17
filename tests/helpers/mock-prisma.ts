import { vi } from "vitest";

// ========================================
// دیتابیس ماک درون‌حافظه‌ای برای تست‌ها (v1.0.6.0 / English 1.0.1.3)
//
// همان متدهایی که مسیرهای حیاتی اپ صدا می‌زنند را پیاده می‌کند:
//  user / streak / gameScore / listeningEpisode / listeningProgress
// بدون دیتابیس واقعی → تست‌ها در هر محیطی (لوکال/CI) سریع و
// قطعی اجرا می‌شوند.
// ========================================

export type MockUserRow = {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockStreakRow = {
  id: string;
  userId: string;
  current: number;
  longest: number;
  lastActiveAt: Date;
};

export type MockGameScoreRow = {
  id: string;
  userId: string;
  game: string;
  bestScore: number;
  totalWins: number;
  totalLosses: number;
  sessionsPlayed: number;
  lastPlayedAt: Date | null;
};

export type MockListeningEpisodeRow = {
  id: string;
  title: string;
  titleFa: string | null;
  description: string | null;
  audioUrl: string;
  level: string;
  duration: number;
  xp: number;
  transcript: unknown;
  gaps: { id: number; answer: string }[];
};

export type MockListeningProgressRow = {
  id: string;
  userId: string;
  episodeId: string;
  stars: number;
  score: number;
  xpEarned: number;
  completedAt: Date | null;
};

export type MockPasswordResetTokenRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type MockPushSubscriptionRow = {
  id: string;
  userId: string;
  subscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
};

// v1.0.6.9 (English 1.0.1.12) — اعلان‌های واقعی کاربر
export type MockNotificationRow = {
  id: string;
  userId: string;
  type: string;
  titleFa: string;
  titleEn: string | null;
  textFa: string;
  textEn: string | null;
  link: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
};

export const mockDb = {
  users: [] as MockUserRow[],
  streaks: [] as MockStreakRow[],
  gameScores: [] as MockGameScoreRow[],
  listeningEpisodes: [] as MockListeningEpisodeRow[],
  listeningProgress: [] as MockListeningProgressRow[],
  passwordResetTokens: [] as MockPasswordResetTokenRow[],
  pushSubscriptions: [] as MockPushSubscriptionRow[],
  notifications: [] as MockNotificationRow[],
};

let autoId = 0;
const nextId = (prefix: string) => `${prefix}-${++autoId}`;

/** خالی‌کردن دیتابیس ماک بین تست‌ها */
export function resetMockDb() {
  mockDb.users = [];
  mockDb.streaks = [];
  mockDb.gameScores = [];
  mockDb.listeningEpisodes = [];
  mockDb.listeningProgress = [];
  mockDb.passwordResetTokens = [];
  mockDb.pushSubscriptions = [];
  mockDb.notifications = [];
  autoId = 0;
}

const now = () => new Date();

function findUser(where: Record<string, unknown>): MockUserRow | null {
  if (!where) return null;
  if (typeof where.id === "string") {
    return mockDb.users.find((u) => u.id === where.id) ?? null;
  }
  if (typeof where.email === "string") {
    return mockDb.users.find((u) => u.email === where.email) ?? null;
  }
  return null;
}

// v1.0.6.9 — فیلتر مشترک اعلان‌ها برای count/findMany/updateMany/deleteMany
// where پشتیبانی‌شده: { userId?, isRead?, id? , id: { in: [...] } }
function matchNotifications(
  where: Record<string, unknown>,
): MockNotificationRow[] {
  let rows = mockDb.notifications.slice();
  if (typeof where.userId === "string") {
    rows = rows.filter((n) => n.userId === where.userId);
  }
  if (typeof where.isRead === "boolean") {
    rows = rows.filter((n) => n.isRead === where.isRead);
  }
  if (typeof where.id === "string") {
    rows = rows.filter((n) => n.id === where.id);
  } else if (
    where.id &&
    typeof where.id === "object" &&
    Array.isArray((where.id as { in?: string[] }).in)
  ) {
    const ids = new Set((where.id as { in: string[] }).in);
    rows = rows.filter((n) => ids.has(n.id));
  }
  return rows;
}

/** ایجاد کاربر با پشتیبانی از streak تودرتو (مثل register) */
function createUser(data: Record<string, unknown>): MockUserRow {
  const nested = data.streak as { create?: Record<string, unknown> } | undefined;
  const row: MockUserRow = {
    id: (data.id as string) ?? nextId("user"),
    name: (data.name as string | null) ?? null,
    nickname: (data.nickname as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    image: (data.image as string | null) ?? null,
    password: (data.password as string | null) ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  mockDb.users.push(row);

  if (nested?.create) {
    mockDb.streaks.push({
      id: nextId("streak"),
      userId: row.id,
      current: (nested.create.current as number) ?? 0,
      longest: (nested.create.longest as number) ?? 0,
      lastActiveAt: now(),
    });
  }

  return row;
}

export const prismaMock = {
  // v1.0.7.0 (English 1.0.1.13) — چک سلامت دیتابیس (/api/uptime/health)
  $queryRaw: vi.fn(async () => [{ 1: 1 }]),

  user: {
    findUnique: vi.fn(
      async (args: { where: Record<string, unknown> }) =>
        findUser(args?.where ?? {}),
    ),
    findFirst: vi.fn(
      async (args: { where: Record<string, unknown> }) =>
        findUser(args?.where ?? {}),
    ),
    create: vi.fn(async (args: { data: Record<string, unknown> }) =>
      createUser(args?.data ?? {}),
    ),
    update: vi.fn(
      async (args: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        const row = findUser(args?.where ?? {});
        if (!row) throw new Error("mock: user not found for update");
        Object.assign(row, args.data, { updatedAt: now() });
        return row;
      },
    ),
    upsert: vi.fn(
      async (args: {
        where: Record<string, unknown>;
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const row = findUser(args?.where ?? {});
        if (row) {
          Object.assign(row, args.update ?? {}, { updatedAt: now() });
          return row;
        }
        return createUser({ id: args.where?.id as string, ...args.create });
      },
    ),
  },

  streak: {
    findUnique: vi.fn(
      async (args: { where: { userId: string } }) =>
        mockDb.streaks.find((s) => s.userId === args?.where?.userId) ?? null,
    ),
    // v1.0.6.5 — برای getStreakReminderCandidates (include: user + push)
    findMany: vi.fn(
      async (args: {
        where: {
          current?: { gt?: number };
          lastActiveAt?: { gte?: Date; lt?: Date };
        };
      }) => {
        const w = args?.where ?? {};
        return mockDb.streaks
          .filter((s) =>
            w.current?.gt !== undefined ? s.current > w.current.gt : true,
          )
          .filter((s) => {
            const t = s.lastActiveAt.getTime();
            const gte = w.lastActiveAt?.gte?.getTime();
            const lt = w.lastActiveAt?.lt?.getTime();
            return (
              (gte === undefined || t >= gte) && (lt === undefined || t < lt)
            );
          })
          .map((s) => {
            const user = mockDb.users.find((u) => u.id === s.userId);
            return {
              ...s,
              user: user
                ? {
                    name: user.name,
                    nickname: user.nickname,
                    pushSubscriptions: mockDb.pushSubscriptions
                      .filter((p) => p.userId === s.userId)
                      .map((p) => ({ subscriptionId: p.subscriptionId })),
                  }
                : null,
            };
          });
      },
    ),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const row: MockStreakRow = {
        id: nextId("streak"),
        userId: args.data.userId as string,
        current: (args.data.current as number) ?? 0,
        longest: (args.data.longest as number) ?? 0,
        lastActiveAt: (args.data.lastActiveAt as Date) ?? now(),
      };
      mockDb.streaks.push(row);
      return row;
    }),
    update: vi.fn(
      async (args: {
        where: { userId: string };
        data: Record<string, unknown>;
      }) => {
        const row = mockDb.streaks.find(
          (s) => s.userId === args?.where?.userId,
        );
        if (!row) throw new Error("mock: streak not found for update");
        Object.assign(row, args.data);
        return row;
      },
    ),
  },

  gameScore: {
    findUnique: vi.fn(
      async (args: {
        where: { userId_game: { userId: string; game: string } };
      }) =>
        mockDb.gameScores.find(
          (g) =>
            g.userId === args?.where?.userId_game?.userId &&
            g.game === args?.where?.userId_game?.game,
        ) ?? null,
    ),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const row: MockGameScoreRow = {
        id: nextId("game"),
        userId: args.data.userId as string,
        game: args.data.game as string,
        bestScore: (args.data.bestScore as number) ?? 0,
        totalWins: (args.data.totalWins as number) ?? 0,
        totalLosses: (args.data.totalLosses as number) ?? 0,
        sessionsPlayed: (args.data.sessionsPlayed as number) ?? 0,
        lastPlayedAt: (args.data.lastPlayedAt as Date) ?? null,
      };
      mockDb.gameScores.push(row);
      return row;
    }),
    update: vi.fn(
      async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = mockDb.gameScores.find((g) => g.id === args?.where?.id);
        if (!row) throw new Error("mock: gameScore not found for update");
        Object.assign(row, args.data);
        return row;
      },
    ),
  },

  listeningEpisode: {
    findUnique: vi.fn(
      async (args: { where: { id: string } }) =>
        mockDb.listeningEpisodes.find((e) => e.id === args?.where?.id) ?? null,
    ),
  },

  listeningProgress: {
    findUnique: vi.fn(
      async (args: {
        where: {
          userId_episodeId: { userId: string; episodeId: string };
        };
      }) =>
        mockDb.listeningProgress.find(
          (p) =>
            p.userId === args?.where?.userId_episodeId?.userId &&
            p.episodeId === args?.where?.userId_episodeId?.episodeId,
        ) ?? null,
    ),
    upsert: vi.fn(
      async (args: {
        where: {
          userId_episodeId: { userId: string; episodeId: string };
        };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const row = mockDb.listeningProgress.find(
          (p) =>
            p.userId === args.where.userId_episodeId.userId &&
            p.episodeId === args.where.userId_episodeId.episodeId,
        );
        if (row) {
          Object.assign(row, args.update ?? {});
          return row;
        }
        const created: MockListeningProgressRow = {
          id: nextId("lp"),
          userId: args.where.userId_episodeId.userId,
          episodeId: args.where.userId_episodeId.episodeId,
          stars: (args.create.stars as number) ?? 0,
          score: (args.create.score as number) ?? 0,
          xpEarned: (args.create.xpEarned as number) ?? 0,
          completedAt: (args.create.completedAt as Date) ?? now(),
        };
        mockDb.listeningProgress.push(created);
        return created;
      },
    ),
  },

  // v1.0.6.5 (English 1.0.1.8) — بازیابی رمز عبور
  passwordResetToken: {
    findUnique: vi.fn(
      async (args: { where: { tokenHash: string } }) =>
        mockDb.passwordResetTokens.find(
          (t) => t.tokenHash === args?.where?.tokenHash,
        ) ?? null,
    ),
    findFirst: vi.fn(
      async (args: {
        where: { userId: string; createdAt?: { gte?: Date } };
      }) => {
        const gte = args?.where?.createdAt?.gte;
        return (
          mockDb.passwordResetTokens
            .filter((t) => t.userId === args?.where?.userId)
            .filter((t) => (gte ? t.createdAt.getTime() >= gte.getTime() : true))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
          null
        );
      },
    ),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const row: MockPasswordResetTokenRow = {
        id: nextId("prt"),
        userId: args.data.userId as string,
        tokenHash: args.data.tokenHash as string,
        expiresAt: (args.data.expiresAt as Date) ?? now(),
        usedAt: (args.data.usedAt as Date | null) ?? null,
        createdAt: now(),
      };
      mockDb.passwordResetTokens.push(row);
      return row;
    }),
    deleteMany: vi.fn(
      async (args: {
        where: { userId: string; usedAt?: null };
      }) => {
        const before = mockDb.passwordResetTokens.length;
        mockDb.passwordResetTokens = mockDb.passwordResetTokens.filter(
          (t) =>
            !(
              t.userId === args?.where?.userId &&
              (args?.where?.usedAt === null ? t.usedAt === null : true)
            ),
        );
        return { count: before - mockDb.passwordResetTokens.length };
      },
    ),
  },

  // v1.0.6.5 (English 1.0.1.8) — اشتراک پوش OneSignal
  pushSubscription: {
    upsert: vi.fn(
      async (args: {
        where: { userId_subscriptionId: { userId: string; subscriptionId: string } };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const { userId, subscriptionId } = args.where.userId_subscriptionId;
        const row = mockDb.pushSubscriptions.find(
          (p) => p.userId === userId && p.subscriptionId === subscriptionId,
        );
        if (row) {
          Object.assign(row, args.update ?? {}, { updatedAt: now() });
          return row;
        }
        const created: MockPushSubscriptionRow = {
          id: nextId("push"),
          userId,
          subscriptionId,
          createdAt: now(),
          updatedAt: now(),
        };
        mockDb.pushSubscriptions.push(created);
        return created;
      },
    ),
    deleteMany: vi.fn(
      async (args: {
        where: { userId: string; subscriptionId?: string };
      }) => {
        const before = mockDb.pushSubscriptions.length;
        mockDb.pushSubscriptions = mockDb.pushSubscriptions.filter(
          (p) =>
            !(
              p.userId === args?.where?.userId &&
              (args?.where?.subscriptionId
                ? p.subscriptionId === args?.where?.subscriptionId
                : true)
            ),
        );
        return { count: before - mockDb.pushSubscriptions.length };
      },
    ),
  },

  // v1.0.6.9 (English 1.0.1.12) — اعلان‌های واقعی کاربر
  notification: {
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const row: MockNotificationRow = {
        id: nextId("notif"),
        userId: args.data.userId as string,
        type: (args.data.type as string) ?? "system",
        titleFa: (args.data.titleFa as string) ?? "",
        titleEn: (args.data.titleEn as string | null) ?? null,
        textFa: (args.data.textFa as string) ?? "",
        textEn: (args.data.textEn as string | null) ?? null,
        link: (args.data.link as string | null) ?? null,
        isRead: false,
        readAt: null,
        createdAt: now(),
      };
      mockDb.notifications.push(row);
      return row;
    }),
    count: vi.fn(
      async (args: {
        where?: { userId?: string; isRead?: boolean };
      }) => matchNotifications(args?.where ?? {}).length,
    ),
    findMany: vi.fn(
      async (args: {
        where?: Record<string, unknown>;
        orderBy?: { createdAt?: "asc" | "desc" };
        take?: number;
        select?: Record<string, unknown>;
      }) => {
        let rows = matchNotifications(args?.where ?? {});
        const order = args?.orderBy?.createdAt;
        if (order === "asc") {
          rows = rows.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
          );
        } else if (order === "desc") {
          rows = rows.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
        }
        if (typeof args?.take === "number" && args.take >= 0) {
          rows = rows.slice(0, args.take);
        }
        // select { id: true } → فقط شناسه‌ها (همان الگوی prisma)
        if (
          args?.select &&
          typeof args.select === "object" &&
          "id" in args.select &&
          Object.keys(args.select).length === 1
        ) {
          return rows.map((n) => ({ id: n.id }));
        }
        return rows;
      },
    ),
    updateMany: vi.fn(
      async (args: {
        where?: Record<string, unknown>;
        data?: Record<string, unknown>;
      }) => {
        const rows = matchNotifications(args?.where ?? {});
        for (const row of rows) Object.assign(row, args?.data ?? {});
        return { count: rows.length };
      },
    ),
    deleteMany: vi.fn(
      async (args: {
        where?: Record<string, unknown>;
      }) => {
        const rows = matchNotifications(args?.where ?? {});
        const ids = new Set(rows.map((n) => n.id));
        const before = mockDb.notifications.length;
        mockDb.notifications = mockDb.notifications.filter(
          (n) => !ids.has(n.id),
        );
        return { count: before - mockDb.notifications.length };
      },
    ),
  },
};