export const DUBEOLSIK: Record<string, string> = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ',

  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ',

  y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',

  O: 'ㅒ', P: 'ㅖ',
}

const JAMO_TO_KEY: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [key, jamo] of Object.entries(DUBEOLSIK)) {
    if (!(jamo in map)) map[jamo] = key
  }
  return map
})()

export const keyToJamo = (key: string): string | null => DUBEOLSIK[key] ?? null

export const jamoToKey = (jamo: string): string | null => JAMO_TO_KEY[jamo] ?? null

export const requiresShift = (key: string): boolean => key >= 'A' && key <= 'Z'

export const codeToKeyChar = (code: string, shift: boolean): string | null => {
  if (code.startsWith('Key') && code.length === 4) {
    const letter = code.slice(3)
    return shift ? letter : letter.toLowerCase()
  }
  return null
}
