import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore/lite'
import { db } from '../firebase'
import { langOfSource, type Lang } from '../lessons/sources'

const RECORDS = 'records'
const SPRINTS = 'sprints'
const FALLINGS = 'fallings'

export interface CloudRecord {
  user: string
  source: string
  cpm: number
  accuracy: number
  text: string
  at: number
  lang?: Lang
}

export const pushRecord = async (
  record: Omit<CloudRecord, 'at'>
): Promise<void> => {
  try {
    await addDoc(collection(db, RECORDS), {
      ...record,
      lang: record.lang ?? langOfSource(record.source),
      at: Date.now(),
    })
  } catch (err) {
    console.warn('cloudRanking: push failed', err)
  }
}

// Server-side lang filter ensures English records aren't crowded out by
// Korean ones (Korean cpm counts jamo strokes and tends to be numerically
// higher). Requires a Firestore composite index on (lang asc, cpm desc);
// the first failed query will print an auto-create link in the console.
export const fetchTopRecords = async (
  lang: Lang,
  n = 10
): Promise<CloudRecord[]> => {
  try {
    const q = query(
      collection(db, RECORDS),
      where('lang', '==', lang),
      orderBy('cpm', 'desc'),
      limit(n)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as CloudRecord)
  } catch (err) {
    console.warn('cloudRanking: fetch top failed', err)
    return []
  }
}

export interface CloudSprint {
  user: string
  lang: Lang
  score: number
  accuracy: number
  at: number
}

// Cloud sprint leaderboard. Requires Firestore rules to allow the `sprints`
// collection (read + validated create) and a composite index on
// (lang asc, score desc); both print an auto-create/setup link on first use.
export const pushSprint = async (
  record: Omit<CloudSprint, 'at'>
): Promise<void> => {
  try {
    await addDoc(collection(db, SPRINTS), { ...record, at: Date.now() })
  } catch (err) {
    console.warn('cloudRanking: sprint push failed', err)
  }
}

export const fetchTopSprints = async (
  lang: Lang,
  n = 10
): Promise<CloudSprint[]> => {
  try {
    const q = query(
      collection(db, SPRINTS),
      where('lang', '==', lang),
      orderBy('score', 'desc'),
      limit(n)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as CloudSprint)
  } catch (err) {
    console.warn('cloudRanking: fetch sprints failed', err)
    return []
  }
}

export interface CloudFalling {
  user: string
  lang: Lang
  score: number
  at: number
}

// Cloud falling-game leaderboard. Needs Firestore rules for the `fallings`
// collection + composite index on (lang asc, score desc).
export const pushFalling = async (
  record: Omit<CloudFalling, 'at'>
): Promise<void> => {
  try {
    await addDoc(collection(db, FALLINGS), { ...record, at: Date.now() })
  } catch (err) {
    console.warn('cloudRanking: falling push failed', err)
  }
}

export const fetchTopFallings = async (
  lang: Lang,
  n = 10
): Promise<CloudFalling[]> => {
  try {
    const q = query(
      collection(db, FALLINGS),
      where('lang', '==', lang),
      orderBy('score', 'desc'),
      limit(n)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as CloudFalling)
  } catch (err) {
    console.warn('cloudRanking: fetch fallings failed', err)
    return []
  }
}

export const fetchTodayTopRecords = async (
  lang: Lang,
  n = 10
): Promise<CloudRecord[]> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMs = today.getTime()
    const q = query(
      collection(db, RECORDS),
      where('lang', '==', lang),
      orderBy('cpm', 'desc'),
      limit(50)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => d.data() as CloudRecord)
      .filter((r) => r.at >= todayMs)
      .slice(0, n)
  } catch (err) {
    console.warn('cloudRanking: fetch today failed', err)
    return []
  }
}
