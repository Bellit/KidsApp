import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-3xl bg-space-surface p-8 text-center text-text-ink shadow-lg shadow-black/20">
      <h1 className="font-display text-3xl font-extrabold">{t('page.not_found')}</h1>
      <p className="text-lg font-semibold text-text-ink/70">{t('page.not_found_hint')}</p>
      <Link to="/" className="mt-2 rounded-full bg-planet-earth px-6 py-3 font-bold text-text-ink transition-transform hover:scale-105">
        {t('page.back_home')}
      </Link>
    </section>
  )
}