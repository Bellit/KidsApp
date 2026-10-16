import type { PlanetColor, PlanetIconName } from './planetTokens'
import { PLANET_CLASS, PLANET_FLOAT_DELAY, PLANET_GLOW, PLANET_ICON_PATHS } from './planetTokens'
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
export function PlanetOrb({
  color,
  icon,
  locked = false,
  className = 'h-16 w-16',
  iconClassName = 'h-7 w-7',
}: PlanetOrbProps) {
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
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full shadow-[inset_0_-10px_16px_rgba(27,42,74,0.35)]"
      />
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
