"use strict";

const {
  istDayBounds,
  sameIstDay,
  computeEffectivePaid,
  sumActiveStationCollections,
} = require("../src/utils/stationPaymentBalance");

describe("stationPaymentBalance", () => {
  test("istDayBounds uses India calendar day", () => {
    const b = istDayBounds("2026-09-08");
    expect(b).not.toBeNull();
    expect(b.start.toISOString()).toBe("2026-09-07T18:30:00.000Z");
    expect(sameIstDay("2026-09-08T00:00:00.000Z", "2026-09-08")).toBe(true);
    expect(sameIstDay("2026-09-09T00:00:00.000Z", "2026-09-08")).toBe(false);
  });

  test("computeEffectivePaid prefers accounting or receipt stack", () => {
    const ramesh = computeEffectivePaid({
      totalAmount: 78745,
      opsClientPayments: [],
      legacyPayments: [],
      stationPayments: [
        {
          paymentMode: "CASH",
          collectionStatus: "COLLECTED",
          isReversed: false,
          amount: 10000,
        },
        {
          paymentMode: "CASH",
          collectionStatus: "COLLECTED",
          isReversed: false,
          amount: 43745,
        },
      ],
      accountingEntries: [
        { status: "APPROVED", amount: 25000 },
        { status: "APPROVED", amount: 10000 },
        { status: "APPROVED", amount: 43745 },
      ],
    });
    expect(ramesh.paidAmount).toBe(78745);
    expect(ramesh.remainingAmount).toBe(0);
    expect(ramesh.stationSum).toBe(53745);
  });

  test("cancelled station cash is excluded from active sum", () => {
    const sum = sumActiveStationCollections([
      {
        paymentMode: "CASH",
        collectionStatus: "CANCELLED",
        isReversed: false,
        amount: 10000,
      },
      {
        paymentMode: "CASH",
        collectionStatus: "COLLECTED",
        isReversed: false,
        amount: 5000,
      },
      {
        paymentMode: "UPI",
        collectionStatus: "COLLECTED",
        upiVerificationStatus: "PENDING_VERIFICATION",
        isReversed: false,
        amount: 9000,
      },
      {
        paymentMode: "UPI",
        collectionStatus: "COLLECTED",
        upiVerificationStatus: "VERIFIED",
        isReversed: false,
        amount: 3000,
      },
    ]);
    expect(sum).toBe(8000);
  });

  test("legacy Payment success counts as cleared paid", () => {
    const sanjay = computeEffectivePaid({
      totalAmount: 23500,
      opsClientPayments: [],
      legacyPayments: [{ status: "success", amount: 5000 }],
      stationPayments: [],
      accountingEntries: [],
    });
    expect(sanjay.paidAmount).toBe(5000);
    expect(sanjay.remainingAmount).toBe(18500);
  });
});
