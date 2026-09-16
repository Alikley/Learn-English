import type { GrammarLesson } from "./types";

// ========================================
// گرامر مبتدی — ۱۰ درس واقعی (A1 / A2)
// v1.0.1.3 — بازنویسی کامل با آموزش مفهومی عمیق:
// هر درس = چرا مهم است + ۳ بخش آموزشی چندپاراگرافی
// + قانون در یک نگاه + جدول ساختار + ۸ مثال
// + ۴ اشتباه رایج + نکته‌های طلایی + آزمونک
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-beginner-01",
    titleFa: "افعال to be (am / is / are)",
    titleEn: "Verb to be",
    cefr: "A1",
    intro:
      "فعل to be پرکاربردترین فعل زبان انگلیسی است و بدون آن حتی نمی‌توانید یک جمله سادهٔ معرفی بنویسید. هر جا بخواهید بگویید چیزی «چیست»، «چه حالتی دارد» یا «کجاست»، این فعل وارد می‌شود. یادگیری درست همین یک فعل، پایهٔ صد جملهٔ بعدی شما خواهد بود؛ پس ارزش دارد آن را عمیق و مفهومی یاد بگیرید، نه فقط حفظ کردن سه کلمه.",
    sections: [
      {
        title: "چرا انگلیسی بدون فعل «بودن» جامد می‌شود؟",
        paragraphs: [
          "در زبان فارسی ما مدام فعل «هست» را حذف می‌کنیم و جمله باز هم کامل به نظر می‌رسد. وقتی می‌گوییم «من دانشجوام» یا «هوا سرد»، هیچ فعل صریحی به گوش نمی‌رسد، اما جمله کاملاً درست است. انگلیسی از این نظر سخت‌گیر است: هیچ‌گاه فعل اصلی جمله حذف نمی‌شود. جمله‌ای که فعل ندارد، از نظر انگلیسی‌زبان یا ناقص است یا معنای کاملاً متفاوتی پیدا می‌کند.",
          "وقتی می‌گوییم «من دانشجو» و آن را به انگلیسی برسانیم با I student، گوش یک انگلیسی‌زبان منتظر یک فعل می‌ماند که هرگز نمی‌آید؛ مثل این است که وسط راه پل قطع شده باشد. برای همین باید بگوییم I am a student. فعل to be همان چسبی است که دو طرف جمله را به هم می‌چسباند: از یک طرف فاعل و از طرف دیگر اسم، صفت یا مکان. هر جمله‌ای که چیزی را «توصیف» یا «معرفی» یا «مکان‌یابی» می‌کند، به این چسب نیاز دارد.",
        ],
        examples: [
          { en: "I am a student.", fa: "من دانشجو هستم. (معرفی)" },
          { en: "The weather is cold.", fa: "هوا سرد است. (توصیف)" },
          { en: "We are at home.", fa: "ما در خانه هستیم. (مکان)" },
        ],
      },
      {
        title: "توافق فاعل و فعل — قلب ماجرای am / is / are",
        paragraphs: [
          "نکتهٔ کلیدی این درس «توافق» است: شکل فعل باید با فاعل هم‌خانواده باشد. انگلیسی برای فعل بودن سه شکل دارد: am فقط و فقط برای I است؛ is برای هر فاعل مفرد سوم‌شخص یعنی he، she و it؛ و are برای you، we و they. دقت کنید که you در انگلیسی همیشه are می‌گیرد، حتی وقتی به یک نفر خطاب می‌شوید؛ چون you از نظر گرامری همیشه جمع محسوب می‌شود.",
          "برای اینکه این توافق را درست انجام دهید، قبل از نوشتن فعل از خودتان بپرسید: فاعل من کدام ضمیر است؟ اگر جمله فاعل طولانی دارد، مثل «my brother and my sister»، آن را ساده کنید: این عبارت یعنی they، پس are می‌گیرد. این تمرین ذهنی ساده، نصف اشتباهات مبتدی‌ها را از بین می‌برد و بعدها که با فعل‌های دیگر کار کنید هم به کارتان می‌آید، چون قاعدهٔ توافق در کل زبان انگلیسی یکسان است.",
        ],
        examples: [
          { en: "My brother and my sister are doctors.", fa: "برادرم و خواهرم دکتر هستند. (فاعل = they)" },
          { en: "This book is heavy.", fa: "این کتاب سنگین است. (فاعل = it)" },
        ],
      },
      {
        title: "منفی کردن، سوالی کردن و کوتاه‌نویسی",
        paragraphs: [
          "منفی کردن این فعل بسیار ساده است: کافی است not را بلافاصله بعد از فعل بیاورید؛ I am not، she is not (یا isn't)، they are not (یا aren't). در گفتار روزمره انگلیسی‌زبان‌ها تقریباً همیشه شکل کوتاه را به کار می‌برند و استفاده از شکل بلند، حالت رسمی و تأکیدی پیدا می‌کند. پس Isn't she happy? طبیعی‌تر از Is she not happy? است، مگر بخواهید تعجب یا خشم خود را نشان دهید.",
          "برای سوالی کردن، فعل را از جایش بلغزانید و به اول جمله بیاورید: Are you tired? — Is he at work? این «جابه‌جایی فعل» مهم‌ترین ابزار شما در ساختن سؤال‌های بله/خیر است. برای جواب کوتاه هم هرگز دوباره کل جمله را تکرار نمی‌کنیم؛ فقط از خود فعل استفاده می‌کنیم: Yes, I am. یا No, he isn't. توجه کنید که در جواب کوتاه منفی نمی‌گوییم No, I amn't — این شکل در انگلیسی وجود ندارد و باید بگویید No, I'm not.",
        ],
        examples: [
          { en: "She isn't ready yet.", fa: "او هنوز آماده نیست." },
          { en: "Are they at school? — Yes, they are.", fa: "آن‌ها در مدرسه‌اند؟ — بله، هستند." },
        ],
      },
    ],
    rule:
      "فعل to be هرگز از جمله حذف نمی‌شود. I + am، he/she/it + is، you/we/they + are. برای منفی، not بعد از فعل می‌آید (isn't / aren't). برای سؤال، فعل به ابتدای جمله می‌رود: Is she ready? جواب کوتاه با خود فعل ساخته می‌شود: Yes, she is / No, she isn't. فعل بودن بعد از فاعل و قبل از اسم، صفت یا قید مکان می‌نشیند و هیچ فعل کمکی دیگری در جملهٔ ساده لازم نیست.",
    form: [
      { label: "مثبت (من)", pattern: "I am + صفت/اسم → I am happy." },
      { label: "مثبت (او/او/آن)", pattern: "He / She / It is + صفت/اسم → She is a nurse." },
      { label: "مثبت (تو/ما/آن‌ها)", pattern: "You / We / They are + صفت/اسم → They are at home." },
      { label: "منفی", pattern: "فعل + not → I am not / He isn't / They aren't ready." },
      { label: "سوالی", pattern: "Am / Is / Are + فاعل؟ → Are you a student?" },
      { label: "جواب کوتاه", pattern: "Yes, I am. / No, he isn't. / Yes, they are." },
    ],
    examples: [
      { en: "I am a teacher and my sister is a doctor.", fa: "من معلمم و خواهرم دکتر است." },
      { en: "These bags are very heavy.", fa: "این کیف‌ها خیلی سنگین‌اند." },
      { en: "My father isn't at home; he is at work.", fa: "پدرم خانه نیست؛ سر کار است." },
      { en: "Are you from Tehran? — Yes, I am.", fa: "شما اهل تهران هستید؟ — بله، هستم." },
      { en: "The weather is cold today.", fa: "امروز هوا سرد است." },
      { en: "We aren't ready for the exam yet.", fa: "ما هنوز برای امتحان آماده نیستیم." },
      { en: "Your keys are on the table.", fa: "کلیدهایت روی میز است." },
      { en: "Is your mother a nurse? — No, she isn't. She's a teacher.", fa: "مادرت پرستار است؟ — نه. او معلم است." },
    ],
    mistakes: [
      { wrong: "I student.", right: "I am a student.", note: "در انگلیسی فعل هیچ‌وقت حذف نمی‌شود، حتی وقتی در فارسی «هستم» را نمی‌گوییم." },
      { wrong: "She are my mother.", right: "She is my mother.", note: "برای she همیشه از is استفاده کنید؛ توافق فاعل و فعل را قبل از نوشتن چک کنید." },
      { wrong: "Are you teacher?", right: "Are you a teacher?", note: "شغل مفرد و قابل‌شمارش است؛ بعد از فعل to be به a/an نیاز دارد." },
      { wrong: "No, I amn't.", right: "No, I'm not.", note: "شکل کوتاه amn't در انگلیسی وجود ندارد؛ منفیِ am همیشه I'm not است." },
    ],
    tips: [
      "قبل از نوشتن فعل، فاعل را در ذهنتان به ضمیر (I/you/he/she/it/we/they) تبدیل کنید؛ آنگاه انتخاب بین am و is و are خودکار و بی‌خطا می‌شود.",
      "شکل‌های کوتاه (I'm, he's, they're, isn't, aren't) را در گفتار به کار ببرید؛ استفاده از شکل بلند در مکالمهٔ معمولی، گوش را غیرطبیعی می‌کند.",
      "برای سؤال ساختن فقط جای فعل و فاعل را عوض می‌کنید؛ این الگو بعدها در تمام فعل‌های کمکی (can، will، have و...) تکرار می‌شود، پس همین حالا خوب در آن تمرین کنید.",
      "هر روز سه چیز اطرافتان را با این الگو توصیف کنید: This tea is hot. My room is small. The streets are busy. — این تمرین کوچک، فعل بودن را به réflex ذهنی شما تبدیل می‌کند.",
    ],
    quiz: [
      { question: "جمله «آن‌ها خسته‌اند» کدام است؟", options: ["They is tired.", "They am tired.", "They are tired.", "They be tired."], correctIndex: 2, explanation: "برای they همیشه are به کار می‌رود؛ توافق فاعل و فعل اجباری است." },
      { question: "شکل سوالی جمله «He is a doctor» چیست؟", options: ["He is a doctor?", "Is he a doctor?", "Does he a doctor?", "Is a doctor he?"], correctIndex: 1, explanation: "برای سوالی کردن، فعل to be به ابتدای جمله می‌رود." },
      { question: "جمله «ما معلم نیستیم» کدام است؟", options: ["We not are teachers.", "We aren't teachers.", "We isn't teachers.", "We don't teachers."], correctIndex: 1, explanation: "منفی کردن با not بعد از are انجام می‌شود: We aren't teachers." },
      { question: "کدام جمله درست است؟", options: ["I am hungry and he am too.", "I is hungry and he is too.", "I am hungry and he is too.", "I are hungry and he is too."], correctIndex: 2, explanation: "I با am و he با is می‌آید؛ هر فاعل فعل خودش را دارد." },
      { question: "جواب کوتاه درست به «Are you tired?» چیست؟", options: ["Yes, I tired.", "Yes, I am.", "Yes, I do.", "Yes, am I."], correctIndex: 1, explanation: "جواب کوتاه با خودِ فعل ساخته می‌شود: Yes, I am." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-02",
    titleFa: "ضمایر شخصی و مالکیت",
    titleEn: "Personal and Possessive Pronouns",
    cefr: "A1",
    intro:
      "ضمایر ستون فقرات هر زبان‌اند؛ بدون آن‌ها مجبور می‌شدید همه‌جا اسم کامل مردم و چیزها را تکرار کنید. در این درس تفاوت سه گروه کلیدی را یاد می‌گیرید: ضمیر فاعلی که جای فاعل می‌نشیند، صفت مالکیت که قبل از اسم می‌آید، و ضمیر مطلق که خودش به‌تنهایی مالکیت را کامل می‌کند. اشتباه در انتخاب بین این سه گروه، یکی از رایج‌ترین خطاهای فارسی‌زبانان است و ریشهٔ آن نگاه‌نکردن به «جایگاه» کلمه در جمله است.",
    sections: [
      {
        title: "سه جایگاه، سه گروه: فاعلی، مالکیتی، مطلق",
        paragraphs: [
          "قاعدهٔ طلایی این است که شکل ضمیر به «جایگاهش در جمله» بستگی دارد، نه فقط به معنایش. اگر کلمه در جایگاه فاعل نشسته (یعنی کارِ جمله را انجام می‌دهد)، باید ضمیر فاعلی باشد: I، you، he، she، it، we، they. اگر قبل از یک اسم آمده و مالک آن را نشان می‌دهد، صفت مالکیت است: my، your، his، her، its، our، their. و اگر بعد از فعل آمده و به‌تنهایی می‌نشیند (اسمی بعدش نیست)، ضمیر مطلق است: mine، yours، his، hers، ours، theirs.",
          "این تفکیک در فارسی وجود ندارد و به همین دلیل اذیت‌کننده می‌شود. ما برای هر سه حالت از یک واکه استفاده می‌کنیم و جمله از کار نمی‌افتد، اما انگلیسی سه جعبهٔ جدا برای این سه کار دارد. مثال به‌یادماندنی: This is her book / This book is hers — در جملهٔ اول her قبل از اسم آمده و در دومی hers خودش جای اسم نشسته. اگر جمله‌ای نوشتید که بعد از ضمیرِ مالکیتی اسمی نیامده، یعنی گروه اشتباهی را انتخاب کرده‌اید.",
        ],
        examples: [
          { en: "She loves her cat.", fa: "او (زن) گربه‌اش را دوست دارد. (فاعلی + مالکیتی)" },
          { en: "This car is mine, not yours.", fa: "این ماشین مال من است، نه مال تو. (مطلق)" },
        ],
      },
      {
        title: "his و her: تلهٔ شمارهٔ یک فارسی‌زبانان",
        paragraphs: [
          "در فارسی «او» و «اوها» جنسیت ندارند و مالکیت هم بی‌طرف است: «کتابش» یعنی کتاب او، حالا مرد باشد یا زن. انگلیسی اینجا دقیق‌تر عمل می‌کند: مالکیت را به «صاحب» نسبت می‌دهد نه به شیء. پس This is his book یعنی کتابِ یک مرد، و This is her book یعنی کتابِ یک زن؛ مهم نیست کتاب خودش چه جنسیتی دارد — کتاب که اصلاً جنسیت ندارد!",
          "خطای معکوس هم رایج است: وقتی فاعل زن است و مفعول مرد، بعضی‌ها از روی عجله her می‌گذارند چون جمله دربارهٔ یک زن است. مثال: Sarah loves her brother — این her به Sarah برمی‌گردد (صاحبِ برادر)، نه به خود برادر. پیش از نوشتن مالکیت، همیشه این سؤال را بپرسید: «مالکِ کیست؟» و سپس جنسیت همان مالک را انتخاب کنید، نه جنسیت چیزِ مال‌شده.",
        ],
        examples: [
          { en: "Ali and his sister are here.", fa: "علی و خواهرِ او (علی) اینجا هستند." },
          { en: "Mary washes her car every Friday.", fa: "مری ماشینش را هر جمعه می‌شوید. (مالک = مری)" },
        ],
      },
      {
        title: "it's یا its؟ و ترفند تشخیص سریع",
        paragraphs: [
          "دو کلمهٔ کوچک که صدای یکسان دارند اما هوای متفاوتی می‌کنند: it's با آپاستروف یعنی it is یا it has (کوتاه‌نویسی فعل)، اما its بدون آپاستروف یعنی «مالِ آن» (مالکیت). جملهٔ Its wheels are red یعنی چرخ‌های آن قرمزند، در حالی که It's cold یعنی هوا سرد است. این یکی از پربازتاب‌ترین غلط‌های املایی حتی بین خود انگلیسی‌زبان‌هاست.",
          "ترفند تشخیص یک‌ثانیه‌ای این است: در جمله، it is را جای it's بگذارید و معنا را بخوانید. اگر جمله منطقی ماند، آپاستروف لازم است؛ اگر به هم ریخت، شکل مالکیتی بدون آپاستروف درست است. همین ترفند برای they're (they are) و their (مالکیت) و there (آن‌جا) هم کار می‌کند و کل خانوادهٔ این خطاهای رایج را با یک حرکت حل می‌کند.",
        ],
        examples: [
          { en: "The dog wagged its tail.", fa: "سگ دمش را تکان داد. (مالکیت)" },
          { en: "It's raining outside.", fa: "بیرون باران می‌بارد. (it is)" },
        ],
      },
    ],
    rule:
      "شکل ضمیر از جایگاهش در جمله معلوم می‌شود: فاعل → I/he/she/it/we/they؛ قبل از اسم (مالکیت) → my/his/her/its/our/their؛ بعد از فعل و بدون اسم (مطلق) → mine/his/hers/ours/theirs. جنسیت مالکیت به «صاحب» بستگی دارد نه به شیء: his برای مرد، her برای زن. it's = it is ولی its = مالِ آن؛ در مالکیت هرگز آپاستروف نمی‌آید.",
    form: [
      { label: "ضمیر فاعلی", pattern: "I / you / he / she / it / we / they" },
      { label: "صفت مالکیت", pattern: "my / your / his / her / its / our / their + اسم" },
      { label: "ضمیر مطلق", pattern: "mine / yours / his / hers / ours / theirs (بدون اسم)" },
      { label: "مثال ضمیر مطلق", pattern: "This car is mine. (= my car)" },
      { label: "تفکیک تله‌دار", pattern: "It's = it is / its = مالِ آن" },
    ],
    examples: [
      { en: "She loves her cat very much.", fa: "او (زن) گربه‌اش را خیلی دوست دارد." },
      { en: "Our house is small but comfortable.", fa: "خانهٔ ما کوچک اما راحت است." },
      { en: "This isn't my umbrella; it's yours.", fa: "این چترِ من نیست؛ مال توست." },
      { en: "They forgot their tickets at home.", fa: "آن‌ها بلیط‌هایشان را در خانه جا گذاشتند." },
      { en: "He broke his leg last week.", fa: "او هفتهٔ پیش پایش را شکست." },
      { en: "Its wheels are red.", fa: "چرخ‌های آن قرمز است." },
      { en: "My phone is old, but hers is new.", fa: "گوشی من قدیمی است، اما مال او (زن) نو است." },
      { en: "The company raised its prices.", fa: "شرکت قیمت‌هایش را بالا برد." },
    ],
    mistakes: [
      { wrong: "Me and my friend go to the gym.", right: "My friend and I go to the gym.", note: "در جایگاه فاعل از I استفاده کنید، نه me؛ و برای ادب، خودتان را آخر ذکر کنید." },
      { wrong: "She loves he.", right: "She loves him.", note: "بعد از فعل، ضمیر مفعولی لازم است: him، her، them، me." },
      { wrong: "The dog wagged it's tail.", right: "The dog wagged its tail.", note: "it's یعنی it is؛ مالکیت بدون آپاستروف نوشته می‌شود." },
      { wrong: "This pen is my.", right: "This pen is mine.", note: "بعد از فعل to be و بدون اسم، ضمیر مطلق (mine) می‌آید نه صفت مالکیت." },
    ],
    tips: [
      "قبل از انتخاب ضمیر، جایگاهش را مشخص کنید: کار را انجام می‌دهد (فاعلی)؟ قبل از اسم است (مالکیتی)؟ جای اسم نشسته (مطلق)؟ — همین سه سؤال، خطا را صفر می‌کند.",
      "برای his/her همیشه به «صاحب مال» فکر کنید نه به خود شیء؛ جنسیتِ مالک تعیین‌کننده است.",
      "ترفند آپاستروف را یادتان باشد: اگر it is در جمله جا می‌افتود، آن‌وقت it's درست است؛ وگرنه its.",
      "ضمیرهای مطلق را با الگوی «A is mine, B is hers» تمرین کنید؛ مقایسهٔ دو مالکیت، این ساختار را سریع‌تر از حفظ‌کردن در ذهن تثبیت می‌کند.",
    ],
    quiz: [
      { question: "جای خالی را پر کنید: «Ali and ___ are brothers.»", options: ["me", "I", "my", "mine"], correctIndex: 1, explanation: "جایگاه فاعل است و فعل را Ali انجام می‌دهد؛ پس I." },
      { question: "«این قلم مال من است» کدام است؟", options: ["This pen is my.", "This is mine pen.", "This pen is mine.", "This pen is me."], correctIndex: 2, explanation: "mine به‌تنهایی می‌نشیند و اسم نمی‌خواهد." },
      { question: "کدام جمله درست است؟", options: ["Sarah brushed hers hair.", "Sarah brushed her hair.", "Sarah brushed she hair.", "Sarah brushed hers."], correctIndex: 1, explanation: "قبل از اسم از صفت مالکیت (her) استفاده می‌شود، نه ضمیر مطلق." },
      { question: "«آن‌ها فرزندان‌شان را دوست دارند» کدام است؟", options: ["They love his children.", "They love they children.", "They love their children.", "They love them children."], correctIndex: 2, explanation: "صفت مالکیت برای they کلمهٔ their است." },
      { question: "کدام جمله معنای «مالکیت» دارد (نه کوتاه‌نویسی فعل)؟", options: ["It's a big city.", "It's been raining.", "The cat licked its paw.", "It's ten o'clock."], correctIndex: 2, explanation: "its بدون آپاستروف یعنی «مالِ آن»؛ بقیه it is یا it has هستند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-03",
    titleFa: "حروف تعریف a / an / the",
    titleEn: "Articles",
    cefr: "A1",
    intro:
      "حروف تعریف کوچک‌ترین کلمات انگلیسی‌اند اما بیشترین اشتباه را ایجاد می‌کنند، چون فارسی چیزی شبیه آن‌ها ندارد. a/an و the دربارهٔ «شناسایی» حرف می‌زنند: مخاطب شما می‌داند دقیقاً از کدام چیز صحبت می‌کنید یا نمی‌داند؟ یادگیری این منطق — و نه حفظ طوطی‌وار قواعد — کلید تسلط بر این درس است. با فهمیدن این منطق ساده، انتخاب بین a و an و the و «هیچ‌چیز» تقریباً همیشه خودکار می‌شود.",
    sections: [
      {
        title: "منطق پنهان: آیا مخاطب می‌داند از چه چیزی حرف می‌زنید؟",
        paragraphs: [
          "a/an و the دو سر یک طیف‌اند. وقتی می‌گویید I saw a dog، مخاطبتان هنوز نمی‌داند کدام سگ را می‌گویید؛ سگ تازه و ناشناس وارد گفت‌وگو می‌شود. اما وقتی ادامه می‌دهید The dog was friendly، حالا هر دو می‌دانید بحث از همان سگ قبلی است؛ the مثل انگشت اشاره‌ای است که به چیزِ «مطابق قبلی» برمی‌گردد. به این منطق، منطق «شناخته‌شده و ناشناس» می‌گوییم.",
          "the علاوه بر ارجاع قبلی، برای چیزهای «یکتا در جهان» هم به کار می‌رود: the sun، the moon، the sky — چون فقط یکی وجود دارد و همه می‌دانند منظور چیست. همچنین وقتی با حرف تعریف به چیزی عام اشاره می‌کنید که در آن لحاظ «یکدست» است، مثل the weather یا the government. در مقابل، وقتی دربارهٔ یک دستهٔ کامل و کلی حرف می‌زنید (Cats are cute یا I love music)، هیچ حرف تعریفی نمی‌آید؛ چون نه چیز خاصی ناشناس است و نه خاص و شناخته‌شده — از کل یک مفهوم صحبت می‌کنید.",
        ],
        examples: [
          { en: "I saw a dog in the park. The dog was very friendly.", fa: "در پارک سگی دیدم. سگ (همان سگ) خیلی دوستانه بود." },
          { en: "I love music. (= به‌طور کلی)", fa: "من عاشق موسیقی‌ام. (بدون حرف تعریف)" },
        ],
      },
      {
        title: "a یا an؟ تابع «صدا» است نه حرف",
        paragraphs: [
          "انتخاب بین a و an به حرف اول کلمهٔ بعدی بستگی ندارد، بلکه به «صدای» اول آن کلمه بستگی دارد. اگر کلمهٔ بعدی با صدای صدا (a, e, i, o, u) شروع شود an می‌آید: an apple، an egg، an idea. اگر با صدای صامت شروع شود a می‌آید: a book، a car، a house. دلیل این قاعده ساده و آکوستیک است: گفتن «a apple» زبان را می‌شکند و انگلیسی‌زبان‌ها قرن‌ها پیش برای روان‌شدن تلفظ، n را اضافه کردند.",
          "دو تلهٔ معروف اینجا کمین کرده‌اند: کلماتی مثل hour که حرف اولشان h است اما خوانده نمی‌شود، با صدای صداشروع می‌شوند پس an hour درست است. کلمات university و European با حرف صدا نوشته می‌شوند اما با صدای «یو» (صدای صامت w) شروع می‌شوند، پس a university و a European city می‌گوییم. جمع‌بندی: پیش از انتخاب، کلمه را بلند تلفظ کنید و به اولین «صدا»یی که از دهانتان بیرون می‌آید گوش دهید، نه به اولین حرف روی کاغذ.",
        ],
        examples: [
          { en: "She is an engineer at a big company.", fa: "او مهندسِ یک شرکت بزرگ است." },
          { en: "We waited for an hour. (h خوانده نمی‌شود)", fa: "یک ساعت منتظر ماندیم." },
          { en: "He studies at a university in Europe.", fa: "او در دانشگاهی در اروپا درس می‌خواند." },
        ],
      },
      {
        title: "کِی هیچ حرف تعریفی نمی‌آید؟",
        paragraphs: [
          "سه حالت اصلی وجود دارد که در آن‌ها اسم «برهنه» می‌ماند. اول، اسم‌های غیرقابل‌شمارش مفهومی مثل water، information، advice و music: نمی‌توان گفت an information چون این‌ها را نمی‌توان بشمارد و مفرد/جمع ندارند. دوم، جمع عام وقتی از کل یک دسته صحبت می‌کنیم: Cats sleep a lot یا I like cars. سوم، قبل از اسم‌های خاص مثل اسامی افراد، شهرها و کشورها: Sara، Tehran، Italy — البته استثناهایی مثل the Netherlands یا the United States را بعداً می‌بینید که چون «توصیفِ جمعی» در اسمشان هست، the می‌گیرند.",
          "اشتباه رایج فارسی‌زبانان این است که از روی تعارفِ زبان خودمان (که «یک» را زیاد به کار نمی‌بریم) a را حذف می‌کنند: I have question غلط است و باید بگویید I have a question. هر اسم مفرد قابل‌شمارشِ مفردِ ناشناس، پوشش a/an می‌خواهد؛ مثل این است که در خیابان با پای برهنه راه نروید — اسم مفرد هم بدون حرف تعریف بیرون نمی‌رود.",
        ],
        examples: [
          { en: "I need information about the course.", fa: "به اطلاعاتی دربارهٔ دوره نیاز دارم. (غیرقابل‌شمارش)" },
          { en: "Children learn languages quickly.", fa: "بچه‌ها زبان را سریع یاد می‌گیرند. (جمع عام)" },
        ],
      },
    ],
    rule:
      "a/an برای اسم مفرد قابل‌شمارشِ ناشناس (اولین اشاره)؛ انتخاب a یا an به صدای شروع کلمهٔ بعدی است نه حرف آن (an hour ولی a university). the وقتی که مخاطب می‌داند از چه چیزی حرف می‌زنید: اشارهٔ قبلی، یتیم‌های طبیعت (the sun) یا چیز یکتا. بدون حرف تعریف: اسم‌های غیرقابل‌شمارش (music)، جمع عام (cats are cute) و اسم‌های خاص (Tehran). هیچ اسم مفرد قابل‌شمارشی بدون پوشش a/an/the نمی‌ماند.",
    form: [
      { label: "a + صدای صامت", pattern: "a book / a car / a university" },
      { label: "an + صدای صدا", pattern: "an apple / an egg / an hour / an honest man" },
      { label: "the (شناخته‌شده)", pattern: "the book on the table / the sun / the same dog again" },
      { label: "بدون حرف تعریف", pattern: "I like music. / Cats are cute. / Sara lives in Tehran." },
      { label: "شغل مفرد", pattern: "She is a teacher. (هرگز She is teacher نه!)" },
    ],
    examples: [
      { en: "I saw a dog in the park. The dog was very friendly.", fa: "در پارک سگی دیدم. سگ خیلی دوستانه بود." },
      { en: "She is an engineer at a big company.", fa: "او مهندس یک شرکت بزرگ است." },
      { en: "We waited for an hour at the station.", fa: "یک ساعت در ایستگاه منتظر ماندیم." },
      { en: "The moon looks beautiful tonight.", fa: "امشب ماه زیبا به نظر می‌رسد." },
      { en: "My uncle has a farm with a hundred sheep.", fa: "عمویم مزرعه‌ای با صد گوسفند دارد." },
      { en: "Honey is good for a sore throat.", fa: "عسل برای گلودرد خوب است." },
      { en: "Please close the door when you leave.", fa: "لطفاً موقع رفتن در را ببند. (هر دو می‌دانند کدام در)" },
      { en: "He plays the piano in an orchestra.", fa: "او در یک ارکستر پیانو می‌نوازد. (سازها the می‌گیرند)" },
    ],
    mistakes: [
      { wrong: "She is teacher of English.", right: "She is an English teacher.", note: "شغل مفرد قابل‌شمارش است و حتماً a/an می‌خواهد؛ حذفش جمله را از نظر انگلیسی ناقص می‌کند." },
      { wrong: "I love the cats.", right: "I love cats.", note: "برای حرف عام دربارهٔ یک دستهٔ کامل، the نمی‌آید؛ the یک عضو خاص را مشخص می‌کند." },
      { wrong: "He plays piano in a orchestra.", right: "He plays the piano in an orchestra.", note: "دو خطا در یک جمله: سازهای موسیقی the می‌گیرند و orchestra با صدای صدا شروع می‌شود پس an می‌خواهد." },
      { wrong: "I need an information.", right: "I need information.", note: "information غیرقابل‌شمارش است؛ نه a/an می‌گیرد و نه جمع می‌شود (informations غلط است)." },
    ],
    tips: [
      "قبل از انتخاب، این سؤال یک‌ثانیه‌ای را بپرسید: «مخاطب من می‌داند دقیقاً کدام را می‌گویم؟» — بله → the؛ نه → a/an؛ اصلاً از کل دسته حرف می‌زنم → هیچ‌چیز.",
      "برای a یا an، کلمهٔ بعدی را بلند بگویید و به صدای اولش گوش کنید: hour «آوِر» است پس an hour؛ university «یونیورسیتی» است پس a university.",
      "اسم‌های غیرقابل‌شمارش معروف را یک‌بار برای همیشه یاد بگیرید: information، advice، furniture، luggage، news، music، water — این‌ها هیچ‌وقت a/an نمی‌گیرند.",
      "الگوی «اول a بعد the» را در داستان‌های کوتاه تمرین کنید: I bought a shirt. The shirt was cheap... — این چرخه، کاربرد طبیعی the را در ذهن شما جا می‌اندازد.",
    ],
    quiz: [
      { question: "کدام گزینه درست است؟ «___ apple a day keeps the doctor away.»", options: ["A", "An", "The", "—"], correctIndex: 1, explanation: "apple با صدای صدا شروع می‌شود، پس an." },
      { question: "«ما یک فیلم دیدیم. فیلم خیلی طولانی بود.» کدام است؟", options: ["We saw a movie. A movie was very long.", "We saw a movie. The movie was very long.", "We saw the movie. The movie was very long.", "We saw an movie. Movie was very long."], correctIndex: 1, explanation: "بار اول که چیز ناشناس معرفی شد a می‌آید؛ بار دوم که شناخته شد the." },
      { question: "کدام کلمه با an می‌آید؟", options: ["university", "European", "hour", "one-way street"], correctIndex: 2, explanation: "در hour حرف h خوانده نمی‌شود و کلمه با صدای صدا شروع می‌شود." },
      { question: "کدام جمله درست است؟", options: ["I need an information.", "I need a information.", "I need information.", "I need the informations."], correctIndex: 2, explanation: "information غیرقابل‌شمارش است؛ نه a/an می‌گیرد و نه جمع می‌شود." },
      { question: "چرا می‌گوییم «the sun»؟", options: ["چون خورشید مفرد است", "چون همه می‌دانند کدام خورشید؛ یکتاست", "چون sun غیرقابل‌شمارش است", "چون همیشه the می‌گیرد همهٔ اسم‌ها"], correctIndex: 1, explanation: "the برای چیزهای شناخته‌شده و یکتا به کار می‌رود؛ خورشید فقط یکی است و reference مشخص است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-04",
    titleFa: "جمله‌سازی ساده و this / that / these / those",
    titleEn: "Basic Sentences & Demonstratives",
    cefr: "A1",
    intro:
      "انگلیسی زبانی با «ترتیب کلمات سفت‌وسخت» است: جای فاعل و فعل و مفعول تقریباً هیچ‌وقت عوض نمی‌شود. این سفت‌وسختی خبر خوبی دارد؛ یعنی وقتی الگو را یک بار یاد بگیرید، هزاران جمله را با خیال راحت می‌سازید. در این درس ساختار پایهٔ جمله را مفهومی یاد می‌گیرید و با چهار کلمهٔ اشاره (this/that/these/those) یاد می‌گیرید چطور دربارهٔ چیزهای نزدیک و دور حرف بزنید — ابزاری که در خرید و معرفی و توصیف، هر روز لازم می‌شود.",
    sections: [
      {
        title: "ساختار SVO: چرا ترتیب در انگلیسی حکم قانون دارد؟",
        paragraphs: [
          "فارسی زبان «پس‌پردازنده» است: فعل را آخر جمله می‌گذارد و تا آخر لحظهٔ آخر معلوم نیست چه اتفاقی می‌افتد (علی سیب را خورد). انگلیسی برعکس «پیش‌پردازنده» است: اول می‌گوید چه کسی، بعد چه کاری، بعد با چه چیزی — Subject + Verb + Object یا همان SVO. این ترتیب آن‌قدر قانونی است که جابه‌جایی‌اش معنا را عوض می‌کند: The dog bit the man با The man bit the dog زمین تا آسمان فرق دارد، در حالی که در فارسی با تغییر نقش‌های دستوری، جای فعل همان می‌ماند.",
          "دو قانون تزئینی هم کنار این ستون اصلی قرار می‌گیرند: اول، صفت همیشه «قبل از» اسم می‌آید نه بعد از آن؛ a red car می‌گوییم نه a car red. دوم، قیدهای مکان و زمان معمولاً به انتهای جمله می‌روند: I drink tea at home every morning. اگر این سه قانون را رعایت کنید — فاعل، فعل، مفعول؛ صفت قبل از اسم؛ زمان و مکان آخر — ساختار جمله‌هایتان از همان روز اول حرفه‌ای به گوش می‌رسد.",
        ],
        examples: [
          { en: "She has a small dog.", fa: "او سگ کوچکی دارد. (صفت قبل از اسم)" },
          { en: "I drink tea at home every morning.", fa: "من هر صبح در خانه چای می‌نوشم. (زمان/مکان آخر)" },
        ],
      },
      {
        title: "چهار کلمهٔ اشاره: نقشهٔ نزدیک و دور",
        paragraphs: [
          "کلمات اشاره در انگلیسی روی دو محور حرکت می‌کنند: «فاصله» و «تعداد». فاصلهٔ نزدیک را this (مفرد) و these (جمع) نشان می‌دهند — چیزهایی که می‌توانید لمس کنید یا در دستتان هستند. فاصلهٔ دور را that (مفرد) و those (جمع) — چیزهایی که آن‌طرف اتاق یا آن‌طرف یادداشت‌ها هستند. این تفکیک در فارسی ما با «این/آن/این‌ها/آن‌ها» وجود دارد، پس منطقش برایتان غریبه نیست؛ فقط باید تمرین کنید که به‌صورت غریزی از آن استفاده کنید.",
          "کاربرد پنهان اما مهم: this و that در مکالمه برای «موضوعِ در حال صحبت» هم به کار می‌روند، نه فقط اشیای فیزیکی. This is what I mean یعنی «منظورم همین (حرف) است» و That sounds great یعنی «اون (فکر/پیشنهادی که گفتی) عالی به نظر می‌رسه». وقتی در تلفن هم خودتان را معرفی می‌کنید انگلیسی‌زبان‌ها می‌گویند Hi, this is Sara — چون «منِ در حال حاضرِ همین خط تلفن» در دسترس و نزدیک هستید.",
        ],
        examples: [
          { en: "This tea is delicious. (لیوان در دست من)", fa: "این چای خوشمزه است." },
          { en: "Those mountains are beautiful. (دور، جمع)", fa: "آن کوه‌ها زیبا هستند." },
          { en: "Hi, this is Ali on the phone.", fa: "سلام، علی هستم (در تلفن)." },
        ],
      },
      {
        title: "سؤال با What و پاسخ با کلمات اشاره",
        paragraphs: [
          "رایج‌ترین سؤالی که با کلمات اشاره ساخته می‌شود ساختار What is this/that? است و جوابش با همان کلمهٔ اشاره برمی‌گردد: What is this? — This is my bag. همین الگوی ساده را با جمع هم تکرار می‌کنید: What are these? — These are my books. توجه کنید که فعل هم باید با تعداد کلمهٔ اشاره هماهنگ باشد: this/that با is و these/those با are می‌آیند؛ خطای this books are شایع و کاملاً قابل پیشگیری است.",
          "برای پرسیدن «کیست؟» هم همین الگو کار می‌کند: Who is that? — That is my brother. دقت کنید انگلیسی‌زبان‌ها برای اشاره به آدم‌ها هم this و that می‌گویند و این بی‌ادبی نیست؛ ساده و بی‌واسطه است. وقتی معرفی رسمی می‌کنید می‌گویید This is my friend, Reza و هیچ‌کس تعجب نمی‌کند. پس این چهار کلمه را ابزار همه‌کارهٔ «نشان‌دادن» بدانید، چه چیز، چه آدم، چه فکر.",
        ],
        examples: [
          { en: "What are these? — They're my keys.", fa: "این‌ها چی هستند؟ — کلیدهای من هستند." },
          { en: "Who is that girl? — That is my sister.", fa: "آن دختر کیست؟ — آن خواهر من است." },
        ],
      },
    ],
    rule:
      "ترتیب پایهٔ جمله انگلیسی همیشه SVO است: فاعل + فعل + مفعول. صفت قبل از اسم می‌آید (a red car) و قید مکان/زمان معمولاً آخر جمله. کلمات اشاره: this (نزدیک مفرد) / that (دور مفرد) / these (نزدیک جمع) / those (دور جمع)؛ فعل با تعدادشان هماهنگ می‌شود: this is ولی these are. سؤال: What is this? / What are those? — پاسخ با خود کلمهٔ اشاره: This is my bag.",
    form: [
      { label: "ساختار پایه", pattern: "فاعل + فعل + مفعول → I drink tea." },
      { label: "با صفت", pattern: "فاعل + فعل + صفت + اسم → She has a small dog." },
      { label: "با مکان/زمان", pattern: "فاعل + فعل + مفعول + مکان + زمان → We play football at the park on Fridays." },
      { label: "کلمات اشاره", pattern: "this/that + مفرد · these/those + جمع" },
      { label: "سؤال و جواب", pattern: "What is this? — This is my bag. / What are those? — Those are shoes." },
    ],
    examples: [
      { en: "This is my house and that is our car.", fa: "این خانهٔ من است و آن ماشین ما." },
      { en: "These oranges are sweet, but those are sour.", fa: "این پرتقال‌ها شیرین‌اند، اما آن‌ها ترش." },
      { en: "That building is the tallest in the city.", fa: "آن ساختمان بلندترین ساختمان شهر است." },
      { en: "What is that in your hand?", fa: "آن چیست که در دستت داری؟" },
      { en: "These shoes are too small for me.", fa: "این کفش‌ها برای من خیلی کوچک‌اند." },
      { en: "I read an interesting book last night.", fa: "دیشب کتاب جالبی خواندم. (صفت قبل از اسم)" },
      { en: "My mother makes delicious food every day.", fa: "مادرم هر روز غذای خوشمزه می‌پزد." },
      { en: "Those were the best days of my life.", fa: "آن‌ها بهترین روزهای زندگی من بودند." },
    ],
    mistakes: [
      { wrong: "I like very much this book.", right: "I like this book very much.", note: "مفعول بلافاصله بعد از فعل می‌آید؛ قید شدت (very much) آخر جمله می‌نشیند." },
      { wrong: "She has a dog small.", right: "She has a small dog.", note: "صفت همیشه قبل از اسم می‌آید، هرچند در فارسی بعدش بایستد." },
      { wrong: "This books are expensive.", right: "These books are expensive.", note: "this فقط با مفرد؛ برای جمع نزدیک these به کار می‌رود." },
      { wrong: "What is these?", right: "What are these?", note: "فعل باید با تعداد کلمهٔ اشاره هماهنگ باشد: these/those همیشه با are." },
    ],
    tips: [
      "هنگام ساختن جمله، اول سه جای خالی بگذارید: «چه‌کسی + چه‌کاری + باچه‌چیزی» و بعد پرشان کنید؛ این عادت ساده جابه‌جایی SVO را از ریشه حذف می‌کند.",
      "برای انتخاب کلمهٔ اشاره دو سؤال بپرسید: «دور است یا نزدیک؟» و «یکی است یا چندتا؟» — جدول ۲×۲ همین دو سؤال، چهار کلمه را تعیین می‌کند.",
      "در تلفن و پیام‌رسانی، این الگوها طبیعی‌اند: Hi, this is Ali / What's that noise? — مکالمه‌های واقعی بهترین باشگاه تمرین همین ساختارهای ساده‌اند.",
      "پنج شیء اطرافتان را با this/these نشان بدهید و پنج شیء دورتر را با that/those توصیف کنید؛ تمرین فیزیکی با اجسام واقعی، ماندگاری گرامر را چند برابر می‌کند.",
    ],
    quiz: [
      { question: "ترتیب درست کلمات برای «یک ماشین قرمز خریدم» کدام است؟", options: ["I bought car a red.", "I bought a car red.", "I bought a red car.", "I red bought a car."], correctIndex: 2, explanation: "ترتیب SVO + صفت قبل از اسم: I bought a red car." },
      { question: "کدام جمله درست است؟", options: ["This apples are fresh.", "These apples are fresh.", "These apple are fresh.", "Those apple is fresh."], correctIndex: 1, explanation: "جمعِ نزدیک = these + اسم جمع + are." },
      { question: "«آن (دور) برادر من است» کدام است؟", options: ["This is my brother.", "That is my brother.", "These are my brother.", "Those is my brother."], correctIndex: 1, explanation: "مفرد و دور → that is." },
      { question: "جای صحیح قید زمان در کدام جمله رعایت شده؟", options: ["Every morning I my teeth brush.", "I brush every morning my teeth.", "I brush my teeth every morning.", "I every morning brush my teeth."], correctIndex: 2, explanation: "قید زمان معمولاً انتهای جمله می‌نشیند (یا خیلی ابتدای آن): I brush my teeth every morning." },
      { question: "در تلفن خودتان را چطور معرفی می‌کنید؟", options: ["I am here Ali.", "That is Ali.", "This is Ali.", "Ali is this."], correctIndex: 2, explanation: "در تلفن، خودِ گوینده «در دسترس و نزدیک» است؛ This is Ali می‌گویند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-05",
    titleFa: "جمع کردن اسم‌ها",
    titleEn: "Plural Nouns",
    cefr: "A1",
    intro:
      "در فارسی جمع‌ها منظم‌اند: یک «-ها» و تمام. انگلیسی اما چند مسیر مختلف برای جمع‌کردن دارد و انتخاب مسیر به «پایان اسم» بستگی دارد. خبر خوب این است که قاعدهٔ اصلی فقط یک چیز است: افزودن s. خبر بهتر اینکه استثناها محدود و شمرده‌اند و با چند ترفند صدایی می‌توانید آن‌ها را هم پیش‌بینی کنید. این درس پایهٔ همهٔ جمله‌های شمارشی شماست؛ از خرید سبزی تا توصیف اعضای خانواده.",
    sections: [
      {
        title: "قاعدهٔ اصلی و منطق صدایی آن",
        paragraphs: [
          "برای جمع‌کردن اکثر اسم‌ها کافی است s به آخرشان اضافه کنید: book → books، car → cars، apple → apples. اما وقتی اسم به صداهای خاصی ختم شود، s تنها به‌تنهایی کافی نیست و گوش انگلیسی‌زبان آن را «نمی‌شنود». اگر اسم به صداهای خس‌دار s، sh، ch، x یا o ختم شود، بعد از آن‌ها فقط es اضافه می‌کنیم: bus → buses، watch → watches، box → boxes، potato → potatoes. دلیلش ساده است: bus+s یعنی «باسس» که تلفظش گم می‌شود؛ es یک صدای واضح «ایز» اضافه می‌کند.",
          "دو تغییر جزئی هم لازم است بدانید: اسم‌هایی که به «حرف صدا + y» ختم می‌شوند (city، baby، story) در جمع، y حذف و ies می‌گیرند: cities، babies، stories. اما اگر قبل از y یک حرف صامت باشد (boy، day، key)، فقط s اضافه می‌شود: boys، days، keys — چون y در این کلمات بخشی از دوگانهٔ صدایی (oy، ay، ey) است و نباید شکسته شود. به جای حفظ‌کردن، به صدای کلمه گوش دهید: اگر y با صدای «ای» کوتاه تمام می‌شود، یعنی باید بشکند.",
        ],
        examples: [
          { en: "one watch → two watches", fa: "یک ساعت → دو ساعت (ch + es)" },
          { en: "one city → three cities", fa: "یک شهر → سه شهر (y بعد از حرف صدا → ies)" },
          { en: "one boy → four boys", fa: "یک پسر → چهار پسر (y بعد از حرف صامت → s)" },
        ],
      },
      {
        title: "جمع‌های بی‌قاعده: لیست کوتاه اما پرمصرف",
        paragraphs: [
          "شاید بپرسید چرا انگلیسی مسیر ساده را نمی‌رود و همه را s نمی‌کند؟ پاسخ در تاریخ است: بخشی از واژگان انگلیسی از آلمانی باستان و بخشی از لاتین و یونانی آمده‌اند و هر کدام جام‌های جمع قدیمی خودشان را نگه داشته‌اند. رایج‌ترین‌ها این‌ها هستند: man → men، woman → women (تلفظ ویمن)، child → children، foot → feet، tooth → teeth، mouse → mice، person → people. این‌ها آن‌قدر پرتکرارند که در اولین هفته‌های یادگیری با همهٔ آن‌ها روبه‌رو می‌شوید.",
          "نکتهٔ مهم دربارهٔ people است: خودش جمع است و هرگز peoples نمی‌گوییم (مگر در معنای خاص «ملت‌ها»). جملهٔ There are five people in the room کاملاً درست است ولی five persons در متن‌های حقوقی و رسمی دیده می‌شود. برایتان عجیب نباشد که جمع بی‌قاعده در زبان‌ها وجود دارد؛ فارسی هم «برادران/خواهران» دارد که قانون یکنواخت ندارد! کلید یادگیری این لیست کوتاه، تکرار در جمله‌های واقعی است، نه خواندن جدول.",
        ],
        examples: [
          { en: "The children are playing in the yard.", fa: "بچه‌ها در حیاط بازی می‌کنند." },
          { en: "My feet are cold.", fa: "پاهایم سرد است." },
          { en: "Many people work from home now.", fa: "خیلی از مردم الان از خانه کار می‌کنند." },
        ],
      },
      {
        title: "جمع‌های ناهمگون: sheep و fish چرا s نمی‌گیرند؟",
        paragraphs: [
          "گروهی از حیوانات و چیزها در انگلیسی «شکل واحد = شکل جمع» دارند: one sheep → two sheep، one fish → two fish (البته fishes برای انواع مختلف ماهی مجاز است). دلیل تاریخی این است که در انگلیسی قدیم، اسم‌های شکار جمع‌گذاری قاعده‌مند نداشتند و به همین شکل باقی مانده‌اند. کلماتی مثل series و species هم از همین خانواده‌اند. تشخیص مفرد یا جمع بودن این کلمات از «فعل جمله» مشخص می‌شود: The sheep is eating (یک) در برابر The sheep are eating (چند تا).",
          "گروه دیگر، اسم‌های غیرقابل‌شمارش‌اند که اصلاً جمع نمی‌شوند: water، rice، money، information، advice. در فارسی هم می‌گوییم «آب‌ها» اما انگلیسی استعارهٔ شمارش را از قید و حرف تعریف می‌گیرد: two glasses of water (دو لیوان آب)، a piece of advice (یک توصیه). اگر لازم است مقدار را بگویید، واحد اندازه‌گیری اضافه کنید. این ترفند به شما امکان می‌دهد دربارهٔ هر چیزی تعداد بگویید، حتی چیزهایی که شمرده نمی‌شوند.",
        ],
        examples: [
          { en: "I bought three fish at the market.", fa: "سه ماهی در بازار خریدم." },
          { en: "Can I have two glasses of water?", fa: "می‌توانم دو لیوان آب بگیرم؟ (واحد اندازه‌گیری)" },
        ],
      },
    ],
    rule:
      "قاعدهٔ اصلی جمع: +s (books). اسم‌های مختوم به s/sh/ch/x → +es (buses، watches). مختوم به «حرف صدا + y» → y حذف و +ies (cities)؛ ولی «صامت + y» فقط +s (boys). جمع‌های بی‌قاعدهٔ پرمصرف: men، women، children، feet، teeth، mice، people. شکل واحد=جمع: sheep، fish، species. غیرقابل‌شمارش‌ها (water، rice، money) جمع نمی‌شوند؛ برای تعداد، واحد اضافه کنید: two glasses of water.",
    form: [
      { label: "قاعدهٔ اصلی", pattern: "book → books / car → cars / apple → apples" },
      { label: "ختم به s/sh/ch/x", pattern: "bus → buses / watch → watches / box → boxes" },
      { label: "حرف صدا + y", pattern: "city → cities / baby → babies / story → stories" },
      { label: "حرف صامت + y", pattern: "boy → boys / day → days / key → keys" },
      { label: "بی‌قاعده", pattern: "man→men · woman→women · child→children · foot→feet · tooth→teeth · mouse→mice · person→people" },
      { label: "تغییرناپذیر", pattern: "sheep / fish / series — مفرد و جمع یک شکل" },
    ],
    examples: [
      { en: "I have two brothers and three sisters.", fa: "دو برادر و سه خواهر دارم." },
      { en: "The buses are always late in this city.", fa: "اتوبوس‌ها در این شهر همیشه دیر می‌کنند." },
      { en: "She told me two interesting stories.", fa: "دو داستان جالب برایم تعریف کرد." },
      { en: "My teeth are sensitive to cold drinks.", fa: "دندان‌هایم به نوشیدنی سرد حساس‌اند." },
      { en: "There are a lot of people in the park.", fa: "خیلی از مردم در پارک هستند." },
      { en: "We saw five sheep on the hill.", fa: "پنج گوسفند روی تپه دیدیم." },
      { en: "These knives are very sharp.", fa: "این چاقوها خیلی تیزند. (knife → knives)" },
      { en: "He gave me some useful advice.", fa: "چند توصیهٔ مفید به من داد. (غیرقابل‌شمارش)" },
    ],
    mistakes: [
      { wrong: "I have two childs.", right: "I have two children.", note: "child از جمع‌های بی‌قاعده است؛ childs در هیچ متنی وجود ندارد." },
      { wrong: "Three womans are waiting outside.", right: "Three women are waiting outside.", note: "جمعِ woman کلمهٔ خودش است: women (تلفظ: ویمن)." },
      { wrong: "I bought two breads.", right: "I bought two loaves of bread.", note: "bread غیرقابل‌شمارش است؛ برای تعداد باید واحد بیاورید: loaves/slices of bread." },
      { wrong: "The citys are very crowded.", right: "The cities are very crowded.", note: "city به «حرف صدا + y» ختم می‌شود؛ y حذف و ies می‌گیرد." },
    ],
    tips: [
      "قاعدهٔ صدایی را به‌جای حفظ‌کردن جدول به کار ببرید: اگر گفتن s بعد از کلمه سخت یا گم‌شدنی است (buss)، یعنی es لازم است.",
      "لیست جمع‌های بی‌قاعده فقط حدود ۱۰ کلمهٔ پرمصرف دارد؛ هر بار یکی را در جملهٔ واقعی خودتان به کار ببرید تا ماندگار شود.",
      "برای غیرقابل‌شمارش‌ها همیشه «واحد» بسازید: a glass of، a piece of، a kilo of — این الگو شما را از خطای pains و informations نجات می‌دهد.",
      "بعد از جمع‌کردن، فعل جمله را هم چک کنید: جملهٔ جمع با are/were می‌آید نه is/was؛ جمع درستِ بی‌فعلِ درست نصفه‌کاره است.",
    ],
    quiz: [
      { question: "جمع کلمهٔ «knife» چیست؟", options: ["knifes", "knives", "knive", "knifs"], correctIndex: 1, explanation: "اسم‌های مختوم به f/fe در جمع، f به v تبدیل و es می‌گیرند: knife → knives." },
      { question: "«سه بچه در باغ بازی می‌کنند» کدام است؟", options: ["Three childs are playing in the garden.", "Three children are playing in the garden.", "Three children is playing in the garden.", "Three child are playing in the garden."], correctIndex: 1, explanation: "جمعِ child کلمهٔ children است و فعل جمع هم are." },
      { question: "جمع کدام کلمه بی‌قاعده است؟", options: ["book", "car", "tooth", "house"], correctIndex: 2, explanation: "tooth → teeth از جمع‌های بی‌قاعده است؛ بقیه فقط s می‌گیرند." },
      { question: "کدام جمله درست است؟", options: ["I need some informations.", "I need an information.", "I need some information.", "I need informations."], correctIndex: 2, explanation: "information غیرقابل‌شمارش است؛ نه جمع می‌شود و نه a/an می‌گیرد." },
      { question: "جمع «city» و «boy» به‌ترتیب چیست؟", options: ["citys / boies", "cities / boys", "cities / boies", "citys / boys"], correctIndex: 1, explanation: "city (حرف صدا + y) → cities؛ ولی boy (صامت + y) → boys." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-06",
    titleFa: "زمان حال ساده",
    titleEn: "Present Simple",
    cefr: "A2",
    intro:
      "زمان حال ساده پرکاربردترین زمان انگلیسی است و شاید بتوان گفت نصف جمله‌های یک مکالمهٔ عادی با آن ساخته می‌شود. این زمان دربارهٔ «حقایق همیشگی» و «عادت‌های تکرارشونده» حرف می‌زند، نه لزوماً لحظهٔ الان. اگر راز کوچک s سوم‌شخص را درست بفهمید — که در این درس مفهومی توضیح می‌دهیم — و جای قیدهای تکرار را یاد بگیرید، این زمان تا مدت‌ها ستون فقرات جمله‌سازی شما خواهد بود.",
    sections: [
      {
        title: "دو جهانِ حال ساده: حقیقت و عادت",
        paragraphs: [
          "حال ساده دو کار اصلی دارد که در ظاهر شبیه‌اند اما ماهیتشان فرق دارد. کار اول: بیان «حقیقت و وضعیت همیشگی» — چیزهایی که درست بودنشان به امروز و دیروز وابسته نیست: Water boils at 100 degrees، The sun rises in the east، I live in Tehran. کار دوم: بیان «عادت و روتین تکرارشونده» — کارهایی که با بازهٔ مشخص تکرار می‌شوند: I get up at six، She drinks tea every morning. نکتهٔ مشترک این دو کار، «بی‌زمانی» است؛ جمله احساس نمی‌کند در یک لحظهٔ خاص رخ می‌دهد.",
          "دقیقاً به همین دلیل، حال ساده برای «الان در حال اتفاق» به کار نمی‌رود. اگر همین لحظه در حال نوشیدن چای هستید، انگلیسی حال استمراری می‌گوید: I am drinking tea now. حال ساده فقط وقتی دربارهٔ الان حرف می‌زند که وضعیت کلی و پایدار باشد: I drink tea (به‌طور کلی چای می‌نوشم). این تفکیک «چه چیزی همیشگی است و چه چیزی لحظه‌ای» مهم‌ترین تصمیم ذهنی شما قبل از انتخاب زمان است و در درس بعدی کامل‌تر می‌شود.",
        ],
        examples: [
          { en: "The moon goes around the Earth.", fa: "ماه به دور زمین می‌چرخد. (حقیقت همیشگی)" },
          { en: "He goes to the gym twice a week.", fa: "او هفته‌ای دو بار به باشگاه می‌رود. (عادت)" },
        ],
      },
      {
        title: "راز s سوم‌شخص — مهم‌ترین نیم‌فاصلهٔ این زمان",
        paragraphs: [
          "وقتی فاعل he، she یا it است (یا هر اسم مفرد سوم‌شخص مثل my father، the cat، Ali)، به فعل یک s اضافه می‌شود: he works، she watches، it rains. برای بقیهٔ فاعل‌ها (I، you، we، they) فعل برهنه می‌ماند. این tiny s بیشترین خطای مبتدی‌ها را می‌سازد چون فارسی چیزی شبیهش ندارد؛ در فارسی فعل با فاعل «می‌چسبد» اما انگلیسی فقط از سوم‌شخصِ مفردِ غیرخودش «تعلق» می‌گیرد.",
          "نکات تلفظی هم همین‌جا جمع شده‌اند: بعد از صداهای خس‌دار (s/sh/ch/x) تلفظ s مثل «ایس» می‌آید (watches = واچ‌ایز)؛ بعد از صداهای خش‌دارِ بی‌واک (p/k/t/f) مثل «س» ساده می‌آید (works = وُرکس)؛ و بعد از صداهای واک‌دار مثل «ز» می‌آید (plays = پلیز، runs = رانز). تلفظ درست این s کوچک، تفاوت شنیداری مهمی در طبیعی‌بودن گفتارتان ایجاد می‌کند و بهتر است از همان اول درست جا بیفتد.",
        ],
        examples: [
          { en: "She works at a hospital.", fa: "او در یک بیمارستان کار می‌کند." },
          { en: "My father watches the news every night.", fa: "پدرم هر شب اخبار تماشا می‌کند." },
        ],
      },
      {
        title: "منفی و سؤال: do و does به‌عنوان کمک‌لباس فعل",
        paragraphs: [
          "برای منفی کردن، فعل اصلی «برهنه» می‌ماند و don't/doesn't جلویش می‌نشیند: I don't like coffee، She doesn't eat meat. برای سؤال هم do/does به ابتدای جمله می‌آید: Do you speak English? — Does he live here? نکتهٔ حیاتی: وقتی do/does وارد جمله شد، کار تمام s سوم‌شخص را خودش انجام می‌دهد و فعل اصلی دیگر s نمی‌گیرد. پس She doesn't likes غلط است؛ درستش She doesn't like است.",
          "اینکه چرا انگلیسی به do نیاز دارد سؤال خوبی است: فعل‌های معمولی مثل go بر خلاف to be نمی‌توانند خودشان جای‌شان را با فاعل عوض کنند یا not بپذیرند؛ پس زبان یک «فعل کمکی همه‌کاره» ساخته تا این کارها را انجام دهد. do مثل دستگیره‌ای است که روی فعل اصلی نصب می‌شود تا بتوانید جمله را منفی یا سوالی کنید. جواب کوتاه هم با خود همین do ساخته می‌شود: Yes, I do / No, she doesn't — و این الگو در آینده در زمان‌های دیگر هم تکرار خواهد شد.",
        ],
        examples: [
          { en: "He doesn't drink coffee.", fa: "او قهوه نمی‌نوشد. (نه doesn't drinks!)" },
          { en: "Do they live in Tehran? — Yes, they do.", fa: "آن‌ها در تهران زندگی می‌کنند؟ — بله." },
        ],
      },
    ],
    rule:
      "حال ساده برای حقیقت همیشگی و عادت تکرارشونده به کار می‌رود، نه اتفاقِ همین لحظه. فاعل مفرد سوم‌شخص (he/she/it) به فعل s اضافه می‌کند: he works. منفی: don't/doesn't + شکل سادهٔ فعل (بدون s دوباره). سؤال: Do/Does + فاعل + فعل ساده. قیدهای تکرار (always، usually، often، sometimes، never) قبل از فعل اصلی می‌آیند اما بعد از to be. جواب کوتاه با do/does: Yes, I do / No, he doesn't.",
    form: [
      { label: "مثبت", pattern: "I/You/We/They + work · He/She/It + works" },
      { label: "منفی", pattern: "I don't work · He doesn't work (فعل برهنه!)" },
      { label: "سؤال", pattern: "Do you work? · Does she work?" },
      { label: "جواب کوتاه", pattern: "Yes, I do. / No, he doesn't." },
      { label: "قید تکرار", pattern: "I always drink tea. · She is always late. (بعد از be)" },
    ],
    examples: [
      { en: "I usually wake up at six o'clock.", fa: "معمولاً ساعت شش بیدار می‌شوم." },
      { en: "She teaches English at a high school.", fa: "او در یک دبیرستان انگلیسی تدریس می‌کند." },
      { en: "Water freezes at zero degrees.", fa: "آب در صفر درجه یخ می‌زند. (حقیقت)" },
      { en: "My brother doesn't eat meat.", fa: "برادرم گوشت نمی‌خورد." },
      { en: "Do you speak Persian? — Yes, I do.", fa: "فارسی صحبت می‌کنی؟ — بله." },
      { en: "We sometimes go to the cinema on Fridays.", fa: "بعضی وقت‌ها جمعه‌ها سینما می‌رویم." },
      { en: "The train leaves at seven every morning.", fa: "قطار هر روز صبح ساعت هفت حرکت می‌کند." },
      { en: "He never drinks tea with sugar.", fa: "او هرگز چای با شکر نمی‌نوشد." },
    ],
    mistakes: [
      { wrong: "She go to work by bus.", right: "She goes to work by bus.", note: "فاعل مفرد سوم‌شخص است؛ فعل باید s بگیرد: goes." },
      { wrong: "He doesn't likes fish.", right: "He doesn't like fish.", note: "وقتی doesn't آمده، s را خودش اجرا کرده؛ فعل اصلی دوباره s نمی‌گیرد." },
      { wrong: "Do she live here?", right: "Does she live here?", note: "برای فاعل she باید از does استفاده کنید، نه do." },
      { wrong: "I drink always coffee in the morning.", right: "I always drink coffee in the morning.", note: "قید تکرار قبل از فعل اصلی می‌نشیند، نه بعد از آن." },
    ],
    tips: [
      "قبل از نوشتن فعل، فاعل را در ذهن به he/she/it یا NOT ترجمه کنید؛ اگر یکی از این سه بود، s لازم است — همین یک عادت، بیشترین خطای حال ساده را حذف می‌کند.",
      "قاعدهٔ «یک s در هر جمله» را به خاطر بسپارید: یا فعل اصلی s دارد (جملهٔ مثبت) یا doesn't/s دارد (منفی و سؤال)؛ هرگز هر دو با هم.",
      "قیدهای تکرار را روی انگشت‌هایتان بچینید: always → usually → often → sometimes → never؛ موقعیت‌شان قبل از فعل اصلی و بعد از to be است.",
      "روتین روزانهٔ خودتان را با ۵ جملهٔ حال ساده توصیف کنید؛ موضوع آشنا + زمان تکرارشونده = بهترین تمرین این زمان.",
    ],
    quiz: [
      { question: "جملهٔ «او هر روز انگلیسی می‌خواند» کدام است؟", options: ["She study English every day.", "She studies English every day.", "She studys English every day.", "She is study English every day."], correctIndex: 1, explanation: "study بعد از حرف صدا به y ختم می‌شود → studies؛ و فعل با s سوم‌شخص." },
      { question: "کدام جمله درست است؟", options: ["He doesn't works here.", "He don't work here.", "He doesn't work here.", "He not work here."], correctIndex: 2, explanation: "doesn't + فعل ساده؛ s فقط یک‌بار در جمله ظاهر می‌شود." },
      { question: "جای قید always در کدام جمله درست است؟", options: ["She late is always.", "She is late always.", "She always is late.", "She is always late."], correctIndex: 3, explanation: "قید تکرار بعد از فعل to be می‌آید: She is always late." },
      { question: "«آیا آن‌ها اینجا کار می‌کنند؟» کدام است؟", options: ["Does they work here?", "Do they work here?", "Are they work here?", "They work here?"], correctIndex: 1, explanation: "برای they از Do استفاده می‌شود." },
      { question: "حال ساده برای کدام مورد مناسب «نیست»؟", options: ["بیان حقیقت علمی", "روتین روزانه", "اتفاقی که همین الان در حال رخ دادن است", "عادت هفتگی"], correctIndex: 2, explanation: "اتفاقِ همین لحظه با حال استمراری بیان می‌شود: I am eating now." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-07",
    titleFa: "زمان حال استمراری",
    titleEn: "Present Continuous",
    cefr: "A2",
    intro:
      "زمان حال استمراری، زمانِ «دوربین فیلم‌برداری» است: دوربین را روشن می‌کنید و می‌گویید همین الان چه اتفاقی در حال رخ دادن است. هر جا در فارسی می‌گویید «دارم می‌روم»، «داره می‌بارد» یا «در حال کار کردنم»، انگلیسی از این زمان استفاده می‌کند. این زمان با فعل to be و شکل ing ساخته می‌شود و در توصیف عکس‌ها، مکالمهٔ تلفنی و گفت‌وگو دربارهٔ برنامه‌های نزدیک، ابزار اصلی شماست.",
    sections: [
      {
        title: "فرمول ساخت و منطق آن: be + ing",
        paragraphs: [
          "ساخت این زمان دو تکه دارد که هیچ‌وقت از هم جدا نمی‌شوند: فعل to be (am/is/are — بسته به فاعل) + فعل اصلی با پسوند ing. مثل: I am reading، She is cooking، They are playing. چرا دو تکه؟ چون هر تکه یک کار می‌کند: فعل be زمان جمله را «حال» نگه می‌دارد و ing به فعل می‌گوید «در جریان است، تمام نشده». این تقسیم کار را بفهمید تا در منفی و سؤال هم سراغ نگیرید: منفی با not روی be انجام می‌شود (She isn't cooking) و سؤال با جابه‌جایی be (Is she cooking?).",
          "نکتهٔ املایی سه‌گانه را هم همین‌جا مرور کنیم: فعل‌های کوتاهِ مختوم به e، این e حذف می‌شود (write → writing، make → making). فعل‌های یک‌بخشیِ مختوم به «حرف صدا+حرف صامت» (run، sit، swim) حرف صامت آخر تکرار می‌شود (running، sitting، swimming) — چون در انگلیسی، هجای آخرِ بزرگ‌شده نیاز به پشتوانهٔ صدایی دارد. و فعل‌های مختوم به ie، این دو حرف جایشان را به y می‌دهند (lie → lying، die → dying). این سه قانون، نود درصد نگارش ing را پوشش می‌دهند.",
        ],
        examples: [
          { en: "She is writing a letter.", fa: "او (زن) در حال نوشتن نامه‌ای است. (e حذف شد)" },
          { en: "The kids are swimming in the pool.", fa: "بچه‌ها در استخر شنا می‌کنند. (تکرار حرف صامت)" },
        ],
      },
      {
        title: "کاربردهای پنهان: برنامهٔ آینده و عصبانیت",
        paragraphs: [
          "این زمان فقط برای «همین الان» نیست؛ دو کاربرد جانبی مهم دارد که مکالمه را طبیعی می‌کنند. اول: برنامه‌های قطعیِ نزدیک. انگلیسی‌زبان‌ها به‌جای آیندهٔ ساده می‌گویند I'm meeting my friend tonight یا We're flying to Shiraz tomorrow — یعنی چیزهایی که مثل قطار در ریل افتاده‌اند و فقط مانده اجرا شوند. این کاربرد حس «برنامهٔ شخصی و قطعی» می‌دهد و در گفتار روزمره از will پرمصرف‌تر است.",
          "دوم: بیان احساسات تند دربارهٔ عادت‌های آزاردهنده، همیشه با always: He is always losing his keys! یعنی «همیشه داره کلیدهاش رو گم می‌کنه (خیلی اعصاب‌خردکنه!)». دقت کنید حال سادهٔ He always loses his keys فقط گزارش بی‌احساس است، اما حال استمراری + always غرغر و عصبانیت را منتقل می‌کند. این ظرافت، یکی از همان لحظه‌هایی است که زبان‌آموز را از سطح «درست» به سطح «طبیعی» می‌رساند.",
        ],
        examples: [
          { en: "We're visiting my grandparents this Friday.", fa: "این جمعه به دیدن پدربزرگ و مادربزرگ می‌رویم. (برنامهٔ قطعی)" },
          { en: "You're always interrupting me!", fa: "همیشه حرفم را می‌زنی! (غرغر)" },
        ],
      },
      {
        title: "فعل‌های حالی: کسانی که هرگز ing نمی‌گیرند",
        paragraphs: [
          "گروهی از فعل‌ها «حالی»اند و ذاتاً به «رد پای لحظه» ندارند؛ پس حال استمراری نمی‌پذیرند: like، love، hate، want، need، know، understand، believe، own، prefer. جملهٔ I am knowing him از نظر انگلیسی‌زبان غلط است، چون «دانستن» کسی یک فرایند تدریجی نیست که بتوان وسطش فیلم‌برداری کرد؛ یک وضعیت ذهنی است. برای این فعل‌ها حتی وقتی الان رخ می‌دهند، حال ساده به کار می‌رود: I want water now (نه I am wanting).",
          "راه تشخیص عملی: از خودتان بپرسید «این فعل دارد در طول زمان اجرا می‌شود و می‌توان عکسش را گرفت؟» اگر بله (run، eat، write، rain)، ing می‌گیرد؛ اگر نه و یک «وضعیت» یا «احساس» است (know، believe، own)، هرگز. البته استثناهای معنایی وجود دارد: I'm thinking about you (فرایند فکر کردن) با I think you're right (نظر دادن) فرق دارد — اولی قابل فیلم‌برداری است، دومی نه. همین تست ساده، انتخاب شما را در نود درصد موارد درست می‌کند.",
        ],
        examples: [
          { en: "I want a glass of water.", fa: "یک لیوان آب می‌خواهم. (want حالی است — نه I'm wanting!)" },
          { en: "I'm thinking about my future.", fa: "دربارهٔ آینده‌ام فکر می‌کنم. (فرایند فکر — ing دارد)" },
        ],
      },
    ],
    rule:
      "فرمول حال استمراری: am/is/are + فعل + ing. برای اتفاقِ در حال رخ دادن، تغییر موقت وضعیت، و برنامهٔ قطعیِ آینده (I'm seeing the doctor tomorrow). منفی با not بعد از be: She isn't sleeping. سؤال با جابه‌جایی be: Are you listening? فعل‌های حالی (know، like، want، need، understand) هرگز ing نمی‌گیرند. برای عصبانیت از یک عادت: He's always borrowing my things! املای ing: حذف e (writing)، تکرار حرف صامت (running)، تبدیل ie به y (lying).",
    form: [
      { label: "مثبت", pattern: "I am working · He/She/It is working · We/They are working" },
      { label: "منفی", pattern: "She isn't working · We aren't working" },
      { label: "سؤال", pattern: "Are you working? · Is he working?" },
      { label: "برنامهٔ آینده", pattern: "I'm meeting Ali tomorrow. (قرار قطعی)" },
      { label: "غرغرِ عادت", pattern: "He's always forgetting his wallet!" },
    ],
    examples: [
      { en: "Look! It is raining outside.", fa: "ببین! بیرون باران می‌بارد." },
      { en: "I can't talk now; I am driving.", fa: "الان نمی‌توانم حرف بزنم؛ در حال رانندگی‌ام." },
      { en: "The children are doing their homework.", fa: "بچه‌ها دارند تکالیف‌شان را انجام می‌دهند." },
      { en: "What are you doing this weekend?", fa: "این آخر هفته چه کار می‌کنی؟ (برنامه)" },
      { en: "She is making tea in the kitchen.", fa: "او در آشپزخانه چای درست می‌کند." },
      { en: "They aren't watching TV; they are studying.", fa: "آن‌ها تلویزیون نمی‌بینند؛ درس می‌خوانند." },
      { en: "My sister is lying on the sofa.", fa: "خواهرم روی مبل دراز کشیده است. (lie → lying)" },
      { en: "Is he still sleeping? It's almost noon!", fa: "هنوز خواب است؟ تقریباً ظهر شده!" },
    ],
    mistakes: [
      { wrong: "I am go to school now.", right: "I am going to school now.", note: "هر دو تکهٔ زمان لازم است: be + ing؛ فعل برهنه با am جمله را ناقص می‌کند." },
      { wrong: "She is knowing the answer.", right: "She knows the answer.", note: "know فعل حالی است و ing نمی‌گیرد؛ حتی برای الان." },
      { wrong: "They are play football in the park.", right: "They are playing football in the park.", note: "ing روی فعل اصلی می‌نشیند، نه بعد از be با فعل ساده." },
      { wrong: "I am writeing a story.", right: "I am writing a story.", note: "فعل‌های مختوم به e، این e را قبل از ing از دست می‌دهند: write → writing." },
    ],
    tips: [
      "قبل از ساختن حال استمراری، فعل را در ذهن «فیلم‌برداری» کنید: اگر می‌توان عکس لحظه‌ای‌اش را گرفت، ing دارد؛ اگر فقط یک وضعیت یا احساس است، حال ساده.",
      "فرمول را یک‌تکه به یاد بسپارید: be + ing مثل نان و پنیر؛ هیچ‌وقت یکی را بدون دیگری سرو نکنید — نه am go، نه only writing.",
      "در تلفن که کسی می‌پرسد What are you doing? پاسخ با همین زمان می‌آید؛ این سؤال محبوب را به تمرین روزانهٔ خودتان تبدیل کنید.",
      "برنامه‌های هفتهٔ آیندهٔ خودتان را با این زمان بگویید: I'm visiting..., I'm having... — این کاربرد، مکالمهٔ شما را از سطح کتاب‌درسی به سطح واقعی می‌برد.",
    ],
    quiz: [
      { question: "«الان دارم برایت چای می‌ریزم» کدام است؟", options: ["I make tea for you now.", "I am making tea for you.", "I making tea for you.", "I am make tea for you."], correctIndex: 1, explanation: "be + فعل ing: I am making." },
      { question: "کدام فعل هرگز حال استمراری نمی‌گیرد؟", options: ["run", "cook", "understand", "write"], correctIndex: 2, explanation: "understand فعل حالی (ذهنی) است و ing نمی‌پذیرد: I understand, نه I am understanding." },
      { question: "شکل ing کلمهٔ «swim» چیست؟", options: ["swiming", "swimming", "swimmed", "swiming"], correctIndex: 1, explanation: "فعل یک‌بخشی مختوم به «صدا+صامت» حرف صامت را تکرار می‌کند: swimming." },
      { question: "«فردا عصر با دکتر قرار دارم» با کدام جمله طبیعی‌تر است؟", options: ["I see the doctor tomorrow.", "I am seeing the doctor tomorrow afternoon.", "I will seeing the doctor.", "I am see the doctor tomorrow."], correctIndex: 1, explanation: "برنامهٔ قطعی و شخصیِ نزدیک با حال استمراری بیان می‌شود." },
      { question: "جملهٔ «She is always losing her keys!» چه حسّی منتقل می‌کند؟", options: ["گزارش خنثای عادت", "عصبانیت و دلتنگی از تکرار", "تعجب از یک اتفاق جدید", "شفقت"], correctIndex: 1, explanation: "حال استمراری + always برای عادت‌های آزاردهنده، غرغر و عصبانیت منتقل می‌کند." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-08",
    titleFa: "زمان گذشته ساده",
    titleEn: "Past Simple",
    cefr: "A2",
    intro:
      "گذشته ساده، زمانِ «روایت» است: با آن خاطره تعریف می‌کنید، دیروز و پارسال را گزارش می‌کنید و داستان می‌گویید. این زمان دو چهره دارد — فعل‌های باقاعده که ed می‌گیرند و فعل‌های بی‌قاعده که شکل دوم خودشان را دارند. برای فارسی‌زبان‌ها نکتهٔ کلیدی این است که «یک شکل برای همهٔ فاعل‌ها» یعنی دیگر خبری از s سوم‌شخص نیست؛ و برای منفی و سؤال، did همهٔ کارها را انجام می‌دهد و فعل به شکل سادهٔ خود برمی‌گردد.",
    sections: [
      {
        title: "دو چهرهٔ گذشته: باقاعده و بی‌قاعده",
        paragraphs: [
          "فعل‌های باقاعده با افزودن ed گذشته می‌شوند: work → worked، play → played، visit → visited. نکات املایی همان سه قانون آشناست: مختوم به e فقط d می‌گیرد (live → lived)؛ «صدا+صامت» در فعل‌های کوتاه، صامت تکرار می‌شود (stop → stopped)؛ و «حرف صدا + y»، y حذف و ied می‌آورد (study → studied) ولی «صامت + y» فقط ed می‌گیرد (stay → stayed). تلفظ ed هم سه حالت دارد: «ت» بعد از صداهای بی‌واک (worked)، «د» بعد از واک‌دار (played) و «ایید» بعد از t و d (wanted).",
          "فعل‌های بی‌قاعده شکل گذشتهٔ مستقل دارند که باید با دیدن و شنیدن یاد گرفته شوند: go → went، see → saw، eat → ate، buy → bought، come → came، take → took. این فعل‌ها پرتکرارترین‌های زبان‌اند، پس در هر متن با آن‌ها روبه‌رو می‌شوید و یادگیری‌شان با تکرار طبیعی می‌شود. نکتهٔ مهم: گذشتهٔ این فعل‌ها برای همهٔ اشخاص یکسان است — I went، she went، they went؛ دیگر خبری از s نیست و همین یکنواختی، کار را آسان می‌کند.",
        ],
        examples: [
          { en: "We visited our grandparents last Friday.", fa: "جمعهٔ گذشته به دیدن پدربزرگ و مادربزرگ رفتیم." },
          { en: "She went to the cinema yesterday.", fa: "او دیروز به سینما رفت. (بی‌قاعده)" },
        ],
      },
      {
        title: "منفی و سؤال: did، اَبَرفعلی گذشته",
        paragraphs: [
          "برای منفی و سؤال، فعل اصلی به شکل «سادهٔ حال» برمی‌گردد و did (یا didn't) تمام مفهوم گذشته را حمل می‌کند: I didn't go (نه didn't went!)، Did you see that? (نه Did you saw?). این یکی از رایج‌ترین خطاهای زبان‌آموزان است: گذاشتن فعل گذشته در کنار didn't، مثل دو بار امضای یک برگه. قاعده را این‌طور به خاطر بسپارید: در هر جملهٔ گذشته فقط «یک نشانهٔ گذشته» کافی است — یا خود فعل (در جملهٔ مثبت) یا did/didn't (در منفی و سؤال).",
          "جواب کوتاه هم با did ساخته می‌شود: Did you like the movie? — Yes, I did / No, I didn't. برای سؤال‌های جزئی با Wh-words هم همین الگو است: Where did you go? What did she say? توجه کنید که بعد از واژهٔ پرسشی، ساختار همان سؤال بله/خیر است؛ فقط did جابه‌جا به اول آمده و بعد از آن فاعل و فعل ساده می‌آید. این ساختار منظم، گذشته را به یکی از آسان‌ترین زمان‌ها برای سؤال‌سازی تبدیل می‌کند.",
        ],
        examples: [
          { en: "I didn't see him at the party.", fa: "او را در مهمانی ندیدم. (نه didn't saw)" },
          { en: "Where did you buy this shirt?", fa: "این پیراهن را از کجا خریدی؟" },
        ],
      },
      {
        title: "قیدهای زمان: زنگ‌های خطر گذشته",
        paragraphs: [
          "گذشته ساده معمولاً با «نشانه‌های زمان» همراه است که به شنونده می‌گوید وارد قلمرو گذشته شده‌ایم: yesterday، last night/week/month/year، two days ago، in 1999، when I was a child. این نشانگرها مثل زنگ خطر عمل می‌کنند: هر وقت یکی از آن‌ها را در جمله دیدید، تقریباً همیشه با گذشته ساده طرف هستید. برعکس، اگر جمله‌ای با now یا at the moment شروع می‌شود، سراغ گذشته نروید.",
          "یک نکتهٔ ظریف اما مهم: گذشته ساده برای «خاطرهٔ تمام‌شده» است، نه تجربه‌ای که تا امروز ادامه دارد. اگر می‌خواهید بگویید «ده سال است که او را می‌شناسم»، گذشته ساده نمی‌گوید که همین الان هم می‌شناسید؛ آن قلمرو حال کامل است که در دورهٔ متوسط می‌آموزید. فعلاً قانون سرانگشتی: گذشته ساده = اتفاقی که در گذشته رخ داد، تمام شد و مُهر تاریخ خورد — I lived in Shiraz for five years (دیگر آنجا نیستم).",
        ],
        examples: [
          { en: "We met each other two years ago.", fa: "دو سال پیش یکدیگر را ملاقات کردیم." },
          { en: "I lived in Shiraz when I was a child.", fa: "وقتی بچه بودم در شیراز زندگی می‌کردم." },
        ],
      },
    ],
    rule:
      "گذشتهٔ باقاعده: فعل + ed (visited)؛ بی‌قاعده: شکل دوم (go → went، see → saw). یک شکل برای همهٔ فاعل‌ها — بدون s سوم‌شخص. منفی: didn't + شکل سادهٔ فعل (I didn't go). سؤال: Did + فاعل + فعل ساده؟ جواب کوتاه: Yes, I did / No, I didn't. نشانه‌های زمان: yesterday، last week، two days ago، in 1999. هر جملهٔ گذشته فقط «یک» نشانهٔ گذشته دارد: فعل یا did، هرگز هر دو.",
    form: [
      { label: "باقاعده", pattern: "work → worked · study → studied · stop → stopped" },
      { label: "بی‌قاعده", pattern: "go→went · see→saw · eat→ate · buy→bought · come→came · take→took" },
      { label: "منفی", pattern: "I/You/He/They didn't + فعل ساده" },
      { label: "سؤال", pattern: "Did you see...? · Where did she go?" },
      { label: "جواب کوتاه", pattern: "Yes, I did. / No, they didn't." },
    ],
    examples: [
      { en: "I watched a great movie last night.", fa: "دیشب فیلم فوق‌العاده‌ای دیدم." },
      { en: "She bought a new phone two weeks ago.", fa: "دو هفته پیش گوشی نو خرید." },
      { en: "We didn't have class yesterday.", fa: "دیگر درس نداشتیم." },
      { en: "Did he call you last night?", fa: "دیشب بهت زنگ زد؟" },
      { en: "They traveled to Turkey last summer.", fa: "تابستان پارسال به ترکیه سفر کردند." },
      { en: "The concert started at eight and finished at ten.", fa: "کنسرت هشت شروع شد و ده تمام شد." },
      { en: "I forgot my umbrella at home.", fa: "چترم را در خانه جا گذاشتم." },
      { en: "What did you eat for breakfast?", fa: "صبحانه چه خوردی؟" },
    ],
    mistakes: [
      { wrong: "I didn't went to the party.", right: "I didn't go to the party.", note: "didn't خودش گذشته را نشان می‌دهد؛ فعل باید به شکل ساده برگردد." },
      { wrong: "She goed home early.", right: "She went home early.", note: "go فعل بی‌قاعده است؛ گذشته‌اش went است نه goed." },
      { wrong: "Did you saw the news?", right: "Did you see the news?", note: "بعد از Did همیشه شکل سادهٔ فعل می‌آید." },
      { wrong: "Yesterday I go to the park.", right: "Yesterday I went to the park.", note: "نشانهٔ زمان گذشته (yesterday) نیاز به فعل گذشته دارد؛ این جفت همیشه با هم می‌آیند." },
    ],
    tips: [
      "قاعدهٔ «یک نشانهٔ گذشته در هر جمله» را قاب کنید: یا فعل گذشته است یا didn't/did — نه هر دو؛ این یک جمله، رایج‌ترین خطای گذشته را حذف می‌کند.",
      "۵ فعل بی‌قاعدهٔ پرتکرار را هر روز در یک جملهٔ خاطره‌ای به کار ببرید: went، saw، ate، bought، came — خاطرهٔ واقعی، چسبنده‌ترین حافظه است.",
      "دیشب چه کردید؟ سه جمله بنویسید و شروع همه را با Yesterday بگذارید؛ این قالب، فعل‌های گذشته را به ذهنتان می‌چسباند.",
      "قیدهای گذشته را به‌عنوان «زنگ خطر» بشناسید: yesterday، last...، ago، in سال — دیدیدشان یعنی فعل باید به گذشته برود.",
    ],
    quiz: [
      { question: "گذشتهٔ فعل «buy» چیست؟", options: ["buyed", "bought", "buyd", "boughted"], correctIndex: 1, explanation: "buy از فعل‌های بی‌قاعده است: buy → bought." },
      { question: "«دیروز به او زنگ نزدم» کدام است؟", options: ["I didn't called him yesterday.", "I don't call him yesterday.", "I didn't call him yesterday.", "I not called him yesterday."], correctIndex: 2, explanation: "didn't + فعل ساده: I didn't call." },
      { question: "کدام جمله درست است؟", options: ["Did you went to school?", "Did you go to school?", "Do you went to school?", "Did you going to school?"], correctIndex: 1, explanation: "بعد از Did فعل همیشه به شکل ساده برمی‌گردد: Did you go?" },
      { question: "گذشتهٔ «study» چیست؟", options: ["studyed", "studied", "studed", "studyded"], correctIndex: 1, explanation: "study به «حرف صدا + y» ختم می‌شود؛ y حذف و ied می‌گیرد: studied." },
      { question: "کدام جمله دربارهٔ «امروز» غلط است؟", options: ["I saw him yesterday.", "I saw him two days ago.", "I saw him now.", "I saw him last week."], correctIndex: 2, explanation: "now نشانهٔ زمان حال است و با فعل گذشته نمی‌آید؛ باید بگویید I see him now." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-09",
    titleFa: "صفت تفضیلی و عالی",
    titleEn: "Comparatives and Superlatives",
    cefr: "A2",
    intro:
      "مقایسه، نیمی از گفت‌وگوی روزمره است: کدام گوشی بهتر است؟ کدام راه سریع‌تر است؟ چه کسی بلندترین است؟ انگلیسی برای مقایسهٔ دو چیز از صفت تفضیلی (taller) و برای برتری از میان سه چیز یا بیشتر از صفت عالی (the tallest) استفاده می‌کند. قواعد ساختن این دو، آینهٔ همان قواعد جمع‌کردن اسم‌هاست — پس اگر درس جمع را خوب خوانده‌اید، این درس برایتان خانهٔ دوم خواهد بود.",
    sections: [
      {
        title: "کدام ساختار؟ er/est یا more/most؟",
        paragraphs: [
          "قاعدهٔ تعیین‌کننده «طول صفت» است. صفات کوتاه (یک بخشش) با er و est مقایسه می‌شوند: tall → taller → the tallest؛ old → older → the oldest. صفات بلند (دو بخشش به بالا، مثل expensive، beautiful، interesting) به‌جای دنباله، از more و most استفاده می‌کنند: more expensive، the most interesting. دلیل این تفکیک طنزآمیز اما منطقی است: کلمات بلند با دنباله‌های اضافه، مثل قطارِ بی‌انتها می‌شوند — more beautifuler هیچ‌کس نمی‌تواند تلفظ کند!",
          "صفات دو بخششی که به y ختم می‌شوند، ترکیبی از دو دنیا هستند: y حذف و ier/iest می‌گیرند: happy → happier → the happiest؛ easy → easier → the easiest. همان قانون آشنای جمع (city → cities) اینجا هم تکرار می‌شود؛ ذهنتان در حال ساختن یک «راهروی مشترک» برای قواعد املایی انگلیسی است. صفات دو بخششیِ دیگر مثل clever و quiet هر دو شکل را می‌پذیرند (cleverer یا more clever) و هر دو درست‌اند. نکتهٔ تلفظی مهم: در the tallest، حرف e پایان er/est تلفظ نمی‌شود و صدای «ایست» می‌سازد.",
        ],
        examples: [
          { en: "My brother is taller than me.", fa: "برادرم از من بلندتر است. (صفت کوتاه)" },
          { en: "This book is more interesting than that one.", fa: "این کتاب از آن جالب‌تر است. (صفت بلند)" },
          { en: "Today is the hottest day of the year.", fa: "امروز گرم‌ترین روز سال است. (hot → hottest)" },
        ],
      },
      {
        title: "than و the: دو ستون مقایسه",
        paragraphs: [
          "در جملهٔ تفضیلی، واژهٔ than نقش «ترازو» را دارد و دو طرف مقایسه را به هم وصل می‌کند: A is taller than B. بدون than، مقایسه ناقص می‌ماند و شنونده منتظر «از چه؟» می‌ماند. در جملهٔ عالی، حرف تعریف the اجباری است: She is the smartest student in the class — چون «هوشمندترین» فقط یک نفر است و یتیمی در جهانِ کلاس است؛ همان منطق the برای چیزهای یکتا که در درس حروف تعریف آموختید.",
          "بعد از than می‌توانید هم اسم بیاورید (taller than Ali) و هم ضمیر مفعولی یا فاعلی (taller than me / than I am). در انگلیسی روزمره than me کاملاً رایج و پذیرفته است. یک ظرافت کاربردی: برای مقایسهٔ دو چیز مساوی از as...as استفاده می‌کنیم که در جملهٔ منفی، «کمتر بودن» را می‌سازد: He is not as tall as his father یعنی «اونقدر بلند نیست که پدرش» — این ساختار، پسرخالهٔ تفضیلی است و کنارش باید یادش بگیرید تا مکالمه‌تان انعطاف پیدا کند.",
        ],
        examples: [
          { en: "Shiraz is smaller than Tehran.", fa: "شیراز از تهران کوچک‌تر است." },
          { en: "She is the best player in the team.", fa: "او بهترین بازیکن تیم است. (best بی‌قاعده)" },
          { en: "This bag isn't as heavy as that one.", fa: "این کیف آنقدر سنگین نیست که آن یکی." },
        ],
      },
      {
        title: "بی‌قاعده‌های معروف: good/bad/far",
        paragraphs: [
          "سه صفت پرمصرف، دنباله‌های مقایسه‌ای مستقل دارند و باید از حفظ باشید: good → better → the best، bad → worse → the worst، far → farther/further → the farthest/furthest. توجه کنید که never نمی‌گوییم gooder یا bader؛ این سه کلمه آن‌قدر قدیمی و پرتکرارند که زبان برایشان شکل‌های مخصوص نگه داشته است. کلمهٔ less هم تفضیلیِ کم‌تر کردن است: less expensive یعنی ارزان‌تر (ادبی‌تر از cheaper).",
          "کاربرد ظریف further در برابر farther: هر دو «دورتر» اند، اما further معنای انتزاعی «بیشتر/فراتر» هم دارد: I need further information یعنی «اطلاعات بیشتری لازم دارم» — اینجا نمی‌توان گفت farther. این تمایز در نوشتار رسمی اهمیت دارد و رعایتش نشانهٔ دقت شماست. برای تمرین، سه چیز واقعی در اطرافتان را با هم مقایسه کنید و هم تفضیلی و هم عالی بسازید: قهوه، چای و دوغ — which is the most refreshing?",
        ],
        examples: [
          { en: "My marks are better this year.", fa: "نمره‌هایم امسال بهتر است." },
          { en: "That was the worst film I've ever seen.", fa: "آن بدترین فیلمی بود که تا حالا دیده‌ام." },
          { en: "We need further discussion.", fa: "به بحث بیشتری نیاز داریم. (نه farther)" },
        ],
      },
    ],
    rule:
      "تفضیلی (مقایسهٔ دو چیز): صفت کوتاه + er + than (taller than)؛ صفت بلند با more + than (more expensive than). عالی (برتری از بین ۳+): the + صفت کوتاه + est (the tallest)؛ the most + صفت بلند (the most beautiful). مختوم به y: ier/iest (happier، the happiest). بی‌قاعده: good→better→the best · bad→worse→the worst · far→farther/further. مساوی: as + صفت + as؛ برابر نبودن: not as...as. در عالی، the اجباری است.",
    form: [
      { label: "تفضیلی کوتاه", pattern: "tall → taller than · cheap → cheaper than" },
      { label: "تفضیلی بلند", pattern: "expensive → more expensive than" },
      { label: "عالی کوتاه", pattern: "the tallest / the oldest / the hottest (تکرار صامت)" },
      { label: "عالی بلند", pattern: "the most expensive / the most beautiful" },
      { label: "بی‌قاعده", pattern: "good→better→the best · bad→worse→the worst · far→further" },
      { label: "مقایسهٔ برابر", pattern: "as tall as · not as busy as" },
    ],
    examples: [
      { en: "Tehran is bigger than Isfahan.", fa: "تهران از اصفهان بزرگ‌تر است." },
      { en: "This is the most beautiful park in the city.", fa: "این زیباترین پارک شهر است." },
      { en: "My new phone is faster than my old one.", fa: "گوشی جدیدم از قبلی سریع‌تر است." },
      { en: "Winter is colder than autumn.", fa: "زمستان از پاییز سردتر است." },
      { en: "She is the youngest in her class.", fa: "او جوان‌ترین نفر کلاسش است." },
      { en: "This exercise is easier than the last one.", fa: "این تمرین از قبلی آسان‌تر است. (easy → easier)" },
      { en: "Your idea is better than mine.", fa: "ایده‌ات از ایدهٔ من بهتر است." },
      { en: "That was the happiest day of my life.", fa: "آن خوشحال‌ترین روز زندگی‌ام بود." },
    ],
    mistakes: [
      { wrong: "This book is more easier.", right: "This book is easier.", note: "صفت کوتاه است و er می‌گیرد؛ more + er دوبار تفضیلی ساخته و غلط است." },
      { wrong: "She is the most fastest runner.", right: "She is the fastest runner.", note: "fast صفت کوتاه است؛ most و est با هم نمی‌آیند." },
      { wrong: "He is taller then me.", right: "He is taller than me.", note: "واژهٔ مقایسه than است با a، نه then با e (that را به خاطر بسپارید)." },
      { wrong: "This is gooder than that.", right: "This is better than that.", note: "good بی‌قاعده است: better / the best — هیچ‌وقت gooder." },
    ],
    tips: [
      "قبل از ساختن تفضیلی، صفت را بشمارید: یک بخشش → er/est؛ دو بخشش به بالا → more/most؛ مختوم به y → ier/iest.",
      "جفت‌های تفضیلی را با than و جفت‌های عالی را با the تمرین کنید؛ این دو واژه، قاب مقایسه‌اند و بدون آن‌ها جمله لنگ است.",
      "سه بی‌قاعده را با یک جملهٔ قصه‌مانند به خاطر بسپارید: good goes better, the best؛ bad becomes worse, the worst.",
      "برای برابری از as...as استفاده کنید: as sweet as honey — این ساختار در تشبیه‌ها (شیرین مثل عسل) همه‌کاره است.",
    ],
    quiz: [
      { question: "تفضیلی «beautiful» چیست؟", options: ["beautifuler", "more beautiful", "most beautiful", "beautifulest"], correctIndex: 1, explanation: "صفت بلند است؛ با more مقایسه می‌شود: more beautiful than." },
      { question: "«او جوان‌ترین عضو خانواده است» کدام است؟", options: ["She is younger in her family.", "She is the youngest in her family.", "She is the most young in her family.", "She is youngest in her family."], correctIndex: 1, explanation: "عالی = the + youngest؛ the اجباری است." },
      { question: "کدام جمله درست است؟", options: ["This test was more easy than the last one.", "This test was easier than the last one.", "This test was more easier than the last one.", "This test was easyer than the last one."], correctIndex: 1, explanation: "easy به y ختم می‌شود: easier؛ نه more easy و نه more easier." },
      { question: "عالی صفت «good» چیست؟", options: ["the goodest", "the most good", "the best", "the better"], correctIndex: 2, explanation: "good بی‌قاعده است: better → the best." },
      { question: "«این اتاق به آن اندازه بزرگ نیست» کدام است؟", options: ["This room is not as big as that one.", "This room is not so bigger than that one.", "This room is less bigger than that one.", "This room is not as bigger as that one."], correctIndex: 0, explanation: "مقایسهٔ نابرابری با as + صفت ساده + as ساخته می‌شود." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-10",
    titleFa: "آینده: going to و will",
    titleEn: "Future: going to & will",
    cefr: "A2",
    intro:
      "انگلیسی بر خلاف فارسی برای آینده یک فعل واحد ندارد؛ چند ابزار موازی دارد که هر کدام رنگ و بوی متفاوتی دارند. دو ابزار اصلی going to و will هستند: اولی برای برنامه‌ریزی‌شده‌ها و نشانه‌های قابل مشاهده، دومی برای تصمیم لحظه‌ای، پیش‌بینی و قول. اگر تفاوت این دو «حس» را درک کنید — و نه فقط فرمولشان را — مکالمهٔ آیندهٔ شما طبیعی خواهد شد و از ویژگی محبوب خودتان که «آینده‌نگر» است، بهترین استفاده را می‌برید.",
    sections: [
      {
        title: "going to: آینده‌ای که از قبل در ریل است",
        paragraphs: [
          "وقتی قبلاً تصمیم گرفته‌اید یا برنامه‌ای دارید، انگلیسی going to می‌گوید: I'm going to visit my grandmother this Friday (از قبل تصمیم گرفته‌ام). ساختارش ساده است: am/is/are + going to + فعل ساده. کاربرد دوم این ساختار «پیش‌بینی بر اساس شواهد» است: وقتی نشانه‌های قابل مشاهده در همین لحظه به آینده اشاره می‌کنند — Look at those clouds! It's going to rain (ابرها را می‌بینی؛ باران در راه است).",
          "در حالت اول، going to یک «قرار از پیش نوشته‌شده» را نشان می‌دهد و دقیقاً به همین دلیل با حال استمراری برای برنامه‌های قطعی (I'm meeting Ali tomorrow) هم‌خانواده است و اغلب قابل جایگزینی‌اند. در حالت دوم، «شواهد در چشم شماست» و پیش‌بینی شما بر اساس همین الان است، نه بر اساس دانش کلی یا حدس. این تفکیکِ «برنامهٔ قبلی» و «شاهد فعلی» دو ستون معنایی going to است و هر جا یکی را دیدید، بدون تردید از این ساختار استفاده کنید.",
        ],
        examples: [
          { en: "We're going to buy a new car next month.", fa: "ماه بعد می‌خواهیم ماشین نو بخریم. (برنامهٔ قبلی)" },
          { en: "Look at the sky! It's going to snow.", fa: "به آسمان نگاه کن! قرار است برف بیاید. (شاهد)" },
        ],
      },
      {
        title: "will: آینده‌ای که همین الان ساخته می‌شود",
        paragraphs: [
          "will سه کار اصلی دارد که همگی حس «همین لحظه» دارند. اول، تصمیم لحظه‌ای: گوشی زنگ می‌خورد و می‌گویید I'll get it! (الان تصمیم گرفتم). دوم، پیش‌بینی کلی بدون شاهد مشخص: I think our team will win (حدس و نظر، نه ابرِ قابل دیدن). سوم، قول و پیشنهاد و تهدید(!): I'll help you with your homework / Don't worry, I'll be there. در همهٔ این‌ها، will مثل کلیدی است که همین حالا در قفل آینده می‌چرخد.",
          "شکل منفی will not به won't کوتاه می‌شود و در گفتار تقریباً همیشه همین شکل را می‌شنوید: I won't be late. برای سؤال، will به اول می‌آید: Will you come to the party? و جواب کوتاه با خودش ساخته می‌شود: Yes, I will / No, I won't. نکتهٔ کاربردی مهم: will بعد از I معمولاً به I'll کوتاه می‌شود و در مکالمهٔ طبیعی، شکل بلند I will تنها برای تأکید به کار می‌رود — I WILL finish this، با تکیه بر WILL.",
        ],
        examples: [
          { en: "It's cold in here. I'll close the window.", fa: "اینجا سرد است. پنجره را می‌بندم. (تصمیم لحظه‌ای)" },
          { en: "I think she will pass the exam easily.", fa: "فکر می‌کنم راحت در آزمون قبول می‌شود. (پیش‌بینی)" },
          { en: "I won't tell anybody your secret.", fa: "راز تو را به کسی نمی‌گویم. (قول)" },
        ],
      },
      {
        title: "انتخاب درست: پرسش سه‌گانهٔ طلایی",
        paragraphs: [
          "برای اینکه بین going to و will (و حال استمراری) گیج نشوید، سه سؤال از خودتان بپرسید. اول: «آیا از قبل تصمیم گرفته شده؟» بله → going to (یا حال استمراری برای قرارهای شخصی). دوم: «آیا همین الان تصمیم می‌گیرم یا قول می‌دهم یا حدس کلی می‌زنم؟» بله → will. سوم: «آیا شاهدی می‌بینم که به آینده اشاره کند؟» بله → going to. این سه سؤال، نود درصد موارد را پوشش می‌دهند.",
          "دو نکتهٔ تکمیلی برای روان‌تر شدن گفتارتان: اول، در جمله‌های زمانی (بعد از when و after و before) به‌جای آینده، حال ساده می‌آید: I'll call you when I arrive (نه when I will arrive). دوم، در مکالمه‌های روزمره‌ی برنامه‌ریزی، will به‌عنوان «فعل همه‌کاره» پذیرفته شده و انگلیسی‌زبان‌ها گاهی بی‌دقت بین این‌ها جابه‌جا می‌شوند؛ پس اگر ناامن بودید، will انتخاب امن‌تری برای شروع است و با بالا رفتن سطحتان، تمایزهای ظریف را در مکالمه‌های واقعی شکار کنید.",
        ],
        examples: [
          { en: "I'll call you when I get home.", fa: "وقتی خونه می‌رسم بهت زنگ می‌زنم. (بعد از when فعل حال)" },
          { en: "She is going to start a new job in June.", fa: "او قصد دارد ژوئن کار جدیدی شروع کند." },
        ],
      },
    ],
    rule:
      "going to برای برنامهٔ قبلی و پیش‌بینی با شاهد: am/is/are + going to + فعل ساده. will برای تصمیم لحظه‌ای، پیش‌بینی کلی، قول و پیشنهاد: will + فعل ساده (منفی: won't). در جمله‌های زمانی بعد از when/after/before فعل حال می‌آید نه آینده: I'll call you when I arrive. جواب کوتاه: Yes, I will / No, I won't. will هیچ‌وقت فعل را s یا ed نمی‌کند و بعد از آن همیشه فعل ساده می‌آید.",
    form: [
      { label: "going to مثبت", pattern: "I am going to travel · She is going to study" },
      { label: "going to منفی", pattern: "We aren't going to wait." },
      { label: "will مثبت", pattern: "I'll help you. · They will come." },
      { label: "will منفی", pattern: "I won't forget. (= will not)" },
      { label: "سؤال", pattern: "Are you going to buy it? · Will you help me?" },
      { label: "جملهٔ زمانی", pattern: "I'll call you when I arrive. (نه will arrive)" },
    ],
    examples: [
      { en: "I'm going to learn English every day this year.", fa: "امسال قصد دارم هر روز انگلیسی یاد بگیرم." },
      { en: "Don't worry — I'll help you with the shopping.", fa: "نگران نباش — کمکِ خرید می‌کنم." },
      { en: "They are going to move to a new house soon.", fa: "به‌زودی قرار است به خانهٔ نو بروند." },
      { en: "I think it will be sunny tomorrow.", fa: "فکر می‌کنم فردا آفتابی باشد." },
      { en: "She won't eat anything before the exam.", fa: "قبل از آزمون هیچ‌چیز نمی‌خورد." },
      { en: "We're going to visit the museum on Friday.", fa: "جمعه قصد داریم موزه را ببینیم." },
      { en: "The bag looks heavy. I'll carry it for you.", fa: "کیف سنگین به نظر می‌رسد. برایت می‌آورمش. (لحظه‌ای)" },
      { en: "Are you going to watch the match tonight?", fa: "امشب قرار است بازی را ببینی؟" },
    ],
    mistakes: [
      { wrong: "I will to call you tomorrow.", right: "I will call you tomorrow.", note: "بعد از will همیشه فعل ساده می‌آید؛ to اضافه است." },
      { wrong: "She is going to travels next week.", right: "She is going to travel next week.", note: "بعد از going to هم فعل ساده؛ s سوم‌شخص اینجا حذف می‌شود." },
      { wrong: "I'll call you when I will arrive.", right: "I'll call you when I arrive.", note: "در جملهٔ زمانی بعد از when، فعل حال ساده می‌آید نه will." },
      { wrong: "I won't to be late.", right: "I won't be late.", note: "won't خودش will + not است؛ فعل بعدش برهنه می‌آید." },
    ],
    tips: [
      "پرسش سه‌گانه را حفظ کنید: برنامهٔ قبلی؟ → going to · تصمیم/قول/حدسِ الان؟ → will · شاهد می‌بینی؟ → going to.",
      "کوتاه‌نویسی‌ها را در گفتار به کار ببرید: I'll، we'll، won't — شکل بلند فقط برای تأکید است؛ I WILL come، یعنی قول محکم.",
      "هر شب برای فردا سه برنامه بگویید با going to و سه حدس با will؛ این تمرین دو دقیقه‌ای، تفکیک این دو را غریزی می‌کند.",
      "بعد از when/after/before اگر will نوشتید، حذفش کنید؛ جمله‌های زمانی مهم‌ترین جای خطای آینده‌اند.",
    ],
    quiz: [
      { question: "«ابرها را ببین! باران می‌بارد» کدام است؟", options: ["Look at the clouds! It will rain.", "Look at the clouds! It's going to rain.", "Look at the clouds! It rains.", "Look at the clouds! It is raining tomorrow."], correctIndex: 1, explanation: "شاهد قابل مشاهده (ابرها) → going to." },
      { question: "گوشی زنگ خورد و همین الان تصمیم می‌گیرید جواب بدهید:", options: ["I answer it!", "I'm going to answer it!", "I'll answer it!", "I answer!"], correctIndex: 2, explanation: "تصمیم لحظه‌ای → will: I'll answer it." },
      { question: "کدام جمله درست است؟", options: ["I will to buy a car next year.", "I will buying a car next year.", "I will buy a car next year.", "I will buys a car next year."], correctIndex: 2, explanation: "بعد از will فعل ساده بدون to و بدون s." },
      { question: "«وقتی رسیدم بهت زنگ می‌زنم» کدام است؟", options: ["I'll call you when I will arrive.", "I'll call you when I arrive.", "I call you when I will arrive.", "I'll call you when I arriving."], correctIndex: 1, explanation: "بعد از when فعل حال ساده می‌آید، نه آینده." },
      { question: "«او قول داد که دیر نکند» کدام است؟", options: ["She promised she won't be late.", "She promised she isn't going late.", "She promised she doesn't late.", "She promised she won't to be late."], correctIndex: 0, explanation: "قول → will؛ منفی آن won't + فعل ساده: won't be late." },
    ],
  },
];
