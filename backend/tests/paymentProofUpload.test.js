jest.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    booking: { findFirst: jest.fn() },
    payment: { findMany: jest.fn() },
    opsClientPayment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    opsVendorPayment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    paymentReceivingAccount: { findMany: jest.fn() },
    financeAuditLog: { create: jest.fn() },
  },
}));

jest.mock("../src/utils/paymentProofStorage", () => {
  const actual = jest.requireActual("../src/utils/paymentProofStorage");
  return {
    ...actual,
    persistPaymentProofFile: jest.fn(),
  };
});

jest.mock("../src/utils/profitVisibility", () => ({
  withProfitFields: (data) => data,
}));

const { prisma } = require("../src/lib/prisma");
const {
  persistPaymentProofFile,
} = require("../src/utils/paymentProofStorage");
const {
  uploadCollectionProof,
  uploadVendorPaymentProof,
} = require("../src/controllers/financeApprovalController");
const { getBookingPayments } = require("../src/controllers/paymentController");
const { hasPermission } = require("../src/config/permissions");

function createRes() {
  const res = {
    statusCode: 200,
    body: null,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.get = () => "jest-agent";
  return res;
}

function createReq(overrides = {}) {
  return {
    params: { paymentId: "pay_1", bookingId: "bk_internal" },
    body: {},
    user: {
      id: "admin_1",
      name: "Hemal Patel",
      email: "hemal.patel@youthcamping.online",
      role: "superadmin",
      tenantId: "tenant-a",
    },
    ip: "127.0.0.1",
    get: () => "jest-agent",
    ...overrides,
  };
}

describe("Payment proof upload persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists storage URL onto the tenant-scoped payment before returning success", async () => {
    persistPaymentProofFile.mockResolvedValue("/uploads/payment-proofs/receipt.jpg");

    const existingPayment = {
      id: "pay_1",
      tenantId: "tenant-a",
      proofFileUrl: null,
      booking: { tripId: "trip_1" },
    };
    const updatedPayment = {
      ...existingPayment,
      proofFileUrl: "/uploads/payment-proofs/receipt.jpg",
      proofUrl: "/uploads/payment-proofs/receipt.jpg",
      proofFileName: "receipt.jpg",
      proofFileType: "image/jpeg",
    };

    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        opsClientPayment: {
          findFirst: jest.fn().mockResolvedValue(existingPayment),
          update: jest.fn().mockResolvedValue(updatedPayment),
        },
        financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
      }),
    );

    const req = createReq({
      file: {
        buffer: Buffer.from("fake-image"),
        originalname: "receipt.jpg",
        mimetype: "image/jpeg",
        size: 128,
      },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(persistPaymentProofFile).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payment.proofFileUrl).toBe(
      "/uploads/payment-proofs/receipt.jpg",
    );
    expect(res.body.proof_url).toBe("/uploads/payment-proofs/receipt.jpg");
  });

  it("does not report success when storage fails", async () => {
    const storageErr = new Error("Document storage failed. Please retry later.");
    storageErr.statusCode = 500;
    persistPaymentProofFile.mockRejectedValue(storageErr);

    const req = createReq({
      file: {
        buffer: Buffer.from("fake-image"),
        originalname: "receipt.jpg",
        mimetype: "image/jpeg",
        size: 128,
      },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("does not report success when the database update fails", async () => {
    persistPaymentProofFile.mockResolvedValue("/uploads/payment-proofs/receipt.jpg");
    prisma.$transaction.mockRejectedValue(new Error("db write failed"));

    const req = createReq({
      file: {
        buffer: Buffer.from("fake-image"),
        originalname: "receipt.jpg",
        mimetype: "image/jpeg",
        size: 128,
      },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.payment).toBeUndefined();
  });

  it("rejects proof upload for a payment owned by another tenant", async () => {
    persistPaymentProofFile.mockResolvedValue("/uploads/payment-proofs/receipt.jpg");
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        opsClientPayment: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        financeAuditLog: { create: jest.fn() },
      }),
    );

    const req = createReq({
      user: {
        id: "admin_other",
        name: "Other Admin",
        role: "admin",
        tenantId: "tenant-b",
      },
      body: { proofFileUrl: "https://cdn.example.com/receipt.png" },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("does not report success for an invalid proof URL without a file", async () => {
    const req = createReq({
      body: { proofFileUrl: "javascript:alert(1)" },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("getBookingPayments proof contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns persisted proof fields on the payment used by the booking card", async () => {
    prisma.booking.findFirst.mockResolvedValue({
      id: "bk_internal",
      bookingId: "BK-UULNHHB11LUU",
    });
    prisma.paymentReceivingAccount.findMany.mockResolvedValue([]);
    prisma.payment.findMany.mockResolvedValue([]);
    prisma.opsClientPayment.findMany.mockResolvedValue([
      {
        id: "pay_1",
        amount: 10000,
        paymentMode: "UPI",
        collectionAccountId: "acc_1",
        collectionAccount: {
          id: "acc_1",
          accountName: "Nikulbhai Patel Account",
          accountType: "INDIVIDUAL",
        },
        remarks: "Recorded Payment",
        status: "Pending Verification",
        paymentDate: new Date("2026-08-22T07:00:00.000Z"),
        createdAt: new Date("2026-08-22T07:00:00.000Z"),
        transactionId: "BK-UULNHHB11LUU-gtqoyw",
        proofUrl: "/uploads/payment-proofs/receipt.jpg",
        proofFileUrl: "/uploads/payment-proofs/receipt.jpg",
        proofFileName: "receipt.jpg",
        proofFileType: "image/jpeg",
        proofUploadedAt: new Date("2026-08-22T07:05:00.000Z"),
      },
    ]);

    const req = createReq();
    const res = createRes();
    await getBookingPayments(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].proofFileUrl).toBe(
      "/uploads/payment-proofs/receipt.jpg",
    );
    expect(res.body.data[0].proofUrl).toBe("/uploads/payment-proofs/receipt.jpg");
    expect(res.body.data[0].proofFileName).toBe("receipt.jpg");
    expect(res.body.data[0].transactionId).toBe("BK-UULNHHB11LUU-gtqoyw");
  });

  it("appends additional proof files to proofUrls without dropping the existing primary", async () => {
    persistPaymentProofFile
      .mockResolvedValueOnce("/uploads/payment-proofs/second.jpg")
      .mockResolvedValueOnce("/uploads/payment-proofs/third.jpg");

    const existingPayment = {
      id: "pay_1",
      tenantId: "tenant-a",
      proofFileUrl: "/uploads/payment-proofs/first.jpg",
      proofUrl: "/uploads/payment-proofs/first.jpg",
      proofUrls: ["/uploads/payment-proofs/first.jpg"],
      booking: { tripId: "trip_1" },
    };
    const updatedPayment = {
      ...existingPayment,
      proofFileUrl: "/uploads/payment-proofs/first.jpg",
      proofUrl: "/uploads/payment-proofs/first.jpg",
      proofUrls: [
        "/uploads/payment-proofs/first.jpg",
        "/uploads/payment-proofs/second.jpg",
        "/uploads/payment-proofs/third.jpg",
      ],
    };

    const updateMock = jest.fn().mockResolvedValue(updatedPayment);
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        opsClientPayment: {
          findFirst: jest.fn().mockResolvedValue(existingPayment),
          update: updateMock,
        },
        financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
      }),
    );

    const req = createReq({
      files: {
        document: [
          {
            buffer: Buffer.from("fake-image-2"),
            originalname: "second.jpg",
            mimetype: "image/jpeg",
            size: 128,
          },
          {
            buffer: Buffer.from("fake-image-3"),
            originalname: "third.jpg",
            mimetype: "image/jpeg",
            size: 128,
          },
        ],
      },
    });
    const res = createRes();

    await uploadCollectionProof(req, res);

    expect(persistPaymentProofFile).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          proofFileUrl: "/uploads/payment-proofs/first.jpg",
          proofUrls: [
            "/uploads/payment-proofs/first.jpg",
            "/uploads/payment-proofs/second.jpg",
            "/uploads/payment-proofs/third.jpg",
          ],
        }),
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.proof_urls).toEqual([
      "/uploads/payment-proofs/first.jpg",
      "/uploads/payment-proofs/second.jpg",
      "/uploads/payment-proofs/third.jpg",
    ]);
  });
});

describe("payment proof RBAC", () => {
  const uploadPerms = [
    "finance.proof.upload",
    "finance.collections.review",
    "accounting.approve",
    "ops.manage",
    "bookings.edit",
    "payments.edit",
  ];

  it("allows booking editors and finance roles to attach proof", () => {
    expect(hasPermission("sales", uploadPerms)).toBe(true);
    expect(hasPermission("finance", uploadPerms)).toBe(true);
    expect(hasPermission("superadmin", uploadPerms)).toBe(true);
  });

  it("denies roles that cannot edit bookings or payments", () => {
    expect(hasPermission("viewer", uploadPerms)).toBe(false);
    expect(
      hasPermission(
        { role: "custom", permissions: ["dashboard.view"] },
        uploadPerms,
      ),
    ).toBe(false);
  });
});

describe("Vendor payout proof upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists proof onto OpsVendorPayment invoice fields", async () => {
    persistPaymentProofFile.mockResolvedValue("/uploads/payment-proofs/vendor.jpg");
    const existing = {
      id: "vp_1",
      tenantId: "tenant-a",
      tripId: "trip_1",
      vendorName: "Hotel",
      invoiceFileUrl: null,
      invoiceProof: null,
    };
    const updated = {
      ...existing,
      invoiceFileUrl: "/uploads/payment-proofs/vendor.jpg",
      invoiceProof: "/uploads/payment-proofs/vendor.jpg",
    };
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        opsVendorPayment: {
          findFirst: jest.fn().mockResolvedValue(existing),
          update: jest.fn().mockResolvedValue(updated),
        },
        opsHotelBooking: { findFirst: jest.fn().mockResolvedValue(null) },
        opsTransportFleet: { findFirst: jest.fn().mockResolvedValue(null) },
        opsGuidePayment: { findFirst: jest.fn().mockResolvedValue(null) },
        opsActivity: { findFirst: jest.fn().mockResolvedValue(null) },
        financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
      }),
    );

    const req = createReq({
      params: { paymentId: "vp_1" },
      file: {
        buffer: Buffer.from("fake-image"),
        originalname: "vendor.jpg",
        mimetype: "image/jpeg",
        size: 128,
      },
    });
    const res = createRes();
    await uploadVendorPaymentProof(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.proofUrl).toBe("/uploads/payment-proofs/vendor.jpg");
    expect(res.body.payment.invoiceFileUrl).toBe("/uploads/payment-proofs/vendor.jpg");
  });
});
