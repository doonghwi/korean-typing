export interface StageResult {
  bestCpm: number
  bestAccuracy: number
  attempts: number
  lastAt: number
}

export interface UserProgress {
  stageResults: Record<number, StageResult>
}

const USERS_KEY = 'taza:users'
const CURRENT_USER_KEY = 'taza:current-user'
const userKey = (name: string) => `taza:user:${name}:progress-v2`

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

export const getProgress = (name: string): UserProgress =>
  readJson<UserProgress>(userKey(name)) ?? { stageResults: {} }

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
  writeJson(userKey(name), progress)
}
