import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { SectionIcon } from '../../shared/components/SectionIcon'
import type { SectionId } from '../../shared/components/sectionIcons'

interface NavItem {
  to: string
  section: SectionId
  labelKey: string
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', section: 'home', labelKey: 'nav.home', end: true },
  { to: '/lessons', section: 'lessons', labelKey: 'nav.lessons' },
  { to: '/practice', section: 'practice', labelKey: 'nav.practice' },
  { to: '/games', section: 'games', labelKey: 'nav.games' },
  { to: '/profile', section: 'profile', labelKey: 'nav.profile' },
]

export function TopNav() {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('a11y.main_nav')} className="hidden border-t border-white/10 md:block">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-4 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-2xl px-3 py-2 text-base font-bold transition-colors ${
                isActive ? 'bg-astral-lilac text-text-ink' : 'text-text-space/80 hover:bg-white/10 hover:text-text-space'
              }`
            }
          >
            <SectionIcon id={item.section} className="h-5 w-5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('a11y.main_nav')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-space-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 px-1 py-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1 text-sm font-bold transition-colors ${
                isActive ? 'bg-astral-lilac text-text-ink' : 'text-text-space/75'
              }`
            }
          >
            <SectionIcon id={item.section} className="h-6 w-6" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
