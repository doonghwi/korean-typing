import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
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
      at: Date.now(),
    })
  } catch (err) {
    console.warn('cloudRanking: push failed', err)
  }
}

const cloudLang = (r: CloudRecord): Lang => r.lang ?? langOfSource(r.source)

// We fetch a larger window (top 50 by cpm) and filter client-side by lang.
// This avoids needing a composite Firestore index, at the cost of a slightly
// larger payload. Lang populations are small enough that 50 is plenty.
const CLOUD_FETCH_WINDOW = 50

export const fetchTopRecords = async (
  lang: Lang,
  n = 10
): Promise<CloudRecord[]> => {
  try {
    const q = query(
      collection(db, RECORDS),
      orderBy('cpm', 'desc'),
      limit(CLOUD_FETCH_WINDOW)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => d.data() as CloudRecord)
      .filter((r) => cloudLang(r) === lang)
      .slice(0, n)
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
    const q = query(
      collection(db, RECORDS),
      orderBy('cpm', 'desc'),
      limit(CLOUD_FETCH_WINDOW)
    )
    const snap = await getDocs(q)
    const todayMs = today.getTime()
    return snap.docs
      .map((d) => d.data() as CloudRecord)
      .filter((r) => cloudLang(r) === lang && r.at >= todayMs)
      .slice(0, n)
  } catch (err) {
    console.warn('cloudRanking: fetch today failed', err)
    return []
  }
}
