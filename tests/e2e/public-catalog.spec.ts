import { test, expect } from "@playwright/test";

test.describe("Public Catalog & Storefront Experience", () => {
  test("Browses /catalog, verifies seeded items, and interacts with search/brand filters", async ({ page }) => {
    // 1. Visit /catalog
    await page.goto("/catalog");
    await page.waitForLoadState("networkidle");

    // Title / heading check
    await expect(page.locator("h1")).toContainText(
      /All Products & Services|সব পণ্য ও সেবা|ক্যাটালগ ব্রাউজ করুন|Catalog/i
    );

    // Verify presence of seeded products (e.g. Mustard Oil)
    await expect(page.locator("body")).toContainText("Mustard Oil");

    // 2. Search filtering via filters bar
    const searchInput = page.locator('[data-testid="catalog-search-input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Mustard");
    await searchInput.press("Enter");
    await page.waitForURL(/q=Mustard/);

    // Item should still be visible
    await expect(page.locator("body")).toContainText("Mustard Oil");

    // Search for a non-existent item
    await searchInput.fill("NonExistentItemXYZ12345");
    await searchInput.press("Enter");
    await page.waitForURL(/q=NonExistentItemXYZ12345/);
    await expect(page.locator("body")).toContainText(
      /No products found|কোনো পণ্য পাওয়া যায়নি|কোনো পণ্য বা সার্ভিস খুঁজে পাওয়া যায়নি|No items match/i
    );

    // 3. Clear search filter
    const clearBtn = page.getByRole("button", { name: /Clear Filters|ফিল্টার মুছুন/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForURL((url) => !url.searchParams.has("q"));
      await expect(page.locator("body")).toContainText("Mustard Oil");
    }
  });

  test("Visits brand storefront /brands/[brand] and handles invalid brands with 404", async ({ page }) => {
    // 1. Valid brand: ORVEEN BAZAR.COM
    await page.goto("/brands/orveen-bazar");
    await page.waitForLoadState("networkidle");

    // Check brand name appears in header/hero
    await expect(page.locator("body")).toContainText("ORVEEN BAZAR.COM");

    // Ensure items belonging to this brand are rendered
    await expect(page.locator("body")).toContainText("Mustard Oil");

    // 2. Invalid brand returns 404
    const response = await page.goto("/brands/non-existent-brand-slug-xyz");
    expect(response?.status()).toBe(404);
  });

  test("Item detail page /brands/[brand]/[item] displays details, variants, coming-soon cart, and wishlist auth guard", async ({ page }) => {
    // 1. Navigate to published item Mustard Oil
    await page.goto("/brands/orveen-bazar/mustard-oil");
    await page.waitForLoadState("networkidle");

    // Heading should be the item title
    await expect(page.locator("h1")).toContainText("Mustard Oil");

    // Price should be rendered in BDT format (৳)
    await expect(page.locator("body")).toContainText("৳");

    // Breadcrumbs should contain brand and title
    const breadcrumbs = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText("ORVEEN BAZAR.COM");
    await expect(breadcrumbs).toContainText("Mustard Oil");

    // 2. Scope boundary: Clicking "Add to Cart" triggers the Coming Soon modal
    const addToCartBtn = page.getByRole("button", { name: /Add to cart|কার্টে যোগ করুন/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Verify Coming Soon modal dialog opens
    const comingSoonDialog = page.locator("[role='dialog']");
    await expect(comingSoonDialog).toBeVisible();
    await expect(comingSoonDialog).toContainText(/Coming Soon|শীঘ্রই আসছে/i);

    // Close the dialog
    const closeDialogBtn = comingSoonDialog.getByRole("button", { name: /Got it|ঠিক আছে/i });
    if (await closeDialogBtn.isVisible()) {
      await closeDialogBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(comingSoonDialog).not.toBeVisible();

    // 3. Wishlist button when unauthenticated redirects to /login with redirect query param
    const wishlistBtn = page.locator('[data-testid="wishlist-toggle-btn"]');
    await expect(wishlistBtn).toBeVisible();
    await wishlistBtn.click();

    // Should redirect to login page with redirect URL
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("redirect=");
    expect(page.url()).toContain(encodeURIComponent("/brands/orveen-bazar/mustard-oil"));
  });
});
