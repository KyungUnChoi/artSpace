# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run from root)
npm install

# Development (hot reload for both server and client)
npm run dev

# Production build (compiles client TS → public/js, server TS → dist)
npm run build

# Run production server
npm start

# Docker (app at http://localhost:8080)
docker compose up --build
docker compose down -v   # also deletes the data volume
```

There is no test suite.

## Architecture

This is an npm workspace monorepo with two packages: `server/` and `client/`. The Express server serves the client's static files directly from `client/public/`, so there is no separate frontend dev server or build step for the HTML/CSS. The TypeScript files in `client/src/` are a thin layer (interactive UI components); most client logic lives in the plain JS files at `client/public/js/`.

### Server (`server/src/`)

- **`server.ts`** — Express entry point; mounts `/api/auth`, `/api/spaces`, `/api/bookings` routers, then serves `client/public/` as static files with a catch-all `index.html` fallback.
- **`db.ts`** — NeDB setup. Two databases: `users.db` (auth) and `spaces.db` (everything else). `spaces.db` is a **unified store** — both space documents (`_type: 'space'`) and booking documents (`_type: 'booking'`) live in the same file, distinguished by the `_type` field. `spacesDb` and `bookingsDb` are both re-exports of the same `unifiedDb` instance.
- **`middleware/auth.ts`** — `requireAuth` middleware; validates `Authorization: Bearer <jwt>` header.
- **`routes/`** — `auth.ts` (signup/login), `spaces.ts` (CRUD), `bookings.ts` (submit request, confirm/decline, pending-hours query).
- **`utils/email.ts`** — Nodemailer wrapper; email is optional and silently skipped if SMTP is not configured.

Server compiles to `server/dist/` (CommonJS).

### Client (`client/`)

- **`public/js/i18n.js`** — EN/KO language system. Uses `data-i18n` (textContent), `data-i18n-html` (innerHTML), and `data-i18n-placeholder` (placeholder) attributes. Language preference is stored in `localStorage`. Any new UI text must be added to both `en` and `ko` translation objects in `i18n.js` and wired up with the appropriate `data-i18n*` attribute in the HTML.
- **`public/js/calendar-grid.js`** — Shared calendar renderer used by both `availability.js` (public booking view) and `admin.js`.
- **`public/js/auth.js`** — Login state and nav badge; loaded on every page.
- **`public/js/nav.js`** — Nav rendering.
- **`src/`** — TypeScript source for interactive page components (landing carousel, login/signup forms, welcome page). Compiled to `public/js/` via `client/tsconfig.json`.

Client TS target is ES2020 with `"module": "ES2020"` — output is ES module files loaded with `<script type="module">` in the HTML.

### Database schema

`spaces.db` (NeDB, file-based):
- Space doc: `{ _type: 'space', name, types[], capacity, locationEn, locationKo, hourlyRate, emoji, thumbColor, contactEmail, contactPhone, unavailable: { "YYYY-MM-DD": number[] } }`
- Booking doc: `{ _type: 'booking', spaceId, date, hours[], status: 'pending'|'confirmed'|'declined', ... }`

`users.db`: `{ username, passwordHash, email, phone }`

On startup, `seedSpacesIfEmpty()` loads the database, drops any legacy indexes, runs schema migrations, seeds 8 example spaces if empty, and compacts the datafile.

### Auth flow

- JWT issued on login, stored in `localStorage` by client code.
- Protected API routes use `requireAuth` middleware; client sends `Authorization: Bearer <token>` header.
- Admin access is determined by JWT presence — there is no separate admin role; any logged-in user can access admin routes.

### Environment variables

See `.env.example`. Key vars: `PORT` (default `3001`), `DB_PATH` (directory for `.db` files, default `./data`), `JWT_SECRET`, and optional SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
