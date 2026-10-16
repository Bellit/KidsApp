import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { evaluateAchievements } from '../../core/achievements/engine'
import { LEVELS } from '../../core/progression/levels'
import { localDateString } from '../../core/division/generator'

/** F4.4: estrellas extra que concede el reto diario al completarlo. */
export const DAILY_REWARD_STARS = 5

export interface LevelProgress {
  bestStars: number
  exercisesDone: number
  bestScore: number
  unlocked: boolean
}

export interface SessionStats {
  correct: number
  errors: number
  hintsUsed: number
  totalExercises: number
  secondsUsed: number
  stars: number
}

interface GameState {
  profile: {
    userId: string | null
    totalStars: number
    totalExercises: number
    achievementsUnlocked: string[]
  }
  levelProgress: Record<string, LevelProgress>
  settings: {
    soundMuted: boolean
    language: string | null
  }
  lastDailyRewardDate: string | null
  /** F4.3: récords del modo contrarreloj por nivel (top 5, ordenados desc). */
  timedScores: Record<string, number[]>
  /** Lecciones terminadas (ids), para marcarlas en el índice y sugerir la siguiente. */
  lessonsCompleted: number[]
  completeLesson: (lessonId: number) => void
  recordSession: (levelId: number, stats: SessionStats, options?: { isDailyChallenge?: boolean }) => void
  resetProgress: () => void
  unlockLevel: (levelId: number) => void
  unlockAchievements: (ids: string[]) => void
  isLevelUnlocked: (levelId: number) => boolean
  recordTimedScore: (levelId: number, score: number) => void
  getTimedBest: (levelId: number) => number | null
  getTimedTop5: (levelId: number) => number[]
  /** F4.4: reclama el premio del reto diario (+5 estrellas). Solo una vez por día. */
  claimDailyReward: (dateStr?: string) => boolean
  /** F4.4: ¿se reclamó el premio del reto diario en la fecha indicada (hoy por defecto)? */
  isDailyRewardClaimedToday: (dateStr?: string) => boolean
}

// Estado inicial del progreso. Los ajustes (sonido/idioma) se conservan al
// reiniciar porque son preferencias del dispositivo, no progreso del jugador.
const initialProgress = {
  profile: {
    userId: null,
    totalStars: 0,
    totalExercises: 0,
    achievementsUnlocked: [] as string[],
  },
  levelProgress: {} as Record<string, LevelProgress>,
  lastDailyRewardDate: null as string | null,
  timedScores: {} as Record<string, number[]>,
  lessonsCompleted: [] as number[],
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      settings: { soundMuted: false, language: null },

      recordSession: (levelId, stats, options) => {
        set((state) => {
          const key = String(levelId)
          const prev = state.levelProgress[key] ?? {
            bestStars: 0,
            exercisesDone: 0,
            bestScore: 0,
            unlocked: true,
          }
          const nextProgress: Record<string, LevelProgress> = {
            ...state.levelProgress,
            [key]: {
              // bestStars y bestScore conservan el máximo histórico de la sesión.
              bestStars: Math.max(prev.bestStars, stats.stars),
              exercisesDone: prev.exercisesDone + stats.totalExercises,
              bestScore: Math.max(prev.bestScore, stats.correct),
              unlocked: true,
            },
          }

          // Con >= 2 estrellas se desbloquea el nivel siguiente.
          if (stats.stars >= 2) {
            const nextKey = String(levelId + 1)
            const nextPrev = state.levelProgress[nextKey] ?? {
              bestStars: 0,
              exercisesDone: 0,
              bestScore: 0,
              unlocked: false,
            }
            nextProgress[nextKey] = { ...nextPrev, unlocked: true }
          }

          // F4.2: los logros se evalúan con el contexto del estado NUEVO y se
          // persisten en el MISMO update de estado para evitar dobles renders.
          const nextProfile = {
            ...state.profile,
            totalStars: state.profile.totalStars + stats.stars,
            totalExercises: state.profile.totalExercises + stats.totalExercises,
          }
          const newAchievements = evaluateAchievements({
            levelId,
            stats,
            levelProgress: nextProgress,
            profile: nextProfile,
            // F4.4: el reto diario marca `isDailyChallenge` para que la
            // evaluación conceda early_bird al completar el reto.
            isDailyChallenge: options?.isDailyChallenge === true,
          })

          return {
            levelProgress: nextProgress,
            profile:
              newAchievements.length > 0
                ? {
                    ...nextProfile,
                    achievementsUnlocked: [...nextProfile.achievementsUnlocked, ...newAchievements],
                  }
                : nextProfile,
          }
        })
      },

      completeLesson: (lessonId) => {
        set((state) =>
          state.lessonsCompleted.includes(lessonId)
            ? state
            : { lessonsCompleted: [...state.lessonsCompleted, lessonId] },
        )
      },

      resetProgress: () => {
        set((state) => ({ ...initialProgress, settings: state.settings }))
      },

      unlockLevel: (levelId) => {
        set((state) => {
          const key = String(levelId)
          const prev = state.levelProgress[key] ?? {
            bestStars: 0,
            exercisesDone: 0,
            bestScore: 0,
            unlocked: false,
          }
          return { levelProgress: { ...state.levelProgress, [key]: { ...prev, unlocked: true } } }
        })
      },

      // F4.2: desbloqueo manual de logros sin duplicados. La UI de perfil (F4.5)
      // puede usarlo para conceder medallas importadas o fuera de sesión.
      unlockAchievements: (ids) => {
        set((state) => {
          const merged = [...state.profile.achievementsUnlocked]
          for (const id of ids) {
            if (!merged.includes(id)) merged.push(id)
          }
          return { profile: { ...state.profile, achievementsUnlocked: merged } }
        })
      },

      // F4.1: desbloqueo real por progreso.
      // - El nivel 1 (Mercurio) siempre está desbloqueado: es el punto de partida.
      // - Un nivel que no existe en LEVELS (fuera de rango) se considera bloqueado.
      // - Un nivel N>1 está desbloqueado si tiene `unlocked: true` explícito o si
      //   ya tiene progreso guardado (grandfathering): los jugadores de fases
      //   previas conservan el acceso aunque su `unlocked` no estuviera marcado.
      isLevelUnlocked: (levelId) => {
        if (!LEVELS.some((level) => level.id === levelId)) return false
        if (levelId === 1) return true
        const progress = get().levelProgress[String(levelId)]
        return (
          progress?.unlocked === true ||
          (progress?.exercisesDone ?? 0) > 0 ||
          (progress?.bestStars ?? 0) > 0
        )
      },

      // F4.3: inserta la puntuación ordenada desc y conserva solo el top 5
      // del nivel. Las puntuaciones repetidas se mantienen (cada intento
      // cuenta como una entrada del ranking).
      recordTimedScore: (levelId, score) => {
        set((state) => {
          const key = String(levelId)
          const prev = state.timedScores[key] ?? []
          const next = [...prev, score].sort((a, b) => b - a).slice(0, 5)
          return { timedScores: { ...state.timedScores, [key]: next } }
        })
      },

      getTimedBest: (levelId) => {
        const list = get().timedScores[String(levelId)] ?? []
        return list.length > 0 ? list[0] : null
      },

      getTimedTop5: (levelId) => get().timedScores[String(levelId)] ?? [],

      // F4.4: premio del reto diario (+5 estrellas), una sola vez por día local.
      // `dateStr` permite inyectar la fecha en los tests (formato YYYY-MM-DD);
      // en producción se usa la fecha local de hoy vía localDateString().
      claimDailyReward: (dateStr = localDateString()) => {
        const state = get()
        if (state.lastDailyRewardDate === dateStr) return false
        set({
          lastDailyRewardDate: dateStr,
          profile: {
            ...state.profile,
            totalStars: state.profile.totalStars + DAILY_REWARD_STARS,
          },
        })
        return true
      },

      // F4.4: compara el último reclamo con la fecha indicada (hoy por defecto).
      isDailyRewardClaimedToday: (dateStr = localDateString()) =>
        get().lastDailyRewardDate === dateStr,
    }),
    {
      name: 'kidsapp:progress',
      // `lessonsCompleted` se añadió después: el progreso guardado sin ese campo
      // toma el valor inicial ([]) al fusionarse, así que tampoco hace falta migrar.
      // F4.1: la forma de los datos persistidos no cambia (solo el comportamiento
      // del getter isLevelUnlocked), así que no se necesita migración ni bump de
      // versión. Se mantiene la versión 1 para preservar el progreso existente.
      version: 1,
    },
  ),
)