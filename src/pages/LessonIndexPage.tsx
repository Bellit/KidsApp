import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Mascot, PlanetOrb, PLANET_STAGE_ICONS, type PlanetColor } from '../shared/components'
import { LESSONS, LESSON_IDS } from '../features/lessons/content'
import { useGameStore } from '../shared/store/gameStore'

const PLANET_BY_LESSON: Record<number, PlanetColor> = {
  1: 'mercury',
  2: 'venus',
  3: 'earth',
  4: 'mars',
  5: 'asteroid',
}

export default function LessonIndexPage() {
  const { t } = useTranslation(['lessons', 'common'])
  const lessonsCompleted = useGameStore((s) => s.lessonsCompleted)
  const nextId = LESSON_IDS.find((id) => !lessonsCompleted.includes(id))

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Mascot pose="idle" size={52} />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-astral-sky sm:text-3xl">{t('nav.lessons')}</h1>
          <p className="mt-1 text-base font-semibold text-text-space/80 sm:text-lg">{t('index.subtitle')}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-3">
        {LESSON_IDS.map((id, index) => {
          const lesson = LESSONS[id]
          const color = PLANET_BY_LESSON[id]
          const name = t(lesson.titleKey)
          const done = lessonsCompleted.includes(id)
          const isNext = id === nextId
          const status = done ? t('index.completed') : isNext ? t('index.start_here') : null
          return (
            <li key={id}>
              <NavLink
                to={`/lessons/${id}`}
                aria-label={status ? `${name}, ${status}` : name}
                className={`group flex items-center gap-4 rounded-3xl border bg-space-bg-soft ${isNext ? 'border-astral-sun/70 ring-2 ring-astral-sun/40' : 'border-white/10'} p-3 shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun sm:p-4`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                    done ? 'bg-success-soft text-success' : 'bg-white/10 text-text-space/70'
                  }`}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <PlanetOrb color={color} icon={PLANET_STAGE_ICONS[color]} className="h-14 w-14 shrink-0" iconClassName="h-6 w-6" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-extrabold text-text-space sm:text-lg">{name}</span>
                    {isNext ? (
                      <span className="rounded-full bg-astral-sun px-2 py-0.5 text-sm font-extrabold text-text-ink">{status}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-text-space/70">
                    {t(lesson.descriptionKey)}
                  </span>
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 text-text-space/40 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </NavLink>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
