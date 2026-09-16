# Local development setup

## Prerequisites

- Node.js (v20+) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
  installed (`supabase --version` to check)

## Why local Supabase uses non-default ports

This project's `supabase/config.toml` remaps every local Supabase port off
the CLI's defaults (54321-54327), because this development machine already
runs other projects' local Supabase stacks on that block and on
54421-54427. **If you're on a different machine and see a port conflict
anyway, check `docker ps` for other `supabase_*` containers before assuming
something is broken.**

| Service | CLI default | This project |
|---|---|---|
| API (Kong) | 54321 | **54521** |
| Postgres | 54322 | **54522** |
| Shadow DB | 54320 | **54520** |
| Studio | 54323 | **54523** |
| Mailpit (email testing) | 54324 | **54524** |
| Connection pooler | 54329 | **54529** |
| Analytics | 54327 | **54527** |

## First-time setup

```bash
npm install

# Boots the local Supabase Docker stack. First run pulls several images and
# can take a few minutes; subsequent runs are fast.
npm run db:start
```

`npm run db:start` prints the local `PUBLISHABLE_KEY`, `SECRET_KEY`, and
Postgres connection string. If you ever need to see them again without
restarting:

```bash
supabase status -o env
```

Copy `.env.example` to `.env.local` if it doesn't already exist, and fill in
the values `db:start`/`status` printed:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54521
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY from supabase status>
SUPABASE_SECRET_KEY=<SECRET_KEY from supabase status>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54522/postgres
SUPABASE_MAILPIT_URL=http://127.0.0.1:54524
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

These local keys are safe to keep in `.env.local` (gitignored) — they only
grant access to your own local Docker containers, not any real data.

```bash
npm run dev
```

Visit `http://127.0.0.1:3000`. Local Supabase Studio (browse tables, run SQL,
inspect auth users) is at `http://127.0.0.1:54523`.

The database starts empty — `supabase/seed.sql` only inserts content rows
(organizations, categories, items, banners), because auth users and real
image files both need an Admin API/service client that plain SQL doesn't
have. Run these once after every `db:reset`, in order:

```bash
npm run db:seed   # = db:seed:users (5 test accounts) + db:seed:assets
                   # (brand logos + generated placeholder photos, uploaded
                   # straight to org-public — see scripts/seed-assets.mjs)
```

## Email confirmation flow (local)

`supabase/config.toml` has `auth.email.enable_confirmations = true`, so
registration requires confirming an email before login — matching the
brief's requirement for a working "confirm email" step. Locally, these
emails don't go anywhere real: open **Mailpit** at
`http://127.0.0.1:54524` to read them (the Supabase CLI's config keys and
some tooling still say "Inbucket" — that's the tool this replaced; the
local web UI is Mailpit).

## Everyday commands

```bash
npm run db:start     # start the local Supabase stack
npm run db:stop      # stop it (data persists in a Docker volume)
npm run db:reset      # drop, re-run all migrations, and re-seed content rows
                       # — use this liberally, it's meant to be destroyed and
                       # rebuilt, but re-run `npm run db:seed` after (below)
npm run db:seed       # re-create the 5 test accounts + re-upload images —
                       # needed after every db:reset, not automatic
npm run db:types      # regenerate types/database.types.ts after a migration
                       # change — never hand-edit that file
```

## Production / staging Supabase

**Do not use the hosted Supabase project for local development.** A hosted
project already exists for production; its URL and publishable key are
provided separately and only ever belong in your hosting provider's
environment variable settings (e.g. Vercel project settings) — never in a
file that gets committed, and never in `.env.local`. See `.env.example` for
the exact variable names both environments share.

## Troubleshooting

- **"container is not ready: unhealthy" on `supabase start`**: usually
  transient (Studio/Analytics take longer to become healthy than the CLI's
  default timeout, especially with other Docker stacks running on the same
  machine). Retry with `supabase start --ignore-health-check`, then confirm
  with `docker ps --filter "name=orveen-bazar"` that every container settles
  into a `healthy` state within another 30-60 seconds.
- **Port already in use**: another project's local Supabase stack (or
  something else) is on that port. Check `docker ps` and, if needed, adjust
  `supabase/config.toml` to a free block — see the port table above for the
  scheme this project already uses.
- **Images from Storage 400 with "upstream image ... resolved to private IP"
  in the server log**: Next.js 16 blocks `next/image` from fetching a URL
  that resolves to a private IP by default (SSRF hardening) — local Supabase
  Storage at `127.0.0.1:54521` is exactly that. `next.config.ts` already sets
  `images.dangerouslyAllowLocalIP: true` for non-production, so this should
  only resurface if `NODE_ENV` is somehow `production` locally, or after
  editing that config — don't widen it to production.
