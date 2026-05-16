export interface PositionLesson {
  id: string
  title: string
  lines: string[]
}

export interface PositionStage {
  id: number
  title: string
  description: string
  lessons: PositionLesson[]
}

export interface SentenceLesson {
  id: string
  title: string
  lines: string[]
}
