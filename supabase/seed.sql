-- Sample content for local development and the Playwright/policy test
-- suites: the 3 named organizations, and categories/items/banners within
-- the brief's stated allowance (8 categories / 20 items / 6 banners
-- combined — a soft guideline, not an enforced limit). Runs automatically
-- on `supabase db reset` (see supabase/config.toml, [db.seed]).
--
-- Organizations/categories/items/banners use fixed, RFC 4122
-- version-4-shaped ids (version nibble '4', variant nibble 'a') so
-- `scripts/seed-test-users.mjs` and `scripts/seed-assets.mjs` can attach
-- memberships/images to them without an extra lookup, AND so they pass the
-- same strict `z.uuid()` validation real request payloads go through — a
-- cosmetically "nice" but non-v4 id (e.g. ending in all zeros) would be
-- rejected by lib/validation/*.schema.ts even though Postgres itself
-- doesn't care about UUID version bits.
--
-- Auth users can't be created here (see scripts/seed-test-users.mjs), and
-- neither can real images (see scripts/seed-assets.mjs) — both need an
-- API/Admin client, which plain SQL doesn't have. Run both after this file
-- applies: `npm run db:seed:users && npm run db:seed:assets`.

insert into public.organizations (id, slug, name, description, contact_text, is_active) values
  ('11111111-1111-4111-a111-111111111111', 'orveen-bazar', 'ORVEEN BAZAR.COM',
   'Everyday FMCG staples — oil, rice, lentils, spices, and household essentials.',
   'orveenbazzar@gmail.com · WhatsApp +8801335189426', true),
  ('22222222-2222-4222-a222-222222222222', 'eco-fast-bd', 'ECO FAST BD',
   'Eco-friendly cleaning and household products.',
   'contact@ecofastbd.example', true),
  ('33333333-3333-4333-a333-333333333333', 'reliable-multi-products', 'RELIABLE MULTI PRODUCTS',
   'General trading and multi-category consumer goods.',
   'contact@reliablemultiproducts.example', true);

-- --------------------------------------------------------------- categories
insert into public.categories (id, organization_id, name, slug, sort_order) values
  ('c1111111-0001-4000-a000-000000000001', '11111111-1111-4111-a111-111111111111', 'Cooking Oil', 'cooking-oil', 1),
  ('c1111111-0002-4000-a000-000000000002', '11111111-1111-4111-a111-111111111111', 'Rice & Grains', 'rice-grains', 2),
  ('c1111111-0003-4000-a000-000000000003', '11111111-1111-4111-a111-111111111111', 'Spices', 'spices', 3),
  ('c2222222-0001-4000-a000-000000000001', '22222222-2222-4222-a222-222222222222', 'Cleaning Supplies', 'cleaning-supplies', 1),
  ('c2222222-0002-4000-a000-000000000002', '22222222-2222-4222-a222-222222222222', 'Laundry Care', 'laundry-care', 2),
  ('c3333333-0001-4000-a000-000000000001', '33333333-3333-4333-a333-333333333333', 'Home Essentials', 'home-essentials', 1),
  ('c3333333-0002-4000-a000-000000000002', '33333333-3333-4333-a333-333333333333', 'Personal Care', 'personal-care', 2),
  ('c3333333-0003-4000-a000-000000000003', '33333333-3333-4333-a333-333333333333', 'Stationery', 'stationery', 3);

-- ------------------------------------------------------------------- items
-- 20 total across the three brands, all published (bar one draft, to
-- exercise the "staff sees drafts, public doesn't" RLS case). price/
-- compare_at_price are display-only (see AGENTS.md) — nothing computes with
-- them; compare_at_price is set on a few items to exercise the "was/now"
-- display case.
insert into public.catalog_items (id, organization_id, category_id, type, title, slug, description, status, price, compare_at_price) values
  ('a1111111-0001-4000-a000-000000000001', '11111111-1111-4111-a111-111111111111', 'c1111111-0001-4000-a000-000000000001', 'product', 'Soybean Oil', 'soybean-oil', 'Refined soybean cooking oil.', 'published', 189.00, 210.00),
  ('a1111111-0002-4000-a000-000000000002', '11111111-1111-4111-a111-111111111111', 'c1111111-0001-4000-a000-000000000001', 'product', 'Mustard Oil', 'mustard-oil', 'Cold-pressed mustard oil.', 'published', 175.00, null),
  ('a1111111-0003-4000-a000-000000000003', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Premium Miniket Rice', 'premium-miniket-rice', 'Fine-grain miniket rice.', 'published', 410.00, null),
  ('a1111111-0004-4000-a000-000000000004', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Red Lentils', 'red-lentils', 'Split red lentils (masoor dal).', 'published', 145.00, 160.00),
  ('a1111111-0005-4000-a000-000000000005', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Wheat Flour', 'wheat-flour', 'Fine wheat flour (atta).', 'published', 62.00, null),
  ('a1111111-0006-4000-a000-000000000006', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Turmeric Powder', 'turmeric-powder', 'Ground turmeric.', 'published', 45.00, null),
  ('a1111111-0007-4000-a000-000000000007', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Cumin Powder', 'cumin-powder', 'Ground cumin.', 'published', 90.00, null),
  ('a1111111-0008-4000-a000-000000000008', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Garam Masala', 'garam-masala', 'Blended whole-spice mix.', 'draft', 120.00, null),
  ('a2222222-0001-4000-a000-000000000001', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Multi-Surface Cleaner', 'multi-surface-cleaner', 'Plant-based multi-surface cleaner.', 'published', 180.00, 210.00),
  ('a2222222-0002-4000-a000-000000000002', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Glass Cleaner', 'glass-cleaner', 'Streak-free glass cleaner.', 'published', 150.00, null),
  ('a2222222-0003-4000-a000-000000000003', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Dish Wash Liquid', 'dish-wash-liquid', 'Grease-cutting dish soap.', 'published', 130.00, null),
  ('a2222222-0004-4000-a000-000000000004', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'product', 'Laundry Detergent Powder', 'laundry-detergent-powder', 'Concentrated detergent powder.', 'published', 220.00, 245.00),
  ('a2222222-0005-4000-a000-000000000005', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'product', 'Fabric Softener', 'fabric-softener', 'Long-lasting fabric softener.', 'published', 190.00, null),
  ('a2222222-0006-4000-a000-000000000006', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'service', 'Bulk Laundry Supply Consultation', 'bulk-laundry-supply-consultation', 'Advisory service for institutional laundry supply planning.', 'published', 500.00, null),
  ('a3333333-0001-4000-a000-000000000001', '33333333-3333-4333-a333-333333333333', 'c3333333-0001-4000-a000-000000000001', 'product', 'LED Bulb 9W', 'led-bulb-9w', 'Energy-saving LED bulb.', 'published', 150.00, null),
  ('a3333333-0002-4000-a000-000000000002', '33333333-3333-4333-a333-333333333333', 'c3333333-0001-4000-a000-000000000001', 'product', 'Extension Cord', 'extension-cord', 'Multi-socket extension cord.', 'published', 350.00, 400.00),
  ('a3333333-0003-4000-a000-000000000003', '33333333-3333-4333-a333-333333333333', 'c3333333-0002-4000-a000-000000000002', 'product', 'Herbal Soap', 'herbal-soap', 'Natural herbal bathing soap.', 'published', 60.00, null),
  ('a3333333-0004-4000-a000-000000000004', '33333333-3333-4333-a333-333333333333', 'c3333333-0002-4000-a000-000000000002', 'product', 'Toothpaste', 'toothpaste', 'Fluoride toothpaste, mint flavour.', 'published', 85.00, null),
  ('a3333333-0005-4000-a000-000000000005', '33333333-3333-4333-a333-333333333333', 'c3333333-0003-4000-a000-000000000003', 'product', 'Notebook Pack', 'notebook-pack', '5-pack ruled notebooks.', 'published', 220.00, null),
  ('a3333333-0006-4000-a000-000000000006', '33333333-3333-4333-a333-333333333333', 'c3333333-0003-4000-a000-000000000003', 'product', 'Ballpoint Pen Box', 'ballpoint-pen-box', 'Box of 10 ballpoint pens.', 'published', 100.00, 120.00);

-- ----------------------------------------------------------- item_variants
insert into public.item_variants (item_id, label, value, sort_order) values
  ('a1111111-0001-4000-a000-000000000001', 'Size', '1L', 1),
  ('a1111111-0001-4000-a000-000000000001', 'Size', '5L', 2),
  ('a1111111-0003-4000-a000-000000000003', 'Weight', '5kg', 1),
  ('a1111111-0003-4000-a000-000000000003', 'Weight', '25kg', 2),
  ('a2222222-0001-4000-a000-000000000001', 'Size', '500ml', 1),
  ('a3333333-0004-4000-a000-000000000004', 'Flavour', 'Mint', 1),
  ('a3333333-0004-4000-a000-000000000004', 'Flavour', 'Herbal', 2);

-- ------------------------------------------------------------- item_images
-- One cover image per item, at the same path scripts/seed-assets.mjs
-- uploads to — see that script for the actual JPEG generation/upload
-- (plain SQL can't touch Storage). Every path follows
-- lib/storage/upload.ts's `{organizationId}/items/{itemId}/cover.jpg`
-- convention.
insert into public.item_images (item_id, image_path, alt_text, sort_order)
select id, organization_id || '/items/' || id || '/cover.jpg', title, 0
from public.catalog_items;

-- ----------------------------------------------------------------- banners
insert into public.banners (id, organization_id, image_path, alt_text, target_url, sort_order, is_active) values
  ('b1111111-0001-4000-a000-000000000001', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111/banners/b1111111-0001-4000-a000-000000000001/cover.jpg', 'ORVEEN BAZAR seasonal staples banner', '/brands/orveen-bazar', 1, true),
  ('b1111111-0002-4000-a000-000000000002', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111/banners/b1111111-0002-4000-a000-000000000002/cover.jpg', 'ORVEEN BAZAR spice collection banner', '/catalog?org=orveen-bazar', 2, true),
  ('b2222222-0001-4000-a000-000000000001', '22222222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222/banners/b2222222-0001-4000-a000-000000000001/cover.jpg', 'ECO FAST BD cleaning range banner', '/brands/eco-fast-bd', 1, true),
  ('b2222222-0002-4000-a000-000000000002', '22222222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222/banners/b2222222-0002-4000-a000-000000000002/cover.jpg', 'ECO FAST BD laundry care banner', '/catalog?org=eco-fast-bd', 2, true),
  ('b3333333-0001-4000-a000-000000000001', '33333333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333/banners/b3333333-0001-4000-a000-000000000001/cover.jpg', 'RELIABLE MULTI PRODUCTS home essentials banner', '/brands/reliable-multi-products', 1, true),
  ('b3333333-0002-4000-a000-000000000002', '33333333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333/banners/b3333333-0002-4000-a000-000000000002/cover.jpg', 'RELIABLE MULTI PRODUCTS stationery banner', '/catalog?org=reliable-multi-products', 2, true);

-- Logos, banner images, and item cover photos referenced above are placed
-- into Storage by `npm run db:seed:assets` (scripts/seed-assets.mjs) after
-- this file applies — plain SQL can't write to Storage, so the rows above
-- describe where those objects belong, not their pixels.
