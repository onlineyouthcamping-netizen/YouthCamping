const express = require('express');
const router = express.Router();
const {
  getVerificationStatus,
  submitForVerification,
  getVerificationQueue,
  performVerificationAction,
  saveTrainTicketDraft,
  getTrainTicketDraft,
  performTicketAction
} = require('../controllers/bookingVerificationController');
const {
  authenticate,
  requirePermission
} = require('../middleware/auth');

// ── Verification Queue ──
router.get('/queue', authenticate, requirePermission('bookings.view'), getVerificationQueue);

// ── Verification Status ──
router.get('/:bookingId/status', authenticate, requirePermission('bookings.view'), getVerificationStatus);

// ── Submit for Verification ──
router.post('/:bookingId/submit', authenticate, requirePermission('bookings.view'), submitForVerification);

// ── Perform Verification Action (VERIFY / REQUEST_CHANGES / REJECT) ──
router.post('/:bookingId/action', authenticate, requirePermission('bookings.verify'), performVerificationAction);

// ── Train Ticket Draft ──
router.get('/:bookingId/train-ticket', authenticate, requirePermission('bookings.view'), getTrainTicketDraft);
router.post('/:bookingId/train-ticket', authenticate, requirePermission('bookings.view'), saveTrainTicketDraft);

// ── Train Ticket Action (APPROVE / REJECT / REQUEST_CHANGES / MARK_ISSUED) ──
router.post('/:bookingId/train-ticket/action', authenticate, requirePermission('bookings.verify'), performTicketAction);

module.exports = router;
