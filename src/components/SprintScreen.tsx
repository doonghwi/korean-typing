import { useEffect, useRef, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { useEnglishSession } from '../hooks/useEnglishSession'
import { useCountdown } from '../hooks/useCountdown'
import type { Lang } from '../lessons/sources'
import './SprintScreen.css'

const DURATION = 60

interface Totals {
  correct: number
  errors: number
}

const accuracyPct = (t: Totals): number => {
  const total = t.correct + t.errors
  return total > 0 ? Math.round((t.correct / total) * 100) : 100
}

const SprintHud = ({
  remaining,
  totals,
}: {
  remaining: number
  totals: Totals
}) => (
  <div className="sprint-hud">
    <div className={`sp-timer${remaining <= 10 ? ' urgent' : ''}`}>
      {Math.ceil(remaining)}
      <span className="sp-timer-unit">초</span>
    </div>
    <div className="sp-stat">
      <b>{totals.correct}</b>
      <span>타</span>
    </div>
    <div className="sp-stat">
      <b>{accuracyPct(totals)}%</b>
      <span>정확도</span>
    </div>
  </div>
)

const SprintSummary = ({
  lang,
  totals,
  onRestart,
  onExit,
}: {
  lang: Lang
  totals: Totals
  onRestart: () => void
  onExit: () => void
}) => {
  const value = lang === 'en' ? Math.round(totals.correct / 5) : totals.correct
  const unit = lang === 'en' ? '단어 (1분)' : '타 (1분)'
  return (
    <div className="sprint-summary">
      <h2>⏱️ 스프린트 종료!</h2>
      <div className="ss-big">
        {value}
        <span className="ss-unit">{unit}</span>
      </div>
      <div className="ss-sub">
        정확도 {accuracyPct(totals)}% · 정타 {totals.correct} · 오타 {totals.errors}
      </div>
      <div className="actions">
        <button onClick={onRestart}>다시</button>
        <button className="primary" onClick={onExit}>
          프로필로
        </button>
      </div>
    </div>
  )
}

const SprintPlay = ({
  lang,
  currentLine,
  rendered,
  cursorChar,
  remaining,
  totals,
}: {
  lang: Lang
  currentLine: string
  rendered: string
  cursorChar: number
  remaining: number
  totals: Totals
}) => (
  <div className="sprint-play">
    <SprintHud remaining={remaining} totals={totals} />
    <div className="sprint-line">
      <div className="sprint-target" aria-label="목표">
        {Array.from(currentLine).map((ch, i) => (
          <span
            key={i}
            className={`tch ${i < cursorChar ? 'correct' : 'pending'}${ch === ' ' ? ' space' : ''}`}
          >
            {ch === ' ' ? '·' : ch}
          </span>
        ))}
      </div>
      <div className="sprint-input" aria-label="입력 중">
        {rendered.length > 0 ? (
          rendered.replace(/ /g, '·')
        ) : (
          <span className="placeholder">
            {lang === 'en' ? 'Start typing…' : '타이핑을 시작하세요…'}
          </span>
        )}
        <span className="caret" />
      </div>
    </div>
    <p className="sprint-hint">1분 동안 최대한 많이! 줄은 자동으로 넘어갑니다.</p>
  </div>
)

const useSprintEngine = (
  finished: boolean,
  startedAt: number | null,
  inputCount: number,
  errorCount: number,
  advance: () => void
) => {
  const { remaining, done, started, start, reset } = useCountdown(DURATION)
  const completedRef = useRef<Totals>({ correct: 0, errors: 0 })
  const [snapshot, setSnapshot] = useState<Totals | null>(null)

  // Start the clock on the first keystroke.
  useEffect(() => {
    if (startedAt && !started) start()
  }, [startedAt, started, start])

  // Bank a finished line and move on (unless time is already up).
  useEffect(() => {
    if (!finished || done) return
    completedRef.current.correct += Math.max(0, inputCount - errorCount)
    completedRef.current.errors += errorCount
    advance()
    // advance() resets the per-line state; deps cover the finish transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, done])

  const live: Totals = {
    correct: completedRef.current.correct + Math.max(0, inputCount - errorCount),
    errors: completedRef.current.errors + errorCount,
  }

  // Freeze the result the moment time runs out (includes the partial line).
  useEffect(() => {
    if (done && !snapshot) setSnapshot({ ...live })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const resetEngine = () => {
    completedRef.current = { correct: 0, errors: 0 }
    setSnapshot(null)
    reset()
  }

  return { remaining, done, live, snapshot, resetEngine }
}

const SprintKo = ({ lines, onExit }: { lines: string[]; onExit: () => void }) => {
  const [lineIdx, setLineIdx] = useState(0)
  const currentLine = lines.length > 0 ? lines[lineIdx % lines.length] : ''
  const { state, derived, restart } = useTypingSession(currentLine)

  const { remaining, live, snapshot, resetEngine } = useSprintEngine(
    !!state.finishedAt,
    state.startedAt,
    state.inputCount,
    state.errorCount,
    () => setLineIdx((i) => i + 1)
  )

  if (snapshot) {
    return (
      <SprintSummary
        lang="ko"
        totals={snapshot}
        onRestart={() => {
          resetEngine()
          setLineIdx(0)
          restart()
        }}
        onExit={onExit}
      />
    )
  }

  return (
    <SprintPlay
      lang="ko"
      currentLine={currentLine}
      rendered={derived.rendered}
      cursorChar={derived.cursorChar}
      remaining={remaining}
      totals={live}
    />
  )
}

const SprintEn = ({ lines, onExit }: { lines: string[]; onExit: () => void }) => {
  const [lineIdx, setLineIdx] = useState(0)
  const currentLine = lines.length > 0 ? lines[lineIdx % lines.length] : ''
  const { state, derived, restart } = useEnglishSession(currentLine)

  const { remaining, live, snapshot, resetEngine } = useSprintEngine(
    !!state.finishedAt,
    state.startedAt,
    state.inputCount,
    state.errorCount,
    () => setLineIdx((i) => i + 1)
  )

  if (snapshot) {
    return (
      <SprintSummary
        lang="en"
        totals={snapshot}
        onRestart={() => {
          resetEngine()
          setLineIdx(0)
          restart()
        }}
        onExit={onExit}
      />
    )
  }

  return (
    <SprintPlay
      lang="en"
      currentLine={currentLine}
      rendered={state.inputs.join('')}
      cursorChar={derived.cursorChar}
      remaining={remaining}
      totals={live}
    />
  )
}

interface Props {
  lang: Lang
  lines: string[]
  onExit: () => void
}

export const SprintScreen = ({ lang, lines, onExit }: Props) =>
  lang === 'en' ? (
    <SprintEn lines={lines} onExit={onExit} />
  ) : (
    <SprintKo lines={lines} onExit={onExit} />
  )
