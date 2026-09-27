import type { IeltsTest } from "@/types/ielts";

// ========================================
// کتاب کمبریج ۰۱ — تست ۱ آکادمیک (محتوای تمرینی اختصاصی Flex English)
// ساختار دقیقاً مطابق فرمت آیلتس: ۳ پاساژ + ۴۰ سوال ریدینگ،
// ۴ بخش + ۴۰ سوال لیسنینگ، ۲ تسک رایتینگ
// ========================================

export const book01: IeltsTest = {
  slug: "cambridge-01",
  bookNumber: 1,
  testNumber: 1,
  module: "ACADEMIC",
  titleFa: "کمبریج ۰۱ — تست ۱",
  titleEn: "Cambridge 01 — Test 1",
  available: true,

  // ================= READING =================
  reading: {
    minutes: 60,
    passages: [
      {
        part: 1,
        title: "The Secret Life of Bees in Cities",
        intro: "How urban gardens are changing honeybee behaviour",
        paragraphs: [
          {
            label: "A",
            text: "For decades, scientists assumed that honeybees could only thrive in the countryside, where fields of wildflowers provide steady sources of nectar. Recent research, however, has overturned this assumption. Studies carried out in cities across Europe and North America show that urban beehives frequently produce more honey per hive than their rural counterparts, and that city bees often enjoy longer active seasons. The explanation lies in the surprising richness of the urban landscape: parks, balconies, roadside plantings and private gardens together create a mosaic of flowering plants that blooms in succession from early spring to late autumn.",
          },
          {
            label: "B",
            text: "One key advantage of city life is temperature. Built-up areas absorb and release heat, keeping urban gardens several degrees warmer than surrounding farmland during much of the year. This warmth allows bees to begin foraging earlier in spring and to continue later into autumn. In addition, the variety of plants chosen by gardeners — many of them non-native species that flower at unusual times — means that something is almost always in bloom. A rural landscape dominated by a single crop, by contrast, may offer a spectacular flowering period of only two or three weeks, followed by weeks of scarcity.",
          },
          {
            label: "C",
            text: "Not everything about the city favours bees. Traffic, pollution and disease all take their toll, and urban beekeepers must watch their colonies carefully. Pesticide use is generally lower in cities than on farms, but a different chemical threat exists: the residues deposited on garden flowers, which are frequently treated with substances that beekeepers cannot control because they belong to private households. Researchers therefore recommend that city gardeners choose untreated plants and avoid spraying flowers during daytime hours when bees are flying.",
          },
          {
            label: "D",
            text: "Communication is at the centre of a colony's success, and urban environments test it severely. A returning forager communicates the direction and distance of a food source through the famous 'waggle dance'. In dense cities, tall buildings, reflective glass and electromagnetic noise may interfere with this dance and with the bees' navigation. Some studies have observed that urban colonies send out more scouts and rely on a wider spread of flower patches than rural bees, effectively hedging their bets against unreliable signals.",
          },
          {
            label: "E",
            text: "The relationship between bees and city people runs in both directions. Community beekeeping projects have multiplied over the past fifteen years, and schools increasingly host hives as teaching tools. Surveys of participants suggest that keeping bees raises people's awareness of pollination and often changes their gardening habits: beekeepers plant more flowers, use fewer chemicals and tolerate the small inconveniences — the occasional swarm, the mild sting — that come with hosting thousands of insects.",
          },
          {
            label: "F",
            text: "Looking ahead, urban beekeeping faces a question of scale. Conservationists warn that honeybees are essentially domestic animals, and that packing cities with them can out-compete wild bees and other pollinators that are genuinely endangered. The most balanced vision, they argue, is a city that plans for all pollinators: continuous corridors of native planting, reduced mowing of roadside grass, and hives in moderation. Managed carefully, the city of the future could support both the beekeeper's hive on the roof and the solitary bee nesting in the garden wall.",
          },
        ],
      },
      {
        part: 2,
        title: "The Return of the Night Train",
        intro: "Sleeper railways are making an unlikely comeback",
        paragraphs: [
          {
            label: "A",
            text: "In 2016, the night train seemed to be breathing its last. Across Europe, budget airlines had captured the market, and one famous route after another was withdrawn. Then, within a few years, the picture reversed completely. New sleeper services have been launched between major cities, existing routes have been extended, and tickets for the most popular departures sell out within minutes. The revival is driven by an unusual coalition of passengers: business travellers tired of airport queues, tourists who see the journey as part of the holiday, and a growing number of people who refuse to fly because of climate concerns.",
          },
          {
            label: "B",
            text: "The economics of sleeper trains remain the hardest problem. A night train carries far fewer passengers than a high-speed day train of the same length, because every traveller needs a bed rather than a seat. Crews must work through the night, and rolling stock sits idle all day at destination platforms. To make the sums work, operators have rethought the product entirely: modern sleepers offer everything from a basic seat to a private compartment with a shower, priced accordingly. A single train now contains several different products, each with its own profit margin.",
          },
          {
            label: "C",
            text: "Governments have also stepped in. France has banned several short domestic flights where a train alternative of under two and a half hours exists, and both France and Austria have invested public money directly in sleeper rolling stock. The calculation is political as much as environmental: night trains serve city centres rather than distant airports, and they keep smaller towns connected to the capital when air links disappear. For ministers, a photograph beside a freshly painted sleeper carriage sends a message that few other transport projects can match.",
          },
          {
            label: "D",
            text: "Comfort has improved beyond recognition. The carriages introduced in the 2020s recycle air continuously, dampen track noise and offer individual reading lights, power sockets and wake-up service. Accessibility, long neglected, is being redesigned from scratch: the newest plans include compartments wide enough for a wheelchair and its occupant plus a companion, with an accessible toilet next door. Older trains are being rebuilt rather than scrapped, which preserves craftsmanship — the interior panels of one new fleet are made from wood reclaimed from retired carriages.",
          },
          {
            label: "E",
            text: "What the revival has not yet solved is reliability. A sleeper journey depends on a path through the night across several national networks, and a single late freight train can ruin the schedule. Operators now build generous recovery time into timetables, and some publish monthly punctuality figures — a level of transparency that airlines adopted only under pressure. Travellers, for their part, appear forgiving: surveys consistently show that passengers who miss a meeting because of a late train still rate the experience above an early-morning flight, simply because they slept.",
          },
        ],
      },
      {
        part: 3,
        title: "Why We Forget Names",
        intro: "The science of a very common social failure",
        paragraphs: [
          {
            text: "The situation is painfully familiar: you are introduced to someone, and seconds later their name has vanished. Psychologists have studied this 'next-in-line effect' for decades, and their conclusions are oddly comforting — forgetting names is not a sign of a failing memory but a sign of a memory doing exactly what it evolved to do.",
          },
          {
            text: "Names are, from the brain's point of view, terrible pieces of information. They are arbitrary: nothing about the sound 'Karen' connects to any feature of the person carrying it. Almost everything else we learn about a new acquaintance — their job, their opinions, their face — links to existing knowledge, and those links are what memory thrives on. A name, by contrast, floats freely, attached to nothing, and unattached information decays quickly unless we deliberately rehearse it.",
          },
          {
            text: "Experiments reveal a second problem: the moment of introduction itself. When we meet someone, attention is divided between listening to their name, preparing what we will say next and managing the social impression we are making. Laboratory studies show that people about to speak remember remarkably little about the person speaking immediately before them — the 'next-in-line' effect. During an introduction, we are effectively the next speaker, rehearsing our own line while the other person's name goes unattended.",
          },
          {
            text: "There are proven ways to fight back. The most powerful is simply to use the name at once: repeating it in the greeting ('Nice to meet you, Sara') forces a rehearsal cycle within seconds. Better still is to connect the name to something meaningful — a celebrity, a rhyme, a feature of the person's face — creating the missing link that memory needs. The ancient 'method of loci', in which new names are mentally placed at fixed locations around a room, remains one of the most reliable techniques ever tested.",
          },
          {
            text: "Interest matters too. Studies of social attention find that we remember the names of people we consider important with far less effort. This explains the flattering asymmetry of everyday life: the celebrity remembers few names, while the fan remembers theirs. It also suggests a practical trick — deciding, consciously, that the person in front of you matters. People who are instructed to treat every introduction as important show measurably better name recall within weeks, purely because attention has been redirected.",
          },
          {
            text: "Finally, experts urge people to stop apologising. The phrase 'I'm terrible with names', repeated like a personal motto, does real damage: it gives the brain permission to stop trying. Memory athletes, who can memorise dozens of names in minutes, insist that their skill is ninety per cent attention and only ten per cent technique. The difference between them and the rest of us is not hardware but intention — they decide that names are worth remembering, and the memory system, given clear instructions, generally complies.",
          },
        ],
      },
    ],
    groups: [
      // ---------- Passage 1: Q1-13 ----------
      {
        id: "r-g1",
        part: 1,
        type: "match-info",
        heading: "Questions 1-5",
        instruction: "The reading passage has six paragraphs, A-F. Which paragraph contains the following information?",
        options: [
          { label: "A", text: "A" }, { label: "B", text: "B" }, { label: "C", text: "C" },
          { label: "D", text: "D" }, { label: "E", text: "E" }, { label: "F", text: "F" },
        ],
        questions: [
          { id: "r1", number: 1, text: "a warning that a popular urban activity may harm other insect species", answer: ["F"], answerDisplay: "F", explanation: "Paragraph F: conservationists warn that packing cities with honeybees can out-compete endangered wild pollinators." },
          { id: "r2", number: 2, text: "a comparison of flowering periods in gardens and on farmland", answer: ["B"], answerDisplay: "B", explanation: "Paragraph B contrasts continuous urban blooming with the two-to-three-week rural crop flowering." },
          { id: "r3", number: 3, text: "a description of how bees tell each other where to find food", answer: ["D"], answerDisplay: "D", explanation: "Paragraph D describes the waggle dance communicating direction and distance." },
          { id: "r4", number: 4, text: "a suggestion for gardeners about when not to spray plants", answer: ["C"], answerDisplay: "C", explanation: "Paragraph C: avoid spraying flowers during daytime hours when bees are flying." },
          { id: "r5", number: 5, text: "a claim that a change in people's behaviour follows a particular hobby", answer: ["E"], answerDisplay: "E", explanation: "Paragraph E: surveys suggest beekeeping changes gardening habits." },
        ],
      },
      {
        id: "r-g2",
        part: 1,
        type: "sentence-completion",
        heading: "Questions 6-9",
        instruction: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
        wordLimit: "NO MORE THAN TWO WORDS",
        questions: [
          { id: "r6", number: 6, before: "City bees often start collecting food earlier because urban areas are", after: "than the countryside.", answer: ["warmer"], answerDisplay: "warmer", explanation: "Paragraph B: urban gardens are 'several degrees warmer'." },
          { id: "r7", number: 7, before: "In the countryside, a landscape with only one crop may cause long periods of", after: "for bees.", answer: ["scarcity"], answerDisplay: "scarcity", explanation: "Paragraph B mentions 'weeks of scarcity' after the crop finishes flowering." },
          { id: "r8", number: 8, before: "Chemical residues on flowers bought for private", after: "cannot be controlled by beekeepers.", answer: ["gardens", "households"], answerDisplay: "gardens / households", explanation: "Paragraph C: residues on garden flowers 'belong to private households'." },
          { id: "r9", number: 9, before: "Research indicates that bees use more", after: "when signals in cities are unreliable.", answer: ["scouts"], answerDisplay: "scouts", explanation: "Paragraph D: urban colonies 'send out more scouts'." },
        ],
      },
      {
        id: "r-g3",
        part: 1,
        type: "mcq",
        heading: "Questions 10-13",
        instruction: "Choose the correct letter, A, B, C or D.",
        questions: [
          {
            id: "r10", number: 10,
            text: "What surprised researchers about urban beehives?",
            options: [ { label: "A", text: "They survive with less inspection." }, { label: "B", text: "They can outperform rural hives." }, { label: "C", text: "They are cheaper to maintain." }, { label: "D", text: "They need non-native plants." } ],
            answer: ["B"], answerDisplay: "B", explanation: "Paragraph A: urban hives 'frequently produce more honey per hive than their rural counterparts'.",
          },
          {
            id: "r11", number: 11,
            text: "According to the writer, the biggest disadvantage of city plants for bees is that",
            options: [ { label: "A", text: "they bloom at unusual times." }, { label: "B", text: "they are often treated with chemicals." }, { label: "C", text: "they attract too many visitors." }, { label: "D", text: "they grow in small spaces." } ],
            answer: ["B"], answerDisplay: "B", explanation: "Paragraph C focuses on chemical residues on garden flowers as the urban threat.",
          },
          {
            id: "r12", number: 12,
            text: "What do studies say about urban bee colonies and unreliable signals?",
            options: [ { label: "A", text: "They abandon the waggle dance completely." }, { label: "B", text: "They fly only in the early morning." }, { label: "C", text: "They spread their foraging across more patches." }, { label: "D", text: "They move their hives closer to parks." } ],
            answer: ["C"], answerDisplay: "C", explanation: "Paragraph D: they 'rely on a wider spread of flower patches', hedging their bets.",
          },
          {
            id: "r13", number: 13,
            text: "What is the writer's overall conclusion about urban beekeeping?",
            options: [ { label: "A", text: "It should be limited to school projects." }, { label: "B", text: "It will eventually replace rural beekeeping." }, { label: "C", text: "It needs to be planned with wild pollinators in mind." }, { label: "D", text: "It has no measurable environmental effect." } ],
            answer: ["C"], answerDisplay: "C", explanation: "Paragraph F calls for 'a city that plans for all pollinators'.",
          },
        ],
      },
      // ---------- Passage 2: Q14-26 ----------
      {
        id: "r-g4",
        part: 2,
        type: "match-headings",
        heading: "Questions 14-18",
        instruction: "The reading passage has five paragraphs, A-E. Choose the correct heading for each paragraph from the list of headings below.",
        options: [
          { label: "i", text: "A challenge that has not gone away" },
          { label: "ii", text: "Financial difficulty and a new business model" },
          { label: "iii", text: "Public money and political motives" },
          { label: "iv", text: "The final departure of the railways" },
          { label: "v", text: "A sudden change in fortunes" },
          { label: "vi", text: "Designing for every passenger" },
          { label: "vii", text: "Speed records on night routes" },
        ],
        questions: [
          { id: "r14", number: 14, text: "Paragraph A", answer: ["v"], answerDisplay: "v", explanation: "Paragraph A describes the complete reversal of the night train's fortunes — 'the picture reversed completely'." },
          { id: "r15", number: 15, text: "Paragraph B", answer: ["ii"], answerDisplay: "ii", explanation: "Paragraph B is entirely about the economic problem and the multi-tier pricing solution." },
          { id: "r16", number: 16, text: "Paragraph C", answer: ["iii"], answerDisplay: "iii", explanation: "Paragraph C covers government investment and the political symbolism of sleeper trains." },
          { id: "r17", number: 17, text: "Paragraph D", answer: ["vi"], answerDisplay: "vi", explanation: "Paragraph D details comfort and accessibility improvements for all passengers." },
          { id: "r18", number: 18, text: "Paragraph E", answer: ["i"], answerDisplay: "i", explanation: "Paragraph E opens with 'What the revival has not yet solved is reliability' — the remaining challenge." },
        ],
      },
      {
        id: "r-g5",
        part: 2,
        type: "tfng",
        heading: "Questions 19-23",
        instruction: "Do the following statements agree with the information given in the reading passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
        options: [ { label: "TRUE", text: "TRUE" }, { label: "FALSE", text: "FALSE" }, { label: "NOT GIVEN", text: "NOT GIVEN" } ],
        questions: [
          { id: "r19", number: 19, text: "Tickets for the most popular night trains sell out rapidly.", answer: ["TRUE"], answerDisplay: "TRUE", explanation: "Paragraph A: 'tickets for the most popular departures sell out within minutes'." },
          { id: "r20", number: 20, text: "A night train can carry as many passengers as a high-speed day train of the same length.", answer: ["FALSE"], answerDisplay: "FALSE", explanation: "Paragraph B says it carries 'far fewer passengers' because beds take more space than seats." },
          { id: "r21", number: 21, text: "France has banned all domestic flights.", answer: ["FALSE"], answerDisplay: "FALSE", explanation: "Paragraph C: only short flights with a train alternative under two and a half hours." },
          { id: "r22", number: 22, text: "Airlines published punctuality figures voluntarily from the beginning.", answer: ["FALSE"], answerDisplay: "FALSE", explanation: "Paragraph E: airlines adopted transparency 'only under pressure'." },
          { id: "r23", number: 23, text: "Passengers who arrive late are offered free tickets.", answer: ["NOT GIVEN"], answerDisplay: "NOT GIVEN", explanation: "The passage never mentions compensation or free tickets." },
        ],
      },
      {
        id: "r-g6",
        part: 2,
        type: "note-completion",
        heading: "Questions 24-26",
        instruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
        wordLimit: "ONE WORD ONLY",
        questions: [
          { id: "r24", number: 24, before: "New sleeper carriages are quieter because they dampen track", after: ".", answer: ["noise"], answerDisplay: "noise", explanation: "Paragraph D: carriages 'dampen track noise'." },
          { id: "r25", number: 25, before: "The newest sleeping compartments are being designed so that a", after: "can enter and turn.", answer: ["wheelchair"], answerDisplay: "wheelchair", explanation: "Paragraph D: compartments 'wide enough for a wheelchair'." },
          { id: "r26", number: 26, before: "Wood used for interior panels of one new fleet was reclaimed from retired", after: ".", answer: ["carriages"], answerDisplay: "carriages", explanation: "Paragraph D: wood 'reclaimed from retired carriages'." },
        ],
      },
      // ---------- Passage 3: Q27-40 ----------
      {
        id: "r-g7",
        part: 3,
        type: "mcq",
        heading: "Questions 27-31",
        instruction: "Choose the correct letter, A, B, C or D.",
        questions: [
          {
            id: "r27", number: 27,
            text: "According to psychologists, forgetting names is",
            options: [ { label: "A", text: "a sign of memory failure." }, { label: "B", text: "evidence of normal memory design." }, { label: "C", text: "caused mainly by ageing." }, { label: "D", text: "more common in cities." } ],
            answer: ["B"], answerDisplay: "B", explanation: "Paragraph 1: it is 'a sign of a memory doing exactly what it evolved to do'.",
          },
          {
            id: "r28", number: 28,
            text: "Why are names difficult for the brain to store?",
            options: [ { label: "A", text: "They are usually too short." }, { label: "B", text: "They are rarely repeated by others." }, { label: "C", text: "They have no natural links to existing knowledge." }, { label: "D", text: "They are stored in a separate memory system." } ],
            answer: ["C"], answerDisplay: "C", explanation: "Paragraph 2: names are arbitrary and 'float freely, attached to nothing'.",
          },
          {
            id: "r29", number: 29,
            text: "The 'next-in-line effect' describes people who",
            options: [ { label: "A", text: "remember their own words better than others'." }, { label: "B", text: "forget names they hear at parties." }, { label: "C", text: "speak too quickly when nervous." }, { label: "D", text: "avoid speaking to strangers." } ],
            answer: ["A"], answerDisplay: "A", explanation: "Paragraph 3: people about to speak 'remember remarkably little' about the previous speaker.",
          },
          {
            id: "r30", number: 30,
            text: "What does the writer say about the method of loci?",
            options: [ { label: "A", text: "It only works for trained athletes." }, { label: "B", text: "It is one of the most dependable techniques tested." }, { label: "C", text: "It was invented by memory athletes." }, { label: "D", text: "It requires a large room." } ],
            answer: ["B"], answerDisplay: "B", explanation: "Paragraph 4: it 'remains one of the most reliable techniques ever tested'.",
          },
          {
            id: "r31", number: 31,
            text: "What advice do memory athletes give about the phrase 'I'm terrible with names'?",
            options: [ { label: "A", text: "It should be said honestly and often." }, { label: "B", text: "It helps lower social pressure." }, { label: "C", text: "It should be stopped because it harms motivation." }, { label: "D", text: "It is accurate for most people." } ],
            answer: ["C"], answerDisplay: "C", explanation: "Paragraph 6: the repeated phrase 'gives the brain permission to stop trying' — experts urge people to stop apologising.",
          },
        ],
      },
      {
        id: "r-g8",
        part: 3,
        type: "summary-completion",
        heading: "Questions 32-36",
        instruction: "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
        wordLimit: "ONE WORD ONLY",
        lines: [
          "Memory works best when new facts are connected to what we already know. Names lack such connections, so they disappear unless we",
          { gap: "r32" },
          "them deliberately. One effective approach is to link a new name to a famous person or to a physical feature, creating the missing",
          { gap: "r33" },
          ". Another is the method of loci, which means picturing names at fixed",
          { gap: "r34" },
          "around a room. We also remember names of people we consider",
          { gap: "r35" },
          "with far less effort. Finally, memory athletes claim that their skill depends mostly on",
          { gap: "r36" },
          "rather than special techniques.",
        ],
        questions: [
          { id: "r32", number: 32, before: "unless we", after: "them deliberately", answer: ["rehearse"], answerDisplay: "rehearse", explanation: "Paragraph 2: 'unattached information decays quickly unless we deliberately rehearse it'." },
          { id: "r33", number: 33, before: "creating the missing", after: "", answer: ["link"], answerDisplay: "link", explanation: "Paragraph 4: techniques 'creat[e] the missing link that memory needs'." },
          { id: "r34", number: 34, before: "picturing names at fixed", after: "around a room", answer: ["locations"], answerDisplay: "locations", explanation: "Paragraph 4: names 'mentally placed at fixed locations around a room'." },
          { id: "r35", number: 35, before: "names of people we consider", after: "with far less effort", answer: ["important"], answerDisplay: "important", explanation: "Paragraph 5: 'we remember the names of people we consider important'." },
          { id: "r36", number: 36, before: "their skill depends mostly on", after: "rather than special techniques", answer: ["attention"], answerDisplay: "attention", explanation: "Paragraph 6: 'ninety per cent attention and only ten per cent technique'." },
        ],
      },
      {
        id: "r-g9",
        part: 3,
        type: "short-answer",
        heading: "Questions 37-40",
        instruction: "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
        wordLimit: "NO MORE THAN THREE WORDS",
        questions: [
          { id: "r37", number: 37, text: "Which effect explains why we barely remember the person speaking just before we speak?", answer: ["the next-in-line effect", "next-in-line effect"], answerDisplay: "the next-in-line effect", explanation: "Paragraph 3 defines the next-in-line effect." },
          { id: "r38", number: 38, text: "Which everyday comparison illustrates how interest affects name memory?", answer: ["the celebrity and the fan", "celebrity and fan"], answerDisplay: "the celebrity and the fan", explanation: "Paragraph 5: 'the celebrity remembers few names, while the fan remembers theirs'." },
          { id: "r39", number: 39, text: "What percentage of a memory athlete's skill is attention, according to the passage?", answer: ["ninety per cent", "90%", "90 per cent", "ninety percent"], answerDisplay: "ninety per cent", explanation: "Paragraph 6: 'ninety per cent attention'." },
          { id: "r40", number: 40, text: "What do memory athletes say the memory system does when given clear instructions?", answer: ["complies", "it complies", "generally complies"], answerDisplay: "generally complies", explanation: "Final line: 'the memory system, given clear instructions, generally complies'." },
        ],
      },
    ],
  },

  // ================= LISTENING =================
  listening: {
    minutes: 30,
    sections: [
      {
        part: 1,
        title: "Booking a bicycle tour",
        context: "Conversation in a tour office",
        estimatedSec: 300,
        script: [
          { speaker: "MAN", text: "Good morning, City Wheels Cycling Tours, how can I help you?" },
          { speaker: "WOMAN", text: "Hi, I'd like to book the riverside tour for this Saturday. Is there space left?" },
          { speaker: "MAN", text: "Let me check. Saturday... the ten o'clock riverside tour is nearly full, but we have four places on the two o'clock one." },
          { speaker: "WOMAN", text: "Two o'clock works. How long does it last?" },
          { speaker: "MAN", text: "Around three hours, including a twenty-minute break at the old harbour cafe." },
          { speaker: "WOMAN", text: "Perfect. And how much is it per person?" },
          { speaker: "MAN", text: "It's eighteen pounds, and that includes the bike, a helmet and a bottle of water." },
          { speaker: "WOMAN", text: "Great. Do we need to bring anything?" },
          { speaker: "MAN", text: "Just comfortable shoes and something warm — it can get windy near the river. Oh, and a camera if you like; the views from the bridge are wonderful." },
          { speaker: "WOMAN", text: "I'll bring mine. Where do we meet?" },
          { speaker: "MAN", text: "Outside the tourist information centre on Market Street, ten minutes before the start. The guide will be wearing a bright green jacket." },
          { speaker: "WOMAN", text: "Can I pay now or on the day?" },
          { speaker: "MAN", text: "You can reserve now and pay the guide on the day — cash or card, both fine. Can I take a name?" },
          { speaker: "WOMAN", text: "Yes, it's Anna Bradshaw, B-R-A-D-S-H-A-W." },
          { speaker: "MAN", text: "Thank you, Anna. And a contact number?" },
          { speaker: "WOMAN", text: "It's oh-seven-seven-double-two, four-one-nine, six-three-oh." },
          { speaker: "MAN", text: "Got it. So that's one place on the riverside tour, Saturday, two p.m. You'll get a confirmation text this evening." },
          { speaker: "WOMAN", text: "Wonderful. One more thing — is the route flat? I'm not very fit." },
          { speaker: "MAN", text: "Completely flat, and we go at the slowest rider's pace. You'll be fine." },
          { speaker: "WOMAN", text: "That's a relief. Thank you very much." },
          { speaker: "MAN", text: "Thank you for calling City Wheels. See you Saturday!" },
        ],
      },
      {
        part: 2,
        title: "Welcome to the community garden",
        context: "Talk by the garden coordinator",
        estimatedSec: 330,
        script: [
          { speaker: "NARRATOR", text: "You will hear a coordinator welcoming new members to a community garden." },
          { speaker: "WOMAN", text: "Welcome, everyone, to your first morning at Sunfield Community Garden. Before you grab a spade, let me show you around and explain how we run things." },
          { speaker: "WOMAN", text: "The garden is divided into three zones. On your left, closest to the gate, are the shared vegetable beds. Everything grown there is shared equally among members, and the watering rota is pinned to the noticeboard by the greenhouse. Please stick to your slot — last summer we lost a whole bed of tomatoes because everyone thought someone else was watering." },
          { speaker: "WOMAN", text: "The middle zone holds the individual plots. Each family can rent one plot for twelve pounds a year. If you'd like a plot, add your name to the waiting list — the wait is currently about two months." },
          { speaker: "WOMAN", text: "The far zone, past the pond, is the wildlife area. We keep it wild on purpose: long grass, a bee hotel and a hedgehog box. No digging there, please, and no picking the wildflowers — they self-seed and spread a little more every year." },
          { speaker: "WOMAN", text: "Now, a few rules. The water tap is behind the greenhouse, and we collect rainwater in the blue barrels — please use that first. Tools live in the green shed; the code for the lock is the year the garden opened, nineteen oh-nine, backwards. Children are very welcome, but they must be with an adult near the pond." },
          { speaker: "WOMAN", text: "We meet on the first Saturday of each month at ten for coffee and planning — biscuits provided, and honestly that's half the reason people join. Finally, if you grow more than you can eat, leave the extras in the crate by the gate. Neighbours take what they need, and anything left over goes to the lunch club on Sundays." },
          { speaker: "WOMAN", text: "Right — let's start with a tour of the compost corner. Follow me, and mind the wheelbarrow!" },
        ],
      },
      {
        part: 3,
        title: "Discussing a presentation on renewable energy",
        context: "Conversation between two students",
        estimatedSec: 340,
        script: [
          { speaker: "NARRATOR", text: "You will hear two students discussing a presentation they have to give." },
          { speaker: "MAN", text: "Okay, Samira, we've got two weeks to prepare this presentation on renewable energy. Where should we start?" },
          { speaker: "WOMAN", text: "I thought we'd begin with an overview — you know, what 'renewable' actually means, and the main types. Solar, wind, hydro, and I suppose geothermal." },
          { speaker: "MAN", text: "Sure, but everyone does that. The brief says we should focus on one country, right?" },
          { speaker: "WOMAN", text: "Costa Rica. The tutor suggested it because they've run on almost entirely renewable electricity for several years now." },
          { speaker: "MAN", text: "Oh, good choice. I read that in some months they hit ninety-eight per cent. Is that right?" },
          { speaker: "WOMAN", text: "Ninety-eight in the rainy season, when hydropower is strong. In the dry season it drops — that's when they burn a bit of fossil fuel in backup plants. We could show that with a simple chart." },
          { speaker: "MAN", text: "Yes! A bar chart, rainy versus dry season. I can build that. What about the problems section? Every presentation needs a critical side." },
          { speaker: "WOMAN", text: "Two obvious ones. First, hydropower depends on the weather — a drought can shut it down. Second, the dams themselves damage rivers and displace villages. It's not a free lunch." },
          { speaker: "MAN", text: "Should we include interviews? We could ask people on campus what they know about Costa Rica." },
          { speaker: "WOMAN", text: "Hmm, the tutor warned us against street interviews — hard to quote properly. She said find a podcast or a journal article instead." },
          { speaker: "MAN", text: "There's that energy podcast, 'The Grid'. They had an episode on Central America in March, I think." },
          { speaker: "WOMAN", text: "Perfect, we can cite that. So: I'll write the introduction and the country background, you do the chart and the problems section?" },
          { speaker: "MAN", text: "Deal. And we'll meet Thursday to rehearse? Ten minutes each, strictly — we always overrun." },
          { speaker: "WOMAN", text: "Thursday it is. Library room four is free at two. I'll book it." },
        ],
      },
      {
        part: 4,
        title: "The history of tea",
        context: "University lecture",
        estimatedSec: 330,
        script: [
          { speaker: "NARRATOR", text: "You will hear part of a lecture about the history of tea. First, you have some time to look at questions 31 to 40." },
          { speaker: "MAN", text: "Good morning. Today's lecture is the first of two on the global history of tea, and I want to concentrate on how a leaf from southern China became the world's second most traded drink after water." },
          { speaker: "MAN", text: "Tea began, as far as we can tell, as a medicine. Chinese texts from at least two thousand years ago mention it as a stimulant and a digestive aid. Legend credits a emperor named Shennong with the discovery, when leaves drifted into a pot of boiling water — a nice story, though the evidence is thin." },
          { speaker: "MAN", text: "The shift from medicine to daily drink happened during the Tang dynasty, around the seventh century. Tea bricks were pressed from dried leaves, ground into powder and whisked — a method the Japanese later refined into their tea ceremony. Crucially, the Tang government saw tea as taxable, and the duty on it helped fund the imperial army." },
          { speaker: "MAN", text: "Europeans arrived late. Portuguese priests encountered tea in Japan in the sixteenth century, but it was a Dutch merchant shipment in sixteen oh six that first brought it to European tables — as a luxury for the very rich. When Catherine of Braganza married the English king Charles the Second in sixteen sixty-two, she brought the tea-drinking habit with her, and the English court copied her immediately." },
          { speaker: "MAN", text: "Then came the great irony of tea history: Britain fell in love with a Chinese product but refused to pay in silver. The solution was opium grown in India, traded to China — a trade so destructive it led to two wars in the nineteenth century. Meanwhile, the British had smuggled tea plants out of China and established plantations in Assam, in north-east India. By the eighteen-eighties, Assam and Ceylon tea had broken the Chinese monopoly." },
          { speaker: "MAN", text: "The twentieth century brought tea to the masses. Technological innovations — notably the tea bag, invented in America around nineteen oh eight and adopted in Britain after the nineteen fifties — turned brewing into a thirty-second job. Today over two billion cups are drunk every day, and the industry faces new questions of fair pay and climate pressure on growing regions." },
          { speaker: "MAN", text: "Next week we'll look at coffee, tea's great rival, and the cafes where the two drinks competed for European attention. Don't forget the reading list is on the portal. Thank you." },
        ],
      },
    ],
    groups: [
      // ---------- Section 1: Q1-10 ----------
      {
        id: "l-g1",
        part: 1,
        type: "mcq",
        heading: "Questions 1-3",
        instruction: "Choose the correct letter, A, B or C.",
        questions: [
          {
            id: "l1", number: 1,
            text: "The woman books the tour at",
            options: [ { label: "A", text: "10 a.m. on Saturday." }, { label: "B", text: "2 p.m. on Saturday." }, { label: "C", text: "10 a.m. on Sunday." } ],
            answer: ["B"], answerDisplay: "B", explanation: "The 10 o'clock tour is nearly full; she books the two o'clock one.",
          },
          {
            id: "l2", number: 2,
            text: "The tour lasts about",
            options: [ { label: "A", text: "two hours." }, { label: "B", text: "three hours." }, { label: "C", text: "four hours." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'Around three hours, including a twenty-minute break.'",
          },
          {
            id: "l3", number: 3,
            text: "The price includes",
            options: [ { label: "A", text: "lunch at a cafe." }, { label: "B", text: "a waterproof jacket." }, { label: "C", text: "a drink of water." } ],
            answer: ["C"], answerDisplay: "C", explanation: "'That includes the bike, a helmet and a bottle of water.'",
          },
        ],
      },
      {
        id: "l-g2",
        part: 1,
        type: "form-completion",
        heading: "Questions 4-10",
        instruction: "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        wordLimit: "ONE WORD AND/OR A NUMBER",
        table: {
          headers: ["RIVERSIDE CYCLE TOUR — BOOKING", ""],
          rows: [
            ["Name:", { gap: "l4" }],
            ["Contact number:", { gap: "l5" }],
            ["Meeting point: outside the", { gap: "l6" }, "centre"],
            ["Guide wears a", { gap: "l7" }, "jacket"],
            ["Payment: pay the guide on the day by", { gap: "l8" }, "or card"],
            ["Bring: comfortable shoes, a camera and something", { gap: "l9" }],
            ["Route: completely", { gap: "l10" }],
          ],
        },
        questions: [
          { id: "l4", number: 4, answer: ["anna bradshaw", "bradshaw"], answerDisplay: "Anna Bradshaw", explanation: "She spells her surname: B-R-A-D-S-H-A-W." },
          { id: "l5", number: 5, answer: ["07722 419 630", "07722419630", "07722419 630"], answerDisplay: "07722 419 630", explanation: "'oh-seven-seven-double-two, four-one-nine, six-three-oh'." },
          { id: "l6", number: 6, answer: ["tourist information"], answerDisplay: "tourist information", explanation: "'Outside the tourist information centre on Market Street.'" },
          { id: "l7", number: 7, answer: ["green", "bright green"], answerDisplay: "bright green", explanation: "'The guide will be wearing a bright green jacket.'" },
          { id: "l8", number: 8, answer: ["cash"], answerDisplay: "cash", explanation: "'pay the guide on the day — cash or card'." },
          { id: "l9", number: 9, answer: ["warm"], answerDisplay: "warm", explanation: "'something warm — it can get windy near the river'." },
          { id: "l10", number: 10, answer: ["flat"], answerDisplay: "flat", explanation: "'Completely flat' near the end of the conversation." },
        ],
      },
      // ---------- Section 2: Q11-20 ----------
      {
        id: "l-g3",
        part: 2,
        type: "mcq",
        heading: "Questions 11-14",
        instruction: "Choose the correct letter, A, B or C.",
        questions: [
          {
            id: "l11", number: 11,
            text: "The tomato bed was lost last summer because",
            options: [ { label: "A", text: "members watered it too much." }, { label: "B", text: "no one took responsibility for watering." }, { label: "C", text: "the hose was broken." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'everyone thought someone else was watering'.",
          },
          {
            id: "l12", number: 12,
            text: "How much does an individual plot cost per year?",
            options: [ { label: "A", text: "£2." }, { label: "B", text: "£12." }, { label: "C", text: "£20." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'twelve pounds a year'.",
          },
          {
            id: "l13", number: 13,
            text: "What is forbidden in the wildlife area?",
            options: [ { label: "A", text: "Walking quietly." }, { label: "B", text: "Feeding hedgehogs." }, { label: "C", text: "Picking wildflowers." } ],
            answer: ["C"], answerDisplay: "C", explanation: "'No digging there, please, and no picking the wildflowers.'",
          },
          {
            id: "l14", number: 14,
            text: "Members should use water from the blue barrels first because",
            options: [ { label: "A", text: "the tap is often turned off." }, { label: "B", text: "it is collected rainwater." }, { label: "C", text: "tap water harms the plants." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'we collect rainwater in the blue barrels — please use that first.'",
          },
        ],
      },
      {
        id: "l-g4",
        part: 2,
        type: "table-completion",
        heading: "Questions 15-20",
        instruction: "Complete the table below. Write ONE WORD ONLY for each answer.",
        wordLimit: "ONE WORD ONLY",
        table: {
          headers: ["Community garden — key facts", ""],
          rows: [
            ["Shared vegetable beds are closest to the", { gap: "l15" }],
            ["Waiting list for a plot: currently about two", { gap: "l16" }],
            ["Wildlife area contains a pond, a hedgehog box and a", { gap: "l17" }, "hotel"],
            ["The tool shed lock code starts with the year", { gap: "l18" }],
            ["Children must be with an adult near the", { gap: "l19" }],
            ["Monthly meeting: first Saturday, with coffee and", { gap: "l20" }],
          ],
        },
        questions: [
          { id: "l15", number: 15, answer: ["gate"], answerDisplay: "gate", explanation: "'closest to the gate' — the shared beds on the left." },
          { id: "l16", number: 16, answer: ["months"], answerDisplay: "months", explanation: "'the wait is currently about two months'." },
          { id: "l17", number: 17, answer: ["bee"], answerDisplay: "bee", explanation: "'long grass, a bee hotel and a hedgehog box'." },
          { id: "l18", number: 18, answer: ["1909", "nineteen oh-nine"], answerDisplay: "1909", explanation: "'the year the garden opened, nineteen oh-nine, backwards'." },
          { id: "l19", number: 19, answer: ["pond"], answerDisplay: "pond", explanation: "'they must be with an adult near the pond'." },
          { id: "l20", number: 20, answer: ["biscuits"], answerDisplay: "biscuits", explanation: "'coffee and planning — biscuits provided'." },
        ],
      },
      // ---------- Section 3: Q21-30 ----------
      {
        id: "l-g5",
        part: 3,
        type: "mcq",
        heading: "Questions 21-24",
        instruction: "Choose the correct letter, A, B or C.",
        questions: [
          {
            id: "l21", number: 21,
            text: "The tutor suggested Costa Rica because it",
            options: [ { label: "A", text: "has the cheapest electricity." }, { label: "B", text: "has run almost entirely on renewables." }, { label: "C", text: "banned fossil fuels completely." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'they've run on almost entirely renewable electricity for several years'.",
          },
          {
            id: "l22", number: 22,
            text: "In the rainy season, renewable generation reaches about",
            options: [ { label: "A", text: "89%." }, { label: "B", text: "98%." }, { label: "C", text: "99%." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'Ninety-eight in the rainy season'.",
          },
          {
            id: "l23", number: 23,
            text: "What does the woman say about dams?",
            options: [ { label: "A", text: "They damage rivers and displace villages." }, { label: "B", text: "They are too expensive to build." }, { label: "C", text: "They attract tourists." } ],
            answer: ["A"], answerDisplay: "A", explanation: "'the dams themselves damage rivers and displace villages'.",
          },
          {
            id: "l24", number: 24,
            text: "The tutor advised them to use",
            options: [ { label: "A", text: "street interviews." }, { label: "B", text: "a survey of local people." }, { label: "C", text: "a podcast or journal article." } ],
            answer: ["C"], answerDisplay: "C", explanation: "'She said find a podcast or a journal article instead.'",
          },
        ],
      },
      {
        id: "l-g6",
        part: 3,
        type: "form-completion",
        heading: "Questions 25-30",
        instruction: "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        wordLimit: "ONE WORD AND/OR A NUMBER",
        table: {
          headers: ["Presentation plan", ""],
          rows: [
            ["Focus country:", { gap: "l25" }],
            ["Chart type: rainy versus dry season — a", { gap: "l26" }, "chart"],
            ["Samira writes: introduction and country", { gap: "l27" }],
            ["Student's section: the chart and the problems / critical section — built by", { gap: "l28" }],
            ["Source to cite: the podcast called 'The", { gap: "l29" }, "'"],
            ["Rehearsal: Thursday, 2 p.m., library room", { gap: "l30" }],
          ],
        },
        questions: [
          { id: "l25", number: 25, answer: ["costa rica"], answerDisplay: "Costa Rica", explanation: "The tutor suggested Costa Rica." },
          { id: "l26", number: 26, answer: ["bar"], answerDisplay: "bar", explanation: "'A bar chart, rainy versus dry season.'" },
          { id: "l27", number: 27, answer: ["background"], answerDisplay: "background", explanation: "'I'll write the introduction and the country background'." },
          { id: "l28", number: 28, answer: ["the man", "man", "male student", "he"], answerDisplay: "the man (male student)", explanation: "He offers: 'you do the chart and the problems section' — he builds the chart." },
          { id: "l29", number: 29, answer: ["grid"], answerDisplay: "Grid", explanation: "'that energy podcast, \"The Grid\"'." },
          { id: "l30", number: 30, answer: ["four", "4"], answerDisplay: "4", explanation: "'Library room four is free at two.'" },
        ],
      },
      // ---------- Section 4: Q31-40 ----------
      {
        id: "l-g7",
        part: 4,
        type: "mcq",
        heading: "Questions 31-33",
        instruction: "Choose the correct letter, A, B or C.",
        questions: [
          {
            id: "l31", number: 31,
            text: "Tea was first recorded in China as",
            options: [ { label: "A", text: "a currency." }, { label: "B", text: "a medicine." }, { label: "C", text: "a gift for emperors." } ],
            answer: ["B"], answerDisplay: "B", explanation: "'Tea began... as a medicine.'",
          },
          {
            id: "l32", number: 32,
            text: "During the Tang dynasty, tea taxes helped pay for",
            options: [ { label: "A", text: "the imperial army." }, { label: "B", text: "new temples." }, { label: "C", text: "foreign merchants." } ],
            answer: ["A"], answerDisplay: "A", explanation: "'the duty on it helped fund the imperial army'.",
          },
          {
            id: "l33", number: 33,
            text: "Tea-drinking became fashionable at the English court because of",
            options: [ { label: "A", text: "a Portuguese merchant." }, { label: "B", text: "a royal marriage." }, { label: "C", text: "a Dutch ambassador." } ],
            answer: ["B"], answerDisplay: "B", explanation: "Catherine of Braganza's marriage to Charles II brought the habit; the court copied her.",
          },
        ],
      },
      {
        id: "l-g8",
        part: 4,
        type: "note-completion",
        heading: "Questions 34-40",
        instruction: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        wordLimit: "ONE WORD AND/OR A NUMBER",
        table: {
          headers: ["THE HISTORY OF TEA", ""],
          rows: [
            ["Tang dynasty: tea bricks were ground into", { gap: "l34" }, "and whisked"],
            ["1606: first Dutch shipment brought tea to Europe as a", { gap: "l35" }, "for the rich"],
            ["Britain paid for Chinese tea with", { gap: "l36" }, "grown in India"],
            ["This trade led to two wars in the", { gap: "l37" }, "century"],
            ["British plantations in Assam broke the Chinese", { gap: "l38" }],
            ["The tea bag was invented in America in about", { gap: "l39" }],
            ["Today more than", { gap: "l40" }, "billion cups are drunk daily"],
          ],
        },
        questions: [
          { id: "l34", number: 34, answer: ["powder"], answerDisplay: "powder", explanation: "'ground into powder and whisked'." },
          { id: "l35", number: 35, answer: ["luxury"], answerDisplay: "luxury", explanation: "'as a luxury for the very rich'." },
          { id: "l36", number: 36, answer: ["opium"], answerDisplay: "opium", explanation: "'The solution was opium grown in India'." },
          { id: "l37", number: 37, answer: ["19th", "nineteenth", "nineteenth century", "19th century"], answerDisplay: "nineteenth (19th)", explanation: "'it led to two wars in the nineteenth century'." },
          { id: "l38", number: 38, answer: ["monopoly"], answerDisplay: "monopoly", explanation: "'Assam and Ceylon tea had broken the Chinese monopoly'." },
          { id: "l39", number: 39, answer: ["1908", "nineteen oh eight"], answerDisplay: "1908", explanation: "'the tea bag, invented in America around nineteen oh eight'." },
          { id: "l40", number: 40, answer: ["two", "2"], answerDisplay: "two", explanation: "'over two billion cups are drunk every day'." },
        ],
      },
    ],
  },

  // ================= WRITING =================
  writing: {
    minutes: 60,
    tasks: [
      {
        id: "w1",
        taskNumber: 1,
        suggestedMinutes: 20,
        minimumWords: 150,
        prompt:
          "The chart below shows the number of households in one city that recycled paper, glass and plastic in 2010, 2015 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        chart: {
          type: "bar",
          title: "Households recycling, by material (thousands)",
          unit: "thousand households",
          categories: ["2010", "2015", "2020"],
          series: [
            { name: "Paper", values: [38, 52, 61] },
            { name: "Glass", values: [24, 31, 55] },
            { name: "Plastic", values: [15, 29, 58] },
          ],
        },
        sampleAnswer:
          "The bar chart compares how many households in a single city recycled paper, glass and plastic in three separate years: 2010, 2015 and 2020. Overall, recycling became far more common over the decade, and while paper was the most widely recycled material at the start, by 2020 the three materials were recycled at almost the same level. In 2010, paper was clearly the most recycled material, with 38 thousand households taking part, compared with 24 thousand for glass and only 15 thousand for plastic. Over the following five years, all three figures rose moderately, and paper remained in the lead at 52 thousand. The most striking change occurred in the final five-year period. Between 2015 and 2020, the number of households recycling plastic nearly doubled, from 29 thousand to 58 thousand, while glass recycling climbed from 31 thousand to 55 thousand. Paper, which had grown only slightly in the second period, rose again to 61 thousand. As a result, the gap that had separated the three materials in 2010 had almost disappeared by 2020, when plastic and glass were recycled by only marginally fewer households than paper. This suggests that campaigns targeting plastic and glass recycling during the decade were largely successful.",
        checklist: [
          "آیا مقدمه یک جمله بازنویسی‌شدهٔ صورت سوال دارد؟ (paraphrase)",
          "آیا یک جمله Overview حرکت کلی داده‌ها را می‌گوید؟",
          "آیا داده‌های کلیدی (بالاترین/پایین‌ترین/تغییر بزرگ) گزارش شده‌اند؟",
          "آیا مقایسه بین مواد و سال‌ها انجام شده؟",
          "آیا حداقل ۱۵۰ کلمه نوشته‌اید؟",
        ],
      },
      {
        id: "w2",
        taskNumber: 2,
        suggestedMinutes: 40,
        minimumWords: 250,
        prompt:
          "Some people believe that children should start learning a foreign language at primary school, while others believe it is better to wait until secondary school. Discuss both views and give your own opinion.",
        bullets: [
          "مطلب هر دیدگاه را با توضیح بنویسید",
          "نظر خودتان را واضح بیان کنید",
          "از مثال یا تجربه برای پشتیبانی استفاده کنید",
        ],
        sampleAnswer:
          "The question of when children should begin studying a second language divides opinion among educators and parents. While some argue that primary school is the ideal starting point, others contend that delaying the process until secondary school produces better results. In my view, an early start brings advantages that outweigh the difficulties. Those who support an early beginning usually point to young children's remarkable ability to absorb language. Primary-age learners imitate pronunciation without self-consciousness, and they can accumulate years of exposure before academic pressure builds. In countries such as Sweden, where English lessons begin at around age six, most citizens grow up speaking the language fluently, suggesting that early exposure works. Furthermore, learning a language at a young age appears to train the brain: studies report better problem-solving and multitasking among bilingual children. On the other hand, supporters of a later start argue that secondary students learn more efficiently because they understand grammar logically and can study independently. They also note that primary school timetables are already crowded, and a poorly taught early programme may create confusion or boredom that lasts for years. In addition, adolescents can make rapid progress in a short time because they are motivated by clear goals such as university admission or travel. Nevertheless, I believe efficiency is not the only measure that matters. Confidence and enjoyment, once lost, are difficult to rebuild, and children who start early treat the new language as a normal part of life rather than a school subject to be survived. A well-designed primary programme, taught through songs, games and stories, builds exactly this attitude. In conclusion, although teenagers may study grammar faster, the natural fluency and confidence that come from an early start are harder to gain later. I therefore support introducing foreign languages at primary school, provided the lessons are playful and well resourced.",
        checklist: [
          "آیا هر دو دیدگاه به‌طور کامل بررسی شده‌اند؟",
          "آیا نظر خودتان به‌وضوح بیان و از آن دفاع شده؟",
          "آیا هر پاراگراف یک ایدهٔ اصلی دارد؟",
          "آیا از مثال یا دلیل مشخص استفاده کرده‌اید؟",
          "آیا حداقل ۲۵۰ کلمه نوشته‌اید؟",
        ],
      },
    ],
  },
};
