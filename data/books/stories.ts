// ========================================
// متن داستان کتاب‌های کتابخانه (نسخه ۱.۰.۲.۹ — گام ۲)
// به‌جای باز شدن PDF، صفحه مطالعه برگه‌ای این متن‌ها را
// صفحه‌به‌صفحه نشان می‌دهد؛ کلمه‌ها با هاور به جعبه لغات می‌روند
//
// v1.0.2.۹ — صفحه‌بندی خطی: متن هر کتاب به «خط‌های کتابی» شکسته
// و هر صفحه دقیقاً حداکثر ۶ سطر دارد (صفحه دارای عنوان فصل:
// عنوان + ۵ خط؛ ادامه فصل: ۶ خط). همه صفحه‌ها هم‌اندازه‌اند.
//
// محتوا: بازنویسی ساده‌شده برای زبان‌آموزان
// - «شاهزاده ویلیام»: زندگی‌نامه سطح مبتدی (وقایع عمومی)
// - «غرور و تعصب»: بازگویی سادهٔ رمان ملکی‌العمومی جین آستین
// ========================================

export type StoryPage = {
  /** عنوان فصل — بالای برگه (خودش یک سطر می‌گیرد) */
  heading?: string;
  /** خط‌های کتابی این صفحه — حداکثر ۶ سطر */
  lines: string[];
};

type Story = {
  /** کلیدهای تطبیق با کتاب دیتابیس (id یا عنوان) */
  keys: string[];
  title: string;
  pages: StoryPage[];
};

const princeWilliam: Story = {
  keys: ["1", "prince william", "شاهزاده ویلیام"],
  title: "Prince William",
  pages: [
    {
      heading: "A Prince Is Born",
      lines: [
        "Prince William was born on June 21, 1982, in London. His father",
        "is Prince Charles and his mother was Princess Diana. People in",
        "Britain were very happy, and they celebrated in the streets.",
        "William had a younger brother, Prince Harry. The two boys grew",
        "up at Kensington Palace. Their mother wanted them to live like",
      ],
    },
    {
      lines: [
        "normal children, so she took them to fast food restaurants and",
        "on the underground train.",
        "The British people loved Princess Diana. She was called the",
        "People's Princess because she was kind and friendly to everyone.",
      ],
    },
    {
      heading: "School Days",
      lines: [
        "William started school in London. First he went to a small",
        "school called Wetherby. Then he moved to Ludgrove School in the",
        "country, where he studied for five years.",
        "After Ludgrove, William went to Eton College. Eton is a famous",
        "school near Windsor Castle. He studied geography, biology and",
      ],
    },
    {
      lines: [
        "history of art. He also played football and water polo.",
        "At Eton, William was a normal student. He worked hard and made",
        "many good friends. The other students liked him because he was",
        "friendly and funny.",
      ],
    },
    {
      heading: "A Very Sad Day",
      lines: [
        "In the summer of 1997, something terrible happened. Princess",
        "Diana died in a car accident in Paris. William was only fifteen",
        "years old, and Harry was twelve.",
        "The whole world was sad. Millions of people watched the funeral",
        "on television. William and Harry walked behind their mother's",
      ],
    },
    {
      lines: [
        "coffin through the streets of London.",
        "It was a very hard time for the young princes. But their family",
        "and friends helped them, and they slowly learned to live without",
        "their mother.",
      ],
    },
    {
      heading: "University Life",
      lines: [
        "After school, William did not go to the army first. He went to",
        "university. He studied at St Andrews in Scotland, a small and",
        "beautiful town near the sea.",
        "At university, William studied art history at first. Later he",
        "changed his main subject to geography. He loved sports and spent",
      ],
    },
    {
      lines: [
        "a lot of time with his friends.",
        "In St Andrews, William met a girl named Kate Middleton. She was",
        "also a student there. They became close friends, and then they",
        "fell in love.",
      ],
    },
    {
      heading: "Learning to Fly",
      lines: [
        "After university, William decided to become a pilot, like his",
        "father and his grandfather. He trained with the army first, and",
        "then with the Royal Air Force.",
        "William learned to fly helicopters. He became a search and",
        "rescue pilot. His job was to help people in danger, in the sea",
      ],
    },
    {
      lines: [
        "or on the mountains.",
        "For three years, he lived in Anglesey, a beautiful island in",
        "Wales. He flew many rescue missions and saved many lives. People",
        "said he was a brave and careful pilot.",
      ],
    },
    {
      heading: "The Royal Wedding",
      lines: [
        "In November 2010, William and Kate told the world their happy",
        "news: they were going to marry. William gave Kate the same ring",
        "that his mother, Diana, once wore.",
        "The wedding was on April 29, 2011, at Westminster Abbey in",
        "London. It was a beautiful spring day. Millions of people",
      ],
    },
    {
      lines: [
        "watched the ceremony on television around the world.",
        "There was a big party in the streets of London. Everyone was",
        "happy for the young couple. Kate became the Duchess of",
        "Cambridge.",
      ],
    },
    {
      heading: "A Growing Family",
      lines: [
        "William and Kate now have three children. Prince George was born",
        "in 2013, Princess Charlotte in 2015, and Prince Louis in 2018.",
        "William tries to be a modern father. He takes his children to",
        "school and plays with them in the park. He wants them to have a",
      ],
    },
    {
      lines: [
        "normal childhood, like his mother wanted for him.",
        "The family lives in a quiet house in the country. They also work",
        "for many charities and help people in need.",
      ],
    },
    {
      heading: "The Future King",
      lines: [
        "When Queen Elizabeth died in 2022, William's father became King",
        "Charles, and William became the Prince of Wales. He is the next",
        "king of Britain.",
        "William works hard for his country. He helps homeless people,",
        "protects the environment and supports mental health projects.",
      ],
    },
    {
      lines: [
        "People like Prince William because he is kind and works for a",
        "better world. His mother taught him to care for others, and he",
        "never forgot her lesson.",
      ],
    },
  ],
};

const prideAndPrejudice: Story = {
  keys: ["2", "pride and prejudice", "غرور و تعصب"],
  title: "Pride and Prejudice",
  pages: [
    {
      heading: "The Bennet Family",
      lines: [
        "Long ago in England, there lived a family called the Bennets.",
        "They lived in a small village called Longbourn. Mr and Mrs",
        "Bennet had five daughters: Jane, Elizabeth, Mary, Kitty and",
        "Lydia.",
        "The family was not rich. Their house was small, and when Mr",
      ],
    },
    {
      lines: [
        "Bennet died, it would go to a cousin. So Mrs Bennet had one big",
        "dream: she wanted all her daughters to marry rich men.",
        "Jane was the most beautiful daughter. Elizabeth was the",
        "cleverest. She loved to laugh, and she always said what she",
        "thought.",
      ],
    },
    {
      heading: "A Rich Young Man",
      lines: [
        "One day, exciting news came to the village. A rich young man, Mr",
        "Bingley, had rented Netherfield Park, a big house near",
        "Longbourn.",
        "Mr Bingley came to the village ball with his sisters and his",
        "best friend, Mr Darcy. Darcy was even richer than Bingley, and",
      ],
    },
    {
      lines: [
        "very handsome. But he was also proud and quiet.",
        "At the ball, Bingley danced with Jane many times. Everyone could",
        "see that he liked her. But Darcy danced with nobody. When",
        "someone asked him about Elizabeth, he said, She is not beautiful",
        "enough for me. Elizabeth heard this, and she was not happy.",
      ],
    },
    {
      heading: "Jane Gets Sick",
      lines: [
        "Soon after, Jane went to visit Netherfield. Her mother sent her",
        "on horseback, and it rained. Jane became very sick and had to",
        "stay at Bingley's house.",
        "Elizabeth was worried about her sister. She walked three miles",
        "through the mud to Netherfield to help her. Her dirty dress",
      ],
    },
    {
      lines: [
        "surprised the rich sisters, but Darcy watched her with new",
        "interest.",
        "While Jane got better, Elizabeth stayed at Netherfield. Darcy",
        "started to think that Elizabeth had beautiful eyes. But he still",
        "believed she was too far below his level.",
      ],
    },
    {
      heading: "A Silly Cousin",
      lines: [
        "Mr Collins, the cousin who would one day own the Bennet house,",
        "came to visit. He was a silly man who talked too much. He worked",
        "for a rich old lady called Lady Catherine.",
        "Mr Collins decided to marry Elizabeth. He believed this was a",
        "very generous idea. Elizabeth refused him politely, again and",
      ],
    },
    {
      lines: [
        "again. But he did not listen, because he could not believe she",
        "really meant no.",
        "A few days later, shocking news arrived: Mr Collins had asked",
        "Elizabeth's best friend, Charlotte Lucas, to marry him. And",
        "Charlotte, who was twenty-seven and not romantic, said yes.",
      ],
    },
    {
      heading: "The Charming Soldier",
      lines: [
        "In the village, a group of soldiers arrived for the winter. A",
        "young officer called Mr Wickham joined them. He was very",
        "handsome and friendly, and everyone liked him at once.",
        "Wickham told Elizabeth a sad story. He said Mr Darcy had cheated",
        "him and taken his money. Elizabeth was angry. Now she believed",
      ],
    },
    {
      lines: [
        "that Darcy was not only proud, but also a bad man.",
        "Of course, this story was not true. Wickham was a liar. But how",
        "could Elizabeth know that?",
      ],
    },
    {
      heading: "The Netherfield Ball",
      lines: [
        "Mr Bingley invited the whole family to a big ball at",
        "Netherfield. Elizabeth hoped to dance with Wickham, but he did",
        "not come.",
        "Then Mr Darcy asked her to dance. She was surprised, but she",
        "accepted. During the dance, they argued in polite words.",
      ],
    },
    {
      lines: [
        "Elizabeth mentioned Wickham, and Darcy's face became cold and",
        "angry.",
        "The next morning, more bad news arrived: the Bingley family had",
        "suddenly left for London. Jane was heartbroken. She believed",
        "Bingley had never really loved her. Elizabeth was sure that",
        "Darcy and Bingley's sisters had separated them.",
      ],
    },
    {
      heading: "A Proud Proposal",
      lines: [
        "Months later, Elizabeth visited Charlotte at her new house. Mr",
        "Darcy came to the same area to visit his aunt, Lady Catherine,",
        "who was Mr Collins's boss.",
        "Darcy started appearing everywhere Elizabeth walked. Then one",
        "day, he suddenly told her that he loved her, against his will,",
      ],
    },
    {
      lines: [
        "against his reason. He explained that her family was far below",
        "him, but he could not stop thinking about her.",
        "Elizabeth refused him with strong words. She blamed him for",
        "Jane's sadness and for Wickham's bad luck. Darcy was shocked and",
        "angry. He left, and the next morning, he gave Elizabeth a long",
        "letter.",
      ],
    },
    {
      heading: "The Letter",
      lines: [
        "In his letter, Darcy told the truth. He admitted that he had",
        "separated Bingley from Jane, because he believed Jane did not",
        "love Bingley. He was sorry for that mistake.",
        "About Wickham, the letter told a very different story. Wickham",
        "had wasted his money and tried to marry Darcy's young sister for",
      ],
    },
    {
      lines: [
        "her fortune. Elizabeth read the letter again and again.",
        "Slowly, she understood. I was wrong about him, she thought. I",
        "was proud of my cleverness, but I saw nothing clearly. She began",
        "to see Darcy in a new way.",
      ],
    },
    {
      heading: "Pemberley",
      lines: [
        "That summer, Elizabeth travelled with her aunt and uncle. They",
        "visited Derbyshire, and her aunt wanted to see Pemberley,",
        "Darcy's great house. Elizabeth heard that Darcy was away, so she",
        "agreed to go.",
        "Pemberley was beautiful, with gardens, a river and a grand",
      ],
    },
    {
      lines: [
        "house. The housekeeper told them that Darcy was the best master",
        "and the kindest brother. Elizabeth's heart began to change.",
        "Then, suddenly, Darcy himself appeared. He was polite and warm,",
        "nothing like the proud man of the past. He asked about her",
        "family and even introduced his sister to her.",
      ],
    },
    {
      heading: "Happy Endings",
      lines: [
        "But that very night, terrible news came. Elizabeth's youngest",
        "sister, Lydia, had run away with Wickham. The family was in",
        "disgrace.",
        "Elizabeth thought Darcy would never think of her again. She did",
        "not know that Darcy secretly found the couple, paid Wickham's",
      ],
    },
    {
      lines: [
        "debts and made him marry Lydia. He did it all for Elizabeth.",
        "When Bingley returned and asked Jane to marry him, Jane was the",
        "happiest woman alive. Then Darcy proposed again to Elizabeth,",
        "this time with true humility. She said yes. The proud man and",
        "the clever girl both learned to see beyond their pride and",
        "prejudice.",
      ],
    },
  ],
};


const STORIES: Story[] = [princeWilliam, prideAndPrejudice];

/** نرمال‌سازی عنوان برای تطبیق */
function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/["'".]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * یافتن داستان کتاب — تطبیق با id یا عنوان انگلیسی
 * (اگر دیتابیس کاربر دوباره seed شود و id تغییر کند، عنوان هنوز کار می‌کند)
 */
export function getStory(
  bookId: string | number,
  title?: string,
): StoryPage[] | null {
  const idKey = normalizeKey(String(bookId));
  const titleKey = title ? normalizeKey(title) : "";

  for (const story of STORIES) {
    if (story.keys.some((k) => k === idKey || k === titleKey)) {
      return story.pages;
    }
  }
  return null;
}

/** تعداد کل داستان‌های آماده (برای پیام‌های UI) */
export const storyBooksCount = STORIES.length;
