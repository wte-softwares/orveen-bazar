-- The three sibling brands this platform serves. Every other managed
-- content table (categories, catalog_items, banners) scopes to one of these.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  -- Path of the brand logo inside the `org-public` storage bucket, set once
  -- the logo upload has gone through the publish pipeline (see
  -- lib/storage/publish.ts). Null until a logo has been published.
  logo_path text,
  contact_text text,
  -- Gates ALL public visibility of this organization's content, not just the
  -- organization row itself — every public RLS policy below checks the
  -- parent organization's is_active in addition to the row's own status.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is
  'The three brands (ORVEEN BAZAR, ECO FAST BD, RELIABLE MULTI PRODUCTS). Writes are platform-admin only — see RLS policies migration.';

create trigger set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();
