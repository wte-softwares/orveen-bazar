import { test, expect, type Page } from "@playwright/test";

async function loginAs(page: Page, email: string, password = "Password123!") {
  const loginRes = await page.request.post("/api/v1/auth/login", {
    data: { email, password },
  });
  expect(loginRes.ok()).toBeTruthy();

  const headers = loginRes.headersArray();
  const setCookieHeaders = headers.filter(
    (h: { name: string; value: string }) => h.name.toLowerCase() === "set-cookie"
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

test.describe("Admin Category Management", () => {
  test("Platform admin can view, create, edit, toggle, and be protected against deleting in-use categories", async ({
    page,
  }) => {
    page.on("console", (msg) => console.log("CATEGORIES PAGE CONSOLE:", msg.text()));
    page.on("pageerror", (err) => console.log("CATEGORIES PAGE JS ERROR:", err));

    // 1. Authenticate as Platform Admin
    await loginAs(page, "admin@example.com");

    // 2. Navigate to /admin/orveen-bazar/categories
    await page.goto("/admin/orveen-bazar/categories");
    await page.waitForLoadState("networkidle");

    // Verify title and page header
    await expect(page.locator("h1")).toContainText(/Category Management|ক্যাটাগরি ব্যবস্থাপনা/i, {
      timeout: 15000,
    });

    // 3. Confirm seeded categories are visible
    await expect(page.locator("body")).toContainText("Cooking Oil");
    await expect(page.locator("body")).toContainText("cooking-oil");

    // 4. Test In-Use Category Deletion Protection
    // Find the row with 'Cooking Oil' which has seeded items
    const cookingOilRow = page.locator("tr", { hasText: "Cooking Oil" });
    await expect(cookingOilRow).toBeVisible();

    // Click delete on cooking oil
    const deleteBtn = cookingOilRow.getByTitle(/Delete Category|ক্যাটাগরি মুছুন/i);
    await deleteBtn.click();

    // The dialog must warn that the category has items and disable the delete confirmation button
    const deleteDialog = page.getByRole("dialog");
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog).toContainText(/Move or archive them first|আইটেমগুলো অন্য ক্যাটাগরিতে সরান/i);

    // Ensure the submit button inside the dialog is disabled
    const confirmDeleteBtn = deleteDialog.getByRole("button", {
      name: /Delete Category|ক্যাটাগরি মুছুন/i,
    });
    await expect(confirmDeleteBtn).toBeDisabled();

    // Close dialog
    await deleteDialog.getByRole("button", { name: /Cancel/i }).click();
    await expect(deleteDialog).not.toBeVisible();

    // 5. Create a new test category with auto-slug
    const addCategoryBtn = page.getByRole("button", {
      name: /Add Category|নতুন ক্যাটাগরি যোগ করুন/i,
    });
    await addCategoryBtn.click();

    const categoryDialog = page.getByRole("dialog");
    await expect(categoryDialog).toBeVisible();

    const uniqueId = Date.now();
    const testCatName = `Test Spices ${uniqueId}`;
    await page.fill("#category-name", testCatName);

    // Verify auto-slug generated
    const slugInput = page.locator("#category-slug");
    await expect(slugInput).toHaveValue(`test-spices-${uniqueId}`);

    // Set sort order
    await page.fill("#category-sort-order", "99");

    // Submit
    const submitBtn = categoryDialog.getByRole("button", {
      name: /Save Category|সংরক্ষণ করুন/i,
    });
    await submitBtn.click();

    // Dialog closes and new category appears in the table
    await expect(categoryDialog).not.toBeVisible();
    const createdRow = page.locator("tr", { hasText: testCatName });
    await expect(createdRow).toBeVisible();
    await expect(createdRow).toContainText(`test-spices-${uniqueId}`);
    await expect(createdRow).toContainText(/0/);

    // 6. Test inline active toggle on the created category
    const toggleSwitch = createdRow.getByRole("switch");
    await expect(toggleSwitch).toBeChecked();

    await toggleSwitch.click();
    await expect(toggleSwitch).not.toBeChecked();

    // Toggle back
    await toggleSwitch.click();
    await expect(toggleSwitch).toBeChecked();

    // 7. Edit the created category
    const editBtn = createdRow.getByTitle(/Edit Category|ক্যাটাগরি সম্পাদনা/i);
    await editBtn.click();

    await expect(categoryDialog).toBeVisible();
    const updatedCatName = `Updated Spices ${uniqueId}`;
    await page.fill("#category-name", updatedCatName);
    await categoryDialog
      .getByRole("button", { name: /Update Category|আপডেট করুন/i })
      .click();

    await expect(categoryDialog).not.toBeVisible();
    await expect(page.locator("tr", { hasText: updatedCatName })).toBeVisible();

    // 8. Delete the unused category (since item_count = 0)
    const updatedRow = page.locator("tr", { hasText: updatedCatName });
    await updatedRow.getByTitle(/Delete Category|ক্যাটাগরি মুছুন/i).click();

    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog).toContainText(
      /Are you sure you want to permanently delete|আপনি কি নিশ্চিত যে এই ক্যাটাগরি মুছে ফেলতে চান/i
    );
    const confirmDeleteActiveBtn = deleteDialog.getByRole("button", {
      name: /Delete Category|ক্যাটাগরি মুছুন/i,
    });
    await expect(confirmDeleteActiveBtn).toBeEnabled();
    await confirmDeleteActiveBtn.click();

    await expect(deleteDialog).not.toBeVisible();
    await expect(page.locator("tr", { hasText: updatedCatName })).not.toBeVisible();
  });

  test("Brand staff can access their assigned org categories but is blocked from sibling orgs", async ({
    page,
  }) => {
    // Authenticate as Brand Staff assigned to orveen-bazar
    await loginAs(page, "staff-orveen@example.com");

    // Permitted: /admin/orveen-bazar/categories
    await page.goto("/admin/orveen-bazar/categories");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/Category Management|ক্যাটাগরি ব্যবস্থাপনা/i, {
      timeout: 15000,
    });

    // Blocked: /admin/eco-fast-bd/categories (redirects to /admin)
    await page.goto("/admin/eco-fast-bd/categories");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/admin/eco-fast-bd/categories");
  });
});
