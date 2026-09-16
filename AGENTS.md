# Agent instructions for this repository

Read this before making any non-trivial change. It exists so a coding agent
picking up this project in a later session — or later in this same session,
after context has been summarized — doesn't quietly drift away from decisions
that were made deliberately, several of them for security reasons.

The authoritative plan for this rebuild lives in
`docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, and `docs/RLS_POLICIES.md`.
This file is the short, load-bearing summary of the rules those documents
explain in full. If something here and one of those documents ever disagree,
that's a bug in the docs — flag it, don't silently pick one.

## What this project is

A catalog + wishlist platform for three sibling brands (organizations):
ORVEEN BAZAR.COM, ECO FAST BD, RELIABLE MULTI PRODUCTS. Visitors browse;
customers save favourites; staff manage their assigned brand's content;
a platform admin manages everything.

## What this project is explicitly NOT

**No cart, checkout, payments, inventory, shipping, bookings, refunds,
invoices, or price calculation — anywhere, ever, for any reason.** No "Buy
now" or "Add to cart" control may exist. If a request seems to need one of
these, it's out of scope — say so instead of building it. Item "variants"
(`item_variants`) are descriptive only (e.g. Size = 500ml) — never stock,
quantity, SKU, or price.

## Non-negotiable architecture rules

1. **Route Handlers, not Server Actions, for every mutation and every
   mobile-facing read.** All of `/api/v1/**` exists so a future Android app
   (and "other clients") can consume the exact same JSON API the web app
   uses. Do not add a `"use server"` action as an alternative write path.
   **Exception:** public marketing/catalog pages (`app/(public)/**`) may
   read Supabase directly from Server Components for SEO/performance — but
   that read logic must live in `lib/queries/*.ts` and be called by both the
   page and the matching `/api/v1` route, never duplicated inline in both
   places. See docs/ARCHITECTURE.md, "Read path".
2. **No `src/` directory.** Everything lives at the repo root
   (`app/`, `components/`, `lib/`, `types/`, etc.).
3. **Row Level Security is the real authorization boundary**, on every
   exposed table, from the first migration that creates it — never add a
   table and defer RLS "for later." Route Handlers additionally re-check
   membership/role via `lib/api/org-guard.ts` for a clean error response;
   that check is defense-in-depth, not a substitute for RLS. A forged
   organization ID in a URL param, body field, or query filter must fail
   both layers independently — see docs/RLS_POLICIES.md.
4. **The service/secret key (`SUPABASE_SECRET_KEY`) never reaches client
   code, never gets logged, and is only ever imported through
   `lib/supabase/admin.ts`**, which is guarded with `import "server-only"`.
   If you need it for something, ask whether that something should really be
   an RLS-scoped query instead — the admin client bypasses RLS entirely.
5. **Draft media must never be publicly reachable before publish.** Uploads
   land in the private `org-drafts` bucket; `lib/storage/publish.ts` copies
   to the public `org-public` bucket only when the owning row is published,
   and scrubs the public copy the moment it's unpublished/archived, in the
   same request. Don't build a second, simpler upload path that skips this.
6. **No giant single-file modules.** If a Route Handler's logic grows past
   "validate → guard → one or two DB calls → respond," extract it into
   `lib/queries/`, `lib/storage/`, or a resource-specific helper — don't let
   business logic accumulate inside `route.ts` files.
7. **Comment the "why," not just the "what."** Especially for anything
   touching authorization, storage publish ordering, or cross-tenant
   integrity — these are exactly the places a future reader (human or agent)
   will be tempted to "simplify" in a way that reopens a closed security gap.

## shadcn/ui note (this project uses the newer Base UI-powered CLI)

Components here come from the `shadcn` CLI's Base UI variant, **not** the
classic Radix `asChild`/`Slot` pattern. To render a `Button` (or similar) as
a different element, use the `render` prop:

```tsx
// Correct:
<Button variant="outline" render={<Link href="/login">Log in</Link>} />

// Wrong — will not type-check, asChild doesn't exist on this Button:
<Button asChild><Link href="/login">Log in</Link></Button>
```

`components/ui/**` and `hooks/use-mobile.ts` are vendored by the shadcn CLI
and excluded from lint on purpose (see `eslint.config.mjs`) — don't hand-edit
them; re-run `npx shadcn@latest add <component> --overwrite` instead if a
newer version is needed.

## Regenerating generated files

- **Database types**, after any migration change: `npm run db:types`
  (wraps `supabase gen types typescript --local`). Never hand-edit
  `types/database.types.ts`.
- **Local Supabase env values**, after `supabase start`: `supabase status -o
  env`, then update `.env.local` (gitignored — never commit real values;
  `.env.example` documents variable *names* only).

## Local Supabase ports are non-default on this machine

`supabase/config.toml` remaps the CLI's default ports (54321-54327) to
54521-54527, because this machine already runs other local Supabase stacks
on the default block and on 54421-54427. See `docs/SETUP.md` before assuming
the standard `http://127.0.0.1:54321` URL — it's `54521` here.

## Two-phase build status

- **Phase 1 (done):** repo scaffold, toolchain, full module/folder skeleton,
  local Supabase running, every screen-map route present as a stub or
  `501 not_implemented` API response.
- **Phase 2 (in progress / next):** real schema + RLS migrations, real
  `lib/api/*`, `lib/queries/*`, `lib/storage/*`, `lib/validation/*`, every
  Route Handler implemented, Playwright + RLS policy tests, and
  `docs/API_REFERENCE.md` written last, once every route is real, for
  client review.
- **UI/UX polish is a separate, later phase**, gated on designs the client
  will provide. Don't build real visual design ahead of that — the current
  pages intentionally use plain shadcn primitives via
  `components/layout/ScreenPlaceholder.tsx` so the app is navigable without
  pretending a design phase already happened.

## Before you commit

`npm run build && npm run typecheck && npm run lint` must all pass. Once
Phase 2 tests exist, `npm run test:e2e` and the RLS policy test suite must
pass too, and `supabase db reset` must apply every migration + seed cleanly.
