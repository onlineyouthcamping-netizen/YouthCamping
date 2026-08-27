const {
  overlayCustomerFacingCollection,
  sumRecordedCollectionsForBooking,
} = require("../src/utils/paymentStatus");
const { templates } = require("../src/lib/email");

describe("customer-facing booking confirmation amounts", () => {
  it("uses the salesperson-recorded amount when verified collected is still 0", () => {
    const facing = overlayCustomerFacingCollection(
      { advancePaid: 0, totalAmount: 20000 },
      0,
      5000,
    );
    expect(facing.advancePaid).toBe(5000);
    expect(facing.remainingAmount).toBe(15000);
  });

  it("prefers the larger of verified, recorded receipts, and extra collected", () => {
    const facing = overlayCustomerFacingCollection(
      { advancePaid: 2000, totalAmount: 20000 },
      8000,
      5000,
    );
    expect(facing.advancePaid).toBe(8000);
    expect(facing.remainingAmount).toBe(12000);
  });

  it("sums pending (unverified) receipts and ignores rejected/refunded ones", async () => {
    const prisma = {
      opsClientPayment: {
        findMany: jest.fn().mockResolvedValue([
          { amount: 5000 },
          { amount: 2500 },
        ]),
      },
    };

    const sum = await sumRecordedCollectionsForBooking(
      prisma,
      "booking-cuid",
      "BK-123",
    );

    expect(sum).toBe(7500);
    expect(prisma.opsClientPayment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bookingId: { in: ["booking-cuid", "BK-123"] },
          NOT: { status: { in: ["Rejected", "Refunded", "REJECTED", "REFUNDED"] } },
        }),
      }),
    );
  });

  it("shows Amount Received from salesperson confirm amount, not ₹0", () => {
    const email = templates.confirmation({
      bookingId: "BK-TEST",
      tripName: "Spiti Circuit",
      fullName: "Test Traveller",
      email: "test@example.com",
      totalAmount: 20000,
      advancePaid: 5000,
      remainingAmount: 15000,
      paymentMode: "UPI",
    });

    expect(email.html).toContain("₹ 5,000");
    expect(email.html).toContain("₹ 15,000");
    expect(email.html).not.toMatch(/Amount Received \(Advance\)[\s\S]*₹ 0\b/);
  });
});
