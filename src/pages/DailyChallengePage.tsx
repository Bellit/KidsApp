import {
  useCallback,
  useId,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  generateDailyChallenge,
  localDateString,
  type GeneratedExercise,
} from '../core/division/generator'
import { solve, type DivisionStep } from '../core/division/solver'
import { validateStep, type StepInputKind } from '../core/division/validator'
import { calcStars } from '../core/progression/scoring'
import { useGameStore, DAILY_REWARD_STARS } from '../shared/store/gameStore'
import {
  Celebration,
  DigitInput,
  ExitSessionButton,
  LongDivisionGrid,
  Mascot,
  OperationCard,
  MissionProgressBar,
  SpaceButton,
  StarBadge,
  Toast,
  type ToastVariant,
} from '../shared/components'
import { useSound } from '../shared/hooks/useSound'

type Phase = 'running' | 'complete'

type ExercisePhase = 'running' | 'solved'

interface FinalStats {
  stars: number
  correct: number
  errors: number
  totalExercises: number
  secondsUsed: number
}

const MAX_INPUT_LENGTH = 3

// El reto diario mezcla niveles (generator.DAILY_CHALLENGE_LEVEL_MIX), por lo
// que la sesión se registra en el nivel 5 "mixto" de Asteroides: semánticamente
// encaja con el contenido y permite que recordSession evalúe logros.
const DAILY_LEVEL = 5

/** Sub-entradas que el niño completa en cada paso del solver. */
function inputKindsForStep(step: DivisionStep): StepInputKind[] {
  const kinds: StepInputKind[] = ['quotient', 'product', 'remainder']
  if (step.digitBroughtDown !== null) kinds.push('broughtDown')
  return kinds
}

function kindLabelKey(kind: StepInputKind): string {
  switch (kind) {
    case 'quotient':
      return 'input_quotient'
    case 'product':
      return 'input_product'
    case 'remainder':
      return 'input_remainder'
    case 'broughtDown':
      return 'input_bring_down'
  }
}

export default function DailyChallengePage() {
  const { t } = useTranslation(['games', 'practice', 'achievements'])
  const { play } = useSound()
  const recordSession = useGameStore((s) => s.recordSession)
  const claimDailyReward = useGameStore((s) => s.claimDailyReward)
  const lastDailyRewardDate = useGameStore((s) => s.lastDailyRewardDate)
  const inputId = useId()

  const todayStr = localDateString()
  const claimedToday = lastDailyRewardDate === todayStr

  // El reto del día se genera una única vez al montar; la semilla es la fecha
  // local, así que recargar reproduce exactamente el MISMO reto.
  const [exercises] = useState<GeneratedExercise[]>(() => generateDailyChallenge(todayStr))
  const [phase, setPhase] = useState<Phase>('running')
  const [exercisePhase, setExercisePhase] = useState<ExercisePhase>('running')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [subStepIndex, setSubStepIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [filledQuotient, setFilledQuotient] = useState<number[]>([])
  const [inputError, setInputError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState(false)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null)
  const [startTime] = useState(() => Date.now())

  const exercise = exercises[exerciseIndex]
  const result = exercise ? solve(exercise.dividend, exercise.divisor) : null
  const steps = result?.steps ?? []
  const currentStep = steps[stepIndex]
  const inputKinds = currentStep ? inputKindsForStep(currentStep) : []
  const currentKind = inputKinds[subStepIndex]
  const totalExercises = exercises.length
  const dividendDigits = exercise ? String(exercise.dividend).split('') : []

  const progress = useMemo(() => {
    if (totalExercises === 0) return 0
    const stepProgress =
      steps.length > 0
        ? (stepIndex + subStepIndex / Math.max(inputKinds.length, 1)) / steps.length
        : 0
    return ((exerciseIndex + stepProgress) / totalExercises) * 100
  }, [totalExercises, exerciseIndex, steps.length, stepIndex, subStepIndex, inputKinds.length])

  const handleCelebrationEnded = useCallback(() => setCelebrating(false), [])

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    setToast({ variant, message })
    window.setTimeout(() => setToast(null), 2000)
  }, [])

  const resetInputState = useCallback(() => {
    setInputValue('')
    setInputError(null)
  }, [])

  // F4.4: al completar el reto se reclama el premio (+5 estrellas) y se registra
  // la sesión con isDailyChallenge para que evaluateAchievements conceda
  // `early_bird` en el MISMO update de estado. El premio y el logro son
  // independientes: el logro se gana al COMPLETAR, el premio al reclamar.
  const finishSession = (correct: number) => {
    const secondsUsed = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    const stars = calcStars(correct, totalExercises, errorCount, 0)
    const earnedBefore = new Set(useGameStore.getState().profile.achievementsUnlocked)
    const claimed = claimDailyReward()
    recordSession(
      DAILY_LEVEL,
      {
        correct,
        errors: errorCount,
        hintsUsed: 0,
        totalExercises,
        secondsUsed,
        stars,
      },
      { isDailyChallenge: true },
    )
    const unlockedAfter = useGameStore.getState().profile.achievementsUnlocked
    setRewardClaimed(claimed)
    setNewAchievements(unlockedAfter.filter((achievement) => !earnedBefore.has(achievement)))
    setFinalStats({ stars, correct, errors: errorCount, totalExercises, secondsUsed })
    setPhase('complete')
  }

  const completeExercise = () => {
    setCorrectCount((c) => c + 1)
    play('celebrate')
    setCelebrating(true)
    // No se avanza de operación: el niño ve primero la pantalla de resultado.
    setExercisePhase('solved')
  }

  /** Desde la pantalla de resultado: avanza a la siguiente operación o al resumen. */
  const continueToNextExercise = () => {
    if (exerciseIndex + 1 >= totalExercises) {
      // correctCount ya incluye la última operación resuelta.
      finishSession(correctCount)
      return
    }
    setExercisePhase('running')
    setExerciseIndex((e) => e + 1)
    setStepIndex(0)
    setSubStepIndex(0)
    setFilledQuotient([])
    resetInputState()
  }

  const advanceToNextInput = () => {
    if (!currentStep) return
    const kinds = inputKindsForStep(currentStep)
    if (subStepIndex + 1 < kinds.length) {
      resetInputState()
      setSubStepIndex((i) => i + 1)
      return
    }
    if (stepIndex + 1 < steps.length) {
      resetInputState()
      setStepIndex((s) => s + 1)
      setSubStepIndex(0)
      return
    }
    completeExercise()
  }

  const handleCheck = (event: FormEvent) => {
    event.preventDefault()
    if (!result || !currentStep || currentKind === undefined) return
    const answer = inputValue === '' ? null : Number(inputValue)
    const feedback = validateStep(result, stepIndex, currentKind, answer)
    if (feedback.correct) {
      play('correct')
      if (currentKind === 'quotient') {
        setFilledQuotient((prev) => {
          const next = [...prev]
          next[stepIndex] = currentStep.quotientDigit
          return next
        })
      }
      setCelebrating(true)
      showToast('success', t(feedback.messageKey, { ns: 'practice' }))
      advanceToNextInput()
    } else {
      play('incorrect')
      setErrorCount((e) => e + 1)
      setInputError(t(feedback.messageKey, { ns: 'practice' }))
    }
  }

  /** Bajar cifra: el niño toca el dígito esperado en la casita. */
  const handleDigitSelect = (index: number) => {
    if (!result || !currentStep || currentKind !== 'broughtDown') return
    const isCorrectIndex = index === currentStep.nextDigitIndex
    const feedback = validateStep(result, stepIndex, 'broughtDown', Number(dividendDigits[index] ?? 0))
    if (isCorrectIndex) {
      play('correct')
      setCelebrating(true)
      showToast('success', t(feedback.messageKey, { ns: 'practice' }))
      advanceToNextInput()
    } else {
      play('incorrect')
      setErrorCount((e) => e + 1)
      setInputError(t(feedback.messageKey, { ns: 'practice' }))
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setInputError(null)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return t('time_format', { minutes, seconds: secs, ns: 'practice' })
  }

  if (phase === 'complete') {
    const stats = finalStats
    return (
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <Mascot pose={(stats?.stars ?? 0) > 0 ? 'cheer' : 'idle'} size={64} />
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('daily_complete')}</h1>
        <div className="flex flex-col items-center gap-2">
          <StarBadge count={stats?.stars ?? 0} />
          <p className="text-base font-bold text-text-space/80">
            {t('stars_earned', { ns: 'practice', count: stats?.stars ?? 0 })}
          </p>
        </div>

        {rewardClaimed ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-astral-sun/15 px-5 py-3 font-display text-2xl font-extrabold text-astral-sun"
          >
            {t('daily_extra_reward', { count: DAILY_REWARD_STARS })}
          </p>
        ) : null}

        {newAchievements.includes('early_bird') ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-1 rounded-2xl bg-success/10 px-5 py-3"
          >
            <span className="font-display text-xl font-extrabold text-success-soft">
              {t('daily_achievement_earned')}
            </span>
            <span className="font-display text-lg font-extrabold text-success-soft">
              {t('early_bird.name', { ns: 'achievements' })}
            </span>
            <span className="text-base font-semibold leading-relaxed text-text-space/75">
              {t('early_bird.desc', { ns: 'achievements' })}
            </span>
          </div>
        ) : null}

        <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('stats_correct', { ns: 'practice' })}</dt>
            <dd className="font-display text-2xl font-extrabold text-success-soft">{stats?.correct ?? 0}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('stats_errors', { ns: 'practice' })}</dt>
            <dd className="font-display text-2xl font-extrabold text-danger-soft">{stats?.errors ?? 0}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('stats_time', { ns: 'practice' })}</dt>
            <dd className="font-display text-2xl font-extrabold text-text-space">
              {stats ? formatTime(stats.secondsUsed) : ''}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('stats_exercises', { ns: 'practice' })}</dt>
            <dd className="font-display text-2xl font-extrabold text-text-space">
              {stats?.totalExercises ?? 0}
            </dd>
          </div>
        </dl>

        <Link
          to="/games"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
        >
          {t('back_to_games')}
        </Link>

        <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
        <Celebration active={celebrating} onEnded={handleCelebrationEnded} />
      </section>
    )
  }

  // Ya reclamado hoy y sin sesión en curso (p. ej. recarga): no se puede rejugar.
  if (claimedToday) {
    return (
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <Mascot pose="idle" size={56} />
        <h1 className="font-display text-3xl font-extrabold text-astral-sun">{t('daily_title')}</h1>
        <p aria-live="polite" className="max-w-md text-lg font-semibold leading-relaxed text-text-space/85">
          {t('daily_already_done')}
        </p>
        <Link
          to="/games"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
        >
          {t('back_to_games')}
        </Link>
      </section>
    )
  }

  if (!exercise || !result) {
    return null
  }

  const quotientSlots = Array.from({ length: String(exercise.dividend).length }, (_, i) => {
    const filled = filledQuotient[i]
    const isCurrent = i === stepIndex
    const value =
      filled !== undefined
        ? String(filled)
        : isCurrent && currentKind === 'quotient'
          ? inputValue
          : ''
    const slotClass =
      filled !== undefined
        ? 'border-solid border-success-soft/70 bg-success/25 text-success-soft'
        : isCurrent
          ? 'border-dashed border-astral-sun bg-astral-sun/10 text-astral-sun'
          : 'border-dashed border-astral-sky/40 text-text-space/40'
    return (
      <div
        key={i}
        className={`flex h-11 min-w-0 items-center justify-center rounded-xl border-2 font-display text-2xl font-extrabold sm:h-12 sm:text-3xl ${slotClass}`}
      >
        {value}
      </div>
    )
  })

  if (exercisePhase === 'solved') {
    const quotient = result.quotient
    const remainder = result.remainder
    return (
      <section className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-6 text-center shadow-lg shadow-black/20">
        <Mascot pose="cheer" size={56} />
        <h1 className="font-display text-3xl font-extrabold text-success-soft">
          {t('exercise_solved', { ns: 'practice' })}
        </h1>
        <p className="font-display text-4xl font-extrabold text-success-soft sm:text-5xl">
          {t('result_equation', { ns: 'practice', dividend: exercise.dividend, divisor: exercise.divisor, quotient })}
        </p>
        {remainder > 0 ? (
          <p className="font-display text-2xl font-extrabold text-astral-sun">
            {t('result_remainder', { ns: 'practice', remainder })}
          </p>
        ) : null}
        <LongDivisionGrid exercise={exercise} solvedSteps={result.steps}>
          {quotientSlots}
        </LongDivisionGrid>
        <SpaceButton onClick={continueToNextExercise}>{t('next_exercise', { ns: 'practice' })}</SpaceButton>
        <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
        <Celebration active={celebrating} onEnded={handleCelebrationEnded} />
      </section>
    )
  }

  if (!currentStep || currentKind === undefined) {
    return null
  }

  const inputLabel = t(kindLabelKey(currentKind), { ns: 'practice' })
  const isBringDown = currentKind === 'broughtDown'

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Mascot pose="idle" size={44} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">
            {t('daily_title')}
          </h1>
          <p className="font-display text-lg font-extrabold text-text-space/80">
            <span>{t('daily_mixed_level')}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-astral-sun">{`${exercise.dividend} ÷ ${exercise.divisor}`}</span>
          </p>
        </div>
        <ExitSessionButton to="/games" />
      </header>

      <MissionProgressBar
        value={progress}
        label={t('session_progress', { ns: 'practice', current: exerciseIndex + 1, total: totalExercises })}
      />

      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-5 shadow-lg shadow-black/20">
        <OperationCard
          kind={currentKind}
          divisor={exercise.divisor}
          currentNumber={currentStep.currentNumber}
          quotientDigit={currentStep.quotientDigit}
          product={currentStep.product}
        />

        <div>
          <LongDivisionGrid
            exercise={exercise}
            currentStepIndex={currentStep.digitIndex}
            variant="practice"
            previousSteps={steps.slice(0, stepIndex)}
            currentProduct={subStepIndex >= 2 ? currentStep.product : undefined}
            currentRemainder={subStepIndex >= 3 ? currentStep.partialRemainder : undefined}
            bringDownIndex={isBringDown ? (currentStep.nextDigitIndex ?? undefined) : undefined}
            onDigitSelect={isBringDown ? handleDigitSelect : undefined}
          >
            {quotientSlots}
          </LongDivisionGrid>
        </div>

        {isBringDown ? (
          <p className="text-center font-display text-xl font-extrabold text-astral-sun">
            {t('op_bring_down', { ns: 'practice' })}
          </p>
        ) : (
          <form onSubmit={handleCheck} className="flex flex-col items-center gap-3">
            <DigitInput
              id={inputId}
              label={inputLabel}
              value={inputValue}
              onValueChange={handleInputChange}
              error={inputError}
              errorKey={errorCount}
              maxLength={MAX_INPUT_LENGTH}
            />
            <SpaceButton type="submit" variant="primary">
              {t('check', { ns: 'practice' })}
            </SpaceButton>
          </form>
        )}

        <div aria-live="polite" className="min-h-[3rem]">
          {isBringDown && inputError ? (
            <p className="rounded-2xl bg-danger/15 p-3 text-center text-base font-extrabold text-danger-soft">
              {inputError}
            </p>
          ) : null}
        </div>
      </div>

      <Toast
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'info'}
        visible={toast !== null}
        icon={toast?.variant === 'success' ? <Mascot pose="cheer" variant="bust" size={30} /> : undefined}
      />
      <Celebration active={celebrating} onEnded={handleCelebrationEnded} />
    </div>
  )
}