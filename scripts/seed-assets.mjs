// Generates and uploads placeholder imagery for local development: brand
// logos (real assets from the client's design), plus generated banner and
// product cover photos for every row supabase/seed.sql already created.
//
// This writes directly to the PUBLIC `org-public` bucket via the
// service-role client, skipping the normal draft -> publish pipeline
// (lib/storage/publish.ts) — that pipeline exists to protect real editorial
// content before an admin approves it, which doesn't apply to seed data
// that is, by construction, already "published" the moment it's inserted.
// Do not copy this shortcut into any real upload/publish code path.
//
// Run after `supabase db reset`:
//   node --env-file=.env.local scripts/seed-assets.mjs
//
// Idempotent: re-uploads (upsert) every time, safe to re-run.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
      "Run this with: node --env-file=.env.local scripts/seed-assets.mjs",
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BRANDS = {
  "11111111-1111-4111-a111-111111111111": { slug: "orveen-bazar", color: "#0057B8", soft: "#eef6ff", logo: "orveen-bazar.jpg" },
  "22222222-2222-4222-a222-222222222222": { slug: "eco-fast-bd", color: "#0EA5A5", soft: "#e8fafa", logo: "eco-fast-bd.jpg" },
  "33333333-3333-4333-a333-333333333333": { slug: "reliable-multi-products", color: "#1F9D55", soft: "#eafbf0", logo: "reliable-multi-products.jpg" },
};

async function uploadPublic(objectPath, buffer, contentType) {
  const { error } = await admin.storage
    .from("org-public")
    .upload(objectPath, buffer, { contentType, upsert: true });
  if (error) throw new Error(`upload failed for ${objectPath}: ${error.message}`);
}

/** A simple branded placeholder: solid brand-colour background, centered label. */
function placeholderSvg({ width, height, color, label, sub }) {
  const fontSize = Math.round(Math.min(width, height) * 0.09);
  const subSize = Math.round(fontSize * 0.5);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity="1" />
          <stop offset="1" stop-color="${color}" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${Math.min(width, height) * 0.28}" fill="#ffffff" opacity="0.08" />
      <text x="50%" y="50%" font-family="sans-serif" font-weight="700" font-size="${fontSize}"
            fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text>
      ${sub ? `<text x="50%" y="${50 + (fontSize / height) * 60}%" font-family="sans-serif" font-size="${subSize}" fill="#ffffff" opacity="0.85" text-anchor="middle">${sub}</text>` : ""}
    </svg>
  `);
}

async function main() {
  // ---- 1. Real brand logos (client-provided design assets) ----
  for (const [orgId, brand] of Object.entries(BRANDS)) {
    const filePath = path.join(here, "seed-assets", "logos", brand.logo);
    const bytes = await readFile(filePath);
    const objectPath = `${orgId}/logos/logo/cover.jpg`;
    await uploadPublic(objectPath, bytes, "image/jpeg");

    const { error } = await admin
      .from("organizations")
      .update({ logo_path: objectPath })
      .eq("id", orgId);
    if (error) throw error;
    console.log(`  logo: ${brand.slug}`);
  }

  // ---- 2. Banners (generated placeholders) ----
  const { data: banners, error: bannersError } = await admin
    .from("banners")
    .select("id, organization_id, image_path, alt_text");
  if (bannersError) throw bannersError;

  for (const banner of banners ?? []) {
    const brand = BRANDS[banner.organization_id];
    const svg = placeholderSvg({
      width: 1600,
      height: 500,
      color: brand?.color ?? "#0057B8",
      label: brand?.slug.toUpperCase().replace(/-/g, " ") ?? "BANNER",
      sub: banner.alt_text,
    });
    const jpeg = await sharp(svg).jpeg({ quality: 80 }).toBuffer();
    await uploadPublic(banner.image_path, jpeg, "image/jpeg");
  }
  console.log(`  banners: ${banners?.length ?? 0}`);

  // ---- 3. Product cover images (generated placeholders) ----
  const { data: items, error: itemsError } = await admin
    .from("catalog_items")
    .select("id, organization_id, title, item_images(image_path)");
  if (itemsError) throw itemsError;

  for (const item of items ?? []) {
    const imagePath = item.item_images?.[0]?.image_path;
    if (!imagePath) continue;
    const brand = BRANDS[item.organization_id];
    const svg = placeholderSvg({
      width: 800,
      height: 800,
      color: brand?.color ?? "#0057B8",
      label: item.title,
    });
    const jpeg = await sharp(svg).jpeg({ quality: 80 }).toBuffer();
    await uploadPublic(imagePath, jpeg, "image/jpeg");
  }
  console.log(`  product images: ${items?.length ?? 0}`);

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
