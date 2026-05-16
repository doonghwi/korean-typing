import { TypingScreen } from './components/TypingScreen'
import './App.css'

const DEMO_TARGET = '안녕하세요'

function App() {
  return (
    <main className="app">
      <header className="hero">
        <h1>한글 타자 연습</h1>
        <p className="tagline">두벌식 · 손가락 가이드 · iPad 지원</p>
      </header>
      <TypingScreen title="첫 인사" target={DEMO_TARGET} />
    </main>
  )
}

export default App
