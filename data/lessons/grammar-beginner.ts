import type { GrammarLesson } from "./types";

// ========================================
// گرامر مبتدی — ۱۰ درس واقعی (A1 / A2)
// ========================================

export const LESSONS: GrammarLesson[] = [
  {
    kind: "grammar",
    slug: "grammar-beginner-01",
    titleFa: "افعال to be (am / is / are)",
    titleEn: "Verb to be",
    cefr: "A1",
    intro:
      "فعل to be پرکاربردترین فعل انگلیسی است و اولین قدم یادگیری این زبان محسوب می‌شود. با این فعل می‌توانید خودتان را معرفی کنید و ویژگی‌ها را توصیف کنید.",
    rule:
      "در فارسی ما می‌گوییم «من دانشجو هستم» اما در انگلیسی فعل بودن سه شکل دارد: am برای I، is برای he/she/it و are برای you/we/they. این فعل مثل هر فعل دیگری بین فاعل و صفت یا اسم می‌نشیند. برای منفی کردن کافی است not بعد از فعل بیاورید: I am not tired. برای سوالی کردن، فعل را به ابتدای جمله می‌برید: Are you tired? جواب کوتاه همیشه با خود فعل داده می‌شود: Yes, I am. نکته مهم اینکه در حالت ساده هیچ فعل دیگری لازم نیست؛ «او معلم است» می‌شود He is a teacher و نه He is a teacher is.",
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
    ],
    mistakes: [
      { wrong: "I student.", right: "I am a student.", note: "در انگلیسی فعل هیچ‌وقت حذف نمی‌شود، حتی وقتی در فارسی «هستم» را نمی‌گوییم." },
      { wrong: "She are my mother.", right: "She is my mother.", note: "برای she همیشه از is استفاده کنید." },
      { wrong: "Are you teacher?", right: "Are you a teacher?", note: "شغل مفرد و قابل‌شمارش است؛ به a/an نیاز دارد." },
    ],
    quiz: [
      { question: "جمله «آن‌ها خسته‌اند» کدام است؟", options: ["They is tired.", "They am tired.", "They are tired.", "They be tired."], correctIndex: 2, explanation: "برای they همیشه are به کار می‌رود." },
      { question: "شکل سوالی جمله «He is a doctor» چیست؟", options: ["He is a doctor?", "Is he a doctor?", "Does he a doctor?", "Is a doctor he?"], correctIndex: 1, explanation: "برای سوالی کردن، فعل به ابتدای جمله می‌رود." },
      { question: "جمله «ما معلم نیستیم» کدام است؟", options: ["We not are teachers.", "We aren't teachers.", "We isn't teachers.", "We don't teachers."], correctIndex: 1, explanation: "منفی کردن با not بعد از are: We aren't teachers." },
      { question: "کدام جمله درست است؟", options: ["I am hungry and he am too.", "I is hungry and he is too.", "I am hungry and he is too.", "I are hungry and he is too."], correctIndex: 2, explanation: "I با am و he با is می‌آید." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-02",
    titleFa: "ضمایر شخصی و مالکیت",
    titleEn: "Personal and Possessive Pronouns",
    cefr: "A1",
    intro:
      "ضمایر ستون فقرات هر جمله‌اند؛ بدون آن‌ها نمی‌توانید درباره خودتان و دیگران حرف بزنید. در این درس تفاوت ضمایر فاعلی (I) و صفات مالکیت (my) را یاد می‌گیرید.",
    rule:
      "ضمیر فاعلی جای فاعل جمله می‌نشیند: I, you, he, she, it, we, they. صفت مالکیت قبل از اسم می‌آید و مالکیت را نشان می‌دهد: my, your, his, her, its, our, their. پس از تمرکز اصلی این است که his به خود مرد اشاره دارد اما her به زن: This is his book (کتاب او - مرد) و This is her book (کتاب او - زن). نکته ظریف دیگر تفاوت it's و its است: it's یعنی it is اما its یعنی «مال آن». ضمیر مطلق (mine, yours, hers...) هم به تنهایی می‌نشیند و اسم بعدش نمی‌آید: This book is mine.",
    form: [
      { label: "ضمیر فاعلی", pattern: "I / you / he / she / it / we / they" },
      { label: "صفت مالکیت", pattern: "my / your / his / her / its / our / their + اسم" },
      { label: "ضمیر مطلق", pattern: "mine / yours / his / hers / ours / theirs (بدون اسم)" },
      { label: "مثال ضمیر مطلق", pattern: "This car is mine. (= my car)" },
    ],
    examples: [
      { en: "She loves her cat very much.", fa: "او (زن) گربه‌اش را خیلی دوست دارد." },
      { en: "Our house is small but comfortable.", fa: "خانه ما کوچک اما راحت است." },
      { en: "This isn't my umbrella; it's yours.", fa: "این چتری من نیست؛ مال توست." },
      { en: "They forgot their tickets at home.", fa: "آن‌ها بلیط‌هایشان را در خانه جا گذاشتند." },
      { en: "He broke his leg last week.", fa: "او هفته پیش پایش را شکست." },
      { en: "Its wheels are red.", fa: "چرخ‌های آن قرمز است." },
    ],
    mistakes: [
      { wrong: "Me and my friend go to the gym.", right: "My friend and I go to the gym.", note: "در جایگاه فاعل از I استفاده کنید، نه me. آن هم با ادب: اول دیگری!" },
      { wrong: "She loves he.", right: "She loves him.", note: "بعد از فعل، ضمیر مفعولی لازم است: him, her, them." },
      { wrong: "The dog wagged it's tail.", right: "The dog wagged its tail.", note: "it's = it is است؛ مالکیت بدون آپاستروف نوشته می‌شود." },
    ],
    quiz: [
      { question: "جای خالی را پر کنید: «Ali and ___ are brothers.»", options: ["me", "I", "my", "mine"], correctIndex: 1, explanation: "جایگاه فاعل است؛ پس I." },
      { question: "«این قلم مال من است» کدام است؟", options: ["This pen is my.", "This is mine pen.", "This pen is mine.", "This pen is me."], correctIndex: 2, explanation: "mine به تنهایی می‌نشیند و اسم نمی‌خواهد." },
      { question: "کدام جمله درست است؟", options: ["Sarah Brushed hers hair.", "Sarah brushed her hair.", "Sarah brushed she hair.", "Sarah brushed hers."], correctIndex: 1, explanation: "قبل از اسم از صفت مالکیت her استفاده می‌شود." },
      { question: "«آن‌ها فرزندان‌شان را دوست دارند» کدام است؟", options: ["They love his children.", "They love they children.", "They love their children.", "They love them children."], correctIndex: 2, explanation: "صفت مالکیت برای they کلمه their است." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-03",
    titleFa: "حروف تعریف a / an / the",
    titleEn: "Articles",
    cefr: "A1",
    intro:
      "حروف تعریف کوچک‌ترین کلمات انگلیسی‌اند اما بیشترین اشتباه را ایجاد می‌کنند. قواعد ساده‌ای دارند که در این درس کامل یاد می‌گیرید.",
    rule:
      "a و an فقط برای اسم‌های مفرد و قابل‌شمارش و نشناس به کار می‌روند؛ یعنی وقتی مخاطب نمی‌داند دقیقاً از کدام چیز حرف می‌زنید. انتخاب بین این دو به صدا بستگی دارد نه حرف: اگر کلمه بعدی با صدای صدا شروع شود an می‌آید (an apple, an hour چون h آن خوانده نمی‌شود) و در غیر این صورت a (a book, a university چون y مثل YOU خوانده می‌شود). the برای وقتی است که طرف مقابل می‌داند از چه چیزی حرف می‌زنید: چیزی که قبلاً گفته شده، یتیمِ در محیط (the sun, the moon) یا چیزی یکتا. اسم‌های غیرقابل‌شمارش و جمع عام هیچ‌وقت a/an نمی‌گیرند: I like music نه a music.",
    form: [
      { label: "a + صدای صامت", pattern: "a book / a car / a university" },
      { label: "an + صدای صدا", pattern: "an apple / an egg / an hour / an honest man" },
      { label: "the (شناخته‌شده)", pattern: "the book on the table / the sun" },
      { label: "بدون حرف تعریف", pattern: "I like music. / Cats are cute. (عام)" },
    ],
    examples: [
      { en: "I saw a dog in the park. The dog was very friendly.", fa: "در پارک سگی دیدم. سگ خیلی دوستانه بود." },
      { en: "She is an engineer at a big company.", fa: "او مهندس یک شرکت بزرگ است." },
      { en: "We waited for an hour at the station.", fa: "یک ساعت در ایستگاه منتظر ماندیم." },
      { en: "The moon looks beautiful tonight.", fa: "امشب ماه زیبا به نظر می‌رسد." },
      { en: "My uncle has a farm with a hundred sheep.", fa: "عمویم مزرعه‌ای با صد گوسفند دارد." },
      { en: "Honey is good for a sore throat.", fa: "عسل برای گلودرد خوب است." },
    ],
    mistakes: [
      { wrong: "She is a teacher of English and I am too an teacher.", right: "She is an English teacher and I am a teacher too.", note: "teacher با صدای صامت t شروع می‌شود پس a می‌گیرد." },
      { wrong: "I love the cats.", right: "I love cats.", note: "برای حرف عام درباره یک گروه، the نمی‌آید." },
      { wrong: "He plays piano in a orchestra.", right: "He plays the piano in an orchestra.", note: "سازهای موسیقی the می‌گیرند و orchestra با an شروع می‌شود." },
    ],
    quiz: [
      { question: "کدام گزینه درست است؟ «___ apple a day keeps the doctor away.»", options: ["A", "An", "The", "—"], correctIndex: 1, explanation: "apple با صدای صدا شروع می‌شود، پس an." },
      { question: "«ما یک فیلم دیدیم. فیلم خیلی طولانی بود.» کدام است؟", options: ["We saw a movie. A movie was very long.", "We saw a movie. The movie was very long.", "We saw the movie. The movie was very long.", "We saw an movie. Movie was very long."], correctIndex: 1, explanation: "بار دوم که چیز شناخته شد، the می‌آید." },
      { question: "کدام کلمه با an می‌آید؟", options: ["university", "European", "hour", "one-way street"], correctIndex: 2, explanation: "در hour حرف h خوانده نمی‌شود و با صدای صدا شروع می‌شود." },
      { question: "کدام جمله درست است؟", options: ["I need an information.", "I need a information.", "I need information.", "I need the informations."], correctIndex: 2, explanation: "information غیرقابل‌شمارش است و a/an نمی‌گیرد." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-04",
    titleFa: "جمله‌سازی ساده و this / that / these / those",
    titleEn: "Basic Sentences & Demonstratives",
    cefr: "A1",
    intro:
      "ساختار پایه جمله انگلیسی SVO است: فاعل + فعل + مفعول. در این درس با این ساختار و کلمات اشاره this/that/these/those آشنا می‌شوید.",
    rule:
      "جمله انگلیسی از چپ به راست خوانده می‌شود و ترتیب کلمات تقریباً هرگز عوض نمی‌شود: فاعل، سپس فعل، سپس مفعول. صفت همیشه قبل از اسم می‌آید (a red car) و نه بعد از آن. برای اشاره به چیزها چهار کلمه داریم: this برای نزدیک مفرد (این)، that برای دور مفرد (آن)، these برای نزدیک جمع (این‌ها) و those برای دور جمع (آن‌ها). قید مکان و زمان معمولاً انتهای جمله می‌آید: I eat breakfast at home every morning. با همین الگو می‌توانید صدها جمله درست بزنید.",
    form: [
      { label: "ساختار پایه", pattern: "فاعل + فعل + مفعول → I drink tea." },
      { label: "با صفت", pattern: "فاعل + فعل + صفت + اسم → She has a small dog." },
      { label: "اشاره نزدیک", pattern: "this (مفرد) / these (جمع) → This book is mine." },
      { label: "اشاره دور", pattern: "that (مفرد) / those (جمع) → Those clouds look heavy." },
    ],
    examples: [
      { en: "This tea is too hot.", fa: "این چای زیادی داغ است." },
      { en: "Those children are playing football.", fa: "آن بچه‌ها فوتبال بازی می‌کنند." },
      { en: "I read an interesting book last night.", fa: "دیشب کتاب جالبی خواندم." },
      { en: "That building is the tallest in the city.", fa: "آن ساختمان بلندترین ساختمان شهر است." },
      { en: "We visited my grandmother on Friday.", fa: "جمعه به دیدن مادربزرگم رفتیم." },
      { en: "These shoes don't fit me.", fa: "این کفش‌ها پایم نمی‌شود." },
    ],
    mistakes: [
      { wrong: "I like very much this movie.", right: "I like this movie very much.", note: "در انگلیسی مفعول قبل از قید می‌آید و ترتیب کلمات ثابت است." },
      { wrong: "She bought a dress beautiful.", right: "She bought a beautiful dress.", note: "صفت همیشه قبل از اسم می‌آید." },
      { wrong: "This books are heavy.", right: "These books are heavy.", note: "this فقط مفرد است؛ جمع آن these است." },
    ],
    quiz: [
      { question: "جمله «آن پرندگان آواز می‌خوانند» کدام است؟", options: ["That birds are singing.", "Those birds are singing.", "These bird is singing.", "This birds are singing."], correctIndex: 1, explanation: "birds جمع و دور است؛ پس those." },
      { question: "کدام جمله ترتیب درست دارد؟", options: ["I drink every morning coffee.", "I coffee drink every morning.", "I drink coffee every morning.", "Every morning drink I coffee."], correctIndex: 2, explanation: "SVO + قید زمان در انتها." },
      { question: "«او یک ماشین قرمز دارد» کدام است؟", options: ["He has a car red.", "He has red a car.", "He has a red car.", "He a red car has."], correctIndex: 2, explanation: "صفت (red) قبل از اسم (car) می‌آید." },
      { question: "برای اشاره به کتابی که در دست دارید چه می‌گویید؟", options: ["That book is interesting.", "This book is interesting.", "Those books are interesting.", "These book is interesting."], correctIndex: 1, explanation: "نزدیک و مفرد → this." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-05",
    titleFa: "جمع کردن اسم‌ها",
    titleEn: "Plural Nouns",
    cefr: "A1",
    intro:
      "برای گفتن «دو کتاب» یا «چند سیب» باید اسم‌ها را جمع کنید. قاعده اصلی ساده است اما استثناهای مهمی دارد.",
    rule:
      "قاعده اصلی: به اکثر اسم‌ها s اضافه کنید: book → books. اگر اسم به s, ss, sh, ch, x, o ختم شود es می‌گیرد: bus → buses, watch → watches, potato → potatoes. اگر به حرف بی‌صدای y ختم شود، y به ies تبدیل می‌شود: city → cities اما اگر قبل از y حرف صدادار باشد فقط s می‌گیرد: boy → boys. اسم‌های غیرقابل‌شمارش مثل water، rice و money هرگز جمع نمی‌شوند. جمع‌های بی‌قاعده مهم: man → men، woman → women، child → children، foot → feet، tooth → teeth، person → people. برخی هم شکل واحد و جمع یکسان دارند: sheep، fish، deer.",
    form: [
      { label: "قاعده اصلی", pattern: "+ s → books, cars, days" },
      { label: "پایان‌های خش", pattern: "+ es → buses, boxes, watches, potatoes" },
      { label: "بی‌صدای + y", pattern: "y → ies → cities, families / (صدادار) boys, keys" },
      { label: "بی‌قاعده", pattern: "man→men, child→children, foot→feet, tooth→teeth" },
      { label: "بدون تغییر", pattern: "sheep, fish, deer, aircraft" },
    ],
    examples: [
      { en: "I have two children: a boy and a girl.", fa: "دو فرزند دارم: یک پسر و یک دختر." },
      { en: "There are three buses to the city every hour.", fa: "هر ساعت سه اتوبوس به شهر هست." },
      { en: "My teeth are sensitive to cold water.", fa: "دندان‌هایم به آب سرد حساس است." },
      { en: "The farmer keeps fifty sheep on his land.", fa: "کشاورز در زمینش پنجاه گوسفند نگه می‌دارد." },
      { en: "How many people work in this factory?", fa: "چند نفر در این کارخانه کار می‌کنند؟" },
      { en: "Both cities are beautiful in spring.", fa: "هر دو شهر در بهار زیبا هستند." },
    ],
    mistakes: [
      { wrong: "I have two childrens.", right: "I have two children.", note: "children خودش جمع است و دیگر s نمی‌گیرد." },
      { wrong: "We saw three womans at the bank.", right: "We saw three women at the bank.", note: "جمع woman کلمه women است." },
      { wrong: "She gave me some good advices.", right: "She gave me some good advice.", note: "advice غیرقابل‌شمارش است و جمع نمی‌شود." },
    ],
    quiz: [
      { question: "جمع کلمه child چیست؟", options: ["childs", "children", "childrens", "childes"], correctIndex: 1, explanation: "child بی‌قاعده است: children." },
      { question: "جمع کدام کلمه درست نوشته شده؟", options: ["citys", "cityes", "cities", "city"], correctIndex: 2, explanation: "بی‌صدای + y → ies: cities." },
      { question: "«چند نفر...» کدام جمله درست است؟", options: ["How many peoples live here?", "How many people live here?", "How much people live here?", "How many person live here?"], correctIndex: 1, explanation: "people خودش جمع person است و peoples معنای دیگری دارد." },
      { question: "کدام کلمه درست جمع شده است؟", options: ["boxs", "boxies", "boxes", "boxen"], correctIndex: 2, explanation: "اسم‌های ختم به x با es جمع می‌شوند: boxes." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-06",
    titleFa: "زمان حال ساده",
    titleEn: "Present Simple",
    cefr: "A2",
    intro:
      "حال ساده پرکاربردترین زمان انگلیسی است؛ برای روتین، حقایق و عادت‌ها. کلید آن s شخص سوم مفرد است.",
    rule:
      "حال ساده برای کارهای تکرارشونده (I get up at seven)، حقایق علمی (Water boils at 100 degrees) و حالت‌های دائمی (She lives in Shiraz) به کار می‌رود. ساختار مثبت ساده است: فعل اصلی؛ فقط برای he/she/it به فعل s اضافه می‌شود: he works. منفی و سوالی با do/does ساخته می‌شوند: I don't work / Does she work? در این حالت فعل اصلی به شکل ساده می‌ماند و does همه کار s را انجام می‌دهد: Does he like tea? نه Does he likes tea? قیدهای تکرار معمولاً قبل از فعل می‌آیند: I always drink tea. فعل‌های پایانی o, ch, sh, ss, x با es جمع می‌شوند: go → goes, watch → watches. فعل have هم بی‌قاعده است: he has.",
    form: [
      { label: "مثبت", pattern: "I/You/We/They + فعل / He/She/It + فعل+s" },
      { label: "منفی", pattern: "don't / doesn't + فعل ساده → She doesn't smoke." },
      { label: "سوالی", pattern: "Do / Does + فاعل + فعل؟ → Do you speak English?" },
      { label: "قید تکرار", pattern: "always / usually / often / sometimes / never + فعل" },
    ],
    examples: [
      { en: "My brother works at a bank.", fa: "برادرم در بانک کار می‌کند." },
      { en: "Water freezes at zero degrees.", fa: "آب در صفر درجه یخ می‌زند." },
      { en: "I don't drink coffee at night.", fa: "شب‌ها قهوه نمی‌نوشم." },
      { en: "Does your father drive to work?", fa: "پدرت با ماشین سر کار می‌رود؟" },
      { en: "She never eats breakfast in a hurry.", fa: "او هرگز صبحانه را عجله‌ای نمی‌خورد." },
      { en: "We usually visit our grandparents on Fridays.", fa: "معمولاً جمعه‌ها به دیدن پدربزرگ و مادربزرگ می‌رویم." },
    ],
    mistakes: [
      { wrong: "He go to the gym every day.", right: "He goes to the gym every day.", note: "برای he/she/it فعل s می‌گیرد." },
      { wrong: "Does she likes her job?", right: "Does she like her job?", note: "بعد از does فعل ساده می‌آید و s اضافه نمی‌شود." },
      { wrong: "I am not drink tea.", right: "I don't drink tea.", note: "منفی افعال عادی با don't ساخته می‌شود نه با am not." },
    ],
    quiz: [
      { question: "«او هر روز تمرین می‌کند» کدام است؟", options: ["He practise every day.", "He practises every day.", "He does practise every day?", "He is practise every day."], correctIndex: 1, explanation: "he + فعل با s: practises." },
      { question: "شکل سوالی «They live in Karaj» چیست؟", options: ["Does they live in Karaj?", "Do they live in Karaj?", "They do live in Karaj?", "Are they live in Karaj?"], correctIndex: 1, explanation: "they با Do سوالی می‌شود." },
      { question: "کدام جمله درست است؟", options: ["She don't understand me.", "She doesn't understands me.", "She doesn't understand me.", "She not understand me."], correctIndex: 2, explanation: "doesn't + فعل ساده." },
      { question: "قید always کجا می‌نشیند؟", options: ["I drink always tea.", "Always I drink tea.", "I always drink tea.", "I drink tea always."], correctIndex: 2, explanation: "قید تکرار قبل از فعل اصلی می‌آید." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-07",
    titleFa: "زمان حال استمراری",
    titleEn: "Present Continuous",
    cefr: "A2",
    intro:
      "وقتی می‌خواهید بگویید «الان داری چیکار می‌کنی؟» حال استمراری لازم دارید. تفاوت آن با حال ساده را هم یاد می‌گیرید.",
    rule:
      "حال استمراری برای کارهایی که همین حالا در جریان‌اند (I'm studying now)، موقعیت‌های موقت (She's staying with us this week) و برنامه‌های قطعی آینده (We're meeting at six) به کار می‌رود. ساختار آن همیشه am/is/are + فعل+ing است. برای فعل‌هایی که به e ختم می‌شوند e حذف می‌شود: write → writing. فعل‌های یک‌هجایی با صدای کوتاه آخرین حرف صامت تکرار می‌شود: run → running, sit → sitting. نکته کلیدی: افعال حالتی مثل know، like، want و believe معمولاً استمراری نمی‌شوند؛ به جای I'm knowing می‌گوییم I know. تفاوت با حال ساده: حال ساده = همیشگی، حال استمراری = همین حالا.",
    form: [
      { label: "مثبت", pattern: "am / is / are + فعل+ing → She is cooking." },
      { label: "منفی", pattern: "am/is/are + not + ing → They aren't listening." },
      { label: "سوالی", pattern: "Am/Is/Are + فاعل + ing؟ → Are you watching TV?" },
      { label: "برنامه آینده", pattern: "We're flying to Mashhad tomorrow." },
    ],
    examples: [
      { en: "Please be quiet; the baby is sleeping.", fa: "لطفاً ساکت باشید؛ بچه خواب است." },
      { en: "Look! It's starting to rain.", fa: "ببین! دارد شروع به باران می‌کند." },
      { en: "I'm learning English these days.", fa: "این روزها انگلیسی یاد می‌گیرم." },
      { en: "They aren't working this week.", fa: "آن‌ها این هفته کار نمی‌کنند." },
      { en: "What are you doing tonight?", fa: "امشب چه کار می‌کنی؟" },
      { en: "She's sitting by the window and reading a novel.", fa: "کنار پنجره نشسته و رمان می‌خواند." },
    ],
    mistakes: [
      { wrong: "I am knowing the answer.", right: "I know the answer.", note: "افعال حالتی مثل know استمراری نمی‌شوند." },
      { wrong: "She is study English now.", right: "She is studying English now.", note: "بعد از is حتماً فعل با ing لازم است." },
      { wrong: "Look! It rains.", right: "Look! It's raining.", note: "چیزی که همین الان اتفاق می‌افتد استمراری است." },
    ],
    quiz: [
      { question: "«الان چی می‌خوری؟» کدام است؟", options: ["What do you eat now?", "What are you eating now?", "What you are eating?", "What eat you now?"], correctIndex: 1, explanation: "همین حالا → حال استمراری." },
      { question: "شکل ing فعل write چیست؟", options: ["writeing", "writting", "writing", "writtingg"], correctIndex: 2, explanation: "e حذف و ing اضافه می‌شود: writing." },
      { question: "کدام جمله درست است؟", options: ["I am wanting a coffee.", "I want a coffee.", "I wanting a coffee.", "I am want a coffee."], correctIndex: 1, explanation: "want فعل حالتی است و استمراری نمی‌شود." },
      { question: "«او این هفته نزد ما مهمان است» کدام است؟", options: ["She stays with us this week.", "She is staying with us this week.", "She stay with us this week.", "She does stay with us this week."], correctIndex: 1, explanation: "موقعیت موقت → حال استمراری." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-08",
    titleFa: "زمان گذشته ساده",
    titleEn: "Past Simple",
    cefr: "A2",
    intro:
      "برای تعریف کردن دیروز، هفته گذشته و خاطرات، گذشته ساده لازم است. با فعل‌های باقاعده و بی‌قاعده کار دارید.",
    rule:
      "گذشته ساده برای کارهای تمام‌شده در زمان مشخص گذشته به کار می‌رود: yesterday، last week، in 2010. فعل‌های باقاعده ed می‌گیرند: work → worked, play → played. اگر فعل به e ختم شود فقط d: live → lived. بی‌صدای + y تبدیل به ied می‌شود: study → studied. فعل‌های بی‌قاعده شکل خاص خود را دارند و باید حفظ شوند: go → went، see → saw، eat → ate، have → had، buy → bought. نکته طلایی: در منفی و سوالی، did همه کار گذشته را انجام می‌دهد و فعل به شکل ساده برمی‌گردد: I didn't go / Did you see? برای فعل to be که did نمی‌گیرد از was/were استفاده می‌شود: I was tired / Were you there?",
    form: [
      { label: "مثبت باقاعده", pattern: "فعل + ed → We watched a film." },
      { label: "مثبت بی‌قاعده", pattern: "go→went / see→saw / buy→bought" },
      { label: "منفی", pattern: "didn't + فعل ساده → I didn't see him." },
      { label: "سوالی", pattern: "Did + فاعل + فعل ساده؟ → Did you enjoy it?" },
      { label: "فعل to be", pattern: "was (I/he/she/it) / were (you/we/they)" },
    ],
    examples: [
      { en: "We watched an old film last night.", fa: "دیشب فیلم قدیمی دیدیم." },
      { en: "She went to the dentist on Monday.", fa: "دوشنبه به دندان‌پزشک رفت." },
      { en: "I didn't sleep well yesterday.", fa: "دیروز خوب نخوابیدم." },
      { en: "Did you call your mother this morning?", fa: "امروز صبح به مادرت زنگ زدی؟" },
      { en: "The children were at school until two.", fa: "بچه‌ها تا ساعت دو در مدرسه بودند." },
      { en: "He bought a new phone two weeks ago.", fa: "دو هفته پیش گوشی نو خرید." },
    ],
    mistakes: [
      { wrong: "Did you went to the party?", right: "Did you go to the party?", note: "بعد از did فعل به شکل ساده برمی‌گردد." },
      { wrong: "I didn't watched the news.", right: "I didn't watch the news.", note: "didn't خودش گذشته را نشان می‌دهد؛ فعل ساده می‌ماند." },
      { wrong: "She was bought a dress.", right: "She bought a dress.", note: "was فقط برای to be است نه بقیه افعال." },
    ],
    quiz: [
      { question: "گذشته فعل see چیست؟", options: ["seed", "sawed", "saw", "seen"], correctIndex: 2, explanation: "see بی‌قاعده است: saw." },
      { question: "«دیروز او را ندیدم» کدام است؟", options: ["I didn't saw him yesterday.", "I don't see him yesterday.", "I didn't see him yesterday.", "I wasn't see him yesterday."], correctIndex: 2, explanation: "didn't + شکل ساده فعل." },
      { question: "شکل سوالی «He went home early» چیست؟", options: ["Did he went home early?", "Did he go home early?", "Was he go home early?", "Went he home early?"], correctIndex: 1, explanation: "Did + فعل ساده + بقیه جمله." },
      { question: "کدام جمله درست است؟", options: ["They was at the party.", "They were at the party.", "They did be at the party.", "They been at the party."], correctIndex: 1, explanation: "they با were می‌آید." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-09",
    titleFa: "صفت تفضیلی و عالی",
    titleEn: "Comparatives and Superlatives",
    cefr: "A2",
    intro:
      "برای مقایسه دو چیز و گفتن «بهترین»، صفت‌های تفضیلی و عالی لازم است. ساختار آن‌ها به تعداد هجای صفت بستگی دارد.",
    rule:
      "برای صفت‌های یک‌هجایی er و est می‌گیرند: tall → taller → the tallest. صفت یک‌هجایی با صدای کوتاه آخرین حرف را تکرار می‌کند: big → bigger → the biggest. صفت‌های دو هجایی پایان‌دار با y: happy → happier → the happiest. صفت‌های بلند (سه هجایی یا بیشتر) با more و the most ساخته می‌شوند: more expensive، the most interesting. چهار بی‌قاعده مهم: good → better → the best؛ bad → worse → the worst؛ far → further → the furthest؛ little → less → the least. ساختار مقایسه: X is taller than Y. برای برابری: as + صفت + as: She is as tall as me. بعد از superlative همیشه the می‌آید و معمولاً in یا of: the best player in the team.",
    form: [
      { label: "یک‌هجایی", pattern: "tall → taller than → the tallest" },
      { label: "با تکرار حرف", pattern: "big → bigger → the biggest / hot → hotter" },
      { label: "پایان y", pattern: "happy → happier → the happiest" },
      { label: "بلند", pattern: "expensive → more expensive → the most expensive" },
      { label: "بی‌قاعده", pattern: "good → better → the best / bad → worse → the worst" },
    ],
    examples: [
      { en: "Tehran is bigger than Isfahan.", fa: "تهران از اصفهان بزرگ‌تر است." },
      { en: "This is the best kebab in town.", fa: "این بهترین کباب شهر است." },
      { en: "My bag is heavier than yours.", fa: "کیف من از تو سنگین‌تر است." },
      { en: "Today is worse than yesterday.", fa: "امروز از دیروز بدتر است." },
      { en: "She is the most careful driver I know.", fa: "او دقیق‌ترین راننده‌ای است که می‌شناسم." },
      { en: "Winter is not as warm as spring.", fa: "زمستان به‌اندازه بهار گرم نیست." },
    ],
    mistakes: [
      { wrong: "She is more taller than me.", right: "She is taller than me.", note: "برای صفت کوتاه یا er یا more؛ هر دو با هم نه." },
      { wrong: "It was the most bad day.", right: "It was the worst day.", note: "bad بی‌قاعده است: worst." },
      { wrong: "He is the tallest of the two.", right: "He is the taller of the two.", note: "بین دو چیز تفضیلی می‌آید، نه عالی." },
    ],
    quiz: [
      { question: "صفت عالی good چیست؟", options: ["the goodest", "the most good", "the best", "the better"], correctIndex: 2, explanation: "good → better → the best." },
      { question: "«این هتل از آن یکی گران‌تر است» کدام است؟", options: ["This hotel is expensiver than that one.", "This hotel is more expensive than that one.", "This hotel is most expensive than that one.", "This hotel is the expensiveest."], correctIndex: 1, explanation: "expensive سه‌هجایی است: more expensive." },
      { question: "کدام جمله درست است؟", options: ["Everest is the higher mountain in the world.", "Everest is the highest mountain in the world.", "Everest is more high than all mountains.", "Everest is highest mountain."], correctIndex: 1, explanation: "high یک‌هجایی است: the highest + the." },
      { question: "برای برابری چه ساختاری داریم؟ «او به‌اندازه من بلند است»", options: ["She is taller than me.", "She is as tall as me.", "She is the tallest.", "She is more tall as me."], correctIndex: 1, explanation: "برابری با as + صفت + as." },
    ],
  },
  {
    kind: "grammar",
    slug: "grammar-beginner-10",
    titleFa: "آینده: going to و will",
    titleEn: "Future: going to & will",
    cefr: "A2",
    intro:
      "انگلیسی برای آینده دو ابزار اصلی دارد: going to برای برنامه‌ها و پیش‌بینی‌های منطقی، will برای تصمیم لحظه‌ای و پیش‌بینی کلی.",
    rule:
      "going to ساختار be + going to + فعل ساده است و برای برنامه‌های از پیش تعیین‌شده (I'm going to visit Shiraz next month) و پیش‌بینی‌های مبتنی بر شواهد فعلی (Look at those clouds — it's going to rain) به کار می‌رود. will ساختار ساده‌ای دارد: فاعل + will + فعل ساده؛ برای تصمیم‌های لحظه‌ای (I'll help you!)، پیشنهاد، قول و پیش‌بینی کلی بدون شاهد (I think she will win). منفی won't است: I won't forget. در جملات زمانی (when، after) به جای will از حال ساده استفاده می‌شود: I'll call you when I arrive نه when I will arrive. هر دو ساختار در مکالمه به شکل فشرده آمده‌اند: gonna و I'll.",
    form: [
      { label: "going to مثبت", pattern: "am/is/are going to + فعل → We're going to move." },
      { label: "going to منفی", pattern: "am/is/are not going to → He isn't going to come." },
      { label: "will مثبت", pattern: "will + فعل ساده → She will call you." },
      { label: "will منفی/کوتاه", pattern: "won't + فعل → I won't be late. / I'll, we'll, she'll" },
      { label: "جمله زمانی", pattern: "I'll call you when I arrive. (بدون will بعد از when)" },
    ],
    examples: [
      { en: "I'm going to start a new job next month.", fa: "ماه بعد می‌خواهم سر کار جدید بروم." },
      { en: "Look at the sky; it's going to snow.", fa: "به آسمان نگاه کن؛ دارد برف می‌آید." },
      { en: "Don't worry, I'll help you with the boxes.", fa: "نگران نباش، با جعبه‌ها کمکت می‌کنم." },
      { en: "They aren't going to sell their house.", fa: "آن‌ها خانه‌شان را نمی‌خواهند بفروشند." },
      { en: "I think our team will win the cup.", fa: "فکر می‌کنم تیم ما جام را می‌برد." },
      { en: "She won't like this surprise, I'm sure.", fa: "مطمئنم این سورپرایز را دوست نخواهد داشت." },
    ],
    mistakes: [
      { wrong: "I will call you when I will arrive.", right: "I'll call you when I arrive.", note: "بعد از when در جمله زمانی، will حذف می‌شود." },
      { wrong: "She is going to travels next week.", right: "She is going to travel next week.", note: "بعد از going to فعل همیشه ساده است." },
      { wrong: "I will to help you tomorrow.", right: "I will help you tomorrow.", note: "بعد از will هیچ to نمی‌آید." },
    ],
    quiz: [
      { question: "«به ابرها نگاه کن، بارون می‌آید» کدام است؟", options: ["Look at the clouds; it will rain.", "Look at the clouds; it's going to rain.", "Look at the clouds; it rains.", "Look at the clouds; it is raining rain."], correctIndex: 1, explanation: "پیش‌بینی با شاهد فعلی → going to." },
      { question: "تصمیم لحظه‌ای کمک کردن: «جعبه‌ها رو برات می‌برم» کدام است؟", options: ["I'm going to carry them for you.", "I carry them for you.", "I'll carry them for you.", "I would carry them."], correctIndex: 2, explanation: "تصمیم همین لحظه → will." },
      { question: "کدام جمله درست است؟", options: ["He won't to come tonight.", "He doesn't will come tonight.", "He won't come tonight.", "He not will come tonight."], correctIndex: 2, explanation: "won't + فعل ساده بدون to." },
      { question: "جمله «وقتی رسیدم بهت زنگ می‌زنم» کدام است؟", options: ["I'll call you when I will arrive.", "I'll call you when I arrive.", "I call you when I will arrive.", "I'm calling you when I arrive."], correctIndex: 1, explanation: "بعد از when حال ساده می‌آید نه will." },
    ],
  },
];
