# MMT Event & Wedding — Backend

Spring Boot REST API: lead capture (contact/quote forms) with email
notification, and an image API serving real photos from `D:\Job\images`.

## Prerequisites

- JDK 17+
- Maven 3.9+ (this machine: installed standalone at `C:\tools\apache-maven-3.9.9`, not on PATH — use the full path or add it to PATH yourself)
- PostgreSQL — this machine already has a **native PostgreSQL 17 Windows service** listening on port 5432, so the project's Postgres runs in **Docker on port 5433** instead, to avoid any conflict with that pre-existing instance.

## First-time setup

1. Start Postgres in Docker (only needed once per machine reboot/container removal):
   ```bash
   docker run --name mmt-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mmt_event_wedding -p 5433:5432 -d postgres:16
   ```
   If the container already exists but is stopped: `docker start mmt-postgres`.
2. Edit `src/main/resources/application.yml`:
   - `spring.datasource.username` / `password` — defaults to `postgres` / `postgres` (matches the Docker command above).
   - `spring.security.user.name` / `password` — the admin login for `/admin` on the frontend (defaults `admin` / `changeme`).
   - `spring.mail.username` / `password` — a Gmail address + [app password](https://myaccount.google.com/apppasswords) (or another SMTP provider). Placeholder values are set by default — the app runs fine without them, it just logs a failed-send error instead of emailing you.
   - `app.notify.to-email` — where new-lead notification emails are sent.
   - `app.images.base-path` — defaults to `D:/Job/images`; change if your photos live elsewhere.

## Run

```bash
cd backend
"C:\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```

The API listens on `http://localhost:8080`.

## Run tests

Tests use an in-memory H2 database (`test` profile) — Postgres does not need to be running.

```bash
cd backend
"C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test
```

All 20 tests pass as of this writing.

## Manual verification (after `mvn spring-boot:run`)

```bash
# List event photos (188 real files from D:\Job\images\events)
curl http://localhost:8080/api/images/events

# Fetch one photo (use a real filename from the list above)
curl -o test.jpg http://localhost:8080/api/images/events/<filename>.jpg

# Submit a lead (public)
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":"0900000001"}'

# Admin list without auth -> expect 401
curl -i http://localhost:8080/api/admin/leads

# Admin list with auth -> expect 200 and the lead just created
curl -u admin:changeme http://localhost:8080/api/admin/leads
```

Verified working end-to-end on 2026-07-28: image listing returns real filenames,
lead POST returns 201 and persists to Postgres, unauthenticated admin GET
returns 401, authenticated admin GET returns 200 with the created lead. Email
notification will fail silently (logged, not thrown) until real SMTP
credentials are set in `application.yml`.
