-- Explicit GRANTs, separate from and in addition to the RLS policies above.
--
-- RLS decides WHICH ROWS a query can see/touch; the underlying Postgres
-- GRANT decides whether the role may run that kind of query on the table AT
-- ALL. Recent Supabase projects (see the `auto_expose_new_tables` comment in
-- supabase/config.toml) no longer auto-grant new `public` schema tables to
-- `anon`/`authenticated` the way older projects did — every table below
-- needs an explicit grant or every query against it fails with
-- "permission denied," even for a query that should return zero rows under
-- a correctly-written RLS policy. Both layers must be here: a grant without
-- a policy still fails RLS's default-deny; a policy without a grant never
-- gets the chance to run.
--
-- Only grant the operations each role's RLS policies actually allow, from
-- the RLS policies migration — e.g. `anon` never gets INSERT/UPDATE/DELETE
-- anywhere, since no table has an anon write policy.
--
-- `service_role` (lib/supabase/admin.ts) also needs its own explicit grants
-- here, on every table including the ones with zero anon/authenticated
-- policies (platform_admins, memberships): its `BYPASSRLS` role attribute
-- only skips row-level filtering, it does NOT imply table-level GRANTs,
-- which are a separate, independent permission system. Without these,
-- even the service-role client gets "permission denied" on tables that
-- have no policies for any other role.
grant select, insert, update, delete on
  public.organizations,
  public.profiles,
  public.platform_admins,
  public.memberships,
  public.categories,
  public.catalog_items,
  public.item_variants,
  public.banners,
  public.wishlists
to service_role;

grant select on public.organizations to anon, authenticated;
grant insert, update, delete on public.organizations to authenticated;

grant select, update on public.profiles to authenticated;
-- No insert grant: rows are created only by the handle_new_user trigger.

-- No grants at all on platform_admins: zero client-role policies exist for
-- it either (see the RLS policies migration) — this table is intentionally
-- unreachable from anon/authenticated in every way, not just via RLS.

grant select, insert, update, delete on public.memberships to authenticated;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

grant select on public.catalog_items to anon, authenticated;
grant insert, update, delete on public.catalog_items to authenticated;

grant select on public.item_variants to anon, authenticated;
grant insert, update, delete on public.item_variants to authenticated;

grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;

grant select, insert, delete on public.wishlists to authenticated;
-- No update grant: wishlist rows are immutable (remove + re-add instead).
