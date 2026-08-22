const {
  computeVendorBalance,
  vendorIdentityKey,
  normalizeVendorCategory,
} = require("../src/utils/vendorBalance");
const { isEligibleCollectionAssignee } = require("../src/utils/collectionVerification");

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    admin: { findMany: jest.fn(), findFirst: jest.fn() },
    accountingEntry: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    accountingEntryLog: { create: jest.fn() },
    opsClientPayment: { findFirst: jest.fn() },
    opsVendorPayment: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    opsHotelBooking: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    opsTransportFleet: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    opsGuidePayment: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    opsActivity: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    opsDepartureActivity: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    financeAuditLog: { create: jest.fn() },
    booking: { update: jest.fn() },
    stationPaymentCollection: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    bookingActivityLog: { create: jest.fn() },
  },
}));

const { prisma } = require("../src/lib/prisma");
const {
  assignIncomingPayment,
  listCollectionVerifiers,
  getVendorPaymentsQueue,
  verifyVendorPayment,
  batchVerifyStationCash,
} = require("../src/controllers/financeController");
const {
  reviewVendorPaymentFC,
  approveVendorPaymentFounder,
  rejectVendorPayment,
} = require("../src/controllers/financeApprovalController");
const { syncOperationalVendorRecord } = require("../src/controllers/paymentController");

function createRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

describe("vendor balance", () => {
  it("keeps signed outstanding and labels overpayment", () => {
    const over = computeVendorBalance(0, 2000);
    expect(over.totalCost).toBe(0);
    expect(over.paidAmount).toBe(2000);
    expect(over.outstandingAmount).toBe(-2000);
    expect(over.isOverpaid).toBe(true);
    expect(over.overpaidAmount).toBe(2000);
    expect(over.dueAmount).toBe(0);
  });

  it("computes a normal due balance without clamping paid", () => {
    const due = computeVendorBalance(10000, 3000);
    expect(due.outstandingAmount).toBe(7000);
    expect(due.isOverpaid).toBe(false);
  });

  it("identifies a vendor by trip, date, name, and category — not name+amount", () => {
    const a = vendorIdentityKey({
      tripId: "trip-1",
      departureDate: "2026-08-01",
      vendorName: "Hotel Manali",
      category: "Hotels",
    });
    const b = vendorIdentityKey({
      tripId: "trip-1",
      departureDate: "2026-08-01",
      vendorName: "Hotel Manali",
      category: "Hotels",
    });
    const c = vendorIdentityKey({
      tripId: "trip-1",
      departureDate: "2026-08-01",
      vendorName: "Hotel Manali",
      category: "Transport",
    });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(normalizeVendorCategory("hotel stay")).toBe("Hotels");
  });
});

describe("collection assignee identity", () => {
  it("allows only Founder and Finance Controller", () => {
    expect(isEligibleCollectionAssignee({ role: "founder" })).toBe(true);
    expect(isEligibleCollectionAssignee({ role: "finance_controller" })).toBe(true);
    expect(isEligibleCollectionAssignee({ role: "admin" })).toBe(false);
    expect(isEligibleCollectionAssignee({ role: "sales" })).toBe(false);
    expect(isEligibleCollectionAssignee({ role: "finance" })).toBe(false);
  });
});

describe("assignIncomingPayment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a sales assignee with 403 and does not write", async () => {
    prisma.admin.findFirst.mockResolvedValue({
      id: "sales_1",
      role: "sales",
      name: "Sales",
      tenantId: "tenant-a",
      isActive: true,
    });
    const res = createRes();
    await assignIncomingPayment(
      {
        params: { id: "acc_1" },
        body: { assigneeId: "sales_1" },
        user: { id: "fc_1", role: "finance_controller", tenantId: "tenant-a" },
      },
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.accountingEntry.update).not.toHaveBeenCalled();
  });

  it("assigns a finance controller on the same tenant", async () => {
    prisma.admin.findFirst.mockResolvedValue({
      id: "fc_1",
      role: "finance_controller",
      name: "Finance Controller",
      email: "fc@youthcamping.online",
      tenantId: "tenant-a",
      isActive: true,
    });
    prisma.accountingEntry.findFirst.mockResolvedValue({
      id: "acc_1",
      tenantId: "tenant-a",
      status: "PENDING",
    });
    prisma.accountingEntry.update.mockResolvedValue({
      id: "acc_1",
      actionedById: "fc_1",
      actionedBy: { id: "fc_1", name: "Finance Controller" },
    });
    prisma.accountingEntryLog.create.mockResolvedValue({});
    const res = createRes();
    await assignIncomingPayment(
      {
        params: { id: "acc_1" },
        body: { assigneeId: "fc_1" },
        user: { id: "founder_1", role: "founder", tenantId: "tenant-a" },
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(prisma.accountingEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { actionedById: "fc_1" },
      }),
    );
  });
});

describe("listCollectionVerifiers", () => {
  it("returns only Founder and Finance Controller records", async () => {
    prisma.admin.findMany.mockResolvedValue([
      { id: "1", role: "founder", name: "Founder", email: "f@x.com" },
      { id: "2", role: "finance_controller", name: "FC", email: "fc@x.com" },
      { id: "3", role: "sales", name: "Sales", email: "s@x.com" },
      { id: "4", role: "admin", name: "Admin", email: "a@x.com" },
    ]);
    const res = createRes();
    await listCollectionVerifiers({ user: { tenantId: "tenant-a" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((u) => u.role)).toEqual(["founder", "finance_controller"]);
  });
});

describe("getVendorPaymentsQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.opsHotelBooking.findMany.mockResolvedValue([]);
    prisma.opsTransportFleet.findMany.mockResolvedValue([]);
    prisma.opsGuidePayment.findMany.mockResolvedValue([]);
  });

  it("maps Departure Hub OpsVendorPayment totals without inventing a second source", async () => {
    prisma.opsVendorPayment.findMany.mockResolvedValue([
      {
        id: "vp_1",
        tripId: "trip_1",
        vendorName: "Hotel Ridge",
        category: "Hotels",
        agreedAmount: 8000,
        advancePaid: 2000,
        remainingPayable: -2000,
        approvalStatus: "PENDING",
        status: "Advance Paid",
        departureDate: new Date("2026-08-01"),
        trip: { title: "Spiti" },
        createdAt: new Date(),
      },
    ]);
    const res = createRes();
    await getVendorPaymentsQueue({ user: { tenantId: "tenant-a" }, query: {} }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].totalCost).toBe(8000);
    expect(res.body.data[0].paidAmount).toBe(2000);
    expect(res.body.data[0].outstandingAmount).toBe(6000);
    expect(res.body.data[0].isOverpaid).toBe(false);
    expect(res.body.data[0].operationalLinked).toBe(false);
    expect(res.body.data[0].sourceType).toBe("OPS_VENDOR_PAYMENT");
  });

  it("does not hide an overpayment by clamping to zero", async () => {
    prisma.opsVendorPayment.findMany.mockResolvedValue([
      {
        id: "vp_2",
        tripId: "trip_1",
        vendorName: "Hotel Ridge",
        category: "Hotels",
        agreedAmount: 0,
        advancePaid: 2000,
        remainingPayable: -2000,
        approvalStatus: "PENDING",
        status: "Advance Paid",
        departureDate: new Date("2026-08-01"),
        trip: { title: "Spiti" },
        createdAt: new Date(),
      },
    ]);
    const res = createRes();
    await getVendorPaymentsQueue({ user: { tenantId: "tenant-a" }, query: {} }, res);
    expect(res.body.data[0].outstandingAmount).toBe(-2000);
    expect(res.body.data[0].isOverpaid).toBe(true);
    expect(res.body.data[0].overpaidAmount).toBe(2000);
  });

  it("includes a Departure Hub hotel liability that is not yet an OpsVendorPayment", async () => {
    prisma.opsVendorPayment.findMany.mockResolvedValue([]);
    prisma.opsHotelBooking.findMany.mockResolvedValue([
      {
        id: "hb_1",
        tripId: "trip_1",
        hotelName: "Camp Site",
        totalAmount: 12000,
        advancePaid: 0,
        departureDate: new Date("2026-09-01"),
        trip: { title: "Manali" },
        createdAt: new Date(),
      },
    ]);
    const res = createRes();
    await getVendorPaymentsQueue({ user: { tenantId: "tenant-a" }, query: {} }, res);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].vendorName).toBe("Camp Site");
    expect(res.body.data[0].totalCost).toBe(12000);
    expect(res.body.data[0].sourceType).toBe("OPS_HOTEL_BOOKING");
    expect(res.body.data[0].sourceId).toBe("hb_1");
    expect(res.body.data[0].operationalLinked).toBe(true);
    expect(res.body.data[0].departureHref).toContain("/admin/departure-workspace");
  });
});

describe("vendor two-step stays intact", () => {
  it("exports FC review and Founder approve as separate handlers", () => {
    expect(typeof reviewVendorPaymentFC).toBe("function");
    expect(typeof approveVendorPaymentFounder).toBe("function");
  });

  it("reviews a Departure Hub hotel id against the created OpsVendorPayment id, not the hotel id", async () => {
    const hotel = {
      id: "hb_1",
      tenantId: "tenant-a",
      tripId: "trip_1",
      hotelName: "Camp Site",
      totalAmount: 12000,
      advancePaid: 0,
      departureDate: new Date("2026-09-01"),
    };
    const created = {
      id: "vp_created",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Camp Site",
      category: "Hotels",
      agreedAmount: 12000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      status: "Pending Approval",
      departureDate: hotel.departureDate,
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_1",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue({ ...created, trip: { title: "Manali" }, collectionAccount: null }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({
          ...created,
          approvalStatus: "REVIEWED_FINANCE_CONTROLLER",
          trip: { title: "Manali" },
          collectionAccount: null,
        }),
      },
      opsHotelBooking: {
        findFirst: jest.fn().mockResolvedValue(hotel),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));

    const res = createRes();
    await reviewVendorPaymentFC(
      {
        params: { paymentId: "hb_1" },
        body: {},
        user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(tx.opsVendorPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "tenant-a",
          sourceType: "OPS_HOTEL_BOOKING",
          sourceId: "hb_1",
        }),
      }),
    );
    expect(tx.opsVendorPayment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "vp_created", tenantId: "tenant-a" }),
      }),
    );
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "hb_1", tenantId: "tenant-a" },
        data: expect.objectContaining({ advancePaid: 0 }),
      }),
    );
  });
});

describe("verifyVendorPayment does not settle customer or vendor paid amounts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("VERIFY does not change customer booking.advancePaid or vendor advancePaid", async () => {
    prisma.opsVendorPayment.findFirst.mockResolvedValue({ id: "vp_1" });
    const res = createRes();
    await verifyVendorPayment(
      {
        params: { id: "vp_1" },
        body: { action: "VERIFY", paidAmount: 5000 },
        user: { id: "fc_1", role: "finance_controller", tenantId: "tenant-a" },
      },
      res,
    );
    expect(res.statusCode).toBe(409);
    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.opsVendorPayment.update).not.toHaveBeenCalled();
    expect(prisma.opsHotelBooking.updateMany).not.toHaveBeenCalled();
  });
});

describe("syncOperationalVendorRecord is canonical source + tenantId only", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not name-match or modify unrelated rows when the operational id does not resolve", async () => {
    prisma.opsHotelBooking.updateMany.mockResolvedValue({ count: 0 });
    const result = await syncOperationalVendorRecord(
      {
        tenantId: "tenant-a",
        sourceType: "OPS_HOTEL_BOOKING",
        sourceId: "not-a-hotel-id",
        agreed: 12000,
        advance: 4000,
      },
      prisma,
    );
    expect(result.resolved).toBe(false);
    expect(prisma.opsHotelBooking.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.opsHotelBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "not-a-hotel-id", tenantId: "tenant-a" },
      }),
    );
    const where = prisma.opsHotelBooking.updateMany.mock.calls[0][0].where;
    expect(where.hotelName).toBeUndefined();
    expect(where.notes).toBeUndefined();
  });

  it("does not write back historical rows that have no stored source", async () => {
    const result = await syncOperationalVendorRecord(
      {
        tenantId: "tenant-a",
        sourceType: null,
        sourceId: null,
        agreed: 12000,
        advance: 4000,
      },
      prisma,
    );
    expect(result.resolved).toBe(false);
    expect(prisma.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(prisma.opsTransportFleet.updateMany).not.toHaveBeenCalled();
    expect(prisma.opsGuidePayment.updateMany).not.toHaveBeenCalled();
  });
});

describe("rejectVendorPayment ID handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a canonical Finance vendor payment id", async () => {
    const payment = {
      id: "vp_1",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Camp Site",
      approvalStatus: "PENDING",
      status: "Pending Approval",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...payment, approvalStatus: "REJECTED", status: "Rejected" }),
      },
      opsHotelBooking: { findFirst: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await rejectVendorPayment(
      {
        params: { paymentId: "vp_1" },
        body: { reason: "Invoice mismatch" },
        user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(tx.opsVendorPayment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "vp_1", tenantId: "tenant-a" }),
      }),
    );
  });

  it("rejects an operational hotel id by the stored source link", async () => {
    const hotel = { id: "hb_1", tenantId: "tenant-a", tripId: "trip_1", departureDate: new Date("2026-09-01") };
    const payment = {
      id: "vp_linked",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Camp Site",
      approvalStatus: "PENDING",
      status: "Pending Approval",
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_1",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(payment),
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...payment, approvalStatus: "REJECTED" }),
      },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(hotel) },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await rejectVendorPayment(
      {
        params: { paymentId: "hb_1" },
        body: { reason: "Duplicate booking" },
        user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(tx.opsVendorPayment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "vp_linked", tenantId: "tenant-a" }),
      }),
    );
    expect(tx.opsVendorPayment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "tenant-a", sourceType: "OPS_HOTEL_BOOKING", sourceId: "hb_1" },
      }),
    );
  });

  it("returns 404 for an invalid id", async () => {
    const tx = {
      opsVendorPayment: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn() },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null) },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null) },
      opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await rejectVendorPayment(
      {
        params: { paymentId: "missing" },
        body: { reason: "Not found case" },
        user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for a cross-tenant vendor payment id", async () => {
    const tx = {
      opsVendorPayment: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn() },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null) },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null) },
      opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await rejectVendorPayment(
      {
        params: { paymentId: "vp_other_tenant" },
        body: { reason: "Cross tenant" },
        user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );
    expect(res.statusCode).toBe(404);
    expect(tx.opsVendorPayment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "vp_other_tenant", tenantId: "tenant-a" },
      }),
    );
  });
});

describe("canonical DH ↔ vendor payment write-back", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function reviewReq(paymentId, tenantId = "tenant-a", extra = {}) {
    return {
      params: { paymentId },
      body: extra.body || {},
      user: { id: "fc_1", name: "FC", role: "finance_controller", tenantId },
      ip: "127.0.0.1",
      get: () => "jest",
    };
  }

  it("1 hotel: DH record → OpsVendorPayment source → write-back same hotel", async () => {
    const hotel = {
      id: "hb_hotel",
      tenantId: "tenant-a",
      tripId: "trip_1",
      hotelName: "Ridge Camp",
      totalAmount: 15000,
      advancePaid: 0,
      departureDate: new Date("2026-10-01"),
    };
    const created = {
      id: "vp_hotel",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Ridge Camp",
      category: "Hotels",
      agreedAmount: 15000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_hotel",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue(created),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...created, approvalStatus: "REVIEWED_FINANCE_CONTROLLER" }),
      },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(hotel), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("hb_hotel"), res);
    expect(res.statusCode).toBe(200);
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "hb_hotel", tenantId: "tenant-a" } }),
    );
  });

  it("2 fleet: DH record → source → write-back same fleet", async () => {
    const fleet = {
      id: "fl_1",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Hill Cabs",
      totalAmount: 8000,
      advancePaid: 0,
      departureDate: new Date("2026-10-01"),
    };
    const created = {
      id: "vp_fleet",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Hill Cabs",
      category: "Transport",
      agreedAmount: 8000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      sourceType: "OPS_TRANSPORT_FLEET",
      sourceId: "fl_1",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue(created),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...created, approvalStatus: "REVIEWED_FINANCE_CONTROLLER" }),
      },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(fleet), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("fl_1"), res);
    expect(res.statusCode).toBe(200);
    expect(tx.opsVendorPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sourceType: "OPS_TRANSPORT_FLEET", sourceId: "fl_1", tenantId: "tenant-a" }),
      }),
    );
    expect(tx.opsTransportFleet.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "fl_1", tenantId: "tenant-a" } }),
    );
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
  });

  it("3 guide: DH record → source → write-back same guide", async () => {
    const guide = {
      id: "gp_1",
      tenantId: "tenant-a",
      tripId: "trip_1",
      guideName: "Aman Guide",
      agreedAmount: 5000,
      advancePaid: 0,
      departureDate: new Date("2026-10-01"),
    };
    const created = {
      id: "vp_guide",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Aman Guide",
      category: "Guides",
      agreedAmount: 5000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      sourceType: "OPS_GUIDE_PAYMENT",
      sourceId: "gp_1",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue(created),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...created, approvalStatus: "REVIEWED_FINANCE_CONTROLLER" }),
      },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(guide), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("gp_1"), res);
    expect(res.statusCode).toBe(200);
    expect(tx.opsGuidePayment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "gp_1", tenantId: "tenant-a" },
        data: expect.objectContaining({ advancePaid: 0 }),
      }),
    );
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(tx.opsTransportFleet.updateMany).not.toHaveBeenCalled();
  });

  it("4 invalid operational id does not update another record", async () => {
    const tx = {
      opsVendorPayment: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn() },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("ghost_id"), res);
    expect(res.statusCode).toBe(404);
    expect(tx.opsVendorPayment.create).not.toHaveBeenCalled();
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(tx.opsTransportFleet.updateMany).not.toHaveBeenCalled();
    expect(tx.opsGuidePayment.updateMany).not.toHaveBeenCalled();
  });

  it("5 cross-tenant review cannot write another tenant's hotel", async () => {
    const tx = {
      opsVendorPayment: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn() },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("hb_1", "tenant-b"), res);
    expect(res.statusCode).toBe(404);
    expect(tx.opsHotelBooking.findFirst).toHaveBeenCalledWith({ where: { id: "hb_1", tenantId: "tenant-b" } });
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(tx.opsVendorPayment.create).not.toHaveBeenCalled();
  });

  it("6 paying twice does not double finance paid, DH paid, or audit", async () => {
    const payment = {
      id: "vp_once",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Ridge Camp",
      category: "Hotels",
      agreedAmount: 10000,
      advancePaid: 10000,
      approvalStatus: "REVIEWED_FINANCE_CONTROLLER",
      status: "Pending Approval",
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_once",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn(),
      },
      opsHotelBooking: { findFirst: jest.fn(), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("vp_once"), res);
    expect(res.statusCode).toBe(409);
    expect(tx.opsVendorPayment.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(tx.financeAuditLog.create).not.toHaveBeenCalled();
  });

  it("7 finance CUID still write-backs the stored DH sourceId", async () => {
    const payment = {
      id: "vp_cuid_finance",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Ridge Camp",
      category: "Hotels",
      agreedAmount: 9000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_from_dh",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue(payment),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...payment, approvalStatus: "REVIEWED_FINANCE_CONTROLLER" }),
        create: jest.fn(),
      },
      opsHotelBooking: { findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      opsTransportFleet: { findFirst: jest.fn(), updateMany: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn(), updateMany: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("vp_cuid_finance"), res);
    expect(res.statusCode).toBe(200);
    expect(tx.opsVendorPayment.create).not.toHaveBeenCalled();
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "hb_from_dh", tenantId: "tenant-a" } }),
    );
    expect(tx.opsHotelBooking.updateMany.mock.calls[0][0].where.id).not.toBe("vp_cuid_finance");
  });

  it("8 founder approve by finance CUID write-backs stored source and is idempotent", async () => {
    const payment = {
      id: "vp_approve",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Ridge Camp",
      category: "Hotels",
      agreedAmount: 9000,
      advancePaid: 1000,
      approvalStatus: "REVIEWED_FINANCE_CONTROLLER",
      status: "Pending Approval",
      sourceType: "OPS_HOTEL_BOOKING",
      sourceId: "hb_approve",
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({
          ...payment,
          approvalStatus: "APPROVED_FOUNDER",
          status: "Paid",
          advancePaid: 9000,
        }),
      },
      opsHotelBooking: { findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await approveVendorPaymentFounder(
      {
        params: { paymentId: "vp_approve" },
        body: { reason: "Cleared" },
        user: { id: "founder_1", name: "Founder", role: "superadmin", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "hb_approve", tenantId: "tenant-a" },
        data: expect.objectContaining({ advancePaid: 9000 }),
      }),
    );

    tx.opsVendorPayment.updateMany.mockResolvedValue({ count: 0 });
    const res2 = createRes();
    await approveVendorPaymentFounder(
      {
        params: { paymentId: "vp_approve" },
        body: { reason: "Cleared again" },
        user: { id: "founder_1", name: "Founder", role: "superadmin", tenantId: "tenant-a" },
        ip: "127.0.0.1",
        get: () => "jest",
      },
      res2,
    );
    expect(res2.statusCode).toBe(409);
    expect(tx.opsHotelBooking.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.financeAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it("9 historical payment without source does not name-match another DH row", async () => {
    const payment = {
      id: "vp_historical",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Camp Site",
      category: "Hotels",
      agreedAmount: 12000,
      advancePaid: 0,
      approvalStatus: "PENDING",
      sourceType: null,
      sourceId: null,
    };
    const tx = {
      opsVendorPayment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue(payment),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue(payment),
      },
      opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      opsTransportFleet: { findFirst: jest.fn() },
      opsGuidePayment: { findFirst: jest.fn() },
      financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));
    const res = createRes();
    await reviewVendorPaymentFC(reviewReq("vp_historical"), res);
    expect(res.statusCode).toBe(200);
    expect(tx.opsHotelBooking.updateMany).not.toHaveBeenCalled();
    expect(tx.opsHotelBooking.findFirst).toHaveBeenCalledWith({ where: { id: "vp_historical", tenantId: "tenant-a" } });
  });

  it("10 two-step FC review and Founder approve remain separate handlers", () => {
    expect(typeof reviewVendorPaymentFC).toBe("function");
    expect(typeof approveVendorPaymentFounder).toBe("function");
    expect(typeof verifyVendorPayment).toBe("function");
  });
});

describe("batchVerifyStationCash tenant isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not mutate another tenant's station cash collections", async () => {
    prisma.stationPaymentCollection.findMany
      .mockResolvedValueOnce([{ id: "own_1" }])
      .mockResolvedValueOnce([
        { id: "own_1", receiptNumber: "R-1", amount: 500, station: "Delhi", booking: { id: "bk_1" } },
      ]);
    const tx = {
      stationPaymentCollection: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      accountingEntry: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      bookingActivityLog: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (fn) => fn(tx));

    const res = createRes();
    await batchVerifyStationCash(
      {
        body: { collectionIds: ["own_1", "other_tenant_1"], action: "APPROVE" },
        user: { id: "founder_1", name: "Founder", role: "superadmin", tenantId: "tenant-a" },
      },
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(tx.stationPaymentCollection.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["own_1"] }, tenantId: "tenant-a" },
      }),
    );
    const mutatedIds = tx.stationPaymentCollection.updateMany.mock.calls[0][0].where.id.in;
    expect(mutatedIds).not.toContain("other_tenant_1");
  });
});
