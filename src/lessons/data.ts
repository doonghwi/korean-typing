import type { Stage, Lesson } from './types'

export const STAGES: Stage[] = [
  {
    id: 1,
    title: '1단계 — 기본 모음과 ㅇ',
    description: '모음 6개(ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ)와 자음 ㅇ을 익힙니다.',
    lessons: [
      { id: '1.1', stageId: 1, title: '모음 자모', target: 'ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ' },
      { id: '1.2', stageId: 1, title: 'ㅇ + 모음', target: '아 어 오 우 으 이' },
      { id: '1.3', stageId: 1, title: '쉬운 단어', target: '아이 오이 우유 이유' },
    ],
  },
  {
    id: 2,
    title: '2단계 — 기본 자음',
    description: 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ과 모음 결합을 연습합니다.',
    lessons: [
      { id: '2.1', stageId: 2, title: '자음 자모', target: 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ' },
      { id: '2.2', stageId: 2, title: '받침 없는 글자', target: '가 나 다 라 마 바 사' },
      { id: '2.3', stageId: 2, title: '두 글자 단어', target: '나라 다리 모자 바다 사이' },
      { id: '2.4', stageId: 2, title: '익숙한 단어', target: '사과 모래 거리 가구' },
    ],
  },
  {
    id: 3,
    title: '3단계 — 단순 받침',
    description: '받침이 한 글자인 단어를 연습합니다.',
    lessons: [
      { id: '3.1', stageId: 3, title: '받침 ㄱ ㄴ ㅁ ㄹ', target: '각 간 감 갈' },
      { id: '3.2', stageId: 3, title: '받침 ㅇ ㅂ ㄷ', target: '강 갑 갇' },
      { id: '3.3', stageId: 3, title: '받침 단어', target: '학교 친구 가족 오늘' },
      { id: '3.4', stageId: 3, title: '익숙한 단어', target: '책상 마음 도시 사람' },
    ],
  },
  {
    id: 4,
    title: '4단계 — 복합 모음',
    description: 'ㅘ ㅙ ㅚ ㅝ ㅞ ㅟ ㅢ를 익힙니다.',
    lessons: [
      { id: '4.1', stageId: 4, title: '복합 모음 자모', target: '와 워 외 위 의' },
      { id: '4.2', stageId: 4, title: '복합 모음 단어', target: '과자 의자 위로 학원' },
      { id: '4.3', stageId: 4, title: '받침 있는 복합', target: '외국 화면 위해 의미' },
    ],
  },
  {
    id: 5,
    title: '5단계 — 쌍자음과 겹받침',
    description: 'ㄲ ㄸ ㅃ ㅆ ㅉ (Shift)과 ㄳ ㄵ ㄺ ㅄ 같은 겹받침.',
    lessons: [
      { id: '5.1', stageId: 5, title: '쌍자음 (Shift)', target: '까 또 빠 쌀 짜' },
      { id: '5.2', stageId: 5, title: 'ㅆ 받침', target: '있다 갔다 했다 씻다' },
      { id: '5.3', stageId: 5, title: '겹받침 단어', target: '닭 값 흙 앉다 맑다' },
      { id: '5.4', stageId: 5, title: '복합 단어', target: '달걀 짧다 없다 옳다' },
    ],
  },
  {
    id: 6,
    title: '6단계 — 문장 연습',
    description: '짧은 문장으로 실전 감각을 익힙니다.',
    lessons: [
      { id: '6.1', stageId: 6, title: '인사', target: '안녕하세요' },
      { id: '6.2', stageId: 6, title: '소개', target: '저는 한국 사람입니다' },
      { id: '6.3', stageId: 6, title: '날씨', target: '오늘 날씨가 정말 좋네요' },
      { id: '6.4', stageId: 6, title: '연습 시작', target: '지금부터 타자 연습을 시작합니다' },
      { id: '6.5', stageId: 6, title: '긴 문장', target: '매일 조금씩 연습하면 빠르게 칠 수 있습니다' },
    ],
  },
]

export const ALL_LESSONS: Lesson[] = STAGES.flatMap((s) => s.lessons)

export const findLesson = (id: string): Lesson | null =>
  ALL_LESSONS.find((l) => l.id === id) ?? null

export const nextLessonId = (id: string): string | null => {
  const idx = ALL_LESSONS.findIndex((l) => l.id === id)
  if (idx < 0 || idx >= ALL_LESSONS.length - 1) return null
  return ALL_LESSONS[idx + 1].id
}
