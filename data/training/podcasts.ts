import type { PodcastEpisode } from "@/types/training";

// ========================================
// پادکست‌های تمرین شنیداری (نسخه ۱.۰.۱.۴)
// دو مجری Tom و Lena — سبک 6 Minute English
// بدون فایل صوتی — پخش با تلفظ مرورگر (speechSynthesis)
// جاهای خالی با {n} مشخص شده و هنگام پخش با جواب تلفظ می‌شود
// ========================================

const POD_1: PodcastEpisode = {
  id: "pod-1",
  source: "podcast",
  title: "Social Media: Friend or Enemy?",
  titleFa: "شبکه‌های اجتماعی: دوست یا دشمن؟",
  description:
    "در این قسمت درباره شبکه‌های اجتماعی، اثرات آن بر زندگی ما و راه‌های استفاده هوشمندانه از آن صحبت می‌کنیم.",
  audioUrl: null,
  level: "BEGINNER",
  duration: 360,
  xp: 30,
  order: 2,
  topic: "زندگی روزمره",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about social media. Tom, how much time do you spend on your phone every day?
Tom: Honestly, too much! I think it's around three hours. I check my messages first thing in the {1}.
Lena: Three hours! That's a lot. Studies say the average person spends about two and a half hours on social media every day.
Tom: Wow. And what do people actually do in that time?
Lena: Mostly they watch short videos, look at photos, and read the {2}. You know, the latest stories from friends and family.
Tom: I see. But is all this time bad for us?
Lena: Not always. Social media helps us stay in {3} with people we love, even if they live in another country.
Tom: That's true. My cousin lives in Canada, and I talk to her every week online.
Lena: Exactly! But there is another side. Some people feel sad or {4} when they compare their life with others online.
Tom: Ah yes, the comparison problem. Everyone posts their best moments — perfect holidays, perfect food, perfect smiles.
Lena: Right. But real life is not perfect. Nobody posts a photo of a boring Monday {5}.
Tom: Very true! So how can we use social media in a healthier way?
Lena: Experts say we should set a time {6}. For example, no more than one hour per day.
Tom: That sounds smart. Some phones now show you a weekly {7} of your screen time.
Lena: Yes! And it can really surprise you. Another idea is to turn off {8}, so your phone doesn't buzz every two minutes.
Tom: I did that last month. Now I check the apps only when I really want to.
Lena: Another good habit is to stop using your phone one hour before {9}. It helps your brain relax and sleep better.
Tom: That's great advice. Here's a question for our listeners: how many social media apps does the average teenager have? Is it three, five, or seven?
Lena: Hmm, I'll guess five.
Tom: We'll give you the answer at the end. Remember, social media is a {10} — use it, but don't let it use you!
Lena: Beautifully said, Tom. Time for the answer: the average teenager has about five apps. Lena was right!
Tom: That's all for today. See you next time. Bye!
Lena: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "morning", hint: "اولین ساعت روز" },
    { id: 2, answer: "news", hint: "اخبار و داستان‌های تازه" },
    { id: 3, answer: "touch", hint: "در ارتباط بودن — stay in ..." },
    { id: 4, answer: "anxious", hint: "نگران و بی‌قرار" },
    { id: 5, answer: "morning", hint: "یک صبح خسته‌کننده" },
    { id: 6, answer: "limit", hint: "سقف و محدوده" },
    { id: 7, answer: "report", hint: "گزارش هفتگی" },
    { id: 8, answer: "notifications", hint: "اعلان‌های گوشی" },
    { id: 9, answer: "bed", hint: "قبل از خواب" },
    { id: 10, answer: "tool", hint: "ابزار" },
  ],
};

const POD_2: PodcastEpisode = {
  id: "pod-2",
  source: "podcast",
  title: "Eating Well: A Guide to Healthy Food",
  titleFa: "تغذیه سالم: راهنمای غذای سالم",
  description:
    "در این قسمت درباره غذای سالم، صبحانه، میوه و سبزیجات و راه‌های دور شدن از فست‌فود صحبت می‌کنیم.",
  audioUrl: null,
  level: "BEGINNER",
  duration: 340,
  xp: 30,
  order: 3,
  topic: "سلامتی",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about healthy eating. Tom, what did you have for {1} this morning?
Tom: Just a coffee and a biscuit. I'm always in a hurry.
Lena: Oh no! Breakfast is the most important meal of the day. Your body needs energy after a long night.
Tom: Really? I always thought skipping breakfast helps me stay thin.
Lena: Actually, it's the opposite. When you skip breakfast, you get very hungry later and eat more {2} between meals.
Tom: Like chips and chocolate?
Lena: Exactly! Those are full of {3}. Too much sugar is bad for your health and your teeth.
Tom: So what should we eat instead?
Lena: Try to eat five portions of {4} every day. Fresh fruit and vegetables give you vitamins and keep you strong.
Tom: Five portions! That sounds like a lot.
Lena: It's easier than you think. One apple, some salad, a carrot — they all count. And drink lots of {5} too.
Tom: How much water should I drink?
Lena: About six to eight glasses a day. Water helps your body work well and gives you fresh {6}.
Tom: What about fast food? I love burgers and pizza.
Lena: You can have them sometimes, but not every day. Fast food is called {7} food because it has too much fat and salt.
Tom: Okay, so no fast food every day. What about cooking at home?
Lena: Cooking at home is the best way. When you cook yourself, you know exactly what is in your food. Try to buy {8} food from the market, not ready meals.
Tom: Fresh food from the market — got it. Here's a question for our listeners: how many portions of fruit and vegetables should we eat every day? Is it three, five, or seven?
Lena: Well, we just said it! It's five.
Tom: We'll give you the answer at the end. A healthy plate should be {9} — that means it has a good mix of everything.
Lena: Right! Not only meat, not only bread — a little of everything, with lots of colors on your plate. And for something sweet, choose a piece of {10} instead of chocolate.
Tom: And now the answer to our question: it's five portions a day!
Lena: Well done if you got it right. That's all for today. See you next time. Bye!
Tom: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "breakfast", hint: "اولین وعده روز" },
    { id: 2, answer: "snacks", hint: "خوراکی بین وعده‌ها" },
    { id: 3, answer: "sugar", hint: "شکر" },
    { id: 4, answer: "vegetables", hint: "سبزیجات — یا میوه" },
    { id: 5, answer: "water", hint: "آب" },
    { id: 6, answer: "energy", hint: "انرژی" },
    { id: 7, answer: "junk", hint: "غذای ... = غذای بی‌ارزش و چرب" },
    { id: 8, answer: "fresh", hint: "تازه" },
    { id: 9, answer: "balanced", hint: "متعادل" },
    { id: 10, answer: "fruit", hint: "میوه" },
  ],
};

const POD_3: PodcastEpisode = {
  id: "pod-3",
  source: "podcast",
  title: "Online Shopping: Easy but Be Careful",
  titleFa: "خرید اینترنتی: راحت اما مراقب باش",
  description:
    "در این قسمت درباره خرید اینترنتی، مقایسه قیمت‌ها، خواندن نظرات و نکات امنیتی خرید صحبت می‌کنیم.",
  audioUrl: null,
  level: "BEGINNER",
  duration: 320,
  xp: 30,
  order: 4,
  topic: "خرید",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about shopping {1} — buying things from websites and apps.
Tom: Oh, I love that! Last week I bought new shoes without leaving my sofa.
Lena: That's the magic of it. You can shop at any time, and the {2} brings the box to your door.
Tom: But sometimes it takes a long time. And once my package was lost!
Lena: That happens. That's why you should always check the {3} before you buy. Maybe another website sells the same thing for less money.
Tom: Good idea. What else should we check?
Lena: Always read the {4} from other customers. If a product has many bad reviews, don't buy it.
Tom: My sister does that for everything. She reads reviews for an hour before buying a pen!
Lena: Ha! That's maybe too much. But it's also important to check the {5} policy. Can you send the product back if you don't like it?
Tom: Why is that so important?
Lena: Because you can't touch or try the product online. If the shoes don't fit, you need to return them easily.
Tom: I see. And how can we pay less?
Lena: Wait for a {6}! Websites often have special days when everything is cheaper. Put the product in your {7} and wait.
Tom: The cart — that's the list of things you want to buy, right?
Lena: Exactly. One more important thing: shop only on {8} websites. Look for the little lock symbol next to the address.
Tom: Why is that so important?
Lena: Because some websites are {9} — they take your money but never send anything. Be careful with very cheap prices.
Tom: Here's a question for our listeners: what is the name of the symbol that shows a website is safe? Is it a star, a lock, or a heart?
Lena: Hmm, I think it's a lock.
Tom: We'll give you the answer at the end. If you follow these tips, online shopping is safe and fun — happy {10}!
Lena: And the answer is: a little lock! Well done if you knew it.
Tom: That's all for today. See you next time. Bye!
Lena: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "online", hint: "اینترنتی" },
    { id: 2, answer: "delivery", hint: "پیک و تحویل کالا" },
    { id: 3, answer: "price", hint: "قیمت" },
    { id: 4, answer: "reviews", hint: "نظرات خریداران" },
    { id: 5, answer: "return", hint: "بازگرداندن کالا" },
    { id: 6, answer: "discount", hint: "تخفیف" },
    { id: 7, answer: "cart", hint: "سبد خرید" },
    { id: 8, answer: "safe", hint: "امن" },
    { id: 9, answer: "fake", hint: "جعلی" },
    { id: 10, answer: "shopping", hint: "خرید کردن" },
  ],
};

const POD_4: PodcastEpisode = {
  id: "pod-4",
  source: "podcast",
  title: "How to Learn a New Language",
  titleFa: "چگونه یک زبان جدید یاد بگیریم",
  description:
    "در این قسمت درباره بهترین روش‌های یادگیری زبان، اشتباه کردن، تماشای فیلم با زیرنویس و ساختن عادت روزانه صحبت می‌کنیم.",
  audioUrl: null,
  level: "INTERMEDIATE",
  duration: 380,
  xp: 40,
  order: 5,
  topic: "آموزش",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about learning languages. Tom, you speak three languages — what's your secret?
Tom: Honestly? There is no secret. The most important thing is regular {1} — a little bit every single day.
Lena: I agree. Many people study for five hours on Sunday and then do nothing all week. That doesn't work.
Tom: Right. Twenty minutes a day is much better than five hours once a week.
Lena: And don't be afraid of making {2}! Errors are a natural part of learning.
Tom: That's so true. When I started Spanish, I said so many silly things. But people still understood me, and I learned faster.
Lena: Exactly. Also, work on your {3} early. Listen and repeat the sounds. It's harder to fix bad pronunciation later.
Tom: What do you think about {4} — surrounding yourself with the language completely?
Lena: It's powerful, but you don't need to move to another country. You can create it at home.
Tom: How?
Lena: Change your phone language, listen to podcasts, watch shows with {5} — I mean the text at the bottom of the screen.
Tom: Subtitles! They help you connect the sound with the spelling. And what about learning {6}? New words, I mean.
Lena: Little and often. Learn five new words a day and use them in sentences. A notebook or a flashcard app really helps.
Tom: Some learners want to become {7} in three months. Is that possible?
Lena: Not really. Real fluency takes time. What matters is {8} — believing that you can do it, even when it's hard.
Tom: Good point. I remember feeling shy about speaking English. Then I stopped worrying about being perfect.
Lena: And that's when you improved fast! Building a daily {9} is the real key — same time, same place, every day.
Tom: Here's a question for our listeners: how long does research say it takes to build a strong daily language habit? Is it 21 days, 66 days, or 100 days?
Lena: Hmm, I'll say 66 days.
Tom: We'll give you the answer at the end. Be {10} with yourself — learning a language is a marathon, not a race.
Lena: Lovely advice. And the answer is: about 66 days! Well done if you got it right.
Tom: That's all for today. See you next time. Bye!
Lena: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "practice", hint: "تمرین منظم" },
    { id: 2, answer: "mistakes", hint: "اشتباهات" },
    { id: 3, answer: "pronunciation", hint: "تلفظ" },
    { id: 4, answer: "immersion", hint: "غوطه‌وری در زبان" },
    { id: 5, answer: "subtitles", hint: "زیرنویس" },
    { id: 6, answer: "vocabulary", hint: "دامنه واژگان" },
    { id: 7, answer: "fluent", hint: "روان و مسلط" },
    { id: 8, answer: "confidence", hint: "اعتماد به نفس" },
    { id: 9, answer: "habit", hint: "عادت روزانه" },
    { id: 10, answer: "patient", hint: "صبور" },
  ],
};

const POD_5: PodcastEpisode = {
  id: "pod-5",
  source: "podcast",
  title: "Our Changing Climate",
  titleFa: "اقلیم در حال تغییر ما",
  description:
    "در این قسمت درباره تغییرات اقلیمی، انتشار کربن، انرژی‌های تجدیدپذیر و کارهایی که هر فرد می‌تواند انجام دهد صحبت می‌کنیم.",
  audioUrl: null,
  level: "INTERMEDIATE",
  duration: 400,
  xp: 40,
  order: 6,
  topic: "محیط زیست",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today's topic is serious: climate change. Tom, what does "global {1}" actually mean?
Tom: It means the average temperature of the planet is rising. Since the industrial revolution, Earth has become about one degree hotter.
Lena: One degree sounds small. Why is it a problem?
Tom: Because the planet is a huge system. Even one degree changes the weather everywhere — stronger storms, longer {2}... I mean long periods without rain.
Lena: And when heavy rain does come, it often causes serious {3} in cities that are not ready for it.
Tom: Plus melting ice at the poles makes the sea level rise. So what is causing all this?
Lena: Mainly greenhouse gases — especially carbon {4} from burning coal, oil and gas.
Tom: Cars, factories, power stations... So what's the solution?
Lena: One big answer is {5} energy — power from the sun, wind and water. These sources never run out.
Tom: Right. More and more countries are building solar farms and wind farms.
Lena: But it's not only governments. People can help too — for example, {6} means using things again instead of throwing them away.
Tom: Like separating paper, plastic and glass at home?
Lena: Exactly. Also saving {7} at home — turning off lights, using less heating and cooling.
Tom: Some people plant trees or eat less meat to lower their {8} footprint — that's the total gases each person is responsible for.
Lena: Every small action counts when millions of people do it together.
Tom: Is the situation {9}? I mean — do we need to act right now?
Lena: Scientists say yes. Every year of delay makes the problem harder and more expensive to fix.
Tom: Here's a question for our listeners: which country produces the most carbon dioxide today? Is it China, the United States, or India?
Lena: Hmm, that's tricky. I'll say China.
Tom: We'll give you the answer at the end. The {10} of our planet depends on the choices we make today.
Lena: Beautifully said. And the answer is: China — it produces more than a quarter of the world's CO2.
Tom: That's all for today. See you next time. Bye!
Lena: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "warming", hint: "گرم شدن کره زمین" },
    { id: 2, answer: "droughts", hint: "خشکسالی‌ها" },
    { id: 3, answer: "floods", hint: "سیل‌ها" },
    { id: 4, answer: "dioxide", hint: "کربن ... = CO₂" },
    { id: 5, answer: "renewable", hint: "تجدیدپذیر" },
    { id: 6, answer: "recycling", hint: "بازیافت" },
    { id: 7, answer: "energy", hint: "انرژی" },
    { id: 8, answer: "carbon", hint: "ردپای کربن" },
    { id: 9, answer: "urgent", hint: "فوری و ضروری" },
    { id: 10, answer: "future", hint: "آینده" },
  ],
};

const POD_6: PodcastEpisode = {
  id: "pod-6",
  source: "podcast",
  title: "Life in a Big City",
  titleFa: "زندگی در کلان‌شهر",
  description:
    "در این قسمت درباره زندگی شهری، ترافیک، مترو، هزینه اجاره و مزایا و معایب زندگی در شهر بزرگ صحبت می‌کنیم.",
  audioUrl: null,
  level: "BEGINNER",
  duration: 330,
  xp: 30,
  order: 7,
  topic: "زندگی شهری",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about city life. Tom, you live in a big city, right?
Tom: Yes, and it's always busy! The streets are {1} — full of people, morning and night.
Lena: That's one thing people love and hate about big cities. There is always something happening.
Tom: True. But the {2} is terrible. I sit in my car for an hour every morning.
Lena: That's why I take the {3}. The underground train is fast, cheap, and you never get stuck.
Tom: You're right. And there are buses and bikes too. What about the noise? My street never sleeps!
Lena: Yes, the {4} can be a problem — cars, people, construction. I use soft earplugs at night.
Tom: Good idea. But cities have good things too, right?
Lena: Absolutely! Beautiful {5} where you can walk, sit on the grass, and forget the buildings for a while.
Tom: I love the park near my house. And there are cinemas, restaurants, museums...
Lena: ...concerts, sports, universities — a big city is full of {6}... I mean full of chances for work and study.
Tom: Opportunities — yes. But is city life expensive?
Lena: It can be. The {7} for a small flat in the city center is often very high.
Tom: Tell me about it! Half my salary goes to my apartment.
Lena: Many people live outside the center and travel in. It's cheaper and often quieter.
Tom: What about people? Some say city people are not friendly.
Lena: That's not really true. Your {8} — the people living next to you — can become good friends.
Tom: Mine helped me carry my shopping last week! One more problem: the air.
Lena: Yes, air {9} from cars and factories is a real issue in many cities. Some cities now close their centers to cars.
Tom: Good change. Here's a question for our listeners: what is the biggest city in the world today? Is it Tokyo, Delhi, or Shanghai?
Lena: Hmm... I'll say Tokyo.
Tom: We'll give you the answer at the end. A city should also be {10} at night — with good lights and police, so people feel secure.
Lena: And the answer is: Delhi! It passed Tokyo a few years ago. Well done if you got it.
Tom: That's all for today. See you next time. Bye!
Lena: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "crowded", hint: "شلوغ" },
    { id: 2, answer: "traffic", hint: "ترافیک" },
    { id: 3, answer: "metro", hint: "قطار شهری زیرزمینی" },
    { id: 4, answer: "noise", hint: "سر و صدا" },
    { id: 5, answer: "parks", hint: "پارک‌ها" },
    { id: 6, answer: "opportunities", hint: "فرصت‌ها" },
    { id: 7, answer: "rent", hint: "اجاره" },
    { id: 8, answer: "neighbors", hint: "همسایه‌ها" },
    { id: 9, answer: "pollution", hint: "آلودگی" },
    { id: 10, answer: "safe", hint: "امن" },
  ],
};

const POD_7: PodcastEpisode = {
  id: "pod-7",
  source: "podcast",
  title: "Finding Work-Life Balance",
  titleFa: "یافتن تعادل بین کار و زندگی",
  description:
    "در این قسمت درباره کار زیاد، استرس، فرسودگی شغلی و راه‌های واقعی برای تعادل بین کار و زندگی شخصی صحبت می‌کنیم.",
  audioUrl: null,
  level: "INTERMEDIATE",
  duration: 390,
  xp: 40,
  order: 8,
  topic: "کار و زندگی",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about work-life balance. Tom, how many hours did you work last week?
Tom: Honestly? Around sixty. I did {1} almost every evening — extra hours after my normal work day.
Lena: Sixty hours! That's a lot. Research says long hours don't always mean better work.
Tom: Really? I always feel behind. If I don't stay late, the work doesn't finish.
Lena: That feeling is common, but constant overworking creates {2} — pressure that never stops, in your body and your mind.
Tom: I know that feeling. Last month I couldn't sleep because I was thinking about emails.
Lena: And if it continues, it can become {3} — complete exhaustion, when you lose all your energy and motivation.
Tom: Burnout... A friend of mine needed months to recover from that.
Lena: So how can we protect ourselves? First, set clear {4}. When work ends, it ends. No emails at the dinner table.
Tom: Easier said than done. My boss sends messages at ten at night!
Lena: Then agree on rules. And second: make time for {5} — things you do just because you enjoy them.
Tom: Like sport or music?
Lena: Exactly. Third, plan your day. A simple {6} with time for work, rest, and family helps more than working without a plan.
Tom: I like planning. But at work, everyone keeps interrupting me!
Lena: Take real {7} — five or ten minutes away from the screen. Your brain needs them to stay sharp.
Tom: Has {8} work — working from home — made balance easier?
Lena: For many people, yes. No commute means more free time. But for some, home becomes the office, and they never stop.
Tom: That's me. My laptop is always one meter away!
Lena: Then learn to say no sometimes, and choose your {9} — decide what is really important and let go of the rest.
Tom: Priorities. And at the end of a hard week?
Lena: Take a full day to {10} — to fill your energy again. Sleep, walk, meet friends. You come back stronger.
Tom: Here's a question for our listeners: in which country do people work the longest hours on average? Is it Mexico, South Korea, or the United States?
Lena: I'll guess South Korea.
Tom: We'll give you the answer at the end... And it was Mexico! Well done if you got it.
Lena: Remember: work to live, don't live to work. That's all for today. Bye!
Tom: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "overtime", hint: "اضافه‌کاری" },
    { id: 2, answer: "stress", hint: "استرس و فشار" },
    { id: 3, answer: "burnout", hint: "فرسودگی شغلی" },
    { id: 4, answer: "boundaries", hint: "مرزها و حدود" },
    { id: 5, answer: "hobbies", hint: "سرگرمی‌ها" },
    { id: 6, answer: "schedule", hint: "برنامه زمانی" },
    { id: 7, answer: "breaks", hint: "وقفه‌های کوتاه" },
    { id: 8, answer: "remote", hint: "از راه دور / دورکاری" },
    { id: 9, answer: "priorities", hint: "اولویت‌ها" },
    { id: 10, answer: "recharge", hint: "شارژ مجدد انرژی" },
  ],
};

const POD_8: PodcastEpisode = {
  id: "pod-8",
  source: "podcast",
  title: "Artificial Intelligence: Promise and Peril",
  titleFa: "هوش مصنوعی: وعده و خطر",
  description:
    "در این قسمت درباره هوش مصنوعی، الگوریتم‌ها، اتوماسیون، سوگیری، حریم خصوصی و آینده شغل‌ها عمیق‌تر صحبت می‌کنیم.",
  audioUrl: null,
  level: "ADVANCED",
  duration: 420,
  xp: 50,
  order: 9,
  topic: "فناوری",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today's topic is artificial intelligence. Tom, let's start simple — what actually makes a machine "intelligent"?
Tom: Modern AI systems learn from examples. Their {1} — the step-by-step rules inside the software — find patterns in enormous amounts of {2}.
Lena: So instead of a programmer writing every rule, the system discovers the rules itself?
Tom: Precisely. Show it a million cat photos, and it learns to recognize cats. The results are often {3} — surprisingly good.
Lena: It certainly feels like magic. But I've read that these systems can contain {4} — unfair assumptions hidden in the training material.
Tom: That's one of the biggest concerns. If historical data was unfair, the AI learns that unfairness and repeats it.
Lena: And what about jobs? Everyone talks about {5} — machines doing repetitive work without humans.
Tom: It's already happening in warehouses, factories, and even some offices. Some jobs disappear, but new ones appear too.
Lena: Like prompt engineers and AI trainers — jobs that didn't exist five years ago.
Tom: Exactly. But there are serious questions around {6} too. These systems collect huge amounts of personal information.
Lena: Which is why governments are starting to {7} — to control AI by law, like the new European rules.
Tom: It's a race between technology and legislation. Meanwhile, people worry that machines will {8} human creativity.
Lena: Replace or support? Current tools are excellent assistants, but they still struggle with truly original ideas.
Tom: Agreed. A language {9} predicts likely words — it doesn't "understand" the world like we do.
Lena: So the realistic question isn't "will AI take over?" but "who uses it, and how?"
Tom: Well said. Which brings us to responsibility. Developers and companies must be {10} — I mean careful and answerable — about what they build.
Lena: Here's a question for our listeners: in what year did a computer first beat the world chess champion? Was it 1997, 2007, or 2017?
Tom: Hmm... I'll say 1997.
Lena: We'll reveal the answer at the end. AI is a tool — powerful, imperfect, and ours to shape.
Tom: And the answer is: 1997, when Deep Blue defeated Garry Kasparov. Well done if you knew that!
Lena: That's all for today. See you next time. Bye!
Tom: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "algorithms", hint: "الگوریتم‌ها" },
    { id: 2, answer: "data", hint: "داده‌ها" },
    { id: 3, answer: "remarkable", hint: "چشمگیر و شگفت‌انگیز" },
    { id: 4, answer: "bias", hint: "سوگیری" },
    { id: 5, answer: "automation", hint: "اتوماسیون و خودکارسازی" },
    { id: 6, answer: "privacy", hint: "حریم خصوصی" },
    { id: 7, answer: "regulate", hint: "تنظیم‌گری و قانون‌گذاری" },
    { id: 8, answer: "replace", hint: "جایگزین کردن" },
    { id: 9, answer: "model", hint: "مدل زبانی" },
    { id: 10, answer: "responsible", hint: "مسئول" },
  ],
};

const POD_9: PodcastEpisode = {
  id: "pod-9",
  source: "podcast",
  title: "Smart Travel: Tips from the Pros",
  titleFa: "سفر هوشمند: نکاتی از حرفه‌ای‌ها",
  description:
    "در این قسمت درباره برنامه‌ریزی سفر، مدارک، بیمه، بودجه، ارتباط با مردم محلی و جای دیدنی‌ها صحبت می‌کنیم.",
  audioUrl: null,
  level: "INTERMEDIATE",
  duration: 360,
  xp: 40,
  order: 10,
  topic: "سفر",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're talking about travel. Tom, you visited five countries last year — what's your golden rule?
Tom: Check your documents first! Your {1} must be valid — I mean, not expired — for at least six months.
Lena: So true. Nothing ruins a trip like an airport problem. And pack light!
Tom: Yes! Half of my {2} — my bags and suitcases — usually comes home unused.
Lena: Rule number two: decide on a {3} before the trip. How much can you spend per day? Write it down and follow it.
Tom: I keep a note on my phone. Accommodation, food, tickets — everything has a limit.
Lena: Speaking of which — never travel without {4}. If you get sick or miss a flight, it saves you thousands.
Tom: Learned that the hard way in Greece. My bus broke down and I missed my ferry!
Lena: Oh no. Where do you usually stay? Hotels?
Tom: Not always. {5} — a place to stay, like a hotel, hostel, or apartment — is often cheaper if you book early.
Lena: And the location matters more than luxury. Near a station saves you both money and time.
Tom: What about language? My Italian is terrible.
Lena: Learn hello, please, and thank you. Then talk to the {6} — the people who live there. They know the best food, and the prices!
Tom: Locals sent me to a tiny restaurant in Rome once. Still the best pasta of my life.
Lena: Another tip: change your money carefully. Compare the {7} exchange rate — how much foreign money you get for yours.
Tom: Airports are the worst place to change money. A card is usually better.
Lena: Also keep your plans {8}. Sometimes the best day of a trip is the one you didn't plan.
Tom: My favorite afternoon in Istanbul was completely unplanned. I just walked around the old {9} — the famous historical buildings like Hagia Sophia.
Lena: One last thing: don't spend all your money on a {10} — a small thing you buy to remember the trip. Photos are free!
Tom: Ha! True. Here's a question: what is the most visited country in the world? Is it France, Spain, or the United States?
Lena: I'll say France.
Tom: We'll give you the answer at the end... It was France! Well done.
Lena: That's all for today. See you next time. Bye!
Tom: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "passport", hint: "گذرنامه" },
    { id: 2, answer: "luggage", hint: "چمدان و بار" },
    { id: 3, answer: "budget", hint: "بودجه" },
    { id: 4, answer: "insurance", hint: "بیمه" },
    { id: 5, answer: "Accommodation", hint: "اقامتگاه" },
    { id: 6, answer: "locals", hint: "مردم محلی" },
    { id: 7, answer: "currency", hint: "ارز — نرخ تبدیل" },
    { id: 8, answer: "flexible", hint: "منعطف" },
    { id: 9, answer: "landmarks", hint: "بناهای شاخص تاریخی" },
    { id: 10, answer: "souvenir", hint: "یادگاری سفر" },
  ],
};

const POD_10: PodcastEpisode = {
  id: "pod-10",
  source: "podcast",
  title: "The Art of Saving Money",
  titleFa: "هنر پس‌انداز پول",
  description:
    "در این قسمت درباره بودجه‌بندی، هزینه‌ها، بدهی، خرید هیجانی، سرمایه‌گذاری و عادت‌های مالی هوشمندانه صحبت می‌کنیم.",
  audioUrl: null,
  level: "ADVANCED",
  duration: 410,
  xp: 50,
  order: 11,
  topic: "مالی",
  transcript: `Tom: Hello and welcome to Practice English! I'm Tom.
Lena: And I'm Lena. Today we're discussing personal finance — how to keep more of your money. Tom, where should we start?
Tom: With a {1} — a simple plan that shows how much money comes in and how much goes out every month.
Lena: Most people have never done that. They just spend and hope.
Tom: Exactly. Once you write down your {2} — all the things you pay for — you discover surprising things.
Lena: Like small subscriptions that add up to a serious amount every year.
Tom: And debt is the real danger. {3} — money you owe — grows faster than most people expect.
Lena: Especially credit card debt. The monthly {4}... I mean the extra money you pay for borrowing, can be enormous.
Tom: That's called interest. Which brings us to rule one: pay off expensive debt before anything else.
Lena: And rule two: pay yourself first. Move money into your {5} — your saved money — the day your salary arrives.
Tom: Before you spend anything?
Lena: Before you spend anything. Even a small amount, every single month, becomes big over years.
Tom: My weakness is {6} buying — suddenly purchasing things I never planned, just because they're in front of me.
Lena: The classic trick: wait seven days. If you still want it next week, buy it. Usually you won't.
Tom: What should we do with the money we save? Keep it under the mattress?
Lena: You can {7} it — put it into something that can grow, like index funds. Over decades, the growth is powerful.
Tom: But it carries risk. Prices go down as well as up.
Lena: True, which is why long-term thinking matters. And why you should never {8}... I mean never count on, a single company or a single country.
Tom: Diversification — don't put all your eggs in one basket.
Lena: Exactly. And start thinking about {9} early — the period of life after you stop working. It arrives faster than you think.
Tom: What's the final tip for our listeners?
Lena: {10} everything — record every expense for one month. The numbers will teach you more than any book.
Tom: Here's a question: what do experts call the emergency fund advice — how many months of expenses should you save? Is it three to six, one to two, or twelve?
Lena: I'd say three to six.
Tom: We'll give you the answer at the end... It was three to six months! Well done.
Lena: That's all for today. See you next time. Bye!
Tom: Goodbye everyone! Keep practicing your English.`,
  gaps: [
    { id: 1, answer: "budget", hint: "بودجه" },
    { id: 2, answer: "expenses", hint: "هزینه‌ها" },
    { id: 3, answer: "Debt", hint: "بدهی" },
    { id: 4, answer: "interest", hint: "سود و بهره" },
    { id: 5, answer: "savings", hint: "پس‌انداز" },
    { id: 6, answer: "impulse", hint: "خرید ... = هیجانی" },
    { id: 7, answer: "invest", hint: "سرمایه‌گذاری کردن" },
    { id: 8, answer: "rely", hint: "تکیه کردن — rely on" },
    { id: 9, answer: "retirement", hint: "بازنشستگی" },
    { id: 10, answer: "Track", hint: "ثبت و دنبال کردن" },
  ],
};

// همه پادکست‌ها به ترتیب پخش
export const PODCASTS: PodcastEpisode[] = [
  POD_1,
  POD_2,
  POD_3,
  POD_4,
  POD_5,
  POD_6,
  POD_7,
  POD_8,
  POD_9,
  POD_10,
];
