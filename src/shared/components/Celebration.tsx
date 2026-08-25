import { useEffect, useMemo } from 'react'
import { mulberry32 } from '../utils/random'

interface CelebrationProps {
  active: boolean
  onEnded?: () => void
}

interface ConfettiPiece {
  left: number
  angle: number
  distance: number
  delay: number
  duration: number
  size: number
  rotate: number
  color: string
  round: boolean
}

const PIECE_COLORS = [
  '#f6d6a8',
  '#ffd9e8',
  '#bfe3ff',
  '#ffcfc4',
  '#e6d8ff',
  '#ffe4a8',
  '#a8c8f0',
  '#d5c3ff',
  '#ffc4de',
]

const PIECE_COUNT = 18

function buildPieces(): ConfettiPiece[] {
  const rand = mulberry32(2026)
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = (i / PIECE_COUNT) * Math.PI * 2
    return {
      left: rand() * 100,
      angle,
      distance: 60 + rand() * 140,
      delay: rand() * 0.4,
      duration: 0.9 + rand() * 0.5,
      size: 6 + rand() * 8,
      rotate: rand() * 360,
      color: PIECE_COLORS[Math.floor(rand() * PIECE_COLORS.length)],
      round: rand() > 0.5,
    }
  })
}

export function Celebration({ active, onEnded }: CelebrationProps) {
  const pieces = useMemo(buildPieces, [])
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    if (!active) return
    const timeout = window.setTimeout(() => onEnded?.(), reduced ? 200 : 1500)
    return () => window.clearTimeout(timeout)
  }, [active, onEnded, reduced])

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((piece, i) => {
        const style = reduced
          ? {
              left: `calc(50% + ${Math.cos(piece.angle) * piece.distance}px)`,
              top: `calc(50% + ${Math.sin(piece.angle) * piece.distance}px)`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate}deg)`,
            }
          : {
              left: `${piece.left}%`,
              top: '-5%',
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate}deg)`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }
        return (
          <span
            key={i}
            className={`confetti-piece ${reduced ? '' : 'confetti-fall'} ${piece.round ? 'rounded-full' : 'rounded-[2px]'}`}
            style={style}
          />
        )
      })}
    </div>
  )
}