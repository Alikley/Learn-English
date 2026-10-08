// ========================================
// نقشهٔ رایتینگ کتاب‌های کمبریج (v1.0.0.5)
//
// 📌 این فایل دو چیز نگه می‌دارد:
//   ۱) نقشهٔ صفحات — شمارهٔ صفحهٔ فیزیکی «WRITING TASK 1/2»
//      هر تست (۷ کتاب × ۴ تست) — شناسایی سه‌روشی در v1.0.4.3
//   ۲) متن کامل صورت تسک‌های ۱ و ۲ — استخراج‌شده از خود
//      صفحات کتاب (v1.0.0.5):
//        • کتاب ۱: از لایهٔ متنی PDF
//        • کتاب‌های ۲..۷: رونویسی مدل بینایی (VLM) از اسکن
//          ۳۰۰dpi + تأیید متقاطع با OCR مستقل (tesseract)
//          — ۴۸/۴۸ صفحه با تطابق بالا؛ نمونه‌ها با برش
//          بزرگ‌نمایی‌شده نیز بازبینی شدند
//
// 🎯 نتیجه: صورت سوال رایتینگ «متنی و بالای صفحهٔ آزمون»
//    است (نه PDF کامل) — فوری، بدون AI، آفلاین. نمایشگر
//    صفحهٔ کتاب فقط برای دیدن نمودار/جدول تسک ۱ کنار دست است.
// ========================================

export type WritingPagesEntry = {
  /** صفحهٔ «WRITING TASK 1» در فایل PDF کتاب (۱-based) */
  task1Page: number;
  /** صفحهٔ «WRITING TASK 2» در فایل PDF کتاب (۱-based) */
  task2Page: number;
};

/**
 * نقشهٔ تأییدشدهٔ صفحات رایتینگ — ۷ کتاب × ۴ تست
 * (کلید بیرونی: شمارهٔ کتاب ۱..۷؛ کلید درونی: شمارهٔ تست ۱..۴)
 */
const WRITING_PAGES: Record<number, Record<number, WritingPagesEntry>> = {
  1: {
    1: { task1Page: 37, task2Page: 38 },
    2: { task1Page: 57, task2Page: 58 },
    3: { task1Page: 78, task2Page: 79 },
    4: { task1Page: 97, task2Page: 98 },
  },
  2: {
    1: { task1Page: 26, task2Page: 27 },
    2: { task1Page: 48, task2Page: 49 },
    3: { task1Page: 70, task2Page: 71 },
    4: { task1Page: 92, task2Page: 93 },
  },
  3: {
    1: { task1Page: 31, task2Page: 32 },
    2: { task1Page: 55, task2Page: 56 },
    3: { task1Page: 77, task2Page: 78 },
    4: { task1Page: 101, task2Page: 102 },
  },
  4: {
    1: { task1Page: 26, task2Page: 27 },
    2: { task1Page: 51, task2Page: 52 },
    3: { task1Page: 75, task2Page: 76 },
    4: { task1Page: 97, task2Page: 98 },
  },
  5: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 53, task2Page: 54 },
    3: { task1Page: 76, task2Page: 77 },
    4: { task1Page: 99, task2Page: 100 },
  },
  6: {
    1: { task1Page: 30, task2Page: 31 },
    2: { task1Page: 52, task2Page: 53 },
    3: { task1Page: 75, task2Page: 76 },
    4: { task1Page: 98, task2Page: 99 },
  },
  7: {
    1: { task1Page: 22, task2Page: 23 },
    2: { task1Page: 45, task2Page: 46 },
    3: { task1Page: 70, task2Page: 71 },
    4: { task1Page: 93, task2Page: 94 },
  },
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
// متن کامل صورت تسک‌های رایتینگ — ۷ کتاب × ۴ تست
// (v1.0.0.5) استخراج‌شده از صفحات چاپی کتاب:
//   کتاب ۱ → لایهٔ متنی PDF | کتاب‌های ۲..۷ → VLM + تأیید OCR
// این متن «منبع اصلی صورت سوال» است — بالای صفحهٔ
// آزمون نشان داده می‌شود (PDF کتاب فقط برای نمودار تسک ۱).
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
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: There are many different types of music in the world today. Why do we need music? Is the traditional music of a country more important than the international music that is heard everywhere nowadays? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagram below shows how the Australian Bureau of Meteorology collects up-to-the-minute information on the weather in order to produce reliable forecasts. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Should wealthy nations be required to share their wealth among poorer nations by providing such things as food and education? Or is it the responsibility of the governments of poorer nations to look after their citizens themselves? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and with relevant evidence." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount of money per week spent on fast foods in Britain. The graph shows the trends in consumption of fast foods. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: News editors decide what to broadcast on television and what to print in newspapers. What factors do you think influence these decisions? Do we become used to bad news? Would it be better if more good news was reported? You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. Chorleywood is a village near London whose population has increased steadily since the middle of the nineteenth century. The map below shows the development of the village. Write a report for a university lecturer describing the development of the village. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic: The idea of having a single career is becoming an old fashioned one. The new fashion will be to have several careers or ways of earning money and further education will be something that continues throughout life. You should write at least 250 words. Use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
  },
  2: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the consumer durables (telephone, refrigerator, etc.) owned in Britain from 1972 to 1983. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. \"Fatherhood ought to be emphasised as much as motherhood. The idea that women are solely responsible for deciding whether or not to have babies leads on to the idea that they are also responsible for bringing the children up.\" To what extent do you agree or disagree? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount of leisure time enjoyed by men and women of different employment status. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. \"Prevention is better than cure.\" Out of a country's health budget, a large proportion should be diverted from treatment to spending on health education and preventative measures. To what extent do you agree of disagree with this statement? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The first chart below shows the results of a survey which sampled a cross-section of 100,000 people asking if they travelled abroad and why they travelled for the period 1994-98. The second chart shows their destinations over the same period. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should write at least 250 words. Without capital punishment (the death penalty) our lives are less secure and crimes of violence increase. Capital punishment is essential to control violence in society. To what extent do you agree or disagree with this opinion? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the figures for imprisonment in five countries between 1930 and 1980. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. The position of women in society has changed markedly in the last twenty years. Many of the problems young people now experience, such as juvenile delinquency, arise from the fact that many married women now work and are not at home to care for their children. To what extent do you agree or disagree with this opinion? You should write at least 250 words. You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence." },
    ],
  },
  3: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the number of Japanese tourists travelling abroad between 1985 and 1995 and Australia's share of the Japanese tourist market. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Popular events like the football World Cup and other international sporting occasions are essential in easing international tensions and releasing patriotic emotions in a safe way. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the amount spent on six consumer goods in four European countries. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. When a country develops its technology, the traditional skills and ways of life die out. It is pointless to try and keep them alive. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the levels of participation in education and science in developing and industrialised countries in 1980 and 1990. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. In many countries children are engaged in some kind of paid work. Some people regard this as completely wrong, while others consider it as valuable work experience, important for learning and taking responsibility. What are your opinions on this? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the unemployment rates in the US and Japan between March 1993 and March 1999. Write a report for a university lecturer describing the information shown below. You should write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge of the following topic. Improvements in health, education and trade are essential for the development of poorer nations. However, the governments of richer nations should take more responsibility for helping the poorer nations in such areas. To what extent do you agree or disagree with this opinion? You should use your own ideas, knowledge and experience and support your arguments with examples and relevant evidence. You should write at least 250 words." },
    ],
  },
  4: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below shows the proportion of different categories of families living in poverty in Australia in 1999. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Compare the advantages and disadvantages of three of the following as media for communicating information. State which you consider to be the most effective. • comics • books • radio • television • film • theatre Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the demand for electricity in England during typical days in winter and summer. The pie chart shows how electricity is used in an average English home. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Happiness is considered very important in life. Why is it difficult to define? What factors are important in achieving happiness? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows the different levels of post-school qualifications in Australia and the proportion of men and women who held them in 1999. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Creative artists should always be given the freedom to express their own ideas (in words, pictures, music or film) in whichever way they wish. There should be no government restrictions on what they do. To what extent do you agree or disagree with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information about travel to and from the UK, and about the most popular countries for UK residents to visit. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In many countries schools have severe problems with student behaviour. What do you think are the causes of this? What solutions can you suggest? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
  },
  5: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the proportion of the population aged 65 and over between 1940 and 2040 in three different countries. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Universities should accept equal numbers of male and female students in every subject. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below show the main reasons for study among students of different age groups and the amount of support they received from employers. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: In some countries young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The map below is of the town of Garlsdon. A new supermarket (S) is planned for the town. The map shows two possible sites for the supermarket. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that a sense of competition in children should be encouraged. Others believe that children who are taught to co-operate rather than compete become more useful adults. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information about the underground railway systems in six cities. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Research indicates that the characteristics we are born with have much more influence on our personality and development than any experiences we may have in our life. Which do you consider to be the major influence? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
  },
  6: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph and table below give information about water use worldwide and water consumption in two different countries. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Today, the high sales of popular consumer goods reflect the power of advertising and not the real needs of the society in which they are sold. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information about changes in modes of travel in England between 1985 and 2000. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Successful sports professionals can earn a great deal more money than people in other important professions. Some people think this is fully justified while others think it is unfair. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The diagrams below show the life cycle of the silkworm and the stages in the production of silk cloth. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that visitors to other countries should follow local customs and behaviour. Others disagree and think that the host country should welcome cultural differences. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The charts below give information about USA marriage and divorce rates between 1970 and 2000, and the marital status of adult Americans in two of the years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people prefer to spend their lives doing the same things and avoiding change. Others, however, think that change is always a good thing. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
  },
  7: {
    1: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The table below gives information on consumer spending on different items in five different countries in 2002. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: It is generally believed that some people are born with certain talents, for instance for sport or music, and others are not. However, it is sometimes claimed that any child can be taught to become a good sports person or musician. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    2: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The graph below shows the consumption of fish and some different kinds of meat in a European country between 1979 and 2004. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that there should be fixed punishments for each type of crime. Others, however, argue that the circumstances of an individual crime, and the motivation for committing it, should always be taken into account when deciding on the punishment. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    3: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The chart below shows information about changes in average house prices in five different cities between 1990 and 2002 compared with the average house prices in 1989. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: As most people spend a major part of their adult life at work, job satisfaction is an important element of individual wellbeing. What factors contribute to job satisfaction? How realistic is the expectation of job satisfaction for all workers? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
    4: [
      { task: 1, minWords: 150, prompt: "You should spend about 20 minutes on this task. The pie charts below show units of electricity production by fuel source in Australia and France in 1980 and 2000. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words." },
      { task: 2, minWords: 250, prompt: "You should spend about 40 minutes on this task. Write about the following topic: Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. What, in your opinion, should be the main function of a university? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." },
    ],
  },
};

/**
 * متن صورت تسک‌های رایتینگ یک تست از نقشهٔ استخراج‌شده
 * (همهٔ کتاب‌های ۱..۷) — خالی برای کتاب/تستِ خارج از نقشه.
 */
export function mapWritingPrompts(
  bookNumber: number,
  testNumber: number,
): MapWritingPrompt[] {
  const list = WRITING_PROMPTS[bookNumber]?.[testNumber];
  return list ? list.map((p) => ({ ...p })) : [];
}
