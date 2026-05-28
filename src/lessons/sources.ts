import {
  POSITION_STAGES,
  SHORT_SENTENCES,
  LONG_PASSAGES,
  MAX_WORD_LEVEL,
  positionStageLines,
  wordsAtLevel,
  findPositionStage,
} from './data'
import {
  POSITION_STAGES_EN,
  SHORT_SENTENCES_EN,
  LONG_PASSAGES_EN,
  MAX_WORD_LEVEL_EN,
  positionStageLinesEn,
  wordsAtLevelEn,
  findPositionStageEn,
} from './data-en'
import { decomposeText } from '../hangul'

export type Lang = 'ko' | 'en'

export type SectionKind = 'position' | 'words' | 'sentences'

// ----- Korean source patterns (legacy, no prefix) -----
const POSITION_RE = /^position-(\d+)$/
const WORDS_RE = /^words-(\d+|all)$/
const SENTENCES_SHORT = 'sentences-short'
const SENTENCES_LONG = 'sentences-long'

// ----- English source patterns (en- prefix) -----
const EN_POSITION_RE = /^en-position-(\d+)$/
const EN_WORDS_RE = /^en-words-(\d+|all)$/
const EN_SENTENCES_SHORT = 'en-sentences-short'
const EN_SENTENCES_LONG = 'en-sentences-long'

export const positionSource = (stageId: number): string => `position-${stageId}`
export const wordsSource = (level: number | 'all'): string => `words-${level}`
export const sentencesShortSource = (): string => SENTENCES_SHORT
export const sentencesLongSource = (): string => SENTENCES_LONG

export const positionSourceEn = (stageId: number): string => `en-position-${stageId}`
export const wordsSourceEn = (level: number | 'all'): string => `en-words-${level}`
export const sentencesShortSourceEn = (): string => EN_SENTENCES_SHORT
export const sentencesLongSourceEn = (): string => EN_SENTENCES_LONG

const shortLines = (): string[] => SHORT_SENTENCES.flatMap((l) => l.lines)
const longLines = (): string[] => LONG_PASSAGES.flatMap((l) => l.lines)
const shortLinesEn = (): string[] => SHORT_SENTENCES_EN.flatMap((l) => l.lines)
const longLinesEn = (): string[] => LONG_PASSAGES_EN.flatMap((l) => l.lines)

export const langOfSource = (source: string): Lang => {
  if (source.startsWith('en-')) return 'en'
  return 'ko'
}

export const linesForSource = (source: string): string[] => {
  // English
  const enPos = source.match(EN_POSITION_RE)
  if (enPos) return positionStageLinesEn(parseInt(enPos[1], 10))

  const enWords = source.match(EN_WORDS_RE)
  if (enWords) {
    const level = enWords[1] === 'all' ? MAX_WORD_LEVEL_EN : parseInt(enWords[1], 10)
    return wordsAtLevelEn(level)
  }

  if (source === EN_SENTENCES_SHORT) return shortLinesEn()
  if (source === EN_SENTENCES_LONG) return longLinesEn()

  // Korean
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
  // English
  const enPos = source.match(EN_POSITION_RE)
  if (enPos) {
    const stage = findPositionStageEn(parseInt(enPos[1], 10))
    return stage?.title ?? source
  }

  const enWords = source.match(EN_WORDS_RE)
  if (enWords) {
    if (enWords[1] === 'all') return '단어연습 (영어) — 전체'
    return `단어연습 (영어) — ${enWords[1]}단계까지`
  }

  if (source === EN_SENTENCES_SHORT) return '문장연습 (영어) — 짧은 문장'
  if (source === EN_SENTENCES_LONG) return '문장연습 (영어) — 긴 글'

  // Korean
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

  if (isWeakSource(source)) return '약점 맞춤 연습'

  return source
}

export const isValidSource = (source: string): boolean =>
  linesForSource(source).length > 0

export const sectionOfSource = (source: string): SectionKind | null => {
  if (POSITION_RE.test(source) || EN_POSITION_RE.test(source)) return 'position'
  if (WORDS_RE.test(source) || EN_WORDS_RE.test(source)) return 'words'
  if (
    source === SENTENCES_SHORT ||
    source === SENTENCES_LONG ||
    source === EN_SENTENCES_SHORT ||
    source === EN_SENTENCES_LONG
  )
    return 'sentences'
  return null
}

const MIN_WORD_RANKING_LENGTH = 2

const isRankableSource = (source: string, text: string): boolean => {
  if (
    source === SENTENCES_SHORT ||
    source === SENTENCES_LONG ||
    source === EN_SENTENCES_SHORT ||
    source === EN_SENTENCES_LONG
  )
    return true
  if (
    (WORDS_RE.test(source) || EN_WORDS_RE.test(source)) &&
    text.trim().length >= MIN_WORD_RANKING_LENGTH
  )
    return true
  return false
}

export const isRecordRankingEligible = (
  source: string,
  text: string,
  accuracy: number
): boolean => isRankableSource(source, text) && accuracy >= 1

// ----- Sprint game pool -----

// A broad shuffle-able pool (words + short sentences) for the 1-minute sprint.
export const buildSprintPool = (lang: Lang): string[] =>
  lang === 'en'
    ? [...wordsAtLevelEn(MAX_WORD_LEVEL_EN), ...shortLinesEn()]
    : [...wordsAtLevel(MAX_WORD_LEVEL), ...shortLines()]

// Short single words for the falling game (no spaces, quick to clear).
export const buildFallingPool = (lang: Lang): string[] =>
  (lang === 'en'
    ? wordsAtLevelEn(MAX_WORD_LEVEL_EN)
    : wordsAtLevel(MAX_WORD_LEVEL)
  ).filter((w) => !w.includes(' ') && w.length >= 2 && w.length <= (lang === 'en' ? 7 : 4))

// ----- Weak-key custom practice -----

export const WEAK_SOURCE = 'weak'
export const WEAK_SOURCE_EN = 'en-weak'

export const isWeakSource = (source: string): boolean =>
  source === WEAK_SOURCE || source === WEAK_SOURCE_EN

const WEAK_TARGET_LINES = 30

// Builds a practice set from words (then sentences as fallback) that contain
// the user's weak jamo (ko) / letters (en). `weakKeys` are base jamo for ko.
export const buildWeakPracticeLines = (weakKeys: string[], lang: Lang): string[] => {
  if (weakKeys.length === 0) return []
  const set = new Set(weakKeys)

  if (lang === 'en') {
    const words = wordsAtLevelEn(MAX_WORD_LEVEL_EN).filter((w) =>
      Array.from(w.toLowerCase()).some((c) => set.has(c))
    )
    if (words.length >= WEAK_TARGET_LINES) return words.slice(0, WEAK_TARGET_LINES)
    const sentences = shortLinesEn().filter((s) =>
      Array.from(s.toLowerCase()).some((c) => set.has(c))
    )
    return [...words, ...sentences].slice(0, WEAK_TARGET_LINES)
  }

  const words = wordsAtLevel(MAX_WORD_LEVEL).filter((w) =>
    decomposeText(w).some((j) => set.has(j))
  )
  if (words.length >= WEAK_TARGET_LINES) return words.slice(0, WEAK_TARGET_LINES)
  const sentences = shortLines().filter((s) =>
    decomposeText(s).some((j) => set.has(j))
  )
  return [...words, ...sentences].slice(0, WEAK_TARGET_LINES)
}

// ----- Option lists for the Profile dropdowns -----

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

export const POSITION_OPTIONS_EN = POSITION_STAGES_EN.map((s) => ({
  value: positionSourceEn(s.id),
  label: s.title,
}))

export const WORD_OPTIONS_EN: { value: string; label: string }[] = [
  ...Array.from({ length: MAX_WORD_LEVEL_EN - 1 }, (_, i) => {
    const lvl = i + 1
    return { value: wordsSourceEn(lvl), label: `${lvl}단계까지` }
  }),
  { value: wordsSourceEn('all'), label: '전체' },
]

export const SENTENCE_OPTIONS_EN: { value: string; label: string }[] = [
  { value: EN_SENTENCES_SHORT, label: '짧은 문장' },
  { value: EN_SENTENCES_LONG, label: '긴 글' },
]
