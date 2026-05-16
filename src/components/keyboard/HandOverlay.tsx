import { KEYBOARD_ROWS, findKeyByChar, type Finger } from './layout'
import './HandOverlay.css'

interface Props {
  activeFinger: Finger | null
  nextKeyChar: string | null
}

const ROW_Y = [7, 23, 39, 53]
const ROW_INDENT_PCT = [0, 3.57, 7.14]
const SLOT_W_PCT = ((3 + 0.4) / 33.6) * 100

const keyPosition = (keyChar: string): { x: number; y: number } | null => {
  for (let r = 0; r < KEYBOARD_ROWS.length; r++) {
    const row = KEYBOARD_ROWS[r]
    const idx = row.findIndex((k) => k.base === keyChar || k.shift === keyChar)
    if (idx < 0) continue
    if (r === 3) return { x: 50, y: ROW_Y[3] }
    return {
      x: ROW_INDENT_PCT[r] + (idx + 0.5) * SLOT_W_PCT,
      y: ROW_Y[r],
    }
  }
  return null
}

const FINGER_HOME: Record<Finger, { x: number; y: number }> = {
  LP: { x: 8.04, y: 23 },
  LR: { x: 18.16, y: 23 },
  LM: { x: 28.27, y: 23 },
  LI: { x: 38.39, y: 23 },
  RI: { x: 68.75, y: 23 },
  RM: { x: 78.87, y: 23 },
  RR: { x: 88.99, y: 23 },
  RP: { x: 95.0, y: 23 },
  thumb: { x: 50, y: 50 },
}

const SHIFT_FACTOR = 0.55

const fingerCls = (active: Finger | null, f: Finger) =>
  `finger${active === f ? ' active' : ''}`

export const HandOverlay = ({ activeFinger, nextKeyChar }: Props) => {
  const target = nextKeyChar ? keyPosition(nextKeyChar) : null
  const home = activeFinger ? FINGER_HOME[activeFinger] : null

  let dx = 0
  let dy = 0
  if (target && home && activeFinger !== 'thumb') {
    dx = (target.x - home.x) * SHIFT_FACTOR
    dy = (target.y - home.y) * SHIFT_FACTOR
  }

  const leftXform = activeFinger?.startsWith('L') ? `translate(${dx} ${dy})` : ''
  const rightXform = activeFinger?.startsWith('R') ? `translate(${dx} ${dy})` : ''
  const thumbActive = activeFinger === 'thumb'

  return (
    <svg
      className="hand-overlay"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g className="hand left" transform={leftXform}>
        <path
          className="palm"
          d="M 2,60 L 2,44 Q 2,38 7,37 L 43,37 Q 48,38 48,44 L 48,60 Z"
        />
        <ellipse
          className={`thumb${thumbActive ? ' active' : ''}`}
          cx="46"
          cy="48"
          rx="4.2"
          ry="8"
          transform="rotate(-28 46 48)"
        />
        <rect className={fingerCls(activeFinger, 'LP')} x="5.04" y="20" width="6" height="22" rx="3" />
        <rect className={fingerCls(activeFinger, 'LR')} x="15.16" y="14" width="6" height="28" rx="3" />
        <rect className={fingerCls(activeFinger, 'LM')} x="25.27" y="10" width="6" height="32" rx="3" />
        <rect className={fingerCls(activeFinger, 'LI')} x="35.39" y="14" width="6" height="28" rx="3" />
      </g>

      <g className="hand right" transform={rightXform}>
        <path
          className="palm"
          d="M 52,60 L 52,44 Q 52,38 57,37 L 93,37 Q 98,38 98,44 L 98,60 Z"
        />
        <ellipse
          className={`thumb${thumbActive ? ' active' : ''}`}
          cx="54"
          cy="48"
          rx="4.2"
          ry="8"
          transform="rotate(28 54 48)"
        />
        <rect className={fingerCls(activeFinger, 'RI')} x="65.75" y="14" width="6" height="28" rx="3" />
        <rect className={fingerCls(activeFinger, 'RM')} x="75.87" y="10" width="6" height="32" rx="3" />
        <rect className={fingerCls(activeFinger, 'RR')} x="85.99" y="14" width="6" height="28" rx="3" />
        <rect className={fingerCls(activeFinger, 'RP')} x="92" y="20" width="6" height="22" rx="3" />
      </g>
    </svg>
  )
}

void findKeyByChar
