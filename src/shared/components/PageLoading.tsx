import { useTranslation } from 'react-i18next'
import { Mascot } from './Mascot'

export function PageLoading() {
  const { t } = useTranslation()
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <span className="block animate-float">
        <Mascot pose="idle" size={72} />
      </span>
      <span className="font-display text-xl font-extrabold text-astral-sky">{t('page.loading')}</span>
    </div>
  )
}
