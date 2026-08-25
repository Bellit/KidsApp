import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { SpaceButton } from './SpaceButton'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallPrompt() {
  const { t } = useTranslation('common')
  const { canInstall, showIOSHint, promptInstall, dismiss } = useInstallPrompt()
  const open = canInstall || showIOSHint

  return (
    <Modal open={open} onClose={dismiss} title={t('install.title')}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-astral-sky to-astral-lilac text-text-ink shadow-lg shadow-black/20"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
        <p className="text-base font-semibold leading-relaxed text-text-ink/80">
          {showIOSHint ? t('install.ios_hint') : t('install.description')}
        </p>
        <div className="mt-2 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <SpaceButton variant="secondary" className="w-full sm:w-auto" onClick={dismiss}>
            {t('install.later')}
          </SpaceButton>
          {canInstall ? (
            <SpaceButton className="w-full sm:w-auto" onClick={() => void promptInstall()}>
              {t('install.action')}
            </SpaceButton>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
