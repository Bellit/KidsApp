import { describe, expect, it } from 'vitest'
import { solve, type DivisionResult } from './solver'

/** Verifica que todos los pasos son aritméticamente consistentes. */
function assertStepsConsistent(result: DivisionResult): void {
  for (const step of result.steps) {
    expect(step.currentNumber).toBe(step.product + step.partialRemainder)
    expect(step.partialRemainder).toBeGreaterThanOrEqual(0)
    expect(step.partialRemainder).toBeLessThan(result.divisor)
    expect(step.quotientDigit).toBeGreaterThanOrEqual(0)
  }
  // encadenamiento: cada paso parte del resto anterior × 10 + cifra bajada
  for (let i = 0; i < result.steps.length - 1; i += 1) {
    const step = result.steps[i]
    const next = result.steps[i + 1]
    expect(step.nextDigitIndex).toBe(i + 1)
    expect(next.digitIndex).toBe(step.nextDigitIndex)
    expect(next.currentNumber).toBe(step.partialRemainder * 10 + (step.digitBroughtDown as number))
  }
}

describe('solve — casos fijos', () => {
  const cases = [
    { dividend: 84, divisor: 4, quotient: 21, remainder: 0, steps: 2 },
    { dividend: 937, divisor: 5, quotient: 187, remainder: 2, steps: 3 },
    { dividend: 385, divisor: 13, quotient: 29, remainder: 8, steps: 3 },
    { dividend: 1000, divisor: 8, quotient: 125, remainder: 0, steps: 4 },
    { dividend: 84, divisor: 3, quotient: 28, remainder: 0, steps: 2 },
    { dividend: 7, divisor: 2, quotient: 3, remainder: 1, steps: 1 },
    { dividend: 5, divisor: 7, quotient: 0, remainder: 5, steps: 1 },
    { dividend: 1204, divisor: 4, quotient: 301, remainder: 0, steps: 4 },
    { dividend: 100, divisor: 25, quotient: 4, remainder: 0, steps: 3 },
    { dividend: 999, divisor: 9, quotient: 111, remainder: 0, steps: 3 },
  ] as const

  for (const c of cases) {
    describe(`${c.dividend}÷${c.divisor}`, () => {
      it('produce cociente, resto y número de pasos correctos', () => {
        const result = solve(c.dividend, c.divisor)
        expect(result.quotient).toBe(c.quotient)
        expect(result.remainder).toBe(c.remainder)
        expect(result.steps).toHaveLength(c.steps)
        expect(c.divisor * result.quotient + result.remainder).toBe(c.dividend)
        assertStepsConsistent(result)
      })
    })
  }
})

describe('solve — casos especiales', () => {
  it('1204÷4 tiene un cero en el cociente (paso 2)', () => {
    const result = solve(1204, 4)
    expect(result.steps[2].quotientDigit).toBe(0)
    expect(result.steps[2].product).toBe(0)
    expect(result.steps[2].partialRemainder).toBe(0)
  })

  it('1000÷8 empieza con un paso de "0 cabe" (primer dígito < divisor)', () => {
    const result = solve(1000, 8)
    expect(result.steps[0].quotientDigit).toBe(0)
    expect(result.steps[0].product).toBe(0)
    expect(result.steps[0].partialRemainder).toBe(1)
  })

  it('el último paso no tiene dígito a bajar', () => {
    const result = solve(84, 4)
    const last = result.steps[result.steps.length - 1]
    expect(last.digitBroughtDown).toBeNull()
    expect(last.nextDigitIndex).toBeNull()
  })

  it('los pasos se numeran por posición y dígito procesado', () => {
    const result = solve(937, 5)
    result.steps.forEach((step, index) => {
      expect(step.position).toBe(index)
      expect(step.digitIndex).toBe(index)
    })
  })

  it('0÷5 → cociente 0, resto 0 y un solo paso', () => {
    const result = solve(0, 5)
    expect(result.quotient).toBe(0)
    expect(result.remainder).toBe(0)
    expect(result.steps).toHaveLength(1)
    expect(result.steps[0].quotientDigit).toBe(0)
  })

  it('dividendo menor que divisor (7÷9) → cociente 0 y resto = dividendo', () => {
    const result = solve(7, 9)
    expect(result.quotient).toBe(0)
    expect(result.remainder).toBe(7)
  })

  it('identidad para un dividendo grande de varias cifras', () => {
    const result = solve(987654321, 7)
    expect(result.divisor * result.quotient + result.remainder).toBe(987654321)
    expect(result.remainder).toBeLessThan(7)
    assertStepsConsistent(result)
  })
})

describe('solve — errores de entrada', () => {
  it('divisor 0 lanza Error', () => {
    expect(() => solve(10, 0)).toThrow(Error)
  })

  it('divisor negativo lanza Error', () => {
    expect(() => solve(10, -3)).toThrow(Error)
  })

  it('dividendo negativo lanza Error', () => {
    expect(() => solve(-1, 5)).toThrow(Error)
  })
})

describe('solve — test de propiedades', () => {
  it('1000 pares aleatorios cumplen la identidad aritmética y pasos consistentes', () => {
    for (let i = 0; i < 1000; i += 1) {
      const dividend = Math.floor(Math.random() * 10001)
      const divisor = 1 + Math.floor(Math.random() * 99)
      const result = solve(dividend, divisor)

      expect(result.dividend).toBe(dividend)
      expect(result.divisor).toBe(divisor)
      expect(result.divisor * result.quotient + result.remainder).toBe(result.dividend)
      expect(result.remainder).toBeGreaterThanOrEqual(0)
      expect(result.remainder).toBeLessThan(result.divisor)
      assertStepsConsistent(result)
    }
  })
})