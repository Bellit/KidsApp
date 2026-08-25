import { useCallback, useEffect, useState } from 'react'

// Evento `beforeinstallprompt` expuesto por Chromium, Edge y Samsung Internet.
// No existe en iOS Safari ni Firefox.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface UseInstallPromptResult {
  /** True si la app es instalable por prompt web y el modal debe mostrarse. */
  canInstall: boolean
  /** True en iOS (sin beforeinstallprompt): mostrar la pista de "Añadir a pantalla de inicio". */
  showIOSHint: boolean
  /** Lanza el diálogo nativo de instalación guardando el evento capturado. */
  promptInstall: () => Promise<void>
  /** Cierra el prompt y recuerda "Ahora no" durante 30 días. */
  dismiss: () => void
}

const DISMISSED_STORAGE_KEY = 'kidsapp:install-prompt:dismissed'
const DISMISSED_DAYS = 30
const SHOW_DELAY_MS = 2000
const MS_PER_DAY = 24 * 60 * 60 * 1000

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const displayStandalone = window.matchMedia?.('(display-mode: standalone)').matches
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  return Boolean(displayStandalone || iosStandalone)
}

function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function hasDismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISSED_STORAGE_KEY)
    if (!raw) return false
    const { at } = JSON.parse(raw) as { at?: string }
    if (!at) return false
    return Date.now() - new Date(at).getTime() < DISMISSED_DAYS * MS_PER_DAY
  } catch {
    return false
  }
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [delayElapsed, setDelayElapsed] = useState(false)
  const [dismissed, setDismissed] = useState(hasDismissedRecently)

  const standalone = isStandalone()
  const ios = isIOSDevice()

  useEffect(() => {
    // La app ya está instalada o el usuario dijo "Ahora no": no registrar nada.
    if (standalone) return
    if (hasDismissedRecently()) return

    const onBeforeInstallPrompt = (evt: Event) => {
      // Ocultamos el diálogo nativo para mostrar el nuestro y guardamos el evento.
      evt.preventDefault()
      setEvent(evt as BeforeInstallPromptEvent)
    }
    // Si la app se instala desde el diálogo nativo, ocultamos el prompt propio.
    const onAppInstalled = () => {
      setEvent(null)
      setDismissed(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    // Pequeño respiro tras la carga para no molestar nada más entrar.
    const timer = window.setTimeout(() => setDelayElapsed(true), SHOW_DELAY_MS)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.clearTimeout(timer)
    }
  }, [standalone])

  const canInstall = Boolean(!standalone && !dismissed && delayElapsed && event)
  const showIOSHint = Boolean(!standalone && !dismissed && delayElapsed && ios && !event)

  const promptInstall = useCallback(async () => {
    if (!event) return
    // Tras prompt() el evento queda "gastado" y no se puede reutilizar.
    await event.prompt()
    await event.userChoice.catch(() => undefined)
    setEvent(null)
    setDismissed(true)
  }, [event])

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify({ at: new Date().toISOString() }))
    } catch {
      // Almacenamiento no disponible: solo se oculta en esta sesión.
    }
  }, [])

  return { canInstall, showIOSHint, promptInstall, dismiss }
}
