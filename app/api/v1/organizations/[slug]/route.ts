import { createClient } from "@/lib/supabase/server";
import { findActiveOrganizationBySlug } from "@/lib/queries/brands";
import { ok } from "@/lib/api/response";
import { NotFoundError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(
  async (_request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const supabase = await createClient();
    const organization = await findActiveOrganizationBySlug(supabase, slug);

    if (!organization) throw new NotFoundError("Organization not found.");
    return ok(organization);
  },
);
