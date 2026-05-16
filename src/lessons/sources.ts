import {
  POSITION_STAGES,
  SHORT_SENTENCES,
  LONG_PASSAGES,
  MAX_WORD_LEVEL,
  positionStageLines,
  wordsAtLevel,
  findPositionStage,
} from './data'

export type SectionKind = 'position' | 'words' | 'sentences'

const POSITION_RE = /^position-(\d+)$/
const WORDS_RE = /^words-(\d+|all)$/
const SENTENCES_SHORT = 'sentences-short'
const SENTENCES_LONG = 'sentences-long'

export const positionSource = (stageId: number): string => `position-${stageId}`
export const wordsSource = (level: number | 'all'): string => `words-${level}`
export const sentencesShortSource = (): string => SENTENCES_SHORT
export const sentencesLongSource = (): string => SENTENCES_LONG

const shortLines = (): string[] => SHORT_SENTENCES.flatMap((l) => l.lines)
const longLines = (): string[] => LONG_PASSAGES.flatMap((l) => l.lines)

export const linesForSource = (source: string): string[] => {
  const pos = source.match(POSITION_RE)
  if (pos) return positionStageLines(parseInt(pos[1], 10))

  const words = source.match(WORDS_RE)
  if (words) {
    const level = words[1] === 'all' ? MAX_WORD_LEVEL : parseInt(words[1], 10)
    return wordsAtLevel(level)
  }

  if (source === SENTENCES_SHORT) return shortLines()
  if (source === SENTENCES_LONG) return longLines()

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

  if (source === SENTENCES_SHORT) return '문장연습 — 짧은 문장'
  if (source === SENTENCES_LONG) return '문장연습 — 긴 글'

  return source
}

export const isValidSource = (source: string): boolean =>
  linesForSource(source).length > 0

export const sectionOfSource = (source: string): SectionKind | null => {
  if (POSITION_RE.test(source)) return 'position'
  if (WORDS_RE.test(source)) return 'words'
  if (source === SENTENCES_SHORT || source === SENTENCES_LONG) return 'sentences'
  return null
}

export const isSourceRankingEligible = (source: string): boolean =>
  source === SENTENCES_SHORT || source === SENTENCES_LONG

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

export const SENTENCE_OPTIONS: { value: string; label: string }[] = [
  { value: SENTENCES_SHORT, label: '짧은 문장' },
  { value: SENTENCES_LONG, label: '긴 글' },
]
