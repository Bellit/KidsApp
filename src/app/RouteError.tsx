import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Mascot, SpaceButton } from '../shared/components'
import { isChunkLoadError, reloadOnce } from './reloadOnce'

/** Pantalla de error amable: sustituye al mensaje técnico de React Router. */
export function RouteError() {
  const { t } = useTranslation()
  const error = useRouteError()
  const outdated = isChunkLoadError(error)

  useEffect(() => {
    // Versión vieja en memoria: recargar suele bastar y el niño ni lo nota.
    if (outdated) reloadOnce()
  }, [outdated])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-space-bg p-4 text-text-space">
      <section className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-white/10 bg-space-bg-soft p-8 text-center shadow-lg shadow-black/20">
        <Mascot pose="idle" size={72} />
        <h1 className="font-display text-2xl font-extrabold">{t('page.error_title')}</h1>
        <p className="text-lg font-semibold text-text-space/80">
          {outdated ? t('page.error_outdated') : t('page.error_hint')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <SpaceButton onClick={() => window.location.reload()}>{t('page.reload')}</SpaceButton>
          <Link
            to="/"
            reloadDocument
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-astral-sky/60 px-6 py-3 font-display text-lg font-extrabold text-text-space transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun"
          >
            {t('page.back_home')}
          </Link>
        </div>
      </section>
    </div>
  )
}
