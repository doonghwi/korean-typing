import { useEffect, useRef, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { jamoToKey } from '../hangul/dubeolsik'
import { Keyboard } from './keyboard/Keyboard'
import { HandOverlay } from './keyboard/HandOverlay'
import { findKeyByChar } from './keyboard/layout'
import { Stats } from './Stats'
import './TypingScreen.css'

const expectedToKeyChar = (expected: string | null): string | null => {
  if (!expected) return null
  if (expected === ' ') return ' '
  return jamoToKey(expected) ?? expected
}

interface Props {
  title?: string
  lines: string[]
  onLineComplete?: (result: {
    cpm: number
    accuracy: number
    seconds: number
    text: string
  }) => void
  onFinishAll?: () => void
  onExit?: () => void
}

interface LineResult {
  cpm: number
  accuracy: number
  errors: number
  seconds: number
}

type CharStatus = 'pending' | 'current' | 'correct' | 'wrong'

export const TypingScreen = ({
  title,
  lines,
  onLineComplete,
  onFinishAll,
  onExit,
}: Props) => {
  const [lineIdx, setLineIdx] = useState(0)
  const [lineResults, setLineResults] = useState<LineResult[]>([])
  const [allDone, setAllDone] = useState(false)
  const [tick, setTick] = useState(0)

  const currentLine = lines[lineIdx] ?? ''
  const { state, derived, restart } = useTypingSession(currentLine)
  const onLineCompleteRef = useRef(onLineComplete)
  onLineCompleteRef.current = onLineComplete
  const advanceRef = useRef<() => void>(() => {})

  useEffect(() => {
    setLineIdx(0)
    setLineResults([])
    setAllDone(false)
  }, [lines])

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
      accuracy: derived.accuracy,
      errors: state.errorCount,
      seconds: derived.elapsedSeconds,
    }
    setLineResults((prev) => [...prev, result])
    if (onLineCompleteRef.current) {
      onLineCompleteRef.current({
        cpm: derived.charsPerMinute,
        accuracy: derived.accuracy,
        seconds: derived.elapsedSeconds,
        text: currentLine,
      })
    }
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
      if (e.key === 'Enter' || e.code === 'Space' || e.key === ' ') {
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

  const expectedJamo = derived.expectedJamo
  const nextKeyChar = expectedToKeyChar(expectedJamo)
  const activeFinger = nextKeyChar ? findKeyByChar(nextKeyChar)?.finger ?? null : null

  void tick

  const isLastLine = lineIdx === lines.length - 1
  const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : null
  const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : null

  const charStatus = (charIdx: number): CharStatus => {
    const start = charIdx === 0 ? 0 : derived.boundaries[charIdx - 1]
    const end = derived.boundaries[charIdx]
    if (state.inputCount < start) return 'pending'
    if (state.inputCount < end) return 'current'
    for (let j = start; j < end; j++) {
      if (state.inputs[j] !== state.targetJamo[j]) return 'wrong'
    }
    return 'correct'
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
    const targetCh = currentLine[i]
    const wrong = targetCh !== undefined && ch !== targetCh
    return (
      <span key={i} className={`tch ${wrong ? 'wrong' : 'correct'}${ch === ' ' ? ' space' : ''}`}>
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

  const renderedChars = Array.from(derived.rendered)

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
        accuracy={liveDerived.accuracy}
        elapsedSeconds={liveDerived.elapsedSeconds}
        errors={state.errorCount}
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
            {Array.from(currentLine).map(renderTargetChar)}
          </div>
          <div className="pair-input" aria-label="입력 중">
            {renderedChars.length > 0 ? (
              renderedChars.map(renderInputChar)
            ) : (
              <span className="placeholder">타이핑을 시작하세요…</span>
            )}
            <span className="caret" />
          </div>
          {state.finishedAt ? (
            <div className="line-finished">
              ✓ {Math.round(derived.charsPerMinute)} CPM ·{' '}
              {Math.round(derived.accuracy * 100)}%
              {isLastLine ? (
                <>
                  {' '}— <kbd>Enter</kbd> 또는 <kbd>Space</kbd>로 마무리 (틀렸으면 <kbd>Backspace</kbd>)
                </>
              ) : (
                <>
                  {' '}— <kbd>Enter</kbd> 또는 <kbd>Space</kbd>로 다음 줄 (틀렸으면 <kbd>Backspace</kbd>)
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
        <Keyboard nextKeyChar={nextKeyChar} />
        <HandOverlay activeFinger={activeFinger} nextKeyChar={nextKeyChar} />
      </div>

      <div className="hint">
        <kbd>Esc</kbd> 줄 다시 · <kbd>Backspace</kbd> 지우기 ·{' '}
        <kbd>Space</kbd> 띄어쓰기 / 다음 줄
      </div>

      {allDone ? (
        <div className="finished">
          <p>
            전체 완료! 평균 CPM{' '}
            {Math.round(
              lineResults.reduce((s, r) => s + r.cpm, 0) /
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
