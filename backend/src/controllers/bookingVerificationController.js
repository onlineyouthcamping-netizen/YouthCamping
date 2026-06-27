const { prisma } = require('../lib/prisma');

// ────────────────────────────────────────────
// BOOKING VERIFICATION CONTROLLER
// ────────────────────────────────────────────

/**
 * GET /api/booking-verifications/:bookingId/status
 * Get verification and train ticket status for a booking.
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { bookingId, tenantId: req.user.tenantId },
      select: {
        bookingId: true,
        trainTicketRequired: true,
        trainTicketStatus: true,
        verification: {
          include: {
            verifiedBy: { select: { id: true, name: true } },
            logs: {
              orderBy: { createdAt: 'desc' },
              include: { admin: { select: { id: true, name: true } } }
            }
          }
        },
        trainTicket: {
          include: {
            travellers: true,
            logs: {
              orderBy: { createdAt: 'desc' },
              include: { admin: { select: { id: true, name: true } } }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        trainTicketRequired: booking.trainTicketRequired,
        trainTicketStatus: booking.trainTicketStatus,
        verification: booking.verification || null,
        trainTicket: booking.trainTicket || null
      }
    });
  } catch (err) {
    console.error('getVerificationStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch verification status' });
  }
};

/**
 * POST /api/booking-verifications/:bookingId/submit
 * Submit a booking for verification.
 */
exports.submitForVerification = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findFirst({
      where: { bookingId, tenantId: req.user.tenantId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the sales person who owns the booking, admin, or superadmin can submit
    if (role === 'sales' && booking.salesAdminId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only submit your own bookings for verification' });
    }
    if (!['sales', 'admin', 'superadmin', 'BOOKING_VERIFIER'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }

    // Create or update the verification record
    const verification = await prisma.bookingVerification.upsert({
      where: { bookingId: booking.bookingId },
      create: {
        tenantId: req.user.tenantId,
        bookingId: booking.bookingId,
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date()
      },
      update: {
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date()
      }
    });

    // Create verification log
    await prisma.bookingVerificationLog.create({
      data: {
        bookingVerificationId: verification.id,
        action: 'SUBMIT',
        notes: req.body.notes || null,
        adminId: userId
      }
    });

    // If train ticket is required, update ticket status
    const updates = {};
    if (booking.trainTicketRequired) {
      updates.trainTicketStatus = 'PENDING_VERIFICATION';

      // Also update the train ticket request status if it exists
      await prisma.trainTicketRequest.updateMany({
        where: { bookingId: booking.bookingId },
        data: { status: 'PENDING_VERIFICATION' }
      });
    }

    if (Object.keys(updates).length > 0) {
      await prisma.booking.update({
        where: { bookingId: booking.bookingId },
        data: updates
      });
    }

    return res.json({
      success: true,
      data: verification,
      message: 'Booking submitted for verification'
    });
  } catch (err) {
    console.error('submitForVerification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit for verification' });
  }
};

/**
 * GET /api/booking-verifications/queue
 * Get verification queue with pagination and status filter.
 */
exports.getVerificationQueue = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 25;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const where = { tenantId: req.user.tenantId };

    // Status filter
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Role-based filtering: sales sees only own bookings
    if (role === 'sales') {
      where.booking = { salesAdminId: userId };
    }

    const [verifications, total] = await Promise.all([
      prisma.bookingVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          booking: {
            select: {
              bookingId: true,
              name: true,
              fullName: true,
              phone: true,
              tripName: true,
              totalAmount: true,
              status: true,
              departureDate: true,
              trainTicketRequired: true,
              trainTicketStatus: true,
              salesAdminId: true,
              numberOfTravelers: true,
              paymentStatus: true,
              passengers: true,
              salesAdmin: { select: { id: true, name: true } }
            }
          },
          verifiedBy: { select: { id: true, name: true } },
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { admin: { select: { id: true, name: true } } }
          }
        }
      }),
      prisma.bookingVerification.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        verifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('getVerificationQueue error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch verification queue' });
  }
};

/**
 * POST /api/booking-verifications/:bookingId/action
 * Perform a verification action (VERIFY, REQUEST_CHANGES, REJECT).
 */
exports.performVerificationAction = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, notes, checklist } = req.body;
    const userId = req.user.id;

    if (!action || !['VERIFY', 'REQUEST_CHANGES', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be VERIFY, REQUEST_CHANGES, or REJECT' });
    }

    const verification = await prisma.bookingVerification.findFirst({
      where: {
        bookingId,
        tenantId: req.user.tenantId
      }
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found for this booking' });
    }

    // Map action to verification status
    const statusMap = {
      'VERIFY': 'VERIFIED',
      'REQUEST_CHANGES': 'CHANGES_REQUESTED',
      'REJECT': 'REJECTED'
    };

    const updateData = {
      status: statusMap[action],
      notes: notes || verification.notes
    };

    if (checklist) {
      updateData.checklist = checklist;
    }

    if (action === 'VERIFY') {
      updateData.verifiedAt = new Date();
      updateData.verifiedByAdminId = userId;
    }

    const updated = await prisma.bookingVerification.update({
      where: { id: verification.id },
      data: updateData
    });

    // Create verification log
    await prisma.bookingVerificationLog.create({
      data: {
        bookingVerificationId: verification.id,
        action,
        notes: notes || null,
        adminId: userId
      }
    });

    return res.json({
      success: true,
      data: updated,
      message: `Verification action '${action}' performed successfully`
    });
  } catch (err) {
    console.error('performVerificationAction error:', err);
    return res.status(500).json({ success: false, message: 'Failed to perform verification action' });
  }
};

/**
 * POST /api/booking-verifications/:bookingId/train-ticket
 * Save or update a train ticket draft for a booking.
 */
exports.saveTrainTicketDraft = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      journeyDate, fromStation, toStation,
      preferredTrain, preferredClass, seatPreference,
      estimatedAmount, specialNotes, travellers
    } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { bookingId, tenantId: req.user.tenantId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Upsert the train ticket request
    const ticketData = {
      journeyDate: journeyDate ? new Date(journeyDate) : null,
      fromStation: fromStation || null,
      toStation: toStation || null,
      preferredTrain: preferredTrain || null,
      preferredClass: preferredClass || null,
      seatPreference: seatPreference || null,
      estimatedAmount: estimatedAmount ? parseFloat(estimatedAmount) : 0,
      specialNotes: specialNotes || null
    };

    const ticket = await prisma.trainTicketRequest.upsert({
      where: { bookingId: booking.bookingId },
      create: {
        tenantId: req.user.tenantId,
        bookingId: booking.bookingId,
        status: 'DRAFT',
        ...ticketData
      },
      update: {
        ...ticketData
      }
    });

    // Delete existing travellers and recreate
    await prisma.trainTicketTraveller.deleteMany({
      where: { trainTicketRequestId: ticket.id }
    });

    if (travellers && Array.isArray(travellers) && travellers.length > 0) {
      await prisma.trainTicketTraveller.createMany({
        data: travellers.map(t => ({
          trainTicketRequestId: ticket.id,
          name: t.name,
          age: t.age ? parseInt(t.age, 10) : null,
          gender: t.gender || null,
          phone: t.phone || null
        }))
      });
    }

    // Create ticket log
    await prisma.trainTicketLog.create({
      data: {
        trainTicketRequestId: ticket.id,
        action: 'SAVE_DRAFT',
        notes: specialNotes || null,
        adminId: req.user.id
      }
    });

    // Update booking flags
    await prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data: {
        trainTicketRequired: true,
        trainTicketStatus: 'DRAFT'
      }
    });

    // Fetch complete ticket with travellers
    const fullTicket = await prisma.trainTicketRequest.findUnique({
      where: { id: ticket.id },
      include: { travellers: true }
    });

    return res.json({
      success: true,
      data: fullTicket,
      message: 'Train ticket draft saved'
    });
  } catch (err) {
    console.error('saveTrainTicketDraft error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save train ticket draft' });
  }
};

/**
 * GET /api/booking-verifications/:bookingId/train-ticket
 * Get the train ticket request with travellers for a booking.
 */
exports.getTrainTicketDraft = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const ticket = await prisma.trainTicketRequest.findFirst({
      where: {
        bookingId,
        booking: { tenantId: req.user.tenantId }
      },
      include: {
        travellers: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          include: { admin: { select: { id: true, name: true } } }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Train ticket request not found' });
    }

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('getTrainTicketDraft error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch train ticket draft' });
  }
};

/**
 * POST /api/booking-verifications/:bookingId/train-ticket/action
 * Perform a ticket action (APPROVE, REJECT, REQUEST_CHANGES, MARK_ISSUED).
 */
exports.performTicketAction = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, notes, pnr, ticketDetails } = req.body;
    const userId = req.user.id;

    if (!action || !['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'MARK_ISSUED'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be APPROVE, REJECT, REQUEST_CHANGES, or MARK_ISSUED' });
    }

    const ticket = await prisma.trainTicketRequest.findFirst({
      where: {
        bookingId,
        booking: { tenantId: req.user.tenantId }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Train ticket request not found' });
    }

    // Map action to ticket status
    const statusMap = {
      'APPROVE': 'APPROVED',
      'REJECT': 'REJECTED',
      'REQUEST_CHANGES': 'CHANGES_REQUESTED',
      'MARK_ISSUED': 'ISSUED'
    };

    const updateData = { status: statusMap[action] };
    if (pnr) updateData.pnr = pnr;
    if (ticketDetails) updateData.ticketDetails = ticketDetails;

    const updated = await prisma.trainTicketRequest.update({
      where: { id: ticket.id },
      data: updateData
    });

    // Create ticket log
    await prisma.trainTicketLog.create({
      data: {
        trainTicketRequestId: ticket.id,
        action,
        notes: notes || null,
        adminId: userId
      }
    });

    // Update booking's trainTicketStatus
    await prisma.booking.update({
      where: { bookingId },
      data: { trainTicketStatus: statusMap[action] }
    });

    return res.json({
      success: true,
      data: updated,
      message: `Ticket action '${action}' performed successfully`
    });
  } catch (err) {
    console.error('performTicketAction error:', err);
    return res.status(500).json({ success: false, message: 'Failed to perform ticket action' });
  }
};
