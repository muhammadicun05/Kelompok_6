import { test, expect } from "@playwright/test";

test.describe("Strix Security & Penetration Audit Suite", () => {
  test("SEC-01: Anti-Contamination Direct API Bypass Block (FR-6.2 Penetration Test)", async ({ request }) => {
    // Malicious attempt: Bypassing frontend to issue material owned by Klien A to an order owned by Klien B
    const maliciousPayload = {
      itemId: "f2222222-2222-2222-2222-222222222222", // Klien A stock
      targetOrderId: "e3333333-3333-3333-3333-333333333333", // Klien B order
      qty: 100,
      operatorId: "a1111111-0000-0000-0000-000000000003",
    };

    const response = await request.post("/api/anti-contamination", {
      data: maliciousPayload,
    });

    // Expect HTTP 403 Forbidden with explicit contamination block
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.blocked).toBe(true);
    expect(body.success).toBe(false);
    expect(body.message).toContain("BLOKIR ANTI-KONTAMINASI [FR-6.2]");
  });

  test("SEC-02: Meal Allowance Range Boundary Validation (FR-10.2 Tamper Test)", async ({ request }) => {
    // Malicious attempt: Tampering meal allowance percentage to 50% or 0%
    const tamperedPayload = {
      periodCode: "PAY-SEC-TAMPER-TEST",
      mealPct: 50.0, // Invalid, BRD locks range to 10-15%
    };

    const response = await request.post("/api/payroll/calculate", {
      data: tamperedPayload,
    });

    // Expect rejection from database constraint / procedure
    expect(response.status()).toBe(500);
    const body = await response.json();
    expect(body.message).toContain("Uang makan wajib berada di rentang 10% s/d 15%");
  });

  test("SEC-03: Piece Rate Wage No-Clawback Integrity Check (Asumsi #1 Audit)", async ({ request }) => {
    // Verify that tailor piece rate wages are calculated strictly from verified 30-min outputs
    const validPayload = {
      periodCode: "PAY-INTEGRITY-AUDIT",
      mealPct: 12.0,
      numMandors: 2,
    };

    const response = await request.post("/api/payroll/calculate", {
      data: validPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.calculation.total_piece_rate).toBeGreaterThan(0);

    // Verify all tailor items have take_home_pay >= piece_rate_subtotal (no negative clawbacks)
    for (const item of body.items) {
      if (item.worker_role === "TAILOR_OPERATOR") {
        expect(Number(item.take_home_pay)).toBeGreaterThanOrEqual(Number(item.piece_rate_subtotal));
      }
    }
  });
});
