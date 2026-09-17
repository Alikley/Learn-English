// ذخیره پیشرفت تمرین‌های ایستا (نسخه ۱.۰.۱.۴)
// بدون تغییر دیتابیس — بهترین نتیجه هر آیتم در localStorage

const PREFIX = "flex-practice";

export type StoredProgress = {
  stars: number;
  score: number;
  completedAt: string;
};

function key(section: string, id: string) {
  return `${PREFIX}:${section}:${id}`;
}

export function getProgress(
  section: "listening" | "grammar" | "writing",
  id: string,
): StoredProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(section, id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProgress;
    if (typeof parsed.stars !== "number" || typeof parsed.score !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** فقط اگر بهتر از نتیجه قبلی باشد ذخیره می‌شود — مثل منطق دیتابیس */
export function saveProgress(
  section: "listening" | "grammar" | "writing",
  id: string,
  stars: number,
  score: number,
): StoredProgress {
  const existing = getProgress(section, id);
  if (!existing || stars > existing.stars) {
    const value: StoredProgress = {
      stars,
      score,
      completedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(key(section, id), JSON.stringify(value));
    } catch {
      /* حافظه پر است — بی‌صدا رد شو */
    }
    return value;
  }
  return existing;
}

export function countCompleted(
  section: "listening" | "grammar" | "writing",
): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`${PREFIX}:${section}:`)) count++;
    }
  } catch {
    return 0;
  }
  return count;
}
