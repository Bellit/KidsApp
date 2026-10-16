const RELOAD_KEY = 'kidsapp:chunk-reload-at'
const RELOAD_WINDOW_MS = 10_000

/**
 * Tras publicar una versión nueva, una pestaña abierta con la versión anterior
 * pide archivos (p. ej. `ProfilePage-<hash>.js`) que ya no existen. Recargar
 * trae la versión nueva. Solo se recarga una vez cada 10 s para no entrar en
 * bucle si el fallo es otro (sin conexión, servidor caído...).
 * Devuelve true si ha lanzado la recarga.
 */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Sin sessionStorage no hay forma de evitar el bucle: mejor no recargar.
    return false
  }
  window.location.reload()
  return true
}

/** ¿El error es de un archivo de la app que no se pudo descargar? */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message)
}
