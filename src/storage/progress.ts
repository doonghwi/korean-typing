export interface LessonResult {
  bestCpm: number
  bestAccuracy: number
  attempts: number
  lastAt: number
}

export interface UserProgress {
  results: Record<string, LessonResult>
}

const USERS_KEY = 'taza:users'
const CURRENT_USER_KEY = 'taza:current-user'
const userKey = (name: string) => `taza:user:${name}:progress`

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
  readJson<UserProgress>(userKey(name)) ?? { results: {} }

export const recordResult = (
  name: string,
  lessonId: string,
  cpm: number,
  accuracy: number
): void => {
  const progress = getProgress(name)
  const prev = progress.results[lessonId]
  const next: LessonResult = {
    bestCpm: prev ? Math.max(prev.bestCpm, cpm) : cpm,
    bestAccuracy: prev ? Math.max(prev.bestAccuracy, accuracy) : accuracy,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAt: Date.now(),
  }
  progress.results[lessonId] = next
  writeJson(userKey(name), progress)
}
