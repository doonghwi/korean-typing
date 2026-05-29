import { describe, it, expect } from 'vitest'
import { POSITION_STAGES, wordRequiredStage } from './data'

describe('POSITION_STAGES jamo-level constraint', () => {
  it('every line satisfies wordRequiredStage(line) <= stage.id', () => {
    for (const stage of POSITION_STAGES) {
      for (const lesson of stage.lessons) {
        for (const line of lesson.lines) {
          const level = wordRequiredStage(line)
          expect(
            level,
            `stage ${stage.id} (lesson ${lesson.id}) line "${line}" requires level ${level} > ${stage.id}`,
          ).toBeLessThanOrEqual(stage.id)
        }
      }
    }
  })

  it('has no empty lines', () => {
    for (const stage of POSITION_STAGES) {
      for (const lesson of stage.lessons) {
        for (const line of lesson.lines) {
          expect(
            line.trim().length,
            `stage ${stage.id} (lesson ${lesson.id}) has an empty line`,
          ).toBeGreaterThan(0)
        }
      }
    }
  })

  it('has no duplicate lines within a single lesson', () => {
    for (const stage of POSITION_STAGES) {
      for (const lesson of stage.lessons) {
        const seen = new Set<string>()
        for (const line of lesson.lines) {
          expect(
            seen.has(line),
            `stage ${stage.id} (lesson ${lesson.id}) has duplicate line "${line}"`,
          ).toBe(false)
          seen.add(line)
        }
      }
    }
  })
})
