import { useCallback, useMemo, useState } from 'react'
import { TypingScreen } from './components/TypingScreen'
import { TypingScreenEn } from './components/TypingScreenEn'
import { SprintScreen } from './components/SprintScreen'
import { FallingGame } from './components/FallingGame'
import { UserPicker } from './components/UserPicker'
import { Profile } from './components/Profile'
import {
  buildFallingPool,
  buildSprintPool,
  buildWeakPracticeLines,
  isValidSource,
  langOfSource,
  linesForSource,
  sourceLabel,
  WEAK_SOURCE,
  WEAK_SOURCE_EN,
  type Lang,
} from './lessons/sources'
import {
  clearCurrentUser,
  getAllTimeBest,
  getBestFalling,
  getBestSprint,
  getCurrentUser,
  getTodayBest,
  getUserLang,
  getWeakKeys,
  recordFalling,
  recordKeyStats,
  recordLine,
  recordSprint,
  setUserLang,
} from './storage/progress'
import { pushFalling, pushSprint } from './storage/cloudRanking'
import { shuffle } from './utils/shuffle'
import './App.css'

type View =
  | { kind: 'pick-user' }
  | { kind: 'profile' }
  | {
      kind: 'session'
      source: string
      sessionKey: number
      customLines?: string[]
      weakKeys?: string[]
    }
  | { kind: 'sprint'; lang: Lang; sessionKey: number }
  | { kind: 'falling'; lang: Lang; sessionKey: number }

function App() {
  const initialUser = getCurrentUser()
  const [user, setUser] = useState<string | null>(initialUser)
  const [lang, setLangState] = useState<Lang>(() =>
    initialUser ? getUserLang(initialUser) : 'ko'
  )
  const [view, setView] = useState<View>(() =>
    initialUser ? { kind: 'profile' } : { kind: 'pick-user' }
  )

  const pickUser = useCallback((name: string) => {
    setUser(name)
    setLangState(getUserLang(name))
    setView({ kind: 'profile' })
  }, [])

  const switchUser = useCallback(() => {
    clearCurrentUser()
    setUser(null)
    setView({ kind: 'pick-user' })
  }, [])

  const goToProfile = useCallback(() => setView({ kind: 'profile' }), [])

  const startSession = useCallback((source: string) => {
    setView({ kind: 'session', source, sessionKey: Date.now() })
  }, [])

  const startSprint = useCallback(() => {
    setView({ kind: 'sprint', lang, sessionKey: Date.now() })
  }, [lang])

  const startFalling = useCallback(() => {
    setView({ kind: 'falling', lang, sessionKey: Date.now() })
  }, [lang])

  const startWeakPractice = useCallback(() => {
    if (!user) return
    const weak = getWeakKeys(user, lang).map((k) => k.key)
    const lines = buildWeakPracticeLines(weak, lang)
    if (lines.length === 0) return
    setView({
      kind: 'session',
      source: lang === 'en' ? WEAK_SOURCE_EN : WEAK_SOURCE,
      sessionKey: Date.now(),
      customLines: lines,
      weakKeys: weak,
    })
  }, [user, lang])

  const changeLang = useCallback(
    (next: Lang) => {
      if (user) setUserLang(user, next)
      setLangState(next)
    },
    [user]
  )

  const onLineComplete = useCallback(
    (r: {
      cpm: number
      accuracy: number
      seconds: number
      text: string
      keyStats: { attempts: Record<string, number>; misses: Record<string, number> }
    }) => {
      if (user && view.kind === 'session') {
        recordLine(user, view.source, r.cpm, r.accuracy, r.text)
        recordKeyStats(
          user,
          langOfSource(view.source),
          r.keyStats.attempts,
          r.keyStats.misses
        )
      }
    },
    [user, view]
  )

  const sessionSource = view.kind === 'session' ? view.source : null
  const sessionKey = view.kind === 'session' ? view.sessionKey : null
  const sessionCustomLines = view.kind === 'session' ? view.customLines : undefined
  const sessionWeakKeys = view.kind === 'session' ? view.weakKeys : undefined
  const sessionLang: Lang = sessionSource ? langOfSource(sessionSource) : 'ko'
  const shuffledLines = useMemo(() => {
    if (!sessionSource) return []
    return shuffle(sessionCustomLines ?? linesForSource(sessionSource))
  }, [sessionKey, sessionSource, sessionCustomLines])

  // Personal-best baseline frozen at session start, so beating it mid-session
  // doesn't immediately stop the "new record" celebration.
  const sessionBestCpm = useMemo(() => {
    if (!user || !sessionSource) return 0
    return getAllTimeBest(user, sessionLang)?.cpm ?? 0
  }, [sessionKey, user, sessionSource, sessionLang])

  const sessionTodayBestCpm = useMemo(() => {
    if (!user || !sessionSource) return 0
    return getTodayBest(user, sessionLang)?.cpm ?? 0
  }, [sessionKey, user, sessionSource, sessionLang])

  const sprintKey = view.kind === 'sprint' ? view.sessionKey : null
  const sprintLang = view.kind === 'sprint' ? view.lang : lang
  const sprintLines = useMemo(
    () => (sprintKey === null ? [] : shuffle(buildSprintPool(sprintLang))),
    [sprintKey, sprintLang]
  )
  const sprintBest =
    user && view.kind === 'sprint'
      ? getBestSprint(user, view.lang)?.correct ?? 0
      : 0

  const onSprintComplete = useCallback(
    (correct: number, accuracy: number) => {
      if (!user || view.kind !== 'sprint') return
      recordSprint(user, view.lang, correct, accuracy)
      // Push the personal best (not just this run) so the board reflects the
      // true high score and recovers records made before the cloud was set up.
      const best = getBestSprint(user, view.lang)
      void pushSprint({
        user,
        lang: view.lang,
        score: best?.correct ?? correct,
        accuracy: best?.accuracy ?? accuracy,
      })
    },
    [user, view]
  )

  const fallingKey = view.kind === 'falling' ? view.sessionKey : null
  const fallingLang = view.kind === 'falling' ? view.lang : lang
  const fallingPool = useMemo(
    () => (fallingKey === null ? [] : buildFallingPool(fallingLang)),
    [fallingKey, fallingLang]
  )
  const fallingBest =
    user && view.kind === 'falling' ? getBestFalling(user, view.lang) : 0

  const onFallingComplete = useCallback(
    (score: number) => {
      if (!user || view.kind !== 'falling') return
      recordFalling(user, view.lang, score)
      // Push the personal best so the board shows the true high score (and
      // recovers scores from before the cloud rules/index existed).
      void pushFalling({ user, lang: view.lang, score: getBestFalling(user, view.lang) })
    },
    [user, view]
  )

  return (
    <main className="app">
      <header className="hero">
        <h1>{lang === 'en' ? 'English Typing' : '한글 타자 연습'}</h1>
        <p className="tagline">
          {lang === 'en'
            ? 'QWERTY · 손가락 가이드 · iPad 지원'
            : '두벌식 · 손가락 가이드 · iPad 지원'}
        </p>
      </header>

      {view.kind === 'pick-user' ? (
        <UserPicker onPick={pickUser} />
      ) : view.kind === 'profile' && user ? (
        <Profile
          userName={user}
          lang={lang}
          onLangChange={changeLang}
          onStart={startSession}
          onStartWeak={startWeakPractice}
          onStartSprint={startSprint}
          onStartFalling={startFalling}
          onSwitchUser={switchUser}
        />
      ) : view.kind === 'sprint' ? (
        <>
          <div className="back-row">
            <button className="back-btn" onClick={goToProfile}>
              ← 프로필
            </button>
          </div>
          <SprintScreen
            key={view.sessionKey}
            lang={view.lang}
            lines={sprintLines}
            userName={user ?? ''}
            bestSprint={sprintBest}
            onComplete={onSprintComplete}
            onExit={goToProfile}
          />
        </>
      ) : view.kind === 'falling' ? (
        <>
          <div className="back-row">
            <button className="back-btn" onClick={goToProfile}>
              ← 프로필
            </button>
          </div>
          <FallingGame
            key={view.sessionKey}
            lang={view.lang}
            pool={fallingPool}
            userName={user ?? ''}
            bestScore={fallingBest}
            onComplete={onFallingComplete}
            onExit={goToProfile}
          />
        </>
      ) : view.kind === 'session' &&
        sessionSource &&
        ((sessionCustomLines && sessionCustomLines.length > 0) ||
          isValidSource(sessionSource)) ? (
        <>
          <div className="back-row">
            <button className="back-btn" onClick={goToProfile}>
              ← 프로필
            </button>
          </div>
          {sessionLang === 'en' ? (
            <TypingScreenEn
              key={view.sessionKey}
              title={sourceLabel(sessionSource)}
              lines={shuffledLines}
              bestCpm={sessionBestCpm}
              todayBestCpm={sessionTodayBestCpm}
              weakKeys={sessionWeakKeys}
              onLineComplete={onLineComplete}
              onExit={goToProfile}
            />
          ) : (
            <TypingScreen
              key={view.sessionKey}
              title={sourceLabel(sessionSource)}
              lines={shuffledLines}
              bestCpm={sessionBestCpm}
              todayBestCpm={sessionTodayBestCpm}
              weakKeys={sessionWeakKeys}
              onLineComplete={onLineComplete}
              onExit={goToProfile}
            />
          )}
        </>
      ) : null}
    </main>
  )
}

export default App
