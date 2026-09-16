/**
 * Builds a public URL for an object in the `org-public` bucket from its
 * stored path. Pure string formatting — no network call, no Supabase client
 * needed — so it's safe to call from Server Components, Route Handlers, and
 * Client Components alike, unlike lib/storage/publish.ts's
 * `getPublicAssetUrl` (which needs a client instance in hand already).
 */
export function publicAssetUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-public/${path}`;
}
