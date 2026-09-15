"use client";

import { useEffect, useState } from "react";

// ========================================
// هوک پلک‌زدن کاراکتر — مثل انسان، با فاصله تصادفی
//
// هر ۲.۴ تا ۶ ثانیه یک پلک ~۱۴۰ میلی‌ثانیه‌ای می‌زند؛
// گاهی (۲۰٪ مواقع) پلک دوتایی — دقیقاً مثل پلک انسان.
// تایمرها در unmount پاک می‌شوند.
// ========================================

export function useBlink() {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let openTimer = 0;
    let closeTimer = 0;

    const schedule = () => {
      openTimer = window.setTimeout(
        () => {
          setBlinking(true);
          closeTimer = window.setTimeout(
            () => {
              setBlinking(false);
              // پلک دوتایی گاه‌به‌گاه — طبیعی‌تر
              if (Math.random() < 0.2) {
                openTimer = window.setTimeout(() => {
                  setBlinking(true);
                  closeTimer = window.setTimeout(() => {
                    setBlinking(false);
                    schedule();
                  }, 120);
                }, 180);
              } else {
                schedule();
              }
            },
            140,
          );
        },
        2400 + Math.random() * 3600,
      );
    };

    schedule();
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    };
  }, []);

  return blinking;
}
