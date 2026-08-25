import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS } from './definitions'
import { evaluateAchievements, type AchievementContext } from './engine'

// Contexto base: sesión perfecta de 10 ejercicios en el nivel 1.
function baseContext(): AchievementContext {
  return {
    levelId: 1,
    stats: { correct: 10, errors: 0, hintsUsed: 0, totalExercises: 10, secondsUsed: 45, stars: 3 },
    levelProgress: {},
    profile: { totalStars: 3, totalExercises: 10, achievementsUnlocked: [] },
  }
}

function context(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return { ...baseContext(), ...overrides }
}

function perfectLevels(): Record<string, { bestStars: number; exercisesDone: number; bestScore: number; unlocked: boolean }> {
  return {
    '1': { bestStars: 3, exercisesDone: 10, bestScore: 10, unlocked: true },
    '2': { bestStars: 3, exercisesDone: 10, bestScore: 10, unlocked: true },
    '3': { bestStars: 3, exercisesDone: 10, bestScore: 10, unlocked: true },
    '4': { bestStars: 3, exercisesDone: 10, bestScore: 10, unlocked: true },
    '5': { bestStars: 3, exercisesDone: 10, bestScore: 10, unlocked: true },
  }
}

describe('evaluateAchievements', () => {
  it('una sesión perfecta gana perfect_session, first_step, no_hints_pro, streak_10, level_1_master y sharp_mind', () => {
    const result = evaluateAchievements(context())
    expect(result).toContain('perfect_session')
    expect(result).toContain('first_step')
    expect(result).toContain('no_hints_pro')
    expect(result).toContain('streak_10')
    expect(result).toContain('level_1_master')
    expect(result).toContain('sharp_mind')
  })

  it('perfect_session no se repite si ya está ganado', () => {
    const ctx = context({
      profile: { totalStars: 6, totalExercises: 20, achievementsUnlocked: ['perfect_session'] },
    })
    expect(evaluateAchievements(ctx)).not.toContain('perfect_session')
  })

  it('first_step se gana con la primera sesión', () => {
    expect(evaluateAchievements(context())).toContain('first_step')
  })

  it('first_step no se gana sin ejercicios completados', () => {
    const ctx = context({
      stats: { ...baseContext().stats, totalExercises: 0 },
      profile: { totalStars: 0, totalExercises: 0, achievementsUnlocked: [] },
    })
    expect(evaluateAchievements(ctx)).not.toContain('first_step')
  })

  it('level_1_master solo con nivel 1 y 3 estrellas', () => {
    expect(evaluateAchievements(context({ levelId: 1 }))).toContain('level_1_master')
    expect(
      evaluateAchievements(context({ levelId: 2, stats: { ...baseContext().stats, stars: 3 } })),
    ).not.toContain('level_1_master')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, stars: 2 } })),
    ).not.toContain('level_1_master')
  })

  it('level_2_master y level_3_master son específicos de su nivel', () => {
    expect(
      evaluateAchievements(context({ levelId: 2, stats: { ...baseContext().stats, stars: 3 } })),
    ).toContain('level_2_master')
    expect(
      evaluateAchievements(context({ levelId: 3, stats: { ...baseContext().stats, stars: 3 } })),
    ).toContain('level_3_master')
    expect(
      evaluateAchievements(context({ levelId: 1, stats: { ...baseContext().stats, stars: 3 } })),
    ).not.toContain('level_2_master')
  })

  it('no_hints_pro requiere no usar pistas', () => {
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, hintsUsed: 0 } })),
    ).toContain('no_hints_pro')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, hintsUsed: 1 } })),
    ).not.toContain('no_hints_pro')
  })

  it('division_guru solo cuando los 5 niveles tienen bestStars 3', () => {
    expect(evaluateAchievements(context({ levelProgress: perfectLevels() }))).toContain('division_guru')

    const oneMissing = { ...perfectLevels(), '5': { bestStars: 2, exercisesDone: 10, bestScore: 8, unlocked: true } }
    expect(evaluateAchievements(context({ levelProgress: oneMissing }))).not.toContain('division_guru')
  })

  it('streak_10 requiere al menos 10 ejercicios en la sesión', () => {
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, totalExercises: 10 } })),
    ).toContain('streak_10')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, totalExercises: 9 } })),
    ).not.toContain('streak_10')
  })

  it('sharp_mind requiere una sesión de menos de 60 segundos', () => {
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, secondsUsed: 59 } })),
    ).toContain('sharp_mind')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, secondsUsed: 60 } })),
    ).not.toContain('sharp_mind')
  })

  it('resilient requiere errores y al menos 2 estrellas', () => {
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, errors: 2, stars: 2 } })),
    ).toContain('resilient')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, errors: 0, stars: 3 } })),
    ).not.toContain('resilient')
    expect(
      evaluateAchievements(context({ stats: { ...baseContext().stats, errors: 2, stars: 1 } })),
    ).not.toContain('resilient')
  })

  it('marathon con totalExercises >= 100', () => {
    const ctx = context({ profile: { totalStars: 30, totalExercises: 100, achievementsUnlocked: [] } })
    expect(evaluateAchievements(ctx)).toContain('marathon')

    const below = context({ profile: { totalStars: 29, totalExercises: 99, achievementsUnlocked: [] } })
    expect(evaluateAchievements(below)).not.toContain('marathon')
  })

  it('early_bird se gana al completar el reto diario (isDailyChallenge)', () => {
    expect(evaluateAchievements(context({ isDailyChallenge: true }))).toContain('early_bird')
  })

  it('early_bird no se gana en una sesión normal ni sin contexto', () => {
    expect(evaluateAchievements(context())).not.toContain('early_bird')
    expect(evaluateAchievements(context({ isDailyChallenge: false }))).not.toContain('early_bird')
  })

  it('early_bird no se repite si ya está ganado', () => {
    const ctx = context({
      isDailyChallenge: true,
      profile: {
        totalStars: 5,
        totalExercises: 5,
        achievementsUnlocked: ['early_bird'],
      },
    })
    expect(evaluateAchievements(ctx)).not.toContain('early_bird')
  })

  it('los logros ya ganados no se devuelven dos veces', () => {
    const ctx = context({
      profile: {
        totalStars: 3,
        totalExercises: 10,
        achievementsUnlocked: ['first_step', 'perfect_session', 'no_hints_pro', 'streak_10', 'level_1_master', 'sharp_mind'],
      },
    })
    const result = evaluateAchievements(ctx)
    expect(result).not.toContain('first_step')
    expect(result).not.toContain('perfect_session')
    expect(result).not.toContain('no_hints_pro')
    expect(result).not.toContain('streak_10')
  })
})

describe('catálogo', () => {
  it('define al menos 10 logros con ids únicos', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10)
    const ids = new Set(ACHIEVEMENTS.map((achievement) => achievement.id))
    expect(ids.size).toBe(ACHIEVEMENTS.length)
  })

  it('todos los logros tienen clave de nombre y de descripción', () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.i18nKey).toMatch(/\.name$/)
      expect(achievement.descriptionKey).toMatch(/\.desc$/)
      expect(achievement.icon.length).toBeGreaterThan(0)
    }
  })
})