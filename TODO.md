# TODO — SongInfo Music Event App

## In Progress

### Events Page
- [x] Verify Ticketmaster integration works — 2026-03-09
- [x] Removed HK-only filter (no HK events on Ticketmaster) — 2026-03-09
- [x] Added pagination (10 per page) — 2026-03-09
- [x] Added error handling to events route — 2026-03-09
- [ ] Confirm events display correctly (name, artist, date, venue, ticket link, image)

### Favorites Page
- [x] Fixed: musicbrainzId made optional in Zod schema — 2026-03-09
- [x] Fixed: remove button uses DB song.id instead of spotifyId — 2026-03-09
- [x] Added FavoriteSong type with DB id — 2026-03-09
- [x] Added error handling to all favorites routes — 2026-03-09
- [ ] Verify favorites CRUD works end-to-end
- [ ] Confirm add/remove favorites from song detail page

---

## Upcoming

### Search UX Improvements
- [ ] Improve search results display/UX
- [ ] Add error/empty states UX polish

### Song Detail Page
- [x] Artist bio displays (Last.fm) — 2026-03-09
- [x] Genres display (Last.fm) — 2026-03-09
- [ ] Verify similar artists display
- [ ] Verify lyrics display correctly

### Spotify
- [ ] Bump Spotify limit from 10 to 25 after extended quota approval
- [ ] Audio Features (key, BPM, energy, etc.) — requires extended quota, returns 403 in dev mode. Code is ready in `getAudioFeatures()`, will work once approved

### Last.fm Integration
- [x] Got real Last.fm API key — 2026-03-09
- [x] Artist bio, genres, similar artists working — 2026-03-09
- [x] Stripped HTML and "Read more" link from bio — 2026-03-09

### Events — Future
- [ ] Find HK-specific event source (Cityline, HK Ticketing, URBTIX — no public APIs currently)
- [ ] Consider adding SeatGeek as second provider (free key, but no HK coverage)
- [ ] Consider filtering Ticketmaster by Asia-Pacific region (SG, JP, AU have events)

### Deployment (Phase 2–4)
- [x] Fixed Docker production build: workspace packages now compile to JS — 2026-03-10
- [x] Added programmatic DB migrations (runs on backend startup) — 2026-03-10
- [x] Fixed docker-compose: all env vars passed to backend (API keys, JWT_SECRET) — 2026-03-10
- [x] Fixed root build scripts: packages build in correct order — 2026-03-10
- [x] Chose EC2 free tier (t2.micro, Ubuntu 22.04) — 2026-03-10
- [x] Provisioned EC2, installed Docker + Compose — 2026-03-10
- [x] Manual deploy (clone, .env, docker compose up) — 2026-03-10
- [x] Added nginx reverse proxy for API routing — 2026-03-10
- [x] Added Caddy reverse proxy for automatic HTTPS — 2026-03-10
- [x] DuckDNS domain: songinfo.duckdns.org — 2026-03-10
- [x] HTTPS working with auto-provisioned TLS certificate — 2026-03-10
- [x] CI/CD pipeline: GitHub Actions (test → deploy to EC2 on push to main) — 2026-03-10

### Testing
- [x] Tests for favorites routes (10 tests) — 2026-03-09
- [x] Tests for events routes (5 tests) — 2026-03-09
- [x] Tests for translation provider (7 tests) — 2026-03-09
- [x] Tests for translate endpoint (5 tests) — 2026-03-09
- [x] Total: 72 tests passing (60 backend, 12 frontend) — 2026-03-09
- [ ] Run E2E tests against live app
- [ ] Add CI test step in GitHub Actions

---

## Completed

- [x] All 5 frontend pages built (Login, Search, SongDetail, Favorites, Events) — 2026-03-08
- [x] Migrated search from MusicBrainz to Spotify — 2026-03-08
- [x] Search filters (All / Song Title / Artist / Album) with radio buttons — 2026-03-08
- [x] Pagination (10 results/page, Spotify dev mode limit) — 2026-03-08
- [x] SongCard component with album artwork — 2026-03-08
- [x] Auth (register/login with JWT) — 2026-03-08
- [x] Favorites CRUD with spotifyId-based lookups — 2026-03-08
- [x] Fixed: Spotify dev mode "Invalid limit" bug — 2026-03-08
- [x] Fixed: Hono verify() needs algorithm param — 2026-03-08
- [x] Fixed: Drizzle null→undefined coercion — 2026-03-08
- [x] Fixed: ESM .js extensions — 2026-03-08
- [x] Testing strategy document created — 2026-03-09
- [x] Vitest + Playwright configured — 2026-03-09
- [x] First batch of tests: 44 tests passing (32 backend, 12 frontend) — 2026-03-09
- [x] Events: removed HK filter, added pagination, error handling — 2026-03-09
- [x] Favorites: fixed 4 blocking bugs (musicbrainzId, songId, FavoriteSong type, error handling) — 2026-03-09
- [x] Lyrics translation feature (MyMemory API, 8 languages) — 2026-03-09
- [x] Last.fm integration working (artist bio, genres, similar artists) — 2026-03-09
- [x] Spotify Audio Features code ready (blocked by dev mode 403) — 2026-03-09
- [x] Tests expanded to 72 (events, favorites, translation, audio features) — 2026-03-09
- [x] Ticketmaster + Last.fm real API keys configured — 2026-03-09
- [x] Git repo initialized + pushed to GitHub (kachunfu/song-info-music-event-app) — 2026-03-09
- [x] .gitignore updated (added logs/, .claude/) — 2026-03-09
- [x] Docker production build fixed (workspace packages compile, migrations auto-run) — 2026-03-10
