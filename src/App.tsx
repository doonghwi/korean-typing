import { useCallback, useState } from 'react'
import { TypingScreen } from './components/TypingScreen'
import { LessonList } from './components/LessonList'
import { UserPicker } from './components/UserPicker'
import { findLesson, nextLessonId } from './lessons/data'
import {
  clearCurrentUser,
  getCurrentUser,
  recordResult,
} from './storage/progress'
import './App.css'

type View = { kind: 'pick-user' } | { kind: 'list' } | { kind: 'lesson'; id: string }

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

  const openLesson = useCallback((id: string) => {
    setView({ kind: 'lesson', id })
  }, [])

  const goNext = useCallback(() => {
    if (view.kind !== 'lesson') return
    const nxt = nextLessonId(view.id)
    setView(nxt ? { kind: 'lesson', id: nxt } : { kind: 'list' })
  }, [view])

  const onComplete = useCallback(
    (r: { cpm: number; accuracy: number; seconds: number }) => {
      if (user && view.kind === 'lesson') {
        recordResult(user, view.id, r.cpm, r.accuracy)
      }
    },
    [user, view]
  )

  return (
    <main className="app">
      <header className="hero">
        <h1>한글 타자 연습</h1>
        <p className="tagline">두벌식 · 손가락 가이드 · iPad 지원</p>
      </header>

      {view.kind === 'pick-user' ? (
        <UserPicker onPick={pickUser} />
      ) : view.kind === 'list' && user ? (
        <LessonList userName={user} onPick={openLesson} onSwitchUser={switchUser} />
      ) : view.kind === 'lesson' ? (
        (() => {
          const lesson = findLesson(view.id)
          if (!lesson) {
            setView({ kind: 'list' })
            return null
          }
          return (
            <>
              <div className="back-row">
                <button className="back-btn" onClick={() => setView({ kind: 'list' })}>
                  ← 레슨 목록
                </button>
              </div>
              <TypingScreen
                key={lesson.id}
                title={`${lesson.id} · ${lesson.title}`}
                lines={lesson.lines}
                onComplete={onComplete}
                onNext={nextLessonId(lesson.id) ? goNext : undefined}
              />
            </>
          )
        })()
      ) : null}
    </main>
  )
}

export default App
