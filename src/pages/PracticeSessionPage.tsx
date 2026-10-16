import { useCallback, useId, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { generateSession, type DivisionLevel, type GeneratedExercise } from '../core/division/generator'
import { solve, type DivisionStep } from '../core/division/solver'
import { validateStep, type StepInputKind } from '../core/division/validator'
import { calcStars } from '../core/progression/scoring'
import { useGameStore } from '../shared/store/gameStore'
import {
  Celebration,
  DigitInput,
  ExitSessionButton,
  LongDivisionGrid,
  Mascot,
  MissionProgressBar,
  OperationCard,
  PLANET_STAGE_ICONS,
  PlanetOrb,
  SpaceButton,
  StarBadge,
  Toast,
  type PlanetColor,
  type ToastVariant,
} from '../shared/components'
import { useSound } from '../shared/hooks/useSound'

type Phase = 'running' | 'complete'

type ExercisePhase = 'running' | 'solved'

interface FeedbackState {
  correct: boolean
  messageKey: string
  nextHintKey?: string
}

interface FinalStats {
  stars: number
  correct: number
  errors: number
  hintsUsed: number
  totalExercises: number
  secondsUsed: number
  newRecord: boolean
}

const MAX_HINTS_PER_INPUT = 2
const MIN_COUNT = 5
const MAX_COUNT = 15
const DEFAULT_COUNT = 10
const MAX_INPUT_LENGTH = 3

const LEVEL_MIN = 1
const LEVEL_MAX = 5

const LEVEL_COLORS: Record<number, PlanetColor> = {
  1: 'mercury',
  2: 'venus',
  3: 'earth',
  4: 'mars',
  5: 'asteroid',
}

function parseCount(raw: string | null): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_COUNT
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(parsed)))
}

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

function genericHintKey(kind: StepInputKind): string {
  switch (kind) {
    case 'quotient':
      return 'feedback.hint_quotient'
    case 'product':
      return 'feedback.hint_product'
    case 'remainder':
      return 'feedback.hint_remainder'
    case 'broughtDown':
      return 'feedback.hint_bring_down'
  }
}

function motivationKey(stars: number): string {
  if (stars >= 3) return 'motivation_1'
  if (stars === 2) return 'motivation_2'
  return 'motivation_3'
}

export default function PracticeSessionPage() {
  const { t } = useTranslation(['practice', 'lessons'])
  const { play } = useSound()
  const { levelId: levelIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const recordSession = useGameStore((s) => s.recordSession)
  const inputId = useId()

  const levelId = Number(levelIdParam)
  const isValidLevel = Number.isInteger(levelId) && levelId >= LEVEL_MIN && levelId <= LEVEL_MAX
  const count = parseCount(searchParams.get('count'))

  const [exercises, setExercises] = useState<GeneratedExercise[]>(() =>
    isValidLevel ? generateSession(levelId as DivisionLevel, count) : [],
  )
  const [phase, setPhase] = useState<Phase>('running')
  const [exercisePhase, setExercisePhase] = useState<ExercisePhase>('running')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [subStepIndex, setSubStepIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [filledQuotient, setFilledQuotient] = useState<number[]>([])
  const [lastFeedback, setLastFeedback] = useState<FeedbackState | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [hintMessage, setHintMessage] = useState<string | null>(null)
  const [highlightActive, setHighlightActive] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null)
  const [startTime, setStartTime] = useState(() => Date.now())

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
    setHintCount(0)
    setHintMessage(null)
    setHighlightActive(false)
    setLastFeedback(null)
    setInputError(null)
  }, [])

  const finishSession = (correct: number) => {
    const secondsUsed = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    const stars = calcStars(correct, totalExercises, errorCount, hintsUsed)
    const prevBest = useGameStore.getState().levelProgress[String(levelId)]?.bestStars ?? 0
    recordSession(levelId, {
      correct,
      errors: errorCount,
      hintsUsed,
      totalExercises,
      secondsUsed,
      stars,
    })
    setFinalStats({
      stars,
      correct,
      errors: errorCount,
      hintsUsed,
      totalExercises,
      secondsUsed,
      newRecord: stars > prevBest,
    })
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
    setLastFeedback(feedback)
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
      showToast('success', t(feedback.messageKey))
      advanceToNextInput()
    } else {
      play('incorrect')
      setErrorCount((e) => e + 1)
      setInputError(t(feedback.messageKey))
    }
  }

  /** Bajar cifra: el niño toca el dígito esperado en la casita. */
  const handleDigitSelect = (index: number) => {
    if (!result || !currentStep || currentKind !== 'broughtDown') return
    const isCorrectIndex = index === currentStep.nextDigitIndex
    const feedback = validateStep(result, stepIndex, 'broughtDown', Number(dividendDigits[index] ?? 0))
    setLastFeedback(feedback)
    if (isCorrectIndex) {
      play('correct')
      setCelebrating(true)
      showToast('success', t(feedback.messageKey))
      advanceToNextInput()
    } else {
      play('incorrect')
      setErrorCount((e) => e + 1)
      setInputError(t(feedback.messageKey))
    }
  }

  const handleHint = () => {
    if (!currentStep || currentKind === undefined) return
    if (hintCount >= MAX_HINTS_PER_INPUT) return
    play('click')
    setHintsUsed((h) => h + 1)
    setHintCount((c) => c + 1)
    if (hintCount + 1 >= MAX_HINTS_PER_INPUT) {
      setHighlightActive(true)
    }
    const zeroQuotient = currentKind === 'quotient' && currentStep.quotientDigit === 0
    const hintKey =
      lastFeedback && !lastFeedback.correct && lastFeedback.nextHintKey
        ? lastFeedback.nextHintKey
        : zeroQuotient
          ? 'feedback.hint_zero_quotient'
          : genericHintKey(currentKind)
    setHintMessage(t(hintKey))
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setInputError(null)
  }

  const handleRepeat = () => {
    play('click')
    setExercises(generateSession(levelId as DivisionLevel, count))
    setPhase('running')
    setExercisePhase('running')
    setExerciseIndex(0)
    setStepIndex(0)
    setSubStepIndex(0)
    setCorrectCount(0)
    setErrorCount(0)
    setHintsUsed(0)
    setFilledQuotient([])
    resetInputState()
    setToast(null)
    setFinalStats(null)
    setStartTime(Date.now())
  }

  if (!isValidLevel) {
    return <Navigate to="/practice" replace />
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return t('time_format', { minutes, seconds: secs })
  }

  if (phase === 'complete') {
    const stats = finalStats
    return (
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <Mascot pose={(stats?.stars ?? 0) > 0 ? 'cheer' : 'idle'} size={68} />
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('session_complete')}</h1>
        <div className="flex flex-col items-center gap-2">
          <StarBadge count={stats?.stars ?? 0} />
          <p className="text-base font-bold text-text-space/80">
            {t('stars_earned', { count: stats?.stars ?? 0 })}
          </p>
        </div>
        {stats?.newRecord ? (
          <p className="rounded-2xl bg-astral-sun/15 px-4 py-2 font-display text-xl font-extrabold text-astral-sun">
            {t('new_record')}
          </p>
        ) : null}
        <p className="max-w-md text-lg font-semibold leading-relaxed text-text-space/85">
          {t(motivationKey(stats?.stars ?? 1))}
        </p>
        <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl bg-space-surface p-4">
            <dt className="text-sm font-bold text-text-ink/70">{t('stats_correct')}</dt>
            <dd className="font-display text-2xl font-extrabold text-success">{stats?.correct ?? 0}</dd>
          </div>
          <div className="rounded-2xl bg-space-surface p-4">
            <dt className="text-sm font-bold text-text-ink/70">{t('stats_errors')}</dt>
            <dd className="font-display text-2xl font-extrabold text-danger">{stats?.errors ?? 0}</dd>
          </div>
          <div className="rounded-2xl bg-space-surface p-4">
            <dt className="text-sm font-bold text-text-ink/70">{t('stats_time')}</dt>
            <dd className="font-display text-2xl font-extrabold text-text-ink">
              {stats ? formatTime(stats.secondsUsed) : ''}
            </dd>
          </div>
          <div className="rounded-2xl bg-space-surface p-4">
            <dt className="text-sm font-bold text-text-ink/70">{t('stats_exercises')}</dt>
            <dd className="font-display text-2xl font-extrabold text-text-ink">
              {stats?.totalExercises ?? 0}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap justify-center gap-3">
          <SpaceButton onClick={handleRepeat}>{t('repeat')}</SpaceButton>
          <Link
            to="/practice"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
          >
            {t('back_to_levels')}
          </Link>
        </div>
        <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
        <Celebration active={celebrating} onEnded={handleCelebrationEnded} />
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
        <Mascot pose="cheer" size={64} />
        <h1 className="font-display text-3xl font-extrabold text-success-soft">{t('exercise_solved')}</h1>
        <p className="font-display text-4xl font-extrabold text-success-soft sm:text-5xl">
          {t('result_equation', { dividend: exercise.dividend, divisor: exercise.divisor, quotient })}
        </p>
        {remainder > 0 ? (
          <p className="font-display text-2xl font-extrabold text-astral-sun">
            {t('result_remainder', { remainder })}
          </p>
        ) : null}
        <LongDivisionGrid exercise={exercise} solvedSteps={result.steps}>
          {quotientSlots}
        </LongDivisionGrid>
        <SpaceButton onClick={continueToNextExercise}>{t('next_exercise')}</SpaceButton>
        <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
        <Celebration active={celebrating} onEnded={handleCelebrationEnded} />
      </section>
    )
  }

  if (!currentStep || currentKind === undefined) {
    return null
  }

  const inputLabel = t(kindLabelKey(currentKind))
  const isBringDown = currentKind === 'broughtDown'

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <PlanetOrb
          color={LEVEL_COLORS[levelId]}
          icon={PLANET_STAGE_ICONS[LEVEL_COLORS[levelId]]}
          className="h-12 w-12 shrink-0"
          iconClassName="h-5 w-5"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold leading-tight text-text-space">
            {t(`level_name_${levelId}`)}
          </h1>
          <p className="font-display text-lg font-extrabold text-text-space/80">
            <span>{t('level', { level: levelId })}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-astral-sun">{`${exercise.dividend} ÷ ${exercise.divisor}`}</span>
          </p>
        </div>
        <ExitSessionButton to="/practice" />
      </header>

      <MissionProgressBar
        value={progress}
        label={t('session_progress', { current: exerciseIndex + 1, total: totalExercises })}
      />

      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-4 shadow-lg shadow-black/20 sm:p-5">
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
            highlightActive={highlightActive}
            highlightIndex={isBringDown ? (currentStep.nextDigitIndex ?? currentStep.digitIndex) : undefined}
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SpaceButton type="button" variant="ghost" onClick={handleHint} disabled={hintCount >= MAX_HINTS_PER_INPUT}>
              {t('hint')}
            </SpaceButton>
          </div>
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SpaceButton type="submit" variant="primary">
                {t('check')}
              </SpaceButton>
              <SpaceButton
                type="button"
                variant="ghost"
                onClick={handleHint}
                disabled={hintCount >= MAX_HINTS_PER_INPUT}
              >
                {t('hint')}
              </SpaceButton>
            </div>
          </form>
        )}

        <div aria-live="polite" className="flex min-h-[3rem] flex-col gap-2">
          {isBringDown && inputError ? (
            <p className="rounded-2xl bg-danger/15 p-3 text-center text-base font-extrabold text-danger-soft">
              {inputError}
            </p>
          ) : null}
          {hintMessage ? (
            <p className="rounded-2xl bg-astral-sun/10 p-3 text-base font-bold leading-relaxed text-astral-sun">
              {hintMessage}
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