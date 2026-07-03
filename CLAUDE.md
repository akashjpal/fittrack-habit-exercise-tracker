# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start client (Vite :5173) + server (Express :5000) concurrently
npm run dev:client    # Vite only — proxies /api → :5000
npm run dev:server    # Express only via tsx watch
npm run build:client  # Production Vite build → client/dist/
npm run build:server  # Compile server TypeScript → server/dist/
npm run install:all   # Install deps in both client/ and server/
```

Type-check without emitting:
```bash
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

Environment: `.env` at repo root. See `.env.example` for required variables. `VITE_API_BASE_URL` must NOT include `/api` — the frontend api client appends it.

## Architecture

Monorepo with three packages:

```
client/src/          → React SPA (Vite, wouter, TanStack Query, Tailwind + shadcn/ui)
server/src/          → Express API (Controller → Service → Repository)
supabase/migrations/ → SQL migrations (InsForge PostgreSQL backend)
```

### Backend

Layered architecture wired in `server/src/container.ts`:

- **Repositories** (`repositories/insforge/`) — data access via `@insforge/sdk`. Interface-first in `repositories/interfaces/`.
- **Services** (`services/`) — business logic, DTO validation, call repositories.
- **Controllers** (`controllers/`) — receive `AuthenticatedRequest`, delegate to service, forward errors via `next(err)`.
- **Routes** (`routes/`) — registered in `routes/index.ts` under `/api`. Static paths must come before parameterized routes.

Key middleware in `app.ts`:
- `caseTransformMiddleware` — auto-converts `snake_case` (DB) ↔ `camelCase` (API) on all requests/responses.
- `errorMiddleware` — catches `AppError` instances; always use `AppError.badRequest()`, `.notFound()`, `.unauthorized()` — never throw raw `Error`.
- `validateBody(zodSchema)` — input validation middleware used on routes.

Auth: JWT Bearer tokens; `AuthenticatedRequest` carries `userId`, `userEmail`, `accessToken`.

### Frontend

- **Routing**: wouter; protected routes wrapped in `<ProtectedRoute>` in `App.tsx`.
- **Data fetching**: TanStack Query (`useQuery` / `useMutation`). API calls go through `lib/api.ts` which injects Bearer tokens and appends `/api`.
- **Auth**: `lib/auth.tsx` context backed by `@insforge/sdk`; tokens persisted in localStorage via `lib/tokenStore.ts`.
- **UI**: shadcn/ui primitives in `components/ui/` (Radix-based); domain components in `components/`; pages in `pages/`.

### Key Files

| Purpose | File |
|---|---|
| Express setup & middleware | `server/src/app.ts` |
| DI container | `server/src/container.ts` |
| Route registration | `server/src/routes/index.ts` |
| Custom errors | `server/src/utils/errors.ts` |
| Frontend routing | `client/src/App.tsx` |
| API client | `client/src/lib/api.ts` |
| Auth context | `client/src/lib/auth.tsx` |

### AI Features

- **Voice workout logging**: audio uploaded → Groq Llama 3.3 70B transcribes + parses → structured workout data returned.
- **AI FitCheck coaching**: analyzes last 3 weeks of workout/habit history via Groq, returns JSON with strengths, weaknesses, recommendations.
- Both wired through `ai.service.ts` → `ai.controller.ts` → `/api/ai/*`.

## Conventions

**Naming**: files as `{domain}.{type}.ts` (e.g. `workout.controller.ts`); classes as `PascalCase` with type suffix; DB columns `snake_case`; API payloads `camelCase`.

**Zod schemas — two-tier system**:
- Row types (server): `snake_case`, DB shape — e.g. `WorkoutRow`.
- DTO types (client/API): `camelCase` — e.g. `Workout`.
- Schemas in `server/src/shared/schemas/` and `client/src/shared/schema.ts`.

## Pitfalls

- `tsx` does NOT resolve tsconfig paths at runtime — `@fittrack/shared` resolves via a symlink (`node_modules/@fittrack/shared` → `../../shared`). Do not use bare imports that depend on path aliases in server runtime code.
- ESM throughout — `"type": "module"` in root `package.json`.
- `VITE_API_BASE_URL` must NOT include `/api`.
- Always use `AppError` subclass methods — never throw raw `Error` in controllers/services.
- Route order matters: register static paths (e.g. `/library`) before parameterized ones (`/:id`).

## Feature Development Workflow

Build in this order to maintain a working contract at each layer:

1. DB migration (if new tables/columns)
2. Shared Zod schemas
3. Repository (interface → InsForge implementation)
4. Service → Controller → Route registration
5. Frontend: `api.ts` method → UI component → page integration → `App.tsx` route

After implementing: smoke-test with `npm run dev`, check browser console + server terminal for errors, run `tsc --noEmit` in both packages.
Make a TODO list before starting with any new tasks. Make a proper plan and stick with it.

## Bug Fix Workflow

Trace from symptom inward: UI component → `api.ts` call → controller → service → repository → DB query. Common culprits:

| Symptom | Investigate |
|---|---|
| Data mismatch (camelCase vs snake_case) | `caseTransformMiddleware` or schema mismatch |
| 401/403 errors | Auth middleware or token handling |
| DB constraint violation | Migration SQL or RLS policies |
| Type errors at compile time | Shared Zod schemas or tsconfig |

Apply the minimal fix — do not refactor unrelated code alongside a bug fix.
Do the ultrathinking and give RCA along with docs referred.