import { type ReactElement } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import axe from 'axe-core'
import i18n from '../shared/i18n'
import { useGameStore } from '../shared/store/gameStore'
import { AppShell } from '../app/shell/AppShell'
import HomePage from '../pages/HomePage'
import LessonIndexPage from '../pages/LessonIndexPage'
import LessonPage from '../pages/LessonPage'
import PracticeIndexPage from '../pages/PracticeIndexPage'
import PracticeSessionPage from '../pages/PracticeSessionPage'
import GamesPage from '../pages/GamesPage'
import TimedSessionPage from '../pages/TimedSessionPage'
import DailyChallengePage from '../pages/DailyChallengePage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'

// Notas sobre la auditoría con axe en jsdom:
// - `color-contrast` requiere layout/canvas reales (navegador), no está
//   disponible en jsdom: se desactiva aquí y se audita estáticamente.
// - `document-title` depende del <title> del documento (en index.html): se
//   desactiva porque los tests montan componentes sin el HTML completo.
const DISABLED_RULES = ['color-contrast', 'document-title']

interface RouteCase {
  name: string
  pathPattern: string
  entry: string
  element: ReactElement
}

const STATIC_ROUTES: RouteCase[] = [
  { name: 'Home', pathPattern: '/', entry: '/', element: <HomePage /> },
  { name: 'Lecciones', pathPattern: '/lessons', entry: '/lessons', element: <LessonIndexPage /> },
  { name: 'Práctica', pathPattern: '/practice', entry: '/practice', element: <PracticeIndexPage /> },
  { name: 'Retos', pathPattern: '/games', entry: '/games', element: <GamesPage /> },
  { name: 'Perfil', pathPattern: '/profile', entry: '/profile', element: <ProfilePage /> },
  { name: 'Ajustes', pathPattern: '/settings', entry: '/settings', element: <SettingsPage /> },
]

const SESSION_ROUTES: RouteCase[] = [
  { name: 'Lección 1', pathPattern: '/lessons/:lessonId', entry: '/lessons/1', element: <LessonPage /> },
  { name: 'Sesión práctica', pathPattern: '/practice/:levelId', entry: '/practice/1?count=5', element: <PracticeSessionPage /> },
  { name: 'Contrarreloj', pathPattern: '/games/timed', entry: '/games/timed?level=1', element: <TimedSessionPage /> },
  { name: 'Reto diario', pathPattern: '/games/daily', entry: '/games/daily', element: <DailyChallengePage /> },
]

async function auditRoute(route: RouteCase) {
  render(
    <MemoryRouter initialEntries={[route.entry]}>
      <Routes>
        <Route path={route.pathPattern} element={<main>{route.element}</main>} />
      </Routes>
    </MemoryRouter>,
  )
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: Object.fromEntries(DISABLED_RULES.map((id) => [id, { enabled: false }])),
  })
  return results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
}

async function auditRendered() {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: Object.fromEntries(DISABLED_RULES.map((id) => [id, { enabled: false }])),
  })
  return results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
}

function describeViolations(violations: axe.Result[]) {
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => n.target.join(' ')).join(', ')
      return `${v.id} (${v.impact}): ${v.help} — nodos: ${nodes}`
    })
    .join('\n')
}

describe('Auditoría de accesibilidad (axe)', () => {
  beforeEach(async () => {
    cleanup()
    localStorage.clear()
    useGameStore.getState().resetProgress()
    await i18n.changeLanguage('es')
  })

  for (const route of [...STATIC_ROUTES, ...SESSION_ROUTES]) {
    it(`no tiene violaciones critical/serious en ${route.name}`, async () => {
      const violations = await auditRoute(route)
      expect(violations.length, `Violaciones en ${route.name}:\n${describeViolations(violations)}`).toBe(0)
    })
  }

  it('el shell de la app (header, nav y main) no tiene violaciones critical/serious', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<Outlet />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const violations = await auditRendered()
    expect(violations.length, `Violaciones en AppShell:\n${describeViolations(violations)}`).toBe(0)
  })
})
