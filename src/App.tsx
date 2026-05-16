import { useCallback, useMemo, useState } from 'react'
import { TypingScreen } from './components/TypingScreen'
import { UserPicker } from './components/UserPicker'
import { Profile } from './components/Profile'
import {
  isValidSource,
  linesForSource,
  sourceLabel,
} from './lessons/sources'
import {
  clearCurrentUser,
  getCurrentUser,
  recordLine,
} from './storage/progress'
import { shuffle } from './utils/shuffle'
import './App.css'

type View =
  | { kind: 'pick-user' }
  | { kind: 'profile' }
  | { kind: 'session'; source: string; sessionKey: number }

function App() {
  const [user, setUser] = useState<string | null>(() => getCurrentUser())
  const [view, setView] = useState<View>(() =>
    getCurrentUser() ? { kind: 'profile' } : { kind: 'pick-user' }
  )

  const pickUser = useCallback((name: string) => {
    setUser(name)
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
  const shuffledLines = useMemo(() => {
    if (!sessionSource) return []
    return shuffle(linesForSource(sessionSource))
  }, [sessionKey, sessionSource])

  return (
    <main className="app">
      <header className="hero">
        <h1>한글 타자 연습</h1>
        <p className="tagline">두벌식 · 손가락 가이드 · iPad 지원</p>
      </header>

      {view.kind === 'pick-user' ? (
        <UserPicker onPick={pickUser} />
      ) : view.kind === 'profile' && user ? (
        <Profile userName={user} onStart={startSession} onSwitchUser={switchUser} />
      ) : view.kind === 'session' && sessionSource && isValidSource(sessionSource) ? (
        <>
          <div className="back-row">
            <button className="back-btn" onClick={goToProfile}>
              ← 프로필
            </button>
          </div>
          <TypingScreen
            key={view.sessionKey}
            title={sourceLabel(sessionSource)}
            lines={shuffledLines}
            onLineComplete={onLineComplete}
            onExit={goToProfile}
          />
        </>
      ) : null}
    </main>
  )
}

export default App
