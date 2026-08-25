import { useTranslation } from 'react-i18next'

export function PageLoading() {
  const { t } = useTranslation()
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] items-center justify-center text-lg font-bold text-astral-sky">
      {t('page.loading')}
    </div>
  )
}