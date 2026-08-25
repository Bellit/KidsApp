import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PlanetOrb } from './PlanetOrb'

export type PlanetColor = 'mercury' | 'venus' | 'earth' | 'mars' | 'asteroid'
export type PlanetCardState = 'locked' | 'active' | 'completed'
export type PlanetIconName = 'star' | 'book' | 'pencil' | 'rocket' | 'medal' | 'gear'

/** Icono de etapa por planeta (progresión de dificultad) para tarjetas de nivel. */
export const PLANET_STAGE_ICONS: Record<PlanetColor, PlanetIconName> = {
  mercury: 'star',
  venus: 'pencil',
  earth: 'book',
  mars: 'rocket',
  asteroid: 'medal',
}

interface PlanetCardProps {
  color: PlanetColor
  name: string
  description?: string
  state: PlanetCardState
  to?: string
  onClick?: () => void
  icon?: PlanetIconName
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function PlanetCard({ color, name, description, state, to, onClick, icon }: PlanetCardProps) {
  const { t } = useTranslation()
  const locked = state === 'locked'
  const completed = state === 'completed'

  const ariaLabel =
    state === 'locked'
      ? `${name}, ${t('ui.locked')}`
      : state === 'completed'
        ? `${name}, ${t('ui.completed')}`
        : name

  const content = (
    <>
      <span className="relative mb-3 flex justify-center">
        <PlanetOrb
          color={color}
          icon={icon}
          locked={locked}
          className="h-16 w-16 sm:h-20 sm:w-20"
          iconClassName="h-7 w-7 sm:h-8 sm:w-8"
        />
        {locked || completed ? (
          <span
            className={`absolute -right-1.5 -top-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold ${
              locked ? 'bg-space-bg text-text-space border border-white/25' : 'bg-success text-white'
            }`}
          >
            {locked ? <LockIcon /> : <CheckIcon />}
            {locked ? t('ui.locked') : t('ui.completed')}
          </span>
        ) : null}
      </span>
      <span className="font-display text-base font-extrabold sm:text-lg">{name}</span>
      {description ? (
        <span className="mt-1 block text-xs font-semibold leading-snug text-text-space/70 sm:text-sm">{description}</span>
      ) : null}
    </>
  )

  const baseClass =
    'block rounded-3xl border border-white/10 bg-space-bg-soft p-4 text-center shadow-lg shadow-black/20 transition-transform'

  if (locked) {
    return (
      <div className={`${baseClass} opacity-80`}>
        {content}
      </div>
    )
  }

  if (to) {
    return (
      <NavLink to={to} aria-label={ariaLabel} className={`${baseClass} hover:z-10 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun`}>
        {content}
      </NavLink>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClass} hover:z-10 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun`}
    >
      {content}
    </button>
  )
}