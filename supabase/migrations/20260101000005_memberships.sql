-- Org-scoped staff assignments. A membership row is what lets a user manage
-- one organization's items/categories/banners (but never its brand settings
-- or user list — those are platform-admin only, see RLS policies).
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Single legal value today (platform-wide admin lives in platform_admins,
  -- never here) — kept as a CHECK rather than hardcoded so an org-scoped
  -- role narrower than "staff" could be added later without a schema
  -- rewrite. Do not add one speculatively; this is just future-proofing.
  role text not null default 'staff' check (role in ('staff')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

comment on table public.memberships is
  'Org-scoped staff assignments. A user may SELECT only their OWN rows (never another user''s) — see RLS policies. Written only by a platform admin.';

create index memberships_user_id_idx on public.memberships (user_id);
