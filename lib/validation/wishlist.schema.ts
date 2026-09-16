import { z } from "zod";

// The user id always comes from the authenticated session (see
// lib/api/auth.ts), never from the request body — a client can never save
// an item on someone else's behalf.
export const addWishlistItemSchema = z.object({
  itemId: z.uuid("Invalid item id."),
});

export type AddWishlistItemInput = z.infer<typeof addWishlistItemSchema>;
