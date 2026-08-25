import { useTranslation } from 'react-i18next'

export type OperationKind = 'quotient' | 'product' | 'remainder' | 'broughtDown'

interface OperationCardProps {
  kind: OperationKind
  /** números para la operación */
  divisor?: number
  currentNumber?: number
  quotientDigit?: number
  product?: number
}

interface EquationPart {
  value: string | number
  operator?: boolean
  highlighted?: boolean
}

const OP_KEY: Record<OperationKind, string> = {
  quotient: 'op_quotient',
  product: 'op_product',
  remainder: 'op_remainder',
  broughtDown: 'op_bring_down',
}

function Operator({ children }: { children: string }) {
  return <span className="font-display text-3xl font-extrabold text-text-space/70 sm:text-4xl">{children}</span>
}

function NumberBox({ value, highlighted = false }: { value: string | number; highlighted?: boolean }) {
  return (
    <span
      className={`flex min-h-16 min-w-14 items-center justify-center rounded-2xl border-2 px-3 py-2 font-display text-4xl font-extrabold sm:min-h-20 sm:min-w-16 sm:text-5xl ${
        highlighted
          ? 'border-astral-sun bg-astral-sun/20 text-astral-sun'
          : 'border-astral-sky/40 bg-space-bg-soft text-text-space'
      }`}
    >
      {value}
    </span>
  )
}

/** Tarjeta grande con la operación concreta que el niño debe resolver. */
export function OperationCard({
  kind,
  divisor,
  currentNumber,
  quotientDigit,
  product,
}: OperationCardProps) {
  const { t } = useTranslation('practice')

  const showPartial = (kind === 'quotient' || kind === 'remainder') && currentNumber !== undefined

  const equation: EquationPart[] =
    kind === 'quotient' && currentNumber !== undefined && divisor !== undefined
      ? [
          { value: currentNumber, highlighted: true },
          { value: '÷', operator: true },
          { value: divisor },
          { value: '=', operator: true },
          { value: '?', highlighted: true },
        ]
      : kind === 'product' && quotientDigit !== undefined && divisor !== undefined
        ? [
            { value: quotientDigit },
            { value: '×', operator: true },
            { value: divisor },
            { value: '=', operator: true },
            { value: '?', highlighted: true },
          ]
        : kind === 'remainder' && currentNumber !== undefined && product !== undefined
          ? [
              { value: currentNumber, highlighted: true },
              { value: '−', operator: true },
              { value: product },
              { value: '=', operator: true },
              { value: '?', highlighted: true },
            ]
          : []

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-space-bg p-5 shadow-lg shadow-black/20">
      {showPartial ? (
        <p className="text-sm font-extrabold uppercase tracking-wide text-astral-sky">
          {t('partial_number', { number: currentNumber })}
        </p>
      ) : null}
      <p className="text-lg font-bold leading-snug text-text-space sm:text-xl">
        {t(OP_KEY[kind], { divisor, currentNumber, quotientDigit, product })}
      </p>
      {kind === 'broughtDown' ? (
        <div className="flex justify-center pt-1" aria-hidden="true">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-astral-sun/15 font-display text-5xl font-extrabold text-astral-sun">
            ▼
          </span>
        </div>
      ) : equation.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {equation.map((part, i) =>
            part.operator ? (
              <Operator key={i}>{String(part.value)}</Operator>
            ) : (
              <NumberBox key={i} value={part.value} highlighted={part.highlighted} />
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}