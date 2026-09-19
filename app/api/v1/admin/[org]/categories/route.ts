import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { createCategorySchema } from "@/lib/validation/category.schema";
import { ok } from "@/lib/api/response";
import { ConflictError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { data, error } = await auth.supabase
      .from("categories")
      .select("id, slug, name, sort_order, is_active, created_at, updated_at, catalog_items(count)")
      .eq("organization_id", organization.id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const formatted = (data ?? []).map((row) => {
      const rawCount = row.catalog_items as unknown as Array<{ count: number }> | null;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        sort_order: row.sort_order,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        item_count: rawCount?.[0]?.count ?? 0,
      };
    });

    return ok(formatted);
  },
);

export const POST = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = createCategorySchema.parse(await request.json());

    const { data, error } = await auth.supabase
      .from("categories")
      .insert({
        organization_id: organization.id,
        name: body.name,
        slug: body.slug,
        sort_order: body.sortOrder,
        is_active: body.isActive,
      })
      .select("id, slug, name, sort_order, is_active, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ConflictError("A category with this slug already exists for this brand.");
      }
      throw error;
    }

    return ok(data, { status: 201 });
  },
);
