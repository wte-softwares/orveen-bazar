import { test, expect } from "@playwright/test";

test.describe("Customer Authentication & Password Flows", () => {
  test("Login rejects invalid credentials with generic security message", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Check title / heading
    await expect(page.locator("h1")).toContainText(/Welcome back|আবার স্বাগতম/i);

    // Fill incorrect credentials
    await page.locator('input[type="email"]').fill("wrong-user@example.com");
    await page.locator('input[type="password"]').fill("WrongPassword123!");
    await page.locator('button[type="submit"]').click();

    // Verify error notification
    await expect(page.locator('p[role="alert"]')).toContainText(
      /Incorrect email or password|কিছু ভুল হয়েছে/i
    );
  });

  test("Login authenticates valid credentials and redirects to intended destination", async ({ page }) => {
    // Visit login with a redirect query param
    await page.goto("/login?redirect=/catalog");
    await page.waitForLoadState("networkidle");

    // Enter seeded platform admin or test customer credentials
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("Password123!");
    await page.locator('button[type="submit"]').click();

    // Staff / Admin automatically redirects to /admin
    await page.waitForURL(/\/admin/);
    expect(page.url()).toContain("/admin");
  });

  test("Register form validates mismatched passwords and submits registration", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Create your account|আপনার অ্যাকাউন্ট তৈরি করুন/i);

    // Mismatched passwords
    await page.locator('input[id="displayName"]').fill("Test Register Customer");
    await page.locator('input[id="email"]').fill(`newcustomer_${Date.now()}@example.com`);
    await page.locator('input[id="password"]').fill("Password123!");
    await page.locator('input[id="confirm-password"]').fill("PasswordMismatch456!");
    await page.locator('button[type="submit"]').click();

    // Error alert
    await expect(page.locator('p[role="alert"]')).toContainText(
      /Passwords don't match|পাসওয়ার্ড মিলছে না/i
    );

    // Matching passwords
    await page.locator('input[id="confirm-password"]').fill("Password123!");
    await page.locator('button[type="submit"]').click();

    // Either confirms email check notice or navigates to account
    await expect(
      page.locator("body").filter({
        hasText: /Check your email|আপনার ইমেইল দেখুন|My Account|আমার অ্যাকাউন্ট/i,
      })
    ).toBeVisible({ timeout: 15000 });
  });

  test("Forgot password form sends recovery link and confirms request", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Forgot your password|পাসওয়ার্ড ভুলে গেছেন/i);

    await page.locator('input[id="email"]').fill("admin@example.com");
    await page.locator('button[type="submit"]').click();

    // Success status message appears (never revealing whether account exists)
    await expect(page.locator('[role="status"]')).toContainText(
      /If that email is registered, a reset link has been sent|রিসেট লিংক পাঠানো হয়েছে/i
    );
  });

  test("Reset password page blocks unauthenticated visitors without a valid recovery token", async ({ page }) => {
    await page.goto("/reset-password");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Set a new password|নতুন পাসওয়ার্ড সেট করুন/i);

    await page.locator('input[id="password"]').fill("NewPassword123!");
    await page.locator('input[id="confirm-password"]').fill("NewPassword123!");
    await page.locator('button[type="submit"]').click();

    // Rejects because no recovery session was established
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });
});
