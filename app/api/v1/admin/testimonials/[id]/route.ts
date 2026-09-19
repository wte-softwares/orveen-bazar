import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { updateTestimonialSchema } from "@/lib/validation/testimonial.schema";
import { ok } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();
    await requirePlatformAdmin(auth);

    const { id } = await params;
    const body = updateTestimonialSchema.parse(await request.json());

    const { data: existing, error: fetchError } = await auth.supabase
      .from("testimonials")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Testimonial not found.");

    const updates: TestimonialUpdate = {};
    if (body.quoteBn !== undefined) updates.quote_bn = body.quoteBn;
    if (body.quoteEn !== undefined) updates.quote_en = body.quoteEn;
    if (body.nameBn !== undefined) updates.name_bn = body.nameBn;
    if (body.nameEn !== undefined) updates.name_en = body.nameEn;
    if (body.cityBn !== undefined) updates.city_bn = body.cityBn;
    if (body.cityEn !== undefined) updates.city_en = body.cityEn;
    if (body.avatarPath !== undefined) updates.avatar_path = body.avatarPath;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const { data: updated, error } = await auth.supabase
      .from("testimonials")
      .update(updates)
      .eq("id", id)
      .select("id, quote_bn, quote_en, name_bn, name_en, city_bn, city_en, avatar_path, sort_order, is_active, created_at, updated_at")
      .single();

    if (error) throw error;
    return ok(updated);
  },
);

export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();
    await requirePlatformAdmin(auth);

    const { id } = await params;

    const { data: existing, error: fetchError } = await auth.supabase
      .from("testimonials")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Testimonial not found.");

    // Deactivate rather than hard-deleting
    const { error } = await auth.supabase
      .from("testimonials")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return ok({ deactivated: true });
  },
);
