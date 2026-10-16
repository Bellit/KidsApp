import { SECTION_ICON_PATHS, type SectionId } from './sectionIcons'

interface SectionIconProps {
  id: SectionId
  className?: string
}

export function SectionIcon({ id, className = 'h-6 w-6' }: SectionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {SECTION_ICON_PATHS[id]}
    </svg>
  )
}
