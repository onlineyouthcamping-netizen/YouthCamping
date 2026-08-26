"use strict";

const { TERMINAL_APPROVED } = require("./collectionVerification");

/** IST calendar-day bounds for a YYYY-MM-DD departure key (matches bookingController). */
function istDayBounds(departureDateKey) {
  const key = String(departureDateKey || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  return {
    start: new Date(`${key}T00:00:00+05:30`),
    end: new Date(`${key}T23:59:59.999+05:30`),
  };
}

function sameIstDay(dateValue, departureDateKey) {
  if (!dateValue || !departureDateKey) return false;
  const bounds = istDayBounds(departureDateKey);
  if (!bounds) return false;
  const t = new Date(dateValue).getTime();
  return t >= bounds.start.getTime() && t <= bounds.end.getTime();
}

function isActiveStationCollection(p) {
  if (!p || p.isReversed) return false;
  const status = String(p.collectionStatus || "").toUpperCase();
  if (status === "CANCELLED" || status === "REVERSED") return false;
  if (p.paymentMode === "CASH") return status === "COLLECTED";
  if (p.paymentMode === "UPI") {
    return String(p.upiVerificationStatus || "").toUpperCase() === "VERIFIED";
  }
  return false;
}

function sumActiveStationCollections(collections) {
  return (collections || [])
    .filter(isActiveStationCollection)
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
}

function isClearedLegacyPayment(p) {
  if (!p) return false;
  if (p.approvalStatus != null && String(p.approvalStatus).trim() !== "") {
    return String(p.approvalStatus).toUpperCase().replace(/[\s-]+/g, "_") === TERMINAL_APPROVED;
  }
  const s = String(p.status || "").toLowerCase().trim();
  return ["success", "verified", "paid", "approved", "cleared"].includes(s);
}

function isClearedOpsPayment(p) {
  if (!p) return false;
  const approval = String(p.approvalStatus || "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (approval === TERMINAL_APPROVED) return true;
  if (approval && approval !== "PENDING" && approval !== "REJECTED") {
    // Strict: only founder terminal counts when approval workflow is present
    return approval === "APPROVED_FOUNDER";
  }
  const s = String(p.status || "").toLowerCase().trim();
  return !p.approvalStatus && ["success", "verified", "paid", "cleared"].includes(s);
}

/**
 * Effective cleared paid for a booking from receipts + active station collections.
 * Prefer the higher of (ops+legacy+station) vs approved AccountingEntry total so
 * booking-workspace ledger rows still count when OpsClientPayment is missing.
 */
function computeEffectivePaid({
  totalAmount,
  opsClientPayments = [],
  legacyPayments = [],
  stationPayments = [],
  accountingEntries = [],
}) {
  const opsSum = (opsClientPayments || [])
    .filter(isClearedOpsPayment)
    .reduce((s, p) => s + Math.max(0, Number(p.amount) || 0), 0);
  const legacySum = (legacyPayments || [])
    .filter(isClearedLegacyPayment)
    .reduce((s, p) => s + Math.max(0, Number(p.amount) || 0), 0);
  const stationSum = sumActiveStationCollections(stationPayments);
  const receiptStack = opsSum + legacySum + stationSum;

  const accountingSum = (accountingEntries || [])
    .filter((e) => String(e.status || "").toUpperCase() === "APPROVED")
    .reduce((s, e) => s + Math.max(0, Number(e.amount) || 0), 0);

  const paid = Math.max(receiptStack, accountingSum);
  const total = Math.max(0, Number(totalAmount) || 0);
  const remaining = Math.max(0, total - paid);
  return {
    paidAmount: paid,
    remainingAmount: remaining,
    opsSum,
    legacySum,
    stationSum,
    accountingSum,
    paymentStatus:
      remaining <= 0 && paid > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
  };
}

/**
 * Recompute booking.advancePaid / remainingAmount after station mutations.
 */
async function syncBookingBalanceFromSources(txOrPrisma, booking) {
  if (!booking?.bookingId) return null;
  const ids = [booking.id, booking.bookingId].filter(Boolean);

  const [stationPayments, opsClientPayments, accountingEntries, legacyPayments] =
    await Promise.all([
      txOrPrisma.stationPaymentCollection.findMany({
        where: { bookingId: booking.bookingId },
      }),
      txOrPrisma.opsClientPayment.findMany({
        where: { bookingId: { in: ids } },
      }),
      txOrPrisma.accountingEntry.findMany({
        where: { bookingId: booking.bookingId },
        select: { amount: true, status: true },
      }),
      txOrPrisma.payment
        ? txOrPrisma.payment.findMany({
            where: { bookingId: { in: ids } },
          })
        : Promise.resolve([]),
    ]);

  const computed = computeEffectivePaid({
    totalAmount: booking.totalAmount || booking.amount || 0,
    opsClientPayments,
    legacyPayments,
    stationPayments,
    accountingEntries,
  });

  return txOrPrisma.booking.update({
    where: { bookingId: booking.bookingId },
    data: {
      advancePaid: computed.paidAmount,
      remainingAmount: computed.remainingAmount,
      paymentStatus: computed.paymentStatus,
      payment_status:
        computed.paymentStatus === "PAID"
          ? "paid"
          : computed.paymentStatus === "PARTIAL"
            ? "partial"
            : "unpaid",
    },
  });
}

module.exports = {
  istDayBounds,
  sameIstDay,
  isActiveStationCollection,
  sumActiveStationCollections,
  computeEffectivePaid,
  syncBookingBalanceFromSources,
};
