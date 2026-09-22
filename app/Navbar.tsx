"use client";

import Image from "next/image";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Calendar,
  MessageCircle,
  AlertCircle,
  Menu,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/app/context/NotificationContext";
import { useAuth } from "@/app/context/AuthContext";
import { useStreak } from "@/app/hook/useStreak";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { LanguageToggle } from "@/app/components/LanguageToggle";

export default function Navbar({
  toggleSidebar,
  isOpen,
}: {
  toggleSidebar: () => void;
  isOpen: boolean;
}) {
  const { notifications, unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const { streak } = useStreak();
  const recentNotifications = notifications.slice(0, 3);

  return (
    <header className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-30 transition-colors duration-300">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Right Side (start in RTL) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* همبرگر موبایل */}
          <button onClick={toggleSidebar} className="md:hidden p-1">
            <Menu
              className={`h-6 w-6 ${isOpen ? "text-blue-600" : "text-slate-700 dark:text-slate-200"}`}
            />
          </button>

          {/* پروفایل دسکتاپ */}
          <div className="relative group hidden sm:block">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="profile"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {user?.name ?? "کاربر"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform group-hover:rotate-180" />
            </div>

            {/* منوی کشویی */}
            <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-medium mb-1">
                  <Calendar size={14} />
                  <span>زمان باقی مانده اشتراک</span>
                </div>
                <div className="text-slate-800 dark:text-slate-100 font-bold text-lg">
                  12 روز
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-500/30 h-1.5 rounded-full mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full w-3/4" />
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User size={16} />
                  <span>ویرایش پروفایل</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* آیکون پروفایل موبایل */}
          <div className="block sm:hidden">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
          </div>

          {/* ✅ استریک روزهای متوالی — فقط دسکتاپ (v1.0.2.۱: در موبایل داخل کشوی همبرگر) */}
          {streak.current > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-100 dark:border-orange-500/20">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-300">
                {streak.current}
              </span>
            </div>
          )}

          {/* زبان سایت (v1.0.1.۹ — فا / EN) — فقط دسکتاپ (موبایل: داخل کشوی سایدبار) */}
          <div className="hidden md:block">
            <LanguageToggle />
          </div>

          {/* زنگوله */}
          <div className="relative group">
            <button className="relative flex items-center justify-center">
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="absolute top-12 left-0 w-64 md:w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="mt-1 shrink-0">
                        {notif.isRead ? (
                          <MessageCircle
                            size={16}
                            className="text-gray-400 dark:text-slate-500"
                          />
                        ) : (
                          <AlertCircle
                            size={16}
                            className="text-orange-500"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm leading-tight ${!notif.isRead ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {notif.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                    هیچ پیامی نیست
                  </p>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Link
                  href="/notif"
                  className="block text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  مشاهده همه
                </Link>
              </div>
            </div>
          </div>

          {/* جستجو */}
          <div className="relative group">
            <button>
              <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400" />
            </button>
            <div className="absolute top-12 right-0 w-64 md:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* ✅ حالت روشن/تیره — فقط دسکتاپ (v1.0.2.۱: در موبایل داخل کشوی همبرگر) */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>

        {/* لوگو */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          flex <span className="text-slate-900 dark:text-slate-100">English</span>
        </Link>
      </div>
    </header>
  );
}
