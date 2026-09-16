import { z } from "zod";

// Brand settings — logo, name, introduction, contact text. Admin-only writes
// (see lib/api/org-guard.ts's requirePlatformAdmin and docs/RLS_POLICIES.md).
// `slug` is intentionally not editable here: it's part of every public URL
// under this organization, and changing it would break existing links.
export const updateOrganizationSettingsSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required.").max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  contactText: z.string().trim().max(2000).nullable().optional(),
  // Set by the publish pipeline after a logo upload — not accepted as a
  // free-text field from the client, but declared here so the same schema
  // documents the full shape of what a GET returns.
  logoPath: z.string().nullable().optional(),
});

export type UpdateOrganizationSettingsInput = z.infer<
  typeof updateOrganizationSettingsSchema
>;
