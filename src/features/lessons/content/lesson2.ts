import { solve } from '../../../core/division/solver'
import type { LessonContent } from '../types'

export const lesson2: LessonContent = {
  id: 2,
  titleKey: 'title_2',
  descriptionKey: 'description_2',
  planet: 'venus',
  steps: [
    { kind: 'intro', textKey: 'step_l2_intro' },
    {
      kind: 'guided',
      textKey: 'step_l2_guided_1',
      exercise: { dividend: 84, divisor: 4 },
      guidedSteps: solve(84, 4),
    },
    {
      kind: 'practice',
      textKey: 'step_l2_practice_1',
      exercise: { dividend: 96, divisor: 3 },
      guidedSteps: solve(96, 3),
    },
    { kind: 'summary', textKey: 'step_l2_summary' },
  ],
}