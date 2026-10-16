import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { PlanetOrb } from './PlanetOrb'
import { SpaceButton } from './SpaceButton'
import { PLANET_STAGE_ICONS, type PlanetColor } from './planetTokens'

interface LevelLaunchModalProps {
  open: boolean
  onClose: () => void
  color: PlanetColor
  name: string
  description: string
  launchLabel: string
  onLaunch: () => void
  /** Opciones extra antes de despegar (p. ej. número de ejercicios). */
  children?: ReactNode
}

/** Panel que aparece al tocar un planeta: todo lo necesario para empezar está a la vista. */
export function LevelLaunchModal({
  open,
  onClose,
  color,
  name,
  description,
  launchLabel,
  onLaunch,
  children,
}: LevelLaunchModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={name}>
      <div className="flex flex-col items-center gap-4 text-center">
        <PlanetOrb color={color} icon={PLANET_STAGE_ICONS[color]} className="h-20 w-20" iconClassName="h-9 w-9" />
        <p className="text-lg font-semibold">{description}</p>
        {children}
        <SpaceButton onClick={onLaunch} className="w-full text-xl">
          {launchLabel}
        </SpaceButton>
      </div>
    </Modal>
  )
}
