import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the acceptance-check user flows from the brief
 * (register/login/recover, browse -> filter -> details -> wishlist, admin
 * create/edit/publish/archive). Specs live in tests/e2e/.
 *
 * Runs against `npm run dev` on http://127.0.0.1:3000, which must itself be
 * pointed at the local Supabase stack (`npm run db:start` first) and a
 * seeded database (`npm run db:reset`) — see docs/SETUP.md.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
