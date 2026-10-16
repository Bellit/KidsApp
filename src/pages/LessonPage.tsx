import { useCallback } from 'react'
import { Link } from 'react-router'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LESSONS } from '../features/lessons/content'
import { LessonEngine } from '../features/lessons/LessonEngine'
import type { LessonId } from '../features/lessons/types'
import { useGameStore } from '../shared/store/gameStore'

export default function LessonPage() {
  const { t } = useTranslation('lessons')
  const { lessonId } = useParams()
  const parsed = Number(lessonId)
  const lesson = LESSONS[parsed as LessonId]
  const completeLesson = useGameStore((s) => s.completeLesson)
  const handleComplete = useCallback(() => completeLesson(parsed), [completeLesson, parsed])

  if (!lesson) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-6 rounded-3xl bg-space-surface p-8 text-center text-text-ink shadow-lg shadow-black/20">
        <h1 className="font-display text-3xl font-extrabold">{t('common.not_found')}</h1>
        <Link
          to="/lessons"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-planet-venus px-6 py-3 font-display text-lg font-extrabold text-text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-astral-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astral-sun active:scale-95"
        >
          {t('common.back_to_map')}
        </Link>
      </section>
    )
  }

  return <LessonEngine lesson={lesson} onComplete={handleComplete} />
}