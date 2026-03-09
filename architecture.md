# Architecture Documentation

## 1. System Overview

```mermaid
graph TD
  Client["Browser / PWA"]

  subgraph Frontend ["Frontend (React 19)"]
    Router["TanStack Router"]
    Query["TanStack Query"]
    Store["Zustand Store"]
    UI["Shadcn UI + Tailwind"]
  end

  subgraph Backend ["Backend (Hono / Node.js)"]
    API["REST API"]

    subgraph Modules
      Auth["auth module"]
      Songs["songs module"]
      Favorites["favorites module"]
      Events["events module"]
    end

    subgraph Providers
      MB["MusicBrainz"]
      SP["Spotify"]
      LRC["LRCLIB"]
      LFM["Last.fm"]
      TM["Ticketmaster"]
    end
  end

  DB[("PostgreSQL")]

  Client --> Router
  Router --> Query
  Query --> API
  Store --> Query

  API --> Auth
  API --> Songs
  API --> Favorites
  API --> Events

  Songs --> MB
  Songs --> SP
  Songs --> LRC
  Songs --> LFM
  Events --> TM

  Auth --> DB
  Favorites --> DB
```

---

## 2. Backend Module Structure

```mermaid
graph LR
  subgraph apps/backend/src
    index["index.ts\n(Hono entry)"]

    subgraph modules
      A["auth/\n├── index.ts (barrel)\n├── auth.controller.ts\n└── auth.service.ts"]
      S["songs/\n├── index.ts (barrel)\n├── songs.controller.ts\n└── songs.service.ts"]
      F["favorites/\n├── index.ts (barrel)\n├── favorites.controller.ts\n└── favorites.service.ts"]
      E["events/\n├── index.ts (barrel)\n├── events.controller.ts\n└── events.service.ts"]
    end

    subgraph middleware
      AM["auth.middleware.ts\n(JWT verify)"]
    end

    subgraph providers
      PMB["musicbrainz/index.ts"]
      PSP["spotify/index.ts"]
      PLRC["lrclib/index.ts"]
      PLFM["lastfm/index.ts"]
    end
  end

  index --> A
  index --> S
  index --> F
  index --> E
  F --> AM
  S --> PMB
  S --> PSP
  S --> PLRC
  S --> PLFM
```

---

## 3. Database ERD

```mermaid
erDiagram
  users {
    serial id PK
    text email UK
    text password
    timestamp created_at
  }

  songs {
    serial id PK
    text title
    text artist_name
    text album_name
    integer release_year
    text artwork_url
    text musicbrainz_id
    text spotify_id
    timestamp created_at
  }

  favorites {
    integer user_id FK
    integer song_id FK
    timestamp created_at
  }

  users ||--o{ favorites : "has"
  songs ||--o{ favorites : "saved in"
```

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant API as Hono API
  participant DB as PostgreSQL

  C->>API: POST /api/auth/register { email, password }
  API->>API: Hash password (bcryptjs)
  API->>DB: INSERT INTO users
  DB-->>API: user row
  API->>API: Sign JWT (hono/jwt)
  API-->>C: { token, user }

  C->>API: POST /api/auth/login { email, password }
  API->>DB: SELECT user WHERE email
  DB-->>API: user row
  API->>API: Compare password hash
  API->>API: Sign JWT
  API-->>C: { token, user }

  C->>API: GET /api/favorites (Authorization: Bearer <token>)
  API->>API: authMiddleware — verify JWT
  API->>DB: SELECT favorites WHERE user_id
  DB-->>API: rows
  API-->>C: [ ...songs ]
```

---

## 5. Song Search & Aggregation Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant API as Hono API
  participant MB as MusicBrainz
  participant SP as Spotify

  C->>API: GET /api/songs/search?q=bohemian rhapsody
  API->>MB: GET /ws/2/recording?query=...
  API->>SP: GET /v1/search?q=...
  MB-->>API: recordings[]
  SP-->>API: tracks[]
  API->>API: Merge results (MB = source of truth, SP = artwork)
  API-->>C: SongSearchResponseItem[]

  C->>API: GET /api/songs/:musicbrainzId
  API->>MB: GET /ws/2/recording/:id
  API->>SP: search track title+artist
  API->>LRC: GET /api/get?track_name&artist_name
  API->>LFM: GET artist.getinfo
  MB-->>API: base metadata
  SP-->>API: artwork + spotifyId
  LRC-->>API: lyrics
  LFM-->>API: bio + genres + similar artists
  API->>API: Merge into SongDetailResponse
  API-->>C: SongDetailResponse
```

---

## 6. REST API Reference

### Auth

| Method | Route | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |

### Songs

| Method | Route | Auth | Params | Response |
|---|---|---|---|---|
| GET | `/api/songs/search` | No | `?q=string` | `SongSearchResponseItem[]` |
| GET | `/api/songs/:id` | No | `id` = MusicBrainz ID | `SongDetailResponse` |

### Favorites

| Method | Route | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/favorites` | Yes (JWT) | — | `SongSearchResponseItem[]` |
| POST | `/api/favorites` | Yes (JWT) | `AddFavoriteRequest` | `{ success: true }` |
| DELETE | `/api/favorites/:songId` | Yes (JWT) | — | `{ success: true }` |

### Events

| Method | Route | Auth | Response |
|---|---|---|---|
| GET | `/api/events` | No | `MusicEvent[]` |

---

## 7. Type Architecture

Types are organized following Clean Architecture in `packages/shared/src/`:

```
packages/shared/src/
├── domain/          # Pure domain entities (framework-independent)
│   ├── song.ts      # Song
│   ├── user.ts      # User
│   └── event.ts     # MusicEvent
├── api/             # API contract DTOs (request/response shapes)
│   ├── auth.ts      # LoginRequest, RegisterRequest, LoginResponse
│   ├── songs.ts     # SongSearchResponseItem, SongDetailResponse, AddFavoriteRequest
│   └── events.ts    # EventListResponse
├── common/          # Shared utility types
│   └── result.ts    # ApiError, PaginatedResponse<T>
└── index.ts         # Barrel re-export
```

### Domain: Song
```ts
{
  title: string
  artistName: string
  albumName?: string
  releaseYear?: number
  artworkUrl?: string
  musicbrainzId: string
  spotifyId?: string
}
```

### API: SongDetailResponse
```ts
{
  song: Song
  lyrics?: string
  artistBio?: string
  genres?: string[]
  similarArtists?: string[]
  musicalKey?: string
}
```

### Domain: MusicEvent
```ts
{
  id: string
  name: string
  artist: string
  date: string        // ISO 8601
  venue: string
  ticketUrl?: string
  imageUrl?: string
}
```

### API: LoginResponse
```ts
{
  token: string
  user: { id: number, email: string }
}
```

---

## 8. Infrastructure Diagram

```mermaid
graph TD
  User["User"]
  CF["Cloudflare DNS"]
  EC2["AWS EC2 (Ubuntu)"]

  subgraph Docker Compose
    Caddy["Caddy\n(reverse proxy + HTTPS)"]
    FE["Frontend\n(nginx:alpine)"]
    BE["Backend\n(node:20-alpine)"]
    PG[("PostgreSQL 16")]
  end

  GH["GitHub Actions\n(CI/CD)"]

  User --> CF
  CF --> EC2
  EC2 --> Caddy
  Caddy --> FE
  Caddy --> BE
  BE --> PG
  GH -->|"deploy on push to main"| EC2
```
