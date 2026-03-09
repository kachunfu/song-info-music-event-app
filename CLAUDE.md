# Claude Code Instructions — SongInfo Music Event App

## MANDATORY: Read Before Any Code Change

You MUST read all of the following documents before writing, modifying, or reviewing any code in this project. This is not optional.

### Project Docs
- [README.md](README.md)
- [summary.md](summary.md)
- [architecture.md](architecture.md)

### Rule Files (in `ai-agent-rules/`)
- [ai-agent-rules/AI_AGENT_RULES.md](ai-agent-rules/AI_AGENT_RULES.md) — step-by-step process, pre-coding checklist
- [ai-agent-rules/ENGINEERING_RULES.md](ai-agent-rules/ENGINEERING_RULES.md) — SOLID, Clean Architecture, design-first
- [ai-agent-rules/CODING_GUIDELINES.md](ai-agent-rules/CODING_GUIDELINES.md) — TypeScript, ESM imports, naming, code quality
- [ai-agent-rules/API_SPEC.md](ai-agent-rules/API_SPEC.md) — REST endpoint contracts, request/response schemas
- [ai-agent-rules/DATABASE_SCHEMA.md](ai-agent-rules/DATABASE_SCHEMA.md) — DB tables, relationships, migration rules
- [ai-agent-rules/DOCUMENTATION_MAINTENANCE_RULES.md](ai-agent-rules/DOCUMENTATION_MAINTENANCE_RULES.md) — keeping docs in sync with code
- [ai-agent-rules/TESTING_STRATEGY.md](ai-agent-rules/TESTING_STRATEGY.md) — testing layers, scope, best practices, file locations

---

## MANDATORY: Implementation Process

Follow these steps for every feature or change. Do not skip steps.

1. **Analyze** — understand the problem fully before touching code
2. **Identify** — list all affected modules and files
3. **Check** — search the repo for all usages of anything being changed
4. **Propose** — explain the plan and list files to modify before implementing
5. **Implement** — write the code following all rule files
6. **Verify** — confirm no other modules are broken
7. **Test** — write or update tests per [ai-agent-rules/TESTING_STRATEGY.md](ai-agent-rules/TESTING_STRATEGY.md)

---

## MANDATORY: Before Modifying Any Function, Class, or Module

- Search the entire repository for all usages
- Identify dependent modules
- Verify the change will not break those usages
- If breaking changes are unavoidable, propose a migration plan first

---

## Architecture Rules (Non-Negotiable)

- Route handlers orchestrate only — no business logic
- Business logic lives in `*.service.ts` files only
- Domain types must remain framework-independent
- Providers wrap one external API each — no cross-provider calls
- DB access only through service functions — never in route handlers

---

## Code Rules (Non-Negotiable)

- All relative imports in `apps/backend` must use `.js` extension (ESM NodeNext)
- No `any` types without explicit justification
- No unused imports or variables
- Shared types go in `packages/shared/src/types/` — never duplicate
- DB schema defined only in `packages/database/src/schema/`

---

## Testing Rules (Non-Negotiable)

- Any new feature or significant change must include appropriate tests according to [ai-agent-rules/TESTING_STRATEGY.md](ai-agent-rules/TESTING_STRATEGY.md).
- If code is modified in a way that affects behaviour, Claude must:
  - Update existing tests that cover the changed behaviour
  - Or add new tests if no coverage exists
- External APIs must always be mocked in tests — never make real HTTP requests in test runs.
- Test files must follow the directory structure defined in the testing strategy.
- Bug fixes must include a regression test that reproduces the bug.

---

## Completion Checklist

Before finishing any task:

- [ ] TypeScript compiles without errors
- [ ] No unused imports
- [ ] All relative backend imports use `.js` extension
- [ ] Error cases handled
- [ ] No business logic in route handlers
- [ ] No other modules broken
- [ ] Tests added or updated for any behaviour changes (per testing strategy)
- [ ] All tests pass
- [ ] Documentation updated for any changes to architecture, APIs, DB schema, env vars, folder structure, or tech stack
- [ ] Final response states which docs were updated, or explicitly states no update was needed
