import type { GrammarLesson } from "./types";

// ========================================
// گرامر پیشرفته — ۱۰ درس واقعی (C1 / C2)
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-advanced-01",
    titleFa: "شرطی نوع سه و ترکیبی",
    titleEn: "Third & Mixed Conditionals",
    cefr: "C1",
    intro:
      "شرطی نوع سه برای حسرت گذشته و جملات «اگر آن وقت...» است؛ ساختاری که در داستان‌گویی و بیان پشیمانی بی‌رقیب است.",
    rule:
      "شرطی نوع سه ساختار if + گذشته کامل، would have + قسمت سوم فعل دارد و برای گذشته‌ای که اتفاق نیفتاده و دیگر قابل تغییر نیست به کار می‌رود: If I had studied medicine, I would have become a doctor — اگر پزشکی خوانده بودم، دکتر شده بودم (واقعیت: نخواندم و نشدم). هر دو بخش جمله غیرممکن و تمام‌شده‌اند. بخش if می‌تواند با had جابجا شود (inversion رسمی): Had I known, I would have called. شرطی ترکیبی (mixed) زمان دو بخش را متفاوت می‌کند: شرط گذشته + نتیجه حال: If I had taken that job, I would be rich now — آن شغل را گرفته بودم، الان پولدار بودم؛ یا برعکس شرط دائمی + نتیجه گذشته: If she weren't so shy, she would have spoken up. جای would می‌توان از could have (توانایی) یا might have (احتمال) استفاده کرد: I could have caught the train if I had left earlier. ساختار should have + p.p. برای انتقاد و wish + گذشته کامل برای حسرت از همین خانواده‌اند.",
    form: [
      { label: "نوع سه", pattern: "If + had + p.p., would have + p.p. → If you had asked, I would have helped." },
      { label: "با inversion", pattern: "Had + فاعل + p.p., would have + p.p. → Had you asked, ..." },
      { label: "ترکیبی (گذشته→حال)", pattern: "If I had saved money, I would be free now." },
      { label: "ترکیبی (حال→گذشته)", pattern: "If he weren't so busy, he would have come yesterday." },
      { label: "با could/might", pattern: "She could have won if she had trained harder." },
    ],
    examples: [
      { en: "If we had left earlier, we wouldn't have missed the train.", fa: "اگر زودتر آمده بودیم، قطار را از دست نمی‌دادیم." },
      { en: "Had I known you were in town, I would have invited you over.", fa: "اگر می‌دانستم شهر هستی، دعوتت می‌کردم." },
      { en: "If she had accepted that scholarship, she would be living in London now.", fa: "اگر آن بورس را قبول کرده بود، الان در لندن زندگی می‌کرد." },
      { en: "They might have won the match if their captain hadn't been injured.", fa: "شاید بازی را می‌بردند اگر کاپیتانشان مصدوم نشده بود." },
      { en: "I could have become a musician, but I chose engineering.", fa: "می‌توانستم موسیقیدان شوم، اما مهندسی را انتخاب کردم." },
      { en: "If he weren't so stubborn, he would have apologised by now.", fa: "اگر اینقدر لجباز نبود، تا الان عذرخواهی کرده بود." },
    ],
    mistakes: [
      { wrong: "If I would have known, I would have come.", right: "If I had known, I would have come.", note: "در بخش if نوع سه فقط گذشته کامل می‌آید؛ would have هرگز بعد از if نمی‌نشیند." },
      { wrong: "If she had asked me, I would help her then.", right: "If she had asked me, I would have helped her.", note: "هر دو بخش گذشته‌اند؛ نتیجه هم would have + p.p. می‌خواهد." },
      { wrong: "Had I knew about the meeting, I had attended.", right: "Had I known about the meeting, I would have attended.", note: "بعد از Had فعل باید قسمت سوم (known) باشد." },
    ],
    quiz: [
      { question: "«اگر زودتر بیدار شده بودی، دیر نکرده بودی» کدام است؟", options: ["If you woke up earlier, you wouldn't be late.", "If you had woken up earlier, you wouldn't have been late.", "If you had woken up earlier, you wouldn't be late now.", "If you would have woken up earlier, you hadn't been late."], correctIndex: 1, explanation: "هر دو بخش گذشته کامل: نوع سه." },
      { question: "کدام جمله ترکیبی (گذشته→حال) است؟", options: ["If I had taken the job, I would be rich now.", "If I had taken the job, I would have been rich.", "If I took the job, I would be rich.", "If I take the job, I will be rich."], correctIndex: 0, explanation: "شرط در گذشته، نتیجه در حال: would be + now." },
      { question: "شکل inversion جمله «If I had seen you...» چیست؟", options: ["If had I seen you...", "Had I seen you...", "Did I see you...", "Have I seen you..."], correctIndex: 1, explanation: "حذف if و جابجایی had با فاعل." },
      { question: "«شاید قهرمان شده بود اگر تمرین بیشتری کرده بود» کدام است؟", options: ["He might become champion if he trained more.", "He might have become champion if he had trained more.", "He could become champion if he would train.", "He must have become champion if he trained."], correctIndex: 1, explanation: "might have + p.p. برای احتمالِ گذشته." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-02",
    titleFa: "جملات وارونه",
    titleEn: "Inversion",
    cefr: "C1",
    intro:
      "وارونه‌سازی جابه‌جایی فعل و فاعل برای تأکید رسمی است؛ ابزاری که نوشته شما را از سطحی به ادبی ارتقا می‌دهد.",
    rule:
      "در انگلیسی استاندارد فاعل قبل از فعل می‌آید، اما در برخی ساختار‌های تأکیدی فعل کمکی به ابتدای جمله می‌رود و این خودش نشانه رسمیت و قدرت نوشته است. رایج‌ترین ساختارها: قید منفی یا محدودکننده در ابتدای جمله (Never have I seen such courage؛ Not only did she apologise, but she also paid)، ساختارهای شرطی با حذف if (Had I known = If I had known؛ Were I you = If I were you؛ Should you need help = If you should need help)، و ساختارهای مقایسه‌ای با so/such (So beautiful was the sunset that we forgot the time). در همه این موارد فقط فعل کمکی/وجهی جابجا می‌شود؛ اگر جمله فعل کمکی ندارد، do/did اضافه می‌شود: Never did I imagine... نکته: وقتی قید منفی در جای عادی بماند، جمله کاملاً درست است (I have never seen...)؛ وارونه‌سازی صرفاً تأکید ادبی اضافه می‌کند و در نثر رسمی، سخنراری و ادبیات به کار می‌رود.",
    form: [
      { label: "قید منفی + وارونه", pattern: "Never / Rarely / Seldom / Little + کمکی + فاعل" },
      { label: "Not only", pattern: "Not only did he lie, but he also stole." },
      { label: "شرطی با had", pattern: "Had we known, we would have acted. (= If we had known)" },
      { label: "شرطی با were/should", pattern: "Were I you... / Should you need anything..." },
      { label: "تأکید با so/such", pattern: "So difficult was the exam that half the class failed." },
    ],
    examples: [
      { en: "Never had the city seen such a flood.", fa: "هرگز چنین سیلی را آن شهر ندیده بود." },
      { en: "Not only did she win the race, but she also broke the record.", fa: "نه تنها مسابقه را برد، بلکه رکورد را هم شکست." },
      { en: "Had you told me earlier, everything would be different.", fa: "اگر زودتر گفته بودی، همه‌چیز فرق می‌کرد." },
      { en: "Rarely do we get the chance to thank our teachers properly.", fa: "به‌ندرت فرصتی برای قدردانی درست از معلمانمان پیدا می‌کنیم." },
      { en: "So moving was her speech that the whole hall stood up.", fa: "سخنرانی‌اش چنان تأثیرگذار بود که تمام سالن ایستاد." },
      { en: "Should any problems arise, please contact us immediately.", fa: "در صورت بروز هرگونه مشکل، لطفاً فوراً با ما تماس بگیرید." },
    ],
    mistakes: [
      { wrong: "Never I have seen such a mess.", right: "Never have I seen such a mess.", note: "با قید منفی در ابتدا، کمکی هم باید قبل از فاعل بیاید." },
      { wrong: "Had I known, I would acted differently.", right: "Had I known, I would have acted differently.", note: "وارونه‌سازی تغییری در ساختار نتیجه ایجاد نمی‌کند." },
      { wrong: "Not only she sang, but she also danced.", right: "Not only did she sing, but she also danced.", note: "جمله فعل کمکی ندارد پس did اضافه و وارونه می‌شود." },
    ],
    quiz: [
      { question: "شکل وارونه «I had never heard such silence» کدام است؟", options: ["Never I had heard such silence.", "Never had I heard such silence.", "Never did I heard such silence.", "Had never I heard such silence."], correctIndex: 1, explanation: "قید منفی اول + had + فاعل." },
      { question: "«اگر تو بودم، قبول می‌کردم» با ساختار وارونه کدام است؟", options: ["Were I you, I would accept.", "I were you, I would accept.", "Were you I, I would accept.", "If I were you, would I accept."], correctIndex: 0, explanation: "حذف if و آوردن Were به ابتدا." },
      { question: "کدام جمله درست است؟", options: ["Not only he came late, but he also forgot the files.", "Not only did he come late, but he also forgot the files.", "Not only came he late, but he also forgot the files.", "Not only he did come late, but also forgot files."], correctIndex: 1, explanation: "با did وارونه، فعل اصلی به شکل ساده برمی‌گردد." },
      { question: "ساختار Should you need help معادل چیست؟", options: ["You should need help.", "If you need anything (رسمی)", "You will need help.", "Help is needed."], correctIndex: 1, explanation: "Should + فاعل = if ... should در نثر رسمی." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-03",
    titleFa: "جملات شکافته",
    titleEn: "Cleft Sentences",
    cefr: "C1",
    intro:
      "جمله شکافته یک جمله ساده را می‌شکند تا دقیقاً همان بخشی که می‌خواهید برجسته شود. ابزار محبوب سخنوران و نویسندگان برای تأکید جرحی‌دار.",
    rule:
      "ایده اصلی: اطلاعات را در ساختار It is/was ... that ... قرار می‌دهید تا فقط بخش میانی مورد تأکید باشد: It was Sara that called you (نه کس دیگر). این ساختار برای پاسخ به سؤال «دقیقاً چه/کی/کجا» بی‌نظیر است. سه الگوی اصلی: It-cleft (It was in London that we first met)، Wh-cleft یا شبه‌شکافته (What I need is a long holiday — چیزی که لازم دارم...) و All-cleft (All I want is a quiet evening — تنها چیزی که می‌خواهم...). در wh-cleft، جمله اول با What شروع می‌شود و کل ایده را مثل یک اسم در بر می‌گیرد و سپس is می‌آید: What surprised me was the price. این ساختارها در مکالمه هم رایج‌اند و صدای شما را طبیعی‌تر و متمرکزتر می‌کنند. برای تأکید روی زمان و مکان از It was yesterday that... و برای فعل از What he did was (to) resign استفاده می‌شود.",
    form: [
      { label: "It-cleft", pattern: "It is / was + تأکید + that → It was Ali who broke the window." },
      { label: "Wh-cleft", pattern: "What + جمله + is/was → What bothers me is the noise." },
      { label: "All-cleft", pattern: "All + جمله + is → All she wants is respect." },
      { label: "تأکید بر فعل", pattern: "What he did was (to) apologise." },
      { label: "تأکید بر مکان/زمان", pattern: "It was in April that we moved." },
    ],
    examples: [
      { en: "It was the rain that ruined the picnic, not the planning.", fa: "چیزی که پیک‌نیک را خراب کرد باران بود، نه برنامه‌ریزی." },
      { en: "What I love about teaching is the daily surprise.", fa: "چیزی که در تدریس دوست دارم غافلگیری هر روز است." },
      { en: "All you need is a little patience.", fa: "تنها چیزی که لازم داری کمی صبر است." },
      { en: "It was on a cold November morning that they arrived.", fa: "در یکی از صبح‌های سرد نوامبر رسیدند." },
      { en: "What she did was call the manager herself.", fa: "کاری که کرد این بود که خودش به مدیر زنگ زد." },
      { en: "It's the small choices that shape a life.", fa: "انتخاب‌های کوچک‌اند که زندگی را شکل می‌دهند." },
    ],
    mistakes: [
      { wrong: "It was Sara who she called you.", right: "It was Sara who called you.", note: "بعد از who فعل می‌آید؛ ضمیر تکراری لازم نیست." },
      { wrong: "What I need it is time.", right: "What I need is time.", note: "ساختار wh-cleft خودش مفعول را در بر دارد؛ it اضافه است." },
      { wrong: "It was yesterday when we met.", right: "It was yesterday that we met.", note: "در it-cleft استاندارد از that استفاده می‌شود؛ when غیراستاندارد است." },
    ],
    quiz: [
      { question: "جمله شکافته «چیزی که من را عصبانی کرد تاخیر بود» کدام است؟", options: ["It made me angry that was the delay.", "What made me angry was the delay.", "What was the delay made me angry.", "The delay what made me angry."], correctIndex: 1, explanation: "Wh-cleft: What + جمله + was + تأکید." },
      { question: "«علی بود که در را شکست» کدام است؟", options: ["Ali was who broke the window.", "It was Ali who broke the window.", "It was Ali broke the window.", "Who broke the window was Ali it."], correctIndex: 1, explanation: "It-cleft: It was + شخص + who + فعل." },
      { question: "ساختار All-cleft کدام جمله است؟", options: ["All what I want is peace.", "All I want is peace.", "I want all is peace.", "All is I want peace."], correctIndex: 1, explanation: "All + جمله + is + اسم؛ بدون what." },
      { question: "جمله شکافته «کاری که کرد استعفا دادن بود» کدام است؟", options: ["What he did was resign.", "What did he do was resign.", "He did what was resign.", "It did was resign what he did."], correctIndex: 0, explanation: "What + فاعل + did + was + فعل ساده." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-04",
    titleFa: "وجهی‌های استنباطی",
    titleEn: "Modals of Deduction",
    cefr: "C1",
    intro:
      "وقتی مدرک دارید اما قطعیت ندارید، از وجهی‌های استنباطی استفاده می‌کنید: must have، can't have، might have. زبان کارآگاهان و دانشمندان.",
    rule:
      "برای حدس درباره حال: must (قطعی نزدیک — حتماً است)، may/might/could (احتمال)، can't (قطعی منفی — حتماً نیست): He must be stuck in traffic؛ She might know the answer؛ That can't be true. برای استنباط درباره گذشته: must have + p.p.، might have + p.p.، can't have + p.p.: The lights are off — they must have gone out؛ She can't have finished already. should have + p.p. دو کاربرد دارد: انتقاد (باید می‌کردی — نکردی) و انتظار برآورده‌نشده (الان باید رسیده بود). needn't have + p.p. یعنی کاری را انجام دادی که لازم نبود: You needn't have paid — قبلاً پرداخت شده بود. تفاوت ظریف must و have to در استنباط صفر است: در معنای حدس فقط must به کار می‌رود. این ساختارها در مکالمه روزمره درباره رازها، دیر کردن‌ها و معماها فراوان‌اند و سطح زبان شما را یک پله بالا می‌برند.",
    form: [
      { label: "حدس قطعی حال", pattern: "must + فعل → He must be tired." },
      { label: "حدس قطعی منفی", pattern: "can't + فعل → It can't be his car." },
      { label: "احتمال حال", pattern: "might / could + فعل → She might be at work." },
      { label: "حدس گذشته", pattern: "must / can't / might + have + p.p. → They must have missed the bus." },
      { label: "بی‌نیاز گذشته", pattern: "needn't have + p.p. → You needn't have worried." },
    ],
    examples: [
      { en: "The ground is wet; it must have rained overnight.", fa: "زمین خیس است؛ حتماً شبانه باران آمده." },
      { en: "She can't have seen us — we were behind the wall.", fa: "نمی‌تواند ما را دیده باشد — پشت دیوار بودیم." },
      { en: "He might have forgotten about the appointment.", fa: "شاید قرار را فراموش کرده باشد." },
      { en: "You must be the new neighbour!", fa: "شما حتماً همسایه جدید هستید!" },
      { en: "They should have arrived by now; something's wrong.", fa: "الان باید رسیده باشند؛ یک مشکلی هست." },
      { en: "You needn't have brought dessert — we have plenty.", fa: "لازم نبود دسر بیاوری — به‌اندازه کافی داریم." },
    ],
    mistakes: [
      { wrong: "He musts be at home.", right: "He must be at home.", note: "must هیچ s نمی‌گیرد." },
      { wrong: "She must have not seen the sign.", right: "She can't have seen the sign.", note: "برای استنباط منفی قطعی از can't have استفاده می‌شود." },
      { wrong: "They must had left early.", right: "They must have left early.", note: "بعد از must، have + p.p. لازم است نه گذشته ساده." },
    ],
    quiz: [
      { question: "«چراغ‌ها خاموشه، حتماً رفتن بیرون» کدام است؟", options: ["They must go out.", "They must have gone out.", "They should have gone out.", "They can have gone out."], correctIndex: 1, explanation: "استنباط گذشته: must have + p.p." },
      { question: "«نمیشه که این حقیقت داشته باشه» کدام است؟", options: ["It mustn't be true.", "It can't be true.", "It shouldn't be true.", "It may not be true."], correctIndex: 1, explanation: "استنباط منفی قطعی حال: can't." },
      { question: "«لازم نبود نگران می‌بودی (ولی بودی)» کدام است؟", options: ["You didn't need to worry.", "You needn't have worried.", "You mustn't have worried.", "You shouldn't worry."], correctIndex: 1, explanation: "needn't have + p.p. = کاری انجام شد که لازم نبود." },
      { question: "کدام جمله احتمال (نه قطعیت) درباره گذشته بیان می‌کند؟", options: ["He must have missed the train.", "He can't have missed the train.", "He might have missed the train.", "He had missed the train."], correctIndex: 2, explanation: "might have = شاید شده باشد." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-05",
    titleFa: "عبارات قیدی",
    titleEn: "Participle Clauses",
    cefr: "C1",
    intro:
      "عبارات قیدی جمله را فشرده و ادبی می‌کنند: به‌جای دو جمله طولانی، یک جمله روان و حرفه‌ای. نشانه نوشتار سطح بالا در امتحانات C1.",
    rule:
      "عبارت قیدی (participle clause) با فعل ing (حال) یا قسمت سوم فعل (مجهول/گذشته) شروع می‌شود و توضیح اضافه درباره فاعل جمله اصلی می‌دهد: Walking down the street, I met an old friend = While I was walking down the street... . اگر فاعل عبارت همان فاعل جمله اصلی باشد (رایج‌ترین حالت)، فاعل تکرار نمی‌شود. عبارت مجهول با p.p. ساخته می‌شود: Written in 1850, the novel still feels modern. برای عبارت نتیجه‌ای از having + p.p. استفاده می‌شود: Having finished the exam, she left early. عبارت با being نشان‌دهنده علت است: Being unemployed, he had plenty of free time. نکته گرامری مهم: عبارت قیدی باید دقیقاً به فاعل جمله بچسبد وگرنه جمله «آویزان» (dangling) و غلط می‌شود: Walking home, the rain started غلط است چون باران walk نمی‌کند! در ستون فقرات نثر رسمی، ژورنالیسمی و آکادمیک انگلیسی، همین ساختارها فاصله شما با نویسندگان حرفه‌ای را پر می‌کنند.",
    form: [
      { label: "فعال همزمان", pattern: "ing → Reading the letter, she smiled." },
      { label: "مجهول", pattern: "p.p. → Built in 1920, the bridge..." },
      { label: "نتیجه قبلی", pattern: "Having + p.p. → Having seen the film, I didn't go again." },
      { label: "علت با being", pattern: "Being + صفت → Being new to the city, she got lost." },
      { label: "با نه", pattern: "Not knowing the answer, he stayed silent." },
    ],
    examples: [
      { en: "Opened in 1971, the theatre has hosted every major Iranian play.", fa: "این تئاتر که در ۱۹۷۱ افتتاح شد، میزبان همه نمایش‌های بزرگ ایرانی بوده است." },
      { en: "Not wanting to disturb her, I left quietly.", fa: "چون نمی‌خواستم اذیتش کنم، بی‌صدا رفتم." },
      { en: "Having lived in three countries, he speaks four languages.", fa: "چون در سه کشور زندگی کرده، چهار زبان حرف می‌زند." },
      { en: "Shocked by the news, the family said nothing.", fa: "خانواده از خبر شوکه شده بودند و چیزی نگفتند." },
      { en: "Arriving late, we missed the opening speech.", fa: "دیر رسیدیم و سخنانی افتتاحیه را از دست دادیم." },
      { en: "Written in simple language, the book suits beginners.", fa: "کتاب به زبان ساده نوشته شده و برای تازه‌کارها مناسب است." },
    ],
    mistakes: [
      { wrong: "Walking home, the rain started to fall.", right: "Walking home, I got caught in the rain.", note: "عبارت قیدی باید فاعل منطقی داشته باشد؛ باران پیاده‌روی نمی‌کند!" },
      { wrong: "Having finished the work, the TV was switched on.", right: "Having finished the work, he switched on the TV.", note: "فاعل عبارت و جمله اصلی باید یکی باشد." },
      { wrong: "Being a rainy day, we stayed in.", right: "It being a rainy day, we stayed in.", note: "برای فاعل غیرانسانی، it being لازم است تا جمله آویزان نشود." },
    ],
    quiz: [
      { question: "«چون در اصفهان به‌دنیا آمده، همه خیابان‌ها را می‌شناسد» با عبارت قیدی کدام است؟", options: ["Born in Isfahan, he knows every street.", "Being born Isfahan, he knows streets.", "He born in Isfahan, knowing streets.", "Born in Isfahan, streets are known."], correctIndex: 0, explanation: "p.p. (Born) + فاعل همان جمله اصلی." },
      { question: "کدام جمله آویزان (dangling) است؟", options: ["Sitting by the window, the cat watched the birds.", "Sitting by the window, the birds looked lovely.", "Having eaten, the children ran outside.", "Tired from work, she went to bed early."], correctIndex: 1, explanation: "پرنده‌ها نمی‌نشینند کنار پنجره؛ فاعل عبارت با جمله اصلی نمی‌خواند." },
      { question: "معادل عبارت قیدی «Not knowing what to say,...» چیست؟", options: ["Because he knew what to say", "Because he didn't know what to say", "Although he didn't know", "So that he didn't know"], correctIndex: 1, explanation: "ing منفی = علت منفی." },
      { question: "«بعد از اینکه تمام کرد، زود رفت» با having کدام است؟", options: ["Having finish, she left early.", "Having finished, she left early.", "Have finished, she left early.", "Having finishing, she left early."], correctIndex: 1, explanation: "Having + p.p. برای نتیجه قبلی." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-06",
    titleFa: "وجه التزامی",
    titleEn: "Subjunctive",
    cefr: "C2",
    intro:
      "وجه التزامی حالتی از فعل برای خواسته‌ها، پیشنهادهای رسمی و موقعیت‌های فرضی است؛ سنگ‌بنای انگلیسی حقوقی و رسمی.",
    rule:
      "وجه التزامی در انگلیسی مدرن دو شکل اصلی دارد. اول: base subjunctive که فعل به شکل ساده (بدون s و بدون زمان) می‌آید و بعد از فعل‌ها و صفت‌های امر و پیشنهاد قرار می‌گیرد: suggest، recommend، insist، demand، require، essential، vital، important: I suggest that he go now (نه goes!)؛ It is essential that she be informed (نه is!). دوم: past subjunctive که فقط فعل be را شامل می‌شود و were برای همه اشخاص: If I were you؛ I wish it were Friday. ساختار‌های کلیدی: It's time + فاعل + گذشته (It's time we left — دیگر وقتش است برویم)، would rather + فاعل + گذشته (I'd rather you didn't smoke — ترجیح می‌دهم نکشی)، as if/as though + گذشته برای غیرواقعی (He acts as if he owned the place)، و wish + گذشته برای حال نارضایتی (I wish I knew) / wish + گذشته کامل برای گذشته (I wish I had studied). در انگلیسی حقوقی و قراردادها این ساختارها با کلمات shall و hereby ترکیب می‌شوند و سطح رسمیت را بالا می‌برند.",
    form: [
      { label: "پیشنهاد رسمی", pattern: "suggest / insist that + فاعل + فعل ساده → I insist that he be told." },
      { label: "ضرورت", pattern: "It is essential/vital that + فعل ساده → It is vital that everyone attend." },
      { label: "wish حال", pattern: "I wish + گذشته ساده → I wish I had more time." },
      { label: "wish گذشته", pattern: "I wish + گذشته کامل → I wish I hadn't said that." },
      { label: "would rather", pattern: "I'd rather you didn't tell her." },
      { label: "It's time", pattern: "It's (high) time we left." },
    ],
    examples: [
      { en: "The committee recommended that the report be published immediately.", fa: "کمیته توصیه کرد گزارش فوراً منتشر شود." },
      { en: "It is essential that every applicant submit two references.", fa: "ضروری است هر متقاضی دو معرف ارائه دهد." },
      { en: "I wish I were better at saying goodbye.", fa: "کاش در خداحافظی بهتر بودم." },
      { en: "She wishes she had studied abroad when she had the chance.", fa: "کاش وقتی فرصت داشت در خارج تحصیل کرده بود." },
      { en: "I'd rather you didn't mention this to anyone.", fa: "ترجیح می‌دهم این را به هیچ‌کس نگویی." },
      { en: "It's high time this city got a proper metro.", fa: "دیگر وقتش است این شهر متروی درست‌وحسابی داشته باشد." },
    ],
    mistakes: [
      { wrong: "I suggest that he goes now.", right: "I suggest that he go now.", note: "بعد از suggest that، فعل به شکل ساده التزامی می‌آید (بدون s)." },
      { wrong: "It is essential that she is present.", right: "It is essential that she be present.", note: "شکل التزامی be در انگلیسی رسمی استاندارد است." },
      { wrong: "I wish I have more free time.", right: "I wish I had more free time.", note: "wish همیشه فعل را یک پله به عقب می‌برد: گذشته ساده." },
    ],
    quiz: [
      { question: "«ضروری است که او مطلع شود» کدام است؟", options: ["It is essential that she is informed.", "It is essential that she be informed.", "It is essential that she will be informed.", "It is essential she being informed."], correctIndex: 1, explanation: "وجه التزامی: that + فاعل + be." },
      { question: "«کاش پول بیشتری داشتم» کدام است؟", options: ["I wish I have more money.", "I wish I had more money.", "I wish I will have more money.", "I wish I would have more money."], correctIndex: 1, explanation: "wish + گذشته ساده برای حال." },
      { question: "کدام جمله وجه التزامی درست دارد؟", options: ["The doctor suggested that he takes a rest.", "The doctor suggested that he take a rest.", "The doctor suggested that he taking a rest.", "The doctor suggested he to take a rest."], correctIndex: 1, explanation: "suggest that + فعل ساده بدون s." },
      { question: "«ترجیح می‌دهم امشب نیای» کدام است؟", options: ["I'd rather you don't come tonight.", "I'd rather you didn't come tonight.", "I'd rather you not come tonight?", "I would rather you won't come tonight."], correctIndex: 1, explanation: "would rather + فاعل + گذشته ساده." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-07",
    titleFa: "حذف و جانشینی",
    titleEn: "Ellipsis & Substitution",
    cefr: "C2",
    intro:
      "گویشور باتجربه تکرار نمی‌کند؛ با so، one، do so و حذف‌های هوشمندانه جمله‌اش را سبک و طبیعی می‌کند. این درس هنر حذف است.",
    rule:
      "حذف (ellipsis) یعنی بخش تکراری جمله را بی‌آوریم چون ذهن مخاطب خودش کاملش می‌کند: She can swim but I can't (swim). در پاسخ‌های کوتاه فقط فعل کمکی می‌آید: Are you coming? — I might be. جانشینی (substitution) یعنی به‌جای تکرار، واژه جایگزین بگذاریم: so جایگزین جمله (Is he angry? — It seems so)، one/ones جایگزین اسم قابل‌شمارش (I'll take the red one)، do so جایگزین فعل و مفعول (She said she'd call and she did so)، و not جایگزین جمله منفی (I hope not). ساختار‌های end-of-sentence: I think so / I don't think so / I hope not / I'm afraid not. در جمله‌های هم‌ساخت  بخش مشترک فقط یک‌بار می‌آید: She works in Tehran and her brother in Karaj (حذف فعل دوم). بعد از than و as هم حذف رایج است: He earns more than me. تسلط بر این ساختارها تفاوت انگلیسی کتابی و انگلیسی گویشوارگان باتجربه است.",
    form: [
      { label: "حذف بعد از کمکی", pattern: "I can help if you want me to. (to + help)" },
      { label: "پاسخ کوتاه", pattern: "Will it rain? — It might. / Are you ok? — I think so." },
      { label: "جانشین اسم", pattern: "This phone is old; I need a new one." },
      { label: "do so", pattern: "He promised to quit and he did so last month." },
      { label: "hope not", pattern: "Will we be late? — I hope not." },
    ],
    examples: [
      { en: "I haven't called her yet, but I will tonight.", fa: "هنوز به او زنگ نزده‌ام، اما امشب می‌زنم." },
      { en: "These cookies are lovely. — Would you like another one?", fa: "این کوکی‌ها عالی‌اند. — یکی دیگه می‌خوای؟" },
      { en: "She said she would fix it, and she did so within an hour.", fa: "گفت درستش می‌کند و ظرف یک ساعت کرد." },
      { en: "Is the manager in? — I'm afraid not.", fa: "مدیر هست؟ — متأسفانه نه." },
      { en: "He plays the violin better than anyone I know.", fa: "ویولن را بهتر از هرکسی که می‌شناسم می‌نوازد." },
      { en: "Some liked the film; others didn't.", fa: "بعضی فیلم را دوست داشتند؛ بعضی نه." },
    ],
    mistakes: [
      { wrong: "Are you coming? — Yes, I am coming.", right: "Are you coming? — Yes, I am.", note: "در پاسخ کوتاه فقط فعل کمکی کافی است." },
      { wrong: "I hope not that she is angry.", right: "I hope she isn't angry. / I hope not.", note: "not جانشین کل جمله منفی است؛ ترکیبش با جمله اضافی غلط است." },
      { wrong: "I need new phone. This one is broken.", right: "I need a new one. This one is broken.", note: "one جایگزین اسم مفرد است و حرف تعریف خودش را می‌خواهد." },
    ],
    quiz: [
      { question: "پاسخ طبیعی به «Will it snow tomorrow?» کدام است؟", options: ["Yes, it will snow.", "It might.", "It will.", "Snow it will."], correctIndex: 1, explanation: "پاسخ کوتاه با کمکی و درجه احتمال؛ might طبیعی‌ترین است." },
      { question: "«گفت تماس می‌گیره و هم کرد» با do so کدام است؟", options: ["He said he'd call and did so.", "He said he'd call and so did.", "He said he'd call and did it so.", "He said he'd call and so did it."], correctIndex: 0, explanation: "did so جایگزین فعل + مفعول است." },
      { question: "کدام جمله حذف درست دارد؟", options: ["She works here and he works here too.", "She works here and he does too.", "She works here and he working too.", "She works here and he is too."], correctIndex: 1, explanation: "does جایگزین فعل اصلی تکراری." },
      { question: "«امیدوارم دیر نکنیم» کدام است؟", options: ["I hope we don't be late. / I hope not.", "I don't hope late.", "I hope not to late.", "I am not hoping late."], correctIndex: 0, explanation: "I hope not = امیدوارم چنین نباشد." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-08",
    titleFa: "اسمی‌سازی",
    titleEn: "Nominalisation",
    cefr: "C2",
    intro:
      "اسمی‌سازی هنر تبدیل فعل و صفت به اسم است؛ ستون فقرات نثر آکادمیک، حقوقی و خبری. با آن نوشته شما رسمی‌تر و فشرده‌تر می‌شود.",
    rule:
      "در نثر رسمی انگلیسی، به‌جای جمله فعلی، از اسم ساخته‌شده از آن فعل استفاده می‌شود: decide → decision، arrive → arrival، fail → failure، analyse → analysis. مقایسه کنید: The company decided to close the factory → The company's decision to close the factory shocked the workers. اسمی‌سازی سه مزیت دارد: فشردگی (اطلاعات بیشتر در جمله)، رسمیت (لحن آکادمیک) و امکان نام‌بردن مفهوم به‌عنوان فاعل یا مفعول. پسوندهای اصلی: -tion (inform → information)، -ment (develop → development)، -ance (perform → performance)، -al (remove → removal)، -ure (fail → failure)، -ness (happy → happiness)، -ity (able → ability). صفت‌ها هم اسم می‌شوند: aware → awareness، different → difference. اما مراقب زیاده‌روی هستید: جمله پر از اسم‌های انتزاعی سنگین و ناخوانا می‌شود (noun stacking): the implementation of the evaluation of the staff را به we evaluated the staff تبدیل کنید. قاعده طلایی: اسمی‌سازی برای متن رسمی، جمله‌سازی فعلی برای مکالمه.",
    form: [
      { label: "فعل → اسم", pattern: "decide → decision / arrive → arrival / discover → discovery" },
      { label: "صفت → اسم", pattern: "happy → happiness / aware → awareness / able → ability" },
      { label: "جمله → عبارت اسمی", pattern: "Prices increased → the increase in prices" },
      { label: "معلوم → اسمی مجهول‌نما", pattern: "They destroyed the forest → the destruction of the forest" },
    ],
    examples: [
      { en: "The government's refusal to negotiate led to the collapse of the talks.", fa: "امتناع دولت از مذاکره به فروپاشی گفت‌وگوها انجامید." },
      { en: "Her arrival changed the atmosphere of the office.", fa: "ورود او جوّ دفتر را تغییر داد." },
      { en: "There is growing awareness of environmental issues.", fa: "آگاهی فزاینده‌ای درباره مسائل زیست‌محیطی وجود دارد." },
      { en: "The analysis of the data took three weeks.", fa: "تحلیل داده‌ها سه هفته طول کشید." },
      { en: "Rapid urbanisation has changed the region completely.", fa: "شهرنشینی سریع منطقه را کاملاً تغییر داده است." },
      { en: "His failure to report the incident cost him the job.", fa: "عدم گزارش حادثه از سوی او، شغلش را از او گرفت." },
    ],
    mistakes: [
      { wrong: "The decide of the manager surprised us.", right: "The manager's decision surprised us.", note: "اسم درست decision است و مالکیت با 's." },
      { wrong: "We must improve the perform of the team.", right: "We must improve the performance of the team.", note: "اسم فعل perform کلمه performance است." },
      { wrong: "The destroy of the forest was quick.", right: "The destruction of the forest was quick.", note: "اسم فعل destroy کلمه destruction است." },
    ],
    quiz: [
      { question: "اسم فعل analyse کدام است؟", options: ["analysment", "analysis", "analysation", "analysal"], correctIndex: 1, explanation: "analyse → analysis." },
      { question: "شکل اسمی «They arrived suddenly» کدام است؟", options: ["The sudden arrive of them", "Their sudden arrival", "The suddenly arrival", "The arrival sudden"], correctIndex: 1, explanation: "arrive → arrival + صفت sudden." },
      { question: "کدام جمله اسمی‌سازی درست دارد؟", options: ["The develop of the city was fast.", "The development of the city was fast.", "The developing of city was fastly.", "The developed of the city was fast."], correctIndex: 1, explanation: "develop → development." },
      { question: "چرا از اسمی‌سازی زیاده‌روی نکنیم؟", options: ["چون غلط گرامری است", "چون جمله سنگین و ناخوانا می‌شود", "چون فقط در شعر کاربرد دارد", "چون معنا را عوض می‌کند"], correctIndex: 1, explanation: "تعداد زیاد اسم انتزاعی متن را پف‌کرده و مبهم می‌کند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-09",
    titleFa: "افعال عبارتی",
    titleEn: "Phrasal Verbs",
    cefr: "C2",
    intro:
      "افعال عبارتی ترکیب فعل + حرف اضافه‌اند و در انگلیسی محاوره‌ای همه‌جا هستند؛ بدون آن‌ها، انگلیسی شما «کتابی» می‌ماند.",
    rule:
      "فعل عبارتی از فعل و ذره (particle) تشکیل شده و معنایی غیرقابل استنتاج از اجزایش دارد: give up (تسلیم شدن) ربطی به give یا up به‌تنهایی ندارد. سه نوع ساختاری داریم: جداشدنی (فعل + ذره + مفعول: call off the meeting)، جداشدنی با ضمیر (ذره نمی‌تواند جدا شود وقتی مفعول ضمیر است: call it off نه call off it) و اجباریاً جداشدنی (فعل + مفعول + ذره: look after the kids — هرگز جدا نمی‌شود). افعال سه‌بخشی هم هستند: put up with (تحمل کردن)، look forward to (بی‌صبرانه منتظر بودن)، get away with (از زیر کار در رفتن). معنای بعضی افعال عبارتی با حرف اضافه تغییر می‌کند: take off (پرواز کردن / لباس درآوردن)، break down (خراب شدن / از نظر احساسی فروپاشیدن). در انگلیسی رسمی معمولاً معادل تک‌کلمه‌ای داریم: find out → discover؛ put off → postpone؛ go on → continue. یادگیری آن‌ها را با بافت و مثال پیش ببرید، نه لیست خشک.",
    form: [
      { label: "جداشدنی", pattern: "turn off the TV / turn the TV off / turn it off" },
      { label: "غیرجداشدنی", pattern: "look after the children (هرگز: look the children after)" },
      { label: "سه‌بخشی", pattern: "put up with / look forward to / run out of" },
      { label: "معادل رسمی", pattern: "put off = postpone / find out = discover / give up = quit" },
    ],
    examples: [
      { en: "Our flight took off two hours late.", fa: "پرواز ما دو ساعت تأخیر داشت (بلند شد)." },
      { en: "I can't put up with this noise anymore.", fa: "دیگر نمی‌توانم این سر و صدا را تحمل کنم." },
      { en: "We've run out of printer paper again.", fa: "دوباره کاغذ پرینترمان تمام شده." },
      { en: "The meeting was called off at the last minute.", fa: "جلسه در آخرین لحظه لغو شد." },
      { en: "She's looking forward to the holidays.", fa: "بی‌صبرانه منتظر تعطیلات است." },
      { en: "Don't bring up that topic at dinner.", fa: "آن موضوع را سر شام پیش نکش." },
    ],
    mistakes: [
      { wrong: "Turn off it, please.", right: "Turn it off, please.", note: "وقتی مفعول ضمیر است، باید بین فعل و ذره بیاید." },
      { wrong: "I'm looking forward to see you.", right: "I'm looking forward to seeing you.", note: "to اینجا حرف اضافه است و بعدش ing می‌آید." },
      { wrong: "We ran out from money.", right: "We ran out of money.", note: "run out همیشه با of می‌آید." },
    ],
    quiz: [
      { question: "«جلسه لغو شد» کدام است؟", options: ["The meeting was called off.", "The meeting was called of.", "The meeting was off called.", "The meeting cancelled off."], correctIndex: 0, explanation: "call off = لغو کردن." },
      { question: "کدام جمله درست است؟", options: ["Look after them well.", "Look them after well.", "Look well after them only.", "Look at them after."], correctIndex: 0, explanation: "look after غیرجداشدنی است و مفعول بعد از آن می‌آید." },
      { question: "معادل محاوره‌ای «postpone» کدام است؟", options: ["put on", "put off", "put up", "put out"], correctIndex: 1, explanation: "put off = به تعویق انداختن." },
      { question: "«بی‌صبرانه منتظر دیدارت هستم» کدام است؟", options: ["I look forward to see you.", "I'm looking forward to seeing you.", "I look forward for seeing you.", "I'm looking forward see you."], correctIndex: 1, explanation: "look forward to + ing." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-10",
    titleFa: "نرم‌سازی و پیوندهای پیشرفته",
    titleEn: "Hedging & Advanced Connectors",
    cefr: "C2",
    intro:
      "در انگلیسی حرفه‌ای، ادعاها نرم بیان می‌شوند و جمله‌ها با پیوندهای دقیق به هم می‌چسبند. این درس لحن علمی و انسجام متن را می‌سازد.",
    rule:
      "نرم‌سازی (hedging) یعنی ادعا را با احتیاط علمی بیان کنید تا دقیق و قابل دفاع باشد: به‌جای This proves... بگویید This suggests / The data indicate / It appears that / These findings tend to support. قیدهای احتیاط: arguably، presumably، somewhat، relatively، generally speaking. افعال گزارشی نرم: seem، appear، suggest، tend to. در مقابل، تقویت‌کننده‌ها (clearly، undoubtedly، significantly) فقط وقتی به کار روند که مدرک قاطع دارید. پیوندهای پیشرفته جای and/but/so را می‌گیرند و منطق دقیق می‌سازند: اضافه (furthermore، moreover، in addition)، تقابل (however، nevertheless، on the contrary، whereas)، علت (consequently، accordingly، owing to)، نتیجه (therefore، thus، hence)، تاکید (indeed، notably)، بازتدوین (in other words، that is to say)، نمونه (for instance، to illustrate)، و امتیاز دادن (admittedly، granted، to be fair). نکته ریز: moreover وزن بیشتری از furthermore ندارد برعکسِ باور رایج؛ هر دو رسمی‌اند. ترکیب نرم‌سازی + پیوند درست همان چیزی است که مقاله C1/C2 را از متن تازه‌کار جدا می‌کند.",
    form: [
      { label: "نرم‌سازی علمی", pattern: "The results suggest / appear to indicate that..." },
      { label: "قید احتیاط", pattern: "arguably / presumably / generally / to some extent" },
      { label: "پیوند تقابلی", pattern: "however / nevertheless / on the contrary / whereas" },
      { label: "پیوند نتیجه", pattern: "therefore / consequently / accordingly / hence" },
      { label: "امتیاز دادن", pattern: "admittedly / granted / to be fair, ..." },
    ],
    examples: [
      { en: "The data appear to support the hypothesis, at least partially.", fa: "داده‌ها ظاهراً از فرضیه پشتیبانی می‌کنند، حداقل تا حدی." },
      { en: "The study was small; nevertheless, its findings are worth considering.", fa: "مطالعه کوچک بود؛ با این حال یافته‌هایش ارزش بررسی دارند." },
      { en: "Admittedly, the plan has risks; however, doing nothing is riskier.", fa: "البته برنامه ریسک دارد؛ اما هیچ‌کار نکردن ریسک بیشتری دارد." },
      { en: "Sales fell sharply, owing to the new regulations.", fa: "فروش به‌شدت افت کرد، به دلیل مقررات جدید." },
      { en: "In other words, the market has fundamentally changed.", fa: "به عبارت دیگر، بازار از پایه عوض شده است." },
      { en: "The evidence is, arguably, inconclusive at this stage.", fa: "شواهد در این مرحله، به‌قولی، غیرقطعی است." },
    ],
    mistakes: [
      { wrong: "This proves that coffee is bad for you.", right: "This suggests that coffee may be harmful in large amounts.", note: "در نوشتار علمی، ادعای مطلق بدون مدرک قاطع نپذیرید." },
      { wrong: "He was tired. So he went to bed. But he couldn't sleep. So he read.", right: "He was tired; therefore, he went to bed. However, unable to sleep, he read.", note: "زنجیره so/but متن را ساده و تکراری نشان می‌دهد؛ پیوندهای متنوع به کار ببرید." },
      { wrong: "On the contrary of popular belief,...", right: "Contrary to popular belief,...", note: "عبارت درست contrary to است؛ on the contrary برای رد گفته قبلی به کار می‌رود." },
    ],
    quiz: [
      { question: "کدام جمله نرم‌سازی علمی دارد؟", options: ["This proves the theory is right.", "The findings appear to support the theory.", "The theory is definitely correct.", "Everyone knows the theory is true."], correctIndex: 1, explanation: "appear to support نمونه کلاسیک hedging است." },
      { question: "«مطالعه کوچک بود؛ با این حال ارزشمند است» کدام است؟", options: ["The study was small; moreover, it is valuable.", "The study was small; nevertheless, it is valuable.", "The study was small; therefore, it is valuable.", "The study was small; hence, it is valuable."], correctIndex: 1, explanation: "nevertheless = با این حال (تقابل)." },
      { question: "عبارت «به عبارت دیگر» برای چه منظری است؟", options: ["نتیجه‌گیری", "بازتدوین و توضیح دوباره", "مثال زدن", "مقایسه"], correctIndex: 1, explanation: "in other words همان مطلب را به شکل دیگر می‌گوید." },
      { question: "کدام استفاده از امتیاز دادن (concession) است؟", options: ["Admittedly, the cost is high, but the quality is unmatched.", "The cost is high. Therefore, the quality is unmatched.", "The cost is high; thus, we refused.", "The cost is high, namely the quality."], correctIndex: 0, explanation: "admittedly نقطه مقابل را می‌پذیرد و سپس استدلال اصلی می‌آید." },
    ],
  },
];
