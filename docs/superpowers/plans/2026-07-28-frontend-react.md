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

---

### Task F5: Shared static components (StatsBar, ProcessSteps, Quotes)

**Files:**
- Create: `frontend/src/components/shared/StatsBar.jsx`
- Create: `frontend/src/components/shared/ProcessSteps.jsx`
- Create: `frontend/src/components/shared/Quotes.jsx`
- Test: `frontend/src/components/shared/StatsBar.test.jsx`
- Test: `frontend/src/components/shared/ProcessSteps.test.jsx`
- Test: `frontend/src/components/shared/Quotes.test.jsx`

**Interfaces:**
- Produces: `<StatsBar items={[{value, label}]} />`, `<ProcessSteps title={reactNode} steps={[{no, title, desc}]} />`, `<Quotes items={[{text, name, meta}]} />`. These take data as props (event/wedding real copy is supplied by the page components in Tasks F12/F14) — this task tests the render contract, not the copy itself.

- [ ] **Step 1: Write the failing tests**

```jsx
// StatsBar.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsBar from './StatsBar.jsx'

describe('StatsBar', () => {
  it('renders one stat per item with value and label', () => {
    render(<StatsBar items={[{ value: '10+', label: 'năm thi công' }, { value: '300+', label: 'sự kiện' }]} />)
    expect(screen.getByText('10+')).toBeInTheDocument()
    expect(screen.getByText('năm thi công')).toBeInTheDocument()
    expect(screen.getByText('300+')).toBeInTheDocument()
    expect(screen.getByText('sự kiện')).toBeInTheDocument()
  })
})
```

```jsx
// ProcessSteps.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProcessSteps from './ProcessSteps.jsx'

describe('ProcessSteps', () => {
  it('renders every step with its number, title, and description', () => {
    render(
      <ProcessSteps
        title={<h2>Bốn bước</h2>}
        steps={[{ no: 'Bước 01', title: 'Khảo sát', desc: 'Xem mặt bằng.' }]}
      />
    )
    expect(screen.getByText('Bốn bước')).toBeInTheDocument()
    expect(screen.getByText('Bước 01')).toBeInTheDocument()
    expect(screen.getByText('Khảo sát')).toBeInTheDocument()
    expect(screen.getByText('Xem mặt bằng.')).toBeInTheDocument()
  })
})
```

```jsx
// Quotes.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Quotes from './Quotes.jsx'

describe('Quotes', () => {
  it('renders every quote with text, name, and meta', () => {
    render(<Quotes items={[{ text: 'Rất chuyên nghiệp.', name: 'Cô dâu A', meta: 'Bộ sưu tập Son' }]} />)
    expect(screen.getByText('Rất chuyên nghiệp.')).toBeInTheDocument()
    expect(screen.getByText('Cô dâu A')).toBeInTheDocument()
    expect(screen.getByText('Bộ sưu tập Son')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npx vitest run src/components/shared/StatsBar.test.jsx src/components/shared/ProcessSteps.test.jsx src/components/shared/Quotes.test.jsx`
Expected: FAIL (components don't exist)

- [ ] **Step 3: Create `StatsBar.jsx`**

```jsx
export default function StatsBar({ items }) {
  return (
    <div className="stats">
      <div className="row">
        {items.map((item, i) => (
          <div className="stat rv" key={i}>
            <b>{item.value}</b>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `ProcessSteps.jsx`**

```jsx
export default function ProcessSteps({ id, title, steps }) {
  return (
    <section className="blk" id={id} style={{ paddingTop: 0 }}>
      <div className="sec-head center rv">
        <span className="eyebrow">Quy trình</span>
        {title}
      </div>
      <div className="steps rv">
        {steps.map((step, i) => (
          <div className="step" key={i}>
            <span className="no">{step.no}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `Quotes.jsx`**

```jsx
export default function Quotes({ items }) {
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="quotes rv">
        {items.map((item, i) => (
          <div className="quote" key={i}>
            <p>{item.text}</p>
            <div className="who"><b>{item.name}</b>{item.meta}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd frontend && npx vitest run src/components/shared/StatsBar.test.jsx src/components/shared/ProcessSteps.test.jsx src/components/shared/Quotes.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/shared/StatsBar.jsx frontend/src/components/shared/ProcessSteps.jsx frontend/src/components/shared/Quotes.jsx frontend/src/components/shared/StatsBar.test.jsx frontend/src/components/shared/ProcessSteps.test.jsx frontend/src/components/shared/Quotes.test.jsx
git commit -m "Add shared StatsBar, ProcessSteps, Quotes components"
```

---

### Task F6: Scroll-reveal hook

**Files:**
- Create: `frontend/src/components/shared/useScrollReveal.js`
- Test: `frontend/src/components/shared/useScrollReveal.test.jsx`

**Interfaces:**
- Produces: `useScrollReveal()` — a hook with no arguments/return value that, on mount, observes every `.rv` element in the document and adds the `in` class when it intersects, then stops observing that element. Called once by each page component (`EventPage`, `WeddingPage` in Tasks F12/F14).

- [ ] **Step 1: Write the failing test**

```jsx
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useScrollReveal from './useScrollReveal.js'

let observedElements = []
let intersectionCallback

class FakeIntersectionObserver {
  constructor(callback) {
    intersectionCallback = callback
  }
  observe(el) {
    observedElements.push(el)
  }
  unobserve() {}
  disconnect() {}
}

function TestComponent() {
  useScrollReveal()
  return <div className="rv" data-testid="target">content</div>
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    observedElements = []
    global.IntersectionObserver = FakeIntersectionObserver
  })

  it('observes .rv elements and adds "in" class when intersecting', () => {
    const { getByTestId } = render(<TestComponent />)
    const target = getByTestId('target')

    expect(observedElements).toContain(target)
    expect(target.className).not.toContain('in')

    intersectionCallback([{ target, isIntersecting: true }])

    expect(target.className).toContain('in')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/shared/useScrollReveal.test.jsx`
Expected: FAIL (hook does not exist)

- [ ] **Step 3: Create `useScrollReveal.js`**

```js
import { useEffect } from 'react'

export default function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('.rv').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/shared/useScrollReveal.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/shared/useScrollReveal.js frontend/src/components/shared/useScrollReveal.test.jsx
git commit -m "Add useScrollReveal hook replacing the original IntersectionObserver script"
```

---

### Task F7: Guest calculator (event page infrastructure spec logic)

**Files:**
- Create: `frontend/src/components/event/GuestCalculator.jsx`
- Test: `frontend/src/components/event/GuestCalculator.test.jsx`

**Interfaces:**
- Produces: `<GuestCalculator />` — self-contained, no props. Ports the exact thresholds from the original `updateB2BSpecs(val)`: `<=300`, `<=700`, else.

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GuestCalculator from './GuestCalculator.jsx'

describe('GuestCalculator', () => {
  it('defaults to the 500-guest (12m-15m) tier', () => {
    render(<GuestCalculator />)
    expect(screen.getByText('500 Khách')).toBeInTheDocument()
    expect(screen.getByText(/Khẩu độ 12m - 15m/)).toBeInTheDocument()
  })

  it('switches to the small tier at <=300', () => {
    render(<GuestCalculator />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '200' } })
    expect(screen.getByText('200 Khách')).toBeInTheDocument()
    expect(screen.getByText(/Khẩu độ 10m/)).toBeInTheDocument()
    expect(screen.getByText(/Bàn giao trước G-12 giờ/)).toBeInTheDocument()
  })

  it('switches to the large tier above 700', () => {
    render(<GuestCalculator />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '900' } })
    expect(screen.getByText(/Khẩu độ 18m - 20m/)).toBeInTheDocument()
    expect(screen.getByText(/20.000W/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/event/GuestCalculator.test.jsx`
Expected: FAIL (component does not exist)

- [ ] **Step 3: Create `GuestCalculator.jsx`**

```jsx
import { useState } from 'react'

function specsFor(guests) {
  if (guests <= 300) {
    return {
      tent: 'Khẩu độ 10m · Diện tích ~250m²',
      led: 'Màn LED P3.91 · Kích thước 15m²',
      audio: 'Hệ thống Sub/Full 6.000W chuẩn hội nghị',
      time: 'Bàn giao trước G-12 giờ (Thi công 18h)',
    }
  }
  if (guests <= 700) {
    return {
      tent: 'Khẩu độ 12m - 15m · Diện tích ~500m²',
      led: 'Màn LED P3.91 · Kích thước 24m² - 30m²',
      audio: 'Line Array 8 Sub 12 Full ngoài trời',
      time: 'Bàn giao trước G-24 giờ (Thi công 24h)',
    }
  }
  return {
    tent: 'Khẩu độ 18m - 20m · Diện tích ~900m² - 1200m²',
    led: 'Màn LED P3.91 · Kích thước 40m² + 2 Màn phụ',
    audio: 'Hệ thống Line Array công suất lớn 20.000W',
    time: 'Bàn giao trước G-24 giờ (Thi công 48h)',
  }
}

export default function GuestCalculator() {
  const [guests, setGuests] = useState(500)
  const specs = specsFor(guests)

  return (
    <>
      <div className="guest-calculator rv">
        <div className="calc-header">
          <span>Quy mô sự kiện dự kiến:</span>
          <b>{guests} Khách</b>
        </div>
        <input
          type="range"
          role="slider"
          min="100"
          max="1200"
          step="100"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>100 khách</span>
          <span>500 khách</span>
          <span>1.000+ khách</span>
        </div>
      </div>
      <div className="specs-grid rv">
        <div className="spec-card">
          <div className="spec-info">
            <small>HỆ THỐNG NHÀ BẠT</small>
            <h3>{specs.tent}</h3>
            <p>Bạt 2 lớp chống nóng cách nhiệt, khung truss hợp kim nhôm chịu lực ngoài trời.</p>
          </div>
        </div>
        <div className="spec-card">
          <div className="spec-info">
            <small>MÀN HÌNH LED OUTDOOR</small>
            <h3>{specs.led}</h3>
            <p>Độ sáng cao ngoài trời, hệ thống cabin nhôm đúc siêu nhẹ, processor chuẩn HD.</p>
          </div>
        </div>
        <div className="spec-card">
          <div className="spec-info">
            <small>ÂM THANH &amp; ÁNH SÁNG</small>
            <h3>{specs.audio}</h3>
            <p>Hệ thống loa Line Array công suất lớn, Mixer Digital 32 kênh, đèn Beam 350W.</p>
          </div>
        </div>
        <div className="spec-card highlight">
          <div className="spec-info">
            <small>TIMELINE THI CÔNG CAM KẾT</small>
            <h3>{specs.time}</h3>
            <p>Thi công trong 24h. Đội ngũ trực kỹ thuật suốt thời gian diễn ra sự kiện.</p>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/event/GuestCalculator.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/event/GuestCalculator.jsx frontend/src/components/event/GuestCalculator.test.jsx
git commit -m "Add GuestCalculator with ported B2B spec thresholds"
```

---

### Task F8: Wedding tone data + ToneSelector

**Files:**
- Create: `frontend/src/data/toneData.js`
- Create: `frontend/src/components/wedding/ToneSelector.jsx`
- Test: `frontend/src/components/wedding/ToneSelector.test.jsx`

**Interfaces:**
- Produces: `toneData` — an object keyed `son|dao|kem|ngoc`, each `{ badge, title, desc, list: string[] }` (text only, ported verbatim from the original `toneData` JS object). `<ToneSelector imagesByTone={{ son: [url1,url2,url3], dao: [...], kem: [...], ngoc: [...] }} />` — image URLs are supplied by the caller (Task F14 wires these from real wedding photos via `data/imagePicks.js`, Task F10), keeping this component testable with plain mock URLs.

- [ ] **Step 1: Create `toneData.js`**

```js
export const toneData = {
  son: {
    badge: 'LỄ GIA TIÊN CHUẨN LỆ XƯA',
    title: 'Bộ Sưu Tập Tông Son — Đỏ Son Ấm Cúng',
    desc: 'Điểm nhấn chữ Hỷ đỏ thắm, lư đồng sáng bóng kết hợp hoa lụa cao cấp. Phù hợp cho lễ Vu Quy / Tân Hôn tôn nghiêm, chuẩn mực truyền thống miền Tây.',
    list: [
      'Cổng hoa tươi/lụa tone Đỏ Son + Bảng tên thiết kế riêng',
      'Bàn gia tiên phủ khăn gấm đỏ, phông rèm dệt xếp lớp',
      'Bộ lư đồng, chân nến, khay mâm quả đồng bộ',
      'Áo ghế nơ lụa satin đỏ cho 20 đại biểu',
    ],
  },
  dao: {
    badge: 'HỒNG PASTEL TRONG TRẺO',
    title: 'Bộ Sưu Tập Tông Đào — Nude Hồng Nhẹ Nhàng',
    desc: 'Sự kết hợp giữa voan tơ mềm mại, hoa lụa tông pastel trong trẻo. Mang lại cảm giác thanh lịch, hiện đại, thích hợp cho các cô dâu yêu thích phong cách Hàn Quốc.',
    list: [
      'Cổng hoa lụa dáng vòm tròn tone Hồng Nude',
      'Phông gia tiên rèm voan dập ly mềm mại',
      'Bàn hoa gia tiên trang trí nến cốc & lọ hoa cao thấp',
      'Bộ mâm quả sơn mài tone hồng cam hiện đại',
    ],
  },
  kem: {
    badge: 'SANG TRỌNG & TỐI GIẢN',
    title: 'Bộ Sưu Tập Tông Kem — Trắng Ánh Kim Rực Rỡ',
    desc: 'Tông màu kem nhã nhặn tôn lên không gian nhà phố. Hệ thống đèn chuỗi ánh vàng lung linh biến khoảng sân nhỏ thành sảnh tiệc ấm cúng.',
    list: [
      'Cổng hoa tươi/lụa màu Trắng Kem & Lá Ánh Kim',
      'Backdrop gia tiên viền pha lê chiếu sáng',
      'Rèm trần & chuỗi đèn LED ánh sáng ấm',
      'Bàn ghế Tiffany nơ lụa màu kem nhã nhặn',
    ],
  },
  ngoc: {
    badge: 'DẤU ẤN KHÁC BIỆT',
    title: 'Bộ Sưu Tập Tông Ngọc — Xanh Lục Bảo Tinh Tế',
    desc: 'Độc đáo, quý phái với sự kết hợp giữa màu xanh lục bảo và hoa trắng tinh khôi. Sự lựa chọn hoàn hảo cho cặp đôi muốn không gian lễ cưới mang cá tính riêng.',
    list: [
      'Cổng hoa thiết kế khối nổi tone Xanh Lục - Trắng',
      'Bàn gia tiên phủ gấm màu Ngọc Lục Bảo',
      'Phông mica/gỗ khắc tên cô dâu chú rể mạ vàng',
      'Set hoa để bàn & nơ ghế màu xanh quý phái',
    ],
  },
}

export const toneOrder = ['son', 'dao', 'kem', 'ngoc']
export const toneLabels = { son: ['Tông Son', 'Đỏ Truyền Thống'], dao: ['Tông Đào', 'Hồng Nude Pastel'], kem: ['Tông Kem', 'Trắng Ánh Kim'], ngoc: ['Tông Ngọc', 'Xanh Lục Bảo'] }
```

- [ ] **Step 2: Write the failing test**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ToneSelector from './ToneSelector.jsx'

const imagesByTone = {
  son: ['son1.jpg', 'son2.jpg', 'son3.jpg'],
  dao: ['dao1.jpg', 'dao2.jpg', 'dao3.jpg'],
  kem: ['kem1.jpg', 'kem2.jpg', 'kem3.jpg'],
  ngoc: ['ngoc1.jpg', 'ngoc2.jpg', 'ngoc3.jpg'],
}

describe('ToneSelector', () => {
  it('defaults to the Son tone', () => {
    render(<ToneSelector imagesByTone={imagesByTone} />)
    expect(screen.getByText('Bộ Sưu Tập Tông Son — Đỏ Son Ấm Cúng')).toBeInTheDocument()
    expect(screen.getByAltText('Bàn Gia Tiên')).toHaveAttribute('src', 'son1.jpg')
  })

  it('switches content and active button when Đào is clicked', () => {
    render(<ToneSelector imagesByTone={imagesByTone} />)
    fireEvent.click(screen.getByRole('button', { name: /Tông Đào/i }))

    expect(screen.getByText('Bộ Sưu Tập Tông Đào — Nude Hồng Nhẹ Nhàng')).toBeInTheDocument()
    expect(screen.getByAltText('Bàn Gia Tiên')).toHaveAttribute('src', 'dao1.jpg')
    expect(screen.getByRole('button', { name: /Tông Đào/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /Tông Son/i })).not.toHaveClass('active')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/wedding/ToneSelector.test.jsx`
Expected: FAIL (component does not exist)

- [ ] **Step 4: Create `ToneSelector.jsx`**

```jsx
import { useState } from 'react'
import { toneData, toneOrder, toneLabels } from '../../data/toneData.js'

export default function ToneSelector({ imagesByTone }) {
  const [active, setActive] = useState('son')
  const data = toneData[active]
  const images = imagesByTone[active] ?? []

  return (
    <>
      <div className="tone-selector rv">
        {toneOrder.map((key) => (
          <button
            key={key}
            className={`tone-btn${active === key ? ' active' : ''}`}
            onClick={() => setActive(key)}
          >
            <b>{toneLabels[key][0]}</b>
            <small>{toneLabels[key][1]}</small>
          </button>
        ))}
      </div>
      <div className="tone-display-card rv">
        <div className="tone-info">
          <span className="badge-tone">{data.badge}</span>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
          <div className="tone-features">
            <h4>Hạng mục đi kèm nổi bật:</h4>
            <ul>
              {data.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <a href="#lienhe-cuoi" className="btn gold">Giữ lịch tông màu này →</a>
        </div>
        <div className="tone-gallery">
          <div className="gal-item main">
            <img src={images[0]} alt="Bàn Gia Tiên" />
            <span className="gal-tag">Bàn Gia Tiên</span>
          </div>
          <div className="gal-item">
            <img src={images[1]} alt="Cổng hoa" />
            <span className="gal-tag">Cổng Hoa</span>
          </div>
          <div className="gal-item">
            <img src={images[2]} alt="Không gian tiệc" />
            <span className="gal-tag">Không Gian Tiệc</span>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/wedding/ToneSelector.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/data/toneData.js frontend/src/components/wedding/ToneSelector.jsx frontend/src/components/wedding/ToneSelector.test.jsx
git commit -m "Add wedding tone data and ToneSelector component"
```

---

### Task F9: ContactForm (shared, event/wedding variants, POST /api/leads)

**Files:**
- Create: `frontend/src/components/shared/ContactForm.jsx`
- Test: `frontend/src/components/shared/ContactForm.test.jsx`

**Interfaces:**
- Consumes: backend `POST /api/leads` contract (see Global Constraints).
- Produces: `<ContactForm variant="event"|"wedding" />`, self-contained (owns its own state, calls `fetch('/api/leads', ...)` directly — no props needed from the page beyond `variant`).

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ContactForm from './ContactForm.jsx'

describe('ContactForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders event-specific fields for variant="event"', () => {
    render(<ContactForm variant="event" />)
    expect(screen.getByText('Loại sự kiện')).toBeInTheDocument()
    expect(screen.getByText('Số khách (ước tính)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i })).toBeInTheDocument()
  })

  it('renders wedding-specific fields for variant="wedding"', () => {
    render(<ContactForm variant="wedding" />)
    expect(screen.getByText('Loại lễ')).toBeInTheDocument()
    expect(screen.getByText('Tông màu yêu thích')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Giữ lịch/i })).toBeInTheDocument()
  })

  it('shows an inline error and does not call fetch when phone is blank', () => {
    render(<ContactForm variant="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    expect(screen.getByText(/Vui lòng nhập số điện thoại/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits the correct payload for the event variant', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    render(<ContactForm variant="event" />)

    fireEvent.change(screen.getByPlaceholderText(/Để MMT gọi lại tư vấn/i), { target: { value: '0900000001' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/leads')
    const body = JSON.parse(options.body)
    expect(body.category).toBe('EVENT')
    expect(body.phone).toBe('0900000001')

    expect(await screen.findByText(/Đã gửi yêu cầu/i)).toBeInTheDocument()
  })

  it('shows the server validation message on a 400 response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ phone: 'So dien thoai khong hop le' }),
    })
    render(<ContactForm variant="wedding" />)

    fireEvent.change(screen.getAllByPlaceholderText(/Để MMT gọi lại tư vấn/i)[0], { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Giữ lịch/i }))

    expect(await screen.findByText('So dien thoai khong hop le')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/shared/ContactForm.test.jsx`
Expected: FAIL (component does not exist)

- [ ] **Step 3: Create `ContactForm.jsx`**

```jsx
import { useState } from 'react'

const EVENT_TYPES = [
  'Khai trương / Động thổ / Ra quân',
  'Hội nghị / Hội thảo',
  'Mở bán / Sự kiện ngoài trời',
  'Thuê thiết bị lẻ',
]

const WEDDING_TYPES = [
  'Lễ Vu Quy (nhà gái)',
  'Lễ Tân Hôn (nhà trai)',
  'Đám hỏi',
  'Tiệc báo hỷ tại nhà',
]

const TONE_OPTIONS = [
  ['son', 'Son — đỏ truyền thống'],
  ['dao', 'Đào — hồng hiện đại'],
  ['kem', 'Kem — tối giản'],
  ['ngoc', 'Ngọc — xanh khác biệt'],
  ['', 'Chưa biết, cần tư vấn'],
]

export default function ContactForm({ variant }) {
  const isEvent = variant === 'event'
  const [subtype, setSubtype] = useState(isEvent ? EVENT_TYPES[0] : WEDDING_TYPES[0])
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [toneColor, setToneColor] = useState(TONE_OPTIONS[0][0])
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success

  async function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim()) {
      setErrors({ phone: 'Vui lòng nhập số điện thoại' })
      return
    }
    setErrors({})
    setStatus('submitting')

    const payload = {
      category: isEvent ? 'EVENT' : 'WEDDING',
      subtype,
      eventDate: eventDate || null,
      guestCount: isEvent ? (guestCount ? Number(guestCount) : null) : null,
      toneColor: isEvent ? null : (toneColor || null),
      phone,
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setStatus('success')
        setPhone('')
      } else {
        const fieldErrors = await response.json()
        setErrors(fieldErrors)
        setStatus('idle')
      }
    } catch {
      setErrors({ general: 'Không gửi được yêu cầu, vui lòng thử lại.' })
      setStatus('idle')
    }
  }

  return (
    <form className="cform rv" onSubmit={handleSubmit}>
      <label>{isEvent ? 'Loại sự kiện' : 'Loại lễ'}</label>
      <select value={subtype} onChange={(e) => setSubtype(e.target.value)}>
        {(isEvent ? EVENT_TYPES : WEDDING_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>{isEvent ? 'Ngày dự kiến' : 'Ngày lành dự kiến'}</label>
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />

      {isEvent ? (
        <>
          <label>Số khách (ước tính)</label>
          <input type="number" placeholder="Ví dụ: 300" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} />
        </>
      ) : (
        <>
          <label>Tông màu yêu thích</label>
          <select value={toneColor} onChange={(e) => setToneColor(e.target.value)}>
            {TONE_OPTIONS.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
          </select>
        </>
      )}

      <label>Số điện thoại của bạn</label>
      <input
        type="tel"
        placeholder="Để MMT gọi lại tư vấn"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {errors.phone && <div className="note" style={{ color: 'var(--accent)' }}>{errors.phone}</div>}
      {errors.general && <div className="note" style={{ color: 'var(--accent)' }}>{errors.general}</div>}

      <button className="btn gold" type="submit" disabled={status === 'submitting'}>
        {isEvent ? 'Gửi yêu cầu báo giá' : 'Giữ lịch & nhận báo giá'}
      </button>

      {status === 'success' && <div className="note">Đã gửi yêu cầu — MMT sẽ liên hệ lại sớm nhất.</div>}
      <div className="note">Chỉ 4 thông tin — không cần điền dài dòng.</div>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/shared/ContactForm.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/shared/ContactForm.jsx frontend/src/components/shared/ContactForm.test.jsx
git commit -m "Add shared ContactForm wired to POST /api/leads"
```

---

### Task F10: Gallery, Lightbox, and named image-slot picks

**Files:**
- Create: `frontend/src/data/imagePicks.js`
- Create: `frontend/src/components/shared/Lightbox.jsx`
- Create: `frontend/src/components/shared/Gallery.jsx`
- Test: `frontend/src/data/imagePicks.test.js`
- Test: `frontend/src/components/shared/Lightbox.test.jsx`
- Test: `frontend/src/components/shared/Gallery.test.jsx`

**Interfaces:**
- Produces: `pickImages(images, indexes)` — safe index-based picker with fallback. `<Lightbox images={[{filename,url}]} startIndex={number} onClose={fn} />`. `<Gallery category="events"|"wedding" />` — fetches `GET /api/images/{category}` itself.

> **Note for the person wiring the wedding page (Task F14):** the 23 real wedding photos are not pre-sorted by color tone. `TONE_IMAGE_INDEXES` below picks representative photos by position only — they will not actually match "Son/Đào/Kem/Ngọc" thematically. Flag this to the site owner once the wedding page is visually reviewed; swapping specific photos into specific tones later is a one-line edit to `TONE_IMAGE_INDEXES` / `SERVICE_CARD_INDEXES` in this file, nothing else needs to change.

- [ ] **Step 1: Write the failing test for `imagePicks.js`**

```js
import { describe, it, expect } from 'vitest'
import { pickImages } from './imagePicks.js'

describe('pickImages', () => {
  it('returns URLs at the given indexes', () => {
    const images = [{ url: 'a' }, { url: 'b' }, { url: 'c' }]
    expect(pickImages(images, [0, 2])).toEqual(['a', 'c'])
  })

  it('falls back to undefined when an index is out of range', () => {
    const images = [{ url: 'a' }]
    expect(pickImages(images, [0, 5])).toEqual(['a', undefined])
  })

  it('returns an empty array when given no images', () => {
    expect(pickImages([], [0, 1, 2])).toEqual([undefined, undefined, undefined])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/data/imagePicks.test.js`
Expected: FAIL (`imagePicks.js` does not exist)

- [ ] **Step 3: Create `imagePicks.js`**

```js
export function pickImages(images, indexes) {
  return indexes.map((i) => images[i]?.url)
}

// Event service cards (ServicesGrid, Task F11) — one representative photo per card.
export const SERVICE_CARD_INDEXES = { nhaBat: 0, khaiTruong: 1, hoiNghi: 2 }

// Wedding tone gallery (ToneSelector, Task F8) — picked by position only, since the
// 23 real wedding photos aren't pre-sorted by color tone. Swap these indexes once
// the site owner has reviewed which real photos fit which tone.
export const TONE_IMAGE_INDEXES = {
  son: [0, 1, 2],
  dao: [3, 4, 5],
  kem: [6, 7, 8],
  ngoc: [9, 10, 11],
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/data/imagePicks.test.js`
Expected: PASS

- [ ] **Step 5: Write the failing test for `Lightbox.jsx`**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Lightbox from './Lightbox.jsx'

const images = [
  { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
  { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
  { filename: 'c.jpg', url: '/api/images/events/c.jpg' },
]

describe('Lightbox', () => {
  it('shows the image at startIndex and navigates next/prev', () => {
    render(<Lightbox images={images} startIndex={0} onClose={() => {}} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/a.jpg')

    fireEvent.click(screen.getByRole('button', { name: /tiếp/i }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/b.jpg')

    fireEvent.click(screen.getByRole('button', { name: /trước/i }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/a.jpg')
  })

  it('calls onClose on Escape and on backdrop click', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} startIndex={0} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('lightbox-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/shared/Lightbox.test.jsx`
Expected: FAIL (`Lightbox` does not exist)

- [ ] **Step 7: Create `Lightbox.jsx`**

```jsx
import { useEffect, useState } from 'react'

export default function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  const current = images[index]

  return (
    <div
      data-testid="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <button
        aria-label="Ảnh trước"
        onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length) }}
      >
        ‹ Trước
      </button>
      <img
        src={current.url}
        alt={current.filename}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }}
      />
      <button
        aria-label="Ảnh tiếp"
        onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length) }}
      >
        Tiếp ›
      </button>
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/shared/Lightbox.test.jsx`
Expected: PASS

- [ ] **Step 9: Write the failing test for `Gallery.jsx`**

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Gallery from './Gallery.jsx'

describe('Gallery', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and renders a thumbnail grid', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
        { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      ],
    })

    render(<Gallery category="events" />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/images/events'))
    const thumbs = await screen.findAllByRole('img')
    expect(thumbs).toHaveLength(2)
    expect(thumbs[0]).toHaveAttribute('loading', 'lazy')
  })

  it('opens the Lightbox on thumbnail click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
        { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      ],
    })

    render(<Gallery category="events" />)
    const thumbs = await screen.findAllByRole('img')
    fireEvent.click(thumbs[1])

    expect(screen.getByTestId('lightbox-backdrop')).toBeInTheDocument()
  })

  it('shows a placeholder message when there are no images', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] })

    render(<Gallery category="wedding" />)

    expect(await screen.findByText(/Chưa có ảnh/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/shared/Gallery.test.jsx`
Expected: FAIL (`Gallery` does not exist)

- [ ] **Step 11: Create `Gallery.jsx`**

```jsx
import { useEffect, useState } from 'react'
import Lightbox from './Lightbox.jsx'

export default function Gallery({ category }) {
  const [images, setImages] = useState([])
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/images/${category}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (!cancelled) setImages(data) })
      .catch(() => { if (!cancelled) setImages([]) })
    return () => { cancelled = true }
  }, [category])

  if (images.length === 0) {
    return <p>Chưa có ảnh — vui lòng quay lại sau.</p>
  }

  return (
    <>
      <div className="tone-gallery" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {images.map((image, i) => (
          <div className="gal-item" key={image.filename}>
            <img
              src={image.url}
              alt={image.filename}
              loading="lazy"
              onClick={() => setOpenIndex(i)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>
      {openIndex !== null && (
        <Lightbox images={images} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  )
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/shared/Gallery.test.jsx`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/data/imagePicks.js frontend/src/data/imagePicks.test.js frontend/src/components/shared/Lightbox.jsx frontend/src/components/shared/Lightbox.test.jsx frontend/src/components/shared/Gallery.jsx frontend/src/components/shared/Gallery.test.jsx
git commit -m "Add Gallery, Lightbox, and named image-slot picks for real photos"
```

---

### Task F11: Event static sections (ProjectsList, ServicesGrid, Pillars)

These three carry the original site's real marketing copy verbatim (ported from
`mmtevent-wedding-v3.html` lines 425-484). Per the plan's testing approach, a
test asserting the exact Vietnamese string we just typed would be circular —
the real check is the manual side-by-side comparison in Step 3. The automated
test here only checks structure (right number of items rendered), which is a
genuine regression guard.

**Files:**
- Create: `frontend/src/components/event/ProjectsList.jsx`
- Create: `frontend/src/components/event/ServicesGrid.jsx`
- Create: `frontend/src/components/event/Pillars.jsx`
- Test: `frontend/src/components/event/EventStaticSections.test.jsx`

**Interfaces:**
- Consumes: `pickImages`, `SERVICE_CARD_INDEXES` (Task F10) — `ServicesGrid` receives the fetched `events` image list as a `images` prop (from `EventPage`, Task F12) and picks 3 representative photos from it.
- Produces: `<ProjectsList />`, `<ServicesGrid images={[{filename,url}]} />`, `<Pillars />` — no other props needed; copy is embedded directly (this is the one place in the plan where content lives in the component, not a data file, since it's page-specific prose, not reusable data).

- [ ] **Step 1: Write the structural test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectsList from './ProjectsList.jsx'
import ServicesGrid from './ServicesGrid.jsx'
import Pillars from './Pillars.jsx'

describe('Event static sections', () => {
  it('ProjectsList renders exactly 4 numbered projects', () => {
    render(<ProjectsList />)
    expect(screen.getAllByText(/^0[1-4]$/)).toHaveLength(4)
  })

  it('ServicesGrid renders exactly 3 service cards using provided images', () => {
    const images = [
      { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
      { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      { filename: 'c.jpg', url: '/api/images/events/c.jpg' },
    ]
    render(<ServicesGrid images={images} />)
    const cardImages = screen.getAllByRole('img')
    expect(cardImages).toHaveLength(3)
    expect(cardImages[0]).toHaveAttribute('src', '/api/images/events/a.jpg')
  })

  it('Pillars renders exactly 3 pillars', () => {
    render(<Pillars />)
    expect(screen.getAllByText(/^0[1-3]$/)).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails, then create the three components**

Run: `cd frontend && npx vitest run src/components/event/EventStaticSections.test.jsx`
Expected: FAIL (components don't exist), then implement:

```jsx
// ProjectsList.jsx
export default function ProjectsList() {
  const projects = [
    { no: '01', title: 'Lễ ra quân VNPT Cần Thơ', meta: 'Nghi lễ · Nhà bạt · Sân khấu · 2025' },
    { no: '02', title: 'Mở bán dự án Nam Long', meta: 'Ngoài trời · Nhà bạt đôi · 800 khách · 2025' },
    { no: '03', title: 'Động thổ Cara Legend — Caragroup', meta: 'Nghi thức · Múa lân · Cổng chào · 2025' },
    { no: '04', title: 'Hội nghị công nghệ ĐH Nam Cần Thơ', meta: 'Hội nghị · LED · Đại biểu · 2024' },
  ]
  return (
    <section className="blk" id="duan" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Dự án tiêu biểu</span>
        <h2>Những dấu mốc chúng tôi <em>dựng nên</em></h2>
      </div>
      <div className="projects rv">
        {projects.map((p) => (
          <div className="proj" key={p.no}>
            <span className="no">{p.no}</span>
            <div><h3>{p.title}</h3><div className="meta">{p.meta}</div></div>
            <span className="view">Xem dự án →</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

```jsx
// ServicesGrid.jsx
import { pickImages, SERVICE_CARD_INDEXES } from '../../data/imagePicks.js'

export default function ServicesGrid({ images }) {
  const [imgA, imgB, imgC] = pickImages(images, Object.values(SERVICE_CARD_INDEXES))
  const services = [
    { num: '01', img: imgA, title: 'Nhà bạt không gian & mở bán ngoài trời',
      desc: 'Hạng mục thế mạnh đặc trưng của MMT tại miền Tây — che nắng mưa tuyệt đối cho sự kiện quy mô lớn.',
      items: ['Nhà bạt sọc quy mô đến 1.000 khách', 'Quạt hơi nước, khu tea break', 'Thi công trong 48 giờ'],
      cap: 'Ảnh dự án — Mở bán Nam Long' },
    { num: '02', img: imgB, title: 'Lễ khai trương · Động thổ · Ra quân',
      desc: 'Kịch bản nghi thức chuẩn doanh nghiệp, chạy thử toàn bộ trước giờ G.',
      items: ['Sân khấu, backdrop, cổng chào', 'Múa lân, MC, nghi thức cắt băng', 'Kỹ thuật trực suốt buổi lễ'],
      cap: 'Ảnh dự án — Lễ ra quân VNPT' },
    { num: '03', img: imgC, title: 'Hội nghị · Hội thảo & cho thuê thiết bị',
      desc: 'Trọn gói kỹ thuật cho hội nghị trong nhà lẫn không gian mở, hoặc thuê lẻ từng hạng mục.',
      items: ['Âm thanh hội nghị, màn hình LED', 'Bàn ghế đại biểu, đón tiếp', 'Giao lắp tận nơi trong ngày'],
      cap: 'Ảnh dự án — Hội nghị ĐH Nam Cần Thơ' },
  ]
  return (
    <section className="blk" id="dichvu" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Năng lực</span>
        <h2>Thi công, dàn dựng &amp; <em>vận hành</em></h2>
      </div>
      <div className="svcgrid">
        {services.map((s) => (
          <div className="svc2 rv" key={s.num}>
            <div className="txt">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              <span className="more">Xem chi tiết</span>
            </div>
            <div className="card-ph">
              <div className="img">
                {s.img && <img src={s.img} alt={s.cap} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span className="num">{s.num}</span>
              <span className="cap">{s.cap}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

```jsx
// Pillars.jsx
export default function Pillars() {
  const pillars = [
    { no: '01', title: 'Đúng giờ khai mạc', desc: 'Sự kiện không có cơ hội làm lại. Mọi hạng mục dựng xong và chạy thử trước giờ G — đó là cam kết, không phải khẩu hiệu.' },
    { no: '02', title: 'Giá minh bạch từng hạng mục', desc: 'Báo giá chi tiết trong 24 giờ, bóc tách rõ ràng, không phát sinh ẩn khi đã ký.' },
    { no: '03', title: 'Đội thi công tại chỗ', desc: 'Nhân sự và kho thiết bị đặt tại Cần Thơ — xử lý phát sinh trong 30 phút, không chờ điều động.' },
  ]
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Cách MMT làm việc</span>
        <h2>Vì sao doanh nghiệp chọn MMT cho ngày <em>quan trọng nhất</em></h2>
      </div>
      <div className="pillars rv">
        {pillars.map((p) => (
          <div className="pillar" key={p.no}>
            <span className="no">{p.no}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/components/event/EventStaticSections.test.jsx`
Expected: PASS

- [ ] **Step 4: Manual side-by-side comparison**

Open `D:\Job\mmtevent-wedding-v3.html` in a browser, switch to the Event view.
Compare, section by section, against these three components once wired into
`EventPage` (Task F12): `#duan` (4 projects, same titles/meta), `#dichvu` (3
service blocks, same headings/bullet lists/order), and the pillars block right
after (3 pillars, same headings/body text). Fix any copy drift now.

- [ ] **Step 5: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/event/ProjectsList.jsx frontend/src/components/event/ServicesGrid.jsx frontend/src/components/event/Pillars.jsx frontend/src/components/event/EventStaticSections.test.jsx
git commit -m "Add ProjectsList, ServicesGrid, Pillars event sections"
```

---

### Task F12: EventPage assembly (hero + all event sections)

**Files:**
- Create: `frontend/src/components/event/EventHero.jsx`
- Create: `frontend/src/pages/EventPage.jsx`
- Modify: `frontend/src/App.jsx`
- Test: `frontend/src/pages/EventPage.test.jsx`

**Interfaces:**
- Consumes: `useScrollReveal` (F6), `StatsBar`/`ProcessSteps`/`Quotes` (F5), `GuestCalculator` (F7), `ProjectsList`/`ServicesGrid`/`Pillars` (F11), `ContactForm` (F9), `Gallery` (F10).
- Produces: `<EventPage />`, mounted at `/su-kien` in `App.jsx`, replacing the placeholder.

- [ ] **Step 1: Create `EventHero.jsx`**

```jsx
export default function EventHero() {
  return (
    <div className="hero">
      <div className="art" />
      <div className="in">
        <div className="counter">01<i></i>05</div>
        <div className="side-label">Một đầu mối — trọn ngày vui</div>
        <div className="content">
          <span className="eyebrow" style={{ marginBottom: 26 }}>Nhà thầu sự kiện trọn gói · Cần Thơ &amp; miền Tây</span>
          <h1><span className="outline">DỰNG NÊN</span><br />NGÀY <span className="accented">đáng nhớ</span></h1>
          <p>Từ nhà bạt 1.000 khách đến sân khấu trọn lễ — MMT thi công hạ tầng, kỹ thuật và nhân sự vận hành, cam kết đúng giờ khai mạc.</p>
          <div className="hero-cta">
            <a className="btn gold" href="#lienhe">Nhận báo giá trong 24h</a>
            <a className="btn ghost" href="#duan">Xem dự án</a>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the failing test**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import EventPage from './EventPage.jsx'

describe('EventPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the event contact form variant and fetches event images', async () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)

    expect(screen.getByText('Loại sự kiện')).toBeInTheDocument()
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/images/events'))
  })

  it('links the closing promo to the wedding site', () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Khám phá MMT Wedding/i })).toHaveAttribute('href', '/tiec-cuoi')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/EventPage.test.jsx`
Expected: FAIL (`EventPage` does not exist)

- [ ] **Step 4: Create `EventPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../components/shared/useScrollReveal.js'
import StatsBar from '../components/shared/StatsBar.jsx'
import ProcessSteps from '../components/shared/ProcessSteps.jsx'
import Quotes from '../components/shared/Quotes.jsx'
import ContactForm from '../components/shared/ContactForm.jsx'
import Gallery from '../components/shared/Gallery.jsx'
import EventHero from '../components/event/EventHero.jsx'
import GuestCalculator from '../components/event/GuestCalculator.jsx'
import ProjectsList from '../components/event/ProjectsList.jsx'
import ServicesGrid from '../components/event/ServicesGrid.jsx'
import Pillars from '../components/event/Pillars.jsx'

const STATS = [
  { value: '10+', label: 'năm thi công' },
  { value: '300+', label: 'sự kiện đã tổ chức' },
  { value: '1.000', label: 'khách / nhà bạt lớn nhất' },
  { value: '24h', label: 'báo giá chi tiết' },
]

const STEPS = [
  { no: 'Bước 01', title: 'Khảo sát & tư vấn', desc: 'Xem mặt bằng thực tế, đo đạc, tư vấn phương án phù hợp ngân sách.' },
  { no: 'Bước 02', title: 'Báo giá trong 24h', desc: 'Báo giá chi tiết từng hạng mục, không phát sinh ẩn.' },
  { no: 'Bước 03', title: 'Thi công lắp đặt', desc: 'Dựng và chạy thử toàn bộ trước giờ G, trực suốt sự kiện.' },
  { no: 'Bước 04', title: 'Nghiệm thu & tháo dỡ', desc: 'Bàn giao đúng cam kết, trả lại mặt bằng sạch.' },
]

const QUOTES = [
  { text: 'Sự kiện ra quân diễn ra đúng kế hoạch từng phút. Đội MMT dựng xong từ hôm trước và có mặt từ sáng sớm xử lý âm thanh.', name: 'Đại diện ban tổ chức', meta: 'Sự kiện doanh nghiệp tại Cần Thơ' },
  { text: 'Nhà bạt cho buổi mở bán hơn 800 khách dựng gọn trong hai ngày, che nắng tốt và rất chỉn chu trên ảnh truyền thông.', name: 'Phòng marketing chủ đầu tư', meta: 'Sự kiện mở bán bất động sản' },
]

export default function EventPage() {
  useScrollReveal()
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch('/api/images/events')
      .then((res) => (res.ok ? res.json() : []))
      .then(setImages)
      .catch(() => setImages([]))
  }, [])

  return (
    <main>
      <EventHero />
      <StatsBar items={STATS} />

      <section className="blk" id="quymo">
        <div className="sec-head rv">
          <span className="eyebrow">Hạ tầng &amp; thiết bị sẵn có</span>
          <h2>Bảng thông số &amp; <em>tính nhanh quy mô</em></h2>
          <p>Chọn quy mô sự kiện dự kiến để xem phương án hạ tầng nhà bạt &amp; thiết bị tương ứng từ kho MMT.</p>
        </div>
        <GuestCalculator />
      </section>

      <ProjectsList />
      <ServicesGrid images={images} />
      <Pillars />

      <ProcessSteps id="quytrinh" title={<h2>Bốn bước — cam kết <em>đúng giờ</em></h2>} steps={STEPS} />
      <Quotes items={QUOTES} />

      <section className="blk" id="lienhe" style={{ paddingTop: 0 }}>
        <div className="contact">
          <div className="info rv">
            <span className="eyebrow">Liên hệ</span>
            <h2>Cùng dựng nên<br /><em>dấu ấn của bạn.</em></h2>
            <p>Gửi thông tin ngắn gọn — MMT phản hồi qua Zalo trong 15 phút giờ hành chính và gửi báo giá chi tiết trong 24 giờ.</p>
            <div className="big">0939 050 550</div>
            <p>Hotline kiêm Zalo · Cần Thơ &amp; các tỉnh miền Tây</p>
          </div>
          <ContactForm variant="event" />
        </div>
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="sec-head rv">
          <span className="eyebrow">Album thực tế</span>
          <h2>Những sự kiện <em>đã dựng nên</em></h2>
        </div>
        <Gallery category="events" />
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="promo rv">
          <div><h3>Nhà sắp có hỷ sự?</h3><p>MMT Wedding by Minh Minh Thúy — trang trí cưới hỏi trọn gói tại gia, giá công khai từ 6,9 triệu.</p></div>
          <Link className="go" to="/tiec-cuoi">Khám phá MMT Wedding →</Link>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 5: Wire it into `App.jsx`**

Replace the `/su-kien` route's placeholder element with `<EventPage />` (add `import EventPage from './pages/EventPage.jsx'`).

- [ ] **Step 6: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/EventPage.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd D:/Job/mmt-app
git add frontend/src/components/event/EventHero.jsx frontend/src/pages/EventPage.jsx frontend/src/pages/EventPage.test.jsx frontend/src/App.jsx
git commit -m "Assemble EventPage from hero, calculator, static sections, contact form, gallery"
```
