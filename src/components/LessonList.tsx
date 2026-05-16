import { STAGES } from '../lessons/data'
import { getProgress } from '../storage/progress'
import './LessonList.css'

interface Props {
  userName: string
  onPick: (lessonId: string) => void
  onSwitchUser: () => void
}

export const LessonList = ({ userName, onPick, onSwitchUser }: Props) => {
  const progress = getProgress(userName)
  return (
    <div className="lesson-list">
      <div className="header">
        <div className="user-row">
          <span className="who">{userName}</span>
          <button className="switch" onClick={onSwitchUser}>다른 사용자</button>
        </div>
      </div>
      {STAGES.map((stage) => (
        <section key={stage.id} className="stage">
          <h2 className="stage-title">{stage.title}</h2>
          <p className="stage-desc">{stage.description}</p>
          <ul className="lessons">
            {stage.lessons.map((l) => {
              const r = progress.results[l.id]
              return (
                <li key={l.id}>
                  <button className="lesson-btn" onClick={() => onPick(l.id)}>
                    <div className="left">
                      <div className="lid">{l.id}</div>
                      <div className="ltitle">{l.title}</div>
                    </div>
                    <div className="right">
                      {r ? (
                        <>
                          <span className="cpm">{Math.round(r.bestCpm)} CPM</span>
                          <span className="acc">{Math.round(r.bestAccuracy * 100)}%</span>
                        </>
                      ) : (
                        <span className="new">시작</span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
