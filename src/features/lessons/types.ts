import type { DivisionResult } from '../../core/division/solver'

export type LessonId = 1 | 2 | 3 | 4 | 5

export type LessonStepKind = 'intro' | 'glossary' | 'guided' | 'practice' | 'summary'

export interface GlossaryEntry {
  term: 'dividend' | 'divisor' | 'quotient' | 'remainder'
  textKey: string
}

export interface LessonContentStep {
  kind: LessonStepKind
  /** clave i18n del texto principal */
  textKey: string
  /** ejercicio (solo guided/practice) */
  exercise?: { dividend: number; divisor: number }
  /** resultado completo del solver (solo guided/practice) */
  guidedSteps?: DivisionResult
  /** glosario (solo glossary) */
  glossary?: GlossaryEntry[]
}

export interface LessonContent {
  id: LessonId
  titleKey: string
  descriptionKey: string
  planet: 'mercury' | 'venus' | 'earth' | 'mars' | 'asteroid'
  steps: LessonContentStep[]
}