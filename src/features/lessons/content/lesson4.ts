import { solve } from '../../../core/division/solver'
import type { LessonContent } from '../types'

export const lesson4: LessonContent = {
  id: 4,
  titleKey: 'title_4',
  descriptionKey: 'description_4',
  planet: 'mars',
  steps: [
    { kind: 'intro', textKey: 'step_l4_intro' },
    {
      kind: 'guided',
      textKey: 'step_l4_guided_1',
      exercise: { dividend: 87, divisor: 21 },
      guidedSteps: solve(87, 21),
    },
    {
      kind: 'practice',
      textKey: 'step_l4_practice_1',
      exercise: { dividend: 154, divisor: 23 },
      guidedSteps: solve(154, 23),
    },
    { kind: 'summary', textKey: 'step_l4_summary' },
  ],
}