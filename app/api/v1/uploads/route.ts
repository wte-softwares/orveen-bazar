import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccessById } from "@/lib/api/org-guard";
import { requestUploadSchema } from "@/lib/validation/upload.schema";
import { buildDraftAssetPath, createSignedDraftUploadUrl } from "@/lib/storage/upload";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const body = requestUploadSchema.parse(await request.json());
  await requireOrgAccessById(auth, body.organizationId);

  const path = buildDraftAssetPath(body.organizationId, body.kind, body.ownerId, body.fileName);
  const signed = await createSignedDraftUploadUrl(
    auth.supabase,
    path,
    body.contentType,
    body.fileSizeBytes,
  );

  return ok({ path: signed.path, token: signed.token, signedUrl: signed.signedUrl });
});
