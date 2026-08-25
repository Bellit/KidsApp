import type { ChangeEvent } from 'react'

interface DigitInputProps {
  id: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

/** Caja numérica grande con etiqueta visible y lápiz, para que un niño vea a la primera dónde escribir. */
export function DigitInput({ id, label, value, onChange }: DigitInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor={id} className="font-display text-base font-extrabold text-astral-sky">
        {label}
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-astral-sky/70"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder="?"
          value={value}
          onChange={onChange}
          aria-label={label}
          className="min-h-16 w-32 rounded-2xl border-2 border-astral-sky/60 bg-space-bg pl-10 pr-3 text-center text-4xl font-extrabold text-text-space shadow-[0_0_0_5px_rgba(168,200,240,0.14)] transition-shadow placeholder:text-text-space/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun"
        />
      </div>
    </div>
  )
}
