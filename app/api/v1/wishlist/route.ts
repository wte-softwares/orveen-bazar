import { getAuthContext } from "@/lib/api/auth";
import { addWishlistItemSchema } from "@/lib/validation/wishlist.schema";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

const WISHLIST_ITEM_COLUMNS =
  "created_at, item:catalog_items(id, slug, title, image_path, status, organization:organizations(slug, name, is_active))";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const { data, error } = await auth.supabase
    .from("wishlists")
    .select(WISHLIST_ITEM_COLUMNS)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // An item can become unpublished/archived, or its organization
  // deactivated, after being saved — the brief requires explaining or
  // safely handling this rather than showing a broken link. Surface it as
  // an `unavailable` flag instead of silently hiding the row, so the UI can
  // tell the user why an item disappeared and still offer to remove it.
  const items = (data ?? []).map((row) => ({
    ...row,
    unavailable:
      !row.item ||
      row.item.status !== "published" ||
      !row.item.organization?.is_active,
  }));

  return ok(items);
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const body = addWishlistItemSchema.parse(await request.json());

  // Idempotent by design: a duplicate save must be harmless, never an
  // error. ignoreDuplicates relies on the (user_id, item_id) primary key —
  // see supabase/migrations/20260101000010_wishlists.sql.
  const { error } = await auth.supabase
    .from("wishlists")
    .upsert(
      { user_id: auth.user.id, item_id: body.itemId },
      { onConflict: "user_id,item_id", ignoreDuplicates: true },
    );

  if (error) throw error;
  return ok({ saved: true }, { status: 201 });
});
