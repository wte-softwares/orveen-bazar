-- Both SECURITY DEFINER with a pinned search_path so RLS policies on OTHER
-- tables can check platform_admins/memberships — which have no
-- client-readable policies of their own (see migrations 000004 and the RLS
-- policies migration) — without those checks recursing back into RLS on
-- platform_admins/memberships themselves. STABLE lets Postgres cache the
-- result within a single statement.
create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.platform_admins where user_id = uid
  );
$$;

comment on function public.is_platform_admin(uuid) is
  'True if uid is a platform admin. SECURITY DEFINER + pinned search_path required so RLS policies can call this without recursing into platform_admins'' own (nonexistent) client policies.';

create or replace function public.has_org_membership(uid uuid, org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships
    where user_id = uid and organization_id = org_id
  );
$$;

comment on function public.has_org_membership(uuid, uuid) is
  'True if uid has an active staff membership in org_id. Membership is checked live on every call — never cache this in a JWT claim, or membership removal would stop taking effect immediately (see docs/RLS_POLICIES.md).';

-- Explicit EXECUTE grants (rather than relying on Postgres's implicit
-- PUBLIC-execute default) so lib/api/auth.ts can call these via
-- `supabase.rpc(...)` as the authenticated/anon role to build the caller's
-- auth context — e.g. checking "is this user a platform admin?" without
-- ever granting direct SELECT on the platform_admins table itself.
grant execute on function public.is_platform_admin(uuid) to anon, authenticated;
grant execute on function public.has_org_membership(uuid, uuid) to anon, authenticated;
