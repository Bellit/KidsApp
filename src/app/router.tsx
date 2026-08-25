import { Suspense, lazy, type ComponentType } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppShell } from './shell/AppShell'
import { PageLoading } from '../shared/components/PageLoading'

const HomePage = lazy(() => import('../pages/HomePage'))
const LessonIndexPage = lazy(() => import('../pages/LessonIndexPage'))
const LessonPage = lazy(() => import('../pages/LessonPage'))
const PracticeIndexPage = lazy(() => import('../pages/PracticeIndexPage'))
const PracticeSessionPage = lazy(() => import('../pages/PracticeSessionPage'))
const GamesPage = lazy(() => import('../pages/GamesPage'))
const TimedSessionPage = lazy(() => import('../pages/TimedSessionPage'))
const DailyChallengePage = lazy(() => import('../pages/DailyChallengePage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const DesignSystemPage = lazy(() => import('../pages/DesignSystemPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'lessons', element: withSuspense(LessonIndexPage) },
      { path: 'lessons/:lessonId', element: withSuspense(LessonPage) },
      { path: 'practice', element: withSuspense(PracticeIndexPage) },
      { path: 'practice/:levelId', element: withSuspense(PracticeSessionPage) },
      { path: 'games', element: withSuspense(GamesPage) },
      { path: 'games/timed', element: withSuspense(TimedSessionPage) },
      { path: 'games/daily', element: withSuspense(DailyChallengePage) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
      { path: 'design', element: withSuspense(DesignSystemPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}