import './Stats.css'

interface Props {
  cpm: number
  accuracy: number
  elapsedSeconds: number
  errors: number
}

const formatTime = (s: number): string => {
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export const Stats = ({ cpm, accuracy, elapsedSeconds, errors }: Props) => (
  <div className="stats">
    <div className="stat">
      <div className="value">{Math.round(cpm)}</div>
      <div className="label">타/분 (CPM)</div>
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
