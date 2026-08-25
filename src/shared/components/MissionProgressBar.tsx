interface MissionProgressBarProps {
  value: number
  label?: string
}

/** Barra de progreso con un cohete recorriendo la trayectoria (pantallas de ejercicios). */
export function MissionProgressBar({ value, label }: MissionProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div className="w-full">
      {label ? <p className="mb-3 text-sm font-bold text-text-space/80">{label}</p> : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="relative h-7 w-full"
      >
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-space-bg-soft ring-1 ring-white/10" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-astral-sun to-astral-sky transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
        <div
          className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-text-ink shadow-md shadow-black/40 transition-[left] duration-500 ease-out"
          style={{
            left: `${clamped}%`,
            background: 'radial-gradient(circle at 32% 28%, #fff, #cfe0ff 60%)',
            boxShadow: '0 4px 10px rgba(0,0,0,.35), 0 0 10px rgba(94,200,255,.5)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
