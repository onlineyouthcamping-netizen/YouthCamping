const { prisma } = require('../lib/prisma');
const { syncBookingToSheets } = require('../utils/googleSheetsSync');
const crypto = require('crypto');

// Helper to safely parse dates and avoid crashes with "Invalid Date"
const safeParseDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

const sha256 = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const getIpHash = (req) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
  return ip ? sha256(ip) : null;
};

// ────────────────────────────────────────────
// BOOKING MANAGEMENT
// ────────────────────────────────────────────

exports.getBookings = async (req, res, next) => {
  try {
    const { status, tripId, paymentStatus, search, salesAdminId } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (status) where.status = status;
    if (tripId) where.tripId = tripId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    // Role-based constraint: sales can only see bookings sourced from their own salesAdminId.
    if (req.user?.role === 'sales') {
      where.salesAdminId = req.user.id;
    } else if (salesAdminId) {
      where.salesAdminId = salesAdminId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { bookingId: { contains: search, mode: 'insensitive' } }
      ];
    }
    const bookings = await prisma.booking.findMany({ 
      where, 
      include: { 
        tripRef: true,
        sourceBookingLink: {
          select: {
            id: true,
            tokenPrefix: true,
            expiresAt: true,
            status: true,
            shareUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' } 
    });
    const mappedBookings = bookings.map(b => {
      let extra = {};
      let persons = [];
      if (b.passengers && typeof b.passengers === 'object') {
        extra = b.passengers.details || {};
        persons = b.passengers.persons || [];
      }
      return { ...b, ...extra, passengers: persons, trip: b.tripRef };
    });
    res.status(200).json({ success: true, count: mappedBookings.length, data: mappedBookings });
  } catch (error) { next(error); }
};

// Alias for bookingRoutes.js
exports.getAllBookings = exports.getBookings;

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const where = { id, tenantId };
    if (req.user?.role === 'sales') {
      where.salesAdminId = req.user.id;
    }

    const booking = await prisma.booking.findFirst({
      where,
      include: { 
        tripRef: true,
        sourceBookingLink: {
          select: {
            id: true,
            tokenPrefix: true,
            expiresAt: true,
            status: true,
            shareUrl: true,
          },
        },
      }
    });

    if (!booking) {
      console.warn(`⚠️ [getBookingById] Booking ${id} not found for tenant ${tenantId}`);
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    let extra = {};
    let persons = [];
    if (booking.passengers && typeof booking.passengers === 'object') {
      extra = booking.passengers.details || {};
      persons = booking.passengers.persons || [];
    }
    const mappedBooking = { ...booking, ...extra, passengers: persons, trip: booking.tripRef };
    
    res.json({ success: true, data: mappedBooking });
  } catch (error) { 
    console.error(`🔥 [getBookingById Error] ID: ${req.params.id}:`, error);
    next(error); 
  }
};

// PUBLIC: Lookup booking by user-facing bookingId (e.g. BK-087017) — for confirmation page
exports.getBookingPublic = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { bookingId: String(bookingId) },
      select: {
        id: true,
        bookingId: true,
        tripName: true,
        tripId: true,
        status: true,
        name: true,
        phone: true,
        email: true,
        totalAmount: true,
        advancePaid: true,
        remainingAmount: true,
        paymentMode: true,
        paymentStatus: true,
        payment_status: true,
        departureDate: true,
        pickupCity: true,
        passengers: true,
        gstAmount: true,
        baseAmount: true,
        gender: true,
        age: true,
        createdAt: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let persons = [];
    if (booking.passengers && typeof booking.passengers === 'object') {
      persons = Array.isArray(booking.passengers) ? booking.passengers : (booking.passengers.persons || []);
    }

    res.json({ success: true, data: { ...booking, passengers: persons } });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { 
      name, fullName, phone, mobile, tripId: inputTripId, amount, totalAmount, advancePaid,
      status, paymentStatus, paymentMode, notes, email, departureDate,
      pickupCity, skipDays, adjustedPrice, joiningDate,
      sourceBookingLinkId, sourceBookingLinkToken
    } = req.body;
    const bookingId = req.body.bookingId || `BK-${Date.now().toString().slice(-6)}`;
    const targetName = name || fullName;
    const targetPhone = phone || mobile;
    const amountValue = Number(amount || 0);
    const totalAmountValue = Number(totalAmount || amountValue || 0);
    const advanceValue = Number(advancePaid || 0) || 0;

    const tenantId = req.user?.tenantId || 'default';
    
    if (!targetName || !targetPhone || !inputTripId) {
      return res.status(400).json({ success: false, message: 'Required fields missing: Name, Phone, and Trip are mandatory' });
    }

    let tripId = inputTripId;
    let targetTrip = await prisma.trip.findFirst({
      where: { id: tripId, tenantId }
    });

    if (!targetTrip) {
      // Fallback: Resolve by slug or title
      targetTrip = await prisma.trip.findFirst({
        where: {
          OR: [
            { slug: inputTripId },
            { title: inputTripId },
            ...(req.body.tripName ? [{ title: req.body.tripName }, { slug: req.body.tripName }] : [])
          ],
          tenantId
        }
      });
      if (targetTrip) {
        tripId = targetTrip.id;
      } else {
        return res.status(400).json({ success: false, message: 'Selected Trip is invalid or no longer exists in the system' });
      }
    }

    // Optional link attribution + expiry enforcement
    let sourceLink = null;
    if (sourceBookingLinkId || sourceBookingLinkToken) {
      if (sourceBookingLinkToken) {
        const tokenHash = sha256(String(sourceBookingLinkToken));
        sourceLink = await prisma.bookingLink.findFirst({
          where: { tokenHash, tenantId },
        });
      } else {
        sourceLink = await prisma.bookingLink.findFirst({
          where: { id: sourceBookingLinkId, tenantId },
        });
      }

      if (!sourceLink) {
        return res.status(410).json({ success: false, message: 'Booking link is invalid or no longer available' });
      }

      const now = Date.now();
      if (sourceLink.status !== 'active' || (sourceLink.expiresAt && sourceLink.expiresAt.getTime() < now)) {
        await prisma.bookingLink.update({
          where: { id: sourceLink.id },
          data: { status: 'expired' },
        });
        return res.status(410).json({ success: false, message: 'Booking link has expired' });
      }

      // Basic integrity check (link trip should match the booking trip)
      if (String(sourceLink.tripId) !== String(tripId)) {
        return res.status(400).json({ success: false, message: 'Trip mismatch for this booking link' });
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          tenantId, bookingId,
          name: targetName, fullName: targetName,
          phone: targetPhone, mobile: targetPhone,
          tripId,
          tripName: targetTrip ? targetTrip.title : 'Manual Booking',
          amount: amountValue,
          totalAmount: totalAmountValue,
          advancePaid: advanceValue,
          remainingAmount: totalAmountValue - advanceValue,
          status: status || 'pending',
          paymentStatus: paymentStatus || 'Pending',
          paymentMode: paymentMode || 'UPI',
          notes: notes || '',
          email,
          departureDate: departureDate ? new Date(departureDate) : null,
          pickupCity: pickupCity || null,
          skipDays: skipDays !== undefined ? parseInt(skipDays) : 0,
          adjustedPrice: adjustedPrice !== undefined ? parseFloat(adjustedPrice) : null,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
          age: req.body.age ? parseInt(req.body.age) : null,
          gender: req.body.gender || null,
          numberOfTravelers: req.body.passengers?.length || 1,
          baseAmount: amountValue,
          gstAmount: req.body.gstAmount ? parseFloat(req.body.gstAmount) : null,
          passengers: {
            details: {
              trainClass: req.body.trainClass,
              ticketStatus: req.body.ticketStatus,
              roomType: req.body.roomType,
              basePrice: req.body.basePrice,
              gstAmount: req.body.gstAmount,
            },
            persons: req.body.passengers || [],
          },
          sourceBookingLinkId: sourceLink ? sourceLink.id : null,
          salesAdminId: sourceLink ? sourceLink.createdByAdminId : null,
          sourceMeta: sourceLink
            ? {
                tripId: sourceLink.tripId,
                tripName: sourceLink.tripName,
                departureDate: sourceLink.departureDate,
                pickupCity: sourceLink.pickupCity,
                paymentMode: sourceLink.paymentMode,
                customAmount: sourceLink.customAmount,
                expiresAt: sourceLink.expiresAt,
              }
            : null,
        },
      });

      if (sourceLink) {
        await tx.bookingLink.update({
          where: { id: sourceLink.id },
          data: {
            completedCount: { increment: 1 },
            lastCompletedAt: new Date(),
          },
        });

        await tx.bookingLinkEvent.create({
          data: {
            tenantId,
            bookingLinkId: sourceLink.id,
            type: 'booking_created',
            ipHash: getIpHash(req),
            userAgent: req.headers['user-agent']?.toString(),
          },
        });
      }

      return created;
    });

    // Sync to Google Sheets
    syncBookingToSheets(booking).catch(err => console.error('[SHEETS_SYNC_SILENT_ERR]', err.message));

    res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });
  } catch (error) { next(error); }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const { email, ...updateData } = req.body;
    delete updateData.id; delete updateData.tenantId;
    
    // Add email back to updateData if it exists
    if (email !== undefined) updateData.email = email;
    
    // Explicitly handle passengers json mapping if custom fields are present
    const existingBooking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    let currentPassengers = existingBooking?.passengers || { details: {}, persons: [] };
    if (!currentPassengers.details) currentPassengers = { details: currentPassengers, persons: [] };

    updateData.passengers = {
      details: {
        ...currentPassengers.details,
        trainClass: updateData.trainClass !== undefined ? updateData.trainClass : currentPassengers.details.trainClass,
        ticketStatus: updateData.ticketStatus !== undefined ? updateData.ticketStatus : currentPassengers.details.ticketStatus,
        roomType: updateData.roomType !== undefined ? updateData.roomType : currentPassengers.details.roomType,
        basePrice: updateData.basePrice !== undefined ? updateData.basePrice : currentPassengers.details.basePrice,
        gstAmount: updateData.gstAmount !== undefined ? updateData.gstAmount : currentPassengers.details.gstAmount,
      },
      persons: updateData.passengers !== undefined ? updateData.passengers : currentPassengers.persons
    };

    delete updateData.trainClass;
    delete updateData.ticketStatus;
    delete updateData.roomType;
    if (updateData.basePrice !== undefined) {
      updateData.baseAmount = updateData.basePrice !== null ? parseFloat(updateData.basePrice) : null;
      delete updateData.basePrice;
    }
    if (updateData.gstAmount !== undefined) {
      updateData.gstAmount = updateData.gstAmount !== null ? parseFloat(updateData.gstAmount) : null;
    }
    if (req.body.passengers && Array.isArray(req.body.passengers)) {
      updateData.numberOfTravelers = req.body.passengers.length;
    }

    if (updateData.advancePaid !== undefined) updateData.advancePaid = Number(updateData.advancePaid) || 0;
    if (updateData.totalAmount !== undefined) updateData.totalAmount = Number(updateData.totalAmount) || 0;
    if (updateData.amount !== undefined) updateData.amount = Number(updateData.amount) || 0;
    if (updateData.remainingAmount !== undefined) updateData.remainingAmount = Number(updateData.remainingAmount) || 0;
    if (updateData.age !== undefined && updateData.age !== null) updateData.age = parseInt(updateData.age) || null;
    if (updateData.departureDate !== undefined && updateData.departureDate !== null) {
      updateData.departureDate = new Date(updateData.departureDate);
    }
    if (updateData.skipDays !== undefined) updateData.skipDays = parseInt(updateData.skipDays) || 0;
    if (updateData.adjustedPrice !== undefined) updateData.adjustedPrice = parseFloat(updateData.adjustedPrice) || null;
    if (updateData.joiningDate !== undefined && updateData.joiningDate !== null && updateData.joiningDate !== "") {
      updateData.joiningDate = new Date(updateData.joiningDate);
    } else if (updateData.joiningDate === "") {
      updateData.joiningDate = null;
    }

    // Handle tripId change to sync tripName
    if (updateData.tripId) {
      const targetTrip = await prisma.trip.findFirst({
        where: { id: updateData.tripId, tenantId: req.user.tenantId }
      });
      if (targetTrip) {
        updateData.tripName = targetTrip.title;
      }
    }

    const role = req.user?.role;
    const where = { id: req.params.id, tenantId: req.user.tenantId };
    if (role === 'sales') {
      where.salesAdminId = req.user.id;
    }

    const booking = await prisma.booking.updateMany({ where, data: updateData });
    if (booking.count === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking updated' });
  } catch (error) { next(error); }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const role = req.user?.role;
    const where = { id, tenantId };
    if (role === 'sales') {
      where.salesAdminId = req.user.id;
    }

    const booking = await prisma.booking.findFirst({
      where,
      select: { id: true },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Spec: "reject" should move to Cancelled state (not hard-delete),
    // so the booking lifecycle remains auditable.
    await prisma.booking.updateMany({
      where,
      data: {
        status: 'cancelled',
        paymentStatus: 'Cancelled',
      },
    });

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) { 
    console.error('🔥 [deleteBooking Error]:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking', 
      error: error.message,
      stack: error.stack
    });
  }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const { totalAmount, advancePaid, paymentMode, paymentStatus, email } = req.body;
    const targetAdvance = Number(advancePaid) || 0;

    const role = req.user?.role;
    const where = { id: req.params.id, tenantId: req.user.tenantId };
    if (role === 'sales') {
      where.salesAdminId = req.user.id;
    }

    const booking = await prisma.booking.updateMany({
      where,
      data: {
        status: 'confirmed', 
        totalAmount: Number(totalAmount),
        advancePaid: targetAdvance,
        remainingAmount: Number(totalAmount) - targetAdvance,
        paymentMode, 
        paymentStatus,
        email: email || undefined
      }
    });
    if (booking.count === 0) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (targetAdvance > 0) {
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId: req.params.id, tenantId: req.user.tenantId }
      });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            bookingId: req.params.id,
            amount: targetAdvance,
            paymentMode: paymentMode || 'UPI',
            tenantId: req.user.tenantId,
            status: 'success',
            notes: 'Advance booking payment'
          }
        });
      }
    }

    // Sync to Google Sheets
    const updatedBooking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (updatedBooking) {
      syncBookingToSheets(updatedBooking).catch(err => console.error('[SHEETS_SYNC_SILENT_ERR]', err.message));
    }

    res.json({ success: true, message: 'Booking confirmed' });
  } catch (error) { next(error); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { email: req.user?.email || 'notset', tenantId: req.user?.tenantId || 'default' },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { next(error); }
};

exports.searchByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
    
    const bookings = await prisma.booking.findMany({
      where: { 
        OR: [
          { phone: { contains: phone } },
          { mobile: { contains: phone } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapped for frontend display
    const mapped = bookings.map(b => {
      let extra = {};
      if (b.passengers && typeof b.passengers === 'object') {
        extra = b.passengers.details || {};
      }
      // Ensure departureDate is synced
      const finalDate = b.departureDate || safeParseDate(extra.travelDate);
      return { ...b, ...extra, departureDate: finalDate };
    });

    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) { next(error); }
};

// ────────────────────────────────────────────
// TRIP DROPDOWN (for booking forms)
// ────────────────────────────────────────────

exports.getTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { tenantId: req.user.tenantId },
      select: { id: true, title: true, price: true }
    });
    res.status(200).json({
      success: true,
      data: trips.map(t => ({ id: t.id, tripCode: t.id, title: t.title, tripName: t.title, price: t.price }))
    });
  } catch (error) { next(error); }
};

// Aliases for bookingRoutes.js
exports.getAllTrips = exports.getTrips;

exports.createTrip = async (req, res, next) => {
  try {
    const tripCode = req.body.tripCode || req.body.id || `TRIP-${Date.now()}`;
    const tripName = req.body.tripName || req.body.title || 'Untitled Trip';

    const trip = await prisma.trip.create({
      data: { 
        id: tripCode,
        title: tripName,
        slug: tripCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        location: req.body.location || 'TBD',
        duration: req.body.duration || 'TBD',
        description: req.body.description || 'TBD',
        tenantId: req.user.tenantId, 
        price: Number(req.body.price) || 0 
      }
    });
    res.status(201).json({ 
      success: true, 
      data: { ...trip, tripCode: trip.id, tripName: trip.title } 
    });
  } catch (error) { next(error); }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const { id: oldId } = req.params;
    const { tripCode, tripName, ...otherData } = req.body;
    const tenantId = req.user.tenantId;

    // Map tripName to title if provided
    const updateData = { ...otherData };
    if (tripName) updateData.title = tripName;
    
    // Remove unwanted fields
    delete updateData.id;
    delete updateData.tenantId;

    const newId = tripCode ? tripCode.toUpperCase() : null;

    if (newId && newId !== oldId) {
      console.log(`🔄 [updateTrip] Migrating Trip ID from ${oldId} to ${newId}`);
      
      // 2. Perform Migration Transaction
      await prisma.$transaction(async (tx) => {
        const oldTrip = await tx.trip.findFirst({ where: { id: oldId, tenantId } });
        if (!oldTrip) throw new Error('Original trip not found');

        // Rename old slug temporarily to avoid unique constraint error
        await tx.trip.update({
          where: { id: oldId },
          data: { slug: `${oldTrip.slug}-old-${Date.now()}` }
        });

        // Create new record
        const newTripData = {
          ...oldTrip,
          ...updateData,
          id: newId,
          tenantId
        };
        // Ensure we don't accidentally spread relations or nested objects if they exist
        delete newTripData.bookings;
        delete newTripData.assignments;

        await tx.trip.create({ data: newTripData });

        // 3. Update related records
        // Bookings
        await tx.booking.updateMany({
          where: { tripId: oldId, tenantId },
          data: { 
            tripId: newId,
            tripName: tripName || oldTrip.title
          }
        });

        // Inquiries
        await tx.inquiry.updateMany({
          where: { tripId: oldId, tenantId },
          data: { 
            tripId: newId,
            tripTitle: tripName || oldTrip.title
          }
        });

        // Reviews
        await tx.review.updateMany({
          where: { tripId: oldId, tenantId },
          data: { tripId: newId }
        });

        // Trip Vendors
        await tx.tripVendor.updateMany({
          where: { tripId: oldId, tenantId },
          data: { tripId: newId }
        });

        // 4. Delete old record
        await tx.trip.delete({ where: { id: oldId } });
      });

      return res.json({ success: true, message: 'Trip Code and details updated successfully' });
    } else {
      // Regular update for other fields
      const trip = await prisma.trip.updateMany({
        where: { id: oldId, tenantId },
        data: updateData
      });
      
      // Also sync tripName in bookings if title was updated
      if (tripName) {
        await prisma.booking.updateMany({
          where: { tripId: oldId, tenantId },
          data: { tripName }
        });
        await prisma.inquiry.updateMany({
          where: { tripId: oldId, tenantId },
          data: { tripTitle: tripName }
        });
      }
      
      if (trip.count === 0) return res.status(404).json({ success: false, message: 'Trip not found' });
      res.json({ success: true, message: 'Trip updated successfully' });
    }
  } catch (error) { 
    console.error('🔥 [updateTrip] Error:', error);
    next(error); 
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const result = await prisma.trip.deleteMany({
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });
    if (result.count === 0) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) { next(error); }
};

// ────────────────────────────────────────────
// PUBLIC BOOKING FORM SUBMISSION
// ────────────────────────────────────────────

exports.submitBookingForm = async (req, res, next) => {
  try {
    const tripCode = req.params.tripCode;
    const bookingId = `BK-${Date.now().toString().slice(-6)}`;
    
    // Fallback amount parsing
    const parsedAmount = Number(req.body.amount || req.body.totalAmount || 0);
    
    // Explicitly construct the payload to match the schema
    const booking = await prisma.booking.create({
      data: {
        bookingId,
        tenantId: req.user?.tenantId || 'default',
        tripId: tripCode, // Set from URL param
        tripName: req.body.tripName || null,
        name: req.body.fullName || req.body.name || 'Unknown',
        fullName: req.body.fullName || req.body.name,
        phone: req.body.mobile || req.body.phone || '0000000000',
        mobile: req.body.mobile || req.body.phone,
        email: req.body.email || null,
        departureDate: safeParseDate(req.body.departureDate || req.body.travelDate),
        pickupCity: req.body.pickupCity || null,
        skipDays: req.body.skipDays !== undefined ? parseInt(req.body.skipDays) : 0,
        adjustedPrice: req.body.adjustedPrice !== undefined ? parseFloat(req.body.adjustedPrice) : null,
        joiningDate: req.body.joiningDate ? new Date(req.body.joiningDate) : null,
        age: req.body.age ? parseInt(req.body.age) : null,
        gender: req.body.gender || null,
        numberOfTravelers: req.body.passengers?.length || 1,
        baseAmount: parsedAmount,
        gstAmount: req.body.gstAmount ? parseFloat(req.body.gstAmount) : null,
        amount: parsedAmount,
        totalAmount: parsedAmount,
        advancePaid: Number(req.body.advancePaid) || 0,
        remainingAmount: parsedAmount - (Number(req.body.advancePaid) || 0),
        status: req.body.status || 'pending',
        paymentStatus: req.body.paymentStatus || 'Pending',
        paymentMode: req.body.paymentMode || null,
        notes: req.body.notes || null,
        passengers: {
          details: {
            trainClass: req.body.trainClass,
            ticketStatus: req.body.ticketStatus,
            roomType: req.body.roomType
          },
          persons: req.body.passengers || []
        }
      }
    });
    // Sync to Google Sheets
    syncBookingToSheets(booking).catch(err => console.error('[SHEETS_SYNC_SILENT_ERR]', err.message));

    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

exports.getTripInfo = async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { OR: [{ id: req.params.tripCode }, { slug: req.params.tripCode }] }
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (error) { next(error); }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId || 'default';

    const booking = await prisma.booking.findFirst({
      where: { id, tenantId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        payment_status: 'confirmed',
        paymentStatus: 'Paid'
      }
    });

    // Sync to Google Sheets
    syncBookingToSheets(updatedBooking).catch(err => console.error('[SHEETS_SYNC_SILENT_ERR]', err.message));

    // Simulated WhatsApp trigger
    console.log(`📲 [WHATSAPP PAYMENT CONFIRMATION] Sending WhatsApp notification to customer ${booking.name} (${booking.phone}): "Your payment of ₹${booking.advancePaid || booking.totalAmount} has been confirmed! Your booking ${booking.bookingId} is now active."`);

    res.json({ success: true, message: 'Payment confirmed and WhatsApp triggered', data: updatedBooking });
  } catch (error) { next(error); }
};

exports.updateBookingUpi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { upi_reference } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingId: id }] }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        upi_reference,
        payment_status: 'pending',
        payment_method: 'upi'
      }
    });

    // Sync to Google Sheets
    syncBookingToSheets(updatedBooking).catch(err => console.error('[SHEETS_SYNC_SILENT_ERR]', err.message));

    res.json({ success: true, message: 'UPI reference saved successfully', data: updatedBooking });
  } catch (error) { next(error); }
};
