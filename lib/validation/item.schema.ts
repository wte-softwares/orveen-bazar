import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

// Descriptive attributes only — e.g. { label: "Size", value: "500ml" }.
// Never quantity, stock, SKU, or price; see AGENTS.md.
const variantSchema = z.object({
  label: z.string().trim().min(1, "Variant label is required.").max(60),
  value: z.string().trim().min(1, "Variant value is required.").max(120),
  sortOrder: z.number().int().min(0).default(0),
});

export const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  slug,
  type: z.enum(["product", "service"]),
  description: z.string().trim().max(4000).nullable().optional(),
  // Required per the brief ("Require title, slug, type, and valid
  // category") — the database also nullable-allows this column, but the
  // product requirement is stricter than the schema's floor.
  categoryId: z.uuid("Choose a category."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  // Set by calling POST /api/v1/uploads first (see lib/storage/upload.ts),
  // then passing back the returned `path` here — this route never accepts
  // raw file data itself.
  imagePath: z.string().nullable().optional(),
  variants: z.array(variantSchema).max(20).default([]),
});

export const updateItemSchema = createItemSchema.partial();

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemVariantInput = z.infer<typeof variantSchema>;
