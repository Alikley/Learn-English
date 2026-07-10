"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, X } from "lucide-react";
import { useStreak } from "@/app/hook/useStreak";

export default function StreakLoginAlert() {
  const { streak, loading } = useStreak();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading) return;

    // فقط یک بار تو هر سشن نشون بده
    const shown = sessionStorage.getItem("streak_alert_shown");
    if (shown) return;

    // اگه استریک هست یا اولین باره → نشون بده
    if (streak.current > 0) {
      const showTimer = window.setTimeout(() => setShow(true), 0);
      sessionStorage.setItem("streak_alert_shown", "true");

      // خودکار بعد از ۵ ثانیه ببند
      const hideTimer = window.setTimeout(() => setShow(false), 5000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [loading, streak.current]);

  const getMessage = () => {
    if (streak.current === 1)
      return "امروز اولین قدمت رو برداشتی! هر روز تمرین کن تا استریک‌ت حفظ بشه.";
    if (streak.current < 7)
      return `${streak.current} روز متوالی تمرین کردی! به همین روند ادامه بده.`;
    if (streak.current < 30)
      return `${streak.current} روز متوالی! داری فوق‌العاده پیشرفت میکنی.`;
    return `${streak.current} روز متوالی! تو واقعاً حرفه‌ای هستی!`;
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
          <div className="bg-linear-to-l from-orange-500 to-red-500 rounded-2xl p-5 shadow-2xl shadow-orange-200/50 text-white relative overflow-hidden">
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
                  <span className="text-3xl font-black">{streak.current}</span>
                  <span className="text-sm font-medium text-orange-100">
                    روز متوالی!
                  </span>
                </div>
                <p className="text-sm text-orange-100 leading-relaxed">
                  {getMessage()}
                </p>
              </div>
            </div>

            {/* پروگرس بار */}
            {streak.current > 0 && streak.current < 7 && (
              <div className="relative mt-4">
                <div className="flex justify-between text-xs text-orange-100 mb-1">
                  <span>رکورد بعدی: ۷ روز</span>
                  <span>{streak.current}/7</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(streak.current / 7) * 100}%`,
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
