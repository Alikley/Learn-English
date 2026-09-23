"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationLesson } from "@/data/lessons/types";
import { convLineAudio, playLine, canSpeak } from "@/lib/lesson-audio";

// ========================================
// هوک موتور پخش گفت‌وگوی پله‌پله
// (از ConversationView تفکیک شد — v1.0.2.7 ریفکتوری گام ۱)
// خط قرمز (سایت): تایپ → پخش صدا → خط بعدی
// خط آبی (کاربر): نمایش → کاربر خودش می‌خواند → دکمه ادامه
// ========================================

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function useConversationPlayback(lesson: ConversationLesson) {
  const lines = lesson.lines;

  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [waitingUser, setWaitingUser] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef(false);
  const waitingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // پاک‌سازی هنگام خروج
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      waitingRef.current = false;
      stopRef.current?.();
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  // ---------- جریان پله‌پله ----------
  const runFrom = async (start: number) => {
    cancelRef.current = false;
    setRunning(true);
    setPausedAt(null);
    for (let i = start; i < lines.length; i++) {
      if (cancelRef.current) break;
      const line = lines[i];
      setCurrent(i);
      setRevealed((r) => Math.max(r, i + 1));
      scrollToBottom();

      if (line.speaker === "site") {
        // انیمیشن تایپ قبل از حرف‌های سایت
        setTyping(true);
        await sleep(750);
        setTyping(false);
        if (cancelRef.current) break;

        // فقط سایت صحبت می‌کند — هیچ خط آبی صدا ندارد
        const { promise, stop } = playLine(
          convLineAudio(lesson.slug, i),
          line.en,
          { voiceHint: "site", rate: 0.95 },
        );
        stopRef.current = stop;
        await promise;
        stopRef.current = null;
        if (cancelRef.current) break;
        await sleep(300);
      } else {
        // نوبت کاربر: خودش برای خودش می‌خواند، بعد دکمه می‌زند
        setWaitingUser(true);
        waitingRef.current = true;
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (cancelRef.current || !waitingRef.current) {
              clearInterval(check);
              resolve();
            }
          }, 120);
        });
        setWaitingUser(false);
        if (cancelRef.current) break;
      }
    }
    if (!cancelRef.current) {
      setFinished(true);
      setCurrent(null);
      setRunning(false);
    }
  };

  const userReadIt = () => {
    waitingRef.current = false;
    setWaitingUser(false);
  };

  const stopAll = () => {
    cancelRef.current = true;
    waitingRef.current = false;
    stopRef.current?.();
    if (canSpeak()) window.speechSynthesis.cancel();
    setRunning(false);
    setTyping(false);
    setWaitingUser(false);
    // از همان خط نیمه‌کاره ادامه می‌دهیم
    setPausedAt((p) => p ?? current ?? 0);
    setCurrent(null);
  };

  const restart = () => {
    setRevealed(0);
    setFinished(false);
    setPausedAt(null);
    setCurrent(null);
    runFrom(0);
  };

  // پخش مجدد فقط برای خطوط قرمز (سایت)
  const replayLine = async (i: number) => {
    if (running) return;
    const line = lines[i];
    if (line.speaker !== "site") return;
    setCurrent(i);
    const { promise, stop } = playLine(
      convLineAudio(lesson.slug, i),
      line.en,
      { voiceHint: "site", rate: 0.95 },
    );
    stopRef.current = stop;
    await promise;
    stopRef.current = null;
    setCurrent((c) => (c === i ? null : c));
  };

  return {
    running,
    current,
    typing,
    waitingUser,
    revealed,
    finished,
    pausedAt,
    scrollRef,
    runFrom,
    userReadIt,
    stopAll,
    restart,
    replayLine,
  };
}
