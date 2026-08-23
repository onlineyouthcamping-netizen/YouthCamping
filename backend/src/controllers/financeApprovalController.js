const { prisma } = require("../lib/prisma");
const {
  persistPaymentProofFile,
  resolveUploadedProofFile,
} = require("../utils/paymentProofStorage");
const {
  TERMINAL_APPROVED,
  canCompleteCollectionVerification,
  denyCollectionVerification,
  isCashCollectionMode,
} = require("../utils/collectionVerification");
const {
  isCanonicalSource,
  findOperationalSource,
  vendorFieldsFromOperationalSource,
  writeBackOrThrow,
} = require("../utils/vendorOperationalSource");

function resolveTenantId(req) {
  return req.user?.tenantId || req.admin?.tenantId || req.tenantId || "default";
}

function resolveUser(req) {
  return {
    id: req.user?.id || req.admin?.id || "system",
    name: req.user?.name || req.admin?.name || req.user?.email || req.admin?.email || "Admin User",
    role: (req.user?.role || req.admin?.role || "admin").trim().toLowerCase(),
  };
}

/**
 * Validates and sanitizes proof URLs to prevent XSS, SSRF, data-URIs, and path traversal
 */
function sanitizeProofUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length > 2048) return null;

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.includes("<script") ||
    lower.includes("..")
  ) {
    return null;
  }

  // Must be valid http/https URL or safe relative upload path
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("/uploads/") ||
    lower.startsWith("/media/") ||
    lower.startsWith("/api/")
  ) {
    return trimmed;
  }

  return null;
}

const VENDOR_PROOF_REQUIRED =
  "Payment proof is required before this vendor payout can be reviewed or verified. Upload a receipt, screenshot, or PDF on the payout record first.";

function vendorProofUrl(payment, extraUrl) {
  return sanitizeProofUrl(
    extraUrl ||
      payment?.invoiceFileUrl ||
      payment?.invoiceProof ||
      payment?.advanceProofUrl ||
      payment?.settlementProofUrl,
  );
}

function vendorProofWriteFields(url, secondUrl, existing = {}) {
  const invoice =
    sanitizeProofUrl(url) ||
    sanitizeProofUrl(existing?.invoiceFileUrl) ||
    sanitizeProofUrl(existing?.invoiceProof);
  const payment =
    sanitizeProofUrl(secondUrl) ||
    sanitizeProofUrl(existing?.advanceProofUrl) ||
    sanitizeProofUrl(existing?.settlementProofUrl);
  if (!invoice && !payment) return {};
  const inv = invoice || payment;
  const fields = {
    invoiceFileUrl: inv,
    invoiceProof: inv,
  };
  if (payment && payment !== inv) {
    fields.advanceProofUrl = payment;
    fields.settlementProofUrl = payment;
  }
  return fields;
}

/**
 * Sanitizes user input text (reasons / notes)
 */
function sanitizeReason(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/[<>]/g, "").trim().substring(0, 1000);
}

async function attachReliableSourceIfMissing(tx, payment, tenantId) {
  if (!payment || isCanonicalSource(payment.sourceType, payment.sourceId)) return payment;
  const op = await findOperationalSource(tx, payment.id, tenantId);
  if (!op) return payment;
  return tx.opsVendorPayment.update({
    where: { id: payment.id },
    data: { sourceType: op.sourceType, sourceId: op.sourceId },
    include: { trip: true, collectionAccount: true },
  });
}

async function findVendorPaymentBySource(tx, tenantId, sourceType, sourceId) {
  if (!tenantId || !isCanonicalSource(sourceType, sourceId)) return null;
  return tx.opsVendorPayment.findFirst({
    where: { tenantId, sourceType, sourceId },
    include: { trip: true, collectionAccount: true },
  });
}

async function resolveVendorPaymentRecord(tx, paymentId, tenantId) {
  const existing = await tx.opsVendorPayment.findFirst({
    where: { id: paymentId, tenantId },
    include: { trip: true, collectionAccount: true },
  });
  if (existing) return attachReliableSourceIfMissing(tx, existing, tenantId);

  const op = await findOperationalSource(tx, paymentId, tenantId);
  if (!op) return null;

  const linked = await findVendorPaymentBySource(tx, tenantId, op.sourceType, op.sourceId);
  if (linked) return linked;

  const fields = vendorFieldsFromOperationalSource(op);
  const departureDate = op.record.departureDate || new Date();
  const remaining = Math.max(0, fields.agreed - fields.paid);

  try {
    return await tx.opsVendorPayment.create({
      data: {
        tenantId,
        tripId: op.record.tripId,
        departureDate,
        vendorName: fields.vendorName,
        category: fields.category,
        serviceDescription: fields.serviceDescription,
        agreedAmount: fields.agreed,
        advancePaid: fields.paid,
        remainingPayable: remaining,
        status: fields.paid >= fields.agreed && fields.agreed > 0 ? "Paid" : fields.paid > 0 ? "Advance Paid" : "Pending Approval",
        approvalStatus: "PENDING",
        sourceType: op.sourceType,
        sourceId: op.sourceId,
      },
      include: { trip: true, collectionAccount: true },
    });
  } catch (err) {
    if (err?.code === "P2002") {
      const raced = await findVendorPaymentBySource(tx, tenantId, op.sourceType, op.sourceId);
      if (raced) return raced;
    }
    throw err;
  }
}

/**
 * Find an existing finance vendor payment by canonical id or operational source.
 * Never creates. Never searches by name, notes, or trip/category heuristics.
 */
async function findExistingVendorPayment(tx, paymentId, tenantId) {
  if (!paymentId || !tenantId) return null;

  const existing = await tx.opsVendorPayment.findFirst({
    where: { id: paymentId, tenantId },
    include: { trip: true, collectionAccount: true },
  });
  if (existing) return existing;

  const op = await findOperationalSource(tx, paymentId, tenantId);
  if (!op) return null;

  return findVendorPaymentBySource(tx, tenantId, op.sourceType, op.sourceId);
}

/**
 * Resolves OpsClientPayment by raw ID, adv- ID, or booking reference
 */
async function resolveCollectionPayment(txOrPrisma, paymentId, tenantId) {
  if (!paymentId) return null;
  const cleanId = String(paymentId).replace(/^adv-/, "");

  let payment = await txOrPrisma.opsClientPayment.findFirst({
    where: { id: paymentId, tenantId },
    include: {
      booking: {
        select: {
          id: true,
          bookingId: true,
          tripId: true,
          tripName: true,
          fullName: true,
          name: true,
          phone: true,
          email: true,
          departureDate: true,
          totalAmount: true,
          advancePaid: true,
        },
      },
      collectionAccount: true,
    },
  });

  if (payment) return payment;

  if (cleanId !== paymentId) {
    payment = await txOrPrisma.opsClientPayment.findFirst({
      where: { id: cleanId, tenantId },
      include: {
        booking: {
          select: {
            id: true,
            bookingId: true,
            tripId: true,
            tripName: true,
            fullName: true,
            name: true,
            phone: true,
            email: true,
            departureDate: true,
            totalAmount: true,
            advancePaid: true,
          },
        },
        collectionAccount: true,
      },
    });
    if (payment) return payment;
  }

  payment = await txOrPrisma.opsClientPayment.findFirst({
    where: {
      tenantId,
      OR: [
        { bookingId: cleanId },
        { booking: { id: cleanId } },
        { booking: { bookingId: cleanId } },
      ],
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingId: true,
          tripId: true,
          tripName: true,
          fullName: true,
          name: true,
          phone: true,
          email: true,
          departureDate: true,
          totalAmount: true,
          advancePaid: true,
        },
      },
      collectionAccount: true,
    },
  });

  return payment;
}

function assertCanVerifyCollection(req) {
  if (canCompleteCollectionVerification(req.user || req.admin)) return;
  const err = new Error("Forbidden: only Founder or Finance Controller can verify collections");
  err.statusCode = 403;
  throw err;
}

async function syncVerifiedBookingAndLedger(tx, { payment, user, tenantId }) {
  if (!payment.booking) return;

  const bookingIds = [payment.booking.id, payment.booking.bookingId].filter(Boolean);
  const allVerified = await tx.opsClientPayment.findMany({
    where: {
      tenantId,
      bookingId: { in: bookingIds },
      approvalStatus: TERMINAL_APPROVED,
      status: "Verified",
    },
  });

  const totalVerified = allVerified.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const remaining = Math.max(0, Number(payment.booking.totalAmount || 0) - totalVerified);
  const isFullyPaid = remaining === 0 && totalVerified > 0;
  const isPartial = totalVerified > 0 && !isFullyPaid;

  await tx.booking.update({
    where: { id: payment.booking.id },
    data: {
      advancePaid: totalVerified,
      remainingAmount: remaining,
      paymentStatus: isFullyPaid ? "Paid" : isPartial ? "Partial" : "Pending",
      payment_status: isFullyPaid ? "paid" : isPartial ? "partial" : "pending",
    },
  });

  try {
    const rawMode = String(payment.paymentMode || "UPI").toUpperCase();
    const normalizedMode = rawMode.includes("CASH")
      ? "CASH"
      : rawMode.includes("BANK") || rawMode.includes("NEFT") || rawMode.includes("IMPS")
        ? "BANK_TRANSFER"
        : "UPI";

    const existingEntry = await tx.accountingEntry.findFirst({
      where: {
        tenantId,
        bookingId: { in: bookingIds },
        amount: payment.amount,
      },
    });

    if (existingEntry) {
      await tx.accountingEntry.update({
        where: { id: existingEntry.id },
        data: {
          status: "APPROVED",
          collectionAccountId: payment.collectionAccountId || existingEntry.collectionAccountId,
          actionedById: user.id,
        },
      });
    } else {
      await tx.accountingEntry.create({
        data: {
          tenantId,
          bookingId: payment.booking.bookingId || payment.booking.id,
          amount: payment.amount,
          paymentMode: normalizedMode,
          collectionAccountId: payment.collectionAccountId,
          referenceNumber: payment.transactionId || `PAY-${payment.id}`,
          notes: payment.remarks || "Verified collection approval",
          status: "APPROVED",
          salespersonId: payment.booking.salesAdminId,
          actionedById: user.id,
        },
      });
    }
  } catch (entryErr) {
    console.warn("AccountingEntry sync in collection verification skipped:", entryErr.message);
  }
}

/**
 * Single verification used by both Founder and Finance Controller.
 * PENDING / REVIEWED_FINANCE_CONTROLLER / REJECTED → APPROVED_FOUNDER + Verified
 */
async function completeCollectionVerification(tx, { payment, user, tenantId, reason, proofFileUrl, req }) {
  if (payment.approvalStatus === TERMINAL_APPROVED) {
    return payment;
  }

  const rawProofUrl = proofFileUrl || payment.proofFileUrl || payment.proofUrl;
  const validProofUrl = sanitizeProofUrl(rawProofUrl);
  const isCash = isCashCollectionMode(payment.paymentMode);
  const verifierCanSkipProof = canCompleteCollectionVerification(req.user || req.admin || user);

  // Incoming is one-step for Founder / Finance Controller. Missing slips must not
  // block verify when the caller is already authorized. Attach proof when present.
  if (!validProofUrl && !isCash && !verifierCanSkipProof) {
    throw {
      statusCode: 400,
      message: "Valid receipt/payment proof screenshot is required before verification.",
    };
  }

  const previousState = {
    approvalStatus: payment.approvalStatus,
    status: payment.status,
  };

  const updateResult = await tx.opsClientPayment.updateMany({
    where: {
      id: payment.id,
      tenantId,
      approvalStatus: { in: ["PENDING", "REVIEWED_FINANCE_CONTROLLER", "REJECTED"] },
    },
    data: {
      approvalStatus: TERMINAL_APPROVED,
      approvedByFounderAt: new Date(),
      approvedByFounderId: user.id,
      reviewedByFinanceAt: payment.reviewedByFinanceAt || new Date(),
      reviewedByFinanceId: payment.reviewedByFinanceId || user.id,
      status: "Verified",
      ...(validProofUrl ? { proofFileUrl: validProofUrl, proofUrl: validProofUrl } : {}),
    },
  });

  if (updateResult.count === 0 && payment.approvalStatus !== TERMINAL_APPROVED) {
    throw {
      statusCode: 409,
      message: "Conflict: Payment has already been approved or modified concurrently.",
    };
  }

  const updated = await tx.opsClientPayment.findUnique({
    where: { id: payment.id },
    include: { booking: true, collectionAccount: true },
  });

  await tx.financeAuditLog.create({
    data: {
      tenantId,
      entityType: "CUSTOMER_PAYMENT",
      entityId: payment.id,
      tripId: payment.booking?.tripId || updated?.booking?.tripId || null,
      action: "APPROVED_FOUNDER",
      performedBy: user.id,
      performedByName: user.name,
      performedAt: new Date(),
      oldValue: JSON.stringify(previousState),
      newValue: JSON.stringify({ approvalStatus: TERMINAL_APPROVED, status: "Verified" }),
      changeDescription: `Collection of ₹${payment.amount} for booking ${payment.bookingId} verified by ${user.name} (${user.role}). Marked as VERIFIED.`,
      reason: sanitizeReason(reason) || null,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
    },
  });

  await syncVerifiedBookingAndLedger(tx, { payment: updated || payment, user, tenantId });
  return updated;
}

async function verifyCollectionRequest(req, res, { reason, proofFileUrl } = {}) {
  assertCanVerifyCollection(req);
  const { paymentId } = req.params;
  const user = resolveUser(req);
  const tenantId = resolveTenantId(req);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await resolveCollectionPayment(tx, paymentId, tenantId);
    if (!payment) {
      throw { statusCode: 404, message: "Collection payment not found or access denied" };
    }
    return completeCollectionVerification(tx, {
      payment,
      user,
      tenantId,
      reason,
      proofFileUrl,
      req,
    });
  });

  return res.json({
    success: true,
    status: "success",
    message: "Payment verified and approved.",
    payment: result,
  });
}

/**
 * 1️⃣ Finance Controller / Founder verifies a collection in one step.
 * State Transition: PENDING / REVIEWED_FINANCE_CONTROLLER / REJECTED -> APPROVED_FOUNDER (status: Verified)
 * PATCH /api/finance/collections/:paymentId/review-fc
 */
exports.reviewCollectionFC = async (req, res) => {
  try {
    const { reason, proofFileUrl } = req.body || {};
    return await verifyCollectionRequest(req, res, { reason, proofFileUrl });
  } catch (err) {
    console.error("reviewCollectionFC error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to verify collection payment",
    });
  }
};

/**
 * 2️⃣ Founder / Finance Controller verifies a collection in one step.
 * Same terminal state as review-fc so Incoming and Ledger stay in sync.
 * PATCH /api/finance/collections/:paymentId/approve-founder
 */
exports.approveCollectionFounder = async (req, res) => {
  try {
    const { reason, proofFileUrl } = req.body || {};
    return await verifyCollectionRequest(req, res, { reason, proofFileUrl });
  } catch (err) {
    console.error("approveCollectionFounder error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to verify collection payment",
    });
  }
};

/**
 * 3️⃣ Reject Payment (Either FC or Founder)
 * State Transition: PENDING / REVIEWED_FINANCE_CONTROLLER -> REJECTED
 * Concurrency Safe: Uses atomic conditional updateMany
 * PATCH /api/finance/collections/:paymentId/reject
 */
exports.rejectCollection = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body || {};
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const sanitized = sanitizeReason(reason);
    if (!sanitized || sanitized.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required (minimum 3 characters)",
        message: "Rejection reason is required (minimum 3 characters)",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await resolveCollectionPayment(tx, paymentId, tenantId);

      if (!payment) {
        throw { statusCode: 404, message: "Collection payment not found or access denied" };
      }

      if (payment.approvalStatus === "APPROVED_FOUNDER") {
        throw {
          statusCode: 400,
          message: "Cannot reject an already approved and verified payment.",
        };
      }

      const previousState = {
        approvalStatus: payment.approvalStatus,
        status: payment.status,
      };

      // Atomic conditional update
      const updateResult = await tx.opsClientPayment.updateMany({
        where: {
          id: payment.id,
          tenantId,
          approvalStatus: { not: "APPROVED_FOUNDER" },
        },
        data: {
          approvalStatus: "REJECTED",
          rejectionReason: sanitized,
          rejectionAt: new Date(),
          rejectedById: user.id,
          status: "Rejected",
        },
      });

      if (updateResult.count === 0) {
        throw {
          statusCode: 409,
          message: "Conflict: Payment has already been verified or modified concurrently.",
        };
      }

      const updated = await tx.opsClientPayment.findUnique({
        where: { id: payment.id },
        include: { booking: true, collectionAccount: true },
      });

      // Create immutable audit log
      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "CUSTOMER_PAYMENT",
          entityId: payment.id,
          tripId: payment.booking?.tripId || null,
          action: "REJECTED",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify(previousState),
          newValue: JSON.stringify({ approvalStatus: "REJECTED", status: "Rejected" }),
          changeDescription: `Payment of ₹${payment.amount} for booking ${payment.bookingId} rejected: ${sanitized}`,
          reason: sanitized,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      status: "success",
      message: "Payment rejected. Sent for correction.",
      payment: result,
    });
  } catch (err) {
    console.error("rejectCollection error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to reject collection payment",
    });
  }
};

/**
 * 4️⃣ Upload Proof / Receipt for Collection
 * Validates URLs and file types securely
 * POST /api/finance/collections/:paymentId/upload-proof
 */
exports.uploadCollectionProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const uploadedFile = resolveUploadedProofFile(req);
    let rawUrl =
      req.body?.proofFileUrl ||
      req.body?.proofUrl ||
      uploadedFile?.path ||
      uploadedFile?.location;

    if (uploadedFile && uploadedFile.buffer) {
      try {
        rawUrl = await persistPaymentProofFile(uploadedFile);
      } catch (storageErr) {
        return res.status(storageErr.statusCode || 500).json({
          success: false,
          message: storageErr.message || "Failed to store payment proof",
        });
      }
    }

    const validatedUrl = sanitizeProofUrl(rawUrl);

    if (!validatedUrl) {
      return res.status(400).json({
        success: false,
        error: "Invalid or insecure proof URL provided. Must be a valid HTTPS/HTTP or upload path.",
        message: "Invalid or insecure proof URL provided. Must be a valid HTTPS/HTTP or upload path.",
      });
    }

    const fileName =
      req.body?.proofFileName || uploadedFile?.originalname || "receipt.png";
    const fileType =
      req.body?.proofFileType || uploadedFile?.mimetype || "image/png";

    const result = await prisma.$transaction(async (tx) => {
      const payment = await resolveCollectionPayment(tx, paymentId, tenantId);

      if (!payment) {
        throw { statusCode: 404, message: "Collection payment not found or access denied" };
      }

      const updated = await tx.opsClientPayment.update({
        where: { id: payment.id },
        data: {
          proofFileUrl: validatedUrl,
          proofUrl: validatedUrl,
          proofUploadedAt: new Date(),
          proofFileName: fileName.substring(0, 255),
          proofFileType: fileType.substring(0, 50),
        },
        include: {
          booking: true,
          collectionAccount: true,
        },
      });

      // Create immutable audit log
      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "CUSTOMER_PAYMENT",
          entityId: paymentId,
          tripId: payment.booking?.tripId || null,
          action: "PROOF_UPLOADED",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify({ proofFileUrl: payment.proofFileUrl }),
          newValue: JSON.stringify({ proofFileUrl: validatedUrl }),
          changeDescription: `Receipt proof uploaded: ${fileName}`,
          reason: null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      status: "success",
      message: "Proof uploaded. Ready for approval.",
      proof_url: validatedUrl,
      payment: result,
    });
  } catch (err) {
    console.error("uploadCollectionProof error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to upload proof",
    });
  }
};

/**
 * 5️⃣ Get Payment Details with Full Approval & Audit History
 * GET /api/finance/collections/:paymentId
 */
exports.getCollectionDetailsWithAudit = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const tenantId = resolveTenantId(req);

    const payment = await resolveCollectionPayment(prisma, paymentId, tenantId);

    if (!payment) {
      const cleanId = String(paymentId || "").replace(/^adv-/, "");
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId,
          OR: [{ id: cleanId }, { bookingId: cleanId }],
        },
        select: {
          id: true,
          bookingId: true,
          fullName: true,
          name: true,
          phone: true,
          email: true,
          tripName: true,
          tripId: true,
          departureDate: true,
          totalAmount: true,
          advancePaid: true,
          paymentMode: true,
          createdAt: true,
        },
      });

      if (booking) {
        return res.json({
          success: true,
          payment: {
            id: paymentId,
            tenantId,
            bookingId: booking.bookingId || booking.id,
            amount: booking.advancePaid || 0,
            paymentMode: booking.paymentMode || "UPI",
            status: "Pending Verification",
            approvalStatus: "PENDING",
            paymentDate: booking.createdAt,
            booking,
            collectionAccount: null,
          },
          auditTrail: [],
          approvalChain: {
            step1_financeController: { status: "PENDING" },
            step2_founder: { status: "PENDING" },
          },
        });
      }

      // Check if it's a vendor payment ID
      const vendorPayment = await prisma.opsVendorPayment.findFirst({
        where: {
          tenantId,
          id: cleanId,
        },
        include: {
          trip: {
            select: { id: true, title: true, slug: true },
          },
          collectionAccount: true,
        },
      });

      if (vendorPayment) {
        const auditTrail = await prisma.financeAuditLog.findMany({
          where: {
            tenantId,
            entityId: vendorPayment.id,
            entityType: { in: ["VENDOR_PAYOUT", "VENDOR_PAYMENT"] },
          },
          orderBy: { performedAt: "asc" },
        });

        const balanceDue = (vendorPayment.agreedAmount || 0) - (vendorPayment.advancePaid || 0);
        const requiresFounder = vendorPayment.requiresFounderApproval || balanceDue > 50000;

        return res.json({
          success: true,
          payment: vendorPayment,
          auditTrail,
          approvalChain: {
            step1_financeController: {
              status:
                vendorPayment.approvalStatus === "REVIEWED_FINANCE_CONTROLLER" ||
                vendorPayment.approvalStatus === "APPROVED_FOUNDER"
                  ? "DONE"
                  : vendorPayment.approvalStatus === "REJECTED"
                  ? "REJECTED"
                  : "PENDING",
              approvedAt: vendorPayment.reviewedByFinanceAt,
              approvedBy: vendorPayment.reviewedByFinanceId,
            },
            step2_founder: {
              status: vendorPayment.approvalStatus === "APPROVED_FOUNDER" ? "DONE" : "PENDING",
              approvedAt: vendorPayment.approvedByFounderAt,
              approvedBy: vendorPayment.approvedByFounderId,
              required: requiresFounder,
            },
          },
        });
      }

      return res.status(404).json({ success: false, message: "Payment not found or access denied" });
    }

    const auditTrail = await prisma.financeAuditLog.findMany({
      where: {
        tenantId,
        entityId: payment.id,
        entityType: "CUSTOMER_PAYMENT",
      },
      orderBy: { performedAt: "asc" },
    });

    const verificationStatus =
      payment.approvalStatus === TERMINAL_APPROVED
        ? "DONE"
        : payment.approvalStatus === "REJECTED"
          ? "REJECTED"
          : "PENDING";
    const verification = {
      status: verificationStatus,
      approvedAt: payment.approvedByFounderAt || payment.reviewedByFinanceAt,
      approvedBy: payment.approvedByFounderId || payment.reviewedByFinanceId,
    };

    return res.json({
      success: true,
      payment,
      auditTrail,
      approvalChain: {
        verification,
        // Legacy two-step fields kept in sync so older clients do not show a fake second hop.
        step1_financeController: verification,
        step2_founder: {
          status: verificationStatus === "REJECTED" ? "PENDING" : verificationStatus,
          approvedAt: verification.approvedAt,
          approvedBy: verification.approvedBy,
        },
      },
    });
  } catch (err) {
    console.error("getCollectionDetailsWithAudit error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch payment details" });
  }
};

/**
 * Vendor Payment Audit Trail & Details
 * GET /api/finance/vendor-payments/:paymentId
 */
exports.getVendorPaymentDetailsWithAudit = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const tenantId = resolveTenantId(req);
    const cleanId = String(paymentId).replace(/^vnd-/, "").replace(/^adv-/, "");

    let payment = await prisma.opsVendorPayment.findFirst({
      where: {
        tenantId,
        OR: [{ id: paymentId }, { id: cleanId }],
      },
      include: {
        trip: {
          select: { id: true, title: true, slug: true },
        },
        collectionAccount: true,
      },
    });

    if (!payment) {
      if (paymentId.startsWith("hb-")) {
        const hbId = paymentId.replace("hb-", "");
        const hb = await prisma.opsHotelBooking.findFirst({
          where: { id: hbId, tenantId },
          include: { trip: { select: { id: true, title: true, slug: true } } },
        });
        if (hb) {
          payment = {
            id: paymentId,
            tenantId,
            tripId: hb.tripId,
            vendorName: hb.hotelName,
            category: "Hotels",
            serviceDescription: `${hb.roomType || "Hotel"} Stay (${hb.numberOfRooms || 1} Rooms) - ${hb.location || ""}`,
            agreedAmount: hb.totalAmount || 0,
            advancePaid: hb.advancePaid || 0,
            remainingPayable: Math.max(0, (hb.totalAmount || 0) - (hb.advancePaid || 0)),
            paymentDate: hb.departureDate || hb.createdAt,
            paymentMode: "BANK_TRANSFER",
            status: (hb.advancePaid || 0) >= (hb.totalAmount || 0) && (hb.totalAmount || 0) > 0 ? "Paid" : "Pending Approval",
            approvalStatus: (hb.advancePaid || 0) >= (hb.totalAmount || 0) && (hb.totalAmount || 0) > 0 ? "APPROVED_FOUNDER" : "PENDING",
            trip: hb.trip,
            collectionAccount: null,
            createdAt: hb.createdAt,
          };
        }
      } else if (paymentId.startsWith("fl-")) {
        const flId = paymentId.replace("fl-", "");
        const fl = await prisma.opsTransportFleet.findFirst({
          where: { id: flId, tenantId },
          include: { trip: { select: { id: true, title: true, slug: true } } },
        });
        if (fl) {
          payment = {
            id: paymentId,
            tenantId,
            tripId: fl.tripId,
            vendorName: fl.vendorName || fl.driverName || "Transport Fleet",
            category: "Transport",
            serviceDescription: `${fl.vehicleType || "Fleet Vehicle"} (${fl.vehicleNumber || "Route Fleet"})`,
            agreedAmount: fl.totalAmount || 0,
            advancePaid: fl.advancePaid || 0,
            remainingPayable: Math.max(0, (fl.totalAmount || 0) - (fl.advancePaid || 0)),
            paymentDate: fl.departureDate || fl.createdAt,
            paymentMode: "BANK_TRANSFER",
            status: (fl.advancePaid || 0) >= (fl.totalAmount || 0) && (fl.totalAmount || 0) > 0 ? "Paid" : "Pending Approval",
            approvalStatus: (fl.advancePaid || 0) >= (fl.totalAmount || 0) && (fl.totalAmount || 0) > 0 ? "APPROVED_FOUNDER" : "PENDING",
            trip: fl.trip,
            collectionAccount: null,
            createdAt: fl.createdAt,
          };
        }
      } else if (paymentId.startsWith("gp-")) {
        const gpId = paymentId.replace("gp-", "");
        const gp = await prisma.opsGuidePayment.findFirst({
          where: { id: gpId, tenantId },
          include: { trip: { select: { id: true, title: true, slug: true } } },
        });
        if (gp) {
          payment = {
            id: paymentId,
            tenantId,
            tripId: gp.tripId,
            vendorName: gp.guideName,
            category: "Guides",
            serviceDescription: `${gp.assignmentType || "Trip Leader"} (${gp.daysWorked || 1} Days)`,
            agreedAmount: gp.agreedAmount || 0,
            advancePaid: gp.advancePaid || 0,
            remainingPayable: Math.max(0, (gp.agreedAmount || 0) - (gp.advancePaid || 0)),
            paymentDate: gp.departureDate || gp.createdAt,
            paymentMode: "BANK_TRANSFER",
            status: gp.paymentStatus === "PAID" ? "Paid" : "Pending Approval",
            approvalStatus: gp.paymentStatus === "PAID" ? "APPROVED_FOUNDER" : "PENDING",
            trip: gp.trip,
            collectionAccount: null,
            createdAt: gp.createdAt,
          };
        }
      } else if (paymentId.startsWith("act-")) {
        const actId = paymentId.replace("act-", "");
        const act = await prisma.opsActivity.findFirst({
          where: { id: actId, tenantId },
          include: { trip: { select: { id: true, title: true, slug: true } } },
        });
        if (act) {
          payment = {
            id: paymentId,
            tenantId,
            tripId: act.tripId,
            vendorName: act.vendorName || act.name || "Activity Provider",
            category: act.type === "MEAL" ? "Meals" : "Activities",
            serviceDescription: `${act.name} (${act.type || "Activity"})`,
            agreedAmount: act.actualCost || act.estimatedCost || 0,
            advancePaid: 0,
            remainingPayable: act.actualCost || act.estimatedCost || 0,
            paymentDate: act.departureDate || act.createdAt,
            paymentMode: "BANK_TRANSFER",
            status: act.status === "CONFIRMED" ? "Pending Approval" : "Not Paid",
            approvalStatus: "PENDING",
            trip: act.trip,
            collectionAccount: null,
            createdAt: act.createdAt,
          };
        }
      }
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: "Vendor payment not found" });
    }

    const auditTrail = await prisma.financeAuditLog.findMany({
      where: {
        tenantId,
        entityId: payment.id,
        entityType: { in: ["VENDOR_PAYOUT", "VENDOR_PAYMENT"] },
      },
      orderBy: { performedAt: "asc" },
    });

    const balanceDue = (payment.agreedAmount || 0) - (payment.advancePaid || 0);
    const requiresFounder = payment.requiresFounderApproval || balanceDue > 50000;

    return res.json({
      success: true,
      payment,
      auditTrail,
      approvalChain: {
        step1_financeController: {
          status:
            payment.approvalStatus === "REVIEWED_FINANCE_CONTROLLER" ||
            payment.approvalStatus === "APPROVED_FOUNDER"
              ? "DONE"
              : payment.approvalStatus === "REJECTED"
              ? "REJECTED"
              : "PENDING",
          approvedAt: payment.reviewedByFinanceAt,
          approvedBy: payment.reviewedByFinanceId,
        },
        step2_founder: {
          status: payment.approvalStatus === "APPROVED_FOUNDER" ? "DONE" : "PENDING",
          approvedAt: payment.approvedByFounderAt,
          approvedBy: payment.approvedByFounderId,
          required: requiresFounder,
        },
      },
    });
  } catch (err) {
    console.error("getVendorPaymentDetailsWithAudit error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch vendor payment details" });
  }
};

/**
 * Single-step vendor payout verify.
 * PATCH /api/finance/vendor-payments/:paymentId/review-fc
 */
exports.reviewVendorPaymentFC = async (req, res) => {
  try {
    if (!canCompleteCollectionVerification(req.user || req.admin)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: only Founder or Finance Controller can approve vendor payouts",
      });
    }
    const { paymentId } = req.params;
    const { reason, invoiceFileUrl, proofFileUrl, proofUrl } = req.body || {};
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const result = await prisma.$transaction(async (tx) => {
      const payment = await resolveVendorPaymentRecord(tx, paymentId, tenantId);

      if (!payment) {
        throw { statusCode: 404, message: "Vendor payment not found or access denied" };
      }

      const resolvedProof = vendorProofUrl(
        payment,
        invoiceFileUrl || proofFileUrl || proofUrl,
      );
      if (!resolvedProof) {
        throw { statusCode: 400, message: VENDOR_PROOF_REQUIRED };
      }

      // Calculate strictly on the server-side from database fields
      const agreed = Number(payment.agreedAmount || 0);
      const advance = Number(payment.advancePaid || 0);
      const remainingPayable = Math.max(0, agreed - advance);

      const previousState = {
        approvalStatus: payment.approvalStatus,
        status: payment.status,
      };

      const newApprovalStatus = "APPROVED_FOUNDER";
      const newStatus =
        remainingPayable <= 0 && agreed > 0
          ? "Paid"
          : advance > 0
            ? "Advance Paid"
            : payment.status || "Pending Approval";
      const finalAdvance = advance;
      const finalRemaining = remainingPayable;

      const allowedStatuses = ["PENDING", "REJECTED", "REVIEWED_FINANCE_CONTROLLER"];

      // Atomic conditional update — always the resolved OpsVendorPayment id
      // (request param may be a Departure Hub hotel/fleet/guide id).
      const updateResult = await tx.opsVendorPayment.updateMany({
        where: {
          id: payment.id,
          tenantId,
          approvalStatus: { in: allowedStatuses },
        },
        data: {
          approvalStatus: newApprovalStatus,
          reviewedByFinanceAt: new Date(),
          reviewedByFinanceId: user.id,
          approvedByFounderAt: new Date(),
          approvedByFounderId: user.id,
          requiresFounderApproval: false,
          status: newStatus,
          advancePaid: finalAdvance,
          remainingPayable: finalRemaining,
          ...vendorProofWriteFields(resolvedProof, undefined, payment),
        },
      });

      if (updateResult.count === 0) {
        throw {
          statusCode: 409,
          message: "Conflict: Vendor payment is not in a pending review state or has already been modified.",
        };
      }

      const updated = await tx.opsVendorPayment.findUnique({
        where: { id: payment.id },
        include: { trip: true, collectionAccount: true },
      });

      await writeBackOrThrow(tx, updated, {
        tenantId,
        agreed,
        advance: finalAdvance,
      });

      // Create immutable audit log
      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "VENDOR_PAYMENT",
          entityId: payment.id,
          tripId: payment.tripId,
          action: "REVIEWED_FC",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify(previousState),
          newValue: JSON.stringify({
            approvalStatus: newApprovalStatus,
            requiresFounderApproval: false,
            status: newStatus,
          }),
          changeDescription: `Vendor payout verified for ${payment.vendorName} (Category: ${payment.category}, Remaining: ₹${finalRemaining})`,
          reason: sanitizeReason(reason) || null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return { updated, remainingPayable: finalRemaining, operationalSyncResolved: isCanonicalSource(updated?.sourceType, updated?.sourceId) };
    });

    return res.json({
      success: true,
      status: "success",
      message: "Vendor payout verified.",
      payment: result.updated,
      requiresFounderApproval: false,
      remainingPayable: result.remainingPayable,
      operationalLinked: result.operationalSyncResolved,
    });
  } catch (err) {
    console.error("reviewVendorPaymentFC error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to review vendor payout",
    });
  }
};

/**
 * 7️⃣ Founder Approves Vendor Payout
 * State Transition: REVIEWED_FINANCE_CONTROLLER -> APPROVED_FOUNDER (status: Paid)
 * Concurrency Safe: Uses atomic conditional updateMany
 * PATCH /api/finance/vendor-payments/:paymentId/approve-founder
 */
exports.approveVendorPaymentFounder = async (req, res) => {
  try {
    if (!canCompleteCollectionVerification(req.user || req.admin)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: only Founder or Finance Controller can approve vendor payouts",
      });
    }
    const { paymentId } = req.params;
    const { reason, invoiceFileUrl, proofFileUrl, proofUrl } = req.body || {};
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const result = await prisma.$transaction(async (tx) => {
      const payment = await resolveVendorPaymentRecord(tx, paymentId, tenantId);

      if (!payment) {
        throw { statusCode: 404, message: "Vendor payment not found or access denied" };
      }

      if (
        payment.approvalStatus !== "REVIEWED_FINANCE_CONTROLLER" &&
        payment.approvalStatus !== "PENDING"
      ) {
        if (payment.approvalStatus === "APPROVED_FOUNDER" && payment.status === "Paid") {
          throw { statusCode: 400, message: "Vendor payout is already approved and paid." };
        }
      }

      const invoiceUrl = vendorProofUrl(
        payment,
        invoiceFileUrl || proofFileUrl || proofUrl,
      );
      if (!invoiceUrl) {
        throw { statusCode: 400, message: VENDOR_PROOF_REQUIRED };
      }

      const previousState = {
        approvalStatus: payment.approvalStatus,
        status: payment.status,
      };

      const agreed = Number(payment.agreedAmount || 0);
      const recordedAdvance = Number(payment.advancePaid || 0);
      const remaining = Math.max(0, agreed - recordedAdvance);
      const newStatus =
        remaining <= 0 && agreed > 0 ? "Paid" : recordedAdvance > 0 ? "Advance Paid" : payment.status;

      // Atomic conditional update — resolved row id, not the inbound DH id
      const updateResult = await tx.opsVendorPayment.updateMany({
        where: {
          id: payment.id,
          tenantId,
          approvalStatus: { in: ["REVIEWED_FINANCE_CONTROLLER", "PENDING"] },
        },
        data: {
          approvalStatus: "APPROVED_FOUNDER",
          approvedByFounderAt: new Date(),
          approvedByFounderId: user.id,
          status: newStatus,
          advancePaid: recordedAdvance,
          remainingPayable: remaining,
          ...vendorProofWriteFields(invoiceUrl, undefined, payment),
        },
      });

      if (updateResult.count === 0) {
        throw {
          statusCode: 409,
          message: "Conflict: Vendor payout has already been approved or modified concurrently.",
        };
      }

      const updated = await tx.opsVendorPayment.findUnique({
        where: { id: payment.id },
        include: { trip: true, collectionAccount: true },
      });

      await writeBackOrThrow(tx, updated, {
        tenantId,
        agreed,
        advance: recordedAdvance,
      });

      // Create immutable audit log
      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "VENDOR_PAYMENT",
          entityId: payment.id,
          tripId: payment.tripId,
          action: "APPROVED_FOUNDER",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify(previousState),
          newValue: JSON.stringify({ approvalStatus: "APPROVED_FOUNDER", status: newStatus }),
          changeDescription: `Vendor payout verified for ${payment.vendorName} (₹${recordedAdvance} recorded)`,
          reason: sanitizeReason(reason) || null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      status: "success",
      message: "Founder approved. Vendor payout marked as processed.",
      payment: result,
      operationalLinked: isCanonicalSource(result?.sourceType, result?.sourceId),
    });
  } catch (err) {
    console.error("approveVendorPaymentFounder error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to approve vendor payout",
    });
  }
};

/**
 * Upload proof for a vendor payout (OpsVendorPayment).
 * POST /api/finance/vendor-payments/:paymentId/upload-proof
 */
exports.uploadVendorPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const uploadedFile = resolveUploadedProofFile(req);
    let rawUrl =
      req.body?.proofFileUrl ||
      req.body?.proofUrl ||
      req.body?.invoiceFileUrl ||
      req.body?.invoiceProof ||
      uploadedFile?.path ||
      uploadedFile?.location;

    if (uploadedFile && uploadedFile.buffer) {
      try {
        rawUrl = await persistPaymentProofFile(uploadedFile);
      } catch (storageErr) {
        return res.status(storageErr.statusCode || 500).json({
          success: false,
          message: storageErr.message || "Failed to store payment proof",
        });
      }
    }

    const validatedUrl = sanitizeProofUrl(rawUrl);
    const secondUrl = sanitizeProofUrl(
      req.body?.paymentProofUrl || req.body?.advanceProofUrl || req.body?.settlementProofUrl,
    );
    if (!validatedUrl && !secondUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid or insecure proof URL provided. Must be a valid HTTPS/HTTP or upload path.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await resolveVendorPaymentRecord(tx, paymentId, tenantId);
      if (!payment) {
        throw { statusCode: 404, message: "Vendor payment not found or access denied" };
      }

      let invoiceUrl = validatedUrl;
      let paymentUrl = secondUrl;
      const existingInvoice = sanitizeProofUrl(payment.invoiceFileUrl || payment.invoiceProof);
      if (validatedUrl && !secondUrl && existingInvoice && existingInvoice !== validatedUrl) {
        invoiceUrl = existingInvoice;
        paymentUrl = validatedUrl;
      }

      const updated = await tx.opsVendorPayment.update({
        where: { id: payment.id },
        data: vendorProofWriteFields(invoiceUrl, paymentUrl, payment),
        include: { trip: true, collectionAccount: true },
      });

      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "VENDOR_PAYMENT",
          entityId: payment.id,
          tripId: payment.tripId,
          action: "PROOF_UPLOADED",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify({
            invoiceFileUrl: payment.invoiceFileUrl,
            invoiceProof: payment.invoiceProof,
          }),
          newValue: JSON.stringify({
            invoiceFileUrl: updated.invoiceFileUrl,
            advanceProofUrl: updated.advanceProofUrl,
          }),
          changeDescription: `Vendor payout proof uploaded for ${payment.vendorName}`,
          reason: null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      status: "success",
      message: "Proof uploaded. Ready for Finance Controller review.",
      proof_url: result.invoiceFileUrl || validatedUrl,
      proofUrl: result.invoiceFileUrl || validatedUrl,
      payment: result,
    });
  } catch (err) {
    console.error("uploadVendorPaymentProof error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to upload vendor payout proof",
    });
  }
};

/**
 * 8️⃣ Reject Vendor Payout
 * PATCH /api/finance/vendor-payments/:paymentId/reject
 */
exports.rejectVendorPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body || {};
    const user = resolveUser(req);
    const tenantId = resolveTenantId(req);

    const sanitized = sanitizeReason(reason);
    if (!sanitized || sanitized.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required (minimum 3 characters)",
        message: "Rejection reason is required (minimum 3 characters)",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await findExistingVendorPayment(tx, paymentId, tenantId);

      if (!payment) {
        throw { statusCode: 404, message: "Vendor payment not found or access denied" };
      }

      if (payment.approvalStatus === "APPROVED_FOUNDER" || payment.status === "Paid") {
        throw {
          statusCode: 400,
          message: "Cannot reject an already finalized and paid vendor payout.",
        };
      }

      const previousState = {
        approvalStatus: payment.approvalStatus,
        status: payment.status,
      };

      // Atomic conditional update
      const updateResult = await tx.opsVendorPayment.updateMany({
        where: {
          id: payment.id,
          tenantId,
          approvalStatus: { not: "APPROVED_FOUNDER" },
          status: { not: "Paid" },
        },
        data: {
          approvalStatus: "REJECTED",
          rejectionReason: sanitized,
          rejectionAt: new Date(),
          rejectedById: user.id,
          status: "Rejected",
        },
      });

      if (updateResult.count === 0) {
        throw {
          statusCode: 409,
          message: "Conflict: Vendor payout has already been paid or modified concurrently.",
        };
      }

      const updated = await tx.opsVendorPayment.findUnique({
        where: { id: payment.id },
        include: { trip: true, collectionAccount: true },
      });

      // Create immutable audit log
      await tx.financeAuditLog.create({
        data: {
          tenantId,
          entityType: "VENDOR_PAYMENT",
          entityId: payment.id,
          tripId: payment.tripId,
          action: "REJECTED",
          performedBy: user.id,
          performedByName: user.name,
          performedAt: new Date(),
          oldValue: JSON.stringify(previousState),
          newValue: JSON.stringify({ approvalStatus: "REJECTED", status: "Rejected" }),
          changeDescription: `Vendor payment to ${payment.vendorName} rejected: ${sanitized}`,
          reason: sanitized,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      status: "success",
      message: "Vendor payment rejected.",
      payment: result,
    });
  } catch (err) {
    console.error("rejectVendorPayment error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to reject vendor payment",
    });
  }
};

/**
 * 9️⃣ Get All Pending Approvals (Dashboard)
 * GET /api/finance/approvals/pending
 */
exports.getPendingApprovals = async (req, res) => {
  try {
    const tenantId = resolveTenantId(req);
    const user = resolveUser(req);
    const isFounderOrAdmin =
      user.role === "admin" ||
      user.role === "superadmin" ||
      user.role === "founder" ||
      user.role === "owner";

    const customerWhere = {
      tenantId,
      approvalStatus: {
        in: ["PENDING", "REVIEWED_FINANCE_CONTROLLER"],
      },
    };

    const vendorWhere = {
      tenantId,
      approvalStatus: {
        in: isFounderOrAdmin
          ? ["PENDING", "REVIEWED_FINANCE_CONTROLLER"]
          : ["PENDING"],
      },
      NOT: {
        AND: [
          { approvalStatus: "APPROVED_FOUNDER" },
          { status: "Paid" },
        ],
      },
    };

    const [customerPayments, vendorPayments] = await Promise.all([
      prisma.opsClientPayment.findMany({
        where: customerWhere,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              bookingId: true,
              fullName: true,
              name: true,
              phone: true,
              tripName: true,
              departureDate: true,
              totalAmount: true,
            },
          },
          collectionAccount: true,
        },
      }),
      prisma.opsVendorPayment.findMany({
        where: vendorWhere,
        orderBy: { createdAt: "desc" },
        include: {
          trip: { select: { id: true, title: true, slug: true } },
          collectionAccount: true,
        },
      }),
    ]);

    const bookingIds = [
      ...new Set(
        customerPayments.flatMap((p) => [p.bookingId, p.booking?.bookingId, p.booking?.id].filter(Boolean)),
      ),
    ];
    const linkedEntries = bookingIds.length
      ? await prisma.accountingEntry.findMany({
          where: { tenantId, bookingId: { in: bookingIds } },
          include: { actionedBy: { select: { id: true, name: true, email: true, role: true } } },
        })
      : [];

    const decoratedCustomerPayments = customerPayments.map((payment) => {
      const match = linkedEntries.find(
        (entry) =>
          Number(entry.amount) === Number(payment.amount) &&
          [payment.bookingId, payment.booking?.bookingId, payment.booking?.id].includes(entry.bookingId),
      );
      const pending = payment.approvalStatus !== "APPROVED_FOUNDER";
      const assignee = match?.actionedBy;
      const validAssignee = pending
        ? assignee && canCompleteCollectionVerification(assignee)
          ? assignee
          : null
        : assignee;
      return {
        ...payment,
        actionedById: validAssignee?.id || null,
        actionedBy: validAssignee ? { id: validAssignee.id, name: validAssignee.name } : null,
      };
    });

    const pendingFC = customerPayments.filter((c) => c.approvalStatus === "PENDING").length;
    const awaitingFounder = customerPayments.filter((c) => c.approvalStatus === "REVIEWED_FINANCE_CONTROLLER").length;
    const vendorPendingFC = vendorPayments.filter((v) => v.approvalStatus === "PENDING").length;
    const vendorAwaitingFounder = vendorPayments.filter((v) => v.approvalStatus === "REVIEWED_FINANCE_CONTROLLER" && v.requiresFounderApproval).length;

    return res.json({
      success: true,
      pendingApprovals: {
        customerCollections: customerPayments.length,
        vendorPayouts: vendorPayments.length,
        total: customerPayments.length + vendorPayments.length,
        breakdown: {
          collectionsPendingFC: pendingFC,
          collectionsAwaitingFounder: awaitingFounder,
          vendorPendingFC: vendorPendingFC,
          vendorAwaitingFounder: vendorAwaitingFounder,
        },
        items: {
          customerPayments: decoratedCustomerPayments,
          vendorPayments,
        },
      },
    });
  } catch (err) {
    console.error("getPendingApprovals error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch pending approvals" });
  }
};

/**
 * 🔟 Monthly Financial Reconciliation Report
 * Strict boundary UTC filtering to avoid month leakage
 * GET /api/finance/reconciliation/monthly/:year/:month
 */
exports.getMonthlyReconciliation = async (req, res) => {
  try {
    const { year, month } = req.params;
    const tenantId = resolveTenantId(req);

    const parsedYear = parseInt(year, 10) || new Date().getFullYear();
    const parsedMonth = parseInt(month, 10) || (new Date().getMonth() + 1);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ success: false, message: "Invalid month: must be between 1 and 12" });
    }

    // Exact calendar month boundaries in UTC
    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59, 999));

    const [collections, payouts, auditLogs] = await Promise.all([
      prisma.opsClientPayment.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          booking: {
            select: { id: true, bookingId: true, fullName: true, name: true, tripName: true },
          },
          collectionAccount: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.opsVendorPayment.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          trip: { select: { id: true, title: true } },
          collectionAccount: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.financeAuditLog.findMany({
        where: {
          tenantId,
          performedAt: { gte: startDate, lte: endDate },
        },
        orderBy: { performedAt: "desc" },
        take: 500,
      }),
    ]);

    const totalCollections = collections.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);

    const report = {
      period: `${parsedMonth}/${parsedYear}`,
      summary: {
        totalCollections,
        totalPayouts,
        netCashFlow: totalCollections - totalPayouts,
        collectionsByStatus: {
          pending: collections.filter((c) => c.approvalStatus === "PENDING").length,
          reviewedFC: collections.filter((c) => c.approvalStatus === "REVIEWED_FINANCE_CONTROLLER").length,
          approvedFounder: collections.filter((c) => c.approvalStatus === "APPROVED_FOUNDER").length,
          rejected: collections.filter((c) => c.approvalStatus === "REJECTED").length,
        },
        payoutsByStatus: {
          pending: payouts.filter((p) => p.approvalStatus === "PENDING").length,
          reviewedFC: payouts.filter((p) => p.approvalStatus === "REVIEWED_FINANCE_CONTROLLER").length,
          approvedFounder: payouts.filter((p) => p.approvalStatus === "APPROVED_FOUNDER").length,
          rejected: payouts.filter((p) => p.approvalStatus === "REJECTED").length,
        },
      },
      collections,
      payouts,
      auditTrail: auditLogs,
    };

    return res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error("getMonthlyReconciliation error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate reconciliation report" });
  }
};
