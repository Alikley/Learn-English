import { Lock, BookOpen } from "lucide-react";

type Props = {
  type?: "courses" | "lessons";
};

export default function EmptyState({ type = "courses" }: Props) {
  if (type === "lessons") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <BookOpen size={48} className="text-slate-200" />
        <p className="text-slate-400">هنوز درسی اضافه نشده</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <Lock size={48} className="text-slate-300" />
      <h2 className="text-xl font-bold text-slate-700">
        هنوز دوره‌ای اضافه نشده
      </h2>
      <p className="text-slate-400 text-sm max-w-xs">
        برای اضافه کردن دوره، دیتابیس را seed کنید.
      </p>
      <code className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
        npx prisma db seed
      </code>
    </div>
  );
}
