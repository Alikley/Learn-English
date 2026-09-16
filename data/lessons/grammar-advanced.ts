import type { GrammarLesson } from "./types";

// ========================================
// گرامر پیشرفته — ۱۰ درس واقعی (C1 / C2)
// v1.0.1.3 — بازنویسی کامل با آموزش مفهومی عمیق:
// هر درس = چرا مهم است + ۳ بخش آموزشی چندپاراگرافی
// + قانون در یک نگاه + جدول ساختار + ۸ مثال
// + ۴ اشتباه رایج + نکته‌های طلایی + آزمونک
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-advanced-01",
    titleFa: "شرطی نوع سه و ترکیبی",
    titleEn: "Third & Mixed Conditionals",
    cefr: "C1",
    intro:
      "شرطی نوع سه، زبانِ «پشیمانی و تصور گذشتهٔ متفاوت» است: اگر زودتر می‌رفتم قطار را می‌ گرفتم، اگر آن را نمی‌گفتم همه‌چیز فرق می‌کرد. این ساختار به شما اجازه می‌دهد دربارهٔ گذشته فکر کنید که «هرگز رخ نداد» و نتیجه‌اش هم هرگز نیامد — قدرتمندترین ابزار زبان برای حسرت، آرزوی معکوس و تحلیل ماجراهای تمام‌شده. در سطح C1، این درس همراه با نسخهٔ ترکیبی (mixed) می‌آید که زمان‌های دو نیمه را عمداً ناهماهنگ می‌کند تا واقعیت‌های پیچیده را روایت کند.",
    sections: [
      {
        title: "آناتومی پشیمانی: had + V3 در نیمهٔ شرط",
        paragraphs: [
          "ساختار نوع سه این است: if + had + قسمت سوم فعل، would have + قسمت سوم. If I had left earlier, I would have caught the train — اگر زودتر رفته بودم، قطار را گرفته بودم. هر دو نیمه به «گذشتهٔ اتفاق‌نیفتاده» اشاره دارند: نه زودتر رفتم و نه قطار را گرفتم؛ جمله فقط یک جهانِ ممکنِ مرده را بازسازی می‌کند. به همین دلیل به این ساختار «غیرواقعی گذشته» می‌گویند — زمان‌سفر ذهنی به اتفاقی که حذف شده است.",
          "نکتهٔ سبکی مهم: در گفتار، would have به 'd have کوتاه می‌شود و اگر بعد از ضمیر بیاید حتی می‌شنوید I'd'a caught (نوشتاری: I'd have caught). در نیمهٔ شرط هم had را می‌توان با ترتیب وارونه حذف if کرد: Had I known, I would have called — ساختاری رسمی و ادبی که در بخش وارونگی بیشتر درباره‌اش حرف می‌زنیم. مهم‌ترین خطار این درس، قاطی‌کردن دو نیمه است: would have هیچ‌وقت بعد از if نمی‌آید (If I would have seen him... غلط رایج آمریکایی غیراستاندارد است؛ در انگلیسی استاندارد: If I had seen him).",
        ],
        examples: [
          { en: "If I had studied medicine, I would have become a doctor.", fa: "اگر پزشکی خوانده بودم، دکتر شده بودم. (نه خواندم، نه شدم)" },
          { en: "She wouldn't have missed the flight if she had set an alarm.", fa: "پرواز را از دست نمی‌داد اگر زنگ ساعت گذاشته بود." },
        ],
      },
      {
        title: "شرطی ترکیبی: وقتی دو نیمه در دو زمان‌اند",
        paragraphs: [
          "واقعیت همیشه مرتب نیست: بعضی حسرت‌ها شرطِ گذشته دارند ولی نتیجه‌شان تا «الان» ادامه دارد، یا برعکس. اینجا شرطی ترکیبی (mixed) وارد می‌شود. نوع رایج اول: شرطِ گذشته + نتیجهٔ حال — If I had accepted that job, I would be rich now یعنی «آن موقع قبول نکردم و به همین دلیل الان ثروتمند نیستم». نیمهٔ شرط با had + V3 به گذشته می‌رود اما نتیجه با would + فعل ساده در حال می‌ماند، چون اثرش همین امروز روی میز است.",
          "نوع دوم: شرطِ همیشگی + نتیجهٔ گذشته — If he weren't so stubborn, he would have apologized yesterday یعنی «او ذاتاً مغرور است (و هست) و به همین دلیل دیروز عذرخواهی نکرد». اینجا شرط با were (حالِ غیرواقعی) بیان می‌شود چون شخصیتش هنوز همین است، اما نتیجه در گذشته رخ داده یا نیفتاده است. شرطی ترکیبی در واقع «دنیای واقعی» است: انگیزه‌های قدیمی که نتیجه‌های امروزی دارند، و صفت‌های همیشگی که تصمیم‌های دیروزی را شکل داده‌اند. تشخیصش هم ساده است: زمانِ دو نیمه را جدا بپرسید و هر نیمه را با زمان خودش بسازید.",
        ],
        examples: [
          { en: "If I had accepted that job, I would be rich now.", fa: "اگر آن شغل را قبول کرده بودم، الان ثروتمند بودم. (گذشته→حال)" },
          { en: "If he weren't so stubborn, he would have apologized yesterday.", fa: "اگر این‌قدر مغرور نبود، دیروز عذرخواهی می‌کرد. (حال→گذشته)" },
        ],
      },
      {
        title: "کاربرد روایی: نقد خود، تحلیل ماجرا، تسلی دادن",
        paragraphs: [
          "نوع سه در مکالمهٔ روزمره سه نقش پررنگ دارد. اول، «نقد و پشیمانی»: I shouldn't have said that — I wish I could take it back (نباید می‌گفتم). دوم، «تحلیل ماجرا» در محیط کاری و روزنامه‌نگاری: If the warning had been heeded, the accident would have been avoided — جمله‌ای که بدون accusing مستقیم، مسئولیت را نشان می‌دهد (و به همین دلیل محبوب گزارشگران است). سوم، «تسلی دادن»: It wouldn't have mattered anyway — به هر حال مهم نبود؛ جمله‌ای که برای سبک‌کردن حسرت دیگران گفته می‌شود.",
          "خانوادهٔ باید-می‌بایستِ گذشته هم اینجا کامل می‌شود: should have + V3 (می‌بایست کرده بودی — ندامت)، could have + V3 (می‌توانست انجام دهد اما نشد — امکانِ سوخته)، needn't have + V3 (لازم نبود انجامش می‌دادی — کارِ بیهوده). این سه‌گانه با شرطی سه هم‌خانواده‌اند و اغلب در یک داستان کنار هم می‌آیند: I could have caught the train — I should have left earlier — but I needn't have worried; the meeting was cancelled anyway! روایت این ماجراهای کوچک، بهترین تمرین طبیعی برای تثبیت کل خانوادهٔ گذشتهٔ غیرواقعی است.",
        ],
        examples: [
          { en: "I shouldn't have sent that email.", fa: "نباید آن ایمیل را می‌فرستادم." },
          { en: "You needn't have bought so much food.", fa: "لازم نبود این‌همه غذا می‌خریدی." },
          { en: "He could have won the race, but he fell.", fa: "می‌توانست مسابقه را ببرد، اما افتاد." },
        ],
      },
    ],
    rule:
      "شرطی سه (غیرواقعی گذشته): if + had + V3، would have + V3 — If I had known, I would have called. نیمهٔ شرط هرگز would نمی‌گیرد. ترکیبی نوع ۱ (گذشته→حال): If I had taken that job, I would be rich now. ترکیبی نوع ۲ (حال→گذشته): If he weren't so stubborn, he would have apologized. خانوادهٔ ندامت: should have + V3 (می‌بایست)، could have + V3 (می‌توانست)، needn't have + V3 (لازم نبود). در گفتار: would have → 'd have؛ حذف if با وارونگی: Had I known...",
    form: [
      { label: "نوع سه", pattern: "If + had + V3, would have + V3" },
      { label: "مثال", pattern: "If you had told me, I would have helped." },
      { label: "ترکیبی (گذشته→حال)", pattern: "If I had saved more, I would be free now." },
      { label: "ترکیبی (حال→گذشته)", pattern: "If she weren't so shy, she would have spoken up." },
      { label: "ندامت", pattern: "should/could/needn't have + V3" },
      { label: "وارونگی رسمی", pattern: "Had we known earlier, we would have acted." },
    ],
    examples: [
      { en: "If we had booked earlier, the tickets would have been cheaper.", fa: "اگر زودتر رزرو کرده بودیم، بلیط‌ها ارزان‌تر می‌بود." },
      { en: "If she hadn't helped me, I would have failed the exam.", fa: "اگر کمکم نمی‌کرد، در آزمون مردود می‌شدم." },
      { en: "If I had learned English as a child, I would speak it fluently now.", fa: "اگر بچگی انگلیسی یاد گرفته بودم، الان روان صحبت می‌کردم. (ترکیبی)" },
      { en: "They would have won if their best player hadn't been injured.", fa: "برنده می‌شدند اگر بهترین بازیکنشان مصدوم نشده بود." },
      { en: "If I were more organized, I wouldn't have lost the file yesterday.", fa: "اگر منظم‌تر بودم، دیروز فایل را گم نمی‌کردم. (ترکیبی)" },
      { en: "I should have listened to your advice.", fa: "باید به توصیه‌ات گوش می‌دادم." },
      { en: "You could have told me you were coming!", fa: "می‌توانستی بگویی داری می‌آیی!" },
      { en: "Had the driver been more careful, the accident would never have happened.", fa: "اگر راننده احتیاط‌تر بود، تصادف هرگز رخ نمی‌داد. (وارونه)" },
    ],
    mistakes: [
      { wrong: "If I would have known, I would have come.", right: "If I had known, I would have come.", note: "بعد از if هرگز would have نمی‌آید؛ نیمهٔ شرط فقط had + V3 می‌گیرد." },
      { wrong: "If she had hurried, she would catch the train.", right: "If she had hurried, she would have caught the train.", note: "هر دو نیمهٔ نوع سه به گذشتهٔ غیرواقعی تعلق دارند؛ نتیجه هم would have + V3 می‌خواهد — مگر اینکه عمداً ترکیبی باشد و زمان حال بخواهد." },
      { wrong: "I should have went to the doctor.", right: "I should have gone to the doctor.", note: "بعد از should have قسمت سوم فعل می‌آید: gone، نه went." },
      { wrong: "If he hadn't been fired, he will be happy now.", right: "If he hadn't been fired, he would be happy now.", note: "شرطی ترکیبی نتیجهٔ حال را با would می‌سازد، نه will؛ جهان همچنان غیرواقعی است." },
    ],
    tips: [
      "قبل از ساختن جمله بپرسید: «هر دو نیمه دربارهٔ گذشتهٔ مرده‌اند؟» بله → نوع سه خالص؛ «شرط گذشته و اثرش تا الان؟» → ترکیبی با would + حال.",
      "سه‌گانهٔ ندامت را در یک داستان تمرین کنید: could have (فرصت سوخته) + should have (ندامت) + needn't have (کار بیهوده) — ماجراهای واقعی خودتان بهترین مصالح‌اند.",
      "در نوشتار رسمی، Had + فاعل + V3 را جایگزین If...had کنید تا لحن ادبی‌تری بگیرید: Had we known... .",
      "برای تحلیل بجای سرزنش، نوع سه را بی‌حس اتهام به کار ببرید: If the process had been clearer, the error wouldn't have occurred.",
    ],
    quiz: [
      { question: "«اگر زودتر بیدار شده بودی، قطار را می‌گرفتی» کدام است؟", options: ["If you woke up earlier, you would catch the train.", "If you had woken up earlier, you would have caught the train.", "If you would have woken up earlier, you had caught the train.", "If you had woken up earlier, you would catch the train."], correctIndex: 1, explanation: "شرطی سه: if + had + V3 و would have + V3 در نتیجه." },
      { question: "«اگر بچگی ورزش کرده بودم، الان سالم‌تر بودم» چه نوع شرطی است؟", options: ["نوع دو", "نوع سه", "ترکیبی (شرط گذشته، نتیجهٔ حال)", "نوع صفر"], correctIndex: 2, explanation: "شرط در گذشتهٔ نیفتاده است (had exercised) اما نتیجه در حال است (would be) — شرطی ترکیبی." },
      { question: "«لازم نبود تاکسی می‌گرفتی؛ ایستگاه نزدیک بود» کدام است؟", options: ["You shouldn't have taken a taxi.", "You needn't have taken a taxi.", "You couldn't have taken a taxi.", "You mustn't have taken a taxi."], correctIndex: 1, explanation: "کارِ انجام‌شده اما بی‌ضرورت → needn't have + V3." },
      { question: "کدام جمله غلط است؟", options: ["Had I known, I would have called.", "If I had known, I would have called.", "If I would have known, I would have called.", "Had it not rained, we would have gone out."], correctIndex: 2, explanation: "would have بعد از if در انگلیسی استاندارد مجاز نیست؛ نیمهٔ شرط فقط had + V3 می‌گیرد." },
      { question: "«او می‌توانست قهرمان شود اما مصدوم شد» کدام است؟", options: ["He should have won, but he got injured.", "He could have won, but he got injured.", "He must have won, but he got injured.", "He needn't have won, but he got injured."], correctIndex: 1, explanation: "امکانِ برده‌شده که محقق نشد → could have + V3." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-02",
    titleFa: "جملات وارونه",
    titleEn: "Inversion",
    cefr: "C1",
    intro:
      "وارونگی، حرکت «فعل کمکی به قبل از فاعل» است — همان کاری که در سؤال‌ها انجام می‌دهید، اما این بار نه برای پرسیدن بلکه برای «تأکید درخشان». نویسندگان و سخنوران حرفه‌ای با وارونگی، جمله‌هایشان را از سطح خبری به سطح ادبی و مکنونه بالا می‌برند: Never have I seen such beauty / Not only did she win, but she also broke the record. این ساختار امضای زبانِ سطح C1 و C2 است و تسلط بر آن، نوشتار شما را از جمله‌های خسته‌کنندهٔ همیشه‌یکسان نجات می‌دهد.",
    sections: [
      {
        title: "قاعدهٔ طلایی: قید منفی در سر جمله = وارونگی",
        paragraphs: [
          "هستهٔ این درس یک قاعدهٔ ساده است: وقتی قید یا عبارتِ «منفی یا محدودکننده» به ابتدای جمله می‌آید، فعل کمکی (یا do برای زمان‌های ساده) جابه‌جا می‌شود و قبل از فاعل می‌نشیند — درست مثل سؤال، اما با نقطه در انتها! Never have I felt so alive. Rarely does he arrive on time. Not once did she complain. Seldom have we seen such dedication. این جمله‌ها سؤال نیستند؛ فقط صحنه‌آرایی درخشان‌تری دارند و روی کلمهٔ اول نورافکن می‌اندازند.",
          "چرا وارونگی این‌قدر «حس» می‌دهد؟ چون ترتیب طبیعی جمله را عمداً می‌شکند و همین شکستن قانون، توجه شنونده را صاف به کلمهٔ تأکیدی می‌برد. در زبان‌شناسی می‌گویند این ساختار «مارکِر ژانر ادبی و خطابی» است: در سخنرانی‌های سیاسی، ادبیات داستانی و مقالات جدی، فراوانی‌اش چند برابر گفتار روزمره است. نکتهٔ فنی: اگر جمله زمان سادهٔ عادی دارد (بدون کمکی)، do/does/did وارد می‌شود و فعل به شکل ساده برمی‌گردد: She rarely smiles → Rarely does she smile.",
        ],
        examples: [
          { en: "Never have I seen such a beautiful sunset.", fa: "هرگز چنین غروب زیبایی ندیده‌ام." },
          { en: "Rarely does he miss a class.", fa: "به‌ندرت کلاس را از دست می‌دهد." },
          { en: "Not once did she complain about the pain.", fa: "حتی یک بار هم از درد شکایت نکرد." },
        ],
      },
      {
        title: "خانوادهٔ Not only و No sooner",
        paragraphs: [
          "دو ستارهٔ وارونگی که در امتحان و نوشتار رسمی پرتکرارند: Not only... but (also) و No sooner... than. ساختار اول: Not only به اول می‌آید، وارونگی در همان جملهٔ اول رخ می‌دهد و جملهٔ دوم با but also ادامه پیدا می‌کند: Not only did he apologize, but he also paid for the damage. یعنی «نه‌تنها عذرخواهی کرد، بلکه خسارت را هم پرداخت» — هر دو اتفاق مثبت، با تأکید ویژه بر اولی.",
          "ساختار دوم برای «به‌محض-که» فوریّت دارد: No sooner had we arrived than the rain started — «تازه رسیده بودیم که باران شروع شد». دقت کنید که اینجا than می‌آید نه when، و نیمهٔ اول وارونگیِ زمان کامل دارد (had + فاعل + V3). هم‌خانواده‌های دیگر: Hardly/Scarcely had... when... با همان معنا. یک قاعده برای همهٔ این خانواده: هر قیدِ منفیِ سرجمله‌نشسته فقط «یک بار» وارونگی می‌سازد؛ اگر جملهٔ بعدی هم می‌آید (بعد از but/than/when)، دیگر ساختار عادی دارد.",
        ],
        examples: [
          { en: "Not only did she win the race, but she also broke the record.", fa: "نه‌تنها مسابقه را برد، بلکه رکورد را هم شکست." },
          { en: "No sooner had I closed my eyes than the phone rang.", fa: "تازه چشم‌هایم را بسته بودم که تلفن زنگ خورد." },
          { en: "Hardly had we sat down when the show began.", fa: "تازه نشسته بودیم که نمایش شروع شد." },
        ],
      },
      {
        title: "وارونگی شرطی و جایگزین‌های ادبی if",
        paragraphs: [
          "کاربرد محبوب نویسندگان: حذف if در جمله‌های شرطی با جابه‌جایی فعل کمکی. برای شرطی نوع دو: Were I you، I would accept (به‌جای If I were you). برای نوع سه: Had they informed us، we would have acted differently (به‌جای If they had informed us). برای شرطی با should (احتمال کمتر در آینده): Should you need anything، just ask. این ساختارها رسمی‌تر و جمع‌وجورتر از نسخهٔ با if هستند و در نامه‌های اداری، مقالات و ادبیات دیده می‌شوند.",
          "گروه دیگری از وارونگی‌های ادبی که باید بشناسید: قیدهای مکان با فعل‌های حرکت و فاعل‌های نامتعین — Along the street came a parade / On the hill stood an old church. این «وارونگی مکانی» حس توصیفِ داستانی می‌دهد و بعد از قید مکان، فعل قبل از فاعل می‌آید. همچنین ساختارهای مقایسه‌ای: So beautiful was the scene that we all went silent / Such was his anger that nobody dared speak. این دو (so/such جابه‌جاشده) برای نشان‌دادن «شدت به‌اندازه‌ای که...» در روایت‌های ادبی محبوب‌اند. کل خانوادهٔ وارونگی را یکجا ببینید: قید منفی سرجمله، not only/no sooner، شرطی‌های بدون if، مکان با فعل حرکت، و so/such — هر شش، ابزارهای رسانه‌ای کردن نوشتار شما هستند.",
        ],
        examples: [
          { en: "Were I in your position, I would negotiate.", fa: "اگر جای تو بودم، مذاکره می‌کردم. (بدون if)" },
          { en: "So convincing was her argument that everyone agreed.", fa: "استدلالش چنان قانع‌کننده بود که همه موافقت کردند." },
          { en: "Down the stairs came the bride.", fa: "عروس از پله‌ها پایین آمد. (وارونگی مکانی)" },
        ],
      },
    ],
    rule:
      "قید/عبارت منفی یا محدودکننده در سرِ جمله → فعل کمکی قبل از فاعل (مثل سؤال اما با نقطه): Never have I... / Rarely does he... / Not once did she... . Not only + وارونگی، but also + جملهٔ عادی. No sooner had + فاعل + V3 than... (= به‌محض اینکه). Hardly/Scarcely had... when... . حذف if شرطی: Were I you... / Had they known... / Should you need... . وارونگی مکانی با فعل حرکت: Down came the rain. شدت: So... was... that / Such was... that. در زمان‌های بدون کمکی، do/does/did وارد و فعل ساده می‌شود.",
    form: [
      { label: "قید منفی سرجمله", pattern: "Never have I seen... · Rarely does he... · Seldom do we..." },
      { label: "Not only", pattern: "Not only did he apologize, but he also paid." },
      { label: "No sooner", pattern: "No sooner had we arrived than it rained." },
      { label: "شرطی بدون if", pattern: "Were I you... · Had I known... · Should you need..." },
      { label: "شدت", pattern: "So bright was the light that... / Such was the noise that..." },
      { label: "مکان + حرکت", pattern: "Through the window flew the bird." },
    ],
    examples: [
      { en: "Never before had the city seen such a flood.", fa: "شهر پیش‌تر هرگز چنین سیلی ندیده بود." },
      { en: "Little did they know that the biggest surprise was still ahead.", fa: "بی‌خبر بودند که بزرگ‌ترین غافلگیری هنوز در راه است." },
      { en: "Not only is he a brilliant engineer, but he is also a gifted musician.", fa: "او نه‌تنها مهندس درخشانی است، بلکه موسیقیدان بااستعدادی هم هست." },
      { en: "No sooner had the singer stepped on stage than the crowd cheered.", fa: "خواننده تازه پای صحنه گذاشته بود که جمعیت هورا کشید." },
      { en: "Had you told me earlier, I could have fixed it.", fa: "اگر زودتر گفته بودی، می‌توانستم درستش کنم." },
      { en: "Should you have any questions, feel free to call me.", fa: "اگر سوالی داشتید، راحت به من زنگ بزنید." },
      { en: "So exhausted were the runners that they collapsed at the finish line.", fa: "دونده‌ها چنان خسته بودند که در خط پایان از پا درآمدند." },
      { en: "Only after the meeting did I realize my mistake.", fa: "فقط بعد از جلسه متوجه اشتباهم شدم." },
    ],
    mistakes: [
      { wrong: "Never I have seen such a mess.", right: "Never have I seen such a mess.", note: "قید منفی در سرجمله، فعل کمکی را با خودش به قبل از فاعل می‌برد؛ ترتیب عادی جملهٔ خبری باقی نمی‌ماند." },
      { wrong: "No sooner we had arrived than it started.", right: "No sooner had we arrived than it started.", note: "بعد از No sooner حتماً وارونگی لازم است: had + فاعل + V3." },
      { wrong: "Not only she speaks English, but also French.", right: "Not only does she speak English, but she also speaks French.", note: "جملهٔ اولِ Not only وارونگی می‌خواهد؛ در حال ساده does وارد می‌شود و فعل ساده می‌ماند." },
      { wrong: "Had I known it, I would asked you.", right: "Had I known it, I would have asked you.", note: "حذف if فقط شکل جملهٔ شرطی را عوض می‌کند؛ نتیجه همچنان would have + V3 می‌خواهد." },
    ],
    tips: [
      "تشخیص سریع: هر قید منفی/محدودکننده‌ای که اول جمله نشست (never، rarely، not only، no sooner، little، only after...) → جامپِ کمکی به قبل از فاعل.",
      "برای تمرین ایمن، از وارونگی‌های قید منفی شروع کنید؛ سپس Not only و No sooner؛ و در آخر شرطی‌های بدون if که ادبی‌ترین‌اند.",
      "در جمله‌های زمان‌ساده (بدون کمکی)، do/does/did را فراموش نکنید و فعل را به شکل ساده برگردانید — Rarely does she smile، نه Rarely does she smiles.",
      "وارونگی را در نوشتار به‌عنوان «ادویه» به کار ببرید نه «غذا»: یکی‌دو بار در هر متن، جایی که واقعاً می‌خواهید بدرخشید.",
    ],
    quiz: [
      { question: "شکل وارونهٔ «I had never heard such nonsense» کدام است؟", options: ["Never I had heard such nonsense.", "Never had I heard such nonsense.", "Never did I heard such nonsense.", "Never I heard such nonsense."], correctIndex: 1, explanation: "Never سرجمله → had قبل از فاعل: Never had I heard." },
      { question: "«تازه پیام را باز کرده بودم که قطع برق شد» کدام است؟", options: ["No sooner I had opened the message than the power went out.", "No sooner had I opened the message than the power went out.", "No sooner did I open the message when the power went out.", "Hardly had I opened the message than the power went out."], correctIndex: 1, explanation: "No sooner + had + فاعل + V3 ... than." },
      { question: "معادل وارونهٔ «If I were you» کدام است؟", options: ["Were I you", "Was I you", "I were you", "Did I be you"], correctIndex: 0, explanation: "در شرطی دو، حذف if با جابه‌جایی were ممکن است: Were I you." },
      { question: "کدام جمله درست است؟", options: ["Not only he cooks, but he also cleans.", "Not only does he cook, but he also cleans.", "Not only does he cooks, but also he cleans.", "Not only he does cook, but he also cleans."], correctIndex: 1, explanation: "Not only + does + فاعل + فعل ساده؛ جملهٔ دوم با but also ساختار عادی دارد." },
      { question: "«فقط پس از سال‌ها تلاش موفق شد» کدام است؟", options: ["Only after years of trying he succeeded.", "Only after years of trying did he succeed.", "Only after years of trying he did succeed.", "Only he succeeded after years of trying."], correctIndex: 1, explanation: "Only after... در سرجمله وارونگی می‌طلبد: did + فاعل + فعل ساده." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-03",
    titleFa: "جملات شکافته",
    titleEn: "Cleft Sentences",
    cefr: "C1",
    intro:
      "جملهٔ شکافته، جراحی زیبای اطلاعات است: یک جملهٔ ساده را نصف می‌کنید و قطعه‌ای را که می‌خواهید بدرخشد، در قاب طلایی «It is... that...» یا «What... is...» می‌گذارید. Алиاز说话 واقعی: It was Sara who saved the project (سارا بود که پروژه را نجات داد) — به‌جای Sara saved the project. این ساختار به شما قدرت کنترل «فوکوس» را می‌دهد؛ همان چیزی که در استدلال، تأکید و روایتِ حرفه‌ای، مرز بین مبتدی و پیشرفته را مشخص می‌کند.",
    sections: [
      {
        title: "It-cleft: قاب طلایی برای هر قطعه جمله",
        paragraphs: [
          "ساختار پایه: It is/was + قطعهٔ برجسته + that/who + بقیهٔ جمله. قطعهٔ برجسته می‌تواند فاعل باشد: It was my father who paid for everything (نه من، پدرم بود!)؛ مفعول: It was this necklace that she wanted (چیزی که می‌خواست این گردنبند بود)؛ قید زمان: It was last summer that we met (درست تابستان پیش بود)؛ حتی حرف اضافه‌ای: It was in London that the idea was born. جملهٔ زیرین همان می‌ماند؛ فقط نورافکن روی یک کلمه می‌افتد.",
          "قدرت این ساختار در «تصحیح باور مخاطب» است. وقتی کسی می‌پرسد Was it Ali who broke the vase? جواب شما It wasn't Ali؛ it was the cat! دقیقاً با همین قاب ساخته می‌شود. در بحث و گفتگوی روزمره، It-cleft ابزار نفی‌واصلاح است: It's not that I don't care — it's that I can't help (این که نمی‌خواهم نیست؛ این است که نمی‌توانم). نویسندگان از این ساختار برای ریتم‌بخشی متن هم استفاده می‌کنند: شکستن الگو، خواننده را بیدار نگه می‌دارد.",
        ],
        examples: [
          { en: "It was the weather that ruined our trip.", fa: "چیزی که سفرمان را خراب کرد هوا بود." },
          { en: "It isn't the price that bothers me — it's the colour.", fa: "قیمت نیست که اذیتم می‌کند — رنگش است." },
        ],
      },
      {
        title: "What-cleft: قاب برای «چیزی که...»",
        paragraphs: [
          "ساختار دوم: What + بند + is/was + قطعهٔ برجسته. What I need is a long holiday — «چیزی که لازم دارم یک تعطیلات طولانی است». اینجا کل بندِ what I need نقش موضوع جمله را بازی می‌کند و بعد از is، چیزی که می‌خواهید بدرخشد می‌آید. این ساختار برای برجسته‌کردن مفعول و فعل فوق‌العاده است و در گفتار انگلیسی‌زبان‌ها فراوان است: What surprised me was his honesty / What she does is listen — فقط گوش می‌دهد.",
          "نکتهٔ دستوری ظریف: اگر قطعهٔ برجسته بعد از is «فعل» باشد، معمولاً به شکل مصدر با to یا gerund می‌آید: What you should do is (to) apologize — «کاری که باید بکنی این است که عذرخواهی کنی». این الگو (pseudo-cleft با فعل) برای نصیحت و راهنمایی بی‌نظیر است چون اول «کار» را به‌عنوان موضوع می‌آورد و بعد راه‌حل را مثل آبشار پایین می‌ریزد. مقایسه کنید با جملهٔ سادهٔ You should apologize که هیچ برجستگی ندارد.",
        ],
        examples: [
          { en: "What I love about this city is its energy.", fa: "چیزی که دربارهٔ این شهر دوست دارم انرژی‌اش است." },
          { en: "What we need to do is (to) wait and see.", fa: "کاری که باید بکنیم این است که منتظر بمانیم و ببینیم." },
        ],
      },
      {
        title: "سایر الگوهای شکافته: All و The reason و The place",
        paragraphs: [
          "خانوادهٔ cleft فقط دو عضو ندارد. All (that) برای «تنها چیز»: All I want is a quiet evening — تنها چیزی که می‌خواهم یک شب آرام است. The reason (why)... is برای «دلیل»: The reason I called was to invite you — دلیل زنگ زدنم دعوتت بود. The place where... is برای مکان و The day when... is برای زمان؛ و The thing (that)... is نسخهٔ عام‌تر what-cleft که در گفتار خیلی رایج است: The thing is, we can't afford it — ماجرا این است که پولش را نداریم.",
          "چرا این ساختارها این‌قدر مهم‌اند؟ چون زبان طبیعی، اطلاعات را «بی‌تفاوت» نمی‌چیند؛ دائماً دارد انتخاب می‌کند چه چیزی را جلو بگذارد. cleft ها دقیقاً همین انتخاب را گرامری می‌کنند. در مکالمهٔ روزمره از The thing is... برای شروع یک اعتراف یا نکتهٔ اصلی استفاده کنید؛ در نوشتار رسمی از It is... that برای تحلیل (It is precisely this gap that our study addresses — دقیقاً همین خلأ است که پژوهش ما به آن می‌پردازد). این جملهٔ اخیر، جادوی مقاله‌نویسی است: با یک cleft، جایگاه پژوهش خودتان را در ادبیات موضوع روشن می‌کنید.",
        ],
        examples: [
          { en: "All I did was tell the truth.", fa: "تنها کاری که کردم گفتن حقیقت بود." },
          { en: "The reason I'm late is that the metro broke down.", fa: "دلیل دیر کردم این است که مترو خراب شد." },
          { en: "The thing is, we've already tried that approach.", fa: "ماجرا این است که ما قبلاً آن روش را امتحان کرده‌ایم." },
        ],
      },
    ],
    rule:
      "It-cleft: It is/was + قطعهٔ برجسته (فاعل/مفعول/قید) + that/who + بقیه — It was Sara who called. What-cleft: What + بند + is/was + برجسته — What I need is time. با فعل در جای برجسته: What you should do is (to) apologize. الگوهای خویشاوند: All (that)... is / The reason (why)... is that / The place where... is / The thing (that)... is. کاربرد: تأکید، تصحیح باور مخاطب، برجسته‌سازی در نوشتار رسمی و مکالمه.",
    form: [
      { label: "It-cleft فاعل", pattern: "It was Ali who broke the vase." },
      { label: "It-cleft مفعول", pattern: "It was the necklace that she wanted." },
      { label: "It-cleft زمان/مکان", pattern: "It was in Shiraz that we met." },
      { label: "What-cleft", pattern: "What annoys me is the noise." },
      { label: "What-cleft با فعل", pattern: "What we did was (to) call the police." },
      { label: "خویشاوندان", pattern: "All I want is... · The reason... is that... · The thing is,..." },
    ],
    examples: [
      { en: "It was the bus driver who saved everyone's life.", fa: "رانندهٔ اتوبوس بود که جان همه را نجات داد." },
      { en: "It was only last week that she told me the truth.", fa: "همین هفتهٔ پیش بود که حقیقت را به من گفت." },
      { en: "What matters most is your health.", fa: "چیزی که بیشتر مهم است سلامتی توست." },
      { en: "What happened was that the server crashed.", fa: "اتفاق این بود که سرور از کار افتاد." },
      { en: "All she wants is a little attention.", fa: "تنها چیزی که می‌خواهد کمی توجه است." },
      { en: "The reason we lost is that we underestimated them.", fa: "دلیل باخت‌مان این بود که دست‌کمشان گرفتیم." },
      { en: "It isn't the money that makes him happy.", fa: "پول نیست که او را خوشحال می‌کند." },
      { en: "The thing I like about her is her patience.", fa: "چیزی که دربارهٔ او دوست دارم صبرش است." },
    ],
    mistakes: [
      { wrong: "It was Ali who he broke the vase.", right: "It was Ali who broke the vase.", note: "بعد از who دیگر فاعل تکراری نمی‌آید؛ who خودش فاعل بند دوم است." },
      { wrong: "What I need it is time.", right: "What I need is time.", note: "بندِ what خودش نقش فاعل جمله را دارد؛ it اضافی است." },
      { wrong: "The reason I left is because I was tired.", right: "The reason I left is that I was tired.", note: "در انگلیسی استاندارد، بعد از The reason... is از that استفاده می‌شود؛ because تکرارِ دلالی است (اگرچه در گفتار رایج است)." },
      { wrong: "It was in London when the idea was born.", right: "It was in London that the idea was born.", note: "در It-cleft حرف تعریفِ عمومی that است؛ who فقط برای آدم‌ها (یا that هم برای آدم‌ها)." },
    ],
    tips: [
      "قبل از ساختن cleft بپرسید: «کدام کلمه را می‌خواهم زیر نور ببینم؟» همان کلمه را بعد از It is/was بگذارید و باقی جمله را بعد از that بیاورید.",
      "برای برجسته‌کردن فعل یا مفعول، What-cleft طبیعی‌تر است؛ برای فاعل و قید زمان/مکان، It-cleft برنده است.",
      "در مکالمه، با The thing is,... نکتهٔ اصلی یا حرف دلهره‌آور را شروع کنید؛ این قالب، شنونده را برای شنیدن «قلب ماجرا» آماده می‌کند.",
      "cleft را برای تأکید واقعی نگه دارید؛ اگر هر جمله را شکافته کنید، اثرش مثل فریاد دائم، از بین می‌رود.",
    ],
    quiz: [
      { question: "«برادر من بود که ماشین را قرض گرفت» کدام است؟", options: ["It was my brother who borrowed the car.", "It was my brother who he borrowed the car.", "It was my brother that borrowed it the car.", "My brother it was borrowed the car."], correctIndex: 0, explanation: "It-cleft: It was + فاعل برجسته + who + فعل (بدون فاعل تکراری)." },
      { question: "«چیزی که او را عصبانی کرد تأخیر من بود» کدام است؟", options: ["It was my delay what made him angry.", "What made him angry was my delay.", "What made him angry it was my delay.", "That made him angry was my delay."], correctIndex: 1, explanation: "What-cleft: What + بند + was + قطعهٔ برجسته." },
      { question: "«تنها کاری که کردم صداقت بود» کدام است؟", options: ["All what I did was honest.", "All I did was tell the truth.", "All I did it was tell the truth.", "What all I did was tell truth."], correctIndex: 1, explanation: "All (that) I did + was + فعل: All I did was tell the truth." },
      { question: "کدام جمله «تصحیح باور مخاطب» را انجام می‌دهد؟", options: ["Sara paid the bill.", "It was Sara who paid the bill.", "The bill was paid by Sara.", "Sara, who paid the bill, left."], correctIndex: 1, explanation: "It-cleave با تأکید روی Sara دقیقاً برای این ساخته شده که بگوید «Sara بود، نه کس دیگر»." },
      { question: "در کدام جمله «زمان» برجسته شده است؟", options: ["It was yesterday that she called.", "It was she who called yesterday.", "What she did was call.", "All she did was call."], correctIndex: 0, explanation: "در It was yesterday that... قطعهٔ زمانی بعد از It is/was نشسته و برجسته است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-04",
    titleFa: "وجهی‌های استنباطی",
    titleEn: "Modals of Deduction",
    cefr: "C1",
    intro:
      "زبان پیشرفته، زبانِ «درجات اطمینان» است: بین «مطمئنم»، «احتمالاً»، «شاید» و «قطعاً نمی‌تواند باشد»، طیفی از اطمینان وجود دارد که انگلیسی آن را با وجهی‌های استنباطی بیان می‌کند. must be، might be، can't be — هر کدام یک قدم روی نردبان یقین‌اند. تسلط بر این طیف یعنی می‌توانید مثل یک کارآگاه فکر کنید و مثل یک بومی حرف بزنید: دربارهٔ چیزهایی که ندیده‌اید اما از شواهد می‌فهمید.",
    sections: [
      {
        title: "نردبان اطمینان در زمان حال",
        paragraphs: [
          "برای حدس دربارهٔ «الان»، چهار پلهٔ اصلی داریم. must (۹۰٪+ اطمینان): He must be at work — ماشینش جلوی دفتر است، پس حتماً سر کار است. may / might / could (حدود ۵۰٪ یا کمتر): She might be stuck in traffic — شاید در ترافیک گیر افتاده. can't (اطمینان از عدم — نه قوت شک، قوت نفی): It can't be true — منطقاً محال است. توجه کنید که برای «قطعاً نیست» انگلیسی mustn't نمی‌گوید؛ mustn't ممنوعیت است! نفیِ must در حدس، can't است.",
          "منطق این نردبان از دنیای شواهد می‌آید: هر چه شواهد بیشتر و هماهنگ‌تر، بالا می‌رویم به must؛ هر چه مبهم‌تر و جای تردید بیشتر، پایین می‌آییم به might. جالب است بدانید در انگلیسی محاوره، would و will هم به این خانواده اضافه می‌شوند: That would be the postman (فکر کنم او باشد — مؤدبانه‌تر از must) و That'll be the train (حدس مطمئنِ روزمره). پس در عمل، طیف کامل این است: must (همه‌چیز می‌گوید بله) → should/will (به احتمال زیاد) → may/might/could (شاید) → can't (همه‌چیز می‌گوید نه).",
        ],
        examples: [
          { en: "The lights are on — they must be at home.", fa: "چراغ‌ها روشن است — حتماً خانه هستند." },
          { en: "She might be in the garden, I'm not sure.", fa: "شاید در باغ باشد، مطمئن نیستم." },
          { en: "That can't be his car; his is red.", fa: "این نمی‌تواند ماشین او باشد؛ ماشین او قرمز است." },
        ],
      },
      {
        title: "استنباط در گذشته: must have + V3",
        paragraphs: [
          "برای حدس دربارهٔ گذشته، have + قسمت سوم اضافه می‌شود: must have + V3 (قطعاً کرده)، might/could have + V3 (شاید کرده)، can't have + V3 (قطعاً نکرده). The road is wet — it must have rained last night: خیابان خیس است، پس دیشب قطعاً باران آمده. She can't have seen us — we were behind the wall: ما پشت دیوار بودیم، پس قطعاً ما را ندیده. این ساختار، همتای گذشتهٔ همان نردبان است.",
          "باید دقت کنید که استنباطِ گذشته با «عذرخواهی و ندامت» فرق دارد. must have left یعنی «قطعاً رفته» (حدس از شواهد)؛ اما should have left یعنی «بهتر بود می‌رفتم» (ندامت). دو دنیای متفاوت که ظاهرشان شبیه است! تست تشخیص: اگر جمله شاهد و مدرک دارد → استنباط (must/might/can't have)؛ اگر حسرت و نقد خود → should have. در مکالمهٔ کارآگاهی و تحلیلی، استنباطِ گذشته فرمانرواست: The suspect must have used the back door، the documents can't have disappeared!",
        ],
        examples: [
          { en: "It must have rained — the streets are wet.", fa: "قطعاً باران آمده — خیابان‌ها خیس‌اند." },
          { en: "He might have missed the bus.", fa: "شاید اتوبوس را از دست داده باشد." },
          { en: "She can't have finished already!", fa: "نمی‌تواند همین الان تمام کرده باشد!" },
        ],
      },
      {
        title: "سبک‌سازی حدس: کمتر قطعی صحبت کردن",
        paragraphs:
          [
          "در انگلیسیِ حرفه‌ای و محترمانه، اطمینانِ مطلق کمتر به‌کار می‌رود — حتی وقتی مطمئنید! به‌جای He is French می‌گویند He would seem to be French یا I would imagine he's French. این «hedges» (نرم‌کننده‌ها) در محیط‌های علمی و اداری حیاتی‌اند: The results would suggest... (نتایج می‌گویند...) به‌جای The results prove... . وجهی‌های استنباطی، اعضای اصلی این خانوادهٔ نرم‌سازی‌اند و انتخاب درست پلهٔ نردبان، نشانهٔ بلوغ زبانی شماست.",
          "برای تمرین این تفکر کارآگاهانه، بازی «چه اتفاقی افتاده؟» را هر روز با یک عکس یا خبر انجام دهید: از شواهد شروع کنید (the window is broken) و با نردبان حدس بزنید (someone must have broken in؛ the thief might have worn gloves؛ it can't have happened long ago — glass is fresh!). این تمرین نه‌فقط گرامر، بلکه «ذهنیتِ استنباطی» زبان انگلیسی را در شما می‌سازد؛ ذهنیتی که در بحث، تحلیل خبر و حتی مصاحبهٔ شغلی، پاسخ‌های شما را هوشمندانه و سنجیده نشان می‌دهد.",
        ],
        examples: [
          { en: "I would imagine the meeting went well.", fa: "تصور می‌کنم جلسه خوب پیش رفته باشد. (نرم)" },
          { en: "The data would suggest a strong correlation.", fa: "داده‌ها همبستگی قوی را نشان می‌دهند. (علمی)" },
        ],
      },
    ],
    rule:
      "نردبان اطمینان حال: must be (۹۰٪+ اطمینان) → may/might/could be (شاید) → can't be (قطعاً نیست — نفیِ حدسِ must). نفیِ استنباطی can't است نه mustn't. گذشته: must/might/could/can't + have + V3 — must have rained (قطعاً باران آمده). تفاوت کلیدی: should have + V3 = ندامت (بهتر بود)؛ must have + V3 = استنباط (قطعاً این‌طور بوده). سبک علمی/رسمی: would seem to be / would suggest / I would imagine.",
    form: [
      { label: "اطمینان بالا (حال)", pattern: "must be / must know — He must be tired." },
      { label: "احتمال (حال)", pattern: "might be / may be / could be — She might be busy." },
      { label: "نفی قطعی (حال)", pattern: "can't be — It can't be true!" },
      { label: "اطمینان بالا (گذشته)", pattern: "must have + V3 — She must have left." },
      { label: "احتمال (گذشته)", pattern: "might/could have + V3 — He might have forgotten." },
      { label: "نفی قطعی (گذشته)", pattern: "can't have + V3 — They can't have seen us." },
    ],
    examples: [
      { en: "You must be exhausted after that long walk.", fa: "بعد از آن پیاده‌روی طولانی حتماً خسته‌ای." },
      { en: "He might know the answer — why don't you ask him?", fa: "شاید جواب را بداند — چرا از او نمی‌پرسی؟" },
      { en: "That can't be Sara — she's abroad this week.", fa: "این نمی‌تواند سارا باشد — این هفته خارج است." },
      { en: "The cake must have been delicious — nothing is left!", fa: "کیف قطعاً خوشمزه بوده — هیچ‌چیزش نمانده!" },
      { en: "They might have taken the wrong train.", fa: "شاید قطار اشتباهی سوار شده باشند." },
      { en: "You can't have met him before — he's new here.", fa: "نمی‌تواند قبلاً او را دیده باشی — تازه آمده." },
      { en: "She couldn't have heard us from that distance.", fa: "از آن فاصله نمی‌توانسته ما را بشنود." },
      { en: "There's no light — they must have gone to bed.", fa: "چراغی نیست — قطعاً رفته‌اند بخوابند." },
    ],
    mistakes: [
      { wrong: "He mustn't be at home; the lights are off.", right: "He can't be at home; the lights are off.", note: "برای «قطعاً نیست» از can't استفاده کنید؛ mustn't ممنوعیت است نه نفیِ حدس." },
      { wrong: "She must had left already.", right: "She must have left already.", note: "بعد از وجهی همیشه have + قسمت سوم می‌آید؛ had در این ساختار جایی ندارد." },
      { wrong: "He must be finished the report yesterday.", right: "He must have finished the report yesterday.", note: "استنباط دربارهٔ گذشته: must + have + V3." },
      { wrong: "They might not have saw us.", right: "They might not have seen us.", note: "بعد از have شکل سوم فعل می‌آید: seen، نه saw." },
    ],
    tips: [
      "قبل از انتخاب وجهی، «میزان شواهد» را بسنجید: شواهد قوی و هم‌جهت → must؛ شواهد مبهم → might؛ شواهد نقض‌کننده → can't.",
      "قاعدهٔ نجات‌بخش نفی: در دنیای حدس، نقیضِ must همیشه can't است — mustn't اصلاً عضو این خانواده نیست.",
      "جفت تله‌دار گذشته را جدا کنید: حدس (must have seen — قطعاً دیده) ≠ ندامت (should have seen — بهتر بود می‌دیدم).",
      "در ایمیل و گزارش رسمی، حدس‌هایتان را با would seem / would suggest نرم کنید؛ این سبک در فرهنگ حرفه‌ای انگلیسی، علامت ادب و دقت است.",
    ],
    quiz: [
      { question: "«خیابان خیس است؛ قطعاً باران آمده» کدام است؟", options: ["It must rain.", "It must have rained.", "It should have rained.", "It can't have rained."], correctIndex: 1, explanation: "استنباط دربارهٔ گذشته: must + have + V3." },
      { question: "«این نمی‌تواند درست باشد!» کدام است؟", options: ["It mustn't be true.", "It can't be true.", "It shouldn't be true.", "It may not be true."], correctIndex: 1, explanation: "نفیِ استنباطِ مطمئن با can't بیان می‌شود." },
      { question: "«شاید کلیدهایش را گم کرده باشد» کدام است؟", options: ["He must have lost his keys.", "He might have lost his keys.", "He should have lost his keys.", "He can't have lost his keys."], correctIndex: 1, explanation: "احتمال در گذشته: might + have + V3." },
      { question: "تفاوت «must have left» و «should have left» چیست؟", options: ["هیچ", "اولی حدس قطعی است، دومی ابراز پشیمانی", "اولی غلط است", "دومی رسمی‌تر است"], correctIndex: 1, explanation: "must have = استنباط از شواهد؛ should have = ندامت و نقد (بهتر بود می‌رفتم)." },
      { question: "در سبک علمی، کدام جمله «نرم‌ترین» است؟", options: ["The data prove the theory.", "The data must prove the theory.", "The data would suggest support for the theory.", "The data can't be wrong."], correctIndex: 2, explanation: "would suggest نرم‌کنندهٔ استاندارد متون علمی است؛ اطمینان مطلق در این سبک ممنوع است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-05",
    titleFa: "عبارات قیدی",
    titleEn: "Participle Clauses",
    cefr: "C1",
    intro:
      "عبارات قیدی، موتور فشرده‌سازی جمله در انگلیسیِ پیشرفته‌اند: با یک فعل ing یا V3، یک جملهٔ کامل را به یک عبارت چابک تبدیل می‌کنید — Feeling tired, she went to bed به‌جای She felt tired, so she went to bed. این ساختار، نوشتار شما را جمع‌وجور، شیک و حرفه‌ای می‌کند و در متون علمی، ادبی و روزنامه‌نگاری فرمان می‌راند. در عین حال، یکی از پرتله‌ترین ساختارهاست؛ این درس، تله‌ها را با منطق روشن نشان می‌دهد.",
    sections: [
      {
        title: "قیدی حال (ing): هم‌زمانی و علت",
        paragraphs: [
          "وقتی دو اتفاق هم‌زمان‌اند یا یکی «علت» دیگری است و فاعل هر دو یکی است، جملهٔ دوم را به شکل فعل + ing در می‌آورید و به اول می‌چسبانید: Walking down the street، he saw an old friend (در حالی که در خیابان قدم می‌زد...). حس این ساختار «هم‌پیوندیِ روان» است: به‌جای دو جملهٔ مستقل با نقطه، یک موج پیوسته. علت هم همین‌طور: Not knowing the answer، he stayed silent — چون جواب را نمی‌دانست، ساکت ماند (نه اینکه ندانستن، هم‌زمان با سکوت بود).",
          "شرط طلایی این ساختار «فاعل مشترک» است: فاعلِ عبارت قیدی باید همان فاعلِ جملهٔ اصلی باشد. جملهٔ Walking down the street, a friend appeared نادرست است چون کسی که قدم می‌زده باید he باشد نه a friend — این خطا به «dangling participle» معروف است و حتی بومی‌ها هم گاهی مرتکبش می‌شوند! قبل از نوشتن عبارت قیدی، بپرسید: «چه کسی این کار را می‌کند؟» و مطمئن شوید همان کس، فاعل اصلی جمله است.",
        ],
        examples: [
          { en: "Feeling tired, she went to bed early.", fa: "چون خسته بود، زود به رختخواب رفت." },
          { en: "Not knowing the way, I asked for directions.", fa: "چون راه را نمی‌دانستم، آدرس پرسیدم." },
          { en: "Walking home, I met an old friend.", fa: "در حال بازگشت به خانه، دوست قدیمی‌ای را دیدم." },
        ],
      },
      {
        title: "قیدی مفعولی (V3) و کامل (having + V3)",
        paragraphs: [
          "وقتی معنای عبارت «مفعولی/منفی» است (کار روی فاعل انجام شده)، از قسمت سوم فعل استفاده می‌شود: Built in 1920, the theatre still hosts concerts — تئاتری که در ۱۹۲۰ ساخته شد، هنوز میزبان کنسرت‌هاست. این ساختار جمع‌وجورترین شکل جملهٔ موصولی است: به‌جای The theatre, which was built in 1920, ... فقط Built in 1920, the theatre... . در متون علمی و توصیفی، این فشرده‌سازی طلاست: Confronted with the evidence, the minister resigned.",
          "برای تأکید بر «قبل بودن» یک اتفاق نسبت به جملهٔ اصلی، having + V3 می‌آید: Having finished the report, she left the office — بعد از اینکه گزارش را تمام کرد (و این تمام‌کردن مقدم بر رفتن بود) از دفتر رفت. فرق ظریفش با شکل ساده: Finishing the report, she left هم درست است اما ترتیب زمانی را مشخص نمی‌کند؛ ساختارِ having را برجسته می‌کند. نسخهٔ مفعولیِ قبل‌بودن: Having been warned twice, he was careful — بعد از آنکه دو بار اخطار گرفته بود (کار روی او انجام شده).",
        ],
        examples: [
          { en: "Built in 1920, the theatre still hosts concerts.", fa: "ساخته‌شده در ۱۹۲۰، تئاتر هنوز میزبان کنسرت است." },
          { en: "Having missed the bus, I walked home.", fa: "بعد از اینکه اتوبوس را از دست دادم، پیاده به خانه رفتم." },
          { en: "Having been nominated three times, she finally won.", fa: "بعد از سه بار نامزدی، بالاخره برنده شد." },
        ],
      },
      {
        title: "کاربردهای ویژه: after/before/while + ing و قیدی همراه",
        paragraphs: [
          "عبارات قیدی می‌توانند بعد از حرف اضافه‌های زمانی بیایند و فاعل و فعل کمکی را حذف کنند: After finishing dinner, we watched a film (به‌جای After we finished...). Before going to bed, brush your teeth. While waiting for the bus, I read a book. قاعده ساده است: وقتی فاعل هر دو نیمه یکی است، بعد از after/before/while/when فقط ing می‌آید. این الگو در دستورالعمل‌ها و روایت‌ها فوق‌العاده پرمصرف است.",
          "قیدی همراه (accompanying participle) برای «هم‌زمانی دو کار یک فاعل» می‌آید و معمولاً با کاما از فعل جدا می‌شود: She sat by the window, reading her book — کنار پنجره نشسته بود و کتابش را می‌خواند. The children ran along the beach, laughing and shouting. این ساختار به روایت شما «نفس» می‌دهد: به‌جای زنجیره‌ی and...and...and، صحنه‌ای زنده با پس‌زمینهٔ صوتی و بصری می‌سازد. نویسندگان داستان از آن برای توصیف فضا و خبرنگاران برای جمع‌بندی صحنه استفاده می‌کنند: The President left the podium, smiling confidently.",
        ],
        examples: [
          { en: "After finishing dinner, we watched a film.", fa: "بعد از شام، فیلم دیدیم." },
          { en: "She sat by the window, reading her book.", fa: "کنار پنجره نشسته بود و کتاب می‌خواند." },
          { en: "The The children ran along the beach, laughing and shouting.", fa: "بچه‌ها در ساحل می‌دویدند و می‌خندیدند و فریاد می‌زدند." },
        ],
      },
    ],
    rule:
      "عبارت قیدی = فشرده‌سازی جمله با فعل ing (فعال) یا V3 (مفعولی) یا having + V3 (قبلی). شرط حیاتی: فاعل مشترک با جملهٔ اصلی — وگرنه dangling می‌شود. کاربرد: هم‌زمانی (Walking home, I...)، علت (Not knowing..., he...)، توصیف (Built in 1920, the theatre...)، قبل‌بودن (Having finished..., she...). بعد از after/before/while + ing: After finishing dinner... . قیدی همراه با کاما: She sat there, reading.",
    form: [
      { label: "فعال هم‌زمان", pattern: "Walking home, I met Ali. (= While I was walking...)" },
      { label: "فعال علت", pattern: "Not knowing the answer, he stayed silent." },
      { label: "مفعولی", pattern: "Built in 1920, the theatre... (= which was built...)" },
      { label: "قبلی فعال", pattern: "Having missed the bus, I walked." },
      { label: "قبلی مفعولی", pattern: "Having been warned, he was careful." },
      { label: "حرف اضافه + ing", pattern: "After finishing dinner / Before going to bed" },
    ],
    examples: [
      { en: "Being allergic to cats, she never visits us.", fa: "چون به گربه‌ها حساسیت دارد، هرگز به دیدنمان نمی‌آید." },
      { en: "Written in simple language, the book became a bestseller.", fa: "نوشته‌شده به زبان ساده، کتاب پرفروش شد." },
      { en: "Having lived abroad for years, he speaks perfect English.", fa: "چون سال‌ها خارج زندگی کرده، روان انگلیسی صحبت می‌کند." },
      { en: "Exhausted by the journey, we fell asleep immediately.", fa: "از سفر خسته شده بودیم که فوراً خوابیم برد." },
      { en: "While waiting for the results, she paced the room.", fa: "در حالی که منتظر نتایج بود، در اتاق رفت‌وآمد می‌کرد." },
      { en: "The stolen paintings were recovered by the police.", fa: "نقاشی‌های سرقت‌شده توسط پلیس بازیابی شدند. (صفت قیدی)" },
      { en: "Not wanting to disturb them, I left quietly.", fa: "چون نمی‌خواستم مزاحمشان شوم، بی‌سروصدا رفتم." },
      { en: "He opened the letter, his hands trembling slightly.", fa: "نامه را باز کرد در حالی که دستانش کمی می‌لرزید." },
    ],
    mistakes: [
      { wrong: "Walking down the street, a friend appeared.", right: "Walking down the street, I saw a friend.", note: "dangling participle: قدم‌زننده باید فاعل جملهٔ اصلی باشد؛ a friend که قدم نمی‌زده!" },
      { wrong: "Having finished the work, the TV was watched.", right: "Having finished the work, we watched TV.", note: "فاعل مشترک لازم است: کار را ما تمام کردیم و ما تلویزیون دیدیم." },
      { wrong: "Being a rainy day, we stayed home.", right: "It being a rainy day, we stayed home.", note: "فاعل عبارت (day) با فاعل جمله (we) یکی نیست؛ در انگلیسی قدیمی It being... راه‌حل این حالت است — یا به‌سادگی بنویسید As it was a rainy day..." },
      { wrong: "After finish the homework, he slept.", right: "After finishing the homework, he slept.", note: "بعد از after/before/while فعل همیشه ing می‌گیرد؛ شکل ساده ممنوع است." },
    ],
    tips: [
      "قبل از نوشتن، فاعل را چک کنید: «چه کسی کارِ عبارت را انجام می‌دهد؟» — همان باید بلافاصله بعد از کاما بیاید و فاعل جملهٔ اصلی باشد.",
      "برای فشرده‌کردن جمله‌های موصولی (which is/which was...)، V3 جایگزین کنید: Known for his honesty, Ali... — این الگو، امضای نوشتار رسمی است.",
      "having + V3 را برای «علتِ مقدم» نگه دارید؛ اگر ترتیب مهم نیست، شکل سادهٔ ing سبک‌تر است.",
      "در روایت داستانی، قیدی همراه با کاما (..., laughing) صحنه‌تان را زنده می‌کند؛ در هر پاراگراف یکی، نه بیشتر.",
    ],
    quiz: [
      { question: "«چون جواب را نمی‌دانست، ساکت ماند» کدام است؟", options: ["Not knowing the answer, he stayed silent.", "Not know the answer, he stayed silent.", "Not known the answer, he stayed silent.", "He not knowing the answer, stayed silent."], correctIndex: 0, explanation: "قیدی فعالِ منفی: Not + ing + کاما + فاعل مشترک." },
      { question: "«نوشته‌شده در ۱۹۵۴، رمان جایزه گرفت» کدام است؟", options: ["Writing in 1954, the novel won a prize.", "Written in 1954, the novel won a prize.", "Having written in 1954, the novel won a prize.", "To write in 1954, the novel won a prize."], correctIndex: 1, explanation: "رمان «نوشته شده» است (مفعولی) → V3: Written in 1954." },
      { question: "کدام جمله dangling participle دارد (غلط است)؟", options: ["Walking home, I saw a fox.", "Reading the letter, her eyes filled with tears.", "Having eaten, we left.", "Built last year, the mall is huge."], correctIndex: 1, explanation: "خوانندهٔ نامه باید «او» باشد نه «چشم‌هایش»؛ فاعل عبارت با فاعل جمله یکی نیست." },
      { question: "«بعد از تمام‌کردن تکلیف، بازی کرد» کدام است؟", options: ["After finish homework, he played.", "After finishing homework, he played.", "After to finish homework, he played.", "After finished homework, he played."], correctIndex: 1, explanation: "بعد از after فعل ing می‌گیرد: After finishing." },
      { question: "معادل فشردهٔ «Because he had missed the bus, he walked home» کدام است؟", options: ["Missing the bus, he walked home.", "Having missed the bus, he walked home.", "Missed the bus, he walked home.", "He having missed the bus, walked home."], correctIndex: 1, explanation: "علتِ مقدم (قبل از راه‌رفتن رخ داده) → Having + V3." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-06",
    titleFa: "وجه التزامی",
    titleEn: "Subjunctive",
    cefr: "C2",
    intro:
      "وجه التزامی، حالتِ «خواسته، پیشنهاد و فرض محض» است — جایی که واقعیت کنار می‌نشیند و اراده و آرزو جایگزینش می‌شود. در انگلیسی مدرن، این ساختار عمدتاً بعد از فعل‌ها و صفاتِ «تأثیرگذاری» ظاهر می‌شود: suggest، recommend، insist، demand، essential، vital... . جملهٔ I suggest that he go (بدون s!) شاید عجیب به نظر برسد، اما همین «عریان بودن فعل» امضای این حالت باستانی است که در نوشتار رسمی آمریکایی زنده و پرقدرت ایستاده است.",
    sections: [
      {
        title: "التزامی تأثیرگذاری: فعل برهنه بعد از suggest",
        paragraphs: [
          "بعد از گروهی از فعل‌ها که «نفوذ و اثرگذاری» دارند — suggest، recommend، insist، demand، require، request، propose، urge — اگر جملهٔ بعدی that بیاورد، فعل آن به «شکل سادهٔ برهنه» درمی‌آید: بدون s سوم‌شخص، بدون will، بدون ing. I suggest that she see a specialist (نه sees!). They insisted that he be present (نه is یا was!). It is essential that everyone arrive on time (نه arrives). این شکل برهانه، نشانهٔ «وجه التزامی» است — حالتی که واقعیت را گزارش نمی‌کند بلکه «آنچه باید باشد» را می‌خواهد.",
          "چرا شکل فعل این‌قدر قدیمی به‌نظر می‌رسد؟ چون هست! این ساختار بازماندهٔ مستقیم انگلیسیِ چندصدساله است که خوشبختانه در انگلیسی رسمی آمریکایی زنده ماند (بریتانیایی‌ها بیشتر با should می‌سازند: I suggest that he should see...). برای زبان‌آموز، دو نکتهٔ طلایی: اول، بعد از این فعل‌ها در جملهٔ منفی، not مستقیم قبل از فعل برهنه می‌آید: We recommend that he not travel alone. دوم، در گفتار روزمرهٔ آمریکایی، این ساختار محدود اما پرقدرت است — در متن‌های حقوقی، مصوبات، و ایمیل‌های اداری جدی فراوان است و بومی‌ها در این بافت‌ها دقیقاً همین شکل برهانه را به‌کار می‌برند.",
        ],
        examples: [
          { en: "The doctor suggested that he take a rest.", fa: "دکتر پیشنهاد کرد استراحت کند. (نه takes)" },
          { en: "They insisted that she be at the meeting.", fa: "اصرار کردند که در جلسه حضور داشته باشد. (نه is)" },
          { en: "It is vital that everyone arrive on time.", fa: "حیاتی است که همه سر وقت برسند. (نه arrives)" },
        ],
      },
      {
        title: "التزامی بعد از صفات و اسم‌ها: essential، importance",
        paragraphs: [
          "خانوادهٔ دومی که التزامی می‌خواهد، صفات و اسم‌های «ضرورت و اهمیت»‌اند: It is essential/vital/crucial/imperative that... + فعل برهنه؛ the importance/necessity of... . It is imperative that the report be submitted by Friday — ضروری است که گزارش تا جمعه ارائه شود (نه is submitted). This contract stipulates that payment be made in dollars — قرارداد تصریح می‌کند که پرداخت به دلار انجام شود. در متن‌های حقوقی و فنی، این ساختار ستون فقرات «شرط و ضابطه»هاست.",
          "چرا نوشتار رسمی عاشق این ساختار است؟ چون التزامی، فاصلهٔ «امر با ادب» را ایجاد می‌کند: به‌جای دستور مستقیم (Submit the report!) می‌گوید It is imperative that the report be submitted... — دستور هست اما با پوستهٔ ادبی. برای فارسی‌زبان این لحن آشناست: «ضروری است که...». هر جا در فارسی رسمی می‌گویید «ضروری است که فلان کار صورت گیرد»، در انگلیسیِ حرفه‌ای دقیقاً همین ساختار التزامی را می‌بینید.",
        ],
        examples: [
          { en: "It is crucial that the patient not be moved.", fa: "حیاتی است که بیمار جابه‌جا نشود. (not + be)" },
          { en: "The rule requires that each member sign the form.", fa: "قانون ایجاب می‌کند هر عضو فرم را امضا کند." },
        ],
      },
      {
        title: "التزامی شرطی و آرزویی: If I were و God forbid",
        paragraphs: [
          "صورت دیگر التزامی، در «فرض خلاف واقع» است که قبلاً دیده‌اید: If I were you (نه was)، I wish it were Friday، as though she were floating. این were برای همهٔ اشخاص، بازماندهٔ زمان التزامی است. در انگلیسی ادبی قدیمی، ساختار کامل‌تری هم داشتیم (If he were to arrive tomorrow... ) که هنوز در نوشتار رسمی برای «احتمال دور» به‌کار می‌رود: If he were to win the lottery، everything would change — اگر روزی ببرد (که بعید است)، همه‌چیز عوض می‌شود.",
          "بقایای التزامی در عبارت‌های ثابت هم زنده‌اند: God forbid! (خدا نکند!)، Heaven forbid، come what may (هر چه شود)، be that as it may (هر طور که باشد)، suffice it to say (همین قدر بس که بگویم)، far be it from me (دور از من است که...). این عبارت‌ها رنگ ادبی و گاهی طنزآمیز دارند و در مکالمهٔ تحصیل‌کرده‌ها شنیده می‌شوند. برای سطح C1، شناختن این بقایا لازم است؛ استفادهٔ درست از دو سه‌تای آن‌ها (مثل be that as it may) در گفتار، نشان‌دهندهٔ تسلط فرهنگی-زبانی شماست.",
        ],
        examples: [
          { en: "If he were to apologize, would you forgive him?", fa: "اگر روزی عذرخواهی کند، می‌بخشیش؟ (احتمال دور)" },
          { en: "Be that as it may, we still have a deadline.", fa: "هر طور که باشد، ما همچنان ضرب‌الاجل داریم." },
          { en: "She acts as if she were the manager.", fa: "طوری رفتار می‌کند که انگار مدیر است." },
        ],
      },
    ],
    rule:
      "التزامی تأثیرگذاری: بعد از suggest/recommend/insist/demand/require/urge + that → فعل برهانه (بدون s، بدون will): I suggest that he go · They insisted that she be. منفی: that he not travel. التزامی صفات ضرورت: It is essential/vital/imperative that + فعل برهانه. التزامی فرضی: If I were... / I wish it were... / as if she were... / If he were to... . عبارت‌های ثابت: God forbid · be that as it may · come what may · suffice it to say.",
    form: [
      { label: "پیشنهاد/اصرار", pattern: "suggest/insist + that + فعل برهانه — She insisted that he stay." },
      { label: "ضرورت", pattern: "It is essential that + فعل برهانه — ...that everyone be informed." },
      { label: "منفی التزامی", pattern: "We asked that he not be disturbed." },
      { label: "فرض خلاف واقع", pattern: "If I were... / as though it were..." },
      { label: "احتمال دور", pattern: "If she were to find out, she would be furious." },
      { label: "عبارت ثابت", pattern: "Be that as it may, ... · God forbid!" },
    ],
    examples: [
      { en: "I recommend that she see a lawyer immediately.", fa: "توصیه می‌کنم فوراً وکیل ببیند. (نه sees)" },
      { en: "The committee demanded that the file be reviewed.", fa: "کمیته خواستار بررسی پرونده شد. (نه was)" },
      { en: "It is important that he not know about the surprise.", fa: "مهم است که او از غافلگیری خبر نداشته باشد. (not + know)" },
      { en: "Her lawyer insisted that the contract be rewritten.", fa: "وکیلش اصرار کرد قرارداد بازنویسی شود." },
      { en: "I wish it were the weekend.", fa: "کاش آخر هفته بود." },
      { en: "He speaks as if he were the owner of the place.", fa: "طوری حرف می‌زند انگار مالِ این‌جاست." },
      { en: "If she were to change her mind, we'd be in trouble.", fa: "اگر روزی نظرش را عوض کند، به دردسر می‌افتیم." },
      { en: "Suffice it to say, the plan failed spectacularly.", fa: "همین‌قدر بس که برنامه با شکست عجیبی مواجه شد." },
    ],
    mistakes: [
      { wrong: "I suggest that he goes home.", right: "I suggest that he go home.", note: "در وجه التزامی، فعل به شکل برهانه می‌آید: go بدون s — هرچند در گفتار غیررسمی goes هم شنیده می‌شود، در نوشتار رسمی go درست است." },
      { wrong: "It is essential that she is present.", right: "It is essential that she be present.", note: "بعد از صفات ضرورت + that، فعل be برهانه (نه is) می‌آید." },
      { wrong: "We asked that he does not disturb us.", right: "We asked that he not disturb us.", note: "منفی التزامی بدون does: not مستقیماً قبل از فعل برهانه می‌نشیند." },
      { wrong: "He talks as if he is the boss.", right: "He talks as if he were the boss.", note: "در مقایسهٔ خلاف واقع با as if، از were التزامی استفاده می‌شود (در گفتار غیررسمی was شنیده می‌شود اما were استاندارد است)." },
    ],
    tips: [
      "علامت هشدار: هر وقت after suggest/recommend/insist/essential + that دیدید، آنتن التزامی بگذارید و فعل را برهانه (پایهٔ فرهنگ لغت) بنویسید.",
      "قاعدهٔ s: در این ساختار هرگز s سوم‌شخص و هیچ will نمی‌آید — فعل سادهٔ لغت‌نامه‌ای، همین!",
      "نسخهٔ بریتانیایی را بشناسید: should + فعل (I suggest that he should go) — معادل مجاز و رایج در بریتانیا؛ اما در انگلیسی آمریکایی رسمی، فعل برهانه استاندارد است.",
      "عبارت‌های ثابت ادبی (be that as it may / come what may) را با معنی و یک مثال صوتی در حافظه‌تان نگه دارید؛ در مکالمهٔ سطح بالا، این‌ها جواهرند.",
    ],
    quiz: [
      { question: "کدام جمله وجه التزامی درست دارد؟", options: ["I suggest that she takes a break.", "I suggest that she take a break.", "I suggest that she taking a break.", "I suggest that she to take a break."], correctIndex: 1, explanation: "بعد از suggest + that، فعل برهانه بدون s: take." },
      { question: "«ضروری است که همه حاضر باشند» کدام است؟", options: ["It is essential that everyone is present.", "It is essential that everyone be present.", "It is essential that everyone being present.", "It is essential that everyone will be present."], correctIndex: 1, explanation: "التزامی بعد از essential: that + everyone + be." },
      { question: "شکل منفی التزامی «او سفر نکند» کدام است؟", options: ["We demanded that he doesn't travel.", "We demanded that he not travel.", "We demanded that he not travels.", "We demanded that he no travel."], correctIndex: 1, explanation: "منفی التزامی: that + he + not + فعل برهانه (not travel)." },
      { question: "«طوری حرف می‌زند انگار او رئیس است» کدام است؟", options: ["He speaks as if he is the boss.", "He speaks as if he were the boss.", "He speaks as if he be the boss.", "He speaks like he will be the boss."], correctIndex: 1, explanation: "مقایسهٔ خلاف واقع با as if + were (التزامی)." },
      { question: "«هر طور که باشد، هزینه‌ها بالاست» کدام است؟", options: ["Come what may, the costs are high.", "Be that as it may, the costs are high.", "God forbid, the costs are high.", "Suffice it to say may, the costs are high."], correctIndex: 1, explanation: "be that as it may = هر طور که باشد؛ عبارت التزامی ثابت برای اذعان به نکتهٔ مقابل." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-07",
    titleFa: "حذف و جانشینی",
    titleEn: "Ellipsis & Substitution",
    cefr: "C2",
    intro:
      "زبان مقتضای حرفه‌ای، «حذف بی‌خطر» است: هر چه شنونده خودش می‌تواند بازسازی کند، دیگر نگفته می‌شود. انگلیسی برای این اقتصاد زبانی دو ابزار دارد: ellipsis (حذف مستقیم کلمات) و substitution (جایگزینی با کلمهٔ جانشین مثل one/do/so). این درس، منطق پنهان پشت جمله‌های به‌ظاهر ناقصی است که هر روز می‌شنوید — She can swim but I can't (چی را نمی‌تواند؟) — و به شما یاد می‌دهد چطور مثل بومی‌ها، روان اما بی‌کم‌وکاست حرف بزنید.",
    sections: [
      {
        title: "حذف در جواب کوتاه و پس از and/but/or",
        paragraphs: [
          "معروف‌ترین ellipsis در «جواب کوتاه» رخ می‌دهد: Are you coming? — Yes, I am (به‌جای Yes, I am coming). فعل کمکی آخرین بازماندهٔ جمله است و بقیه حذف شده؛ شنونده از سؤال، قطعه‌های گمشده را خودش پر می‌کند. همین منطق بعد از and/but/or هم کار می‌کند: She can swim, but I can't (can't swim). He wanted to leave, but he didn't (didn't want to leave). نکتهٔ کلیدی: حذف فقط وقتی مجاز است که «بازسازی بی‌ابهام» باشد — شنونده دقیقاً بداند چه چیزی حذف شده.",
          "قاعدهٔ فنی مهم: بعد از to می‌توان کل مصدر را حذف کرد اما خود to باید بماند! I went to the party because I wanted to (نه because I wanted). He'll never admit it, but he has to (نه has to admit it... با حذف to). این «to یتیم» یکی از امضاهای انگلیسیِ مسلط است. همچنین در مقایسه‌ها، فعل تکراری حذف می‌شود و to زمان هم می‌ماند: I work harder than I used to (به‌جای than I used to work). اگر این سه الگو را جا بیندازید، گفتارتان از تکرارهای خسته‌کننده خلاص می‌شود.",
        ],
        examples: [
          { en: "Are you coming? — I'd love to, but I can't.", fa: "می‌آیی؟ — دوست دارم بیایم، ولی نمی‌توانم. (حذف بعد از to)" },
          { en: "She speaks French, and I do too.", fa: "او فرانسوی صحبت می‌کند و من هم می‌کنم. (do)" },
          { en: "I work harder than I used to.", fa: "سخت‌تر از قبل کار می‌کنم. (used to [work])" },
        ],
      },
      {
        title: "جانشین‌ها: one/ones، do، so، not",
        paragraphs: [
          "substitution یعنی به‌جای حذف، یک «کلمهٔ جانشین» بگذاریم. پرکاربردترین‌ها: one/ones برای اسم‌های قابل‌شمارش (I need a pen — Do you have one? نه Do you have a pen?)؛ do برای فعل‌ها (She works faster than I do)؛ so/not برای بند کامل (Is it raining? — I think so / I hope not / I'm afraid not). این سه‌گانه، جمله‌های شما را روان نگه می‌دارد بی‌آنکه ابهام ایجاد شود؛ برعکسِ تکرار خام که مبتدی‌بودن را لو می‌دهد.",
          "ظریف‌ترین عضو این خانواده، «do so» است که کل «فعل + مقدماتش» را جانشین می‌شود و فقط برای «اعمال ارادی و داوطلبانه» می‌آید: Please close the door — I already did so (نه برای حالات: She is tired — I am so غلط!). تفکیک ظریف: do so برای عملِ انجام‌شده توسط فاعل مشخص؛ do it برای عمل با مفعول مشخص و محسوس. مقایسه: He promised to call and he did so (به قولش عمل کرد) با When you call him, do it softly (عملِ مشخص با مفعول). در سطح C2، همین ظرافت‌ها هستند که گفتار شما را از «درست» به «بومیمانند» می‌برند.",
        ],
        examples: [
          { en: "This phone is old — I'm going to buy a new one.", fa: "این گوشی قدیمی است — می‌خواهم یک نو بخرم. (one = phone)" },
          { en: "Will it snow? — I hope not.", fa: "برف می‌بارد؟ — امیدوارم نه. (not جانشین بند)" },
          { en: "He asked me to leave, and I did so quietly.", fa: "از من خواست بروم و بی‌سروصدا رفتم. (did so)" },
        ],
      },
      {
        title: "حذف در جملهٔ موصولی و واکنش‌های کوتاه",
        paragraphs: [
          "جمله‌های موصولی تعریف‌کننده، جایی برای ellipsis حرفه‌ای‌اند: وقتی ضمیر موصولی مفعول است، حذفش کردید (the song she sang)؛ اما یک قدم جلوتر هم می‌توان رفت: حذف فعل be و اجزای تکراری بعد از ضمیر — The man (who is) standing by the door is my uncle / Anyone (who is) caught cheating will be punished. این «حذف who is/which is» در نوشتار رسمی و خبری فراوان است و جمله‌ها را چابک می‌کند.",
          "واکنش‌های کوتاه مکالمه هم موطن ellipsis کامل‌اند: Sounds great! (به‌جای That sounds great)، Must be nice! (It must be nice)، Hope to see you soon (I hope...)، Not bad (It's not bad). در ایمیل و چت، این شکل‌ها استانداردند: Looking forward to it / Will do / Can't wait. توجه کنید که این حذف‌ها «رسمیت را کم نمی‌کنند» بلکه «طبیعی بودن» می‌آورند؛ حتی در ایمیل اداری، Looking forward to hearing from you (حذف I am) کاملاً حرفه‌ای است. قاعدهٔ نهایی: هر جا بازسازی بی‌ابهام است و تکرار فقط هوا را سنگین می‌کند، حذف کنید یا جانشین بگذارید.",
        ],
        examples: [
          { en: "Anyone caught cheating will be disqualified.", fa: "هر کسی که تقلبش گرفته شود رد صلاحیت می‌شود. (حذف who is)" },
          { en: "Sounds like a plan!", fa: "به نظر برنامهٔ خوبی می‌آید! (That sounds...)" },
          { en: "Looking forward to hearing from you.", fa: "منتظر شنیدن از شما هستم. (I am looking...)" },
        ],
      },
    ],
    rule:
      "ellipsis (حذف) وقتی مجاز است که بازسازی بی‌ابهام باشد: در جواب کوتاه فعل کمکی می‌ماند (Yes, I am)؛ بعد از and/but/or فعل تکراری حذف می‌شود (but I can't)؛ بعد از to مصدر حذف ولی خود to می‌ماند (I wanted to). substitution: one/ones برای اسم قابل‌شمارش؛ do برای فعل؛ so/not برای بند (I think so / I hope not)؛ do so برای عمل ارادی کامل. حذف who is/which is در جملهٔ موصولی: Anyone caught cheating... . واکنش‌های کوتاه: Sounds great! / Must be nice!",
    form: [
      { label: "جواب کوتاه", pattern: "Can you swim? — Yes, I can. (حذف swim)" },
      { label: "to یتیم", pattern: "I went because I wanted to. (حذف go)" },
      { label: "جانشین one", pattern: "These cookies are better than the ones we bought." },
      { label: "جانشین do", pattern: "She runs faster than I do." },
      { label: "so / not", pattern: "Is he coming? — I think so / I suppose not." },
      { label: "do so", pattern: "He was told to wait, and he did so." },
    ],
    examples: [
      { en: "I asked him to help, but he didn't want to.", fa: "از او کمک خواستم، ولی نمی‌خواست (کمک کند)." },
      { en: "My old laptop was slow, so I bought a new one.", fa: "لپ‌تاپ قدیمی‌ام کند بود، پس یک نو خریدم." },
      { en: "Do you think it'll rain? — I hope not.", fa: "فکر می‌کنی باران بیاید؟ — امیدوارم نه." },
      { en: "She plays tennis better than I do.", fa: "او تنیس را بهتر از من بازی می‌کند." },
      { en: "He said he'd call, and he did so the next morning.", fa: "گفت زنگ می‌زند و فردا صبح هم زنگ زد." },
      { en: "I work out more than I used to.", fa: "بیشتر از قبل ورزش می‌کنم. (حذف work out)" },
      { en: "The students (who were) involved were suspended.", fa: "دانش‌آموزانِ درگیر تعلیق شدند. (حذف who were)" },
      { en: "Can't wait to see you!", fa: "بی‌صبرانه منتظر دیدنت هستم! (I can't wait...)" },
    ],
    mistakes: [
      { wrong: "I went because I wanted.", right: "I went because I wanted to.", note: "بعد از wanted مصدر حذف می‌شود اما to باید بماند؛ حذف to در اینجا غیررسمی و نادرست در نوشتار است." },
      { wrong: "I need a pen. — Do you have it?", right: "I need a pen. — Do you have one?", note: "one برای «یکی از آن شیء به‌طور کلی» می‌آید؛ it به «همان قلم مشخص» اشاره می‌کند که هنوز معرفی نشده." },
      { wrong: "Will she come? — I don't hope.", right: "Will she come? — I hope not.", note: "نفیِ so در این ساختار با not ساخته می‌شود: I hope not / I'm afraid not / I suppose not." },
      { wrong: "He is tired and I am so too.", right: "He is tired and I am too.", note: "so به‌عنوان جانشین فقط در ساختار خاص می‌آید (I think so)؛ بعد از be از too استفاده می‌شود." },
    ],
    tips: [
      "قاعدهٔ اقتصادی: فقط چیزی را حذف یا جانشین کنید که شنونده از جملهٔ قبلی «رایگان» بازسازی می‌کند؛ ابهام، بهای نقدینگی است!",
      "سه جانشین را با نقش‌ها حفظ کنید: one = اسم شمارش‌پذیر، do = فعل، so/not = کل بند — هر کدام سلطهٔ خودشان را دارند.",
      "to یتیم را در جعبه‌ابزار مکالمه بگذارید: wanted to / have to / going to / used to — قشنگ‌ترین حذفِ انگلیسی.",
      "در ایمیل رسمی، Looking forward to... و Will do را جایگزین جمله‌های کامل تکراری کنید؛ سبک شما حرفه‌ای‌تر دیده می‌شود.",
    ],
    quiz: [
      { question: "«می‌خواستم بروم ولی نتوانستم (بروم)» کدام است؟", options: ["I wanted to go but I couldn't to.", "I wanted to go but I couldn't.", "I wanted go but I couldn't.", "I wanted to go but I couldn't go to."], correctIndex: 1, explanation: "بعد از کمکی couldn't کل مصدر (شامل to) حذف می‌شود." },
      { question: "«این کیف سنگین است؛ یک سبک می‌خواهم» کدام است؟", options: ["I want a light it.", "I want a light one.", "I want light this.", "I want a light ones."], correctIndex: 1, explanation: "one جانشین اسم قابل‌شمارش مفرد (bag) است." },
      { question: "«باران می‌آید؟ — فکر کنم نه» کدام است؟", options: ["Is it raining? — I think not.", "Is it raining? — I don't think.", "Is it raining? — I think no.", "Is it raining? — I not think so."], correctIndex: 0, explanation: "نفیِ جانشین so با not: I think not / I hope not / I suppose not." },
      { question: "کدام جمله حذفِ «who is» دارد؟", options: ["The man who is talking is my boss.", "The man talking is my boss.", "The man is talking my boss.", "The man who talking is my boss."], correctIndex: 1, explanation: "حذف who is در جملهٔ موصولی: The man (who is) talking is my boss." },
      { question: "«او قول داد صبح زود برسد و همین‌طور هم کرد» کدام است؟", options: ["He promised to arrive early and he did it so.", "He promised to arrive early and he did so.", "He promised to arrive early and he so did.", "He promised to arrive early and he made so."], correctIndex: 1, explanation: "do so جانشین کل «فعل + مقدمات» برای عمل ارادی است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-08",
    titleFa: "اسمی‌سازی",
    titleEn: "Nominalisation",
    cefr: "C2",
    intro:
      "اسمی‌سازی، قلب نوشتار علمی و رسمی انگلیسی است: تبدیل فعل و صفت به اسم، تا جمله از «اتفاق» به «مفهوم» تغییر حالت بدهد. They decided → the decision، it failed → the failure. با این ترفند، نویسنده می‌تواند دربارهٔ خودِ رخدادها به‌عنوان «اشیای فکری» بحث کند، آنها را بشمارد، وزن بدهد و روی میز تحلیل بچیند. این همان چیزی است که یک ایمیل ساده را از یک گزارش حرفه‌ای جدا می‌کند — و البته اگر زیاده‌روی کنید، متن را به بوروکراسی سنگین تبدیل می‌کند!",
    sections: [
      {
        title: "چرا متون علمی عاشق اسم‌ها هستند؟",
        paragraphs: [
          "مقایسه کنید: The government decided to raise taxes، which caused protests (دو رخداد زنجیره‌ای در دو جمله) با The government's decision to raise taxes triggered widespread protests (یک مفهوم مرکزی: تصمیم). در نسخهٔ دوم، decision به‌عنوان «موضوع» روی میز آمده و می‌توانید دورش بچرخید، علتش را بسنجید و آن را با «تصمیم‌های دیگر» مقایسه کنید. اسمی‌سازی به نویسنده قدرت «انتزاع» می‌دهد: از جزئیاتِ کوتاه به مفاهیمِ بزرگ جهش می‌کند — دقیقاً کاری که متن علمی و گزارش رسمی می‌کند.",
          "در زبان‌شناسی به این پدیده «grammatical metaphor» می‌گویند: جمله به‌جای این‌که رخداد را «اجرا» کند (فعل)، آن را «بسته‌بندی» می‌کند (اسم). ابزارهای این بسته‌بندی: پسوندهای -tion (decide → decision)، -ment (develop → development)، -ance (perform → performance)، -al (remove → removal)، -ity (able → ability)، -ness (happy → happiness)، -hood/-ship (child → childhood). تسلط بر این پسوندها یعنی دیده‌بان واژگان رسمی؛ هر فعل پرتکرار را بتوانید به همتای اسمی‌اش ترجمه کنید.",
        ],
        examples: [
          { en: "The decision to cancel the flight angered the passengers.", fa: "تصمیم لغو پرواز مسافران را خشمگین کرد." },
          { en: "Rapid population growth led to a housing crisis.", fa: "رشد سریع جمعیت به بحران مسکن منجر شد." },
        ],
      },
      {
        title: "از جملهٔ ساده به جملهٔ اسم‌محور: تمرین تبدیل",
        paragraphs: [
          "فرایند تبدیل، مکانیکی و تمرین‌پذیر است: فعل جمله را به اسم می‌برید، فاعل را یا مالک می‌کنید (the government's decision) یا حذف، و یک فعلِ «حامل» سبک انتخاب می‌کنید (cause، lead to، result in، trigger، involve، require). مثال: They interviewed 200 people and found that... → The interview of 200 participants revealed that... . فعل پررنگ قبلی (interview) حالا اسم شده و فعلِ بی‌رنگِ reveal، حامل جمله است. این «تقسیم کار»: مفهوم سنگین در اسم، حرکت سبک در فعل — راز ریتم نوشتار رسمی است.",
          "اما هنر واقعی، «جراحی معکوس» هم هست: وقتی متنی بیش از حد اسم‌وار و سنگین شده، آن را به فعل بازگردانید تا نفس بکشد. The implementation of the assessment of the staff's performance was carried out → They assessed the staff's performance (هفت کلمه به‌جای سیزده!). نویسندگان حرفه‌ای بین این دو حالت رفت‌وآمد می‌کنند: اسم‌سازی برای «انتزاع و مقایسه»، فعل‌سازی برای «وضوح و انرژی». قانون سرانگشتی: در هر پاراگراف، یک تا دو جملهٔ اسم‌محور کافی است؛ بیشتر از آن، متن بوروکراتیک می‌شود.",
        ],
        examples: [
          { en: "The analysis of the data revealed three trends.", fa: "تحلیل داده‌ها سه روند را آشکار کرد." },
          { en: "They assessed the staff's performance.", fa: "عملکرد کارکنان را ارزیابی کردند. (نسخهٔ فعل‌دار و سبک‌تر)" },
        ],
      },
      {
        title: "ترکیب اسمی و پیوندهای مقالوی",
        paragraphs: [
          "اسمی‌سازی معمولاً با خانوادهٔ خاصی از فعل‌ها و پیوندها همراه است که «رابطهٔ میان مفاهیم» را مدیریت می‌کنند: result in / lead to (نتیجه شدن)، stem from / arise from (برخاستن از)، be attributed to (نسبت داده شدن به)، be associated with (همراه بودن با)، facilitate / hinder (تسهیل/ممانعت). The rise in inflation was attributed to the war — رشد تورم به جنگ نسبت داده شد. این واژه‌ها، اسکلت استاندارد مقاله و گزارش‌اند و جایگزین‌های سبک‌ترِ because/so محسوب می‌شوند.",
          "ترکیب اسمی (noun compounding) هم شریک همیشگی این سبک است: زنجیرهٔ اسم‌ها که هر یک، قبلی را توصیف می‌کند — climate change policy، employee training programme، data protection regulations. در این زنجیره‌ها، اسم اصلی آخر است و بقیه صفت‌واره. مهارت C2 این است که این زنجیره‌ها را هم «بسازید» و هم «بشکافید»: policy for dealing with climate change = climate change policy. در ایمیل اداری، یک ترکیب اسمی درست به‌جای سه جملهٔ توضیحی می‌آید و پیام شما را چند پله حرفه‌ای‌تر نشان می‌دهد.",
        ],
        examples: [
          { en: "The failure was attributed to poor communication.", fa: "شکست به ضعف ارتباطی نسبت داده شد." },
          { en: "We need to update our data protection policies.", fa: "باید سیاست‌های حفاظت از داده‌مان را به‌روز کنیم. (ترکیب اسمی)" },
        ],
      },
    ],
    rule:
      "اسمی‌سازی = تبدیل فعل/صفت به اسم با پسوندهای -tion، -ment، -ance، -al، -ity، -ness: decide→decision، develop→development، able→ability. کاربرد: انتزاع و تحلیل در نوشتار رسمی و علمی. ساختار: اسمِ مفهوم + فعل حامل سبک (cause، lead to، result in، be attributed to). ترکیب اسمی: اسم‌های پشت‌سرهم که آخرین، اصلی است: climate change policy. تعادل: ۱-۲ جملهٔ اسم‌محور در هر پاراگراف؛ برای وضوح، به فعل برگردانید.",
    form: [
      { label: "پسوند -tion", pattern: "decide → decision · inform → information · explain → explanation" },
      { label: "پسوند -ment", pattern: "develop → development · govern → government" },
      { label: "پسوند -ance/-al", pattern: "perform → performance · arrive → arrival · survive → survival" },
      { label: "صفت → اسم", pattern: "able → ability · happy → happiness · aware → awareness" },
      { label: "فعل حامل", pattern: "The decision caused... · The growth led to... · ...was attributed to..." },
      { label: "ترکیب اسمی", pattern: "employee training programme · data security breach" },
    ],
    examples: [
      { en: "The arrival of the new manager changed everything.", fa: "ورود مدیر جدید همه‌چیز را تغییر داد. (arrive → arrival)" },
      { en: "Their refusal to cooperate surprised us.", fa: "امتناعشان از همکاری ما را غافلگیر کرد. (refuse → refusal)" },
      { en: "The company's rapid expansion created many jobs.", fa: "گسترش سریع شرکت شغل‌های زیادی ایجاد کرد. (expand → expansion)" },
      { en: "There is growing awareness of environmental issues.", fa: "آگاهی فزاینده‌ای از مسائل زیست‌محیطی وجود دارد. (aware → awareness)" },
      { en: "Failure to follow the rules may result in dismissal.", fa: "عدم رعایت قوانین ممکن است به اخراج منجر شود. (fail → failure)" },
      { en: "The implementation of the plan took six months.", fa: "اجراى برنامه شش ماه طول کشید. (implement → implementation)" },
      { en: "His acceptance of the offer pleased everyone.", fa: "پذیرش پیشنهاد توسط او همه را خوشحال کرد. (accept → acceptance)" },
      { en: "We discussed the improvement of customer service.", fa: "دربارهٔ بهبود خدمات مشتریان بحث کردیم. (improve → improvement)" },
    ],
    mistakes: [
      { wrong: "The decide of the committee was final.", right: "The decision of the committee was final.", note: "فعل decide وقتی اسم می‌شود، شکلش decision است؛ اسم و فعل هم‌شکل نیستند." },
      { wrong: "The government develop a new policy.", right: "The government developed a new policy. / The development of a new policy...", note: "development اسم است و نمی‌تواند بدون کمکی فعل جمله باشد؛ یا فعل به‌کار ببرید یا ساختار اسمی کامل بسازید." },
      { wrong: "His perform in the exam was excellent.", right: "His performance in the exam was excellent.", note: "اسمِ فعل perform کلمهٔ performance است، نه خود فعل." },
      { wrong: "The fail of the system caused delays.", right: "The failure of the system caused delays.", note: "اسمِ fail کلمهٔ failure است؛ پسوند را کامل کنید." },
    ],
    tips: [
      "جدول شخصی بسازید: ستون فعل، ستون اسم (decision، refusal، arrival...)؛ هر هفته ده جفت اضافه کنید — این دفتر، واژگان رسمی شما را می‌سازد.",
      "برای سبک مقاله‌ای، الگوی «اسم + فعل حامل سبک» را تمرین کنید: X led to Y / X was attributed to Z — و از because در متن رسمی کمتر استفاده کنید.",
      "متن خودتان را «جراحی معکوس» کنید: اگر جمله‌ای بیش از دو اسم‌سازی داشت، یکی را به فعل برگردانید تا نفس بکشد.",
      "ترکیب‌های اسمی استاندارد حوزهٔ خودتان را جمع کنید: project management، quality control — این‌ها امضای حرفه‌ای ایمیل و رزومه‌اند.",
    ],
    quiz: [
      { question: "اسم فعل «arrive» کدام است؟", options: ["arrivement", "arrival", "arriving", "arrivation"], correctIndex: 1, explanation: "arrive → arrival با پسوند -al؛ مشابه: survive → survival، refuse → refusal." },
      { question: "«تصمیم برای لغو پرواز مسافران را خشمگین کرد» کدام است؟", options: ["The decide to cancel the flight angered passengers.", "The decision to cancel the flight angered passengers.", "The deciding to cancel the flight angered passengers.", "The decision cancel flight angered passengers."], correctIndex: 1, explanation: "اسمِ decide کلمهٔ decision است و بعدش مصدر با to می‌آید." },
      { question: "کدام جمله «سبک فعل‌دارِ» جملهٔ اسم‌سازِ The implementation of the policy took a year است؟", options: ["The policy implement for a year.", "They implemented the policy in a year.", "The policy's implementation year.", "Implementing year of the policy."], correctIndex: 1, explanation: "جراحی معکوس: اسم implementation به فعل implemented برمی‌گردد و جمله سبک می‌شود." },
      { question: "ترکیب اسمی «a programme for training employees» کدام است؟", options: ["a training programme employees", "an employees training programme", "an employee training programme", "a programme employees training"], correctIndex: 2, explanation: "در ترکیب اسمی، توصیف‌ها اول و اسم اصلی آخر: employee training programme." },
      { question: "اسمی‌سازی بیش از حد چه مشکلی ایجاد می‌کند؟", options: ["متن کوتاه‌تر می‌شود", "متن سنگین و بوروکراتیک می‌شود", "متن علمی‌تر می‌شود", "هیچ مشکلی ندارد"], correctIndex: 1, explanation: "تعادل کلیدی است؛ زنجیرهٔ اسم‌ها بدون فعل، متن را از نفس می‌اندازد و خواندنش را سخت می‌کند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-09",
    titleFa: "افعال عبارتی",
    titleEn: "Phrasal Verbs",
    cefr: "C2",
    intro:
      "افعال عبارتی، «زبان خیابان و محیط کار» انگلیسی‌اند: ترکیب یک فعل ساده با یک حرف اضافه یا قید که معنایی کاملاً تازه می‌سازد — give up (تسلیم شدن)، put off (عقب انداختن)، run into (برخورد تصادفی). بومی‌ها در مکالمهٔ روزمره به‌جای فعل‌های رسمیِ لاتین، تقریباً همیشه فعل عبارتی را انتخاب می‌کنند: به‌جای postpone می‌گویند put off و به‌جای tolerate می‌گویند put up with. بدون این خانواده، انگلیسی شما «کتابی» می‌ماند؛ با آن، وارد اتاق‌های واقعی می‌شوید که معامله و دوستی و خنده در آنها جریان دارد.",
    sections: [
      {
        title: "منطق پنهان حروف: چرا up یعنی «کامل» و off یعنی «قطع»؟",
        paragraphs: [
          "به‌ظاهر افعال عبارتی بی‌قاعده‌اند، اما حروف و قیدهای سازنده‌شان الگوهای معنایی پنهان دارند. up اغلب «کامل شدن و تمام شدن» را می‌رساند: eat up (کاملاً خوردن)، use up (تمام کردن)، finish up (سر هم کردن). off «جدا شدن و جدایی» است: take off (پرواز — جدا شدن از زمین)، call off (لغو کردن)، put off (دور انداختن در زمان). out «از حالت پنهان به آشکار» یا «تمام» است: find out (پیدا کردن)، run out (تمام شدن)، work out (حل شدن). on «ادامه» است: carry on، keep on، go on.",
          "با همین چهار نقشهٔ ذهنی (up=کامل، off=جدا/قطع، out=آشکار/تمام، on=ادامه)، نیمی از افعال عبارتی جدید قابل «حدس» می‌شوند. مثلاً وقتی می‌شنوید The meeting is off، ذهن شما با نقشهٔ off=قطع، بی‌درنگ «جلسه لغو شد» را می‌سازد. این نگاه معنایی، حجم حفظ‌کردن را از صدها مورد به چند ده الگو کاهش می‌دهد و مهم‌تر از آن، به شما جرأت استفاده می‌دهد: حتی اگر فعل عبارتی دقیق را فراموش کنید، ترکیب فعل+حرف منطقی می‌سازید و معمولاً نزدیک جواب می‌مانید!",
        ],
        examples: [
          { en: "We used up all the milk.", fa: "همهٔ شیر را تمام کردیم. (up = کامل)" },
          { en: "The meeting is off.", fa: "جلسه لغو شد. (off = قطع)" },
          { en: "I found out the truth.", fa: "حقیقت را فهمیدم. (out = آشکار)" },
        ],
      },
      {
        title: "سه‌گانهٔ ساختاری: جداشدنی، نجداشدنی، سه‌تکه",
        paragraphs: [
          "افعال عبارتیِ «جداشدنی» (separable) اجازه می‌دهند مفعول بین فعل و حرف بیاید: turn off the light یا turn the light off. اگر مفعول ضمیر باشد، حتماً وسط می‌نشیند: turn it off (هرگز turn off it!). افعال «نجداشدنی» (inseparable) سنگ‌رمانند و شکسته نمی‌شوند: run into Ali (نه run Ali into)، look after the kids، come across an old photo. گروه سه‌تکه‌ها هم یک فعل + دو ذره دارند و مفعول همیشه آخر است: put up with the noise، look forward to the trip، get on with my colleagues.",
          "قاعدهٔ عملی برای تشخیص: متأسفانه هیچ قانون صددرصدی وجود ندارد و هر فعل عبارتی باید با «الگوی دستوری» خودش یاد گرفته شود — اما سه راهنمای آماری داریم: افعال با ذره‌های موقعیتی (into، across، over، through) تقریباً همیشه نجداشدنی‌اند؛ افعال کوتاه با up/off/out/on اغلب جداشدنی‌اند؛ و اگر مفعول «آدم» و معنا مجازی باشد (look after him)، احتمال نجداشدنی بودن بالاست. بهترین سیاست: هر فعل عبارتی را با یک جملهٔ نمونهٔ کامل ذخیره کنید، نه فقط فعل+حرفِ خشک.",
        ],
        examples: [
          { en: "Please turn the lights off. / Turn them off.", fa: "لطفاً چراغ‌ها را خاموش کن. (جداشدنی)" },
          { en: "I ran into an old friend at the mall.", fa: "در مرکز خرید به دوست قدیمی برخوردم. (نجداشدنی)" },
          { en: "I can't put up with this noise anymore.", fa: "دیگر نمی‌توانم این سروصدا را تحمل کنم. (سه‌تکه)" },
        ],
      },
      {
        title: "جهانِ کاری و روزمره: پرمصرف‌ترین خانواده‌ها",
        paragraphs: [
          "به‌جای لیست‌های بی‌انتها، خانواده‌سازی موضوعی کنید. «کار و جلسه»: call off (لغو)، put off (عقب انداختن)، bring up (مطرح کردن)، go over (مرور کردن)، hand in (تحویل دادن)، set up (برپا کردن)، take over (تحویل گرفتن)، cut back on (کاهش دادن). «ارتباط»: bring up، point out (اشاره کردن)، hang up (قطع تماس)، call back (پاسخ دادن)، get back to (جواب دادن بعداً). «زندگی روزمره»: wake up، get up، run out of (تمام شدن)، pick up (برداشتن/سر زدن)، drop by (سر زدن کوتاه)، eat out (بیرون غذا خوردن).",
          "نکتهٔ لاتین‌ترس! در محیط رسمیِ بسیار (مقالهٔ علمی، حقوقی)، افعال عبارتی جای خود را به همتاهای لاتین می‌دهند: put off → postpone، find out → discover، carry out → conduct، look into → investigate. پس استراتژی دوزبانهٔ حرفه‌ای: هر جفت را با هم یاد بگیرید و موقعیت را انتخاب کنید — مکالمه و ایمیل دوستانه → فعل عبارتی؛ مقاله و گزارش رسمی → فعل لاتین. این سوئیچ زبانی، همان چیزی است که گویش C2 را از گویش B2 جدا می‌کند: نه فقط «می‌فهمم»، بلکه «درست انتخاب می‌کنم».",
        ],
        examples: [
          { en: "They called off the meeting at the last minute.", fa: "جلسه را در آخرین لحظه لغو کردند." },
          { en: "We've run out of coffee.", fa: "قهوه‌مان تمام شده است." },
          { en: "The team carried out a survey. (= conducted)", fa: "تیم یک نظرسنجی انجام داد. (رسمی: conducted)" },
        ],
      },
    ],
    rule:
      "فعل عبارتی = فعل + ذره؛ معنا اغلب مجاز و تازه است (give up ≠ give + up). نقشه‌های معنایی: up=کامل/تمام، off=جدا/لغو، out=آشکار/تمام، on=ادامه. جداشدنی: مفعول می‌تواند وسط بیاید و اگر ضمیر باشد حتماً وسط می‌آید (turn it off)؛ نجداشدنی: هرگز وسط نمی‌شود (run into sb)؛ سه‌تکه: مفعول همیشه آخر (put up with sth). انتخاب سبک: مکالمه → عبارتی (put off)؛ متن رسمی → لاتین (postpone).",
    form: [
      { label: "جداشدنی", pattern: "turn off the light / turn the light off / turn it off" },
      { label: "نجداشدنی", pattern: "run into Ali · look after the kids · come across a photo" },
      { label: "سه‌تکه", pattern: "put up with · look forward to · get on with · run out of" },
      { label: "نقشهٔ up", pattern: "eat up · use up · grow up (کامل/تمام)" },
      { label: "نقشهٔ off", pattern: "take off · call off · put off (جدا/لغو)" },
      { label: "جفت رسمی", pattern: "put off→postpone · find out→discover · carry out→conduct" },
    ],
    examples: [
      { en: "Don't give up — try again!", fa: "تسلیم نشو — دوباره تلاش کن!" },
      { en: "We had to put off the trip until next month.", fa: "مجبور شدیم سفر را به ماه بعد بیندازیم." },
      { en: "I'm looking forward to the holidays.", fa: "بی‌صبرانه منتظر تعطیلات هستم." },
      { en: "She brought up an interesting point.", fa: "نکتهٔ جالبی را مطرح کرد." },
      { en: "Our car broke down on the highway.", fa: "ماشینمان در بزرگراه خراب شد." },
      { en: "Could you look after the kids tonight?", fa: "می‌توانی امشب مواظب بچه‌ها باشی؟" },
      { en: "They ended up staying for dinner.", fa: "در نهایت برای شام ماندند." },
      { en: "I'll get back to you as soon as possible.", fa: "هر چه زودتر به شما جواب می‌دهم." },
    ],
    mistakes: [
      { wrong: "Turn off it, please.", right: "Turn it off, please.", note: "وقتی مفعول ضمیر است، در افعال جداشدنی باید بین فعل و ذره بنشیند؛ ضمیر هرگز بعد از ذره نمی‌آید." },
      { wrong: "I'm looking forward to see you.", right: "I'm looking forward to seeing you.", note: "look forward to سه‌تکه با حرف اضافه to است؛ بعدش gerund می‌آید نه مصدر." },
      { wrong: "We ran out from milk.", right: "We ran out of milk.", note: "run out of یک واحد سه‌تکه است؛ ذرهٔ درست of است نه from." },
      { wrong: "She put off to go to the dentist.", right: "She put off going to the dentist.", note: "بعد از put off مفعولِ مصدری به شکل gerund می‌آید (به‌جای to go)." },
    ],
    tips: [
      "با نقشه‌های معنایی حروف شروع کنید (up=کامل، off=قطع، out=آشکار، on=ادامه) — این چهار نقشه، حدس‌زدن معنای افعال جدید را ممکن می‌کند.",
      "هر فعل عبارتی را با یک جملهٔ شخصی کامل یاد کنید، نه به‌صورت خشک؛ جملهٔ داستان‌دار، حافظهٔ بلندمدت را فعال می‌کند.",
      "قاعدهٔ ضمیر را قاب کنید: «ضمیر وسط می‌نشیند» — اگر ضمیر دارید، فعل و ذره را از هم باز کنید؛ در نجداشدنی‌ها این قاعده اصلاً پیش نمی‌آید.",
      "جفت‌های رسمی/محاوره‌ای را دوتایی یاد بگیرید (put off/postpone) و در ایمیل‌های کاری، سوئیچ درست را بزنید.",
    ],
    quiz: [
      { question: "«جلسه را لغو کردند» کدام است؟", options: ["They called the meeting off.", "They called off it.", "They called of the meeting.", "They cancelled off the meeting."], correctIndex: 0, explanation: "call off جداشدنی است؛ مفعول می‌تواند وسط بیاید اما ضمیر نه." },
      { question: "معنی فعل عبارتی «run out of» چیست؟", options: ["فرار کردن از", "تمام شدن (موجودی)", "بیرون دویدن", "پخش کردن"], correctIndex: 1, explanation: "run out of = تمام شدن موجودی چیزی: We ran out of sugar." },
      { question: "کدام جمله درست است؟", options: ["I look forward to see you.", "I look forward to seeing you.", "I look forward for seeing you.", "I am looking forward see you."], correctIndex: 1, explanation: "در look forward to، حرف to اضافه است و بعد از آن gerund می‌آید: seeing." },
      { question: "معنی «put up with» چیست؟", options: ["بالا بردن", "تحمل کردن", "ساختن", "عوض کردن"], correctIndex: 1, explanation: "put up with = تحمل کردن (مخصوصاً چیز ناخوشایند): I can't put up with the noise." },
      { question: "در متن علمی رسمی، جایگزین «find out» کدام است؟", options: ["discover", "look out", "find up", "search out"], correctIndex: 0, explanation: "در سبک رسمی، همتای لاتین جایگزین می‌شود: find out → discover؛ carry out → conduct." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-advanced-10",
    titleFa: "نرم‌سازی و پیوندهای پیشرفته",
    titleEn: "Hedging & Advanced Connectors",
    cefr: "C2",
    intro:
      "در سطح تسلط، «چه می‌گویید» به اندازهٔ «چطور می‌گویید» مهم است؛ چرا که چقدر دربارهٔ ادعاهایتان مطمئن به‌نظر می‌رسید و چگونه جمله‌هایتان به هم سنجاق می‌شوند. نرم‌سازی (hedging) هنر فاصلهٔ مؤدبانه با ادعاست — قلب نوشتار علمی و گفتار محترمانه — و پیوندهای پیشرفته (albeit، notwithstanding، insofar as) اسکلت متن‌های حرفه‌ای‌اند. این درس، آخرین قطعهٔ پازل سبک است: صحبتی که نه مطلق و جسورانه است، نه ضعیف و لرزان؛ دقیقاً در نقطهٔ تعادل.",
    sections: [
      {
        title: "چرا نرم‌سازی؟ فرهنگ اطمینان در انگلیسی",
        paragraphs: [
          "مقایسه کنید: Social media destroys mental health (ادعای مطلق — جسور و آسیب‌پذیر) با Social media may contribute to poorer mental health outcomes (ادعای سنجیده — علمی و قابل‌دفاع). فرهنگ انگلیسیِ آکادمیک و حرفه‌ای، ادعای مطلق را «نشانهٔ ساده‌لوحی» می‌بیند: دنیا پیچیده است و گویندهٔ خردمند، جا برای استثنا باز می‌گذارد. ابزارهای این سنجش: قیدهای احتمال (possibly، perhaps، arguably، presumably)، فعل‌های نرم (seem، appear، tend to، suggest)، ساختارهای فاصله‌دار (it would appear that...، to some extent...، in many cases...)، و وجهی‌های ملایم (may/might/could).",
          "فرمول طلایی سطح‌بندی اطمینان که در نوشتار علمی حکومت می‌کند: ادعای قوی با شواهد قوی → show/demonstrate/prove؛ ادعای متوسط → suggest/indicate/support؛ ادعای محتاطانه → may/might/appear to/seem to. The data suggest that... (داده‌ها نشان می‌دهند — علمی و مطمئن) در برابر The data prove that... (قطعی — فقط وقتی واقعاً بی‌نقص است!). قاعدهٔ سرانگشتی: هرگاه خواستید بنویسید everyone/always/never/destroy، یک لحظه مکث کنید؛ اگر استثنایی هست، ادعای خود را نرم کنید — این ضعف نیست، دقت است و در فرهنگ انگلیسی، نشانهٔ اعتبار.",
        ],
        examples: [
          { en: "The findings suggest that sleep quality may improve memory.", fa: "یافته‌ها نشان می‌دهند که کیفیت خواب شاید حافظه را بهبود دهد." },
          { en: "It would appear that the market is recovering.", fa: "به‌نظر می‌رسد بازار در حال بهبود است." },
        ],
      },
      {
        title: "پیوندهای مقابله‌ای پیشرفته: albeit، notwithstanding، whereas",
        paragraphs: [
          "فراتر از but و however، خانواده‌ای از پیوندهای سنگین‌تر وجود دارد که متن شما را در سطح C2 نشان می‌دهد. albeit (= هرچند؛ همیشه با صفت/قید/عبارت، نه بند کامل): The plan was approved، albeit reluctantly — طرح تصویب شد، هرچند با بی‌میلی. notwithstanding (= با وجود؛ همیشه اسم و برعکسِ despite): Notwithstanding the delays، the project succeeded — با وجود تأخیرها، پروژه موفق شد. whereas (= در حالی که؛ مقایسهٔ رسمی دو متن): Urban areas grow، whereas rural populations decline.",
          "این پیوندها سه ویژگی مشترک دارند: رسمیت بالا، فشردگی (یک کلمه به‌جای یک بند!) و ظرافت معنایی. albeit فقط بعد از صفت/قید می‌آید و هرگز بند کامل نمی‌گیرد — this is common albeit wrong درست است اما albeit it is wrong غلط. notwithstanding برعکس despite عمل می‌کند و می‌تواند قبل یا بعد از اسم بیاید: the delays notwithstanding. خانوادهٔ -so- هم بلد باشید: insofar as (تا جایی که)، inasmuch as (از آن جهت که) — پیوندهای منطقیِ متون فلسفی و حقوقی. این‌ها را در نوشتار به‌عنوان «ادویهٔ» رسمیت به‌کار ببرید، نه به‌عنوان غذای اصلی.",
        ],
        examples: [
          { en: "The trip was wonderful, albeit exhausting.", fa: "سفر فوق‌العاده بود، هرچند فرساینده." },
          { en: "Notwithstanding the criticism, the film won awards.", fa: "با وجود انتقادها، فیلم جوایز گرفت." },
          { en: "Sales rose in Asia, whereas they fell in Europe.", fa: "فروش در آسیا رشد کرد، در حالی که در اروپا افت کرد." },
        ],
      },
      {
        title: "پیوندهای علّی و نتیجه‌ای پیشرفته + تعادل متن",
        paragraphs: [
          "برای روابط علت و معلولی، ترازوی رسمیت این‌گونه است: because of/due to (متوسط) → owing to / on account of (رسمی‌تر) → by virtue of / in view of (سنگین). برای نتیجه: so (محاوره) → therefore/thus (رسمی) → consequently / accordingly / as a result (تحلیلی) → hence (ادبی؛ معمولاً بدون فعل کامل: hence the delay). برای هدف: to (ساده) → in order to (رسمی) → so as to (نرم) → with a view to + ing (اداریِ سنگین: with a view to reducing costs).",
          "اما مهارت واقعی C2، «تعادل پیوندی» است: متن حرفه‌ای نه زنجیره‌ی and...and...so...but مبتدی دارد و نه قلعه‌ای از notwithstanding و hence در هر جمله. قاعدهٔ آهنگ: در هر پاراگراف، یک پیوند سنگین کافی است؛ بقیه را با جملات ترکیبی و قیدی‌های پیوندی سبک (moreover، furthermore، in addition) بچینید و اجازه بدهید بعضی جملات بدون پیوند، خودشان رابطه را با منطق درونی‌شان نشان دهند. متن خوب مثل موسیقی است: نه سکوت مطلقِ جملات منفرد، نه طبل‌کوبیِ مداوم پیوندها؛ ریتمی متنوع که گوش خواننده را زنده نگه می‌دارد.",
        ],
        examples: [
          { en: "Owing to heavy rain, the match was postponed.", fa: "به‌واسطهٔ باران شدید، مسابقه موکول شد." },
          { en: "The data were incomplete; hence the cautious conclusions.", fa: "داده‌ها ناقص بودند؛ از این رو نتیجه‌گیری محتاطانه." },
          { en: "We revised the plan with a view to reducing costs.", fa: "برنامه را با هدف کاهش هزینه‌ها بازنگری کردیم." },
        ],
      },
    ],
    rule:
      "نرم‌سازی: با may/might، seem/appear/tend to، possibly/perhaps/arguably، it would appear that، to some extent — ادعا را سنجیده کنید؛ در علم: show (قوی) → suggest (متوسط) → may (محتاطانه). پیوندهای مقابله‌ای: albeit + صفت/قید (نه بند)؛ notwithstanding + اسم (= despite، قابل جابه‌جایی)؛ whereas (مقایسهٔ رسمی). علّی رسمی: owing to / in view of / by virtue of. نتیجه: therefore، thus، consequently، hence (+اسم هم می‌آید: hence the delay). هدف: so as to / with a view to + ing. تعادل: یک پیوند سنگین در هر پاراگراف.",
    form: [
      { label: "نرم‌سازی احتمال", pattern: "may/might/could + فعل — This may cause delays." },
      { label: "نرم‌سازی فعل", pattern: "seem to / appear to / tend to — Prices tend to rise." },
      { label: "نرم‌سازی ساختاری", pattern: "It would appear that... / to some extent / in many cases" },
      { label: "مقابلهٔ سنگین", pattern: "albeit reluctantly · notwithstanding the delays · whereas..." },
      { label: "علّی رسمی", pattern: "owing to / in view of / on account of + اسم" },
      { label: "نتیجهٔ رسمی", pattern: "therefore / thus / consequently / hence + اسم یا فعل" },
    ],
    examples: [
      { en: "The results seem to support the hypothesis.", fa: "نتایج به‌نظر از فرضیه حمایت می‌کنند. (نرم)" },
      { en: "This approach is effective, albeit expensive.", fa: "این رویکرد مؤثر است، هرچند گران." },
      { en: "Notwithstanding the risks, they proceeded.", fa: "با وجود خطرها، ادامه دادند." },
      { en: "The north is industrial, whereas the south relies on tourism.", fa: "شمال صنعتی است، در حالی که جنوب به گردشگری متکی است." },
      { en: "Owing to high demand, prices increased.", fa: "به‌واسطهٔ تقاضای بالا، قیمت‌ها افزایش یافت." },
      { en: "He was unqualified; hence the rejection.", fa: "او فاقد صلاحیت بود؛ از این رو رد شد." },
      { en: "The plan could possibly fail.", fa: "برنامه ممکن است (به احتمال) شکست بخورد." },
      { en: "In many cases, early intervention tends to help.", fa: "در بسیاری از موارد، مداخلهٔ زودهنگام معمولاً کمک می‌کند." },
    ],
    mistakes: [
      { wrong: "The plan worked, albeit it was difficult.", right: "The plan worked, albeit with difficulty.", note: "albeit فقط با صفت/قید/عبارت اسمی می‌آید، نه بند کامل با فعل؛ برای بند از although استفاده کنید." },
      { wrong: "Notwithstanding of the delays, we finished.", right: "Notwithstanding the delays, we finished.", note: "notwithstanding خودش حرف اضافه است؛ of اضافه نمی‌گیرد (برخلاف in spite)." },
      { wrong: "The data proves that the drug is safe.", right: "The data suggest that the drug may be safe.", note: "در نوشتار علمی، ادعای مطلق (prove) نادرست است؛ سنجیده بنویسید: suggest + may." },
      { wrong: "He was tired, hence he went to bed.", right: "He was tired; hence, he went to bed. / He was tired and hence went to bed.", note: "hence در سبک ادبی معمولاً با نقطه‌ویرگول یا مستقیم با اسم می‌آید (hence the delay)؛ دو جملهٔ مستقل با کاما و hence اتصال ضعیفی دارند." },
    ],
    tips: [
      "قبل از نوشتن هر ادعا، از خودتان بپرسید: «شواهدم چقدر قوی است؟» — قوی: show/confirm؛ متوسط: suggest/indicate؛ ضعیف: may/seem to. این سه‌پله، ستون اعتبار علمی شماست.",
      "کلمات مطلق (always، never، everyone، destroy، prove) را دشمنان پنهان بدانید؛ هر بار یکی را دیدید، جایگزین نرمش را امتحان کنید.",
      "albeit و notwithstanding را با قاعده‌شان جا بیندازید: albeit + عبارت (نه بند)، notwithstanding + اسم (بدون of) — این دو در امتحان C2 و نوشتار رسمی پرتکرارند.",
      "بعد از نوشتن هر پاراگراف، پیوندهایش را بشمارید: اگر همه سبک بودند، یکی را ارتقا دهید؛ اگر همه سنگین بودند، یکی را سبک کنید — تعادل، امضای سبک است.",
    ],
    quiz: [
      { question: "کدام جمله «نرم‌سازی» (hedging) دارد؟", options: ["Social media destroys mental health.", "Social media may contribute to anxiety.", "Social media always causes anxiety.", "Social media is terrible."], correctIndex: 1, explanation: "may + contribute ادعای سنجیدهٔ علمی است؛ بقیه ادعاهای مطلق‌اند." },
      { question: "«طرح خوب بود، هرچند ناقص» کدام است؟", options: ["The plan was good, albeit it was incomplete.", "The plan was good, albeit incomplete.", "The plan was good, albeit of incomplete.", "The plan was good, albeit was incomplete."], correctIndex: 1, explanation: "albeit فقط با صفت/قید/عبارت می‌آید، نه بند کامل با فعل." },
      { question: "کدام جمله دربارهٔ notwithstanding درست است؟", options: ["Notwithstanding of the rain, we went out.", "Notwithstanding the rain, we went out.", "Notwithstanding to the rain, we went out.", "Notwithstanding was the rain, we went out."], correctIndex: 1, explanation: "notwithstanding مثل despite مستقیماً با اسم می‌آید و حرف اضافه اضافی نمی‌گیرد." },
      { question: "«فروش در آسیا رشد کرد، در حالی که در اروپا افت کرد» کدام پیوند رسمی دارد؟", options: ["but", "whereas", "albeit", "hence"], correctIndex: 1, explanation: "whereas پیوند مقایسهٔ رسمی دو وضعیت متضاد است." },
      { question: "در سبک علمی، جایگزین سنجیدهٔ «The data prove that...» کدام است؟", options: ["The data destroy that...", "The data suggest that...", "The data always show that...", "The data must prove that..."], correctIndex: 1, explanation: "سنجش سه‌پله: قوی show، متوسط suggest، محتاطانه may — prove برای شواهد ناقص ادعای بیش از حد است." },
    ],
  },
];
