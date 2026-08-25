import { useMemo, type ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Mascot } from '../shared/components'
import { mulberry32 } from '../shared/utils/random'
import '../styles/stars.css'

interface Star {
  left: number
  top: number
  size: number
  duration: number
  delay: number
}

const STAR_COUNT = 40

function buildStars(): Star[] {
  const rand = mulberry32(7)
  return Array.from({ length: STAR_COUNT }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 2.5,
    duration: 2 + rand() * 3,
    delay: rand() * 3,
  }))
}

type NodeColor = 'mercury' | 'venus' | 'earth' | 'mars' | 'asteroid'

interface MissionNode {
  to: string
  color: NodeColor
  nameKey: string
  /** Posición y tamaño en % dentro del mapa (base de diseño 390×540). */
  left: number
  top: number
  width: number
  height: number
}

const NODE_GRADIENT: Record<NodeColor, string> = {
  mercury: 'linear-gradient(160deg,#ffe9c2,#f3a94f)',
  venus: 'linear-gradient(160deg,#ffe0ef,#ff8fc7)',
  earth: 'linear-gradient(160deg,#d8f0ff,#4fb3f5)',
  mars: 'linear-gradient(160deg,#ffd9cc,#ff7a56)',
  asteroid: 'linear-gradient(160deg,#ece2ff,#9b7bf0)',
}

const NODE_GLOW: Record<NodeColor, string> = {
  mercury: '0 10px 22px rgba(0,0,0,.35), 0 0 22px rgba(243,169,79,.4)',
  venus: '0 10px 22px rgba(0,0,0,.35), 0 0 22px rgba(255,143,199,.4)',
  earth: '0 10px 22px rgba(0,0,0,.35), 0 0 24px rgba(79,179,245,.45)',
  mars: '0 10px 22px rgba(0,0,0,.35), 0 0 22px rgba(255,122,86,.4)',
  asteroid: '0 10px 22px rgba(0,0,0,.35), 0 0 22px rgba(155,123,240,.4)',
}

const NODE_ICON: Record<NodeColor, ReactNode> = {
  mercury: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  venus: (
    <>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
    </>
  ),
  earth: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  mars: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  asteroid: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
}

/** Posiciones del mapa de misión, diseñadas sobre un lienzo base de 390×540. */
const NODES: MissionNode[] = [
  { to: '/lessons', color: 'mercury', nameKey: 'nav.lessons', left: 12.3, top: 0, width: 21.5, height: 15.6 },
  { to: '/practice', color: 'earth', nameKey: 'nav.practice', left: 59.0, top: 19.3, width: 21.5, height: 15.6 },
  { to: '/games', color: 'mars', nameKey: 'nav.games', left: 12.3, top: 42.6, width: 21.5, height: 15.6 },
  { to: '/profile', color: 'venus', nameKey: 'nav.profile', left: 59.0, top: 48.9, width: 21.5, height: 15.6 },
  { to: '/settings', color: 'asteroid', nameKey: 'nav.settings', left: 38.0, top: 73.7, width: 16.9, height: 12.2 },
]

const TRAIL_PATH =
  'M90,42 C 210,78 255,108 272,146 C 235,192 105,218 90,272 C 74,318 255,288 272,306 C 232,350 195,392 181,431'

export default function HomePage() {
  const { t } = useTranslation()
  const stars = useMemo(buildStars, [])

  return (
    <section className="relative rounded-3xl">
      <div className="star-field rounded-3xl" aria-hidden="true">
        {stars.map((star, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col gap-6">
        <header className="flex items-end gap-4">
          <Mascot pose="wave" size={56} />
          <div className="relative flex-1 rounded-3xl border border-white/15 bg-space-bg-soft p-4 shadow-lg shadow-black/20">
            <span
              aria-hidden="true"
              className="absolute -left-[9px] bottom-6 h-0 w-0 border-y-[9px] border-r-[9px] border-y-transparent border-r-white/15"
            />
            <span
              aria-hidden="true"
              className="absolute -left-2 bottom-[26px] h-0 w-0 border-y-[7px] border-r-[8px] border-y-transparent border-r-space-bg-soft"
            />
            <h1 className="font-display text-xl font-extrabold text-text-space sm:text-2xl">{t('app.greeting')}</h1>
            <p className="mt-1 text-sm font-bold text-text-space/80 sm:text-base">{t('home.subtitle')}</p>
          </div>
        </header>

        <div className="relative mx-auto w-full max-w-[420px]" style={{ aspectRatio: '390 / 540' }}>
          <svg
            viewBox="0 0 390 540"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="home-trail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe4a8" />
                <stop offset="50%" stopColor="#a8c8f0" />
                <stop offset="100%" stopColor="#d5c3ff" />
              </linearGradient>
            </defs>
            <path
              d={TRAIL_PATH}
              fill="none"
              stroke="url(#home-trail)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="1 16"
              opacity=".8"
            />
          </svg>

          {NODES.map((node) => (
            <NavLink
              key={node.to}
              to={node.to}
              className="group absolute flex flex-col items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-astral-sun"
              style={{ left: `${node.left}%`, top: `${node.top}%`, width: `${node.width}%` }}
            >
              <span
                className="relative block w-full animate-float transition-transform group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95"
                style={{ aspectRatio: '1 / 1' }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full ring-4 ring-white/20"
                  style={{ background: NODE_GRADIENT[node.color], boxShadow: NODE_GLOW[node.color] }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,.75), rgba(255,255,255,0) 55%)',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: 'inset 0 -10px 16px rgba(27,42,74,.35)' }}
                />
                <span className="absolute inset-0 flex items-center justify-center p-[22%] text-text-ink">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-full w-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    {NODE_ICON[node.color]}
                  </svg>
                </span>
              </span>
              <span className="font-display text-sm font-extrabold text-text-space sm:text-base">{t(node.nameKey)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  )
}
