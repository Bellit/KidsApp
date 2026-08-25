/**
 * Engine de logros: evalúa una sesión recién terminada contra el catálogo y
 * devuelve SOLO los logros NUEVOS desbloqueados. Los ya ganados se descartan
 * automáticamente mirando profile.achievementsUnlocked.
 * Lógica pura y testeable, sin dependencias de React ni del store en runtime
 * (los tipos de gameStore se importan solo a nivel de tipo, se borran al compilar).
 */
import type { LevelProgress, SessionStats } from '../../shared/store/gameStore'
import { LEVELS } from '../progression/levels'
import { ACHIEVEMENTS, type AchievementId } from './definitions'

export interface AchievementContext {
  levelId: number
  stats: SessionStats
  levelProgress: Record<string, LevelProgress>
  profile: {
    totalStars: number
    totalExercises: number
    achievementsUnlocked: string[]
  }
  /**
   * F4.4: true cuando la sesión es el reto diario. Es el único mecanismo que
   * concede `early_bird`; lo marca `recordSession` con `{ isDailyChallenge }`.
   */
  isDailyChallenge?: boolean
}

type AchievementCondition = (context: AchievementContext) => boolean

// Condiciones de desbloqueo. Cada una es una función pura e independiente.
// DOCUMENTACIÓN de condiciones no triviales:
// - first_step: se gana con la primera sesión (totalExercises >= 1). Si un
//   perfil importado ya tiene progreso, se concede retroactivamente.
// - streak_10: una sesión de >= 10 ejercicios cuenta como "racha de 10"
//   aunque haya errores; el nombre describe el tamaño de la sesión, no la
//   precisión.
// - early_bird (F4.4): se gana SOLO al COMPLETAR el reto diario. El flag
//   `isDailyChallenge` del contexto lo marca recordSession cuando la página
//   del reto cierra la sesión. La condición no mira la fecha a propósito:
//   el "1 por día" lo garantiza el store (claimDailyReward + lastDailyRewardDate),
//   y la evaluación con contexto puro queda testeable en aislamiento.
export const achievementConditions: Record<AchievementId, AchievementCondition> = {
  first_step: (context) => context.profile.totalExercises >= 1,
  perfect_session: (context) => context.stats.stars === 3,
  no_hints_pro: (context) => context.stats.hintsUsed === 0,
  level_1_master: (context) => context.levelId === 1 && context.stats.stars === 3,
  level_2_master: (context) => context.levelId === 2 && context.stats.stars === 3,
  level_3_master: (context) => context.levelId === 3 && context.stats.stars === 3,
  division_guru: (context) =>
    LEVELS.every((level) => context.levelProgress[String(level.id)]?.bestStars === 3),
  streak_10: (context) => context.stats.totalExercises >= 10,
  sharp_mind: (context) => context.stats.secondsUsed < 60,
  resilient: (context) => context.stats.errors >= 1 && context.stats.stars >= 2,
  // F4.4: logro activado para el reto diario (ver documentación de arriba).
  early_bird: (context) => context.isDailyChallenge === true,
  marathon: (context) => context.profile.totalExercises >= 100,
}

export function evaluateAchievements(context: AchievementContext): AchievementId[] {
  const alreadyUnlocked = new Set(context.profile.achievementsUnlocked)
  return ACHIEVEMENTS.filter((achievement) => {
    if (alreadyUnlocked.has(achievement.id)) return false
    return achievementConditions[achievement.id](context)
  }).map((achievement) => achievement.id)
}