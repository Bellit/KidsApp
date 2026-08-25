/**
 * Scoring del modo contrarreloj (F4.3).
 * Lógica pura y testeable, reutilizada por la página de sesión contrarreloj.
 *
 * Fórmula documentada:
 *   score = aciertos × 10 − errores × 5
 * - Cada división completada correctamente vale 10 puntos (premia la rapidez
 *   y el progreso continuo).
 * - Cada error (intento incorrecto al comprobar un paso o al bajar cifra)
 *   resta 5 puntos: un error no elimina el acierto, pero castiga ligeramente
 *   la imprecisión para que el niño piense antes de teclear.
 * - El resultado nunca baja de 0: no existen puntuaciones negativas.
 */
export function calcTimedScore(correct: number, errors: number): number {
  return Math.max(0, correct * 10 - errors * 5)
}
