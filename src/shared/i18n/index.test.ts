import { describe, expect, it } from 'vitest'
import i18n, { resources } from './index'

describe('i18n setup', () => {
  it('registra es y en', () => {
    expect(i18n.languages).toContain('es')
    expect(i18n.languages).toContain('en')
  })
  it('usa español como fallback', () => {
    expect(i18n.options.fallbackLng).toEqual(['es'])
  })
  it('detecta el idioma sin dejar que el navegador mande', () => {
    const detection = i18n.options.detection as { order?: string[]; caches?: string[] }
    expect(detection.order).toEqual(['localStorage', 'htmlTag', 'navigator'])
    expect(detection.caches).toEqual(['localStorage'])
  })
  it('nunca devuelve cadenas vacías', () => {
    expect(i18n.options.returnEmptyString).toBe(false)
  })
  it('actualiza el lang del documento al cambiar de idioma', async () => {
    const previous = i18n.language
    const next = previous === 'es' ? 'en' : 'es'
    await i18n.changeLanguage(next)
    expect(document.documentElement.lang).toBe(next)
    await i18n.changeLanguage(previous)
  })
  it('expone las claves del shell', () => {
    expect(resources.es.common.nav.home).toBe('Inicio')
    expect(resources.es.common.app.title).toBe('KidsApp – Misión División')
    expect(resources.en.common.app.title).toBe('KidsApp – Division Mission')
  })
})

describe('i18n practice y settings resuelven sin prefijo de namespace', () => {
  const practiceKeys = [
    'title',
    'subtitle',
    'level',
    'level_name_1',
    'level_name_2',
    'level_name_3',
    'level_name_4',
    'level_name_5',
    'level_desc_1',
    'level_desc_2',
    'level_desc_3',
    'level_desc_4',
    'level_desc_5',
    'exercises_count',
    'start',
    'locked',
    'stars_earned',
    'select_level_hint',
    'session_progress',
    'input_quotient',
    'input_product',
    'input_remainder',
    'input_bring_down',
    'check',
    'delete',
    'hint',
    'session_complete',
    'stats_correct',
    'stats_errors',
    'stats_time',
    'stats_exercises',
    'repeat',
    'back_to_levels',
    'motivation_1',
    'motivation_2',
    'motivation_3',
    'new_record',
    'time_format',
  ]
  const settingsKeys = [
    'title',
    'language',
    'language_hint',
    'spanish',
    'english',
    'sound',
    'sound_hint',
    'sound_on',
    'sound_off',
    'saved',
  ]

  it.each(['es', 'en'])('no devuelve claves literales en practice (%s)', (lng) => {
    for (const key of practiceKeys) {
      expect(i18n.t(key, { ns: 'practice', lng })).not.toBe(key)
      expect(i18n.t(`practice.${key}`, { ns: 'practice', lng })).toBe(`practice.${key}`)
    }
  })

  it.each(['es', 'en'])('no devuelve claves literales en settings (%s)', (lng) => {
    for (const key of settingsKeys) {
      expect(i18n.t(key, { ns: 'settings', lng })).not.toBe(key)
      expect(i18n.t(`settings.${key}`, { ns: 'settings', lng })).toBe(`settings.${key}`)
    }
  })
})

describe('i18n games resuelven sin prefijo de namespace', () => {
  const gamesKeys = [
    'title',
    'subtitle',
    'timed_title',
    'timed_desc',
    'play_timed',
    'time_left',
    'score',
    'correct',
    'errors',
    'session_over',
    'play_again',
    'back_to_games',
    'best_score',
    'top_scores',
    'no_scores',
    'select_level_hint',
    'low_time_warning',
    'new_record',
    'daily_title',
    'daily_desc',
    'daily_play',
    'daily_completed_today',
    'daily_mixed_level',
    'daily_complete',
    'daily_extra_reward',
    'daily_achievement_earned',
    'daily_already_done',
  ]

  it.each(['es', 'en'])('no devuelve claves literales en games (%s)', (lng) => {
    for (const key of gamesKeys) {
      expect(i18n.t(key, { ns: 'games', lng })).not.toBe(key)
      expect(i18n.t(`games.${key}`, { ns: 'games', lng })).toBe(`games.${key}`)
    }
  })
})

describe('i18n profile resuelven sin prefijo de namespace', () => {
  const profileKeys = [
    'title',
    'subtitle',
    'stats_stars',
    'stats_exercises',
    'stats_levels',
    'stats_medals',
    'section_achievements',
    'section_records',
    'level_unlocked',
    'level_locked',
    'medal_earned',
    'medal_locked_hint',
    'reset_confirm',
    'reset',
    'reset_done',
    'no_medals',
    'records_best_score',
    'records_exercises',
  ]

  it.each(['es', 'en'])('no devuelve claves literales en profile (%s)', (lng) => {
    for (const key of profileKeys) {
      expect(i18n.t(key, { ns: 'profile', lng })).not.toBe(key)
      expect(i18n.t(`profile.${key}`, { ns: 'profile', lng })).toBe(`profile.${key}`)
    }
  })
})

describe('i18n achievements resuelven sin prefijo de namespace', () => {
  const achievementKeys = [
    'first_step.name',
    'first_step.desc',
    'perfect_session.name',
    'perfect_session.desc',
    'no_hints_pro.name',
    'no_hints_pro.desc',
    'level_1_master.name',
    'level_1_master.desc',
    'level_2_master.name',
    'level_2_master.desc',
    'level_3_master.name',
    'level_3_master.desc',
    'division_guru.name',
    'division_guru.desc',
    'streak_10.name',
    'streak_10.desc',
    'sharp_mind.name',
    'sharp_mind.desc',
    'resilient.name',
    'resilient.desc',
    'early_bird.name',
    'early_bird.desc',
    'marathon.name',
    'marathon.desc',
  ]

  it.each(['es', 'en'])('no devuelve claves literales en achievements (%s)', (lng) => {
    for (const key of achievementKeys) {
      expect(i18n.t(key, { ns: 'achievements', lng })).not.toBe(key)
      expect(i18n.t(`achievements.${key}`, { ns: 'achievements', lng })).toBe(`achievements.${key}`)
    }
  })
})