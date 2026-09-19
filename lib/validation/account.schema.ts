import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name must be at least 1 character long.")
    .max(100, "Display name cannot exceed 100 characters."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
