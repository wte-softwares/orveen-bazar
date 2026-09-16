import { notImplemented } from "@/lib/api/response";

// GET  — the signed-in user's saved items (owner-only, via lib/api/auth.ts).
// POST — save an item; must be idempotent (DB `on conflict do nothing`) so a
// duplicate save is silently harmless, never a 409/500.
export async function GET() {
  return notImplemented("GET /api/v1/wishlist");
}

export async function POST() {
  return notImplemented("POST /api/v1/wishlist");
}
