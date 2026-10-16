import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { SpaceButton } from './SpaceButton'

interface ExitSessionButtonProps {
  /** Ruta a la que se vuelve al confirmar la salida. */
  to: string
}

/** Botón "Salir" de una sesión: pide confirmación para no perder la misión sin querer. */
export function ExitSessionButton({ to }: ExitSessionButtonProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-white/20 px-4 font-display text-base font-extrabold text-text-space/85 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
        {t('session.exit')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('session.exit_title')}>
        <p className="text-lg font-semibold">{t('session.exit_body')}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <SpaceButton variant="primary" onClick={() => setOpen(false)}>
            {t('session.exit_stay')}
          </SpaceButton>
          <SpaceButton variant="secondary" onClick={() => navigate(to)}>
            {t('session.exit_confirm')}
          </SpaceButton>
        </div>
      </Modal>
    </>
  )
}
