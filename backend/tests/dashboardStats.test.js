const { TERMINAL_APPROVED } = require("../src/utils/collectionVerification");
const { istMidnightUtc, istEndOfDayUtc } = require("../src/utils/istDateRange");

const cacheStore = new Map();

jest.mock("../src/lib/cache", () => ({
  get: async (key) => cacheStore.get(key) || null,
  set: async (key, value) => {
    cacheStore.set(key, typeof value === "string" ? value : JSON.stringify(value));
    return true;
  },
  del: async (key) => {
    cacheStore.delete(key);
    return true;
  },
}));

const prismaMock = {
  booking: {
    count: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  opsClientPayment: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  opsVendorPayment: {
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  opsMiscExpense: { aggregate: jest.fn() },
  bookingTask: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  tripVendor: { aggregate: jest.fn(), count: jest.fn() },
  bookingVerification: { count: jest.fn() },
  opsHotelBooking: { count: jest.fn() },
  opsTransportFleet: { count: jest.fn() },
  admin: { findMany: jest.fn() },
};

jest.mock("../src/lib/prisma", () => ({ prisma: prismaMock }));

const {
  applyDashboardPermissions,
  outstandingFromTotals,
  verifiedReceiptWhere,
  getDashboardStatsPayload,
  computeRawDashboardStats,
} = require("../src/services/dashboardStatsService");

function emptyCounts() {
  prismaMock.booking.count.mockResolvedValue(0);
  prismaMock.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
  prismaMock.booking.findMany.mockResolvedValue([]);
  prismaMock.opsClientPayment.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
  prismaMock.opsClientPayment.findMany.mockResolvedValue([]);
  prismaMock.opsVendorPayment.aggregate.mockResolvedValue({ _sum: { advancePaid: 0 } });
  prismaMock.opsVendorPayment.count.mockResolvedValue(0);
  prismaMock.opsMiscExpense.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
  prismaMock.bookingTask.count.mockResolvedValue(0);
  prismaMock.bookingTask.groupBy.mockResolvedValue([]);
  prismaMock.bookingTask.findMany.mockResolvedValue([]);
  prismaMock.tripVendor.aggregate.mockResolvedValue({
    _sum: { agreedCost: 0, paidAmount: 0 },
  });
  prismaMock.tripVendor.count.mockResolvedValue(0);
  prismaMock.bookingVerification.count.mockResolvedValue(0);
  prismaMock.opsHotelBooking.count.mockResolvedValue(0);
  prismaMock.opsTransportFleet.count.mockResolvedValue(0);
  prismaMock.admin.findMany.mockResolvedValue([]);
}

describe("dashboard finance KPI math", () => {
  it("does not treat pending money as revenue or as a reduction of outstanding", () => {
    expect(outstandingFromTotals(20000, 0)).toBe(20000);
    expect(outstandingFromTotals(20000, 5000)).toBe(15000);
    expect(verifiedReceiptWhere("default").approvalStatus).toBe(TERMINAL_APPROVED);
  });
});

describe("dashboard permission strip (never share stripped cache)", () => {
  const raw = {
    bookings: 12,
    trips: 2,
    totalBookings: 12,
    totalTrips: 2,
    totalRevenue: 5000,
    pendingPayments: 79000,
    pendingVendorsCost: 100,
    pendingVendorsCount: 1,
    monthlyRevenue: [{ month: "2026-08", revenue: 5000 }],
    recentBookings: [{ id: "b1" }],
    cashFlow: { collectionToday: 5000, paymentsToday: 0, netCashInflow: 5000 },
    tripsRunningNow: [{ name: "Spiti" }],
    tripsDepartingNext7Days: [],
    attentionItems: [],
    approvalQueue: { paymentApprovals: 1 },
  };

  const superadmin = {
    id: "u-founder",
    role: "superadmin",
    tenantId: "default",
    permissions: ["*"],
  };
  const sales = {
    id: "u-sales",
    role: "sales",
    tenantId: "default",
    permissions: ["dashboard.view", "bookings.view"],
  };

  it("lets Superadmin see financial KPIs", () => {
    const out = applyDashboardPermissions(raw, superadmin);
    expect(out.totalRevenue).toBe(5000);
    expect(out.cashFlow.collectionToday).toBe(5000);
  });

  it("does not give Sales cached Superadmin financial KPIs", () => {
    const out = applyDashboardPermissions(raw, sales);
    expect(out.totalRevenue).toBeUndefined();
    expect(out.cashFlow).toBeUndefined();
    expect(out.monthlyRevenue).toBeUndefined();
    expect(out.pendingPayments).toBeUndefined();
    expect(out.totalBookings).toBe(12);
  });
});

describe("dashboard stats cache isolation", () => {
  beforeEach(() => {
    cacheStore.clear();
    emptyCounts();
    prismaMock.opsClientPayment.aggregate.mockResolvedValue({ _sum: { amount: 8888 } });
    prismaMock.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 20000 } });
    prismaMock.booking.count.mockResolvedValue(3);
  });

  const privileged = {
    id: "priv",
    role: "superadmin",
    tenantId: "default",
    permissions: ["*"],
  };
  const restricted = {
    id: "sales",
    role: "sales",
    tenantId: "default",
    permissions: ["dashboard.view", "bookings.view"],
  };

  it("privileged → restricted does not leak revenue", async () => {
    const first = await getDashboardStatsPayload(privileged, "today");
    expect(first.totalRevenue).toBe(8888);
    const second = await getDashboardStatsPayload(restricted, "today");
    expect(second.totalRevenue).toBeUndefined();
    expect(second.cashFlow).toBeUndefined();
    expect(second.totalBookings).toBe(3);
  });

  it("restricted → privileged does not poison privileged financial KPIs", async () => {
    const first = await getDashboardStatsPayload(restricted, "month");
    expect(first.totalRevenue).toBeUndefined();
    const second = await getDashboardStatsPayload(privileged, "month");
    expect(second.totalRevenue).toBe(8888);
  });

  it("does not share cache across tenants", async () => {
    await getDashboardStatsPayload(privileged, "year");
    prismaMock.opsClientPayment.aggregate.mockResolvedValue({ _sum: { amount: 1 } });
    const other = await getDashboardStatsPayload(
      { ...privileged, tenantId: "tenant-b" },
      "year",
    );
    expect(other.totalRevenue).toBe(1);
    const againDefault = await getDashboardStatsPayload(privileged, "year");
    expect(againDefault.totalRevenue).toBe(8888);
  });
});

describe("dashboard period + finance KPI wiring", () => {
  const now = new Date("2026-08-26T14:30:00.000Z");

  beforeEach(() => {
    cacheStore.clear();
    emptyCounts();
  });

  it("applies Today / Week / Month / Year createdAt bounds in IST", async () => {
    const cases = [
      ["today", "2026-08-26", istEndOfDayUtc("2026-08-26")],
      ["week", "2026-08-24", now],
      ["month", "2026-08-01", now],
      ["year", "2026-01-01", now],
    ];
    for (const [filter, startYmd, end] of cases) {
      prismaMock.booking.count.mockClear();
      await computeRawDashboardStats("default", filter, now);
      const where = prismaMock.booking.count.mock.calls[0][0].where;
      expect(where.createdAt.gte.toISOString()).toBe(istMidnightUtc(startYmd).toISOString());
      expect(where.createdAt.lte.toISOString()).toBe(end.toISOString());
    }
  });

  it("only queries founder-approved OpsClientPayment receipts as revenue", async () => {
    await computeRawDashboardStats("default", "today", now);
    const revenueCalls = prismaMock.opsClientPayment.aggregate.mock.calls;
    expect(revenueCalls.length).toBeGreaterThanOrEqual(3);
    for (const [args] of revenueCalls) {
      expect(args.where.approvalStatus).toBe(TERMINAL_APPROVED);
    }
  });

  it("wires period bookings, verified revenue, outstanding, collection today, and cash-out", async () => {
    prismaMock.booking.count.mockResolvedValue(7);
    prismaMock.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 20000 } });
    let receiptCall = 0;
    prismaMock.opsClientPayment.aggregate.mockImplementation(async () => {
      receiptCall += 1;
      if (receiptCall === 1) return { _sum: { amount: 0 } };
      if (receiptCall === 2) return { _sum: { amount: 0 } };
      return { _sum: { amount: 0 } };
    });
    const pending = await computeRawDashboardStats("t1", "today", now);
    expect(pending.totalRevenue).toBe(0);
    expect(pending.pendingPayments).toBe(20000);
    expect(pending.cashFlow.collectionToday).toBe(0);

    receiptCall = 0;
    prismaMock.opsClientPayment.aggregate.mockImplementation(async () => {
      receiptCall += 1;
      if (receiptCall === 1) return { _sum: { amount: 5000 } };
      if (receiptCall === 2) return { _sum: { amount: 5000 } };
      return { _sum: { amount: 5000 } };
    });
    prismaMock.opsVendorPayment.aggregate.mockResolvedValue({ _sum: { advancePaid: 1200 } });
    prismaMock.opsMiscExpense.aggregate.mockResolvedValue({ _sum: { amount: 300 } });
    const approved = await computeRawDashboardStats("t1", "today", now);
    expect(approved.totalBookings).toBe(7);
    expect(approved.totalRevenue).toBe(5000);
    expect(approved.pendingPayments).toBe(15000);
    expect(approved.cashFlow.collectionToday).toBe(5000);
    expect(approved.cashFlow.paymentsToday).toBe(1500);
    expect(approved.totalTrips).toBe(approved.tripsRunningNow.length);
  });

  it("counts vendors due today from fleet paymentDueDate, not all unpaid vendors", async () => {
    prismaMock.opsTransportFleet.count.mockImplementation(async ({ where }) => {
      if (where.paymentDueDate) return 2;
      if (where.confirmationStatus === "UNCONFIRMED") return 9;
      return 0;
    });
    prismaMock.tripVendor.count.mockResolvedValue(99);
    const raw = await computeRawDashboardStats("default", "today", now);
    const due = raw.attentionItems.find((i) => i.label === "Vendors with payments due today");
    const tempo = raw.attentionItems.find((i) => i.label === "Missing tempo confirmation");
    expect(due.count).toBe(2);
    expect(due.count).not.toBe(99);
    expect(tempo.count).toBe(9);
    const roomingCall = prismaMock.booking.count.mock.calls.find(
      ([args]) => args.where?.opsRoomAllocations,
    );
    expect(roomingCall[0].where.opsRoomAllocations.none.allocationStatus.in).toEqual([
      "ACTIVE",
      "NIGHT_JOURNEY_BLOCKED",
    ]);
  });

  it("pending vendor KPI uses OpsVendorPayment remainingPayable, not TripVendor", async () => {
    prismaMock.opsVendorPayment.aggregate.mockImplementation(async (args) => {
      if (args._sum?.remainingPayable) {
        return { _sum: { remainingPayable: 22000 }, _count: 3 };
      }
      return { _sum: { advancePaid: 400 } };
    });
    prismaMock.tripVendor.count.mockResolvedValue(99);
    const raw = await computeRawDashboardStats("default", "today", now);
    expect(raw.pendingVendorsCost).toBe(22000);
    expect(raw.pendingVendorsCount).toBe(3);
    const cashOutWhere = prismaMock.opsVendorPayment.aggregate.mock.calls.find(
      ([args]) => args._sum?.advancePaid,
    )[0].where;
    expect(cashOutWhere.approvalStatus).toBe(TERMINAL_APPROVED);
    expect(cashOutWhere.OR.some((clause) => clause.approvedByFounderAt)).toBe(true);
  });
});
