import { solve } from '../../../core/division/solver'
import type { LessonContent } from '../types'

export const lesson5: LessonContent = {
  id: 5,
  titleKey: 'title_5',
  descriptionKey: 'description_5',
  planet: 'asteroid',
  steps: [
    { kind: 'intro', textKey: 'step_l5_intro' },
    {
      kind: 'guided',
      textKey: 'step_l5_guided_1',
      exercise: { dividend: 1204, divisor: 4 },
      guidedSteps: solve(1204, 4),
    },
    {
      kind: 'guided',
      textKey: 'step_l5_guided_2',
      exercise: { dividend: 1000, divisor: 8 },
      guidedSteps: solve(1000, 8),
    },
    { kind: 'summary', textKey: 'step_l5_summary' },
  ],
}