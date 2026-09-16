-- Row Level Security policies for every table above. RLS is enabled here in
-- the SAME migration that will run immediately after every table exists —
-- there is no window where a table is live without RLS turned on.
--
-- Policies are written one-command-per-policy (separate `for select`,
-- `for insert`, `for update`, `for delete`) rather than `for all`, on
-- purpose: Postgres OR-combines multiple permissive policies that apply to
-- the same command, so a `for all` policy would silently widen a table's
-- SELECT policy the moment both existed. Explicit, single-command policies
-- keep each grant auditable in isolation. See docs/RLS_POLICIES.md for the
-- narrative version of everything below.

-- ============================================================ organizations
alter table public.organizations enable row level security;

create policy "organizations_select_public_or_member"
  on public.organizations for select
  to anon, authenticated
  using (
    is_active
    or public.is_platform_admin(auth.uid())
    or public.has_org_membership(auth.uid(), id)
  );

create policy "organizations_insert_admin_only"
  on public.organizations for insert
  to authenticated
  with check (public.is_platform_admin(auth.uid()));

create policy "organizations_update_admin_only"
  on public.organizations for update
  to authenticated
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy "organizations_delete_admin_only"
  on public.organizations for delete
  to authenticated
  using (public.is_platform_admin(auth.uid()));

-- =================================================================== profiles
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Deliberately no INSERT policy for anon/authenticated: rows are created
-- only by the handle_new_user trigger (migration 000003), which runs as the
-- migration owner and bypasses RLS. A client can never create its own
-- profile row directly.

-- ============================================================ platform_admins
alter table public.platform_admins enable row level security;

-- No policies at all for anon/authenticated, on purpose: this table is
-- managed exclusively by the service-role client (lib/supabase/admin.ts)
-- behind a platform-admin-gated API route. With RLS enabled and zero
-- policies, every client-role query against it returns/affects zero rows.

-- ================================================================ memberships
alter table public.memberships enable row level security;

create policy "memberships_select_own_or_admin"
  on public.memberships for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_platform_admin(auth.uid())
  );

create policy "memberships_insert_admin_only"
  on public.memberships for insert
  to authenticated
  with check (public.is_platform_admin(auth.uid()));

create policy "memberships_update_admin_only"
  on public.memberships for update
  to authenticated
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy "memberships_delete_admin_only"
  on public.memberships for delete
  to authenticated
  using (public.is_platform_admin(auth.uid()));

-- ================================================================= categories
alter table public.categories enable row level security;

create policy "categories_select_public_or_staff"
  on public.categories for select
  to anon, authenticated
  using (
    (
      is_active
      and exists (
        select 1 from public.organizations o
        where o.id = categories.organization_id and o.is_active
      )
    )
    or public.is_platform_admin(auth.uid())
    or public.has_org_membership(auth.uid(), organization_id)
  );

create policy "categories_insert_staff_or_admin"
  on public.categories for insert
  to authenticated
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "categories_update_staff_or_admin"
  on public.categories for update
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  )
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "categories_delete_staff_or_admin"
  on public.categories for delete
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

-- =============================================================== catalog_items
alter table public.catalog_items enable row level security;

create policy "catalog_items_select_published_or_staff"
  on public.catalog_items for select
  to anon, authenticated
  using (
    (
      status = 'published'
      and exists (
        select 1 from public.organizations o
        where o.id = catalog_items.organization_id and o.is_active
      )
    )
    or public.is_platform_admin(auth.uid())
    or public.has_org_membership(auth.uid(), organization_id)
  );

create policy "catalog_items_insert_staff_or_admin"
  on public.catalog_items for insert
  to authenticated
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "catalog_items_update_staff_or_admin"
  on public.catalog_items for update
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  )
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "catalog_items_delete_staff_or_admin"
  on public.catalog_items for delete
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

-- =============================================================== item_variants
alter table public.item_variants enable row level security;

-- No organization_id column here — every check joins back to the parent
-- catalog_items row, so a variant's visibility/writability "follows its
-- parent item" by construction (see docs/DATA_MODEL.md).
create policy "item_variants_select_follows_item"
  on public.item_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      join public.organizations o on o.id = ci.organization_id
      where ci.id = item_variants.item_id
        and (
          (ci.status = 'published' and o.is_active)
          or public.is_platform_admin(auth.uid())
          or public.has_org_membership(auth.uid(), ci.organization_id)
        )
    )
  );

create policy "item_variants_insert_follows_item"
  on public.item_variants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_variants.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

-- IMPORTANT: this WITH CHECK re-evaluates against item_variants.item_id
-- AFTER the update — i.e. the NEW value — not the row's pre-update
-- association. That is what stops a staff member from reassigning a variant
-- to an item in another organization by changing item_id on an update; a
-- USING-only check would validate the OLD row and miss this.
create policy "item_variants_update_follows_item"
  on public.item_variants for update
  to authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_variants.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_variants.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

create policy "item_variants_delete_follows_item"
  on public.item_variants for delete
  to authenticated
  using (
    exists (
      select 1 from public.catalog_items ci
      where ci.id = item_variants.item_id
        and (
          public.has_org_membership(auth.uid(), ci.organization_id)
          or public.is_platform_admin(auth.uid())
        )
    )
  );

-- ===================================================================== banners
alter table public.banners enable row level security;

create policy "banners_select_active_or_staff"
  on public.banners for select
  to anon, authenticated
  using (
    (
      is_active
      and exists (
        select 1 from public.organizations o
        where o.id = banners.organization_id and o.is_active
      )
    )
    or public.is_platform_admin(auth.uid())
    or public.has_org_membership(auth.uid(), organization_id)
  );

create policy "banners_insert_staff_or_admin"
  on public.banners for insert
  to authenticated
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "banners_update_staff_or_admin"
  on public.banners for update
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  )
  with check (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

create policy "banners_delete_staff_or_admin"
  on public.banners for delete
  to authenticated
  using (
    public.has_org_membership(auth.uid(), organization_id)
    or public.is_platform_admin(auth.uid())
  );

-- =================================================================== wishlists
alter table public.wishlists enable row level security;

create policy "wishlists_select_own"
  on public.wishlists for select
  to authenticated
  using (auth.uid() = user_id);

create policy "wishlists_insert_own"
  on public.wishlists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "wishlists_delete_own"
  on public.wishlists for delete
  to authenticated
  using (auth.uid() = user_id);

-- No UPDATE policy: wishlist rows are immutable — remove and re-add instead
-- of editing one in place.
