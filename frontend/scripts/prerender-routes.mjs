// Sinh HTML tĩnh riêng cho từng route sau khi `vite build` xong.
//
// Vì đây là SPA build tĩnh (render.yaml rewrite "/*" -> "/index.html"),
// Googlebot và bot preview Zalo/Facebook (không chạy JS) luôn nhận cùng
// một index.html cho mọi route — trước đây khiến mỗi route con mang
// title/description/canonical của trang chủ. Script này nhân bản
// dist/index.html cho từng route con và ghi đè đúng thẻ head + JSON-LD, để
// mỗi route tự đứng được ngay ở lần crawl/preview đầu tiên, trước khi React
// chạy. render.yaml cần một rule rewrite tường minh cho mỗi route ở đây,
// vì Render không tự phân giải "/duong-dan" (không có "/" cuối) thành
// "duong-dan/index.html".
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ROUTES_META } from '../src/data/routeMeta.js'
import { eventSchema } from '../src/data/eventSchema.js'
import { weddingSchema } from '../src/data/weddingSchema.js'
import { eventServicePages, eventServiceRouteMeta, eventServiceSchemas } from '../src/data/eventServicePages.js'
import { weddingServicePages, weddingServiceRouteMeta, weddingServiceSchemas } from '../src/data/weddingServicePages.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const template = readFileSync(join(distDir, 'index.html'), 'utf8')

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// { path, meta: {title, description, canonical}, schemas: [...], tag }
const ROUTES = [
  { path: '/su-kien', meta: ROUTES_META['/su-kien'], schemas: [eventSchema], tag: 'event' },
  { path: '/tiec-cuoi', meta: ROUTES_META['/tiec-cuoi'], schemas: [weddingSchema], tag: 'wedding' },
  ...eventServicePages.map((page) => ({
    path: page.path,
    meta: eventServiceRouteMeta(page),
    schemas: eventServiceSchemas(page),
    tag: `svc-event-${page.slug}`,
  })),
  ...weddingServicePages.map((page) => ({
    path: page.path,
    meta: weddingServiceRouteMeta(page),
    schemas: weddingServiceSchemas(page),
    tag: `svc-wedding-${page.slug}`,
  })),
]

function renderForRoute({ meta, schemas, tag }) {
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

  // Route với 1 schema duy nhất (/su-kien, /tiec-cuoi) giữ nguyên data-mmt
  // không đánh số, khớp đúng selector mà EventSchema/WeddingSchema tìm lúc
  // chạy JS (xem "reuse-if-exists" trong 2 file đó) — tránh sinh 2 bản.
  const scripts = schemas
    .map((schema, i) => {
      const dataTag = schemas.length === 1 ? tag : `${tag}-${i}`
      return `<script type="application/ld+json" data-mmt="${dataTag}">${JSON.stringify(schema)}</script>`
    })
    .join('\n  ')
  html = html.replace('</head>', `${scripts}\n  </head>`)

  return html
}

for (const route of ROUTES) {
  const outDir = join(distDir, route.path)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), renderForRoute(route))
  console.log(`Prerendered ${route.path} -> dist${route.path}/index.html`)
}
