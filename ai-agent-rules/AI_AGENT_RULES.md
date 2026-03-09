# AI Agent Rules

Rules that govern how an AI agent must behave when working in this codebase.
These rules are non-negotiable and must be followed in every session.

---

## 1. Mandatory Pre-Work — Read Before Coding

Always read these documents before making any code change:

| Document | Purpose |
|---|---|
| [README.md](README.md) | Project overview, setup, structure |
| [architecture.md](architecture.md) | System diagrams, data flows, infrastructure |
| [ENGINEERING_RULES.md](ENGINEERING_RULES.md) | SOLID, Clean Architecture, design principles |
| [CODING_GUIDELINES.md](CODING_GUIDELINES.md) | TypeScript conventions, naming, code quality |
| [API_SPEC.md](API_SPEC.md) | REST endpoint contracts |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Database tables and relationships |

Do not skip this step. Understanding the existing system is mandatory.

---

## 2. Step-by-Step Implementation Process

When implementing any feature or change, follow these steps in order. Do not skip steps.

### Step 1 — Analyze the Problem
- Understand what is being asked
- Identify the root cause (for bugs) or the requirement (for features)
- Clarify ambiguity before writing any code

### Step 2 — Identify Affected Modules
- Determine which modules, services, and files are involved
- Check if the change touches shared interfaces or types
- Assess the blast radius of the change

### Step 3 — Check Dependencies and Imports
- Search the entire repository for usages of the component being changed
- Identify all dependent modules
- Verify imports use `.js` extensions (ESM / NodeNext requirement)
- Check for dependency version compatibility

### Step 4 — Propose a Minimal Change Plan
- Explain the reasoning for the approach
- List all files that will be modified
- Show class / interface changes if applicable
- Propose the smallest change that solves the problem
- Get confirmation before proceeding with large changes

### Step 5 — Implement the Change
- Follow all rules in ENGINEERING_RULES.md and CODING_GUIDELINES.md
- Make one logical change at a time
- Do not rewrite large sections of code unless explicitly required

### Step 6 — Verify No Other Modules Break
- Search for usages of changed functions/types/interfaces
- Ensure all callers still compile
- Check that no modules are importing removed exports

### Step 7 — Suggest Tests
- Identify what unit tests should cover the change
- Identify any E2E test flows that may be affected
- Suggest test cases for edge cases and error paths

---

## 3. Before Modifying Any Function, Class, or Module

1. Search the entire repository for all usages of that function/class/module
2. Identify all dependent modules
3. Verify the change will not break those usages
4. If breaking changes are unavoidable, propose a migration plan before implementing

---

## 4. Communication Standards

- Explain reasoning before writing code
- List all files that will be modified upfront
- Show interface / type changes before implementation
- Flag risks clearly (breaking changes, performance, security)
- Do not make assumptions — ask when requirements are unclear

---

## 5. Completion Checklist

Before marking any task as done:

- [ ] TypeScript types compile without errors
- [ ] No unused imports remain
- [ ] No unused variables remain
- [ ] Edge cases and error paths are handled
- [ ] Tests are suggested or updated
- [ ] No other modules are broken by the change
- [ ] ESM `.js` import extensions are correct on all relative imports
