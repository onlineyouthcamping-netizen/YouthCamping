const { prisma } = require('../lib/prisma');

/**
 * @desc    Submit inquiry (Public)
 * @route   POST /api/inquiries
 * @access  Public
 */
exports.createInquiry = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const { phone, tripId } = req.body;
    
    // Check for duplicates in the last 48 hours
    const duplicate = await prisma.inquiry.findFirst({
      where: {
        phone,
        tripId,
        tenantId,
        createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      }
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
        tripId: req.body.tripId,
        tripTitle: req.body.tripTitle,
        date: req.body.date,
        source: req.body.source,
        adminNotes: `Source: ${req.body.source || 'Unknown'}`,
        tenantId,
        count: req.body.count ? parseInt(req.body.count) : undefined
      }
    });

    res.status(201).json({ success: true, data: inquiry, isDuplicate: !!duplicate });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries (Scoped by tenantId)
 * @route   GET /api/inquiries
 * @access  Private/Admin
 */
exports.getInquiries = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { status } = req.query;

    const where = { tenantId };
    if (status) where.status = status;

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inquiry status/notes
 * @route   PATCH /api/inquiries/:id/status
 * @access  Private/Admin
 */
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const { status, adminNotes } = req.body;

    const inquiry = await prisma.inquiry.updateMany({
      where: { id, tenantId },
      data: { status, adminNotes }
    });

    if (inquiry.count === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry updated' });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get single inquiry
 * @route   GET /api/inquiries/:id
 */
exports.getInquiry = async (req, res, next) => {
  try {
    const inquiry = await prisma.inquiry.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inquiry
 * @route   DELETE /api/inquiries/:id
 */
exports.deleteInquiry = async (req, res, next) => {
  try {
    const result = await prisma.inquiry.deleteMany({
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });
    if (result.count === 0) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    next(error);
  }
};
