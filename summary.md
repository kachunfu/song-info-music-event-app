# Music Discovery App — Project Summary

## Overview

A music discovery web application for users to search songs, view metadata and lyrics, save favorites, and discover upcoming music events in Hong Kong. Song data is aggregated from external APIs. Only user-related data is stored locally.

---

## MVP Features

- User authentication (sign up / login)
- Search songs by title or artist
- View song details: artist, release year, lyrics, background info
- Favorite songs and view saved favorites
- Browse recent and upcoming music events in Hong Kong

---

## Tech Stack

### Frontend
- React 19
- TanStack Query + TanStack Router
- Zustand
- Tailwind CSS + Shadcn UI
- PWA support (future)

### Backend
- Node.js + Hono
- Drizzle ORM
- PostgreSQL

### Infrastructure
- Docker + Docker Compose
- AWS EC2 (Ubuntu)
- Caddy (reverse proxy + HTTPS)
- Cloudflare DNS
- GitHub Actions (CI/CD)

---

## External APIs

| API | Purpose |
|---|---|
| MusicBrainz | Artist info, release year, album metadata |
| LRCLIB | Song lyrics |
| Spotify Web API | Album artwork, track metadata, audio features |
| Last.fm | Artist bio, tags/genres, similar artists |
| Ticketmaster / PredictHQ / Eventbrite | Hong Kong music events |

---

## Database Schema (PostgreSQL)

### users
| Column | Type |
|---|---|
| id | uuid / serial |
| email | text |
| password | text |
| created_at | timestamp |

### songs
| Column | Type |
|---|---|
| id | uuid / serial |
| title | text |
| artist_name | text |
| album_name | text |
| release_year | integer |
| artwork_url | text |
| musicbrainz_id | text |
| spotify_id | text |
| created_at | timestamp |

### favorites
| Column | Type |
|---|---|
| user_id | foreign key |
| song_id | foreign key |
| created_at | timestamp |

> Event data is NOT stored — fetched dynamically per request.

---

## Backend API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | /api/search | Search songs |
| GET | /api/songs/:id | Get song details |
| POST | /api/favorites | Save a favorite song |
| GET | /api/favorites | Get user's favorite songs |
| GET | /api/events | Get HK music events |

---

## Frontend Pages

| Route | Page |
|---|---|
| /login | Login / Register |
| /search | Song search + results |
| /songs/:id | Song details (lyrics, artist, year, bio) |
| /favorites | Saved favorite songs |
| /events | Upcoming HK music events |

---

## Backend Modules

- `auth` — user registration and login
- `songs` — search and song detail aggregation
- `favorites` — save and retrieve favorites
- `events` — fetch and normalize event data
- `providers` — API wrappers for MusicBrainz, Spotify, LRCLIB, Last.fm, event APIs

---

## Engineering Practices

- End-to-end TypeScript
- Test Driven Development (TDD)
- Unit tests: Vitest
- E2E tests: Playwright
- ESLint
- Clean Architecture + Domain-Driven Design

---

## Data Strategy

- No full music catalog stored locally
- Songs saved only when a user favorites them (metadata snapshot)
- Snapshot includes: title, artist, album, year, artwork URL, external IDs

---

## Future Features

- Playlists
- Song recommendations
- Chord display aligned with lyrics
- Offline PWA support
- Recently played songs
- Artist pages
- Event bookmarking
- Personalized event recommendations
