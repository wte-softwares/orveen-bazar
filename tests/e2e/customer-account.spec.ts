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

test.describe("Customer Account & Wishlist Portal", () => {
  test("Guest is redirected to /login when attempting to access /account or /account/wishlist", async ({ page }) => {
    // 1. Guest visits /account
    await page.goto("/account");
    await page.waitForURL(/\/login/);
    expect(page.url()).toMatch(/redirect=(%2F|\/)account/);

    // 2. Guest visits /account/wishlist
    await page.goto("/account/wishlist");
    await page.waitForURL(/\/login/);
    expect(page.url()).toMatch(/redirect=(%2F|\/)account(%2F|\/)wishlist/);
  });

  test("Authenticated customer can view account, edit display name, and persist changes", async ({ page }) => {
    await loginAs(page, "admin@example.com");

    await page.goto("/account");
    await page.waitForLoadState("networkidle");

    // Verify heading & email
    await expect(page.locator("h1")).toContainText(/My Account|আমার অ্যাকাউন্ট/i);
    await expect(page.locator("input[type='email']")).toHaveValue("admin@example.com");

    // Edit display name
    const nameInput = page.locator('[data-testid="profile-display-name-input"]');
    await expect(nameInput).toBeVisible();
    const updatedName = `Platform Admin Test ${Date.now()}`;
    await nameInput.fill(updatedName);

    const saveBtn = page.locator('[data-testid="profile-save-btn"]');
    await saveBtn.click();

    // Verify success feedback
    await expect(page.locator("body")).toContainText(
      /Profile updated successfully|প্রোফাইল সফলভাবে আপডেট হয়েছে/i
    );

    // Refresh and check persisted name
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(nameInput).toHaveValue(updatedName);
  });

  test("Authenticated customer can save item to wishlist, view it in /account/wishlist, and remove it", async ({ page }) => {
    await loginAs(page, "admin@example.com");

    // 1. Visit Mustard Oil page and click wishlist toggle button
    await page.goto("/brands/orveen-bazar/mustard-oil");
    await page.waitForLoadState("networkidle");

    const wishlistBtn = page.locator('[data-testid="wishlist-toggle-btn"]');
    await expect(wishlistBtn).toBeVisible();
    await wishlistBtn.click();

    // 2. Navigate to /account/wishlist
    await page.goto("/account/wishlist");
    await page.waitForLoadState("networkidle");

    // Verify heading
    await expect(page.locator("h1")).toContainText(/Saved Wishlist|সংরক্ষিত উইশলিস্ট/i);

    // Item should appear in wishlist
    await expect(page.locator("body")).toContainText("Mustard Oil");
    await expect(page.locator("body")).toContainText("ORVEEN BAZAR.COM");

    // 3. Remove the item
    const removeBtn = page.locator('button[data-testid^="wishlist-remove-btn-"]').first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // After removal, verify item card disappears
    await expect(page.locator("body")).not.toContainText("Mustard Oil");
  });
});
