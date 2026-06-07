"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

export default function MainBox() {
  return (
    // باکس اصلی با سایه تیره، کاملاً چسبیده به لبه‌ها
    <div className="bg-[#fbfbfb] shadow-xl w-full h-full flex flex-col">
      {/* --- بخش بنر (با فاصله داخلی و متن در جای درست) --- */}
      <div className="bg-[#F0F7FF] p-8 md:p-10 m-4 md:m-6 rounded-3xl relative flex flex-col md:flex-row items-center justify-between overflow-hidden">
        {/* تصویر کاراکتر (سمت چپ) */}
        <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0 z-10 order-2 md:order-1">
          <Image
            src="/assets/3d-boy.png" // عکس کاراکتر
            alt="3D Character"
            width={250}
            height={250}
            className="object-contain w-40 md:w-56"
          />
        </div>

        {/* متن و دکمه (سمت راست - دقیقاً جایی که علامت زرد زدی) */}
        <div className="w-full md:w-2/3 flex flex-col items-start md:items-start z-10 order-1 md:order-2">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2 text-right">
            <span>!خوش آمدید</span>
            {"  "}
            <span className="text-blue-600">flex English</span> <span>به</span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg mb-6 max-w-xl text-right">
            .یادگیری زبان انگلیسی را به ساده‌ترین و جذاب‌ترین شکل تجربه کنید
          </p>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} />
            ادامه یادگیری
          </button>
        </div>

        {/* اشکال پس‌زمینه */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 -ml-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-200 rounded-full opacity-20 -mr-10 -mb-10 pointer-events-none"></div>
      </div>

      {/* --- بخش دوره‌های من --- */}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">دوره‌های من</h2>
          <Link
            href="/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        {/* گرید دوره‌ها - ۴ مورد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* کارت ۱: Grammar */}
          <div className="bg-blue-500 rounded-xl overflow-hidden shadow-sm">
            <div className="h-28 bg-blue-400 p-3 flex flex-col justify-between relative">
              <div className="flex justify-center items-center h-full">
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm text-slate-800 text-right">
                گرامر ضروریات
              </h3>
              <p className="text-xs text-slate-500 text-right">سطح مقدماتی</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="h-1.5 bg-blue-500 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">65%</span>
              </div>
            </div>
          </div>

          {/* کارت ۲: Conversation */}
          <div className="bg-teal-500 rounded-xl overflow-hidden shadow-sm">
            <div className="h-28 bg-teal-400 p-3 flex flex-col justify-between relative">
              <div className="flex justify-center items-center h-full">
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm text-slate-800 text-right">
                مکالمه روزمره
              </h3>
              <p className="text-xs text-slate-500 text-right">سطح مقدماتی</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="h-1.5 bg-teal-500 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">40%</span>
              </div>
            </div>
          </div>

          {/* کارت ۳: Vocabulary */}
          <div className="bg-purple-600 rounded-xl overflow-hidden shadow-sm">
            <div className="h-28 bg-purple-500 p-3 flex flex-col justify-between relative">
              <div className="flex justify-center items-center h-full">
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm text-slate-800 text-right">
                لغات کاربردی
              </h3>
              <p className="text-xs text-slate-500 text-right">سطح مقدماتی</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="h-1.5 bg-purple-600 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">20%</span>
              </div>
            </div>
          </div>

          {/* کارت ۴: Listening */}
          <div className="bg-orange-500 rounded-xl overflow-hidden shadow-sm">
            <div className="h-28 bg-orange-400 p-3 flex flex-col justify-between relative">
              <div className="flex justify-center items-center h-full">
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm text-slate-800 text-right">
                لیسنینگ در عمل
              </h3>
              <p className="text-xs text-slate-500 text-right">سطح متوسط</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="h-1.5 bg-orange-500 rounded-full"
                    style={{ width: "10%" }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- بخش تمرین و بازی --- */}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">تمرین و بازی</h2>
          <Link
            href="/exercises"
            className="text-sm text-blue-600 hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        {/* گرید تمرین‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* تمرین لغات */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-200 p-2 rounded-lg">
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 bg-purple-400 rounded-sm"></div>
                  <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                </div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-medium text-sm text-slate-800">
                  تمرین لغات
                </h4>
                <p className="text-[10px] text-slate-500">
                  با فلش‌کارت‌ها لغات جدید یاد بگیر
                </p>
              </div>
            </div>
            <button className="w-full bg-purple-200 text-purple-700 text-xs font-medium py-1.5 rounded-lg hover:bg-purple-300 transition-colors">
              شروع تمرین
            </button>
          </div>

          {/* بازی هَنگ کلمه */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-200 p-2 rounded-lg">
                <div className="w-5 h-5 border-2 border-green-600 rounded-full relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-green-600"></div>
                </div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-medium text-sm text-slate-800">
                  بازی هَنگ کلمه
                </h4>
                <p className="text-[10px] text-slate-500">
                  کلمات را حدس بزن و امتیاز بگیر
                </p>
              </div>
            </div>
            <button className="w-full bg-green-200 text-green-700 text-xs font-medium py-1.5 rounded-lg hover:bg-green-300 transition-colors">
              شروع بازی
            </button>
          </div>

          {/* تمرین گرامر */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-200 p-2 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-md"></div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-medium text-sm text-slate-800">
                  تمرین گرامر
                </h4>
                <p className="text-[10px] text-slate-500">
                  دانش گرامر خود را تقویت کن
                </p>
              </div>
            </div>
            <button className="w-full bg-yellow-200 text-yellow-700 text-xs font-medium py-1.5 rounded-lg hover:bg-yellow-300 transition-colors">
              شروع تمرین
            </button>
          </div>

          {/* تمرین شنیداری */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-200 p-2 rounded-lg">
                <div className="w-5 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <div className="w-1 h-3 bg-white"></div>
                </div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-medium text-sm text-slate-800">
                  تمرین شنیداری
                </h4>
                <p className="text-[10px] text-slate-500">
                  به آهنگ‌ها و مکالمات گوش بده
                </p>
              </div>
            </div>
            <button className="w-full bg-blue-200 text-blue-700 text-xs font-medium py-1.5 rounded-lg hover:bg-blue-300 transition-colors">
              شروع تمرین
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
