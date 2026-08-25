import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import esCommon from './locales/es/common.json'
import esLessons from './locales/es/lessons.json'
import esPractice from './locales/es/practice.json'
import esGames from './locales/es/games.json'
import esProfile from './locales/es/profile.json'
import esSettings from './locales/es/settings.json'
import esAchievements from './locales/es/achievements.json'
import enCommon from './locales/en/common.json'
import enLessons from './locales/en/lessons.json'
import enPractice from './locales/en/practice.json'
import enGames from './locales/en/games.json'
import enProfile from './locales/en/profile.json'
import enSettings from './locales/en/settings.json'
import enAchievements from './locales/en/achievements.json'

export const resources = {
  es: {
    common: esCommon,
    lessons: esLessons,
    practice: esPractice,
    games: esGames,
    profile: esProfile,
    settings: esSettings,
    achievements: esAchievements,
  },
  en: {
    common: enCommon,
    lessons: enLessons,
    practice: enPractice,
    games: enGames,
    profile: enProfile,
    settings: enSettings,
    achievements: enAchievements,
  },
} as const

export const defaultNS = 'common'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackNS: 'common',
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
    },
    returnEmptyString: false,
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng
})

export default i18n