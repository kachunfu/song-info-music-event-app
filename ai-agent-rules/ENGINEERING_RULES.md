# Engineering Rules

Architectural and design principles that govern all code in this project.

---

## 1. SOLID Principles

All code must follow SOLID principles.

### Single Responsibility
- Every class, module, and function has one reason to change
- A router file only defines routes
- A service file only contains business logic
- A provider file only wraps one external API

### Open/Closed
- Modules are open for extension, closed for modification
- Add new providers by implementing a common interface, not by modifying existing ones
- Extend behavior through composition, not inheritance

### Liskov Substitution
- Subtypes must be substitutable for their base types without breaking behavior
- Avoid overriding behavior in ways that violate the contract of the parent

### Interface Segregation
- Prefer small, focused interfaces over large general ones
- Clients should not depend on interfaces they do not use
- Split provider interfaces by capability, not by API source

### Dependency Inversion
- High-level modules must not depend on low-level modules
- Both should depend on abstractions (interfaces / types)
- Prefer dependency injection over hard-coded imports where feasible

---

## 2. Clean Architecture

This project follows Clean Architecture layering. Dependencies always point inward.

```
┌─────────────────────────────────┐
│         API Routes              │  ← Orchestration only. No business logic.
├─────────────────────────────────┤
│       Application Services      │  ← Business logic. No framework code.
├─────────────────────────────────┤
│         Domain Models           │  ← Framework-independent types/interfaces.
├─────────────────────────────────┤
│     Infrastructure / Providers  │  ← External API clients, DB access.
└─────────────────────────────────┘
```

### Layer Rules

| Layer | What belongs here | What does NOT belong here |
|---|---|---|
| Routes (`modules/*/index.ts`) | Request parsing, response formatting, calling services | Business logic, DB queries, API calls |
| Services (`*.service.ts`) | Business rules, aggregation logic, error handling | Framework code (Hono context), raw DB/HTTP calls |
| Domain types (`*.types.ts`, `shared/`) | TypeScript interfaces and types | Implementation details |
| Providers (`providers/*/`) | Single external API wrapper | Business logic, DB access |
| Database (`packages/database/`) | Schema, migrations, DB client | Application logic |

---

## 3. Design-First Approach

Before writing any implementation code:

1. Explain the design intent
2. List files to be modified
3. Show class / interface changes
4. Confirm the design is correct before writing implementation

Never start coding without a plan.

---

## 4. Architecture Constraints

- Controllers (routes) must not contain business logic
- Business logic must live in application services
- Domain models must remain framework-independent (no Hono, no Drizzle)
- Infrastructure code must be isolated in providers and database packages
- API routes should only orchestrate services — parse input, call service, return response
- Providers must not call other providers directly — go through services

---

## 5. Dependency Rules

- Prefer dependency injection over module-level singletons where testability matters
- Interface-based design is preferred for providers (allows mocking in tests)
- Shared types live in `packages/shared` — never duplicate type definitions
- Database schema lives in `packages/database` — never define schema elsewhere
- No circular dependencies between modules

---

## 6. Change Management

- Never rewrite large sections of the codebase unless explicitly required
- Prefer refactoring existing modules over creating new ones for the same concern
- Maintain backward compatibility — if a breaking change is unavoidable, document and plan migration
- One concern per PR / change set
