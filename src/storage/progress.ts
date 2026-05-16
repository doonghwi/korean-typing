export interface StageResult {
  bestCpm: number
  bestAccuracy: number
  attempts: number
  lastAt: number
}

export interface SessionRecord {
  at: number
  stageId: number
  cpm: number
  accuracy: number
}

export interface UserProgress {
  stageResults: Record<number, StageResult>
  sessions: SessionRecord[]
}

export interface BestRecord {
  cpm: number
  accuracy: number
  at: number
  stageId: number
}

const USERS_KEY = 'taza:users'
const CURRENT_USER_KEY = 'taza:current-user'
const userKey = (name: string) => `taza:user:${name}:progress-v2`

const MAX_SESSIONS = 500

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
    stageResults: raw?.stageResults ?? {},
    sessions: raw?.sessions ?? [],
  }
}

export const recordStageResult = (
  name: string,
  stageId: number,
  cpm: number,
  accuracy: number
): void => {
  const progress = getProgress(name)
  const prev = progress.stageResults[stageId]
  progress.stageResults[stageId] = {
    bestCpm: prev ? Math.max(prev.bestCpm, cpm) : cpm,
    bestAccuracy: prev ? Math.max(prev.bestAccuracy, accuracy) : accuracy,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAt: Date.now(),
  }
  progress.sessions.push({ at: Date.now(), stageId, cpm, accuracy })
  if (progress.sessions.length > MAX_SESSIONS) {
    progress.sessions = progress.sessions.slice(-MAX_SESSIONS)
  }
  writeJson(userKey(name), progress)
}

const startOfToday = (): number => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const bestOf = (sessions: SessionRecord[]): BestRecord | null => {
  if (sessions.length === 0) return null
  let best = sessions[0]
  for (const s of sessions) {
    if (s.cpm > best.cpm) best = s
  }
  return { cpm: best.cpm, accuracy: best.accuracy, at: best.at, stageId: best.stageId }
}

export const getTodayBest = (name: string): BestRecord | null => {
  const today = startOfToday()
  const sessions = getProgress(name).sessions.filter((s) => s.at >= today)
  return bestOf(sessions)
}

export const getAllTimeBest = (name: string): BestRecord | null =>
  bestOf(getProgress(name).sessions)

export const getRecentSessions = (name: string, n = 8): SessionRecord[] => {
  const sessions = getProgress(name).sessions
  return sessions.slice(-n).reverse()
}

export const getTodayStats = (name: string): { sessions: number; totalSeconds: number } => {
  const today = startOfToday()
  const todaySessions = getProgress(name).sessions.filter((s) => s.at >= today)
  return { sessions: todaySessions.length, totalSeconds: 0 }
}
