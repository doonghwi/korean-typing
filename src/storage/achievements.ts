import { langOfSource } from '../lessons/sources'
import {
  getBestFalling,
  getBestSprint,
  getProgress,
  getStreak,
  type LineRecord,
} from './progress'

export interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  earned: boolean
}

// Achievements are derived from already-stored data (no extra storage) and are
// global across both languages.
export const getAchievements = (name: string): Achievement[] => {
  const records = getProgress(name).records
  const totalLines = records.length
  const perfectLines = records.filter((r) => r.accuracy >= 1).length
  const bestCpm = records.reduce((m, r) => Math.max(m, r.cpm), 0)
  const bestStreak = getStreak(name).best
  const bestSprint = Math.max(
    getBestSprint(name, 'ko')?.correct ?? 0,
    getBestSprint(name, 'en')?.correct ?? 0
  )
  const bestFalling = Math.max(getBestFalling(name, 'ko'), getBestFalling(name, 'en'))
  const langOf = (r: LineRecord) => r.lang ?? langOfSource(r.source)
  const hasKo = records.some((r) => langOf(r) === 'ko')
  const hasEn = records.some((r) => langOf(r) === 'en')

  const defs: Array<Omit<Achievement, 'earned'> & { ok: boolean }> = [
    { id: 'first', emoji: '🌱', title: '첫 발걸음', desc: '첫 줄 완성하기', ok: totalLines >= 1 },
    { id: 'streak3', emoji: '📅', title: '3일 연속', desc: '3일 연속 연습', ok: bestStreak >= 3 },
    { id: 'streak7', emoji: '🔥', title: '일주일 개근', desc: '7일 연속 연습', ok: bestStreak >= 7 },
    { id: 'streak30', emoji: '🏆', title: '한 달 개근', desc: '30일 연속 연습', ok: bestStreak >= 30 },
    { id: 'perfect10', emoji: '🎯', title: '정확왕', desc: '정확도 100% 줄 10개', ok: perfectLines >= 10 },
    { id: 'perfect50', emoji: '💎', title: '완벽주의', desc: '정확도 100% 줄 50개', ok: perfectLines >= 50 },
    { id: 'lines100', emoji: '📚', title: '백 줄', desc: '누적 100줄 연습', ok: totalLines >= 100 },
    { id: 'lines500', emoji: '📖', title: '다독가', desc: '누적 500줄 연습', ok: totalLines >= 500 },
    { id: 'speed300', emoji: '⚡', title: '빠른 손', desc: '최고 300타/분 돌파', ok: bestCpm >= 300 },
    { id: 'speed500', emoji: '🚀', title: '번개 손', desc: '최고 500타/분 돌파', ok: bestCpm >= 500 },
    { id: 'sprint150', emoji: '⏱️', title: '스프린터', desc: '스프린트 150타 달성', ok: bestSprint >= 150 },
    { id: 'falling40', emoji: '🌧️', title: '비 피하기', desc: '낙하 게임 40개', ok: bestFalling >= 40 },
    { id: 'bilingual', emoji: '🌏', title: '이중언어', desc: '한국어·영어 모두 기록', ok: hasKo && hasEn },
  ]

  return defs.map(({ ok, ...rest }) => ({ ...rest, earned: ok }))
}
