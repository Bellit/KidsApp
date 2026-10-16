import { useMemo } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Mascot } from '../shared/components'
import { SectionIcon } from '../shared/components/SectionIcon'
import type { SectionId } from '../shared/components/sectionIcons'
import { LESSONS, LESSON_IDS } from '../features/lessons/content'
import { LEVELS } from '../core/progression/levels'
import { useGameStore } from '../shared/store/gameStore'
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
  section: SectionId
  color: NodeColor
  nameKey: string
  /** Posición y tamaño en % dentro del mapa (base de diseño 390×420). */
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

/**
 * Posiciones del mapa de misión, diseñadas sobre un lienzo base de 390×420.
 * Ajustes no está en el mapa: ya tiene su engranaje fijo en la cabecera.
 */
const NODES: MissionNode[] = [
  { to: '/lessons', section: 'lessons', color: 'mercury', nameKey: 'nav.lessons', left: 12.3, top: 0, width: 21.5, height: 20 },
  { to: '/practice', section: 'practice', color: 'earth', nameKey: 'nav.practice', left: 59.0, top: 24.8, width: 21.5, height: 20 },
  { to: '/games', section: 'games', color: 'mars', nameKey: 'nav.games', left: 12.3, top: 54.8, width: 21.5, height: 20 },
  { to: '/profile', section: 'profile', color: 'venus', nameKey: 'nav.profile', left: 59.0, top: 62.9, width: 21.5, height: 20 },
]

const TRAIL_PATH = 'M90,42 C 210,78 255,108 272,146 C 235,192 105,218 90,272 C 74,318 255,288 272,306'

const ARROW_PATH = 'M5 12h14M13 6l6 6-6 6'

/** Siguiente paso recomendado: la primera lección sin terminar o, si ya están todas, el nivel más alto abierto. */
function useNextMission() {
  const { t } = useTranslation(['common', 'lessons', 'practice'])
  const lessonsCompleted = useGameStore((s) => s.lessonsCompleted)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)
  // Suscripción explícita: el nivel abierto cambia cuando cambia el progreso.
  useGameStore((s) => s.levelProgress)

  const nextLessonIndex = LESSON_IDS.findIndex((id) => !lessonsCompleted.includes(id))
  if (nextLessonIndex >= 0) {
    const id = LESSON_IDS[nextLessonIndex]
    return {
      to: `/lessons/${id}`,
      label: t('home.next_lesson', { number: nextLessonIndex + 1, name: t(LESSONS[id].titleKey, { ns: 'lessons' }) }),
    }
  }
  const level = [...LEVELS].reverse().find((candidate) => isLevelUnlocked(candidate.id)) ?? LEVELS[0]
  return {
    to: `/practice/${level.id}?count=5`,
    label: t('home.next_level', { planet: t(level.i18nKey, { ns: 'practice' }) }),
  }
}

export default function HomePage() {
  const { t } = useTranslation()
  const stars = useMemo(buildStars, [])
  const next = useNextMission()
  const lessonsDone = useGameStore((s) => s.lessonsCompleted.length)
  const totalStars = useGameStore((s) => s.profile.totalStars)
  const badges: Partial<Record<SectionId, string>> = {
    lessons: `${lessonsDone}/${LESSON_IDS.length}`,
    practice: `★ ${totalStars}`,
  }

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

        <NavLink
          to={next.to}
          className="group flex items-center gap-3 rounded-3xl bg-astral-sun px-5 py-4 text-text-ink shadow-lg shadow-black/30 transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-astral-sun"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-display text-2xl font-extrabold leading-tight">{t('home.continue')}</span>
            <span className="block truncate text-base font-bold text-text-ink/75">{next.label}</span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-text-ink text-astral-sun transition-transform group-hover:translate-x-1">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d={ARROW_PATH} />
            </svg>
          </span>
        </NavLink>

        <div className="relative mx-auto w-full max-w-[420px]" style={{ aspectRatio: '390 / 420' }}>
          <svg
            viewBox="0 0 390 420"
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
                  <SectionIcon id={node.section} className="h-full w-full" />
                </span>
                {badges[node.section] ? (
                  <span className="absolute -right-3 -top-1 rounded-full bg-text-ink px-2 py-0.5 font-display text-sm font-extrabold text-astral-sun shadow-md shadow-black/30">
                    {badges[node.section]}
                  </span>
                ) : null}
              </span>
              <span className="font-display text-sm font-extrabold text-text-space sm:text-base">{t(node.nameKey)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  )
}
