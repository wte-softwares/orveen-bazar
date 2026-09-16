import { z } from "zod";

/**
 * Banner links render as-is on the public site, so `target_url` must never
 * accept a dangerous scheme (e.g. `javascript:`, `data:`). Allowed:
 *   - a site-relative path starting with "/" (e.g. "/catalog")
 *   - an absolute https:// URL
 * Rejects everything else, including bare "http://" (banners should always
 * link somewhere secure) and scheme-relative "//" URLs (ambiguous host).
 */
const safeTargetUrl = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith("/") || /^https:\/\//i.test(value),
    "Link must be a relative path (starting with /) or an https:// URL.",
  );

export const createBannerSchema = z.object({
  imagePath: z.string().min(1, "An image is required."),
  altText: z.string().trim().min(1, "Alt text is required for accessibility.").max(200),
  targetUrl: safeTargetUrl.nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
