"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, X } from "lucide-react";
import { useStreak } from "@/app/hook/ui/useStreak";
import { useLanguage } from "@/app/context/LanguageContext";
import { STREAK_ACTIVITY_EVENT } from "@/lib/streak-events";

// ========================================
// آلرت روزهای متوالی (v1.0.3.0 — گام ۳)
// دو راه نمایش:
//  ۱) ورود به سایت — فقط یک بار در هر سشن (مثل قبل)
//  ۲) اتمام فعالیت (بازی/درس/تمرین/کتاب/لغت/گرامر) — بی‌درنگ
//     و بدون نیاز به رفرش: هر کامپوننتی که فعالیتی را تمام
//     می‌کند notifyStreakActivity() را صدا می‌زند؛ اینجا گوش
//     می‌دهیم، استریک تازه را می‌گیریم و آلرت را همان لحظه
//     با شمارش به‌روز نشان می‌دهیم.
// ========================================

export default function StreakLoginAlert() {
  const { streak, loading } = useStreak();
  const { tr } = useLanguage();
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // نمایش + زمان‌بندی بستن خودکار (۵ ثانیه)
  // (الگوی تاخیری — سازگار با react-hooks/set-state-in-effect)
  const showNow = useCallback((value: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setCurrent(value);
    setShow(true);
    hideTimer.current = setTimeout(() => setShow(false), 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // ---- تریگر ۱: ورود به سایت (فقط یک بار در هر سشن) ----
  useEffect(() => {
    if (loading) return;

    const shown = sessionStorage.getItem("streak_alert_shown");
    if (shown) return;

    if (streak.current > 0) {
      sessionStorage.setItem("streak_alert_shown", "true");
      const t = setTimeout(() => showNow(streak.current), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, streak.current]);

  // ---- تریگر ۲: اتمام فعالیت — بی‌درنگ و بدون رفرش (گام ۳) ----
  useEffect(() => {
    const onActivity = () => {
      // استریک تازه را بگیر و همان لحظه نشان بده
      void (async () => {
        try {
          const res = await fetch("/api/streak", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { current: number };
            if (data.current > 0) {
              showNow(data.current);
              return;
            }
          }
        } catch {
          /* آفلاین — استریک فعلی را نشان بده */
        }
        if (streak.current > 0) showNow(streak.current);
      })();
    };

    window.addEventListener(STREAK_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(STREAK_ACTIVITY_EVENT, onActivity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak.current]);

  // برای نمایش از مقدار لحظه‌ای (تریگر ۲) یا مقدار هوک (تریگر ۱) استفاده می‌کنیم
  const display = show ? current : streak.current;

  const getMessage = () => {
    if (display === 1)
      return tr(
        "امروز اولین قدمت رو برداشتی! هر روز تمرین کن تا استریک‌ت حفظ بشه.",
        "You took your first step today! Practice daily to keep your streak."
      );
    if (display < 7)
      return tr(
        `${display} روز متوالی تمرین کردی! به همین روند ادامه بده.`,
        `${display} days in a row! Keep up the pace.`
      );
    if (display < 30)
      return tr(
        `${display} روز متوالی! داری فوق‌العاده پیشرفت میکنی.`,
        `${display} days straight! You're progressing amazingly.`
      );
    return tr(
      `${display} روز متوالی! تو واقعاً حرفه‌ای هستی!`,
      `${display} days straight! You're truly a pro!`
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-100 w-[90%] max-w-md"
        >
          <div className="bg-linear-to-l from-orange-500 to-red-500 rounded-2xl p-5 shadow-2xl shadow-orange-200/50 dark:shadow-black/40 text-white relative overflow-hidden">
            {/* بک‌گراند پترن */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-4 text-6xl">🔥</div>
              <div className="absolute bottom-2 left-6 text-4xl">✨</div>
            </div>

            {/* دکمه بستن */}
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>

            {/* محتوا */}
            <div className="relative flex items-center gap-4">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Flame className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black">{display}</span>
                  <span className="text-sm font-medium text-orange-100">
                    {tr("روز متوالی!", "day streak!")}
                  </span>
                </div>
                <p className="text-sm text-orange-100 leading-relaxed">
                  {getMessage()}
                </p>
              </div>
            </div>

            {/* پروگرس بار */}
            {display > 0 && display < 7 && (
              <div className="relative mt-4">
                <div className="flex justify-between text-xs text-orange-100 mb-1">
                  <span>{tr("رکورد بعدی: ۷ روز", "Next milestone: 7 days")}</span>
                  <span>{display}/7</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(display / 7) * 100}%`,
                    }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-yellow-300 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
