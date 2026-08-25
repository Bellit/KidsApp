import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore, DAILY_REWARD_STARS } from './gameStore'

function makeStats(overrides: Partial<ReturnType<typeof baseStats>> = {}) {
  return { ...baseStats(), ...overrides }
}

function baseStats() {
  return {
    correct: 8,
    errors: 2,
    hintsUsed: 0,
    totalExercises: 10,
    secondsUsed: 120,
    stars: 3,
  }
}

describe('gameStore', () => {
  beforeEach(() => {
    // Aísla cada test: limpia el almacenamiento persistido y el estado en memoria.
    localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  it('recordSession acumula estrellas, ejercicios y aciertos', () => {
    useGameStore.getState().recordSession(1, makeStats())

    let state = useGameStore.getState()
    expect(state.levelProgress['1'].bestStars).toBe(3)
    expect(state.levelProgress['1'].exercisesDone).toBe(10)
    expect(state.levelProgress['1'].bestScore).toBe(8)
    expect(state.profile.totalStars).toBe(3)
    expect(state.profile.totalExercises).toBe(10)

    // Una sesión peor no degrada los récords pero sí acumula totales.
    useGameStore.getState().recordSession(1, makeStats({ correct: 5, stars: 1 }))

    state = useGameStore.getState()
    expect(state.levelProgress['1'].bestStars).toBe(3)
    expect(state.levelProgress['1'].bestScore).toBe(8)
    expect(state.levelProgress['1'].exercisesDone).toBe(20)
    expect(state.profile.totalStars).toBe(4)
    expect(state.profile.totalExercises).toBe(20)
  })

  it('desbloquea el nivel siguiente con >= 2 estrellas', () => {
    useGameStore.getState().recordSession(1, makeStats({ stars: 2 }))
    expect(useGameStore.getState().levelProgress['2']?.unlocked).toBe(true)
  })

  it('no desbloquea el nivel siguiente con menos de 2 estrellas', () => {
    useGameStore.getState().recordSession(1, makeStats({ stars: 1 }))
    expect(useGameStore.getState().levelProgress['2']?.unlocked).toBeUndefined()
  })

  it('resetProgress limpia el progreso', () => {
    useGameStore.getState().recordSession(2, makeStats({ totalExercises: 5 }))
    expect(useGameStore.getState().profile.totalExercises).toBe(5)

    useGameStore.getState().resetProgress()

    const state = useGameStore.getState()
    expect(state.profile.userId).toBeNull()
    expect(state.profile.totalStars).toBe(0)
    expect(state.profile.totalExercises).toBe(0)
    expect(state.profile.achievementsUnlocked).toEqual([])
    expect(state.levelProgress).toEqual({})
  })

  it('isLevelUnlocked devuelve true para el nivel inicial sin progreso', () => {
    const { isLevelUnlocked } = useGameStore.getState()
    expect(isLevelUnlocked(1)).toBe(true)
  })

  it('isLevelUnlocked devuelve false para un nivel sin progreso ni desbloqueo', () => {
    const { isLevelUnlocked } = useGameStore.getState()
    expect(isLevelUnlocked(3)).toBe(false)
  })

  it('isLevelUnlocked devuelve false para un nivel fuera de rango', () => {
    const { isLevelUnlocked } = useGameStore.getState()
    expect(isLevelUnlocked(6)).toBe(false)
  })

  it('desbloquear el nivel siguiente con >= 2 estrellas habilita isLevelUnlocked', () => {
    useGameStore.getState().recordSession(1, makeStats({ stars: 2 }))
    expect(useGameStore.getState().isLevelUnlocked(2)).toBe(true)
  })

  it('un nivel con progreso guardado pero sin unlocked explícito cuenta como desbloqueado (grandfathering)', () => {
    // Simula progreso persistido de una versión anterior donde `unlocked` no se marcaba.
    useGameStore.setState({
      levelProgress: {
        '3': { bestStars: 0, exercisesDone: 5, bestScore: 3, unlocked: false },
      },
    })
    expect(useGameStore.getState().isLevelUnlocked(3)).toBe(true)
  })

  it('unlockLevel marca el nivel como desbloqueado', () => {
    useGameStore.getState().unlockLevel(4)
    expect(useGameStore.getState().levelProgress['4'].unlocked).toBe(true)
  })

  it('recordSession desbloquea logros en el mismo update de estado', () => {
    useGameStore.getState().recordSession(1, makeStats())
    const unlocked = useGameStore.getState().profile.achievementsUnlocked
    expect(unlocked).toContain('first_step')
    expect(unlocked).toContain('perfect_session')
    expect(unlocked).toContain('level_1_master')
    expect(unlocked).toContain('streak_10')
    expect(unlocked).toContain('resilient')
  })

  it('unlockAchievements añade sin duplicados', () => {
    useGameStore.getState().unlockAchievements(['marathon', 'marathon', 'early_bird'])
    expect(useGameStore.getState().profile.achievementsUnlocked).toEqual(['marathon', 'early_bird'])
  })
})

describe('recordTimedScore / getTimedBest / getTimedTop5', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  it('inserta puntuaciones ordenadas desc', () => {
    useGameStore.getState().recordTimedScore(1, 30)
    useGameStore.getState().recordTimedScore(1, 50)
    useGameStore.getState().recordTimedScore(1, 10)
    expect(useGameStore.getState().timedScores['1']).toEqual([50, 30, 10])
  })

  it('recorta a top 5 por nivel', () => {
    for (const score of [10, 20, 30, 40, 50, 60]) {
      useGameStore.getState().recordTimedScore(2, score)
    }
    expect(useGameStore.getState().timedScores['2']).toEqual([60, 50, 40, 30, 20])
  })

  it('guarda los récords por separado según el nivel', () => {
    useGameStore.getState().recordTimedScore(1, 15)
    useGameStore.getState().recordTimedScore(3, 95)
    expect(useGameStore.getState().getTimedTop5(1)).toEqual([15])
    expect(useGameStore.getState().getTimedTop5(3)).toEqual([95])
    expect(useGameStore.getState().getTimedTop5(2)).toEqual([])
  })

  it('getTimedBest devuelve la mejor puntuación del nivel', () => {
    useGameStore.getState().recordTimedScore(3, 40)
    useGameStore.getState().recordTimedScore(3, 55)
    expect(useGameStore.getState().getTimedBest(3)).toBe(55)
  })

  it('getTimedBest devuelve null sin récords', () => {
    expect(useGameStore.getState().getTimedBest(4)).toBeNull()
  })

  it('getTimedTop5 devuelve el listado ordenado desc', () => {
    useGameStore.getState().recordTimedScore(5, 25)
    useGameStore.getState().recordTimedScore(5, 45)
    expect(useGameStore.getState().getTimedTop5(5)).toEqual([45, 25])
  })

  it('resetProgress limpia los récords de contrarreloj', () => {
    useGameStore.getState().recordTimedScore(1, 10)
    useGameStore.getState().resetProgress()
    expect(useGameStore.getState().getTimedTop5(1)).toEqual([])
    expect(useGameStore.getState().getTimedBest(1)).toBeNull()
  })
})

// F4.4: premio del reto diario. La fecha se inyecta como cadena YYYY-MM-DD
// para que los tests sean deterministas (nunca new Date()).
describe('reto diario — premio y bloqueo por día', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  it('la primera vez devuelve true y suma 5 estrellas extra', () => {
    const claimed = useGameStore.getState().claimDailyReward('2026-08-13')
    expect(claimed).toBe(true)
    const state = useGameStore.getState()
    expect(state.lastDailyRewardDate).toBe('2026-08-13')
    expect(state.profile.totalStars).toBe(DAILY_REWARD_STARS)
  })

  it('reclamar dos veces el mismo día devuelve false y no vuelve a sumar', () => {
    useGameStore.getState().claimDailyReward('2026-08-13')
    const second = useGameStore.getState().claimDailyReward('2026-08-13')
    expect(second).toBe(false)
    expect(useGameStore.getState().profile.totalStars).toBe(DAILY_REWARD_STARS)
  })

  it('al día siguiente se puede reclamar de nuevo', () => {
    useGameStore.getState().claimDailyReward('2026-08-13')
    const nextDay = useGameStore.getState().claimDailyReward('2026-08-14')
    expect(nextDay).toBe(true)
    expect(useGameStore.getState().profile.totalStars).toBe(DAILY_REWARD_STARS * 2)
    expect(useGameStore.getState().lastDailyRewardDate).toBe('2026-08-14')
  })

  it('isDailyRewardClaimedToday compara con la fecha indicada', () => {
    useGameStore.getState().claimDailyReward('2026-08-13')
    expect(useGameStore.getState().isDailyRewardClaimedToday('2026-08-13')).toBe(true)
    expect(useGameStore.getState().isDailyRewardClaimedToday('2026-08-14')).toBe(false)
  })

  it('resetProgress limpia lastDailyRewardDate', () => {
    useGameStore.getState().claimDailyReward('2026-08-13')
    useGameStore.getState().resetProgress()
    expect(useGameStore.getState().lastDailyRewardDate).toBeNull()
    expect(useGameStore.getState().isDailyRewardClaimedToday('2026-08-13')).toBe(false)
  })

  it('completar el reto diario (isDailyChallenge) evalúa early_bird en la misma sesión', () => {
    useGameStore
      .getState()
      .recordSession(5, makeStats({ totalExercises: 5, correct: 5 }), { isDailyChallenge: true })
    expect(useGameStore.getState().profile.achievementsUnlocked).toContain('early_bird')
  })

  it('una sesión normal no concede early_bird', () => {
    useGameStore.getState().recordSession(1, makeStats())
    expect(useGameStore.getState().profile.achievementsUnlocked).not.toContain('early_bird')
  })

  it('reclamar el premio NO concede early_bird por sí solo', () => {
    useGameStore.getState().claimDailyReward('2026-08-13')
    expect(useGameStore.getState().profile.achievementsUnlocked).not.toContain('early_bird')
  })
})