import { useEffect, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { jamoToKey } from '../hangul/dubeolsik'
import { Keyboard } from './keyboard/Keyboard'
import { Hands } from './keyboard/Hands'
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

  const liveDerived = state.finishedAt ? derived : { ...derived, elapsedSeconds: state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0 }

  const nextKey = derived.expectedJamo ? jamoToKey(derived.expectedJamo) : null

  void tick // ensure rerender for elapsed timer

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
              className={`tch${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          )
        })}
      </div>

      <div className="rendered" aria-label="입력한 문장">
        {derived.rendered || <span className="placeholder">타이핑을 시작하세요…</span>}
      </div>

      <Keyboard nextKeyChar={nextKey} />
      <Hands nextKeyChar={nextKey} />

      <div className="hint">
        <kbd>Esc</kbd> 다시 시작 · <kbd>Backspace</kbd> 한 글자 지우기
      </div>

      {state.finishedAt ? (
        <div className="finished">
          <p>완료! CPM {Math.round(derived.charsPerMinute)} · 정확도 {Math.round(derived.accuracy * 100)}%</p>
          <div className="actions">
            <button onClick={restart}>다시 (R)</button>
            {onNext ? <button className="primary" onClick={onNext}>다음 (Enter)</button> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
