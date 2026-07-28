# MMT Event & Wedding — Frontend React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `D:\Job\mmtevent-wedding-v3.html` as a React SPA that is visually and behaviorally identical to the original, wired to the backend API from `docs/superpowers/plans/2026-07-28-backend-api.md` for lead submission, image galleries, and the admin lead list.

**Architecture:** Vite + React (JavaScript, no TypeScript) with React Router for the four routes (`/`, `/su-kien`, `/tiec-cuoi`, `/admin`). One global stylesheet ported near-verbatim from the original `<style>` block, using the same `body[data-view="event"|"wedding"]` CSS-variable-override pattern as the original — set via `useLayoutEffect`, not rewritten into CSS modules. A `vite.config.js` dev proxy forwards `/api/*` to the backend on `:8080` so all API calls stay relative.

**Tech Stack:** React 18, Vite, React Router 6, Vitest + React Testing Library, `fetch` for API calls (no extra HTTP client library needed).

## Global Constraints

- **Hard UI/UX parity requirement** (from the design spec): layout, colors, typography, spacing, copy text, section order, and interactions must match `mmtevent-wedding-v3.html` exactly. Only intentional additions: the Gallery/Lightbox section and the `/admin` page.
- All API calls use relative paths (`/api/...`) — never hard-code `http://localhost:8080`. The Vite dev proxy (Task F1) makes this work in dev; a production build would need the same proxy or a same-origin deploy, but that's out of scope per the design spec (local run first).
- No `name` field anywhere in the contact form — matches the backend's `LeadRequest` shape exactly: `{ category, subtype, eventDate, guestCount, toneColor, phone }`.
- Backend API contract this plan depends on (from the backend plan, already implemented independently):
  - `GET /api/images/{events|wedding}` → `[{ filename, url }]`
  - `GET /api/images/{events|wedding}/{filename}` → raw image bytes
  - `POST /api/leads` body `{ category: "EVENT"|"WEDDING", subtype, eventDate, guestCount, toneColor, phone }` → 201 on success, 400 with a `{ fieldName: message }` object on validation failure
  - `GET /api/admin/leads` with HTTP Basic auth → `[LeadResponse]`, 401 without auth

---

### Task F1: Vite scaffold, router shell, proxy, static assets

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Copy: `D:\Job\logo.jpg` → `frontend/public/logo.jpg`
- Copy: `D:\Job\preview.jpg` → `frontend/public/preview.jpg`
- Test: `frontend/src/App.test.jsx`

**Interfaces:**
- Produces: `<App />` rendering a `<BrowserRouter>` with placeholder routes for `/`, `/su-kien`, `/tiec-cuoi`, `/admin` (real page components wired in Tasks F4/F12/F14/F15). Every later task's page components get mounted here.

- [ ] **Step 1: Initialize the Vite project**

Run: `cd D:/Job/mmt-app && npm create vite@latest frontend -- --template react`
Then: `cd frontend && npm install`

- [ ] **Step 2: Install router and test dependencies**

Run:
```bash
cd frontend
npm install react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure `vite.config.js` with dev proxy and Vitest**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 4: Create `frontend/src/setupTests.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Update `frontend/index.html` head with Google Fonts and title**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MMT Event & Wedding — Nhà thầu sự kiện & tiệc cưới miền Tây</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Copy static assets**

Run:
```bash
cp "/d/Job/logo.jpg" "D:/Job/mmt-app/frontend/public/logo.jpg"
cp "/d/Job/preview.jpg" "D:/Job/mmt-app/frontend/public/preview.jpg"
```

- [ ] **Step 7: Create `frontend/src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Note: `./styles/global.css` is created in Task F2 — create an empty placeholder file now (`frontend/src/styles/global.css` with just `/* populated in Task F2 */`) so this import resolves.

- [ ] **Step 8: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders the home gate at /', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText(/SỰ KIỆN DOANH NGHIỆP/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 9: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/App.test.jsx`
Expected: FAIL (`App` has no routes/content yet)

- [ ] **Step 10: Create minimal `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function HomeGatePlaceholder() {
  return <div>SỰ KIỆN DOANH NGHIỆP</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeGatePlaceholder />} />
        <Route path="/su-kien" element={<div>event page placeholder</div>} />
        <Route path="/tiec-cuoi" element={<div>wedding page placeholder</div>} />
        <Route path="/admin" element={<div>admin placeholder</div>} />
      </Routes>
    </BrowserRouter>
  )
}
```

(Real `HomeGate`, `EventPage`, `WeddingPage`, `AdminPage` replace these placeholders in Tasks F4, F12, F14, F15.)

- [ ] **Step 11: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/App.test.jsx`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/App.jsx frontend/src/App.test.jsx frontend/src/setupTests.js frontend/src/styles/global.css frontend/public/logo.jpg frontend/public/preview.jpg
git commit -m "Scaffold Vite React frontend with router shell and dev proxy"
```

---

### Task F2: Global CSS port

**Files:**
- Modify: `frontend/src/styles/global.css`

**Interfaces:**
- Produces: every CSS class/token used by every later component (`.hero`, `.btn`, `.gate`, `.svc2`, `.tone-*`, `.price`, `.cform`, etc.) — copied from the original file's `<style>` block.

- [ ] **Step 1: Copy the full `<style>` block content**

Open `D:\Job\mmtevent-wedding-v3.html` and copy everything between `<style>` and `</style>` (the original's lines 9–275: `:root` tokens, `body[data-view="event"]` overrides, and every component class) verbatim into `frontend/src/styles/global.css`, replacing the placeholder comment. Do not rewrite selectors, rename classes, or "clean up" anything — parity depends on using the exact same CSS this build was validated against.

- [ ] **Step 2: Verify the app still boots**

Run: `cd frontend && npx vitest run src/App.test.jsx`
Expected: PASS (CSS import doesn't break JS)

- [ ] **Step 3: Manual visual check**

Run: `cd frontend && npm run dev`, open `http://localhost:5173`. Confirm: Playfair Display serif headings and Be Vietnam Pro body font are visibly loaded (not falling back to Georgia/system-ui), and the page background/ink colors match the `:root` token values (`#FAF6EF` background, `#8C1F26` accent) even though only the placeholder text renders yet.

- [ ] **Step 4: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/styles/global.css
git commit -m "Port global.css verbatim from the original static site"
```

---

### Task F3: Layout shell (Header, Topbar, Footer, RailButtons) + view-switch behavior

**Files:**
- Create: `frontend/src/components/layout/Topbar.jsx`
- Create: `frontend/src/components/layout/Header.jsx`
- Create: `frontend/src/components/layout/Footer.jsx`
- Create: `frontend/src/components/layout/RailButtons.jsx`
- Modify: `frontend/src/App.jsx`
- Test: `frontend/src/App.test.jsx`

**Interfaces:**
- Consumes: React Router's `useLocation`.
- Produces: `<Header view="event"|"wedding" />`, `<Topbar />`, `<Footer />`, `<RailButtons />` — all rendered by `App.jsx` only when the current route isn't `/`. `App.jsx` sets `document.body.dataset.view` via `useLayoutEffect` on every route change (`"home"` at `/`, `"event"` at `/su-kien`, `"wedding"` at `/tiec-cuoi`) and calls `window.scrollTo(0, 0)`, mirroring the original `render(view)` function exactly.

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App.jsx'

describe('App layout switching', () => {
  it('hides header/topbar on the home gate', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('shows header/topbar and sets body view on /su-kien', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    window.history.pushState({}, '', '/su-kien')
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(document.body.dataset.view).toBe('event')
    expect(scrollSpy).toHaveBeenCalledWith(0, 0)
  })

  it('shows header/topbar and sets body view on /tiec-cuoi', () => {
    window.history.pushState({}, '', '/tiec-cuoi')
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(document.body.dataset.view).toBe('wedding')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/App.test.jsx`
Expected: FAIL (no `banner` role element yet, `dataset.view` never set)

- [ ] **Step 3: Create `Topbar.jsx`**

```jsx
export default function Topbar() {
  return (
    <div className="topbar">
      <div className="in">
        <span><b>MMT</b> · Một đầu mối — trọn ngày vui · Cần Thơ &amp; miền Tây</span>
        <span>Hotline / Zalo: <b>0939 050 550</b></span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `Header.jsx`**

```jsx
import { Link } from 'react-router-dom'

export default function Header({ view }) {
  const isEvent = view === 'event'
  return (
    <header role="banner">
      <div className="nav">
        <Link className="logo" to="/">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <span>
            <b>MMT {isEvent ? 'Event' : 'Wedding'}</b>
            <small>{isEvent ? 'Tổ chức sự kiện miền Tây' : 'by Minh Minh Thúy'}</small>
          </span>
        </Link>
        <nav>
          {isEvent ? (
            <ul>
              <li><a href="#quymo">Quy mô</a></li>
              <li><a href="#duan">Dự án</a></li>
              <li><a href="#dichvu">Dịch vụ</a></li>
              <li><a href="#quytrinh">Quy trình</a></li>
              <li><a href="#lienhe">Liên hệ</a></li>
            </ul>
          ) : (
            <ul>
              <li><a href="#tongmau">Bộ sưu tập</a></li>
              <li><a href="#banggia">Bảng giá</a></li>
              <li><a href="#album">Album</a></li>
              <li><a href="#lienhe-cuoi">Liên hệ</a></li>
            </ul>
          )}
        </nav>
        <div className="nav-right">
          {isEvent ? (
            <Link className="crosslink" to="/tiec-cuoi">Tiệc cưới — Đám hỏi</Link>
          ) : (
            <Link className="crosslink" to="/su-kien">Sự kiện doanh nghiệp</Link>
          )}
          <a className="btn gold" href={isEvent ? '#lienhe' : '#lienhe-cuoi'}>Nhận báo giá</a>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Create `Footer.jsx`**

```jsx
export default function Footer() {
  return (
    <footer>
      <div className="foot">
        <div>
          <div className="brand">MMT Event &amp; Wedding</div>
          <p style={{ marginTop: 10 }}>
            Một đầu mối — trọn ngày vui.<br />
            Tổ chức sự kiện · Lễ hội · Cưới hỏi trọn gói<br />
            Cần Thơ &amp; các tỉnh miền Tây
          </p>
        </div>
        <div>
          <h4>Liên hệ</h4>
          Hotline / Zalo: 0939 050 550<br />Facebook: MMT Event · Minh Minh Thúy<br />mmtevent-wedding.com
        </div>
        <div>
          <h4>Dịch vụ</h4>
          Nhà bạt không gian · Sân khấu · Âm thanh<br />Trang trí gia tiên · Đãi tiệc tại nhà
        </div>
      </div>
      <div className="sub">© 2026 MMT — Bản dựng: khung ảnh dùng ảnh thật từ thư viện MMT.</div>
    </footer>
  )
}
```

- [ ] **Step 6: Create `RailButtons.jsx`**

```jsx
export default function RailButtons() {
  return (
    <div className="rail">
      <button className="call" title="Gọi ngay" aria-label="Gọi ngay">Gọi</button>
      <button className="zalo" title="Chat Zalo">Zalo</button>
      <button className="fb" title="Facebook">f</button>
    </div>
  )
}
```

- [ ] **Step 7: Update `App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import Topbar from './components/layout/Topbar.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import RailButtons from './components/layout/RailButtons.jsx'

const VIEW_BY_PATH = { '/su-kien': 'event', '/tiec-cuoi': 'wedding' }

function Shell() {
  const location = useLocation()
  const view = VIEW_BY_PATH[location.pathname] ?? 'home'
  const isSub = view !== 'home'

  useLayoutEffect(() => {
    document.body.dataset.view = view
    window.scrollTo(0, 0)
  }, [location.pathname, view])

  return (
    <>
      {isSub && <Topbar />}
      {isSub && <Header view={view} />}
      <Routes>
        <Route path="/" element={<div>SỰ KIỆN DOANH NGHIỆP</div>} />
        <Route path="/su-kien" element={<div>event page placeholder</div>} />
        <Route path="/tiec-cuoi" element={<div>wedding page placeholder</div>} />
        <Route path="/admin" element={<div>admin placeholder</div>} />
      </Routes>
      {isSub && <Footer />}
      {isSub && <RailButtons />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/App.test.jsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/layout frontend/src/App.jsx frontend/src/App.test.jsx
git commit -m "Add layout shell (Header/Topbar/Footer/Rail) with view-switch behavior"
```

---

### Task F4: HomeGate page

**Files:**
- Create: `frontend/src/pages/HomeGate.jsx`
- Modify: `frontend/src/App.jsx`
- Test: `frontend/src/pages/HomeGate.test.jsx`

**Interfaces:**
- Consumes: `react-router-dom` `Link`.
- Produces: `<HomeGate />`, mounted at `/` in `App.jsx`, replacing the F1/F3 placeholder.

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import HomeGate from './HomeGate.jsx'

describe('HomeGate', () => {
  it('links to both sub-sites with their metrics', () => {
    render(<MemoryRouter><HomeGate /></MemoryRouter>)

    expect(screen.getByRole('link', { name: /SỰ KIỆN DOANH NGHIỆP/i })).toHaveAttribute('href', '/su-kien')
    expect(screen.getByRole('link', { name: /TIỆC CƯỚI/i })).toHaveAttribute('href', '/tiec-cuoi')
    expect(screen.getByText('300+')).toBeInTheDocument()
    expect(screen.getByText('6,9tr')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/HomeGate.test.jsx`
Expected: FAIL (`HomeGate` does not exist)

- [ ] **Step 3: Create `HomeGate.jsx`**

```jsx
import { Link } from 'react-router-dom'

export default function HomeGate() {
  return (
    <main>
      <div className="gate">
        <div className="brandmid">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <b>MMT</b>
          <small>Event &amp; Wedding</small>
        </div>

        <Link className="side ev" to="/su-kien">
          <div
            className="bgart"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200')" }}
          />
          <div className="inner">
            <span className="kicker">Nhà thầu sự kiện trọn gói</span>
            <h1>SỰ KIỆN DOANH NGHIỆP</h1>
            <p>Nhà bạt 1.000 khách, sân khấu, âm thanh ánh sáng — khai trương, ra quân, hội nghị, mở bán.</p>
            <div className="metrics">
              <span><b>10+</b> Năm thi công</span>
              <span><b>300+</b> Sự kiện lớn</span>
            </div>
            <span className="go">Khám phá MMT Event →</span>
          </div>
        </Link>

        <Link className="side wd" to="/tiec-cuoi">
          <div
            className="bgart"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200')" }}
          />
          <div className="inner">
            <span className="kicker">Trang trí cưới hỏi trọn gói</span>
            <h1>TIỆC CƯỚI &amp; GIA ĐÌNH</h1>
            <p>Cổng hoa, bàn gia tiên, rèm đèn và đãi tiệc tại nhà — giá công khai từ 6,9 triệu.</p>
            <div className="metrics">
              <span><b>4</b> Bộ sưu tập tông màu</span>
              <span><b>6,9tr</b> Gói trọn gói từ</span>
            </div>
            <span className="go">Khám phá MMT Wedding →</span>
          </div>
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Wire it into `App.jsx`**

Replace the `/` route's placeholder element with `<HomeGate />` (add `import HomeGate from './pages/HomeGate.jsx'`).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/HomeGate.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/pages/HomeGate.jsx frontend/src/pages/HomeGate.test.jsx frontend/src/App.jsx
git commit -m "Add HomeGate landing page"
```
