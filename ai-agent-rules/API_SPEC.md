# API Specification

Full REST API contract for the Music Discovery App backend.
Base URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)

---

## Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

JWT tokens are returned from `/api/auth/register` and `/api/auth/login`.

---

## Auth Endpoints

### POST `/api/auth/register`

Register a new user account.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars"
}
```

**Success response:** `201 Created`
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error responses:**
- `400` — Validation error (invalid email, password too short)
- `400` — Email already in use

---

### POST `/api/auth/login`

Login with existing credentials.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Success response:** `200 OK`
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error responses:**
- `400` — Validation error
- `401` — Invalid credentials

---

## Song Endpoints

### GET `/api/songs/search?q=<query>`

Search for songs by title or artist. Aggregates results from MusicBrainz and Spotify.

**Auth required:** No

**Query params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (title or artist) |

**Success response:** `200 OK`
```json
[
  {
    "musicbrainzId": "uuid",
    "spotifyId": "string",
    "title": "Bohemian Rhapsody",
    "artistName": "Queen",
    "albumName": "A Night at the Opera",
    "releaseYear": 1975,
    "artworkUrl": "https://..."
  }
]
```

**Error responses:**
- `400` — Missing query parameter `q`

---

### GET `/api/songs/:id`

Get full song detail. Aggregates from MusicBrainz, Spotify, LRCLIB, and Last.fm in parallel.

**Auth required:** No

**Path params:**

| Param | Description |
|---|---|
| `id` | MusicBrainz recording ID (UUID) |

**Success response:** `200 OK`
```json
{
  "musicbrainzId": "uuid",
  "spotifyId": "string",
  "title": "Bohemian Rhapsody",
  "artistName": "Queen",
  "albumName": "A Night at the Opera",
  "releaseYear": 1975,
  "artworkUrl": "https://...",
  "lyrics": "[00:00.00] Is this the real life?...",
  "artistBio": "Queen are a British rock band...",
  "genres": ["rock", "classic rock"],
  "similarArtists": ["Led Zeppelin", "David Bowie"],
  "musicalKey": "Bb"
}
```

**Notes:**
- Lyrics, bio, genres, similarArtists, musicalKey are optional — may be `undefined` if provider fails
- Provider failures degrade gracefully (partial data returned, not 500)

---

## Favorites Endpoints

### GET `/api/favorites`

Get the authenticated user's saved favorite songs.

**Auth required:** Yes (JWT)

**Success response:** `200 OK`
```json
[
  {
    "musicbrainzId": "uuid",
    "spotifyId": "string",
    "title": "Bohemian Rhapsody",
    "artistName": "Queen",
    "albumName": "A Night at the Opera",
    "releaseYear": 1975,
    "artworkUrl": "https://..."
  }
]
```

---

### POST `/api/favorites`

Save a song to the user's favorites. Stores a metadata snapshot in the database.

**Auth required:** Yes (JWT)

**Request body:**
```json
{
  "musicbrainzId": "uuid",
  "spotifyId": "string",
  "title": "Bohemian Rhapsody",
  "artistName": "Queen",
  "albumName": "A Night at the Opera",
  "releaseYear": 1975,
  "artworkUrl": "https://..."
}
```

**Success response:** `201 Created`
```json
{ "success": true }
```

**Notes:**
- If the song does not exist in the DB, it is created (upsert)
- Duplicate favorites are silently ignored (`onConflictDoNothing`)

---

### DELETE `/api/favorites/:songId`

Remove a song from the user's favorites.

**Auth required:** Yes (JWT)

**Path params:**

| Param | Description |
|---|---|
| `songId` | Internal database song ID |

**Success response:** `200 OK`
```json
{ "success": true }
```

---

## Events Endpoint

### GET `/api/events`

Get upcoming music events in Hong Kong. Fetched dynamically from Ticketmaster.

**Auth required:** No

**Success response:** `200 OK`
```json
[
  {
    "id": "string",
    "name": "Concert Name",
    "artist": "Artist Name",
    "date": "2025-06-15T20:00:00Z",
    "venue": "Hong Kong Coliseum",
    "ticketUrl": "https://...",
    "imageUrl": "https://..."
  }
]
```

**Notes:**
- Results sorted by date ascending
- `ticketUrl` and `imageUrl` are optional
- Returns `[]` if API key is not configured or provider fails

---

## Error Response Format

All error responses follow this shape:

```json
{
  "error": "Human readable message"
}
```

Or for validation errors:
```json
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "email": ["Invalid email"],
      "password": ["String must contain at least 8 character(s)"]
    }
  }
}
```

---

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (missing or invalid JWT) |
| `500` | Internal server error |
