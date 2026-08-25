/**
 * Catálogo de logros (medallas) de KidsApp.
 * F4.2: los logros son lógica pura. Aquí solo se definen los ítems del
 * catálogo (metadatos + claves i18n); la evaluación de condiciones vive en
 * engine.ts.
 */

export type AchievementId =
  | 'first_step'
  | 'perfect_session'
  | 'no_hints_pro'
  | 'level_1_master'
  | 'level_2_master'
  | 'level_3_master'
  | 'division_guru'
  | 'streak_10'
  | 'sharp_mind'
  | 'resilient'
  | 'early_bird'
  | 'marathon'

export interface Achievement {
  id: AchievementId
  /** Clave i18n del nombre (se traduce con t('...')). */
  i18nKey: string
  /** Clave i18n de la descripción (se traduce con t('...')). */
  descriptionKey: string
  /** Identificador de variante para MedalIcon. */
  icon: string
  /** Logros ocultos: no se muestran en la lista de medallas bloqueadas. */
  hidden?: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    i18nKey: 'first_step.name',
    descriptionKey: 'first_step.desc',
    icon: 'rocket',
  },
  {
    id: 'perfect_session',
    i18nKey: 'perfect_session.name',
    descriptionKey: 'perfect_session.desc',
    icon: 'star',
  },
  {
    id: 'no_hints_pro',
    i18nKey: 'no_hints_pro.name',
    descriptionKey: 'no_hints_pro.desc',
    icon: 'brain',
  },
  {
    id: 'level_1_master',
    i18nKey: 'level_1_master.name',
    descriptionKey: 'level_1_master.desc',
    icon: 'planet',
  },
  {
    id: 'level_2_master',
    i18nKey: 'level_2_master.name',
    descriptionKey: 'level_2_master.desc',
    icon: 'planet',
  },
  {
    id: 'level_3_master',
    i18nKey: 'level_3_master.name',
    descriptionKey: 'level_3_master.desc',
    icon: 'planet',
  },
  {
    id: 'division_guru',
    i18nKey: 'division_guru.name',
    descriptionKey: 'division_guru.desc',
    icon: 'award',
  },
  {
    id: 'streak_10',
    i18nKey: 'streak_10.name',
    descriptionKey: 'streak_10.desc',
    icon: 'bolt',
  },
  {
    id: 'sharp_mind',
    i18nKey: 'sharp_mind.name',
    descriptionKey: 'sharp_mind.desc',
    icon: 'clock',
  },
  {
    id: 'resilient',
    i18nKey: 'resilient.name',
    descriptionKey: 'resilient.desc',
    icon: 'heart',
  },
  {
    id: 'early_bird',
    i18nKey: 'early_bird.name',
    descriptionKey: 'early_bird.desc',
    icon: 'sun',
    hidden: true,
  },
  {
    id: 'marathon',
    i18nKey: 'marathon.name',
    descriptionKey: 'marathon.desc',
    icon: 'trophy',
  },
]