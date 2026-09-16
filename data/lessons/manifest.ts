// ========================================
// مانیفست درس‌ها — v1.0.1.2
// فهرست کامل ۱۲۰ درس (۴ بخش × ۳ سطح × ۱۰ درس)
// منبع داده seed — فقط سمت سرور (client از index.ts استفاده می‌کند)
// ========================================

import type { LessonManifestEntry, LessonKind } from "./types";
import { LESSONS as GB } from "./grammar-beginner";
import { LESSONS as GI } from "./grammar-intermediate";
import { LESSONS as GA } from "./grammar-advanced";
import { LESSONS as CB } from "./conversation-beginner";
import { LESSONS as CI } from "./conversation-intermediate";
import { LESSONS as CA } from "./conversation-advanced";
import { LESSONS as VB } from "./vocabulary-beginner";
import { LESSONS as VI } from "./vocabulary-intermediate";
import { LESSONS as VA } from "./vocabulary-advanced";
import { LESSONS as LB } from "./listening-beginner";
import { LESSONS as LI } from "./listening-intermediate";
import { LESSONS as LA } from "./listening-advanced";

// XP بر اساس نوع و سطح (مبتدی/متوسط/پیشرفته)
const XP_BY_KIND: Record<LessonKind, [number, number, number]> = {
  grammar: [20, 25, 30],
  conversation: [25, 30, 35],
  vocabulary: [20, 25, 30],
  listening: [40, 45, 50],
};

const DURATION_BY_KIND: Record<LessonKind, number> = {
  grammar: 10,
  conversation: 8,
  vocabulary: 7,
  listening: 5,
};

function levelIndex(courseSlug: string): number {
  if (courseSlug.endsWith("-beginner")) return 0;
  if (courseSlug.endsWith("-intermediate")) return 1;
  return 2;
}

function toManifest(
  lessons: { slug: string; kind: LessonKind; titleFa: string; titleEn: string; cefr: string }[],
): LessonManifestEntry[] {
  return lessons.map((l) => {
    const courseSlug = l.slug.replace(/-\d+$/, "");
    const order = Number(l.slug.split("-").pop());
    return {
      slug: l.slug,
      kind: l.kind,
      courseSlug,
      order,
      titleFa: l.titleFa,
      titleEn: l.titleEn,
      cefr: l.cefr as LessonManifestEntry["cefr"],
      xp: XP_BY_KIND[l.kind][levelIndex(courseSlug)],
      durationMin: DURATION_BY_KIND[l.kind],
    };
  });
}

export const LESSON_MANIFEST: LessonManifestEntry[] = [
  ...toManifest(GB),
  ...toManifest(GI),
  ...toManifest(GA),
  ...toManifest(CB),
  ...toManifest(CI),
  ...toManifest(CA),
  ...toManifest(VB),
  ...toManifest(VI),
  ...toManifest(VA),
  ...toManifest(LB),
  ...toManifest(LI),
  ...toManifest(LA),
];

export function lessonsOfCourse(courseSlug: string): LessonManifestEntry[] {
  return LESSON_MANIFEST.filter((l) => l.courseSlug === courseSlug).sort(
    (a, b) => a.order - b.order,
  );
}
