import { describe, expect, it } from 'vitest'
import { isChunkLoadError } from './reloadOnce'

describe('isChunkLoadError', () => {
  it('reconoce los fallos al cargar un archivo de una versión anterior', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://bellit.github.io/KidsApp/assets/ProfilePage-BvxMOpQW.js',
        ),
      ),
    ).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true)
  })

  it('no confunde otros errores', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
  })
})
