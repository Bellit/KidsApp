import { describe, expect, it } from 'vitest'
import { solve } from './solver'
import { validateStep } from './validator'

const result84 = solve(84, 4)
const result1204 = solve(1204, 4)

describe('validateStep 84÷4', () => {
  it('paso 0: cociente correcto', () => {
    expect(validateStep(result84, 0, 'quotient', 2)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('paso 0: cociente incorrecto → hint de cociente', () => {
    expect(validateStep(result84, 0, 'quotient', 3)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_quotient',
    })
  })

  it('paso 0: producto correcto', () => {
    expect(validateStep(result84, 0, 'product', 8)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('paso 0: producto incorrecto → hint de producto', () => {
    expect(validateStep(result84, 0, 'product', 6)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_product',
    })
  })

  it('paso 0: resto correcto', () => {
    expect(validateStep(result84, 0, 'remainder', 0)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('paso 0: resto incorrecto → hint de resto', () => {
    expect(validateStep(result84, 0, 'remainder', 2)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_remainder',
    })
  })

  it('paso 0: dígito bajado correcto (4)', () => {
    expect(validateStep(result84, 0, 'broughtDown', 4)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('paso 0: dígito bajado incorrecto → hint de bajar cifra', () => {
    expect(validateStep(result84, 0, 'broughtDown', 7)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_bring_down',
    })
  })

  it('paso 1 (último): no hay cifra a bajar → se espera 0', () => {
    expect(validateStep(result84, 1, 'broughtDown', 0)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
    expect(validateStep(result84, 1, 'broughtDown', 4)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_bring_down',
    })
  })

  it('paso 1: cociente correcto (1)', () => {
    expect(validateStep(result84, 1, 'quotient', 1)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('usuario sin responder → no_answer con hint', () => {
    expect(validateStep(result84, 0, 'quotient', null)).toEqual({
      correct: false,
      messageKey: 'feedback.no_answer',
      nextHintKey: 'feedback.hint_quotient',
    })
  })
})

describe('validateStep 1204÷4 — cero en el cociente', () => {
  it('el paso 2 tiene cociente 0', () => {
    expect(result1204.steps[2].quotientDigit).toBe(0)
  })

  it('responder 0 es correcto', () => {
    expect(validateStep(result1204, 2, 'quotient', 0)).toEqual({
      correct: true,
      messageKey: 'feedback.correct',
    })
  })

  it('responder otra cifra sugiere hint de cero en cociente', () => {
    expect(validateStep(result1204, 2, 'quotient', 5)).toEqual({
      correct: false,
      messageKey: 'feedback.try_again',
      nextHintKey: 'feedback.hint_zero_quotient',
    })
  })

  it('sin respuesta también sugiere hint de cero en cociente', () => {
    expect(validateStep(result1204, 2, 'quotient', null)).toEqual({
      correct: false,
      messageKey: 'feedback.no_answer',
      nextHintKey: 'feedback.hint_zero_quotient',
    })
  })
})

describe('validateStep — errores de rango', () => {
  it('paso fuera de rango lanza Error', () => {
    expect(() => validateStep(result84, 99, 'quotient', 1)).toThrow(Error)
  })

  it('paso negativo lanza Error', () => {
    expect(() => validateStep(result84, -1, 'remainder', 0)).toThrow(Error)
  })
})