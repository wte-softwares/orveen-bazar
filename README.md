# ORVEEN BAZAR — Catalog Platfor

One responsive catalog + wishlist platform shared by three sibling brands:
**ORVEEN BAZAR.COM**, **ECO FAST BD**, and **RELIABLE MULTI PRODUCTS**.
Visitors browse products/services; registered customers save favourites;
staff manage their assigned brand's content; a platform admin manages
everything.

This is **not** an e-commerce store — there is no cart, checkout, payment,
inventory, or price-calculation functionality anywhere in the product, by
design. See `AGENTS.md` for the full list of architecture rules and
`docs/ARCHITECTURE.md` for the reasoning behind them.

## Stack

- **Next.js** (App Router, TypeScript, no `src/` directory)
- **Supabase** (Postgres, Auth, Storage) — local development runs entirely
  against the Supabase CLI's Docker stack
- **Tailwind CSS** + **shadcn/ui** (full component set)
- **Zod** for request validation
- **Playwright** for end-to-end tests, plus direct database/RLS policy tests

All data mutations, and anything a future mobile app will need, go through
versioned Route Handlers under `app/api/v1/**` — not Server Actions — so the
same JSON API can be reuse by web, a future Android app, and any other
client. Public marketing/catalog pages read Supabase directly from Server
Components for performance/SEO; see `docs/ARCHITECTURE.md` ("Read path") for
how that stays consistent with the API.

## Getting started (local development)

Prerequisites: Node.js, Docker Desktop (for local Supabase), the Supabase
CLI. Full walkthrough, including this project's non-default local Supabase
ports, is in **`docs/SETUP.md`** — read that before your first `npm run dev`.

Quick version:

```bash
npm install
npm run db:start   # boots the local Supabase Docker stack
npm run dev
```

Then visit `http://127.0.0.1:3000`. Supabase Studio for the local stack is at
the URL printed by `npm run db:start` (see docs/SETUP.md for the exact port).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:e2e` | Playwright suite (Phase 2) |
| `npm run db:start` / `db:stop` | Start/stop the local Supabase Docker stack |
| `npm run db:reset` | Re-apply all migrations + seed data |
| `npm run db:types` | Regenerate `types/database.types.ts` from the local schema |

## Project structure

```
app/
  (public)/     # family homepage, brand pages, catalog, auth, account
  admin/        # protected admin dashboard and content management
  api/v1/       # the versioned JSON API — web + future mobile clients
components/
  ui/           # shadcn/ui primitives (vendored, don't hand-edit)
  layout/ brand/ catalog/ admin/ auth/
lib/
  supabase/     # client factories (server, browser, middleware, admin)
  api/          # response envelope, auth resolution, error mapping, org-guard
  queries/      # shared read logic used by both Server Components and the API
  storage/      # signed uploads + the publish/unpublish pipeline
  validation/   # Zod schemas, one file per resource
types/          # database.types.ts (generated) + hand-written API contracts
supabase/       # config.toml, migrations, seed data
tests/          # e2e/ (Playwright) and policies/ (RLS allow/deny tests)
docs/           # architecture, data model, RLS policy matrix, API reference
```

## Documentation

- `AGENTS.md` — architecture rules and constraints for anyone (human or AI)
  changing this codebase; start here.
- `docs/SETUP.md` — local development environment, step by step.
- `docs/ARCHITECTURE.md` — module boundaries, the API-vs-server-component
  read path, and the storage publish strategy.
- `docs/DATA_MODEL.md` — table-by-table schema reference.
- `docs/RLS_POLICIES.md` — who can read/write what, table by table.
- `docs/API_REFERENCE.md` — every `/api/v1` endpoint (written once Phase 2's
  routes are implemented).

## Project status

Phase 1 (clean scaffold) is complete: toolchain, folder structure, and a
navigable stub for every screen in the brief are in place. Phase 2 (schema,
RLS, and real API implementations) is next — see `AGENTS.md` for the current
status and what's intentionally still a placeholder. Real UI/UX design is a
later phase, gated on designs the client will provide.
