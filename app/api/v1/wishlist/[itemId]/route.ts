import { getAuthContext } from "@/lib/api/auth";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ itemId: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { itemId } = await params;

    // Removing an item that was never saved, or was already removed, is a
    // harmless no-op — delete never errors on "not found" here.
    const { error } = await auth.supabase
      .from("wishlists")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("item_id", itemId);

    if (error) throw error;
    return ok({ removed: true });
  },
);
