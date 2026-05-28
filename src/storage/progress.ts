import { isRecordRankingEligible, langOfSource, type Lang } from '../lessons/sources'
import { pushRecord } from './cloudRanking'

export interface LineRecord {
  at: number
  source: string
  cpm: number
  accuracy: number
  text: string
  lang?: Lang
}

export interface UserProgress {
  records: LineRecord[]
}

export interface BestRecord {
  cpm: number
  accuracy: number
  at: number
  source: string
  text: string
  lang?: Lang
}

const USERS_KEY = 'taza:users'
const CURRENT_USER_KEY = 'taza:current-user'
const userKey = (name: string) => `taza:user:${name}:progress-v3`
const userLangKey = (name: string) => `taza:user:${name}:lang`

const MAX_RECORDS = 1000

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const writeJson = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export const listUsers = (): string[] => readJson<string[]>(USERS_KEY) ?? []

export const addUser = (name: string): void => {
  const users = listUsers()
  if (!users.includes(name)) writeJson(USERS_KEY, [...users, name])
}

export const getCurrentUser = (): string | null =>
  localStorage.getItem(CURRENT_USER_KEY)

export const setCurrentUser = (name: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, name)
}

export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export const getUserLang = (name: string): Lang => {
  const v = localStorage.getItem(userLangKey(name))
  return v === 'en' ? 'en' : 'ko'
}

export const setUserLang = (name: string, lang: Lang): void => {
  localStorage.setItem(userLangKey(name), lang)
}

export const getProgress = (name: string): UserProgress => {
  const raw = readJson<Partial<UserProgress>>(userKey(name))
  return {
    records: raw?.records ?? [],
  }
}

// Legacy records may not have `lang` — derive from source for filtering.
const recordLang = (r: LineRecord): Lang => r.lang ?? langOfSource(r.source)

export const recordLine = (
  name: string,
  source: string,
  cpm: number,
  accuracy: number,
  text: string
): void => {
  const progress = getProgress(name)
  const lang = langOfSource(source)
  progress.records.push({
    at: Date.now(),
    source,
    cpm,
    accuracy,
    text: text.slice(0, 80),
    lang,
  })
  if (progress.records.length > MAX_RECORDS) {
    progress.records = progress.records.slice(-MAX_RECORDS)
  }
  writeJson(userKey(name), progress)

  if (!isRecordRankingEligible(source, text, accuracy)) return
  void pushRecord({
    user: name,
    source,
    cpm,
    accuracy,
    text: text.slice(0, 80),
    lang,
  })
}

const startOfToday = (): number => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const bestOf = (records: LineRecord[]): BestRecord | null => {
  if (records.length === 0) return null
  let best = records[0]
  for (const r of records) {
    if (r.cpm > best.cpm) best = r
  }
  return {
    cpm: best.cpm,
    accuracy: best.accuracy,
    at: best.at,
    source: best.source,
    text: best.text,
    lang: recordLang(best),
  }
}

const rankingRecords = (name: string, lang: Lang): LineRecord[] =>
  getProgress(name).records.filter(
    (r) =>
      recordLang(r) === lang && isRecordRankingEligible(r.source, r.text, r.accuracy)
  )

export const getTodayBest = (name: string, lang: Lang): BestRecord | null => {
  const today = startOfToday()
  return bestOf(rankingRecords(name, lang).filter((r) => r.at >= today))
}

export const getAllTimeBest = (name: string, lang: Lang): BestRecord | null =>
  bestOf(rankingRecords(name, lang))

export const getRecentRecords = (name: string, n: number, lang: Lang): LineRecord[] => {
  const records = getProgress(name).records.filter((r) => recordLang(r) === lang)
  return records.slice(-n).reverse()
}

export const getTodayCount = (name: string, lang: Lang): number => {
  const today = startOfToday()
  return getProgress(name).records.filter(
    (r) => recordLang(r) === lang && r.at >= today
  ).length
}

export interface StreakInfo {
  current: number
  best: number
  activeToday: boolean
}

const DAY_MS = 86_400_000

// Local-day index. Korea has no DST so local-midnight / DAY_MS is exact.
const dayNumber = (ms: number): number => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return Math.round(d.getTime() / DAY_MS)
}

// Streak is tied to the user name and counts any practice day across both
// languages (recordLine stores a local record for every completed line).
export const getStreak = (name: string): StreakInfo => {
  const records = getProgress(name).records
  if (records.length === 0) return { current: 0, best: 0, activeToday: false }

  const days = new Set<number>()
  for (const r of records) days.add(dayNumber(r.at))

  const today = dayNumber(Date.now())
  const activeToday = days.has(today)

  // Count back from today, or from yesterday if today isn't done yet so the
  // streak stays "alive" until midnight.
  let current = 0
  let cursor = activeToday ? today : today - 1
  while (days.has(cursor)) {
    current += 1
    cursor -= 1
  }

  const sorted = [...days].sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev: number | null = null
  for (const d of sorted) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = d
  }

  return { current, best, activeToday }
}

// ----- Per-key error stats (weak-key analysis) -----

export interface KeyStat {
  key: string
  attempts: number
  misses: number
  rate: number
}

interface KeyStatsStore {
  attempts: Record<string, number>
  misses: Record<string, number>
}

const keyStatsKey = (name: string, lang: Lang) => `taza:user:${name}:keystats:${lang}`
const MIN_KEY_ATTEMPTS = 3

const readKeyStats = (name: string, lang: Lang): KeyStatsStore =>
  readJson<KeyStatsStore>(keyStatsKey(name, lang)) ?? { attempts: {}, misses: {} }

export const recordKeyStats = (
  name: string,
  lang: Lang,
  attempts: Record<string, number>,
  misses: Record<string, number>
): void => {
  const store = readKeyStats(name, lang)
  for (const [k, v] of Object.entries(attempts)) {
    store.attempts[k] = (store.attempts[k] ?? 0) + v
  }
  for (const [k, v] of Object.entries(misses)) {
    store.misses[k] = (store.misses[k] ?? 0) + v
  }
  writeJson(keyStatsKey(name, lang), store)
}

// Keys with enough samples and at least one miss, ranked by miss rate.
export const getWeakKeys = (name: string, lang: Lang, n = 6): KeyStat[] => {
  const { attempts, misses } = readKeyStats(name, lang)
  const out: KeyStat[] = []
  for (const [key, a] of Object.entries(attempts)) {
    if (a < MIN_KEY_ATTEMPTS) continue
    const m = misses[key] ?? 0
    if (m === 0) continue
    out.push({ key, attempts: a, misses: m, rate: m / a })
  }
  out.sort((x, y) => y.rate - x.rate || y.misses - x.misses)
  return out.slice(0, n)
}

// ----- Sprint game records (local history) -----

export interface SprintRecord {
  at: number
  lang: Lang
  correct: number
  accuracy: number
}

const sprintsKey = (name: string) => `taza:user:${name}:sprints`
const MAX_SPRINTS = 100

export const recordSprint = (
  name: string,
  lang: Lang,
  correct: number,
  accuracy: number
): void => {
  const list = readJson<SprintRecord[]>(sprintsKey(name)) ?? []
  list.push({ at: Date.now(), lang, correct, accuracy })
  writeJson(sprintsKey(name), list.slice(-MAX_SPRINTS))
}

export const getBestSprint = (name: string, lang: Lang): SprintRecord | null => {
  const list = (readJson<SprintRecord[]>(sprintsKey(name)) ?? []).filter(
    (s) => s.lang === lang
  )
  if (list.length === 0) return null
  return list.reduce((best, s) => (s.correct > best.correct ? s : best))
}

export const getRecentSprints = (
  name: string,
  lang: Lang,
  n: number
): SprintRecord[] =>
  (readJson<SprintRecord[]>(sprintsKey(name)) ?? [])
    .filter((s) => s.lang === lang)
    .slice(-n)
    .reverse()

// ----- Falling game best score (local) -----

const fallingKey = (name: string, lang: Lang) => `taza:user:${name}:falling:${lang}`

export const recordFalling = (name: string, lang: Lang, score: number): void => {
  const best = readJson<number>(fallingKey(name, lang)) ?? 0
  if (score > best) writeJson(fallingKey(name, lang), score)
}

export const getBestFalling = (name: string, lang: Lang): number =>
  readJson<number>(fallingKey(name, lang)) ?? 0
