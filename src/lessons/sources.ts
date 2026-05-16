import {
  POSITION_STAGES,
  SHORT_SENTENCES,
  LONG_PASSAGES,
  MAX_WORD_LEVEL,
  positionStageLines,
  wordsAtLevel,
  findShortSentenceLesson,
  findLongPassageLesson,
  findPositionStage,
} from './data'

export type SectionKind = 'position' | 'words' | 'sentences'

const POSITION_RE = /^position-(\d+)$/
const WORDS_RE = /^words-(\d+|all)$/
const SHORT_RE = /^sentence-(short-\d+)$/
const LONG_RE = /^sentence-(long-\d+)$/

export const positionSource = (stageId: number): string => `position-${stageId}`
export const wordsSource = (level: number | 'all'): string => `words-${level}`
export const sentenceSource = (lessonId: string): string => `sentence-${lessonId}`

export const linesForSource = (source: string): string[] => {
  const pos = source.match(POSITION_RE)
  if (pos) return positionStageLines(parseInt(pos[1], 10))

  const words = source.match(WORDS_RE)
  if (words) {
    const level = words[1] === 'all' ? MAX_WORD_LEVEL : parseInt(words[1], 10)
    return wordsAtLevel(level)
  }

  const short = source.match(SHORT_RE)
  if (short) {
    const l = findShortSentenceLesson(short[1])
    return l ? l.lines : []
  }

  const long = source.match(LONG_RE)
  if (long) {
    const l = findLongPassageLesson(long[1])
    return l ? l.lines : []
  }

  return []
}

export const sourceLabel = (source: string): string => {
  const pos = source.match(POSITION_RE)
  if (pos) {
    const stage = findPositionStage(parseInt(pos[1], 10))
    return stage?.title ?? source
  }

  const words = source.match(WORDS_RE)
  if (words) {
    if (words[1] === 'all') return '단어연습 — 전체'
    return `단어연습 — ${words[1]}단계까지`
  }

  const short = source.match(SHORT_RE)
  if (short) {
    const l = findShortSentenceLesson(short[1])
    return l ? `짧은 문장 — ${l.title}` : source
  }

  const long = source.match(LONG_RE)
  if (long) {
    const l = findLongPassageLesson(long[1])
    return l ? `긴 글 — ${l.title}` : source
  }

  return source
}

export const isValidSource = (source: string): boolean =>
  linesForSource(source).length > 0

export const sectionOfSource = (source: string): SectionKind | null => {
  if (POSITION_RE.test(source)) return 'position'
  if (WORDS_RE.test(source)) return 'words'
  if (SHORT_RE.test(source) || LONG_RE.test(source)) return 'sentences'
  return null
}

export const isSourceRankingEligible = (source: string): boolean =>
  SHORT_RE.test(source) || LONG_RE.test(source)

export const POSITION_OPTIONS = POSITION_STAGES.map((s) => ({
  value: positionSource(s.id),
  label: s.title,
}))

export const WORD_OPTIONS: { value: string; label: string }[] = [
  ...Array.from({ length: MAX_WORD_LEVEL - 1 }, (_, i) => {
    const lvl = i + 1
    return { value: wordsSource(lvl), label: `${lvl}단계까지` }
  }),
  { value: wordsSource('all'), label: '전체' },
]

export const SHORT_OPTIONS = SHORT_SENTENCES.map((l) => ({
  value: sentenceSource(l.id),
  label: l.title,
}))

export const LONG_OPTIONS = LONG_PASSAGES.map((l) => ({
  value: sentenceSource(l.id),
  label: l.title,
}))
