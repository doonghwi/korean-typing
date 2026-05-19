import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

export interface EnglishSessionState {
  target: string
  targetChars: string[]
  inputs: string[]
  inputCount: number
  errorCount: number
  startedAt: number | null
  finishedAt: number | null
}

type Action =
  | { type: 'char'; ch: string }
  | { type: 'backspace' }
  | { type: 'restart'; target: string }

const init = (target: string): EnglishSessionState => ({
  target,
  targetChars: Array.from(target),
  inputs: [],
  inputCount: 0,
  errorCount: 0,
  startedAt: null,
  finishedAt: null,
})

const reducer = (state: EnglishSessionState, action: Action): EnglishSessionState => {
  if (action.type === 'restart') return init(action.target)

  if (action.type === 'backspace') {
    if (state.inputCount === 0) return state
    const lastInput = state.inputs[state.inputCount - 1]
    const lastExpected = state.targetChars[state.inputCount - 1]
    const wasError = lastInput !== lastExpected
    return {
      ...state,
      inputs: state.inputs.slice(0, -1),
      inputCount: state.inputCount - 1,
      errorCount: wasError ? Math.max(0, state.errorCount - 1) : state.errorCount,
      finishedAt: null,
    }
  }

  if (state.finishedAt) return state

  const ch = action.ch
  const expected = state.targetChars[state.inputCount]
  const isCorrect = expected !== undefined && expected === ch
  const nextInputs = [...state.inputs, ch]
  const nextInputCount = state.inputCount + 1
  const nextErrors = state.errorCount + (isCorrect ? 0 : 1)
  const startedAt = state.startedAt ?? Date.now()
  const reachedTargetCount = nextInputCount >= state.targetChars.length
  const finishedAt = reachedTargetCount ? Date.now() : null

  return {
    ...state,
    inputs: nextInputs,
    inputCount: nextInputCount,
    errorCount: nextErrors,
    startedAt,
    finishedAt,
  }
}

export interface EnglishSessionDerived {
  cursorChar: number
  expectedChar: string | null
  elapsedSeconds: number
  accuracy: number
  charsPerMinute: number
  wordsPerMinute: number
}

export const deriveEnglishSession = (
  s: EnglishSessionState,
  now: number
): EnglishSessionDerived => {
  const cursorChar = Math.min(s.inputCount, s.targetChars.length)
  const expectedChar = s.targetChars[s.inputCount] ?? null

  const end = s.finishedAt ?? now
  const elapsed = s.startedAt ? Math.max(0, (end - s.startedAt) / 1000) : 0

  const accuracy = s.inputCount === 0 ? 1 : Math.max(0, 1 - s.errorCount / s.inputCount)
  const correctChars = Math.max(0, s.inputCount - s.errorCount)
  const minutes = elapsed / 60
  const charsPerMinute = minutes > 0 ? correctChars / minutes : 0
  const wordsPerMinute = charsPerMinute / 5

  return {
    cursorChar,
    expectedChar,
    elapsedSeconds: elapsed,
    accuracy,
    charsPerMinute,
    wordsPerMinute,
  }
}

export const useEnglishSession = (target: string) => {
  const [state, dispatch] = useReducer(reducer, target, init)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    dispatch({ type: 'restart', target })
  }, [target])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'backspace' })
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        dispatch({ type: 'restart', target: stateRef.current.target })
        return
      }

      // Single-character keys: letters, digits, punctuation, space.
      if (e.key.length === 1) {
        e.preventDefault()
        dispatch({ type: 'char', ch: e.key })
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'restart', target: stateRef.current.target })
  }, [])

  const derived = useMemo(() => deriveEnglishSession(state, Date.now()), [state])

  return { state, derived, restart }
}
