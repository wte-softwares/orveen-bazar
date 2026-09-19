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

test.describe("Admin Catalog Items Management", () => {
  test("Platform admin can view items, navigate to editor, create new item, and manage it", async ({ page }) => {
    // 1. Authenticate as Platform Admin
    await loginAs(page, "admin@example.com");

    // 2. Navigate to /admin/orveen-bazar/items
    await page.goto("/admin/orveen-bazar/items");
    await page.waitForLoadState("networkidle");

    // Check heading & brand
    await expect(page.locator("h1")).toContainText(/Catalog Items|ক্যাটালগ পণ্য ও সার্ভিস/);
    await expect(page.locator("h1")).toContainText("ORVEEN BAZAR.COM");

    // Wait for client hydration
    await page.locator('[data-hydrated="true"]').waitFor({ timeout: 15000 });

    // 3. Confirm seeded items are visible
    await expect(page.locator("body")).toContainText("Mustard Oil", { ignoreCase: true });

    // 4. Test search filter
    const searchInput = page.getByPlaceholder(/Search by title or slug|নাম বা স্লাগ দিয়ে খুঁজুন/i);
    await searchInput.fill("mustard");
    await expect(page.locator("body")).toContainText("Mustard Oil", { ignoreCase: true });

    await searchInput.fill("non-existent-xyz-search-query");
    await expect(page.locator("body")).toContainText(/No items found|কোনো আইটেম পাওয়া যায়নি/i);
    await searchInput.clear();

    // 5. Navigate to New Item page
    const addItemLink = page.getByRole("button", { name: /Add Item|নতুন আইটেম যোগ করুন/i })
      .or(page.getByRole("link", { name: /Add Item|নতুন আইটেম যোগ করুন/i }));
    await addItemLink.click();
    await page.waitForURL("**/admin/orveen-bazar/items/new");
    await page.waitForLoadState("networkidle");

    // Verify Editor Form is displayed
    await expect(page.locator("h1")).toContainText(/Add Item|নতুন আইটেম যোগ করুন/i);

    // 6. Fill in item details
    const uniqueSuffix = Date.now();
    const testTitle = `Test Product ${uniqueSuffix}`;
    const testSlug = `test-prod-${uniqueSuffix}`;

    await page.fill("#item-title", testTitle);
    await page.fill("#item-slug", testSlug);
    await page.fill("#item-price", "250");
    await page.fill("#item-compare-price", "300");
    await page.fill("#item-desc", "Test description for product creation e2e.");

    // Add a descriptive variant
    const addVariantBtn = page.getByRole("button", { name: /Add Variant|ভ্যারিয়েন্ট যোগ করুন/i });
    await addVariantBtn.click();
    await page.getByPlaceholder(/Size|সাইজ/i).fill("Pack Size");
    await page.getByPlaceholder(/500ml|৫০০মিলি/i).fill("1 Kg");

    // Save as draft
    const saveDraftBtn = page.getByRole("button", { name: /Save as Draft|ড্রাফট হিসেবে সংরক্ষণ/i });
    await saveDraftBtn.click();

    // Wait for redirect back to items list
    await page.waitForURL("**/admin/orveen-bazar/items", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Confirm new item is present in list
    await expect(page.locator("body")).toContainText(testTitle, { timeout: 10000 });
    await expect(page.locator("body")).toContainText("৳250");

    // 7. Test Archive flow on the newly created item
    const row = page.locator("tr", { hasText: testTitle });
    const archiveBtn = row.getByRole("button", { name: /Archive|আর্কাইভ করুন/i });
    await archiveBtn.click();

    // Dialog confirmation
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    const confirmBtn = page.getByRole("button", { name: /Confirm Archive|হ্যাঁ, আর্কাইভ করুন/i });
    await confirmBtn.click();

    // Confirm status badge flips to archived
    await expect(row.locator("text=/archived|আর্কাইভড/i")).toBeVisible({ timeout: 10000 });
  });

  test("Brand staff cross-tenant isolation: staff cannot access other brand items", async ({ page }) => {
    // 1. Authenticate as Brand Staff for Orveen Bazar
    await loginAs(page, "staff-orveen@example.com");

    // 2. Access permitted brand
    await page.goto("/admin/orveen-bazar/items");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Catalog Items|ক্যাটালগ পণ্য ও সার্ভিস/);

    // 3. Attempt to access unauthorized brand (eco-fast-bd)
    await page.goto("/admin/eco-fast-bd/items");
    await page.waitForLoadState("networkidle");

    // Must be redirected away to /admin
    expect(page.url()).toMatch(/\/admin$/);
  });
});
