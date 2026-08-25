import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Mascot,
  MedalIcon,
  PlanetCard,
  PLANET_STAGE_ICONS,
  RankBadge,
  SpaceButton,
  StarBadge,
  Toast,
  type PlanetCardState,
  type PlanetColor,
} from '../shared/components'
import { LEVELS } from '../core/progression/levels'
import { localDateString } from '../core/division/generator'
import { useGameStore } from '../shared/store/gameStore'
import { useSound } from '../shared/hooks/useSound'

const LEVEL_COLORS: Record<number, PlanetColor> = {
  1: 'mercury',
  2: 'venus',
  3: 'earth',
  4: 'mars',
  5: 'asteroid',
}

export default function GamesPage() {
  const { t } = useTranslation(['games', 'practice', 'common', 'achievements'])
  const navigate = useNavigate()
  const { play } = useSound()
  const levelProgress = useGameStore((s) => s.levelProgress)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)
  const getTimedTop5 = useGameStore((s) => s.getTimedTop5)
  const lastDailyRewardDate = useGameStore((s) => s.lastDailyRewardDate)
  const achievementsUnlocked = useGameStore((s) => s.profile.achievementsUnlocked)

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  // F4.4: el reto diario se reclama una vez por día local.
  const claimedToday = lastDailyRewardDate === localDateString()
  const hasEarlyBird = achievementsUnlocked.includes('early_bird')

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    window.setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200)
  }

  const handleLevelClick = (levelId: number) => {
    if (!isLevelUnlocked(levelId)) {
      play('incorrect')
      showToast(t('locked', { ns: 'practice' }))
      return
    }
    play('click')
    setSelectedLevel(levelId)
  }

  const playTimed = () => {
    if (selectedLevel === null) return
    play('click')
    navigate(`/games/timed?level=${selectedLevel}`)
  }

  const playDaily = () => {
    play('click')
    navigate('/games/daily')
  }

  const top5 = selectedLevel === null ? [] : getTimedTop5(selectedLevel)
  const bestScore = top5.length > 0 ? top5[0] : null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Mascot pose={claimedToday ? 'idle' : 'wave'} size={52} />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">{t('title')}</h1>
          <p className="mt-1 text-base font-semibold text-text-space/80 sm:text-lg">{t('subtitle')}</p>
        </div>
      </header>

      {/* F4.4: reto diario, tarjeta destacada con premio extra de 5 estrellas. */}
      <section className="rounded-3xl border-2 border-astral-sun/40 bg-gradient-to-br from-astral-sun/10 to-space-bg-soft p-5 shadow-lg shadow-black/20">
        <h2 className="mb-1 font-display text-xl font-extrabold text-astral-sun">{t('daily_title')}</h2>
        <p className="mb-4 text-base font-semibold text-text-space/80">{t('daily_desc')}</p>
        {claimedToday ? (
          <div className="flex flex-col items-center gap-3">
            <p
              aria-live="polite"
              className="rounded-2xl bg-white/10 px-4 py-2 font-display text-lg font-extrabold text-text-space/50"
            >
              {t('daily_completed_today')}
            </p>
            {hasEarlyBird ? (
              <p className="flex items-center gap-2 text-base font-bold text-text-space/70">
                <span className="opacity-70" aria-hidden="true">
                  <MedalIcon earned />
                </span>
                {t('early_bird.name', { ns: 'achievements' })}
              </p>
            ) : null}
            <SpaceButton disabled>{t('daily_play')}</SpaceButton>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <SpaceButton onClick={playDaily}>{t('daily_play')}</SpaceButton>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-space-bg-soft p-5 shadow-lg shadow-black/20">
        <h2 className="mb-1 font-display text-xl font-extrabold text-astral-sun">{t('timed_title')}</h2>
        <p className="mb-4 text-base font-semibold text-text-space/80">{t('timed_desc')}</p>

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
                      name={t(level.i18nKey, { ns: 'practice' })}
                      description={t(level.descriptionKey, { ns: 'practice' })}
                      state={state}
                      onClick={() => handleLevelClick(level.id)}
                    />
                    <StarBadge count={bestStars} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLevelClick(level.id)}
                    aria-label={`${t(level.i18nKey, { ns: 'practice' })}, ${t('ui.locked')}`}
                    className="flex w-full cursor-pointer flex-col items-center gap-2"
                  >
                    <PlanetCard
                      color={LEVEL_COLORS[level.id]}
                      icon={PLANET_STAGE_ICONS[LEVEL_COLORS[level.id]]}
                      name={t(level.i18nKey, { ns: 'practice' })}
                      description={t(level.descriptionKey, { ns: 'practice' })}
                      state="locked"
                    />
                    <StarBadge count={0} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <SpaceButton onClick={playTimed} disabled={selectedLevel === null}>
            {t('play_timed')}
          </SpaceButton>
        </div>
        {selectedLevel === null ? (
          <p className="mt-3 text-center text-sm font-bold text-text-space/60">{t('select_level_hint')}</p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-space-bg-soft p-5 shadow-lg shadow-black/20">
        <h2 className="mb-1 font-display text-xl font-extrabold text-astral-sky">{t('top_scores')}</h2>
        {bestScore !== null ? (
          <p className="mb-3 text-base font-bold text-astral-sun">
            {t('best_score')}: {bestScore}
          </p>
        ) : null}
        {selectedLevel === null ? (
          <p className="text-base font-semibold text-text-space/70">{t('select_level_hint')}</p>
        ) : top5.length === 0 ? (
          <p className="text-base font-semibold text-text-space/70">{t('no_scores')}</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {top5.map((score, index) => (
              <li
                key={`${index}-${score}`}
                className="flex items-center gap-3 rounded-2xl bg-space-bg px-4 py-3"
              >
                <RankBadge rank={index + 1} />
                <span className="flex-1" />
                <span className="font-display text-xl font-extrabold text-astral-sun">{score}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Toast message={toast.message} variant="info" visible={toast.visible} />
    </div>
  )
}
