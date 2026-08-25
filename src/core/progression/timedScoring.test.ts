import { describe, expect, it } from 'vitest'
import { calcTimedScore } from './timedScoring'

describe('calcTimedScore', () => {
  it('cada acierto suma 10 puntos', () => {
    expect(calcTimedScore(5, 0)).toBe(50)
    expect(calcTimedScore(12, 0)).toBe(120)
  })

  it('cada error resta 5 puntos', () => {
    expect(calcTimedScore(5, 2)).toBe(40)
    expect(calcTimedScore(10, 4)).toBe(80)
  })

  it('nunca devuelve una puntuación negativa', () => {
    expect(calcTimedScore(1, 10)).toBe(0)
    expect(calcTimedScore(0, 5)).toBe(0)
    expect(calcTimedScore(3, 6)).toBe(0)
  })

  it('sin aciertos ni errores devuelve 0', () => {
    expect(calcTimedScore(0, 0)).toBe(0)
  })
})
