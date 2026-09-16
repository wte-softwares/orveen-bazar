import { notImplemented } from "@/lib/api/response";

// DELETE — remove a saved item (owner-only; removing an item that was never
// saved, or was already removed, is a harmless no-op, not an error).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  await params;
  return notImplemented("DELETE /api/v1/wishlist/[itemId]");
}
