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

test.describe("Admin Banners Management", () => {
  test("Platform admin can view, create, toggle active, and manage banners", async ({ page }) => {
    page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE JS ERROR:", err));

    // 1. Authenticate as Platform Admin
    await loginAs(page, "admin@example.com");

    // 2. Navigate to /admin/orveen-bazar/banners
    await page.goto("/admin/orveen-bazar/banners");
    await page.waitForLoadState("networkidle");

    // Check header
    await expect(page.locator("h1")).toContainText(/Banner Management|ব্যানার ব্যবস্থাপনা/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("ORVEEN BAZAR.COM");

    // Wait for client hydration
    await page.locator('[data-hydrated="true"]').waitFor({ timeout: 15000 });

    // 3. Confirm seeded banners are visible
    await expect(page.locator("body")).toContainText("ORVEEN BAZAR seasonal staples banner");
    await expect(page.locator("body")).toContainText("/brands/orveen-bazar");

    // 4. Open Add Banner dialog
    const addBannerBtn = page.getByRole("button", { name: /Add Banner|নতুন ব্যানার/i });
    await addBannerBtn.click();

    // 5. Fill banner fields
    const testAlt = `Automated Banner Test ${Date.now()}`;
    await page.fill("#banner-alt", testAlt);
    await page.fill("#banner-url", "/catalog?org=orveen-bazar");
    await page.fill("#banner-sort", "5");

    // Prepare a mock 1x1 PNG data to upload directly via input
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "banner-test.png",
      mimeType: "image/png",
      buffer,
    });

    // Wait for image upload to complete (preview should show)
    await expect(page.getByRole("button", { name: /Change Image/i })).toBeVisible({ timeout: 15000 });

    // Submit dialog
    const submitBtn = page.getByRole("button", { name: /Save Banner|সংরক্ষণ/i });
    await submitBtn.click();

    // Verify it appears in table
    await expect(page.locator("body")).toContainText(testAlt, { timeout: 15000 });
    await expect(page.locator("body")).toContainText("#5");

    // 6. Test Quick Toggle
    const row = page.locator("tr", { hasText: testAlt });
    const toggleSwitch = row.getByRole("switch");
    await toggleSwitch.click();

    // Verify status switches to Off
    await expect(row).toContainText("Off", { timeout: 10000 });

    // Wait until toggling is complete and switch is enabled again
    await expect(toggleSwitch).toBeEnabled({ timeout: 10000 });

    // Toggle it back to active
    await toggleSwitch.click();
    await expect(row).toContainText("Active", { timeout: 10000 });
  });

  test("Brand staff can access assigned brand banners but is blocked from other brands", async ({ page }) => {
    // 1. Login as staff of orveen-bazar
    await loginAs(page, "staff-orveen@example.com");

    // 2. Can access orveen-bazar banners
    await page.goto("/admin/orveen-bazar/banners");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Banner Management|ব্যানার ব্যবস্থাপনা/);

    // 3. Attempting to access eco-fast-bd banners redirects to /admin
    await page.goto("/admin/eco-fast-bd/banners");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
