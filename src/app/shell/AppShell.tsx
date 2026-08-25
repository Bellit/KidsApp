import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { BottomNav } from './AppNav'
import { InstallPrompt } from '../../shared/components/InstallPrompt'

/** Sube al principio de la página en cada cambio de ruta: sin esto, el niño
 * puede aterrizar a media pantalla (título y progreso cortados) si venía
 * desplazado hacia abajo en la pantalla anterior. */
function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}

export function AppShell() {
  useScrollToTopOnNavigate()
  return (
    <div className="flex min-h-dvh flex-col bg-space-bg text-text-space">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}