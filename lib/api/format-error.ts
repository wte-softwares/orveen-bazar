import type { ApiFailure } from "@/lib/api/response";

/**
 * Auth/account forms show one error line, not a per-field list — so when the
 * API returns a 422 with `error.fields` (see withApiHandler in
 * lib/api/errors.ts), surface the first field's actual message ("Password
 * must be at least 8 characters.") instead of the generic wrapper message
 * ("Some fields need attention.") that the field map exists to explain.
 */
export function formatApiError(body: Partial<ApiFailure> | null | undefined, fallback: string): string {
  const fields = body?.error?.fields;
  if (fields) {
    const first = Object.values(fields)[0];
    if (first) return first;
  }
  return body?.error?.message ?? fallback;
}
