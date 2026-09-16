import type { GrammarLesson } from "./types";

// ========================================
// گرامر متوسط — ۱۰ درس واقعی (B1 / B2)
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-intermediate-01",
    titleFa: "زمان حال کامل",
    titleEn: "Present Perfect",
    cefr: "B1",
    intro:
      "حال کامل مهم‌ترین زمان سطح متوسط است؛ پلی میان گذشته و حال. ساختار آن با have/has + قسمت سوم فعل ساخته می‌شود.",
    rule:
      "حال کامل دو کاربرد اصلی دارد: اول تجربه‌های زندگی بدون زمان مشخص (I have visited Turkey — یعنی تا حالا این تجربه را داشته‌ام) و دوم کارهایی که در گذشته شروع شده و تا حالا ادامه دارند یا اثرشان در حال است (I have lived here for ten years). ساختار: have/has + قسمت سوم فعل (past participle). منفی: haven't/hasn't. سوالی: Have you...? قیدهای رایج: ever، never، just، already، yet، so far، for و since. تفاوت با گذشته ساده کلیدی است: اگر زمان مشخص گذشته بگویید (yesterday، in 2020، last week) حتماً گذشته ساده می‌آید، نه حال کامل. فرمول since و for: since نقطه شروع (since 2015) و for طول مدت (for eight years).",
    form: [
      { label: "مثبت", pattern: "have / has + p.p. → She has finished her homework." },
      { label: "منفی", pattern: "haven't / hasn't + p.p. → They haven't decided yet." },
      { label: "سوالی", pattern: "Have / Has + فاعل + p.p.؟ → Have you ever tried sushi?" },
      { label: "برای مدت", pattern: "have + p.p. + for / since → I have worked here since March." },
      { label: "قیدهای کلیدی", pattern: "just / already / yet / ever / never / so far" },
    ],
    examples: [
      { en: "I have just finished my workout.", fa: "همین الان تمرینم را تمام کردم." },
      { en: "She has never been to Europe.", fa: "او هیچ‌وقت به اروپا نرفته است." },
      { en: "We have known each other for twenty years.", fa: "بیست سال است همدیگر را می‌شناسیم." },
      { en: "Have you finished the report yet?", fa: "گزارش را هنوز تمام کرده‌ای؟" },
      { en: "He has already paid for the tickets.", fa: "او قبلاً پول بلیط‌ها را داده است." },
      { en: "They have moved three times since 2018.", fa: "از ۲۰۱۸ سه بار نقل مکان کرده‌اند." },
    ],
    mistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", note: "yesterday زمان مشخص گذشته است → گذشته ساده." },
      { wrong: "She has went home.", right: "She has gone home.", note: "قسمت سوم go کلمه gone است نه went." },
      { wrong: "I live here since five years.", right: "I have lived here for five years.", note: "برای مدت تا امروز: حال کامل + for." },
    ],
    quiz: [
      { question: "«تا حالا سوشی خوردی؟» کدام است؟", options: ["Did you ever eat sushi?", "Have you ever eaten sushi?", "Do you ever eat sushi?", "Are you ever eating sushi?"], correctIndex: 1, explanation: "تجربه زندگی بدون زمان مشخص → حال کامل با ever." },
      { question: "کدام جمله درست است؟", options: ["I have finished it two hours ago.", "I finished it two hours ago.", "I have finish it two hours ago.", "I have been finished it ago."], correctIndex: 1, explanation: "زمان مشخص (two hours ago) گذشته ساده می‌طلبد." },
      { question: "«او هنوز نرسیده» کدام است؟", options: ["He didn't arrive yet.", "He hasn't arrived yet.", "He doesn't arrive yet.", "He isn't arriving yet."], correctIndex: 1, explanation: "yet قید حال کامل منفی است." },
      { question: "جای for/since: «We've been friends ___ university.»", options: ["for", "since", "from", "during"], correctIndex: 1, explanation: "university نقطه شروع است → since." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-02",
    titleFa: "گذشته استمراری و ترکیب با گذشته ساده",
    titleEn: "Past Continuous",
    cefr: "B1",
    intro:
      "برای تعریف کردن «داشت می‌رفتم که...» گذشته استمراری لازم است. ترکیب آن با گذشته ساده در داستان‌گویی پرکاربرد است.",
    rule:
      "گذشته استمراری با was/were + فعل+ing ساخته می‌شود و برای کارهایی که در لحظه‌ای از گذشته در جریان بودند به کار می‌رود: At eight o'clock, I was having dinner. کاربرد طلایی آن در ترکیب با گذشته ساده است: کار بلند با گذشته استمراری و کار کوتاه قطع‌کننده با گذشته ساده: I was walking home when it started to rain — داشتم می‌رفتم خانه که باران شروع شد. با while دو کار همزمان بلند بیان می‌شود: While she was cooking, he was setting the table. نکته مهم: افعال حالتی (know, want, believe) معمولاً استمراری نمی‌شوند. برای پس‌زمینه داستان‌ها هم به کار می‌رود: The sun was shining and the birds were singing.",
    form: [
      { label: "مثبت", pattern: "was / were + ing → I was studying all evening." },
      { label: "منفی", pattern: "wasn't / weren't + ing → They weren't watching." },
      { label: "سوالی", pattern: "Was / Were + فاعل + ing؟ → Were you sleeping at ten?" },
      { label: "قطع شدن کار", pattern: "was/were + ing ... when + گذشته ساده" },
      { label: "همزمانی", pattern: "while + was/were + ing ..., was/were + ing" },
    ],
    examples: [
      { en: "I was having lunch when you called.", fa: "داشتم ناهار می‌خوردم که زنگ زدی." },
      { en: "They were living in Tabriz at the time.", fa: "آن موقع در تبریز زندگی می‌کردند." },
      { en: "While we were waiting, it began to snow.", fa: "وقتی داشتیم منتظر می‌ماندیم، برف شروع شد." },
      { en: "What were you doing at midnight?", fa: "نیمه‌شب چه کار می‌کردی؟" },
      { en: "She wasn't listening when the teacher explained.", fa: "وقتی معلم توضیح می‌داد، او گوش نمی‌داد." },
      { en: "The children were playing while their mother was cooking.", fa: "بچه‌ها بازی می‌کردند در حالی که مادرشان آشپزی می‌کرد." },
    ],
    mistakes: [
      { wrong: "I watched TV when he arrived.", right: "I was watching TV when he arrived.", note: "کار در جریان که قطع شد → استمراری. (جمله اول یعنی: به محض رسیدنش تلویزیون روشن کردم)" },
      { wrong: "While I was knowing him, we worked together.", right: "While I knew him, we worked together.", note: "know فعل حالتی است و ing نمی‌گیرد." },
      { wrong: "She was wrote a letter at nine.", right: "She was writing a letter at nine.", note: "بعد از was فعل ing می‌گیرد نه گذشته." },
    ],
    quiz: [
      { question: "«داشتم می‌رفتم سر کار که تصادف را دیدم» کدام است؟", options: ["I drove to work when I saw the accident.", "I was driving to work when I saw the accident.", "I was driving to work when I was seeing the accident.", "I drive to work when I saw the accident."], correctIndex: 1, explanation: "کار بلند: استمراری؛ کار قطع‌کننده: ساده." },
      { question: "ساختار سوالی «دیشب ده ساعت چه می‌کردی؟» کدام است؟", options: ["What did you do at ten last night?", "What were you doing at ten last night?", "What you were doing at ten?", "What was you doing at ten?"], correctIndex: 1, explanation: "در لحظه‌ای مشخص گذشته در جریان بود → was/were + ing." },
      { question: "کدام جمله درست است؟", options: ["While she cooked, I was cleaning.", "While she was cooking, I cleaned up.", "While she was cooking, I was cleaning.", "هر دو ۲ و ۳ بسته به معنا"], correctIndex: 3, explanation: "اگر همزمان بودند هر دو استمراری؛ اگر یکی قطع‌کننده بود ساده می‌شود." },
      { question: "کدام فعل به‌طور طبیعی استمراری نمی‌شود؟", options: ["run", "believe", "cook", "wait"], correctIndex: 1, explanation: "believe فعل حالتی است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-03",
    titleFa: "used to و would",
    titleEn: "used to & would",
    cefr: "B1",
    intro:
      "برای حرف زدن درباره عادت‌های گذشته‌ای که حالا نیستند، used to و would به کار می‌روند. تفاوت ظریف اما مهمی دارند.",
    rule:
      "used to + فعل ساده برای عادت‌ها یا وضعیت‌های گذشته که دیگر صدق نمی‌کنند: I used to play football every day (دیگر بازی نمی‌کنم). این ساختار هم برای کارها و هم برای وضعیت‌ها (be، have، live) به کار می‌رود: I used to live in Rasht. منفی و سوالی آن با did انجام می‌شود: I didn't use to like coffee / Did you use to have long hair? دقت کنید در شکل سؤال و منفی، use بدون d نوشته می‌شود. would نیز عادت‌های گذشته تکرارشونده را بیان می‌کند اما فقط برای کارها، نه وضعیت‌ها: Every summer we would visit our village. نمی‌توان گفت I would live in Rasht. be used to something معنای کاملاً متفاوتی دارد: «عادت داشتن به چیزی» و بعدش اسم یا ing می‌آید: I'm used to waking up early.",
    form: [
      { label: "عادت گذشته", pattern: "used to + فعل → He used to smoke." },
      { label: "منفی", pattern: "didn't use to + فعل → She didn't use to wear glasses." },
      { label: "سوالی", pattern: "Did + فاعل + use to...؟ → Did you use to live here?" },
      { label: "would (فقط کار)", pattern: "We would swim in the river every summer." },
      { label: "عادت به چیزی (متفاوت!)", pattern: "be used to + ing/اسم → I'm used to spicy food." },
    ],
    examples: [
      { en: "I used to be afraid of the dark.", fa: "قبلاً از تاریکی می‌ترسیدم." },
      { en: "She didn't use to drink tea, but now she loves it.", fa: "قبلاً چای نمی‌نوشید، اما حالا عاشقش است." },
      { en: "My grandfather would tell us stories every night.", fa: "پدربزرگم هر شب برایمان داستان می‌گفت." },
      { en: "There used to be a cinema on this street.", fa: "قبلاً در این خیابان سینمایی بود." },
      { en: "Did you use to have long hair as a student?", fa: "وقت دانشجوپی موهای بلندی داشتی؟" },
      { en: "After a month in the new job, I'm used to the early mornings.", fa: "بعد از یک ماه در کار جدید، به صبح‌های زود عادت کرده‌ام." },
    ],
    mistakes: [
      { wrong: "I am used to play football every day when I was young.", right: "I used to play football every day when I was young.", note: "عادت گذشته با used to ساده بیان می‌شود نه am used to." },
      { wrong: "I would live in a small town.", right: "I used to live in a small town.", note: "would با فعل‌های وضعیتی مثل live و be به کار نمی‌رود." },
      { wrong: "Did you used to smoke?", right: "Did you use to smoke?", note: "بعد از did فعل ساده است: use." },
    ],
    quiz: [
      { question: "«قبلاً گیتار می‌نواخت اما الان نمی‌نوازد» کدام است؟", options: ["She plays guitar but she doesn't now.", "She used to play the guitar, but she doesn't anymore.", "She is used to playing the guitar.", "She would plays the guitar."], correctIndex: 1, explanation: "عادت گذشته که تمام شده: used to." },
      { question: "کدام جمله از would به‌درستی استفاده شده؟", options: ["I would have a bicycle when I was ten.", "Every winter we would go skiing.", "I would be a shy child.", "There would be a park here."], correctIndex: 1, explanation: "would فقط برای کارهای تکراری گذشته است، نه وضعیت‌ها." },
      { question: "«به آب سرد عادت دارم» کدام است؟", options: ["I used to cold water.", "I am used to cold water.", "I use to cold water.", "I would cold water."], correctIndex: 1, explanation: "عادت داشتن به چیزی: be used to + اسم." },
      { question: "شکل منفی درست «قبلاً اینجا پارک بود» کدام است؟", options: ["There didn't used to be a park here.", "There didn't use to be a park here.", "There wasn't used to a park.", "There use not to be a park."], correctIndex: 1, explanation: "didn't + use (بدون d) + to be." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-04",
    titleFa: "جملات شرطی نوع صفر و یک",
    titleEn: "Zero & First Conditional",
    cefr: "B1",
    intro:
      "جمله شرطی از دو بخش if و نتیجه تشکیل می‌شود. نوع صفر برای حقایق همیشگی و نوع یک برای احتمالات واقعی آینده است.",
    rule:
      "شرطی نوع صفر (Zero) ساختار if + حال ساده، حال ساده دارد و برای قوانین همیشگی و حقایق علمی به کار می‌رود: If you heat water to 100 degrees, it boils — اگر آب را به ۱۰۰ درجه برسانید، می‌جوشد. این نوع در واقع «هر زمان که» معنا می‌دهد. شرطی نوع یک (First) برای موقعیت‌های واقعی و ممکن در آینده است: if + حال ساده، will + فعل: If it rains tomorrow, we'll stay home. نکته حیاتی: بعد از if هرگز will نمی‌آید؛ بخش will فقط در نتیجه می‌نشیند. به جای will می‌توان از can، may، might یا دستور و پیشنهاد هم استفاده کرد: If you finish early, call me. ترتیب دو بخش قابل جابجایی است اما وقتی if اول باشد کاما لازم است. برای معنای منفی می‌توان از unless (= if not) هم استفاده کرد: Unless you hurry, you'll miss the bus.",
    form: [
      { label: "نوع صفر", pattern: "If + حال ساده, حال ساده → If you press this, the light turns on." },
      { label: "نوع یک", pattern: "If + حال ساده, will + فعل → If you study, you will pass." },
      { label: "با امکان", pattern: "If it rains, we might cancel the trip." },
      { label: "با unless", pattern: "Unless you hurry, you'll be late. (= If you don't hurry)" },
    ],
    examples: [
      { en: "If you mix blue and yellow, you get green.", fa: "اگر آبی و زرد را قاطی کنید، سبز می‌شود." },
      { en: "If I see Sara tomorrow, I'll tell her the news.", fa: "اگر فردا سارا را ببینم، خبر را به او می‌گویم." },
      { en: "We'll miss the flight if we don't leave now.", fa: "اگر همین حالا نرویم، پرواز را از دست می‌دهیم." },
      { en: "If you don't water plants, they die.", fa: "اگر به گیاهان آب ندهی، می‌خشک‌اند." },
      { en: "Unless the weather improves, the match will be cancelled.", fa: "مگر اینکه هوا بهتر شود، بازی لغو می‌شود." },
      { en: "If you're free tonight, come over for dinner.", fa: "اگر امشب آزاد هستی، به شام بیا." },
    ],
    mistakes: [
      { wrong: "If you will study, you will pass.", right: "If you study, you will pass.", note: "بعد از if در شرطی نوع یک، will نمی‌آید." },
      { wrong: "If it will rain, we stay home.", right: "If it rains, we'll stay home.", note: "will فقط در بخش نتیجه می‌نشیند." },
      { wrong: "Unless you don't hurry, we'll be late.", right: "Unless you hurry, we'll be late.", note: "unless خودش منفی است؛ don تکراری و معنا را خراب می‌کند." },
    ],
    quiz: [
      { question: "«اگر فردا باران بیاید، من نمی‌روم» کدام است؟", options: ["If it will rain tomorrow, I don't go.", "If it rains tomorrow, I won't go.", "If it rain tomorrow, I won't go.", "If it is raining tomorrow, I not go."], correctIndex: 1, explanation: "if + حال ساده، will منفی در نتیجه." },
      { question: "شرطی نوع صفر برای چیست؟", options: ["احتمالات آینده", "قوانین و حقایق همیشگی", "خیال و تمنا", "گذشته‌های اتفاق‌نیفتاده"], correctIndex: 1, explanation: "نوع صفر = قانون همیشگی." },
      { question: "کدام جمله درست است؟", options: ["Unless you call me, I won't know what happened.", "Unless you don't call me, I won't know.", "Unless you will call me, I don't know.", "Unless calling me, I won't know."], correctIndex: 0, explanation: "unless = if not؛ خودش منفی است." },
      { question: "«اگر زود تمام کنی، می‌تونی استراحت کنی» کدام است؟", options: ["If you will finish early, you can rest.", "If you finish early, you can rest.", "If you finished early, you could rest.", "If you finish early, you rested."], correctIndex: 1, explanation: "if + حال ساده + can در نتیجه." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-05",
    titleFa: "افعال وجهی: should / must / have to",
    titleEn: "Modals: should, must, have to",
    cefr: "B1",
    intro:
      "افعال وجهی برای نصیحت، اجبار و احتمال به کار می‌روند. تفاوت should و must و have to ظرافت مهمی در مکالمه دارد.",
    rule:
      "افعال وجهی بعد از فاعل و قبل از فعل ساده (بدون to) می‌نشینند: You should rest. منفی و سوالی آن‌ها بدون do انجام می‌شود: You shouldn't worry / Should I call her? should برای توصیه و نظر شخصی است: You should see a dentist — بهتر است بروی. must دو معنا دارد: اجبار قوی شخصی (I must finish this today — خودم موظفم) و استنتاج مطمئن (She must be tired — حتماً خسته است). have to برای اجبار از بیرون و قوانین است: You have to wear a helmet — قانون است. mustn't و don't have to کاملاً متفاوت‌اند: mustn't یعنی ممنوع (نباید) اما don't have to یعنی لازم نیست (اختیاری). در گذشته should have + p.p. برای انتقاد از خود یا دیگران است: You should have called me — باید زنگ می‌زدی (ولی نزدی).",
    form: [
      { label: "توصیه", pattern: "should / shouldn't + فعل → You should sleep more." },
      { label: "اجبار قوی", pattern: "must + فعل → I must send this today." },
      { label: "قانون بیرونی", pattern: "have / has to + فعل → She has to work Saturdays." },
      { label: "ممنوعیت", pattern: "mustn't + فعل → You mustn't smoke here." },
      { label: "لازم نیست", pattern: "don't / doesn't have to → You don't have to come." },
      { label: "انتقاد گذشته", pattern: "should have + p.p. → I should have studied harder." },
    ],
    examples: [
      { en: "You look pale; you should see a doctor.", fa: "رنگت پریده؛ بهتر است دکتر ببینی." },
      { en: "Passengers must fasten their seatbelts.", fa: "مسافران باید کمربند ببندند." },
      { en: "I have to work late on Thursdays.", fa: "پنجشنبه‌ها باید تا دیروقت کار کنم." },
      { en: "You mustn't tell anyone about the surprise.", fa: "نباید درباره سورپرایز به هیچ‌کس چیزی بگویی." },
      { en: "It's Friday; you don't have to wake up early.", fa: "جمعه است؛ لازم نیست زود بیدار شوی." },
      { en: "We should have booked the tickets earlier.", fa: "باید زودتر بلیط می‌گرفتیم." },
    ],
    mistakes: [
      { wrong: "You should to rest.", right: "You should rest.", note: "بعد از افعال وجهی هیچ to نمی‌آید." },
      { wrong: "He musts finish it today.", right: "He must finish it today.", note: "must هیچ s شخص سوم نمی‌گیرد." },
      { wrong: "You don't must smoke here.", right: "You mustn't smoke here.", note: "منفی must با mustn't ساخته می‌شود." },
    ],
    quiz: [
      { question: "«بهتره بیشتر بخوابی» کدام است؟", options: ["You must sleep more.", "You should sleep more.", "You have to sleep more.", "You should to sleep more."], correctIndex: 1, explanation: "توصیه → should." },
      { question: "تفاوت mustn't و don't have to چیست؟", options: ["هیچ تفاوتی ندارند", "mustn't=ممنوع، don't have to=لازم نیست", "mustn't=لازم نیست، don't have to=ممنوع", "هر دو یعنی اجازه"], correctIndex: 1, explanation: "mustn't ممنوعیت است؛ don't have to اختیاری بودن." },
      { question: "«باید زنگ می‌زدی ولی نزدی» کدام است؟", options: ["You must call me yesterday.", "You should have called me.", "You should call me.", "You had to call me."], correctIndex: 1, explanation: "انتقاد از گذشته: should have + p.p." },
      { question: "کدام جمله درست است؟", options: ["Does she musts work today?", "Does she must work today?", "Does she have to work today?", "Has she to work today?"], correctIndex: 2, explanation: "سوالی کردن have to با does انجام می‌شود." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-06",
    titleFa: "شرطی نوع دو",
    titleEn: "Second Conditional",
    cefr: "B2",
    intro:
      "برای خیال‌پردازی، موقعیت‌های غیرواقعی و مؤدبانه‌ترین شکل درخواست، شرطی نوع دو کلید کار است.",
    rule:
      "شرطی نوع دو ساختار if + گذشته ساده، would + فعل ساده دارد و برای موقعیت‌های غیرممکن یا بعید در حال یا آینده به کار می‌رود: If I won the lottery, I would travel the world — اگر بخت یاری می‌کرد (که نمی‌کند) دنیا را سفر می‌کردم. تفاوتش با نوع یک در واقع‌بودن است: نوع یک واقعی و ممکن است، نوع دو خیالی و بعید. برای فعل be در بخش if از were برای همه ضمایر استفاده می‌شود: If I were you, I would apologise — جای تو بودم عذرخواهی می‌کردم؛ این محترمانه‌ترین راه نصیحت است. می‌توان به جای would از might یا could هم استفاده کرد: If we left now, we could catch the train. در مکالمه would به 'd کوتاه می‌شود: I'd help you.",
    form: [
      { label: "ساختار اصلی", pattern: "If + گذشته ساده, would + فعل → If I had time, I would help." },
      { label: "با were", pattern: "If I were you, I would take the job." },
      { label: "با might/could", pattern: "If she tried harder, she might succeed." },
      { label: "منفی", pattern: "If I didn't work, I wouldn't have money." },
    ],
    examples: [
      { en: "If I were taller, I would play basketball.", fa: "اگر بلندقدتر بودم، بسکتبال بازی می‌کردم." },
      { en: "If she knew the answer, she would tell us.", fa: "اگر جواب را می‌دانست، به ما می‌گفت." },
      { en: "What would you do if you lost your job?", fa: "اگر کارت را از دست بدهی چه می‌کنی؟" },
      { en: "If we had a car, we could visit my parents more often.", fa: "اگر ماشین داشتیم، می‌توانستیم بیشتر به دیدن پدر و مادرم برویم." },
      { en: "I wouldn't do that if I were you.", fa: "اگر جای تو بودم آن کار را نمی‌کردم." },
      { en: "If he didn't talk so much, we would finish sooner.", fa: "اگر این‌قدر حرف نمی‌زد، زودتر تمام می‌کردیم." },
    ],
    mistakes: [
      { wrong: "If I would have money, I would buy it.", right: "If I had money, I would buy it.", note: "would هرگز بعد از if در نوع دو نمی‌آید." },
      { wrong: "If I was you, I will apologise.", right: "If I were you, I would apologise.", note: "در این ساختار were و would به کار می‌رود." },
      { wrong: "If she would know, she would help.", right: "If she knew, she would help.", note: "بخش if با گذشته ساده ساخته می‌شود." },
    ],
    quiz: [
      { question: "«اگر جای من بودی چه می‌کردی؟» کدام است؟", options: ["What will you do if you are me?", "What would you do if you were me?", "What would you do if you would be me?", "What do you do if you were me?"], correctIndex: 1, explanation: "شرطی غیرواقعی: would + if + were." },
      { question: "کدام شرطی واقعی‌تر است؟", options: ["If it rains, we'll stay home.", "If it rained, we would stay home.", "هر دو یک اندازه", "هیچ‌کدام"], correctIndex: 0, explanation: "نوع یک واقعی و ممکن است؛ نوع دو خیالی و بعید." },
      { question: "«اگر زودتر برویم می‌توانیم قطار را بگیریم (ولی بعید است)» کدام است؟", options: ["If we leave early, we will catch the train.", "If we left early, we could catch the train.", "If we had left early, we could catch the train.", "If we leave early, we catch the train."], correctIndex: 1, explanation: "بعید + امکان: نوع دو با could." },
      { question: "کدام جمله درست است؟", options: ["If I had a garden, I will grow roses.", "If I have a garden, I would grow roses.", "If I had a garden, I would grow roses.", "If I would have a garden, I grew roses."], correctIndex: 2, explanation: "if + گذشته ساده + would + فعل ساده." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-07",
    titleFa: "جملات مجهول",
    titleEn: "Passive Voice",
    cefr: "B2",
    intro:
      "وقتی فاعل مهم نیست یا نمی‌دانیم چه کسی کار را انجام داده، جمله مجهول به کار می‌رود. ساختار آن be + قسمت سوم فعل است.",
    rule:
      "در جمله معلوم تمرکز روی انجام‌دهنده است (My brother fixed the car) اما در مجهول تمرکز روی خود کار (The car was fixed). ساختار: مناسب‌ترین شکل be (با زمان جمله) + قسمت سوم فعل. زمان حال ساده: is/are + p.p.؛ گذشته ساده: was/were + p.p.؛ حال کامل: has/have been + p.p.؛ آینده: will be + p.p.؛ با وجهی: can be + p.p. اگر بخواهیم انجام‌دهنده را هم بگوییم از by استفاده می‌شود: The novel was written by Simin Daneshvar. مجهول در متون علمی، خبری و رسمی فراوان است چون بی‌طرف است و روی فرایند تمرکز می‌کند. برای جمله‌های دو مفعولی (give somebody something) یکی از مفعول‌ها فاعل مجهول می‌شود: I was given a book / A book was given to me.",
    form: [
      { label: "حال ساده مجهول", pattern: "am/is/are + p.p. → English is spoken here." },
      { label: "گذشته ساده مجهول", pattern: "was/were + p.p. → The house was built in 1920." },
      { label: "حال کامل مجهول", pattern: "has/have been + p.p. → The room has been cleaned." },
      { label: "آینده مجهول", pattern: "will be + p.p. → The winners will be announced." },
      { label: "با انجام‌دهنده", pattern: "... by + عامل → Hamlet was written by Shakespeare." },
    ],
    examples: [
      { en: "This mosque was built in the seventeenth century.", fa: "این مسجد در قرن هفدهم ساخته شده است." },
      { en: "The results will be published next week.", fa: "نتایج هفته آینده منتشر می‌شود." },
      { en: "My phone has been repaired at last.", fa: "گوشیم بالاخره تعمیر شد." },
      { en: "The window was broken by the boys playing football.", fa: "پنجره را بچه‌هایی که فوتبال بازی می‌کردند شکستند." },
      { en: "Rice is grown in the north of Iran.", fa: "برنج در شمال ایران کشت می‌شود." },
      { en: "The letters are being typed right now.", fa: "نامه‌ها همین حالا تایپ می‌شوند." },
    ],
    mistakes: [
      { wrong: "The cake was maked by my mother.", right: "The cake was made by my mother.", note: "قسمت سوم make کلمه made است." },
      { wrong: "This book wrote fifty years ago.", right: "This book was written fifty years ago.", note: "مجهول نیاز به be + p.p. دارد: was written." },
      { wrong: "The problem has been solve.", right: "The problem has been solved.", note: "بعد از been حتماً قسمت سوم فعل لازم است." },
    ],
    quiz: [
      { question: "شکل مجهول «Shakespeare wrote Hamlet» چیست؟", options: ["Hamlet wrote by Shakespeare.", "Hamlet was written by Shakespeare.", "Hamlet is written by Shakespeare.", "Hamlet has wrote by Shakespeare."], correctIndex: 1, explanation: "گذشته ساده مجهول: was + written." },
      { question: "«نتایج هفته آینده اعلام می‌شود» کدام است؟", options: ["The results will announce next week.", "The results will be announced next week.", "The results are announcing next week.", "The results announced next week."], correctIndex: 1, explanation: "آینده مجهول: will be + p.p." },
      { question: "مجهول «They are building a new hospital» چیست؟", options: ["A new hospital is built.", "A new hospital is being built.", "A new hospital has been built.", "A new hospital was built."], correctIndex: 1, explanation: "حال استمراری مجهول: is being + p.p." },
      { question: "کدام جمله مجهول درست دارد؟", options: ["This song sang by everyone.", "This song is sang by everyone.", "This song is sung by everyone.", "This song is singing by everyone."], correctIndex: 2, explanation: "قسمت سوم sing کلمه sung است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-08",
    titleFa: "نقل قول غیرمستقیم",
    titleEn: "Reported Speech",
    cefr: "B2",
    intro:
      "وقتی می‌خواهید حرف کسی را بعداً برای دیگری تعریف کنید، زمان‌ها یک عقب می‌شوند و ضمایر تغییر می‌کنند؛ به این می‌گویند نقل قول غیرمستقیم.",
    rule:
      "در نقل قول مستقیم حرف شخص دقیقاً داخل گیومه می‌آید: She said, «I am tired.» در نقل غیرمستقیم گیومه حذف و زمان یک درجه عقب می‌رود: She said (that) she was tired. قاعده توالی زمان‌ها: حال ساده → گذشته ساده؛ حال استمراری → گذشته استمراری؛ حال کامل → گذشته کامل؛ گذشته ساده → گذشته کامل؛ will → would؛ can → could؛ am/is/are going to → was/were going to. ضمایر و قیدهای مکان و زمان هم مطابق معنا تغییر می‌کنند: I → he/she؛ my → his/her؛ today → that day؛ tomorrow → the next day؛ here → there؛ this → that. اما اگر حقیقت همیشگی باشد زمان عقب نمی‌رود: He said the earth is round. برای سؤال‌ها ساختار جمله خبری می‌شود و asked به کار می‌رود: She asked where I lived.",
    form: [
      { label: "مستقیم → غیرمستقیم", pattern: "\"I am tired.\" → She said she was tired." },
      { label: "توالی زمان‌ها", pattern: "am/is → was / have → had / will → would / can → could" },
      { label: "قیدها", pattern: "today→that day / tomorrow→the next day / here→there" },
      { label: "سؤال بله/خیر", pattern: "She asked if/whether I was ready." },
      { label: "سؤال wh", pattern: "He asked where I had put the keys." },
    ],
    examples: [
      { en: "He said he would call me the next day.", fa: "او گفت فردا به من زنگ می‌زند." },
      { en: "She told me she had finished the course.", fa: "به من گفت دوره را تمام کرده است." },
      { en: "They asked if we were coming to the party.", fa: "پرسیدند آیا به مهمانی می‌آییم." },
      { en: "The teacher told the students to open their books.", fa: "معلم به بچه‌ها گفت کتاب‌هایشان را باز کنند." },
      { en: "He said he was living with his aunt then.", fa: "گفت آن موقع نزد خاله‌اش زندگی می‌کند." },
      { en: "She asked me where I had bought that scarf.", fa: "پرسید آن شال را از کجا خریده‌ام." },
    ],
    mistakes: [
      { wrong: "He said me that he was busy.", right: "He told me that he was busy.", note: "say به مفعول مستقیم نمی‌گیرد؛ told me یا said to me." },
      { wrong: "She asked where do I live.", right: "She asked where I lived.", note: "در سؤال غیرمستقیم ترتیب جمله خبری است و do حذف می‌شود." },
      { wrong: "He said that he will come tomorrow.", right: "He said that he would come the next day.", note: "will به would و tomorrow به the next day تغییر می‌کند." },
    ],
    quiz: [
      { question: "نقل غیرمستقیم «I'll help you tomorrow» چه می‌شود؟", options: ["He said he will help me tomorrow.", "He said he would help me the next day.", "He said he helped me the next day.", "He said he would help me tomorrow."], correctIndex: 1, explanation: "will→would و tomorrow→the next day." },
      { question: "نقل «Where do you work?» چه می‌شود؟", options: ["She asked where do I work.", "She asked where I worked.", "She asked where did I work.", "She asked where I work?"], correctIndex: 1, explanation: "ترتیب خبری + زمان عقب‌رونده." },
      { question: "کدام تغییر جزء توالی زمان‌ها نیست؟", options: ["have → had", "can → could", "am → was", "go → went"], correctIndex: 3, explanation: "go→went تغییر عادی فعل است نه قاعده توالی." },
      { question: "«معلم به من گفت آن را تمام کنم» کدام است؟", options: ["The teacher said me finish it.", "The teacher told me to finish it.", "The teacher told me finish it.", "The teacher said to finish it me."], correctIndex: 1, explanation: "دستور نقل‌شده: told + مفعول + to + فعل." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-09",
    titleFa: "جملات موصولی",
    titleEn: "Relative Clauses",
    cefr: "B2",
    intro:
      "جملات موصولی به شما اجازه می‌دهند دو جمله را به یک جمله روان و حرفه‌ای تبدیل کنید. who، which، that، where و when ابزارهای شما هستند.",
    rule:
      "جمله موصولی مثل یک صفت بعد از اسم می‌نشیند و آن را توصیف می‌کند. برای انسان‌ها who، برای اشیا و حیوانات which یا that، برای مکان where و برای زمان when: The man who lives next door is a pilot. اگر ضمیر موصولی در جمله نقش فاعلی داشته باشد حذف نمی‌شود اما اگر مفعولی باشد قابل حذف است (defining): The film (which) we watched was long. وقتی توصیف اطلاعات اضافی و قابل حذف است (non-defining) باید بین دو کاما بیاید و that هرگز استفاده نمی‌شود: My mother, who is seventy, still cycles. در این نوع حذف ضمیر هم ممنوع است. whose مالکیت را نشان می‌دهد: The boy whose father is a doctor. برای زمان‌ها و مکان‌ها می‌توان why و whereby هم داشت اما همین پنج اصلی کافی است. پیش از نوشتن، تعیین کنید توصیف «لازم برای معنا» است یا «اطلاعات اضافه»؛ این تعیین‌کننده کاما و حذف است.",
    form: [
      { label: "برای انسان (فاعل)", pattern: "The woman who called you is my aunt." },
      { label: "برای اشیا", pattern: "The book which/that changed my life." },
      { label: "حذف‌پذیر (مفعول)", pattern: "The song (that) I told you about is old." },
      { label: "اطلاعات اضافه", pattern: "Tehran, which is the capital, is huge." },
      { label: "مالکیت", pattern: "The girl whose bag was stolen cried." },
      { label: "مکان/زمان", pattern: "The café where we met / the day when you left" },
    ],
    examples: [
      { en: "The doctor who treated me was very kind.", fa: "دکتوری که مرا درمان کرد خیلی مهربان بود." },
      { en: "This is the app that I told you about.", fa: "این همان اپلیکیشنی است که درباره‌اش گفتم." },
      { en: "My brother, who lives in Canada, is visiting us.", fa: "برادرم که در کانادا زندگی می‌کند، به دیدارمان آمده است." },
      { en: "That's the hotel where we stayed last summer.", fa: "آن همان هتلی است که تابستان گذشته اقامت داشتیم." },
      { en: "I'll never forget the day when we first met.", fa: "هرگز روز اولین دیدارمان را فراموش نمی‌کنم." },
      { en: "The student whose phone rang had to leave.", fa: "دانش‌آموزی که گوشیش زنگ خورد باید می‌رفت." },
    ],
    mistakes: [
      { wrong: "The man which lives here is old.", right: "The man who lives here is old.", note: "برای انسان‌ها who به کار می‌رود نه which." },
      { wrong: "My car, that is red, is old.", right: "My car, which is red, is old.", note: "بعد از کاما (اطلاعات اضافه) هرگز that نمی‌آید." },
      { wrong: "The restaurant where we ate it was great.", right: "The restaurant where we ate was great.", note: "where خودش نقش مکان را دارد؛ مفعول اضافه لازم نیست." },
    ],
    quiz: [
      { question: "«زنی که او را دیدی معلم من است» کدام است؟", options: ["The woman who you saw her is my teacher.", "The woman whom you saw is my teacher.", "The woman which you saw is my teacher.", "The woman whose you saw is my teacher."], correctIndex: 1, explanation: "برای انسان مفعولی: whom/who/that؛ بدون ضمیر تکراری." },
      { question: "کدام جمله کامای درست دارد؟", options: ["My father who is a chef makes great pizza.", "My father, who is a chef, makes great pizza.", "My father, that is a chef, makes great pizza.", "My father who, is a chef makes pizza."], correctIndex: 1, explanation: "اطلاعات اضافه بین دو کاما و با who." },
      { question: "«این همان خانه‌ای است که بزرگ شدم» کدام است؟", options: ["This is the house which I grew up.", "This is the house where I grew up.", "This is the house that I grew up.", "This is the house when I grew up."], correctIndex: 1, explanation: "مکان رشد → where." },
      { question: "کدام ضمیر در جای خود حذف‌پذیر است؟", options: ["The man who called you", "The film which won the prize", "The song that we heard", "The girl who won the race"], correctIndex: 2, explanation: "وقتی ضمیر نقش مفعولی دارد (we heard the song) حذف می‌شود." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-10",
    titleFa: "gerund و infinitive",
    titleEn: "Gerund vs Infinitive",
    cefr: "B2",
    intro:
      "بعد از بعضی فعل‌ها ing می‌آید، بعد از بعضی to، و بعد از گروهی هر دو با تغییر ظریف معنا. این درس نقشه کامل را می‌دهد.",
    rule:
      "gerund (فعل+ing در نقش اسم) بعد از این فعل‌ها می‌آید: enjoy، avoid، mind، suggest، finish، keep، practise، consider: I enjoy reading. مصدر با to بعد از این‌ها: decide، hope، want، plan، promise، agree، learn، refuse: I decided to leave. بعضی فعل‌ها هر دو می‌گیرند بدون تغییر معنا: begin، start، continue، like، love، hate. اما سه فعل معنایشان عوض می‌شود: remember to do (یادت باشد انجام بدهی — وظیفه جلوتر) در برابر remember doing (به یاد داری که انجامش داده‌ای — خاطره گذشته)؛ stop to do (برای کاری توقف کنی) در برابر stop doing (یک کار را رها کنی)؛ try to do (تلاش سخت برای کار سخت) در برابر try doing (چیز جدیدی را آزمودن). بعد از حروف اضافه هم همیشه ing می‌آید: interested in learning، good at cooking. ساختار‌های برای+ing هم برای کاربرد اسم ابزار به کار می‌روند: This knife is for cutting bread.",
    form: [
      { label: "فعل + gerund", pattern: "enjoy / avoid / finish / suggest + ing → She avoided answering." },
      { label: "فعل + to مصدر", pattern: "decide / hope / want / promise + to → We decided to wait." },
      { label: "هر دو، معنای متفاوت", pattern: "remember to lock ≠ remember locking / stop to smoke ≠ stop smoking" },
      { label: "بعد از حرف اضافه", pattern: "after / in / at / for + ing → before going home" },
    ],
    examples: [
      { en: "I enjoy walking in the rain.", fa: "از راه رفتن زیر باران لذت می‌برم." },
      { en: "She decided to change her job.", fa: "تصمیم گرفت شغلش را عوض کند." },
      { en: "Remember to buy milk on your way home.", fa: "یادت باشد موقع برگشت شیر بخری." },
      { en: "I remember buying milk yesterday.", fa: "یادم است دیروز شیر خریدم." },
      { en: "He stopped drinking coffee last year.", fa: "سال پیش قهوه را کنار گذاشت." },
      { en: "They're thinking of moving to Isfahan.", fa: "دارند فکر می‌کنند به اصفهان نقل مکان کنند." },
    ],
    mistakes: [
      { wrong: "I look forward to see you.", right: "I look forward to seeing you.", note: "to اینجا حرف اضافه است؛ بعدش ing می‌آید." },
      { wrong: "She suggested to go to the cinema.", right: "She suggested going to the cinema.", note: "suggest همیشه ing می‌گیرد." },
      { wrong: "He avoid to pay taxes.", right: "He avoids paying taxes.", note: "avoid + ing و s شخص سوم هم یادتان باشد." },
    ],
    quiz: [
      { question: "جای خالی: «I'm interested in ___ more about history.»", options: ["learn", "to learn", "learning", "learned"], correctIndex: 2, explanation: "بعد از حرف اضافه in، فعل ing می‌گیرد." },
      { question: "کدام جمله «یادت باشد در را قفل کنی» معنا می‌دهد؟", options: ["Remember locking the door.", "Remember to lock the door.", "Stop locking the door.", "Try locking the door."], correctIndex: 1, explanation: "remember to do = وظیفه‌ای که باید انجام شود." },
      { question: "«او کارش را برای استراحت کرد» (توقف برای استراحت) کدام است؟", options: ["He stopped resting.", "He stopped to rest.", "He avoided resting.", "He finished to rest."], correctIndex: 1, explanation: "stop to do = برای کاری متوقف شدن." },
      { question: "کدام فعل هر دو ساختار را بدون تغییر معنا می‌پذیرد؟", options: ["enjoy", "decide", "begin", "avoid"], correctIndex: 2, explanation: "begin هم ing و هم to می‌گیرد." },
    ],
  },
];
