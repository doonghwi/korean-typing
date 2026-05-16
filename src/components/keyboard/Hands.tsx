import { FINGER_ORDER, FINGER_LABEL, findKeyByChar, type Finger } from './layout'
import './Hands.css'

interface Props {
  nextKeyChar: string | null
}

const HAND_SIDE: Record<Finger, 'left' | 'right' | 'middle'> = {
  LP: 'left', LR: 'left', LM: 'left', LI: 'left',
  RI: 'right', RM: 'right', RR: 'right', RP: 'right',
  thumb: 'middle',
}

export const Hands = ({ nextKeyChar }: Props) => {
  const nextKey = nextKeyChar ? findKeyByChar(nextKeyChar) : null
  const activeFinger: Finger | null = nextKey?.finger ?? null
  const label = activeFinger ? FINGER_LABEL[activeFinger] : '대기'

  return (
    <div className="hands">
      <div className="hand left">
        {FINGER_ORDER.slice(0, 4).map((f) => (
          <div
            key={f}
            className={`finger${activeFinger === f ? ' active' : ''}`}
            title={FINGER_LABEL[f]}
          />
        ))}
      </div>
      <div className="finger-label">{label}</div>
      <div className="hand right">
        {FINGER_ORDER.slice(4).map((f) => (
          <div
            key={f}
            className={`finger${activeFinger === f ? ' active' : ''}`}
            title={FINGER_LABEL[f]}
          />
        ))}
      </div>
    </div>
  )
}

// silence unused warning for HAND_SIDE export if ever extracted
void HAND_SIDE
