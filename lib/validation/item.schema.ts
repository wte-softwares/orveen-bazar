import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

// Descriptive attributes only — e.g. { label: "Size", value: "500ml" }.
// Never quantity, stock, or SKU; see AGENTS.md.
const variantSchema = z.object({
  label: z.string().trim().min(1, "Variant label is required.").max(60),
  value: z.string().trim().min(1, "Variant value is required.").max(120),
  sortOrder: z.number().int().min(0).default(0),
});

// One entry per gallery image. `path` is set by calling POST /api/v1/uploads
// first (see lib/storage/upload.ts), then passing the returned `path` back
// here — this route never accepts raw file data itself. The first entry
// (sortOrder 0, or simply array position 0 if ties) is the cover image by
// convention — see supabase/migrations/20260101000016_item_images.sql.
const imageSchema = z.object({
  path: z.string().min(1),
  altText: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const money = z.number().nonnegative().max(9_999_999.99);

export const createItemSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160),
    slug,
    type: z.enum(["product", "service"]),
    description: z.string().trim().max(4000).nullable().optional(),
    // Required per the brief ("Require title, slug, type, and valid
    // category") — the database also nullable-allows this column, but the
    // product requirement is stricter than the schema's floor.
    categoryId: z.uuid("Choose a category."),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    // Display-only — see AGENTS.md. Nothing in the app computes with these;
    // they're stored and rendered as-is.
    price: money,
    compareAtPrice: money.nullable().optional(),
    images: z.array(imageSchema).max(10).default([]),
    variants: z.array(variantSchema).max(20).default([]),
  })
  // Mirrors the database's own check (catalog_items_compare_at_price_check)
  // for a clean 422 instead of a raw constraint-violation error — the
  // database constraint remains the actual guarantee.
  .refine((value) => value.compareAtPrice == null || value.compareAtPrice >= value.price, {
    message: "Compare-at price must be greater than or equal to the price.",
    path: ["compareAtPrice"],
  });

// `.partial()` isn't available after `.refine()`, so the update schema is
// declared separately with every field optional, plus the same cross-field
// check applied only when both values are actually present in this request.
export const updateItemSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160).optional(),
    slug: slug.optional(),
    type: z.enum(["product", "service"]).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    categoryId: z.uuid("Choose a category.").optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    price: money.optional(),
    compareAtPrice: money.nullable().optional(),
    images: z.array(imageSchema).max(10).optional(),
    variants: z.array(variantSchema).max(20).optional(),
  })
  .refine(
    (value) =>
      value.compareAtPrice == null || value.price == null || value.compareAtPrice >= value.price,
    {
      message: "Compare-at price must be greater than or equal to the price.",
      path: ["compareAtPrice"],
    },
  );

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemVariantInput = z.infer<typeof variantSchema>;
export type ItemImageInput = z.infer<typeof imageSchema>;
