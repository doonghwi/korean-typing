import { useEffect, useState } from 'react'
import {
  fetchTodayTopRecords,
  fetchTopRecords,
  type CloudRecord,
} from '../storage/cloudRanking'
import './Leaderboard.css'

interface Props {
  userName: string
  refreshKey?: number
}

type Mode = 'all' | 'today'

const Row = ({
  r,
  rank,
  me,
}: {
  r: CloudRecord
  rank: number
  me: boolean
}) => (
  <li className={`lb-row${me ? ' me' : ''}`}>
    <span className="lb-rank">{rank}</span>
    <span className="lb-user">{r.user}</span>
    <span className="lb-text" title={r.text}>
      {r.text}
    </span>
    <span className="lb-cpm">{Math.round(r.cpm)}</span>
    <span className="lb-acc">{Math.round(r.accuracy * 100)}%</span>
  </li>
)

export const Leaderboard = ({ userName, refreshKey }: Props) => {
  const [mode, setMode] = useState<Mode>('all')
  const [allRecords, setAllRecords] = useState<CloudRecord[] | null>(null)
  const [todayRecords, setTodayRecords] = useState<CloudRecord[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchTopRecords(10), fetchTodayTopRecords(10)])
      .then(([all, today]) => {
        setAllRecords(all)
        setTodayRecords(today)
        setLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setLoading(false)
      })
  }, [refreshKey])

  const records = mode === 'all' ? allRecords : todayRecords

  return (
    <section className="leaderboard">
      <div className="lb-header">
        <h3>🏆 랭킹</h3>
        <div className="lb-tabs">
          <button
            className={mode === 'all' ? 'active' : ''}
            onClick={() => setMode('all')}
          >
            역대
          </button>
          <button
            className={mode === 'today' ? 'active' : ''}
            onClick={() => setMode('today')}
          >
            오늘
          </button>
        </div>
      </div>

      {loading ? (
        <p className="lb-empty">불러오는 중…</p>
      ) : error ? (
        <p className="lb-empty">랭킹을 불러올 수 없습니다.</p>
      ) : !records || records.length === 0 ? (
        <p className="lb-empty">
          {mode === 'today'
            ? '오늘 기록이 아직 없습니다.'
            : '아직 기록이 없습니다. 한 줄 쳐서 등록해 보세요.'}
        </p>
      ) : (
        <ol className="lb-list">
          {records.map((r, i) => (
            <Row
              key={`${r.user}-${r.at}-${i}`}
              r={r}
              rank={i + 1}
              me={r.user === userName}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
