import type { Finger } from './layout'
import './HandOverlay.css'

interface Props {
  activeFinger: Finger | null
}

interface FingerSpec {
  id: Finger
  x: number
  y: number
  h: number
}

const FINGERS: FingerSpec[] = [
  { id: 'LP', x: 6.5, y: 28, h: 17 },
  { id: 'LR', x: 16.5, y: 22, h: 23 },
  { id: 'LM', x: 26.5, y: 18, h: 27 },
  { id: 'LI', x: 36.5, y: 22, h: 23 },
  { id: 'RI', x: 60.5, y: 22, h: 23 },
  { id: 'RM', x: 70.5, y: 18, h: 27 },
  { id: 'RR', x: 80.5, y: 22, h: 23 },
  { id: 'RP', x: 90.5, y: 28, h: 17 },
]

const FINGER_W = 4.5

export const HandOverlay = ({ activeFinger }: Props) => {
  return (
    <svg
      className="hand-overlay"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden
    >
      <ellipse className="palm" cx="22" cy="55" rx="22" ry="9" />
      <ellipse className="palm" cx="78" cy="55" rx="22" ry="9" />

      {FINGERS.map((f) => (
        <rect
          key={f.id}
          className={`finger${activeFinger === f.id ? ' active' : ''}`}
          x={f.x - FINGER_W / 2}
          y={f.y}
          width={FINGER_W}
          height={f.h}
          rx={FINGER_W / 2}
        />
      ))}

      <ellipse
        className={`thumb${activeFinger === 'thumb' ? ' active' : ''}`}
        cx="50"
        cy="52"
        rx="6"
        ry="3"
      />
    </svg>
  )
}
