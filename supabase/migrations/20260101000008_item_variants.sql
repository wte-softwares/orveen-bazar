-- Descriptive attributes only (e.g. label = "Size", value = "500ml") — never
-- stock, quantity, SKU, or price. No organization_id column: visibility and
-- write access always derive from the parent catalog_items row via an
-- EXISTS join in RLS, so a variant's visibility "follows its parent item" by
-- construction rather than by keeping a second copy of org/status in sync.
create table public.item_variants (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.catalog_items (id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.item_variants is
  'Descriptive item attributes only. Visibility and write access follow the parent catalog_items row — see RLS policies.';

create index item_variants_item_id_idx on public.item_variants (item_id);
