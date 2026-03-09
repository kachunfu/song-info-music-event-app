# Documentation Maintenance Rules

Documentation is part of the codebase and must stay in sync with implementation.

For every change, addition, or removal that affects architecture, system structure, UML, workflows, database design, deployment, integrations, or technology choices, you must update the relevant markdown documentation before finishing.

---

## Required Behavior

### Before Making Changes — Read

1. [README.md](../README.md)
2. [architecture.md](../architecture.md)
3. [summary.md](../summary.md)
4. [ai-agent-rules/AI_AGENT_RULES.md](AI_AGENT_RULES.md)

### After Making Changes — Check Impact

Determine whether the change affects any of:

- [ ] Architecture (modules, layers, data flow)
- [ ] UML / diagrams (sequence diagrams, ERD, system overview)
- [ ] Folder structure
- [ ] Tech stack (new dependency, library swap)
- [ ] Setup steps (new env var, new install step)
- [ ] API behavior (new endpoint, changed request/response, removed route)
- [ ] Database schema (new table, column, relationship, migration)
- [ ] Deployment or infrastructure (Docker, Caddy, EC2, CI/CD)
- [ ] Environment variables (new, renamed, removed)
- [ ] Developer workflow (new script, changed commands)

If **any** item above is affected → update all relevant docs in the same task.

### After Making Changes — Update Docs

| What changed | Which doc to update |
|---|---|
| New or changed API endpoint | [ai-agent-rules/API_SPEC.md](API_SPEC.md) |
| DB table, column, or relationship | [ai-agent-rules/DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) |
| System architecture, modules, data flow | [architecture.md](../architecture.md) |
| Tech stack, project overview, MVP features | [summary.md](../summary.md) |
| Setup, structure, getting started | [README.md](../README.md) |
| Folder structure | [README.md](../README.md) + [architecture.md](../architecture.md) |
| Infrastructure, deployment, env vars | [README.md](../README.md) + [architecture.md](../architecture.md) |
| Engineering or coding rules | Relevant file in `ai-agent-rules/` |

---

## Rules

1. Never leave documentation outdated after code changes
2. If implementation and documentation conflict, resolve it by updating the docs in the same task
3. Keep terminology, folder names, and feature lists consistent across all docs
4. In your final response, list which documentation files were updated and why
5. If no documentation update is needed, explicitly state why

---

## Definition of Done

A task is **not complete** until both code **and** all related documentation are updated.

Final response must include one of:

**Option A — Docs updated:**
> Documentation updated:
> - `API_SPEC.md` — added `POST /api/playlists` endpoint
> - `DATABASE_SCHEMA.md` — added `playlists` table schema

**Option B — No docs needed:**
> No documentation update required: this change only affects internal implementation details with no impact on architecture, APIs, schema, or developer workflow.
