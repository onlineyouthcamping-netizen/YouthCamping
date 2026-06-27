const { prisma } = require('../lib/prisma');

// Helper to check booking ownership for sales
const checkBookingOwnership = async (bookingId, user) => {
  if (['superadmin', 'admin', 'finance', 'operations', 'BOOKING_VERIFIER'].includes(user.role)) {
    return true;
  }
  if (user.role === 'sales') {
    const booking = await prisma.booking.findFirst({
      where: { bookingId, tenantId: user.tenantId }
    });
    if (!booking) return false;
    return booking.salesAdminId === user.id;
  }
  return false;
};

/**
 * GET /api/accounting/entries
 * Fetch manual ledger entries with filters
 */
exports.getEntries = async (req, res) => {
  try {
    const { status, salespersonId, paymentMode, bookingId, search } = req.query;

    const where = {
      tenantId: req.user.tenantId || 'default'
    };

    // Role-based security scoping
    if (req.user.role === 'sales') {
      where.salespersonId = req.user.id;
    } else if (salespersonId) {
      where.salespersonId = salespersonId;
    }

    if (status) {
      where.status = status;
    }
    if (paymentMode) {
      where.paymentMode = paymentMode;
    }
    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { booking: { name: { contains: search, mode: 'insensitive' } } },
        { booking: { fullName: { contains: search, mode: 'insensitive' } } },
        { booking: { bookingId: { contains: search, mode: 'insensitive' } } },
        { booking: { tripName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const entries = await prisma.accountingEntry.findMany({
      where,
      include: {
        booking: {
          select: {
            bookingId: true,
            name: true,
            fullName: true,
            tripName: true,
            totalAmount: true,
            adjustedPrice: true,
            numberOfTravelers: true,
            salesAdminId: true
          }
        },
        salesperson: { select: { id: true, name: true, email: true } },
        actionedBy: { select: { id: true, name: true } },
        history: {
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: entries });
  } catch (err) {
    console.error('getEntries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch accounting entries' });
  }
};

/**
 * POST /api/accounting/entries
 * Submit a manual payment received for manager approval
 */
exports.createEntry = async (req, res) => {
  try {
    const { bookingId, amount, paymentMode, referenceNumber, notes } = req.body;

    if (!bookingId || !amount || !paymentMode) {
      return res.status(400).json({ success: false, message: 'bookingId, amount, and paymentMode are required' });
    }

    // 1. Verify salesperson owns this booking or has admin rights
    const hasAccess = await checkBookingOwnership(bookingId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this booking' });
    }

    // 2. Prevent fake/ghost duplicate entry check (same amount, mode, ref inside 5 mins)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingDuplicate = await prisma.accountingEntry.findFirst({
      where: {
        bookingId,
        amount: parseFloat(amount),
        paymentMode,
        referenceNumber: referenceNumber || null,
        createdAt: { gte: fiveMinsAgo }
      }
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment entry detected. Please wait 5 minutes before submitting the same payment.'
      });
    }

    // 3. Create the pending entry
    const entry = await prisma.accountingEntry.create({
      data: {
        tenantId: req.user.tenantId || 'default',
        bookingId,
        amount: parseFloat(amount),
        paymentMode,
        referenceNumber,
        notes,
        status: 'PENDING',
        salespersonId: req.user.role === 'sales' ? req.user.id : req.body.salespersonId || req.user.id
      }
    });

    // 4. Write immutable history log
    await prisma.accountingEntryLog.create({
      data: {
        accountingEntryId: entry.id,
        action: 'SUBMIT',
        notes: `Submitted payment entry of ₹${amount} via ${paymentMode}`,
        actorId: req.user.id
      }
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('createEntry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create accounting entry' });
  }
};

/**
 * POST /api/accounting/entries/:id/approve
 * Manager/Admin approves a pending payment entry
 */
exports.approveEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.accountingEntry.findUnique({
      where: { id }
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Accounting entry not found' });
    }

    if (entry.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot approve entry with status ${entry.status}` });
    }

    // Update status
    const updated = await prisma.accountingEntry.update({
      where: { id },
      data: {
        status: 'APPROVED',
        actionedById: req.user.id
      }
    });

    // Write immutable history log
    await prisma.accountingEntryLog.create({
      data: {
        accountingEntryId: entry.id,
        action: 'APPROVE',
        notes: 'Approved payment entry',
        actorId: req.user.id
      }
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('approveEntry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve entry' });
  }
};

/**
 * POST /api/accounting/entries/:id/reject
 * Manager/Admin rejects a pending payment entry
 */
exports.rejectEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const entry = await prisma.accountingEntry.findUnique({
      where: { id }
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Accounting entry not found' });
    }

    if (entry.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot reject entry with status ${entry.status}` });
    }

    // Update status
    const updated = await prisma.accountingEntry.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        actionedById: req.user.id
      }
    });

    // Write immutable history log
    await prisma.accountingEntryLog.create({
      data: {
        accountingEntryId: entry.id,
        action: 'REJECT',
        notes: `Rejected payment entry. Reason: ${reason}`,
        actorId: req.user.id
      }
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('rejectEntry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject entry' });
  }
};

/**
 * GET /api/accounting/reports
 * Fetch financial statistics, collections, trends
 */
exports.getReports = async (req, res) => {
  try {
    const { tripId, salespersonId, paymentMode, startDate, endDate } = req.query;

    const where = {
      tenantId: req.user.tenantId || 'default'
    };

    // Filter by dates if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (salespersonId) {
      where.salespersonId = salespersonId;
    }
    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    if (tripId) {
      where.booking = { tripId };
    }

    // Fetch approved and pending entries separately to calculate aggregates
    const entries = await prisma.accountingEntry.findMany({
      where,
      include: {
        booking: {
          select: {
            bookingId: true,
            tripId: true,
            tripName: true,
            totalAmount: true,
            salesAdminId: true
          }
        },
        salesperson: { select: { id: true, name: true } }
      }
    });

    // 1. Total pending collections
    const pendingTotal = entries
      .filter(e => e.status === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0);

    // 2. Revenue grouped by trip
    const tripRevenueMap = {};
    // 3. Salesperson collections
    const salesPerformanceMap = {};
    // 4. Monthly revenue trend
    const monthlyTrendMap = {};

    entries.forEach(e => {
      if (e.status === 'APPROVED') {
        // Group by Trip
        const tripName = e.booking?.tripName || 'Unknown Trip';
        tripRevenueMap[tripName] = (tripRevenueMap[tripName] || 0) + e.amount;

        // Group by Salesperson
        const spName = e.salesperson?.name || 'Unknown Sales';
        salesPerformanceMap[spName] = (salesPerformanceMap[spName] || 0) + e.amount;

        // Group by Month (YYYY-MM)
        const date = new Date(e.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + e.amount;
      }
    });

    // Format reports
    const revenuePerTrip = Object.entries(tripRevenueMap).map(([tripName, amount]) => ({ tripName, amount }));
    const salespersonCollection = Object.entries(salesPerformanceMap).map(([salespersonName, amount]) => ({ salespersonName, amount }));
    const monthlyRevenue = Object.entries(monthlyTrendMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return res.json({
      success: true,
      data: {
        pendingTotal,
        revenuePerTrip,
        salespersonCollection,
        monthlyRevenue
      }
    });
  } catch (err) {
    console.error('getReports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch accounting reports' });
  }
};
