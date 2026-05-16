import { KEYBOARD_ROWS, findKeyByChar, type KeyDef } from './layout'
import { DUBEOLSIK } from '../../hangul/dubeolsik'
import './Keyboard.css'

interface Props {
  nextKeyChar: string | null
}

const jamoForKey = (def: KeyDef, shift: boolean) =>
  DUBEOLSIK[shift ? def.shift : def.base] ?? null

const Key = ({ def, isNext, needsShift }: { def: KeyDef; isNext: boolean; needsShift: boolean }) => {
  const isSpace = def.code === 'Space'
  if (isSpace) {
    return (
      <div className={`key space${isNext ? ' next' : ''}`} data-finger={def.finger}>
        <span className="ascii">Space</span>
      </div>
    )
  }
  const baseJamo = jamoForKey(def, false)
  const shiftJamo = jamoForKey(def, true)
  return (
    <div className={`key${isNext ? ' next' : ''}`} data-finger={def.finger}>
      <span className="ascii">{def.base.toUpperCase()}</span>
      {shiftJamo && shiftJamo !== baseJamo ? (
        <span className="jamo-shift">{shiftJamo}</span>
      ) : null}
      {baseJamo ? <span className="jamo">{baseJamo}</span> : null}
      {isNext && needsShift ? <span className="shift-badge">⇧</span> : null}
    </div>
  )
}

export const Keyboard = ({ nextKeyChar }: Props) => {
  const nextKeyDef = nextKeyChar ? findKeyByChar(nextKeyChar) : null
  const needsShift = nextKeyChar ? nextKeyChar >= 'A' && nextKeyChar <= 'Z' : false

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="kb-row" data-row={ri}>
          {row.map((k) => (
            <Key
              key={k.code}
              def={k}
              isNext={nextKeyDef?.code === k.code}
              needsShift={needsShift}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
