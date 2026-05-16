# ArtSpace (아지트)

A bilingual (Korean/English) art space booking platform. Venue managers list their spaces; visitors browse, check availability, and send booking requests directly through the calendar.

---

## Features

- **Space listings** — browse by type (Gallery, Rehearsal, Performance Hall, etc.) with hourly rates, capacity, and contact info
- **Interactive availability calendar** — week view with drag-to-select, showing blocked, pending, and past slots
- **Booking requests** — logged-in users select time slots and submit requests; venues receive email notifications
- **Admin panel** — create/edit/delete spaces, manage unavailability blocks, confirm or decline pending requests
- **Bilingual UI** — full EN / 한국어 toggle via `data-i18n` attributes
- **JWT auth** — signup/login with bcrypt-hashed passwords; protected admin routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (ES modules) |
| Backend | Node.js, Express, TypeScript |
| Database | NeDB (embedded, file-based) — single `spaces.db` file |
| Auth | JWT + bcrypt |
| Email | Nodemailer (optional SMTP) |
| Dev server | `tsx watch` (hot reload) |

---

## Project Structure

```
art-space/
├── client/
│   └── public/
│       ├── css/
│       │   ├── calendar.css      # shared calendar grid styles
│       │   ├── landing.css       # nav, layout, components
│       │   └── styles.css
│       ├── js/
│       │   ├── calendar-grid.js  # shared calendar renderer (used by availability + admin)
│       │   ├── availability.js   # public booking calendar
│       │   ├── admin.js          # admin dashboard
│       │   ├── auth.js           # login state / nav
│       │   ├── i18n.js           # EN/KO translations
│       │   └── spaces.js         # space listing page
│       └── *.html                # pages
├── server/
│   └── src/
│       ├── db.ts                 # NeDB setup + seeding + migration
│       ├── server.ts             # Express app entry point
│       ├── middleware/auth.ts    # JWT middleware
│       ├── routes/
│       │   ├── auth.ts           # POST /api/auth/signup, /login
│       │   ├── spaces.ts         # CRUD /api/spaces
│       │   └── bookings.ts       # /api/bookings + /pending-hours
│       └── utils/email.ts        # Nodemailer helper
├── data/
│   ├── spaces.db                 # unified NeDB store (spaces + bookings)
│   └── users.db
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment

Copy `.env.example` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `DB_PATH` | Directory for `.db` files | `./data` |
| `JWT_SECRET` | Secret for signing tokens | `art-space-secret-key` |
| `SMTP_HOST` | SMTP server host (optional) | — |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS (`true`/`false`) | `false` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | From address | `noreply@artspace.kr` |

Email is optional — booking requests still work without SMTP configured.

### Docker

```bash
# Build and start (app available at http://localhost:8080)
docker compose up --build

# Run in background
docker compose up --build -d

# Stop and remove containers
docker compose down

# Stop and also delete the data volume
docker compose down -v
```

Database files are stored in a named Docker volume (`artspace-data`) so they persist across container restarts. Set environment variables in a `.env` file alongside `docker-compose.yml` — they are picked up automatically.

### Development

```bash
npm run dev
```

Starts the Express server with `tsx watch` (hot reload) on `http://localhost:3001` and the TypeScript client compiler in watch mode.

### Production Build

```bash
npm run build   # compiles client and server TypeScript
npm start       # runs compiled server/dist/server.js
```

---

## API Reference

All endpoints are prefixed `/api`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account |
| POST | `/auth/login` | — | Returns JWT |

### Spaces

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/spaces` | — | List all spaces (filter: `?type=Gallery`) |
| GET | `/spaces/:id` | — | Get single space |
| POST | `/spaces` | Required | Create space |
| PUT | `/spaces/:id` | Required | Update space |
| DELETE | `/spaces/:id` | Required | Delete space |

### Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/bookings/pending-hours?spaceId=` | — | Public: date→hours map of pending slots |
| GET | `/bookings?spaceId=&status=` | Required | Full booking list |
| POST | `/bookings` | — | Submit booking request |
| POST | `/bookings/:id/confirm` | Required | Confirm → marks hours unavailable |
| POST | `/bookings/:id/decline` | Required | Decline request |

---

## Database

Both spaces and bookings are stored in a single NeDB file (`data/spaces.db`) using a `_type` discriminator field:

- `_type: 'space'` — venue documents
- `_type: 'booking'` — booking request documents

`data/users.db` holds user accounts with bcrypt-hashed passwords.

The database is seeded with 8 example spaces on first run. On startup, `seedSpacesIfEmpty()` also runs schema migrations for fields added in later versions.

---

## Pages

| URL | Description |
|---|---|
| `/` | Landing page |
| `/book-space.html` | Browse and filter spaces |
| `/availability.html?id=<spaceId>` | Availability calendar + booking form |
| `/admin.html` | Admin dashboard (requires login) |
| `/login.html` / `/signup.html` | Auth pages |
| `/pricing.html` | Pricing tiers |
| `/about.html` | About page |
| `/user-guide.html` | User guide |
