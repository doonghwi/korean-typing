import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  type ComposerState,
  backspace,
  decomposeSyllable,
  decomposeText,
  initialState,
  inputJamo,
  inputLiteral,
  isHangulSyllable,
  keyToJamo,
  renderState,
} from '../hangul'
import { codeToKeyChar } from '../hangul/dubeolsik'

export interface SessionState {
  composer: ComposerState
  target: string
  targetJamo: string[]
  inputs: string[]
  inputCount: number
  errorCount: number
  startedAt: number | null
  finishedAt: number | null
}

type Action =
  | { type: 'jamo'; jamo: string }
  | { type: 'literal'; ch: string }
  | { type: 'backspace' }
  | { type: 'restart'; target: string }

const init = (target: string): SessionState => ({
  composer: initialState(),
  target,
  targetJamo: decomposeText(target),
  inputs: [],
  inputCount: 0,
  errorCount: 0,
  startedAt: null,
  finishedAt: null,
})

const reducer = (state: SessionState, action: Action): SessionState => {
  if (action.type === 'restart') return init(action.target)
  if (state.finishedAt) return state

  if (action.type === 'backspace') {
    if (state.inputCount === 0) return state
    const lastInput = state.inputs[state.inputCount - 1]
    const lastExpected = state.targetJamo[state.inputCount - 1]
    const wasError = lastInput !== lastExpected
    return {
      ...state,
      composer: backspace(state.composer),
      inputs: state.inputs.slice(0, -1),
      inputCount: state.inputCount - 1,
      errorCount: wasError ? Math.max(0, state.errorCount - 1) : state.errorCount,
    }
  }

  const inputChar = action.type === 'jamo' ? action.jamo : action.ch
  const expected = state.targetJamo[state.inputCount]
  const isCorrect = expected !== undefined && expected === inputChar
  const nextComposer =
    action.type === 'jamo'
      ? inputJamo(state.composer, action.jamo)
      : inputLiteral(state.composer, action.ch)
  const nextInputs = [...state.inputs, inputChar]
  const nextInputCount = state.inputCount + 1
  const nextErrors = state.errorCount + (isCorrect ? 0 : 1)
  const startedAt = state.startedAt ?? Date.now()
  const rendered = renderState(nextComposer)
  const reachedTargetCount = nextInputCount >= state.targetJamo.length
  const matchesTarget = rendered === state.target
  const finishedAt = reachedTargetCount || matchesTarget ? Date.now() : null

  return {
    ...state,
    composer: nextComposer,
    inputs: nextInputs,
    inputCount: nextInputCount,
    errorCount: nextErrors,
    startedAt,
    finishedAt,
  }
}

export interface SessionDerived {
  rendered: string
  cursorChar: number
  expectedJamo: string | null
  elapsedSeconds: number
  accuracy: number
  charsPerMinute: number
  wordsPerMinute: number
  boundaries: number[]
}

const computeBoundaries = (target: string): number[] => {
  const out: number[] = []
  let count = 0
  for (const ch of target) {
    if (isHangulSyllable(ch)) {
      count += decomposeSyllable(ch).length
    } else {
      count += 1
    }
    out.push(count)
  }
  return out
}

export const deriveSession = (s: SessionState, now: number): SessionDerived => {
  const rendered = renderState(s.composer)
  const boundaries = computeBoundaries(s.target)
  const idx = boundaries.findIndex((b) => b > s.inputCount)
  const cursorChar = idx === -1 ? boundaries.length : idx
  const expectedJamo = s.targetJamo[s.inputCount] ?? null

  const end = s.finishedAt ?? now
  const elapsed = s.startedAt ? Math.max(0, (end - s.startedAt) / 1000) : 0

  const accuracy = s.inputCount === 0 ? 1 : Math.max(0, 1 - s.errorCount / s.inputCount)
  const correctChars = Math.max(0, s.inputCount - s.errorCount)
  const minutes = elapsed / 60
  const charsPerMinute = minutes > 0 ? correctChars / minutes : 0
  const wordsPerMinute = charsPerMinute / 5

  return {
    rendered,
    cursorChar,
    expectedJamo,
    elapsedSeconds: elapsed,
    accuracy,
    charsPerMinute,
    wordsPerMinute,
    boundaries,
  }
}

export const useTypingSession = (target: string) => {
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

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'literal', ch: ' ' })
        return
      }

      const keyChar = codeToKeyChar(e.code, e.shiftKey)
      if (keyChar) {
        const jamo = keyToJamo(keyChar)
        if (jamo) {
          e.preventDefault()
          dispatch({ type: 'jamo', jamo })
          return
        }
      }

      if (e.key.length === 1) {
        e.preventDefault()
        dispatch({ type: 'literal', ch: e.key })
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'restart', target: stateRef.current.target })
  }, [])

  const derived = useMemo(() => deriveSession(state, Date.now()), [state])

  return { state, derived, restart }
}
