# ORVEEN BAZZAR — Multi-Brand Catalog Platform (Frontend Prototype)

A production-quality **frontend-only** prototype of a multi-brand FMCG catalog and
content-management platform for:

1. **ORVEEN BAZZAR.COM**
2. **RELIABLE MULTI PRODUCTS**
3. **ECO FAST BD**

This is **not** a transactional e-commerce store. There is intentionally **no**
cart, checkout, payment, orders, inventory, stock, delivery, booking, refund,
invoice or revenue functionality anywhere in the codebase.

---

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (design tokens in `src/app/globals.css`)
- Lucide React icons
- Zod (client-side form validation on login/register)
- localStorage / sessionStorage for demo persistence
- Bilingual-ready content (Bangla + English rendered side by side; language switch persisted)

## Install & run

```bash
npm install
npm run dev      # development
npm run build    # production build
npm run start    # serve production build
```

No environment variables are required — the prototype has no backend.

## Folder structure

```
src/
  app/            # routes (public, account, admin)
  components/
    admin/        # AdminShell, OrganizationSwitcher, DataTable, ImageUploader…
    brand/        # BrandLogo, BrandHero, Banner, BrandContact
    catalog/      # CatalogCard, CategoryCard, WishlistButton, CatalogView…
    home/         # homepage sections (hero, brand cards, carousel…)
    layout/       # header, mobile nav, footer, language switcher
    ui/           # primitives: Modal, SidePanel, EmptyState, ErrorState, Toast…
  data/           # mock seed: organizations, categories, items, banners, users
  lib/            # config, repositories (backend seams), utils, types
  locales/        # bn/en dictionaries
  providers/      # Language, Store (wishlist/toast), Auth, AdminStore
```

## Demo accounts (NON-PRODUCTION)

| Role            | Email                     | Password   |
| --------------- | ------------------------- | ---------- |
| Admin           | admin@demo.local          | demo1234   |
| Staff (ORVEEN)  | staff.orveen@demo.local   | demo1234   |
| Staff (Reliable)| staff.reliable@demo.local | demo1234   |
| Customer        | customer@demo.local       | demo1234   |

These are frontend prototype credentials stored in localStorage. They are **not**
real authentication and provide **no** security.

## LocalStorage keys

- `orveen-demo-session` — demo logged-in user
- `orveen-demo-wishlist:<user-id>` — saved item ids for each account
- `orveen-demo-wishlist-pending` — guest intent applied after demo login
- `orveen-demo-users` — registered demo users
- `orveen-demo-admin-data` — CMS edits (items/categories/banners/settings/users)
- `orveen-language` — bn/en preference

## Reset demo data

Admin dashboard → **Reset Demo Data** (admin role only, with confirmation).
Restores the original seed content and clears local CMS edits.

## Brand assets

- **ORVEEN**: the official uploaded logo is used *unmodified* via
  `public/brand/orveen-logo.png` (see `Organization.logoSrc`). If the file is
  absent, a faithful vector fallback of the same mark geometry renders instead.
  Drop the exact original file at that path to swap it in — no code change.
- **RELIABLE MULTI PRODUCTS**: green/leaf vector identity inspired by the
  supplied billboard reference.
- **ECO FAST BD**: no official artwork supplied → typography-only placeholder
  with neutral family palette. Replace `logo`/theme tokens in
  `src/data/organizations.ts` when official assets arrive.

Billboards are used only as *visual direction* (palette/mood); marketing claims
visible inside billboard artwork are **not** reproduced as website facts.

## Changing seed content

Edit `src/data/items.ts`, `categories.ts`, `banners.ts`, `organizations.ts`.
Seeds are allowances for demo content, not technical limits.

## Roles (UI simulation only)

- **Admin** — all organizations, users, brand settings, content
- **Staff** — assigned organizations only (assign/remove on `/admin/users`)
- **Customer** — profile + wishlist
- **Guest** — public pages only; wishlist prompts login and applies the pending
  save after demo login

> ⚠️ Client-side role gating is a prototype convenience. Production must enforce
> authorization with server/database policies; hiding routes in the frontend is
> **not** security.

## Future backend integration points

- `src/lib/repositories.ts` — `CatalogRepository`, `WishlistRepository`,
  `AuthService`, `AdminContentRepository` interfaces with Local* implementations
- `src/providers/AuthProvider.tsx` — swap login/register/logout for real auth
- `src/providers/AdminStoreProvider.tsx` — swap for database-backed CMS
- `src/components/admin/AdminKit.tsx` → `ImageUploader` — replace client-side
  preview with a cloud storage upload when available

## Known frontend-only limitations

- All content edits live in the visitor's browser only
- No real emails are sent (registration/recovery are simulated and labelled so)
- No server authorization, rate limiting or audit trails
- Prices are hidden by default (`catalogConfig.showPrice = false`); if enabled
  they are display text only — never calculated
