# Publicación en tiendas — Camino a Capacitor / Google Play

> **F5.4 · Documentación del camino a Capacitor/Google Play**
> Estado: planificado. Esta guía NO añade Capacitor al proyecto: solo documenta las opciones futuras de publicación.
> Estado actual de la app: **PWA instalable** en Chrome/Edge y Android vía A2HS (Add to Home Screen) con `vite-plugin-pwa`, manifest e iconos completos (192/512/maskable/apple-touch). Publicar en Play Store / App Store = **futuro**.

La app es una PWA (Vite + React + `vite-plugin-pwa`). Hoy se instala directamente desde el navegador. Para llegar a **Google Play** (y opcionalmente **App Store**) hay dos caminos:

---

## Opción A — PWA en Play Store (Trusted Web Activity / Bubblewrap)

### Qué es
Envolver la PWA existente con una **Trusted Web Activity (TWA)** usando `@bubblewrap/cli`, la herramienta oficial de Google. El resultado es una app Android que abre la PWA a pantalla completa, **sin escribir código nativo**. Google Play la trata como una app normal.

- ✅ Sin código nativo, sin tocar el frontend.
- ✅ Reutiliza todo lo que ya tiene la PWA (manifest, service worker, offline).
- ⚠️ Requiere la URL HTTPS pública desplegada (Fase 7).

### Pasos resumidos

**1. Requisitos**
- Node.js 18+ (ya lo tienes con Vite).
- JDK 17 (Java Development Kit).
- Android SDK + herramientas de línea de comandos.
- Cuenta de Google Play Developer (tarifa única de **$25 USD**).
- La app publicada en HTTPS (p.ej. Vercel, Netlify, GitHub Pages, Cloudflare Pages).

**2. Instalar Bubblewrap**
```bash
npm i -g @bubblewrap/cli
```

**3. Inicializar el proyecto TWA**
```bash
bubblewrap init
```
- Responde con la URL HTTPS pública de la app (p.ej. `https://kidsapp.ejemplo.com`).
- Bubblewrap lee el `manifest.webmanifest` del sitio y propone configuración automáticamente.

**4. Construir el proyecto Android**
```bash
bubblewrap build
```
- Genera un APK y un AAB (Android App Bundle) firmados con un keystore local que Bubblewrap crea.

**5. Subir a Play Console**
- Crea la app en [Play Console](https://play.google.com/console).
- Completa ficha de la tienda, política de privacidad y **edad de audiencia (kids)**.
- Sube el **AAB** (no el APK) y envía para revisión de Google.

### Notas
- Requiere la **URL HTTPS pública desplegada** (Fase 7 — hosting estático HTTPS).
- Los **iconos PWA ya generados** (192/512 + `maskable-icon-512x512.png`) los usará Bubblewrap para los iconos nativos.
- La **pantalla de bienvenida (splash)** es configurable en `twa-manifest.json` (colores, fondo, icono).

### Limitaciones
- **TWA comparte la sesión de Chrome**: los datos (localStorage/progreso) se guardan en el perfil de Chrome del dispositivo.
- **Sin acceso a APIs nativas** sin bridges adicionales (notificaciones push, pagos, etc. requieren una extensión o pasar a Capacitor).

---

## Opción B — Capacitor (camino completo a Play Store y App Store)

### Qué es
Capacitor envuelve la app en un **WebView nativo** (`@capacitor/core`) con CLI (`@capacitor/cli`) y plataformas `@capacitor/android` + `@capacitor/ios`. A diferencia de TWA, da **acceso a plugins nativos** (notificaciones push, compras in-app, etc.) y funciona como app nativa independiente (sin depender de Chrome).

- ✅ Camino completo: **Play Store y App Store**.
- ✅ Acceso futuro a plugins nativos.
- ⚠️ Más pasos de configuración que Bubblewrap.

### Pasos resumidos

**1. Instalar Capacitor**
```bash
npm i @capacitor/core @capacitor/cli
```

**2. Inicializar**
```bash
npx cap init
```
- `appName`: `KidsApp – Misión División`.
- `appId`: `com.kidsapp.misiondivision` (identificador único, no cambia tras publicar).

**3. Añadir las plataformas**
```bash
npm i @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

**4. Build + sincronizar**
```bash
npm run build        # genera dist/ (producción)
npx cap sync         # copia dist/ y los assets a android/ e ios/
```
> ⚠️ **Siempre** ejecutar `npm run build` **antes** de `cap sync`; Capacitor copia la carpeta `dist/` a las carpetas nativas.

**5. Android (Play Store)**
```bash
npx cap open android
```
- Se abre **Android Studio**.
- Firma el release (keystore), genera el AAB y súbelo a Play Console.

**6. iOS (App Store)**
```bash
npx cap open ios
```
- Se abre **Xcode** (requiere **macOS**).
- Configura signing, sube a App Store Connect.

### Notas
- **Splash screen**: instalar `@capacitor/splash-screen` para controlar la pantalla de bienvenida; la configuración nativa vive en las carpetas `android/` e `ios/`.
- **Iconos nativos**: se configuran dentro de `android/app/src/main/res/` e `ios/App/App/Assets.xcassets/` (no se generan solos).
- **localStorage**: ya funciona dentro del WebView, así que el progreso persistido de la PWA se conserva sin cambios.

### Estructura de carpetas creadas
```
android/   # proyecto Android nativo (Gradle)
ios/       # proyecto iOS nativo (Xcode)
```
Estas carpetas **no deben romperse** (son el proyecto nativo real). Decisiones posibles:
- **Conservarlas versionadas** (recomendado): permite reproducir el build nativo desde el repo.
- **Añadirlas a `.gitignore`**: se regeneran con `npx cap add android` + `npx cap sync`; útil si se genera solo la PWA y se quieren ignorar los proyectos nativos.
- **Decisión para este proyecto**: se documenta aquí, se decide al empezar F5.4 ejecutable. Por defecto se recomienda **versionarlas** si se trabaja con Capacitor de forma continuada.

---

## Comparativa y recomendación

| Aspecto | Opción A — TWA/Bubblewrap | Opción B — Capacitor |
|---|---|---|
| Código nativo | Ninguno | WebView + plugins nativos |
| Plataformas | Solo Android (Play Store) | Android + iOS |
| Sesión/datos | Comparte Chrome | Independiente |
| Push / compras | No (sin bridges) | Sí (plugins nativos) |
| Esfuerzo | Bajo (rápido y barato) | Medio (más configuración) |
| Coste | Solo fee $25 de Play | Fee $25 + (para iOS, cuenta Apple $99/año) |

**Recomendación para KidsApp (app educativa infantil, requisitos mínimos):**
- Si el objetivo es **solo Play Store**, empezar por **Opción A (TWA/Bubblewrap)**: más rápido, más barato y suficiente para una app educativa con requisitos mínimos.
- Si se quiere **iOS, notificaciones push o compras en el futuro**, ir directamente a **Opción B (Capacitor)**, que cubre ambas tiendas desde el principio.

---

## Checklist pre-publicación

- [ ] **HTTPS público**: la app desplegada en un hosting HTTPS (Fase 7).
- [ ] **Manifest correcto**: `name`, `short_name`, `theme_color`, `display: standalone`, `start_url`/`scope` (ya configurados en `vite.config.ts`).
- [ ] **Iconos 512 + maskable**: `pwa-512x512.png` y `maskable-icon-512x512.png` (ya generados en `public/icons/`).
- [ ] **Política de privacidad**: URL pública enlazada en Play Console (obligatoria para apps).
- [ ] **Edad de audiencia (kids)**: clasificar la app como orientada a niños (Kids / Familia) y cumplir las políticas de contenido infantil de Google.
- [ ] **Prueba en dispositivo real**: instalar y probar en un Android físico antes de publicar (F5.5).
- [ ] **Offline funcional**: verificar el modo offline completo (service worker, ya implementado en F5.2).
