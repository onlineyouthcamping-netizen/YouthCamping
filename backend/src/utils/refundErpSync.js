const { PAYMENT_STATUS, derivePaymentStatus } = require("./paymentStatus");
const { departureWorkspaceHref } = require("./vendorOperationalSource");

function computeOriginBalanceAfterRefund(booking, cashAmount, creditAmount) {
  const cash = Number(cashAmount) || 0;
  const credit = Number(creditAmount) || 0;
  const released = cash + credit;
  const prevPaid = Number(booking?.advancePaid) || 0;
  const newPaid = Math.max(0, prevPaid - released);
  const total = Number(booking?.totalAmount || booking?.amount || 0);
  const cancelled = ["cancelled", "canceled", "CANCELLED"].includes(
    String(booking?.status || ""),
  );
  const remaining = cancelled ? 0 : Math.max(0, total - newPaid);
  let paymentStatus = derivePaymentStatus({ totalAmount: total, advancePaid: newPaid });
  if (cancelled && released > 0) {
    paymentStatus = PAYMENT_STATUS.REFUNDED;
  }
  return { newPaid, remaining, paymentStatus, released, cash, credit };
}

function mapRefundQueueItem(refund) {
  const booking = refund.booking || {};
  const cash = Number(refund.refundAmount) || 0;
  const credit = Number(refund.creditNoteAmount) || 0;
  const tripId = booking.tripId || booking.tripRef?.id;
  return {
    ...refund,
    customerName: booking.fullName || booking.name || "",
    customerPhone: booking.phone || "",
    tripName: booking.tripName || booking.tripRef?.title || "",
    tripId: tripId || null,
    departureDate: booking.departureDate || null,
    departureHref: departureWorkspaceHref(tripId, booking.departureDate),
    totalRequested: cash + credit,
    workflow:
      refund.status === "PENDING_APPROVAL"
        ? "Pending FC"
        : refund.status === "COMPLETED" || refund.status === "APPROVED"
          ? "Posted to ERP"
          : refund.status === "REJECTED"
            ? "Rejected"
            : refund.status,
  };
}

async function writeRefundToBookingAndOps(tx, { refund, booking, refundReference, tenantId, actorId }) {
  const { newPaid, remaining, paymentStatus, cash, credit } = computeOriginBalanceAfterRefund(
    booking,
    refund.refundAmount,
    refund.creditNoteAmount,
  );

  await tx.booking.update({
    where: { bookingId: booking.bookingId },
    data: {
      advancePaid: newPaid,
      remainingAmount: remaining,
      paymentStatus,
      adminNotes: booking.adminNotes
        ? `${booking.adminNotes}\n[Refund posted]: ₹${cash} cash (Ref: ${refundReference}) + ₹${credit} credit`
        : `[Refund posted]: ₹${cash} cash (Ref: ${refundReference}) + ₹${credit} credit`,
    },
  });

  if (cash > 0) {
    await tx.opsClientPayment.create({
      data: {
        tenantId: tenantId || booking.tenantId || "default",
        bookingId: booking.bookingId,
        amount: -cash,
        paymentMode: "BANK_TRANSFER",
        transactionId: refundReference,
        paymentDate: new Date(),
        status: "Refunded",
        approvalStatus: "APPROVED_FOUNDER",
        remarks: `TYPE:REFUND|REFUND_ID:${refund.id}|Cash refund posted from Finance`,
        collectedBy: "Finance",
        recordedByUserId: actorId || null,
      },
    });
  }

  return { newPaid, remaining, paymentStatus };
}

module.exports = {
  computeOriginBalanceAfterRefund,
  mapRefundQueueItem,
  writeRefundToBookingAndOps,
};
