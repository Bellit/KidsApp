import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type SoundKind = 'click' | 'correct' | 'incorrect' | 'celebrate'

const SOUND_STORAGE_KEY = 'kidsapp:sound:muted'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }
  return audioContext
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  endFrequency?: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  if (endFrequency && endFrequency !== frequency) {
    osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
  }
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

export function useSound() {
  const [muted, setMuted] = useLocalStorage<boolean>(SOUND_STORAGE_KEY, false)

  const play = useCallback(
    (kind: SoundKind) => {
      if (muted) return
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') void ctx.resume()
      const now = ctx.currentTime
      switch (kind) {
        case 'click':
          tone(ctx, 600, now, 0.08, 'square', 0.05)
          break
        case 'correct':
          tone(ctx, 523, now, 0.12, 'sine', 0.08)
          tone(ctx, 659, now + 0.13, 0.12, 'sine', 0.08)
          break
        case 'incorrect':
          tone(ctx, 200, now, 0.2, 'triangle', 0.06)
          break
        case 'celebrate': {
          const notes = [523, 659, 784, 1047]
          notes.forEach((freq, i) => tone(ctx, freq, now + i * 0.15, 0.15, 'sine', 0.08))
          break
        }
      }
    },
    [muted],
  )

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev)
  }, [setMuted])

  return { play, muted, toggleMuted }
}