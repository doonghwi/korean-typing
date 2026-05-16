import { STAGES, findStage, stageLines } from './data'

export interface PracticeSource {
  value: string
  label: string
  shortLabel: string
}

export const SOURCES: PracticeSource[] = [
  {
    value: 'random',
    label: '랜덤 — 모든 단계 섞기',
    shortLabel: '랜덤 (모든 단계)',
  },
  ...STAGES.map((s) => ({
    value: `stage-${s.id}`,
    label: s.title,
    shortLabel: `${s.id}단계`,
  })),
]

export const linesForSource = (source: string): string[] => {
  if (source === 'random') return STAGES.flatMap((s) => stageLines(s))
  const m = source.match(/^stage-(\d+)$/)
  if (m) {
    const stage = findStage(parseInt(m[1], 10))
    return stage ? stageLines(stage) : []
  }
  return []
}

export const sourceLabel = (source: string): string =>
  SOURCES.find((s) => s.value === source)?.label ?? source

export const sourceShortLabel = (source: string): string =>
  SOURCES.find((s) => s.value === source)?.shortLabel ?? source
