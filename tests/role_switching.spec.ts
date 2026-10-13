import { test, expect } from "@playwright/test";

test.describe("Role-Based Access Control (RBAC) & View Switching", () => {
  test("Selecting QC_INSPECTOR automatically navigates to /qc/terminal and filters menu", async ({ page }) => {
    await page.goto("/dashboard");

    // Select QC_INSPECTOR in header
    const roleSelect = page.locator("header select");
    await roleSelect.selectOption("QC_INSPECTOR");

    // Verify URL navigated to /qc/terminal
    await expect(page).toHaveURL(/\/qc\/terminal/);
    await expect(page.locator("main h1")).toContainText("Terminal Inspeksi QC");

    // Verify persona banner shows Teh Reni
    await expect(page.getByText("Teh Reni (QC Inspector)")).toBeVisible();
  });

  test("Selecting WAREHOUSE automatically navigates to /warehouse", async ({ page }) => {
    await page.goto("/dashboard");

    const roleSelect = page.locator("header select");
    await roleSelect.selectOption("WAREHOUSE");

    await expect(page).toHaveURL(/\/warehouse/);
    await expect(page.locator("main h1")).toContainText("Gudang Multi-Tenant");
    await expect(page.getByText("Kang Asep (Kepala Gudang)")).toBeVisible();
  });

  test("Selecting B2B_CLIENT isolates view to /b2b-portal", async ({ page }) => {
    await page.goto("/dashboard");

    const roleSelect = page.locator("header select");
    await roleSelect.selectOption("B2B_CLIENT");

    await expect(page).toHaveURL(/\/b2b-portal/);
    await expect(page.getByText("Pak Hendra (Klien Maklon A)")).toBeVisible();
    await expect(page.getByText("Multi-Tenant RLS Terkunci")).toBeVisible();
  });

  test("Selecting TAILOR_OPERATOR navigates to /production/terminal in Tailor Mode", async ({ page }) => {
    await page.goto("/dashboard");

    const roleSelect = page.locator("header select");
    await roleSelect.selectOption("TAILOR_OPERATOR");

    await expect(page).toHaveURL(/\/production\/terminal/);
    await expect(page.getByText("Siti Rahma (Penjahit #01)")).toBeVisible();
    await expect(page.getByText("Kirim Laporan ke Mandor (Pending)")).toBeVisible();
  });
});
