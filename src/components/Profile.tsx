import {
  getAllTimeBest,
  getRecentSessions,
  getTodayBest,
  getTodayStats,
  type BestRecord,
  type SessionRecord,
} from '../storage/progress'
import { findStage } from '../lessons/data'
import './Profile.css'

interface Props {
  userName: string
  onStart: () => void
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

const stageTitle = (id: number): string =>
  findStage(id)?.title ?? `Stage ${id}`

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
          정확도 {Math.round(record.accuracy * 100)}% · {stageTitle(record.stageId)}
        </>
      ) : (
        '기록 없음'
      )}
    </div>
  </div>
)

const RecentRow = ({ s }: { s: SessionRecord }) => (
  <li className="recent-row">
    <span className="rr-when">{formatRelative(s.at)}</span>
    <span className="rr-stage">{stageTitle(s.stageId)}</span>
    <span className="rr-cpm">{Math.round(s.cpm)} CPM</span>
    <span className="rr-acc">{Math.round(s.accuracy * 100)}%</span>
  </li>
)

export const Profile = ({ userName, onStart, onSwitchUser }: Props) => {
  const today = getTodayBest(userName)
  const allTime = getAllTimeBest(userName)
  const recent = getRecentSessions(userName, 6)
  const todayStats = getTodayStats(userName)

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar">{userName.slice(0, 1).toUpperCase()}</div>
        <div className="profile-name-row">
          <div className="profile-name">{userName}</div>
          <div className="profile-meta">오늘 연습 {todayStats.sessions}회</div>
        </div>
        <button className="switch" onClick={onSwitchUser}>
          다른 사용자
        </button>
      </div>

      <div className="stat-cards">
        <StatCard label="오늘 최고 타수" record={today} />
        <StatCard label="역대 최고 타수" record={allTime} variant="primary" />
      </div>

      <section className="recent">
        <h3>최근 기록</h3>
        {recent.length === 0 ? (
          <p className="empty">아직 연습 기록이 없습니다. 시작해 보세요.</p>
        ) : (
          <ul>
            {recent.map((s, i) => (
              <RecentRow key={`${s.at}-${i}`} s={s} />
            ))}
          </ul>
        )}
      </section>

      <button className="start-btn" onClick={onStart}>
        연습 시작
      </button>
    </div>
  )
}
