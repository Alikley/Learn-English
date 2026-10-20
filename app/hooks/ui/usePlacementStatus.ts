"use client";

import { useEffect, useState } from "react";

// ========================================
// هوک وضعیت تعیین سطح (v1.0.2.2 / English 1.0.2.2)
//
// یک درخواست سبک به /api/placement/status سطح CEFR کاربرِ
// واردشده را می‌گیرد (null = هنوز تست نداده). نتیجه در کش
// درون‌حافظه‌ای ماژول می‌ماند تا هنگام هر ناوبری دوباره
// زده نشود؛ به‌روزرسانی با رویداد جهانی (همان الگوی
// flex-streak-updated در useStreak):
//   - بعد از ثبت نتیجهٔ تست در /placement → announcePlacement
//   - نوبار، AuthGuard و هر مصرف‌کنندهٔ دیگر بلافاصله
//     مقدار تازه را می‌گیرند — بدون رفرش صفحه.
//
// fail-open: خطای شبکه/دیتابیس هرگز سایت را قفل نمی‌کند؛
// فقط گیت تعیین سطح غیرفعال می‌شود.
// ========================================

/** رویداد جهانی «وضعیت تعیین سطح به‌روز شد» */
export const PLACEMENT_UPDATED_EVENT = "flex-placement-updated";

export type PlacementStatus = {
  /** وضعیت از سرور رسیده؟ (false → هنوز لود نشده، گیت نزن) */
  loaded: boolean;
  /** جدول تعیین سطح موجوده؟ (مایگریتن نرسیده → گیت نزن) */
  available: boolean;
  /** سطح CEFR کاربر — null = تست نداده */
  cefr: string | null;
  /** کاربری که این وضعیت مال اوست — با تغییر نشست تازه می‌گیریم */
  userId: string | null;
};

let cache: PlacementStatus = {
  loaded: false,
  available: false,
  cefr: null,
  userId: null,
};
let inflight: Promise<PlacementStatus> | null = null;

function publish(next: PlacementStatus) {
  cache = next;
  try {
    window.dispatchEvent(
      new CustomEvent<PlacementStatus>(PLACEMENT_UPDATED_EVENT, { detail: next }),
    );
  } catch {
    /* SSR — رویداد فقط مرورگر */
  }
}

/** گرفتن وضعیت از سرور (کش با کلید userId — با عوض‌شدن کاربر تازه می‌گیرد) */
export async function fetchPlacementStatus(
  userId: string | null,
  force = false,
): Promise<PlacementStatus> {
  if (!userId) return cache;
  if (!force && cache.loaded && cache.userId === userId) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    let next: PlacementStatus = { ...cache, userId };
    try {
      const res = await fetch("/api/placement/status");
      if (res.status === 401) {
        // کاربر وارد نشده (یا سشن خاموش) → گیت و بج غیرفعال
        next = { loaded: true, available: false, cefr: null, userId: null };
      } else if (res.ok) {
        const data = (await res.json()) as { available?: boolean; cefr?: string | null };
        next = {
          loaded: true,
          available: data.available === true,
          cefr: data.cefr ?? null,
          userId,
        };
      } else {
        // خطای سرور → وضعیت قبلی می‌ماند؛ گیت fail-open
        next = { ...cache, userId };
      }
    } catch {
      /* آفلاین → بدون تغییر */
      next = { ...cache, userId };
    } finally {
      inflight = null;
    }
    publish(next);
    return next;
  })();

  return inflight;
}

/** اعلام فوری سطح جدید (بعد از موفقیت POST /api/placement) — همهٔ بج‌ها همزمان تازه می‌شوند */
export function announcePlacement(cefr: string) {
  publish({ loaded: true, available: true, cefr, userId: cache.userId });
}

/**
 * وضعیت تعیین سطح کاربر جاری — در اولین مونت (و با تغییر
 * کاربر) از سرور می‌گیرد؛ رویداد global آن را زنده نگه می‌دارد.
 */
export function usePlacementStatus(userId: string | null): PlacementStatus {
  const [status, setStatus] = useState<PlacementStatus>(cache);

  useEffect(() => {
    const t = setTimeout(() => void fetchPlacementStatus(userId), 0);
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<PlacementStatus>).detail;
      if (detail) setStatus(detail);
      else setStatus(cache);
    };
    window.addEventListener(PLACEMENT_UPDATED_EVENT, onUpdated as EventListener);
    return () => {
      clearTimeout(t);
      window.removeEventListener(PLACEMENT_UPDATED_EVENT, onUpdated as EventListener);
    };
  }, [userId]);

  return status;
}
