interface RankBadgeProps {
  /** Puesto en el ranking, empezando en 1. */
  rank: number
}

const RANK_GRADIENT: Record<number, string> = {
  1: 'linear-gradient(160deg,#ffe9c2,#f3a94f)',
  2: 'linear-gradient(160deg,#eef1f6,#b9c3d1)',
  3: 'linear-gradient(160deg,#f0d3b8,#c98a52)',
}

/** Medalla circular de puesto (oro/plata/bronce para el top 3, chip neutro después). */
export function RankBadge({ rank }: RankBadgeProps) {
  const gradient = RANK_GRADIENT[rank]
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${
        gradient ? 'text-text-ink' : 'bg-white/10 text-text-space/70'
      }`}
      style={gradient ? { background: gradient } : undefined}
    >
      {rank}
    </span>
  )
}
