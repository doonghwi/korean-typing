import { keyToJamo } from './dubeolsik'
import { backspace, inputJamo, type ComposerState } from './composer'

export * from './constants'
export * from './dubeolsik'
export * from './decompose'
export * from './composer'

export const processKey = (state: ComposerState, key: string): ComposerState => {
  if (key === 'Backspace') return backspace(state)
  const jamo = keyToJamo(key)
  if (!jamo) return state
  return inputJamo(state, jamo)
}

export const typeString = (keys: string): ComposerState => {
  let state: ComposerState = { committed: '', working: {} }
  for (const k of keys) state = processKey(state, k)
  return state
}
