const { getDashboardStatsPayload } = require("../services/dashboardStatsService");

/**
 * @desc    Get dashboard statistics (tenant-scoped raw cache, per-user RBAC strip)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
  try {
    const { dateFilter } = req.query;
    const data = await getDashboardStatsPayload(req.user, dateFilter);
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Stats error:", error.message);
    res.status(503).json({
      success: false,
      error: "Database unavailable",
    });
  }
};
