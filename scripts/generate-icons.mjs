// scripts/generate-icons.mjs
// ---------------------------------------------------------------------------
// Genera los iconos PWA de KidsApp replicando el diseño de public/favicon.svg.
// El script NO necesita dependencias externas: solo Node y node:zlib.
// Implementa un encoder PNG mínimo a mano (IHDR / IDAT / IEND + CRC32).
// Uso: node scripts/generate-icons.mjs
// ---------------------------------------------------------------------------
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'icons')

// ---------- Paleta (idéntica a public/favicon.svg) ----------
const NAVY = [0x1b, 0x2a, 0x4a] // azul noche (fondo)
const LIGHT_BLUE = [0xa8, 0xc8, 0xf0] // círculo interior
const PINK = [0xff, 0xd9, 0xe8] // "planeta"
const PEACH = [0xff, 0xcf, 0xc4] // decorativo 1 (luna)
const YELLOW = [0xff, 0xe4, 0xa8] // decorativo 2 (estrella)

// ---------- CRC32 (tabla lookup estándar IEEE 802.3) ----------
const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[n] = c >>> 0
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

// ---------- Encoder PNG mínimo ----------
// Formato de un chunk: [longitud:4][tipo:4][datos][crc32:4]
function chunk(type, data) {
  const lengthBuf = Buffer.alloc(4)
  lengthBuf.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf])
}

function ihdrData(width, height) {
  const data = Buffer.alloc(13)
  data.writeUInt32BE(width, 0)
  data.writeUInt32BE(height, 4)
  data[8] = 8 // bit depth: 8 bits por canal
  data[9] = 6 // color type: 6 = RGBA (truecolor + alpha)
  data[10] = 0 // método de compresión
  data[11] = 0 // método de filtro
  data[12] = 0 // sin interlace
  return data
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const stride = width * 4
  // Cada scanline va precedida por su byte de filtro (0 = None)
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }
  const compressed = deflateSync(raw)
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdrData(width, height)),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- Renderizado del icono con antialias ----------
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// `fullBackground`: cubre TODO el lienzo con el azul noche (maskable/apple).
// `contentScale`: escala de los círculos interiores; 1 = igual que el favicon.
function renderIcon(size, { fullBackground = false, contentScale = 1 } = {}) {
  const rgba = new Uint8ClampedArray(size * size * 4)
  const half = size / 2

  // Los círculos se expresan en fracciones del lienzo iguales al favicon.svg
  const radiusFrac = (f) => f * size * contentScale
  const centerFrac = (f) => size * (0.5 + (f - 0.5) * contentScale)

  // Fondo: círculo azul noche. En maskable/apple cubre las esquinas
  // (radio 0.72 * size > mitad de la diagonal del lienzo).
  const bgRadius = fullBackground ? size * 0.72 : size * 0.46875
  const shapes = [
    { cx: half, cy: half, r: bgRadius, color: NAVY },
    { cx: centerFrac(0.5), cy: centerFrac(0.5), r: radiusFrac(0.375), color: LIGHT_BLUE },
    { cx: centerFrac(30 / 64), cy: centerFrac(30 / 64), r: radiusFrac(9 / 64), color: PINK },
    { cx: centerFrac(26 / 64), cy: centerFrac(27 / 64), r: radiusFrac(2 / 64), color: PEACH },
    { cx: centerFrac(34 / 64), cy: centerFrac(33 / 64), r: radiusFrac(1.6 / 64), color: YELLOW },
  ]

  // Antialias: por píxel se calcula la cobertura de cada círculo a partir de
  // su distancia al borde (transición suave de ~1px), y se compone de atrás
  // hacia delante con alpha blending.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (const s of shapes) {
        const d = Math.hypot(x + 0.5 - s.cx, y + 0.5 - s.cy) - s.r
        const coverage = clamp01(0.5 - d)
        if (coverage <= 0) continue
        const inv = (1 - coverage) * a
        const oa = coverage + inv
        r = (s.color[0] * coverage + r * inv) / oa
        g = (s.color[1] * coverage + g * inv) / oa
        b = (s.color[2] * coverage + b * inv) / oa
        a = oa
      }
      const idx = (y * size + x) * 4
      rgba[idx] = Math.round(r)
      rgba[idx + 1] = Math.round(g)
      rgba[idx + 2] = Math.round(b)
      rgba[idx + 3] = Math.round(a * 255)
    }
  }
  return rgba
}

function writeIcon(filename, size, opts) {
  const rgba = renderIcon(size, opts)
  const png = encodePNG(size, size, rgba)
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, filename), png)
  console.log(`Generado ${filename} (${size}×${size}, ${png.length} bytes)`)
}

// 1. Icono PWA estándar 192×192 (diseño del favicon, con margen transparente)
writeIcon('pwa-192x192.png', 192)
// 2. Icono PWA estándar 512×512
writeIcon('pwa-512x512.png', 512)
// 3. Icono maskable 512×512: fondo completo y contenido dentro del 80% central
//    (radio de contenido ~31.9% del lienzo, por debajo del 40% exigido).
writeIcon('maskable-icon-512x512.png', 512, { fullBackground: true, contentScale: 0.85 })
// 4. Apple touch 180×180: fondo opaco completo, diseño centrado
writeIcon('apple-touch-icon-180x180.png', 180, { fullBackground: true })

console.log('Iconos generados en public/icons/')