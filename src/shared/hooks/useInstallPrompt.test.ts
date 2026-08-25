import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from './useInstallPrompt'

const DISMISSED_STORAGE_KEY = 'kidsapp:install-prompt:dismissed'

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

describe('useInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('no muestra el prompt si la app ya está instalada (standalone)', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.canInstall).toBe(false)
    expect(result.current.showIOSHint).toBe(false)
  })

  it('captura beforeinstallprompt y promptInstall llama al evento guardado', async () => {
    mockMatchMedia(false)
    const prompt = vi.fn().mockResolvedValue(undefined)
    const evt = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(evt, {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
    })

    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      window.dispatchEvent(evt)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.promptInstall()
    })
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(result.current.canInstall).toBe(false)
  })

  it('dismiss memoriza "Ahora no" y no vuelve a mostrar en otra instancia', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      result.current.dismiss()
    })
    expect(result.current.canInstall).toBe(false)
    expect(localStorage.getItem(DISMISSED_STORAGE_KEY)).not.toBeNull()

    const second = renderHook(() => useInstallPrompt())
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(second.result.current.canInstall).toBe(false)
    expect(second.result.current.showIOSHint).toBe(false)
  })

  it('en iOS (sin beforeinstallprompt) muestra la pista de instalación', () => {
    mockMatchMedia(false)
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' })
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.canInstall).toBe(false)
    expect(result.current.showIOSHint).toBe(true)
  })
})
