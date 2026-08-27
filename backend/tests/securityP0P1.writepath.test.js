jest.mock("../src/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: jest.fn() },
    opsVendorPayment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentReceivingAccount: { findFirst: jest.fn() },
    booking: { findFirst: jest.fn(), update: jest.fn() },
    bookingDocument: { findFirst: jest.fn() },
    opsClientPayment: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    accountingEntry: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    financeAuditLog: { create: jest.fn() },
  },
}));

jest.mock("../src/utils/bookingActivityLogger", () => ({
  logBookingActivity: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/utils/auditLogger", () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/utils/documentStorage", () => ({
  downloadFile: jest.fn().mockResolvedValue({ buffer: Buffer.from("secret-pdf") }),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  resolveSafeLocalPath: jest.requireActual("../src/utils/documentStorage").resolveSafeLocalPath,
  LOCAL_UPLOAD_DIR: jest.requireActual("../src/utils/documentStorage").LOCAL_UPLOAD_DIR,
}));

jest.mock("../src/utils/vendorOperationalSource", () => {
  const actual = jest.requireActual("../src/utils/vendorOperationalSource");
  return {
    ...actual,
    syncOperationalVendorRecord: jest.fn().mockResolvedValue({ resolved: false }),
  };
});

const { prisma } = require("../src/lib/prisma");
const {
  createVendorPayment,
  updateVendorPayment,
  verifyVendorPayment,
  verifyClientPayment,
} = require("../src/controllers/paymentController");
const {
  updateBookingStatus,
  downloadPassengerDocument,
} = require("../src/controllers/bookingController");
const documentStorage = require("../src/utils/documentStorage");

function createRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
    return res;
  };
  res.send = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

describe("vendor payment client fields are not trusted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.trip.findFirst.mockResolvedValue({ id: "trip_1" });
    prisma.opsVendorPayment.findFirst.mockResolvedValue(null);
    prisma.paymentReceivingAccount.findFirst.mockResolvedValue(null);
    prisma.opsVendorPayment.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "vp_new", ...data }),
    );
    prisma.opsVendorPayment.update.mockImplementation(({ data }) =>
      Promise.resolve({ id: "vp_existing", ...data }),
    );
  });

  it("ignores client approvalStatus and Paid on create", async () => {
    const res = createRes();
    await createVendorPayment(
      {
        params: { tripId: "trip_1" },
        user: { id: "ops_1", tenantId: "tenant-a", name: "Ops" },
        body: {
          vendorName: "Hotel Ridge",
          agreedAmount: 10000,
          advancePaid: 10000,
          approvalStatus: "APPROVED_FOUNDER",
          status: "Paid",
        },
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    const created = prisma.opsVendorPayment.create.mock.calls[0][0].data;
    expect(created.approvalStatus).toBe("PENDING");
    expect(created.status).not.toBe("Paid");
  });

  it("ignores client approvalStatus on update", async () => {
    prisma.opsVendorPayment.findFirst.mockResolvedValue({
      id: "vp_existing",
      tenantId: "tenant-a",
      agreedAmount: 8000,
      advancePaid: 1000,
      approvalStatus: "PENDING",
      status: "Advance Paid",
    });
    const res = createRes();
    await updateVendorPayment(
      {
        params: { tripId: "trip_1", id: "vp_existing" },
        user: { id: "ops_1", tenantId: "tenant-a" },
        body: {
          approvalStatus: "APPROVED_FOUNDER",
          status: "Paid",
          agreedAmount: 8000,
          advancePaid: 1000,
        },
      },
      res,
    );
    const updated = prisma.opsVendorPayment.update.mock.calls[0][0].data;
    expect(updated.approvalStatus).toBeUndefined();
    expect(updated.status).not.toBe("Paid");
  });

  it("legacy vendor verify is tenant-scoped and ignores client Paid", async () => {
    prisma.opsVendorPayment.findFirst.mockResolvedValue({
      id: "vp_1",
      tenantId: "tenant-a",
      agreedAmount: 12000,
      advancePaid: 2000,
      remarks: "ok",
    });
    prisma.opsVendorPayment.update.mockResolvedValue({
      id: "vp_1",
      approvalStatus: "APPROVED_FOUNDER",
      status: "Paid",
    });
    const res = createRes();
    await verifyVendorPayment(
      {
        params: { id: "vp_1" },
        user: {
          id: "fc_1",
          role: "finance_controller",
          tenantId: "tenant-a",
        },
        body: { status: "Paid", remarks: "force" },
      },
      res,
    );
    expect(prisma.opsVendorPayment.findFirst).toHaveBeenCalledWith({
      where: { id: "vp_1", tenantId: "tenant-a" },
    });
    expect(prisma.opsVendorPayment.update.mock.calls[0][0].data.status).toBe("Paid");
    expect(prisma.opsVendorPayment.update.mock.calls[0][0].data.approvalStatus).toBe(
      "APPROVED_FOUNDER",
    );
  });

  it("legacy vendor verify returns 404 across tenants", async () => {
    prisma.opsVendorPayment.findFirst.mockResolvedValue(null);
    const res = createRes();
    await verifyVendorPayment(
      {
        params: { id: "vp_other_tenant" },
        user: { id: "fc_1", role: "finance_controller", tenantId: "tenant-b" },
        body: { status: "Paid" },
      },
      res,
    );
    expect(res.statusCode).toBe(404);
    expect(prisma.opsVendorPayment.update).not.toHaveBeenCalled();
  });

  it("legacy vendor verify blocks Finance Controller over ₹50,000", async () => {
    prisma.opsVendorPayment.findFirst.mockResolvedValue({
      id: "vp_60k",
      tenantId: "tenant-a",
      agreedAmount: 60000,
      advancePaid: 0,
      remarks: "",
    });
    const res = createRes();
    await verifyVendorPayment(
      {
        params: { id: "vp_60k" },
        user: { id: "fc_1", role: "finance_controller", tenantId: "tenant-a" },
        body: { status: "Paid" },
      },
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.opsVendorPayment.update).not.toHaveBeenCalled();
  });
});

describe("client payment tenant isolation", () => {
  it("looks up bookings by id and tenantId", async () => {
    prisma.opsClientPayment.findFirst.mockResolvedValue({
      id: "cp_1",
      tenantId: "tenant-a",
      bookingId: "BK-1",
      amount: 1000,
      paymentMode: "UPI",
      remarks: "",
      collectionAccountId: null,
      approvalStatus: "PENDING",
    });
    prisma.opsClientPayment.update.mockResolvedValue({
      id: "cp_1",
      approvalStatus: "APPROVED_FOUNDER",
    });
    prisma.booking.findFirst.mockResolvedValue(null);
    const res = createRes();
    await verifyClientPayment(
      {
        params: { id: "cp_1" },
        user: {
          id: "fc_1",
          role: "finance_controller",
          tenantId: "tenant-a",
        },
        body: { status: "Verified" },
      },
      res,
    );
    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: "tenant-a",
        OR: [{ bookingId: "BK-1" }, { id: "BK-1" }],
      },
    });
  });
});

describe("booking status cannot cancel", () => {
  it("rejects cancelled via the generic status endpoint", async () => {
    const res = createRes();
    await updateBookingStatus(
      {
        params: { id: "bk_1" },
        user: { id: "ops_1", role: "operations", tenantId: "tenant-a" },
        body: { status: "cancelled" },
        ip: "127.0.0.1",
      },
      res,
      jest.fn(),
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cancel/i);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it("looks up bookings with tenantId even for admin", async () => {
    prisma.booking.findFirst.mockResolvedValue({
      id: "bk_1",
      tenantId: "tenant-a",
      status: "pending",
    });
    prisma.booking.update.mockResolvedValue({ id: "bk_1", status: "confirmed" });
    const res = createRes();
    await updateBookingStatus(
      {
        params: { id: "bk_1" },
        user: { id: "admin_1", role: "admin", tenantId: "tenant-a" },
        body: { status: "confirmed" },
        ip: "127.0.0.1",
      },
      res,
      jest.fn(),
    );
    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { id: "bk_1", tenantId: "tenant-a" },
          { bookingId: "bk_1", tenantId: "tenant-a" },
        ],
      },
    });
    expect(res.statusCode).toBe(200);
  });
});

describe("authenticated document download tenant isolation", () => {
  beforeEach(() => {
    documentStorage.downloadFile.mockResolvedValue({ buffer: Buffer.from("secret-pdf") });
  });
  it("does not return another tenant's document", async () => {
    prisma.booking.findFirst.mockResolvedValue(null);
    const res = createRes();
    await downloadPassengerDocument(
      {
        params: { id: "bk_1", passengerId: "pax-1" },
        user: { id: "ops_1", role: "operations", tenantId: "tenant-b" },
        query: {},
      },
      res,
      jest.fn(),
    );
    expect(res.statusCode).toBe(404);
    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "bk_1", tenantId: "tenant-b" },
    });
    expect(documentStorage.downloadFile).not.toHaveBeenCalled();
  });

  it("serves a tenant-matched document without logging contents", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    prisma.booking.findFirst.mockResolvedValue({ id: "bk_1", tenantId: "tenant-a" });
    prisma.bookingDocument.findFirst.mockResolvedValue({
      id: "doc_1",
      storagePath: "bookings/bk_1/pax-1/passport.pdf",
      mimeType: "application/pdf",
      originalFileName: "passport.pdf",
    });
    const res = createRes();
    await downloadPassengerDocument(
      {
        params: { id: "bk_1", passengerId: "pax-1", docId: "doc_1" },
        user: { id: "ops_1", role: "operations", tenantId: "tenant-a" },
        query: {},
      },
      res,
      jest.fn(),
    );
    expect(Buffer.isBuffer(res.body)).toBe(true);
    const logged = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logged).not.toContain("secret-pdf");
    logSpy.mockRestore();
  });

  it("blocks guides from document download", async () => {
    const res = createRes();
    await downloadPassengerDocument(
      {
        params: { id: "bk_1", passengerId: "pax-1" },
        user: { id: "g_1", role: "guide", tenantId: "tenant-a" },
        query: {},
      },
      res,
      jest.fn(),
    );
    expect(res.statusCode).toBe(403);
  });
});

describe("document storage path safety", () => {
  const { resolveSafeLocalPath } = jest.requireActual("../src/utils/documentStorage");

  it("rejects path traversal", () => {
    expect(() => resolveSafeLocalPath("../.env")).toThrow(/not found/i);
    expect(() => resolveSafeLocalPath("/etc/passwd")).toThrow(/not found/i);
  });
});
