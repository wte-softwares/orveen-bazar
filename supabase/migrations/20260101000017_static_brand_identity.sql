-- Brand identity is versioned application configuration in lib/site-config.ts.
-- Keep this operational registry free of editable presentation data so
-- memberships and tenant isolation remain database concerns only.
alter table public.organizations
  drop column if exists logo_path,
  drop column if exists contact_text,
  drop column if exists description,
  drop column if exists name;
