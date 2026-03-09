# Music Discovery App — Project Phases

## Phase 1 — Project Setup & Tooling
**Goal: working repo with consistent dev environment**

- [ ] Initialize monorepo structure (or separate frontend/backend folders)
- [ ] Set up TypeScript config for both frontend and backend
- [ ] Set up ESLint + Prettier
- [ ] Set up Vitest (unit tests)
- [ ] Set up Playwright (e2e tests)
- [ ] Set up Docker + Docker Compose (Postgres + backend + frontend)
- [ ] Confirm local dev runs end-to-end

---

## Phase 2 — Database & Backend Foundation
**Goal: working API server connected to Postgres**

- [ ] Design and create Drizzle schema (`users`, `songs`, `favorites`)
- [ ] Run migrations
- [ ] Set up Hono server with routing structure
- [ ] Implement auth module (register, login, JWT or session)
- [ ] Protect routes with auth middleware
- [ ] Write unit tests for auth

---

## Phase 3 — External API Integrations
**Goal: fetch real song data reliably**

Problems to solve:
- API rate limits and error handling
- Normalizing different response shapes into one unified format
- Deciding what data to cache vs fetch fresh each time

Steps:
- [ ] Build MusicBrainz provider (search + artist/album data)
- [ ] Build LRCLIB provider (lyrics by title + artist)
- [ ] Build Spotify provider (OAuth client credentials, artwork, audio features)
- [ ] Build Last.fm provider (artist bio, genres, similar artists)
- [ ] Build aggregator service that calls all providers and merges results
- [ ] Write unit tests for each provider (mock HTTP responses)

---

## Phase 4 — Core Backend Endpoints
**Goal: all API routes working and tested**

- [ ] `GET /api/search` — search songs via MusicBrainz + Spotify
- [ ] `GET /api/songs/:id` — aggregate full song detail from all providers
- [ ] `POST /api/favorites` — save song snapshot to DB
- [ ] `GET /api/favorites` — return user's saved songs
- [ ] `GET /api/events` — fetch + normalize HK events from event APIs
- [ ] Integration tests for each endpoint

---

## Phase 5 — Frontend Foundation
**Goal: React app with routing, state, and API connection**

- [ ] Set up TanStack Router with all page routes
- [ ] Set up TanStack Query for data fetching
- [ ] Set up Zustand for auth state (user session)
- [ ] Set up Shadcn UI + Tailwind theme
- [ ] Build shared layout (navbar, page shell)

---

## Phase 6 — Frontend Pages
**Goal: fully functional UI**

- [ ] Login / Register page (connected to auth API)
- [ ] Search page (input + results list)
- [ ] Song details page (lyrics, artist, year, bio, favorite button)
- [ ] Favorites page (list of saved songs)
- [ ] Events page (HK upcoming events list)
- [ ] E2E tests for critical user flows

---

## Phase 7 — Infrastructure & Deployment
**Goal: live on the internet**

Problems to solve:
- Secrets management (API keys, DB credentials)
- HTTPS setup
- Zero-downtime deploys

Steps:
- [ ] Set up EC2 instance (Ubuntu)
- [ ] Install Docker + Docker Compose on EC2
- [ ] Configure Caddy as reverse proxy with HTTPS
- [ ] Point Cloudflare DNS to EC2 IP
- [ ] Set up GitHub Actions CI/CD pipeline (test → build → deploy)
- [ ] Configure environment secrets in GitHub Actions
- [ ] Set up Postgres backups (local + AWS S3)

---

## Key Problems to Solve Early

| Problem | Why it matters |
|---|---|
| Spotify OAuth (client credentials flow) | Needed for artwork — slightly complex setup |
| API aggregation latency | Multiple API calls per song search — may need parallel fetching |
| Rate limiting across providers | MusicBrainz is strict (1 req/sec) |
| Matching songs across APIs | No shared ID — must fuzzy-match by title + artist |
| HK event API availability | Ticketmaster/PredictHQ may require paid plans — test early |
