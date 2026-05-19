import type { PositionStage, SentenceLesson } from './types'

// Position stages for English (TypingClub-style)
// 1: home row (asdf jkl;), 2: + g/h, 3: top row (qwerty uiop),
// 4: bottom row (zxcv bnm), 5: Shift / capitalization,
// 6: numbers, 7: punctuation & mixed
// 자리연습은 한 줄에 한 토큰(글자/단어/숫자)만. 다중 단어 문장은 문장연습 섹션에서.
export const POSITION_STAGES_EN: PositionStage[] = [
  {
    id: 1,
    title: '1단계 — Home Row',
    description: '왼손 A S D F · 오른손 J K L 자리. 손가락이 자연스럽게 놓이는 위치.',
    lessons: [
      {
        id: 'en-1.1',
        title: '글자',
        lines: ['a', 's', 'd', 'f', 'j', 'k', 'l'],
      },
      {
        id: 'en-1.2',
        title: '두 글자 조합',
        lines: [
          'as', 'ad', 'af', 'ak', 'al',
          'sa', 'sd', 'sf', 'sk', 'sl',
          'da', 'ds', 'df', 'dk', 'dl',
          'fa', 'fs', 'fd', 'fk', 'fl',
          'ja', 'js', 'jd', 'jk', 'jl',
          'ka', 'ks', 'kd', 'kj', 'kl',
          'la', 'ls', 'ld', 'lj', 'lk',
        ],
      },
      {
        id: 'en-1.3',
        title: '단어',
        lines: [
          'as', 'ad', 'all', 'add', 'ask',
          'sad', 'lad', 'lass', 'salad',
          'dad', 'fad', 'fall', 'falls',
          'flask', 'lads', 'salads', 'asks',
        ],
      },
    ],
  },
  {
    id: 2,
    title: '2단계 — G H 자리',
    description: '검지가 안쪽으로 뻗는 G H 자리. 1단계와 결합.',
    lessons: [
      {
        id: 'en-2.1',
        title: '글자',
        lines: ['g', 'h'],
      },
      {
        id: 'en-2.2',
        title: '짧은 단어',
        lines: [
          'had', 'has', 'hag', 'gag', 'gas',
          'jag', 'sag', 'lag', 'ash', 'gal',
        ],
      },
      {
        id: 'en-2.3',
        title: '긴 단어',
        lines: [
          'glad', 'half', 'hall', 'flag', 'flags',
          'flash', 'gala', 'gash', 'shag', 'shall',
          'lash', 'dash', 'hash', 'gash',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '3단계 — 윗줄 (Top Row)',
    description: 'Q W E R T Y U I O P 윗줄. 영어에서 자주 쓰이는 키들.',
    lessons: [
      {
        id: 'en-3.1',
        title: '글자',
        lines: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      },
      {
        id: 'en-3.2',
        title: '짧은 단어',
        lines: [
          'we', 'is', 'it', 'if', 'or', 'to', 'do', 'so', 'go', 'no', 'us', 'up',
          'the', 'are', 'you', 'her', 'his', 'why', 'who', 'top', 'tip', 'pot',
          'put', 'pet', 'set', 'get', 'let', 'yet', 'tea', 'see', 'eye', 'try',
        ],
      },
      {
        id: 'en-3.3',
        title: '긴 단어',
        lines: [
          'water', 'paper', 'after', 'other', 'order',
          'happy', 'apple', 'party', 'story', 'three',
          'great', 'write', 'right', 'world', 'first',
          'house', 'large', 'place', 'today', 'still',
          'quote', 'quiet', 'queue', 'report', 'output',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '4단계 — 아랫줄 (Bottom Row)',
    description: 'Z X C V B N M 아랫줄. 알파벳 전체 소문자 완성.',
    lessons: [
      {
        id: 'en-4.1',
        title: '글자',
        lines: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      },
      {
        id: 'en-4.2',
        title: '짧은 단어',
        lines: [
          'man', 'can', 'and', 'but', 'not', 'one',
          'now', 'new', 'come', 'some', 'time', 'name',
          'much', 'most', 'made', 'mean',
          'box', 'fix', 'mix', 'six', 'tax', 'zoo',
          'cab', 'van', 'ban', 'bin', 'jam', 'ham',
          'bag', 'big', 'bug', 'bus', 'cup', 'cut',
        ],
      },
      {
        id: 'en-4.3',
        title: '긴 단어',
        lines: [
          'maybe', 'about', 'above', 'human', 'number',
          'common', 'become', 'remember', 'family', 'friend',
          'before', 'between', 'window', 'morning', 'evening',
          'minute', 'simple', 'animal', 'people', 'student',
          'never', 'jazz', 'fuzzy', 'buzz', 'pizza',
        ],
      },
    ],
  },
  {
    id: 5,
    title: '5단계 — Shift / 대문자',
    description: '왼손 키를 칠 때는 오른손 새끼손가락 Shift, 오른손 키는 왼손 새끼손가락 Shift.',
    lessons: [
      {
        id: 'en-5.1',
        title: '단일 대문자',
        lines: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
      },
      {
        id: 'en-5.2',
        title: '사람 이름',
        lines: [
          'John', 'Mary', 'Tom', 'Anna', 'David',
          'Sarah', 'Michael', 'Emma', 'James', 'Olivia',
          'Daniel', 'Sophia', 'Robert', 'Linda', 'Peter',
        ],
      },
      {
        id: 'en-5.3',
        title: '도시 · 나라',
        lines: [
          'Seoul', 'London', 'Paris', 'Tokyo', 'Boston',
          'Korea', 'Japan', 'France', 'England',
          'America', 'Canada', 'Mexico', 'Berlin', 'Madrid',
        ],
      },
    ],
  },
  {
    id: 6,
    title: '6단계 — 숫자',
    description: '1 2 3 4 5 6 7 8 9 0 윗줄. 각 손가락의 자연스러운 확장.',
    lessons: [
      {
        id: 'en-6.1',
        title: '숫자',
        lines: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      },
      {
        id: 'en-6.2',
        title: '짧은 숫자 조합',
        lines: [
          '12', '34', '56', '78', '90',
          '123', '456', '789', '012',
          '1234', '5678', '9012',
        ],
      },
      {
        id: 'en-6.3',
        title: '긴 숫자',
        lines: [
          '12345', '67890', '1024', '2048', '4096', '8192',
          '2025', '2026', '1999', '2000', '2010',
          '100200', '300400', '500600',
        ],
      },
    ],
  },
  {
    id: 7,
    title: '7단계 — 기호 · 전체',
    description: '쉼표, 마침표, 따옴표, 물음표 등 자주 쓰는 기호와 전체 종합 단어.',
    lessons: [
      {
        id: 'en-7.1',
        title: '기호',
        lines: [
          '.', ',', '?', '!', "'", '"', '-', ':', ';', '...',
        ],
      },
      {
        id: 'en-7.2',
        title: '단어 + 구두점',
        lines: [
          'Hello!', 'World!', 'Yes,', 'No.', 'Wait?', 'Stop!',
          'Maybe?', 'Sorry,', 'Thanks!', 'Okay.', 'Right!', 'Done.',
          "It's", "don't", "can't", "I'm", "you're", "we're", "they're",
          'time.', 'place,', 'name?',
        ],
      },
      {
        id: 'en-7.3',
        title: '전체 자판 종합',
        lines: [
          'jumps', 'quick', 'brown', 'lazy', 'over',
          'practice', 'perfect', 'patience', 'thousand', 'wisdom',
          'journey', 'language', 'computer', 'beautiful', 'experience',
          'knowledge', 'sentence', 'keyboard', 'machine', 'morning',
        ],
      },
    ],
  },
]

// Common English words. Curated for typing practice.
// Level mapping uses lowercase letters only.
const WORD_BUCKETS_EN: string[][] = [
  // Level 1 (home row only: a s d f j k l ;)
  [
    'a', 'as', 'ad', 'all', 'add', 'ask', 'fall', 'falls',
    'sad', 'lad', 'lads', 'lass', 'salad', 'salads',
    'dad', 'dads', 'fads', 'fall', 'flask',
    'sass', 'lads', 'asks',
  ],
  // Level 2 (+ g, h)
  [
    'had', 'has', 'hag', 'gag', 'gas', 'glad',
    'half', 'hall', 'halls', 'hash', 'lash', 'dash',
    'gala', 'flash', 'shall', 'flag', 'flags',
    'shag', 'jag', 'gash', 'sag',
  ],
  // Level 3 (+ top row letters: q w e r t y u i o p)
  [
    'we', 'you', 'are', 'the', 'her', 'his', 'they',
    'were', 'their', 'there', 'here', 'where',
    'water', 'paper', 'after', 'other', 'order',
    'happy', 'apple', 'party', 'story', 'three',
    'great', 'write', 'right', 'world', 'first',
    'house', 'large', 'place', 'today', 'still',
    'quiet', 'quote', 'paper', 'tiger', 'piper',
    'play', 'stay', 'tray', 'sphere', 'reader',
    'fast', 'last', 'past', 'task', 'tasks',
    'hate', 'late', 'gate', 'date', 'plate',
    'sleep', 'teeth', 'sheet', 'feet', 'free',
    'help', 'fish', 'this', 'that', 'with',
    'is', 'it', 'if', 'of', 'or', 'to', 'do',
    'so', 'go', 'no', 'up', 'us', 'we',
  ],
  // Level 4 (+ bottom row: z x c v b n m) — full lowercase alphabet
  [
    'man', 'can', 'and', 'but', 'not', 'one', 'now', 'new',
    'know', 'come', 'some', 'time', 'name', 'much', 'most',
    'made', 'mean', 'many', 'much', 'main',
    'box', 'fix', 'mix', 'six', 'tax',
    'zoo', 'jazz', 'fuzzy', 'buzz', 'pizza',
    'never', 'maybe', 'about', 'above', 'human',
    'number', 'common', 'become', 'remember',
    'family', 'friend', 'before', 'between',
    'window', 'morning', 'evening', 'minute',
    'simple', 'easy', 'quick', 'small', 'big',
    'long', 'short', 'high', 'low', 'fast',
    'better', 'best', 'worst', 'first', 'last',
    'every', 'never', 'always', 'sometimes',
    'because', 'beyond', 'within', 'around',
    'enjoy', 'study', 'learn', 'teach', 'write',
    'speak', 'listen', 'think', 'remember',
    'morning', 'afternoon', 'evening', 'night',
    'school', 'office', 'kitchen', 'garden',
    'animal', 'people', 'person', 'student',
    'teacher', 'doctor', 'driver', 'painter',
    'music', 'movie', 'photo', 'video',
    'travel', 'journey', 'holiday', 'vacation',
    'breakfast', 'lunch', 'dinner', 'coffee',
    'mountain', 'river', 'forest', 'ocean',
    'spring', 'summer', 'autumn', 'winter',
    'sunday', 'monday', 'friday', 'saturday',
    'happy', 'sad', 'angry', 'calm', 'tired',
    'open', 'close', 'enter', 'leave',
    'computer', 'keyboard', 'mouse', 'screen',
    'program', 'software', 'website', 'internet',
  ],
]

const WORDS_SET_EN = new Set<string>(WORD_BUCKETS_EN.flat())
export const WORDS_EN: string[] = Array.from(WORDS_SET_EN)

export const SHORT_SENTENCES_EN: SentenceLesson[] = [
  {
    id: 'en-short-1',
    title: 'Greetings',
    lines: [
      'Hello, how are you?',
      'Good morning everyone.',
      'Nice to meet you.',
      'Have a great day.',
      'See you tomorrow.',
      'Thank you very much.',
      'You are welcome.',
      'How was your weekend?',
      'Take care of yourself.',
    ],
  },
  {
    id: 'en-short-2',
    title: 'Self-introduction',
    lines: [
      'My name is John.',
      'I am from Korea.',
      'I live in Seoul.',
      'I am a student.',
      'I study computer science.',
      'I like reading books.',
      'My hobby is playing music.',
      'I have one brother and one sister.',
      'It is nice to be here.',
    ],
  },
  {
    id: 'en-short-3',
    title: 'Weather',
    lines: [
      'It is sunny today.',
      'The sky is clear and blue.',
      'It looks like rain.',
      'The wind is cold this evening.',
      'It snowed all night.',
      'Tomorrow will be warmer.',
      'The forecast says cloudy.',
      'A storm is coming.',
      'The weather is perfect for a walk.',
    ],
  },
  {
    id: 'en-short-4',
    title: 'Daily life',
    lines: [
      'I wake up at seven in the morning.',
      'I drink coffee before work.',
      'I take the bus to the office.',
      'I eat lunch with my friends.',
      'I read a book before bed.',
      'I go for a walk after dinner.',
      'I write in my journal every night.',
      'I cook dinner on Sundays.',
      'I water the plants in the morning.',
    ],
  },
  {
    id: 'en-short-5',
    title: 'Learning',
    lines: [
      'Practice every day to improve.',
      'Mistakes help you learn faster.',
      'Read a little, write a little.',
      'Focus on accuracy first.',
      'Speed will follow with time.',
      'Keep your fingers on the home row.',
      'Look at the screen, not the keys.',
      'Take a short break every hour.',
      'A calm mind types faster.',
    ],
  },
  {
    id: 'en-short-6',
    title: 'Food',
    lines: [
      'I would like a cup of tea.',
      'Could I have the menu, please?',
      'This soup is delicious.',
      'I am vegetarian.',
      'The bread is fresh and warm.',
      'Let us share a dessert.',
      'I prefer water over juice.',
      'Could you pass the salt?',
      'Dinner is ready in five minutes.',
    ],
  },
  {
    id: 'en-short-7',
    title: 'Travel',
    lines: [
      'Where is the nearest station?',
      'How long does it take by train?',
      'I would like a window seat.',
      'Could you call a taxi for me?',
      'The flight is delayed by one hour.',
      'I lost my passport.',
      'Is breakfast included?',
      'We are sightseeing in the old town.',
      'I love walking in new cities.',
    ],
  },
  {
    id: 'en-short-8',
    title: 'Work',
    lines: [
      'I have a meeting at ten.',
      'Could you send the report today?',
      'The deadline is next Friday.',
      'Let us reschedule the call.',
      'I am working from home this week.',
      'The team did a great job.',
      'Please review the latest draft.',
      'I will follow up by email.',
      'We need a quick sync after lunch.',
    ],
  },
  {
    id: 'en-short-9',
    title: 'Hobbies',
    lines: [
      'I enjoy reading novels on weekends.',
      'I started learning guitar this year.',
      'Painting helps me relax.',
      'I run three times a week.',
      'I am taking a photography class.',
      'I love hiking in the mountains.',
      'Cooking is my favorite activity.',
      'I play chess online in the evening.',
      'Gardening is harder than it looks.',
    ],
  },
  {
    id: 'en-short-10',
    title: 'Plans',
    lines: [
      'I am planning a trip to Japan.',
      'Let us meet at the cafe at six.',
      'I will call you back later.',
      'We are going to the movies tonight.',
      'My family is coming to visit.',
      'I want to learn a new language.',
      'I am saving for a new laptop.',
      'I plan to wake up earlier next week.',
      'Let us catch up over coffee soon.',
    ],
  },
  {
    id: 'en-short-11',
    title: 'Encouragement',
    lines: [
      'You are doing a great job.',
      'Keep going, you are almost there.',
      'Believe in yourself.',
      'Every step counts.',
      'Be patient with yourself.',
      'Small progress is still progress.',
      'You learn more from failure than success.',
      'Today is a good day to start.',
      'Trust the process and stay calm.',
    ],
  },
  {
    id: 'en-short-12',
    title: 'Questions',
    lines: [
      'What is your favorite book?',
      'Where did you grow up?',
      'How long have you lived here?',
      'Which city would you like to visit?',
      'When is your birthday?',
      'Why did you choose this field?',
      'Who is your favorite author?',
      'What time should we meet?',
      'How was the concert last night?',
    ],
  },
]

// Long passages — all from public domain classics (Project Gutenberg).
// Each lesson is 5–6 sentences from the source, lightly trimmed.
export const LONG_PASSAGES_EN: SentenceLesson[] = [
  {
    id: 'en-long-1',
    title: 'Pride and Prejudice — Jane Austen',
    lines: [
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
      'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.',
      'That he is considered the rightful property of some one or other of their daughters.',
      'My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?',
      'Mr. Bennet replied that he had not.',
    ],
  },
  {
    id: 'en-long-2',
    title: 'Sherlock Holmes — Arthur Conan Doyle',
    lines: [
      'To Sherlock Holmes she is always the woman.',
      'I have seldom heard him mention her under any other name.',
      'In his eyes she eclipses and predominates the whole of her sex.',
      'It was not that he felt any emotion akin to love for Irene Adler.',
      'All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.',
    ],
  },
  {
    id: 'en-long-3',
    title: 'Alice in Wonderland — Lewis Carroll',
    lines: [
      'Alice was beginning to get very tired of sitting by her sister on the bank.',
      'And of having nothing to do.',
      'Once or twice she had peeped into the book her sister was reading.',
      'But it had no pictures or conversations in it.',
      'And what is the use of a book, thought Alice, without pictures or conversations?',
    ],
  },
  {
    id: 'en-long-4',
    title: 'A Tale of Two Cities — Charles Dickens',
    lines: [
      'It was the best of times, it was the worst of times.',
      'It was the age of wisdom, it was the age of foolishness.',
      'It was the epoch of belief, it was the epoch of incredulity.',
      'It was the season of light, it was the season of darkness.',
      'It was the spring of hope, it was the winter of despair.',
    ],
  },
  {
    id: 'en-long-5',
    title: 'Walden — Henry David Thoreau',
    lines: [
      'I went to the woods because I wished to live deliberately.',
      'To front only the essential facts of life.',
      'And see if I could not learn what it had to teach.',
      'And not, when I came to die, discover that I had not lived.',
      'I did not wish to live what was not life, living is so dear.',
    ],
  },
  {
    id: 'en-long-6',
    title: 'The Adventures of Tom Sawyer — Mark Twain',
    lines: [
      'Tom appeared on the sidewalk with a bucket of whitewash and a long-handled brush.',
      'He surveyed the fence, and all gladness left him and a deep melancholy settled down upon his spirit.',
      'Thirty yards of board fence nine feet high.',
      'Life to him seemed hollow, and existence but a burden.',
      'Sighing, he dipped his brush and passed it along the topmost plank.',
    ],
  },
  {
    id: 'en-long-7',
    title: "Aesop's Fables — The Tortoise and the Hare",
    lines: [
      'A hare one day ridiculed the short feet and slow pace of the tortoise.',
      'The latter, laughing, said: Though you be swift as the wind, I will beat you in a race.',
      'The hare, deeming her assertion to be impossible, agreed to the proposal.',
      'They agreed that the fox should choose the course, and fix the goal.',
      'On the day appointed for the race, the two started together.',
      'Slow and steady wins the race.',
    ],
  },
  {
    id: 'en-long-8',
    title: 'Treasure Island — Robert Louis Stevenson',
    lines: [
      'I remember him as if it were yesterday, as he came plodding to the inn door.',
      'His sea-chest following behind him in a hand-barrow.',
      'A tall, strong, heavy, nut-brown man.',
      'His tarry pigtail falling over the shoulders of his soiled blue coat.',
      'His hands ragged and scarred, with black, broken nails.',
    ],
  },
  {
    id: 'en-long-9',
    title: 'Frankenstein — Mary Shelley',
    lines: [
      'You will rejoice to hear that no disaster has accompanied the commencement of an enterprise.',
      'Which you have regarded with such evil forebodings.',
      'I arrived here yesterday, and my first task is to assure my dear sister of my welfare.',
      'And increasing confidence in the success of my undertaking.',
      'I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks.',
    ],
  },
  {
    id: 'en-long-10',
    title: 'Robinson Crusoe — Daniel Defoe',
    lines: [
      'I was born in the year 1632, in the city of York, of a good family.',
      'Though not of that country, my father being a foreigner of Bremen.',
      'Who settled first at Hull, and got a good estate by merchandise.',
      'Leaving off his trade, he lived afterwards at York.',
      'From whence he had married my mother, whose relations were named Robinson.',
    ],
  },
  {
    id: 'en-long-11',
    title: 'The Picture of Dorian Gray — Oscar Wilde',
    lines: [
      'The studio was filled with the rich odour of roses.',
      'And when the light summer wind stirred amidst the trees of the garden.',
      'There came through the open door the heavy scent of the lilac.',
      'Or the more delicate perfume of the pink-flowering thorn.',
      'From the corner of the divan of Persian saddlebags on which he was lying.',
    ],
  },
  {
    id: 'en-long-12',
    title: 'The Art of War — Sun Tzu',
    lines: [
      'The art of war is of vital importance to the State.',
      'It is a matter of life and death, a road either to safety or to ruin.',
      'Hence it is a subject of inquiry which can on no account be neglected.',
      'The art of war, then, is governed by five constant factors.',
      'These are: the moral law, heaven, earth, the commander, and method and discipline.',
    ],
  },
  {
    id: 'en-long-13',
    title: 'Moby Dick — Herman Melville',
    lines: [
      'Call me Ishmael.',
      'Some years ago, never mind how long precisely, having little or no money in my purse.',
      'And nothing particular to interest me on shore, I thought I would sail about a little.',
      'And see the watery part of the world.',
      'It is a way I have of driving off the spleen and regulating the circulation.',
    ],
  },
]

// Key level mapping — used to compute the highest stage required for a word.
// Only lowercase letters are mapped; words with capitals or punctuation are
// out of scope for level computation (they live in stages 5 / 7).
const KEY_LEVEL_EN: Record<string, number> = {
  // Stage 1: home row
  a: 1, s: 1, d: 1, f: 1, j: 1, k: 1, l: 1, ';': 1,
  // Stage 2: + g h
  g: 2, h: 2,
  // Stage 3: top row
  q: 3, w: 3, e: 3, r: 3, t: 3, y: 3, u: 3, i: 3, o: 3, p: 3,
  // Stage 4: bottom row
  z: 4, x: 4, c: 4, v: 4, b: 4, n: 4, m: 4,
}

// Words go up to level 4 (full lowercase alphabet). Stages 5–7 are special
// practice (Shift / numbers / punctuation) and not used for word filtering.
export const MAX_WORD_LEVEL_EN = 4

export const wordRequiredStageEn = (text: string): number => {
  let max = 1
  for (const ch of text.toLowerCase()) {
    const lvl = KEY_LEVEL_EN[ch]
    if (lvl && lvl > max) max = lvl
  }
  return max
}

const WORDS_BY_LEVEL_EN: Map<number, string[]> = (() => {
  const m = new Map<number, string[]>()
  for (let i = 1; i <= MAX_WORD_LEVEL_EN; i++) m.set(i, [])
  for (const w of WORDS_EN) {
    const lvl = Math.min(MAX_WORD_LEVEL_EN, wordRequiredStageEn(w))
    for (let i = lvl; i <= MAX_WORD_LEVEL_EN; i++) {
      m.get(i)!.push(w)
    }
  }
  return m
})()

export const wordsAtLevelEn = (maxLevel: number): string[] => {
  const lvl = Math.max(1, Math.min(MAX_WORD_LEVEL_EN, maxLevel))
  return WORDS_BY_LEVEL_EN.get(lvl) ?? []
}

export const findPositionStageEn = (id: number) =>
  POSITION_STAGES_EN.find((s) => s.id === id) ?? null

export const positionStageLinesEn = (id: number): string[] => {
  const s = findPositionStageEn(id)
  return s ? s.lessons.flatMap((l) => l.lines) : []
}
