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

export const mockDb = {
  users: [] as MockUserRow[],
  streaks: [] as MockStreakRow[],
  gameScores: [] as MockGameScoreRow[],
  listeningEpisodes: [] as MockListeningEpisodeRow[],
  listeningProgress: [] as MockListeningProgressRow[],
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

/** ایجاد کاربر با پشتیبانی از streak تودرتو (مثل register و linkGoogleUser) */
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
};
