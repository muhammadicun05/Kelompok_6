import { test, expect } from "@playwright/test";

test.describe("Lukla Operations Engine - E2E Verification Suite", () => {
  test("Dashboard loads with ±70 machines KPI and industrial tokens", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("main h1")).toContainText("Dashboard Operasional Pabrik");
    await expect(page.getByText("Mesin Jahit Aktif", { exact: true })).toBeVisible();
    await expect(page.getByText("Output Terverifikasi Hari Ini", { exact: true })).toBeVisible();
    await expect(page.getByText("Tingkat Lolos QC Utuh", { exact: true })).toBeVisible();
    await expect(page.getByText("Blokir Anti-Kontaminasi", { exact: true })).toBeVisible();
  });

  test("UAT-01: Cross-Client Anti-Contamination Block Screen (FR-6.1 & FR-6.2)", async ({ page }) => {
    await page.goto("/warehouse");
    await expect(page.locator("main h1")).toContainText("Gudang Multi-Tenant & Anti-Kontaminasi");

    // Wait for async options to load from Supabase and select deterministically
    const materialOptionLocator = page.locator('select[data-testid="select-material"] option', { hasText: "Taslan Milky" });
    await materialOptionLocator.first().waitFor({ state: "attached" });
    const materialOption = await materialOptionLocator.first().getAttribute("value");
    if (materialOption) {
      await page.getByTestId("select-material").selectOption(materialOption);
    }

    const orderOptionLocator = page.locator('select[data-testid="select-target-order"] option', { hasText: "ORD-2026-003" });
    await orderOptionLocator.first().waitFor({ state: "attached" });
    const orderOption = await orderOptionLocator.first().getAttribute("value");
    if (orderOption) {
      await page.getByTestId("select-target-order").selectOption(orderOption);
    }

    // Click Keluarkan ke Cutting
    await page.getByRole("button", { name: "Keluarkan ke Cutting" }).click();

    // Verify Full Screen Red Alert Dialog appears
    const alertDialog = page.locator('div[role="alertdialog"]');
    await expect(alertDialog).toBeVisible();
    await expect(alertDialog).toContainText("Pengeluaran Dibatalkan!");
    await expect(alertDialog).toContainText("TIDAK COCOK");
    await expect(alertDialog).toContainText("Anti-Kontaminasi");

    // Dismiss modal
    await page.getByRole("button", { name: "Mengerti & Tutup" }).click();
    await expect(alertDialog).not.toBeVisible();
  });

  test("UAT-02: Dynamic Tailor Payroll & Saturday Piece Rate (FR-7.1, FR-7.3, FR-10.1)", async ({ page }) => {
    await page.goto("/payroll");
    await expect(page.locator("main h1")).toContainText("Workspace Payroll");

    // Check newly added workers from expansion line #61-#65 inside the payroll table
    await expect(page.locator("table").getByText("Budi Santoso (Penjahit Baru #61)")).toBeVisible();
    await expect(page.locator("table").getByText("Wawan Setiawan (Penjahit Baru #62)")).toBeVisible();

    // Check perforated payslip rendering
    await expect(page.getByText("SLIP GAJI MINGGUAN RESMI")).toBeVisible();
    await expect(page.getByText("TOTAL THP DITERIMA")).toBeVisible();
  });

  test("UAT-03: 3-Way QC Bonus Pool Split (FR-10.3)", async ({ page }) => {
    await page.goto("/qc/terminal");
    await expect(page.locator("main h1")).toContainText("Terminal Inspeksi QC");

    // Simulate 3,000 units pass
    await page.getByRole("button", { name: "Simulasikan 3.000 Unit Lolos (UAT-03)" }).click();

    // Verify Rp 900.000 pool split equally into Rp 300.000
    await expect(page.getByText("Rp 900.000", { exact: true })).toBeVisible();
    await expect(page.getByText("Rp 300.000", { exact: true })).toBeVisible();

    // Verify 3 Giant Buttons
    await expect(page.getByRole("button", { name: "LOLOS +Rp 300 ke Pool Bonus" })).toBeVisible();
    await expect(page.getByRole("button", { name: /PERBAIKAN/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /CACAT/i })).toBeVisible();
  });

  test("UAT-04: Sample Revision v1 -> v2 to Semi-CMT Mass Order", async ({ page }) => {
    await page.goto("/samples");
    await expect(page.locator("main h1")).toContainText("Sample & Time Study Tracker");

    // Check versions v1 and v2
    await expect(page.getByText("v1", { exact: true })).toBeVisible();
    await expect(page.getByText("v2", { exact: true })).toBeVisible();

    // Click "Jadikan Pesanan Massal"
    await page.getByRole("button", { name: "Jadikan Pesanan Massal" }).click();

    // Verify converted mass order card with inherited v2 specs
    await expect(page.getByText("Pesanan Massal Berhasil Diterbitkan")).toBeVisible();
    await expect(page.getByText("ORD-2026-004")).toBeVisible();
  });

  test("UAT-05: Tanya Lukla AI Knowledge Assistant & Citations", async ({ page }) => {
    await page.goto("/dashboard");

    // Click Tanya AI button
    await page.getByRole("button", { name: /Tanya AI/i }).click();

    // Verify drawer opens
    await expect(page.getByText("Tanya Lukla AI")).toBeVisible();

    // Click quick prompt about QC and wages
    await page.getByRole("button", { name: "Apakah gaji borongan terpengaruh oleh unit cacat di QC?" }).click();

    // Verify AI response arrives with "TIDAK terpengaruh" and citations
    await expect(page.getByText(/TIDAK terpengaruh oleh status QC/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Rujukan Dokumen:")).toBeVisible();
  });
});
