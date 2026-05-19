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
  POSITION_OPTIONS_EN,
  SENTENCE_OPTIONS,
  SENTENCE_OPTIONS_EN,
  WORD_OPTIONS,
  WORD_OPTIONS_EN,
  type Lang,
} from '../lessons/sources'
import { Leaderboard } from './Leaderboard'
import './Profile.css'

interface Props {
  userName: string
  lang: Lang
  onLangChange: (lang: Lang) => void
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

export const Profile = ({
  userName,
  lang,
  onLangChange,
  onStart,
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
