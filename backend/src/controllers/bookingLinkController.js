const crypto = require('crypto');
const { prisma } = require('../lib/prisma');

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const generateToken = () => {
  // 256-bit token -> hex (64 chars)
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenPrefix: token.slice(0, 8) };
};

const getBaseUrl = () => {
  const url = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://youthcamping.online';
  return url.replace(/\/$/, '');
};

const getIpHash = (req) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
  return ip ? sha256(ip) : null;
};

// ────────────────────────────────────────────
// ADMIN: Create booking link
// ────────────────────────────────────────────
exports.createBookingLink = async (req, res, next) => {
  try {
    const { tripId, departureDate, paymentMode, customAmount, pickupCity, expiresAt } = req.body;
    if (!tripId || !departureDate || !paymentMode || pickupCity === undefined || pickupCity === null) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: tripId, departureDate, paymentMode, pickupCity',
      });
    }

    const tenantId = req.user?.tenantId || 'default';

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, tenantId },
      select: { id: true, title: true },
    });

    const { token, tokenPrefix } = generateToken();
    const tokenHash = sha256(token);

    const parsedDepartureDate = departureDate ? new Date(departureDate) : null;
    if (!parsedDepartureDate || isNaN(parsedDepartureDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid departureDate' });
    }

    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
    const finalExpiresAt = parsedExpiresAt && !isNaN(parsedExpiresAt.getTime()) ? parsedExpiresAt : null;

    const link = await prisma.bookingLink.create({
      data: {
        tenantId,
        createdByAdminId: req.user?.id || null,
        tripId,
        tripName: trip ? trip.title : null,
        departureDate: parsedDepartureDate,
        pickupCity: String(pickupCity),
        paymentMode: String(paymentMode),
        customAmount: customAmount !== undefined && customAmount !== null ? Number(customAmount) : null,
        expiresAt: finalExpiresAt,
        status: 'active',
        tokenHash,
        tokenPrefix,
        shareUrl: `${getBaseUrl()}/book/link/${token}`,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...link,
        shareUrl: link.shareUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
// ADMIN: List booking links (with basic filters)
// ────────────────────────────────────────────
exports.getBookingLinks = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const role = req.user?.role;
    const requesterAdminId = req.user?.id;

    const {
      salesAdminId,
      tripId,
      status,
      from,
      to,
    } = req.query;

    const where = { tenantId };

    if (tripId) where.tripId = String(tripId);
    if (status) where.status = String(status);

    // Optional date-range filter on createdAt
    if (from || to) {
      const createdAtFilter = {};
      if (from) createdAtFilter.gte = new Date(String(from));
      if (to) createdAtFilter.lte = new Date(String(to));
      where.createdAt = createdAtFilter;
    }

    // Role-based constraint (full enforcement comes in later access-control hardening task)
    if (role === 'sales') {
      where.createdByAdminId = requesterAdminId;
    } else if (salesAdminId) {
      where.createdByAdminId = String(salesAdminId);
    }

    const links = await prisma.bookingLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        createdByAdminId: true,
        tripId: true,
        tripName: true,
        departureDate: true,
        pickupCity: true,
        paymentMode: true,
        customAmount: true,
        expiresAt: true,
        status: true,
        tokenPrefix: true,
        shareUrl: true,
        openedCount: true,
        firstOpenedAt: true,
        lastOpenedAt: true,
        completedCount: true,
        lastCompletedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });

    res.json({ success: true, count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
// ADMIN: Revoke link
// ────────────────────────────────────────────
exports.revokeBookingLink = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;
    const role = req.user?.role;
    const requesterAdminId = req.user?.id;

    const link = await prisma.bookingLink.findFirst({
      where: { id, tenantId },
    });
    if (!link) return res.status(404).json({ success: false, message: 'Booking link not found' });

    // Sales can only revoke links they created
    if (role === 'sales' && requesterAdminId && link.createdByAdminId !== requesterAdminId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot revoke this booking link' });
    }

    const updated = await prisma.bookingLink.update({
      where: { id },
      data: { status: 'revoked', revokedAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
// PUBLIC: Resolve link token -> snapshot for customer
// ────────────────────────────────────────────
exports.resolveBookingLink = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ success: false, message: 'token is required' });

    const tokenHash = sha256(String(token));
    const link = await prisma.bookingLink.findFirst({ where: { tokenHash } });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid booking link' });
    }

    const now = new Date();
    if (link.status === 'revoked') {
      await prisma.bookingLinkEvent.create({
        data: {
          tenantId: link.tenantId,
          bookingLinkId: link.id,
          type: 'revoked_access',
          ipHash: getIpHash(req),
          userAgent: req.headers['user-agent']?.toString(),
        },
      });
      return res.status(410).json({ success: false, message: 'This booking link was revoked' });
    }

    if (link.expiresAt && link.expiresAt.getTime() < now.getTime()) {
      // Mark expired once we detect expiration
      await prisma.bookingLink.update({
        where: { id: link.id },
        data: { status: 'expired' },
      });

      await prisma.bookingLinkEvent.create({
        data: {
          tenantId: link.tenantId,
          bookingLinkId: link.id,
          type: 'expired_access',
          ipHash: getIpHash(req),
          userAgent: req.headers['user-agent']?.toString(),
        },
      });

      return res.status(410).json({ success: false, message: 'This booking link has expired' });
    }

    if (link.status !== 'active') {
      return res.status(410).json({ success: false, message: 'This booking link is not active' });
    }

    const ipHash = getIpHash(req);
    const userAgent = req.headers['user-agent']?.toString();

    // Update open counters + emit event
    const openedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.bookingLink.update({
        where: { id: link.id },
        data: {
          openedCount: { increment: 1 },
          firstOpenedAt: link.firstOpenedAt ? link.firstOpenedAt : openedAt,
          lastOpenedAt: openedAt,
        },
      });

      await tx.bookingLinkEvent.create({
        data: {
          tenantId: link.tenantId,
          bookingLinkId: link.id,
          type: 'opened',
          ipHash,
          userAgent,
        },
      });
    });

    // Return immutable snapshot used for prefill
    return res.json({
      success: true,
      data: {
        bookingLinkId: link.id,
        salesAdminId: link.createdByAdminId,
        tokenPrefix: link.tokenPrefix,
        tripId: link.tripId,
        tripName: link.tripName,
        departureDate: link.departureDate ? link.departureDate.toISOString() : null,
        pickupCity: link.pickupCity,
        paymentMode: link.paymentMode,
        customAmount: link.customAmount,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
// ADMIN: Booking link analytics (basic)
// ────────────────────────────────────────────
exports.getBookingLinksAnalytics = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const role = req.user?.role;
    const requesterAdminId = req.user?.id;

    const { from, to, salesAdminId } = req.query;

    const where = { tenantId, status: { in: ['active', 'expired', 'revoked'] } };
    if (role === 'sales') where.createdByAdminId = requesterAdminId;
    if (role !== 'sales' && salesAdminId) where.createdByAdminId = String(salesAdminId);

    // Range on createdAt
    if (from || to) {
      const createdAt = {};
      if (from) createdAt.gte = new Date(String(from));
      if (to) createdAt.lte = new Date(String(to));
      where.createdAt = createdAt;
    }

    // Fetch links + aggregate revenue from bookings
    const links = await prisma.bookingLink.findMany({
      where,
      select: { id: true, createdAt: true, openedCount: true, completedCount: true },
    });

    const linkIds = links.map((l) => l.id);
    if (linkIds.length === 0) {
      return res.json({
        success: true,
        data: {
          linksGenerated: 0,
          opened: 0,
          completedBookings: 0,
          revenueGenerated: 0,
        },
      });
    }

    const revenueAgg = await prisma.booking.aggregate({
      where: { tenantId, sourceBookingLinkId: { in: linkIds } },
      _sum: { totalAmount: true },
    });

    const linksGenerated = links.length;
    const opened = links.reduce((acc, l) => acc + (l.openedCount > 0 ? 1 : 0), 0);
    const completedBookings = links.reduce((acc, l) => acc + (l.completedCount || 0), 0);

    res.json({
      success: true,
      data: {
        linksGenerated,
        opened,
        completedBookings,
        revenueGenerated: revenueAgg._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

