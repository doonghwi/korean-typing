import { useCallback, useMemo, useState } from 'react'
import { TypingScreen } from './components/TypingScreen'
import { LessonList } from './components/LessonList'
import { UserPicker } from './components/UserPicker'
import { findStage, nextStageId, stageLines } from './lessons/data'
import {
  clearCurrentUser,
  getCurrentUser,
  recordStageResult,
} from './storage/progress'
import { shuffle } from './utils/shuffle'
import './App.css'

type View =
  | { kind: 'pick-user' }
  | { kind: 'list' }
  | { kind: 'stage'; id: number; sessionKey: number }

function App() {
  const [user, setUser] = useState<string | null>(() => getCurrentUser())
  const [view, setView] = useState<View>(() =>
    getCurrentUser() ? { kind: 'list' } : { kind: 'pick-user' }
  )

  const pickUser = useCallback((name: string) => {
    setUser(name)
    setView({ kind: 'list' })
  }, [])

  const switchUser = useCallback(() => {
    clearCurrentUser()
    setUser(null)
    setView({ kind: 'pick-user' })
  }, [])

  const openStage = useCallback((stageId: number) => {
    setView({ kind: 'stage', id: stageId, sessionKey: Date.now() })
  }, [])

  const goNextStage = useCallback(() => {
    if (view.kind !== 'stage') return
    const nxt = nextStageId(view.id)
    if (nxt !== null) {
      setView({ kind: 'stage', id: nxt, sessionKey: Date.now() })
    } else {
      setView({ kind: 'list' })
    }
  }, [view])

  const onComplete = useCallback(
    (r: { cpm: number; accuracy: number; seconds: number }) => {
      if (user && view.kind === 'stage') {
        recordStageResult(user, view.id, r.cpm, r.accuracy)
      }
    },
    [user, view]
  )

  const stage = view.kind === 'stage' ? findStage(view.id) : null
  const shuffledLines = useMemo(() => {
    if (view.kind !== 'stage' || !stage) return []
    return shuffle(stageLines(stage))
  }, [view.kind === 'stage' ? view.sessionKey : null, stage])

  return (
    <main className="app">
      <header className="hero">
        <h1>한글 타자 연습</h1>
        <p className="tagline">두벌식 · 손가락 가이드 · iPad 지원</p>
      </header>

      {view.kind === 'pick-user' ? (
        <UserPicker onPick={pickUser} />
      ) : view.kind === 'list' && user ? (
        <LessonList userName={user} onPick={openStage} onSwitchUser={switchUser} />
      ) : view.kind === 'stage' && stage ? (
        <>
          <div className="back-row">
            <button className="back-btn" onClick={() => setView({ kind: 'list' })}>
              ← 단계 목록
            </button>
          </div>
          <TypingScreen
            key={view.sessionKey}
            title={stage.title}
            lines={shuffledLines}
            onComplete={onComplete}
            onNext={nextStageId(stage.id) !== null ? goNextStage : undefined}
          />
        </>
      ) : null}
    </main>
  )
}

export default App
