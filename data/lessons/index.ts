// ========================================
// رجیستری محتوای درس — v1.0.1.2
// slug مثل "grammar-beginner-03" → بارگذاری تنبل فایل مربوطه
// (import داینامیک = هر دوره فقط وقتی لازم شود لود می‌شود)
// ========================================

import type { LessonContent } from "./types";

type LessonModule = { LESSONS: LessonContent[] };

const LOADERS: Record<string, () => Promise<LessonModule>> = {
  "grammar-beginner": () => import("./grammar-beginner"),
  "grammar-intermediate": () => import("./grammar-intermediate"),
  "grammar-advanced": () => import("./grammar-advanced"),
  "conversation-beginner": () => import("./conversation-beginner"),
  "conversation-intermediate": () => import("./conversation-intermediate"),
  "conversation-advanced": () => import("./conversation-advanced"),
  "vocabulary-beginner": () => import("./vocabulary-beginner"),
  "vocabulary-intermediate": () => import("./vocabulary-intermediate"),
  "vocabulary-advanced": () => import("./vocabulary-advanced"),
  "listening-beginner": () => import("./listening-beginner"),
  "listening-intermediate": () => import("./listening-intermediate"),
  "listening-advanced": () => import("./listening-advanced"),
};

/**
 * slug درس مثل "grammar-beginner-03" را به محتوای کامل آن تبدیل می‌کند.
 * اگر slug ناشناخته باشد null برمی‌گردد.
 */
export async function loadLessonContent(
  slug: string,
): Promise<LessonContent | null> {
  const courseSlug = slug.replace(/-\d+$/, "");
  const loader = LOADERS[courseSlug];
  if (!loader) return null;
  const mod = await loader();
  return mod.LESSONS.find((l) => l.slug === slug) ?? null;
}

export function lessonCourseSlug(slug: string): string {
  return slug.replace(/-\d+$/, "");
}
