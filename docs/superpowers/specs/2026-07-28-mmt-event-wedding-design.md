# MMT Event & Wedding — React + Spring Boot rebuild

Date: 2026-07-28
Status: Approved

## Background

`D:\Job\mmtevent-wedding-v3.html` is a single static HTML/CSS/vanilla-JS page for MMT
Event & Wedding (a Cần Thơ event/wedding contractor). It has a "gate" landing page
that routes to two sub-sites (`#/su-kien` for corporate events, `#/tiec-cuoi` for
weddings), each with hero, stats, service sections, pricing, contact form, and
JS-driven interactivity (view switching, scroll reveal, a guest-count calculator,
a wedding color-tone switcher). All images are Unsplash placeholders or CSS
gradient placeholders.

Real photos exist locally: `D:\Job\images\events` (188 files, mostly `.jpg`, plus
2 `.heic`) and `D:\Job\images\wedding` (23 `.jpg`).

Goal: rebuild as a React frontend + Spring Boot backend, using the real photos,
and add lead capture (contact/quote forms) with email notification and a simple
admin view. Target: run locally first; git remote (`https://github.com/YaoMing-dev/EventMMT`)
will be added and pushed later, on request.

## Architecture

Two separate apps in one new project folder, talking over REST:

```
D:\Job\mmt-app\
├── frontend\   React + Vite (JavaScript)
└── backend\    Spring Boot (Maven): web, data-jpa, mail, security, validation
```

- Frontend dev server: `localhost:5173`, proxies `/api/*` to the backend during dev.
- Backend: `localhost:8080`.
- Database: PostgreSQL (installed locally or via Docker — documented in backend README).
- Images: backend reads directly from `D:\Job\images\events` and `D:\Job\images\wedding`
  via a configurable base path (`app.images.base-path` in `application.yml`), not copied
  into the repo.
- The existing `mmtevent-wedding-v3.html`, `index.html`, and `images/` at `D:\Job` are
  left untouched.

## Frontend

React Router replaces the hand-rolled `go()`/`render()` view switcher, keeping the
same three routes conceptually (`/`, `/su-kien`, `/tiec-cuoi`), plus a new `/admin`.

```
frontend/src/
├── App.jsx                  Router + layout wrapper (topbar/header/footer only on sub-pages)
├── pages/
│   ├── HomeGate.jsx          gate/landing (choose Event vs Wedding)
│   ├── EventPage.jsx         /su-kien
│   ├── WeddingPage.jsx       /tiec-cuoi
│   └── AdminPage.jsx         /admin — login + lead table
├── components/
│   ├── layout/    Header.jsx, Topbar.jsx, Footer.jsx, RailButtons.jsx
│   ├── shared/    StatsBar.jsx, ProcessSteps.jsx, Quotes.jsx, ContactForm.jsx,
│   │              Gallery.jsx, Lightbox.jsx, useScrollReveal.js
│   ├── event/     EventHero.jsx, GuestCalculator.jsx, ProjectsList.jsx,
│   │              ServicesGrid.jsx, Pillars.jsx
│   └── wedding/   WeddingHero.jsx, ToneSelector.jsx, AlbumServices.jsx, PricingTable.jsx
├── data/          toneData.js (static content for the 4 wedding color tones, ported as-is)
└── styles/        global.css (ported near-verbatim from the original <style> block —
                   same design tokens/look, just no more body[data-view=...] toggling)
```

Notes:
- `ContactForm` is shared between both pages via a `variant="event"|"wedding"` prop,
  which swaps the select options (event type / ceremony type, guest count / color tone)
  and the payload sent to `POST /api/leads`.
- `useScrollReveal` is a small hook wrapping `IntersectionObserver`, replacing the
  original global `observeReveals()`.
- `Gallery` fetches `GET /api/images/{category}` and renders a responsive grid;
  clicking a thumbnail opens `Lightbox` (full image, prev/next, Esc/backdrop to close).
  Images use native `loading="lazy"`; with ~188 photos this is enough to keep the
  page responsive without building a thumbnail-generation pipeline.
- The service cards (`ph-a`/`ph-b`/...) and the wedding tone-gallery reuse a few
  images from the same category list (picked by fixed index), instead of calling
  a separate endpoint.

## Backend

### API

```
GET  /api/images/{category}                category = events | wedding
     → [{ "filename": "...", "url": "/api/images/{category}/{filename}" }, ...]
     Filters out non-browser-renderable files (.heic) — jpg/png/webp only.

GET  /api/images/{category}/{filename}     → raw image bytes, Content-Type by extension.
     404 if category invalid or file not found/not in the allowed directory.

POST /api/leads
     body: { category: "EVENT"|"WEDDING", subtype, eventDate, guestCount?, toneColor?, phone }
     → 201 on success. Validates required fields server-side (Bean Validation).
       Saves to DB first, then attempts an async email notification — email failure
       is logged but does NOT fail the request (the lead is already safely stored).
     → 400 with field errors on validation failure.

GET  /api/admin/leads     (HTTP Basic auth)  → full lead list, newest first, for /admin.
```

### Data model

`Lead` entity: `id, category, subtype, eventDate, guestCount (nullable), toneColor (nullable), phone, createdAt`.

No `name` field — the original forms never collected one (only phone + selects + date),
so the rebuild keeps that.

### Cross-cutting

- **CORS**: backend allows `http://localhost:5173` in dev.
- **Admin auth**: Spring Security `httpBasic`, one account defined in `application.yml`
  (username/password you choose). The React `/admin` page has its own login form that
  builds the `Authorization: Basic ...` header itself — no native browser auth popup.
- **Path safety**: the image-serving endpoint resolves filenames against the configured
  base directory and rejects any path that escapes it (no `..` traversal).
- **Email**: `JavaMailSender` via Spring Boot Starter Mail, SMTP credentials in
  `application.yml` (e.g. a Gmail app password) — configured when we get to that step.

## Error handling

- Contact form: client-side validation (required fields) mirrors server-side Bean
  Validation; server errors surface as inline messages under the relevant field.
- Gallery: if `/api/images/{category}` fails or returns empty, show a small
  "chưa có ảnh" placeholder instead of breaking the section.
- Lead submission never fails just because email sending failed.

## Testing

- Backend: unit tests for `LeadService` (validation/save logic) and `ImageService`
  (filename filtering, path-traversal rejection) with JUnit + Mockito; a
  `@SpringBootTest` slice for `LeadController` using an H2 in-memory DB under the
  `test` profile (Postgres stays the runtime DB, not a test dependency).
- Frontend: manual verification in-browser is primary, given this is a marketing
  site; a few Vitest unit tests for `ContactForm` validation logic and the tone
  data switching are enough — no need for full e2e coverage at this scale.

## Out of scope (for this pass)

- Production deployment (domain/hosting) — explicitly deferred; local run first.
- Pushing to the `EventMMT` GitHub remote — will be done on explicit request.
- Photo categorization by wedding tone (son/đào/kem/ngọc) — real photos aren't
  pre-sorted by tone, so the tone-gallery slots use a few representative photos
  from the general wedding set rather than tone-accurate ones.
