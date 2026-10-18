"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Headset, X, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// پشتیبان چت هوشمند — گوشهٔ سایت (v1.0.8.0 / English 1.0.2.0)
//
// دکمهٔ شناور + پنل انیمیشنی:
//  - باز/بسته با spring
//  - پیام‌ها با slide ظاهر می‌شوند
//  - ایندیکیتور «در حال تایپ»
//  - دکمه‌های سریع (لینک به بخش‌های سایت)
//  - تاریخچه در localStorage (بدون دیتابیس)
//
// موتور: POST /api/support/chat → مدل Laya روی سرور خودت
// پیام فارسی کاربر را طبقه‌بندی می‌کند و پاسخ درست را
// انتخاب می‌کند. قطعی = پاسخ عمومی — همیشه جواب هست.
// ========================================

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  actions?: { label: string; labelEn: string; href: string }[];
};

const STORAGE_KEY = "flex-support-chat-v1";

const WELCOME_FA =
  "سلام! 👋 من پشتیبان هوشمند سایت هستم — سؤالت را بنویس تا کمکت کنم.";
const WELCOME_EN =
  "Hi! 👋 I'm the site's smart assistant — write your question and I'll help.";

export default function SupportChat() {
  const { lang, mounted: langMounted, tr } = useLanguage();
  const en = langMounted && lang === "en";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // بازیابی تاریخچه از localStorage (مرورگر = سیستم خارجی؛
  // setState داخل callback تا قاعدهٔ react-hooks/set-state-in-effect
  // رعایت شود — بدون رندر آبشاری)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.slice(-30));
            return;
          }
        }
      } catch {
        /* بی‌اهمیت */
      }
      setMessages([
        { id: "welcome", role: "bot", text: en ? WELCOME_EN : WELCOME_FA },
      ]);
    }, 0);
    return () => window.clearTimeout(id);
    // فقط یک‌بار موقع مانت — متن خوش‌آمد با زبان همان لحظه
  }, []);

  // ذخیرهٔ تاریخچه
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
      } catch {
        /* پر بودن حافظه — مهم نیست */
      }
    }
  }, [messages]);

  // اسکرول به آخرین پیام (به‌روزرسانی DOM = سیستم خارجی)
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || typing) return;

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setTyping(true);

      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setMessages((m) => [
          ...m,
          {
            id: `b-${Date.now()}`,
            role: "bot",
            text: en ? data.answerEn : data.answer,
            actions: data.actions,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `b-${Date.now()}`,
            role: "bot",
            text: tr(
              "ارتباط برقرار نشد — دوباره امتحان کن یا بعداً پیام بده.",
              "Connection failed — try again or message later.",
            ),
          },
        ]);
      } finally {
        setTyping(false);
        // نقطهٔ اعلان وقتی جواب آمد ولی پنل بسته است
        if (!open) setHasNew(true);
      }
    },
    [input, typing, en, tr, open],
  );

  return (
    <>
      {/* ================= دکمهٔ شناور ================= */}
      <motion.button
        onClick={() => {
          setOpen((o) => !o);
          setHasNew(false);
          if (!open) setTimeout(() => inputRef.current?.focus(), 350);
        }}
        aria-label={tr("چت با پشتیبان", "Chat with support")}
        className="fixed bottom-5 start-5 z-[60] w-14 h-14 rounded-full bg-gradient-to-l from-blue-600 to-teal-500 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={
          hasNew && !open
            ? { boxShadow: ["0 0 0 0 rgba(37,99,235,0.4)", "0 0 0 14px rgba(37,99,235,0)"] }
            : {}
        }
        transition={
          hasNew && !open
            ? { duration: 1.4, repeat: Infinity, ease: "easeOut" }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              <Headset size={22} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* نقطهٔ اعلان پیام جدید */}
        {hasNew && !open && (
          <span className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-[#0b1220]" />
        )}
      </motion.button>

      {/* ================= پنل چت ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 start-5 z-[60] w-[min(92vw,22rem)] h-[28rem] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-label={tr("پشتیبان چت", "Support chat")}
          >
            {/* هدر */}
            <div className="bg-gradient-to-l from-blue-600 to-teal-500 p-3.5 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Headset size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black leading-tight">
                    {tr("پشتیبان هوشمند", "Smart Support")}
                  </p>
                  <p className="text-[10px] text-blue-50/90 leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    {tr("آنلاین — با هوش مصنوعی Laya", "Online — powered by Laya AI")}
                  </p>
                </div>
              </div>
            </div>

            {/* پیام‌ها */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 dark:bg-[#0b1220]">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-6 whitespace-pre-line ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md"
                      }`}
                    >
                      {m.text}
                    </div>
                    {/* دکمه‌های سریع پشتیبان */}
                    {m.role === "bot" && m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.actions.map((a) => (
                          <Link
                            key={a.href + a.label}
                            href={a.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                          >
                            <Sparkles size={10} />
                            {en ? a.labelEn : a.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* در حال تایپ */}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ورودی */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                  placeholder={tr("سؤالت را بنویس…", "Type your question…")}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  aria-label={tr("ارسال", "Send")}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send size={16} className={en ? "" : "-scale-x-100"} />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
                {tr(
                  "پاسخ‌ها توسط مدل هوش مصنوعی Laya انتخاب می‌شوند",
                  "Answers selected by the Laya AI model",
                )}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
