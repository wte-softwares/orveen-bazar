import { test, expect } from "@playwright/test";

test.describe("Public Customer Testimonials Showcase", () => {
  test("Visits /testimonials, verifies headings, customer reviews, and breadcrumbs", async ({ page }) => {
    await page.goto("/testimonials");
    await page.waitForLoadState("networkidle");

    // Breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Home");

    // Heading & subheading
    await expect(page.locator("h2")).toContainText(
      /Customer testimonials|গ্রাহকের মতামত/i
    );
    await expect(page.locator("body")).toContainText(
      /Your trust and love are our greatest reward|আমাদের সবচেয়ে বড় প্রাপ্তি/i
    );

    // Verify presence of customer review articles
    const articles = page.locator("article");
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });
});
