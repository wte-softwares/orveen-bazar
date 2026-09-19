import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { updateCategorySchema } from "@/lib/validation/category.schema";
import { ok } from "@/lib/api/response";
import { ConflictError, NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = updateCategorySchema.parse(await request.json());

    const updates: CategoryUpdate = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const { data, error } = await auth.supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .eq("organization_id", organization.id)
      .select("id, slug, name, sort_order, is_active, created_at, updated_at")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        throw new ConflictError("A category with this slug already exists for this brand.");
      }
      throw error;
    }
    if (!data) throw new NotFoundError("Category not found.");

    return ok(data);
  },
);

export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);

    // Friendly pre-check ahead of the database's ON DELETE RESTRICT
    // constraint (catalog_items.category_id -> categories.id) — turns a raw
    // foreign-key-violation 500 into a clear 409 with an actionable message.
    const { count, error: countError } = await auth.supabase
      .from("catalog_items")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) throw countError;
    if (count && count > 0) {
      throw new ConflictError(
        `This category is used by ${count} item(s) and can't be deleted. Move or archive them first.`,
      );
    }

    const { error, count: deletedCount } = await auth.supabase
      .from("categories")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("organization_id", organization.id);

    if (error) throw error;
    if (!deletedCount) throw new NotFoundError("Category not found.");

    return ok({ deleted: true });
  },
);
