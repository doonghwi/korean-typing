import { useEffect, useRef, useState } from 'react'
import { useTypingSession } from '../hooks/useTypingSession'
import { useEnglishSession } from '../hooks/useEnglishSession'
import { useCountdown } from '../hooks/useCountdown'
import { fetchTopSprints, type CloudSprint } from '../storage/cloudRanking'
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

const SprintLeaderboard = ({
  lang,
  userName,
}: {
  lang: Lang
  userName: string
}) => {
  const [rows, setRows] = useState<CloudSprint[] | null>(null)
  useEffect(() => {
    let alive = true
    fetchTopSprints(lang, 5).then((r) => {
      if (alive) setRows(r)
    })
    return () => {
      alive = false
    }
  }, [lang])

  if (rows === null) return <p className="sl-empty">랭킹 불러오는 중…</p>
  if (rows.length === 0) return null

  return (
    <ol className="sprint-lb">
      {rows.map((r, i) => (
        <li
          key={`${r.user}-${r.at}-${i}`}
          className={`sl-row${r.user === userName ? ' me' : ''}`}
        >
          <span className="sl-rank">{i + 1}</span>
          <span className="sl-user">{r.user}</span>
          <span className="sl-score">
            {lang === 'en' ? Math.round(r.score / 5) : r.score}
          </span>
        </li>
      ))}
    </ol>
  )
}

const SprintSummary = ({
  lang,
  userName,
  totals,
  bestSprint,
  onRestart,
  onExit,
}: {
  lang: Lang
  userName: string
  totals: Totals
  bestSprint: number
  onRestart: () => void
  onExit: () => void
}) => {
  const value = lang === 'en' ? Math.round(totals.correct / 5) : totals.correct
  const unit = lang === 'en' ? '단어 (1분)' : '타 (1분)'
  const isNewBest = totals.correct >= bestSprint && totals.correct > 0
  return (
    <div className="sprint-summary">
      <h2>⏱️ 스프린트 종료!</h2>
      {isNewBest ? <div className="ss-newbest">🏅 내 최고 기록!</div> : null}
      <div className="ss-big">
        {value}
        <span className="ss-unit">{unit}</span>
      </div>
      <div className="ss-sub">
        정확도 {accuracyPct(totals)}% · 정타 {totals.correct} · 오타 {totals.errors}
      </div>
      <SprintLeaderboard lang={lang} userName={userName} />
      <div className="actions">
        <button onClick={onRestart}>다시</button>
        <button className="primary" onClick={onExit}>
          프로필로
        </button>
      </div>
    </div>
  )
}

type SprintCharStatus = 'pending' | 'current' | 'correct' | 'wrong'
interface TargetCh {
  ch: string
  status: SprintCharStatus
}
interface InputCh {
  ch: string
  status: 'correct' | 'wrong'
}

// Per-syllable status for Korean: a displayed character spans a jamo range
// [start, end); it's wrong if any jamo in that range was mistyped.
const koTargetChars = (
  line: string,
  boundaries: number[],
  inputCount: number,
  inputs: string[],
  targetJamo: string[]
): TargetCh[] =>
  Array.from(line).map((ch, i) => {
    const start = i === 0 ? 0 : boundaries[i - 1]
    const end = boundaries[i]
    let status: SprintCharStatus
    if (inputCount < start) status = 'pending'
    else if (inputCount < end) status = 'current'
    else {
      status = 'correct'
      for (let j = start; j < end; j++) {
        if (inputs[j] !== targetJamo[j]) {
          status = 'wrong'
          break
        }
      }
    }
    return { ch, status }
  })

// 1:1 status for English.
const enTargetChars = (
  targetChars: string[],
  inputCount: number,
  inputs: string[]
): TargetCh[] =>
  targetChars.map((ch, i) => {
    let status: SprintCharStatus
    if (i < inputCount) status = inputs[i] === ch ? 'correct' : 'wrong'
    else if (i === inputCount) status = 'current'
    else status = 'pending'
    return { ch, status }
  })

// Colour the typed text by comparing it position-by-position to the target.
const inputCharsOf = (rendered: string, line: string): InputCh[] =>
  Array.from(rendered).map((ch, i) => ({
    ch,
    status: line[i] !== undefined && ch !== line[i] ? 'wrong' : 'correct',
  }))

const SprintCharSpan = ({ ch, status }: { ch: string; status: SprintCharStatus }) => (
  <span className={`tch ${status}${ch === ' ' ? ' space' : ''}`}>
    {ch === ' ' ? '·' : ch}
  </span>
)

const SprintPlay = ({
  lang,
  targetChars,
  inputChars,
  remaining,
  totals,
}: {
  lang: Lang
  targetChars: TargetCh[]
  inputChars: InputCh[]
  remaining: number
  totals: Totals
}) => (
  <div className="sprint-play">
    <SprintHud remaining={remaining} totals={totals} />
    <div className="sprint-line">
      <div className="sprint-target" aria-label="목표">
        {targetChars.map(({ ch, status }, i) => (
          <SprintCharSpan key={i} ch={ch} status={status} />
        ))}
      </div>
      <div className="sprint-input" aria-label="입력 중">
        {inputChars.length > 0 ? (
          inputChars.map(({ ch, status }, i) => (
            <SprintCharSpan key={i} ch={ch} status={status} />
          ))
        ) : (
          <span className="placeholder">
            {lang === 'en' ? 'Start typing…' : '타이핑을 시작하세요…'}
          </span>
        )}
        <span className="caret" />
      </div>
    </div>
    <p className="sprint-hint">정확히 입력해야 다음으로 넘어가요. 틀리면 빨갛게 표시 — 백스페이스로 고치세요.</p>
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

// Fire onComplete exactly once per sprint when the result freezes.
const useFireOnComplete = (
  snapshot: Totals | null,
  onComplete: (correct: number, accuracy: number) => void
) => {
  const firedRef = useRef(false)
  useEffect(() => {
    if (snapshot && !firedRef.current) {
      firedRef.current = true
      const total = snapshot.correct + snapshot.errors
      onComplete(snapshot.correct, total > 0 ? snapshot.correct / total : 1)
    }
    if (!snapshot) firedRef.current = false
  }, [snapshot, onComplete])
}

interface SprintInnerProps {
  lines: string[]
  userName: string
  bestSprint: number
  onComplete: (correct: number, accuracy: number) => void
  onExit: () => void
}

const SprintKo = ({
  lines,
  userName,
  bestSprint,
  onComplete,
  onExit,
}: SprintInnerProps) => {
  const [lineIdx, setLineIdx] = useState(0)
  const currentLine = lines.length > 0 ? lines[lineIdx % lines.length] : ''
  const { state, derived, restart } = useTypingSession(currentLine, true)

  const { remaining, live, snapshot, resetEngine } = useSprintEngine(
    !!state.finishedAt,
    state.startedAt,
    state.inputCount,
    state.errorCount,
    () => setLineIdx((i) => i + 1)
  )
  useFireOnComplete(snapshot, onComplete)

  if (snapshot) {
    return (
      <SprintSummary
        lang="ko"
        userName={userName}
        totals={snapshot}
        bestSprint={bestSprint}
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
      targetChars={koTargetChars(
        currentLine,
        derived.boundaries,
        state.inputCount,
        state.inputs,
        state.targetJamo
      )}
      inputChars={inputCharsOf(derived.rendered, currentLine)}
      remaining={remaining}
      totals={live}
    />
  )
}

const SprintEn = ({
  lines,
  userName,
  bestSprint,
  onComplete,
  onExit,
}: SprintInnerProps) => {
  const [lineIdx, setLineIdx] = useState(0)
  const currentLine = lines.length > 0 ? lines[lineIdx % lines.length] : ''
  const { state, restart } = useEnglishSession(currentLine, true)

  const { remaining, live, snapshot, resetEngine } = useSprintEngine(
    !!state.finishedAt,
    state.startedAt,
    state.inputCount,
    state.errorCount,
    () => setLineIdx((i) => i + 1)
  )
  useFireOnComplete(snapshot, onComplete)

  if (snapshot) {
    return (
      <SprintSummary
        lang="en"
        userName={userName}
        totals={snapshot}
        bestSprint={bestSprint}
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
      targetChars={enTargetChars(state.targetChars, state.inputCount, state.inputs)}
      inputChars={inputCharsOf(state.inputs.join(''), currentLine)}
      remaining={remaining}
      totals={live}
    />
  )
}

interface Props {
  lang: Lang
  lines: string[]
  userName: string
  bestSprint: number
  onComplete: (correct: number, accuracy: number) => void
  onExit: () => void
}

export const SprintScreen = ({
  lang,
  lines,
  userName,
  bestSprint,
  onComplete,
  onExit,
}: Props) =>
  lang === 'en' ? (
    <SprintEn
      lines={lines}
      userName={userName}
      bestSprint={bestSprint}
      onComplete={onComplete}
      onExit={onExit}
    />
  ) : (
    <SprintKo
      lines={lines}
      userName={userName}
      bestSprint={bestSprint}
      onComplete={onComplete}
      onExit={onExit}
    />
  )
