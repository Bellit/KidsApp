import { useEffect, useRef, type ChangeEvent } from 'react'
import { NumberPad } from './NumberPad'

interface DigitInputProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  /** Mensaje de error fijo bajo la caja (null = sin error). */
  error?: string | null
  /** Cambia en cada fallo para repetir la sacudida aunque el mensaje sea igual. */
  errorKey?: number
  maxLength?: number
}

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-5px)' },
  { transform: 'translateX(0)' },
]

/**
 * Caja numérica grande con etiqueta visible y teclado en pantalla, para que un
 * niño vea a la primera dónde escribir sin que el teclado del móvil tape la casita.
 * Tras un fallo, la caja queda en rojo y la siguiente cifra sustituye a la errónea.
 */
export function DigitInput({ id, label, value, onValueChange, error = null, errorKey, maxLength = 3 }: DigitInputProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const errorId = `${id}-error`

  useEffect(() => {
    if (!error || errorKey === undefined) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) boxRef.current?.animate?.(SHAKE, { duration: 350, easing: 'ease-in-out' })
  }, [error, errorKey])

  const setDigits = (next: string) => onValueChange(next.replace(/[^0-9]/g, '').slice(0, maxLength))

  const handleDigit = (digit: string) => setDigits(error ? digit : value + digit)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    // Con error, lo nuevo que se teclea sustituye a la respuesta equivocada.
    setDigits(error && raw.length > value.length && raw.startsWith(value) ? raw.slice(value.length) : raw)
  }

  const boxClass = error
    ? 'border-danger bg-danger/15 text-danger-soft shadow-[0_0_0_5px_rgba(255,120,120,0.18)]'
    : 'border-astral-sky/60 bg-space-bg text-text-space shadow-[0_0_0_5px_rgba(168,200,240,0.14)]'

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <label htmlFor={id} className="font-display text-lg font-extrabold text-astral-sky">
        {label}
      </label>
      <div ref={boxRef}>
        <input
          id={id}
          inputMode="none"
          autoComplete="off"
          placeholder="?"
          value={value}
          onChange={handleChange}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-16 w-32 rounded-2xl border-2 px-3 text-center text-4xl font-extrabold transition-colors placeholder:text-text-space/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun ${boxClass}`}
        />
      </div>
      <p id={errorId} aria-live="polite" className="min-h-6 text-center text-base font-extrabold text-danger-soft">
        {error}
      </p>
      <NumberPad onDigit={handleDigit} onDelete={() => setDigits(error ? '' : value.slice(0, -1))} />
    </div>
  )
}
