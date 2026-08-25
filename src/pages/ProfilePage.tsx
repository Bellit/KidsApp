import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ACHIEVEMENTS, type Achievement } from '../core/achievements/definitions'
import { LEVELS } from '../core/progression/levels'
import { Mascot, MedalIcon, StarBadge, Toast } from '../shared/components'
import { useGameStore } from '../shared/store/gameStore'

type StatName = 'star' | 'pencil' | 'rocket' | 'medal'

const STAT_ICON_PATHS: Record<StatName, ReactNode> = {
  star: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />,
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  medal: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
}

const STAT_TILE_GRADIENT: Record<StatName, string> = {
  star: 'linear-gradient(160deg,#ffe9c2,#f3a94f)',
  pencil: 'linear-gradient(160deg,#ffe0ef,#ff8fc7)',
  rocket: 'linear-gradient(160deg,#ffd9cc,#ff7a56)',
  medal: 'linear-gradient(160deg,#ece2ff,#9b7bf0)',
}

const STAT_TILE_GLOW: Record<StatName, string> = {
  star: '#ffd166',
  pencil: '#ff8fc7',
  rocket: '#ff7a56',
  medal: '#9b7bf0',
}

function StatTile({ name, label, value }: { name: StatName; label: string; value: ReactNode }) {
  return (
    <div
      role="listitem"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-space-bg-soft p-4 shadow-lg shadow-black/20"
    >
      <span
        aria-hidden="true"
        className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[11px] text-text-ink"
        style={{ background: STAT_TILE_GRADIENT[name] }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {STAT_ICON_PATHS[name]}
        </svg>
      </span>
      <p className="font-display text-2xl font-extrabold leading-none text-text-space">{value}</p>
      <p className="mt-1 text-xs font-bold text-text-space/60">{label}</p>
      <span
        aria-hidden="true"
        className="absolute inset-x-4 bottom-0 h-[3px] rounded-full"
        style={{ background: STAT_TILE_GLOW[name], boxShadow: `0 0 10px ${STAT_TILE_GLOW[name]}` }}
      />
    </div>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'achievements', 'common'])
  const profile = useGameStore((s) => s.profile)
  const levelProgress = useGameStore((s) => s.levelProgress)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)
  const resetProgress = useGameStore((s) => s.resetProgress)

  const [activeMedal, setActiveMedal] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const earnedIds = new Set(profile.achievementsUnlocked)
  const unlockedLevels = LEVELS.filter((level) => isLevelUnlocked(level.id)).length

  const showResetToast = () => {
    setToastVisible(true)
    window.setTimeout(() => setToastVisible(false), 2000)
  }

  const handleReset = () => {
    if (window.confirm(t('reset_confirm'))) {
      resetProgress()
      setActiveMedal(null)
      showResetToast()
    }
  }

  const handleMedalShow = (achievement: Achievement) => {
    setActiveMedal(achievement.id)
  }

  const levelRatio = LEVELS.length > 0 ? unlockedLevels / LEVELS.length : 0

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#ffd166 ${levelRatio}turn, rgba(255,255,255,.1) ${levelRatio}turn)`,
          }}
        >
          <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-space-bg">
            <Mascot variant="bust" size={52} />
          </span>
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">{t('title')}</h1>
          <p className="mt-1 text-base font-semibold text-text-space/80 sm:text-lg">{t('subtitle')}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3" role="list" aria-label={t('subtitle')}>
        <StatTile name="star" label={t('stats_stars')} value={profile.totalStars} />
        <StatTile name="pencil" label={t('stats_exercises')} value={profile.totalExercises} />
        <StatTile name="rocket" label={t('stats_levels')} value={`${unlockedLevels}/${LEVELS.length}`} />
        <StatTile name="medal" label={t('stats_medals')} value={`${profile.achievementsUnlocked.length}/${ACHIEVEMENTS.length}`} />
      </div>

      <section>
        <h2 className="font-display text-xl font-extrabold text-astral-sky">{t('section_achievements')}</h2>
        {profile.achievementsUnlocked.length === 0 ? (
          <p className="mt-2 text-base font-bold text-text-space/70">{t('no_medals')}</p>
        ) : null}
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.filter(
            (achievement) => earnedIds.has(achievement.id) || !achievement.hidden,
          ).map((achievement) => {
            const earned = earnedIds.has(achievement.id)
            const expanded = activeMedal === achievement.id
            return (
              <li
                key={achievement.id}
                className="rounded-3xl border border-white/10 bg-space-bg-soft p-4 shadow-lg shadow-black/20"
              >
                <button
                  type="button"
                  onClick={() => handleMedalShow(achievement)}
                  onFocus={() => handleMedalShow(achievement)}
                  onBlur={() => setActiveMedal(null)}
                  aria-expanded={expanded}
                  aria-controls={`medal-desc-${achievement.id}`}
                  aria-label={
                    earned
                      ? `${t('medal_earned')}: ${t(achievement.i18nKey, { ns: 'achievements' })}`
                      : t(achievement.i18nKey, { ns: 'achievements' })
                  }
                  className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun ${
                    earned ? 'bg-white/5' : 'opacity-60'
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-dashed ${
                      earned
                        ? 'border-white/50 bg-astral-sun/20 shadow-[0_0_14px_2px_rgba(255,228,168,0.35)]'
                        : 'border-white/15 bg-white/5'
                    }`}
                  >
                    <MedalIcon earned={earned} />
                  </span>
                  <span
                    className={`font-display text-lg font-extrabold ${
                      earned ? 'text-text-space' : 'text-text-space/60'
                    }`}
                  >
                    {t(achievement.i18nKey, { ns: 'achievements' })}
                  </span>
                </button>
                <div
                  id={`medal-desc-${achievement.id}`}
                  role="status"
                  aria-live="polite"
                  className={expanded ? 'block' : 'hidden'}
                >
                  {expanded ? (
                    <p className="mt-3 rounded-2xl bg-astral-sun/10 p-3 text-base font-semibold leading-relaxed text-astral-sun">
                      {earned ? t(achievement.descriptionKey, { ns: 'achievements' }) : t('medal_locked_hint')}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold text-astral-sky">{t('section_records')}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(level.id)
            const progress = levelProgress[String(level.id)]
            const bestStars = progress?.bestStars ?? 0
            const bestScore = progress?.bestScore ?? 0
            const exercisesDone = progress?.exercisesDone ?? 0
            return (
              <li
                key={level.id}
                className={`rounded-3xl border p-4 shadow-lg shadow-black/20 ${
                  unlocked ? 'border-white/10 bg-space-bg-soft' : 'border-white/5 bg-space-bg'
                } ${unlocked ? '' : 'opacity-70'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`flex items-center gap-2 font-display text-xl font-extrabold ${
                      unlocked ? 'text-astral-sky' : 'text-text-space/50'
                    }`}
                  >
                    {t(level.i18nKey, { ns: 'practice' })}
                    {unlocked ? (
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-extrabold text-success">
                        {t('level_unlocked')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-extrabold text-text-space/60">
                        <LockIcon />
                        {t('level_locked')}
                      </span>
                    )}
                  </span>
                  <StarBadge count={bestStars} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-sm font-bold text-text-space/60">{t('records_best_score')}</dt>
                    <dd className="font-display text-xl font-extrabold text-astral-sun">{bestScore}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-text-space/60">{t('records_exercises')}</dt>
                    <dd className="font-display text-xl font-extrabold text-astral-lilac">{exercisesDone}</dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-space-bg-soft p-5 text-center shadow-lg shadow-black/20">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-danger bg-danger/10 px-6 py-3 font-display text-lg font-extrabold text-danger-soft transition-colors hover:bg-danger/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
        >
          {t('reset')}
        </button>
      </section>

      <Toast message={t('reset_done')} variant="success" visible={toastVisible} />
    </div>
  )
}