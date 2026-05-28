import { useEffect, useRef, useState } from 'react'
import { useEnglishSession } from '../hooks/useEnglishSession'
import { Keyboard } from './keyboard/Keyboard'
import { HandOverlay } from './keyboard/HandOverlay'
import { findKeyByChar } from './keyboard/layout'
import { Stats } from './Stats'
import './TypingScreen.css'

interface KeyStatsDelta {
  attempts: Record<string, number>
  misses: Record<string, number>
}

interface Props {
  title?: string
  lines: string[]
  bestCpm?: number
  todayBestCpm?: number
  weakKeys?: string[]
  onLineComplete?: (result: {
    cpm: number
    wpm: number
    accuracy: number
    seconds: number
    text: string
    keyStats: KeyStatsDelta
  }) => void
  onFinishAll?: () => void
  onExit?: () => void
}

// Per-letter attempt/miss counts (letters bucketed lowercase, spaces skipped).
const computeKeyStats = (inputs: string[], targetChars: string[]): KeyStatsDelta => {
  const attempts: Record<string, number> = {}
  const misses: Record<string, number> = {}
  const n = Math.min(inputs.length, targetChars.length)
  for (let i = 0; i < n; i++) {
    const exp = targetChars[i]
    if (exp === ' ') continue
    const key = /[A-Za-z]/.test(exp) ? exp.toLowerCase() : exp
    attempts[key] = (attempts[key] ?? 0) + 1
    if (inputs[i] !== exp) misses[key] = (misses[key] ?? 0) + 1
  }
  return { attempts, misses }
}

interface LineResult {
  cpm: number
  wpm: number
  accuracy: number
  errors: number
  seconds: number
}

type CharStatus = 'pending' | 'current' | 'correct' | 'wrong'

// Lines shorter than this don't qualify for a "new record" — short lines spike
// CPM and would trigger false celebrations.
const MIN_PB_CHARS = 8

export const TypingScreenEn = ({
  title,
  lines,
  bestCpm = 0,
  todayBestCpm = 0,
  weakKeys,
  onLineComplete,
  onFinishAll,
  onExit,
}: Props) => {
  const [lineIdx, setLineIdx] = useState(0)
  const [lineResults, setLineResults] = useState<LineResult[]>([])
  const [allDone, setAllDone] = useState(false)
  const [tick, setTick] = useState(0)

  const currentLine = lines[lineIdx] ?? ''
  const { state, derived, restart } = useEnglishSession(currentLine)
  const onLineCompleteRef = useRef(onLineComplete)
  onLineCompleteRef.current = onLineComplete
  const advanceRef = useRef<() => void>(() => {})
  const beatenBestRef = useRef(bestCpm)
  const beatenTodayRef = useRef(todayBestCpm)

  useEffect(() => {
    setLineIdx(0)
    setLineResults([])
    setAllDone(false)
    beatenBestRef.current = bestCpm
    beatenTodayRef.current = todayBestCpm
  }, [lines, bestCpm, todayBestCpm])

  useEffect(() => {
    if (state.finishedAt) return
    if (!state.startedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 200)
    return () => window.clearInterval(id)
  }, [state.startedAt, state.finishedAt])

  advanceRef.current = () => {
    if (!state.finishedAt) return
    const result: LineResult = {
      cpm: derived.charsPerMinute,
      wpm: derived.wordsPerMinute,
      accuracy: derived.accuracy,
      errors: state.errorCount,
      seconds: derived.elapsedSeconds,
    }
    setLineResults((prev) => [...prev, result])
    if (onLineCompleteRef.current) {
      onLineCompleteRef.current({
        cpm: derived.charsPerMinute,
        wpm: derived.wordsPerMinute,
        accuracy: derived.accuracy,
        seconds: derived.elapsedSeconds,
        text: currentLine,
        keyStats: computeKeyStats(state.inputs, state.targetChars),
      })
    }
    beatenBestRef.current = Math.max(beatenBestRef.current, derived.charsPerMinute)
    beatenTodayRef.current = Math.max(beatenTodayRef.current, derived.charsPerMinute)
    if (lineIdx < lines.length - 1) {
      setLineIdx((idx) => idx + 1)
    }
  }

  useEffect(() => {
    if (lineResults.length >= lines.length && lines.length > 0) {
      setAllDone(true)
    }
  }, [lineResults.length, lines.length])

  useEffect(() => {
    if (allDone && onFinishAll) onFinishAll()
  }, [allDone, onFinishAll])

  useEffect(() => {
    if (!state.finishedAt) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') {
        e.preventDefault()
        advanceRef.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.finishedAt])

  const liveDerived = state.finishedAt
    ? derived
    : {
        ...derived,
        elapsedSeconds: state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0,
      }

  const expectedChar = derived.expectedChar
  const nextKeyChar = expectedChar === ' ' ? ' ' : expectedChar
  const activeFinger = nextKeyChar ? findKeyByChar(nextKeyChar)?.finger ?? null : null

  void tick

  const isLastLine = lineIdx === lines.length - 1
  const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : null
  const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : null

  const eligibleForRecord =
    !!state.finishedAt &&
    state.errorCount === 0 &&
    currentLine.length >= MIN_PB_CHARS
  const isNewRecord =
    eligibleForRecord &&
    beatenBestRef.current > 0 &&
    derived.charsPerMinute > beatenBestRef.current
  const isTodayRecord =
    !isNewRecord &&
    eligibleForRecord &&
    beatenTodayRef.current > 0 &&
    derived.charsPerMinute > beatenTodayRef.current

  const charStatus = (i: number): CharStatus => {
    if (state.inputCount < i) return 'pending'
    if (state.inputCount === i) return 'current'
    return state.inputs[i] === state.targetChars[i] ? 'correct' : 'wrong'
  }

  const renderTargetChar = (ch: string, i: number) => {
    const status = charStatus(i)
    const cls = `tch ${status}${ch === ' ' ? ' space' : ''}`
    return (
      <span key={i} className={cls}>
        {ch === ' ' ? '·' : ch}
      </span>
    )
  }

  const renderInputChar = (ch: string, i: number) => {
    const targetCh = state.targetChars[i]
    const wrong = targetCh !== undefined && ch !== targetCh
    return (
      <span
        key={i}
        className={`tch ${wrong ? 'wrong' : 'correct'}${ch === ' ' ? ' space' : ''}`}
      >
        {ch === ' ' ? '·' : ch}
      </span>
    )
  }

  const restartSession = () => {
    setLineIdx(0)
    setLineResults([])
    setAllDone(false)
    restart()
  }

  return (
    <div className="typing-screen">
      {title ? (
        <h2 className="lesson-title">
          {title}{' '}
          <span className="line-counter">
            {lineIdx + 1} / {lines.length}
          </span>
        </h2>
      ) : null}

      <Stats
        cpm={liveDerived.charsPerMinute}
        wpm={liveDerived.wordsPerMinute}
        accuracy={liveDerived.accuracy}
        elapsedSeconds={liveDerived.elapsedSeconds}
        errors={state.errorCount}
        lang="en"
      />

      <div className="pair-stack">
        {prevLine !== null ? (
          <div className="pair prev">
            <span className="check">✓</span>
            <div className="pair-target">{prevLine.replace(/ /g, '·')}</div>
          </div>
        ) : null}

        <div className="pair current">
          <div className="pair-target" aria-label="목표 문장">
            {state.targetChars.map(renderTargetChar)}
          </div>
          <div className="pair-input" aria-label="입력 중">
            {state.inputs.length > 0 ? (
              state.inputs.map(renderInputChar)
            ) : (
              <span className="placeholder">타이핑을 시작하세요…</span>
            )}
            <span className="caret" />
          </div>
          {state.finishedAt ? (
            <div className="line-finished">
              {isNewRecord ? (
                <span className="record-badge">🎉 신기록!</span>
              ) : isTodayRecord ? (
                <span className="record-badge today">🔥 오늘 신기록!</span>
              ) : null}
              ✓ {Math.round(derived.wordsPerMinute)} WPM ·{' '}
              {Math.round(derived.accuracy * 100)}%
              {isLastLine ? (
                <>
                  {' '}— <kbd>Enter</kbd>로 마무리 (틀렸으면 <kbd>Backspace</kbd>)
                </>
              ) : (
                <>
                  {' '}— <kbd>Enter</kbd>로 다음 줄 (틀렸으면 <kbd>Backspace</kbd>)
                </>
              )}
            </div>
          ) : null}
        </div>

        {nextLine !== null ? (
          <div className="pair next">
            <span className="check pending">·</span>
            <div className="pair-target">{nextLine.replace(/ /g, '·')}</div>
          </div>
        ) : null}
      </div>

      <div className="keyboard-wrapper">
        <Keyboard nextKeyChar={nextKeyChar} lang="en" weakKeys={weakKeys} />
        <HandOverlay activeFinger={activeFinger} nextKeyChar={nextKeyChar} />
      </div>

      <div className="hint">
        <kbd>Esc</kbd> 줄 다시 · <kbd>Backspace</kbd> 지우기 ·{' '}
        <kbd>Enter</kbd> 다음 줄
      </div>

      {allDone ? (
        <div className="finished">
          <p>
            전체 완료! 평균 WPM{' '}
            {Math.round(
              lineResults.reduce((s, r) => s + r.wpm, 0) /
                Math.max(1, lineResults.length)
            )}{' '}
            · 정확도{' '}
            {Math.round(
              (lineResults.reduce((s, r) => s + r.accuracy, 0) /
                Math.max(1, lineResults.length)) *
                100
            )}
            %
          </p>
          <div className="actions">
            <button onClick={restartSession}>다시 (새 순서)</button>
            {onExit ? (
              <button className="primary" onClick={onExit}>
                프로필로
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
