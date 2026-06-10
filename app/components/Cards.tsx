import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    title: "گرامر ضروریات",
    level: "سطح مبتدی",
    progress: 65,
    image: "/assets/grammar.svg",
    color: "bg-blue-500",
  },
  {
    title: "مکالمه روزمره",
    level: "سطح مبتدی",
    progress: 40,
    image: "/assets/conversation.svg",
    color: "bg-teal-500",
  },
  {
    title: "لغات کاربردی",
    level: "سطح مبتدی",
    progress: 20,
    image: "/assets/vocabulary.svg",
    color: "bg-purple-500",
  },
  {
    title: "لیسنینگ در عمل",
    level: "سطح متوسط",
    progress: 10,
    image: "/assets/listening.svg",
    color: "bg-orange-500",
  },
];

const exercises = [
  {
    title: "تمرین لغات",
    description: "با فلش‌کارت‌ها لغات جدید یاد بگیر",
    bgColor: "bg-purple-50",
    btnColor: "bg-purple-200 text-purple-700",
    icon: "/assets/icon_1_abc_blocks.svg",
    btnLabel: "شروع تمرین",
  },
  {
    title: "بازی هنگ کلمه",
    description: "کلمات را حدس بزن و امتیاز بگیر",
    bgColor: "bg-green-50",
    btnColor: "bg-green-200 text-green-700",
    icon: "/assets/icon_2_hangman.svg",
    btnLabel: "شروع بازی",
  },
  {
    title: "تمرین گرامر",
    description: "دانش گرامر خود را تقویت کن",
    bgColor: "bg-yellow-50",
    btnColor: "bg-yellow-200 text-yellow-700",
    icon: "/assets/icon_3_document_sign.svg",
    btnLabel: "شروع تمرین",
  },
  {
    title: "تمرین شنیداری",
    description: "به آهنگ‌ها و مکالمات گوش بده",
    bgColor: "bg-blue-50",
    btnColor: "bg-blue-200 text-blue-700",
    icon: "/assets/icon_4_headphones.svg",
    btnLabel: "شروع تمرین",
  },
];

export default function Cards() {
  return (
    <div>
      {/* ================= COURSES ================= */}
      <section className="mx-4 md:mx-5 pt-4 md:pt-8 pb-6 md:pb-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-1 text-blue-600 text-xs md:text-sm font-medium"
          >
            <ArrowLeft size={14} />
            مشاهده همه
          </Link>
          <h2 className="text-[22px] md:text-[32px] font-bold text-slate-900">
            دوره‌های من
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group overflow-hidden rounded-2xl md:rounded-3xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
            >
              <div className="relative aspect-[965/407] overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>
              <div className="p-3 md:p-5">
                <div className="text-right">
                  <h3 className="text-[16px] md:text-[20px] font-bold text-slate-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-[13px] md:text-[15px] text-slate-500">
                    {course.level}
                  </p>
                </div>
                <div className="mt-3 md:mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs md:text-sm text-slate-500">
                    <span>{course.progress}%</span>
                    <span>پیشرفت</span>
                  </div>
                  <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${course.color}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EXERCISES & GAMES ================= */}
      <section className="mx-4 md:mx-5 pt-2 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/exercises"
            className="flex items-center gap-1 text-blue-600 text-xs md:text-sm font-medium"
          >
            <ArrowLeft size={14} />
            مشاهده همه
          </Link>
          <h2 className="text-[22px] md:text-[32px] font-bold text-slate-900">
            تمرین و بازی
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
          {exercises.map((item) => (
            <div
              key={item.title}
              className={`${item.bgColor} rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col gap-3 md:gap-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 relative">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] md:text-sm text-slate-600 mt-1 leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className={`${item.btnColor} px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition hover:opacity-90`}
                >
                  {item.btnLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
