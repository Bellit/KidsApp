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
  /** producto resuelto del paso actual → fila de restos bajo el dígito activo */
  currentProduct?: number
  /** resto resuelto del paso actual → fila de restos siguiente */
  currentRemainder?: number
  /** índice del dígito que el niño debe bajar (muestra flecha ▼) */
  bringDownIndex?: number
  /** pasos resueltos → modo "solución": muestra productos y restos de todos los pasos */
  solvedSteps?: DivisionStep[]
  children?: ReactNode
}

const stateClass: Record<CellState, string> = {
  pending: 'border border-white/20 bg-transparent text-text-space/80',
  active: 'bg-astral-sun text-text-ink animate-pulse',
  correct: 'bg-success-soft text-success',
  incorrect: 'bg-danger-soft text-danger',
}

function stateForDigit(index: number, current: number | undefined): CellState {
  if (current === undefined) return 'pending'
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

  // En modo solución: índice de dígito → paso que muestra su producto y resto.
  const solvedStepByDigit = useMemo(() => {
    if (!solvedSteps) return null
    const map = new Map<number, DivisionStep>()
    for (const step of solvedSteps) {
      map.set(step.digitIndex, step)
    }
    return map
  }, [solvedSteps])

  const n = dividendDigits.length
  const digitStartCol = 3
  const digitEndCol = 2 + n
  const hintRow = 3
  const firstRemainderRow = 4
  const lastRow = firstRemainderRow + n - 1

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
    const cellState = isSolved ? 'pending' : stateForDigit(i, currentStepIndex)
    const highlightClass =
      isHighlighted && highlightActive ? ' ring-4 ring-astral-sun ring-offset-2 ring-offset-space-bg-soft' : ''
    const inner = onDigitSelect && !isSolved ? (
      <button
        type="button"
        onClick={() => onDigitSelect(i)}
        aria-current={isActive ? 'step' : undefined}
        aria-label={`${t('a11y.grid.dividend')} ${digit}`}
        className={`ldg-digit ${stateClass[cellState]} ${highlightClass} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun`}
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
        className="ldg-cell border-t-4 border-astral-sky/80"
        style={{ gridColumn: `${digitStartCol + i}`, gridRow: 2 }}
      >
        {inner}
      </div>
    )
  })

  const remainderCells = Array.from({ length: n }, (_, row) =>
    dividendDigits.map((_, i) => {
      // Modo solución: cada columna muestra el producto y resto de su paso.
      if (isSolved) {
        const step = solvedStepByDigit?.get(i)
        const shown =
          step !== undefined && row === 0
            ? String(step.product)
            : step !== undefined && row === 1
              ? String(step.partialRemainder)
              : ''
        const cellClass = shown
          ? 'ldg-cell rounded-lg border-2 border-success/50 bg-success-soft font-display text-2xl font-extrabold text-success'
          : 'ldg-cell'
        return (
          <div
            key={`remainder-${row}-${i}`}
            role="text"
            className={cellClass}
            style={{ gridColumn: `${digitStartCol + i}`, gridRow: firstRemainderRow + row }}
            aria-label={shown !== '' ? t('a11y.grid.remainder') : undefined}
          >
            {shown}
          </div>
        )
      }
      // El producto y el resto resueltos se anclan bajo el dígito activo del paso.
      const isActiveCol = i === currentStepIndex
      const shown =
        isActiveCol && row === 0 && currentProduct !== undefined
          ? String(currentProduct)
          : isActiveCol && row === 1 && currentRemainder !== undefined
            ? String(currentRemainder)
            : ''
      const cellClass = shown
        ? 'ldg-cell rounded-lg border-2 border-success/50 bg-success-soft font-display text-2xl font-extrabold text-success'
        : isActiveCol
          ? 'ldg-cell rounded-lg bg-astral-sun/10'
          : 'ldg-cell'
      return (
        <div
          key={`remainder-${row}-${i}`}
          role="text"
          className={cellClass}
          style={{ gridColumn: `${digitStartCol + i}`, gridRow: firstRemainderRow + row }}
          aria-label={shown !== '' ? t('a11y.grid.remainder') : undefined}
        >
          {shown}
        </div>
      )
    }),
  )

  return (
    <div className="ldg-grid" style={{ '--ldg-n': n } as CSSProperties}>
      {quotientCells}
      <div
        role="text"
        className="ldg-cell pr-1"
        style={{ gridColumn: 1, gridRow: 2 }}
        aria-label={t('a11y.grid.divisor')}
      >
        <span className="flex flex-row items-center justify-end gap-1 font-display text-2xl font-extrabold text-text-space sm:text-4xl">
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
      {!isSolved && variant === 'lesson'
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
      {!isSolved && bringDownIndex !== undefined
        ? dividendDigits.map((_, i) => (
            <div
              key={`bring-down-${i}`}
              className="ldg-cell text-astral-sun"
              style={{ gridColumn: `${digitStartCol + i}`, gridRow: hintRow }}
              aria-hidden="true"
            >
              {i === bringDownIndex ? '▼' : ''}
            </div>
          ))
        : null}
      {remainderCells}
      {children ? (
        <div
          role="text"
          className="ldg-cell"
          style={{ gridColumn: `${digitStartCol} / ${digitEndCol + 1}`, gridRow: 1 }}
          aria-label={t('a11y.grid.quotient')}
        >
          <div className="grid w-full gap-0.5" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}