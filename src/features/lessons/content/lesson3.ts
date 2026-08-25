import { solve } from '../../../core/division/solver'
import type { LessonContent } from '../types'

export const lesson3: LessonContent = {
  id: 3,
  titleKey: 'title_3',
  descriptionKey: 'description_3',
  planet: 'earth',
  steps: [
    { kind: 'intro', textKey: 'step_l3_intro' },
    {
      kind: 'guided',
      textKey: 'step_l3_guided_1',
      exercise: { dividend: 23, divisor: 4 },
      guidedSteps: solve(23, 4),
    },
    {
      kind: 'practice',
      textKey: 'step_l3_practice_1',
      exercise: { dividend: 29, divisor: 5 },
      guidedSteps: solve(29, 5),
    },
    { kind: 'summary', textKey: 'step_l3_summary' },
  ],
}