export type MascotPose = 'wave' | 'cheer' | 'idle'

interface MascotProps {
  /** Postura de los brazos: saludando, celebrando o neutra. */
  pose?: MascotPose
  /** 'bust' recorta a cabeza/cuerpo sin brazos ni antena (para avatares pequeños). */
  variant?: 'full' | 'bust'
  /** Tamaño base en px (ancho); el alto se deriva de las proporciones del personaje. */
  size?: number
  className?: string
}

const ARM_ANGLES: Record<MascotPose, { left: number; right: number }> = {
  wave: { left: -55, right: 18 },
  cheer: { left: -100, right: 100 },
  idle: { left: -20, right: 20 },
}

const bodyGradient = 'linear-gradient(160deg,#ffffff,#dbe6ff 70%)'

/** Compañero robot-astronauta decorativo del tema espacial (no interactivo). */
export function Mascot({ pose = 'idle', variant = 'full', size = 60, className = '' }: MascotProps) {
  const height = size * 1.1
  const angles = ARM_ANGLES[pose]

  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height }}>
      <span
        className="absolute"
        style={{
          left: size * 0.1,
          top: size * 0.23,
          width: size * 0.8,
          height: size * 0.77,
          borderRadius: '46% 46% 50% 50% / 56% 56% 44% 44%',
          background: bodyGradient,
          boxShadow: '0 10px 18px rgba(0,0,0,.35)',
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          left: size * 0.25,
          top: size * 0.4,
          width: size * 0.5,
          height: size * 0.37,
          background: 'radial-gradient(circle at 35% 30%,#2c3b66,#101b38)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.12)',
        }}
      />
      <span
        className="absolute rounded-full bg-[#eaf3ff]"
        style={{ left: size * 0.35, top: size * 0.52, width: size * 0.1, height: size * 0.13 }}
      />
      <span
        className="absolute rounded-full bg-[#eaf3ff]"
        style={{ left: size * 0.55, top: size * 0.52, width: size * 0.1, height: size * 0.13 }}
      />
      {variant === 'full' ? (
        <>
          <span
            className="absolute rounded-[3px] bg-[#dbe6ff]"
            style={{ left: size * 0.47, top: size * 0.1, width: 3, height: size * 0.17 }}
          />
          <span
            className="absolute rounded-full bg-astral-sun"
            style={{
              left: size * 0.42,
              top: 0,
              width: size * 0.15,
              height: size * 0.15,
              boxShadow: '0 0 10px 3px rgba(255,209,102,.85)',
            }}
          />
          <span
            className="absolute"
            style={{
              left: 0,
              top: size * 0.27,
              width: size * 0.15,
              height: size * 0.33,
              borderRadius: 10,
              background: bodyGradient,
              boxShadow: '0 4px 8px rgba(0,0,0,.25)',
              transform: `rotate(${angles.left}deg)`,
            }}
          />
          <span
            className="absolute"
            style={{
              left: size * 0.7,
              top: size * 0.27,
              width: size * 0.15,
              height: size * 0.33,
              borderRadius: 10,
              background: bodyGradient,
              boxShadow: '0 4px 8px rgba(0,0,0,.25)',
              transform: `rotate(${angles.right}deg)`,
            }}
          />
        </>
      ) : null}
    </span>
  )
}
