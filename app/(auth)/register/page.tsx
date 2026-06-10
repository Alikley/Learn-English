"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = (data: RegisterForm) => {
    registerUser(data.name, data.email, data.password);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* لوگو */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            flex <span className="text-slate-900">English</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            یادگیری رو همین الان شروع کن
          </p>
        </div>

        {/* کارت */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            ساخت حساب جدید
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* نام */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="مثلاً: علی مرادی"
                {...register("name", {
                  required: "نام را وارد کنید",
                  minLength: { value: 3, message: "حداقل ۳ کاراکتر" },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200
                  ${
                    errors.name
                      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* ایمیل */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                ایمیل
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                {...register("email", {
                  required: "ایمیل را وارد کنید",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "ایمیل معتبر نیست",
                  },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200
                  ${
                    errors.email
                      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* رمز عبور */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="حداقل ۶ کاراکتر"
                  {...register("password", {
                    required: "رمز عبور را وارد کنید",
                    minLength: { value: 6, message: "حداقل ۶ کاراکتر" },
                  })}
                  className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm outline-none transition-all duration-200
                    ${
                      errors.password
                        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* تکرار رمز */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                تکرار رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  {...register("confirmPassword", {
                    required: "تکرار رمز عبور را وارد کنید",
                    validate: (val) =>
                      val === watch("password") ||
                      "رمز عبور و تکرار آن یکسان نیستند",
                  })}
                  className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm outline-none transition-all duration-200
                    ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* دکمه ثبت نام */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  ثبت نام
                </>
              )}
            </button>
          </form>

          {/* لینک ورود */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              قبلاً ثبت نام کردی؟{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                وارد شو
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          با ثبت نام، قوانین و حریم خصوصی flex English را می‌پذیری
        </p>
      </div>
    </div>
  );
}
