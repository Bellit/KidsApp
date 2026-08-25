/**
 * Validador de pasos: compara la respuesta del niño con el valor esperado
 * que calcula el solver. Devuelve feedback tipado con claves i18n para que
 * la UI traduzca sin que core dependa de i18n.
 */
import type { DivisionResult, DivisionStep } from './solver'

export interface StepFeedback {
  correct: boolean
  /** clave i18n del mensaje */
  messageKey: string
  /** clave i18n del hint sugerido (si es incorrecto o no respondido) */
  nextHintKey?: string
}

export type StepInputKind = 'quotient' | 'product' | 'remainder' | 'broughtDown'

/** Hint pedagógico por tipo de entrada (el de cociente cero se trata aparte). */
const HINT_BY_KIND: Record<StepInputKind, string> = {
  quotient: 'feedback.hint_quotient',
  product: 'feedback.hint_product',
  remainder: 'feedback.hint_remainder',
  broughtDown: 'feedback.hint_bring_down',
}

/** Valor esperado según el tipo de entrada pedida al niño. */
function expectedValue(step: DivisionStep, inputKind: StepInputKind): number {
  switch (inputKind) {
    case 'quotient':
      return step.quotientDigit
    case 'product':
      return step.product
    case 'remainder':
      return step.partialRemainder
    case 'broughtDown':
      // En el último paso no hay cifra que bajar → se espera 0 (nada)
      return step.digitBroughtDown ?? 0
  }
}

/**
 * Valida la respuesta del niño para un paso concreto.
 * `userAnswer` null significa que aún no ha respondido.
 */
export function validateStep(
  result: DivisionResult,
  stepIndex: number,
  inputKind: StepInputKind,
  userAnswer: number | null,
): StepFeedback {
  const step = result.steps[stepIndex]
  if (!step) {
    throw new Error(`Paso ${stepIndex} fuera de rango (${result.steps.length} pasos)`)
  }

  const expected = expectedValue(step, inputKind)
  const isZeroQuotient = inputKind === 'quotient' && step.quotientDigit === 0
  const baseHint = isZeroQuotient
    ? 'feedback.hint_zero_quotient'
    : HINT_BY_KIND[inputKind]

  if (userAnswer === null) {
    return { correct: false, messageKey: 'feedback.no_answer', nextHintKey: baseHint }
  }

  if (userAnswer === expected) {
    return { correct: true, messageKey: 'feedback.correct' }
  }

  return { correct: false, messageKey: 'feedback.try_again', nextHintKey: baseHint }
}