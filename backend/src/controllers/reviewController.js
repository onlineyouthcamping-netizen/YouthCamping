const { prisma } = require('../lib/prisma');

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { tenantId: req.user?.tenantId || 'default', isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const review = await prisma.review.create({
      data: { ...updateData, tenantId: req.user?.tenantId || 'default' }
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('🔥 [REVIEW CREATE ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 */
exports.updateReview = async (req, res, next) => {
  try {
    console.log('🔄 Updating Review:', req.params.id);
    console.log('📦 Data:', JSON.stringify(req.body, null, 2));

    // Clean up payload (Prisma doesn't allow updating IDs or timestamps)
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const review = await prisma.review.updateMany({
      where: { id: req.params.id, tenantId: req.user?.tenantId || 'default' },
      data: updateData
    });

    if (review.count === 0) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review updated' });
  } catch (error) {
    console.error('🔥 [REVIEW UPDATE ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const result = await prisma.review.deleteMany({
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });
    if (result.count === 0) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
