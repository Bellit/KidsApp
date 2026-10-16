import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TopNav } from './AppNav'

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const TITLE_CLASS = 'flex items-center gap-2 font-display text-lg font-extrabold text-astral-sky md:text-xl'

function HeaderTitle() {
  const { t } = useTranslation()
  return (
    <>
      <span aria-hidden="true" className="h-3 w-3 rounded-full bg-astral-sun shadow-[0_0_10px_2px_rgba(255,228,168,0.7)]" />
      <span className="sm:hidden">{t('app.short_title')}</span>
      <span className="hidden sm:inline">{t('app.title')}</span>
    </>
  )
}

export function Header({ showNav = true }: { showNav?: boolean }) {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-10 bg-space-bg/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        {showNav ? (
          <NavLink to="/" end className={TITLE_CLASS}>
            <HeaderTitle />
          </NavLink>
        ) : (
          <span className={TITLE_CLASS}>
            <HeaderTitle />
          </span>
        )}
        {showNav ? (
          <nav aria-label={t('a11y.header_actions')} className="flex items-center gap-2">
            <NavLink
              to="/settings"
              aria-label={t('nav.settings')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-planet-mercury text-text-ink shadow-md shadow-black/20 transition-transform hover:scale-105 hover:rotate-12"
            >
              <GearIcon />
            </NavLink>
          </nav>
        ) : (
          // Misma altura que el engranaje para que la cabecera no salte.
          <span aria-hidden="true" className="h-11" />
        )}
      </div>
      {showNav ? <TopNav /> : null}
    </header>
  )
}