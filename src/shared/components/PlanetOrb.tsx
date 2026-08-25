import type { ReactNode } from 'react'
import type { PlanetColor, PlanetIconName } from './PlanetCard'

export const PLANET_CLASS: Record<PlanetColor, string> = {
  mercury: 'bg-planet-mercury',
  venus: 'bg-planet-venus',
  earth: 'bg-planet-earth',
  mars: 'bg-planet-mars',
  asteroid: 'bg-asteroid',
}

export const PLANET_GLOW: Record<PlanetColor, string> = {
  mercury: 'shadow-[0_0_18px_2px_rgba(246,214,168,0.45)]',
  venus: 'shadow-[0_0_18px_2px_rgba(255,217,232,0.45)]',
  earth: 'shadow-[0_0_18px_2px_rgba(191,227,255,0.45)]',
  mars: 'shadow-[0_0_18px_2px_rgba(255,207,196,0.45)]',
  asteroid: 'shadow-[0_0_18px_2px_rgba(230,216,255,0.45)]',
}

export const PLANET_FLOAT_DELAY: Record<PlanetColor, string> = {
  mercury: '0s',
  venus: '-0.6s',
  earth: '-1.2s',
  mars: '-1.8s',
  asteroid: '-2.4s',
}

/** Trazos de icono compartidos por las esferas-planeta (mismo estilo en toda la app). */
export const PLANET_ICON_PATHS: Record<PlanetIconName, ReactNode> = {
  star: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />,
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  medal: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
}

interface PlanetOrbProps {
  color: PlanetColor
  icon?: PlanetIconName
  locked?: boolean
  /** Clases de tamaño (ancho/alto) del contenedor, p. ej. "h-16 w-16 sm:h-20 sm:w-20". */
  className?: string
  /** Clases de tamaño del icono interior. */
  iconClassName?: string
}

/** Esfera de planeta con brillo/flotación, reutilizada en tarjetas, mapas y chips. */
export function PlanetOrb({ color, icon, locked = false, className = 'h-16 w-16', iconClassName = 'h-7 w-7' }: PlanetOrbProps) {
  return (
    <span
      className={`relative block ${locked ? 'opacity-60 saturate-50' : 'animate-float'} ${className}`}
      style={{ animationDelay: PLANET_FLOAT_DELAY[color] }}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full ring-4 ring-white/20 ${PLANET_CLASS[color]} ${locked ? 'shadow-lg shadow-black/30' : PLANET_GLOW[color]}`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.7),rgba(255,255,255,0)_55%)]"
      />
      <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_-10px_16px_rgba(27,42,74,0.35)]" />
      {icon ? (
        <span className="absolute inset-0 flex items-center justify-center text-text-ink">
          <svg
            viewBox="0 0 24 24"
            className={iconClassName}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            {PLANET_ICON_PATHS[icon]}
          </svg>
        </span>
      ) : null}
    </span>
  )
}
