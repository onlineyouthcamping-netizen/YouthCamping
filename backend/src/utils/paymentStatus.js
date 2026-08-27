/**
 * Canonical Payment Status Vocabulary
 *
 * Single source of truth for payment status values across the system.
 *
 *   UNPAID   → nothing collected
 *   PARTIAL  → some (verified) amount collected
 *   PAID     → fully paid (remaining = 0)
 *   REFUNDED → fully refunded after cancellation
 *
 * Legacy values written by older code (e.g. "Paid", "paid", "Pending / Manual
 * Verification", "Partially Paid", "Unpaid", "PAID", "PARTIAL") are mapped to
 * the canonical vocabulary via normalizePaymentStatus() so historical rows
 * keep grouping correctly without destructive data migration.
 */

const { TERMINAL_APPROVED } = require("./collectionVerification");

const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
};

const PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

// Legacy → canonical read-time mapping (never used for writes)
const LEGACY_TO_CANONICAL = {
  // fully paid variants
  paid: "PAID",
  PAID: "PAID",
  Paid: "PAID",
  Confirmed: "PAID",
  confirmed: "PAID",
  "Partially Paid": "PARTIAL",
  partial: "PARTIAL",
  Partial: "PARTIAL",
  PARTIAL: "PARTIAL",
  unpaid: "UNPAID",
  Unpaid: "UNPAID",
  UNPAID: "UNPAID",
  pending: "UNPAID",
  Pending: "UNPAID",
  "Pending / Manual Verification": "UNPAID",
  refunded: "REFUNDED",
  Refunded: "REFUNDED",
  REFUNDED: "REFUNDED",
  Cancelled: "REFUNDED",
  cancelled: "REFUNDED",
};

/**
 * Map any legacy/raw payment status string to the canonical vocabulary.
 * Unknown values fall back to UNPAID (safe default; never crashes).
 */
const normalizePaymentStatus = (value) => {
  if (value === null || value === undefined || value === "") {
    return PAYMENT_STATUS.UNPAID;
  }
  const raw = String(value).trim();
  if (LEGACY_TO_CANONICAL[raw] !== undefined) {
    return LEGACY_TO_CANONICAL[raw];
  }
  const lower = raw.toLowerCase();
  if (lower.includes("refund")) return PAYMENT_STATUS.REFUNDED;
  if (lower.includes("paid")) return PAYMENT_STATUS.PAID;
  if (lower.includes("partial") || lower.includes("partially")) {
    return PAYMENT_STATUS.PARTIAL;
  }
  if (lower.includes("unpaid") || lower.includes("pending")) {
    return PAYMENT_STATUS.UNPAID;
  }
  return PAYMENT_STATUS.UNPAID;
};

/**
 * Derive the canonical payment status for a booking from authoritative
 * records: verified opsClientPayment receipts + success Payment rows, with
 * advancePaid used as an additional signal (max of both), like the financial
 * dashboard already does.
 */
const derivePaymentStatus = ({
  totalAmount = 0,
  advancePaid = 0,
  verifiedReceiptSum = 0,
}) => {
  const collected = Math.max(Number(advancePaid) || 0, Number(verifiedReceiptSum) || 0);
  const total = Number(totalAmount) || 0;

  if (total > 0 && collected >= total) return PAYMENT_STATUS.PAID;
  if (collected > 0) return PAYMENT_STATUS.PARTIAL;
  return PAYMENT_STATUS.UNPAID;
};

/**
 * Sum of verified payment records for a booking, querying both the
 * `Payment` (status success) and `opsClientPayment` (status Verified)
 * tables. Returns { sum, standard, receipts }.
 */
const sumVerifiedPaymentsForBooking = async (prisma, bookingId, extraId) => {
  const ids = Array.from(new Set([bookingId, extraId].filter(Boolean)));

  const [standardPayments, verifiedReceipts] = await Promise.all([
    prisma.payment.findMany({
      where: { bookingId: { in: ids } },
      select: { amount: true, status: true },
    }),
    prisma.opsClientPayment.findMany({
      where: {
        bookingId: { in: ids },
        approvalStatus: TERMINAL_APPROVED,
      },
      select: { amount: true },
    }),
  ]);

  const standardSum = standardPayments
    .filter((p) => ["success", "Success", "SUCCESS", "verified"].includes(String(p.status).trim()))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const receiptSum = verifiedReceipts.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return {
    standardSum,
    receiptSum,
    sum: standardSum + receiptSum,
  };
};

const REJECTED_COLLECTION_STATUSES = [
  "Rejected",
  "Refunded",
  "REJECTED",
  "REFUNDED",
];

/**
 * Sum of customer collections recorded at booking time (pending finance
 * verification plus already-verified receipts). Used for customer-facing
 * confirmation emails so the salesperson's entered amount is shown even
 * before finance certifies the payment.
 */
const sumRecordedCollectionsForBooking = async (prisma, bookingId, extraId) => {
  const ids = Array.from(new Set([bookingId, extraId].filter(Boolean)));
  if (ids.length === 0) return 0;

  const receipts = await prisma.opsClientPayment.findMany({
    where: {
      bookingId: { in: ids },
      NOT: { status: { in: REJECTED_COLLECTION_STATUSES } },
    },
    select: { amount: true },
  });

  return receipts.reduce((s, r) => s + (Number(r.amount) || 0), 0);
};

/**
 * Overlay the customer-facing collected amount onto a booking object for
 * confirmation emails. Finance still stores only verified money on
 * booking.advancePaid; this does not write to the database.
 */
const overlayCustomerFacingCollection = (
  booking,
  recordedSum = 0,
  extraCollected = 0,
) => {
  const collected = Math.max(
    Number(booking?.advancePaid) || 0,
    Number(recordedSum) || 0,
    Number(extraCollected) || 0,
  );
  const total = Number(booking?.totalAmount) || 0;
  return {
    ...booking,
    advancePaid: collected,
    remainingAmount: Math.max(0, total - collected),
  };
};

const isPaymentStatus = (value) => PAYMENT_STATUSES.includes(value);

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_STATUSES,
  normalizePaymentStatus,
  derivePaymentStatus,
  sumVerifiedPaymentsForBooking,
  sumRecordedCollectionsForBooking,
  overlayCustomerFacingCollection,
  isPaymentStatus,
};
