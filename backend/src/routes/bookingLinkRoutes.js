const express = require('express');
const router = express.Router();
const {
  createBookingLink,
  getBookingLinks,
  revokeBookingLink,
  resolveBookingLink,
  getBookingLinksAnalytics,
} = require('../controllers/bookingLinkController');

const { protectAny } = require('../middleware/auth');

// ── PUBLIC: resolve link token → customer snapshot ──
router.get('/resolve', resolveBookingLink);

// ── ADMIN/Sales: booking link management ──
router.get('/analytics', protectAny, getBookingLinksAnalytics);
router.get('/', protectAny, getBookingLinks);
router.post('/', protectAny, createBookingLink);
router.post('/:id/revoke', protectAny, revokeBookingLink);

module.exports = router;

