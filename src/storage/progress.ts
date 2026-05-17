import { isRecordRankingEligible } from '../lessons/sources'
import { pushRecord } from './cloudRanking'

export interface LineRecord {
  at: number
  source: string
  cpm: number
  accuracy: number
  text: string
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
}

const USERS_KEY = 'taza:users'
const CURRENT_USER_KEY = 'taza:current-user'
const userKey = (name: string) => `taza:user:${name}:progress-v3`

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

export const getProgress = (name: string): UserProgress => {
  const raw = readJson<Partial<UserProgress>>(userKey(name))
  return {
    records: raw?.records ?? [],
  }
}

export const recordLine = (
  name: string,
  source: string,
  cpm: number,
  accuracy: number,
  text: string
): void => {
  const progress = getProgress(name)
  progress.records.push({
    at: Date.now(),
    source,
    cpm,
    accuracy,
    text: text.slice(0, 80),
  })
  if (progress.records.length > MAX_RECORDS) {
    progress.records = progress.records.slice(-MAX_RECORDS)
  }
  writeJson(userKey(name), progress)

  if (!isRecordRankingEligible(source, text)) return
  void pushRecord({
    user: name,
    source,
    cpm,
    accuracy,
    text: text.slice(0, 80),
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
  }
}

const rankingRecords = (name: string): LineRecord[] =>
  getProgress(name).records.filter((r) => isRecordRankingEligible(r.source, r.text))

export const getTodayBest = (name: string): BestRecord | null => {
  const today = startOfToday()
  return bestOf(rankingRecords(name).filter((r) => r.at >= today))
}

export const getAllTimeBest = (name: string): BestRecord | null =>
  bestOf(rankingRecords(name))

export const getRecentRecords = (name: string, n = 8): LineRecord[] => {
  const records = getProgress(name).records
  return records.slice(-n).reverse()
}

export const getTodayCount = (name: string): number => {
  const today = startOfToday()
  return getProgress(name).records.filter((r) => r.at >= today).length
}
