import {
  useCallback,
  useId,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { generateSession, type DivisionLevel, type GeneratedExercise } from '../core/division/generator'
import { solve, type DivisionStep } from '../core/division/solver'
import { validateStep, type StepInputKind } from '../core/division/validator'
import { calcTimedScore } from '../core/progression/timedScoring'
import { useGameStore } from '../shared/store/gameStore'
import {
  Celebration,
  DigitInput,
  ExitSessionButton,
  LongDivisionGrid,
  Mascot,
  OperationCard,
  RankBadge,
  SpaceButton,
  Toast,
  type ToastVariant,
} from '../shared/components'
import { useSound } from '../shared/hooks/useSound'

type TimedPhase = 'running' | 'finished'

const TIMED_SECONDS = 3 * 60
const LOW_TIME_THRESHOLD = 30
const EXERCISES_TO_GENERATE = 30
const MAX_INPUT_LENGTH = 3

const LEVEL_MIN = 1
const LEVEL_MAX = 5

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

/** Formatea los segundos como mm:ss (p. ej. "03:00"). */
function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function TimedSessionPage() {
  const { t } = useTranslation(['games', 'practice', 'lessons'])
  const { play } = useSound()
  const [searchParams] = useSearchParams()
  const recordTimedScore = useGameStore((s) => s.recordTimedScore)
  const getTimedTop5 = useGameStore((s) => s.getTimedTop5)
  const inputId = useId()

  const levelId = Number(searchParams.get('level'))
  const isValidLevel = Number.isInteger(levelId) && levelId >= LEVEL_MIN && levelId <= LEVEL_MAX

  const [phase, setPhase] = useState<TimedPhase>('running')
  const [secondsLeft, setSecondsLeft] = useState(TIMED_SECONDS)
  const [exercises, setExercises] = useState<GeneratedExercise[]>(() =>
    isValidLevel ? generateSession(levelId as DivisionLevel, EXERCISES_TO_GENERATE) : [],
  )
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
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [newRecord, setNewRecord] = useState(false)

  // Refs para el cronómetro y los contadores: evitan closures obsoletos y
  // dobles intervalos en StrictMode (dev monta/desmonta el efecto dos veces).
  const intervalRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const correctRef = useRef(0)
  const errorRef = useRef(0)

  const exercise = exercises[exerciseIndex]
  const result = exercise ? solve(exercise.dividend, exercise.divisor) : null
  const steps = result?.steps ?? []
  const currentStep = steps[stepIndex]
  const inputKinds = currentStep ? inputKindsForStep(currentStep) : []
  const currentKind = inputKinds[subStepIndex]
  const totalExercises = exercises.length
  const dividendDigits = exercise ? String(exercise.dividend).split('') : []

  const handleCelebrationEnded = useCallback(() => setCelebrating(false), [])

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    setToast({ variant, message })
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const resetInputState = useCallback(() => {
    setInputValue('')
    setInputError(null)
  }, [])

  /** Fin de sesión (tiempo agotado o se acabaron los ejercicios generados). */
  const endSession = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const score = calcTimedScore(correctRef.current, errorRef.current)
    const prevBest = useGameStore.getState().getTimedBest(levelId)
    recordTimedScore(levelId, score)
    setFinalScore(score)
    setNewRecord(prevBest === null || score > prevBest)
    play('celebrate')
    setCelebrating(true)
    setPhase('finished')
  }, [levelId, recordTimedScore, play])

  // Cronómetro: cuenta atrás cada segundo mientras la sesión corre.
  // El intervalo se guarda en una ref y se limpia siempre en el cleanup para
  // que StrictMode no deje dos intervalos activos.
  useEffect(() => {
    if (phase !== 'running') return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [phase])

  // Al llegar a 0 segundos se termina la sesión automáticamente.
  useEffect(() => {
    if (phase === 'running' && secondsLeft === 0) endSession()
  }, [phase, secondsLeft, endSession])

  const registerCorrect = useCallback(() => {
    setCorrectCount((c) => c + 1)
    correctRef.current += 1
  }, [])

  const registerError = useCallback(() => {
    setErrorCount((e) => e + 1)
    errorRef.current += 1
  }, [])

  /** División completada: suma acierto y pasa a la siguiente sin pantalla
   *  de resultado intermedia para maximizar la puntuación. */
  const completeExercise = () => {
    registerCorrect()
    play('correct')
    setCelebrating(true)
    if (exerciseIndex + 1 >= totalExercises) {
      endSession()
      return
    }
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
      registerError()
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
      registerError()
      setInputError(t(feedback.messageKey, { ns: 'practice' }))
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setInputError(null)
  }

  const handlePlayAgain = () => {
    play('click')
    finishedRef.current = false
    correctRef.current = 0
    errorRef.current = 0
    setExercises(generateSession(levelId as DivisionLevel, EXERCISES_TO_GENERATE))
    setPhase('running')
    setSecondsLeft(TIMED_SECONDS)
    setExerciseIndex(0)
    setStepIndex(0)
    setSubStepIndex(0)
    setCorrectCount(0)
    setErrorCount(0)
    setFilledQuotient([])
    resetInputState()
    setToast(null)
    setFinalScore(null)
    setNewRecord(false)
    setCelebrating(false)
  }

  if (!isValidLevel) {
    return <Navigate to="/games" replace />
  }

  const lowTime = phase === 'running' && secondsLeft < LOW_TIME_THRESHOLD

  if (phase === 'finished') {
    const top5 = getTimedTop5(levelId)
    const recordRank = finalScore !== null ? top5.indexOf(finalScore) : -1
    return (
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <Mascot pose={correctCount > 0 ? 'cheer' : 'idle'} size={64} />
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('session_over')}</h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold uppercase tracking-wide text-text-space/60">{t('score')}</p>
          <p className="font-display text-6xl font-extrabold text-astral-sun">{finalScore ?? 0}</p>
        </div>

        {newRecord ? (
          <p className="rounded-2xl bg-astral-sun/15 px-4 py-2 font-display text-xl font-extrabold text-astral-sun">
            {t('new_record')}
          </p>
        ) : null}

        <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('correct')}</dt>
            <dd className="font-display text-2xl font-extrabold text-success-soft">{correctCount}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-space-bg-soft p-4">
            <dt className="text-sm font-bold text-text-space/60">{t('errors')}</dt>
            <dd className="font-display text-2xl font-extrabold text-danger-soft">{errorCount}</dd>
          </div>
        </dl>

        <div className="w-full max-w-sm">
          <h2 className="mb-2 font-display text-lg font-extrabold text-astral-sky">{t('top_scores')}</h2>
          {top5.length === 0 ? (
            <p className="text-base font-semibold text-text-space/70">{t('no_scores')}</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {top5.map((score, index) => (
                <li
                  key={`${index}-${score}`}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                    index === recordRank
                      ? 'bg-astral-sun/20 ring-2 ring-astral-sun'
                      : 'bg-space-bg'
                  }`}
                >
                  <RankBadge rank={index + 1} />
                  <span className="flex-1" />
                  <span className="font-display text-xl font-extrabold text-astral-sun">{score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <SpaceButton onClick={handlePlayAgain}>{t('play_again')}</SpaceButton>
          <Link
            to="/games"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
          >
            {t('back_to_games')}
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

  if (!currentStep || currentKind === undefined) {
    return null
  }

  const inputLabel = t(kindLabelKey(currentKind), { ns: 'practice' })
  const isBringDown = currentKind === 'broughtDown'
  const timerClass = lowTime ? 'text-danger animate-pulse' : 'text-astral-sun'

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">
            {t('timed_title')}
          </h1>
          <p className="font-display text-lg font-extrabold text-text-space/80">
            <span>{t('level', { level: levelId, ns: 'practice' })}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-astral-sun">{`${exercise.dividend} ÷ ${exercise.divisor}`}</span>
          </p>
        </div>
        <ExitSessionButton to="/games" />
        <div className="flex flex-col items-end gap-1">
          <span role="timer" aria-label={t('time_left')} className={`font-display text-3xl font-extrabold tabular-nums ${timerClass}`}>
            {formatTimer(secondsLeft)}
          </span>
          {lowTime ? (
            <span aria-live="polite" className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-extrabold text-danger-soft">
              {t('low_time_warning')}
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 rounded-2xl bg-space-bg px-4 py-2">
          <span className="text-sm font-bold text-text-space/60">{t('correct')}</span>
          <span className="font-display text-xl font-extrabold text-success-soft">{correctCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-space-bg px-4 py-2">
          <span className="text-sm font-bold text-text-space/60">{t('errors')}</span>
          <span className="font-display text-xl font-extrabold text-danger-soft">{errorCount}</span>
        </div>
      </div>

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
            highlightActive={false}
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
