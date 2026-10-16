import { SpaceButton } from './SpaceButton'

interface HintButtonProps {
  label: string
  used: number
  max: number
  onClick: () => void
}

const BULB = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <path d="M9 18h6M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.74V16h8v-1.26A7 7 0 0 0 12 2z" />
  </svg>
)

/** Botón "Pista" con bombilla y las pistas que quedan, para que el niño sepa cuántas puede pedir. */
export function HintButton({ label, used, max, onClick }: HintButtonProps) {
  const left = Math.max(0, max - used)
  return (
    <SpaceButton type="button" variant="ghost" onClick={onClick} disabled={left === 0} icon={BULB} aria-label={`${label} ${left}/${max}`}>
      {label}
      <span aria-hidden="true" className="rounded-full bg-astral-sun px-2 text-base text-text-ink">
        {left}/{max}
      </span>
    </SpaceButton>
  )
}
