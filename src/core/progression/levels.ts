export interface LevelInfo {
  id: number
  name: string
  i18nKey: string
  divisorMin: number
  divisorMax: number
  descriptionKey: string
}

export const LEVELS: LevelInfo[] = [
  {
    id: 1,
    name: 'Mercurio',
    i18nKey: 'level_name_1',
    divisorMin: 2,
    divisorMax: 9,
    descriptionKey: 'level_desc_1',
  },
  {
    id: 2,
    name: 'Venus',
    i18nKey: 'level_name_2',
    divisorMin: 2,
    divisorMax: 9,
    descriptionKey: 'level_desc_2',
  },
  {
    id: 3,
    name: 'Tierra',
    i18nKey: 'level_name_3',
    divisorMin: 10,
    divisorMax: 25,
    descriptionKey: 'level_desc_3',
  },
  {
    id: 4,
    name: 'Marte',
    i18nKey: 'level_name_4',
    divisorMin: 10,
    divisorMax: 50,
    descriptionKey: 'level_desc_4',
  },
  {
    id: 5,
    name: 'Asteroides',
    i18nKey: 'level_name_5',
    divisorMin: 2,
    divisorMax: 50,
    descriptionKey: 'level_desc_5',
  },
]
