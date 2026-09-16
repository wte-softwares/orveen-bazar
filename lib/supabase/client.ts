import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client"). Safe to call
 * from browser code: it only ever uses the publishable key, which is
 * protected by Row Level Security, never the secret key.
 *
 * Create one instance per component tree with `createClient()` rather than
 * sharing a module-level singleton across the whole app — this matches
 * Supabase's documented App Router guidance and avoids stale auth state
 * across client-side navigations.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
