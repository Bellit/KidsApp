import { type CSSProperties, type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DivisionStep } from '../../core/division/solver'
import type { CellState, LongDivisionExercise } from '../../core/division/types'
import '../../styles/longdivision.css'

interface LongDivisionGridProps {
  exercise: LongDivisionExercise
  currentStepIndex?: number
  onDigitSelect?: (index: number) => void
  variant?: 'lesson' | 'practice'
  highlightActive?: boolean
  /** dígito que recibe el anillo de resaltado (si no se indica, el activo) */
  highlightIndex?: number
  /** pasos ya terminados: sus productos, restos y cifras bajadas siguen escritos (como en papel) */
  previousSteps?: DivisionStep[]
  /** producto resuelto del paso actual */
  currentProduct?: number
  /** resto resuelto del paso actual */
  currentRemainder?: number
  /** índice del dígito que el niño debe bajar (late y muestra flecha ▼) */
  bringDownIndex?: number
  /** pasos resueltos → modo "solución": muestra productos y restos de todos los pasos */
  solvedSteps?: DivisionStep[]
  children?: ReactNode
}

/** Un paso escrito bajo el dividendo: fila de producto + fila de resto (con la cifra bajada). */
interface WorkStep {
  digitIndex: number
  product?: number
  remainder?: number
  broughtDown?: { index: number; digit: number }
  tone: 'past' | 'current'
}

const stateClass: Record<CellState, string> = {
  pending: 'border-2 border-white/15 bg-transparent text-text-space/85',
  active: 'bg-astral-sun text-text-ink animate-pulse',
  correct: 'bg-success-soft text-success',
  incorrect: 'bg-danger-soft text-danger',
}

const toneClass: Record<WorkStep['tone'], string> = {
  past: 'text-text-space/55',
  current: 'text-success-soft',
}

function stateForDigit(index: number, current: number | undefined, bringDownIndex: number | undefined): CellState {
  if (current === undefined) return 'pending'
  // Mientras se baja una cifra, lo que late es la cifra a bajar, no la ya usada.
  if (bringDownIndex !== undefined) {
    if (index === bringDownIndex) return 'active'
    return index <= current ? 'correct' : 'pending'
  }
  if (index < current) return 'correct'
  if (index === current) return 'active'
  return 'pending'
}

export function LongDivisionGrid({
  exercise,
  currentStepIndex,
  onDigitSelect,
  variant = 'practice',
  highlightActive = false,
  highlightIndex,
  previousSteps = [],
  currentProduct,
  currentRemainder,
  bringDownIndex,
  solvedSteps,
  children,
}: LongDivisionGridProps) {
  const { t } = useTranslation()
  const isSolved = solvedSteps !== undefined
  const dividendDigits = useMemo(() => String(exercise.dividend).split(''), [exercise.dividend])
  const divisorDigits = useMemo(() => String(exercise.divisor).split(''), [exercise.divisor])

  const workSteps = useMemo<WorkStep[]>(() => {
    const done = (step: DivisionStep): WorkStep => ({
      digitIndex: step.digitIndex,
      product: step.product,
      remainder: step.partialRemainder,
      broughtDown:
        step.nextDigitIndex !== null && step.digitBroughtDown !== null
          ? { index: step.nextDigitIndex, digit: step.digitBroughtDown }
          : undefined,
      tone: 'past',
    })
    if (solvedSteps) return solvedSteps.map((step) => ({ ...done(step), tone: 'current' }))
    const list = previousSteps.map(done)
    if (currentStepIndex !== undefined && (currentProduct !== undefined || currentRemainder !== undefined)) {
      list.push({ digitIndex: currentStepIndex, product: currentProduct, remainder: currentRemainder, tone: 'current' })
    }
    return list
  }, [solvedSteps, previousSteps, currentStepIndex, currentProduct, currentRemainder])

  const n = dividendDigits.length
  const digitStartCol = 3
  const digitEndCol = 2 + n
  const hintRow = 3
  const firstWorkRow = 4
  const lastRow = Math.max(firstWorkRow + 1, firstWorkRow + workSteps.length * 2 - 1)

  // Las celdas de cociente son huecos visuales (la fila real la dibuja el slot
  // de children); se ocultan a los lectores de pantalla para no duplicar.
  const quotientCells = dividendDigits.map((_, i) => (
    <div
      key={`quotient-${i}`}
      className="ldg-cell"
      style={{ gridColumn: `${digitStartCol + i}`, gridRow: 1 }}
      aria-hidden="true"
    />
  ))

  const digitCells = dividendDigits.map((digit, i) => {
    const isActive = i === currentStepIndex
    const isHighlighted = !isSolved && i === (highlightIndex ?? currentStepIndex)
    const cellState = isSolved ? 'pending' : stateForDigit(i, currentStepIndex, bringDownIndex)
    const highlightClass =
      isHighlighted && highlightActive ? ' ring-4 ring-astral-sun ring-offset-2 ring-offset-space-bg-soft' : ''
    const inner =
      onDigitSelect && !isSolved ? (
        <button
          type="button"
          onClick={() => onDigitSelect(i)}
          aria-current={isActive ? 'step' : undefined}
          aria-label={`${t('a11y.grid.dividend')} ${digit}`}
          className={`ldg-digit ${stateClass[cellState]} ${highlightClass} cursor-pointer shadow-md shadow-black/20 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun`}
        >
          {digit}
        </button>
      ) : (
        <span className={`ldg-digit ${stateClass[cellState]} ${highlightClass}`} aria-hidden="true">
          {digit}
        </span>
      )
    return (
      <div
        key={`dividend-${i}`}
        className="ldg-cell border-t-4 border-astral-sky/80 pt-1"
        style={{ gridColumn: `${digitStartCol + i}`, gridRow: 2 }}
      >
        {inner}
      </div>
    )
  })

  /** Cifras de un número alineadas a la derecha en la columna `endIndex`, como al escribir en papel. */
  const numberCells = (value: number, endIndex: number, row: number, key: string, className: string) =>
    String(value)
      .split('')
      .reverse()
      .map((digit, offset) => {
        const col = endIndex - offset
        if (col < 0) return null
        return (
          <div
            key={`${key}-${col}`}
            className={`ldg-cell ldg-work ${className}`}
            style={{ gridColumn: `${digitStartCol + col}`, gridRow: row }}
            aria-hidden="true"
          >
            {digit}
          </div>
        )
      })

  const workCells = workSteps.flatMap((step, k) => {
    const productRow = firstWorkRow + k * 2
    const remainderRow = productRow + 1
    const tone = toneClass[step.tone]
    const cells: ReactNode[] = []
    const spoken: string[] = []
    if (step.product !== undefined) {
      cells.push(...numberCells(step.product, step.digitIndex, productRow, `p${k}`, `${tone} border-b-2 border-current`))
      spoken.push(`${t('a11y.grid.product')} ${step.product}`)
    }
    if (step.remainder !== undefined) {
      cells.push(...numberCells(step.remainder, step.digitIndex, remainderRow, `r${k}`, tone))
      spoken.push(`${t('a11y.grid.remainder')} ${step.remainder}`)
    }
    if (step.broughtDown) {
      cells.push(
        <div
          key={`b${k}`}
          className="ldg-cell ldg-work text-astral-sun"
          style={{ gridColumn: `${digitStartCol + step.broughtDown.index}`, gridRow: remainderRow }}
          aria-hidden="true"
        >
          {step.broughtDown.digit}
        </div>,
      )
    }
    if (spoken.length > 0) {
      cells.push(
        <span key={`sr${k}`} className="sr-only" style={{ gridColumn: 1, gridRow: productRow }}>
          {spoken.join(', ')}
        </span>,
      )
    }
    return cells
  })

  return (
    <div className="ldg-grid" style={{ '--ldg-n': n } as CSSProperties}>
      {quotientCells}
      <div className="ldg-cell justify-end pr-1" style={{ gridColumn: 1, gridRow: 2 }}>
        <span className="sr-only">{`${t('a11y.grid.divisor')} ${exercise.divisor}`}</span>
        <span aria-hidden="true" className="flex flex-row items-center gap-0.5 font-display text-3xl font-extrabold text-text-space sm:text-4xl">
          {divisorDigits.map((digit, i) => (
            <span key={i}>{digit}</span>
          ))}
        </span>
      </div>
      <div
        className="border-l-4 border-t-4 border-astral-sky/80"
        style={{ gridColumn: 2, gridRow: `2 / ${lastRow + 1}` }}
        aria-hidden="true"
      />
      {digitCells}
      {!isSolved && variant === 'lesson' && bringDownIndex === undefined
        ? dividendDigits.map((_, i) => (
            <div
              key={`hint-${i}`}
              className="ldg-cell text-astral-sun"
              style={{ gridColumn: `${digitStartCol + i}`, gridRow: hintRow }}
              aria-hidden="true"
            >
              {i === currentStepIndex ? '▲' : ''}
            </div>
          ))
        : null}
      {!isSolved && bringDownIndex !== undefined ? (
        <div
          className="ldg-cell animate-nudge-down text-xl text-astral-sun"
          style={{ gridColumn: `${digitStartCol + bringDownIndex}`, gridRow: hintRow }}
          aria-hidden="true"
        >
          ▼
        </div>
      ) : null}
      {workCells}
      {children ? (
        <div
          className="ldg-cell"
          style={{ gridColumn: `${digitStartCol} / ${digitEndCol + 1}`, gridRow: 1 }}
          aria-label={t('a11y.grid.quotient')}
          role="group"
        >
          <div className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}
