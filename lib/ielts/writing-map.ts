// ========================================
// نقشهٔ رایتینگ کتاب‌های کمبریج (v1.0.4.4 — English 1.0.0.7)
//
// 📌 صفحات + متنِ صورت تسک‌های رایتینگ، یک‌بار جدا شده و
//    اینجا ثبت شده‌اند تا در زمان اجرا «فقط سوال» فوری
//    نشان داده شود (v1.0.0.5/1.0.0.6) — بدون بازکردن PDF.
//
// روش استخراج (هر کتاب بسته به نوع فایل):
//   ۱) لایهٔ متنی PDF (کتاب‌های ۱، ۴(ت۱)، ۱۷، ۲۱)
//   ۲) OCR صفحات (tesseract ۵.۵ @۲۰۰dpi — کتاب‌های اسکن)
//   ۳) بازبینی بصری مدل بینایی (نمونه‌گیری تصادفی)
//
// 🔎 شماره‌ها «صفحهٔ فیزیکی فایل PDF» هستند (۱-based) —
//    همان چیزی که نمایشگر PDF مرورگر با #page=N باز می‌کند.
//
// پوشش فعلی: 80 تست در 20 کتابِ موجودِ باکت
// (20 کتاب با هر ۴ تستِ متن کامل) — کتاب ۸ فایل ندارد؛
// کتاب‌های آینده با تشخیص زندهٔ writing-paper پیدا می‌شوند.
// ========================================

export type WritingPagesEntry = {
  /** صفحهٔ «WRITING TASK 1» در فایل PDF کتاب (۱-based) */
  task1Page: number;
  /** صفحهٔ «WRITING TASK 2» در فایل PDF کتاب (۱-based) */
  task2Page: number;
};

/**
 * نقشهٔ تأییدشدهٔ صفحات رایتینگ
 * (کلید بیرونی: شمارهٔ کتاب؛ کلید درونی: شمارهٔ تست ۱..۴)
 */
const WRITING_PAGES: Record<number, Record<number, WritingPagesEntry>> = {
  1: {
    1: { task1Page: 37, task2Page: 38 },
    2: { task1Page: 57, task2Page: 58 },
    3: { task1Page: 78, task2Page: 79 },
    4: { task1Page: 97, task2Page: 98 }
  },
  2: {
    1: { task1Page: 26, task2Page: 27 },
    2: { task1Page: 48, task2Page: 49 },
    3: { task1Page: 70, task2Page: 71 },
    4: { task1Page: 92, task2Page: 93 }
  },
  3: {
    1: { task1Page: 31, task2Page: 32 },
    2: { task1Page: 55, task2Page: 56 },
    3: { task1Page: 77, task2Page: 78 },
    4: { task1Page: 101, task2Page: 102 }
  },
  4: {
    1: { task1Page: 26, task2Page: 27 },
    2: { task1Page: 51, task2Page: 52 },
    3: { task1Page: 75, task2Page: 76 },
    4: { task1Page: 97, task2Page: 98 }
  },
  5: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 53, task2Page: 54 },
    3: { task1Page: 76, task2Page: 77 },
    4: { task1Page: 99, task2Page: 100 }
  },
  6: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 52, task2Page: 53 },
    3: { task1Page: 75, task2Page: 76 },
    4: { task1Page: 98, task2Page: 99 }
  },
  7: {
    1: { task1Page: 22, task2Page: 23 },
    2: { task1Page: 45, task2Page: 46 },
    3: { task1Page: 70, task2Page: 71 },
    4: { task1Page: 93, task2Page: 94 }
  },
  9: {
    1: { task1Page: 21, task2Page: 22 },
    2: { task1Page: 44, task2Page: 45 },
    3: { task1Page: 67, task2Page: 68 },
    4: { task1Page: 92, task2Page: 93 }
  },
  10: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 54, task2Page: 55 },
    3: { task1Page: 77, task2Page: 78 },
    4: { task1Page: 101, task2Page: 102 }
  },
  11: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 54, task2Page: 55 },
    3: { task1Page: 77, task2Page: 78 },
    4: { task1Page: 100, task2Page: 101 }
  },
  12: {
    1: { task1Page: 27, task2Page: 28 },
    2: { task1Page: 50, task2Page: 51 },
    3: { task1Page: 71, task2Page: 72 },
    4: { task1Page: 92, task2Page: 93 }
  },
  13: {
    1: { task1Page: 28, task2Page: 29 },
    2: { task1Page: 50, task2Page: 51 },
    3: { task1Page: 72, task2Page: 73 },
    4: { task1Page: 93, task2Page: 94 }
  },
  14: {
    1: { task1Page: 20, task2Page: 21 },
    2: { task1Page: 41, task2Page: 42 },
    3: { task1Page: 63, task2Page: 64 },
    4: { task1Page: 85, task2Page: 86 }
  },
  15: {
    1: { task1Page: 28, task2Page: 29 },
    2: { task1Page: 49, task2Page: 50 },
    3: { task1Page: 71, task2Page: 72 },
    4: { task1Page: 93, task2Page: 94 }
  },
  16: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 53, task2Page: 54 },
    3: { task1Page: 74, task2Page: 75 },
    4: { task1Page: 96, task2Page: 97 }
  },
  17: {
    1: { task1Page: 22, task2Page: 23 },
    2: { task1Page: 44, task2Page: 45 },
    3: { task1Page: 66, task2Page: 67 },
    4: { task1Page: 87, task2Page: 88 }
  },
  18: {
    1: { task1Page: 31, task2Page: 32 },
    2: { task1Page: 54, task2Page: 55 },
    3: { task1Page: 77, task2Page: 78 },
    4: { task1Page: 98, task2Page: 99 }
  },
  19: {
    1: { task1Page: 29, task2Page: 30 },
    2: { task1Page: 51, task2Page: 52 },
    3: { task1Page: 74, task2Page: 75 },
    4: { task1Page: 95, task2Page: 96 }
  },
  20: {
    1: { task1Page: 23, task2Page: 24 },
    2: { task1Page: 59, task2Page: 60 },
    3: { task1Page: 91, task2Page: 92 },
    4: { task1Page: 122, task2Page: 123 }
  },
  21: {
    1: { task1Page: 31, task2Page: 32 },
    2: { task1Page: 53, task2Page: 54 },
    3: { task1Page: 74, task2Page: 75 },
    4: { task1Page: 96, task2Page: 97 }
  }
};

/** جست‌وجوی صفحهٔ رایتینگ یک تست در نقشهٔ تأییدشده */
export function lookupWritingPages(
  bookNumber: number,
  testNumber: number,
): WritingPagesEntry | null {
  const entry = WRITING_PAGES[bookNumber]?.[testNumber];
  return entry ? { ...entry } : null;
}

// ========================================
// متن صورت تسک‌های رایتینگ — جدا شده از کتاب
// (استخراج یک‌بار: لایهٔ متنی / OCR / بازبینی بینایی)
// رابط کاربری v1.0.0.7 این متن را «فقط سوال» بالای
// صفحهٔ رایتینگ نشان می‌دهد؛ صفحهٔ کتاب فقط مکملِ نمودار است.
// ========================================

export type MapWritingPrompt = {
  task: 1 | 2;
  prompt: string;
  minWords: number;
};

const WRITING_PROMPTS: Record<number, Record<number, MapWritingPrompt[]>> = {
  1: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the results of a survey of adult education. The first chart shows the reasons why adults decide to study. The pie chart shows how people think the costs of adult education should be shared. Write a report for a university lecturer, describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: There are many different types of music in the world today. Why do we need music? Is the traditional music of a country more important than the international music that is heard everywhere nowadays? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how the Australian Bureau of Meteorology collects up-to-the-minute information on the weather in order to produce reliable forecasts. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Should wealthy nations be required to share their wealth among poorer nations by providing such things as food and education? Or is it the responsibility of the governments of poorer nations to look after their citizens themselves? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and with relevant evidence." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount of money per week spent on fast foods in Britain. The graph shows the trends in consumption of fast foods. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: News editors decide what to broadcast on television and what to print in newspapers. What factors do you think influence these decisions? Do we become used to bad news? Would it be better if more good news was reported? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. Chorleywood is a village near London whose population has increased steadily since the middle of the nineteenth century. The map below shows the development of the village. Write a report for a university lecturer describing the development of the village. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: The idea of having a single career is becoming an old fashioned one. The new fashion will be to have several careers or ways of earning money and further education will be something that continues throughout life. You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." }
    ]
  },
  2: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the consumer durables (telephone, refrigerator, etc.) owned in Britain from 1972 to 1983. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. “ Fatherhood ought to be emphasised as much as motherhood. The idea that women are solely responsible for deciding whether or not to have babies leads on to the idea that they are also responsible for bringing the children up.” To what extent do you agree or disagree’ You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples" }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount of leisure time enjoyed by men and women of different employment status. Write a report for a university lecturer describing the information shown below. You should write at least 150 wrods Leisure time in a typical week: by sex and employment status, 1998-99 WB Males (_] Females £ i 40 | 0 ‘ =i = Employed Employed Unemployed Retired full-time part-time" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic, “Prevention is better than cure.” Out of a country’s health budget, a large proportion should be diverted from treatment to spend- ing on health education and preventative measures. To what extent do you agree of disagree with this statement? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples" }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The first chart below shows the results of a survey which sampled a cross-section of 100,000 people asking if they travelled abroad and why they travelled for the period 1994-98. The second chart shows their destinations over the same period. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should write at least 250 words. Without capital punishment (the death penalty) our lives are less secure and crimes of violence increase. Capital punishment is essential to control violence in society. To what extent do you agree or disagree with this opinion? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples" }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the figures for imprisonment in five countries between 1930 and 1980. Write a report for a university lecturer describing the information shown below. You should write at least 150 words" },
      { task: 2, minWords: 250, prompt: "tid ciepet You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the follow- ing topic. The position of women in society has changed markedly in the last twenty years. Many of the problems young people now experience, such as juvenile delinquency, arise from the fact that many married women now work and are not at home to care for their children. To what extent do you agree or disagree with this opinion? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with exam-" }
    ]
  },
  3: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the number of Japanese tourists travelling abroad between 1985 and 1995 and Australia’s share of the Japanese tourist market. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Popular events like the football World Cup and other international sporting occasions are essential in easing international tensions and releasing patriotic emotions in a safe way. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount spent on six consumer goods in four European countries. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. When a country develops its technology, the traditional skills and ways of life die out. It is pointless to try and keep them alive. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the levels of participation in education and science in developing and industrialised countries in 1980 and 1990. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. In many countries children are engaged in some kind of paid work. Some people regard this as completely wrong, while others consider it as valuable work experience, important for learning and taking responsibility. What are your opinions on this? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the unemployment rates in the US and Japan between March 1993 and March 1999. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Improvements in health, education and trade are essential for the development of poorer nations. However, the governments of richer nations should take more responsibility for helping the poorer nations in such areas. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." }
    ]
  },
  4: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the proportion of different categories of families living in poverty in Australia in 1999. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Compare the advantages and disadvantages of three of the following as media for communicating information. State which you consider to be the most effective. • comics • books • radio • television • ﬁlm • theatre Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the demand for electricity in England during typical days in winter and surnmer. The pie chart shows how electricity is used in an average English home. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Happiness is considered very important in life. Why is it difficult to define? What factors are important in achieving happiness? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the different levels of post-schoal qualifications in Australia and the proportion of men and women who held them in 1999. Summavise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Creative artists should always be given the freedom to express their own ideas (in words, pictures, music or film) in whichever way they wish. There Should be no government restrictions on what they do.. To what extent do you agree or disagrée with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience, Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this taal. The charts beiow give informarion about travel to and from the UK, and shout the most popalar countries for UK residents to visit. Suonumarive tise and the oo ae reporting the main features, Write at least 150 words" },
      { task: 2, minWords: 250, prompt: "You should spend about 4) minutes on this task. Write about the following topic: Jn many countries schools dave severe problems with studens behaviour. Whar do you think are the canses off this? Whar solutions can you suggest? Give reasons for your answer and include any relevant examples from your own knowledge Of eXpenionce, Write at least 250 words." }
    ]
  },
  5: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the proportion of the population aged 65 and over between 1940 and 2040 in three different countries, Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Universities should accept equal numbers of male and female students in every subject. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the main reasons for study among students of different age groups and the amount of support they received from employers. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In some countries young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this. Give reasons for your answer and include any relevant examples from your own knowledge or experience, Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend abour 20 minutes on this task. The map below is of the town of Garlsdon. A new supermarket (S) is planned for the town, The map shows two possible sites for the supermarket. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that a sense of competition in children should be encouraged. Others believe that children who are taught to co-operate rather than compete become more useful adults. Discuss hoth these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at cast 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information about the underground railway systems in six cities, Summarise the information by selecting and reporting the main features, and make comparisons where relevant, Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Research indicates that the characteristics we are born with have much more influence on our personality and development than any experiences we may have in our life. Which do you consider to be the major influence? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words," }
    ]
  },
  6: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph and table below give information about water use worldwide and water consumption in two different countries. Summarise the information by selecting and reporting the main features, and make comparisons where relevant, Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Today, the high sales of popular consumer goods reflect the power of advertising and not the real needs of the society in which they are sold. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information about changes in modes of travel in England between 1985 and 2000. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Successful sports professionals can earn a great deal more money than people in other important professions, Some people think this is fully justified while others think it is unfair. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience, Write at least 250 words," }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagrams below show the life cycle of the silkworm and the stages in the production of silk cloth. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that visitors to other countries should follow local customs and behaviour, Others disagree and think that the host country should welcome cultural differences. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information about USA marriage and divorcee rates between 1970 and 2000, and the marital status of adult Americans in two of the years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant, Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people prefer to spend their lives doing the same things and avoiding change. Others, however, think that change is always a good thing. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  7: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information on consumer spending on different items in five different countries in 2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: It is generally believed that some people are born with certain talents, for instance for sport or music, and others are not. However, it is sometimes claimed that any child can be taught to become a good sports person or musician. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the consumption of fish and some different kinds of meat in a European country between 1979 and 2004. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that there should be fixed punishments for each type of crime. Others, however, argue that the circumstances of an individual crime, and the motivation for committing it, should always be taken into account when deciding on the punishment. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows information about changes in average house prices in five different cities between 1990 and 2002 compared with the average house prices in 1989. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: As most people spend a major part of their adult life at work, job satisfaction is an important element of individual wellbeing. What factors contribute to job satisfaction? How realistic is the expectation of job satisfaction for all workers? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The pie charts below show units of electricity production by fuel source in Australia and France in 1980 and 2000. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. What, in your opinion, should be the main function of a university? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  9: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The two maps below show an island, before and after the construction of some tourist facilities. Summarise the information by selecting and reporting the main features, and Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages of this outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the total number of minutes (in billions) of telephone calls in the UK, divided into three categories, from 1995-2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that unpaid community service should be a compulsory part of high school programmes (for example working for a charity, improving the neighbourhood or teaching sports to younger children). To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information on the ages of the populations of Yemen and Italy in 2000 and projections for 2050. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that the best way to improve public health is by increasing the number of sports facilities. Others, however, say that this would have little effect on public health and that other measures are required. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below gives information from a 2008 report about consumption of energy in the USA since 1980 with projections until 2030. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Every year several languages die out. Some people think that this is not important because life will be easier if there are fewer languages in the world. To what extent do you agree or disagree with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  10: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The first chart below shows how energy is used in an average Australian household. The second chart shows the greenhouse gas emissions which result from this energy use. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. It is important for children to learn the difference between right and wrong at an early age. Punishment is necessary to help them learn this distinction. To what extent do you agree or disagree with this opinion? What sort of punishment should parents and teachers be allowed to use to teach good behaviour to children? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The tables below give information about sales of Fairtrade*-labelled coffee and bananas in 1999 and 2004 in five European countries. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show what UK graduate and postgraduate students who did not go into full-time work did after leaving college in 2008. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Countries are becoming more and more similar because people are able to buy the same products anywhere in the world. Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagrams below show the life cycle of a species of large fish called the salmon. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Many museums charge for admission while others are free. Do you think the advantages of charging people for admission to museums outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  11: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. —— — — — — — — The charts below show the percentage of water used for different purposes in Six areas of the world. | Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Lo Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Governments should spend money on railways rather than roads. | To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the proportions of British students at one university in England who were able to speak other languages in addition to English, in 2000 and 2010. | Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people claim that not enough of the waste from homes is recycled. They say that the only way to increase recycling is for governments to make | it a legal requirement. To what extent do you think laws are needed to make people recycle more of their waste? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows average carbon dioxide (CO2) emissions per person in the United Kingdom, Sweden, Italy and Portugal between 1967 and 2007. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that the only reason for learning a foreign language is in order to travel to or work in a foreign country. Others say that these are not the only reasons why someone should learn a foreign language. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the numbers of visitors to Ashdown Museum during the year before and the year after it was refurbished. The charts show the result of surveys asking visitors how satisfied they were with their visit, during the same two periods. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Many governments think that economic progress is their most important goal. Some people, however, think that other types of progress are equally important for a country. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  12: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The bar chart below shows the percentage of Australian men and women in different age groups who did regular physical activity in 2070. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. ___ ee 2: Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that it is good to share as much information as possible in scientific research, business and the academic world. Others believe that some information is too important or too valuable to be shared freely. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The maps below show the centre of a small town called Islip as it is now, and plans for its development. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Ne fai A aa oC Amey At the present time, the population of some countries includes a relatively large number of young adults, compared with the number of older people. Do the advantages of this situation outweigh the disadvantages? ster SEPARA ROE a SEPP NANA CAE CP A sth tt i eet bet Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows how frequently people in the USA ate in fast food restaurants between 2003 and 2073. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. | Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In a number of countries, some people think it is necessary to spend large sums of money on constructing new railway lines for very fast trains between cities. Others believe the money should be spent on improving existing public transport. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how geothermal energy is used to produce electricity. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that allowing children to make their own choices on everyday matters (such as food, clothes and entertainment) is likely to result | ina society of individuals who only think about their own wishes. Other people | believe that it is important for children to make decisions about matters that affect them. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  13: {
    1: [
      { task: 1, minWords: 150, prompt: "ITING TASK 1 should spend about 20 minutes on this task. The two maps below show road access to a city hospital in 2007 and in 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. City Hospital Ring Road 2007 6 Ww E CITY HOSPITAL s @ Bus stop i i, ae © = Car park: staff Y: ai Pa and public e|5|o o @|I\\-6 City Road City Hospital Ring Road 2010 CITY HOSPITAL no)" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Living in a country where you have to speak a foreign language can cause serious social problems, as well as practical problems. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "WRITING TASK 1 You should spend about 20 minutes on this task. The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that nowadays we have too many choices. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "WRITING TASK 1 You should spend about 20 minutes on this task. The bar chart below shows the top ten countries for the production and consumption of electricity in 2014. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say History is one of the most important school subjects. Other people think that, in today’s world, subjects like Science and Technology are more important than History. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "WRITING TASK 1 You should spend about 20 minutes on this task. The plans below show the layout of a university's sports centre now, and how it will look after redevelopment. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "WRITING TASK 2 You should spend about 40 minutes on this task. Write about the following topic: In spite of the advances made in agriculture, many people around the world still go hungry. Why is this the case? What can be done about this problem? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  14: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the average percentages in typical meals of three types of nutrients, all of which may be unhealthy if eaten too much. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the value of one country’s exports in various categories during 2015 and 2016. The table shows the percentage change in each category of exports in 2016 compared with 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how electricity is generated in a hydroelectric power station. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that music is a good way of bringing people of different cultures and ages together. To what extent do you agree or disagree with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The plans below show a public park when it first opened in 1920 and the same Park today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Nowadays many people choose to be self-employed, rather than to work for a company or organisation. Why might this be the case? What could be the disadvantages of being self-employed? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  15: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the results of a survey about people’s coffee and tea buying and drinking habits in five Australian cities. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In some countries, owning a home rather than renting one is very important for people. Why might this be the case? Do you think this is a positive or negative situation? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In the future, nobody will buy printed newspapers or books because they will be able to read everything they want online without paying. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how instant noodles are manufactured. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that advertising is extremely successful at persuading us to buy things. Other people think that advertising is so common that we no longer pay attention to it. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows what Anthropology graduates from one university did after finishing their undergraduate degree course. The table shows the salaries of the anthropologists in work after five years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In some cultures, children are often told that they can achieve anything if they try hard enough. What are the advantages and disadvantages of giving children this message? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  16: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the changes in ownership of electrical appliances and amount of time spent doing housework in households in one country between 1920 and 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In some countries, more and more people are becoming interested in finding out about the history of the house or building they live in. What are the reasons for this? How can people research this? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows the manufacturing process for making sugar from sugar cane. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In their advertising, businesses nowadays usually emphasise that their products are new in some way. Why is this? Do you think it is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The plans below show the site of an airport now and how it will look after redevelopment next year. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Many manufactured food and drink products contain high levels of sugar, which causes many health problems. Sugary products should be made more expensive to encourage people to consume less sugar. Do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows the process for recycling plastic bottles. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In the future all cars, buses and trucks will be driverless. The only people travelling inside these vehicles will be passengers. Do you think the advantages of driverless vehicles outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  17: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The maps below show an industrial area in the town of Norbiton, and planned future development of the site. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. Norbiton industrial area now Farmland Town I I rn" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: It is important for people to take risks, both in their professional lives and their personal lives. Do you think the advantages of taking risks outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words. -+ I~ p. 12a I 29 Test 1" }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. Police Budget 2017-2018 (in £m) Sources 2017" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some children spend hours every day on their smartphones. Why is this the case? Do you think this is a positive or a negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words. ~i~p.1311 51 Test 2" }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below gives information about how families in one country spent their weekly income in 1968 and in 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. 1968 and 2018: average weekly spending by families • 1968 D 2018 % of weekly income ~" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country if they wish. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words. ~ 1~ p. 1351" }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the number of shops that closed and the number of new shops that opened in one country between 2011 and 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. Number of shop closures and openings 2011-2018 • Closures -" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Nowadays, a growing number of people with health problems are trying alternative medicines and treatments instead of visiting their usual doctor. Do you think this is a positive or a negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words. ~ 1~ p. 1381" }
    ]
  },
  18: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below gives information about the percentage of the population in four Asian countries living in cities from 1970 to 2020, with predictions for 2030 and 2040. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: The most important aim of science should be to improve people’s lives. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the number of households in the US by their annual income in 2007, 2011 and 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some university students want to learn about other subjects in addition to their main subjects. Others believe it is more important to give all their time and attention to studying for a qualification. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows the floor plan of a public library 20 years ago and how it looks now. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In many countries around the world, rural people are moving to cities, so the population in the countryside is decreasing. Do you think this is a positive or a negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the average monthly change in the prices of three metals during 2014. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In many countries, people are now living longer than ever before. Some people say an ageing population creates problems for governments. Other people think there are benefits if society has more elderly people. To what extent do the advantages of having an ageing population outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  19: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below gives information on the numbers of participants for different activities at one social centre in Melbourne, Australia for the period 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that competition at work, at school and in daily life is a good thing. Others believe that we should try to cooperate more, rather than competing against each other. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The plans below show a harbour in 2000 and how it looks today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: The working week should be shorter and workers should have a longer weekend. Do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how a biofuel called ethanol is produced. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: It is important for everyone, including young people, to save money for their future. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information on the location and types of dance classes young people in a town in Australia are currently attending. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In many countries nowadays, consumers can go to a supermarket and buy food produced all over the world. Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  20: {
    1: [
      { task: 1, minWords: 150, prompt: "The first table below shows changes in the total population of New York City from 1800 to 2000. The second and third tables show changes in the population of the five districts of the city (Manhattan, Brooklyn, Bronx, Queens, Staten Island) over the same period. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Access to clean water is a basic human right. Therefore every home should have a water supply that is provided free of charge. Do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The plans below show the site of a farm in 1950 and the same site today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In many countries, primary and secondary schools close for two months or more in the summer holidays. What is the value of long school holidays? What are the arguments in favour of shorter school holidays? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information about a public library in a town called Little Chalfont. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people have decided to reduce the number of times they fly every year or to stop flying altogether. Do you think the environmental benefits of this development outweigh the disadvantages for individuals and businesses?" }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how fabric is manufactured from bamboo. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. G) Plant bamboo plants (Spring) f @ Soften fibres (add water and amine oxide) (J) Spin (to make yam)" },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Many aspects of the way people dress today are influenced by global fashion trends. How has global fashion become such a strong influence on people’s lives? Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  },
  21: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: The best way to provide enough homes in large cities is to build tall apartment blocks. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The plans below show a college cafe before it was redesigned and how it looks now. Writing Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people say that in the digital age, theatres and cinemas are no longer important as people can watch all the entertainment they want online. Others argue that theatres and cinemas are still important both economically and culturally. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how one type of desert, known as a rain-shadow desert, is formed. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Writing All university undergraduate courses should include a period of time spent studying abroad or doing a work placement. Do you think the advantages of this would outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart and table below show the results of a survey of library users at a university. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Writing Some people argue that primary schools focus too much on formal learning. To what extent do you agree with this opinion? How important do you think it is for children to play as well as learn in the primary school classroom? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." }
    ]
  }
};

/** متن صورت تسک‌های رایتینگ یک تست — از نقشهٔ استخراج‌شده */
export function mapWritingPrompts(
  bookNumber: number,
  testNumber: number,
): MapWritingPrompt[] {
  const list = WRITING_PROMPTS[bookNumber]?.[testNumber];
  return list ? list.map((p) => ({ ...p })) : [];
}
