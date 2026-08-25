/**
 * Scoring de sesiones de práctica: calcula las estrellas (1-3) al terminar.
 * Lógica pura y testeable, reutilizada por la página de sesión.
 */
export function calcStars(correct: number, total: number, errors: number, hintsUsed: number): number {
  if (errors === 0 && hintsUsed === 0 && correct === total) return 3
  if (errors <= 2 && hintsUsed <= 2) return 2
  return 1
}