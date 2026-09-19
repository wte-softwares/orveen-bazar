import { test, expect, type Page } from "@playwright/test";

async function loginAs(page: Page, email: string, password = "Password123!") {
  const loginRes = await page.request.post("/api/v1/auth/login", {
    data: { email, password },
  });
  expect(loginRes.ok()).toBeTruthy();

  const headers = loginRes.headersArray();
  const setCookieHeaders = headers.filter(
    (h: { name: string; value: string }) => h.name.toLowerCase() === "set-cookie",
  );
  for (const header of setCookieHeaders) {
    const firstPart = header.value.split(";")[0];
    const equalIdx = firstPart.indexOf("=");
    const name = firstPart.slice(0, equalIdx);
    const value = firstPart.slice(equalIdx + 1);
    await page.context().addCookies([
      {
        name,
        value,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
  }
}

test.describe("Admin Brand Information & Settings", () => {
  test("Platform admin can view static brand configuration, contact details, and operational status", async ({
    page,
  }) => {
    // 1. Authenticate as Platform Admin
    await loginAs(page, "admin@example.com");

    // 2. Navigate to /admin/orveen-bazar/settings
    await page.goto("/admin/orveen-bazar/settings");
    await page.waitForLoadState("networkidle");

    // Header & brand name
    await expect(page.locator("h1")).toContainText(/Brand Information & Settings|ব্র্যান্ড তথ্য ও কনফিগারেশন/);
    await expect(page.locator("h1")).toContainText("ORVEEN BAZAR.COM");

    // Static configuration notice
    await expect(page.locator("body")).toContainText("lib/site-config.ts");

    // Brand logo & visual assets
    const logoImg = page.locator('img[alt="ORVEEN BAZAR.COM"]');
    await expect(logoImg).toBeVisible();

    // Descriptions
    await expect(page.locator("body")).toContainText("Everyday FMCG staples");

    // Contact info
    await expect(page.locator("body")).toContainText("01335189426");
    await expect(page.locator("body")).toContainText("info@orveenbazzar.com");
    await expect(page.locator("body")).toContainText("Barishal");

    // Social links
    await expect(page.locator("body")).toContainText("https://wa.me/8801335189426");
    await expect(page.locator("body")).toContainText("https://www.facebook.com");

    // Operational DB status
    await expect(page.locator("body")).toContainText("orveen-bazar");
    await expect(page.locator("body")).toContainText("Active");

    // Assigned staff section
    await expect(page.locator("body")).toContainText("staff-orveen@example.com");
  });

  test("Brand staff cross-tenant isolation on settings: staff cannot access other brand settings", async ({
    page,
  }) => {
    // 1. Authenticate as Brand Staff for Orveen Bazar
    await loginAs(page, "staff-orveen@example.com");

    // 2. Access permitted brand settings
    await page.goto("/admin/orveen-bazar/settings");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Brand Information & Settings|ব্র্যান্ড তথ্য ও কনফিগারেশন/);

    // 3. Attempt to access unauthorized brand settings (eco-fast-bd)
    await page.goto("/admin/eco-fast-bd/settings");
    await page.waitForLoadState("networkidle");

    // Must be redirected away to /admin
    expect(page.url()).toMatch(/\/admin$/);
  });
});
