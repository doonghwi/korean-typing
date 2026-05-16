import { describe, it, expect } from 'vitest'
import { typeString, processKey, initialState, renderState } from './index'

const result = (keys: string): string => renderState(typeString(keys))

describe('composer: basic syllables', () => {
  it('composes 가 from r+k', () => {
    expect(result('rk')).toBe('가')
  })

  it('composes 안 from d+k+s', () => {
    expect(result('dks')).toBe('안')
  })

  it('composes 안녕 from dks+sud', () => {
    expect(result('dkssud')).toBe('안녕')
  })

  it('composes 학교 from gkr+ry', () => {
    expect(result('gkrry')).toBe('학교')
  })
})

describe('composer: composite vowels', () => {
  it('composes 과 from r+h+k', () => {
    expect(result('rhk')).toBe('과')
  })

  it('composes 의 from d+m+l', () => {
    expect(result('dml')).toBe('의')
  })

  it('composes 위 from d+n+l', () => {
    expect(result('dnl')).toBe('위')
  })

  it('composes 광 from r+h+k+d', () => {
    expect(result('rhkd')).toBe('광')
  })
})

describe('composer: composite jongseong', () => {
  it('composes 닭 from e+k+f+r', () => {
    expect(result('ekfr')).toBe('닭')
  })

  it('composes 값 from r+k+q+t', () => {
    expect(result('rkqt')).toBe('값')
  })

  it('composes 앉 from d+k+s+w', () => {
    expect(result('dksw')).toBe('앉')
  })
})

describe('composer: jongseong split on vowel input', () => {
  it('splits single jongseong: 가나 from r+k+s+k', () => {
    expect(result('rksk')).toBe('가나')
  })

  it('splits composite jongseong: 달가 from e+k+f+r+k', () => {
    expect(result('ekfrk')).toBe('달가')
  })

  it('decomposes 닭 + vowel correctly', () => {
    expect(result('ekfrl')).toBe('달기')
  })
})

describe('composer: shift keys (double consonants)', () => {
  it('composes 까 from R+k', () => {
    expect(result('Rk')).toBe('까')
  })

  it('composes 있 from d+l+T', () => {
    expect(result('dlT')).toBe('있')
  })
})

describe('composer: backspace', () => {
  it('removes last jamo (T) from a completed syllable', () => {
    const s1 = typeString('rkr')
    expect(renderState(s1)).toBe('각')
    const s2 = processKey(s1, 'Backspace')
    expect(renderState(s2)).toBe('가')
  })

  it('splits composite T on backspace', () => {
    const s1 = typeString('ekfr')
    expect(renderState(s1)).toBe('닭')
    const s2 = processKey(s1, 'Backspace')
    expect(renderState(s2)).toBe('달')
  })

  it('splits composite V on backspace', () => {
    const s1 = typeString('rhk')
    expect(renderState(s1)).toBe('과')
    const s2 = processKey(s1, 'Backspace')
    expect(renderState(s2)).toBe('고')
  })

  it('removes V leaving L', () => {
    const s1 = typeString('rk')
    const s2 = processKey(s1, 'Backspace')
    expect(renderState(s2)).toBe('ㄱ')
  })

  it('removes L from empty working', () => {
    const s1 = processKey(initialState(), 'r')
    expect(renderState(s1)).toBe('ㄱ')
    const s2 = processKey(s1, 'Backspace')
    expect(renderState(s2)).toBe('')
  })

  it('removes last committed char when working empty', () => {
    const s1 = typeString('rks')
    expect(renderState(s1)).toBe('간')
    const after_t = processKey(s1, 'Backspace')
    expect(renderState(after_t)).toBe('가')
  })

  it('decomposes committed syllable on backspace when working empty', async () => {
    const { initialState, inputJamo, inputLiteral, backspace, renderState } = await import('./composer')
    let s = initialState()
    s = inputJamo(s, 'ㄱ')
    s = inputJamo(s, 'ㅏ')
    s = inputLiteral(s, ' ')
    expect(renderState(s)).toBe('가 ')
    s = backspace(s)
    expect(renderState(s)).toBe('가')
    s = backspace(s)
    expect(renderState(s)).toBe('ㄱ')
    s = backspace(s)
    expect(renderState(s)).toBe('')
  })

  it('decomposes syllable with batchim one jamo at a time', async () => {
    const { initialState, inputJamo, inputLiteral, backspace, renderState } = await import('./composer')
    let s = initialState()
    s = inputJamo(s, 'ㅇ')
    s = inputJamo(s, 'ㅏ')
    s = inputJamo(s, 'ㄴ')
    s = inputLiteral(s, ' ')
    expect(renderState(s)).toBe('안 ')
    s = backspace(s)
    expect(renderState(s)).toBe('안')
    s = backspace(s)
    expect(renderState(s)).toBe('아')
    s = backspace(s)
    expect(renderState(s)).toBe('ㅇ')
    s = backspace(s)
    expect(renderState(s)).toBe('')
  })

  it('decomposes composite vowel/jongseong one jamo at a time', async () => {
    const { initialState, inputJamo, inputLiteral, backspace, renderState } = await import('./composer')
    let s = initialState()
    s = inputJamo(s, 'ㄷ')
    s = inputJamo(s, 'ㅏ')
    s = inputJamo(s, 'ㄹ')
    s = inputJamo(s, 'ㄱ')
    s = inputLiteral(s, ' ')
    expect(renderState(s)).toBe('닭 ')
    s = backspace(s)
    expect(renderState(s)).toBe('닭')
    s = backspace(s)
    expect(renderState(s)).toBe('달')
    s = backspace(s)
    expect(renderState(s)).toBe('다')
    s = backspace(s)
    expect(renderState(s)).toBe('ㄷ')
  })
})

describe('composer: literal (space) commits working syllable', () => {
  it('commits 가 + space when space pressed mid-word', async () => {
    const { initialState, inputJamo, inputLiteral, renderState } = await import('./composer')
    let s = initialState()
    s = inputJamo(s, 'ㄱ')
    s = inputJamo(s, 'ㅏ')
    s = inputLiteral(s, ' ')
    expect(renderState(s)).toBe('가 ')
    expect(s.working).toEqual({})
  })

  it('commits composite syllable on space', async () => {
    const { initialState, inputJamo, inputLiteral, renderState } = await import('./composer')
    let s = initialState()
    s = inputJamo(s, 'ㄷ')
    s = inputJamo(s, 'ㅏ')
    s = inputJamo(s, 'ㄹ')
    s = inputJamo(s, 'ㄱ')
    s = inputLiteral(s, ' ')
    expect(renderState(s)).toBe('닭 ')
  })
})

describe('composer: ignores unmapped keys', () => {
  it('ignores numbers and symbols', () => {
    expect(result('rk1')).toBe('가')
    expect(result('rk!')).toBe('가')
  })
})

describe('composer: non-jongseong consonants force new syllable', () => {
  it('ㄸ after L+V cannot be batchim', () => {
    expect(result('rkE')).toBe('가ㄸ')
  })
})
