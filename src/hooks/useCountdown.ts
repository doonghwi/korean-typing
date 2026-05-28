import { useCallback, useEffect, useState } from 'react'

// Countdown that starts on demand and ticks toward zero. `remaining` is in
// seconds; `done` flips true once it reaches zero after being started.
export const useCountdown = (durationSec: number) => {
  const [endAt, setEndAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endAt === null) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [endAt])

  const started = endAt !== null
  const remaining = started ? Math.max(0, (endAt - now) / 1000) : durationSec
  const done = started && remaining <= 0

  const start = useCallback(() => {
    const t = Date.now()
    setEndAt(t + durationSec * 1000)
    setNow(t)
  }, [durationSec])

  const reset = useCallback(() => {
    setEndAt(null)
    setNow(Date.now())
  }, [])

  return { remaining, done, started, start, reset }
}
