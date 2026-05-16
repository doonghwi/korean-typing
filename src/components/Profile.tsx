import { useState } from 'react'
import {
  getAllTimeBest,
  getRecentRecords,
  getTodayBest,
  getTodayCount,
  type BestRecord,
  type LineRecord,
} from '../storage/progress'
import {
  POSITION_OPTIONS,
  SENTENCE_OPTIONS,
  WORD_OPTIONS,
} from '../lessons/sources'
import { Leaderboard } from './Leaderboard'
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

interface SectionProps {
  title: string
  subtitle: string
  value: string
  onChange: (v: string) => void
  onStart: () => void
  children: React.ReactNode
}

const PracticeSection = ({
  title,
  subtitle,
  value,
  onChange,
  onStart,
  children,
}: SectionProps) => (
  <section className="practice-section">
    <div className="ps-header">
      <h3>{title}</h3>
      <span className="ps-sub">{subtitle}</span>
    </div>
    <div className="start-row">
      <label className="source-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
      </label>
      <button className="start-btn" onClick={onStart}>
        시작
      </button>
    </div>
  </section>
)

export const Profile = ({ userName, onStart, onSwitchUser }: Props) => {
  const [positionSrc, setPositionSrc] = useState<string>(
    POSITION_OPTIONS[0]?.value ?? ''
  )
  const [wordsSrc, setWordsSrc] = useState<string>(
    WORD_OPTIONS[WORD_OPTIONS.length - 1]?.value ?? ''
  )
  const [sentenceSrc, setSentenceSrc] = useState<string>(
    SENTENCE_OPTIONS[0]?.value ?? ''
  )

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

      <div className="practice-sections">
        <PracticeSection
          title="자리연습"
          subtitle="단계별 자판 위치 익히기"
          value={positionSrc}
          onChange={setPositionSrc}
          onStart={() => onStart(positionSrc)}
        >
          {POSITION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>

        <PracticeSection
          title="단어연습"
          subtitle="배운 자판까지의 단어로 연습"
          value={wordsSrc}
          onChange={setWordsSrc}
          onStart={() => onStart(wordsSrc)}
        >
          {WORD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>

        <PracticeSection
          title="문장연습"
          subtitle="전체 셔플로 진행. 랭킹에 등록됩니다."
          value={sentenceSrc}
          onChange={setSentenceSrc}
          onStart={() => onStart(sentenceSrc)}
        >
          {SENTENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>
      </div>

      <Leaderboard userName={userName} />

      <section className="recent">
        <h3>내 최근 기록</h3>
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
