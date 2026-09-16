-- One row per auth.users row. Users may only ever edit display_name on their
-- own row via the API — role/membership data intentionally lives in
-- separate tables (platform_admins, memberships) that this table's RLS
-- policy cannot touch, so a customer can never grant themselves elevated
-- access by editing "their own" profile.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Owner-only read/update via RLS; row creation happens only through the handle_new_user trigger below, never directly by a client.';

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created. This is the
-- canonical Supabase pattern: SECURITY DEFINER so it can write to
-- public.profiles despite running as a trigger on the auth schema, with the
-- search_path pinned so it can't be tricked into resolving a
-- similarly-named function/table from an unexpected schema.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- ON CONFLICT DO NOTHING makes this idempotent: certain auth flows (e.g.
  -- some admin-API or identity-linking paths) can in rare cases re-fire
  -- user-creation-adjacent triggers for the same user. Cheap insurance
  -- against a duplicate-key error breaking sign-up.
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a public.profiles row for every new auth.users row. SECURITY DEFINER with a pinned search_path — do not remove either.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
