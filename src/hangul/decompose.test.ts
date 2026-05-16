import { describe, it, expect } from 'vitest'
import { decomposeText, decomposeSyllable } from './decompose'

describe('decomposeSyllable', () => {
  it('splits syllable without batchim', () => {
    expect(decomposeSyllable('가')).toEqual(['ㄱ', 'ㅏ'])
    expect(decomposeSyllable('나')).toEqual(['ㄴ', 'ㅏ'])
  })

  it('splits syllable with single batchim', () => {
    expect(decomposeSyllable('각')).toEqual(['ㄱ', 'ㅏ', 'ㄱ'])
    expect(decomposeSyllable('한')).toEqual(['ㅎ', 'ㅏ', 'ㄴ'])
  })

  it('splits composite vowels', () => {
    expect(decomposeSyllable('과')).toEqual(['ㄱ', 'ㅗ', 'ㅏ'])
    expect(decomposeSyllable('의')).toEqual(['ㅇ', 'ㅡ', 'ㅣ'])
    expect(decomposeSyllable('위')).toEqual(['ㅇ', 'ㅜ', 'ㅣ'])
  })

  it('splits composite jongseong', () => {
    expect(decomposeSyllable('닭')).toEqual(['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ'])
    expect(decomposeSyllable('값')).toEqual(['ㄱ', 'ㅏ', 'ㅂ', 'ㅅ'])
    expect(decomposeSyllable('앉')).toEqual(['ㅇ', 'ㅏ', 'ㄴ', 'ㅈ'])
  })

  it('splits both composite vowel and composite jongseong', () => {
    expect(decomposeSyllable('곿')).toEqual(['ㄱ', 'ㅗ', 'ㅏ', 'ㄱ', 'ㅅ'])
  })

  it('passes through non-hangul characters', () => {
    expect(decomposeSyllable('a')).toEqual(['a'])
    expect(decomposeSyllable(' ')).toEqual([' '])
  })
})

describe('decomposeText', () => {
  it('decomposes a word', () => {
    expect(decomposeText('안녕')).toEqual(['ㅇ', 'ㅏ', 'ㄴ', 'ㄴ', 'ㅕ', 'ㅇ'])
  })

  it('decomposes a sentence with spaces', () => {
    expect(decomposeText('나 가')).toEqual(['ㄴ', 'ㅏ', ' ', 'ㄱ', 'ㅏ'])
  })

  it('handles mixed content', () => {
    expect(decomposeText('한2')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', '2'])
  })

  it('splits standalone composite vowels', () => {
    expect(decomposeText('ㅚ')).toEqual(['ㅗ', 'ㅣ'])
    expect(decomposeText('ㅞ')).toEqual(['ㅜ', 'ㅔ'])
    expect(decomposeText('ㅘ')).toEqual(['ㅗ', 'ㅏ'])
    expect(decomposeText('ㅢ')).toEqual(['ㅡ', 'ㅣ'])
  })

  it('splits standalone composite jongseong', () => {
    expect(decomposeText('ㄳ')).toEqual(['ㄱ', 'ㅅ'])
    expect(decomposeText('ㅄ')).toEqual(['ㅂ', 'ㅅ'])
  })

  it('leaves simple jamo as-is', () => {
    expect(decomposeText('ㅏ')).toEqual(['ㅏ'])
    expect(decomposeText('ㄱ')).toEqual(['ㄱ'])
  })
})
