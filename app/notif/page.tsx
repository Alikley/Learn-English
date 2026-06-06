"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import { useState } from "react";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, deleteNotification } =
    useNotifications();

  // برای باز/بسته شدن
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      markAsRead(id); // وقتی باز می‌شود، خوانده شده می‌شود
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">اعلان‌ها</h1>
        </div>
        <span className="text-sm text-slate-500">
          {unreadCount} عدد خوانده نشده
        </span>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-500">هیچ پیامی وجود ندارد.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden ${!notif.isRead ? "bg-blue-50/80 border-blue-200" : ""}`}
            >
              <div
                className="p-4 cursor-pointer flex items-start justify-between"
                onClick={() => handleToggle(notif.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-medium ${!notif.isRead ? "text-blue-800" : "text-slate-800"}`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        جدید
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{notif.date}</p>
                </div>
                {expandedId === notif.id ? (
                  <ChevronUp size={20} className="text-slate-400" />
                ) : (
                  <ChevronDown size={20} className="text-slate-400" />
                )}
              </div>

              {expandedId === notif.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-white p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                    {notif.text}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                      <span>حذف پیام</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
