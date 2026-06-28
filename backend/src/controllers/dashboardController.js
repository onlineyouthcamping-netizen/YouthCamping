const statsCache = new Map();
const STATS_CACHE_TTL = 15 * 1000; // 15 seconds

/**
 * @desc    Get dashboard statistics (Scoped by tenantId)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || 'default';
    const cacheKey = `stats_${tenantId}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return res.json({ success: true, data: cached.data });
    }

    // Use Promise.all for parallel counting
    const [totalTrips, totalBookings] = await Promise.all([
      prisma.trip.count({ where: { tenantId } }),
      prisma.booking.count({ where: { tenantId } })
    ]);

    const resData = {
      bookings: totalBookings,
      trips: totalTrips,
      totalBookings,
      totalTrips
    };

    statsCache.set(cacheKey, { data: resData, expiresAt: Date.now() + STATS_CACHE_TTL });

    res.json({ 
      success: true,
      data: resData
    });
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    // As per requirement, return 503 on DB failure, no fake data
    res.status(503).json({ 
      success: false,
      error: 'Database unavailable' 
    });
  }
};
