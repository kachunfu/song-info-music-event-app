# Testing Strategy — SongInfo Music Event App

## Purpose

This document defines the testing strategy for the SongInfo Music Event App. It ensures consistent, reliable, and maintainable test coverage across the entire monorepo. All contributors (human and AI) must follow this strategy when adding or modifying features.

---

## Testing Layers

### 1. Unit Tests

Unit tests verify individual functions, services, and utilities in isolation.

**What to test:**
- Service functions (business logic in `*.service.ts`)
- Data mappers and transformers (e.g., Spotify response → shared `Song` model)
- Utility/helper functions
- Validation logic
- Pure functions with no side effects

**What NOT to test at this layer:**
- Route handlers (covered by integration tests)
- External API calls (mock these)
- Database queries directly (covered by integration tests)

---

### 2. Integration Tests

Integration tests verify that modules work together correctly — route handlers calling services, services calling providers (mocked), and request/response contracts.

**What to test:**
- API endpoint request/response contracts
- Route handler orchestration (correct service calls, correct HTTP status codes)
- Auth middleware (token validation, protected route access)
- Error handling and edge cases at the API boundary
- Database interactions through service functions

---

### 3. End-to-End (E2E) Tests

E2E tests verify complete user flows through the full application stack (frontend + backend).

**What to test:**
- Full user journeys (signup, login, search, favorite)
- Browser interactions (form submissions, navigation, loading states)
- Critical paths that span multiple pages

---

## Tools

| Tool        | Purpose                              | Config Location       |
|-------------|--------------------------------------|-----------------------|
| **Vitest**  | Unit tests and integration tests     | `vitest.config.ts`    |
| **Playwright** | End-to-end browser tests          | `playwright.config.ts`|

---

## Test Scope Guidelines

### Auth

| Test Case                                | Layer       |
|------------------------------------------|-------------|
| Signup with valid credentials succeeds   | Integration |
| Login with valid credentials succeeds    | Integration |
| Login with invalid credentials fails     | Integration |
| JWT token returned correctly on login    | Integration |
| Protected endpoint rejects unauthenticated requests | Integration |
| Protected endpoint accepts valid JWT     | Integration |

### Search / Spotify Integration

| Test Case                                          | Layer       |
|----------------------------------------------------|-------------|
| Search endpoint returns normalized results         | Integration |
| Empty search results handled correctly             | Integration |
| Spotify API failure returns graceful error         | Integration |
| Spotify response mapper converts to shared `Song` model | Unit |
| Search filters (title, artist, album) applied correctly | Integration |
| Pagination parameters passed correctly             | Unit        |

### Frontend

| Test Case                                | Layer       |
|------------------------------------------|-------------|
| Search page shows loading state          | Unit        |
| Search results render correctly          | Unit        |
| Empty state displayed when no results    | Unit        |
| Error state displayed on API failure     | Unit        |
| Song card displays correct information   | Unit        |
| Favorites toggle works correctly         | Unit        |

### End-to-End

| Test Case                                | Layer |
|------------------------------------------|-------|
| Full signup flow                         | E2E   |
| Full login flow                          | E2E   |
| Search for a song and view results       | E2E   |
| Favorite a song (future)                 | E2E   |
| Navigate between pages                   | E2E   |

---

## Best Practices

### Mock External APIs

All external API calls (Spotify, LRCLIB, Last.fm, Ticketmaster, MusicBrainz) **must be mocked** in unit and integration tests. Tests must never make real HTTP requests to external services.

- Use Vitest's `vi.mock()` or manual mock modules for provider functions.
- For integration tests, mock at the provider boundary (e.g., mock `spotify.provider.ts` exports).
- For E2E tests, use MSW (Mock Service Worker) or a similar network-level mock if external APIs need to be simulated.

### Test Behaviour, Not Implementation

- Assert on **outputs and side effects**, not internal function calls.
- Test **what** a function does, not **how** it does it.
- Avoid asserting on internal state or private methods.
- If you refactor internals without changing behaviour, tests should still pass.

### API Contract Alignment

- Integration tests must validate that API responses match the shared DTO types defined in `packages/shared/src/types/`.
- If a shared type changes, corresponding tests must be updated.
- Use TypeScript's type system to catch contract mismatches at compile time where possible.

### General

- Each test file should focus on one module or component.
- Use descriptive test names that explain the expected behaviour.
- Keep tests independent — no test should depend on another test's state.
- Prefer `describe` / `it` blocks for clear grouping.
- Clean up any test data or state after each test.

---

## Test File Locations

Tests live alongside the code they test, inside `__tests__/` directories:

```
# Backend unit and integration tests
apps/backend/src/modules/**/__tests__/
  e.g. apps/backend/src/modules/auth/__tests__/auth.service.test.ts
  e.g. apps/backend/src/modules/auth/__tests__/auth.routes.test.ts
  e.g. apps/backend/src/modules/songs/__tests__/songs.service.test.ts

# Backend provider tests
apps/backend/src/providers/**/__tests__/
  e.g. apps/backend/src/providers/spotify/__tests__/spotify.mapper.test.ts

# Frontend component and feature tests
apps/frontend/src/features/**/__tests__/
  e.g. apps/frontend/src/features/search/__tests__/SearchPage.test.tsx
  e.g. apps/frontend/src/features/search/__tests__/SongCard.test.tsx

# End-to-end tests (repository root)
tests/e2e/
  e.g. tests/e2e/auth.spec.ts
  e.g. tests/e2e/search.spec.ts
  e.g. tests/e2e/favorites.spec.ts
```

### Naming Conventions

- Unit/integration test files: `<module>.test.ts` or `<component>.test.tsx`
- E2E test files: `<feature>.spec.ts`
- Test utilities/helpers: `__tests__/helpers/` or `__tests__/mocks/`

---

## Running Tests

```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests for a specific workspace
npm run test --workspace=apps/backend
npm run test --workspace=apps/frontend

# Run E2E tests
npx playwright test

# Run E2E tests with browser visible
npx playwright test --headed
```

---

## When to Write Tests

- **New feature:** Add unit tests for services/mappers and integration tests for new endpoints.
- **Bug fix:** Add a test that reproduces the bug before fixing it, then verify the test passes after the fix.
- **Refactor:** Ensure existing tests pass. Add tests if coverage gaps are found.
- **Behaviour change:** Update existing tests to reflect the new expected behaviour.

---

## Current Test Inventory

### Config Files

| File | Purpose |
|------|---------|
| `apps/backend/vitest.config.ts` | Vitest config for backend (Node env, `__tests__` pattern) |
| `apps/frontend/vitest.config.ts` | Vitest config for frontend (jsdom env, React plugin, `@` alias) |
| `apps/frontend/src/test-setup.ts` | Loads `@testing-library/jest-dom` matchers |
| `playwright.config.ts` | Root-level Playwright config (Chromium, auto-starts dev servers) |

### Backend Tests (32 tests)

| File | Tests |
|------|-------|
| `apps/backend/src/modules/auth/__tests__/auth.routes.test.ts` | 7 — register success, validation errors, login success/failure |
| `apps/backend/src/modules/songs/__tests__/songs.service.test.ts` | 11 — search pagination, filters, empty results, graceful provider failures |
| `apps/backend/src/modules/songs/__tests__/songs.routes.test.ts` | 8 — route validation, param passing, error responses |
| `apps/backend/src/providers/spotify/__tests__/spotify.mapper.test.ts` | 6 — Spotify response to Song model mapping edge cases |

### Frontend Tests (12 tests)

| File | Tests |
|------|-------|
| `apps/frontend/src/components/__tests__/SongCard.test.tsx` | 5 — renders title/artist/album, artwork vs placeholder |
| `apps/frontend/src/features/search/__tests__/pagination.test.ts` | 7 — page number generation edge cases |

### E2E Test Stubs (ready to run against live app)

| File | Scenarios |
|------|-----------|
| `tests/e2e/auth.spec.ts` | Login page render, register flow, login success, login failure |
| `tests/e2e/search.spec.ts` | Search page render, results display, no results, navigation to detail |

### Run Commands

```bash
npm test                                 # all unit + integration tests (both workspaces)
npm run test:e2e                         # Playwright E2E tests (requires running app)
npm run test --workspace=apps/backend    # backend only
npm run test --workspace=apps/frontend   # frontend only
```
