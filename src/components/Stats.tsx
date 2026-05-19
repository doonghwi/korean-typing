import type { Lang } from '../lessons/sources'
import './Stats.css'

interface Props {
  cpm: number
  wpm?: number
  accuracy: number
  elapsedSeconds: number
  errors: number
  lang?: Lang
}

const formatTime = (s: number): string => {
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export const Stats = ({
  cpm,
  wpm,
  accuracy,
  elapsedSeconds,
  errors,
  lang = 'ko',
}: Props) => {
  const isEn = lang === 'en'
  const primaryValue = isEn
    ? Math.round(wpm ?? cpm / 5)
    : Math.round(cpm)
  const primaryLabel = isEn ? '단어/분 (WPM)' : '타/분 (CPM)'

  return (
    <div className="stats">
      <div className="stat">
        <div className="value">{primaryValue}</div>
        <div className="label">{primaryLabel}</div>
      </div>
      <div className="stat">
        <div className="value">{Math.round(accuracy * 100)}%</div>
        <div className="label">정확도</div>
      </div>
      <div className="stat">
        <div className="value">{formatTime(elapsedSeconds)}</div>
        <div className="label">경과</div>
      </div>
      <div className="stat">
        <div className="value">{errors}</div>
        <div className="label">오타</div>
      </div>
    </div>
  )
}
