const { prisma } = require('../lib/prisma');
const { runAutoAllocation } = require('../utils/autoAllocationEngine');

/**
 * Shared server-side India timezone (Asia/Kolkata) normalization method for departure calendar dates.
 * Converts input timestamps or dates (e.g. 2026-07-09T18:30:00.000Z, 2026-07-10T00:00:00.000Z, 2026-07-10T05:30:00.000Z)
 * to one exact normalized India calendar Date (YYYY-MM-DDT00:00:00.000Z).
 */
function normalizeDepartureDateIndia(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const indiaDateStr = formatter.format(d); // e.g. "2026-07-10"
  return new Date(`${indiaDateStr}T00:00:00.000Z`);
}

// Helper to construct departure filter
function parseDepartureFilter(req, res, requireDepartureDate = true) {
  const { tripId } = req.params;
  const rawDate = req.query.departureDate || req.body.departureDate;

  if (requireDepartureDate && !rawDate) {
    res.status(400).json({ success: false, message: 'departureDate is required for departure operations' });
    return null;
  }

  const departureDate = normalizeDepartureDateIndia(rawDate);
  if (requireDepartureDate && !departureDate) {
    res.status(400).json({ success: false, message: 'Invalid departureDate format' });
    return null;
  }

  const tenantId = req.user.tenantId || 'default';
  const where = { tenantId, tripId };
  if (departureDate) where.departureDate = departureDate;

  return { tenantId, tripId, departureDate, where };
}

// ── VENDORS DIRECTORY ──
exports.getVendors = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { tenantId: req.user.tenantId || 'default' };
    if (type) where.type = type;

    const vendors = await prisma.opsVendor.findMany({ where, orderBy: { name: 'asc' } });
    return res.json({ success: true, data: vendors });
  } catch (err) {
    console.error('getVendors error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, type, contactPerson, email, phone, location, rating, notes } = req.body;
    const vendor = await prisma.opsVendor.create({
      data: {
        tenantId: req.user.tenantId || 'default',
        name,
        type,
        contactPerson,
        email,
        phone,
        location,
        rating: rating ? parseFloat(rating) : 5.0,
        notes
      }
    });
    return res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    console.error('createVendor error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create vendor' });
  }
};

// ── DAY ITINERARY GRID ──
exports.getDayItinerary = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const items = await prisma.opsDayItinerary.findMany({ where: ctx.where, orderBy: { date: 'asc' } });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getDayItinerary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch day itinerary' });
  }
};

exports.upsertDayItinerary = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { id, date, dayTitle, paxCount, hotelName, hotelVerified, vehicleType, vehicleVerified, remarks, guideDriverDetails, guideVerified, checkInDone } = req.body;

    let result;
    if (id) {
      result = await prisma.opsDayItinerary.update({
        where: { id },
        data: { date: date ? new Date(date) : null, dayTitle, paxCount, hotelName, hotelVerified, vehicleType, vehicleVerified, remarks, guideDriverDetails, guideVerified, checkInDone }
      });
    } else {
      result = await prisma.opsDayItinerary.create({
        data: {
          tenantId: ctx.tenantId,
          tripId: ctx.tripId,
          departureDate: ctx.departureDate,
          date: date ? new Date(date) : null,
          dayTitle,
          paxCount: paxCount || 0,
          hotelName,
          hotelVerified: !!hotelVerified,
          vehicleType,
          vehicleVerified: !!vehicleVerified,
          remarks,
          guideDriverDetails,
          guideVerified: !!guideVerified,
          checkInDone: !!checkInDone
        }
      });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('upsertDayItinerary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save day itinerary row' });
  }
};

// ── TRIP EXPENSE GRID ──
exports.getTripExpenses = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const expenses = await prisma.opsTripExpense.findMany({ where: ctx.where, orderBy: { serviceDate: 'asc' } });
    return res.json({ success: true, data: expenses });
  } catch (err) {
    console.error('getTripExpenses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch trip expenses' });
  }
};

exports.upsertTripExpense = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { id, serviceDate, activity, paymentDate, totalAmount, amountPaid, remarks } = req.body;

    const tot = parseFloat(totalAmount || 0);
    const paid = parseFloat(amountPaid || 0);
    const due = tot - paid;
    const paymentStatus = due <= 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Due';

    let result;
    if (id) {
      result = await prisma.opsTripExpense.update({
        where: { id },
        data: { serviceDate: serviceDate ? new Date(serviceDate) : null, activity, paymentDate: paymentDate ? new Date(paymentDate) : null, totalAmount: tot, amountPaid: paid, dueAmount: due, paymentStatus, remarks }
      });
    } else {
      result = await prisma.opsTripExpense.create({
        data: {
          tenantId: ctx.tenantId,
          tripId: ctx.tripId,
          departureDate: ctx.departureDate,
          serviceDate: serviceDate ? new Date(serviceDate) : null,
          activity,
          paymentDate: paymentDate ? new Date(paymentDate) : null,
          totalAmount: tot,
          amountPaid: paid,
          dueAmount: due,
          paymentStatus,
          remarks
        }
      });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('upsertTripExpense error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save trip expense row' });
  }
};

exports.deleteDayItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.opsDayItinerary.delete({ where: { id } });
    return res.json({ success: true, message: 'Itinerary row deleted' });
  } catch (err) {
    console.error('deleteDayItinerary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete itinerary row' });
  }
};

exports.deleteTripExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.opsTripExpense.delete({ where: { id } });
    return res.json({ success: true, message: 'Expense row deleted' });
  } catch (err) {
    console.error('deleteTripExpense error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete expense row' });
  }
};

// ── HOTEL BOOKINGS TRACKER ──
exports.getHotelBookings = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const bookings = await prisma.opsHotelBooking.findMany({ where: ctx.where, include: { vendor: true } });
    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('getHotelBookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch hotel bookings' });
  }
};

exports.createHotelBooking = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { hotelName, vendorId, location, checkIn, checkOut, roomType, numberOfRooms, confirmed, totalAmount, advancePaid, contactPerson, contactPhone, notes } = req.body;

    const tot = parseFloat(totalAmount || 0);
    const adv = parseFloat(advancePaid || 0);

    const booking = await prisma.opsHotelBooking.create({
      data: {
        tenantId: ctx.tenantId,
        tripId: ctx.tripId,
        departureDate: ctx.departureDate,
        vendorId: vendorId || null,
        hotelName,
        location,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        roomType,
        numberOfRooms: parseInt(numberOfRooms || 1),
        confirmed: confirmed || 'UNCONFIRMED',
        totalAmount: tot,
        advancePaid: adv,
        balanceAmount: tot - adv,
        contactPerson,
        contactPhone,
        notes
      }
    });
    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('createHotelBooking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create hotel booking' });
  }
};

// ── TRANSPORT FLEET TRACKER ──
exports.getTransportFleet = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const fleet = await prisma.opsTransportFleet.findMany({ where: ctx.where, include: { vendor: true } });
    return res.json({ success: true, data: fleet });
  } catch (err) {
    console.error('getTransportFleet error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch transport fleet' });
  }
};

exports.createTransportFleet = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { vehicleType, vendorId, capacity, route, pickupPoints, dropPoints, totalAmount, advancePaid, driverName, driverPhone, notes } = req.body;

    const tot = parseFloat(totalAmount || 0);
    const adv = parseFloat(advancePaid || 0);

    const vehicle = await prisma.opsTransportFleet.create({
      data: {
        tenantId: ctx.tenantId,
        tripId: ctx.tripId,
        departureDate: ctx.departureDate,
        vendorId: vendorId || null,
        vehicleType,
        capacity: parseInt(capacity || 13),
        route,
        pickupPoints,
        dropPoints,
        totalAmount: tot,
        advancePaid: adv,
        balanceAmount: tot - adv,
        driverName,
        driverPhone,
        notes
      }
    });
    return res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    console.error('createTransportFleet error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create transport fleet' });
  }
};

// ── GUIDE PAYMENTS TRACKER ──
exports.getGuidePayments = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const payments = await prisma.opsGuidePayment.findMany({
      where: ctx.where,
      include: { guideAdmin: { select: { id: true, name: true } }, vendor: true, approvedBy: { select: { id: true, name: true } } }
    });
    return res.json({ success: true, data: payments });
  } catch (err) {
    console.error('getGuidePayments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch guide payments' });
  }
};

exports.createGuidePayment = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { guideName, guideAdminId, vendorId, daysWorked, agreedAmount, advancePaid } = req.body;

    const agreed = parseFloat(agreedAmount || 0);
    const adv = parseFloat(advancePaid || 0);

    const payment = await prisma.opsGuidePayment.create({
      data: {
        tenantId: ctx.tenantId,
        tripId: ctx.tripId,
        departureDate: ctx.departureDate,
        guideAdminId: guideAdminId || null,
        vendorId: vendorId || null,
        guideName,
        daysWorked: parseInt(daysWorked || 1),
        agreedAmount: agreed,
        advancePaid: adv,
        balanceAmount: agreed - adv
      }
    });
    return res.status(201).json({ success: true, data: payment });
  } catch (err) {
    console.error('createGuidePayment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create guide payment' });
  }
};

// ── OPERATIONAL ACCOUNTING SUMMARY (DEPARTURE SCOPED) ──
exports.getOpsAccountingSummary = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;

    const bookingWhere = { tripId: ctx.tripId, departureDate: ctx.departureDate, status: { notIn: ['cancelled', 'rejected'] } };

    const [hotels, transport, guides, misc, expenses, bookings] = await Promise.all([
      prisma.opsHotelBooking.findMany({ where: ctx.where }),
      prisma.opsTransportFleet.findMany({ where: ctx.where }),
      prisma.opsGuidePayment.findMany({ where: ctx.where }),
      prisma.opsMiscExpense.findMany({ where: ctx.where }),
      prisma.opsTripExpense.findMany({ where: ctx.where }),
      prisma.booking.findMany({ where: bookingWhere })
    ]);

    const hotelCost = hotels.reduce((s, h) => s + h.totalAmount, 0);
    const transportCost = transport.reduce((s, t) => s + t.totalAmount, 0);
    const guideCost = guides.reduce((s, g) => s + g.agreedAmount, 0);
    const miscCost = misc.reduce((s, m) => s + m.amount, 0);
    const detailedExpensesCost = expenses.reduce((s, e) => s + e.totalAmount, 0);

    const totalOpsCost = hotelCost + transportCost + guideCost + miscCost + detailedExpensesCost;

    let travelerCount = bookings.reduce((s, b) => s + (b.numberOfTravelers || 1), 0);
    if (travelerCount === 0) travelerCount = 1;

    const perPersonOpsCost = totalOpsCost / travelerCount;

    // Fetch accounting entries and ticket requests for readiness summaries
    const bookingIds = bookings.map(b => b.bookingId);
    const [allAccounting, ticketRequests] = await Promise.all([
      prisma.accountingEntry.findMany({ where: { bookingId: { in: bookingIds } } }),
      prisma.trainTicketRequest.findMany({ where: { bookingId: { in: bookingIds } } })
    ]);

    const approvedAccounting = allAccounting.filter(a => a.status === 'APPROVED');
    const totalRevenueCollected = approvedAccounting.reduce((s, a) => s + a.amount, 0);
    const profitPerTrip = totalRevenueCollected - totalOpsCost;

    const ticketReadiness = {
      pending: ticketRequests.filter(t => t.status === 'PENDING_VERIFICATION' || t.status === 'DRAFT').length,
      approved: ticketRequests.filter(t => t.status === 'APPROVED').length,
      cancelled: ticketRequests.filter(t => t.status === 'CANCELLED').length
    };

    const pendingCollection = allAccounting.filter(a => a.status === 'PENDING').reduce((s, a) => s + a.amount, 0);
    const totalBookingAmount = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const remainingCollection = Math.max(0, totalBookingAmount - totalRevenueCollected);

    const accountingReadiness = {
      approvedCollected: totalRevenueCollected,
      pendingCollection,
      remainingCollection,
      totalBookingAmount
    };

    return res.json({
      success: true,
      data: {
        hotelCost,
        transportCost,
        guideCost,
        miscCost,
        detailedExpensesCost,
        totalOpsCost,
        travelerCount,
        perPersonOpsCost,
        totalRevenueCollected,
        profitPerTrip,
        ticketReadiness,
        accountingReadiness
      }
    });
  } catch (err) {
    console.error('getOpsAccountingSummary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate operational accounting' });
  }
};

// ── SEAT MANAGEMENT (DEPARTURE SCOPED) ──
exports.getSeatConfig = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;

    let config = await prisma.opsSeatConfig.findFirst({
      where: { tenantId: ctx.tenantId, tripId: ctx.tripId, departureDate: ctx.departureDate }
    });

    if (!config) {
      config = await prisma.opsSeatConfig.create({
        data: { tenantId: ctx.tenantId, tripId: ctx.tripId, departureDate: ctx.departureDate, totalSeatsCap: 30, alertThreshold: 25 }
      });
    }

    const bookingWhere = { tripId: ctx.tripId, departureDate: ctx.departureDate, status: { notIn: ['cancelled', 'rejected'] } };
    const bookings = await prisma.booking.findMany({ where: bookingWhere });
    const seatsSold = bookings.reduce((s, b) => s + (b.numberOfTravelers || 1), 0);
    const seatsAvailable = Math.max(0, config.totalSeatsCap - seatsSold - config.blockedSeats);
    const waitingList = seatsSold > config.totalSeatsCap ? seatsSold - config.totalSeatsCap : 0;

    return res.json({
      success: true,
      data: {
        ...config,
        seatsSold,
        seatsAvailable,
        waitingList
      }
    });
  } catch (err) {
    console.error('getSeatConfig error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch seat config' });
  }
};

// ── TRIP CHECKLIST & INCIDENTS ──
exports.getChecklist = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const items = await prisma.opsTripChecklist.findMany({ where: ctx.where, include: { completedBy: { select: { id: true, name: true } } } });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getChecklist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch checklist' });
  }
};

exports.toggleChecklistItem = async (req, res) => {
  try {
    const { id } = req.body;
    const item = await prisma.opsTripChecklist.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });

    const updated = await prisma.opsTripChecklist.update({
      where: { id },
      data: {
        isCompleted: !item.isCompleted,
        completedById: !item.isCompleted ? req.user.id : null,
        completedAt: !item.isCompleted ? new Date() : null
      }
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('toggleChecklistItem error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update checklist item' });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const incidents = await prisma.opsIncidentLog.findMany({
      where: ctx.where,
      include: { reportedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: incidents });
  } catch (err) {
    console.error('getIncidents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;
    const { title, severity, description, resolution } = req.body;
    const incident = await prisma.opsIncidentLog.create({
      data: {
        tenantId: ctx.tenantId,
        tripId: ctx.tripId,
        departureDate: ctx.departureDate,
        title,
        severity: severity || 'MEDIUM',
        description,
        resolution,
        reportedById: req.user.id
      }
    });
    return res.status(201).json({ success: true, data: incident });
  } catch (err) {
    console.error('createIncident error:', err);
    return res.status(500).json({ success: false, message: 'Failed to log incident' });
  }
};

// ── AUTO ALLOCATION RUNS (DEPARTURE SCOPED) ──
exports.generateAllocation = async (req, res) => {
  try {
    const ctx = parseDepartureFilter(req, res, true);
    if (!ctx) return;

    const bookingWhere = { tripId: ctx.tripId, departureDate: ctx.departureDate, status: { notIn: ['cancelled', 'rejected'] } };

    const [bookings, fleet] = await Promise.all([
      prisma.booking.findMany({ where: bookingWhere }),
      prisma.opsTransportFleet.findMany({ where: ctx.where })
    ]);

    const allocationResult = runAutoAllocation(bookings, fleet);

    const existingCount = await prisma.opsAllocationRun.count({ where: ctx.where });
    const version = existingCount + 1;

    const draftRun = await prisma.opsAllocationRun.create({
      data: {
        tenantId: ctx.tenantId,
        tripId: ctx.tripId,
        departureDate: ctx.departureDate,
        version,
        status: 'DRAFT',
        resultJson: allocationResult,
        actorId: req.user.id
      }
    });

    return res.json({ success: true, data: { allocationRunId: draftRun.id, version, status: 'DRAFT', ...allocationResult } });
  } catch (err) {
    console.error('generateAllocation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate allocation draft' });
  }
};

exports.confirmAllocation = async (req, res) => {
  try {
    const { allocationRunId } = req.body;
    const run = await prisma.opsAllocationRun.findUnique({ where: { id: allocationRunId } });

    if (!run) return res.status(404).json({ success: false, message: 'Allocation run draft not found' });
    if (run.status === 'CONFIRMED') return res.status(400).json({ success: false, message: 'Allocation run is already confirmed' });

    const resultJson = run.resultJson || {};
    const flags = resultJson.flags || [];
    const blockingFlags = flags.filter(f => f.includes('TRAVELER_GENDER_MISSING') || f.includes('Capacity overflow'));

    if (blockingFlags.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Cannot confirm allocation run with active blocking flags. Please resolve issues first.',
        blockingFlags
      });
    }

    const confirmedRun = await prisma.opsAllocationRun.update({
      where: { id: allocationRunId },
      data: { status: 'CONFIRMED', actorId: req.user.id }
    });

    return res.json({ success: true, message: 'Allocation run confirmed successfully', data: confirmedRun });
  } catch (err) {
    console.error('confirmAllocation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to confirm allocation run' });
  }
};

exports.overrideAllocation = async (req, res) => {
  try {
    const { allocationRunId, targetType, targetId, beforeValue, afterValue, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A valid reason is required for manual overrides' });
    }

    const override = await prisma.opsAllocationOverride.create({
      data: {
        tenantId: req.user.tenantId || 'default',
        allocationRunId,
        targetType: targetType || 'VEHICLE',
        targetId,
        beforeValue: beforeValue || null,
        afterValue,
        reason: reason.trim(),
        actorId: req.user.id
      }
    });

    return res.status(201).json({ success: true, message: 'Manual allocation override logged', data: override });
  } catch (err) {
    console.error('overrideAllocation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record manual allocation override' });
  }
};

module.exports = {
  normalizeDepartureDateIndia,
  ...exports
};
