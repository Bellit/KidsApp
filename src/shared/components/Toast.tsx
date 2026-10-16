import type { ReactNode } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  variant?: ToastVariant
  visible: boolean
  /** Icono/decoración opcional antes del mensaje (p. ej. la mascota celebrando). */
  icon?: ReactNode
}

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-astral-sky text-text-ink',
}

export function Toast({ message, variant = 'info', visible, icon }: ToastProps) {
  return (
    <div
      aria-live="polite"
      role="status"
      className={`pointer-events-none fixed left-1/2 top-20 z-50 w-auto -translate-x-1/2 transition-all duration-300 ${
        visible ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
      }`}
    >
      {message ? (
        <span
          className={`inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-5 text-base font-extrabold shadow-lg shadow-black/30 ${variantClass[variant]} ${icon ? '' : 'py-3 pl-5'}`}
        >
          {icon}
          {message}
        </span>
      ) : null}
    </div>
  )
}