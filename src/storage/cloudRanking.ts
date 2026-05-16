import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore/lite'
import { db } from '../firebase'

const RECORDS = 'records'

export interface CloudRecord {
  user: string
  source: string
  cpm: number
  accuracy: number
  text: string
  at: number
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

export const fetchTopRecords = async (n = 10): Promise<CloudRecord[]> => {
  try {
    const q = query(collection(db, RECORDS), orderBy('cpm', 'desc'), limit(n))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as CloudRecord)
  } catch (err) {
    console.warn('cloudRanking: fetch top failed', err)
    return []
  }
}

export const fetchTodayTopRecords = async (n = 10): Promise<CloudRecord[]> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const q = query(collection(db, RECORDS), orderBy('cpm', 'desc'), limit(50))
    const snap = await getDocs(q)
    const todayMs = today.getTime()
    return snap.docs
      .map((d) => d.data() as CloudRecord)
      .filter((r) => r.at >= todayMs)
      .slice(0, n)
  } catch (err) {
    console.warn('cloudRanking: fetch today failed', err)
    return []
  }
}
