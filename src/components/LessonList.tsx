import { STAGES } from '../lessons/data'
import { getProgress } from '../storage/progress'
import './LessonList.css'

interface Props {
  userName: string
  onPick: (stageId: number) => void
  onSwitchUser: () => void
}

export const LessonList = ({ userName, onPick, onSwitchUser }: Props) => {
  const progress = getProgress(userName)
  return (
    <div className="lesson-list">
      <div className="header">
        <div className="user-row">
          <span className="who">{userName}</span>
          <button className="switch" onClick={onSwitchUser}>
            다른 사용자
          </button>
        </div>
      </div>

      <ul className="stages">
        {STAGES.map((stage) => {
          const r = progress.stageResults[stage.id]
          const totalLines = stage.lessons.reduce((s, l) => s + l.lines.length, 0)
          return (
            <li key={stage.id}>
              <button className="stage-btn" onClick={() => onPick(stage.id)}>
                <div className="stage-left">
                  <div className="stage-title">{stage.title}</div>
                  <div className="stage-desc">{stage.description}</div>
                  <div className="stage-meta">{totalLines}개 항목 · 랜덤 순서</div>
                </div>
                <div className="stage-right">
                  {r ? (
                    <>
                      <div className="cpm">{Math.round(r.bestCpm)} CPM</div>
                      <div className="acc">{Math.round(r.bestAccuracy * 100)}%</div>
                      <div className="attempts">{r.attempts}회</div>
                    </>
                  ) : (
                    <div className="new">시작 →</div>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
