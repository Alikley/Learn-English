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
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/app/context/NotificationContext";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar({
  toggleSidebar,
  isOpen,
}: {
  toggleSidebar: () => void;
  isOpen: boolean;
}) {
  const { notifications, unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const recentNotifications = notifications.slice(0, 3);

  return (
    <header className="h-20 border-b border-slate-100 bg-white shrink-0 z-30">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* همبرگر موبایل */}
          <button onClick={toggleSidebar} className="md:hidden p-1">
            <Menu
              className={`h-6 w-6 ${isOpen ? "text-blue-600" : "text-slate-700"}`}
            />
          </button>

          {/* پروفایل دسکتاپ */}
          <div className="relative group hidden sm:block">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="profile"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-800">
                {user?.name ?? "کاربر"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-hover:rotate-180" />
            </div>

            {/* منوی کشویی */}
            <div className="absolute top-14 left-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-1">
                  <Calendar size={14} />
                  <span>زمان باقی مانده اشتراک</span>
                </div>
                <div className="text-slate-800 font-bold text-lg">12 روز</div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full w-3/4" />
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={16} />
                  <span>ویرایش پروفایل</span>
                </Link>
                {/* ✅ دکمه logout - به جای Link */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* آیکون پروفایل موبایل */}
          <div className="block sm:hidden">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
          </div>

          {/* زنگوله */}
          <div className="relative group">
            <button className="relative flex items-center justify-center">
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-slate-700 hover:text-blue-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="absolute top-12 left-0 w-64 md:w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="mt-1 shrink-0">
                        {notif.isRead ? (
                          <MessageCircle size={16} className="text-gray-400" />
                        ) : (
                          <AlertCircle size={16} className="text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm leading-tight ${!notif.isRead ? "text-slate-900 font-medium" : "text-slate-700"}`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {notif.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-2">
                    هیچ پیامی نیست
                  </p>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <Link
                  href="/notif"
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  مشاهده همه
                </Link>
              </div>
            </div>
          </div>

          {/* جستجو */}
          <div className="relative group">
            <button>
              <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-700 hover:text-blue-600" />
            </button>
            <div className="absolute top-12 right-0 w-64 md:w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* لوگو */}
        <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600">
          flex <span className="text-slate-900">English</span>
        </Link>
      </div>
    </header>
  );
}
