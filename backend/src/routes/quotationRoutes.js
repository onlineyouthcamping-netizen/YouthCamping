const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { protect } = require('../middleware/auth');

// @desc    Get all quotations
// @route   GET /api/quotations
router.get('/', protect, async (req, res, next) => {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Merge data field with top-level for frontend convenience
    const formatted = quotations.map(q => ({
      ...(typeof q.data === 'object' ? q.data : {}),
      id: q.id,
      title: q.title,
      status: q.status,
      clientName: q.clientName,
      totalAmount: q.totalAmount,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single quotation by ID or Slug
router.get('/:idOrSlug', async (req, res, next) => {
  const fs = require('fs');
  const logPath = require('path').join(__dirname, '../../debug.log');
  const { idOrSlug } = req.params;
  
  try {
    fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Fetching Quotation: ${idOrSlug}\n`);
    
    const quotation = await prisma.quotation.findFirst({
      where: {
        OR: [ { id: idOrSlug }, { slug: idOrSlug }, { title: idOrSlug } ]
      }
    });
    
    if (!quotation) {
      const all = await prisma.quotation.findMany({ select: { id: true, slug: true, title: true } });
      fs.appendFileSync(logPath, `❌ Quotation not found: ${idOrSlug}\n`);
      fs.appendFileSync(logPath, `Existing Slugs: ${JSON.stringify(all.map(x => x.slug || x.id))}\n`);
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    fs.appendFileSync(logPath, `✅ Found Quotation: ${quotation.title}\n`);
    res.json({ 
      success: true, 
      data: {
        ...(typeof quotation.data === 'object' ? quotation.data : {}),
        id: quotation.id,
        title: quotation.title,
        status: quotation.status,
        clientName: quotation.clientName,
        totalAmount: quotation.totalAmount
      } 
    });
  } catch (err) {
    fs.appendFileSync(logPath, `❌ Fetch Error: ${err.message}\n`);
    next(err);
  }
});

// @desc    Create or Update quotation
// @route   POST /api/quotations
router.post('/', protect, async (req, res, next) => {
  try {
    const body = req.body;
    const id = body.id;
    
    const finalTitle = body.title || body.tripTitle || 'Untitled Quote';
    const finalClient = body.clientName || body.customerName || 'Guest';
    const finalAmount = Number(body.totalAmount || body.finalPrice || 0);
    const finalStatus = body.status || 'Draft';
    const finalSlug = body.slug || (finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7));

    const fs = require('fs');
    const logPath = require('path').join(__dirname, '../../debug.log');
    
    fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Saving Quotation: ${id || 'New'} - ${finalTitle}\n`);
    fs.appendFileSync(logPath, `Payload: ${JSON.stringify(body, null, 2)}\n`);

    let quotation;
    
    // Check if we should update or create
    const existing = id ? await prisma.quotation.findUnique({ where: { id } }) : null;

    if (existing) {
      fs.appendFileSync(logPath, 'Updating existing record\n');
      quotation = await prisma.quotation.update({
        where: { id },
        data: {
          title: finalTitle,
          slug: finalSlug,
          clientName: finalClient,
          totalAmount: finalAmount,
          status: finalStatus,
          data: body
        }
      });
    } else {
      fs.appendFileSync(logPath, 'Creating new record\n');
      quotation = await prisma.quotation.create({
        data: {
          id: id || undefined, 
          title: finalTitle,
          slug: finalSlug,
          clientName: finalClient,
          totalAmount: finalAmount,
          status: finalStatus,
          data: body,
          tenantId: req.user?.tenantId || 'default'
        }
      });
    }

    res.json({ success: true, data: quotation });
  } catch (err) {
    const fs = require('fs');
    const logPath = require('path').join(__dirname, '../../debug.log');
    fs.appendFileSync(logPath, `❌ ERROR: ${err.message}\n${err.stack}\n`);
    
    console.error('❌ Quotation Save Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save quotation', 
      error: err.message,
      stack: err.stack,
      code: err.code 
    });
  }
});

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if it exists first to avoid prisma throw
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    await prisma.quotation.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (err) {
    console.error('❌ Quotation Delete Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete quotation', error: err.message });
  }
});

// @desc    Extend quotation validity
// @route   PATCH /api/quotations/:id/extend
router.patch('/:id/extend', protect, async (req, res, next) => {
  try {
    const { hours } = req.body;
    const { id } = req.params;
    
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) return res.status(404).json({ success: false, message: 'Not found' });

    const currentData = quotation.data || {};
    const newExpiry = new Date(new Date().getTime() + (hours || 48) * 60 * 60 * 1000);
    
    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        data: { ...currentData, expiresAt: newExpiry }
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
