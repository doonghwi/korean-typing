import { useState } from 'react'
import {
  getAllTimeBest,
  getRecentRecords,
  getTodayBest,
  getTodayCount,
  type BestRecord,
  type LineRecord,
} from '../storage/progress'
import { SOURCES, sourceShortLabel } from '../lessons/sources'
import './Profile.css'

interface Props {
  userName: string
  onStart: (source: string) => void
  onSwitchUser: () => void
}

const formatRelative = (at: number): string => {
  const diff = Date.now() - at
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  const date = new Date(at)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const StatCard = ({
  label,
  record,
  variant,
}: {
  label: string
  record: BestRecord | null
  variant?: 'primary'
}) => (
  <div className={`stat-card${variant === 'primary' ? ' primary' : ''}`}>
    <div className="sc-label">{label}</div>
    <div className="sc-value">
      {record ? Math.round(record.cpm) : '—'}
      <span className="sc-unit">CPM</span>
    </div>
    <div className="sc-sub">
      {record ? (
        <>
          정확도 {Math.round(record.accuracy * 100)}% ·{' '}
          <span className="sc-text" title={record.text}>
            “{record.text}”
          </span>
        </>
      ) : (
        '기록 없음'
      )}
    </div>
  </div>
)

const RecentRow = ({ r }: { r: LineRecord }) => (
  <li className="recent-row">
    <span className="rr-when">{formatRelative(r.at)}</span>
    <span className="rr-text" title={r.text}>
      {r.text}
    </span>
    <span className="rr-cpm">{Math.round(r.cpm)} CPM</span>
    <span className="rr-acc">{Math.round(r.accuracy * 100)}%</span>
  </li>
)

export const Profile = ({ userName, onStart, onSwitchUser }: Props) => {
  const [source, setSource] = useState<string>('random')
  const today = getTodayBest(userName)
  const allTime = getAllTimeBest(userName)
  const recent = getRecentRecords(userName, 6)
  const todayCount = getTodayCount(userName)

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar">{userName.slice(0, 1).toUpperCase()}</div>
        <div className="profile-name-row">
          <div className="profile-name">{userName}</div>
          <div className="profile-meta">오늘 친 줄 {todayCount}개</div>
        </div>
        <button className="switch" onClick={onSwitchUser}>
          다른 사용자
        </button>
      </div>

      <div className="stat-cards">
        <StatCard label="오늘 최고 타수" record={today} />
        <StatCard label="역대 최고 타수" record={allTime} variant="primary" />
      </div>

      <div className="start-row">
        <label className="source-select">
          <span className="ss-label">연습 종류</span>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button className="start-btn" onClick={() => onStart(source)}>
          {sourceShortLabel(source)} 시작
        </button>
      </div>

      <section className="recent">
        <h3>최근 기록</h3>
        {recent.length === 0 ? (
          <p className="empty">아직 기록이 없습니다. 한 줄만 쳐도 자동 저장됩니다.</p>
        ) : (
          <ul>
            {recent.map((r) => (
              <RecentRow key={r.at} r={r} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
