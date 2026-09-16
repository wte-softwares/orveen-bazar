// Creates the 5 test identities the brief's acceptance checklist and this
// project's Playwright/RLS policy tests are built around: 2 customers, 1
// platform admin, and one staff account each for two different
// organizations (to exercise cross-org isolation tests).
//
// This can't live in supabase/seed.sql: Supabase Auth needs its Admin API to
// produce a correctly password-hashed, correctly-linked account (a matching
// auth.identities row, etc.) — hand-crafting that in raw SQL is exactly the
// kind of auth-internals fragility this project avoids elsewhere.
//
// Run after `supabase db reset` (which seed.sql has already populated with
// the 3 organizations using fixed ids — see supabase/seed.sql):
//   node --env-file=.env.local scripts/seed-test-users.mjs
//
// Idempotent: safe to re-run after another db reset.

import { createClient } from "@supabase/supabase-js";

const ORVEEN_BAZAR_ORG_ID = "11111111-1111-4111-a111-111111111111";
const ECO_FAST_BD_ORG_ID = "22222222-2222-4222-a222-222222222222";
const TEST_PASSWORD = "Password123!";

const IDENTITIES = [
  { email: "customer1@example.com", displayName: "Test Customer One" },
  { email: "customer2@example.com", displayName: "Test Customer Two" },
  { email: "admin@example.com", displayName: "Test Platform Admin", platformAdmin: true },
  { email: "staff-orveen@example.com", displayName: "Test Staff — ORVEEN BAZAR", organizationId: ORVEEN_BAZAR_ORG_ID },
  { email: "staff-ecofast@example.com", displayName: "Test Staff — ECO FAST BD", organizationId: ECO_FAST_BD_ORG_ID },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
      "Run this with: node --env-file=.env.local scripts/seed-test-users.mjs",
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findExistingUserId(email) {
  // listUsers() has no email filter (see the same limitation noted in
  // app/api/v1/admin/users/route.ts) — fine for this handful of test users.
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email)?.id ?? null;
}

async function ensureUser(identity) {
  const existingId = await findExistingUserId(identity.email);
  if (existingId) {
    console.log(`  already exists: ${identity.email}`);
    return existingId;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: identity.email,
    password: TEST_PASSWORD,
    email_confirm: true, // skip the confirmation-email step for test accounts
    user_metadata: { display_name: identity.displayName },
  });
  if (error) throw error;
  console.log(`  created: ${identity.email}`);
  return data.user.id;
}

async function main() {
  console.log(`Seeding ${IDENTITIES.length} test identities (password: ${TEST_PASSWORD})...`);

  for (const identity of IDENTITIES) {
    const userId = await ensureUser(identity);

    if (identity.platformAdmin) {
      const { error } = await admin.from("platform_admins").upsert({ user_id: userId });
      if (error) throw error;
    }

    if (identity.organizationId) {
      const { error } = await admin
        .from("memberships")
        .upsert(
          { user_id: userId, organization_id: identity.organizationId, role: "staff" },
          { onConflict: "user_id,organization_id" },
        );
      if (error) throw error;
    }
  }

  console.log("Done. Test accounts (all use the same password):");
  for (const identity of IDENTITIES) {
    console.log(`  ${identity.email} / ${TEST_PASSWORD}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
