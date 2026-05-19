import { useEffect, useState } from 'react'
import {
  fetchTodayTopRecords,
  fetchTopRecords,
  type CloudRecord,
} from '../storage/cloudRanking'
import type { Lang } from '../lessons/sources'
import './Leaderboard.css'

interface Props {
  userName: string
  lang: Lang
  refreshKey?: number
}

type Mode = 'all' | 'today'

const Row = ({
  r,
  rank,
  me,
  lang,
}: {
  r: CloudRecord
  rank: number
  me: boolean
  lang: Lang
}) => {
  const value = lang === 'en' ? Math.round(r.cpm / 5) : Math.round(r.cpm)
  return (
    <li className={`lb-row${me ? ' me' : ''}`}>
      <span className="lb-rank">{rank}</span>
      <span className="lb-user">{r.user}</span>
      <span className="lb-text" title={r.text}>
        {r.text}
      </span>
      <span className="lb-cpm">{value}</span>
      <span className="lb-acc">{Math.round(r.accuracy * 100)}%</span>
    </li>
  )
}

export const Leaderboard = ({ userName, lang, refreshKey }: Props) => {
  const [mode, setMode] = useState<Mode>('all')
  const [allRecords, setAllRecords] = useState<CloudRecord[] | null>(null)
  const [todayRecords, setTodayRecords] = useState<CloudRecord[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchTopRecords(lang, 10), fetchTodayTopRecords(lang, 10)])
      .then(([all, today]) => {
        setAllRecords(all)
        setTodayRecords(today)
        setLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setLoading(false)
      })
  }, [refreshKey, lang])

  const records = mode === 'all' ? allRecords : todayRecords
  const unitLabel = lang === 'en' ? 'WPM' : 'CPM'

  return (
    <section className="leaderboard">
      <div className="lb-header">
        <h3>🏆 랭킹 ({unitLabel})</h3>
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
              lang={lang}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
