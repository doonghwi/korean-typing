import { useEffect, useRef, useState } from 'react'
import {
  backspace,
  initialState,
  inputJamo,
  inputLiteral,
  renderState,
  keyToJamo,
  type ComposerState,
} from '../hangul'
import { codeToKeyChar } from '../hangul/dubeolsik'
import type { Lang } from '../lessons/sources'
import './FallingGame.css'

const MAX_LIVES = 5
const TICK_MS = 50

interface FallingWord {
  id: number
  text: string
  x: number // 0..100 (%)
  y: number // 0..1 (0 top, 1 floor)
}

interface Props {
  lang: Lang
  pool: string[]
  bestScore: number
  onComplete: (score: number) => void
  onExit: () => void
}

// Difficulty scales with score: words fall faster and spawn more often.
const fallDurationFor = (score: number) => Math.max(2.6, 6 - Math.floor(score / 5) * 0.4)
const spawnIntervalFor = (score: number) =>
  Math.max(900, 2000 - Math.floor(score / 5) * 120)

export const FallingGame = ({ lang, pool, bestScore, onComplete, onExit }: Props) => {
  const [words, setWords] = useState<FallingWord[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [typed, setTyped] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [round, setRound] = useState(0)

  // Refs read by the keydown handler / game loop without stale closures.
  const wordsRef = useRef<FallingWord[]>([])
  const scoreRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const gameOverRef = useRef(false)
  const composerRef = useRef<ComposerState>(initialState())
  const bufferRef = useRef('')
  const nextIdRef = useRef(1)
  const onCompleteRef = useRef(onComplete)

  wordsRef.current = words
  gameOverRef.current = gameOver
  scoreRef.current = score
  livesRef.current = lives
  onCompleteRef.current = onComplete

  const lowestId =
    words.length > 0
      ? words.reduce((a, b) => (b.y > a.y ? b : a)).id
      : null

  const makeWord = (): FallingWord => ({
    id: nextIdRef.current++,
    text: pool[Math.floor(Math.random() * pool.length)] ?? '',
    x: 6 + Math.random() * 80,
    y: 0,
  })

  const clearTyping = () => {
    composerRef.current = initialState()
    bufferRef.current = ''
    setTyped('')
  }

  // Game loop: move words, spawn, detect floor hits.
  useEffect(() => {
    if (gameOver) return
    let lastTick = Date.now()
    let lastSpawn = Date.now() - 1500
    const id = window.setInterval(() => {
      if (gameOverRef.current) return
      const now = Date.now()
      const dt = Math.min(0.12, (now - lastTick) / 1000)
      lastTick = now
      const speed = dt / fallDurationFor(scoreRef.current)

      const kept: FallingWord[] = []
      let hits = 0
      for (const w of wordsRef.current) {
        const ny = w.y + speed
        if (ny >= 1) hits += 1
        else kept.push({ ...w, y: ny })
      }
      if (now - lastSpawn >= spawnIntervalFor(scoreRef.current)) {
        lastSpawn = now
        kept.push(makeWord())
      }
      wordsRef.current = kept
      setWords(kept)

      if (hits > 0) {
        const nl = Math.max(0, livesRef.current - hits)
        livesRef.current = nl
        setLives(nl)
        clearTyping()
        if (nl <= 0) {
          gameOverRef.current = true
          setGameOver(true)
        }
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, round])

  // Fire completion (save score) once when the game ends.
  useEffect(() => {
    if (gameOver) onCompleteRef.current(scoreRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  // Typing.
  useEffect(() => {
    const tryMatch = (text: string) => {
      if (!text) return
      // Clear the lowest word that matches exactly.
      const matches = wordsRef.current.filter((w) => w.text === text)
      if (matches.length === 0) return
      const target = matches.reduce((a, b) => (b.y > a.y ? b : a))
      const next = wordsRef.current.filter((w) => w.id !== target.id)
      wordsRef.current = next
      setWords(next)
      const ns = scoreRef.current + 1
      scoreRef.current = ns
      setScore(ns)
      clearTyping()
    }

    const onKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Escape') {
        e.preventDefault()
        clearTyping()
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (lang === 'en') {
          bufferRef.current = bufferRef.current.slice(0, -1)
          setTyped(bufferRef.current)
        } else {
          composerRef.current = backspace(composerRef.current)
          setTyped(renderState(composerRef.current))
        }
        return
      }

      if (lang === 'en') {
        if (e.key.length !== 1) return
        e.preventDefault()
        bufferRef.current += e.key
        setTyped(bufferRef.current)
        tryMatch(bufferRef.current)
        return
      }

      // Korean: compose jamo.
      const keyChar = codeToKeyChar(e.code, e.shiftKey)
      let jamo = keyChar ? keyToJamo(keyChar) : null
      if (!jamo && keyChar && e.shiftKey) jamo = keyToJamo(keyChar.toLowerCase())
      if (jamo) {
        e.preventDefault()
        composerRef.current = inputJamo(composerRef.current, jamo)
      } else if (e.key.length === 1) {
        e.preventDefault()
        composerRef.current = inputLiteral(composerRef.current, e.key)
      } else {
        return
      }
      const rendered = renderState(composerRef.current)
      setTyped(rendered)
      tryMatch(rendered)
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lang])

  const restart = () => {
    wordsRef.current = []
    scoreRef.current = 0
    livesRef.current = MAX_LIVES
    gameOverRef.current = false
    clearTyping()
    setWords([])
    setScore(0)
    setLives(MAX_LIVES)
    setGameOver(false)
    setRound((r) => r + 1)
  }

  if (gameOver) {
    const isBest = score >= bestScore && score > 0
    return (
      <div className="falling-summary">
        <h2>💥 게임 오버!</h2>
        {isBest ? <div className="fg-newbest">🏅 최고 기록!</div> : null}
        <div className="fg-score">
          {score}
          <span className="fg-score-unit">개</span>
        </div>
        <div className="fg-sub">최고 기록 {Math.max(bestScore, score)}개</div>
        <div className="actions">
          <button onClick={restart}>다시</button>
          <button className="primary" onClick={onExit}>
            프로필로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="falling-game">
      <div className="fg-hud">
        <div className="fg-stat">
          <b>{score}</b>
          <span>점수</span>
        </div>
        <div className="fg-lives" aria-label={`목숨 ${lives}`}>
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={i < lives ? 'heart' : 'heart lost'}>
              {i < lives ? '❤️' : '🤍'}
            </span>
          ))}
        </div>
      </div>

      <div className="fg-field">
        {words.map((w) => (
          <span
            key={w.id}
            className={`fg-word${w.id === lowestId ? ' active' : ''}`}
            style={{ left: `${w.x}%`, top: `${w.y * 100}%` }}
          >
            {w.text}
          </span>
        ))}
        <div className="fg-floor" />
      </div>

      <div className="fg-input">
        {typed ? typed : <span className="placeholder">떨어지는 단어를 입력!</span>}
        <span className="caret" />
      </div>
      <p className="fg-hint">
        맨 아래 단어부터 입력하세요 · <kbd>Esc</kbd> 입력 초기화
      </p>
    </div>
  )
}
