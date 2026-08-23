const {
  computeOriginBalanceAfterRefund,
  mapRefundQueueItem,
} = require("../src/utils/refundErpSync");

describe("refund ERP sync", () => {
  it("releases cash + credit from the origin booking paid balance", () => {
    const result = computeOriginBalanceAfterRefund(
      { advancePaid: 44000, totalAmount: 44000, status: "cancelled" },
      22000,
      22000,
    );
    expect(result.released).toBe(44000);
    expect(result.newPaid).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.paymentStatus).toBe("REFUNDED");
  });

  it("keeps a live booking partial after a cash-only refund", () => {
    const result = computeOriginBalanceAfterRefund(
      { advancePaid: 10000, totalAmount: 20000, status: "confirmed" },
      3000,
      0,
    );
    expect(result.newPaid).toBe(7000);
    expect(result.remaining).toBe(13000);
    expect(result.paymentStatus).toBe("PARTIAL");
  });

  it("adds departure workspace href on queue items", () => {
    const row = mapRefundQueueItem({
      id: "rf_1",
      status: "PENDING_APPROVAL",
      refundAmount: 22000,
      creditNoteAmount: 0,
      booking: {
        bookingId: "YC-1",
        fullName: "Asha",
        tripId: "trip_1",
        tripName: "Spiti",
        departureDate: new Date("2026-09-08T00:00:00.000Z"),
      },
    });
    expect(row.customerName).toBe("Asha");
    expect(row.totalRequested).toBe(22000);
    expect(row.workflow).toBe("Pending FC");
    expect(row.departureHref).toContain("/admin/departure-workspace");
    expect(row.departureHref).toContain("tab=overview");
  });
});
