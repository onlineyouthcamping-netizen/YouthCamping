const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');

/**
 * @desc    Get dashboard statistics (Scoped by tenantId)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || 'default';
    const cacheKey = `stats_${tenantId}`;
    
    // Check Redis cache first
    const cachedVal = await cache.get(cacheKey);
    if (cachedVal) {
      try {
        const cached = JSON.parse(cachedVal);
        return res.json({ success: true, data: cached });
      } catch (e) {}
    }

    // Use Promise.all for parallel database queries
    const [
      totalTrips,
      totalBookings,
      totalRevenueResult,
      pendingPaymentsResult,
      recentBookings,
      monthlyRevenue
    ] = await Promise.all([
      prisma.trip.count({ where: { tenantId } }),
      prisma.booking.count({ where: { tenantId } }),
      prisma.booking.aggregate({
        where: {
          tenantId,
          paymentStatus: { in: ['Paid', 'Confirmed', 'paid', 'confirmed'] }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.booking.aggregate({
        where: {
          tenantId,
          paymentStatus: { in: ['Pending', 'Partial', 'pending', 'partial'] }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.booking.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          tripName: true,
          amount: true,
          advancePaid: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
          SUM(amount) AS revenue
        FROM "Booking"
        WHERE "tenantId" = ${tenantId}
          AND "paymentStatus" IN ('Paid', 'Confirmed', 'paid', 'confirmed')
          AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `.catch(err => {
        console.warn('⚠️ Raw SQL monthly revenue failed, falling back to empty array:', err.message);
        return [];
      })
    ]);

    const totalRevenue = totalRevenueResult._sum.amount || 0;
    const pendingPayments = pendingPaymentsResult._sum.amount || 0;

    const formattedMonthlyRevenue = (monthlyRevenue || []).map(r => ({
      month: r.month,
      revenue: Number(r.revenue) || 0
    }));

    const mappedRecentBookings = (recentBookings || []).map(b => ({
      id: b.id,
      customerName: b.name,
      name: b.name,
      userName: b.name || "Guest",
      tripName: b.tripName,
      tripTitle: b.tripName || "Unknown Trip",
      amount: b.amount || 0,
      paidAmount: b.advancePaid || 0,
      status: b.status,
      createdAt: b.createdAt
    }));

    const resData = {
      bookings: totalBookings,
      trips: totalTrips,
      totalBookings,
      totalTrips,
      totalRevenue,
      pendingPayments,
      monthlyRevenue: formattedMonthlyRevenue,
      recentBookings: mappedRecentBookings
    };

    // Cache the data in Redis for 15 seconds
    await cache.set(cacheKey, resData, 15);

    res.json({ 
      success: true,
      data: resData
    });
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    res.status(503).json({ 
      success: false,
      error: 'Database unavailable' 
    });
  }
};
