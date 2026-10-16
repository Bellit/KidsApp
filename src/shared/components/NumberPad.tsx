import { useTranslation } from 'react-i18next'

interface NumberPadProps {
  onDigit: (digit: string) => void
  onDelete: () => void
}

const ROWS = [
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '0'],
]

const KEY_CLASS =
  'flex h-14 items-center justify-center rounded-2xl font-display text-2xl font-extrabold shadow-md shadow-black/20 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun'

/** Teclado numérico en pantalla: evita que el teclado del móvil tape la casita. */
export function NumberPad({ onDigit, onDelete }: NumberPadProps) {
  const { t } = useTranslation('practice')
  return (
    <div className="grid w-full max-w-xs grid-cols-6 gap-2" role="group" aria-label={t('number_pad')}>
      {ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className={`${KEY_CLASS} bg-space-bg text-text-space ring-1 ring-astral-sky/40 hover:bg-white/10 ${
            digit === '1' || digit === '6' ? 'col-start-1' : ''
          }`}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('delete')}
        className={`${KEY_CLASS} col-start-6 row-span-2 row-start-1 h-auto bg-planet-venus text-text-ink hover:bg-astral-rose`}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <path d="M18 9l-6 6M12 9l6 6" />
        </svg>
      </button>
    </div>
  )
}
