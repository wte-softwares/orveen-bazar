import { z } from "zod";

// Lowercase letters, digits, and hyphens only — matches how slugs are used
// in URLs (/catalog?category=slug) and keeps them predictable.
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug,
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Every field optional for an update — the route only writes what's present,
// but re-validates the same rules for anything that IS present.
export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
