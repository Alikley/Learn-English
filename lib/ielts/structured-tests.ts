// ========================================
// آزمون‌های ساخت‌یافتهٔ آیلتس (v1.0.3.7)
//
// محتوای دقیق و کامل بعضی آزمون‌ها به‌صورت ساخت‌یافته
// اینجا تعریف می‌شود — مثل سایت‌های آزمون آنلاین (تستینو):
// برگهٔ امتحان با جدول/فرم/گزینه/نقشهٔ واقعی کتاب، مستقل
// از PDF. فعلاً «کمبریج ۴ — تست ۱ — لیسنینگ» کامل موجود است.
//
// ساختار URL مطابق تستینو:
//   /ielts/cambridge/[book]/[test]/[skill]/part/[part]
// ========================================

import type { IeltsSkill } from "@/types/ielts";

// ---------- مدل محتوا ----------

/** یک جای خالی (اسلات پاسخ) داخل محتوا */
export type StructGap = {
  /** شمارهٔ سوال ۱..۴۰ */
  q: number;
  /** زیرشاخهٔ چندجایی (سوال ۱۱ دو جای خالی دارد: 1 و 2) */
  sub?: 1 | 2;
};

/** سلول جدول: متن + جاهای خالی تعبیه‌شده */
export type StructCell = {
  /** قطعات محتوا — رشته یا جای خالی */
  parts: (string | StructGap)[];
  /** سلول سرستون (پس‌زمینهٔ خاکستری، بولد) */
  header?: boolean;
  /** عرض کامل (colspan) */
  wide?: boolean;
};

/** ردیف جدول */
export type StructRow = { cells: StructCell[] };

/** جدول یادداشت/فرم (مثل NOTES ON SOCIAL PROGRAMME) */
export type StructTable = {
  kind: "table";
  /** سربرگ جدول — «NOTES ON SOCIAL PROGRAMME» */
  title: string;
  rows: StructRow[];
};

/** فهرست گلوله‌ای با جاهای خالی (یادداشت‌های لیسنینگ) */
export type StructList = {
  kind: "list";
  /** سربرگ — «THE URBAN LANDSCAPE» */
  title?: string;
  /** زیرعنوان‌های میانی — { h: "Temperature regulation:" } */
  items: ({ parts: (string | StructGap)[] } | { h: string })[];
};

/** چندگزینه‌ای (رادیو) */
export type StructMcq = {
  kind: "mcq";
  /** نمونهٔ حل‌شدهٔ رسمی کتاب */
  example?: { stem: string; options: { letter: string; text: string }[]; answer: string };
  items: {
    q: number;
    stem: string;
    options: { letter: string; text: string }[];
  }[];
};

/** تطبیق (جعبهٔ گزینه‌ها → هر سوال یک حرف) */
export type StructMatching = {
  kind: "matching";
  /** صورت سوال — «What recommendations does Dr Johnson make…» */
  prompt?: string;
  example?: { label: string; answer: string };
  items: { q: number; label: string }[];
  options: { letter: string; text: string }[];
};

/** نقشه/پلان قابل برچسب‌گذاری (SVG داخلی) */
export type StructPlan = {
  kind: "plan";
  /** شناسهٔ نقشهٔ داخلی SVG */
  plan: "riverside-village";
  /** لیبل‌های زیر نقشه — «{q} … Road» */
  labels: { parts: (string | StructGap)[] }[];
};

/** نمودار ستونی قابل برچسب‌گذاری (SVG داخلی) */
export type StructChart = {
  kind: "chart";
  /** شناسهٔ نمودار داخلی SVG */
  chart: "reasons-moving";
  /** عنوان نمودار */
  title: string;
  /** ستون‌ها: لیبل داده‌شده یا سوال */
  bars: { given?: string; q?: number; h: number }[];
  options: { letter: string; text: string }[];
};

export type StructBlock =
  | StructTable
  | StructList
  | StructMcq
  | StructMatching
  | StructPlan
  | StructChart;

/** یک گروه سوال — «Questions 1-4» + راهنما + محتوا */
export type StructGroup = {
  heading: string;
  instruction: string[];
  block: StructBlock;
};

/** یک Part لیسنینگ (Section) */
export type StructPart = {
  /** ۱..۴ */
  part: number;
  /** راهنمای کوتاه زیر عنوان Part — مثل تستینو */
  subtitle: string;
  groups: StructGroup[];
};

/** آزمون ساخت‌یافتهٔ کامل یک مهارت */
export type StructuredExam = {
  skill: IeltsSkill;
  /** عنوان آزمون — «Cambridge 04-1 · Listening» */
  title: string;
  parts: StructPart[];
};

const g = (q: number, sub?: 1 | 2): StructGap => ({ q, sub });
const t = (s: string): StructCell => ({ parts: [s] });
const cell = (...parts: (string | StructGap)[]): StructCell => ({ parts });

// ========================================
// Cambridge IELTS 4 — Test 1 — Listening
// (محتوای رسمی کتاب: ۴ بخش × ۱۰ سوال)
// ========================================

const C04T1_LISTENING: StructuredExam = {
  skill: "listening",
  title: "Cambridge 04-1 · Listening",
  parts: [
    // ---------------- Part 1 (Section 1) ----------------
    {
      part: 1,
      subtitle: "listen and answer questions",
      groups: [
        {
          heading: "Questions 1-4",
          instruction: [
            "Complete the notes.",
            "Write NO MORE THAN THREE WORDS AND/OR A NUMBER in each gap.",
          ],
          block: {
            kind: "table",
            title: "NOTES ON SOCIAL PROGRAMME",
            rows: [
              {
                cells: [
                  { parts: ["Example"] },
                  // نمونهٔ حل‌شدهٔ رسمی: عدد ۵ از قبل داده شده
                  t("Number of trips per month:  5"),
                ],
              },
              { cells: [{ parts: ["Visit places which have:"], wide: true }] },
              {
                cells: [
                  t(""),
                  cell(
                    "- historical interest",
                    "  - good ",
                    g(1),
                    "  - ",
                    g(2),
                  ),
                ],
              },
              { cells: [t("Cost:"), t("between £5.00 and £15.00 per person")] },
              { cells: [t("Note:"), cell("special trips organised for groups of ", g(3), " people")] },
              { cells: [t("Time:"), cell("departure — 8.30 a.m.  ·  return — 6.00 p.m.")] },
              { cells: [t("To reserve a seat:"), cell("sign name on the ", g(4), " 3 days in advance")] },
            ],
          },
        },
        {
          heading: "Questions 5-10",
          instruction: [
            "Complete the notes.",
            "Write NO MORE THAN THREE WORDS AND/OR A NUMBER in each gap.",
          ],
          block: {
            kind: "table",
            title: "WEEKEND TRIPS",
            rows: [
              {
                cells: [
                  t("Place"),
                  t("Date"),
                  t("Number of seats"),
                  t("Optional extra"),
                ].map((c) => ({ ...c, header: true })),
              },
              { cells: [t("St Ives"), cell(g(5)), t("16"), t("Hepworth Museum")] },
              { cells: [t("London"), t("16th February"), t("45"), cell(g(6))] },
              { cells: [cell(g(7)), t("3rd March"), t("18"), t("S.S. Great Britain")] },
              { cells: [t("Salisbury"), t("18th March"), t("50"), t("Stonehenge")] },
              { cells: [t("Bath"), t("23rd March"), t("16"), cell(g(8))] },
              { cells: [{ parts: ["For further information"], wide: true }] },
              {
                cells: [
                  {
                    parts: ["Read the ", g(9), " or see Social Assistant: Jane ", g(10)],
                    wide: true,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ---------------- Part 2 (Section 2) ----------------
    {
      part: 2,
      subtitle: "listen and answer questions",
      groups: [
        {
          heading: "Questions 11-13",
          instruction: [
            "Complete the notes.",
            "Write NO MORE THAN THREE WORDS AND/OR A NUMBER in each gap.",
          ],
          block: {
            kind: "list",
            title: "RIVERSIDE INDUSTRIAL VILLAGE",
            items: [
              {
                parts: [
                  "Riverside Village was a good place to start an industry because it had water, raw materials and fuels such as ",
                  g(11, 1),
                  " and ",
                  g(11, 2),
                  ".",
                ],
              },
              {
                parts: [
                  "The metal industry was established at Riverside Village by ",
                  g(12),
                  " who lived in the area.",
                ],
              },
              {
                parts: [
                  "There were over ",
                  g(13),
                  " water-powered mills in the area in the eighteenth century.",
                ],
              },
            ],
          },
        },
        {
          heading: "Questions 14-20",
          instruction: [
            "Label the plan below.",
            "Write NO MORE THAN TWO WORDS for each answer.",
          ],
          block: {
            kind: "plan",
            plan: "riverside-village",
            labels: [
              { parts: [g(14), " Road"] },
              { parts: ["The ", g(15)] },
              { parts: ["The ", g(16)] },
              { parts: ["The ", g(17)] },
              { parts: ["The ", g(18)] },
              { parts: ["The ", g(19)] },
              { parts: ["The ", g(20), " for the workers"] },
            ],
          },
        },
      ],
    },
    // ---------------- Part 3 (Section 3) ----------------
    {
      part: 3,
      subtitle: "listen and answer questions",
      groups: [
        {
          heading: "Questions 21 and 22",
          instruction: ["Choose the correct answer."],
          block: {
            kind: "mcq",
            example: {
              stem: "Melanie could not borrow any books from the library because",
              options: [
                { letter: "A", text: "the librarian was out." },
                { letter: "B", text: "she didn't have time to look." },
                { letter: "C", text: "the books had already been borrowed." },
              ],
              answer: "C",
            },
            items: [
              {
                q: 21,
                stem: "Melanie says she has not started the assignment because",
                options: [
                  { letter: "A", text: "she was doing work for another course." },
                  { letter: "B", text: "it was a really big assignment." },
                  { letter: "C", text: "she hasn't spent time in the library." },
                ],
              },
              {
                q: 22,
                stem: "The lecturer says that reasonable excuses for extensions are",
                options: [
                  { letter: "A", text: "planning problems." },
                  { letter: "B", text: "problems with assignment deadlines." },
                  { letter: "C", text: "personal illness or accident." },
                ],
              },
            ],
          },
        },
        {
          heading: "Questions 23-27",
          instruction: [
            "What recommendations does Dr Johnson make about the journal articles?",
            "Choose the correct letter, A-G, for each question.",
          ],
          block: {
            kind: "matching",
            example: { label: "Anderson and Hawker", answer: "A" },
            items: [
              { q: 23, label: "Jackson" },
              { q: 24, label: "Roberts" },
              { q: 25, label: "Morris" },
              { q: 26, label: "Cooper" },
              { q: 27, label: "Forster" },
            ],
            options: [
              { letter: "A", text: "must read" },
              { letter: "B", text: "useful" },
              { letter: "C", text: "limited value" },
              { letter: "D", text: "read first section" },
              { letter: "E", text: "read research methods" },
              { letter: "F", text: "read conclusion" },
              { letter: "G", text: "don't read" },
            ],
          },
        },
        {
          heading: "Questions 28-30",
          instruction: [
            "Label the chart below.",
            "Choose answers from the box and write the correct letter, A-H.",
          ],
          block: {
            kind: "chart",
            chart: "reasons-moving",
            title: "Reasons why people change accommodation",
            bars: [
              { given: "C", h: 88 },
              { q: 28, h: 62 },
              { given: "E", h: 46 },
              { q: 29, h: 30 },
              { given: "G", h: 54 },
              { q: 30, h: 76 },
            ],
            options: [
              { letter: "A", text: "uncooperative landlord" },
              { letter: "B", text: "environment" },
              { letter: "C", text: "space" },
              { letter: "D", text: "noisy neighbours" },
              { letter: "E", text: "near city" },
              { letter: "F", text: "work location" },
              { letter: "G", text: "transport" },
              { letter: "H", text: "rent" },
            ],
          },
        },
      ],
    },
    // ---------------- Part 4 (Section 4) ----------------
    {
      part: 4,
      subtitle: "listen and answer questions",
      groups: [
        {
          heading: "Questions 31-40",
          instruction: [
            "Complete the notes.",
            "Write NO MORE THAN TWO WORDS in each gap.",
          ],
          block: {
            kind: "list",
            title: "THE URBAN LANDSCAPE",
            items: [
              { h: "Two areas of focus:" },
              { parts: ["the effect of vegetation on the urban climate"] },
              { parts: ["ways of planning our ", g(31), " better"] },
              { h: "Large-scale impact of trees:" },
              { parts: ["they can make cities more or less ", g(32)] },
              { parts: ["in summer they can make cities cooler"] },
              { parts: ["they can make inland cities more ", g(33)] },
              { h: "Local impact of trees:" },
              {
                parts: [
                  "they can make local areas",
                  "  — more ",
                  g(34),
                  "  — cooler  — more humid  — less windy  — less ",
                  g(35),
                ],
              },
              { h: "Comparing trees and buildings" },
              { h: "Temperature regulation:" },
              { parts: ["trees evaporate water through their ", g(36)] },
              { parts: ["building surfaces may reach high temperatures"] },
              { h: "Wind force:" },
              { parts: ["tall buildings cause more wind at ", g(37), " level"] },
              { parts: ["trees ", g(38), " the wind force"] },
              { h: "Noise:" },
              { parts: ["trees have a small effect on traffic noise"] },
              { parts: [g(39), " frequency noise passes through trees"] },
              { h: "Important points to consider:" },
              { parts: ["trees require a lot of sunlight, water and ", g(40), " to grow"] },
            ],
          },
        },
      ],
    },
  ],
};

// ---------- رجیستری آزمون‌های ساخت‌یافته ----------

const REGISTRY: Record<string, StructuredExam> = {
  "cambridge-04-t1:listening": C04T1_LISTENING,
};

/** آیا برای این کتاب/تست/مهارت برگهٔ ساخت‌یافته داریم؟ */
export function getStructuredExam(
  bookId: number,
  testId: number,
  skill: IeltsSkill,
): StructuredExam | null {
  const book = `cambridge-${String(bookId).padStart(2, "0")}`;
  return REGISTRY[`${book}-t${testId}:${skill}`] ?? null;
}

/** شمارهٔ سوال‌های یک Part از آزمون ساخت‌یافته */
export function partQuestionNumbers(exam: StructuredExam, part: number): number[] {
  const p = exam.parts.find((x) => x.part === part);
  if (!p) return [];
  const nums: number[] = [];
  for (const grp of p.groups) {
    const walk = (b: StructBlock) => {
      const push = (q: number) => {
        if (q >= 1 && !nums.includes(q)) nums.push(q);
      };
      switch (b.kind) {
        case "table":
          for (const row of b.rows)
            for (const c of row.cells)
              for (const part of c.parts) if (typeof part !== "string") push(part.q);
          break;
        case "list":
          for (const item of b.items)
            if ("parts" in item)
              for (const part of item.parts) if (typeof part !== "string") push(part.q);
          break;
        case "mcq":
          for (const item of b.items) push(item.q);
          break;
        case "matching":
          for (const item of b.items) push(item.q);
          break;
        case "plan":
          for (const l of b.labels)
            for (const part of l.parts) if (typeof part !== "string") push(part.q);
          break;
        case "chart":
          for (const bar of b.bars) if (bar.q) push(bar.q);
          break;
      }
    };
    walk(grp.block);
  }
  return nums.sort((a, b) => a - b);
}

/** کل سوال‌های آزمون ساخت‌یافته (باید ۱..۴۰ باشد) */
export function allQuestionNumbers(exam: StructuredExam): number[] {
  const out: number[] = [];
  for (let p = 1; p <= 4; p++) out.push(...partQuestionNumbers(exam, p));
  return out.sort((a, b) => a - b);
}
