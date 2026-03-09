# Coding Guidelines

Conventions and standards for writing code in this project.

---

## 1. TypeScript

- Strict TypeScript is enforced (`"strict": true` in tsconfig)
- No `any` types unless absolutely unavoidable and explicitly commented
- Prefer `type` for unions/intersections, `interface` for object shapes
- All function parameters and return types must be explicitly typed for public APIs
- Use `unknown` over `any` when the type is truly unknown

---

## 2. ESM Import Rules (Critical)

The backend uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`.

**All relative imports must use `.js` extension:**

```ts
// CORRECT
import { authService } from './auth.service.js'
import type { AuthVariables } from '../../middleware/auth.middleware.js'

// WRONG — will fail at runtime
import { authService } from './auth.service'
import type { AuthVariables } from '../../middleware/auth.middleware'
```

Package imports do NOT need `.js`:
```ts
import { Hono } from 'hono'          // correct
import { eq } from 'drizzle-orm'     // correct
```

---

## 3. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `auth.service.ts`, `auth.controller.ts` |
| Folders | kebab-case | `musicbrainz/`, `auth-middleware/` |
| Variables / functions | camelCase | `searchSongs`, `userId` |
| Types / Interfaces | PascalCase | `SongDetail`, `AuthVariables` |
| Constants | UPPER_SNAKE_CASE | `JWT_SECRET`, `MB_BASE` |
| DB columns | snake_case | `artist_name`, `created_at` |
| TypeScript properties | camelCase | `artistName`, `createdAt` |
| Router exports | camelCase + `Router` suffix | `authRouter`, `songsRouter` |
| Service exports | camelCase verbs | `searchSongs`, `addFavorite` |

---

## 4. File Structure Conventions

Each backend module follows this structure:

```
modules/<name>/
├── index.ts              # Barrel export (re-exports controller as router)
├── <name>.controller.ts  # Hono routes — orchestration only, no business logic
└── <name>.service.ts     # Business logic — no framework code
```

Types live in `packages/shared/src/` (domain entities in `domain/`, API DTOs in `api/`).

Each provider follows:
```
providers/<name>/
└── index.ts          # Single external API wrapper
```

---

## 5. Code Quality Rules

- No unused imports — remove them before finishing
- No unused variables or parameters
- No commented-out code left behind
- No console.log left in production code (use structured logging)
- Functions should do one thing
- Avoid deep nesting — prefer early returns
- Keep functions short — if a function needs a scroll to read, split it

---

## 6. Error Handling

- Services throw typed errors with clear messages
- Routes catch errors and return structured JSON responses
- Never expose raw stack traces to API consumers
- Use `Promise.allSettled` when calling multiple external APIs in parallel (resilience)
- External API failures should degrade gracefully — return partial data, not 500

```ts
// Preferred pattern for parallel provider calls
const [lyricsResult, artistResult] = await Promise.allSettled([
  getLyrics(title, artist),
  getArtistInfo(artist),
])

const lyrics = lyricsResult.status === 'fulfilled' ? lyricsResult.value : undefined
```

---

## 7. Code Reuse

- Reuse existing utilities before creating new ones
- Domain types go in `packages/shared/src/domain/`, API DTOs in `packages/shared/src/api/`
- Shared utilities go in `packages/shared/src/`
- Do not duplicate type definitions across modules
- If the same logic appears in two places, extract it

---

## 8. Completion Checklist

Before considering any code complete:

- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] No unused imports
- [ ] No unused variables
- [ ] All relative imports use `.js` extension
- [ ] Error cases are handled
- [ ] No business logic in route handlers
- [ ] No framework code in services
