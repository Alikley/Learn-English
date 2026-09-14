"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SPEEDQUIZ_CONFIG } from "@/types/game";
import type { GameLevel, SpeedQuizQuestion } from "@/types/game";

// ========================================
// هوک منطق بازی کوییز سرعتی
// ماشین وضعیت: levelSelect → loading → playing → sessionEnd
// ساختار بازی: هر دور = ۱۰ سوال (کلمه/جمله) با تایمر؛
// سرعت پاسخ = امتیاز بیشتر (پاداش زمان + کمبو)؛
// ۳ جان — با هر غلط/تایم‌اوت یکی کم می‌شود.
// تمام منطق (تایمر، پاسخ، امتیاز، جان، کمبو) اینجاست؛
// صفحه فقط رندر می‌کند و با callback ها به useSpeedQuizStats وصل می‌شود.
// ========================================

export type SpeedQuizPhase =
  | "levelSelect"
  | "loading"
  | "playing"
  | "sessionEnd"
  | "error";

// ---- نتیجه نمایش‌داده‌شده بعد از هر پاسخ ----
export type SpeedQuizFeedback = {
  correct: boolean;
  // true = وقت تمام شد و خودکار غلط شد
  timeout: boolean;
  // گزینه انتخابی کاربر (null = تایم‌اوت)
  selectedIndex: number | null;
  correctIndex: number;
  // امتیاز کسب‌شده از این سوال (۰ اگر غلط)
  gained: number;
  // کمبو بعد از این پاسخ
  comboAfter: number;
};

const TICK_MS = 100;
const TOTAL_MS = SPEEDQUIZ_CONFIG.secondsPerQuestion * 1000;

type UseSpeedQuizGameOptions = {
  // با هر پاسخ درست صدا زده می‌شود (برای ثبت استریک — گام ۷)
  onCorrectAnswer?: () => void;
  // با پایان دور کامل صدا زده می‌شود (برای ثبت امتیاز)
  onSessionFinish?: (score: number, correct: number, wrong: number) => void;
};

export function useSpeedQuizGame({
  onCorrectAnswer,
  onSessionFinish,
}: UseSpeedQuizGameOptions = {}) {
  // ---- وضعیت بازی ----
  const [phase, setPhase] = useState<SpeedQuizPhase>("levelSelect");
  const [level, setLevel] = useState<GameLevel>("EASY");
  const [questions, setQuestions] = useState<SpeedQuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState<number>(SPEEDQUIZ_CONFIG.lives);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<SpeedQuizFeedback | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(TOTAL_MS);
  // امتیاز آخرین پاسخ درست — برای انیمیشن «+N»
  const [lastGained, setLastGained] = useState(0);
  const [gainKey, setGainKey] = useState(0);

  // ---- قفل جلوگیری از پاسخ تکراری در یک سوال ----
  const lockedRef = useRef(false);
  // ---- مدیریت تایمرها (تیک تایمر + انتقال به سوال بعد) ----
  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }, []);

  // ---- پاکسازی تایمرها هنگام unmount ----
  useEffect(() => clearTimers, [clearTimers]);

  // ---- شروع یک دور جدید ----
  const startGame = useCallback(async (lvl: GameLevel) => {
    clearTimers();
    lockedRef.current = false;
    setLevel(lvl);
    setPhase("loading");
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setLives(SPEEDQUIZ_CONFIG.lives);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback(null);
    setLastGained(0);
    setTimeLeftMs(TOTAL_MS);

    try {
      const res = await fetch(
        `/api/game/speedquiz/questions?count=${SPEEDQUIZ_CONFIG.questionsPerSession}&level=${lvl}`,
      );
      if (!res.ok) {
        setPhase("error");
        return;
      }
      const data = await res.json();
      const qs: SpeedQuizQuestion[] = Array.isArray(data.questions)
        ? data.questions
        : [];
      if (qs.length === 0) {
        setPhase("error");
        return;
      }
      setQuestions(qs);
      setPhase("playing");
    } catch {
      setPhase("error");
    }
  }, [clearTimers]);

  // ---- جواب به سوال فعلی (index=null → تایم‌اوت) ----
  const handleAnswer = useCallback(
    (index: number | null) => {
      if (phase !== "playing" || feedback || lockedRef.current) return;
      if (index !== null && questions.length === 0) return;

      lockedRef.current = true;
      const q = questions[qIndex];
      if (!q) {
        lockedRef.current = false;
        return;
      }

      const correct = index !== null && index === q.correctIndex;
      let gained = 0;

      if (correct) {
        // پاداش سرعت: هر ثانیه باقی‌مانده امتیاز دارد
        const secondsLeft = Math.ceil(timeLeftMs / 1000);
        gained =
          SPEEDQUIZ_CONFIG.basePoints +
          secondsLeft * SPEEDQUIZ_CONFIG.timeBonusPerSecond +
          combo * SPEEDQUIZ_CONFIG.comboStepBonus;
      }

      // ---- محاسبه‌های همزمان (بدون stale closure) ----
      const newScore = correct ? score + gained : score;
      const newLives = correct ? lives : lives - 1;
      const newCombo = correct ? combo + 1 : 0;
      const newCorrect = correctCount + (correct ? 1 : 0);
      const newWrong = wrongCount + (correct ? 0 : 1);

      setScore(newScore);
      setLives(newLives);
      setCombo(newCombo);
      setCorrectCount(newCorrect);
      setWrongCount(newWrong);
      if (correct) {
        setLastGained(gained);
        setGainKey((k) => k + 1);
        // ✅ ثبت پاسخ درست + آپدیت استریک (گام ۷)
        onCorrectAnswer?.();
      }
      setFeedback({
        correct,
        timeout: index === null,
        selectedIndex: index,
        correctIndex: q.correctIndex,
        gained,
        comboAfter: newCombo,
      });

      // ---- بعد از نمایش نتیجه: سوال بعد یا پایان دور ----
      const isLast = qIndex + 1 >= questions.length;
      const outOfLives = !correct && newLives <= 0;

      timersRef.current.push(
        window.setTimeout(
          () => {
            lockedRef.current = false;
            if (isLast || outOfLives) {
              const perfect =
                newWrong === 0 && newLives === SPEEDQUIZ_CONFIG.lives;
              const finalScore =
                newScore + (perfect ? SPEEDQUIZ_CONFIG.perfectSessionBonus : 0);
              setScore(finalScore);
              setPhase("sessionEnd");
              onSessionFinish?.(finalScore, newCorrect, newWrong);
            } else {
              setQIndex(qIndex + 1);
              setFeedback(null);
              setTimeLeftMs(TOTAL_MS);
            }
          },
          SPEEDQUIZ_CONFIG.feedbackMs,
        ),
      );
    },
    [
      phase,
      feedback,
      questions,
      qIndex,
      score,
      lives,
      combo,
      correctCount,
      wrongCount,
      timeLeftMs,
      onCorrectAnswer,
      onSessionFinish,
    ],
  );

  // ---- دسترسی همیشه‌به‌روز به handleAnswer (برای افکت تایم‌اوت) ----
  const handleAnswerRef = useRef(handleAnswer);
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [handleAnswer]);

  // ---- تیک تایمر (فقط حین بازی و قبل از نمایش نتیجه) ----
  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    const id = window.setInterval(() => {
      setTimeLeftMs((t) => (t <= TICK_MS ? 0 : t - TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, feedback, qIndex]);

  // ---- تایم‌اوت: پاسخ خودکار غلط ----
  useEffect(() => {
    if (phase === "playing" && !feedback && timeLeftMs <= 0) {
      handleAnswerRef.current(null);
    }
  }, [timeLeftMs, phase, feedback]);

  // ---- بازگشت به صفحه انتخاب سطح ----
  const handleBackToLevels = useCallback(() => {
    clearTimers();
    lockedRef.current = false;
    setQuestions([]);
    setFeedback(null);
    setPhase("levelSelect");
  }, [clearTimers]);

  // ---- تلاش مجدد (همان سطح، سوال‌های تازه) ----
  const handleRestart = useCallback(() => {
    void startGame(level);
  }, [level, startGame]);

  return {
    // وضعیت
    phase,
    level,
    questions,
    qIndex,
    score,
    combo,
    lives,
    maxLives: SPEEDQUIZ_CONFIG.lives,
    correctCount,
    wrongCount,
    feedback,
    timeLeftMs,
    totalMs: TOTAL_MS,
    lastGained,
    gainKey,
    totalQuestions: SPEEDQUIZ_CONFIG.questionsPerSession,
    // عملیات
    startGame,
    handleAnswer,
    handleRestart,
    handleBackToLevels,
  };
}
