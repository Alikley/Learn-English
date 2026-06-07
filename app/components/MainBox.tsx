"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

export default function MainBox() {
  return (
    <div className="w-full min-h-full bg-[#fbfbfb]">
      {/* ================= HERO ================= */}

      <section className="mx-5 mt-5 rounded-4xl bg-[#F3F8FF] relative overflow-hidden h-[280px]">
        {/* Shape Top Left */}
        <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-blue-200/30" />

        {/* Shape Bottom Left */}
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-200/30 -translate-x-8 translate-y-8" />

        {/* Shape Top Right */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-200/30 translate-x-8 -translate-y-8" />

        <div className="relative z-10 flex h-full">
          {/* Character */}
          <div className="w-[35%] flex items-end justify-center">
            <Image
              src="/assets/student_image.svg"
              alt="Student Character"
              width={440}
              height={440}
              priority
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-end text-right">
              <h1 className="text-[48px] leading-none font-bold text-slate-900">
                <span>!خوش آمدید</span>{" "}
                <span className="text-blue-600">flex English</span>{" "}
                <span>به</span>
              </h1>

              <p className="mt-6 text-[20px] text-slate-600">
                .یادگیری زبان انگلیسی را به ساده‌ترین و جذاب‌ترین شکل تجربه کنید
              </p>

              <button className="mt-8 flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 text-white font-medium shadow-md transition hover:bg-blue-700">
                <ArrowLeft size={18} />
                ادامه یادگیری
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COURSES ================= */}

      <section className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">دوره‌های من</h2>

          <Link
            href="/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Grammar */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-36 bg-blue-500 flex items-center justify-center">
              <Play size={30} className="text-white fill-white" />
            </div>

            <div className="p-4 text-right">
              <h3 className="font-semibold text-slate-800">گرامر ضروریات</h3>

              <p className="mt-1 text-sm text-slate-500">سطح مقدماتی</p>

              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[65%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-36 bg-teal-500 flex items-center justify-center">
              <Play size={30} className="text-white fill-white" />
            </div>

            <div className="p-4 text-right">
              <h3 className="font-semibold text-slate-800">مکالمه روزمره</h3>

              <p className="mt-1 text-sm text-slate-500">سطح مقدماتی</p>

              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[40%] rounded-full bg-teal-500" />
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-36 bg-purple-500 flex items-center justify-center">
              <Play size={30} className="text-white fill-white" />
            </div>

            <div className="p-4 text-right">
              <h3 className="font-semibold text-slate-800">لغات کاربردی</h3>

              <p className="mt-1 text-sm text-slate-500">سطح مقدماتی</p>

              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[20%] rounded-full bg-purple-500" />
              </div>
            </div>
          </div>

          {/* Listening */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-36 bg-orange-500 flex items-center justify-center">
              <Play size={30} className="text-white fill-white" />
            </div>

            <div className="p-4 text-right">
              <h3 className="font-semibold text-slate-800">لیسنینگ در عمل</h3>

              <p className="mt-1 text-sm text-slate-500">سطح متوسط</p>

              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[10%] rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
