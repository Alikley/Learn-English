import type { WordHoverTarget } from "./WordHoverProvider";

// ========================================
// جای‌گذاری پاپ‌آور هاور کلمه
// (از WordPopover تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

/** عرض ثابت پاپ‌آور (px) */
export const POPOVER_W = 240;

/** ارتفاع تخمینی پاپ‌آور برای تصمیم زیر/بالای کلمه (px) */
const ESTIMATED_H = 200;

export type PopoverPosition = { top: number; left: number };

/** زیر کلمه قرار بگیر؛ اگر جا نبود، بالای آن */
export function computePopoverPosition(target: WordHoverTarget): PopoverPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = target.x + target.width / 2 - POPOVER_W / 2;
  left = Math.max(8, Math.min(left, vw - POPOVER_W - 8));
  const below = target.y + 8;
  const top =
    below + ESTIMATED_H < vh ? below : Math.max(8, target.y - ESTIMATED_H - 24);
  return { top, left };
}
