-- Global admins. Deliberately a separate, tiny table from `memberships`:
-- "can manage everything" and "can manage one organization" are different
-- kinds of grant, and conflating them in one table invites subtle RLS
-- mistakes (e.g. an org-scoped role accidentally matching a platform-wide
-- check). No client role gets any RLS policy on this table at all — see the
-- RLS policies migration — it is managed exclusively via the service-role
-- client behind /api/v1/admin/users.
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.platform_admins is
  'Global admins. Zero client-side RLS policies by design — service-role only, via a platform-admin-gated API route.';
