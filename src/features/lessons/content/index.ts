import type { LessonContent, LessonId } from '../types'
import { lesson1 } from './lesson1'
import { lesson2 } from './lesson2'
import { lesson3 } from './lesson3'
import { lesson4 } from './lesson4'
import { lesson5 } from './lesson5'

export const LESSONS: Record<LessonId, LessonContent> = {
  1: lesson1,
  2: lesson2,
  3: lesson3,
  4: lesson4,
  5: lesson5,
}

export const LESSON_IDS: LessonId[] = [1, 2, 3, 4, 5]