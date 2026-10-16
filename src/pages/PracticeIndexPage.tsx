import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LevelLaunchModal,
  PlanetCard,
  PLANET_STAGE_ICONS,
  StarBadge,
  Toast,
  type PlanetCardState,
  type PlanetColor,
} from '../shared/components'
import { LEVELS } from '../core/progression/levels'
import { useGameStore } from '../shared/store/gameStore'
import { useSound } from '../shared/hooks/useSound'

const EXERCISE_COUNTS = [5, 10, 15] as const

const LEVEL_COLORS: Record<number, PlanetColor> = {
  1: 'mercury',
  2: 'venus',
  3: 'earth',
  4: 'mars',
  5: 'asteroid',
}

export default function PracticeIndexPage() {
  const { t } = useTranslation(['practice', 'common'])
  const navigate = useNavigate()
  const { play } = useSound()
  const levelProgress = useGameStore((s) => s.levelProgress)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [count, setCount] = useState<number>(5)
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    window.setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200)
  }

  const handleLevelClick = (levelId: number) => {
    if (!isLevelUnlocked(levelId)) {
      play('incorrect')
      showToast(t('locked'))
      return
    }
    play('click')
    setSelectedLevel(levelId)
  }

  const startSession = () => {
    if (selectedLevel === null) return
    navigate(`/practice/${selectedLevel}?count=${count}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('title')}</h1>
        <p className="mt-1 text-lg font-semibold text-text-space/80">{t('subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level.id)
          const bestStars = levelProgress[String(level.id)]?.bestStars ?? 0
          const selected = selectedLevel === level.id
          const state: PlanetCardState = !unlocked ? 'locked' : bestStars > 0 ? 'completed' : 'active'

          return (
            <div
              key={level.id}
              className={`rounded-3xl p-1 transition ${selected ? 'bg-astral-sun/30 ring-2 ring-astral-sun' : ''}`}
            >
              {unlocked ? (
                <div className="flex flex-col items-center gap-2">
                  <PlanetCard
                    color={LEVEL_COLORS[level.id]}
                    icon={PLANET_STAGE_ICONS[LEVEL_COLORS[level.id]]}
                    name={t(level.i18nKey)}
                    description={t(level.descriptionKey)}
                    state={state}
                    onClick={() => handleLevelClick(level.id)}
                  />
                  <StarBadge count={bestStars} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleLevelClick(level.id)}
                  aria-label={`${t(level.i18nKey)}, ${t('ui.locked')}`}
                  className="flex w-full cursor-pointer flex-col items-center gap-2"
                >
                  <PlanetCard
                    color={LEVEL_COLORS[level.id]}
                    icon={PLANET_STAGE_ICONS[LEVEL_COLORS[level.id]]}
                    name={t(level.i18nKey)}
                    description={t(level.descriptionKey)}
                    state="locked"
                  />
                  <StarBadge count={0} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {selectedLevel !== null ? (
        <LevelLaunchModal
          open
          onClose={() => setSelectedLevel(null)}
          color={LEVEL_COLORS[selectedLevel]}
          name={t(`level_name_${selectedLevel}`)}
          description={t(`level_desc_${selectedLevel}`)}
          launchLabel={t('launch')}
          onLaunch={startSession}
        >
          <h3 className="font-display text-lg font-extrabold">{t('exercises_count')}</h3>
          <div role="group" aria-label={t('exercises_count')} className="flex gap-3">
            {EXERCISE_COUNTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  play('click')
                  setCount(option)
                }}
                aria-pressed={count === option}
                className={`h-14 w-16 rounded-2xl font-display text-xl font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-ink ${
                  count === option
                    ? 'bg-text-ink text-space-surface shadow-md'
                    : 'border-2 border-text-ink/30 bg-transparent text-text-ink hover:bg-text-ink/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </LevelLaunchModal>
      ) : null}

      <Toast message={toast.message} variant="info" visible={toast.visible} />
    </div>
  )
}
