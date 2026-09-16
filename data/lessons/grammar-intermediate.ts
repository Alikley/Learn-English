import type { GrammarLesson } from "./types";

// ========================================
// گرامر متوسط — ۱۰ درس واقعی (B1 / B2)
// v1.0.1.3 — بازنویسی کامل با آموزش مفهومی عمیق:
// هر درس = چرا مهم است + ۳ بخش آموزشی چندپاراگرافی
// + قانون در یک نگاه + جدول ساختار + ۸ مثال
// + ۴ اشتباه رایج + نکته‌های طلایی + آزمونک
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-intermediate-01",
    titleFa: "زمان حال کامل",
    titleEn: "Present Perfect",
    cefr: "B1",
    intro:
      "حال کامل، پرمباحث‌ترین زمان انگلیسی است — همان که می‌گوید «به اصفهان رفته‌ام» بدون اینکه بگوید کِی. این زمان پلی است میان گذشته و حال: اتفاقی در گذشته رخ داده، اما اثر یا اعتبارش همین الان هم پابرجاست. فارسی چیزی دقیقاً هم‌شکل آن ندارد و همین باعث می‌شود یادگیری «منطق» آن — نه فقط فرمولش — حیاتی باشد. وقتی این منطق را بفهمید، نیمی از سردرگمی مادام‌العمر زبان‌آموزان فارسی‌زبان حل می‌شود.",
    sections: [
      {
        title: "منطق اصلی: گذشته‌ای که پایش تا الان است",
        paragraphs: [
          "فرمول حال کامل ساده است: have/has + قسمت سوم فعل (past participle). اما منطقش مهم است: این زمان یک اتفاقِ گذشته را از دید «الان» نگاه می‌کند. وقتی می‌گویید I have lost my keys، اتفاق در گذشته رخ داده ولی نتیجه‌اش الان روی میز است: «پس الان نمی‌توانم در را باز کنم». مقایسه کنید با I lost my keys yesterday که فقط گزارش تاریخی می‌دهد و با الان کاری ندارد. تفاوت این دو، تفاوتِ «عکس قدیمی» با «آینهٔ امروز» است.",
          "به همین دلیل، حال کامل تقریباً هرگز با نشانه‌های زمانِ دقیق گذشته (yesterday، in 2020، last week) نمی‌آید؛ چون این نشانه‌ها جمله را به نقطهٔ مشخصی از گذشته «قفل» می‌کنند و حسِ اتصال به حال را می‌شکنند. در عوض، با قیدهای مبهم و «تا الان»ی همراه است: ever، never، already، yet، just، so far، recently. هر کدام از این کلمات یک رنگ خاص به جمله می‌دهند که در بخش بعدی آن‌ها را مرتب می‌کنیم.",
        ],
        examples: [
          { en: "I have lost my keys, so I can't open the door.", fa: "کلیدهایم را گم کرده‌ام، پس نمی‌توانم در را باز کنم. (اثر الان)" },
          { en: "I lost my keys yesterday, but I found them later.", fa: "دیروز کلیدهایم را گم کردم، اما بعداً پیدایشان کردم. (گزارش گذشته)" },
        ],
      },
      {
        title: "دو چهرهٔ اصلی: تجربه و تداوم",
        paragraphs: [
          "چهرهٔ اول «تجربهٔ زندگی» است: اتفاقی که در یک زمان نامشخص قبل از الان رخ داده و برایت مهم است که «تا حالا» اتفاق افتاده، نه اینکه کِی. I have been to Turkey یعنی «تجربهٔ سفر به ترکیه را در کارنامهٔ عمرم دارم». برای سؤال از تجربه‌ها هم همین زمان می‌آید: Have you ever tried sushi? این کاربرد در مکالمهٔ آشنایی و دوستیابی فوق‌العاده پرمصرف است.",
          "چهرهٔ دوم «تداوم تا الان» است، معمولاً با for و since: I have lived here for ten years یعنی «ده سال است اینجا زندگی می‌کنم و هنوز هم هستم». مقایسه‌اش با گذشتهٔ ساده گویاست: I lived here for ten years یعنی «ده سال آنجا زندگی کردم (و دیگر نیستم)». since نقطهٔ شروع را می‌گوید (since 2015، since I was a child) و for طول مدت را (for two hours، for ages). با همین یک تمایز می‌توانید تفاوت «مقیم فعلی» و «ساکن سابق» را بیان کنید — تفاوتی که در فارسی با «است/بود» حل می‌شود.",
        ],
        examples: [
          { en: "Have you ever been to Isfahan?", fa: "تا حالا به اصفهان رفته‌ای؟ (تجربه)" },
          { en: "We have known each other since university.", fa: "از دانشگاه یکدیگر را می‌شناسیم. (تداوم)" },
        ],
      },
      {
        title: "خانوادهٔ قیدها: just، already، yet، ever، never",
        paragraphs: [
          "این پنج قید، همراهان ثابت حال کامل‌اند و جای هرکدام قانون دارد. just یعنی «تازه الان»: I have just finished my homework — اتفاق چند دقیقه پیش رخ داده و طعمش هنوز در دهان جمله است. already یعنی «زودتر از انتظار» و در جملهٔ مثبت و سؤال می‌آید: She has already left? (همین الان رفته؟! چه سریع!). yet هم «تا این لحظه» می‌گوید و فقط در منفی و سؤال می‌نشیند: I haven't eaten yet / Have you finished yet?",
          "ever و never هم دنیای تجربه را می‌سازند: ever در سؤال (Have you ever seen snow?) و never در پاسخ منفیِ قاطع (I have never seen snow — که همانان I haven't ever seen است اما محکم‌تر). یک نکتهٔ ظریف و مهم جای این قیدها: just و already و never بین have/has و قسمت سوم می‌نشینند (I have just eaten)، اما yet همیشه انتهای جمله می‌آید (I haven't eaten yet). این چیدمان اگر جا بیفتد، جمله‌هایتان از روز اول طبیعی و بومی‌گونه ساخته می‌شوند.",
        ],
        examples: [
          { en: "I have just finished my homework.", fa: "تازه تکلیفم را تمام کردم. (just وسط)" },
          { en: "Has she arrived yet?", fa: "تا الان رسیده؟ (yet آخر جمله)" },
        ],
      },
    ],
    rule:
      "حال کامل = have/has + قسمت سوم فعل؛ برای تجربهٔ زندگی (ever/never)، اتفاق با اثرِ الان (I have lost my keys) و تداوم تا حال (for/since). با زمان‌های دقیق گذشته (yesterday، last year) نمی‌آید؛ به‌جایش: just، already، yet، ever، never، so far. قیدهای just/already/never بین have و participle، ولی yet انتهای جمله. مقایسه: I have lived here for 5 years (هنوز هستم) ≠ I lived here for 5 years (دیگر نیستم).",
    form: [
      { label: "مثبت", pattern: "I/You/We/They have worked · He/She/It has worked" },
      { label: "منفی", pattern: "I haven't seen it. · She hasn't called me." },
      { label: "سؤال", pattern: "Have you finished? · Has he arrived yet?" },
      { label: "تجربه", pattern: "Have you ever...? · I have never..." },
      { label: "تداوم", pattern: "for + مدت (for two years) · since + نقطهٔ شروع (since 2020)" },
      { label: "قیدهای همراه", pattern: "I have just eaten. · already وسط · yet آخر جمله" },
    ],
    examples: [
      { en: "I have finished the report already.", fa: "گزارش را همین الان تمام کرده‌ام." },
      { en: "She has never eaten sushi before.", fa: "او هیچ‌وقت سوشی نخورده است. (تجربه)" },
      { en: "We haven't seen each other since last spring.", fa: "از بهستان گذشته یکدیگر را ندیده‌ایم." },
      { en: "Have you ever ridden a horse?", fa: "تا حالا اسب سواری کرده‌ای؟" },
      { en: "He has just come home from work.", fa: "تازه از سر کار به خانه آمده است." },
      { en: "They have been married for twenty years.", fa: "بیست سال است که ازدواج کرده‌اند. (تداوم)" },
      { en: "I'm not hungry; I have already had lunch.", fa: "گرسنه نیستم؛ ناهارم را خورده‌ام." },
      { en: "The train hasn't arrived yet.", fa: "قطار هنوز نرسیده است." },
    ],
    mistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", note: "زمان دقیق گذشته (yesterday) جمله را قفل می‌کند؛ با حال کامل نمی‌آید و باید گذشتهٔ ساده شود." },
      { wrong: "She has went home.", right: "She has gone home.", note: "بعد از have/has باید قسمت سوم فعل بیاید: gone، نه went." },
      { wrong: "I am here since morning.", right: "I have been here since morning.", note: "تداوم تا الان با حال کامل بیان می‌شود: have been، نه حال سادهٔ am." },
      { wrong: "I haven't finished already.", right: "I haven't finished yet.", note: "already برای مثبت و سؤال؛ در منفی جای آن را yet می‌گیرد و آخر جمله می‌نشیند." },
    ],
    tips: [
      "قبل از انتخاب زمان، از خودتان بپرسید: «مهم است که الان هم اثرش هست؟» بله → حال کامل؛ فقط گزارش تاریخی است → گذشتهٔ ساده.",
      "سهماههٔ قیدها را با یک جمله به خاطر بسپارید: I have just eaten already?!... I haven't eaten yet! — جای just و already وسط، yet آخر.",
      "برای for و since این فرمول: since = نقطهٔ شروع ساعت (since 8 o'clock)، for = طول زمان (for three hours).",
      "هر روز یک تجربهٔ تازه به انگلیسی گزارش کنید: I have never tried... / I have just... — این زمان با تجربه‌های واقعی زندگی جا می‌افتد.",
    ],
    quiz: [
      { question: "کدام جمله درست است؟", options: ["I have visited Paris last year.", "I visited Paris last year.", "I have visit Paris last year.", "I have been visiting Paris last year."], correctIndex: 1, explanation: "last year زمان دقیق گذشته است؛ جمله باید گذشتهٔ ساده شود." },
      { question: "«ده سال است که او را می‌شناسم» کدام است؟", options: ["I know him since ten years.", "I have known him for ten years.", "I knew him for ten years.", "I have know him since ten years."], correctIndex: 1, explanation: "تداوم تا الان با حال کامل + for + مدت: I have known him for ten years." },
      { question: "جای yet در کدام جمله درست است؟", options: ["I yet haven't finished.", "I haven't finished yet.", "I haven't yet.", "Yet I haven't finished it."], correctIndex: 1, explanation: "yet در جملهٔ منفی و سؤال، انتهای جمله می‌نشیند." },
      { question: "قسمت سوم فعل «write» چیست؟", options: ["wrote", "writed", "written", "writing"], correctIndex: 2, explanation: "write → wrote → written؛ بعد از have باید written بیاید." },
      { question: "تفاوت «I have lost my phone» و «I lost my phone yesterday» چیست؟", options: ["هیچ تفاوتی ندارند", "اولی تأکید بر اثر الان دارد، دومی گزارش تاریخی است", "اولی قدیمی‌تر است", "دومی غلط است"], correctIndex: 1, explanation: "حال کامل نتیجهٔ الان را نشان می‌دهد (الان گوشی ندارم!)؛ گذشتهٔ ساده فقط اتفاق را گزارش می‌کند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-02",
    titleFa: "گذشته استمراری و ترکیب با گذشته ساده",
    titleEn: "Past Continuous",
    cefr: "B1",
    intro:
      "گذشته استمراری، دوربین فیلم‌برداریِ دیروز است: می‌گوید در یک لحظه از گذشته چه اتفاقی «در حال رخ دادن» بود. قدرت واقعی این زمان در ترکیبش با گذشتهٔ ساده آشکار می‌شود — برای تعریف داستان: پس‌زمینه با استمراری جلوه داده می‌شود و اتفاق ناگهانی با ساده. اگر این تقسیم نقش را یاد بگیرید، داستان‌گویی انگلیسی‌تان از سطح «گزارش رخداد» به سطح «سینما» ارتقا می‌یابد.",
    sections: [
      {
        title: "ساخت و معنا: was/were + ing",
        paragraphs: [
          "ساختار گذشته استمراری آشناست: was/were + فعل + ing. فعل be در گذشته دو شکل دارد: was برای I/he/she/it و were برای you/we/they؛ و همان قواعد املایی ing (writing، swimming، lying) اینجا هم برقرار است. معنای این زمان «رویدادِ در جریان در یک نقطه از گذشته» است: At eight o'clock last night, I was having dinner — ساعت هشت دیشب، دوربین روشن بود و من وسط شام بودم.",
          "نکتهٔ کلیدی این زمان «زنجیر بودن» است: وقتی می‌گویید It was raining all day yesterday، باران مثل نخ ابریشم از ابتدای روز تا انتهایش ادامه داشته. مقایسه‌اش با گذشتهٔ ساده گویاست: It rained yesterday فقط می‌گوید باران آمد (شاید ده دقیقه، شاید سه بار جدا)؛ اما It was raining yesterday حس پیوستگی و طول می‌دهد. برای کارهای موازی هم همین زمان است: While I was cooking, my sister was watching TV — دو دوربین که همزمان روشن‌اند.",
        ],
        examples: [
          { en: "At nine o'clock, we were waiting for the bus.", fa: "ساعت نه، منتظر اتوبوس بودیم. (دوربین روشن)" },
          { en: "It was raining all morning.", fa: "تمام صبح باران می‌آمد. (پیوستگی)" },
        ],
      },
      {
        title: "ترکیب طلایی: was + when/during + گذشتهٔ ساده",
        paragraphs: [
          "مشهورترین ساختار این درس، جفتِ «پس‌زمینه + اتفاق» است: I was walking home when I saw an accident. جملهٔ استمراری صحنه را می‌چیند (در حال قدم زدن بودم) و جملهٔ ساده اتفاق ناگهانی را می‌کوبد (تصادف را دیدم). کلمهٔ when معمولاً این دو را به هم وصل می‌کند و جای دو جمله هم می‌تواند عوض شود: When I saw an accident, I was walking home — معنا همان است، فقط دوربین از زاویهٔ دیگر فیلم می‌گیرد.",
          "نکتهٔ انتخابی مهم: کدام فعل استمراری و کدام ساده شود؟ پاسخ: «عمل طولانی‌تر یا زمینه‌ساز» استمراری می‌شود و «عمل کوتاه‌تر و ناگهانی» ساده. تصور کنید دوربین روی عمل بلندتر است و اتفاق کوتاه وسط آن می‌افتد. while هم معمولاً با استمراری می‌آید چون «طول کشیدن» را تأکید می‌کند: While she was studying, the phone rang. اگر هر دو عمل هم‌طول و هم‌زمان باشند، هر دو استمراری می‌شوند: While I was cooking, she was setting the table.",
        ],
        examples: [
          { en: "I was walking home when I saw an accident.", fa: "به خانه برمی‌گشتم که تصادفی را دیدم." },
          { en: "While she was studying, the phone rang.", fa: "وقتی درس می‌خواند، تلفن زنگ خورد." },
        ],
      },
      {
        title: "کاربرد مودبانه و حالت‌های ویژه",
        paragraphs: [
          "یک کاربرد لطیف این زمان در مکالمهٔ مؤدبانه است: برای درخواست‌ها و خبرهای ناگهانی از was/were + hoping/wondering استفاده می‌شود که نرمی و ملاحظه را می‌رساند: I was wondering if you could help me — «فکر می‌کردم شاید بتونی کمکم کنی» (خیلی مؤدبانه‌تر از Can you help me?). در تلفن هم: I was hoping to speak to Mr Ahmadi یعنی «امیدوار بودم با آقای احمدی صحبت کنم». این جملات در زبان ادبی و ادب تجاری رایج‌اند.",
          "همچنین باید بدانید فعل‌های حالی (know، want، like...) که در حالِ استمراری نمی‌آیند، در گذشتهٔ استمراری هم ممنوع‌اند: I was knowing غلط است. و برعکس، some verbs مثل feel و work و rain در هر دو حالت ساده و استمراری می‌آیند بدون تغییر محسوس معنا. تمرین پیشنهادی: دیروز بعدازظهر ساعت پنج دقیقه بنویسید در آن لحظه چه می‌کردید و بعد یک اتفاق ناگهانی به آن اضافه کنید؛ این همان اسکلت داستان‌سازی حرفه‌ای است.",
        ],
        examples: [
          { en: "I was wondering if you could help me.", fa: "فکر می‌کردم شاید بتوانید کمکم کنید. (مؤدبانه)" },
          { en: "The sun was shining and the birds were singing.", fa: "خورشید می‌تابید و پرنده‌ها آواز می‌خواندند. (صحنه‌پردازی)" },
        ],
      },
    ],
    rule:
      "گذشتهٔ استمراری = was/were + ing؛ برای عملِ در جریان در یک لحظه از گذشته، کارهای موازی و صحنه‌پردازی داستان. ترکیب داستانی: عمل طولانی/پس‌زمینه استمراری + عمل کوتاه/ناگهانی ساده، معمولاً با when یا while: I was walking when I saw him. فعل‌های حالی (know، want) استمراری نمی‌شوند. کاربرد مؤدبانه: I was wondering if you could... .",
    form: [
      { label: "مثبت", pattern: "I/He/She/It was working · You/We/They were working" },
      { label: "منفی", pattern: "She wasn't sleeping · We weren't listening" },
      { label: "سؤال", pattern: "Were you watching TV? · What was he doing?" },
      { label: "ترکیب داستانی", pattern: "I was reading when the lights went out." },
      { label: "موازی", pattern: "While I was cooking, she was studying." },
      { label: "مؤدبانه", pattern: "I was wondering if you could help me." },
    ],
    examples: [
      { en: "What were you doing at ten o'clock last night?", fa: "دیشب ساعت ده چه می‌کردی؟" },
      { en: "They were playing football in the rain.", fa: "آن‌ها زیر باران فوتبال بازی می‌کردند." },
      { en: "I was sleeping when the earthquake started.", fa: "خواب بودم که زلزله شروع شد." },
      { en: "While we were waiting, we drank some tea.", fa: "وقتی منتظر بودیم، کمی چای نوشیدیم." },
      { en: "She wasn't wearing a coat, so she was cold.", fa: "کت نپوشیده بود، برای همین سرما خورد." },
      { en: "The children were making a lot of noise all evening.", fa: "بچه‌ها تمام عصر سر و صدا می‌کردند." },
      { en: "He broke his leg while he was skiing.", fa: "وقتی اسکی می‌کرد پایش را شکست." },
      { en: "At midnight, it was still raining.", fa: "نیمه‌شب هنوز باران می‌آمد." },
    ],
    mistakes: [
      { wrong: "I was study when she called.", right: "I was studying when she called.", note: "بعد از was/were باید ing بیاید؛ دو تکهٔ زمان از هم جدا نمی‌شوند." },
      { wrong: "While I watched TV, my brother was reading.", right: "While I was watching TV, my brother was reading.", note: "عمل پس‌زمینه‌ای که با while می‌آید باید استمراری باشد؛ عمل کوتاه با when می‌آید." },
      { wrong: "I was knowing the answer.", right: "I knew the answer.", note: "know فعل حالی است و در هیچ استمراری‌ای نمی‌نشیند." },
      { wrong: "When the phone was ringing, I answered it.", right: "When the phone rang, I answered it.", note: "زنگ خوردن اتفاق کوتاه و ناگهانی است؛ باید گذشتهٔ ساده باشد نه استمراری." },
    ],
    tips: [
      "قاعدهٔ فیلم‌برداری: دوربین روی عملِ طولانی است (استمراری)؛ اتفاق کوتاه وسط فیلم می‌افتد (ساده). این استعاره، انتخاب فعل را غریزی می‌کند.",
      "دو عمل هم‌طول و هم‌زمان → هر دو استمراری؛ یک بلند و یک کوتاه → بلندی استمراری، کوتاهی ساده.",
      "برای شروع یک داستان، اول صحنه را با استمراری بچینید (It was a cold night. The wind was blowing...) و بعد رویدادها را با ساده پیش ببرید.",
      "از was wondering if you could... برای درخواست‌های مؤدبانه استفاده کنید؛ این قالب در ایمیل و مکالمهٔ رسمی، لحن شما را حرفه‌ای می‌کند.",
    ],
    quiz: [
      { question: "«وقتی او آمد، من در حال مطالعه بودم» کدام است؟", options: ["When he came, I studied.", "When he was coming, I studied.", "When he came, I was studying.", "When he comes, I was studying."], correctIndex: 2, explanation: "آمدن = اتفاق کوتاه (ساده)؛ مطالعه = عمل طولانی پس‌زمینه (استمراری)." },
      { question: "کدام فعل گذشته استمراری نمی‌شود؟", options: ["run", "watch", "believe", "cook"], correctIndex: 2, explanation: "believe فعل حالی (ذهنی) است: I believed، نه I was believing." },
      { question: "دو عمل هم‌زمان و هم‌طول: «من آشپزی می‌کردم و او درس می‌خواند» کدام است؟", options: ["I cooked while he studied.", "I was cooking while he was studying.", "I was cooking while he studies.", "I cook while he was studying."], correctIndex: 1, explanation: "دو عمل هم‌طول و هم‌زمان → هر دو گذشته استمراری." },
      { question: "در «I was walking home when I saw Ali» کدام عمل ناگهانی است؟", options: ["walking", "seeing Ali", "هر دو", "هیچ‌کدام"], correctIndex: 1, explanation: "دیدن علی اتفاق کوتاه و بریده‌کنندهٔ صحنه است؛ قدم زدن پس‌زمینهٔ طولانی است." },
      { question: "درخواست مؤدبانه با کدام جمله ساخته می‌شود؟", options: ["I wonder you can help me.", "I was wondering if you could help me.", "I wondered if you can help me.", "I am wondering you could help me."], correctIndex: 1, explanation: "I was wondering if you could... قالب مؤدبانهٔ رایج درخواست در انگلیسی است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-03",
    titleFa: "used to و would",
    titleEn: "used to & would",
    cefr: "B1",
    intro:
      "برای حرف زدن دربارهٔ «عادت‌های قدیمی که دیگر نیستند» و «خاطره‌های تکرارشونده»، انگلیسی دو ابزار دوست‌داشتنی دارد: used to و would. این ساختارها ستون فقرات روایتِ خاطره‌اند — «سال‌ها پیش هر تابستان به شمال می‌رفتیم»، «بابام همیشه برایمان قصه می‌گفت». اگر می‌خواهید از محدودهٔ زمان‌های خشک فراتر بروید و حس نوستالژی را به انگلیسی منتقل کنید، این درس نقطهٔ شروع شماست.",
    sections: [
      {
        title: "used to: عادتی که مُهر پایان خورده",
        paragraphs: [
          "ساختار used to + فعل ساده، یک عادت یا وضعیتِ گذشته را نشان می‌دهد که «دیگر ادامه ندارد»: I used to play football every day (قبلاً هر روز فوتبال بازی می‌کردم — الان نه). مهم‌ترین ویژگی این ساختار «پایان داشتن» است؛ همین حال و حالِ «دیگر نیست» به جمله رنگ خاطره می‌دهد. نکتهٔ کاربردی فوق‌العاده: used to هم برای «عمل» به کار می‌رود (play، go، smoke) و هم برای «وضعیت» (be، have، live): I used to be shy / She used to have long hair — کاری که would نمی‌تواند بکند!",
          "ساختار منفی و سؤالِ used to ظرافت دارد: در گفتار روزمره didn't use to و Did you use to...? می‌آید (بدون d دوم، چون بعد از did فعل به شکل ساده برمی‌گردد): I didn't use to like coffee. در متون قدیمی‌تر و رسمی‌تر used not to / usedn't to هم دیده می‌شود اما امروزه رایج نیست. برای اینکه بین used to (فعل) و be used to (عادت کردن به) گیج نشوید این ترفند را یادتان باشد: بعد از used toی گذشته، «فعل برهنه» می‌آید (used to swim) اما بعد از be used to، «ing یا اسم» می‌آید (am used to swimming = به شنا عادت دارم).",
        ],
        examples: [
          { en: "I used to play football every day after school.", fa: "قبلاً هر روز بعد از مدرسه فوتبال بازی می‌کردم." },
          { en: "She didn't use to like spicy food.", fa: "او قبلاً غذای تند دوست نداشت." },
          { en: "There used to be a cinema in our street.", fa: "قبلاً در خیابان ما سینمایی بود. (وضعیت)" },
        ],
      },
      {
        title: "would: قصهٔ تکرارهای دلخواه",
        paragraphs: [
          "would هم می‌تواند عادت گذشته را نشان دهد: Every summer, we would go to the Caspian sea (هر تابستان به دریای خزر می‌رفتیم). استفاده از would برای عادت، لحن ادبی و قصه‌گونه دارد؛ انگار راوی با لبخند به تکرارهای قدیمی نگاه می‌کند: My grandfather would tell us stories every night — «پدربزرگم هر شب برایمان قصه می‌گفت». در روایت ادبی و خاطره‌نویسی، این would حسابی حس ایجاد می‌کند.",
          "اما یک محدودیت مهم: would فقط برای «عمل» می‌آید، نه وضعیت. می‌توان گفت He would smoke (عمل)، اما He would be a teacher غلط است — برای وضعیت‌های گذشته فقط used to می‌نشیند: He used to be a teacher. همچنین would عادت گذشته بدون زمینهٔ زمانی روشن، با احتمال اشتباه گرفته‌شدن به «آینده در گذشته» روبه‌روست؛ پس معمولاً با قید زمانی شروع می‌شود: When I was a child, we would... . قاعدهٔ سرانگشتی: عمل تکراریِ خاطره‌انگیز → would؛ وضعیت قدیمی → فقط used to؛ شک داری → used to همیشه جواب می‌دهد.",
        ],
        examples: [
          { en: "When I was a child, we would visit our cousins every Friday.", fa: "وقتی بچه بودم، هر جمعه به دیدن پسرخاله‌ها می‌رفتیم." },
          { en: "My grandfather would tell us stories every night.", fa: "پدربزرگم هر شب برایمان قصه می‌گفت." },
        ],
      },
      {
        title: "جایگزین مدرن: حال ساده با زمینهٔ زمانی گذشته",
        paragraphs: [
          "جالب است بدانید در انگلیسی معاصر، به‌ویژه در گفتار آمریکایی، used to جای خود را کمی به گذشتهٔ ساده با قید زمان داده است: I played football every day when I was young هم دقیقاً همان معنا را می‌رساند. تفاوت فقط «رنگ» است: used to روی «تمام‌شدگی» عادت تأکید می‌کند و حس نوستالژی دارد؛ گذشتهٔ ساده گزارش خنثاست. در نوشتن خاطره، ترکیب هر سه ابزار (used to، would، گذشتهٔ ساده) متن شما را یکنواخت نمی‌کند و ریتم قصه‌گو می‌دهد.",
          "یک اشتباه رایج دیگر: استفاده از used to برای «حال». جملهٔ I use to drink tea صبح‌ها (به معنای الان) وجود ندارد؛ برای عادت فعلی حال ساده می‌آید: I drink tea every morning. used to ذاتاً «گذشته و تمام‌شده» است و present ندارد. و در نهایت، به تفاوت سه‌گانهٔ صوتی دقت کنید: I used to play (یوس‌تو — عادت گذشته)، I am used to playing (عادت داشتن به)، I use it (استفاده کردن). این سه جمله را بلند تکرار کنید تا گوش‌تان الگوها را از هم بازشناسد.",
        ],
        examples: [
          { en: "I played the violin when I was at school.", fa: "وقتی مدرسه بودم ویولن می‌نواختم. (رایج معاصر)" },
          { en: "I am used to getting up early.", fa: "به زود بیدار شدن عادت دارم. (be used to + ing ≠ used to) " },
        ],
      },
    ],
    rule:
      "used to + فعل ساده = عادت یا وضعیتِ گذشته که تمام شده (I used to smoke / There used to be...). منفی: didn't use to (بدون d). would + فعل ساده = عملِ تکراریِ گذشته با لحن قصه‌گو؛ فقط برای عمل، نه وضعیت (He would smoke ✓ / He would be a teacher ✗). برای عادت فعلی used to نداریم؛ حال ساده می‌آید. تفاوت: used to play (عادت گذشته) ≠ am used to playing (عادت داشتن به) ≠ use (استفاده کردن).",
    form: [
      { label: "used to مثبت", pattern: "I used to live in Tabriz. / She used to have long hair." },
      { label: "used to منفی", pattern: "I didn't use to like coffee. (بدون d)" },
      { label: "used to سؤال", pattern: "Did you use to play an instrument?" },
      { label: "would برای عمل", pattern: "Every night he would read us a story." },
      { label: "وضعیت فقط با used to", pattern: "He used to be a soldier. (نه would be)" },
      { label: "be used to (جدا!)", pattern: "I am used to living alone. (عادت داشتن به + ing)" },
    ],
    examples: [
      { en: "I used to be afraid of the dark.", fa: "قبلاً از تاریکی می‌ترسیدم. (وضعیت)" },
      { en: "We would spend hours playing in the yard.", fa: "ساعت‌ها در حیاط بازی می‌کردیم. (خاطره)" },
      { en: "She didn't use to wear glasses.", fa: "او قبلاً عینک نمی‌زد." },
      { en: "There used to be a bakery on this corner.", fa: "قبلاً در این گوشه نانوایی بود." },
      { en: "My mother would bake cookies every Thursday.", fa: "مادرم هر پنجشنبه کلوچه می‌پخت." },
      { en: "Did you use to have a bicycle when you were a kid?", fa: "وقتی بچه بودی دوچرخه داشتی؟" },
      { en: "I used to drink coffee, but now I prefer tea.", fa: "قبلاً قهوه می‌نوشیدم، اما الان چای را ترجیح می‌دهم." },
      { en: "He is used to working at night.", fa: "او به کار شبانه عادت دارد. (be used to)" },
    ],
    mistakes: [
      { wrong: "I used to smoking.", right: "I used to smoke.", note: "بعد از used toی «عادت گذشته» فعل برهنه می‌آید؛ ing مالِ be used to است." },
      { wrong: "He would be a doctor in that town.", right: "He used to be a doctor in that town.", note: "would برای عادت فقط با «عمل» می‌آید؛ وضعیت (be، have، live) فقط used to می‌گیرد." },
      { wrong: "I didn't used to like fish.", right: "I didn't use to like fish.", note: "بعد از did، use به شکل ساده برمی‌گردد؛ d دوم حذف می‌شود." },
      { wrong: "I use to drink tea every morning now.", right: "I drink tea every morning now.", note: "برای عادتِ فعلی حال ساده به کار می‌رود؛ used to مخصوص گذشتهٔ تمام‌شده است." },
    ],
    tips: [
      "سه‌گانهٔ صوتی را با یک نفس تمرین کنید: I used to play → I am used to playing → I use it — و هرکدام را در یک جملهٔ واقعی به کار ببرید.",
      "در قصهٔ خاطره‌ها اول چارچوب زمانی را با used to بکشید (I used to spend summers...) و بعد تکرارهای شیرین را با would روشن کنید (we would swim، we would build...).",
      "قاعدهٔ نجات‌بخش: شک داری بین used to و would؟ used to بگذار — هم عمل می‌پذیرد هم وضعیت.",
      "برای گفتن «دیگر آن عادت را ندارم» از used to + anymore استفاده کنید: I don't smoke anymore, but I used to.",
    ],
    quiz: [
      { question: "«قبلاً شیراز زندگی می‌کردم» کدام است؟", options: ["I would live in Shiraz.", "I used to live in Shiraz.", "I am used to live in Shiraz.", "I use to live in Shiraz."], correctIndex: 1, explanation: "زندگی کردن وضعیت است؛ only used to برای وضعیت‌های گذشته می‌آید." },
      { question: "کدام جمله «عادت کردن» را می‌رساند نه عادت گذشته را؟", options: ["I used to work at night.", "I would work at night.", "I am used to working at night.", "I work at night."], correctIndex: 2, explanation: "be used to + ing یعنی «به چیزی عادت داشتن»؛ دو تای دیگر عادت گذشته‌اند." },
      { question: "«هر جمعه به دیدن مادربزرگ می‌رفتیم» با لحن قصه‌گو:", options: ["We would visit grandmother every Friday.", "We used to visiting grandmother every Friday.", "We would visiting grandmother every Friday.", "We are used to visit grandmother every Friday."], correctIndex: 0, explanation: "would + فعل ساده برای عمل تکراری گذشته با حس خاطره." },
      { question: "شکل منفی «I used to like cartoons» چیست؟", options: ["I used not to like cartoons.", "I didn't used to like cartoons.", "I didn't use to like cartoons.", "I don't use to like cartoons."], correctIndex: 2, explanation: "بعد از didn't، use بدون d می‌آید: didn't use to." },
      { question: "کدام ساختار برای «وضعیتِ» گذشته (مثل داشتن موی بلند) غلط است؟", options: ["She used to have long hair.", "She would have long hair.", "She had long hair when she was young.", "She used to wear her hair long."], correctIndex: 1, explanation: "would برای وضعیت‌ها نمی‌آید؛ have در این معنا وضعیت است نه عمل تکراری." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-04",
    titleFa: "جملات شرطی نوع صفر و یک",
    titleEn: "Zero & First Conditional",
    cefr: "B1",
    intro:
      "جملهٔ شرطی، ماشینِ «اگر... آنگاه...» است: دو نیمه که با یک بست به هم دوخته شده‌اند. انگلیسی برای انواعِ مختلفِ «اگر»، مدارهای متفاوتی دارد و در این درس با دو تای اول آشنا می‌شوید: نوع صفر برای قوانین همیشگی و نوع یک برای احتمال‌های واقعیِ آینده. تفکیک این دو، پایهٔ فهم شرطی‌های سخت‌تر (نوع دو و سه) است که در درس‌های بعدی می‌آیند؛ پس این درس را محکم بخوانید.",
    sections: [
      {
        title: "نوع صفر: ماشینِ قانون",
        paragraphs: [
          "شرطی صفر برای «قوانین همیشگی» است: هر وقت شرط برقرار شود، نتیجه هم می‌آید؛ بدون استثنا و بدون زمان. ساختارش: if + حال ساده، حال ساده. If you heat ice, it melts — هر بار، همیشه، در هر آزمایشگاه. این ساختار برای قوانین طبیعت، حقایق علمی، قوانین ریاضی و عادت‌های قطعی به کار می‌رود: If I drink coffee at night, I can't sleep (قانون شخصیِ بدن من!).",
          "نکتهٔ ساختاری مهم: در دو نیمهٔ این جمله هیچ will یا آینده‌ای نیست؛ چون حرف از «همیشه» است نه «فردا». می‌توانید جای دو نیمه را عوض کنید: Ice melts if you heat it — فقط یادتان باشد که وقتی if وسط جمله بیاید، قبلش کاما لازم نیست. جایگزین‌های if در این ساختار: when (وقتی که) و whenever (هر وقت که) با همان معنای قانون‌گونه. خانوادهٔ سیگنال‌های این نوع: every time، unless (مگر اینکه) برای منفی‌سازی قانون.",
        ],
        examples: [
          { en: "If you heat water to 100 degrees, it boils.", fa: "اگر آب را تا ۱۰۰ درجه گرم کنید، می‌جوشد." },
          { en: "If I don't sleep well, I get a headache.", fa: "اگر خوب نخوابم، سردرد می‌گیرم. (قانون بدنم)" },
        ],
      },
      {
        title: "نوع یک: ماشینِ احتمال",
        paragraphs: [
          "شرطی یک دربارهٔ «آیندهٔ ممکن و واقعی» است: شرطی که برآورده شدنش محتمل است و نتیجه‌اش هم واقعی خواهد بود. ساختارش: if + حال ساده، will + فعل ساده. If it rains tomorrow, we will stay home — فردا ممکن است باران ببارد (واقعاً ممکن!) و در آن صورت می‌مانیم. توجه کنید که نیمهٔ if در این ساختار همیشه «حال ساده» است حتی با اینکه معنایش آینده است — این مهم‌ترین قانون فنی این درس است: آینده فقط در نیمهٔ نتیجه ظاهر می‌شود.",
          "دقت کنید چرا نیمهٔ شرط حال می‌آید: زبان انگلیسی «will» را مثل بلیت سفر فقط یک‌بار به هر جمله می‌دهد. اگر نیمهٔ if هم will می‌گرفت، دو بلیت می‌شد و جمله دوبار آینده می‌گفت — خلاف عرف. پس قانون را این‌طور حفظ کنید: will هیچ‌وقت بی‌درنگ بعد از if نمی‌نشیند (استثنای محترمانه‌ای در انگلیسی رسمی برای will به معنای «تمایل» وجود دارد اما فعلاً نادیده‌اش بگیرید). به‌جای will در نیمهٔ نتیجه می‌توانید از can، may، might یا حال استمراری برای برنامه‌ها استفاده کنید تا جمله طبیعی‌تر شود: If you finish early, we can go out.",
        ],
        examples: [
          { en: "If it rains tomorrow, we will cancel the trip.", fa: "اگر فردا باران ببارد، سفر را لغو می‌کنیم." },
          { en: "If you study hard, you will pass the exam.", fa: "اگر سخت درس بخوانی، در آزمون قبول می‌شوی." },
        ],
      },
      {
        title: "تفکیک صفر و یک + unless و جای if",
        paragraphs: [
          "برای انتخاب بین این دو نوع، سؤال طلایی این است: «حرف از همیشه است یا از یک بارِ آینده؟» همیشه و قانون → صفر (هر دو نیمه حال ساده)؛ یک بارِ محتمل در آینده → یک (if حال + will). مقایسه کنید: If you press this button, the machine starts (همیشه؛ دفترچهٔ راهنما) با If you press this button now, the machine will start (این بار؛ فرمان عملی). تفاوت ظریف است اما انگلیسی‌زبان آن را کاملاً حس می‌کند.",
          "unless یعنی «مگر اینکه / اگر... نه» و مثل if منفی عمل می‌کند: Unless you hurry, you will miss the bus یعنی «اگر عجله نکنی، اتوبوس را از دست می‌دهی». دقت کنید بعد از unless دیگر not نمی‌آید چون خودش منفی است. همچنین در انگلیسی روزمره، شرط‌ها گاهی بدون if هم بیان می‌شوند: با ترتیب سؤالی (Should you need help, call me — رسمی) یا با in case (مثل if اما به معنای «به‌احتیال»): Take an umbrella in case it rains. این تنوع، نوشتار و گفتارتان را از تکرار خلاص می‌کند.",
        ],
        examples: [
          { en: "Unless you hurry, you will miss the bus.", fa: "مگر اینکه عجله کنی، اتوبوس را از دست می‌دهی." },
          { en: "Take an umbrella in case it rains.", fa: "چتر بردار (به‌احتیال که باران بیاید)." },
        ],
      },
    ],
    rule:
      "شرطی صفر (قانون همیشگی): if + حال ساده، حال ساده — If you heat ice, it melts. شرطی یک (احتمال واقعی آینده): if + حال ساده، will + فعل ساده — If it rains, we will stay home. بعد از if هرگز will نمی‌آید؛ آینده فقط در نیمهٔ نتیجه. unless = اگر... نه (خودش منفی است). جای دو نیمه قابل تعویض است؛ اگر if اول باشد، بعدش کاما می‌آید. انتخاب: همیشه/قانون → صفر؛ یک بارِ آینده → یک.",
    form: [
      { label: "نوع صفر", pattern: "If + حال ساده، حال ساده → If you heat ice, it melts." },
      { label: "نوع یک", pattern: "If + حال ساده، will + فعل → If it rains, we will stay home." },
      { label: "نتیجه با can/may", pattern: "If you finish early, we can go out." },
      { label: "unless", pattern: "Unless you hurry, you will be late. (= if you don't hurry)" },
      { label: "when جایگزین", pattern: "When I get home, I'll call you. (قطعی‌تر از if)" },
    ],
    examples: [
      { en: "If you mix blue and yellow, you get green.", fa: "اگر آبی و زرد را مخلوط کنی، سبز می‌شود. (صفر)" },
      { en: "If she calls me, I will answer immediately.", fa: "اگر به من زنگ بزند، فوراً جواب می‌دهم. (یک)" },
      { en: "If you don't water the plants, they die.", fa: "اگر به گیاهان آب ندهی، می‌خشکند. (قانون)" },
      { en: "We will go to the beach if the weather is nice.", fa: "اگر هوا خوب باشد به ساحل می‌رویم." },
      { en: "If I see him, I will tell him the news.", fa: "اگر او را ببینم، خبر را به او می‌گویم." },
      { en: "Unless we leave now, we won't catch the train.", fa: "مگر اینکه الان برویم، قطار را نمی‌گیریم." },
      { en: "If you heat chocolate, it melts quickly.", fa: "اگر شکلات را گرم کنی، سریع ذوب می‌شود." },
      { en: "I'll help you with your homework if you want.", fa: "اگر بخواهی در تکلیفت کمکت می‌کنم." },
    ],
    mistakes: [
      { wrong: "If it will rain tomorrow, we will stay home.", right: "If it rains tomorrow, we will stay home.", note: "بعد از if فعل حال می‌آید؛ will فقط در نیمهٔ نتیجه جایز است." },
      { wrong: "If you will heat ice, it melts.", right: "If you heat ice, it melts.", note: "قانون همیشگی (نوع صفر) هیچ willی ندارد؛ هر دو نیمه حال ساده‌اند." },
      { wrong: "Unless you don't hurry, you will be late.", right: "Unless you hurry, you will be late.", note: "unless خودش معنای منفی دارد؛ adding not آن را دوبار منفی می‌کند." },
      { wrong: "If you mix red and white, you will get pink.", right: "If you mix red and white, you get pink.", note: "نتیجهٔ همیشگی و قانون‌مند است؛ نوع صفر می‌خواهد نه یک." },
    ],
    tips: [
      "قانون طلایی را قاب کنید: «will هرگز بلافاصله بعد از if نمی‌نشیند» — این یک قانون، نیمی از خطاهای شرطی را حذف می‌کند.",
      "برای انتخاب نوع، بپرسید: «قانون همیشه‌ true است یا شانسِ یک بارِ آینده؟» قانون → صفر؛ شانس → یک.",
      "unless را این‌طور ترجمه کنید: «مگر اینکه...» — و یادتان باشد بعدش نه not می‌آید نه will.",
      "سه قانون طبیعت و سه برنامهٔ فردای خودتان را با این ساختارها بنویسید؛ موضوع آشنا، ماندگاری گرامر را بالا می‌برد.",
    ],
    quiz: [
      { question: "«اگر فردا باران ببارد، خانه می‌مانیم» کدام است؟", options: ["If it will rain tomorrow, we stay home.", "If it rains tomorrow, we will stay home.", "If it rains tomorrow, we stay home.", "If it will rain tomorrow, we will stay home."], correctIndex: 1, explanation: "شرطی یک: if + حال ساده (rains)، نتیجه با will (will stay)." },
      { question: "«اگر آب را سرد کنی، یخ می‌زند» — این قانون همیشگی با کدام ساختار درست است؟", options: ["If you cool water, it will freeze.", "If you will cool water, it freezes.", "If you cool water, it freezes.", "If you cooled water, it freezes."], correctIndex: 2, explanation: "شرطی صفر: هر دو نیمه حال ساده؛ قانون همیشگی will ندارد." },
      { question: "«مگر اینکه عجله کنی، دیر می‌کنی» کدام است؟", options: ["Unless you hurry, you will be late.", "Unless you don't hurry, you will be late.", "Unless you will hurry, you are late.", "Unless you hurry, you are late."], correctIndex: 0, explanation: "unless خودش منفی است و نتیجهٔ آینده با will می‌آید." },
      { question: "کدام جمله غلط است؟", options: ["If I see her, I'll say hello.", "If you press this, the light turns on.", "If it will snow, we'll make a snowman.", "If you need help, call me."], correctIndex: 2, explanation: "بعد از if نمی‌توان will آورد؛ باید بگوید If it snows." },
      { question: "تفاوت اصلی نوع صفر و یک چیست؟", options: ["صفر برای گذشته است", "صفر برای قانون همیشگی است، یک برای احتمال واقعی آینده", "یک فقط برای سؤال است", "تفاوتی ندارند"], correctIndex: 1, explanation: "صفر = همیشه و قانون؛ یک = یک بارِ محتمل در آینده با will در نتیجه." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-05",
    titleFa: "افعال وجهی: should / must / have to",
    titleEn: "Modals: should, must, have to",
    cefr: "B1",
    intro:
      "افعال وجهی، «حالت فعل» را تغییر می‌دهند: از گفتنِ «چه اتفاقی می‌افتد» به گفتنِ «چه چیزی لازم است، بهتر است یا اجباری است». سه بازیگر اصلی این درس — should، must و have to — هر کدام شدت و منشأ متفاوتی دارند: توصیه، الزام درونی و الزام بیرونی. انتخاب اشتباه بین آن‌ها تفاوت بین «بهتره بری دکتر» و «حتماً باید بروی دکتر» است — تفاوتی که در زندگی واقعی هم معنا دارد!",
    sections: [
      {
        title: "should: مشورت‌دهندهٔ مهربان",
        paragraphs: [
          "should ملایم‌ترین عضو این خانواده است: توصیه و نصیحت. You should drink more water یعنی «بهتره آب بیشتری بخوری» — پیشنهاد است نه دستور. ساختارش مثل همهٔ وجهی‌ها ساده است: should + فعل ساده، بدون to، بدون s برای فاعل سوم، و برای منفی فقط not اضافه می‌شود: You shouldn't eat so fast. برای سؤال هم should به اول می‌آید: Should I call her?",
          "خویشاوند نزدیک should کلمهٔ ought to است که معنای یکسان اما ساختار متفاوت دارد (ought + to + فعل) و در گفتار کمتر رایج است. کاربرد دومِ should در SURPRISE: Who should I see but my old friend Ali! (که دیگه ببینی کیه؟! — قدیمی و ادبی) و در جمله‌های شرطیِ رسمی که بعداً می‌بینید. اما هستهٔ اصلی کاربردش همیشه «نصیحت از سرِ دلسوزی» است: You should take a break — جمله‌ای که هر معلم مهربانی به شاگرد خسته‌اش می‌گوید.",
        ],
        examples: [
          { en: "You should see a doctor about that cough.", fa: "بهتر است برای آن سرفه به دکتر بروی." },
          { en: "You shouldn't drive so fast in the rain.", fa: "نباید زیر باران این‌قدر تند رانندگی کنی." },
        ],
      },
      {
        title: "must: فرمان از درون",
        paragraphs: [
          "must قوی‌ترین الزام را می‌رساند و معمولاً از «درون گوینده» می‌آید: قانونی که خودم بر خودم گذاشته‌ام یا حکمی که با قاطعیت صادر می‌کنم. I must finish this tonight یعنی «حتماً باید امشب تمامش کنم» — تعهد شخصی. You must be quiet in the library هم دستور قوی است. must در ادبیات و تابلوهای رسمی (پس‌وپیش mustn't = ممنوع) ردپای زیادی دارد: Visitors must not touch the paintings.",
          "کاربرد دوم must «حدسِ قوی» است: You must be tired after that long flight یعنی «حتماً (مطمئنم که) خسته‌ای» — استنتاج بر اساس شواهد، نه الزام. این دو کاربرد (الزام و استنتاج) از هم مستقل‌اند و از بافت جمله معلوم می‌شوند. نکتهٔ ساختاری: must بر خلاف have to، شکل گذشتهٔ مستقل ندارد؛ در گذشته باید به had to تبدیل شود و همین جایی است که وارد قلمرو دوستِ دائمیمان می‌شویم.",
        ],
        examples: [
          { en: "I must stop drinking so much coffee.", fa: "باید نوشیدن این‌همه قهوه را قطع کنم. (تعهد شخصی)" },
          { en: "You must be Sara's brother — you look just like her!", fa: "حتماً برادر سارا هستی — کاملاً به او شبیهی! (حدس)" },
        ],
      },
      {
        title: "have to: قانون از بیرون",
        paragraphs: [
          "have to الزامِ «بیرونی» را نشان می‌دهد: قانون، مقرره، شرایط. I have to work on Saturdays یعنی «شنبه‌ها باید کار کنم» — نه چون دوست دارم، چون کاری/مدیری/قراردادی مرا مجبور کرده. تفاوت must و have to دقیقاً همین «منشأ» است: must صدای قانون‌گذارِ درون است و have to صدای دنیای بیرون. البته در گفتار روزمره این دو اغلب جای هم می‌روند و have to به‌دلیل انعطافش (تغییر به had to برای گذشته و having to برای اسم‌مسند) محبوب‌تر است.",
          "نکتهٔ منفیِ مهم: تفاوت mustn't با don't have to یک تلهٔ جهانی است! mustn't یعنی «ممنوع» (منع شدید) اما don't have to یعنی «لازم نیست» (اجازهٔ عدم انجام). You mustn't smoke here = سیگار کشیدن اینجا ممنوع است؛ You don't have to smoke = لازم نیست سیگار بکشی (ولی می‌خواهی می‌توانی!). یک کلمهٔ منفی، معنا را ۱۸۰ درجه می‌چرخاند. برای سؤال هم have to از do کمک می‌گیرد: Do I have to sign this? — در حالی که must خودش جابه‌جا می‌شود: Must I sign this? (رسمی و کمتر رایج).",
        ],
        examples: [
          { en: "I have to wear a uniform at work.", fa: "باید سر کار لباس فرم بپوشم. (مقررهٔ بیرونی)" },
          { en: "You don't have to come if you're busy.", fa: "اگر سرت شلوغ است لازم نیست بیایی. (اجازه)" },
          { en: "You mustn't tell anyone — it's a secret!", fa: "به هیچ‌کس نگو — راز است! (ممنوع)" },
        ],
      },
    ],
    rule:
      "should + فعل ساده = توصیه (You should rest). must = الزام قوی از درون یا حدس مطمئن (I must go / You must be tired). have to = الزام بیرونی و قانون (I have to work). mustn't = ممنوعیت (نباید!) اما don't have to = عدم ضرورت (لازم نیست). گذشتهٔ الزام: had to. سؤال: Should I...? / Do I have to...? / Must I...? (رسمی). بعد از همهٔ وجهی‌ها فعل ساده بدون to (به‌جز have to و ought to که خودشان to دارند).",
    form: [
      { label: "should (توصیه)", pattern: "You should see a doctor. · She shouldn't worry." },
      { label: "must (الزام درونی)", pattern: "I must finish this. · You must be quiet!" },
      { label: "have to (الزام بیرونی)", pattern: "I have to work. · She has to study. · گذشته: had to" },
      { label: "ممنوعیت", pattern: "You mustn't park here. (ممنوع!)" },
      { label: "عدم ضرورت", pattern: "You don't have to pay now. (لازم نیست)" },
      { label: "سؤال", pattern: "Should I call? · Do we have to go? · Must you leave? (رسمی)" },
    ],
    examples: [
      { en: "You should try the new restaurant near the park.", fa: "بهتر است رستوران جدید نزدیک پارک را امتحان کنی." },
      { en: "Passengers must fasten their seatbelts.", fa: "مسافران باید کمربندشان را ببندند. (مقرره)" },
      { en: "I have to get up early tomorrow.", fa: "فردا باید زود بیدار شوم." },
      { en: "She shouldn't stay up so late before the exam.", fa: "نباید شب قبل آزمون این‌قدر بیدار بماند." },
      { en: "You don't have to bring anything to the party.", fa: "لازم نیست چیزی به مهمانی بیاوری." },
      { en: "He must be stuck in traffic.", fa: "حتماً در ترافیک گیر افتاده است. (حدس)" },
      { en: "We had to wait two hours for the doctor.", fa: "دو ساعت مجبور شدیم منتظر دکتر بمانیم. (گذشته)" },
      { en: "You mustn't use your phone while driving.", fa: "موبایل در حین رانندگی ممنوع است." },
    ],
    mistakes: [
      { wrong: "You should to rest more.", right: "You should rest more.", note: "بعد از should فعل برهنه می‌آید؛ to مخصوص ought to و have to است." },
      { wrong: "She musts finish her homework.", right: "She must finish her homework.", note: "افعال وجهی هرگز s سوم‌شخص نمی‌گیرند؛ must یکسان می‌ماند." },
      { wrong: "You don't must smoke here.", right: "You mustn't smoke here.", note: "منفی must با خودش ساخته می‌شود: must not = mustn't." },
      { wrong: "Yesterday I must stay at home.", right: "Yesterday I had to stay at home.", note: "must گذشته ندارد؛ در گذشته به had to تبدیل می‌شود." },
    ],
    tips: [
      "طیف شدت را به خاطر بسپارید: should (بهتره) → have to (لازمه، از بیرون) → must (حتماً، از درون یا قانون).",
      "جفت تله‌دار را قاب کنید: mustn't = ممنوع / don't have to = لازم نیست؛ یک لحظه قبل از منفی‌کردن، فکر کنید کدام معنا را می‌خواهید.",
      "برای حدس‌های مطمئن از must استفاده کنید: He must be at work (چون ماشینش اینجاست) — این کاربرد، مکالمه را بسیار طبیعی می‌کند.",
      "در گذشته همیشه had to؛ در سؤال هم Do/Does/Did + have to — have to مثل یک فعل معمولی رفتار می‌کند.",
    ],
    quiz: [
      { question: "«بهتر است بیشتر آب بخوری» کدام است؟", options: ["You must drink more water.", "You should drink more water.", "You have to drink more water.", "You shouldn't drink more water."], correctIndex: 1, explanation: "توصیهٔ مهربان = should." },
      { question: "«لازم نیست زیاد بیایی» (اجازهٔ نداشتنِ ضرورت):", options: ["You mustn't come often.", "You don't have to come often.", "You shouldn't come often.", "You can't come often."], correctIndex: 1, explanation: "don't have to = عدم ضرورت؛ mustn't ممنوعیت شدید است." },
      { question: "«دیروز مجبور شدم بمانم» کدام است؟", options: ["Yesterday I must stay.", "Yesterday I had to stay.", "Yesterday I should stay.", "Yesterday I musted stay."], correctIndex: 1, explanation: "must گذشته ندارد؛ الزامِ گذشته با had to بیان می‌شود." },
      { question: "«او حتماً گرسنه است» (حدس مطمئن):", options: ["He must be hungry.", "He should be hungry.", "He has to be hungry.", "He musts be hungry."], correctIndex: 0, explanation: "استنتاج قوی بر اساس شواهد با must بیان می‌شود." },
      { question: "کدام جمله غلط است؟", options: ["She has to work tonight.", "She must work tonight.", "She should work tonight.", "She musts work tonight."], correctIndex: 3, explanation: "افعال وجهی (must) هرگز s نمی‌گیرند؛ اما have to برای سوم‌شخص has to می‌شود." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-06",
    titleFa: "شرطی نوع دو",
    titleEn: "Second Conditional",
    cefr: "B2",
    intro:
      "شرطی نوع دو، زمانِ «آرزوها و فرض‌های دور از دسترس» است: اگر پول داشتم دور دنیا سفر می‌کردم، اگر جای او بودم این کار را نمی‌کردم، اگر می‌توانستم پرواز کنم... این ساختار به شما قدرت فکر کردن دربارهٔ «واقعیتِ متفاوت» را می‌دهد — از رویاپردازی تا نصیحت مؤدبانه و بحث فرضی. ریاضیاتش کمی عجیب است (گذشته برای آیندهٔ خیالی!) اما منطقش وقتی روشن شود، یکی از لذت‌بخش‌ترین ساختارهای زبان انگلیسی خواهد بود.",
    sections: [
      {
        title: "منطق عجیب: گذشته برای خیال",
        paragraphs: [
          "ساختار شرطی دو این است: if + گذشتهٔ ساده، would + فعل ساده. If I had a million dollars, I would travel the world — اگر یک میلیون دلار داشتم، دور دنیا سفر می‌کردم. اما معنایش چه می‌شود؟ این یعنی «الان ندارم و احتمالش هم در آیندهٔ نزدیک واقعی نیست؛ فقط دارم خیال می‌بافم». پس چرا فعل گذشته می‌آید در حالی که حرف همین حالا را می‌زنیم؟ چون گذشته در انگلیسی، علامتِ «دور بودن از واقعیت» است — هر چه از حال دورتر، خیالی‌تر. نوع دو با قرض گرفتن گذشته، فاصله‌اش را با واقعیت نشان می‌دهد.",
          "مقایسهٔ نوع یک و دو روشن‌ترین راه فهم این ماجراست. If I win the lottery, I will buy a house یعنی بلیت خریده‌ام و واقعاً شانس دارم (نوع یک — آیندهٔ ممکن). اما If I won the lottery, I would buy a house یعنی اصلاً بلیت هم نمی‌خرم؛ فقط فرض می‌کنم (نوع دو — خیال). یک قدمِ فاصله در فعل (win → won)، کل جهانِ جمله را از «واقعی» به «خیالی» می‌برد. این همان کلید تشخیص دو نوع است: چقدر احتمال واقعی بودن شرط را می‌دهید؟",
        ],
        examples: [
          { en: "If I had a million dollars, I would travel the world.", fa: "اگر یک میلیون دلار داشتم، دور دنیا سفر می‌کردم." },
          { en: "If I won the lottery, I would buy my parents a house.", fa: "اگر در لاتاری ببرم (که نمی‌برم)، برای پدر و مادرم خانه می‌خرم." },
        ],
      },
      {
        title: "were به‌جای was: قانون سرانگشتی خیال",
        paragraphs: [
          "در شرطی دو، برای فاعل‌های I و he/she/it، به‌جای was معمولاً were می‌آید: If I were you، I would apologize — نه If I was you (گرچه در گفتار غیررسمی was هم شنیده می‌شود و دیگر غلط املایی حساب نمی‌شود، اما در انگلیسی استاندارد و امتحان‌ها were درست است). این were بازمانده‌ای از وجه التزامی قدیمی است که زبان برای «غیر واقعی بودن» نگهش داشته — مثل لباس سنتی که فقط در مراسم خیال‌پردازی پوشیده می‌شود!",
          "ساختار If I were you... پرمصرف‌ترین قالب این درس است: نصیحت مؤدبانه. If I were you, I would talk to the manager یعنی «اگر جای تو بودم با مدیر حرف می‌زدم» — یعنی «به نظرم بهتره با مدیر حرف بزنی» اما با لحن دوستانه و کمتر دستوری. مقایسه کنید با You should talk to the manager که مستقیم‌تر است. انگلیسی‌زبان‌ها در نصیحت‌های شخصی این قالب را می‌پسندند چون حس «من هم فقط فرض می‌کنم» دارد، نه «من به تو دستور می‌دهم».",
        ],
        examples: [
          { en: "If I were you, I would accept the offer.", fa: "اگر جای تو بودم، آن پیشنهاد را قبول می‌کردم." },
          { en: "If she were here, she would know what to do.", fa: "اگر او اینجا بود، می‌دانست چه باید بکند." },
        ],
      },
      {
        title: "کاربردهای پنهان: مؤدب بودن و آرزو کردن",
        paragraphs: [
          "شرطی دو فقط رویا نیست؛ ابزار «مؤدبانه درخواست کردن» هم هست. مقایسه کنید: Can you help me? (مستقیم) با Could you help me? (نرم‌تر — که could گذشتهٔ can است و همین «فاصله از واقعیت» احتمال رد شدن را در ذهن طرف مقابل کم می‌کند). Would you mind if I opened the window? هم همین منطق را دارد: با عقب‌نشینی به سرزمین خیال، درخواست سبک‌تر و محترمانه‌تر می‌شود. هر چه درخواست غیرممکن‌تر یا مزاحم‌تر، شرطیِ دورتر به‌کار می‌رود.",
          "گروه دوم کاربردها، «حدس دربارهٔ حال» است: If he weren't so busy, he would answer your messages یعنی «اگر انقدر شلوغ نبود (که هست)، جواب پیام‌هات را می‌داد» — توضیح وضعیت فعلی با فرض معکوس. این ساختار برای تحلیل موقعیت‌ها و مردم عالی است. تمرین پیشنهادی امشب: سه آرزوی بزرگ زندگی‌تان را با If... I would... بنویسید و برای هر کدام بگویید چرا نوع دو است نه نوع یک — این تأمل کوچک، مرز واقعی/خیالی را در ذهنتان خطکشی می‌کند.",
        ],
        examples: [
          { en: "Would you mind if I opened the window?", fa: "اشکالی دارد پنجره را باز کنم؟ (مؤدبانه)" },
          { en: "If he weren't so busy, he would call you.", fa: "اگر انقدر شلوغ نبود، به تو زنگ می‌زد." },
        ],
      },
    ],
    rule:
      "شرطی نوع دو = if + گذشتهٔ ساده، would + فعل ساده — If I had money, I would help. برای شرایطِ غیرواقعی یا بعید در حال/آینده و خیال‌پردازی. برای I/he/she/it در انگلیسی استاندارد: If I were you... (نه was). نصیحت مؤدبانه: If I were you, I would... . درخواست مؤدبانه با could/would: Could you...? / Would you mind if I...? . تفاوت با نوع یک: احتمال واقعی و جدی → نوع یک؛ غیرواقعی و خیالی → نوع دو. بعد از would فعل ساده (بدون to).",
    form: [
      { label: "ساختار اصلی", pattern: "If + گذشتهٔ ساده، would + فعل ساده" },
      { label: "مثال", pattern: "If I had time, I would learn the guitar." },
      { label: "were استاندارد", pattern: "If I were rich... / If she were here..." },
      { label: "نصیحت", pattern: "If I were you, I would take the job." },
      { label: "منفی", pattern: "If he didn't work so much, he wouldn't be so tired." },
      { label: "سؤال مؤدبانه", pattern: "What would you do if you lost your job?" },
    ],
    examples: [
      { en: "If I spoke English fluently, I would work abroad.", fa: "اگر روان انگلیسی صحبت می‌کردم، خارج از کشور کار می‌کردم." },
      { en: "If she were taller, she would join the basketball team.", fa: "اگر بلندتر بود، به تیم بسکتبال می‌پیوست." },
      { en: "If we had more time, we would visit the museum too.", fa: "اگر وقت بیشتری داشتیم، موزه را هم می‌دیدیم." },
      { en: "He would help you if he knew how.", fa: "اگر می‌دانست چطور، کمکت می‌کرد." },
      { en: "If I were the manager, I would raise everyone's salary.", fa: "اگر من مدیر بودم، حقوق همه را بالا می‌بردم." },
      { en: "They wouldn't be lost if they had a map.", fa: "گم نمی‌شدند اگر نقشه داشتند." },
      { en: "What would you do if you found a wallet on the street?", fa: "اگر در خیابان کیف پولی پیدا می‌کردی چه می‌کردی؟" },
      { en: "If dogs could talk, they would tell us amazing stories.", fa: "اگر سگ‌ها می‌توانستند حرف بزنند، داستان‌های شگفت‌انگیز برایمان می‌گفتند." },
    ],
    mistakes: [
      { wrong: "If I would have money, I would travel.", right: "If I had money, I would travel.", note: "بعد از if نمی‌شود will/would آورد؛ نیمهٔ شرط همیشه زمان سادهٔ گذشته است." },
      { wrong: "If I was you, I would call her.", right: "If I were you, I would call her.", note: "در انگلیسی استاندارد و امتحانات، برای شرطی غیر واقعی از were استفاده می‌شود." },
      { wrong: "If he studied harder, he will pass.", right: "If he studied harder, he would pass.", note: "نیمهٔ نتیجهٔ شرطی دو با would می‌آید نه will؛ دو نیمه باید هم‌خانواده باشند." },
      { wrong: "If she would know the answer, she would tell us.", right: "If she knew the answer, she would tell us.", note: "would فقط در نیمهٔ نتیجه می‌نشیند، نه بعد از if." },
    ],
    tips: [
      "کلید انتخاب نوع یک یا دو: «چقدر واقعی است؟» جدی و ممکن → نوع یک (will)؛ خیالی و دور → نوع دو (would).",
      "قانون were را قاب کنید: در خیال، همه برابرند — حتی I هم were می‌گیرد! If I were... .",
      "قالب نصیحت If I were you, I would... را در جیبتان بگذارید؛ مؤدبانه‌ترین راه گفتن نظر شخصی است.",
      "سه آرزو بنویسید و برای هرکدام یک جملهٔ شرطی دو بسازید؛ سپس همان‌ها را به نوع یک تبدیل کنید تا تفاوت حس واقعی/خیالی را تجربه کنید.",
    ],
    quiz: [
      { question: "«اگر وقت داشتم گیتار یاد می‌گرفتم» (خیالی) کدام است؟", options: ["If I have time, I would learn the guitar.", "If I had time, I would learn the guitar.", "If I had time, I will learn the guitar.", "If I would have time, I learned the guitar."], correctIndex: 1, explanation: "شرطی دو: if + گذشته (had) و نتیجه با would + فعل ساده." },
      { question: "کدام جمله «غیر واقعی بودن» شرط را نشان می‌دهد؟", options: ["If it rains, we will stay home.", "If it rained, we would stay home.", "If it rains, we stay home.", "If it will rain, we would stay home."], correctIndex: 1, explanation: "گذشته (rained) + would یعنی باران نمی‌بارد؛ فقط فرض است — شرطی نوع دو." },
      { question: "شکل استاندارد «اگر جای تو بودم...» کدام است؟", options: ["If I was you...", "If I were you...", "If I am you...", "If I would be you..."], correctIndex: 1, explanation: "در شرطی غیرواقعی برای I از were استفاده می‌شود: If I were you." },
      { question: "«اگر سگ‌ها حرف می‌زدند چه می‌گفتند؟» کدام است؟", options: ["If dogs can talk, what will they say?", "If dogs could talk, what would they say?", "If dogs talked, what do they say?", "If dogs would talk, what they said?"], correctIndex: 1, explanation: "فرض غیرواقعی: could (گذشتهٔ can) + would." },
      { question: "تفاوت «If I win, I will celebrate» و «If I won, I would celebrate» چیست؟", options: ["هیچی", "اولی جدی/واقعی است، دومی خیالی است", "دومی جدی است", "اولی غلط است"], correctIndex: 1, explanation: "نوع یک = شانس واقعی (will)؛ نوع دو = خیال و فرض (would)." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-07",
    titleFa: "جملات مجهول",
    titleEn: "Passive Voice",
    cefr: "B2",
    intro:
      "جملهٔ مجهول، دوربین را از فاعل برمی‌گرداند و به خودِ اتفاق می‌چرخاند: به‌جای «چه کسی کار را کرد»، مهم می‌شود «کار روی چه چیزی انجام شد». این ساختار در خبر، علم، گزارش رسمی و هر جا که فاعل مهم نیست یا پنهان باید بماند، فرمانرواست. برای فارسی‌زبان‌ها شگفت‌انگیز است که بداند انگلیسی‌ها سال‌هاست به‌جای «دانشمندان کشف کردند» می‌گویند «کشف شد» — و حالا شما هم دلیلش را خواهید فهمید.",
    sections: [
      {
        title: "منطق چرخش: چرا اصلاً مجهول می‌سازیم؟",
        paragraphs: [
          "در جملهٔ معلوم، فاعل قهرمان داستان است: Ali repaired the car. اما گاهی فاعل یا مهم نیست (هر مکانیکی می‌توانست باشد) یا نامعلوم است (کی می‌داند چه کسی پنجره را شکست؟) یا از نظر سبکی بهتر است حذف شود. اینجا جملهٔ مجهول وارد می‌شود و «مفعول» را به جایگاه افتخار — اول جمله — می‌برد: The car was repaired (by Ali، اگر بخواهیم بگوییم). انگار تئاتری که نورافکن از بازیگر به صحنه منتقل می‌شود.",
          "فرمول ساخت در همهٔ زمان‌ها یکی است: فعل to be (در زمان موردنظر) + قسمت سوم فعل. گذشتهٔ ساده: was/were + repaired. حال ساده: am/is/are + repaired. حال کامل: has/have been + repaired. آینده: will be + repaired. نکتهٔ زیبای ساختاری: مجهول مثل یک «قالب» روی جملهٔ معلوم می‌افتد و فقط شکل فعل را عوض می‌کند؛ مفعول و بقیهٔ اجزای جمله سر جایشان می‌مانند. اگر همین قالب را یاد بگیرید، مجهولِ هر زمانی را در چند ثانیه می‌سازید.",
        ],
        examples: [
          { en: "The window was broken last night.", fa: "پنجره دیشب شکست. (فاعل نامعلوم)" },
          { en: "This mosque was built in the sixteenth century.", fa: "این مسجد در قرن شانزدهم ساخته شد. (فاعل مهم نیست)" },
        ],
      },
      {
        title: "by یا بدون by؟ انتخاب اطلاعات",
        paragraphs: [
          "اگر در جملهٔ مجهول بخواهیم فاعل را هم بگوییم، با by می‌آوریم و همیشه آخر جمله می‌نشیند: Hamlet was written by Shakespeare. این ساختار برای «قهرمان‌های ساخت»: نویسندگان، سازندگان، مخترعان — کسانی که خودشان مهم‌اند. اما در اکثر کاربردهای روزمره، by حذف می‌شود چون یا فاعل را نمی‌دانیم یا برای پیام مهم نیست: My phone was stolen (به چه کسی؟ متهم غیب است!).",
          "کاربرد خبری مجهول را خبرنگاران کامل کرده‌اند: The suspects were arrested last night — بدون by، چون «چه کسی» (پلیس) کاملاً واضح است و تکرارش حرف اضافه است. در متن علمی هم: The samples were heated to 90 degrees — چون روش مهم است نه شخصِ دانشمند. پس قانون سبکی: اگر فاعلِ گفتنی، اطلاعاتِ تازه‌ای دارد → by بیاورید؛ وگرنه حذفش جمله را تمیزتر می‌کند. مجهول با by، انتخابِ محتوا؛ مجهولِ بدون by، انتخابِ تمیزی.",
        ],
        examples: [
          { en: "Hamlet was written by Shakespeare.", fa: "هملت را شکسپیر نوشت. (فاعل مهم)" },
          { en: "The road is being repaired this week.", fa: "جاده این هفته در حال تعمیر است. (مجهولِ استمراری)" },
        ],
      },
      {
        title: "مجهول با فعل‌های دو مفعوله و مجهول سخن‌گفتن",
        paragraphs: [
          "بعضی فعل‌ها دو مفعول دارند (به کسی، چیزی را): give، send، offer، show. این فعل‌ها دو شکل مجهول می‌سازند: Ali gave me a book → I was given a book (شخص اول می‌شود موضوع) یا A book was given to me (چیز اول می‌شود موضوع). شکل اول در انگلیسی طبیعی‌تر و پرمصرف‌تر است — مخصوصاً در خبرها: The winner was given a medal / She was offered a great job. این ساختار به شما اجازه می‌دهد «آدم» را مرکز توجه نگه دارید.",
          "خانوادهٔ خاصی از این ساختارها برای «گفته شدن» هستند: It is said that... / He is known to... / She is considered... — ابزارهای گزارش بدون ذکر منبع: It is said that this house is haunted (می‌گویند این خانه جن‌زدگی است). این قالب در نوشتار رسمی و روزنامه‌نگاری محبوب است چون فاصلهٔ مؤدبانه‌ای با ادعا می‌سازد: نمی‌گویم «من می‌گویم»، می‌گویم «گفته می‌شود». تسلط بر همین چند قالب، لحن نوشتاری شما را یک پله حرفه‌ای‌تر می‌کند.",
        ],
        examples: [
          { en: "She was offered a scholarship to study abroad.", fa: "به او بورسیه‌ای برای تحصیل در خارج پیشنهاد شد." },
          { en: "It is said that tea was discovered in China.", fa: "می‌گویند چای در چین کشف شد." },
        ],
      },
    ],
    rule:
      "مجهول = be (در زمان دلخواه) + قسمت سوم فعل: The car was repaired / is repaired / has been repaired / will be repaired. مفعولِ جملهٔ معلوم، فاعلِ ظاهری جملهٔ مجهول می‌شود. فاعل اگر بخواهد با by و در آخر جمله می‌آید: written by Shakespeare. برای فعل‌های دومفعوللی دو شکل داریم: I was given a book / A book was given to me. قالب گزارشی: It is said that... . مجهول وقتی بهتر است: فاعل نامعلوم، بی‌اهمیت یا باید پنهان بماند.",
    form: [
      { label: "حال ساده", pattern: "am/is/are + V3 → English is spoken here." },
      { label: "گذشتهٔ ساده", pattern: "was/were + V3 → The house was sold." },
      { label: "حال کامل", pattern: "has/have been + V3 → The email has been sent." },
      { label: "آینده", pattern: "will be + V3 → The results will be announced." },
      { label: "استمراری", pattern: "is/are being + V3 → The road is being repaired." },
      { label: "با فاعل", pattern: "by + فاعل، آخر جمله → painted by my father" },
    ],
    examples: [
      { en: "This bridge was built two hundred years ago.", fa: "این پل دویست سال پیش ساخته شد." },
      { en: "Persian is spoken in Iran, Afghanistan and Tajikistan.", fa: "فارسی در ایران، افغانستان و تاجیکستان صحبت می‌شود." },
      { en: "The parcel has been delivered to the wrong address.", fa: "بسته به آدرس اشتباه تحویل داده شده است." },
      { en: "The new hospital will be opened next month.", fa: "بیمارستان جدید ماه بعد افتتاح خواهد شد." },
      { en: "My bicycle was stolen from the yard.", fa: "دوچرخه‌ام از حیاط دزدیده شد." },
      { en: "The students were given extra time for the exam.", fa: "به دانش‌آموزان زمان اضافه برای آزمون داده شد." },
      { en: "It is believed that the painting is genuine.", fa: "باور بر این است که نقاشی اصیل است." },
      { en: "The windows are cleaned every two weeks.", fa: "پنجره‌ها هر دو هفته یک‌بار تمیز می‌شوند." },
    ],
    mistakes: [
      { wrong: "The letter was wrote by Ali.", right: "The letter was written by Ali.", note: "بعد از be باید قسمت سوم فعل بیاید: written، نه wrote (که گذشتهٔ ساده است)." },
      { wrong: "This song is sing by many artists.", right: "This song is sung by many artists.", note: "قسمت سومِ sing کلمهٔ sung است؛ در مجهول همیشه شکل سوم می‌آید." },
      { wrong: "The house was builded in 1920.", right: "The house was built in 1920.", note: "build فعل بی‌قاعده است: build → built؛ شکل builded وجود ندارد." },
      { wrong: "By Ali the dinner was cooked.", right: "The dinner was cooked by Ali.", note: "عبارت by همیشه بعد از فعل و در انتهای جملهٔ مجهول می‌نشیند." },
    ],
    tips: [
      "قالب جادویی را حفظ کنید: be + V3 — بعد فقط شکل be را با زمان جمله هماهنگ کنید؛ بقیهٔ کار خودکار می‌شود.",
      "سه‌گانهٔ زمانی رایج را تمرین کنید: بود (was done)، شده است (has been done)، خواهد شد (will be done).",
      "قبل از ساختن مجهول بپرسید: «فاعل مهم است؟» نه → مجهول بدون by؛ بله → with by آخر جمله.",
      "برای لحن رسمی و خبری، قالب‌های It is said that... و He is known to... را در جعبه‌ابزار نوشتارتان بگذارید.",
    ],
    quiz: [
      { question: "شکل مجهول «They built this school in 1995» چیست؟", options: ["This school was build in 1995.", "This school was built in 1995.", "This school is built in 1995.", "This school has been built in 1995."], correctIndex: 1, explanation: "گذشتهٔ سادهٔ مجهول: was + built (قسمت سوم)." },
      { question: "«به او یک جایزه داده شد» کدام است؟", options: ["She gave a prize.", "She was given a prize.", "A prize was given her.", "She has given a prize."], correctIndex: 1, explanation: "در فعل‌های دومفعوللی، شخص می‌تواند فاعل مجهول شود: She was given a prize." },
      { question: "کدام جمله مجهولِ حال کامل است؟", options: ["The cake was made.", "The cake is made.", "The cake has been made.", "The cake will be made."], correctIndex: 2, explanation: "حال کامل مجهول = has/have been + قسمت سوم." },
      { question: "چه زمانی از «by + فاعل» در جملهٔ مجهول استفاده می‌کنیم؟", options: ["همیشه", "هرگز", "وقتی فاعل اطلاعات مهمی دارد", "فقط در سؤال"], correctIndex: 2, explanation: "by وقتی می‌آید که خودِ فاعل (نویسنده، سازنده، مخترع) مهم باشد؛ وگرنه حذف می‌شود." },
      { question: "شکل مجهول «They are repairing the road» چیست؟", options: ["The road is repaired.", "The road is being repaired.", "The road was being repaired.", "The road has repaired."], correctIndex: 1, explanation: "حال استمراری مجهول = is/are being + V3: is being repaired." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-08",
    titleFa: "نقل قول غیرمستقیم",
    titleEn: "Reported Speech",
    cefr: "B2",
    intro:
      "هر روز حرف‌های دیگران را نقل می‌کنیم: «علی گفت که می‌آید»، «دکتر پرسید احساس بهتری دارم؟». انگلیسی برای این نقل‌ها یک سیستم جالب دارد: وقتی حرف کسی را بعداً روایت می‌کنید، زمان فعل‌ها «یک قدم به عقب» می‌رود و ضمایر و قیدها هم با دید گزارش‌دهنده تنظیم می‌شوند. این سیستم «backshift» نام دارد و یادگیری آن، شما را از تکرار طوطی‌وار حرف‌های دیگران به روایت هوشمندانه می‌رساند.",
    sections: [
      {
        title: "قانون یک‌قدم‌به‌عقب (backshift)",
        paragraphs: [
          "وقتی فعل گزارش‌دهنده گذشته است (said، told، asked)، فعل اصلیِ نقل‌شده معمولاً یک زمان به عقب می‌رود: حال ساده → گذشتهٔ ساده (am/is → was، work → worked)، حال استمراری → گذشتهٔ استمراری، حال کامل → گذشتهٔ کامل، will → would، can → could، must → had to. «I am tired» → He said (that) he was tired. مثل این است که دوربین جمله را از «لحظهٔ گوینده» به «لحظهٔ گزارش‌دهنده» منتقل کنید و همهٔ زمان‌ها از آن نقطه دوباره محاسبه شوند.",
          "اما backshift همیشه اجباری نیست! اگر حادثه هنوز برقرار و درست باشد، می‌توان زمان را نگه داشت: She said she is coming tomorrow (هنوز می‌آید — خبر تازه است). همچنین اگر فعل گزارش‌دهنده حال باشد (says، asks) یا حرف از حقایق همیشگی باشد (He said the earth goes around the sun)، هیچ جابه‌جایی لازم نیست. پس قانون دقیق‌تر: جابه‌جایی «پیش‌فرض» است اما وقتی معنا هنوز زنده است، نگه‌داشتن زمان اصلی هم مجاز و حتی طبیعی‌تر است.",
        ],
        examples: [
          { en: "\"I am tired.\" → He said (that) he was tired.", fa: "«خسته‌ام» → گفت خسته است." },
          { en: "\"I will call you.\" → She said she would call me.", fa: "«زنگ می‌زنم» → گفت زنگ می‌زند." },
        ],
      },
      {
        title: "چرخش ضمایر، قیدها و مکان‌ها",
        paragraphs: [
          "علاوه بر زمان، «دیدگاه» جمله هم عوض می‌شود: ضمایر و قیدهای مکان/زمان از زبانِ گوندهٔ اول به زبانِ گزارش‌دهنده ترجمه می‌شوند. I → he/she؛ my → his/her؛ this → that؛ here → there؛ now → then / at that moment؛ today → that day؛ tomorrow → the next day / the following day؛ yesterday → the day before / the previous day؛ next week → the following week؛ ago → before. جدول به‌یادماندنی: هر چیزِ «چسبیده به گوینده» به همتای دورتر و گزارشی‌اش تبدیل می‌شود.",
          "این چرخش فقط در زمانی لازم است که «مکان و زمانِ گزارش» با «مکان و زمانِ گویندهٔ اولیه» فرق کند — که تقریباً همیشه فرق می‌کند! البته انگلیسی معاصر در گفتار روزمره ساده‌گیرتر شده و مثلاً tomorrow را بدون تغییر هم می‌شنود؛ اما در نوشتار رسمی و امتحانات، چرخش کامل انتظار می‌رود. بهترین راه تثبیت: هر خبری که می‌شنوید، یک‌بار با He said that... بازگو کنید — ذهنتان به‌سرعت به این «بازترجمه» عادت می‌کند.",
        ],
        examples: [
          { en: "\"I saw her here yesterday.\" → He said he had seen her there the day before.", fa: "«دیروز اینجا او را دیدم» → گفت روز قبل آنجا او را دیده است." },
          { en: "\"We are leaving tomorrow.\" → They said they were leaving the next day.", fa: "«فردا می‌رویم» → گفتند روز بعد می‌روند." },
        ],
      },
      {
        title: "نقل سؤال‌ها و دستورها",
        paragraphs: [
          "سؤال‌های بله/خیر با if یا whether به جملهٔ خبری تبدیل می‌شوند: «Are you coming?» → He asked if I was coming. توجه کنید که ساختار سؤالی (جابه‌جایی فعل) از بین می‌رود و جمله خبری می‌شود. سؤال‌های Wh- هم واژهٔ پرسشی‌شان را نگه می‌دارند: «Where do you live?» → She asked where I lived. تلهٔ اصلی همین‌جاست: در نقل سؤال، دیگر do/does/did اضافه نمی‌کنید چون جمله دیگر سؤال نیست — She asked where did I live غلط است!",
          "دستورها و درخواست‌ها با told/asked + مفعول + to + فعل نقل می‌شوند: «Sit down!» → He told me to sit down؛ «Please help me» → She asked me to help her. منفی شدن با not قبل از to: «Don't touch it!» → He told me not to touch it. این ساختار (told/asked + مفعول + to) یکی از کاربردی‌ترین قالب‌های مکالمهٔ روزمره است — مخصوصاً وقتی می‌خواهید خواستهٔ شخص سومی را منتقل کنید: The doctor told me to rest for a week.",
        ],
        examples: [
          { en: "\"Where do you live?\" → She asked where I lived.", fa: "«کجا زندگی می‌کنی؟» → پرسید کجا زندگی می‌کنم." },
          { en: "\"Don't be late!\" → He told me not to be late.", fa: "«دیر نکن!» → گفت دیر نکنم." },
        ],
      },
    ],
    rule:
      "نقل قول غیرمستقیم با فعل گذشتهٔ گزارش‌دهنده: زمان‌ها یک قدم عقب می‌روند (am→was، worked→had worked، will→would، can→could)؛ ضمایر و قیدها بازترجمه می‌شوند (I→he، my→his، here→there، now→then، tomorrow→the next day). سؤال بله/خیر با if/whether و ساختار خبری: He asked if I was ready. سؤال Wh- با واژهٔ پرسشی: She asked where I lived (بدون did!). دستورها با told/asked + مفعول + to + فعل: He told me to wait؛ منفی: not to + فعل. اگر فعل گزارش‌دهنده حال باشد یا خبر هنوز معتبر، backshift لازم نیست.",
    form: [
      { label: "گزارش خبر", pattern: "\"I work here.\" → He said (that) he worked there." },
      { label: "سؤال بله/خیر", pattern: "\"Are you OK?\" → She asked if I was OK." },
      { label: "سؤال Wh-", pattern: "\"What time is it?\" → He asked what time it was." },
      { label: "دستور مثبت", pattern: "\"Close the door.\" → She told me to close the door." },
      { label: "دستور منفی", pattern: "\"Don't shout.\" → He told me not to shout." },
      { label: "پیشنهاد", pattern: "\"Let's go out.\" → He suggested going out." },
    ],
    examples: [
      { en: "\"I will help you tomorrow.\" → She said she would help me the next day.", fa: "«فردا کمکت می‌کنم» → گفت روز بعد کمتم می‌کند." },
      { en: "\"I have finished my homework.\" → He said he had finished his homework.", fa: "«تکلیفم را تمام کرده‌ام» → گفت تکلیفش را تمام کرده است." },
      { en: "\"Do you speak French?\" → They asked if I spoke French.", fa: "«فرانسوی بلدی؟» → پرسیدند فرانسوی بلدم یا نه." },
      { en: "\"Where did you buy it?\" → She asked where I had bought it.", fa: "«از کجا خریدیش؟» → پرسید از کجا خریده‌ام." },
      { en: "\"Please wait outside.\" → The nurse asked us to wait outside.", fa: "«لطفاً بیرون منتظر بمانید» → پرستار از ما خواست بیرون منتظر بمانیم." },
      { en: "\"Don't worry about me.\" → He told her not to worry about him.", fa: "«برایم نگران نباش» → به او گفت برایش نگران نباشد." },
      { en: "\"I can't come today.\" → He said he couldn't come that day.", fa: "«امروز نمی‌توانم بیایم» → گفت آن روز نمی‌تواند بیاید." },
      { en: "\"I saw the film last night.\" → She said she had seen the film the night before.", fa: "«دیشب فیلم را دیدم» → گفت شب قبل فیلم را دیده است." },
    ],
    mistakes: [
      { wrong: "She asked where did I live.", right: "She asked where I lived.", note: "بعد از واژهٔ پرسشی، ساختار خبری می‌آید؛ did و جابه‌جایی فعل مالِ سؤال مستقیم است." },
      { wrong: "He said me that he was busy.", right: "He told me that he was busy.", note: "say به مفعول مستقیم نمی‌گیرد؛ یا He said that... یا He told me that... ." },
      { wrong: "\"Don't be late.\" → He told me don't be late.", right: "He told me not to be late.", note: "دستورِ منفی در نقل با not to + فعل بیان می‌شود." },
      { wrong: "She asked if I am ready. (گزارش دیروز)", right: "She asked if I was ready.", note: "با فعل گزارش گذشته، زمان فعل اصلی هم یک قدم عقب می‌رود: am → was." },
    ],
    tips: [
      "سه‌مرحلهٔ ذهنی: (۱) جای گوینده و زمان را عوض کن (۲) زمان فعل را یک قدم عقب ببر (۳) ضمایر را از دید خودت تنظیم کن — این ترتیب، خطا را حداقل می‌کند.",
      "جدول قیدها را با داستان کوتاه حفظ کنید: «الان (now) → آن‌وقت (then)، اینجا → آنجا، فردا → روز بعد» — هر قید، قدمی دورتر از گویندهٔ اول.",
      "برای سؤال‌ها همیشه اول بپرسید: «بله/خیر است یا Wh-؟» — اولی if می‌خواهد، دومی واژهٔ پرسشی را نگه می‌دارد.",
      "گفت‌وگوهای روزانه را گزارش کنید: «She asked if... He told me to...» — این ساختارها ستون مکالمهٔ کاری و روزمره‌اند.",
    ],
    quiz: [
      { question: "نقل غیرمستقیم «\"I am happy here\"» (گوینده: مرد، دیروز گفته) چیست؟", options: ["He said he is happy here.", "He said he was happy there.", "He said he were happy there.", "He told he was happy here."], correctIndex: 1, explanation: "am→was، here→there؛ و با said که نیاز به that ندارد اما مفعول مستقیم هم نمی‌گیرد." },
      { question: "«\"Where do you work?\"» چطور نقل می‌شود؟", options: ["She asked where do I work.", "She asked where I work.", "She asked where I worked.", "She asked if I worked."], correctIndex: 2, explanation: "سؤال Wh- + فعل گزارش گذشته: واژهٔ پرسشی + ساختار خبری + یک قدم عقب (do work → worked)." },
      { question: "دستور «\"Please close the window\"» کدام نقل را دارد؟", options: ["He told me close the window.", "He told me to close the window.", "He said me to close the window.", "He asked me closing the window."], correctIndex: 1, explanation: "دستور/درخواست با told/asked + مفعول + to + فعل نقل می‌شود." },
      { question: "در کدام حالت backshift (عقب‌رفتن زمان) لازم نیست؟", options: ["همیشه لازم است", "وقتی فعل گزارش‌دهنده حال باشد یا خبر هنوز معتبر باشد", "فقط در سؤال‌ها", "هرگز لازم نیست"], correctIndex: 1, explanation: "با says/asks یا خبر هنوز-درست، زمان اصلی می‌ماند: She says she is coming." },
      { question: "«\"Don't touch the wire!\"» چه نقل می‌شود؟", options: ["He told me don't touch the wire.", "He told me not touch the wire.", "He told me not to touch the wire.", "He said me not to touch the wire."], correctIndex: 2, explanation: "منفیِ دستور در نقل: told + مفعول + not to + فعل." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-09",
    titleFa: "جملات موصولی",
    titleEn: "Relative Clauses",
    cefr: "B2",
    intro:
      "جملهٔ موصولی، چسبِ حرفه‌ایِ اتصال اطلاعات است: به‌جای دو جملهٔ خام و تکراری، یک جملهٔ روان و یکپارچه می‌سازد. «مردی را دیدم. او کنار پنجره نشسته بود» با این ابزار تبدیل می‌شود به «مردی که کنار پنجره نشسته بود را دیدم». تسلط بر who/which/that/where/whose یعنی ارتقا از انگلیسیِ رباتیک به انگلیسیِ طبیعی — همان تفاوتی که در نوشتن ایمیل رسمی و مکالمهٔ حرفه‌ای حس می‌شود.",
    sections: [
      {
        title: "سه‌گانهٔ اصلی: who / which / that",
        paragraphs: [
          "قاعدهٔ انتخاب ضمیر موصولی به «نوع اسمِ قبلش» بستگی دارد. برای آدم‌ها who می‌آید: The man who called you is my uncle. برای اشیا و حیوانات which: The book which I bought is excellent. و that که هم‌چتر آدم و شیء است و در جمله‌های «تعریف‌کننده» (restrictive) محبوب‌ترین گزینه است: The film that we watched was long. نکتهٔ سبکی: در مکالمهٔ روزمره that بیشتر از which به گوش می‌رسد؛ اما در جمله‌های توضیحیِ غیرضروری (که با کاما می‌آیند) فقط which مجاز است.",
          "ضمایر مکمل هم باید بشناسید: whose برای مالکیت (the girl whose father is a pilot — دختری که پدرش خلبان است)، where برای مکان (the café where we first met — کافه‌ای که اولین بار همدیگر را دیدیم)، و when برای زمان (the year when everything changed). دقت کنید where جای in which می‌نشیند نه آن‌جا؛ یعنی جملهٔ قبلش «مکان» باید باشد. اگر این سه را با who/which/that کامل کنید، جعبه‌ابزار موصولی‌تان کامل است.",
        ],
        examples: [
          { en: "The woman who lives next door is a nurse.", fa: "زنی که در خانهٔ کناری زندگی می‌کند پرستار است." },
          { en: "This is the app that I told you about.", fa: "این همان اپلیکیشنی است که برایت گفتم." },
        ],
      },
      {
        title: "تعریف‌کننده یا توضیحی؟ کاما همه‌چیز را می‌گوید",
        paragraphs: [
          "جملهٔ موصولیِ «تعریف‌کننده» (defining) اطلاعات حیاتی برای شناسایی اسم است و بدون آن، شنونده نمی‌داند از کدام نفر/چیز حرف می‌زنیم: The students who study hard will pass — فقط دانش‌آموزانی که درس می‌خوانند قبول می‌شوند (نه همه!). این جمله‌ها کاما ندارند و ضمیرشان (که مفعول باشد) قابل حذف است: The film (that) we watched — که that مفعول است و می‌شود حذفش کرد.",
          "جملهٔ «توضیحی» (non-defining) اطلاعات اضافهٔ جانبی است؛ اسم از قبل مشخص است و ما فقط رنگ و روایت اضافه می‌کنیم: My brother, who lives in Rasht, is a chef — برادرم (که اتفاقاً رشت زندگی می‌کند) آشپز است. این جمله‌ها «دو طرف کاما» می‌خواهند، that در آن‌ها ممنوع است و حذف ضمیر هم مجاز نیست. تفاوت معنایی ظریف اما مهم: My sister who lives in London (تعریف‌کننده — یکی از چند خواهر را مشخص می‌کند) با My sister, who lives in London (توضیحی — فقط یک خواهر دارم و اتفاقاً لندنی است).",
        ],
        examples: [
          { en: "My brother, who lives in Rasht, is a chef.", fa: "برادرم، که در رشت زندگی می‌کند، آشپز است. (توضیحی + کاما)" },
          { en: "People who exercise regularly sleep better.", fa: "آدمایی که منظم ورزش می‌کنند بهتر می‌خوابند. (تعریف‌کننده)" },
        ],
      },
      {
        title: "حذف ضمیر و جابه‌جایی حرف اضافه",
        paragraphs: [
          "قاعدهٔ حذف ضمیر موصولی ساده است: اگر ضمیر «مفعول» جملهٔ موصولی باشد (یعنی بعدش فاعلِ جدید بیاید)، می‌توان حذفش کرد: The song (that) she sang was beautiful. اما اگر ضمیر «فاعل» باشد (یعنی خودش فعلِ موصولی را انجام می‌دهد)، هرگز حذف نمی‌شود: The man who called you (که who فاعل است). تست تشخیص: بعد از ضمیر چه می‌آید؟ فاعل و اسم؟ → قابل حذف. فعل؟ → غیرقابل حذف.",
          "در انگلیسی رسمی، حرف اضافه می‌تواند قبل از which/whom بیاید: the house in which I grew up / the person to whom I spoke. این جابه‌جایی لحن رسمی و ادبی دارد و در نامه‌های اداری و مقالات دیده می‌شود؛ در گفتار روزمره اما انگلیسی‌زبان‌ها حرف اضافه را آخر جمله می‌گذارند و که ضمیر را هم حذف می‌کنند: the house I grew up in. هر دو درست‌اند؛ انتخاب با سطح رسمی بودن متن شماست. پیش‌وند پیشنهادی: هر هفته یک نفر از خانواده یا دوستان را با جملهٔ موصولی معرفی کنید — my cousin, who... — و ذهنتان به این ساختارها عادت کند.",
        ],
        examples: [
          { en: "The song she sang was beautiful.", fa: "آهنگی که خواند قشنگ بود. (that مفعول بود و حذف شد)" },
          { en: "This is the room in which Shakespeare was born.", fa: "این اتاقی است که شکسپیر در آن به دنیا آمد. (رسمی)" },
        ],
      },
    ],
    rule:
      "who برای آدم، which برای شیء، that برای هر دو (فقط در جملهٔ تعریف‌کننده)، whose برای مالکیت، where برای مکان، when برای زمان. تعریف‌کننده (بدون کاما): اطلاعات ضروری برای شناسایی؛ ضمیرِ مفعول قابل حذف. توضیحی (دو طرف کاما): اطلاعات جانبی؛ that ممنوع، حذف ضمیر ممنوع. حرف اضافه در انگلیسی رسمی می‌تواند قبل از which/whom بیاید: in which، to whom.",
    form: [
      { label: "who (فاعل آدم)", pattern: "The man who called you..." },
      { label: "which/that (شیء)", pattern: "The book (that) I read..." },
      { label: "whose (مالکیت)", pattern: "The boy whose bike was stolen..." },
      { label: "where (مکان)", pattern: "The school where I studied..." },
      { label: "توضیحی با کاما", pattern: "Tehran, which is the capital, is huge." },
      { label: "رسمی با پیش‌اپوزیشن", pattern: "the person to whom I wrote..." },
    ],
    examples: [
      { en: "The doctor who treated me was very kind.", fa: "دکتوری که از من درمان کرد خیلی مهربان بود." },
      { en: "This is the camera which I bought in Dubai.", fa: "این همان دوربینی است که در دبی خریدم." },
      { en: "I still remember the day when we first met.", fa: "هنوز روزی را به یاد می‌آورم که اولین بار همدیگر را دیدیم." },
      { en: "The girl whose father works with me is very smart.", fa: "دختری که پدرش با من کار می‌کند خیلی باهوش است." },
      { en: "The restaurant where we had dinner was fantastic.", fa: "رستورانی که شام خوردیم فوق‌العاده بود." },
      { en: "The people who live upstairs are very quiet.", fa: "آدمایی که طبقه بالا زندگی می‌کنند خیلی بی‌سروصداند." },
      { en: "She showed me the photos (that) she took in Turkey.", fa: "عکس‌هایی را که در ترکیه گرفته بود به من نشان داد." },
      { en: "Mount Damavand, which is the highest peak in Iran, attracts many climbers.", fa: "دماوند، که بلندترین قلهٔ ایران است، کوهنوردان زیادی را جذب می‌کند. (توضیحی)" },
    ],
    mistakes: [
      { wrong: "The man which called you is my uncle.", right: "The man who called you is my uncle.", note: "برای آدم‌ها who یا that؛ which فقط برای اشیا و حیوانات است." },
      { wrong: "My mother, that is a teacher, loves gardening.", right: "My mother, who is a teacher, loves gardening.", note: "در جملهٔ توضیحی (بین دو کاما) that ممنوع است؛ فقط who/which." },
      { wrong: "This is the house where I bought last year.", right: "This is the house (that) I bought last year.", note: "خریدن مکان، عملی روی «شیء» است نه «در» مکان؛ where فقط وقتی می‌آید که معنیِ «در آن‌جا» لازم باشد." },
      { wrong: "The film what we saw was long.", right: "The film (that) we saw was long.", note: "what هیچ‌وقت ضمیر موصولیِ بعد از اسم نیست؛ what برای سؤال و جمله‌های اسمی خاص است." },
    ],
    tips: [
      "قبل از انتخاب ضمیر، به اسم قبلش نگاه کنید: آدم → who/that؛ شیء → which/that؛ مالکیت → whose؛ مکان → where؛ زمان → when.",
      "قاعدهٔ کاما را قاب کنید: «اگر حذف جملهٔ موصولی، معنا را گم می‌کند» → بدون کاما (تعریف‌کننده)؛ «اگر فقط حاشیه است» → دو کاما (توضیحی).",
      "برای حذف ضمیر، تست فعل بیاورید: بعد از ضمیر فعل می‌آید؟ → ضمیر فاعل است و نمی‌شود حذفش کرد؛ فاعلِ دیگر می‌آید؟ → مفعول است و حذف آزاد است.",
      "در نوشتار رسمی یک‌بار in which و to whom را امتحان کنید؛ این دو، امضای نوشتار حرفه‌ای‌اند.",
    ],
    quiz: [
      { question: "«زنی که آنجا نشسته مادربزرگ من است» کدام است؟", options: ["The woman which is sitting there is my grandmother.", "The woman who is sitting there is my grandmother.", "The woman where is sitting there is my grandmother.", "The woman whose sitting there is my grandmother."], correctIndex: 1, explanation: "برای آدم که فاعل جملهٔ موصولی است، who به کار می‌رود." },
      { question: "در کدام جمله کاما (جملهٔ توضیحی) لازم است؟", options: ["The car that I want is expensive.", "My father who is 60 still works.", "Tehran which is Iran's capital is huge.", "The students who cheat will fail."], correctIndex: 2, explanation: "تهران از قبل مشخص است؛ جملهٔ موصولی توضیح اضافه است و باید بین دو کاما بیاید: Tehran, which..., is huge." },
      { question: "«پسری که دوچرخه‌اش دزدیده شد گریه می‌کند» کدام است؟", options: ["The boy who bike was stolen is crying.", "The boy whose bike was stolen is crying.", "The boy which bike was stolen is crying.", "The boy where bike was stolen is crying."], correctIndex: 1, explanation: "مالکیت (دوچرخهٔ او) با whose بیان می‌شود." },
      { question: "در کدام جمله ضمیر موصولی «قابل حذف» است؟", options: ["The man who called you...", "The song that she sang...", "The girl who is standing there...", "The people who live upstairs..."], correctIndex: 1, explanation: "در «The song that she sang»، that مفعول است (بعدش فاعل she آمده)؛ پس حذفش مجاز است." },
      { question: "«کافه‌ای که اولین بار همدیگر را دیدیم» کدام است؟", options: ["the café which we first met", "the café where we first met", "the café when we first met", "the café whose we first met"], correctIndex: 1, explanation: "ملاقات «در» کافه رخ داده؛ مکان با where بیان می‌شود." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-intermediate-10",
    titleFa: "gerund و infinitive",
    titleEn: "Gerund vs Infinitive",
    cefr: "B2",
    intro:
      "بعد از بعضی فعل‌ها ing می‌آید، بعد از بعضی to، و بعد بعضی هم هر دو را با تفاوت معنایی ظریف می‌پذیرند. این درس، پتانسیل‌خطر و پتانزیل-لذت زبان‌آموزان است: جایی که قاعدهٔ منطقی کم است و «هم‌خانوادگی فعل‌ها» حکم می‌راند. اما خبر خوب: اکثر فعل‌ها گروه‌های رفتاری مشخصی ساخته‌اند و با چند دسته‌بندی هوشمند + تمرین در جمله‌های واقعی، این بخش از زبان به یکی از قاطع‌ترین مهارت‌های شما تبدیل می‌شود.",
    sections: [
      {
        title: "گروه ing: ذهنیت «کار به‌مثابه چیز»",
        paragraphs: [
          "بعد از این فعل‌ها و عبارت‌ها همیشه gerund (ing) می‌آید: enjoy، avoid، mind، suggest، finish، keep، practice، consider، quit + حرف اضافه‌ها (of، in، about، for، at...) + قیدهای زمانی (before، after) + فعل‌های وجهی با پیشوند (look forward to، be used to، can't stand). چند نمونه: I enjoy reading (نه to read)، She avoided answering my question، We're thinking about moving، Thanks for coming، I can't stand waiting in queues.",
          "چرا این گروه ing می‌خواهد؟ چون gerund اسم است — «کار را به‌مثابه یک چیز، یک مفهوم». فعل‌های ذهنی و احساسی مثل enjoy و avoid با «مفهوم» سر و کار دارند نه «عمل آینده». برای حفظ‌کردن این دسته، خانواده‌سازی کنید: گروه لذت و تنفر (enjoy / love+ing در بریتانیایی / hate / can't stand)، گروه دوری (avoid / mind / postpone / quit)، گروه پیشنهاد (suggest / consider / recommend). هر خانواده را در یک داستان کوچک تمرین کنید تا با هم بچسبند.",
        ],
        examples: [
          { en: "I enjoy reading before bed.", fa: "از خواندن قبل از خواب لذت می‌برم." },
          { en: "She avoided answering my question.", fa: "از جواب دادن به سؤالم طفره رفت." },
          { en: "We're looking forward to seeing you.", fa: "بی‌صبرانه منتظر دیدنتان هستیم." },
        ],
      },
      {
        title: "گروه to: ذهنیت «کار به‌مثابه مقصد»",
        paragraphs: [
          "بعد از این فعل‌ها infinitive با to می‌آید: want، need، decide، hope، plan، promise، agree، learn، offer، refuse، manage + صفتی که همراه است (happy to، sorry to، glad to) + اسم + to (told him to، asked her to). نمونه‌ها: I want to travel، They decided to stay، She promised to help، I'm happy to see you، He told me to wait. این گروه، فعل‌های «اراده و برنامه و آینده»اند؛ نگاهشان به «عملی که هنوز انجام نشده و در مسیرِ انجام است» است — مثل فلش راهنمایی به مقصد.",
          "اینکه چرا to؟ infinitive با to در دنیای ذهنی انگلیسی، جهت و مقصد دارد: want یعنی «به‌سوی داشتن/انجام میل دارم»؛ decide یعنی «مسیر را انتخاب کردم». مقایسهٔ تصویری: gerund عکسِ تمام‌شدهٔ کار است (کار به‌مثابه چیز)، infinitive پیکانِ به‌سوی کار است (کار به‌مثابه هدف). همین دو تصویر، نیمی از تصمیم‌ها را درست جواب می‌دهند: فعل احساسی/ذهنی دربارهٔ «چیز» → ing؛ فعل اراده‌ای دربارهٔ «هدف» → to.",
        ],
        examples: [
          { en: "They decided to stay another day.", fa: "تصمیم گرفتند یک روز دیگر بمانند." },
          { en: "I'm happy to help you.", fa: "خوشحال می‌شوم کمکتان کنم." },
          { en: "She told me to wait outside.", fa: "به من گفت بیرون منتظر بمانم." },
        ],
      },
      {
        title: "فعل‌های دوچهره: تغییر معنا با ing/to",
        paragraphs: [
          "گروه جذابی از فعل‌ها هر دو را می‌پذیرند اما با تفاوت معنایی. معروف‌ترین‌ها: remember/forget (ing = یادآوریِ کارِ انجام‌شده؛ to = یادآوریِ کارِ ناتمام): I remembered locking the door (یادم آمد قفل کرده بودم) با I remembered to lock the door (یادم ماند قفل کنم). stop هم داستان مشابهی دارد: stopped smoking (سیگار را قطع کرد) با stopped to smoke (ایستاد تا سیگار بکشد!). try: try doing (امتحان‌کردن روش) با try to do (تلاش سخت برای انجام).",
          "قاعدهٔ سرانگشتی برای این دوچهره‌ها: ing معمولاً به «عقب» نگاه می‌کند (کارِ انجام‌شده/در جریان) و to به «جلو» (کارِ ناتمام/هدف). go هم دو مسیر دارد: go swimming/shopping (فعالیت تفریحی — قالب رایج) با go to swim (برای شنا رفتن — هدفمند و کمتر رایج). این تفاوت‌های ظریف، همان جایی است که انگلیسیِ «درست» از انگلیسیِ «بومی‌گونه» جدا می‌شود؛ هر کدام را در یک موقعیت واقعی برای خودتان جمله‌سازی کنید تا رنگ معنایی‌شان در ذهنتان بنشیند.",
        ],
        examples: [
          { en: "I remembered to lock the door. (یادم ماند قفل کنم)", fa: "یادم بود در را قفل کنم." },
          { en: "I remembered locking the door. (یادم آمد که قفل کرده بودم)", fa: "یادم آمد که در را قفل کرده‌ام." },
          { en: "He stopped drinking coffee at night.", fa: "نوشیدن قهوه در شب را ترک کرد." },
        ],
      },
    ],
    rule:
      "بعد از enjoy/avoid/mind/suggest/finish/keep/consider/quit + حروف اضافه (about/of/for...) + look forward to/be used to/can't stand → gerund (ing). بعد از want/need/decide/hope/plan/promise/agree/learn/offer/refuse/manage + صفت (happy to...) + مفعول + to (told me to...) → infinitive با to. دوچهره‌ها: remember/forget/stop/try — ing نگاه به عقب (انجام‌شده)، to نگاه به جلو (ناتمام/هدف). go + ing برای فعالیت‌های تفریحی: go shopping/swimming.",
    form: [
      { label: "gerund بعد از فعل", pattern: "enjoy/finish/avoid + reading / answering / waiting" },
      { label: "gerund بعد از حرف اضافه", pattern: "thinking about moving · thanks for coming · good at drawing" },
      { label: "infinitive بعد از فعل", pattern: "want/decide/hope + to travel / to stay / to help" },
      { label: "infinitive بعد از صفت", pattern: "happy to help · sorry to hear · ready to go" },
      { label: "مفعول + to", pattern: "She told me to wait. · They asked us to come." },
      { label: "فعالیت با go", pattern: "go shopping / go swimming / go running" },
    ],
    examples: [
      { en: "She suggested going to the new restaurant.", fa: "پیشنهاد داد به رستوران جدید برویم." },
      { en: "I hope to see you again soon.", fa: "امیدوارم به‌زودی دوباره ببینمت." },
      { en: "He kept talking during the whole film.", fa: "تمام مدت فیلم حرف می‌زد." },
      { en: "We're considering moving to a bigger flat.", fa: "در حال بررسی نقل مکان به آپارتمان بزرگ‌تری هستیم." },
      { en: "She promised to call me when she arrived.", fa: "قول داد وقتی رسید به من زنگ بزند." },
      { en: "Do you mind opening the window?", fa: "اشکالی دارد پنجره را باز کنی؟" },
      { en: "They agreed to lower the price.", fa: "قبول کردند قیمت را پایین بیاورند." },
      { en: "I'll never forget meeting her for the first time.", fa: "هرگز اولین دیدارم با او را فراموش نمی‌کنم." },
    ],
    mistakes: [
      { wrong: "I enjoy to read.", right: "I enjoy reading.", note: "enjoy همیشه gerund می‌خواهد؛ یکی از وفادارترین اعضای گروه ing است." },
      { wrong: "She decided staying.", right: "She decided to stay.", note: "decide از خانوادهٔ اراده و برنامه است و to + فعل می‌خواهد." },
      { wrong: "I'm looking forward to see you.", right: "I'm looking forward to seeing you.", note: "to اینجا حرف اضافه است (look forward to = منتظر بودنِ)؛ بعد از حرف اضافه همیشه ing می‌آید." },
      { wrong: "He stopped to smoke last year.", right: "He stopped smoking last year.", note: "ترک سیگار یعنی stopped smoking؛ stopped to smoke یعنی ایستاد تا سیگار بکشد — فرق زمین تا آسمان!" },
    ],
    tips: [
      "تصویر ذهنی بسازید: gerund = عکسِ تمام‌شده (چیز)؛ infinitive = پیکانِ به‌سوی مقصد (هدف) — فعل را با یکی از این دو حس جفت کنید.",
      "قاعدهٔ طلایی حرف اضافه: بعد از هر حرف اضافه‌ای (to، about، of، for...) همیشه ing؛ to فقط وقتی «به فعل» است to مصدری می‌ماند.",
      "چهار دوچهرهٔ معروف (remember/forget/stop/try) را با جفت‌جمله حفظ کنید — تفاوت معنایی‌شان در مکالمه واقعی گاهی حیاتی است!",
      "لیست شخصی بسازید: هر بار فعل تازه‌ای دیدید، در دفترتان کنارش بنویسید ing یا to و یک جملهٔ خودتان؛ این دفتر، بهترین کتاب گرامر اختصاصی شماست.",
    ],
    quiz: [
      { question: "جای خالی: «I'm looking forward to ___ you soon.»", options: ["see", "seeing", "to see", "saw"], correctIndex: 1, explanation: "to در look forward to حرف اضافه است؛ بعد از حرف اضافه gerund می‌آید: seeing." },
      { question: "کدام جمله درست است؟", options: ["She suggested to go.", "She suggested going.", "She suggested goes.", "She suggested for going."], correctIndex: 1, explanation: "suggest از گروه gerund است: suggested going." },
      { question: "«یادم آمد که اجاق را خاموش کرده‌ام» کدام است؟", options: ["I remembered to turn off the oven.", "I remembered turning off the oven.", "I remembered turn off the oven.", "I remembered to turning off the oven."], correctIndex: 1, explanation: "یادآوری کارِ انجام‌شده → remember + ing: remembered turning off." },
      { question: "«آیا اشکال دارد پنجره را باز کنم؟» کدام است؟", options: ["Do you mind to open the window?", "Do you mind open the window?", "Do you mind opening the window?", "Do you mind to opening the window?"], correctIndex: 2, explanation: "mind از وفاداران گروه ing است: mind opening." },
      { question: "تفاوت «stopped smoking» و «stopped to smoke» چیست؟", options: ["هیچ", "اولی: ترک سیگار؛ دومی: ایستادن برای سیگار کشیدن", "اولی غلط است", "دومی غلط است"], correctIndex: 1, explanation: "ing = کارِ قبلی را قطع کرد (ترک کرد)؛ to = برای انجام کاری توقف کرد (ایستاد تا سیگار بکشد)." },
    ],
  },
];
