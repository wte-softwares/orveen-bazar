# API reference

**Not written yet — this file is produced at the end of Phase 2, once every
route below actually does what it says, specifically so you can review the
real, implemented API rather than a plan for one.**

Every route currently returns `501 { "error": { "code": "not_implemented" } }`
— see `AGENTS.md` for the current build status. Tracking the planned surface
here in the meantime so nothing gets forgotten:

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | none | Create an account |
| POST | `/api/v1/auth/login` | none | Start a session |
| POST | `/api/v1/auth/logout` | session | End the current session |
| GET | `/api/v1/auth/session` | session or bearer | Current user + profile |
| POST | `/api/v1/auth/forgot-password` | none | Request a reset link |
| POST | `/api/v1/auth/reset-password` | recovery session | Set a new password |
| GET | `/api/v1/organizations` | none | Active organizations |
| GET | `/api/v1/organizations/[slug]` | none | One active organization |
| GET | `/api/v1/catalog` | none | Filtered/paginated published items |
| GET | `/api/v1/catalog/[org]/[item]` | none | One published item + variants |
| GET | `/api/v1/wishlist` | owner | Signed-in user's saved items |
| POST | `/api/v1/wishlist` | owner | Save an item (idempotent) |
| DELETE | `/api/v1/wishlist/[itemId]` | owner | Remove a saved item |
| GET/POST | `/api/v1/admin/[org]/items` | staff-of-org or admin | List / create items |
| GET/PATCH/DELETE | `/api/v1/admin/[org]/items/[id]` | staff-of-org or admin | Read / update / archive one item |
| GET/POST | `/api/v1/admin/[org]/categories` | staff-of-org or admin | List / create categories |
| PATCH/DELETE | `/api/v1/admin/[org]/categories/[id]` | staff-of-org or admin | Update / delete (if unreferenced) |
| GET/POST | `/api/v1/admin/[org]/banners` | staff-of-org or admin | List / create banners |
| PATCH/DELETE | `/api/v1/admin/[org]/banners/[id]` | staff-of-org or admin | Update / deactivate |
| GET/PATCH | `/api/v1/admin/[org]/settings` | GET: staff-of-org or admin · PATCH: **admin only** | Brand settings |
| GET/POST | `/api/v1/admin/users` | platform admin only | List / grant memberships |
| DELETE | `/api/v1/admin/users/[userId]` | platform admin only | Revoke a membership |
| POST | `/api/v1/uploads` | staff-of-org or admin | Signed draft upload URL |

Once implemented, each entry above will expand to its full request/response
JSON shape and error codes, matching the envelope defined in
`lib/api/response.ts`.
