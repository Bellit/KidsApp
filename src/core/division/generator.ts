/**
 * Generador de ejercicios de división larga.
 * Construye SIEMPRE al revés para garantizar validez aritmética:
 *   dividend = divisor × quotient + remainder
 * y respeta los rangos pedagógicos de cada nivel (tickets.md).
 */
import type { LongDivisionExercise } from './types'
import { mulberry32 } from './prng'

export type DivisionLevel = 1 | 2 | 3 | 4 | 5

export interface GeneratedExercise extends LongDivisionExercise {
  /** cociente esperado (se puede derivar, pero útil para tests/UI) */
  quotient: number
  /** resto esperado */
  remainder: number
  /** nivel de dificultad */
  level: DivisionLevel
}

/** Entero aleatorio uniforme en el rango inclusivo [min, max]. */
function randInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

/** Nivel 1: divisor 1 cifra (2-9), cociente 1-2 cifras, exacto (resto 0), dividend ≤ 99. */
function generateLevel1(random: () => number): GeneratedExercise {
  const divisor = randInt(random, 2, 9)
  // límite para que divisor × quotient no supere 99
  const maxQuotient = Math.floor(99 / divisor)
  const quotient = randInt(random, 2, maxQuotient)
  const dividend = divisor * quotient
  return { divisor, dividend, quotient, remainder: 0, level: 1 }
}

/** Nivel 2: divisor 1 cifra (2-9), cociente 2-3 cifras (≥ 20), resto 0..divisor−1, dividend ≤ 999. */
function generateLevel2(random: () => number): GeneratedExercise {
  const divisor = randInt(random, 2, 9)
  // divisor × (quotient + 1) ≤ 1000 mantiene dividend ≤ 999 incluso con resto máximo
  const maxQuotient = Math.floor(1000 / divisor) - 1
  const quotient = randInt(random, 20, maxQuotient)
  const remainder = randInt(random, 0, divisor - 1)
  const dividend = divisor * quotient + remainder
  return { divisor, dividend, quotient, remainder, level: 2 }
}

/** Nivel 3: divisor 2 cifras (10-25), cociente 2 cifras (10-99), resto 0..divisor−1, dividend ≤ 2499. */
function generateLevel3(random: () => number): GeneratedExercise {
  const divisor = randInt(random, 10, 25)
  const maxQuotient = Math.floor(2500 / divisor) - 1
  const quotient = randInt(random, 10, maxQuotient)
  const remainder = randInt(random, 0, divisor - 1)
  const dividend = divisor * quotient + remainder
  return { divisor, dividend, quotient, remainder, level: 3 }
}

/** Nivel 4: divisor 2 cifras (10-50), cociente 2-3 cifras (10-499), resto 0..divisor−1, dividend ≤ 4999. */
function generateLevel4(random: () => number): GeneratedExercise {
  const divisor = randInt(random, 10, 50)
  const maxQuotient = Math.floor(5000 / divisor) - 1
  const quotient = randInt(random, 10, maxQuotient)
  const remainder = randInt(random, 0, divisor - 1)
  const dividend = divisor * quotient + remainder
  return { divisor, dividend, quotient, remainder, level: 4 }
}

/**
 * Genera un ejercicio del nivel pedido.
 * `random` permite inyectar una fuente determinista (ver `mulberry32`).
 */
export function generateExercise(
  level: DivisionLevel,
  random: () => number = Math.random,
): GeneratedExercise {
  switch (level) {
    case 1:
      return generateLevel1(random)
    case 2:
      return generateLevel2(random)
    case 3:
      return generateLevel3(random)
    case 4:
      return generateLevel4(random)
    case 5: {
      // Nivel mixto: elige una regla base (2-4) y genera con ella
      const base = randInt(random, 2, 4) as DivisionLevel
      return { ...generateExercise(base, random), level: 5 }
    }
  }
}

/**
 * Genera `count` ejercicios sin repetir dentro de la misma sesión.
 * Si `seed` se indica se usa un PRNG determinista (reproducible para QA).
 */
export function generateSession(
  level: DivisionLevel,
  count: number,
  seed?: number,
): GeneratedExercise[] {
  const random = seed === undefined ? Math.random : mulberry32(seed)
  const used = new Set<string>()
  const exercises: GeneratedExercise[] = []

  for (let i = 0; i < count; i += 1) {
    let candidate = generateExercise(level, random)
    const key = (exercise: GeneratedExercise): string =>
      `${exercise.divisor}/${exercise.dividend}`

    // reintenta hasta encontrar un ejercicio distinto (máx. 50 intentos)
    let attempts = 0
    while (used.has(key(candidate)) && attempts < 50) {
      candidate = generateExercise(level, random)
      attempts += 1
    }
    used.add(key(candidate))
    exercises.push(candidate)
  }

  return exercises
}

// F4.4: reto diario.
// El reto mezcla dificultad: arranca accesible (divisor de 1 cifra exacto),
// sube hasta divisor de 2 cifras y remata con un nivel medio.

/** Número de ejercicios del reto diario. */
export const DAILY_CHALLENGE_COUNT = 5
/** Progresión de dificultad fija del reto diario (niveles del generador). */
export const DAILY_CHALLENGE_LEVEL_MIX: DivisionLevel[] = [1, 2, 3, 4, 3]

/**
 * Fecha local como cadena YYYY-MM-DD (p. ej. '2026-08-13').
 * Es la fuente de semilla del reto diario: el mismo día genera el MISMO reto
 * para todos los usuarios, independientemente de la hora o de la zona UTC.
 */
export function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha YYYY-MM-DD en una semilla numérica determinista.
 * Se deriva de los char codes de la cadena (hash tipo djb2) en lugar de
 * Date.parse para no depender de zonas horarias y ser estable en los tests.
 */
export function seedFromDate(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Genera el reto diario de una fecha: DAILY_CHALLENGE_COUNT ejercicios
 * deterministas (misma fecha -> mismo reto). La dificultad se mezcla con
 * DAILY_CHALLENGE_LEVEL_MIX y los números concretos cambian cada día porque
 * el PRNG se re-semilla con seedFromDate(fecha).
 */
export function generateDailyChallenge(dateStr: string): GeneratedExercise[] {
  const random = mulberry32(seedFromDate(dateStr))
  const used = new Set<string>()
  const exercises: GeneratedExercise[] = []
  const key = (exercise: GeneratedExercise): string =>
    `${exercise.divisor}/${exercise.dividend}`

  for (const level of DAILY_CHALLENGE_LEVEL_MIX) {
    let candidate = generateExercise(level, random)
    // reintenta hasta encontrar un ejercicio distinto (máx. 50 intentos)
    let attempts = 0
    while (used.has(key(candidate)) && attempts < 50) {
      candidate = generateExercise(level, random)
      attempts += 1
    }
    used.add(key(candidate))
    exercises.push(candidate)
  }

  return exercises
}