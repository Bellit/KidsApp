import { useCallback, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // almacenamiento no disponible: mantener valor en memoria
        }
        return next
      })
    },
    [key],
  )

  return [value, set] as const
}