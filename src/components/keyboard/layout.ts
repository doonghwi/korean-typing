export type Finger =
  | 'LP' | 'LR' | 'LM' | 'LI'
  | 'RI' | 'RM' | 'RR' | 'RP'
  | 'thumb'

export interface KeyDef {
  code: string
  base: string
  shift: string
  finger: Finger
}

export const FINGER_LABEL: Record<Finger, string> = {
  LP: '왼손 소지',
  LR: '왼손 약지',
  LM: '왼손 중지',
  LI: '왼손 검지',
  RI: '오른손 검지',
  RM: '오른손 중지',
  RR: '오른손 약지',
  RP: '오른손 소지',
  thumb: '엄지',
}

export const FINGER_ORDER: Finger[] = ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP']

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 0: numbers
  [
    { code: 'Digit1', base: '1', shift: '!', finger: 'LP' },
    { code: 'Digit2', base: '2', shift: '@', finger: 'LR' },
    { code: 'Digit3', base: '3', shift: '#', finger: 'LM' },
    { code: 'Digit4', base: '4', shift: '$', finger: 'LI' },
    { code: 'Digit5', base: '5', shift: '%', finger: 'LI' },
    { code: 'Digit6', base: '6', shift: '^', finger: 'RI' },
    { code: 'Digit7', base: '7', shift: '&', finger: 'RI' },
    { code: 'Digit8', base: '8', shift: '*', finger: 'RM' },
    { code: 'Digit9', base: '9', shift: '(', finger: 'RR' },
    { code: 'Digit0', base: '0', shift: ')', finger: 'RP' },
  ],
  // Row 1: top row
  [
    { code: 'KeyQ', base: 'q', shift: 'Q', finger: 'LP' },
    { code: 'KeyW', base: 'w', shift: 'W', finger: 'LR' },
    { code: 'KeyE', base: 'e', shift: 'E', finger: 'LM' },
    { code: 'KeyR', base: 'r', shift: 'R', finger: 'LI' },
    { code: 'KeyT', base: 't', shift: 'T', finger: 'LI' },
    { code: 'KeyY', base: 'y', shift: 'Y', finger: 'RI' },
    { code: 'KeyU', base: 'u', shift: 'U', finger: 'RI' },
    { code: 'KeyI', base: 'i', shift: 'I', finger: 'RM' },
    { code: 'KeyO', base: 'o', shift: 'O', finger: 'RR' },
    { code: 'KeyP', base: 'p', shift: 'P', finger: 'RP' },
  ],
  // Row 2: home row
  [
    { code: 'KeyA', base: 'a', shift: 'A', finger: 'LP' },
    { code: 'KeyS', base: 's', shift: 'S', finger: 'LR' },
    { code: 'KeyD', base: 'd', shift: 'D', finger: 'LM' },
    { code: 'KeyF', base: 'f', shift: 'F', finger: 'LI' },
    { code: 'KeyG', base: 'g', shift: 'G', finger: 'LI' },
    { code: 'KeyH', base: 'h', shift: 'H', finger: 'RI' },
    { code: 'KeyJ', base: 'j', shift: 'J', finger: 'RI' },
    { code: 'KeyK', base: 'k', shift: 'K', finger: 'RM' },
    { code: 'KeyL', base: 'l', shift: 'L', finger: 'RR' },
    { code: 'Semicolon', base: ';', shift: ':', finger: 'RP' },
    { code: 'Quote', base: "'", shift: '"', finger: 'RP' },
  ],
  // Row 3: bottom row
  [
    { code: 'KeyZ', base: 'z', shift: 'Z', finger: 'LP' },
    { code: 'KeyX', base: 'x', shift: 'X', finger: 'LR' },
    { code: 'KeyC', base: 'c', shift: 'C', finger: 'LM' },
    { code: 'KeyV', base: 'v', shift: 'V', finger: 'LI' },
    { code: 'KeyB', base: 'b', shift: 'B', finger: 'LI' },
    { code: 'KeyN', base: 'n', shift: 'N', finger: 'RI' },
    { code: 'KeyM', base: 'm', shift: 'M', finger: 'RI' },
    { code: 'Comma', base: ',', shift: '<', finger: 'RM' },
    { code: 'Period', base: '.', shift: '>', finger: 'RR' },
    { code: 'Slash', base: '/', shift: '?', finger: 'RP' },
  ],
  // Row 4: space
  [
    { code: 'Space', base: ' ', shift: ' ', finger: 'thumb' },
  ],
]

const ALL_KEYS: KeyDef[] = KEYBOARD_ROWS.flat()

export const findKeyByChar = (ch: string): KeyDef | null =>
  ALL_KEYS.find((k) => k.base === ch || k.shift === ch) ?? null
