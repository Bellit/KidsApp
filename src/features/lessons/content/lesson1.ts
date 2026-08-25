import { solve } from '../../../core/division/solver'
import type { LessonContent } from '../types'

export const lesson1: LessonContent = {
  id: 1,
  titleKey: 'title_1',
  descriptionKey: 'description_1',
  planet: 'mercury',
  steps: [
    { kind: 'intro', textKey: 'step_l1_intro' },
    {
      kind: 'glossary',
      textKey: 'step_l1_glossary_intro',
      glossary: [
        { term: 'dividend', textKey: 'step_l1_glossary_dividend' },
        { term: 'divisor', textKey: 'step_l1_glossary_divisor' },
        { term: 'quotient', textKey: 'step_l1_glossary_quotient' },
        { term: 'remainder', textKey: 'step_l1_glossary_remainder' },
      ],
    },
    {
      kind: 'guided',
      textKey: 'step_l1_guided_1',
      exercise: { dividend: 8, divisor: 2 },
      guidedSteps: solve(8, 2),
    },
    {
      kind: 'practice',
      textKey: 'step_l1_practice_1',
      exercise: { dividend: 12, divisor: 3 },
      guidedSteps: solve(12, 3),
    },
    { kind: 'summary', textKey: 'step_l1_summary' },
  ],
}