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

test.describe("Admin Users & Roles Management", () => {
  test("Platform admin can view, invite new staff, and manage roles", async ({ page }) => {
    page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE JS ERROR:", err));

    // 1. Authenticate as Platform Admin via API session
    await loginAs(page, "admin@example.com");

    // 2. Navigate directly to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Users & Roles|ইউজার ও ভূমিকা/, { timeout: 15000 });

    // 3. Confirm admin and existing staff are listed
    await expect(page.locator("body")).toContainText("admin@example.com");
    await expect(page.locator("body")).toContainText("Platform Admin");
    await expect(page.locator("body")).toContainText("staff-orveen@example.com");

    // Wait for client hydration
    await page.locator('[data-hydrated="true"]').waitFor({ timeout: 15000 });

    // 4. Open Invite User dialog
    const inviteButton = page.getByRole("button", { name: /Invite User|ইউজার আমন্ত্রণ/i });
    await inviteButton.click();

    // 5. Fill and submit invite for new staff member
    const uniqueEmail = `invited-${Date.now()}@example.com`;
    await page.fill("#invite-email", uniqueEmail);
    await page.fill("#invite-display-name", "Invited Staff Test");

    const submitInvite = page.getByRole("button", { name: /Send Invite & Assign|পাঠান/i });
    await submitInvite.click();

    // 6. Verify notification and appearance in table
    await expect(page.locator("body")).toContainText(uniqueEmail, { timeout: 15000 });
    await expect(page.locator("body")).toContainText(/Invite Pending|পেন্ডিং/i, { timeout: 15000 });
  });

  test("Brand staff cannot access /admin/users and does not see Users nav item", async ({ page }) => {
    // 1. Authenticate as Brand Staff via API session
    await loginAs(page, "staff-orveen@example.com");

    // 2. Go to admin area
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Overview|ওভারভিউ/i, { timeout: 15000 });

    // 3. Confirm Users nav link is NOT visible for brand staff
    const usersNavLink = page.getByRole("link", { name: /Users|ইউজার/i });
    await expect(usersNavLink).toHaveCount(0);

    // 4. Attempting direct navigation to /admin/users redirects away to /admin
    await page.goto("/admin/users");
    await page.waitForURL((url) => url.pathname === "/admin", { timeout: 15000 });
    expect(page.url()).toContain("/admin");
  });
});
