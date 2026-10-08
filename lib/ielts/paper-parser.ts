// ========================================
// برگه‌ساز آزمون از متن PDF کتاب کمبریج (v1.0.3.6)
//
// متن صفحات PDF (lib/ielts/pdf-text) → برگهٔ امتحان
// ساخت‌یافته بر اساس «موضوع امتحان» (مهارت):
//   - لیسنینگ: ۴ بخش (SECTION/PART 1..4) + سوال‌های ۱..۴۰
//   - ریدینگ: ۳ پاساژ + گروه‌های سوال ۱..۴۰
//   - رایتینگ: صورت تسک ۱ و ۲
//
// + پاسخ‌نامه: بخش «Answer key» انتهای کتاب هم خوانده
//   می‌شود تا تحویل آزمون «خودکار» تصحیح شود.
//
// همهٔ تشخیص‌ها heuristics tolerant هستند (فرمت کتاب‌های
// کمبریج ۱..۸ کمی متفاوت است). اگر برگه به اندازهٔ کافی
// کامل درنیامد → ok:false → رابط کاربری به حالت PDF
// برمی‌گردد.
// ========================================

export type PaperSkill = "reading" | "listening" | "writing";

// ---------- خروجی ساخت‌یافته ----------

export type PaperQuestion = {
  /** شمارهٔ سوال ۱..۴۰ */
  number: number;
  /** متن سوال (جای خالی‌ها با «{GAP}» علامت‌گذاری شده) */
  text: string;
  /** گزینه‌های چندگزینه‌ای (حرف → متن) — فقط سوال‌های MCQ */
  options?: { letter: string; text: string }[];
  /** ورودی درون‌خطی داخل جمله دارد (تکمیل جمله/جدول/فرم) */
  inlineGap: boolean;
};

export type PaperSection = {
  /** عنوان بخش — «SECTION 1» یا «Passage 1» */
  title: string;
  /** بازهٔ سوال‌ها — «Questions 1-10» */
  questionRange: string | null;
  /** راهنمای رسمی بخش (مثل «Complete the notes below…») */
  instruction: string;
  /** متن پاساژ (فقط ریدینگ) */
  passageTitle?: string;
  passageBody?: string;
  questions: PaperQuestion[];
};

export type WritingTaskPrompt = {
  task: 1 | 2;
  /** صورت رسمی تسک (خطوط اصلی) */
  prompt: string;
  /** حداقل کلمات — 150/250 */
  minWords: number;
};

export type ExamPaper =
  | {
      ok: true;
      skill: PaperSkill;
      testNumber: number;
      sections: PaperSection[];
      writing?: WritingTaskPrompt[];
      totalQuestions: number;
    }
  | { ok: false; reason: string };

export type AnswerKeyEntry = Record<string, string[]>;
export type BookAnswerKeys = Record<number, { reading?: AnswerKeyEntry; listening?: AnswerKeyEntry }>;

// ---------- ابزار ----------

/** خط خالی یا فقط شمارهٔ صفحه */
function isBlank(line: string): boolean {
  return line.trim() === "" || /^-?\s*\d{1,3}\s*-?$/.test(line.trim());
}

/** علامت‌گذاری جای خالی‌ها (نقطه‌چین/زیرخط) با {GAP} */
function markGaps(text: string): string {
  return text
    .replace(/\.{4,}/g, " {GAP} ")
    .replace(/…+/g, " {GAP} ")
    .replace(/_{3,}/g, " {GAP} ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasGapMark(text: string): boolean {
  return text.includes("{GAP}");
}

// ---------- مکان‌یابی تست‌ها و بلوک‌های مهارت ----------

const RE_TEST_HEADING = /^\s*(?:practice\s+)?test\s+(\d)\b/i;
const RE_LISTENING = /^\s*listening\b/i;
const RE_READING = /^\s*reading\b/i;
const RE_READING_PASSAGE = /^\s*reading\s+passage\s+(\d)\b/i;
const RE_WRITING = /^\s*writing\b/i;
const RE_SPEAKING = /^\s*speaking\b/i;
/** عنوان مستقل پاسخ‌نامه — «Answer key» یا «Answers» به‌تنهایی */
const RE_ANSWER_KEY = /^\s*(?:answer\s+key|answers?)\s*:?\s*$/i;
const RE_TAPESCRIPT = /^\s*(?:tapes?cripts?|transcripts?)\b/i;
const RE_SECTION_OR_PART = /^\s*(?:section|part)\s+(\d)\b/i;
const RE_QUESTIONS_RANGE = /^\s*questions?\s+(\d{1,2})\s*(?:[-–—]\s*(\d{1,2}))?\b/i;
const RE_QNUM = /^\s*(\d{1,2})\s*[.):]?\s*(.*)$/;
const RE_OPTION = /^\(?([A-E])[.)]?\)?\s+(.+)$/;
/** شمارهٔ سوال داخل جمله + جای خالی: «high, 6 ........... regions» */
const RE_EMBEDDED_GAP = /(?<=^|\s)(\d{1,2})\s*(?:\.{3,}|…+)/g;

/** یافتن صفحهٔ شروع هر تست + صفحهٔ شروع پاسخ‌نامه */
export function locateTests(pages: string[]): {
  testPages: Record<number, number>;
  keyStart: number | null;
} {
  const testPages: Record<number, number> = {};
  let keyStart: number | null = null;

  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i].split("\n");
    for (const line of lines) {
      const t = line.trim();
      // پایان تست‌ها: اولین صفحهٔ پاسخ‌نامه/تیپ‌اسکریپت بعد از حداقل ۳ تست
      if (
        keyStart === null &&
        Object.keys(testPages).length >= 3 &&
        (RE_ANSWER_KEY.test(t) || RE_TAPESCRIPT.test(t))
      ) {
        keyStart = i;
      }
      const m = t.match(RE_TEST_HEADING);
      if (m) {
        const n = Number(m[1]);
        if (n >= 1 && n <= 4 && testPages[n] === undefined) {
          testPages[n] = i;
        }
      }
    }
  }
  return { testPages, keyStart };
}

/** خطوط یک بازهٔ صفحه (بدون خطوط خالی ابتدایی/انتهایی) */
function sliceLines(pages: string[], from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i < Math.min(to, pages.length); i++) {
    out.push(...pages[i].split("\n"));
  }
  while (out.length > 0 && isBlank(out[0])) out.shift();
  while (out.length > 0 && isBlank(out[out.length - 1])) out.pop();
  return out;
}

/** بلوک یک مهارت: از نشانگر شروع تا اولین نشانگر پایان */
function skillBlock(
  lines: string[],
  startMarker: (l: string) => boolean,
  endMarkers: ((l: string) => boolean)[],
): { startIdx: number; endIdx: number } | null {
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startMarker(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (endMarkers.some((m) => m(lines[i]))) {
      endIdx = i;
      break;
    }
  }
  return { startIdx, endIdx };
}

// ---------- تجزیهٔ سوال‌ها ----------

/** خطوط راهنما (نه سوال، نه گزینه) */
function isInstructionLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  const instructionPatterns = [
    /^choose\b/i,
    /^complete\b/i,
    /^write\b/i,
    /^do the following\b/i,
    /^in boxes\b/i,
    /^on your answer sheet\b/i,
    /^if the statement\b/i,
    /^if there is no\b/i,
    /^you should\b/i,
    /^look at\b/i,
    /^label\b/i,
    /^match\b/i,
    /^which paragraph\b/i,
    /^use\b/i,
    /^the (graph|chart|table|diagram|plan|map|pie)/i,
    /^summar/i,
    /^select\b/i,
    /^below\b/i,
    /^above\b/i,
    /^example\b/i,
    /^answer the questions?/i,
    /^(true|false|not given|yes|no)\b/i,
  ];
  return instructionPatterns.some((p) => p.test(t));
}

/**
 * تجزیهٔ سوال‌های یک بخش. شماره‌ها باید صعودی و در بازهٔ
 * [from, to] باشند. سه مسیر تشخیص:
 *  ۱) گزینه‌های «A text» بعد از سوال (حروف صعودی از A)
 *  ۲) شمارهٔ سوال ابتدای خط — «3 The price of …»
 *  ۳) شمارهٔ داخل جمله + جای خالی — «in high, 6 …… regions»
 *     (چند سوال در یک خطِ پیوسته ممکن است)
 */
function parseQuestions(lines: string[], from: number, to: number): PaperQuestion[] {
  const questions: PaperQuestion[] = [];
  let current: PaperQuestion | null = null;
  let pendingOptions: { letter: string; text: string }[] = [];

  const lastNum = () =>
    current
      ? current.number
      : questions.length > 0
        ? questions[questions.length - 1].number
        : from - 1;

  const flush = () => {
    if (current) {
      if (pendingOptions.length >= 2) {
        current.options = pendingOptions;
      } else if (pendingOptions.length === 1) {
        // تک‌حرف = گزینه نیست — بخشی از متن سوال است
        current.text += ` ${pendingOptions[0].letter} ${pendingOptions[0].text}`;
      }
      current.text = markGaps(current.text);
      current.inlineGap = hasGapMark(current.text);
      questions.push(current);
    }
    current = null;
    pendingOptions = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;

    // ۱) گزینه‌های چندگزینه‌ای — فقط با ترتیب حروف صعودی از A
    if (current && pendingOptions.length < 5) {
      const opt = line.match(RE_OPTION);
      if (opt) {
        const nextIdx = "ABCDE".indexOf(opt[1]);
        const expectIdx =
          pendingOptions.length === 0
            ? 0
            : "ABCDE".indexOf(pendingOptions[pendingOptions.length - 1].letter) + 1;
        if (nextIdx === expectIdx) {
          pendingOptions.push({ letter: opt[1], text: opt[2].trim() });
          continue;
        }
      }
    }

    // ۲) شمارهٔ سوال ابتدای خط
    const qm = line.match(RE_QNUM);
    if (qm) {
      const num = Number(qm[1]);
      if (num >= from && num <= to && num > lastNum()) {
        flush();
        current = { number: num, text: qm[2].trim(), inlineGap: false };
        continue;
      }
    }

    // ۳) شمارهٔ داخل جمله + جای خالی (تکمیل خلاصه/جدول/فرم)
    const embedded = [...line.matchAll(RE_EMBEDDED_GAP)]
      .map((m) => ({
        num: Number(m[1]),
        start: m.index ?? 0,
        end: (m.index ?? 0) + m[0].length,
      }))
      .filter((e) => e.num >= from && e.num <= to && e.num > lastNum());
    if (embedded.length > 0) {
      // سوال قبلی (از خطوط قبل) اینجا تمام می‌شود؛ بافتِ قبل از
      // هر عدد → متن همان سوال، دنبالهٔ بعد از آخرین جای خالی →
      // فقط سوال آخرِ خط
      flush();
      for (let i = 0; i < embedded.length; i++) {
        const e = embedded[i];
        const leadIn = line.slice(i === 0 ? 0 : embedded[i - 1].end, e.start).trim();
        let text = leadIn ? `${leadIn} {GAP}` : "{GAP}";
        if (i === embedded.length - 1) {
          const tail = line.slice(e.end).trim();
          if (tail) text += ` ${tail}`;
        }
        questions.push({ number: e.num, text: markGaps(text), inlineGap: true });
      }
      continue;
    }

    // ۴) ادامهٔ متن سوال جاری
    if (current && !isInstructionLine(line)) {
      current.text += " " + line;
    }
  }
  flush();
  return questions;
}

// ---------- تجزیهٔ لیسنینگ ----------

export function parseListeningPaper(lines: string[]): PaperSection[] {
  const sections: PaperSection[] = [];

  const marks: { idx: number; title: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(RE_SECTION_OR_PART);
    if (m) marks.push({ idx: i, title: `SECTION ${m[1]}` });
  }
  if (marks.length === 0) return sections;

  for (let s = 0; s < marks.length; s++) {
    const from = marks[s].idx;
    const to = s + 1 < marks.length ? marks[s + 1].idx : lines.length;
    const blockLines = lines.slice(from, to);

    // بازهٔ سوال‌ها — «Questions 1-10» ممکن است در همان خط SECTION باشد
    let range: string | null = null;
    let rangeIdx = -1;
    let expectedFrom = 1;
    let expectedTo = 40;
    for (let i = 0; i < blockLines.length; i++) {
      const rm = blockLines[i].match(/questions?\s+(\d{1,2})\s*[-–—]\s*(\d{1,2})/i);
      if (rm) {
        expectedFrom = Number(rm[1]);
        expectedTo = Number(rm[2]);
        range = `Questions ${expectedFrom}-${expectedTo}`;
        rangeIdx = i;
        break;
      }
    }

    // راهنما: خطوط بعد از بازه تا اولین سوال
    const instructionLines: string[] = [];
    let firstQIdx = blockLines.length;
    for (let i = (rangeIdx === -1 ? 1 : rangeIdx + 1); i < blockLines.length; i++) {
      const qm = blockLines[i].match(RE_QNUM);
      if (qm && Number(qm[1]) >= expectedFrom && Number(qm[1]) <= expectedTo + 2) {
        firstQIdx = i;
        break;
      }
      instructionLines.push(blockLines[i].trim());
    }

    const questions = parseQuestions(blockLines.slice(firstQIdx), expectedFrom, expectedTo);

    if (questions.length > 0) {
      sections.push({
        title: marks[s].title,
        questionRange: range,
        instruction: instructionLines.filter(Boolean).slice(0, 8).join(" · "),
        questions,
      });
    }
  }

  return sections;
}

// ---------- تجزیهٔ ریدینگ ----------

export function parseReadingPaper(lines: string[]): PaperSection[] {
  const sections: PaperSection[] = [];

  type Mark = { idx: number; kind: "passage" | "qrange"; passage?: number; from?: number; to?: number };
  const marks: Mark[] = [];
  for (let i = 0; i < lines.length; i++) {
    const pm = lines[i].match(RE_READING_PASSAGE);
    if (pm) {
      marks.push({ idx: i, kind: "passage", passage: Number(pm[1]) });
      continue;
    }
    const qm = lines[i].match(RE_QUESTIONS_RANGE);
    if (qm && Number(qm[1]) >= 1 && Number(qm[1]) <= 40) {
      marks.push({ idx: i, kind: "qrange", from: Number(qm[1]), to: qm[2] ? Number(qm[2]) : Number(qm[1]) + 4 });
    }
  }
  if (marks.length === 0) return sections;

  let passageNumber = 0;
  let passageTitle: string | undefined;
  let passageBody: string | undefined;
  let passageFresh = false;

  for (let mi = 0; mi < marks.length; mi++) {
    const mark = marks[mi];
    const nextIdx = mi + 1 < marks.length ? marks[mi + 1].idx : lines.length;

    if (mark.kind === "passage") {
      passageNumber = mark.passage ?? passageNumber + 1;
      // متن پاساژ: تا گروه سوال بعدی (یا پاساژ بعدی)
      const nextPassage = marks.slice(mi + 1).find((m) => m.kind === "passage");
      const stopIdx = nextPassage ? nextPassage.idx : Infinity;
      const nextQ = marks.slice(mi + 1).find((m) => m.kind === "qrange" && m.idx < stopIdx);

      const bodyEnd = nextQ ? nextQ.idx : Math.min(stopIdx === Infinity ? lines.length : stopIdx, mark.idx + 80);

      // عنوان پاساژ = اولین خط معنادار بعد از نشانگر (پرش از خطوط راهنما)
      let tIdx = mark.idx + 1;
      while (
        tIdx < lines.length &&
        (isBlank(lines[tIdx]) ||
          /^you should spend/i.test(lines[tIdx].trim()) ||
          RE_QUESTIONS_RANGE.test(lines[tIdx]))
      ) {
        tIdx++;
      }
      passageTitle = tIdx < bodyEnd && !RE_QUESTIONS_RANGE.test(lines[tIdx]) ? lines[tIdx].trim() : undefined;
      const bodyStart = passageTitle ? tIdx + 1 : tIdx;
      passageBody =
        lines
          .slice(bodyStart, bodyEnd)
          .filter((l) => !isBlank(l) && !/^(You should spend|Questions?\s+\d)/i.test(l.trim()))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim() || undefined;
      passageFresh = true;
      continue;
    }

    // گروه سوال
    const blockLines = lines.slice(mark.idx, nextIdx);

    const instructionLines: string[] = [];
    let firstQIdx = 0;
    for (let i = 1; i < blockLines.length; i++) {
      const qm = blockLines[i].match(RE_QNUM);
      if (qm && Number(qm[1]) >= mark.from! && Number(qm[1]) <= mark.to! + 2) {
        firstQIdx = i;
        break;
      }
      instructionLines.push(blockLines[i].trim());
    }

    const questions = parseQuestions(blockLines.slice(firstQIdx), mark.from!, mark.to!);
    if (questions.length === 0) continue;

    sections.push({
      title: `Passage ${passageNumber || sections.length + 1}`,
      questionRange: `Questions ${mark.from}-${mark.to}`,
      instruction: instructionLines.filter(Boolean).slice(0, 8).join(" · "),
      passageTitle: passageFresh ? passageTitle : undefined,
      passageBody: passageFresh ? passageBody : undefined,
      questions,
    });
    // پاساژ فقط برای اولین گروه سوالش نمایش داده می‌شود
    passageFresh = false;
  }

  return sections;
}

// ---------- تجزیهٔ رایتینگ ----------

/** تجزیهٔ صورت تسک‌های رایتینگ از خطوط بخش WRITING (v1.0.4.3 — export برای writing-paper) */
export function parseWritingPaper(lines: string[]): WritingTaskPrompt[] {
  const tasks: WritingTaskPrompt[] = [];
  const taskMarks: { idx: number; task: 1 | 2 }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*writing\s+task\s+(\d)\b/i);
    if (m && (m[1] === "1" || m[1] === "2")) {
      taskMarks.push({ idx: i, task: Number(m[1]) as 1 | 2 });
    }
  }

  for (let t = 0; t < taskMarks.length; t++) {
    const from = taskMarks[t].idx;
    const to = t + 1 < taskMarks.length ? taskMarks[t + 1].idx : Math.min(lines.length, from + 30);
    const block = lines
      .slice(from, to)
      .map((l) => l.trim())
      .filter((l) => l && !/^-?\s*\d{1,3}\s*-?$/.test(l));

    const minWords = block.some((l) => /250/.test(l)) ? 250 : 150;
    const prompt = block
      .filter((l) => !/^writing task \d/i.test(l))
      .slice(0, 10)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (prompt.length > 20) {
      tasks.push({ task: taskMarks[t].task, prompt, minWords });
    }
  }

  return tasks;
}

// ---------- ساخت برگهٔ کامل ----------

/** ساخت برگهٔ امتحان یک مهارت از یک تست */
export function buildExamPaper(
  pages: string[],
  testNumber: number,
  skill: PaperSkill,
): ExamPaper {
  const { testPages, keyStart } = locateTests(pages);
  const startPage = testPages[testNumber];
  if (startPage === undefined) {
    return { ok: false, reason: `Test ${testNumber} در PDF پیدا نشد` };
  }

  const endPage = (() => {
    const nums = Object.keys(testPages)
      .map(Number)
      .filter((n) => n > testNumber)
      .sort((a, b) => a - b);
    if (nums.length > 0 && testPages[nums[0]] > startPage) return testPages[nums[0]];
    if (keyStart !== null && keyStart > startPage) return keyStart;
    return pages.length;
  })();

  const testLines = sliceLines(pages, startPage, endPage);

  if (skill === "writing") {
    const block = skillBlock(testLines, (l) => RE_WRITING.test(l.trim()), [
      (l) => RE_SPEAKING.test(l.trim()),
    ]);
    if (!block) return { ok: false, reason: "بخش WRITING در PDF پیدا نشد" };
    const tasks = parseWritingPaper(testLines.slice(block.startIdx, block.endIdx));
    if (tasks.length === 0) return { ok: false, reason: "تسک‌های رایتینگ در PDF پیدا نشدند" };
    return { ok: true, skill, testNumber, sections: [], writing: tasks, totalQuestions: 2 };
  }

  const marker = skill === "listening" ? RE_LISTENING : RE_READING;
  const endMarkers =
    skill === "listening"
      ? [(l: string) => RE_READING.test(l.trim()), (l: string) => RE_WRITING.test(l.trim())]
      : [(l: string) => RE_WRITING.test(l.trim()), (l: string) => RE_SPEAKING.test(l.trim())];

  const block = skillBlock(testLines, (l) => marker.test(l.trim()), endMarkers);
  if (!block) {
    return {
      ok: false,
      reason: `بخش ${skill === "listening" ? "LISTENING" : "READING"} در PDF پیدا نشد`,
    };
  }
  const blockLines = testLines.slice(block.startIdx, block.endIdx);

  const sections =
    skill === "listening" ? parseListeningPaper(blockLines) : parseReadingPaper(blockLines);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  if (totalQuestions < 24) {
    return {
      ok: false,
      reason: `فقط ${totalQuestions} سوال از متن PDF خوانده شد — ساختار این کتاب با برگه‌ساز سازگار نیست`,
    };
  }

  return { ok: true, skill, testNumber, sections, totalQuestions };
}

// ---------- پاسخ‌نامه (Answer key) ----------

function isQuestionNumberToken(token: string, from: number, to: number): boolean {
  if (!/^\d{1,2}$/.test(token)) return false;
  const n = Number(token);
  return n >= from && n <= to;
}

/**
 * استخراج جفت‌های «شماره → پاسخ» از متن مرتب پاسخ‌نامه.
 * هر عددی که دقیقاً «عدد مورد انتظار بعدی» باشد شروع پاسخ
 * جدید است؛ هر توکن دیگر بخشی از پاسخ قبلی است.
 */
function extractOrderedPairs(
  text: string,
  from: number,
  to: number,
): { number: number; answer: string }[] {
  // پیشوند‌های ساختاری (SECTION 2 / PART 3 / Test 1) حذف می‌شوند
  // تا عددِ آن‌ها در پاسخ قبلی نفوز نکند
  const cleaned = text
    .replace(/(?:^|\s)(?:section|part)\s+\d{1,2}(?=\s|$)/gi, " ")
    .replace(/(?:^|\s)test\s+\d(?=\s|$)/gi, " ");
  const tokens = cleaned
    .replace(/[\u2018\u2019]/g, "'")
    .split(/[\s,;]+/)
    .filter(Boolean);

  const pairs: { number: number; answer: string }[] = [];
  let expected = from;
  let currentNum: number | null = null;
  let currentTokens: string[] = [];

  const flush = () => {
    if (currentNum !== null && currentTokens.length > 0) {
      pairs.push({ number: currentNum, answer: currentTokens.join(" ").trim() });
    }
    currentNum = null;
    currentTokens = [];
  };

  for (const token of tokens) {
    const cleanToken = token.replace(/[.:()\[\]]/g, "");
    if (isQuestionNumberToken(cleanToken, expected, to) && Number(cleanToken) === expected) {
      flush();
      currentNum = expected;
      expected++;
    } else if (currentNum !== null) {
      currentTokens.push(token);
      if (currentTokens.join(" ").length > 60) flush();
    }
  }
  flush();
  return pairs;
}

/** نرمال‌سازی یک پاسخ پاسخ‌نامه برای مقایسه */
function normalizeKeyAnswer(raw: string): string {
  let t = raw.trim().replace(/[.,;:!?]+$/g, "").trim();
  const wrap = t.match(/^\((.+)\)$/);
  if (wrap) t = wrap[1].trim();
  return t;
}

/** تبدیل جفت‌ها به کلید { r1: [...] } یا { l1: [...] } */
function pairsToKey(pairs: { number: number; answer: string }[], prefix: "r" | "l"): AnswerKeyEntry {
  const key: AnswerKeyEntry = {};
  for (const p of pairs) {
    const id = `${prefix}${p.number}`;
    if (!key[id]) key[id] = [normalizeKeyAnswer(p.answer)];
  }
  return key;
}

/**
 * خواندن پاسخ‌نامهٔ همهٔ تست‌های کتاب از صفحات «Answer key».
 * خروجی: شمارهٔ تست → { reading?: { r1..r40: [...] }, listening?: { l1..l40: [...] } }
 * فقط کلیدهایی که حداقل ۳۰ سوال دارند پذیرفته می‌شوند.
 */
export function parseAnswerKeys(pages: string[]): BookAnswerKeys {
  const keys: BookAnswerKeys = {};
  const { keyStart } = locateTests(pages);
  if (keyStart === null) return keys;

  // پایان پاسخ‌نامه: اولین صفحهٔ Tapescripts بعد از keyStart
  let keyEnd = pages.length;
  for (let i = keyStart + 1; i < pages.length; i++) {
    const hasTape = pages[i].split("\n").some((l) => RE_TAPESCRIPT.test(l.trim()));
    if (hasTape) {
      keyEnd = i;
      break;
    }
  }

  const keyLines = sliceLines(pages, keyStart, keyEnd);

  // تقسیم بر «Test n»
  const testSpans: { test: number; from: number; to: number }[] = [];
  for (let i = 0; i < keyLines.length; i++) {
    const m = keyLines[i].trim().match(RE_TEST_HEADING);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 4) {
        if (testSpans.length > 0) testSpans[testSpans.length - 1].to = i;
        testSpans.push({ test: n, from: i, to: keyLines.length });
      }
    }
  }

  for (const span of testSpans) {
    const blockLines = keyLines.slice(span.from, span.to);

    // زیربلوک لیسنینگ/ریدینگ — ترتیب هرچه باشد
    let lIdx = -1;
    let rIdx = -1;
    for (let i = 1; i < blockLines.length; i++) {
      const t = blockLines[i].trim();
      if (lIdx === -1 && /^listening\b/i.test(t)) lIdx = i;
      if (rIdx === -1 && /^reading\b/i.test(t)) rIdx = i;
    }

    const entry: { reading?: AnswerKeyEntry; listening?: AnswerKeyEntry } = {};

    const extract = (fromIdx: number, toIdx: number, prefix: "r" | "l") => {
      const text = blockLines.slice(fromIdx, toIdx).join("\n");
      const pairs = extractOrderedPairs(text, 1, 40);
      if (pairs.length >= 30) return pairsToKey(pairs, prefix);
      return null;
    };

    if (lIdx !== -1) {
      const lEnd = rIdx > lIdx ? rIdx : blockLines.length;
      entry.listening = extract(lIdx + 1, lEnd, "l") ?? undefined;
    }
    if (rIdx !== -1) {
      entry.reading = extract(rIdx + 1, blockLines.length, "r") ?? undefined;
    }

    if (entry.reading || entry.listening) keys[span.test] = entry;
  }

  return keys;
}
