-- Products and services, treated identically apart from `type`. NEVER add a
-- stock/quantity/price column here — this platform has no transactional
-- e-commerce functionality by design (see AGENTS.md).
create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- ON DELETE RESTRICT (not cascade): the brief requires blocking category
  -- deletion while any item still references it. The API pre-checks this
  -- for a friendly 409, but this constraint is the actual guarantee.
  category_id uuid references public.categories (id) on delete restrict,
  type text not null check (type in ('product', 'service')),
  title text not null,
  slug text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  -- Path in the (private) org-drafts bucket while draft, copied into the
  -- public org-public bucket by lib/storage/publish.ts on publish. See
  -- docs/ARCHITECTURE.md, "Storage strategy".
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

comment on table public.catalog_items is
  'Products/services. No stock, quantity, or price columns — descriptive only. Writable by staff of the owning organization, or a platform admin.';

create index catalog_items_organization_status_idx
  on public.catalog_items (organization_id, status);

-- Partial index for the hottest public read path: "published items in this
-- organization." Every anonymous catalog query filters on exactly this.
create index catalog_items_published_idx
  on public.catalog_items (organization_id)
  where status = 'published';

create index catalog_items_category_id_idx
  on public.catalog_items (category_id);

create trigger set_updated_at
  before update on public.catalog_items
  for each row
  execute function public.set_updated_at();

-- Cross-tenant integrity: a category from Brand A must never be assignable
-- to an item belonging to Brand B (the brief calls this out explicitly).
-- Enforced as a trigger rather than a composite-FK-plus-duplicate-column
-- trick, because a trigger with an explicit RAISE EXCEPTION message is more
-- auditable — a future reader doesn't have to reverse-engineer why a
-- redundant organization_id column exists on categories' foreign key.
--
-- This is the hard database-level guarantee. lib/validation/item.schema.ts
-- duplicates the same check at the API layer so a mismatch returns a clean
-- 422 instead of this trigger's raw exception reaching the client.
create or replace function public.enforce_item_category_same_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  category_org_id uuid;
begin
  if new.category_id is null then
    return new;
  end if;

  select organization_id into category_org_id
  from public.categories
  where id = new.category_id;

  if category_org_id is distinct from new.organization_id then
    raise exception
      'category % belongs to a different organization than item %',
      new.category_id, coalesce(new.id, gen_random_uuid())
      using errcode = '23514'; -- check_violation, consistent with other data-integrity failures
  end if;

  return new;
end;
$$;

comment on function public.enforce_item_category_same_organization() is
  'Blocks assigning a category to an item outside that category''s organization. See docs/DATA_MODEL.md.';

create trigger enforce_item_category_same_organization
  before insert or update of category_id, organization_id on public.catalog_items
  for each row
  execute function public.enforce_item_category_same_organization();
