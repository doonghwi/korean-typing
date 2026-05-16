import { useEffect, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { jamoToKey } from '../hangul/dubeolsik'
import { Keyboard } from './keyboard/Keyboard'
import { HandOverlay } from './keyboard/HandOverlay'
import { findKeyByChar } from './keyboard/layout'
import { Stats } from './Stats'
import './TypingScreen.css'

interface Props {
  title?: string
  target: string
  onComplete?: (result: { cpm: number; accuracy: number; seconds: number }) => void
  onNext?: () => void
}

export const TypingScreen = ({ title, target, onComplete, onNext }: Props) => {
  const { state, derived, restart } = useTypingSession(target)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (state.finishedAt) return
    if (!state.startedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 200)
    return () => window.clearInterval(id)
  }, [state.startedAt, state.finishedAt])

  useEffect(() => {
    if (state.finishedAt && onComplete) {
      onComplete({
        cpm: derived.charsPerMinute,
        accuracy: derived.accuracy,
        seconds: derived.elapsedSeconds,
      })
    }
  }, [state.finishedAt, onComplete, derived])

  useEffect(() => {
    if (!state.finishedAt) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter' && onNext) {
        e.preventDefault()
        onNext()
      } else if ((e.key === 'r' || e.key === 'R') && !e.shiftKey) {
        e.preventDefault()
        restart()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.finishedAt, onNext, restart])

  const liveDerived = state.finishedAt
    ? derived
    : {
        ...derived,
        elapsedSeconds: state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0,
      }

  const expectedJamo = derived.expectedJamo
  const nextKeyChar =
    expectedJamo === ' '
      ? ' '
      : expectedJamo
      ? jamoToKey(expectedJamo)
      : null
  const activeFinger = nextKeyChar ? findKeyByChar(nextKeyChar)?.finger ?? null : null

  void tick

  return (
    <div className="typing-screen">
      {title ? <h2 className="lesson-title">{title}</h2> : null}

      <Stats
        cpm={liveDerived.charsPerMinute}
        accuracy={liveDerived.accuracy}
        elapsedSeconds={liveDerived.elapsedSeconds}
        errors={state.errorCount}
      />

      <div className="target-text" aria-label="목표 문장">
        {Array.from(state.target).map((ch, i) => {
          const isDone = i < derived.cursorChar
          const isCurrent = i === derived.cursorChar
          return (
            <span
              key={i}
              className={`tch${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}${ch === ' ' ? ' space' : ''}`}
            >
              {ch === ' ' ? '·' : ch}
            </span>
          )
        })}
      </div>

      <div className="rendered" aria-label="입력한 문장">
        {derived.rendered || <span className="placeholder">타이핑을 시작하세요…</span>}
      </div>

      <div className="keyboard-wrapper">
        <Keyboard nextKeyChar={nextKeyChar} />
        <HandOverlay activeFinger={activeFinger} />
      </div>

      <div className="hint">
        <kbd>Esc</kbd> 다시 시작 · <kbd>Backspace</kbd> 지우기 · <kbd>Space</kbd> 띄어쓰기
      </div>

      {state.finishedAt ? (
        <div className="finished">
          <p>
            완료! CPM {Math.round(derived.charsPerMinute)} · 정확도{' '}
            {Math.round(derived.accuracy * 100)}%
          </p>
          <div className="actions">
            <button onClick={restart}>다시 (R)</button>
            {onNext ? (
              <button className="primary" onClick={onNext}>
                다음 (Enter)
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
