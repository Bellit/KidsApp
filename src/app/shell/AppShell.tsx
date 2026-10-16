import { useEffect } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { BottomNav } from './AppNav'
import { InstallPrompt } from '../../shared/components/InstallPrompt'

/** Rutas de ejercicio: sin menú, para que el niño se concentre y no salga sin querer. */
const SESSION_ROUTES = ['/practice/:levelId', '/lessons/:lessonId', '/games/timed', '/games/daily']

/** Sube al principio de la página en cada cambio de ruta: sin esto, el niño
 * puede aterrizar a media pantalla (título y progreso cortados) si venía
 * desplazado hacia abajo en la pantalla anterior. */
function useScrollToTopOnNavigate(pathname: string) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}

export function AppShell() {
  const { pathname } = useLocation()
  useScrollToTopOnNavigate(pathname)
  const inSession = SESSION_ROUTES.some((pattern) => matchPath(pattern, pathname) !== null)
  return (
    <div className="flex min-h-dvh flex-col bg-space-bg text-text-space">
      <Header showNav={!inSession} />
      <main className={`mx-auto w-full max-w-3xl flex-1 px-4 py-6 ${inSession ? 'pb-8' : 'pb-28 md:pb-6'}`}>
        <Outlet />
      </main>
      {inSession ? null : <BottomNav />}
      <InstallPrompt />
    </div>
  )
}
