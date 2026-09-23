"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ListeningLesson } from "@/data/lessons/types";
import { LISTENING_TIMINGS } from "@/data/lessons/listening-timings";
import { storyAudio, speakFallback, canSpeak } from "@/lib/lesson-audio";
import ProgressStepper from "../../ProgressStepper";
import ContinueButton from "../../ContinueButton";
import ListeningPlayerCard from "./ListeningPlayerCard";
import ListeningStory from "./ListeningStory";
import ListeningQuizStep from "./ListeningQuizStep";

// ========================================
// نمای درس شنیداری — داستان صوتی + آزمونک
// v1.0.2.7 — ریفکتوری: پخش‌کننده، متن داستان و آزمونک
// به کامپوننت‌های خودشان در همین فولدر تفکیک شدند.
// ========================================

type Props = {
  lesson: ListeningLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [["داستان", "Story"], ["آزمونک", "Quiz"]];

export default function ListeningView({
  lesson,
  onComplete,
  completing,
}: Props) {
  const { tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentPara, setCurrentPara] = useState(-1);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [listened, setListened] = useState(false);
  // اگر فایل صوتی نبود → روایت پاراگراف‌به‌پاراگراف با صدای مرورگر
  const [fallbackMode, setFallbackMode] = useState(false);

  // آزمونک
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);

  const quiz = lesson.quiz;
  const currentQ = quiz[qIndex];
  const timing = LISTENING_TIMINGS[lesson.slug];
  const total = timing?.total ?? 0;

  const findPara = (t: number): number => {
    if (!timing) return -1;
    let idx = 0;
    for (let i = 0; i < timing.starts.length; i++) {
      if (t >= timing.starts[i]) idx = i;
    }
    return idx;
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      cancelRef.current = true;
      audio?.pause();
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  // اسکرول خودکار پاراگراف فعال
  useEffect(() => {
    if (currentPara >= 0 && paraRefs.current[currentPara]) {
      paraRefs.current[currentPara]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentPara]);

  const playFile = () => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    audioRef.current.play();
    setPlaying(true);
  };

  const pauseFile = () => {
    audioRef.current?.pause();
    if (canSpeak()) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  // روایت جایگزین: پاراگراف‌به‌پاراگراف با صدای مرورگر
  const playFallback = async () => {
    cancelRef.current = false;
    setPlaying(true);
    for (let i = 0; i < lesson.paragraphs.length; i++) {
      if (cancelRef.current) break;
      setCurrentPara(i);
      await speakFallback(lesson.paragraphs[i], {
        voiceHint: "narrator",
        rate: speed * 0.95,
      });
    }
    if (!cancelRef.current) {
      setListened(true);
      setPlaying(false);
      setCurrentPara(-1);
    }
  };

  const togglePlay = () => {
    if (playing) {
      pauseFile();
      cancelRef.current = true; // متوقف کردن روایت جایگزین
      setPlaying(false);
      return;
    }
    if (fallbackMode || !timing) {
      void playFallback();
    } else {
      playFile();
    }
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const seekTo = (paraIndex: number) => {
    if (!timing || !audioRef.current) return;
    const t = timing.starts[paraIndex] ?? 0;
    audioRef.current.currentTime = t;
    setCurrentPara(paraIndex);
    if (!playing) {
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === currentQ.correctIndex) setCorrectCount((c) => c + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    if (qIndex < quiz.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      onComplete(Math.round((correctCount / quiz.length) * 100));
    }
  };

  const progressPct = useMemo(() => {
    if (!timing || !total) return 0;
    return Math.min(100, (time / total) * 100);
  }, [time, timing, total]);

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS.map(([fa, en]) => tr(fa, en))} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: داستان ---------- */}
        {step === 0 && (
          <motion.div
            key="story"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* پخش‌کننده */}
            <ListeningPlayerCard
              playing={playing}
              listened={listened}
              fallbackMode={fallbackMode}
              hasTiming={Boolean(timing)}
              time={time}
              total={total}
              progressPct={progressPct}
              speed={speed}
              onTogglePlay={togglePlay}
              onChangeSpeed={changeSpeed}
            />

            {/* توضیح + واژگان کلیدی + متن داستان */}
            <ListeningStory
              lesson={lesson}
              currentPara={currentPara}
              paraRefs={paraRefs}
              onSeek={seekTo}
            />

            <ContinueButton
              onClick={() => {
                pauseFile();
                cancelRef.current = true;
                setPlaying(false);
                setStep(1);
              }}
              label={tr("رفتن به آزمونک", "Go to Quiz")}
            />
          </motion.div>
        )}

        {/* ---------- گام ۲: آزمونک ---------- */}
        {step === 1 && (
          <ListeningQuizStep
            lesson={lesson}
            qIndex={qIndex}
            selected={selected}
            correctCount={correctCount}
            completing={completing}
            onSelect={handleSelect}
            onNext={nextQuestion}
            onBack={() => setStep(0)}
          />
        )}
      </AnimatePresence>

      {/* عنصر صوتی پنهان — فقط وقتی زمان‌بندی فایل موجود است */}
      {timing && (
        <audio
          ref={audioRef}
          src={storyAudio(lesson.slug)}
          preload="metadata"
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setTime(t);
            const p = findPara(t);
            if (p !== currentPara) setCurrentPara(p);
          }}
          onEnded={() => {
            setListened(true);
            setPlaying(false);
            setCurrentPara(-1);
          }}
          onError={() => {
            // فایل صوتی هنوز آماده نیست → روایت جایگزین
            setFallbackMode(true);
            setPlaying(false);
          }}
        />
      )}
    </div>
  );
}
