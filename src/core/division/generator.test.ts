import { describe, expect, it } from 'vitest'
import {
  DAILY_CHALLENGE_COUNT,
  generateDailyChallenge,
  generateExercise,
  generateSession,
  localDateString,
  seedFromDate,
  type DivisionLevel,
  type GeneratedExercise,
} from './generator'

const LEVEL_RANGES = {
  1: { min: 2, max: 99 },
  2: { min: 20, max: 999 },
  3: { min: 100, max: 2499 },
  4: { min: 100, max: 4999 },
} as const

/** Invariantes comunes a cualquier ejercicio generado. */
function assertValid(exercise: GeneratedExercise): void {
  expect(exercise.dividend).toBe(
    exercise.divisor * exercise.quotient + exercise.remainder,
  )
  expect(exercise.remainder).toBeGreaterThanOrEqual(0)
  expect(exercise.remainder).toBeLessThan(exercise.divisor)
  expect(exercise.divisor).toBeGreaterThan(1)
  expect(exercise.quotient).toBeGreaterThan(0)
  // sin ceros a la izquierda (los números no pueden tenerlos, se valida igualmente)
  expect(String(exercise.quotient)[0]).not.toBe('0')
  expect(String(exercise.dividend)[0]).not.toBe('0')
}

function matchesLevelRules(exercise: GeneratedExercise, level: 1 | 2 | 3 | 4): boolean {
  const range = LEVEL_RANGES[level]
  return (
    exercise.dividend >= range.min &&
    exercise.dividend <= range.max &&
    exercise.remainder < exercise.divisor
  )
}

describe.each([1, 2, 3, 4, 5] as DivisionLevel[])('generar nivel %i', (level) => {
  it('genera 100 ejercicios válidos con invariantes del nivel', () => {
    for (let i = 0; i < 100; i += 1) {
      const exercise = generateExercise(level)
      expect(exercise.level).toBe(level)
      assertValid(exercise)

      if (level === 1) {
        expect(exercise.remainder).toBe(0)
        expect(exercise.quotient).toBeGreaterThanOrEqual(2)
        expect(exercise.quotient).toBeLessThanOrEqual(99)
      }

      if (level < 5) {
        const range = LEVEL_RANGES[level as 1 | 2 | 3 | 4]
        expect(exercise.dividend).toBeGreaterThanOrEqual(range.min)
        expect(exercise.dividend).toBeLessThanOrEqual(range.max)
        expect(matchesLevelRules(exercise, level as 1 | 2 | 3 | 4)).toBe(true)
      } else {
        // nivel 5 (mixto): debe satisfacer al menos una de las reglas 2-4
        const matchesAny = [2, 3, 4].some((base) =>
          matchesLevelRules(exercise, base as 2 | 3 | 4),
        )
        expect(matchesAny).toBe(true)
      }
    }
  })
})

describe('generar nivel 1 — solo divisiones exactas', () => {
  it('el 100% de ejercicios tiene resto 0', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateExercise(1).remainder).toBe(0)
    }
  })
})

describe('generateExercise — inyección de aleatoriedad', () => {
  it('acepta un generador aleatorio propio', () => {
    let calls = 0
    const exercise = generateExercise(3, () => {
      calls += 1
      return 0.5
    })
    expect(calls).toBeGreaterThan(0)
    assertValid(exercise)
    expect(exercise.level).toBe(3)
  })
})

describe('generateSession — reproducibilidad y unicidad', () => {
  it('con la misma semilla reproduce la misma secuencia', () => {
    const a = generateSession(2, 10, 42)
    const b = generateSession(2, 10, 42)
    expect(a).toEqual(b)
  })

  it('con semillas distintas produce secuencias distintas', () => {
    const keys = (session: GeneratedExercise[]): string[] =>
      session.map((e) => `${e.divisor}/${e.dividend}`)
    const a = generateSession(2, 10, 42)
    const b = generateSession(2, 10, 43)
    expect(keys(a)).not.toEqual(keys(b))
  })

  it('una sesión de nivel 1 no repite ejercicios', () => {
    const session = generateSession(1, 10, 7)
    const keys = session.map((e) => `${e.divisor}/${e.dividend}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('una sesión de nivel 3 no repite ejercicios', () => {
    const session = generateSession(3, 10, 11)
    const keys = session.map((e) => `${e.divisor}/${e.dividend}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('devuelve exactamente el número de ejercicios pedido', () => {
    expect(generateSession(4, 5, 3)).toHaveLength(5)
    expect(generateSession(5, 8)).toHaveLength(8)
  })

  it('todos los ejercicios de una sesión tienen el nivel pedido', () => {
    const session = generateSession(5, 12, 9)
    session.forEach((e) => expect(e.level).toBe(5))
  })
})

// F4.4: el reto diario debe ser determinista por fecha (misma fecha -> mismo
// reto) y mezclar dificultad. Se usan fechas fijas, nunca new Date().
describe('reto diario determinista por fecha', () => {
  it('la misma fecha produce la misma semilla y el mismo reto', () => {
    expect(seedFromDate('2026-08-13')).toBe(seedFromDate('2026-08-13'))
    expect(generateDailyChallenge('2026-08-13')).toEqual(
      generateDailyChallenge('2026-08-13'),
    )
  })

  it('fechas distintas producen retos distintos', () => {
    const keys = (session: GeneratedExercise[]): string[] =>
      session.map((e) => `${e.divisor}/${e.dividend}`)
    const dayA = generateDailyChallenge('2026-08-13')
    const dayB = generateDailyChallenge('2026-08-14')
    expect(keys(dayA)).not.toEqual(keys(dayB))
  })

  it('el reto tiene DAILY_CHALLENGE_COUNT ejercicios válidos y mezcla dificultad', () => {
    const session = generateDailyChallenge('2026-08-13')
    expect(session).toHaveLength(DAILY_CHALLENGE_COUNT)
    session.forEach(assertValid)
    const levels = new Set(session.map((e) => e.level))
    expect(levels.size).toBeGreaterThan(1)
  })

  it('localDateString formatea la fecha local como YYYY-MM-DD', () => {
    expect(localDateString(new Date(2026, 7, 13))).toBe('2026-08-13')
    expect(localDateString(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})