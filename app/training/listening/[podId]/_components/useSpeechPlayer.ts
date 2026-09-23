"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PodcastEpisode } from "@/types/training";

// ========================================
// هوک پخش پادکست با تلفظ مرورگر
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// Tom pitch 0.8 / Lena 1.15 — پخش خط‌به‌خط با هایلایت
// ========================================

export type SpeechDetail = PodcastEpisode & {
  progress?: { stars: number; score: number; xpEarned: number } | null;
};

export default function useSpeechPlayer(item: SpeechDetail | null, lines: string[]) {
  // وضعیت پخش تلفظ مرورگر
  const [playing, setPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const enVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  /* ---------- انتخاب صدای انگلیسی برای تلفظ ---------- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      enVoiceRef.current =
        voices.find((v) => /en[-_]/i.test(v.lang) && /google/i.test(v.name)) ||
        voices.find((v) => /en[-_]US/i.test(v.lang)) ||
        voices.find((v) => /en[-_]/i.test(v.lang)) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
      playingRef.current = false;
    };
  }, []);

  /** متن گفتنی یک خط: حذف نام مجری + گذاشتن جواب به‌جای {n} */
  const speakTextOf = useCallback(
    (line: string) => {
      if (!item) return line;
      const withoutSpeaker = line.replace(/^[A-Za-z]+:\s*/, "");
      return withoutSpeaker.replace(/\{(\d+)\}/g, (_m, n: string) => {
        const gap = item.gaps.find((g) => g.id === parseInt(n, 10));
        return gap ? gap.answer : "";
      });
    },
    [item],
  );

  /* ---------- پخش خط‌به‌خط ---------- */
  const speakFrom = useCallback(
    (startIndex: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      if (startIndex < 0 || startIndex >= lines.length) {
        playingRef.current = false;
        setPlaying(false);
        setCurrentLine(-1);
        return;
      }
      playingRef.current = true;
      setPlaying(true);

      const speakNext = (i: number) => {
        if (!playingRef.current) return;
        if (i >= lines.length) {
          playingRef.current = false;
          setPlaying(false);
          setCurrentLine(-1);
          return;
        }
        setCurrentLine(i);
        const line = lines[i];
        const u = new SpeechSynthesisUtterance(speakTextOf(line));
        u.lang = "en-US";
        u.pitch = line.startsWith("Tom") ? 0.8 : 1.15;
        u.rate = speedRef.current;
        if (enVoiceRef.current) u.voice = enVoiceRef.current;
        u.onend = () => {
          if (playingRef.current) speakNext(i + 1);
        };
        u.onerror = () => {
          playingRef.current = false;
          setPlaying(false);
        };
        window.speechSynthesis.speak(u);
      };

      speakNext(startIndex);
    },
    [lines, speakTextOf],
  );

  const handleToggleSpeech = () => {
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      speakFrom(currentLine >= 0 ? currentLine : 0);
    }
  };

  const handleStopSpeech = () => {
    playingRef.current = false;
    setPlaying(false);
    setCurrentLine(-1);
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
  };

  const handleSpeed = (s: number) => {
    setSpeed(s);
    speedRef.current = s;
    if (playing) speakFrom(currentLine); // اعمال فوری سرعت جدید
  };

  return {
    playing,
    currentLine,
    speed,
    speakFrom,
    handleToggleSpeech,
    handleStopSpeech,
    handleSpeed,
  };
}
