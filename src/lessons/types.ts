export interface Lesson {
  id: string
  stageId: number
  title: string
  target: string
}

export interface Stage {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}
