import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { createTestimonialSchema } from "@/lib/validation/testimonial.schema";
import { listAdminTestimonials } from "@/lib/queries/testimonials";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const testimonials = await listAdminTestimonials(auth.supabase);
  return ok(testimonials);
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const body = createTestimonialSchema.parse(await request.json());

  const { data, error } = await auth.supabase
    .from("testimonials")
    .insert({
      quote_bn: body.quoteBn,
      quote_en: body.quoteEn,
      name_bn: body.nameBn,
      name_en: body.nameEn,
      city_bn: body.cityBn,
      city_en: body.cityEn,
      avatar_path: body.avatarPath,
      sort_order: body.sortOrder,
      is_active: body.isActive,
    })
    .select("id, quote_bn, quote_en, name_bn, name_en, city_bn, city_en, avatar_path, sort_order, is_active, created_at, updated_at")
    .single();

  if (error) throw error;
  return ok(data, { status: 201 });
});
