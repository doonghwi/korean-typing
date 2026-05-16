import {
  CHO, JUNG, JONG,
  SYLLABLE_BASE,
  VOWEL_SPLIT, JONG_SPLIT,
  isHangulSyllable,
} from './constants'

const splitVowel = (v: string): string[] => VOWEL_SPLIT[v] ?? [v]
const splitJong = (t: string): string[] => JONG_SPLIT[t] ?? [t]

export const decomposeSyllable = (ch: string): string[] => {
  if (!isHangulSyllable(ch)) return [ch]
  const offset = ch.codePointAt(0)! - SYLLABLE_BASE
  const choIdx = Math.floor(offset / 588)
  const jungIdx = Math.floor((offset % 588) / 28)
  const jongIdx = offset % 28

  const out: string[] = [CHO[choIdx]]
  out.push(...splitVowel(JUNG[jungIdx]))
  if (jongIdx > 0) out.push(...splitJong(JONG[jongIdx]))
  return out
}

export const decomposeText = (text: string): string[] => {
  const out: string[] = []
  for (const ch of text) {
    if (isHangulSyllable(ch)) {
      out.push(...decomposeSyllable(ch))
    } else {
      out.push(ch)
    }
  }
  return out
}
