/**
 * F7.2 — Test e2e del flujo crítico (integración real sin navegador).
 *
 * Recorre el flujo completo de la app tal y como la usaría un niño:
 *   práctica → resolución de divisiones → estrellas → desbloqueo de niveles
 *   → medallas/logros → perfil → persistencia en localStorage.
 *
 * Se ejecuta en jsdom con MemoryRouter y las PÁGINAS Y EL SHELL REALES de la
 * app (AppShell + PracticeIndexPage + PracticeSessionPage + ProfilePage),
 * replicando la estructura de rutas de src/app/router.tsx. El store de Zustand
 * (useGameStore) es el mismo módulo singleton, así que el estado fluye de
 * verdad entre las páginas y persiste en localStorage.
 *
 * Estrategia para controlar el ejercicio (mock controlado del generador):
 * - Se mockea SOLO `generateSession` (el generador de la sesión) para que
 *   devuelva siempre el mismo ejercicio conocido: 1234 ÷ 4. El resto del
 *   módulo se conserva con `importOriginal` (localDateString, reto diario...).
 * - Las respuestas correctas NO se hardcodean por columna: se derivan con el
 *   solver real (`solve`) a partir del ejercicio fijado, replicando el orden
 *   de sub-entradas de la página (quotient → product → remainder →
 *   broughtDown). Así el test valida la UI real contra la fuente de verdad
 *   matemática del proyecto.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate, type NavigateFunction } from 'react-router'
import { AppShell } from './shell/AppShell'
import PracticeIndexPage from '../pages/PracticeIndexPage'
import PracticeSessionPage from '../pages/PracticeSessionPage'
import ProfilePage from '../pages/ProfilePage'
import i18n from '../shared/i18n'
import { useGameStore } from '../shared/store/gameStore'
import { solve, type DivisionStep } from '../core/division/solver'

/** Ejercicio fijo con el que se alimenta la sesión (1234 ÷ 4 = 308 r 2). */
const { FIXED_EXERCISE } = vi.hoisted(() => {
  return {
    FIXED_EXERCISE: { divisor: 4, dividend: 1234, quotient: 308, remainder: 2, level: 1 } as const,
  }
})

// Mock controlado del generador: la sesión SIEMPRE devuelve el mismo ejercicio.
vi.mock('../core/division/generator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../core/division/generator')>()
  const generateSession = vi.fn((level: unknown, count: number) => {
    // El nivel real no importa: el e2e fija el ejercicio para ser determinista.
    void level
    return Array.from({ length: count }, () => ({ ...FIXED_EXERCISE }))
  })
  return { ...actual, generateSession }
})

/** Número de ejercicios por sesión (el índice de niveles usa el mínimo: 5). */
const TOTAL_EXERCISES = 5

type InputKind = 'quotient' | 'product' | 'remainder' | 'broughtDown'

/** Etiqueta aria del input (i18n es) por tipo de sub-entrada. */
const LABEL_BY_KIND: Record<InputKind, string> = {
  quotient: 'Escribe la cifra del cociente',
  product: 'Escribe el producto',
  remainder: 'Escribe el resto',
  broughtDown: '¿Qué cifra bajas?',
}

/** Replica el orden de sub-entradas de la página para cada paso del solver. */
function inputKindsForStep(step: DivisionStep): InputKind[] {
  const kinds: InputKind[] = ['quotient', 'product', 'remainder']
  if (step.digitBroughtDown !== null) kinds.push('broughtDown')
  return kinds
}

/** Valor correcto esperado según el tipo de sub-entrada. */
function expectedValue(step: DivisionStep, kind: InputKind): number {
  switch (kind) {
    case 'quotient':
      return step.quotientDigit
    case 'product':
      return step.product
    case 'remainder':
      return step.partialRemainder
    case 'broughtDown':
      return step.digitBroughtDown ?? 0
  }
}

/** Captura `navigate` del MemoryRouter para movernos entre rutas. */
let capturedNavigate: NavigateFunction | null = null

function NavigateCapture() {
  const navigate = useNavigate()
  capturedNavigate = navigate
  return null
}

/** Renderiza la app real (shell + páginas) replicando src/app/router.tsx. */
function renderApp(initialPath = '/practice') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route path="practice" element={<PracticeIndexPage />} />
          <Route path="practice/:levelId" element={<PracticeSessionPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <NavigateCapture />
    </MemoryRouter>,
  )
}

/** Resuelve el ejercicio actual (1234÷4) con el solver real y pulsa "Siguiente". */
function solveCurrentExerciseAndContinue() {
  const result = solve(FIXED_EXERCISE.dividend, FIXED_EXERCISE.divisor)
  for (const step of result.steps) {
    for (const kind of inputKindsForStep(step)) {
      if (kind === 'broughtDown') {
        // Bajar cifra: se toca en la casita el dígito esperado del dividendo.
        // Los botones se renderizan en orden de índice de dígito, así que el
        // índice del paso coincide con la posición en el array.
        const nextIndex = step.nextDigitIndex as number
        const buttons = screen.getAllByRole('button', { name: /^Dividendo / })
        fireEvent.click(buttons[nextIndex])
      } else {
        // Escribir el valor correcto y comprobar con el botón real de la UI.
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-label', LABEL_BY_KIND[kind])
        fireEvent.change(input, { target: { value: String(expectedValue(step, kind)) } })
        fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
      }
    }
  }
  // Pantalla de resultado del ejercicio resuelto (exercise_solved).
  expect(screen.getByText('¡División completada!')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
}

/** jsdom trae matchMedia, pero lo garantizamos (lo usan Celebration e InstallPrompt). */
function ensureMatchMedia() {
  if (typeof window.matchMedia === 'function') return
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(async () => {
  cleanup()
  localStorage.clear()
  useGameStore.getState().resetProgress()
  capturedNavigate = null
  ensureMatchMedia()
  await i18n.changeLanguage('es')
})

describe('F7.2 — e2e del flujo crítico', () => {
  it('práctica → estrellas → desbloqueos → medallas → perfil → persistencia', async () => {
    renderApp('/practice')

    // --- Paso 1: arranque en /practice ---
    expect(screen.getByRole('heading', { name: 'Práctica de división' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mercurio' })).toBeInTheDocument()

    // --- Paso 2: seleccionar el nivel 1 y resolver la sesión ---
    fireEvent.click(screen.getByRole('button', { name: 'Mercurio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }))

    // La sesión se alimenta del ejercicio fijo del mock: 1234 ÷ 4.
    expect(screen.getByText('1234 ÷ 4')).toBeInTheDocument()
    expect(screen.getByText('Nivel 1')).toBeInTheDocument()

    for (let i = 0; i < TOTAL_EXERCISES; i += 1) {
      solveCurrentExerciseAndContinue()
    }

    // --- Paso 3: resultado de la sesión, estrellas y registro en el store ---
    expect(screen.getByRole('heading', { name: '¡Sesión completada!' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: '3 de 3 estrellas' }).length).toBeGreaterThan(0)
    expect(screen.getByText('¡Nuevo récord!')).toBeInTheDocument()

    const state = useGameStore.getState()
    expect(state.profile.totalStars).toBe(3)
    expect(state.profile.totalExercises).toBe(5)
    expect(state.levelProgress['1']).toMatchObject({
      bestStars: 3,
      bestScore: 5,
      exercisesDone: 5,
      unlocked: true,
    })

    // --- Paso 4: desbloqueo de medallas/logros (F4.2) ---
    expect(state.profile.achievementsUnlocked).toEqual(
      expect.arrayContaining(['first_step', 'perfect_session', 'no_hints_pro', 'level_1_master']),
    )

    // --- Paso 5: el perfil refleja estrellas, medallas y récords ---
    act(() => {
      capturedNavigate?.('/profile')
    })
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText('Estrellas totales')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medalla ganada: ¡Primer paso!' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medalla ganada: Sesión perfecta' })).toBeInTheDocument()
    expect(screen.getByText('Mercurio')).toBeInTheDocument()
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)

    // --- Paso 6: persistencia en localStorage (clave de zustand persist) ---
    await waitFor(() => {
      const raw = localStorage.getItem('kidsapp:progress')
      expect(raw).not.toBeNull()
      const persisted = JSON.parse(raw as string) as {
        state: {
          profile: { totalStars: number; achievementsUnlocked: string[] }
          levelProgress: Record<string, { bestStars: number; unlocked: boolean }>
        }
      }
      expect(persisted.state.profile.totalStars).toBe(3)
      expect(persisted.state.profile.achievementsUnlocked).toContain('first_step')
      expect(persisted.state.levelProgress['1'].bestStars).toBe(3)
      expect(persisted.state.levelProgress['2'].unlocked).toBe(true)
    })
  })
})

describe('F4.1 — bloqueo y desbloqueo de niveles', () => {
  it('con 0 estrellas el nivel 2 está bloqueado y al ganar estrellas se desbloquea', () => {
    renderApp('/practice')

    // Nivel 1 (Mercurio) siempre desbloqueado.
    expect(screen.getByRole('button', { name: 'Mercurio' })).toBeInTheDocument()

    // Nivel 2 (Venus) bloqueado con 0 estrellas.
    const lockedVenus = screen.getByRole('button', { name: 'Venus, Bloqueado' })
    expect(lockedVenus).toBeInTheDocument()
    expect(useGameStore.getState().isLevelUnlocked(2)).toBe(false)

    // Intentar entrar en el bloqueado muestra el aviso y no selecciona nivel.
    fireEvent.click(lockedVenus)
    expect(screen.getByText('Este nivel está bloqueado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeDisabled()

    // Ganar las estrellas necesarias (>= 2), igual que hace la UI al cerrar sesión.
    act(() => {
      useGameStore.getState().recordSession(1, {
        correct: 5,
        errors: 0,
        hintsUsed: 0,
        totalExercises: 5,
        secondsUsed: 60,
        stars: 3,
      })
    })

    // El nivel 2 queda desbloqueado y seleccionable.
    expect(useGameStore.getState().isLevelUnlocked(2)).toBe(true)
    expect(screen.getByRole('button', { name: 'Venus' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Venus, Bloqueado' })).not.toBeInTheDocument()
  })
})
