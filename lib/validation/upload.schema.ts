import { z } from "zod";

export const requestUploadSchema = z.object({
  organizationId: z.uuid(),
  kind: z.enum(["items", "banners"]),
  // The item/banner id this image belongs to, or "new" for an item/banner
  // being created in the same flow (the editor requests an upload URL
  // before the row exists yet).
  ownerId: z.string().trim().min(1).max(60),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(100),
  fileSizeBytes: z.number().int().positive(),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;
