import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Mascot, SpaceButton, Toast } from '../shared/components'
import { useSound } from '../shared/hooks/useSound'

type LanguageCode = 'es' | 'en'

const SETTING_ICON_PATHS: Record<'globe' | 'speaker', ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  speaker: (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
}

function SettingIcon({ name }: { name: 'globe' | 'speaker' }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-text-ink"
      style={{ background: 'linear-gradient(160deg,#d8f0ff,#4fb3f5)' }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {SETTING_ICON_PATHS[name]}
      </svg>
    </span>
  )
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const { play, muted, toggleMuted } = useSound()
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const showSavedToast = () => {
    setToastVisible(true)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastVisible(false), 2000)
  }

  const handleLanguageChange = (lng: LanguageCode) => {
    play('click')
    void i18n.changeLanguage(lng)
    showSavedToast()
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Mascot pose="idle" size={52} />
        <h1 className="font-display text-2xl font-extrabold text-text-space sm:text-3xl">{t('title')}</h1>
      </header>

      <section className="rounded-3xl border border-white/10 bg-space-bg-soft p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <SettingIcon name="globe" />
          <h2 className="font-display text-xl font-extrabold text-text-space">{t('language')}</h2>
        </div>
        <p className="mt-2 text-base font-semibold text-text-space/70">{t('language_hint')}</p>
        <div role="group" aria-label={t('language')} className="mt-4 flex flex-wrap gap-3">
          <SpaceButton
            variant={i18n.language === 'es' ? 'primary' : 'secondary'}
            aria-pressed={i18n.language === 'es'}
            onClick={() => handleLanguageChange('es')}
          >
            {t('spanish')}
          </SpaceButton>
          <SpaceButton
            variant={i18n.language === 'en' ? 'primary' : 'secondary'}
            aria-pressed={i18n.language === 'en'}
            onClick={() => handleLanguageChange('en')}
          >
            {t('english')}
          </SpaceButton>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-space-bg-soft p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <SettingIcon name="speaker" />
          <h2 className="font-display text-xl font-extrabold text-text-space">{t('sound')}</h2>
        </div>
        <p className="mt-2 text-base font-semibold text-text-space/70">{t('sound_hint')}</p>
        <div className="mt-4">
          <SpaceButton
            variant={muted ? 'secondary' : 'primary'}
            aria-pressed={!muted}
            onClick={() => {
              play('click')
              toggleMuted()
              showSavedToast()
            }}
          >
            {muted ? t('sound_off') : t('sound_on')}
          </SpaceButton>
        </div>
      </section>

      <Toast message={t('saved')} variant="success" visible={toastVisible} />
    </div>
  )
}
