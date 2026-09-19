import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { getBrandConfig, SITE_CONFIG } from "@/lib/site-config";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);
    const brand = getBrandConfig(organization.slug);
    if (!brand) throw new Error(`No static configuration exists for organization: ${organization.slug}`);
    return ok({ id: organization.id, is_active: organization.is_active, ...brand, ...SITE_CONFIG });
  },
);
