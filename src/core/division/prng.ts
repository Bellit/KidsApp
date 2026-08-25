/**
 * PRNG determinista mulberry32.
 * Reproduce secuencias idénticas para la misma semilla, lo que permite
 * rehacer exactamente una sesión de práctica o el reto diario en QA.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}