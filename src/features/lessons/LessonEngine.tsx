import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { validateStep, type StepInputKind } from '../../core/division/validator'
import type { DivisionStep } from '../../core/division/solver'
import {
  Celebration,
  DigitInput,
  LongDivisionGrid,
  Mascot,
  OperationCard,
  MissionProgressBar,
  PlanetOrb,
  PLANET_STAGE_ICONS,
  SpaceButton,
  StarBadge,
  Toast,
  type ToastVariant,
} from '../../shared/components'
import { useSound } from '../../shared/hooks/useSound'
import type { LessonContent, LessonContentStep } from './types'

interface LessonEngineProps {
  lesson: LessonContent
  onComplete?: (result: { stars: number; errors: number; hintsUsed: number }) => void
}

type Phase = 'learning' | 'complete'

interface FeedbackState {
  messageKey: string
  correct: boolean
  nextHintKey?: string
}

const MAX_HINTS_PER_STEP = 2

function computeStars(errors: number, hintsUsed: number): number {
  if (errors === 0 && hintsUsed === 0) return 3
  if (errors <= 2 || hintsUsed <= 2) return 2
  return 1
}

function isExerciseStep(step: LessonContentStep): boolean {
  return step.kind === 'guided' || step.kind === 'practice'
}

/** Sub-entradas que el niño completa en cada paso del solver (igual que en práctica). */
function inputKindsForStep(step: DivisionStep): StepInputKind[] {
  const kinds: StepInputKind[] = ['quotient', 'product', 'remainder']
  if (step.digitBroughtDown !== null) kinds.push('broughtDown')
  return kinds
}

function stepTextKeyForKind(kind: StepInputKind): string {
  switch (kind) {
    case 'quotient':
      return 'guided.step_2'
    case 'product':
      return 'guided.step_3'
    case 'remainder':
      return 'guided.step_4'
    case 'broughtDown':
      return 'guided.step_5'
  }
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

export function LessonEngine({ lesson, onComplete }: LessonEngineProps) {
  // El namespace 'practice' es el namespace compartido de la UI de división:
  // OperationCard ya resuelve op_* y partial_number desde él.
  const { t } = useTranslation(['lessons', 'practice'])
  const { play } = useSound()
  const inputId = useId()

  const [phase, setPhase] = useState<Phase>('learning')
  const [stepIndex, setStepIndex] = useState(0)
  const [solverStepIndex, setSolverStepIndex] = useState(0)
  const [subStepIndex, setSubStepIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [filledQuotient, setFilledQuotient] = useState<number[]>([])
  const [lastFeedback, setLastFeedback] = useState<FeedbackState | null>(null)
  const [hintMessage, setHintMessage] = useState<string | null>(null)
  const [highlightActive, setHighlightActive] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [showSolved, setShowSolved] = useState(false)
  const completedRef = useRef(false)

  const step = lesson.steps[stepIndex]
  const isExercise = step !== undefined && isExerciseStep(step)
  const exercise = isExercise ? step.exercise : undefined
  const result = isExercise ? step.guidedSteps : undefined
  const currentStep = result ? result.steps[solverStepIndex] : undefined
  const inputKinds = currentStep ? inputKindsForStep(currentStep) : []
  const currentKind = inputKinds[subStepIndex]
  const isGuided = step?.kind === 'guided'
  const dividendDigits = exercise ? String(exercise.dividend).split('') : []
  const isBringDown = currentKind === 'broughtDown'
  const inputLabel = currentKind !== undefined ? t(kindLabelKey(currentKind), { ns: 'practice' }) : ''

  const stars = useMemo(() => computeStars(errors, hintsUsed), [errors, hintsUsed])

  const totalInputs = useMemo(() => {
    if (!result) return 0
    return result.steps.reduce((sum, s) => sum + inputKindsForStep(s).length, 0)
  }, [result])

  const completedInputs = useMemo(() => {
    if (!result) return 0
    let count = 0
    for (let i = 0; i < solverStepIndex; i += 1) {
      count += inputKindsForStep(result.steps[i]).length
    }
    return count + subStepIndex
  }, [result, solverStepIndex, subStepIndex])

  useEffect(() => {
    if (phase === 'complete' && !completedRef.current) {
      completedRef.current = true
      onComplete?.({ stars, errors, hintsUsed })
    }
  }, [phase, stars, errors, hintsUsed, onComplete])

  const handleCelebrationEnded = useCallback(() => setCelebrating(false), [])

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    setToast({ variant, message })
    window.setTimeout(() => setToast(null), 2000)
  }, [])

  const resetSubStepInput = useCallback(() => {
    setInputValue('')
    setHintCount(0)
    setHintMessage(null)
    setHighlightActive(false)
    setLastFeedback(null)
  }, [])

  const goToNextContentStep = useCallback(() => {
    const next = stepIndex + 1
    resetSubStepInput()
    setFilledQuotient([])
    setSolverStepIndex(0)
    setSubStepIndex(0)
    setShowSolved(false)
    if (next >= lesson.steps.length) {
      setPhase('complete')
    } else {
      setStepIndex(next)
    }
  }, [stepIndex, lesson.steps.length, resetSubStepInput])

  const advanceSubStep = useCallback(() => {
    if (!result || currentStep === undefined) return
    const kinds = inputKindsForStep(currentStep)
    if (subStepIndex + 1 < kinds.length) {
      resetSubStepInput()
      setSubStepIndex((i) => i + 1)
      return
    }
    if (solverStepIndex + 1 < result.steps.length) {
      resetSubStepInput()
      setSolverStepIndex((s) => s + 1)
      setSubStepIndex(0)
      return
    }
    setShowSolved(true)
  }, [result, currentStep, subStepIndex, solverStepIndex, resetSubStepInput])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value.replace(/[^0-9]/g, '').slice(0, 3))
  }

  const handleCheck = (event: FormEvent) => {
    event.preventDefault()
    if (!result || currentStep === undefined || currentKind === undefined) return
    const answer = inputValue === '' ? null : Number(inputValue)
    const feedback = validateStep(result, solverStepIndex, currentKind, answer)
    setLastFeedback(feedback)
    if (feedback.correct) {
      play('correct')
      if (currentKind === 'quotient') {
        setFilledQuotient((prev) => {
          const next = [...prev]
          next[solverStepIndex] = currentStep.quotientDigit
          return next
        })
      }
      setCelebrating(true)
      showToast('success', t(feedback.messageKey))
      advanceSubStep()
    } else {
      play('incorrect')
      setErrors((e) => e + 1)
      showToast('error', t(feedback.messageKey))
    }
  }

  /** Bajar cifra: el niño toca el dígito esperado en la casita. */
  const handleDigitSelect = (index: number) => {
    if (!result || currentStep === undefined || currentKind !== 'broughtDown') return
    const isCorrectIndex = index === currentStep.nextDigitIndex
    const feedback = validateStep(result, solverStepIndex, 'broughtDown', Number(dividendDigits[index] ?? 0))
    setLastFeedback(feedback)
    if (isCorrectIndex) {
      play('correct')
      setCelebrating(true)
      showToast('success', t(feedback.messageKey))
      advanceSubStep()
    } else {
      play('incorrect')
      setErrors((e) => e + 1)
      showToast('error', t(feedback.messageKey))
    }
  }

  const handleHint = () => {
    if (currentStep === undefined || currentKind === undefined) return
    if (hintCount >= MAX_HINTS_PER_STEP) return
    play('click')
    setHintsUsed((h) => h + 1)
    setHintCount((c) => c + 1)
    if (hintCount + 1 >= MAX_HINTS_PER_STEP) {
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

  const handleShowMe = () => {
    if (currentStep === undefined || currentKind === undefined) return
    play('correct')
    setHintsUsed((h) => h + 1)
    if (currentKind === 'quotient') {
      setFilledQuotient((prev) => {
        const next = [...prev]
        next[solverStepIndex] = currentStep.quotientDigit
        return next
      })
    }
    advanceSubStep()
  }

  const handleContinue = () => {
    play('click')
    if (stepIndex >= lesson.steps.length - 1) {
      setPhase('complete')
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const handleSolvedContinue = () => {
    play('click')
    setShowSolved(false)
    goToNextContentStep()
  }

  const handleRepeat = () => {
    completedRef.current = false
    play('click')
    setPhase('learning')
    setStepIndex(0)
    setSolverStepIndex(0)
    setSubStepIndex(0)
    setErrors(0)
    setHintsUsed(0)
    setHintCount(0)
    setInputValue('')
    setFilledQuotient([])
    setLastFeedback(null)
    setHintMessage(null)
    setHighlightActive(false)
    setToast(null)
    setShowSolved(false)
  }

  const progress = useMemo(() => {
    const total = lesson.steps.length
    if (total === 0) return 0
    if (!isExercise || !result || result.steps.length === 0) {
      return (stepIndex / total) * 100
    }
    const inside =
      (solverStepIndex + subStepIndex / Math.max(inputKinds.length, 1)) / result.steps.length
    return ((stepIndex + inside) / total) * 100
  }, [lesson.steps.length, stepIndex, isExercise, result, solverStepIndex, subStepIndex, inputKinds.length])

  const quotientSlots =
    isExercise && exercise && result
      ? Array.from({ length: String(exercise.dividend).length }, (_, i) => {
          const filled = filledQuotient[i]
          const isCurrent = i === solverStepIndex
          const value =
            filled !== undefined
              ? String(filled)
              : isCurrent && currentKind === 'quotient'
                ? inputValue
                : ''
          const slotClass =
            filled !== undefined
              ? 'border-success/70 text-success'
              : isCurrent
                ? 'border-astral-sun text-astral-sun'
                : 'border-astral-sky/40 text-text-space/40'
          return (
            <div
              key={i}
              className={`mx-0.5 flex h-9 min-w-0 items-center justify-center rounded-b-lg border-b-4 border-solid text-lg font-extrabold sm:h-11 sm:text-xl ${slotClass}`}
            >
              {value}
            </div>
          )
        })
      : []

  const header = (
    <header className="flex items-center gap-4">
      <PlanetOrb
        color={lesson.planet}
        icon={PLANET_STAGE_ICONS[lesson.planet]}
        className="h-14 w-14 shrink-0"
        iconClassName="h-6 w-6"
      />
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">{t(lesson.titleKey)}</h1>
        <p className="text-sm font-bold text-text-space/70">
          {isExercise && result
            ? t('guided.progress', { current: completedInputs + 1, total: totalInputs })
            : t('guided.progress', { current: stepIndex + 1, total: lesson.steps.length })}
        </p>
      </div>
    </header>
  )

  const feedbackToast = (
    <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
  )
  const celebrationOverlay = <Celebration active={celebrating} onEnded={handleCelebrationEnded} />

  if (phase === 'complete') {
    const summaryStep = lesson.steps[lesson.steps.length - 1]
    return (
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <PlanetOrb color={lesson.planet} icon={PLANET_STAGE_ICONS[lesson.planet]} className="h-20 w-20" iconClassName="h-9 w-9" />
        <Mascot pose={stars > 0 ? 'cheer' : 'idle'} size={56} />
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('common.lesson_complete')}</h1>
        <div className="flex flex-col items-center gap-2">
          <StarBadge count={stars} />
          <p className="text-base font-bold text-text-space/80">{t('common.stars_earned')}</p>
        </div>
        {summaryStep ? (
          <p className="max-w-md text-lg font-semibold leading-relaxed text-text-space/85">{t(summaryStep.textKey)}</p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <SpaceButton onClick={handleRepeat}>{t('common.repeat')}</SpaceButton>
          <Link
            to="/lessons"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
          >
            {t('common.back_to_map')}
          </Link>
        </div>
        {feedbackToast}
        {celebrationOverlay}
      </section>
    )
  }

  if (!step) return null

  if (showSolved && isExercise && exercise && result) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <MissionProgressBar value={progress} label={t(lesson.titleKey)} />
        <section className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-6 text-center shadow-lg shadow-black/20">
          <h1 className="font-display text-3xl font-extrabold text-success-soft">
            {t('exercise_solved', { ns: 'practice' })}
          </h1>
          <p className="font-display text-4xl font-extrabold text-success-soft sm:text-5xl">
            {t('result_equation', {
              ns: 'practice',
              dividend: exercise.dividend,
              divisor: exercise.divisor,
              quotient: result.quotient,
            })}
          </p>
          {result.remainder > 0 ? (
            <p className="font-display text-xl font-extrabold text-astral-sun">
              {t('result_remainder', { ns: 'practice', remainder: result.remainder })}
            </p>
          ) : null}
          <div className="w-full max-w-md">
            <LongDivisionGrid exercise={exercise} solvedSteps={result.steps}>
              {quotientSlots}
            </LongDivisionGrid>
          </div>
          <SpaceButton onClick={handleSolvedContinue}>{t('common.continue')}</SpaceButton>
        </section>
        {feedbackToast}
        {celebrationOverlay}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <MissionProgressBar value={progress} label={t(lesson.titleKey)} />
      {isExercise && exercise && result && currentStep !== undefined && currentKind !== undefined ? (
        <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-5 shadow-lg shadow-black/20">
          <p className="text-lg font-semibold leading-relaxed text-text-space/90">{t(step.textKey)}</p>
          <p className="font-display text-2xl font-extrabold text-astral-sun">
            {exercise.dividend} ÷ {exercise.divisor}
          </p>
          <OperationCard
            kind={currentKind}
            divisor={exercise.divisor}
            currentNumber={currentStep.currentNumber}
            quotientDigit={currentStep.quotientDigit}
            product={currentStep.product}
          />
          <p className="font-display text-xl font-extrabold text-astral-sky">{t(stepTextKeyForKind(currentKind))}</p>
          <div>
            <LongDivisionGrid
              exercise={exercise}
              currentStepIndex={currentStep.digitIndex}
              variant={isGuided || hintCount >= MAX_HINTS_PER_STEP ? 'lesson' : 'practice'}
              highlightActive={highlightActive || hintCount >= MAX_HINTS_PER_STEP}
              highlightIndex={isBringDown ? (currentStep.nextDigitIndex ?? currentStep.digitIndex) : undefined}
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
              <SpaceButton type="button" variant="ghost" onClick={handleHint} disabled={hintCount >= MAX_HINTS_PER_STEP}>
                {t('common.hint')}
              </SpaceButton>
              {isGuided ? (
                <SpaceButton variant="secondary" onClick={handleShowMe}>
                  {t('common.show_me')}
                </SpaceButton>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleCheck} className="flex flex-col items-center gap-3">
              <DigitInput id={inputId} label={inputLabel} value={inputValue} onChange={handleInputChange} />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <SpaceButton type="submit" variant="primary">
                  {t('common.check')}
                </SpaceButton>
                <SpaceButton type="button" variant="ghost" onClick={handleHint} disabled={hintCount >= MAX_HINTS_PER_STEP}>
                  {t('common.hint')}
                </SpaceButton>
                {isGuided ? (
                  <SpaceButton variant="secondary" onClick={handleShowMe}>
                    {t('common.show_me')}
                  </SpaceButton>
                ) : null}
              </div>
            </form>
          )}
          <div aria-live="polite" className="min-h-[3rem]">
            {hintMessage ? (
              <p className="rounded-2xl bg-astral-sun/10 p-3 text-base font-bold leading-relaxed text-astral-sun">
                {hintMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-space-bg-soft p-6 shadow-lg shadow-black/20">
          <p className="text-lg font-semibold leading-relaxed text-text-space/90">{t(step.textKey)}</p>
          {step.kind === 'glossary' && step.glossary ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {step.glossary.map((entry) => (
                <li key={entry.term} className="rounded-2xl bg-space-surface p-4">
                  <h2 className="font-display text-lg font-extrabold text-text-ink">{t(`glossary.term_${entry.term}`)}</h2>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-text-ink/80">{t(entry.textKey)}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex justify-end">
            <SpaceButton onClick={handleContinue}>{t('common.continue')}</SpaceButton>
          </div>
        </div>
      )}
      {feedbackToast}
      {celebrationOverlay}
    </div>
  )
}