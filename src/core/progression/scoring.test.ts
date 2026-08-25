import { describe, expect, it } from 'vitest'
import { calcStars } from './scoring'

describe('calcStars', () => {
  it('3 estrellas solo con sesión perfecta', () => {
    expect(calcStars(10, 10, 0, 0)).toBe(3)
  })

  it('no da 3 estrellas si no se completan todos los ejercicios', () => {
    expect(calcStars(8, 10, 0, 0)).toBe(2)
  })

  it('2 estrellas con hasta 2 errores y 2 hints', () => {
    expect(calcStars(10, 10, 2, 2)).toBe(2)
    expect(calcStars(10, 10, 2, 0)).toBe(2)
    expect(calcStars(10, 10, 0, 2)).toBe(2)
  })

  it('1 estrella con más de 2 errores', () => {
    expect(calcStars(10, 10, 3, 0)).toBe(1)
  })

  it('1 estrella con más de 2 hints', () => {
    expect(calcStars(10, 10, 0, 3)).toBe(1)
  })

  it('1 estrella con muchos errores y hints', () => {
    expect(calcStars(10, 10, 5, 5)).toBe(1)
  })
})