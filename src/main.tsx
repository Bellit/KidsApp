import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/i18n'
import './styles/app.css'
import './styles/effects.css'
import { AppRouter } from './app/router'
import { reloadOnce } from './app/reloadOnce'
import { registerSW } from 'virtual:pwa-register'

// autoUpdate: en cuanto una versión nueva toma el control, se recarga la página
// para no mezclar el código viejo en memoria con archivos de la versión nueva.
registerSW({ immediate: true })

// Tras publicar, una pestaña con la versión anterior falla al precargar archivos
// que ya no existen: se recarga una vez para traer la versión nueva.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnce()) event.preventDefault()
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)