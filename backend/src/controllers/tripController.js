const { prisma } = require('../lib/prisma');

const setPublicCache = (res, seconds) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds}`);
};

const toPublicDates = (availableDates) => {
  let dates = availableDates;
  if (typeof dates === 'string') {
    try {
      dates = JSON.parse(dates);
    } catch (_error) {
      return [];
    }
  }

  if (!Array.isArray(dates)) return [];

  return dates
    .map((entry) => {
      if (typeof entry === 'string') return { date: entry };
      if (entry && typeof entry === 'object' && entry.date) return { date: entry.date };
      return null;
    })
    .filter(Boolean);
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const toPublicVariantSummary = (variants) => {
  const firstVariant = parseJsonArray(variants)[0];
  if (!firstVariant || typeof firstVariant !== 'object') return [];

  return [{
    originalPrice: firstVariant.originalPrice,
    discountedPrice: firstVariant.discountedPrice,
  }];
};

const toPublicRouteSummary = (route) => parseJsonArray(route)
  .slice(0, 2)
  .map((stop) => {
    if (typeof stop === 'string') return stop;
    if (stop && typeof stop === 'object' && stop.label) return { label: stop.label };
    return null;
  })
  .filter(Boolean);

/**
 * @desc    Get all trips (Scoped by tenantId)
 * @route   GET /api/trips
 * @access  Public
 */
exports.getTrips = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const where = { tenantId };
    
    console.log(`🔍 [Trips] Fetching trips for tenant: ${tenantId}, status: ${req.query.status || 'default'}`);

    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    } else if (!req.query.status) {
      where.status = 'published';
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Post-process to move 0s to the end if necessary, or just tell the user to use 1, 2, 3.
    // Actually, if we want 1 to be FIRST, and 0 to be LAST, we should either:
    // 1. Change default to 99999
    // 2. Use a different sorting logic.
    
    // I'll change the default to 9999 in the schema and update existing.

    console.log(`✅ [Trips] Found ${trips.length} trips`);

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error("🔥 [Trips Fetch Error]:", error);
    next(error);
  }
};

/**
 * Lightweight published trip cards for the public website.
 * Existing /api/trips responses remain unchanged for backwards compatibility.
 * Capacity and booked-count values are intentionally excluded from this cacheable response.
 */
exports.getPublicTripCards = async (req, res, next) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const take = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, 100))
      : undefined;
    const trips = await prisma.trip.findMany({
      where: { tenantId: 'default', status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        heroImage: true,
        price: true,
        location: true,
        duration: true,
        category: true,
        status: true,
        availableDates: true,
        variants: true,
        route: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take,
    });

    const data = trips.map((trip) => ({
      ...trip,
      availableDates: toPublicDates(trip.availableDates),
      variants: toPublicVariantSummary(trip.variants),
      route: toPublicRouteSummary(trip.route),
    }));

    setPublicCache(res, 180);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Full published trip content for one public detail page. Cached display data
 * deliberately excludes capacity and booked-count values from departure dates.
 * The existing /api/trips/slug/:slug contract remains unchanged.
 */
exports.getPublicTripDetail = async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        slug: req.params.slug,
        tenantId: 'default',
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        shortName: true,
        slug: true,
        location: true,
        price: true,
        duration: true,
        description: true,
        category: true,
        status: true,
        heroImage: true,
        images: true,
        itinerary: true,
        availableDates: true,
        variants: true,
        travelOptions: true,
        roomOptions: true,
        highlights: true,
        inclusions: true,
        exclusions: true,
        faqs: true,
        addons: true,
        maxGroupSize: true,
        difficulty: true,
        departureCity: true,
        pickupCities: true,
        ageLimit: true,
        bookingUrl: true,
        attractions: true,
        activities: true,
        accommodations: true,
        popupDetails: true,
        route: true,
        ageGroup: true,
        maxAltitude: true,
        tripType: true,
        startEnd: true,
        pickupMode: true,
        stickyCardPrice: true,
        stickyCardLabel: true,
        reels: true,
        tripReviews: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const reviewWhereOr = [{ tripId: trip.id }];
    if (trip.title) reviewWhereOr.push({ tripName: trip.title });
    if (trip.shortName) reviewWhereOr.push({ tripName: trip.shortName });

    const reviews = await prisma.review.findMany({
      where: {
        tenantId: 'default',
        isActive: true,
        OR: reviewWhereOr,
      },
      select: {
        id: true,
        userName: true,
        userHandle: true,
        instagram: true,
        city: true,
        tripName: true,
        tripType: true,
        userImage: true,
        comment: true,
        rating: true,
        isFeatured: true,
        photos: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = {
      ...trip,
      availableDates: toPublicDates(trip.availableDates),
      reviews,
    };

    setPublicCache(res, 60);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single trip by ID or Slug
 * @route   GET /api/trips/:id
 * @access  Public
 */
exports.getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId || 'default';

    const trip = await prisma.trip.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        tenantId
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Build conditional query to fetch reviews dynamically linked to this trip
    const reviewWhereOr = [
      { tripId: trip.id }
    ];
    if (trip.title) {
      reviewWhereOr.push({ tripName: trip.title });
    }
    if (trip.shortName) {
      reviewWhereOr.push({ tripName: trip.shortName });
    }

    const reviews = await prisma.review.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: reviewWhereOr
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const tripWithReviews = {
      ...trip,
      reviews: reviews || []
    };

    res.json({ success: true, data: tripWithReviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private/Admin
 */
/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private/Admin
 */
exports.createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body };
    const tenantId = req.user.tenantId;

    if (tripData.reviews) {
      tripData.tripReviews = tripData.reviews;
      delete tripData.reviews;
    }

    // Support manual ID (Trip Code)
    const customId = tripData.id || tripData.tripCode || tripData.shortName;
    if (customId) {
      tripData.id = customId.toUpperCase();
    } else {
      delete tripData.id;
    }

    const trip = await prisma.trip.create({
      data: {
        ...tripData,
        tenantId,
        price: Number(tripData.price) || 0,
        stickyCardPrice: Number(tripData.stickyCardPrice) || null,
      }
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private/Admin
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const { id: oldId } = req.params;
    const tenantId = req.user.tenantId;
    const updateData = { ...req.body };
    
    if (updateData.reviews) {
      updateData.tripReviews = updateData.reviews;
      delete updateData.reviews;
    }

    const newId = (updateData.id || updateData.tripCode || updateData.shortName || oldId).toUpperCase();
    const tripName = updateData.title || updateData.tripName;

    delete updateData.id;
    delete updateData.tenantId;
    delete updateData.tripCode;
    delete updateData.shortName;

    if (updateData.price !== undefined) updateData.price = Number(updateData.price) || 0;
    if (updateData.stickyCardPrice !== undefined) updateData.stickyCardPrice = Number(updateData.stickyCardPrice) || null;

    if (newId !== oldId) {
      // 1. Check if new ID already exists
      const exists = await prisma.trip.findFirst({ where: { id: newId, tenantId } });
      if (exists) return res.status(400).json({ success: false, message: `Trip Code ${newId} already exists` });

      // 2. Update the ID using Raw SQL (triggers onUpdate: Cascade in DB)
      // Note: We use raw SQL because Prisma does not allow updating primary keys directly
      await prisma.$executeRaw`UPDATE "Trip" SET id = ${newId} WHERE id = ${oldId} AND "tenantId" = ${tenantId}`;

      // 3. Manually update non-relational records
      await prisma.inquiry.updateMany({
        where: { tripId: oldId, tenantId },
        data: { tripId: newId }
      });
      await prisma.review.updateMany({
        where: { tripId: oldId, tenantId },
        data: { tripId: newId }
      });

      console.log(`✅ Migrated Trip Code from ${oldId} to ${newId}`);
    }

    // 4. Update the rest of the data
    const trip = await prisma.trip.update({
      where: { id: newId, tenantId },
      data: updateData
    });

    if (tripName) {
      await prisma.booking.updateMany({
        where: { tripId: newId, tenantId },
        data: { tripName }
      });
      await prisma.inquiry.updateMany({
        where: { tripId: newId, tenantId },
        data: { tripTitle: tripName }
      });
    }

    res.json({ success: true, message: 'Trip updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private/Admin
 */
exports.deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // 1. Delete associated non-relational records (Inquiries, Reviews)
    // Note: Bookings and TripVendors are handled by DB Cascade (onDelete: Cascade)
    await prisma.inquiry.deleteMany({ where: { tripId: id, tenantId } });
    await prisma.review.deleteMany({ where: { tripId: id, tenantId } });

    // 2. Delete the trip (triggers DB cascade for Bookings, etc.)
    const result = await prisma.trip.deleteMany({
      where: { id, tenantId }
    });

    if (result.count === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, message: 'Trip removed' });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get trip by slug (Public)
 * @route   GET /api/trips/slug/:slug
 */
exports.getTripBySlug = async (req, res, next) => {
  req.params.id = req.params.slug;
  return exports.getTrip(req, res, next);
};

/**
 * @desc    Shuffle trips order
 * @route   POST /api/trips/shuffle
 * @access  Private/Admin
 */
exports.shuffleTrips = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const trips = await prisma.trip.findMany({ where: { tenantId } });
    
    // Generate random order for each trip
    const updates = trips.map((trip, index) => {
      return prisma.trip.update({
        where: { id: trip.id },
        data: { order: Math.floor(Math.random() * 1000000) }
      });
    });

    await prisma.$transaction(updates);

    res.json({ success: true, message: 'Trips shuffled successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk update trips order
 * @route   POST /api/trips/bulk-order
 * @access  Private/Admin
 */
exports.bulkUpdateTripOrder = async (req, res, next) => {
  try {
    const { orderMap } = req.body;
    if (!orderMap) return res.status(400).json({ success: false, message: 'orderMap is required' });

    const updates = Object.entries(orderMap).map(([id, order]) => {
      return prisma.trip.update({
        where: { id },
        data: { order: Number(order) }
      });
    });

    await prisma.$transaction(updates);

    res.json({ success: true, message: 'Trips order updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed Live Data Stub
 */
exports.seedLiveData = async (req, res) => {
  res.json({ success: true, message: 'Seeding logic disabled in production/dev' });
};

exports.getTripDepartures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId || 'default';

    // First find the trip globally to distinguish between non-existence and cross-tenant access
    const tripGlobal = await prisma.trip.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });

    if (!tripGlobal) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (tripGlobal.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: 'Access denied: unauthorized tenant' });
    }

    let dates = tripGlobal.availableDates;
    if (typeof dates === 'string') {
      try {
        dates = JSON.parse(dates);
      } catch (_) {
        dates = [];
      }
    }
    if (!Array.isArray(dates)) dates = [];

    const dateStrings = dates.map(d => {
      if (typeof d === 'string') return d;
      if (d && typeof d === 'object' && d.date) return d.date;
      return null;
    }).filter(Boolean);

    res.json({ success: true, data: dateStrings });
  } catch (error) {
    next(error);
  }
};
