"use client";

import { useState } from "react";

export default function ProfileBox({
  nickname,
  phone,
  name,
  email,
  saving,
  onSave,
}: {
  nickname: string;
  phone: string;
  name: string | null;
  email: string | null;
  saving: boolean;
  onSave: (nickname: string, phone: string) => Promise<boolean>;
}) {
  const [editNick, setEditNick] = useState(nickname);
  const [editPhone, setEditPhone] = useState(phone);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const ok = await onSave(editNick, editPhone);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* هدر */}
      <div className="bg-linear-to-l from-blue-600 to-indigo-600 px-6 py-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          اطلاعات پروفایل
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          نام مستعار روی نوبار نمایش داده می‌شود
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* ایمیل (فقط خواندنی) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            ایمیل
          </label>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {email || "—"}
          </div>
        </div>

        {/* نام اصلی (فقط خواندنی) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            نام اصلی
          </label>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {name || "—"}
          </div>
        </div>

        {/* نام مستعار (قابل ویرایش) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            نام مستعار <span className="text-blue-500">(نمایش در نوبار)</span>
          </label>
          <input
            type="text"
            value={editNick}
            onChange={(e) => setEditNick(e.target.value)}
            placeholder="مثلاً: علی، سارا..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800"
          />
        </div>

        {/* شماره تلفن */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            شماره تلفن
          </label>
          <input
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800"
            dir="ltr"
          />
        </div>

        {/* دکمه ذخیره */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-linear-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              در حال ذخیره...
            </>
          ) : saved ? (
            <>✅ ذخیره شد!</>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              ذخیره تغییرات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
