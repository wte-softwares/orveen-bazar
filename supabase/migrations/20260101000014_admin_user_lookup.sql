-- Lets /api/v1/admin/users resolve an email address to a user id when
-- granting a membership, without exposing the `auth` schema through the
-- Data API (api.schemas only lists public/graphql_public — see
-- supabase/config.toml) and without giving any client direct SELECT access
-- to auth.users.
--
-- SECURITY DEFINER so it can read auth.users despite that schema not being
-- exposed to the calling role; the is_platform_admin() check INSIDE the
-- function body (not just relying on the route handler's own check) means
-- calling this directly still can't be used to enumerate arbitrary users by
-- a non-admin, even if a future route handler forgets to gate it.
create or replace function public.find_user_id_by_email(lookup_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  found_user_id uuid;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'Only a platform admin can look up users by email.'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  select id into found_user_id
  from auth.users
  where lower(email) = lower(lookup_email)
  limit 1;

  return found_user_id;
end;
$$;

comment on function public.find_user_id_by_email(text) is
  'Admin-only email -> user id lookup for granting memberships. Checks is_platform_admin() internally, not just at the calling route, so this stays safe even if a future caller forgets to gate it.';

grant execute on function public.find_user_id_by_email(text) to authenticated;
