import { KEYBOARD_ROWS, findKeyByChar, type KeyDef } from './layout'
import { DUBEOLSIK } from '../../hangul/dubeolsik'
import type { Lang } from '../../lessons/sources'
import './Keyboard.css'

interface Props {
  nextKeyChar: string | null
  lang?: Lang
}

const jamoForKey = (def: KeyDef, shift: boolean) =>
  DUBEOLSIK[shift ? def.shift : def.base] ?? null

const isLetterCode = (code: string) => code.startsWith('Key')

const Key = ({
  def,
  isNext,
  needsShift,
  showJamo,
}: {
  def: KeyDef
  isNext: boolean
  needsShift: boolean
  showJamo: boolean
}) => {
  const isSpace = def.code === 'Space'
  if (isSpace) {
    return (
      <div className={`key space${isNext ? ' next' : ''}`} data-finger={def.finger}>
        <span className="ascii">Space</span>
      </div>
    )
  }
  if (!isLetterCode(def.code)) {
    return (
      <div className={`key punct${isNext ? ' next' : ''}`} data-finger={def.finger}>
        <span className="jamo">{def.base}</span>
        {def.shift !== def.base ? (
          <span className="jamo-shift">{def.shift}</span>
        ) : null}
      </div>
    )
  }
  const baseJamo = showJamo ? jamoForKey(def, false) : null
  const shiftJamo = showJamo ? jamoForKey(def, true) : null
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

export const Keyboard = ({ nextKeyChar, lang = 'ko' }: Props) => {
  const nextKeyDef = nextKeyChar ? findKeyByChar(nextKeyChar) : null
  const needsShift = nextKeyChar ? nextKeyChar >= 'A' && nextKeyChar <= 'Z' : false
  const showJamo = lang === 'ko'

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
              showJamo={showJamo}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
