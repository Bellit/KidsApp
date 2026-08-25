import { useTranslation } from 'react-i18next'

interface PagePlaceholderProps {
  title: string
  subtitle?: string
}

export function PagePlaceholder({ title, subtitle }: PagePlaceholderProps) {
  const { t } = useTranslation()
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-3xl bg-space-surface p-8 text-center text-text-ink shadow-lg shadow-black/20">
      <span aria-hidden="true" className="h-16 w-16 rounded-full bg-gradient-to-br from-planet-earth to-astral-lilac" />
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      {subtitle ? <p className="text-lg font-semibold text-text-ink/70">{subtitle}</p> : null}
      <p className="text-sm font-bold uppercase tracking-wide text-text-ink/50">{t('page.under_construction')}</p>
    </section>
  )
}