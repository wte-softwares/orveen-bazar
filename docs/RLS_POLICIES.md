# Row Level Security policies

This is the policy design Phase 2's migrations implement. Every table below
has RLS **enabled from the migration that creates it** — there is no
intermediate state where a table exists without RLS turned on.

**RLS is only half of this.** Every table below also needs an explicit
`GRANT` to `anon`/`authenticated` for the operations its policies allow —
this Supabase project does not auto-expose new tables to those roles, so a
table with correct RLS policies but no grant still fails every query with
"permission denied" before RLS even gets a chance to filter rows. See
`supabase/migrations/20260101000015_table_privileges.sql` and `AGENTS.md`.

Two helper functions make the policies below possible without recursive-RLS
problems (see `docs/DATA_MODEL.md`): `is_platform_admin(uid)` and
`has_org_membership(uid, org_id)`, both `SECURITY DEFINER` so they can read
`platform_admins`/`memberships` even though those tables have no
client-readable policies themselves.

## Policy matrix

| Table | Anonymous read | Authenticated read | Write |
|---|---|---|---|
| `organizations` | rows where `is_active` | same, plus **all** rows for a platform admin | **platform admin only** — operational registry rows only |
| `profiles` | none | owner only: `auth.uid() = user_id` | owner may `UPDATE` their own row only; `INSERT` happens exclusively via the `handle_new_user` trigger, never directly by a client |
| `platform_admins` | none | none | **none, for any client role** — service-role only, via `/api/v1/admin/users` |
| `memberships` | none | **own rows only**: `user_id = auth.uid()`, or all rows for a platform admin | platform admin only |
| `categories` | active rows of active organizations | + all rows of organizations the caller has membership in, or all for a platform admin | staff with `has_org_membership(auth.uid(), organization_id)`, or platform admin; `WITH CHECK` on `organization_id` |
| `catalog_items` | `status = 'published'` rows of active organizations | + all statuses in the caller's own/admin organizations | same membership rule as `categories`; `WITH CHECK` on `organization_id`; the cross-tenant category trigger is a second, independent guarantee |
| `item_variants` | follows the parent `catalog_items` row (see below) | follows the parent row | follows the parent item's membership rule — `WITH CHECK` re-validates the **new** `item_id`'s organization on every write, not the existing row's |
| `item_images` | follows the parent `catalog_items` row, identical pattern to `item_variants` | follows the parent row | identical pattern to `item_variants`, including the same **new** `item_id` re-validation on update |
| `banners` | active rows of active organizations | + all rows of the caller's own/admin organizations | same membership rule as `categories` |
| `wishlists` | none | owner only: `auth.uid() = user_id` | owner only; insert is idempotent (`on conflict do nothing`) at the API layer |

## Notes that matter more than the table above suggests

**`memberships` SELECT must be restricted to the caller's own rows.** It's
tempting to let any staff member read all memberships in "their" org (to
show a team list), but this table is also the answer to "is user X staff of
org Y" — letting a non-admin enumerate *other users'* rows leaks the
platform's org/staff structure to people who don't manage it. The `/admin/users`
screen (platform-admin only) is the only place that needs a broader view,
and it gets that view through the service-role client, not a broader RLS
policy.

**`item_variants` has no `organization_id` column**, so every policy on it —
read and write — is a correlated `EXISTS` subquery back to the parent
`catalog_items` row (and, for the anonymous-read case, transitively to
`organizations.is_active` too). This is deliberate: a variant's visibility
"follows its parent item" by construction, rather than by keeping a second
copy of the org/status data in sync. The one subtlety: on `UPDATE`, the
`WITH CHECK` clause must re-run that `EXISTS` against the row's **new**
`item_id` value — otherwise a staff member could reassign a variant to an
item in another organization by changing `item_id` on an update, since the
`USING` clause only validates the *old* row.

**`organizations` is not a brand-settings store.** It is a small operational
registry used for foreign keys, tenant isolation, and the `is_active` gate.
Brand identity is static application configuration, so there is no settings
write endpoint for a staff member or platform admin to call.

**Forged organization IDs are handled twice, deliberately.**
`lib/api/org-guard.ts` checks membership server-side before a Route Handler
touches the database — this exists purely for a clean, typed 403 response
instead of RLS silently returning zero rows (which is correct but confusing,
and for `INSERT`/`UPDATE` a bare RLS rejection is a raw Postgres error, not a
JSON envelope). RLS enforces the identical rule independently. Neither one
is allowed to be "the only" check — see `AGENTS.md`.

**Membership removal takes effect immediately** because every policy above
calls `has_org_membership(auth.uid(), ...)` live, on every request. Nothing
about org access is cached in a JWT custom claim. This must stay true —
caching membership in a token for performance would silently reopen the
"access removal should be immediate" requirement from the brief's acceptance
checklist. There's an explicit policy test for this in Phase 2 for exactly
that reason.

## Storage policies

See `docs/ARCHITECTURE.md` ("Storage strategy") for the two-bucket design.
In RLS terms:

- **`org-drafts`** (private): `SELECT`/`INSERT`/`UPDATE`/`DELETE` require
  `has_org_membership(auth.uid(), <org from the object's path>)` or platform
  admin — the same rule as the tables above, applied to storage objects.
- **`org-public`** (public): world-readable `SELECT`; `INSERT`/`UPDATE`/
  `DELETE` only via `lib/supabase/admin.ts` inside `lib/storage/publish.ts`
  — never directly by a client, staff included. A client publishes content
  by calling the item/banner/settings Route Handler, not by writing to this
  bucket itself.

## Required test coverage (Phase 2)

Per the brief: "direct database/API allow-and-deny tests, not only
hidden-button checks." `tests/policies/` must include, at minimum, one test
per cell of the matrix above that isn't "none," plus explicitly:

- A forged/typed-in organization ID on every `admin/[org]/**` write route,
  from a staff account that belongs to a *different* org — must fail both
  at the Route Handler (403) and if that check is bypassed, at the database.
- A staff account attempting to write to `organizations` — must fail even
  though they have a valid membership elsewhere in that org's content.
- A customer or staff account attempting `POST /api/v1/admin/users` — must
  fail regardless of any other role they hold.
- Removing a membership and immediately re-attempting an operation that
  required it — must fail on the very next request, not after a delay.
