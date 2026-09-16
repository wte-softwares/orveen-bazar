create table public.banners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Path in org-public once active (banners have no separate draft-preview
  -- state the way catalog items do, but go through the same publish
  -- pipeline for consistency — see docs/ARCHITECTURE.md).
  image_path text not null,
  alt_text text not null,
  -- Validated at the API layer as a safe relative path or same-origin/https
  -- URL — never trust this column to be safe to render as-is without that
  -- check having already run (lib/validation/banner.schema.ts).
  target_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.banners is
  'Per-organization promotional banners. Writable by staff of the owning organization, or a platform admin.';

create index banners_organization_active_idx
  on public.banners (organization_id, is_active);

create trigger set_updated_at
  before update on public.banners
  for each row
  execute function public.set_updated_at();
