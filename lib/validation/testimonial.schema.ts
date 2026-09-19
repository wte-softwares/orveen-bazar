import { z } from "zod";

export const createTestimonialSchema = z.object({
  quoteBn: z.string().trim().min(1, "Bengali quote is required."),
  quoteEn: z.string().trim().min(1, "English quote is required."),
  nameBn: z.string().trim().min(1, "Bengali author name is required."),
  nameEn: z.string().trim().min(1, "English author name is required."),
  cityBn: z.string().trim().min(1, "Bengali city/location is required."),
  cityEn: z.string().trim().min(1, "English city/location is required."),
  avatarPath: z.string().trim().min(1, "Avatar image path is required."),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
