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
