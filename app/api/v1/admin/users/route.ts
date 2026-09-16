import { notImplemented } from "@/lib/api/response";

// GET  — list platform admins + org memberships. PLATFORM ADMIN ONLY.
// POST — grant a staff membership (user + organization) or platform-admin
// status. Writes go through lib/supabase/admin.ts (service-role) BEHIND an
// explicit is-platform-admin check — never trust RLS alone here, since
// memberships/platform_admins have zero client-writable policies by design
// (see docs/RLS_POLICIES.md) specifically so a compromised or buggy client
// path can't self-escalate.
export async function GET() {
  return notImplemented("GET /api/v1/admin/users");
}

export async function POST() {
  return notImplemented("POST /api/v1/admin/users");
}
