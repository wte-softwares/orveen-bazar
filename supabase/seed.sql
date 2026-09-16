-- Sample content for local development and the Playwright/policy test
-- suites: the 3 named organizations, and categories/items/banners within
-- the brief's stated allowance (8 categories / 20 items / 6 banners
-- combined — a soft guideline, not an enforced limit). Runs automatically
-- on `supabase db reset` (see supabase/config.toml, [db.seed]).
--
-- Organizations use fixed, RFC 4122 version-4-shaped ids (version nibble
-- '4', variant nibble 'a') so `scripts/seed-test-users.mjs` can attach
-- memberships to them without an extra lookup, AND so they pass the same
-- strict `z.uuid()` validation real request payloads go through — a
-- cosmetically "nice" but non-v4 id (e.g. ending in all zeros) would be
-- rejected by lib/validation/*.schema.ts even though Postgres itself
-- doesn't care about UUID version bits. Auth users can't be created here:
-- Supabase Auth needs its Admin API to produce a correctly-hashed,
-- correctly-linked account, which plain SQL can't safely replicate — see
-- that script.

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
-- exercise the "staff sees drafts, public doesn't" RLS case), all with at
-- least one descriptive variant where relevant — no price, stock, or
-- quantity columns anywhere.
insert into public.catalog_items (id, organization_id, category_id, type, title, slug, description, status) values
  ('a1111111-0001-4000-a000-000000000001', '11111111-1111-4111-a111-111111111111', 'c1111111-0001-4000-a000-000000000001', 'product', 'Soybean Oil', 'soybean-oil', 'Refined soybean cooking oil.', 'published'),
  ('a1111111-0002-4000-a000-000000000002', '11111111-1111-4111-a111-111111111111', 'c1111111-0001-4000-a000-000000000001', 'product', 'Mustard Oil', 'mustard-oil', 'Cold-pressed mustard oil.', 'published'),
  ('a1111111-0003-4000-a000-000000000003', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Premium Miniket Rice', 'premium-miniket-rice', 'Fine-grain miniket rice.', 'published'),
  ('a1111111-0004-4000-a000-000000000004', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Red Lentils', 'red-lentils', 'Split red lentils (masoor dal).', 'published'),
  ('a1111111-0005-4000-a000-000000000005', '11111111-1111-4111-a111-111111111111', 'c1111111-0002-4000-a000-000000000002', 'product', 'Wheat Flour', 'wheat-flour', 'Fine wheat flour (atta).', 'published'),
  ('a1111111-0006-4000-a000-000000000006', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Turmeric Powder', 'turmeric-powder', 'Ground turmeric.', 'published'),
  ('a1111111-0007-4000-a000-000000000007', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Cumin Powder', 'cumin-powder', 'Ground cumin.', 'published'),
  ('a1111111-0008-4000-a000-000000000008', '11111111-1111-4111-a111-111111111111', 'c1111111-0003-4000-a000-000000000003', 'product', 'Garam Masala', 'garam-masala', 'Blended whole-spice mix.', 'draft'),
  ('a2222222-0001-4000-a000-000000000001', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Multi-Surface Cleaner', 'multi-surface-cleaner', 'Plant-based multi-surface cleaner.', 'published'),
  ('a2222222-0002-4000-a000-000000000002', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Glass Cleaner', 'glass-cleaner', 'Streak-free glass cleaner.', 'published'),
  ('a2222222-0003-4000-a000-000000000003', '22222222-2222-4222-a222-222222222222', 'c2222222-0001-4000-a000-000000000001', 'product', 'Dish Wash Liquid', 'dish-wash-liquid', 'Grease-cutting dish soap.', 'published'),
  ('a2222222-0004-4000-a000-000000000004', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'product', 'Laundry Detergent Powder', 'laundry-detergent-powder', 'Concentrated detergent powder.', 'published'),
  ('a2222222-0005-4000-a000-000000000005', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'product', 'Fabric Softener', 'fabric-softener', 'Long-lasting fabric softener.', 'published'),
  ('a2222222-0006-4000-a000-000000000006', '22222222-2222-4222-a222-222222222222', 'c2222222-0002-4000-a000-000000000002', 'service', 'Bulk Laundry Supply Consultation', 'bulk-laundry-supply-consultation', 'Advisory service for institutional laundry supply planning.', 'published'),
  ('a3333333-0001-4000-a000-000000000001', '33333333-3333-4333-a333-333333333333', 'c3333333-0001-4000-a000-000000000001', 'product', 'LED Bulb 9W', 'led-bulb-9w', 'Energy-saving LED bulb.', 'published'),
  ('a3333333-0002-4000-a000-000000000002', '33333333-3333-4333-a333-333333333333', 'c3333333-0001-4000-a000-000000000001', 'product', 'Extension Cord', 'extension-cord', 'Multi-socket extension cord.', 'published'),
  ('a3333333-0003-4000-a000-000000000003', '33333333-3333-4333-a333-333333333333', 'c3333333-0002-4000-a000-000000000002', 'product', 'Herbal Soap', 'herbal-soap', 'Natural herbal bathing soap.', 'published'),
  ('a3333333-0004-4000-a000-000000000004', '33333333-3333-4333-a333-333333333333', 'c3333333-0002-4000-a000-000000000002', 'product', 'Toothpaste', 'toothpaste', 'Fluoride toothpaste, mint flavour.', 'published'),
  ('a3333333-0005-4000-a000-000000000005', '33333333-3333-4333-a333-333333333333', 'c3333333-0003-4000-a000-000000000003', 'product', 'Notebook Pack', 'notebook-pack', '5-pack ruled notebooks.', 'published'),
  ('a3333333-0006-4000-a000-000000000006', '33333333-3333-4333-a333-333333333333', 'c3333333-0003-4000-a000-000000000003', 'product', 'Ballpoint Pen Box', 'ballpoint-pen-box', 'Box of 10 ballpoint pens.', 'published');

-- ----------------------------------------------------------- item_variants
insert into public.item_variants (item_id, label, value, sort_order) values
  ('a1111111-0001-4000-a000-000000000001', 'Size', '1L', 1),
  ('a1111111-0001-4000-a000-000000000001', 'Size', '5L', 2),
  ('a1111111-0003-4000-a000-000000000003', 'Weight', '5kg', 1),
  ('a1111111-0003-4000-a000-000000000003', 'Weight', '25kg', 2),
  ('a2222222-0001-4000-a000-000000000001', 'Size', '500ml', 1),
  ('a3333333-0004-4000-a000-000000000004', 'Flavour', 'Mint', 1),
  ('a3333333-0004-4000-a000-000000000004', 'Flavour', 'Herbal', 2);

-- ----------------------------------------------------------------- banners
insert into public.banners (organization_id, image_path, alt_text, target_url, sort_order, is_active) values
  ('11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111/banners/seed-1/placeholder.jpg', 'ORVEEN BAZAR seasonal staples banner', '/brands/orveen-bazar', 1, true),
  ('11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111/banners/seed-2/placeholder.jpg', 'ORVEEN BAZAR spice collection banner', '/catalog?org=orveen-bazar', 2, true),
  ('22222222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222/banners/seed-1/placeholder.jpg', 'ECO FAST BD cleaning range banner', '/brands/eco-fast-bd', 1, true),
  ('22222222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222/banners/seed-2/placeholder.jpg', 'ECO FAST BD laundry care banner', '/catalog?org=eco-fast-bd', 2, true),
  ('33333333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333/banners/seed-1/placeholder.jpg', 'RELIABLE MULTI PRODUCTS home essentials banner', '/brands/reliable-multi-products', 1, true),
  ('33333333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333/banners/seed-2/placeholder.jpg', 'RELIABLE MULTI PRODUCTS stationery banner', '/catalog?org=reliable-multi-products', 2, true);

-- NOTE: the banner image_paths above point at placeholder objects that do
-- not actually exist in Storage — fine for exercising queries/RLS/pagination
-- against real rows, but a real image would need to be uploaded and
-- published through the normal admin flow (or a future
-- `npm run db:seed:assets` helper) to actually render locally.
