# SongInfo Music Event App

A music discovery web application for users to search songs, view metadata and lyrics, save favorites, and discover upcoming music events in Hong Kong.

## Documentation

### Project Docs
| File | Purpose |
|---|---|
| [summary.md](summary.md) | Full project overview, MVP features, data strategy |
| [architecture.md](architecture.md) | System diagrams, data flows, infrastructure |
| [project-phases.md](project-phases.md) | Build roadmap and task checklist |

### Reference Specs (in `ai-agent-rules/`)
| File | Purpose |
|---|---|
| [ai-agent-rules/API_SPEC.md](ai-agent-rules/API_SPEC.md) | Full REST API contract — endpoints, request/response schemas |
| [ai-agent-rules/DATABASE_SCHEMA.md](ai-agent-rules/DATABASE_SCHEMA.md) | DB tables, relationships, migration commands |

### Engineering Rules (in `ai-agent-rules/`)
| File | Purpose |
|---|---|
| [ai-agent-rules/AI_AGENT_RULES.md](ai-agent-rules/AI_AGENT_RULES.md) | Rules for AI agents — step-by-step process, pre-coding checklist |
| [ai-agent-rules/ENGINEERING_RULES.md](ai-agent-rules/ENGINEERING_RULES.md) | SOLID principles, Clean Architecture, design-first approach |
| [ai-agent-rules/CODING_GUIDELINES.md](ai-agent-rules/CODING_GUIDELINES.md) | TypeScript, ESM imports, naming, code quality |

---

## Tech Stack

### Frontend
- React 19
- TanStack Router + TanStack Query
- Zustand
- Tailwind CSS + Shadcn UI

### Backend
- Node.js + Hono v4
- Drizzle ORM
- PostgreSQL

### Infrastructure
- Docker + Docker Compose
- AWS EC2 (Ubuntu)
- Caddy (reverse proxy + HTTPS)
- Cloudflare DNS
- GitHub Actions (CI/CD)

---

## Project Structure

```
SongInfoMusicEventApp/
├── apps/
│   ├── backend/                  # Hono API server
│   │   └── src/
│   │       ├── index.ts          # Entry point
│   │       ├── middleware/       # Auth middleware
│   │       ├── modules/          # Feature modules
│   │       │   ├── auth/
│   │       │   ├── songs/
│   │       │   ├── favorites/
│   │       │   └── events/
│   │       └── providers/        # External API clients
│   │           ├── musicbrainz/
│   │           ├── spotify/
│   │           ├── lrclib/
│   │           └── lastfm/
│   └── frontend/                 # React app
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           └── store/
├── packages/
│   ├── database/                 # Drizzle schema + migrations
│   │   └── src/schema/
│   └── shared/                   # Shared TypeScript types
├── docker/                       # Dockerfiles + Compose
├── .github/workflows/            # CI/CD
├── README.md
├── summary.md
├── architecture.md
└── project-phases.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- PostgreSQL (or use Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your API keys and database credentials
```

Required environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/musicapp

JWT_SECRET=your_secret_here

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

LASTFM_API_KEY=

TICKETMASTER_API_KEY=
```

### 3. Start the database

```bash
docker compose -f docker/docker-compose.yml up postgres -d
```

### 4. Run migrations

```bash
npm run db:migrate --workspace=packages/database
```

### 5. Start development servers

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

---

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/songs/search?q=` | No | Search songs |
| GET | `/api/songs/:id` | No | Get full song detail |
| GET | `/api/favorites` | JWT | Get user favorites |
| POST | `/api/favorites` | JWT | Save a favorite |
| DELETE | `/api/favorites/:id` | JWT | Remove a favorite |
| GET | `/api/events` | No | Get HK music events |

See [architecture.md](architecture.md) for full schema and sequence diagrams.

---

## External APIs

| API | Used For | Auth |
|---|---|---|
| MusicBrainz | Artist info, release year, album | None (rate limit: 1 req/s) |
| LRCLIB | Song lyrics | None |
| Spotify Web API | Artwork, track metadata | Client credentials OAuth |
| Last.fm | Artist bio, genres, similar artists | API key |
| Ticketmaster | HK music events | API key |

---

## Engineering Principles

- End-to-end TypeScript (ESM, NodeNext)
- Clean Architecture + Domain-Driven Design
- SOLID principles
- Test Driven Development (Vitest + Playwright)
- No full music catalog stored — only user favorites (metadata snapshot)

See [AI_AGENT_RULES.md](AI_AGENT_RULES.md), [ENGINEERING_RULES.md](ENGINEERING_RULES.md), and [CODING_GUIDELINES.md](CODING_GUIDELINES.md) for full rules.
