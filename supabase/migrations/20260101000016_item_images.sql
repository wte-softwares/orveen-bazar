-- A product's image gallery — zero or more images, ordered, each item's
-- COVER image being whichever has the lowest sort_order (convention, not a
-- separate flag: keeps the API simple — "first in the list is the cover").
--
-- No organization_id column, same reasoning as item_variants: visibility
-- and write access always derive from the parent catalog_items row via an
-- EXISTS join in RLS, so this table's rules are copy-pasted from that
-- table's migration almost verbatim — see
-- supabase/migrations/20260101000012_rls_policies.sql for the original.
create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.catalog_items (id) on delete cascade,
  -- Path in the (private) org-drafts bucket while the item is a draft,
  -- copied into the public org-public bucket by lib/storage/publish.ts when
  -- the item is published — same pipeline as the single-image tables
  -- (banners, organization logos), just looped over each row here.
  image_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.item_images is
  'A catalog item''s image gallery. Lowest sort_order is the cover image by convention. Visibility and write access follow the parent catalog_items row — see RLS policies below.';

create index item_images_item_id_idx on public.item_images (item_id);

alter table public.item_images enable row level security;

create policy "item_images_select_follows_item"
  on public.item_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      join public.organizations o on o.id = ci.organization_id
      where ci.id = item_images.item_id
        and (
          (ci.status = 'published' and o.is_active)
          or public.is_platform_admin(auth.uid())
          or public.has_org_membership(auth.uid(), ci.organization_id)
        )
    )
  );

create policy "item_images_insert_follows_item"
  on public.item_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_images.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

-- Same "re-validate the NEW item_id" note as item_variants' update policy:
-- this stops a staff member from reassigning an image to an item in another
-- organization by changing item_id on an update.
create policy "item_images_update_follows_item"
  on public.item_images for update
  to authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_images.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_images.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

create policy "item_images_delete_follows_item"
  on public.item_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_images.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

-- Explicit grants — see docs/RLS_POLICIES.md and AGENTS.md rule #3: RLS
-- alone is not enough, this Supabase config does not auto-expose new tables.
grant select on public.item_images to anon, authenticated;
grant insert, update, delete on public.item_images to authenticated;
grant select, insert, update, delete on public.item_images to service_role;
