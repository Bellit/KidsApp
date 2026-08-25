import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // El foco inicial va al diálogo para que el lector anuncie el título.
    dialogRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const activeInside = dialog.contains(active)
      // El diálogo con tabIndex={-1} no es un foco "real": al pulsar Tab sobre
      // él se inicia el recorrido por el primer control.
      const onDialogItself = active === dialog
      // Trampa de foco: Tab/Shift+Tab se encierran en el diálogo (y rebotan).
      if (event.shiftKey && (!activeInside || active === first || onDialogItself)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!activeInside || active === last || onDialogItself)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      // Al cerrar se devuelve el foco al elemento que abrió el modal.
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-pop relative w-full max-w-md rounded-3xl bg-space-surface p-6 text-text-ink shadow-2xl focus-visible:outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('ui.close')}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-text-ink/60 transition-colors hover:bg-astral-lilac hover:text-text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <h2 id={titleId} className="font-display text-2xl font-extrabold">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body,
  )
}