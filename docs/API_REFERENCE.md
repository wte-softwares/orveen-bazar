# API reference

Every route below is implemented and verified against the local Supabase
stack (migrations applied, seed data loaded, RLS/cross-org isolation tested
by hand — see `tests/policies/` for the automated version once written).

**Base URL:** `/api/v1`. **Envelope:** every response is
`{ data, error, meta? }` (`lib/api/response.ts`) — `error` is `null` on
success, or `{ code, message, fields? }` on failure. `fields` is present
only for `422 validation_failed` responses, one message per invalid field.

**Auth:** send either the browser's Supabase session cookie (automatic for
same-origin requests from the web app) or `Authorization: Bearer
<access_token>` (mobile/other clients) — `lib/api/auth.ts` accepts both on
every protected route. Routes marked "Public" need neither.

**Errors you'll see everywhere:** `401 unauthorized` (not signed in),
`403 forbidden` (signed in, wrong role/org), `404 not_found`,
`409 conflict` (duplicate slug, category still in use), `422
validation_failed` (bad input) or a specific `422` code, `500
internal_error` (unexpected — never leaks internals).

## Auth

### `POST /auth/register` — Public
Body: `{ displayName, email, password }` (password ≥ 8 chars).
`201 { userId, needsEmailConfirmation }`. If the email already belongs to a
confirmed account, Supabase itself returns the same success shape
(obfuscated) rather than an error — see the comment in the route for why
this is safe to trust as-is.

### `POST /auth/login` — Public
Body: `{ email, password }`. `200 { userId }`, sets the session cookie.
Wrong email or wrong password both return the same
`401 invalid_credentials` — the endpoint never reveals which one.

### `POST /auth/logout` — Session required
No body. `200 { signedOut: true }`.

### `GET /auth/session` — Session or bearer required
`200 { userId, email, displayName, isPlatformAdmin, membershipOrgIds }`.
The bootstrap call a web page or a mobile client makes on launch.

### `POST /auth/forgot-password` — Public
Body: `{ email }`. Always `200 { message }`, regardless of whether the
email is registered — this endpoint cannot be used to enumerate accounts.

### `POST /auth/reset-password` — Recovery session required
Body: `{ password }`. Requires the short-lived session Supabase establishes
after the user follows their emailed reset link. `200 { message }`, or
`401` if that link has expired.

## Public catalog

### `GET /organizations` — Public
`200 [{ id, slug, name, description, logo_path, contact_text }]` — active
organizations only.

### `GET /organizations/[slug]` — Public
Same shape, one organization. `404` if missing or inactive.

### `GET /catalog` — Public
Query: `org`, `category`, `type` (`product`|`service`), `q` (case-insensitive
title search), `page`, `pageSize` (max 50). Returns published items only,
from active organizations only. `200 [items]` with
`meta.pagination: { page, pageSize, totalCount }`.

### `GET /catalog/[org]/[item]` — Public
One published item + its `item_variants`, joined organization and category.
`404` covers "item missing," "not published/archived," and "organization
inactive" identically — a client can't distinguish which applied.

## Wishlist (owner-only)

### `GET /wishlist` — Session or bearer required
`200 [{ created_at, item: {...}, unavailable }]`. `unavailable: true` means
the saved item since became unpublished/archived or its organization went
inactive — the UI should explain this rather than showing a broken link,
not hide the row.

### `POST /wishlist` — Session or bearer required
Body: `{ itemId }`. `201 { saved: true }`. Idempotent — saving an
already-saved item returns the same success response, never an error.

### `DELETE /wishlist/[itemId]` — Session or bearer required
`200 { removed: true }`, including when the item was never saved.

## Admin — organization-scoped (`:org` = organization slug)

Every route below requires an active staff membership in `:org` **or**
platform admin — checked by `lib/api/org-guard.ts` before any database
call, and independently enforced by Row Level Security underneath. A
forged or mistyped `:org` returns `404` if no such organization exists, or
`403` if it exists but the caller has no access to it — never a partial
leak of the organization's data.

### `GET /admin/[org]/items`
Query: `type`, `status`, `q`, `page`, `pageSize`. Returns items of every
status (draft/published/archived), unlike the public catalog endpoint.

### `POST /admin/[org]/items`
Body: `{ title, slug, type, description?, categoryId, status?, price, compareAtPrice?, images?: [{path, altText?, sortOrder?}], variants?: [{label, value, sortOrder?}] }`.
`price`/`compareAtPrice` are display-only (see AGENTS.md) — `compareAtPrice`,
if set, must be ≥ `price` (`422` otherwise). `images[0]` is the cover image
by convention; each `path` comes from `POST /uploads`. `categoryId` must
belong to `:org` — checked before insert (`422 invalid_category` if not) and
enforced again by a database trigger as a hard guarantee. `409` on a
duplicate slug within `:org`. `201 { item }`.

### `GET /admin/[org]/items/[id]`
Full editor payload including `item_images` and `item_variants`, each
ordered by `sort_order`.

### `PATCH /admin/[org]/items/[id]`
Same body shape as create, all fields optional — only provided fields
change. Setting `status: "published"` runs the publish pipeline first
(copies every image in `images` into the public bucket, then flips status);
moving away from `published` scrubs every public copy after the status
change, in the same request. Providing `images` or `variants` replaces that
whole list
wholesale.

### `DELETE /admin/[org]/items/[id]`
Archives (`status = 'archived'`) — never a hard delete. Scrubs the public
image if the item was published.

### `GET /admin/[org]/categories`
All categories in `:org`, ordered by `sort_order`.

### `POST /admin/[org]/categories`
Body: `{ name, slug, sortOrder?, isActive? }`. `409` on duplicate slug.

### `PATCH /admin/[org]/categories/[id]`
Partial update of the same fields.

### `DELETE /admin/[org]/categories/[id]`
`409 conflict` with a count if any item still references this category —
checked before the delete is attempted, ahead of the database's own
`ON DELETE RESTRICT` guarantee.

### `GET /admin/[org]/banners`
All banners in `:org`, ordered by `sort_order`.

### `POST /admin/[org]/banners`
Body: `{ imagePath, altText, targetUrl?, sortOrder?, isActive? }`.
`targetUrl` must be a relative path or an `https://` URL — anything else is
rejected as `422`. An active banner's image is published immediately
(banners have no separate draft-preview stage the way items do).

### `PATCH /admin/[org]/banners/[id]`
Partial update; flipping `isActive` runs the same publish/unpublish
pipeline as items.

### `DELETE /admin/[org]/banners/[id]`
Deactivates (`is_active = false`) rather than deleting the row.

### `GET /admin/[org]/settings`
Readable by any staff member of `:org` or a platform admin.

### `PATCH /admin/[org]/settings`
Body: `{ name?, description?, contactText?, logoPath? }`.
**Platform admin only** — a staff member with a valid `:org` membership
still gets `403` here, even though they can manage this org's items,
categories, and banners. This is the one screen where organization
membership isn't enough.

## Admin — platform-wide (platform admin only)

### `GET /admin/users`
`200 { memberships: [{ id, user_id, email, role, organization }],
platformAdmins: [{ user_id, email }] }`.

### `POST /admin/users`
Body: exactly one of `{ email, organizationId }` (grants org-scoped staff)
or `{ email, grantPlatformAdmin: true }` — the schema rejects a request
that tries to specify both or neither. `404` if no account exists for that
email (they must register first). `409` if the grant already exists.

### `DELETE /admin/users/[userId]`
Query: `?organizationId=<uuid>` revokes that one membership; omitted
revokes platform-admin status instead. Access is revoked on the very next
request — membership is checked live, never cached.

## Uploads

### `POST /uploads` — Session or bearer required, org access required
Body: `{ organizationId, kind: "items"|"banners"|"logos", ownerId, fileName, contentType, fileSizeBytes }`.
`200 { path, token, signedUrl }` — `PUT` the raw file bytes to `signedUrl`
directly (not through this API) to complete the upload into the private
`org-drafts` bucket. Only PNG/JPEG/WebP up to 5 MB are accepted. The
returned `path` is what you then pass as `imagePath`/`logoPath` to the
create/update endpoints above — uploading alone does not make anything
public; publishing happens through those endpoints.
