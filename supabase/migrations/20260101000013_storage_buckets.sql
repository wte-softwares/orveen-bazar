-- Two buckets — see docs/ARCHITECTURE.md ("Storage strategy") for why:
--   org-drafts  (private) — every upload lands here first, staff/admin only.
--   org-public  (public)  — populated by a COPY, never a direct upload, only
--                           when the owning row is published/active. This is
--                           what guarantees draft media is never publicly
--                           reachable before publish.
--
-- Both buckets restrict uploads to common image types and a 5 MiB cap — the
-- brief requires validating "image type/size," and this is the hard
-- database-level guarantee behind the same check in lib/storage/upload.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('org-drafts', 'org-drafts', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('org-public', 'org-public', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']);

-- Objects in both buckets are stored at
-- {organization_id}/{item|banner|logo}/{id}/{filename} — storage.foldername
-- splits the object path into folder segments, so segment [1] is always the
-- organization_id for every object this app creates.

-- --------------------------------------------------------------- org-drafts
-- Staff of the owning organization, or a platform admin, may read/write
-- their own organization's drafts. No public access at all.
create policy "org_drafts_all_staff_or_admin"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'org-drafts'
    and (
      public.is_platform_admin(auth.uid())
      or public.has_org_membership(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  )
  with check (
    bucket_id = 'org-drafts'
    and (
      public.is_platform_admin(auth.uid())
      or public.has_org_membership(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  );

-- --------------------------------------------------------------- org-public
-- World-readable, matching the bucket's own `public = true` flag (which
-- already serves objects through the public CDN URL without RLS — this
-- policy just keeps the authenticated Storage API's list/download calls
-- consistent with that).
create policy "org_public_select_anyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'org-public');

-- Deliberately NO insert/update/delete policy for anon/authenticated on
-- org-public: objects only ever land here via lib/storage/publish.ts using
-- the service-role client (lib/supabase/admin.ts), which bypasses RLS
-- entirely. A client — staff included — can never write to this bucket
-- directly; publishing happens by calling the item/banner/settings API,
-- not by uploading to this bucket.
