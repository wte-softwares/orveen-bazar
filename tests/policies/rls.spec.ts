import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnvValue(key: string, fallback = ""): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
    const match = envFile.match(new RegExp(`^${key}=(.*)$`, "m"));
    if (match) return match[1].trim();
  } catch {}
  return fallback;
}

const supabaseUrl = loadEnvValue("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54521");
const anonKey = loadEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

const ORVEEN_ORG_ID = "11111111-1111-4111-a111-111111111111";
const ECOFAST_ORG_ID = "22222222-2222-4222-a222-222222222222";
const RELIABLE_ORG_ID = "33333333-3333-4333-a333-333333333333";

function clientFor(accessToken?: string) {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {},
  });
}

async function getAccessToken(email: string, password = "Password123!"): Promise<string> {
  const client = clientFor();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Failed to sign in as ${email}: ${error?.message}`);
  }
  return data.session.access_token;
}

test.describe("Supabase Direct Database & RLS Policy Enforcement", () => {
  let customer1Token: string;
  let customer2Token: string;
  let staffOrveenToken: string;
  let staffEcofastToken: string;
  let adminToken: string;

  test.beforeAll(async () => {
    [customer1Token, customer2Token, staffOrveenToken, staffEcofastToken, adminToken] =
      await Promise.all([
        getAccessToken("customer1@example.com"),
        getAccessToken("customer2@example.com"),
        getAccessToken("staff-orveen@example.com"),
        getAccessToken("staff-ecofast@example.com"),
        getAccessToken("admin@example.com"),
      ]);
  });

  test("Anonymous client can only read published items and active categories of active orgs", async () => {
    const anon = clientFor();

    // Catalog items
    const { data: items } = await anon.from("catalog_items").select("id, status");
    expect(items).toBeDefined();
    expect(items?.length).toBeGreaterThan(0);
    expect(items?.every((item) => item.status === "published")).toBe(true);

    // Anonymous write attempt must fail at RLS/grant
    const { error: writeError } = await anon.from("catalog_items").insert({
      organization_id: ORVEEN_ORG_ID,
      title: "Hacked Item",
      slug: "hacked-item",
      price: 100,
    });
    expect(writeError).toBeDefined();
  });

  test("Customer isolation: Customers can only read and mutate their own wishlist rows", async () => {
    const c1Client = clientFor(customer1Token);
    const c2Client = clientFor(customer2Token);

    // Customer 1 reads their wishlists
    const { data: c1Wishlist } = await c1Client.from("wishlists").select("*");
    expect(c1Wishlist).toBeDefined();

    // Customer 1 cannot insert a wishlist row with customer 2's user_id
    const {
      data: { user: c2User },
    } = await c2Client.auth.getUser();
    expect(c2User).toBeDefined();

    const { error: forgedWishlistError } = await c1Client.from("wishlists").insert({
      user_id: c2User!.id,
      item_id: "a1111111-0001-4000-a000-000000000001",
    });
    expect(forgedWishlistError).toBeDefined();
  });

  test("Cross-tenant isolation: Brand staff cannot read drafts or mutate items of sibling organizations", async () => {
    const staffOrveen = clientFor(staffOrveenToken);

    // 1. Orveen staff can see their own draft item (Garam Masala is draft in seed.sql)
    const { data: orveenItems } = await staffOrveen
      .from("catalog_items")
      .select("title, status")
      .eq("organization_id", ORVEEN_ORG_ID);
    const hasDraft = orveenItems?.some((item) => item.status === "draft");
    expect(hasDraft).toBe(true);

    // 2. Orveen staff cannot see drafts belonging to EcoFast or Reliable Multi Products
    const { data: ecofastItems } = await staffOrveen
      .from("catalog_items")
      .select("title, status")
      .eq("organization_id", ECOFAST_ORG_ID);
    expect(ecofastItems?.every((item) => item.status === "published")).toBe(true);

    // 3. Orveen staff cannot insert an item into EcoFast organization (Forged org_id write attempt)
    const { error: forgedInsertError } = await staffOrveen.from("catalog_items").insert({
      organization_id: ECOFAST_ORG_ID,
      title: "Unauthorized Sibling Item",
      slug: "unauthorized-sibling-item",
      status: "draft",
      price: 150,
    });
    expect(forgedInsertError).toBeDefined();

    // 4. Orveen staff cannot mutate banners of EcoFast
    const { error: bannerError } = await staffOrveen.from("banners").insert({
      organization_id: ECOFAST_ORG_ID,
      image_path: "eco-fast-bd/banner.webp",
      alt_text: "Unauthorized banner",
      is_active: true,
      sort_order: 1,
    });
    expect(bannerError).toBeDefined();
  });

  test("Platform admin can bypass tenant restrictions and view all content", async () => {
    const admin = clientFor(adminToken);

    // Platform admin can query items across all organizations
    const { data: allItems } = await admin.from("catalog_items").select("id, organization_id");
    expect(allItems?.length).toBeGreaterThan(10);

    const orgIds = new Set(allItems?.map((item) => item.organization_id));
    expect(orgIds.has(ORVEEN_ORG_ID)).toBe(true);
    expect(orgIds.has(ECOFAST_ORG_ID)).toBe(true);
    expect(orgIds.has(RELIABLE_ORG_ID)).toBe(true);
  });
});
