// Sinh HTML tĩnh riêng cho từng route sau khi `vite build` xong.
//
// Vì đây là SPA build tĩnh (render.yaml rewrite "/*" -> "/index.html"),
// Googlebot và bot preview Zalo/Facebook (không chạy JS) luôn nhận cùng
// một index.html cho mọi route — trước đây khiến /su-kien và /tiec-cuoi
// mang title/description/canonical của trang chủ. Script này nhân bản
// dist/index.html cho từng route con và ghi đè đúng thẻ head, để mỗi route
// tự đứng được ngay ở lần crawl/preview đầu tiên, trước khi React chạy.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ROUTES_META } from '../src/data/routeMeta.js'
import { eventSchema } from '../src/data/eventSchema.js'
import { weddingSchema } from '../src/data/weddingSchema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const template = readFileSync(join(distDir, 'index.html'), 'utf8')

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const ROUTE_SCHEMAS = {
  '/su-kien': { schema: eventSchema, tag: 'event' },
  '/tiec-cuoi': { schema: weddingSchema, tag: 'wedding' },
}

function renderForRoute(path) {
  const meta = ROUTES_META[path]
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)

  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${meta.canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${meta.canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)

  const routeSchema = ROUTE_SCHEMAS[path]
  if (routeSchema) {
    const script = `<script type="application/ld+json" data-mmt="${routeSchema.tag}">`
      + `${JSON.stringify(routeSchema.schema)}</script>\n  </head>`
    html = html.replace('</head>', script)
  }

  return html
}

for (const path of Object.keys(ROUTES_META)) {
  if (path === '/') continue // dist/index.html đã đúng sẵn cho trang chủ

  const outDir = join(distDir, path)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), renderForRoute(path))
  console.log(`Prerendered ${path} -> dist${path}/index.html`)
}
