import { useTranslation } from 'react-i18next'

interface StarBadgeProps {
  count: number
  size?: 'sm' | 'md'
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`h-full w-full ${filled ? 'text-amber-400' : 'text-text-ink/25'}`}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function StarBadge({ count, size = 'md' }: StarBadgeProps) {
  const { t } = useTranslation()
  const filledCount = Math.min(Math.max(count, 0), 3)
  const boxSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <span
      aria-label={t('ui.stars_rating', { count: filledCount })}
      className="inline-flex items-center gap-1"
      role="img"
    >
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={`${boxSize} shrink-0`}>
          <Star filled={i < filledCount} />
        </span>
      ))}
    </span>
  )
}