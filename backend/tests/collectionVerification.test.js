jest.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    opsClientPayment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    paymentReceivingAccount: { findMany: jest.fn() },
    accountingEntry: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    accountingEntryLog: { create: jest.fn() },
    financeAuditLog: { create: jest.fn() },
    opsVendorPayment: { findMany: jest.fn() },
  },
}));

jest.mock("../src/utils/bookingActivityLogger", () => ({
  logBookingActivity: jest.fn().mockResolvedValue(undefined),
}));

const { prisma } = require("../src/lib/prisma");
const {
  canonicalCollectionStatus,
  canCompleteCollectionVerification,
  isCollectionVerified,
  isEligibleCollectionAssignee,
  requireCollectionVerifier,
} = require("../src/utils/collectionVerification");
const {
  reviewCollectionFC,
  approveCollectionFounder,
  getPendingApprovals,
} = require("../src/controllers/financeApprovalController");
const {
  syncTreasuryMappings,
  verifyClientPayment,
} = require("../src/controllers/paymentController");
const { verifyIncomingPayment } = require("../src/controllers/financeController");
const { approveEntry } = require("../src/controllers/accountingController");
const { logBookingActivity } = require("../src/utils/bookingActivityLogger");

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
  res.get = () => "jest-agent";
  return res;
}

function createReq(overrides = {}) {
  return {
    params: { paymentId: "pay_1", id: "pay_1" },
    body: {},
    user: {
      id: "fc_1",
      name: "Finance Controller",
      email: "fc@youthcamping.online",
      role: "finance_controller",
      tenantId: "tenant-a",
    },
    ip: "127.0.0.1",
    get: () => "jest-agent",
    ...overrides,
  };
}

const pendingPayment = {
  id: "pay_1",
  tenantId: "tenant-a",
  bookingId: "BK-1",
  amount: 5000,
  paymentMode: "UPI",
  proofFileUrl: "https://cdn.example.com/slip.jpg",
  proofUrl: "https://cdn.example.com/slip.jpg",
  approvalStatus: "PENDING",
  status: "Pending Verification",
  collectionAccountId: "acc_1",
  transactionId: "UTR-1",
  remarks: "Advance",
  booking: {
    id: "bk_internal",
    bookingId: "BK-1",
    tripId: "trip_1",
    totalAmount: 15000,
    advancePaid: 0,
    salesAdminId: "sales_1",
    fullName: "Asha",
  },
};

function mockSuccessfulVerificationTx(existing = pendingPayment) {
  const updated = {
    ...existing,
    approvalStatus: "APPROVED_FOUNDER",
    status: "Verified",
  };
  const tx = {
    opsClientPayment: {
      findFirst: jest.fn().mockResolvedValue(existing),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUnique: jest.fn().mockResolvedValue(updated),
      findMany: jest.fn().mockResolvedValue([updated]),
    },
    financeAuditLog: { create: jest.fn().mockResolvedValue({}) },
    booking: { update: jest.fn().mockResolvedValue(existing.booking) },
    accountingEntry: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  prisma.$transaction.mockImplementation(async (fn) => fn(tx));
  return { tx, updated };
}

describe("collection verification status rule", () => {
  it("does not treat a pending approval as verified even if receipt status is Verified", () => {
    expect(canonicalCollectionStatus("PENDING", "Verified")).toBe("PENDING");
    expect(isCollectionVerified("PENDING")).toBe(false);
  });

  it("treats APPROVED_FOUNDER as the only verified collection state", () => {
    expect(canonicalCollectionStatus("APPROVED_FOUNDER", "Pending Verification")).toBe(
      "VERIFIED",
    );
    expect(canonicalCollectionStatus("REVIEWED_FINANCE_CONTROLLER", "Pending Verification")).toBe(
      "PENDING",
    );
  });
});

describe("strict collection verification identity", () => {
  it("allows founder and finance_controller roles", () => {
    expect(canCompleteCollectionVerification({ role: "founder" })).toBe(true);
    expect(canCompleteCollectionVerification({ role: "superadmin" })).toBe(true);
    expect(canCompleteCollectionVerification({ role: "super_admin" })).toBe(true);
    expect(canCompleteCollectionVerification({ role: "finance_controller" })).toBe(true);
  });

  it("allows admin only when they are the protected founder identity", () => {
    expect(canCompleteCollectionVerification({ role: "admin" })).toBe(false);
    expect(
      canCompleteCollectionVerification({
        role: "admin",
        email: "hemal.patel@youthcamping.online",
      }),
    ).toBe(true);
  });

  it("denies sales, viewer, ops, guide, generic finance, owner, and custom roles", () => {
    expect(canCompleteCollectionVerification({ role: "sales" })).toBe(false);
    expect(canCompleteCollectionVerification({ role: "viewer" })).toBe(false);
    expect(canCompleteCollectionVerification({ role: "operations" })).toBe(false);
    expect(canCompleteCollectionVerification({ role: "guide" })).toBe(false);
    expect(canCompleteCollectionVerification({ role: "finance" })).toBe(false);
    expect(canCompleteCollectionVerification({ role: "owner" })).toBe(false);
    expect(
      canCompleteCollectionVerification({
        role: "custom",
        permissions: [
          "finance.incoming.verify",
          "finance.collections.approve_founder",
          "accounting.approve",
          "ops.manage",
          "bookings.edit",
          "payments.edit",
          "finance.proof.upload",
        ],
      }),
    ).toBe(false);
  });

  it("only Founder and Finance Controller may be approval assignees", () => {
    expect(isEligibleCollectionAssignee({ role: "founder" })).toBe(true);
    expect(isEligibleCollectionAssignee({ role: "finance_controller" })).toBe(true);
    expect(isEligibleCollectionAssignee({ role: "admin" })).toBe(false);
    expect(isEligibleCollectionAssignee({ role: "operations" })).toBe(false);
  });

  it("does not grant verify from isSuperuser or unrelated finance permissions", () => {
    expect(
      canCompleteCollectionVerification({
        role: "admin",
        isSuperuser: true,
      }),
    ).toBe(false);
    expect(
      canCompleteCollectionVerification({
        role: "finance",
        permissions: ["finance.incoming.approve", "finance.collections.review"],
      }),
    ).toBe(false);
  });

  it("denies isSuperuser even with accounting.approve, finance.*, ops.manage, bookings.edit, payments.edit", () => {
    expect(
      canCompleteCollectionVerification({
        role: "admin",
        isSuperuser: true,
        permissions: [
          "accounting.approve",
          "finance.incoming.verify",
          "finance.incoming.approve",
          "ops.manage",
          "bookings.edit",
          "payments.edit",
        ],
      }),
    ).toBe(false);
  });
});

describe("requireCollectionVerifier middleware", () => {
  it("403s unauthorized roles before the handler", () => {
    const res = createRes();
    const next = jest.fn();
    requireCollectionVerifier(createReq({ user: { role: "sales", tenantId: "tenant-a" } }), res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows finance_controller through", () => {
    const res = createRes();
    const next = jest.fn();
    requireCollectionVerifier(createReq(), res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("single collection verification endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lets a finance controller complete verification in one step", async () => {
    const { tx } = mockSuccessfulVerificationTx();
    const res = createRes();

    await reviewCollectionFC(createReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.payment.approvalStatus).toBe("APPROVED_FOUNDER");
    expect(res.body.payment.status).toBe("Verified");
    expect(tx.opsClientPayment.updateMany).toHaveBeenCalled();
    expect(tx.financeAuditLog.create).toHaveBeenCalledTimes(1);
    expect(tx.booking.update).toHaveBeenCalledTimes(1);
  });

  it("lets a founder complete verification in one step from PENDING", async () => {
    mockSuccessfulVerificationTx();
    const res = createRes();

    await approveCollectionFounder(
      createReq({
        user: {
          id: "founder_1",
          name: "Founder",
          email: "founder@youthcamping.online",
          role: "founder",
          tenantId: "tenant-a",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.payment.approvalStatus).toBe("APPROVED_FOUNDER");
  });

  it.each([
    ["sales"],
    ["viewer"],
    ["admin"],
    ["operations"],
    ["guide"],
    ["finance"],
  ])("rejects %s with 403", async (role) => {
    const res = createRes();
    await approveCollectionFounder(
      createReq({
        user: { id: `${role}_1`, name: role, role, tenantId: "tenant-a" },
      }),
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a custom role that only has unrelated finance permissions", async () => {
    const res = createRes();
    await reviewCollectionFC(
      createReq({
        user: {
          id: "custom_1",
          role: "custom",
          tenantId: "tenant-a",
          permissions: ["finance.proof.upload", "accounting.approve", "ops.manage"],
        },
      }),
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("does not verify a payment owned by another tenant", async () => {
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        opsClientPayment: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      }),
    );
    const res = createRes();

    await reviewCollectionFC(
      createReq({
        user: {
          id: "fc_other",
          name: "Other FC",
          role: "finance_controller",
          tenantId: "tenant-b",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("does not double booking totals or audit on a second verify", async () => {
    const alreadyVerified = {
      ...pendingPayment,
      approvalStatus: "APPROVED_FOUNDER",
      status: "Verified",
    };
    const { tx } = mockSuccessfulVerificationTx(alreadyVerified);
    const res = createRes();

    await approveCollectionFounder(createReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.payment.approvalStatus).toBe("APPROVED_FOUNDER");
    expect(tx.opsClientPayment.updateMany).not.toHaveBeenCalled();
    expect(tx.financeAuditLog.create).not.toHaveBeenCalled();
    expect(tx.booking.update).not.toHaveBeenCalled();
  });
});

describe("alternate incoming verify endpoints stay locked", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks sales from verifyIncomingPayment", async () => {
    const res = createRes();
    await verifyIncomingPayment(
      createReq({
        body: { action: "VERIFY" },
        user: { id: "sales_1", role: "sales", tenantId: "tenant-a" },
      }),
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.opsClientPayment.findFirst).not.toHaveBeenCalled();
  });

  it("blocks generic finance from verifyClientPayment when marking Verified", async () => {
    const res = createRes();
    await verifyClientPayment(
      createReq({
        body: { status: "Verified" },
        user: { id: "fin_1", role: "finance", tenantId: "tenant-a" },
      }),
      res,
    );
    expect(res.statusCode).toBe(403);
    expect(prisma.opsClientPayment.findFirst).not.toHaveBeenCalled();
  });

  it("returns 404 when an authorized FC verifies another tenant payment", async () => {
    prisma.accountingEntry.findFirst.mockResolvedValue(null);
    prisma.opsClientPayment.findFirst.mockResolvedValue(null);
    const res = createRes();
    await verifyIncomingPayment(
      createReq({
        body: { action: "VERIFY" },
        user: {
          id: "fc_1",
          role: "finance_controller",
          tenantId: "tenant-b",
        },
      }),
      res,
    );
    expect(res.statusCode).toBe(404);
  });

  it("is idempotent when verifyIncomingPayment is called on an already verified receipt", async () => {
    prisma.accountingEntry.findFirst.mockResolvedValue(null);
    prisma.opsClientPayment.findFirst.mockResolvedValue({
      ...pendingPayment,
      approvalStatus: "APPROVED_FOUNDER",
      status: "Verified",
    });
    const res = createRes();
    await verifyIncomingPayment(createReq({ body: { action: "VERIFY" } }), res);
    expect(res.statusCode).toBe(200);
    expect(prisma.opsClientPayment.update).not.toHaveBeenCalled();
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it("does not create a second receipt when verifying an accounting entry that already has a pending collection", async () => {
    prisma.accountingEntry.findFirst.mockResolvedValue({
      id: "acc_1",
      tenantId: "tenant-a",
      amount: 5000,
      paymentMode: "UPI",
      referenceNumber: "UTR-1",
      salespersonId: "sales_1",
      collectionAccountId: "acc_bank",
      booking: pendingPayment.booking,
    });
    prisma.opsClientPayment.findMany
      .mockResolvedValueOnce([pendingPayment])
      .mockResolvedValueOnce([{ ...pendingPayment, approvalStatus: "APPROVED_FOUNDER", status: "Verified" }]);
    prisma.opsClientPayment.update.mockResolvedValue({
      ...pendingPayment,
      approvalStatus: "APPROVED_FOUNDER",
      status: "Verified",
    });
    prisma.accountingEntry.update.mockResolvedValue({ id: "acc_1", status: "APPROVED" });
    prisma.accountingEntryLog.create.mockResolvedValue({});
    prisma.booking.update.mockResolvedValue({});

    const res = createRes();
    await verifyIncomingPayment(createReq({ params: { id: "acc_1" }, body: { action: "VERIFY" } }), res);

    expect(res.statusCode).toBe(200);
    expect(prisma.opsClientPayment.create).not.toHaveBeenCalled();
    expect(prisma.opsClientPayment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pay_1" },
        data: expect.objectContaining({
          approvalStatus: "APPROVED_FOUNDER",
          status: "Verified",
        }),
      }),
    );
    expect(prisma.booking.update).toHaveBeenCalledTimes(1);
  });
});

describe("pending approvals queue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns pending collections and excludes fully verified ones", async () => {
    prisma.opsClientPayment.findMany.mockResolvedValue([
      { id: "p1", approvalStatus: "PENDING", amount: 1000 },
      { id: "p2", approvalStatus: "REVIEWED_FINANCE_CONTROLLER", amount: 2000 },
    ]);
    prisma.opsVendorPayment.findMany.mockResolvedValue([]);

    const res = createRes();
    await getPendingApprovals(createReq(), res);

    expect(res.statusCode).toBe(200);
    const items = res.body.pendingApprovals.items.customerPayments;
    expect(items.every((p) => p.approvalStatus !== "APPROVED_FOUNDER")).toBe(true);
  });
});

describe("sync treasury does not pre-verify receipts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates missing receipts as pending, not verified", async () => {
    prisma.paymentReceivingAccount.findMany.mockResolvedValue([
      { id: "acc_upi", accountType: "UPI", accountName: "UPI", upiId: "n@upi" },
    ]);
    prisma.opsClientPayment.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "bk_1",
        bookingId: "BK-SYNC",
        tenantId: "tenant-a",
        advancePaid: 8000,
        paymentMode: "UPI",
        createdAt: new Date(),
        salesAdminId: "sales_1",
        opsClientPayments: [],
      },
    ]);
    prisma.opsClientPayment.create.mockResolvedValue({ id: "new_pay" });
    prisma.accountingEntry.findFirst.mockResolvedValue(null);
    prisma.accountingEntry.create.mockResolvedValue({});

    const res = createRes();
    await syncTreasuryMappings(createReq(), res);

    expect(res.statusCode).toBe(200);
    expect(prisma.opsClientPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "Pending Verification",
          approvalStatus: "PENDING",
        }),
      }),
    );
  });
});

const pendingAccountingEntry = {
  id: "acc_1",
  tenantId: "tenant-a",
  bookingId: "BK-1",
  amount: 5000,
  paymentMode: "UPI",
  referenceNumber: "UTR-1",
  status: "PENDING",
  notes: "Advance",
  salespersonId: "sales_1",
  collectionAccountId: "acc_1",
};

const accountingBooking = {
  id: "bk_internal",
  bookingId: "BK-1",
  tenantId: "tenant-a",
  tripId: "trip_1",
  totalAmount: 15000,
  advancePaid: 0,
  status: "pending",
};

const authorizedAccountingUsers = [
  [
    "founder",
    {
      id: "founder_1",
      name: "Founder",
      email: "founder@youthcamping.online",
      role: "founder",
      tenantId: "tenant-a",
    },
  ],
  [
    "superadmin",
    {
      id: "sa_1",
      name: "Superadmin",
      email: "superadmin@youthcamping.online",
      role: "superadmin",
      tenantId: "tenant-a",
    },
  ],
  [
    "finance_controller",
    {
      id: "fc_1",
      name: "Finance Controller",
      email: "fc@youthcamping.online",
      role: "finance_controller",
      tenantId: "tenant-a",
    },
  ],
  [
    "protected founder admin",
    {
      id: "admin_protected",
      name: "Hemal",
      email: "hemal.patel@youthcamping.online",
      role: "admin",
      tenantId: "tenant-a",
    },
  ],
];

const deniedAccountingUsers = [
  ["admin", { id: "admin_1", name: "Admin", email: "admin@youthcamping.online", role: "admin", tenantId: "tenant-a" }],
  ["finance", { id: "fin_1", name: "Finance", email: "finance@youthcamping.online", role: "finance", tenantId: "tenant-a" }],
  ["sales", { id: "sales_1", name: "Sales", email: "sales@youthcamping.online", role: "sales", tenantId: "tenant-a" }],
  ["operations", { id: "ops_1", name: "Ops", email: "ops@youthcamping.online", role: "operations", tenantId: "tenant-a" }],
  ["viewer", { id: "view_1", name: "Viewer", email: "viewer@youthcamping.online", role: "viewer", tenantId: "tenant-a" }],
  ["guide", { id: "guide_1", name: "Guide", email: "guide@youthcamping.online", role: "guide", tenantId: "tenant-a" }],
  ["owner", { id: "owner_1", name: "Owner", email: "owner@youthcamping.online", role: "owner", tenantId: "tenant-a" }],
  [
    "custom",
    {
      id: "custom_1",
      name: "Custom",
      email: "custom@youthcamping.online",
      role: "custom",
      tenantId: "tenant-a",
      permissions: ["accounting.approve", "finance.incoming.verify", "ops.manage", "payments.edit", "bookings.edit"],
    },
  ],
];

function mockIncomingAccountingApprove({
  entry = pendingAccountingEntry,
  booking = accountingBooking,
  existingPayments = [],
} = {}) {
  let currentEntry = { ...entry };
  let currentPayments = existingPayments.map((payment) => ({ ...payment }));

  prisma.accountingEntry.findFirst.mockImplementation(async () => currentEntry);
  prisma.booking.findFirst.mockResolvedValue(booking);
  prisma.opsClientPayment.findMany.mockImplementation(async ({ where } = {}) => {
    const rows = currentPayments.filter((payment) => {
      if (where?.approvalStatus && payment.approvalStatus !== where.approvalStatus) return false;
      return true;
    });
    return rows;
  });
  prisma.accountingEntry.update.mockImplementation(async ({ data }) => {
    currentEntry = { ...currentEntry, ...data };
    return currentEntry;
  });
  prisma.accountingEntryLog.create.mockResolvedValue({});
  prisma.opsClientPayment.create.mockImplementation(async ({ data }) => {
    const created = { id: "pay_acc_1", ...data };
    currentPayments = [...currentPayments, created];
    return created;
  });
  prisma.opsClientPayment.update.mockImplementation(async ({ data }) => {
    const updated = { ...(currentPayments[0] || { id: "pay_acc_1" }), ...data };
    currentPayments = [updated, ...currentPayments.slice(1)];
    return updated;
  });
  prisma.booking.update.mockResolvedValue({ ...booking, advancePaid: entry.amount });
  prisma.financeAuditLog.create.mockResolvedValue({});
  logBookingActivity.mockResolvedValue(undefined);

  return {
    getEntry: () => currentEntry,
    getPayments: () => currentPayments,
  };
}

function expectNoFinancialSettlement() {
  expect(prisma.accountingEntry.update).not.toHaveBeenCalled();
  expect(prisma.accountingEntryLog.create).not.toHaveBeenCalled();
  expect(prisma.opsClientPayment.create).not.toHaveBeenCalled();
  expect(prisma.opsClientPayment.update).not.toHaveBeenCalled();
  expect(prisma.booking.update).not.toHaveBeenCalled();
  expect(prisma.financeAuditLog.create).not.toHaveBeenCalled();
}

describe("POST /api/accounting/entries/:id/approve incoming collection matrix", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logBookingActivity.mockResolvedValue(undefined);
  });

  it.each(authorizedAccountingUsers)("allows %s to settle an incoming collection", async (_label, user) => {
    mockIncomingAccountingApprove();
    const res = createRes();

    await approveEntry(createReq({ params: { id: "acc_1" }, user }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.accountingEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "APPROVED" }),
      }),
    );
    expect(prisma.opsClientPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          approvalStatus: "APPROVED_FOUNDER",
          status: "Verified",
        }),
      }),
    );
    expect(prisma.booking.update).toHaveBeenCalledTimes(1);
    expect(prisma.financeAuditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.financeAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "APPROVED_FOUNDER" }),
      }),
    );
  });

  it.each(deniedAccountingUsers)("rejects %s with 403 and leaves financial state unchanged", async (_label, user) => {
    mockIncomingAccountingApprove();
    const res = createRes();

    await approveEntry(createReq({ params: { id: "acc_1" }, user }), res);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expectNoFinancialSettlement();
  });

  it("denies a same-identity user from a different tenant", async () => {
    prisma.accountingEntry.findFirst.mockResolvedValue(null);
    const res = createRes();

    await approveEntry(
      createReq({
        params: { id: "acc_1" },
        user: {
          id: "fc_other",
          name: "Other FC",
          email: "fc-b@youthcamping.online",
          role: "finance_controller",
          tenantId: "tenant-b",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expectNoFinancialSettlement();
  });

  it("unauthorized admin cannot create Verified+PENDING or change advancePaid", async () => {
    mockIncomingAccountingApprove();
    const res = createRes();

    await approveEntry(
      createReq({
        params: { id: "acc_1" },
        user: {
          id: "admin_1",
          name: "Admin",
          email: "admin@youthcamping.online",
          role: "admin",
          tenantId: "tenant-a",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(prisma.opsClientPayment.create).not.toHaveBeenCalled();
    expect(prisma.booking.update).not.toHaveBeenCalled();
    const created = prisma.opsClientPayment.create.mock.calls[0];
    expect(created).toBeUndefined();
  });

  it("authorized approval writes APPROVED_FOUNDER + Verified and syncs booking totals once", async () => {
    mockIncomingAccountingApprove();
    const res = createRes();

    await approveEntry(createReq({ params: { id: "acc_1" } }), res);

    expect(res.statusCode).toBe(200);
    expect(prisma.opsClientPayment.create).toHaveBeenCalledTimes(1);
    expect(prisma.opsClientPayment.create.mock.calls[0][0].data.approvalStatus).toBe(
      "APPROVED_FOUNDER",
    );
    expect(prisma.opsClientPayment.create.mock.calls[0][0].data.status).toBe("Verified");
    expect(prisma.booking.update).toHaveBeenCalledTimes(1);
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ advancePaid: 5000 }),
      }),
    );
    expect(prisma.financeAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it("settles financials exactly once across first, second, and third approval", async () => {
    mockIncomingAccountingApprove();

    for (let i = 0; i < 3; i += 1) {
      const res = createRes();
      await approveEntry(createReq({ params: { id: "acc_1" } }), res);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }

    expect(prisma.opsClientPayment.create).toHaveBeenCalledTimes(1);
    expect(prisma.booking.update).toHaveBeenCalledTimes(1);
    expect(prisma.financeAuditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.accountingEntry.update).toHaveBeenCalledTimes(1);
  });

  it("does not resettle advancePaid, ledger, or audit on second and third approval", async () => {
    const alreadyApproved = { ...pendingAccountingEntry, status: "APPROVED" };
    const alreadyVerified = {
      id: "pay_acc_1",
      tenantId: "tenant-a",
      bookingId: "BK-1",
      amount: 5000,
      approvalStatus: "APPROVED_FOUNDER",
      status: "Verified",
      transactionId: "UTR-1",
    };
    mockIncomingAccountingApprove({
      entry: alreadyApproved,
      existingPayments: [alreadyVerified],
    });

    for (let i = 0; i < 3; i += 1) {
      const res = createRes();
      await approveEntry(createReq({ params: { id: "acc_1" } }), res);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }

    expect(prisma.opsClientPayment.create).not.toHaveBeenCalled();
    expect(prisma.opsClientPayment.update).not.toHaveBeenCalled();
    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.financeAuditLog.create).not.toHaveBeenCalled();
    expect(prisma.accountingEntry.update).not.toHaveBeenCalled();
  });

  it("still lets generic finance approve an unrelated accounting entry without settling a collection", async () => {
    prisma.accountingEntry.findFirst.mockResolvedValue({
      ...pendingAccountingEntry,
      bookingId: "ORPHAN-ENTRY",
    });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.accountingEntry.update.mockResolvedValue({
      ...pendingAccountingEntry,
      bookingId: "ORPHAN-ENTRY",
      status: "APPROVED",
    });
    prisma.accountingEntryLog.create.mockResolvedValue({});

    const res = createRes();
    await approveEntry(
      createReq({
        params: { id: "acc_1" },
        user: {
          id: "fin_1",
          name: "Finance",
          email: "finance@youthcamping.online",
          role: "finance",
          tenantId: "tenant-a",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.accountingEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "APPROVED" }),
      }),
    );
    expect(prisma.opsClientPayment.create).not.toHaveBeenCalled();
    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.financeAuditLog.create).not.toHaveBeenCalled();
  });
});
