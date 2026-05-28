import { useCallback, useMemo, useState } from 'react'
import { TypingScreen } from './components/TypingScreen'
import { TypingScreenEn } from './components/TypingScreenEn'
import { UserPicker } from './components/UserPicker'
import { Profile } from './components/Profile'
import {
  isValidSource,
  langOfSource,
  linesForSource,
  sourceLabel,
  type Lang,
} from './lessons/sources'
import {
  clearCurrentUser,
  getAllTimeBest,
  getCurrentUser,
  getUserLang,
  recordLine,
  setUserLang,
} from './storage/progress'
import { shuffle } from './utils/shuffle'
import './App.css'

type View =
  | { kind: 'pick-user' }
  | { kind: 'profile' }
  | { kind: 'session'; source: string; sessionKey: number }

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

  const changeLang = useCallback(
    (next: Lang) => {
      if (user) setUserLang(user, next)
      setLangState(next)
    },
    [user]
  )

  const onLineComplete = useCallback(
    (r: { cpm: number; accuracy: number; seconds: number; text: string }) => {
      if (user && view.kind === 'session') {
        recordLine(user, view.source, r.cpm, r.accuracy, r.text)
      }
    },
    [user, view]
  )

  const sessionSource = view.kind === 'session' ? view.source : null
  const sessionKey = view.kind === 'session' ? view.sessionKey : null
  const sessionLang: Lang = sessionSource ? langOfSource(sessionSource) : 'ko'
  const shuffledLines = useMemo(() => {
    if (!sessionSource) return []
    return shuffle(linesForSource(sessionSource))
  }, [sessionKey, sessionSource])

  // Personal-best baseline frozen at session start, so beating it mid-session
  // doesn't immediately stop the "new record" celebration.
  const sessionBestCpm = useMemo(() => {
    if (!user || !sessionSource) return 0
    return getAllTimeBest(user, sessionLang)?.cpm ?? 0
  }, [sessionKey, user, sessionSource, sessionLang])

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
          onSwitchUser={switchUser}
        />
      ) : view.kind === 'session' && sessionSource && isValidSource(sessionSource) ? (
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
              onLineComplete={onLineComplete}
              onExit={goToProfile}
            />
          ) : (
            <TypingScreen
              key={view.sessionKey}
              title={sourceLabel(sessionSource)}
              lines={shuffledLines}
              bestCpm={sessionBestCpm}
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
