"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Gauge,
  ListMusic,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsListeningSection, IeltsScriptTurn } from "@/types/ielts";

// ========================================
// پخش‌کنندهٔ بخش لیسنینگ (v1.0.3.2)
// - اگر فایل صوتی (audioUrl از B2) موجود باشد از <audio> پخش می‌شود
// - در غیر این صورت متن اسکریپت با speechSynthesis مرورگر خوانده می‌شود:
//   دو صدای متفاوت برای دو گوینده + مکث بین نوبت‌ها + کنترل سرعت
// - کنترل سرعت (مثل تستینو: 0.6x تا 1.4x) در حالت تمرین
// - نمایش متن (transcript) فقط در حالت تمرین و پس از پایان پخش بخش
// ========================================

const SPEEDS = [0.6, 0.8, 1, 1.2, 1.4] as const;

function pickVoices(): { woman: SpeechSynthesisVoice | null; man: SpeechSynthesisVoice | null } {
  if (typeof window === "undefined" || !window.speechSynthesis) return { woman: null, man: null };
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (voices.length === 0) return { woman: null, man: null };
  // تلاش برای یافتن دو صدای متمایز (زن/مرد اگر موجود بود)
  const byName = (keys: string[]): SpeechSynthesisVoice | null => {
    const found = voices.find((v) => keys.some((k) => v.name.toLowerCase().includes(k)));
    return found ?? null;
  };
  let woman = byName(["female", "samantha", "zira", "susan", "karen", "serena", "google uk english female", "aria", "jenny"]);
  let man = byName(["male", "daniel", "david", "alex", "george", "guy", "google uk english male", "mark", "ryan"]);
  if (!woman && !man) {
    woman = voices[0];
    man = voices[1] ?? voices[0];
  } else if (!woman) woman = man === voices[0] ? voices[voices.length - 1] : voices[0];
  else if (!man) man = woman === voices[0] ? voices[voices.length - 1] : voices[0];
  return { woman, man };
}

export default function ListeningPlayer({
  section,
  practice,
  finished,
  onFinish,
}: {
  section: IeltsListeningSection;
  practice: boolean;
  /** آیا این بخش قبلاً تا انتها پخش شده (از state بالاتر) */
  finished: boolean;
  onFinish: (part: number) => void;
}) {
  const { tr } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(-1);
  const [speed, setSpeed] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const stopRef = useRef(false);
  const queueRef = useRef<IeltsScriptTurn[]>([]);
  const turnIndexRef = useRef(0);
  const speedRef = useRef(1);

  // همگام‌سازی ref سرعت با state (خارج از رندر — قانون react-hooks/purity)
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const hasAudioFile = Boolean(section.audioUrl);

  // توقف کامل هنگام unmount
  useEffect(() => {
    return () => {
      stopRef.current = true;
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const runQueue = useCallback(async () => {
    const synth = window.speechSynthesis;
    const turns = queueRef.current;
    const { woman, man } = pickVoices();

    const speakTurn = (turn: IeltsScriptTurn): Promise<void> =>
      new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(turn.text);
        const voice = turn.speaker === "WOMAN" ? woman : turn.speaker === "MAN" ? man : woman;
        if (voice) u.voice = voice;
        u.rate = speedRef.current;
        u.pitch = turn.speaker === "NARRATOR" ? 1.05 : turn.speaker === "WOMAN" ? 1.1 : 0.9;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        synth.speak(u);
      });

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    while (turnIndexRef.current < turns.length) {
      if (stopRef.current) return;
      const turn = turns[turnIndexRef.current];
      setCurrentTurn(turnIndexRef.current);
      await speakTurn(turn);
      if (stopRef.current) return;
      await wait(turn.pauseAfterMs ?? 420);
      turnIndexRef.current += 1;
    }
    if (!stopRef.current) {
      setPlaying(false);
      setCurrentTurn(-1);
      onFinish(section.part);
    }
  }, [onFinish, section.part]);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stopRef.current = false;
    setPlaying(true);
    queueRef.current = section.script;
    void runQueue();
  }, [runQueue, section.script]);

  const pause = useCallback(() => {
    stopRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  const stop = useCallback(() => {
    stopRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    turnIndexRef.current = 0;
    setCurrentTurn(-1);
  }, []);

  const toggleTranscript = () => {
    // متن فقط در حالت تمرین و پس از پایان پخش بخش باز می‌شود
    if (practice && !playing && finished) setShowTranscript((s) => !s);
  };

  const progress = useMemo(
    () => Math.round(((currentTurn + 1) / Math.max(1, section.script.length)) * 100),
    [currentTurn, section.script.length],
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3">
      {/* هدر بخش */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Volume2 size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100" dir="ltr">
              Part {section.part} — {section.context}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {tr("حدود", "About")} {Math.round(section.estimatedSec / 60)} {tr("دقیقه", "min")}
              {hasAudioFile ? " · audio" : ""}
            </p>
          </div>
        </div>

        {/* کنترل سرعت — فقط تمرین */}
        {practice && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <Gauge size={12} className="text-slate-400 ms-1" />
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  speed === s
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* فایل صوتی واقعی (آینده — B2) */}
      {hasAudioFile && (
        <audio
          controls
          className="w-full"
          src={section.audioUrl}
          onEnded={() => onFinish(section.part)}
        />
      )}

      {/* نوار پیشرفت + دکمه‌ها */}
      {!hasAudioFile && (
        <>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${playing || currentTurn >= 0 ? progress : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            {!playing ? (
              <button
                onClick={play}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <Play size={16} />
                {currentTurn >= 0 ? tr("ادامه", "Resume") : tr("پخش بخش", "Play section")}
              </button>
            ) : (
              <button
                onClick={pause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md transition"
              >
                <Pause size={16} />
                {tr("توقف موقت", "Pause")}
              </button>
            )}
            <button
              onClick={stop}
              disabled={!playing && currentTurn < 0}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              title={tr("توقف و شروع دوباره", "Stop and restart")}
            >
              <Square size={16} />
            </button>
            <button
              onClick={toggleTranscript}
              disabled={!practice || playing || !finished}
              className={`p-2.5 rounded-2xl transition disabled:opacity-40 ${
                showTranscript
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title={
                practice
                  ? tr("متن بخش (پس از پخش)", "Transcript (after playback)")
                  : tr("فقط در حالت تمرین", "Practice mode only")
              }
            >
              <FileText size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
            <ListMusic size={10} className="inline me-1" />
            {currentTurn >= 0 && playing
              ? tr(`نوبت ${currentTurn + 1} از ${section.script.length}`, `Turn ${currentTurn + 1} of ${section.script.length}`)
              : tr(
                  "صدا با فناوری خوانش مرورگر پخش می‌شود — بلندگوهای خود را روشن کنید",
                  "Audio is read by your browser — turn your speakers on",
                )}
          </p>
        </>
      )}

      {/* متن بخش — حالت تمرین بعد از پخش */}
      {showTranscript && practice && (
        <div
          className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4 space-y-2 max-h-72 overflow-y-auto"
          dir="ltr"
        >
          {section.script.map((turn, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed ${
                i === currentTurn
                  ? "text-indigo-600 dark:text-indigo-300 font-semibold"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <span
                className={`inline-block w-16 font-bold shrink-0 ${
                  turn.speaker === "WOMAN"
                    ? "text-pink-500"
                    : turn.speaker === "MAN"
                      ? "text-blue-500"
                      : "text-slate-400"
                }`}
              >
                {turn.speaker === "WOMAN" ? "WOMAN:" : turn.speaker === "MAN" ? "MAN:" : "NARRATOR:"}
              </span>
              {turn.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
