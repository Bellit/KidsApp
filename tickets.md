# 🚀 KidsApp — Misión División

Webapp educativa (PWA) para enseñar **división larga** a niños de 8-12 años.
Paleta pastel + tema espacial. Español por defecto, multiidioma (i18n).

## Estado del proyecto

| Campo | Valor |
|---|---|
| **Fase actual** | Fase 4 — Retos y logros ✅ COMPLETADA |
| **Sprint** | 4 |
| **Última actualización** | 2026-08-13 |
| **Stack** | React + Vite + TypeScript + Tailwind CSS 4 + PWA (vite-plugin-pwa) + Zustand + i18next |

## Stack técnico (confirmado por @planificador)

- **Lenguaje**: TypeScript 5.x
- **Build**: Vite 6.x (template `react-ts`)
- **UI**: React 18/19
- **Estilos**: Tailwind CSS 4.x + `@tailwindcss/vite` (design tokens pastel espacial)
- **PWA**: `vite-plugin-pwa` 1.x + `@vite-pwa/assets-generator` (instalable en Android)
- **Router**: React Router v7
- **Estado**: Zustand 5 (persist + migraciones de schema)
- **i18n**: react-i18next + i18next-browser-languagedetector (es/en al 100%)
- **Animación**: framer-motion (solo celebraciones/hints)
- **Iconos**: lucide-react
- **Tests**: Vitest + @testing-library/react
- **Lint/Format**: ESLint 9 (flat) + Prettier

## Arquitectura (resumen)

```
src/
├── app/            # router.tsx, providers.tsx
├── core/           # LÓGICA PURA sin React (testeable)
│   ├── division/   # solver.ts, generator.ts, validator.ts, types.ts
│   ├── progression/# levels.ts, scoring.ts
│   └── achievements/ # definitions.ts, engine.ts
├── features/       # lessons/, practice/, games/, progress/, settings/
├── shared/         # components/, hooks/, i18n/, storage/, theme/, types/
└── assets/         # SVGs espaciales
```

### Rutas
| Ruta | Módulo |
|---|---|
| `/` | Home (mapa estelar) |
| `/lessons/:lessonId` | Lecciones guiadas |
| `/practice` y `/practice/:levelId` | Práctica con verificación |
| `/games` | Retos (contrarreloj + diario) |
| `/profile` | Progreso, medallas, récords |
| `/settings` | Ajustes (idioma, sonido, instalar app) |
| `*` | 404 friendly espacial |

### Contenido educativo (5 lecciones)
1. **L1 — Conceptos**: términos de la división, glosario visual
2. **L2 — Primera división**: divisor 1 cifra, exacta, método completo (7 pasos)
3. **L3 — Con resto**: divisor 1 cifra, resto ≠ 0
4. **L4 — Divisor de 2 cifras**: estimación por redondeo
5. **L5 — Casos especiales**: ceros en el cociente, divisor hasta 50

### Niveles de práctica (planetas)
| Nivel | divisor | cociente | resto | rango dividendo |
|---|---|---|---|---|
| 1 Mercurio | 1 cifra (2-9) | 1-2 cifras | 0 (exacto) | 2-99 |
| 2 Venus | 1 cifra (2-9) | 2-3 cifras | 0..divisor−1 | 20-999 |
| 3 Tierra | 2 cifras (10-25) | 2 cifras | 0..divisor−1 | 100-2.499 |
| 4 Marte | 2 cifras (10-50) | 2-3 cifras | 0..divisor−1 | 100-4.999 |
| 5 Asteroides | mixto | variable | variable | — |

---

# 📋 TICKETS

Leyenda: **Pri** = prioridad · **Esf** = esfuerzo (S/M/L) · **Sub** = subagente responsable
Estado: ⬜ Pendiente · 🔄 En curso · ✅ Hecho · ⛔ Bloqueado

## FASE 0 — Setup del proyecto y cimientos

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F0.1 | Scaffold Vite + React + TS + ESLint + Prettier | Alta | — | S | setup-infra | ✅ |
| F0.2 | Tailwind v4 + design tokens paleta espacial pastel | Alta | F0.1 | S | frontend-ui | ✅ |
| F0.3 | Config PWA básica (manifest mínimo + plugin) | Alta | F0.1 | S | pwa-infra | ✅ |
| F0.4 | Config i18n (i18next + es/en + namespaces) | Alta | F0.1 | S | i18n | ✅ |
| F0.5 | Router + App Shell + rutas placeholder | Alta | F0.2, F0.4 | M | frontend-ui | ✅ |

### F0.1 — Scaffold del proyecto
**Descripción**: `npm create vite@latest . -- --template react-ts`; ESLint flat + Prettier; scripts `dev/build/preview/lint/typecheck/test`; `.gitignore`; README con comandos.
**Criterios de aceptación**:
- [ ] `npm run build` y `npm run typecheck` pasan en Windows
- [ ] `npm run dev` arranca correctamente
- [ ] Scripts de lint/test configurados

### F0.2 — Tailwind + design tokens
**Descripción**: Instalar `tailwindcss @tailwindcss/vite`; `@import "tailwindcss"` en estilos; tokens CSS: `--color-space-bg`, `--color-planet-mercury`, `--color-planet-venus`, etc. (celestes, lilas, rosas, amarillos pastel); tipografía redondeada (Nunito).
**Criterios de aceptación**:
- [ ] Paleta aplicable vía clases utilitarias
- [ ] Contraste AA en texto sobre fondos pastel

### F0.3 — Config PWA básica
**Descripción**: `VitePWA({ registerType: 'autoUpdate' })`; manifest "KidsApp – Misión División", theme pastel, `display: standalone`; favicon placeholder.
**Criterios de aceptación**:
- [ ] Build genera `manifest.webmanifest` y service worker
- [ ] App registrable en dev

### F0.4 — Config i18n
**Descripción**: `i18next react-i18next i18next-browser-languagedetector`; `src/shared/i18n/index.ts`; `locales/{es,en}/common.json` con claves del shell.
**Criterios de aceptación**:
- [ ] El shell renderiza texto traducido
- [ ] Detector usa `navigator.language`

### F0.5 — Router + App Shell
**Descripción**: 8 rutas con pantallas placeholder; `React.lazy` en cada ruta; header (logo, perfil, ajustes) + navegación inferior móvil.
**Criterios de aceptación**:
- [ ] Navegación completa por todas las rutas
- [ ] Lazy-loading y estado de carga funcionales

---

## FASE 1 — Base de la app y diseño

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F1.1 | Design system de componentes espaciales | Alta | F0.5 | M | frontend-ui | ✅ |
| F1.2 | Home: mapa estelar navegable | Alta | F1.1 | M | frontend-ui | ✅ |
| F1.3 | Feedback sonoro y celebraciones | Media | F1.1 | M | frontend-ui | ✅ |
| F1.4 | **LongDivisionGrid** (la "casita") — componente core | Alta | F1.1 | L | frontend-ui | ✅ |
| F1.5 | Idioma por defecto ES + selector de idioma en Ajustes | Alta | F0.4 | S | i18n + frontend-ui | ✅ |
| F1.6 | Rediseño UX operaciones: casita guiada con tarjetas de operación | Alta | F3.2, F2.4 | L | frontend-ui | ✅ |
| F1.7 | Pantalla de resultado entre operaciones (práctica) | Alta | F3.2 | S | frontend-ui | ✅ |

### F1.1 — Design system
**Descripción**: `SpaceButton` (≥48px), `PlanetCard`, `StarBadge`, `MedalIcon`, `Modal`, `ProgressBar`, `Toast`.
**Criterios de aceptación**:
- [ ] Targets táctiles ≥48×48px
- [ ] Demo page con los componentes

### F1.2 — Home (mapa estelar)
**Descripción**: Fondo estrellado animado (CSS), planetas clicables por módulo/lección, nave para práctica. Estado de desbloqueo desde `useGameStore`.
**Criterios de aceptación**:
- [ ] Funciona a 360px (móvil) y desktop
- [ ] Cada botón navega correctamente

### F1.3 — Sonido y celebraciones
**Descripción**: Hook `useSound()` (Web Audio API, sin librería pesada); SFX clic/correcto/incorrecto/logro; toggle silencio; confeti/estrellas al acertar.
**Criterios de aceptación**:
- [ ] Sonido desactivable y recordado
- [ ] `prefers-reduced-motion` respetado

### F1.4 — LongDivisionGrid (la casita)
**Descripción**: Grid visual de división larga estilo casita; responsive sin scroll horizontal; estados de celda: pendiente/activo/correcto/incorrecto; Props: `exercise`, `currentStepIndex`, `onDigitSelect`.
**Criterios de aceptación**:
- [ ] Renderiza cualquier Exercise nivel 1-4 sin desbordamiento a 360px y 1024px
- [ ] Estados de celda correctos

### F1.5 — Idioma por defecto ES + selector de idioma en Ajustes (petición usuario 2026-08-13)
**Descripción**: La app debe arrancar SIEMPRE en español (independiente del idioma del navegador) y ofrecer un selector de idioma (ES/EN) dentro de la página de Ajustes que persista la elección.
**Criterios de aceptación**:
- [x] Primer arranque muestra español aunque el navegador esté en inglés
- [x] Selector de idioma en `/settings` (ES/EN) que cambia la app al instante
- [x] La elección persiste tras recargar (localStorage)
- [x] Idioma en HTML tag y document se actualiza al cambiar
- [x] Typecheck/lint/test/build pasan

### F1.6 — Rediseño UX: casita guiada con tarjetas de operación (petición usuario 2026-08-13)
**Descripción**: Rediseñar el flujo de resolución para que un niño de 8 años entienda qué operación hace en cada paso. Eliminar el teclado numérico en pantalla (el móvil ya muestra teclado numérico con `inputMode="numeric"` y en ordenador hay teclado físico). Cada paso muestra una **tarjeta de operación** con los números concretos (ej. "2 × 4 = ?", "8 − 8 = ?") y anclaje visual en la casita. Aplicar a práctica y lecciones guiadas.
**Criterios de aceptación**:
- [x] Tarjetas de operación con los números exactos de cada paso (cociente, producto, resta, bajar cifra)
- [x] Número parcial visible ("Estamos dividiendo el 84")
- [x] Resultados resueltos se colocan visualmente en la casita con animación
- [x] "Bajar cifra" mediante flecha ▼ + tocar el dígito en la casita
- [x] Teclado numérico en pantalla eliminado (input nativo con inputMode="numeric")
- [x] Lenguaje de niño: "cabe", "sobra", "baja" (manteniendo términos técnicos como refuerzo)
- [x] Aplicado a modo práctica Y lecciones guiadas
- [x] Typecheck/lint/test/build pasan

### F1.7 — Pantalla de resultado entre operaciones (petición usuario 2026-08-13)
**Descripción**: En modo práctica, al completar la última cifra de una división la app saltaba directamente a la siguiente operación sin mostrar el resultado. Ahora hay una pantalla intermedia de resultado: ecuación completa en grande ("84 ÷ 4 = 21" o con resto), casita con todos los cálculos escritos (cociente + productos + restos de todos los pasos) y botón "Siguiente".
**Criterios de aceptación**:
- [x] Al completar una división NO se salta a la siguiente: se muestra pantalla de resultado
- [x] Ecuación completa en grande (incluye resto si lo hay)
- [x] Casita completada: todos los productos y restos visibles en sus columnas (modo `solvedSteps` en LongDivisionGrid)
- [x] Botón "Siguiente" avanza a la siguiente operación o al resumen final si era la última
- [x] Celebración y sonido se mantienen
- [x] Solo afecta a práctica (LessonEngine intacto)
- [x] Typecheck/lint/test/build pasan

---

## FASE 2 — Lecciones (enseñanza guiada)

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F2.1 | Motor de pasos `solver.ts` + tests | Alta | — | M | domain-logic | ✅ |
| F2.2 | Generador de ejercicios `generator.ts` + tests | Alta | F2.1 | M | domain-logic | ✅ |
| F2.3 | Validador de pasos `validator.ts` + feedback | Alta | F2.1 | M | domain-logic | ✅ |
| F2.4 | Motor de lecciones guiadas (orquestador + hints) | Alta | F2.1, F2.3, F1.4 | L | state-infra + frontend-ui | ✅ |
| F2.5 | Contenido Lecciones 1-3 | Alta | F2.4 | M | domain-logic + i18n | ✅ |
| F2.6 | Contenido Lecciones 4-5 | Media | F2.5 | M | domain-logic + i18n | ✅ |

### F2.1 — Solver (motor de pasos)
**Descripción**: `solve(dividendo, divisor): DivisionStep[]`; función pura. Tests: casos fijos (84÷4, 937÷5, 385÷13, 1000÷8) + propiedades (1000 pares aleatorios: `divisor×cociente+resto==dividendo`, resto < divisor).
**Criterios de aceptación**:
- [ ] Cobertura ≥90% en `solver.ts`
- [ ] Reconstrucción válida en todos los casos

### F2.2 — Generador de ejercicios
**Descripción**: `generate(level, seed?)` construye al revés: `dividendo = divisor × cociente + resto`. Sin ceros a la izquierda; nivel 1 resto 0.
**Criterios de aceptación**:
- [ ] 100 ejercicios/nivel sin invalidar invariantes
- [ ] Semilla reproducible para QA

### F2.3 — Validador de pasos
**Descripción**: `validateStep(exercise, stepIndex, userAnswer)` → feedback tipado con clave i18n (`feedback.correct`, `feedback.try_again`…).
**Criterios de aceptación**:
- [ ] Correctas/incorrectas/parciales clasificadas sin errores

### F2.4 — Motor de lecciones guiadas
**Descripción**: Navegación por pasos con hints progresivos, botón "Muéstrame", contador de ayuda (afecta estrellas), cierre llama `gameStore.completeLesson()`.
**Criterios de aceptación**:
- [ ] Lección completa sin bugs
- [ ] Estrellas según ayuda usada (3★ sin ayuda, 2★ 1 error, 1★ con hints)

### F2.5 — Contenido L1-L3
**Descripción**: Script pedagógico en `features/lessons/data/lesson1..3.ts` + claves i18n es/en; glosario ilustrado, ejemplos guiados, 2 ejercicios por lección.
**Criterios de aceptación**:
- [ ] L1-L3 completables de principio a fin en es y en

### F2.6 — Contenido L4-L5
**Descripción**: Estimación con divisor 2 cifras (L4) y ceros en cociente (L5), pasos especiales y verificación final.
**Criterios de aceptación**:
- [ ] L4-L5 completables; hint de estimación visible en L4

---

## FASE 3 — Práctica con verificación

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F3.1 | Selector de nivel y configuración de sesión | Alta | F2.2, F2.3, F1.4 | M | frontend-ui | ✅ |
| F3.2 | Flujo de sesión: ejercicios + feedback inmediato | Alta | F3.1, F2.3 | L | frontend-ui + state-infra | ✅ |
| F3.3 | Resumen de sesión (aciertos, errores, tiempo, estrellas) | Alta | F3.2 | S | frontend-ui | ✅ |
| F3.4 | Persistencia de resultados en `useGameStore` | Alta | F3.3 | M | state-infra | ✅ |

### F3.1 — Selector de nivel
**Descripción**: Mapa de niveles desbloqueados + selector nº ejercicios (5/10/15) y tipo (solo exactas / con resto).
**Criterios de aceptación**:
- [ ] Solo niveles desbloqueados seleccionables

### F3.2 — Flujo de sesión
**Descripción**: LongDivisionGrid + teclado numérico en pantalla (móvil), feedback por paso (toast + sonido + animación), reintento, avance. Nº errores registrado.
**Criterios de aceptación**:
- [ ] Sesión de 10 ejercicios sin pérdida de estado
- [ ] Errores contabilizados

### F3.3 — Resumen de sesión
**Descripción**: Estrellas, aciertos/errores, tiempo, mensaje motivador; botones "Repetir" y "Seguir".
**Criterios de aceptación**:
- [ ] Datos coinciden con la sesión jugada

### F3.4 — Persistencia
**Descripción**: `sessionStats` agregada al perfil persistido (total ejercicios, por nivel, récord, estrellas). Migración schema v1.
**Criterios de aceptación**:
- [ ] Recargar la página conserva todo el progreso

---

## FASE 4 — Retos y logros

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F4.1 | Motor de desbloqueo de niveles y scoring | Alta | F3.4 | S | domain-logic + state-infra | ✅ |
| F4.2 | Catálogo y engine de logros (medallas) | Alta | F4.1 | M | domain-logic | ✅ |
| F4.3 | Modo contrarreloj (3 min) | Media | F3.2 | M | frontend-ui + domain-logic | ✅ |
| F4.4 | Reto diario con premio extra | Media | F4.3 | M | state-infra + frontend-ui | ✅ |
| F4.5 | Pantalla de perfil/progreso | Alta | F4.2 | M | frontend-ui | ✅ |

### F4.1 — Desbloqueo y scoring
**Descripción**: `levels.ts` (umbrales) + `scoring.ts` (3/2/1 estrellas); desbloqueo al completar lección o sesión con ≥2★.
**Criterios de aceptación**:
- [ ] Superar Nivel 1 con ≥2★ desbloquea Nivel 2 y el Home lo refleja

### F4.2 — Logros
**Descripción**: ≥10 logros (first_step, perfect_session, level_1_master, no_hints_pro, retos_streak_3, division_guru…) evaluados al cerrar sesión; toast + animación.
**Criterios de aceptación**:
- [ ] Cada logro tiene condición testeable

### F4.3 — Contrarreloj
**Descripción**: 3 min, nivel elegido, puntuación = aciertos − penalización, sin ayuda; top 5 récords persistidos.
**Criterios de aceptación**:
- [ ] Cronómetro para la sesión y guarda récord

### F4.4 — Reto diario
**Descripción**: 1 por día (fecha local, semilla fija), 5★ extra; estado `lastDailyRewardDate`.
**Criterios de aceptación**:
- [ ] Repetir el reto el mismo día no da estrellas 2 veces

### F4.5 — Perfil
**Descripción**: Estrellas totales, medallas bloqueado/ganado (tooltips), récords por nivel, estadísticas.
**Criterios de aceptación**:
- [ ] Datos del store persistido, actualizados tras cada sesión

---

## FASE 5 — PWA e instalación

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F5.1 | Assets PWA completos (iconos, maskable, apple-touch) | Alta | F0.3 | S | pwa-infra | ✅ |
| F5.2 | Service worker offline completo | Alta | F5.1 | M | pwa-infra | ✅ |
| F5.3 | Prompt de instalación (A2HS) personalizado | Media | F5.2 | M | pwa-infra + frontend-ui | ✅ |
| F5.4 | Documentación camino a Capacitor/Google Play | Baja | F5.3 | S | setup-infra | ✅ |
| F5.5 | QA de instalación en Chrome/Edge/Android | Alta | F5.3 | M | qa-test | ✅ |

---

## FASE 6 — i18n multiidioma completo

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F6.1 | Traducciones es/en completas de toda la UI | Alta | F0.4 | M | i18n | ⬜ |
| F6.2 | Selector de idioma en settings + persistencia | Alta | F6.1 | S | i18n + frontend-ui | ⬜ |
| F6.3 | Auditoría: interpolación, plurales, cambio en caliente | Media | F6.2 | S | i18n + qa-test | ⬜ |

---

## FASE 7 — QA final, accesibilidad y despliegue

| ID | Título | Pri | Deps | Esf | Sub | Estado |
|---|---|---|---|---|---|---|
| F7.1 | Auditoría de accesibilidad (axe + teclado + lectores) | Alta | Todo | M | qa-test | ✅ |
| F7.2 | Test e2e del flujo crítico | Media | Todo | M | qa-test | ✅ |
| F7.3 | Despliegue a hosting estático HTTPS + README final | Alta | F7.1, F7.2 | S | setup-infra | ⬜ |

---

## Definición de hecho global (app completa)

1. **PWA instalable**: manifest + SW; se instala en Chrome/Edge desktop y Chrome Android; funciona **offline** en flujo completo.
2. **Contenido educativo completo**: 5 lecciones, práctica en 5 niveles, verificación paso a paso, verificación final `divisor×cociente+resto=dividendo`.
3. **Gamificación**: estrellas 1-3, desbloqueo secuencial, ≥10 medallas, reto diario y contrarreloj.
4. **Persistencia**: progreso sobrevive a recargas; schema versionado con migraciones.
5. **i18n**: es/en al 100% + selector funcional.
6. **Calidad**: typecheck/lint/test en verde; cobertura `core/` ≥90%; Lighthouse ≥90 (Perf/A11y/BP/PWA); axe sin violaciones críticas; navegación por teclado 100%.
7. **Desplegada**: HTTPS público, instalable, README con comandos y roadmap (Capacitor→Google Play).
8. **Preparada para control parental**: repositorio intercambiable + `userId` en schema.

## Riesgos clave

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | UX casita en táctil (dedos gruesos, zoom) | Alto | Grid probado a 360px, teclado propio, targets ≥48px, test Android real (F5.5) |
| R2 | Frustración del niño | Alto | Feedback positivo (nunca "mal"), hints, "Muéstrame", estrellas sin castigo duro |
| R3 | Contraste pastel insuficiente | Medio | Contraste AA desde F0.2, aria-live, estados no solo por color |
| R4 | Errores aritméticos en generador | Alto | Construcción inversa + tests de propiedades (F2.1/F2.2) |
| R5 | Pérdida de progreso | Medio | Schema versionado + migraciones; repositorio desacoplado |
| R6 | Rendimiento Android low-end | Medio | Lazy-loading, precache mínimo, SVGs ligeros |
| R7 | PWA iOS limitada | Bajo | Documentado; objetivo Android + desktop |