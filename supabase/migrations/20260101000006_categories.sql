create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

comment on table public.categories is
  'Per-organization product/service categories. Writable by staff of the owning organization, or a platform admin.';

create index categories_organization_active_idx
  on public.categories (organization_id, is_active);

create trigger set_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();
