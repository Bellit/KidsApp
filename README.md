# KidsApp – Misión División
Webapp educativa (PWA) para enseñar división larga a niños de 8-12 años. Tema espacial pastel. Español por defecto, inglés disponible.

## Comandos
| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck + build de producción |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | ESLint (flat config) |
| `npm run format` | Prettier (escribir) |
| `npm run typecheck` | `tsc -b` |
| `npm run test` | Vitest |

## Stack
Vite 6 · React 19 · TypeScript · Tailwind CSS v4 (@tailwindcss/vite) · React Router v7 · react-i18next (es/en) · vite-plugin-pwa · Zustand (Fase 3+) · Vitest + Testing Library

## Roadmap
La app ya es instalable como **PWA** en Chrome/Edge y Android vía A2HS. Publicar en Google Play / App Store es **futuro** — ver [docs/play-store.md](docs/play-store.md) (F5.4): opción A (TWA/Bubblewrap) para Play Store, opción B (Capacitor) para Play Store + App Store.