"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Home,
  BookOpen,
  Pencil,
  Gamepad2,
  Library,
  MessageCircle,
  LibraryBig,
  Flame,
  Moon,
  Globe,
  X,
} from "lucide-react";
import { useStreak } from "@/app/hook/useStreak";
import { useTheme } from "@/app/context/ThemeContext";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// سایدبار (v1.0.2.5)
// - چیدمان طبق 1.0.2.1: سوییچ‌ها در نوار بالا
//   (دسکتاپ)؛ بخش تنظیمات فقط در کشوی موبایل
// - دکمهٔ بستن کشو با آیکون X
// - برچسب‌ها با انتخاب زبان (فا/EN) عوض می‌شوند
// ========================================

const menuItems = [
  { labelFa: "داشبورد", labelEn: "Dashboard", icon: Home, href: "/dashboard" },
  { labelFa: "تمرین‌ها", labelEn: "Practice", icon: Pencil, href: "/training" },
  { labelFa: "بازی‌ها", labelEn: "Games", icon: Gamepad2, href: "/game" },
  { labelFa: "کتابخانه", labelEn: "Library", icon: LibraryBig, href: "/library" },
  { labelFa: "لغت‌نامه", labelEn: "Vocabulary", icon: Library, href: "/vocab" },
  { labelFa: "دوره‌های من", labelEn: "My Courses", icon: BookOpen, href: "/courses" },
  { labelFa: "پیام‌ها", labelEn: "Messages", icon: MessageCircle, href: "/chat" },
];

const iconAnimations: Record<
  string,
  {
    rotate?: number[];
    rotateY?: number[];
    x?: number[];
    scale?: number[];
    y?: number[];
    scaleY?: number[];
    transition: { duration: number; repeat?: number };
  }
> = {
  "/dashboard": { rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5 } },
  "/my-course": { rotateY: [0, 180, 360], transition: { duration: 0.6 } },
  "/training": { x: [0, -3, 3, -2, 0], transition: { duration: 0.4 } },
  "/game": { scale: [1, 1.3, 0.9, 1.15, 1], transition: { duration: 0.5 } },
  "/vocab": { y: [0, -5, 0, -3, 0], transition: { duration: 0.5 } },
  "/chat": { scale: [1, 1.2, 1], transition: { duration: 0.3, repeat: 1 } },
};

function SidebarItem({
  item,
  isActive,
  onClose,
  label,
}: {
  item: (typeof menuItems)[0];
  isActive: boolean;
  onClose?: () => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
        ${
          isActive
            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium"
            : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
        }
      `}
    >
      <motion.div
        animate={hovered ? iconAnimations[item.href] : {}}
        className="shrink-0"
      >
        <item.icon size={25} />
      </motion.div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

// ========================================
// ردیف تنظیمات کشو — فقط موبایل (md:hidden)
// حالت تیره و زبان سایت اینجا در دسترس‌اند؛
// در دسکتاپ این دو در نوار بالای سایت هستند
// فقط کلیک + حالت انیمیشنی
// ========================================
function SidebarSettings() {
  const { theme, toggle: toggleTheme, mounted: themeMounted } = useTheme();
  const { lang, toggle: toggleLang, mounted: langMounted } = useLanguage();

  const isDark = themeMounted && theme === "dark";
  const currentLang = langMounted ? lang : "fa";
  const en = langMounted && lang === "en";

  return (
    <div className="md:hidden p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
      {/* حالت روشن/تیره */}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isDark
              ? "bg-indigo-500/15 text-indigo-400"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          <Moon className="h-4.5 w-4.5" />
        </div>
        <span className="flex-1 text-start text-sm font-medium text-slate-700 dark:text-slate-200">
          {en
            ? isDark
              ? "Dark Mode"
              : "Light Mode"
            : isDark
              ? "حالت تیره"
              : "حالت روشن"}
        </span>
        {/* سوییچ انیمیشنی */}
        <span
          className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 shrink-0 ${
            isDark ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all duration-300 ${
              isDark ? "right-0.5" : "right-5"
            }`}
          />
        </span>
      </button>

      {/* زبان سایت — فقط کلیک + قرص لغزنده انیمیشنی */}
      <button
        onClick={toggleLang}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
          <Globe className="h-4.5 w-4.5" />
        </div>
        <span className="flex-1 text-start text-sm font-medium text-slate-700 dark:text-slate-200">
          {en ? "Site Language" : "زبان سایت"}
        </span>
        {/* قرص لغزنده فا / EN */}
        <span className="relative flex items-center w-14 h-5.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
          <span
            className={`absolute top-0.5 h-4.5 w-6.5 rounded-full bg-blue-600 shadow transition-all duration-300 ${
              currentLang === "fa" ? "right-0.5" : "right-7"
            }`}
          />
          <span className="relative z-10 flex-1 text-center text-[10px] font-bold text-white">
            فا
          </span>
          <span className="relative z-10 flex-1 text-center text-[10px] font-bold text-slate-500 dark:text-slate-300">
            EN
          </span>
        </span>
      </button>
    </div>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { streak } = useStreak();
  const { lang, mounted: langMounted } = useLanguage();
  const en = langMounted && lang === "en";

  // پیام انگیزشی بر اساس عدد استریک
  const getMessage = () => {
    if (streak.current === 0)
      return en ? "Start a new journey!" : "شروع یک مسیر جدید!";
    if (streak.current < 3)
      return en ? "Awesome! You're getting started" : "فوق‌العاده! داری شروع میکنی";
    if (streak.current < 7)
      return en ? "Great! Keep it up" : "عالی! به همین راه ادامه بده";
    if (streak.current < 14)
      return en ? "Well done! Stay on track" : "آفرین! به مسیرت ادامه بده";
    if (streak.current < 30)
      return en ? "Pro! Practice every day" : "حرفه‌ای! هر روز تمرین کن";
    return en ? "Legendary! Over a month straight!" : "افسانه‌ای! بیش از یک ماه متوالی!";
  };

  return (
    <div className="h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col pt-16 md:pt-0 transition-colors duration-300">
      {/* دکمه بستن - فقط موبایل */}
      <div className="md:hidden flex justify-start px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          aria-label={en ? "Close menu" : "بستن منو"}
          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            onClose={onClose}
            label={en ? item.labelEn : item.labelFa}
          />
        ))}
      </nav>

      {/* ✅ تنظیمات: حالت تیره + زبان — فقط کشوی موبایل (دسکتاپ: نوار بالا) */}
      <SidebarSettings />

      {/* ✅ باکس روزهای متوالی — داینامیک (در موبایل داخل کشو) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm text-center">
          <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            {en ? "Learning Streak" : "روزهای متوالی یادگیری"}
          </h3>

          <div className="flex items-center justify-center gap-2 mb-0.5">
            {streak.current > 0 ? (
              <>
                <span className="text-4xl font-bold text-orange-500">
                  {streak.current}
                </span>
                <Flame className="h-6 w-6 text-orange-500" />
              </>
            ) : (
              <span className="text-4xl font-bold text-gray-300 dark:text-slate-600">
                0
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
            {en ? "days" : "روز"}
          </p>

          <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-slate-300">
            <span>🔥</span>
            <span>{getMessage()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
