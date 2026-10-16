import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import i18n from '../shared/i18n'
import { useGameStore } from '../shared/store/gameStore'
import ProfilePage from './ProfilePage'

function recordLevelOneSession() {
  useGameStore.getState().recordSession(1, {
    correct: 8,
    errors: 2,
    hintsUsed: 0,
    totalExercises: 10,
    secondsUsed: 120,
    stars: 3,
  })
}

describe('ProfilePage', () => {
  beforeEach(async () => {
    cleanup()
    localStorage.clear()
    useGameStore.getState().resetProgress()
    vi.restoreAllMocks()
    await i18n.changeLanguage('es')
  })

  it('muestra la cabecera y las tarjetas de resumen', () => {
    render(<ProfilePage />)
    expect(screen.getByRole('heading', { name: 'Mi progreso' })).toBeInTheDocument()
    expect(screen.getByText('Tu viaje por el espacio')).toBeInTheDocument()
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.getByText('0/12')).toBeInTheDocument()
  })

  it('muestra el aviso cuando aún no hay medallas', () => {
    render(<ProfilePage />)
    expect(screen.getByText(/Aún no tienes medallas/)).toBeInTheDocument()
  })

  it('no muestra las medallas ocultas sin ganar', () => {
    render(<ProfilePage />)
    expect(screen.queryByText('Madrugador')).not.toBeInTheDocument()
  })

  it('muestra la descripción de una medalla ganada al hacer click', () => {
    useGameStore.getState().unlockAchievements(['first_step'])
    render(<ProfilePage />)
    const medalButton = screen.getByRole('button', { name: 'Medalla ganada: ¡Primer paso!' })
    fireEvent.click(medalButton)
    expect(screen.getByText('Completaste tu primera sesión de práctica')).toBeInTheDocument()
  })

  it('muestra la pista al hacer click en una medalla bloqueada', () => {
    render(<ProfilePage />)
    const medalButton = screen.getByRole('button', { name: 'Maratón' })
    fireEvent.click(medalButton)
    expect(screen.getByText('Sigue jugando para desbloquear esta medalla')).toBeInTheDocument()
  })

  it('muestra la descripción al recibir focus', () => {
    useGameStore.getState().unlockAchievements(['first_step'])
    render(<ProfilePage />)
    const medalButton = screen.getByRole('button', { name: 'Medalla ganada: ¡Primer paso!' })
    fireEvent.focus(medalButton)
    expect(screen.getByText('Completaste tu primera sesión de práctica')).toBeInTheDocument()
  })

  it('reinicia el progreso tras confirmar', () => {
    recordLevelOneSession()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ProfilePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar progreso' }))
    expect(useGameStore.getState().profile.totalExercises).toBe(0)
  })

  it('no reinicia si se cancela la confirmación', () => {
    recordLevelOneSession()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ProfilePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar progreso' }))
    expect(useGameStore.getState().profile.totalExercises).toBe(10)
  })

  it('muestra los récords del nivel 1 tras una sesión', () => {
    recordLevelOneSession()
    render(<ProfilePage />)
    expect(screen.getByText('Mercurio')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
