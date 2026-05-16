import {
  CHO_INDEX, JUNG_INDEX, JONG_INDEX,
  SYLLABLE_BASE,
  VOWEL_COMBINE, JONG_COMBINE,
  VOWEL_SPLIT, JONG_SPLIT,
  isVowel, isFinalConsonant,
} from './constants'

export interface Syllable {
  L?: string
  V?: string
  T?: string
}

export interface ComposerState {
  committed: string
  working: Syllable
}

export const initialState = (): ComposerState => ({ committed: '', working: {} })

const combineVowel = (a: string, b: string): string | null =>
  VOWEL_COMBINE[a]?.[b] ?? null

const combineJong = (a: string, b: string): string | null =>
  JONG_COMBINE[a]?.[b] ?? null

const splitVowelComposite = (v: string): [string, string] | null =>
  VOWEL_SPLIT[v] ?? null

const splitJongComposite = (t: string): [string, string] | null =>
  JONG_SPLIT[t] ?? null

export const syllableToString = (s: Syllable): string => {
  if (s.L && s.V) {
    const c = CHO_INDEX[s.L]
    const j = JUNG_INDEX[s.V]
    const t = s.T ? (JONG_INDEX[s.T] ?? 0) : 0
    if (c !== undefined && j !== undefined) {
      return String.fromCodePoint(SYLLABLE_BASE + c * 588 + j * 28 + t)
    }
  }
  return [s.L, s.V, s.T].filter(Boolean).join('')
}

export const renderState = (state: ComposerState): string =>
  state.committed + syllableToString(state.working)

const commit = (state: ComposerState, next: Syllable): ComposerState => ({
  committed: state.committed + syllableToString(state.working),
  working: next,
})

export const inputJamo = (state: ComposerState, jamo: string): ComposerState => {
  const { working } = state

  if (isVowel(jamo)) {
    if (!working.L && !working.V) {
      return { ...state, working: { V: jamo } }
    }
    if (!working.L && working.V) {
      const combined = combineVowel(working.V, jamo)
      if (combined) return { ...state, working: { V: combined } }
      return commit(state, { V: jamo })
    }
    if (working.L && !working.V) {
      return { ...state, working: { L: working.L, V: jamo } }
    }
    if (working.L && working.V && !working.T) {
      const combined = combineVowel(working.V, jamo)
      if (combined) return { ...state, working: { L: working.L, V: combined } }
      return commit(state, { V: jamo })
    }
    if (working.L && working.V && working.T) {
      const split = splitJongComposite(working.T)
      if (split) {
        const finishedT = split[0]
        const movedL = split[1]
        const finished = syllableToString({ L: working.L, V: working.V, T: finishedT })
        return {
          committed: state.committed + finished,
          working: { L: movedL, V: jamo },
        }
      }
      const movedL = working.T
      const finished = syllableToString({ L: working.L, V: working.V })
      return {
        committed: state.committed + finished,
        working: { L: movedL, V: jamo },
      }
    }
  }

  if (!working.L && !working.V) {
    return { ...state, working: { L: jamo } }
  }
  if (working.L && !working.V) {
    return commit(state, { L: jamo })
  }
  if (!working.L && working.V) {
    return commit(state, { L: jamo })
  }
  if (working.L && working.V && !working.T) {
    if (isFinalConsonant(jamo)) {
      return { ...state, working: { L: working.L, V: working.V, T: jamo } }
    }
    return commit(state, { L: jamo })
  }
  if (working.L && working.V && working.T) {
    const combined = combineJong(working.T, jamo)
    if (combined) {
      return { ...state, working: { L: working.L, V: working.V, T: combined } }
    }
    return commit(state, { L: jamo })
  }

  return state
}

export const backspace = (state: ComposerState): ComposerState => {
  const { committed, working } = state

  if (working.T) {
    const split = splitJongComposite(working.T)
    if (split) {
      return { ...state, working: { L: working.L, V: working.V, T: split[0] } }
    }
    return { ...state, working: { L: working.L, V: working.V } }
  }
  if (working.V) {
    const split = splitVowelComposite(working.V)
    if (split) {
      return { ...state, working: { L: working.L, V: split[0] } }
    }
    return { ...state, working: working.L ? { L: working.L } : {} }
  }
  if (working.L) {
    return { ...state, working: {} }
  }
  if (committed.length === 0) return state
  return { committed: committed.slice(0, -1), working: {} }
}
