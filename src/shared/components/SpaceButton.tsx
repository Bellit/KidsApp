import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export type SpaceButtonVariant = 'primary' | 'secondary' | 'ghost'

interface SpaceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SpaceButtonVariant
  loading?: boolean
  icon?: ReactNode
}

const variantClass: Record<SpaceButtonVariant, string> = {
  primary: 'bg-planet-earth text-text-ink shadow-lg shadow-black/20 hover:bg-astral-sky',
  secondary: 'bg-planet-venus text-text-ink shadow-lg shadow-black/20 hover:bg-astral-rose',
  ghost: 'border-2 border-astral-sky/60 bg-transparent text-text-space hover:bg-white/10',
}

export function SpaceButton({
  variant = 'primary',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  type = 'button',
  ...rest
}: SpaceButtonProps) {
  const { t } = useTranslation()
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-6 py-3 font-display text-lg font-extrabold transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span aria-live="polite">{t('ui.loading')}</span>
        </>
      ) : (
        <>
          {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
          {children}
        </>
      )}
    </button>
  )
}