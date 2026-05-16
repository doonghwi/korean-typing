import { useEffect, useRef, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { jamoToKey } from '../hangul/dubeolsik'
import { Keyboard } from './keyboard/Keyboard'
import { HandOverlay } from './keyboard/HandOverlay'
import { findKeyByChar } from './keyboard/layout'
import { Stats } from './Stats'
import './TypingScreen.css'

interface Props {
  title?: string
  lines: string[]
  onComplete?: (result: { cpm: number; accuracy: number; seconds: number }) => void
  onNext?: () => void
}

interface LineResult {
  cpm: number
  accuracy: number
  errors: number
  seconds: number
}

export const TypingScreen = ({ title, lines, onComplete, onNext }: Props) => {
  const [lineIdx, setLineIdx] = useState(0)
  const [lineResults, setLineResults] = useState<LineResult[]>([])
  const [lessonDone, setLessonDone] = useState(false)
  const [tick, setTick] = useState(0)

  const currentLine = lines[lineIdx] ?? ''
  const { state, derived, restart } = useTypingSession(currentLine)
  const justFinishedRef = useRef(false)

  useEffect(() => {
    setLineIdx(0)
    setLineResults([])
    setLessonDone(false)
    justFinishedRef.current = false
  }, [lines])

  useEffect(() => {
    if (state.finishedAt) return
    if (!state.startedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 200)
    return () => window.clearInterval(id)
  }, [state.startedAt, state.finishedAt])

  useEffect(() => {
    if (state.finishedAt && !justFinishedRef.current) {
      justFinishedRef.current = true
      const result: LineResult = {
        cpm: derived.charsPerMinute,
        accuracy: derived.accuracy,
        errors: state.errorCount,
        seconds: derived.elapsedSeconds,
      }
      setLineResults((prev) => [...prev, result])
    } else if (!state.finishedAt) {
      justFinishedRef.current = false
    }
  }, [state.finishedAt])

  useEffect(() => {
    if (lineResults.length >= lines.length && lines.length > 0) {
      setLessonDone(true)
    }
  }, [lineResults.length, lines.length])

  useEffect(() => {
    if (lessonDone && onComplete && lineResults.length > 0) {
      const avgCpm =
        lineResults.reduce((s, r) => s + r.cpm, 0) / lineResults.length
      const avgAcc =
        lineResults.reduce((s, r) => s + r.accuracy, 0) / lineResults.length
      const totalSec = lineResults.reduce((s, r) => s + r.seconds, 0)
      onComplete({ cpm: avgCpm, accuracy: avgAcc, seconds: totalSec })
    }
  }, [lessonDone, lineResults, onComplete])

  useEffect(() => {
    if (!state.finishedAt) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter' || e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        if (lineIdx < lines.length - 1) {
          setLineIdx((idx) => idx + 1)
        } else if (onNext) {
          onNext()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.finishedAt, lineIdx, lines.length, onNext])

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

  const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : null
  const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : null
  const isLastLine = lineIdx === lines.length - 1

  const renderTargetChar = (ch: string, i: number) => {
    const isDone = i < derived.cursorChar
    const isCurrentChar = i === derived.cursorChar
    return (
      <span
        key={i}
        className={`tch${isDone ? ' done' : ''}${isCurrentChar ? ' current-char' : ''}${ch === ' ' ? ' space' : ''}`}
      >
        {ch === ' ' ? '·' : ch}
      </span>
    )
  }

  const restartLesson = () => {
    setLineIdx(0)
    setLineResults([])
    setLessonDone(false)
    justFinishedRef.current = false
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
        accuracy={liveDerived.accuracy}
        elapsedSeconds={liveDerived.elapsedSeconds}
        errors={state.errorCount}
      />

      <div className="lines-stack">
        <div className="line prev">
          {prevLine !== null ? prevLine.replace(/ /g, '·') : <span className="empty">—</span>}
        </div>

        <div className="line current">
          <div className="target-text" aria-label="목표 문장">
            {Array.from(currentLine).map(renderTargetChar)}
          </div>
          <div className="rendered" aria-label="입력한 문장">
            {derived.rendered || (
              <span className="placeholder">타이핑을 시작하세요…</span>
            )}
          </div>
          {state.finishedAt ? (
            <div className="line-finished">
              ✓{' '}
              {isLastLine ? (
                onNext ? (
                  <>
                    <kbd>Enter</kbd> 또는 <kbd>Space</kbd>로 다음 레슨
                  </>
                ) : (
                  '레슨 완료'
                )
              ) : (
                <>
                  <kbd>Enter</kbd> 또는 <kbd>Space</kbd>로 다음 줄
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="line next">
          {nextLine !== null ? nextLine.replace(/ /g, '·') : <span className="empty">—</span>}
        </div>
      </div>

      <div className="keyboard-wrapper">
        <Keyboard nextKeyChar={nextKeyChar} />
        <HandOverlay activeFinger={activeFinger} />
      </div>

      <div className="hint">
        <kbd>Esc</kbd> 줄 다시 · <kbd>Backspace</kbd> 지우기 ·{' '}
        <kbd>Space</kbd> 띄어쓰기 / 다음 줄
      </div>

      {lessonDone ? (
        <div className="finished">
          <p>
            레슨 완료! 평균 CPM{' '}
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
            <button onClick={restartLesson}>전체 다시</button>
            {onNext ? (
              <button className="primary" onClick={onNext}>
                다음 레슨 (Enter)
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
