interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div className="w-full">
      {label ? <p className="mb-1 text-sm font-bold text-text-space/80">{label}</p> : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-4 w-full overflow-hidden rounded-full bg-space-bg-soft ring-1 ring-white/10"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-planet-earth to-astral-lilac transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}