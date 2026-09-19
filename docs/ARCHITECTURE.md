# Architecture

See `AGENTS.md` first for the non-negotiable rules; this document explains
the reasoning behind them.

## Two client surfaces, one backend

Everything here exists to serve **web today and Android later** without
building two backends. Concretely:

- **All writes**, and **any read a mobile client would also need**, are
  versioned JSON endpoints under `app/api/v1/**` (Route Handlers, not Server
  Actions). Both the web app (cookie session) and a future Android app
  (`Authorization: Bearer <access_token>`) call the exact same endpoints —
  see `lib/api/auth.ts`.
- **Public, SEO-critical pages** (`app/(public)/page.tsx`,
  `.../brands/[brand]/**`, `.../catalog/**`) are Server Components that read
  Supabase directly. There is no reusability requirement for "the rendered
  HTML of the family homepage," so routing that read through our own API
  would add a network hop and a maintenance burden for no benefit — this is
  exactly what Next.js Server Components + Supabase's SSR helpers are built
  for.

### Keeping the two read paths from drifting apart

The risk with the exception above is quiet duplication: someone tweaks the
catalog filter logic in the `/catalog` page and forgets the `/api/v1/catalog`
route has its own copy. The fix is structural, not a reminder to be careful:
**all "list/find published content" query logic lives in `lib/queries/*.ts`**,
and both the Server Component and the matching Route Handler call the same
function. There is exactly one place that decides what "published and
visible" means for catalog items, etc. — RLS is the authorization
boundary either way, and `lib/queries/*` is the single source of truth for
the shaping/filtering logic layered on top of it.

## Module map and why each one exists

```
lib/supabase/   server.ts | client.ts | middleware.ts | admin.ts
```
Four narrowly-scoped Supabase client factories instead of one shared
"supabase.ts" — each targets a different execution context (Server
Component/Route Handler, Client Component, root proxy/middleware, and the
service-role escape hatch) with different lifetime and cookie-handling
requirements. Mixing them is a common source of subtle auth bugs, so keeping
them as four small, clearly-named files makes it obvious which one a given
piece of code should import.

```
lib/api/   response.ts | auth.ts | errors.ts | org-guard.ts
```
- `response.ts` — the `{ data, error, meta }` envelope every route returns.
- `auth.ts` — resolves "who is calling, cookie or bearer token" once, reused
  everywhere, instead of every route re-implementing token parsing.
- `errors.ts` — typed errors mapped to HTTP status by one `withApiHandler()`
  wrapper, so a route's happy path is a few lines and error formatting is
  never ad hoc.
- `org-guard.ts` — the single "is this caller allowed to touch `:org`?"
  check used by every `admin/[org]/**` route. This is the module that closes
  the forged-organization-ID class of bug: without it, that check would be
  hand-rolled per route, and it's exactly the kind of check that's easy to
  get subtly wrong in one of eight nearly-identical routes.

```
lib/queries/   catalog.ts | brands.ts | ...
```
Shared published-content read logic — see "Two client surfaces" above.

```
lib/storage/   upload.ts | publish.ts
```
See "Storage strategy" below — `publish.ts` is the shared pipeline for
items and banners, rather than two near-duplicate implementations.

```
lib/validation/   *.schema.ts
```
One Zod schema file per resource. Every mutating Route Handler validates its
body against a schema here before touching the database — this exists
alongside the database's own constraints (unique slugs, foreign keys, the
cross-tenant trigger) specifically so a bad request comes back as a clean
422 with field-level messages instead of a raw Postgres error leaking
through.

## Storage strategy

Two Supabase Storage buckets:

- **`org-drafts`** (private) — every upload lands here first, at
  `{organization_id}/{type}/{id}/{filename}`, gated by the same
  org-membership check as `lib/api/org-guard.ts`.
- **`org-public`** (public) — populated by a **copy**, never a direct
  upload, only when the owning row transitions to published/active.

This exists because the brief requires draft media to never be reachable via
a public URL before publish, and Supabase Storage RLS policies can't cheaply
express "public if the linked `catalog_items.status = 'published'`" as a
per-object check without an awkward, RLS-recursion-prone correlated query on
every image request. Copy-on-publish sidesteps that entirely: `org-public`
membership *is* "currently published," full stop, checkable with a plain
public-bucket read.

Two ordering rules make this safe, not just simple (`lib/storage/publish.ts`
is where these live):

1. **Publish: copy first, then flip the row's status.** The object is
   guaranteed to exist by the time anything can link to it.
2. **Unpublish/archive: flip the row's status first, then delete the public
   copy, in the same request** (never a background job). There is no window
   where a now-private row's image is still fetchable by guessing its old
   public URL.

Banners go through the same pipeline as catalog items — one shared module,
not a simpler-but-divergent second implementation, even though banners do
not have an explicit "draft" authoring state the way the item editor does.

## Static site identity

The three brand names, descriptions, logos, public contact details, and
social-link configuration live in `lib/site-config.ts`. They are versioned
with the application and the supplied logo files live in `public/logo/`.
The `organizations` table is only an operational registry (`id`, `slug`, and
`is_active`) needed to scope catalog content and staff memberships. No API
can mutate public brand identity; changing it is an intentional code review
and deployment.

## Authorization model, in one paragraph

Row Level Security, enabled from each table's first migration, is the actual
authorization boundary — a bug in a Route Handler's own logic cannot, by
itself, leak another organization's data or let a customer write admin
content, because the database enforces the same rule independently.
`lib/api/org-guard.ts` exists on top of that not to *provide* security but to
turn "RLS silently returned zero rows" into a clean, debuggable 403 before a
write is even attempted. See `docs/RLS_POLICIES.md` for the full per-table
policy matrix.

## What's deliberately not here yet

Real UI/UX design. Every page under `app/(public)/**` and `app/admin/**`
currently renders `components/layout/ScreenPlaceholder.tsx` — plain shadcn
primitives with a short description of what the real screen will do. That's
intentional: the client is providing designs for a later phase, and building
opinionated visual design ahead of that would mean redoing it. Phase 2 wires
these same routes to real data and real forms without polishing their visual
presentation.
