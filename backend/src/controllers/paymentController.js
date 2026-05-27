const { prisma } = require('../lib/prisma');

/**
 * Recalculates paidAmount and status based on Prisma
 */
async function syncBookingFromPayments(bookingId, tenantId) {
  const payments = await prisma.payment.findMany({
    where: { bookingId, tenantId }
  });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId }
  });
  if (!booking) return;

  const totalAmount = booking.totalAmount || 0;
  let paymentStatus = 'unpaid';
  if (totalPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      advancePaid: totalPaid,
      paymentStatus,
      remainingAmount: totalAmount - totalPaid
    }
  });
}

/**
 * @desc    Add payment
 * @route   POST /api/payments
 * @access  Private/Admin
 */
exports.addPayment = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { bookingId, amount, paymentMode } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tenantId }
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: Number(amount),
        paymentMode,
        tenantId
      }
    });

    await syncBookingFromPayments(bookingId, tenantId);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payments for a booking
 * @route   GET /api/payments/booking/:bookingId
 * @access  Private/Admin
 */
exports.getPaymentsByBooking = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const payments = await prisma.payment.findMany({
      where: { bookingId: req.params.bookingId, tenantId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get all payments (tenantId scoped)
 * @route   GET /api/payments
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment
 * @route   DELETE /api/payments/:id
 */
exports.deletePayment = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, tenantId }
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    await prisma.payment.delete({
      where: { id: req.params.id }
    });

    await syncBookingFromPayments(payment.bookingId, tenantId);

    res.json({ success: true, message: 'Payment deleted and booking synced' });
  } catch (error) {
    next(error);
  }
};
