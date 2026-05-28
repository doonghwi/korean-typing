import { useMemo, useState } from 'react'
import {
  getAllTimeBest,
  getRecentRecords,
  getStreak,
  getTodayBest,
  getTodayCount,
  getWeakKeys,
  type BestRecord,
  type KeyStat,
  type LineRecord,
  type StreakInfo,
} from '../storage/progress'
import {
  POSITION_OPTIONS,
  POSITION_OPTIONS_EN,
  SENTENCE_OPTIONS,
  SENTENCE_OPTIONS_EN,
  WORD_OPTIONS,
  WORD_OPTIONS_EN,
  type Lang,
} from '../lessons/sources'
import { jamoToKey } from '../hangul/dubeolsik'
import { Leaderboard } from './Leaderboard'
import './Profile.css'

interface Props {
  userName: string
  lang: Lang
  onLangChange: (lang: Lang) => void
  onStart: (source: string) => void
  onStartWeak: () => void
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
  unit,
  formatValue,
}: {
  label: string
  record: BestRecord | null
  variant?: 'primary'
  unit: string
  formatValue: (cpm: number) => number
}) => (
  <div className={`stat-card${variant === 'primary' ? ' primary' : ''}`}>
    <div className="sc-label">{label}</div>
    <div className="sc-value">
      {record ? formatValue(record.cpm) : '—'}
      <span className="sc-unit">{unit}</span>
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

const RecentRow = ({
  r,
  unit,
  formatValue,
}: {
  r: LineRecord
  unit: string
  formatValue: (cpm: number) => number
}) => (
  <li className="recent-row">
    <span className="rr-when">{formatRelative(r.at)}</span>
    <span className="rr-text" title={r.text}>
      {r.text}
    </span>
    <span className="rr-cpm">
      {formatValue(r.cpm)} {unit}
    </span>
    <span className="rr-acc">{Math.round(r.accuracy * 100)}%</span>
  </li>
)

interface SectionProps {
  title: string
  value: string
  onChange: (v: string) => void
  onStart: () => void
  children: React.ReactNode
}

const PracticeSection = ({
  title,
  value,
  onChange,
  onStart,
  children,
}: SectionProps) => (
  <section className="practice-section">
    <h3 className="ps-title">{title}</h3>
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

const LangToggle = ({
  lang,
  onChange,
}: {
  lang: Lang
  onChange: (lang: Lang) => void
}) => (
  <div className="lang-toggle" role="tablist" aria-label="언어 선택">
    <button
      role="tab"
      aria-selected={lang === 'ko'}
      className={lang === 'ko' ? 'active' : ''}
      onClick={() => onChange('ko')}
    >
      한국어
    </button>
    <button
      role="tab"
      aria-selected={lang === 'en'}
      className={lang === 'en' ? 'active' : ''}
      onClick={() => onChange('en')}
    >
      English
    </button>
  </div>
)

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

type StreakState = 'start' | 'alive' | 'active'

const streakState = (s: StreakInfo): StreakState => {
  if (s.current === 0) return 'start'
  return s.activeToday ? 'active' : 'alive'
}

const streakHeadline = (
  s: StreakInfo
): { emoji: string; title: string; sub: string } => {
  switch (streakState(s)) {
    case 'active':
      return {
        emoji: '🔥',
        title: `${s.current}일 연속 달성!`,
        sub: pick([
          '오늘도 해냈어요. 내일도 이어가요!',
          '꾸준함이 곧 실력이 됩니다.',
          s.current >= s.best
            ? '역대 최장 기록을 갱신하는 중이에요!'
            : `최장 기록은 ${s.best}일 — 곧 따라잡겠는데요?`,
        ]),
      }
    case 'alive':
      return {
        emoji: '⚡',
        title: `${s.current}일 연속 진행 중`,
        sub: pick([
          '오늘 한 줄이면 streak이 이어져요!',
          `여기서 멈추면 아까워요. ${s.current + 1}일째로 가요!`,
          '딱 한 줄만 쳐도 오늘이 안전합니다.',
        ]),
      }
    default:
      return {
        emoji: '🌱',
        title: '오늘부터 연속 기록 시작!',
        sub: pick([
          '한 줄만 쳐도 오늘이 카운트돼요.',
          '작은 한 걸음이 streak의 시작이에요.',
          '지금 한 줄이 내일의 2일 연속을 만들어요.',
        ]),
      }
  }
}

const DAILY_GOAL = 10

const StreakBanner = ({ userName, lang }: { userName: string; lang: Lang }) => {
  // Recompute per user; a fresh component mount (each profile entry) re-rolls
  // the encouraging line so it varies every time the user lands here.
  const streak = useMemo(() => getStreak(userName), [userName])
  const head = useMemo(() => streakHeadline(streak), [streak])

  const todayCount = getTodayCount(userName, lang)
  const goalMet = todayCount >= DAILY_GOAL
  const pct = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100))

  return (
    <div className={`streak-banner ${streakState(streak)}`}>
      <div className="streak-main">
        <span className="streak-flame" aria-hidden>
          {head.emoji}
        </span>
        <div className="streak-text">
          <div className="streak-title">{head.title}</div>
          <div className="streak-sub">{head.sub}</div>
        </div>
        {streak.current > 0 ? (
          <div className="streak-count">
            <span className="streak-num">{streak.current}</span>
            <span className="streak-unit">일</span>
          </div>
        ) : null}
      </div>
      <div className={`daily-goal${goalMet ? ' met' : ''}`}>
        <div className="dg-label">
          {goalMet
            ? '오늘 목표 달성! 🎉'
            : `오늘 목표 ${Math.min(todayCount, DAILY_GOAL)}/${DAILY_GOAL} 줄`}
        </div>
        <div className="dg-bar">
          <div className="dg-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

const WeakKeyChip = ({ stat, lang }: { stat: KeyStat; lang: Lang }) => {
  const keyHint = lang === 'ko' ? jamoToKey(stat.key)?.toUpperCase() ?? null : null
  return (
    <li className="wk-chip">
      <span className="wk-key">{stat.key}</span>
      {keyHint ? <span className="wk-hint">{keyHint}</span> : null}
      <span className="wk-rate">{Math.round(stat.rate * 100)}%</span>
    </li>
  )
}

const WeakKeys = ({
  userName,
  lang,
  onStartWeak,
}: {
  userName: string
  lang: Lang
  onStartWeak: () => void
}) => {
  const weak = useMemo(() => getWeakKeys(userName, lang), [userName, lang])
  if (weak.length === 0) return null
  return (
    <section className="weak-keys">
      <div className="wk-header">
        <h3>약점 키 — 자주 틀리는 {lang === 'en' ? '글자' : '자모'}</h3>
        <button className="wk-start" onClick={onStartWeak}>
          맞춤 연습 →
        </button>
      </div>
      <ul className="wk-list">
        {weak.map((k) => (
          <WeakKeyChip key={k.key} stat={k} lang={lang} />
        ))}
      </ul>
    </section>
  )
}

export const Profile = ({
  userName,
  lang,
  onLangChange,
  onStart,
  onStartWeak,
  onSwitchUser,
}: Props) => {
  const positionOptions = lang === 'en' ? POSITION_OPTIONS_EN : POSITION_OPTIONS
  const wordOptions = lang === 'en' ? WORD_OPTIONS_EN : WORD_OPTIONS
  const sentenceOptions = lang === 'en' ? SENTENCE_OPTIONS_EN : SENTENCE_OPTIONS

  const [positionSrc, setPositionSrc] = useState<string>(
    positionOptions[0]?.value ?? ''
  )
  const [wordsSrc, setWordsSrc] = useState<string>(
    wordOptions[wordOptions.length - 1]?.value ?? ''
  )
  const [sentenceSrc, setSentenceSrc] = useState<string>(
    sentenceOptions[0]?.value ?? ''
  )

  // Reset dropdown selections when the language changes so the user starts
  // from a sensible default in the new language.
  const [prevLang, setPrevLang] = useState<Lang>(lang)
  if (prevLang !== lang) {
    setPrevLang(lang)
    setPositionSrc(positionOptions[0]?.value ?? '')
    setWordsSrc(wordOptions[wordOptions.length - 1]?.value ?? '')
    setSentenceSrc(sentenceOptions[0]?.value ?? '')
  }

  const today = getTodayBest(userName, lang)
  const allTime = getAllTimeBest(userName, lang)
  const recent = getRecentRecords(userName, 6, lang)
  const todayCount = getTodayCount(userName, lang)

  const isEn = lang === 'en'
  const unit = isEn ? 'WPM' : 'CPM'
  const formatValue = (cpm: number) =>
    isEn ? Math.round(cpm / 5) : Math.round(cpm)

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar">{userName.slice(0, 1).toUpperCase()}</div>
        <div className="profile-name-row">
          <div className="profile-name">{userName}</div>
          <div className="profile-meta">
            오늘 친 줄 {todayCount}개 · {lang === 'en' ? '영어' : '한국어'}
          </div>
        </div>
        <button className="switch" onClick={onSwitchUser}>
          다른 사용자
        </button>
      </div>

      <StreakBanner userName={userName} lang={lang} />

      <LangToggle lang={lang} onChange={onLangChange} />

      <div className="stat-cards">
        <StatCard
          label="오늘 최고 타수"
          record={today}
          unit={unit}
          formatValue={formatValue}
        />
        <StatCard
          label="역대 최고 타수"
          record={allTime}
          variant="primary"
          unit={unit}
          formatValue={formatValue}
        />
      </div>

      <WeakKeys userName={userName} lang={lang} onStartWeak={onStartWeak} />

      <div className="practice-sections">
        <PracticeSection
          title="자리연습"
          value={positionSrc}
          onChange={setPositionSrc}
          onStart={() => onStart(positionSrc)}
        >
          {positionOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>

        <PracticeSection
          title="단어연습"
          value={wordsSrc}
          onChange={setWordsSrc}
          onStart={() => onStart(wordsSrc)}
        >
          {wordOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>

        <PracticeSection
          title="문장연습"
          value={sentenceSrc}
          onChange={setSentenceSrc}
          onStart={() => onStart(sentenceSrc)}
        >
          {sentenceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PracticeSection>
      </div>

      <Leaderboard userName={userName} lang={lang} />

      <section className="recent">
        <h3>내 최근 기록</h3>
        {recent.length === 0 ? (
          <p className="empty">아직 기록이 없습니다. 한 줄만 쳐도 자동 저장됩니다.</p>
        ) : (
          <ul>
            {recent.map((r) => (
              <RecentRow
                key={r.at}
                r={r}
                unit={unit}
                formatValue={formatValue}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
