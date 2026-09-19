-- Platform-wide customer testimonials — not org-scoped (unlike banners),
-- since they're marketing content for the family homepage and the login/
-- signup pages, not any one brand's content. Previously a hardcoded array
-- in components/home/Testimonials.tsx; moved to the database so the
-- homepage grid and the auth pages' feedback panel can both read the same
-- rotating set instead of duplicating copy in two places.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote_bn text not null,
  quote_en text not null,
  name_bn text not null,
  name_en text not null,
  city_bn text not null,
  city_en text not null,
  -- A plain public path (e.g. "/testimonials/rakib-ahmed.png"), not an
  -- org-storage path — these are static generated portraits shipped with
  -- the app, not user-uploaded media, so the draft/publish storage pipeline
  -- (lib/storage/publish.ts) doesn't apply here.
  avatar_path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.testimonials is
  'Platform-wide customer testimonials for the homepage and auth pages. Not organization-scoped. Writable by a platform admin only.';

create index testimonials_active_sort_idx
  on public.testimonials (is_active, sort_order);

create trigger set_updated_at
  before update on public.testimonials
  for each row
  execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "testimonials_select_active_or_admin"
  on public.testimonials for select
  to anon, authenticated
  using (is_active or public.is_platform_admin(auth.uid()));

create policy "testimonials_write_admin_only"
  on public.testimonials for all
  to authenticated
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

grant select, insert, update, delete on public.testimonials to service_role;
grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
