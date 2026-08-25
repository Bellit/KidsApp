/**
 * Motor matemático de división larga (método escolar estándar).
 * Es la fuente de verdad del proyecto: cada paso describe exactamente lo que
 * el niño ve en la casita y todo el feedback se calcula a partir de aquí.
 */

export interface DivisionStep {
  /** índice del paso (0-based) */
  position: number
  /** dígito del dividendo que se procesa (posición dentro del dividendo) */
  digitIndex: number
  /** número parcial actual (cifras del dividendo consideradas hasta este paso) */
  currentNumber: number
  /** dígito del cociente en este paso */
  quotientDigit: number
  /** producto: quotientDigit × divisor */
  product: number
  /** resto parcial: currentNumber − product */
  partialRemainder: number
  /** cifra que se baja para el siguiente paso (null si es el último) */
  digitBroughtDown: number | null
  /** posición del siguiente dígito a bajar (null si es el último paso) */
  nextDigitIndex: number | null
}

export interface DivisionResult {
  dividend: number
  divisor: number
  quotient: number
  remainder: number
  steps: DivisionStep[]
}

/**
 * Resuelve `dividend ÷ divisor` paso a paso.
 * - Un paso por cada cifra del dividendo (se procesa de izquierda a derecha).
 * - Los pasos cuyo quotientDigit es 0 corresponden al caso "0 cabe"
 *   (primeras cifras que aún no llegan al divisor o ceros en el cociente).
 * - Invariante aritmético garantizado por construcción y verificado en tests:
 *   divisor × quotient + remainder === dividend.
 */
export function solve(dividend: number, divisor: number): DivisionResult {
  if (dividend < 0) {
    throw new Error('El dividendo no puede ser negativo')
  }
  if (divisor <= 0) {
    throw new Error('El divisor debe ser mayor que 0')
  }

  const digits = String(dividend)
    .split('')
    .map((char) => Number(char))
  const steps: DivisionStep[] = []
  let remainder = 0

  for (let i = 0; i < digits.length; i += 1) {
    // "Bajar" la cifra actual: se incorpora al resto parcial del paso anterior
    const currentNumber = remainder * 10 + digits[i]

    const quotientDigit = Math.floor(currentNumber / divisor)
    const product = quotientDigit * divisor
    const partialRemainder = currentNumber - product
    remainder = partialRemainder

    const isLast = i === digits.length - 1
    const nextDigitIndex = isLast ? null : i + 1

    steps.push({
      position: i,
      digitIndex: i,
      currentNumber,
      quotientDigit,
      product,
      partialRemainder,
      digitBroughtDown: nextDigitIndex === null ? null : digits[nextDigitIndex],
      nextDigitIndex,
    })
  }

  const quotient = Number(steps.map((step) => step.quotientDigit).join(''))

  // El invariante divisor × quotient + remainder === dividend se cumple por
  // construcción y se verifica de forma exhaustiva en los tests de propiedades.
  return { dividend, divisor, quotient, remainder, steps }
}